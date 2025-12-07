import React, { useCallback, useEffect, useRef, useState } from "react";
import { API_BASE_URL, AUTH_TOKEN } from "../config";
import CustomSelect from "../components/CustomSelect";
import NuevoPadrino from "../components/NuevoPadrino";
import FormRenovarPadrino from "../components/FormRenovarPadrino";
import "../styles/TablaPerros.css";
import { TableSkeleton } from "../components/sponsorships/TableSkeleton";

const STATUS_META = {
  ACTIVE: { label: "Activo", color: "#1d4ed8" },
  INACTIVE: { label: "Inactivo", color: "#64748b" },
  PENDING: { label: "Pendiente", color: "#ea580c" },
};

const safeTrim = (value) => (typeof value === "string" ? value.trim() : "");

const formatDateTime = (isoDate) => {
  if (!isoDate) return "—";
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return "—";
  return new Intl.DateTimeFormat("es-SV", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
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
              color: "#666",
              fontSize: "0.95rem",
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

export default function GestionPadrinos() {
  const [sponsorships, setSponsorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [actionSuccess, setActionSuccess] = useState(null);

  const [showForm, setShowForm] = useState(false);

  const [renewModal, setRenewModal] = useState({
    open: false,
    id: null,
    currentAmount: 0,
  });

  const [selected, setSelected] = useState([]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [isMobile, setIsMobile] = useState(getIsMobile);
  const isMountedRef = useRef(true);

  const totalPages = Math.ceil(sponsorships.length / rowsPerPage);
  const startIndex = page * rowsPerPage;
  const visibleRows = sponsorships.slice(startIndex, startIndex + rowsPerPage);

  const allVisibleSelected =
    visibleRows.length > 0 &&
    visibleRows.every((row) => selected.includes(row.id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      const visibleIds = visibleRows.map((r) => r.id);
      setSelected((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      const visibleIds = visibleRows.map((r) => r.id);
      setSelected((prev) => [...new Set([...prev, ...visibleIds])]);
    }
  };

  const toggleSelectOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

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
      if (isMountedRef.current) setIsMobile(getIsMobile());
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchSponsorships = useCallback(async (signal) => {
    if (isMountedRef.current) {
      setLoading(true);
      setError(null);
    }

    const headers = { "Content-Type": "application/json" };
    if (AUTH_TOKEN) headers.Authorization = `Bearer ${AUTH_TOKEN}`;

    try {
      const requestOptions = { method: "GET", headers };
      if (signal) requestOptions.signal = signal;

      const response = await fetch(
        `${API_BASE_URL}/sponsorship/find-all`,
        requestOptions
      );

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const result = await response.json();

      const normalized = Array.isArray(result.data)
        ? result.data.map((item, index) => {
            const sponsorName =
              [
                safeTrim(item.sponsor?.firstNames),
                safeTrim(item.sponsor?.lastNames),
              ]
                .filter(Boolean)
                .join(" ")
                .trim() || "Sin nombre";

            return {
              id: item.id,
              serial: index + 1,
              sponsorName,
              email: safeTrim(item.sponsor?.email) || "—",
              phone: safeTrim(item.sponsor?.phoneNumber) || "—",
              endDate: item.endDate,
              status: item.sponsorshipStatus,
              amount: item.monthlyAmount,
              startDate: item.startDate,
              notes: item.notes,
              animalName: item.animal?.name || "Desconocido",
              animalPhoto: item.animal?.photo,
              sponsorAddress: item.sponsor?.address,
            };
          })
        : [];

      if (isMountedRef.current) {
        setSponsorships(normalized);
        setSelected([]);
        setLoading(false);
      }
    } catch (requestError) {
      if (requestError.name === "AbortError") {
        return;
      }

      console.error("Error al cargar:", requestError);
      if (isMountedRef.current) {
        setError("Error al cargar datos.");
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchSponsorships(controller.signal);
    return () => controller.abort();
  }, [fetchSponsorships]);

  const handleVerDetalle = async (id) => {
    setDetailModalOpen(true);
    setLoadingDetail(true);
    setDetailData(null);

    try {
      const headers = { "Content-Type": "application/json" };
      if (AUTH_TOKEN) headers.Authorization = `Bearer ${AUTH_TOKEN}`;

      const response = await fetch(
        `${API_BASE_URL}/sponsorship/find-by-id/${id}`,
        {
          method: "GET",
          headers,
        }
      );
      if (!response.ok) throw new Error("Error detalle");
      const result = await response.json();
      const raw = result.data;

      const normalizedDetail = {
        animalPhoto: raw.animal?.photo,
        animalName: raw.animal?.name || "Desconocido",
        amount: raw.monthlyAmount,
        status: raw.sponsorshipStatus,
        sponsorName: [
          safeTrim(raw.sponsor?.firstNames),
          safeTrim(raw.sponsor?.lastNames),
        ]
          .join(" ")
          .trim(),
        email: raw.sponsor?.email,
        phone: raw.sponsor?.phoneNumber,
        sponsorAddress: raw.sponsor?.address,
        startDate: raw.startDate,
        endDate: raw.endDate,
        notes: raw.notes,
      };
      setDetailData(normalizedDetail);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetalle = () => {
    setDetailModalOpen(false);
    setDetailData(null);
  };

  const handleNuevo = () => setShowForm(true);
  const handleCloseForm = () => setShowForm(false);

  const handleCreateSubmit = async (payload) => {
    const headers = { "Content-Type": "application/json" };
    if (AUTH_TOKEN) headers.Authorization = `Bearer ${AUTH_TOKEN}`;

    const response = await fetch(`${API_BASE_URL}/sponsorship/register`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Error al registrar");

    setShowForm(false);
    setActionSuccess("Padrino registrado correctamente.");
    setTimeout(() => {
      if (isMountedRef.current) setActionSuccess(null);
    }, 5000);

    await fetchSponsorships();
  };

  // 1. Prepara la modal
  const handleRenovarClick = () => {
    if (selected.length !== 1) return;
    const idToRenew = selected[0];
    const currentItem = sponsorships.find((s) => s.id === idToRenew);

    setRenewModal({
      open: true,
      id: idToRenew,
      currentAmount: currentItem ? currentItem.amount : 0,
    });
  };

  // 2. Ejecuta la renovación (se pasa como prop onSubmit al modal)
  const handleSubmitRenovacion = async (newAmount) => {
    const { id } = renewModal;
    if (!id) return;

    try {
      const headers = { "Content-Type": "application/json" };
      if (AUTH_TOKEN) headers.Authorization = `Bearer ${AUTH_TOKEN}`;

      const response = await fetch(`${API_BASE_URL}/sponsorship/renew/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          monthlyAmount: newAmount,
        }),
      });

      if (!response.ok) throw new Error("Error al renovar");

      setRenewModal({ open: false, id: null, currentAmount: 0 });
      setActionSuccess("Padrino renovado exitosamente.");
      setSelected([]);
      await fetchSponsorships();
    } catch (error) {
      console.error("Error renovando:", error);
      throw error;
    } finally {
      setTimeout(() => {
        if (isMountedRef.current) setActionSuccess(null);
      }, 5000);
    }
  };

  const isActionDisabled = selected.length !== 1 || loading;

  return (
    <div className="denuncias-page">
      <h2 className="page-title">Gestión de Padrinos</h2>

      <div className="acciones-tabla" style={{ marginBottom: "20px" }}>
        <button
          type="button"
          onClick={handleNuevo}
          className="btn-nuevo"
          style={{
            background: "none",
            border: "none",
            color: "#16a34a",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: 0,
            marginRight: "20px",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M12 5v14M5 12h14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          NUEVO PADRINO
        </button>

        <button
          type="button"
          onClick={handleRenovarClick}
          disabled={isActionDisabled}
          style={{
            background: "none",
            border: "none",
            color: isActionDisabled ? "rgba(37, 99, 235, 0.5)" : "#2563eb",
            fontWeight: 600,
            cursor: isActionDisabled ? "not-allowed" : "pointer",
            opacity: isActionDisabled ? 0.6 : 1,
            padding: 0,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M23 4v6h-6" />
            <path d="M1 20v-6h6" />
            <path
              d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          RENOVAR PADRINO
        </button>
      </div>

      {actionSuccess && (
        <div
          style={{
            marginTop: "12px",
            marginBottom: "20px",
            padding: "16px",
            backgroundColor: "#dcfce7",
            color: "#166534",
            borderRadius: "8px",
            fontSize: "0.95rem",
          }}
        >
          {actionSuccess}
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: "12px",
            marginBottom: "20px",
            padding: "16px",
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            borderRadius: "8px",
            fontSize: "0.95rem",
          }}
        >
          {error}
        </div>
      )}

      <div
        className={`tabla-perros-container ${
          isMobile ? "denuncias-container-mobile" : ""
        }`}
      >
        {isMobile ? (
          <>
            <div className="denuncias-mobile-topbar">
              <label className="denuncias-mobile-select">
                <input
                  type="checkbox"
                  disabled={loading || sponsorships.length === 0}
                  onChange={toggleSelectAll}
                  checked={allVisibleSelected}
                />
                <span>Seleccionar todo</span>
              </label>
              {selected.length > 0 && (
                <span className="denuncias-mobile-counter">
                  {selected.length} seleccionados
                </span>
              )}
            </div>

            {loading ? (
              <div className="denuncias-mobile-empty">
                <Loader variant="inline" text="Cargando datos..." />
              </div>
            ) : sponsorships.length === 0 ? (
              <div className="denuncias-mobile-empty">
                <span style={{ color: "#666" }}>
                  No hay padrinos registrados.
                </span>
              </div>
            ) : (
              <div className="denuncias-mobile-list">
                {visibleRows.map((item) => {
                  const statusMeta =
                    STATUS_META[item.status] || STATUS_META.INACTIVE;
                  return (
                    <div className="denuncia-card" key={item.id}>
                      <div className="denuncia-card-header">
                        <label className="denuncia-card-select">
                          <input
                            type="checkbox"
                            checked={selected.includes(item.id)}
                            onChange={() => toggleSelectOne(item.id)}
                          />
                          <span style={{ fontWeight: 600, color: "#444" }}>
                            {item.sponsorName}
                          </span>
                        </label>
                        <span
                          className="denuncia-status-pill"
                          style={{ backgroundColor: statusMeta.color }}
                        >
                          {statusMeta.label}
                        </span>
                      </div>
                      <div className="denuncia-card-body">
                        <p>
                          <span>Correo:</span> {item.email}
                        </p>
                        <p>
                          <span>Vencimiento:</span>{" "}
                          {formatDateTime(item.endDate)}
                        </p>
                      </div>
                      <div className="denuncia-card-footer">
                        <button
                          type="button"
                          onClick={() => handleVerDetalle(item.id)}
                          className="denuncia-card-link"
                        >
                          VER DETALLE
                        </button>
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
                      disabled={loading || sponsorships.length === 0}
                      onChange={toggleSelectAll}
                      checked={allVisibleSelected}
                    />
                  </th>
                  <th className="th">Padrino</th>
                  <th className="th">Correo</th>
                  <th className="th">Teléfono</th>
                  <th className="th">Vencimiento</th>
                  <th className="th">Estado</th>
                  <th className="th">Opciones</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <TableSkeleton rows={10} />
                ) : sponsorships.length === 0 ? (
                  <tr>
                    <td
                      className="td"
                      colSpan={7}
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      No se encontraron padrinos.
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((item) => {
                    const statusMeta =
                      STATUS_META[item.status] || STATUS_META.INACTIVE;
                    return (
                      <tr key={item.id}>
                        <td className="td">
                          <input
                            type="checkbox"
                            checked={selected.includes(item.id)}
                            onChange={() => toggleSelectOne(item.id)}
                          />
                        </td>
                        <td className="td" style={{ fontWeight: 500 }}>
                          {item.sponsorName}
                        </td>
                        <td className="td">{item.email}</td>
                        <td className="td">{item.phone}</td>
                        <td className="td">{formatDateTime(item.endDate)}</td>
                        <td className="td">
                          <span
                            style={{
                              padding: "4px 12px",
                              borderRadius: "999px",
                              backgroundColor: statusMeta.color,
                              color: "#fff",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                            }}
                          >
                            {statusMeta.label}
                          </span>
                        </td>
                        <td className="td">
                          <button
                            type="button"
                            onClick={() => handleVerDetalle(item.id)}
                            className="denuncia-card-link"
                          >
                            VER
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="paginacion">
          <div className="paginacion-botones">
            <button
              onClick={handlePrev}
              disabled={page === 0 || loading}
              className="paginacion-btn"
            >
              Anterior
            </button>
            <button
              onClick={handleNext}
              disabled={page === totalPages - 1 || loading}
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
      </div>

      {detailModalOpen && (
        <div
          onClick={handleCloseDetalle}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: isMobile ? "16px" : "24px",
            zIndex: 1000,
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: isMobile ? "480px" : "540px",
              backgroundColor: "#fff",
              borderRadius: isMobile ? "14px" : "16px",
              padding: isMobile ? "22px" : "28px",
              boxShadow: "0 24px 60px rgba(15,23,42,0.18)",
              position: "relative",
              maxHeight: isMobile ? "95vh" : "90vh",
              overflowY: "auto",
              minHeight: "200px",
            }}
          >
            <button
              type="button"
              onClick={handleCloseDetalle}
              style={{
                position: "absolute",
                right: "16px",
                top: "16px",
                background: "none",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
                color: "#64748b",
              }}
            >
              ×
            </button>

            <h3
              style={{ marginTop: 0, marginBottom: "18px", color: "#111827" }}
            >
              Detalle del Apadrinamiento
            </h3>

            {loadingDetail ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "40px 0",
                }}
              >
                <Loader variant="inline" text="Cargando información..." />
              </div>
            ) : detailData ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    backgroundColor: "#f8fafc",
                    padding: "15px",
                    borderRadius: "12px",
                  }}
                >
                  {detailData.animalPhoto ? (
                    <img
                      src={detailData.animalPhoto}
                      alt="Animal"
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        backgroundColor: "#cbd5e1",
                      }}
                    ></div>
                  )}
                  <div>
                    <span
                      style={{
                        display: "block",
                        fontSize: "0.85rem",
                        color: "#64748b",
                      }}
                    >
                      Apadrina a:
                    </span>
                    <span
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: "bold",
                        color: "#334155",
                      }}
                    >
                      {detailData.animalName}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "15px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: "0.85rem",
                        color: "#64748b",
                        display: "block",
                      }}
                    >
                      Monto Mensual
                    </label>
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        color: "#16a34a",
                      }}
                    >
                      ${detailData.amount?.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: "0.85rem",
                        color: "#64748b",
                        display: "block",
                      }}
                    >
                      Estado
                    </label>
                    <span
                      style={{
                        fontWeight: 600,
                        color: (
                          STATUS_META[detailData.status] || STATUS_META.INACTIVE
                        ).color,
                      }}
                    >
                      {
                        (STATUS_META[detailData.status] || STATUS_META.INACTIVE)
                          .label
                      }
                    </span>
                  </div>
                </div>
                <div
                  style={{ borderTop: "1px solid #e2e8f0", margin: "5px 0" }}
                ></div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    color: "#1f2937",
                    fontSize: "0.95rem",
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600 }}>Padrino:</span>{" "}
                    {detailData.sponsorName}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600 }}>Correo:</span>{" "}
                    {detailData.email}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600 }}>Teléfono:</span>{" "}
                    {detailData.phone}
                  </div>
                  {detailData.sponsorAddress && (
                    <div>
                      <span style={{ fontWeight: 600 }}>Dirección:</span>{" "}
                      {detailData.sponsorAddress}
                    </div>
                  )}
                </div>
                <div
                  style={{ borderTop: "1px solid #e2e8f0", margin: "5px 0" }}
                ></div>
                <div style={{ fontSize: "0.9rem", color: "#475569" }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>Inicio:</span>{" "}
                    {formatDateTime(detailData.startDate)}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600 }}>Fin:</span>{" "}
                    {formatDateTime(detailData.endDate)}
                  </div>
                  {detailData.notes && (
                    <div style={{ marginTop: "10px", fontStyle: "italic" }}>
                      "{detailData.notes}"
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {showForm && (
        <NuevoPadrino onClose={handleCloseForm} onSubmit={handleCreateSubmit} />
      )}

      {renewModal.open && (
        <FormRenovarPadrino
          currentAmount={renewModal.currentAmount}
          onClose={() => setRenewModal({ ...renewModal, open: false })}
          onSubmit={handleSubmitRenovacion}
        />
      )}
    </div>
  );
}
