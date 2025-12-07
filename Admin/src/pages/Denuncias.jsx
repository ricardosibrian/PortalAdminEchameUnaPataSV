import React,{ useCallback, useEffect, useRef, useState } from "react";
import { API_BASE_URL, AUTH_TOKEN } from "../config";
import CustomSelect from "../components/CustomSelect"; 
import "../styles/TablaPerros.css";

const STATUS_META = {
  OPEN: { label: "Abierto", color: "#1d4ed8" },
  CLOSED: { label: "Cerrado", color: "#15803d" },
};

const safeTrim = (value) =>
  typeof value === "string" ? value.trim() : "";

const formatDateTime = (isoDate) => {
  if (!isoDate) return "—";

  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return "—";

  return new Intl.DateTimeFormat("es-SV", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
};

const Loader = ({ text, variant = "full" }) => {
  const isInline = variant === "inline";

  return (
    <div
      style={
        isInline
          ? {
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }
          : {
              textAlign: "center",
              padding: "40px",
              color: "#666",
              fontSize: "1.2rem",
              backgroundColor: "#f9f9f9",
              borderRadius: "8px",
              marginTop: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }
      }
    >
      <svg
        style={{
          width: isInline ? "18px" : "24px",
          height: isInline ? "18px" : "24px",
          animation: "spin 1s linear infinite",
        }}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </svg>
      {text ? (
        <span style={{ marginLeft: isInline ? 0 : "10px" }}>{text}</span>
      ) : null}
    </div>
  );
};

const getIsMobile = () =>
  typeof window !== "undefined" ? window.innerWidth <= 768 : false;

export default function Denuncias() {
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const [closing, setClosing] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [showErrorSpinner, setShowErrorSpinner] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [isMobile, setIsMobile] = useState(getIsMobile);

  const isMountedRef = useRef(true);

  const totalPages = Math.ceil(reports.length / rowsPerPage);
  const startIndex = page * rowsPerPage;
  const visibleRows = reports.slice(startIndex, startIndex + rowsPerPage);

  const handleNext = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const handlePrev = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleRowsChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(0);
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      if (isMountedRef.current) {
        setIsMobile(getIsMobile());
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const fetchReports = useCallback(
    async (signal) => {
      if (isMountedRef.current) {
        setLoading(true);
        setError(null);
      }

      const headers = { "Content-Type": "application/json" };
      if (AUTH_TOKEN) headers.Authorization = `Bearer ${AUTH_TOKEN}`;

      try {
        const requestOptions = { method: "GET", headers };
        if (signal) requestOptions.signal = signal;

        const response = await fetch(`${API_BASE_URL}/reports/find-all`, requestOptions);

        if (!response.ok) throw new Error(`Error al obtener denuncias: ${response.status}`);

        const result = await response.json();

        if (!Array.isArray(result.data)) throw new Error("La respuesta del servidor no contiene datos válidos.");

        const normalized = result.data.map((report, index) => {
          const reporterName = report.isAnonymous
            ? "Anónimo"
            : [
                safeTrim(report.person?.firstNames),
                safeTrim(report.person?.lastNames),
              ]
                .filter(Boolean)
                .join(" ")
                .trim() || "Sin datos";

          return {
            id: report.id,
            serial: index + 1,
            reporter: reporterName,
            email: safeTrim(report.contactEmail) || safeTrim(report.person?.email) || "—",
            phone: safeTrim(report.contactPhone) || safeTrim(report.person?.phoneNumber) || "—",
            status: report.status,
            receptionDate: report.receptionDate,
          };
        });

        if (isMountedRef.current) {
          setReports(normalized);
          setSelected([]);
          setActionError(null);
          setShowErrorSpinner(false);
        }
      } catch (requestError) {
        if (requestError.name === "AbortError") return;
        console.error("Error al cargar denuncias:", requestError);
        if (isMountedRef.current) {
          setError(requestError.message || "No fue posible obtener las denuncias en este momento.");
        }
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchReports(controller.signal);
    return () => controller.abort();
  }, [fetchReports]);

  const handleCloseReports = useCallback(async () => {
    if (selected.length === 0 || closing) return;

    const reportsToClose = [...selected];

    if (isMountedRef.current) {
      setActionError(null);
      setActionSuccess(null);
      setClosing(true);
      setShowErrorSpinner(false);
    }

    const headers = { "Content-Type": "application/json" };
    if (AUTH_TOKEN) headers.Authorization = `Bearer ${AUTH_TOKEN}`;

    try {
      for (const reportId of reportsToClose) {
        const response = await fetch(`${API_BASE_URL}/reports/update-status`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ reportId, status: "CLOSED" }),
        });

        const rawBody = await response.text();
        let parsedBody = null;
        try { parsedBody = JSON.parse(rawBody); } catch { parsedBody = null; }

        const serverMessage = safeTrim(
          typeof parsedBody?.message === "string" ? parsedBody.message : rawBody
        );

        if (serverMessage && serverMessage.includes("The report already has the status: CLOSED")) {
          throw new Error("Esta denuncia ya esta cerrada");
        }

        if (!response.ok) {
          throw new Error(serverMessage || `No se pudo cerrar la denuncia seleccionada (${reportId}).`);
        }
      }

      if (isMountedRef.current) {
        setActionSuccess(
          reportsToClose.length === 1
            ? "Denuncia cerrada correctamente."
            : "Denuncias cerradas correctamente."
        );
        setTimeout(() => {
          if (isMountedRef.current) setActionSuccess(null);
        }, 5000);
      }

      await fetchReports();
    } catch (closeError) {
      console.error("Error al cerrar denuncias:", closeError);
      if (isMountedRef.current) {
        const userMessage = closeError.message || "Ocurrió un problema al cerrar las denuncias seleccionadas.";
        setActionError(userMessage);
        setShowErrorSpinner(false);
        setTimeout(() => {
          if (isMountedRef.current) setActionError(null);
        }, 5000);
      }
    } finally {
      if (isMountedRef.current) setClosing(false);
    }
  }, [closing, fetchReports, selected]);

  const allVisibleSelected =
    visibleRows.length > 0 &&
    visibleRows.every((row) => selected.includes(row.id));

  const toggleSelectAll = () => {
    if (closing || reports.length === 0) return;

    setActionSuccess(null);
    setActionError(null);
    setShowErrorSpinner(false);

    if (allVisibleSelected) {
        const visibleIds = visibleRows.map(r => r.id);
        setSelected(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
        const visibleIds = visibleRows.map(r => r.id);
        setSelected(prev => [...new Set([...prev, ...visibleIds])]);
    }
  };

  const toggleSelectOne = (id) => {
    if (closing) return;

    setActionSuccess(null);
    setActionError(null);
    setShowErrorSpinner(false);

    setSelected((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((selectedId) => selectedId !== id)
        : [...prevSelected, id]
    );
  };

  const handleCloseDetalle = () => {
    if (!isMountedRef.current) return;
    setDetailModalOpen(false);
    setDetailLoading(false);
    setDetailError(null);
    setDetailData(null);
  };

  const handleVerDenuncia = async (reportId) => {
    if (!reportId) return;

    if (isMountedRef.current) {
      setDetailModalOpen(true);
      setDetailLoading(true);
      setDetailError(null);
      setDetailData(null);
    }

    const headers = { "Content-Type": "application/json" };
    if (AUTH_TOKEN) headers.Authorization = `Bearer ${AUTH_TOKEN}`;

    try {
      const response = await fetch(`${API_BASE_URL}/reports/find-by-id/${reportId}`, { method: "GET", headers });

      if (!response.ok) throw new Error(`No fue posible obtener la denuncia (${response.status}).`);

      const payload = await response.json();
      const report = payload?.data ?? payload;

      if (!report) throw new Error("No se encontró información de la denuncia.");

      const normalizada = {
        description: safeTrim(report.description) || "No hay descripción disponible.",
        email: safeTrim(report.contactEmail) || safeTrim(report.person?.email) || "—",
        phone: safeTrim(report.contactPhone) || safeTrim(report.person?.phoneNumber) || "—",
        photo: safeTrim(report.photo),
        status: safeTrim(report.status) || "",
        type: safeTrim(report.type) || "",
        location: safeTrim(report.location) || "",
      };

      if (isMountedRef.current) setDetailData(normalizada);
    } catch (viewError) {
      console.error("Error al obtener denuncia:", viewError);
      if (isMountedRef.current) {
        setDetailError(viewError.message || "No fue posible cargar la información de la denuncia.");
      }
    } finally {
      if (isMountedRef.current) setDetailLoading(false);
    }
  };

  const isCloseDisabled = selected.length === 0 || closing || loading;
  const closeButtonLabel = closing ? "CERRANDO..." : "CERRAR DENUNCIA";

  return (
    <div className="denuncias-page">
      <h2 className="page-title">Reporte de denuncias</h2>

      <div className="acciones-tabla">
        <button
          type="button"
          onClick={handleCloseReports}
          disabled={isCloseDisabled}
          style={{
            background: "none",
            border: "none",
            color: isCloseDisabled ? "rgba(22,163,74,0.6)" : "#16a34a",
            fontWeight: 600,
            cursor: isCloseDisabled ? "not-allowed" : "pointer",
            opacity: isCloseDisabled ? 0.6 : 1,
            padding: 0,
          }}
        >
          {closeButtonLabel}
        </button>
      </div>

      {actionError && (
        <div style={{ marginTop: "12px", padding: "16px", backgroundColor: "#fee2e2", color: "#b91c1c", borderRadius: "8px", fontSize: "0.95rem" }}>
          <div>{actionError}</div>
          {showErrorSpinner && (
            <div style={{ marginTop: "10px" }}>
              <Loader variant="inline" text="Cargando datos..." />
            </div>
          )}
        </div>
      )}

      {actionSuccess && (
        <div style={{ marginTop: "12px", padding: "16px", backgroundColor: "#dcfce7", color: "#166534", borderRadius: "8px", fontSize: "0.95rem" }}>
          {actionSuccess}
        </div>
      )}

      {closing && !loading && <Loader text="Cerrando denuncias..." />}
      {loading && <Loader text="Cargando denuncias..." />}
      {!loading && error && (
        <div style={{ marginTop: "20px", padding: "20px", backgroundColor: "#fee2e2", color: "#b91c1c", borderRadius: "8px" }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className={`tabla-perros-container ${isMobile ? "denuncias-container-mobile" : ""}`}>
          
          {isMobile ? (
            <>
              <div className="denuncias-mobile-topbar">
                <label className="denuncias-mobile-select">
                  <input
                    type="checkbox"
                    disabled={closing || loading || reports.length === 0}
                    onChange={toggleSelectAll}
                    checked={allVisibleSelected}
                  />
                  <span>Seleccionar todo</span>
                </label>
                {selected.length > 0 && (
                  <span className="denuncias-mobile-counter">
                    {selected.length === 1 ? "1 seleccionada" : `${selected.length} seleccionadas`}
                  </span>
                )}
              </div>

              {reports.length === 0 ? (
                <div className="denuncias-mobile-empty">
                   <Loader variant="inline" text="Cargando datos..." />
                </div>
              ) : (
                <div className="denuncias-mobile-list">
                  {visibleRows.map((report) => {
                    const statusMeta = STATUS_META[report.status] || { label: safeTrim(report.status) || "Desconocido", color: "#64748b" };

                    return (
                      <div className="denuncia-card" key={report.id}>
                        <div className="denuncia-card-header">
                          <label className="denuncia-card-select">
                            <input
                              type="checkbox"
                              checked={selected.includes(report.id)}
                              disabled={closing}
                              onChange={() => toggleSelectOne(report.id)}
                            />
                            <span>#{report.serial}</span>
                          </label>
                          <span className="denuncia-status-pill" style={{ backgroundColor: statusMeta.color }}>
                            {statusMeta.label}
                          </span>
                        </div>
                        <div className="denuncia-card-body">
                          <p><span>Denuncian:</span>{report.reporter}</p>
                          <p><span>Correo:</span>{report.email}</p>
                          <p><span>Teléfono:</span>{report.phone}</p>
                        </div>
                        <div className="denuncia-card-footer">
                          <span className="denuncia-card-date">{formatDateTime(report.receptionDate)}</span>
                          <button type="button" onClick={() => handleVerDenuncia(report.id)} className="denuncia-card-link">VER</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="tabla-wrapper">
              <table className="tabla-perros">
                <thead>
                  <tr>
                    <th className="th">
                      <input
                        type="checkbox"
                        disabled={closing || loading || reports.length === 0}
                        onChange={toggleSelectAll}
                        checked={allVisibleSelected}
                      />
                    </th>
                    <th className="th">ID Denuncia</th>
                    <th className="th">Denunciante</th>
                    <th className="th">Correo</th>
                    <th className="th">Teléfono</th>
                    <th className="th">Fecha</th>
                    <th className="th">Estado</th>
                    <th className="th">Opciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 && (
                    <tr>
                      <td className="td" colSpan={8} style={{ textAlign: "center" }}>
                        <Loader variant="inline" text="Cargando datos..." />
                      </td>
                    </tr>
                  )}
                  {visibleRows.map((report) => {
                    const statusMeta = STATUS_META[report.status] || { label: safeTrim(report.status) || "Desconocido", color: "#64748b" };

                    return (
                      <tr key={report.id}>
                        <td className="td">
                          <input
                            type="checkbox"
                            checked={selected.includes(report.id)}
                            disabled={closing}
                            onChange={() => toggleSelectOne(report.id)}
                          />
                        </td>
                        <td className="td">{report.serial}</td>
                        <td className="td">{report.reporter}</td>
                        <td className="td">{report.email}</td>
                        <td className="td">{report.phone}</td>
                        <td className="td">{formatDateTime(report.receptionDate)}</td>
                        <td className="td">
                          <span style={{ padding: "4px 12px", borderRadius: "999px", backgroundColor: statusMeta.color, color: "#fff", fontSize: "0.85rem", fontWeight: 600 }}>
                            {statusMeta.label}
                          </span>
                        </td>
                        <td className="td">
                          <button type="button" onClick={() => handleVerDenuncia(report.id)} className="denuncia-card-link">VER</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          
          {reports.length > 0 && (
            <div className="paginacion">
                <div className="paginacion-botones">
                <button
                    onClick={handlePrev}
                    disabled={page === 0 || loading || closing}
                    className="paginacion-btn"
                >
                    Anterior
                </button>

                <button
                    onClick={handleNext}
                    disabled={page === totalPages - 1 || loading || closing}
                    className="paginacion-btn"
                >
                    Siguiente
                </button>
                </div>

                <span style={{ color: "#555" }}>
                Página <strong>{page + 1}</strong> de {totalPages || 1}
                </span>
                <div className="rows-control">
                <span>Filas por pág:</span>

                <CustomSelect
                    value={rowsPerPage}
                    onChange={handleRowsChange}
                    options={[
                    { value: 5, label: "5" },
                    { value: 10, label: "10" },
                    { value: 20, label: "20" },
                    ]}
                />
                </div>
            </div>
          )}
        </div>
      )}

      {detailModalOpen && (
        <div
          onClick={handleCloseDetalle}
          style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "16px" : "24px", zIndex: 1000, backdropFilter: "blur(2px)"
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%", maxWidth: isMobile ? "480px" : "540px", backgroundColor: "#fff", borderRadius: isMobile ? "14px" : "16px",
              padding: isMobile ? "22px" : "28px", boxShadow: "0 24px 60px rgba(15,23,42,0.18)", position: "relative", maxHeight: isMobile ? "95vh" : "90vh", overflowY: "auto"
            }}
          >
            <button
              type="button" onClick={handleCloseDetalle}
              style={{ position: "absolute", right: "16px", top: "16px", background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#64748b" }}
            >
              ×
            </button>

            <h3 style={{ marginTop: 0, marginBottom: "18px", color: "#111827" }}>Detalle de la denuncia</h3>

            {detailLoading && (
              <div style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}>
                <Loader variant="inline" text="Cargando denuncia..." />
              </div>
            )}

            {!detailLoading && detailError && (
              <div style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "16px", borderRadius: "12px", fontSize: "0.95rem" }}>
                {detailError}
              </div>
            )}

            {!detailLoading && !detailError && detailData && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {detailData.photo ? (
                  <img src={detailData.photo} alt="Evidencia de la denuncia" style={{ width: "100%", borderRadius: "12px", objectFit: "cover", maxHeight: "260px" }} />
                ) : (
                  <div style={{ width: "100%", borderRadius: "12px", backgroundColor: "#f1f5f9", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "180px", fontWeight: 500 }}>
                    Sin evidencia disponible
                  </div>
                )}
                <div>
                  <p style={{ margin: "0 0 8px 0", fontWeight: 600, color: "#1f2937" }}>Denuncia</p>
                  <p style={{ margin: 0, color: "#4b5563", lineHeight: 1.5 }}>{detailData.description}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", color: "#1f2937", fontSize: "0.95rem" }}>
                  <div><span style={{ fontWeight: 600 }}>Correo:&nbsp;</span><span>{detailData.email}</span></div>
                  <div><span style={{ fontWeight: 600 }}>Teléfono:&nbsp;</span><span>{detailData.phone}</span></div>
                  {detailData.location && <div><span style={{ fontWeight: 600 }}>Ubicación:&nbsp;</span><span>{detailData.location}</span></div>}
                  {detailData.status && <div><span style={{ fontWeight: 600 }}>Estado:&nbsp;</span><span>{detailData.status}</span></div>}
                </div>
              </div>
            )}

            {!detailLoading && !detailError && !detailData && (
              <div style={{ padding: "20px", textAlign: "center", color: "#475569" }}>No hay información disponible para esta denuncia.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}