import { useCallback, useEffect, useRef, useState } from "react";
import { API_BASE_URL, AUTH_TOKEN } from "../config";
import "../styles/TablaPerros.css";

const STATUS_META = {
  PENDING: { label: "Pendiente", color: "#1d4ed8" },
  IN_REVIEW: { label: "En revisión", color: "#f59e0b" },
  APPROVED: { label: "Aprobado", color: "#15803d" },
  REJECTED: { label: "Rechazado", color: "#dc2626" },
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

export default function SolicitudesAdopcion() {
  const [applications, setApplications] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(getIsMobile);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const isMountedRef = useRef(true);

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

  const fetchApplications = useCallback(
    async (signal) => {
      if (isMountedRef.current) {
        setLoading(true);
        setError(null);
      }

      const headers = {
        "Content-Type": "application/json",
      };

      if (AUTH_TOKEN) {
        headers.Authorization = `Bearer ${AUTH_TOKEN}`;
      }

      try {
        const requestOptions = {
          method: "GET",
          headers,
        };

        if (signal) {
          requestOptions.signal = signal;
        }

        const response = await fetch(
          `${API_BASE_URL}/adoption/applications/find-all`,
          requestOptions
        );

        if (!response.ok) {
          throw new Error(`Error al obtener solicitudes: ${response.status}`);
        }

        const result = await response.json();

        if (!Array.isArray(result.data)) {
          throw new Error("La respuesta del servidor no contiene datos válidos.");
        }

        const normalized = result.data.map((app, index) => {
          const status = safeTrim(app.status) || "PENDING";
          const statusLabel = STATUS_META[status]?.label || status;

          // Extraer información de la persona
          const personName = app.person
            ? [
                safeTrim(app.person.firstNames),
                safeTrim(app.person.lastNames),
              ]
                .filter(Boolean)
                .join(" ")
                .trim() || "—"
            : "—";

          const personEmail = app.person
            ? safeTrim(app.person.email) || "—"
            : "—";

          const personAddress = app.person
            ? [
                safeTrim(app.person.address),
                safeTrim(app.person.city),
              ]
                .filter(Boolean)
                .join(", ")
                .trim() || "—"
            : "—";

          return {
            id: app.id,
            serial: index + 1,
            applicationDate: app.applicationDate || app.createdAt,
            status: status,
            statusLabel: statusLabel,
            personName: personName,
            personEmail: personEmail,
            personAddress: personAddress,
            ownHome: app.ownHome === true,
            acceptsVisits: app.acceptsVisits === true,
            veterinarianName: safeTrim(app.veterinarianName) || "—",
            veterinarianPhone: safeTrim(app.veterinarianPhone) || "—",
            commitmentToSterilization: app.commitmentToSterilization === true,
            commitmentToSendPhotos: app.commitmentToSendPhotos === true,
            observations: safeTrim(app.observations) || "—",
            createdAt: app.createdAt,
            updatedAt: app.updatedAt,
            // Guardar datos originales completos para el modal
            rawData: app,
          };
        });

        if (isMountedRef.current) {
          setApplications(normalized);
          setSelected([]);
          setActionError(null);
        }
      } catch (requestError) {
        if (requestError.name === "AbortError") {
          return;
        }

        console.error("Error al cargar solicitudes:", requestError);

        if (isMountedRef.current) {
          setError(
            requestError.message ||
              "No fue posible obtener las solicitudes en este momento."
          );
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchApplications(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchApplications]);

  const toggleSelectAll = () => {
    if (loading || applications.length === 0 || updating) return;

    setActionSuccess(null);
    setActionError(null);

    if (selected.length === applications.length) {
      setSelected([]);
    } else {
      setSelected(applications.map((app) => app.id));
    }
  };

  const toggleSelectOne = (id) => {
    if (loading || updating) return;

    setActionSuccess(null);
    setActionError(null);

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

  const handleVerDetalle = async (applicationId) => {
    if (!applicationId) return;

    // Buscar la solicitud en los datos ya cargados
    const application = applications.find((app) => app.id === applicationId);

    if (isMountedRef.current) {
      setDetailModalOpen(true);
      setDetailLoading(true);
      setDetailError(null);
      setDetailData(null);
    }

    try {
      let fullApplication = application?.rawData || application;

      // Intentar obtener datos completos del endpoint si existe
      const headers = {
        "Content-Type": "application/json",
      };

      if (AUTH_TOKEN) {
        headers.Authorization = `Bearer ${AUTH_TOKEN}`;
      }

      // Intentar obtener datos completos del servidor
      try {
        const response = await fetch(
          `${API_BASE_URL}/adoption/applications/find-by-id/${applicationId}`,
          {
            method: "GET",
            headers,
          }
        );

        if (response.ok) {
          const payload = await response.json();
          const appData = payload?.data ?? payload;
          if (appData) {
            fullApplication = appData;
          }
        }
      } catch (fetchError) {
        // Si falla, usar los datos que ya tenemos
        console.log("Usando datos locales:", fetchError);
      }

      if (!fullApplication) {
        throw new Error("No se encontró información de la solicitud.");
      }

      // Normalizar los datos para el modal
      const normalized = {
        id: fullApplication.id,
        applicationDate: fullApplication.applicationDate || fullApplication.createdAt,
        status: safeTrim(fullApplication.status) || "PENDING",
        statusLabel: STATUS_META[safeTrim(fullApplication.status)]?.label || "Desconocido",
        ownHome: fullApplication.ownHome === true,
        acceptsVisits: fullApplication.acceptsVisits === true,
        veterinarianName: safeTrim(fullApplication.veterinarianName) || "—",
        veterinarianPhone: safeTrim(fullApplication.veterinarianPhone) || "—",
        commitmentToSterilization: fullApplication.commitmentToSterilization === true,
        commitmentToSendPhotos: fullApplication.commitmentToSendPhotos === true,
        observations: safeTrim(fullApplication.observations) || "—",
        createdAt: fullApplication.createdAt,
        updatedAt: fullApplication.updatedAt,
        person: fullApplication.person
          ? {
              id: fullApplication.person.id,
              firstNames: safeTrim(fullApplication.person.firstNames) || "—",
              lastNames: safeTrim(fullApplication.person.lastNames) || "—",
              email: safeTrim(fullApplication.person.email) || "—",
              phoneNumber: safeTrim(fullApplication.person.phoneNumber) || "—",
              dui: safeTrim(fullApplication.person.dui) || "—",
              address: safeTrim(fullApplication.person.address) || "—",
              city: safeTrim(fullApplication.person.city) || "—",
            }
          : null,
        dog: fullApplication.dog
          ? {
              id: fullApplication.dog.id,
              name: safeTrim(fullApplication.dog.name) || "—",
            }
          : null,
      };

      if (isMountedRef.current) {
        setDetailData(normalized);
      }
    } catch (viewError) {
      console.error("Error al obtener solicitud:", viewError);
      if (isMountedRef.current) {
        setDetailError(
          viewError.message ||
            "No fue posible cargar la información de la solicitud."
        );
      }
    } finally {
      if (isMountedRef.current) {
        setDetailLoading(false);
      }
    }
  };

  const updateApplicationStatus = useCallback(
    async (applicationIds, status) => {
      if (applicationIds.length === 0 || updating) {
        return;
      }

      const idsToUpdate = [...applicationIds];

      if (isMountedRef.current) {
        setActionError(null);
        setActionSuccess(null);
        setUpdating(true);
      }

      const headers = {
        "Content-Type": "application/json",
      };

      if (AUTH_TOKEN) {
        headers.Authorization = `Bearer ${AUTH_TOKEN}`;
      }

      try {
        for (const applicationId of idsToUpdate) {
          const response = await fetch(
            `${API_BASE_URL}/adoption/applications/update-application`,
            {
              method: "PUT",
              headers,
              body: JSON.stringify({
                id: applicationId,
                status: status,
                observations: "",
              }),
            }
          );

          const rawBody = await response.text();

          let parsedBody = null;
          if (rawBody) {
            try {
              parsedBody = JSON.parse(rawBody);
            } catch {
              parsedBody = null;
            }
          }

          const serverMessage = safeTrim(
            typeof parsedBody?.message === "string"
              ? parsedBody.message
              : rawBody
          );

          if (!response.ok) {
            if (response.status === 400) {
              throw new Error(
                serverMessage ||
                  "Error al actualizar la solicitud. Por favor verifica los datos."
              );
            }
            throw new Error(
              serverMessage ||
                `No se pudo actualizar la solicitud seleccionada (${applicationId}).`
            );
          }
        }

        if (isMountedRef.current) {
          const statusLabels = {
            APPROVED: "aprobada",
            IN_REVIEW: "enviada a revisión",
            REJECTED: "rechazada",
          };

          const statusLabel = statusLabels[status] || "actualizada";

          setActionSuccess(
            idsToUpdate.length === 1
              ? `Solicitud ${statusLabel} correctamente.`
              : `Solicitudes ${statusLabel} correctamente.`
          );
          setSelected([]);
        }

        await fetchApplications();
      } catch (updateError) {
        console.error("Error al actualizar solicitudes:", updateError);
        if (isMountedRef.current) {
          const userMessage =
            updateError.message ||
            "Ocurrió un problema al actualizar las solicitudes seleccionadas.";

          setActionError(userMessage);
        }
      } finally {
        if (isMountedRef.current) {
          setUpdating(false);
        }
      }
    },
    [updating, fetchApplications]
  );

  const handleAprobar = () => {
    if (selected.length === 0 || updating) return;
    updateApplicationStatus(selected, "APPROVED");
  };

  const handleMandarRevision = () => {
    if (selected.length === 0 || updating) return;
    updateApplicationStatus(selected, "IN_REVIEW");
  };

  const handleRechazar = () => {
    if (selected.length === 0 || updating) return;
    updateApplicationStatus(selected, "REJECTED");
  };

  const allSelected =
    applications.length > 0 && selected.length === applications.length;

  const isActionDisabled = selected.length === 0 || updating || loading;

  return (
    <div className="denuncias-page">
      <h2 className="page-title">Solicitud de adopciones</h2>

      <div className="acciones-tabla">
        <button
          type="button"
          onClick={handleAprobar}
          disabled={isActionDisabled}
          style={{
            background: "none",
            border: "none",
            color: isActionDisabled ? "rgba(21,128,61,0.6)" : "#15803d",
            fontWeight: 600,
            cursor: isActionDisabled ? "not-allowed" : "pointer",
            padding: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            opacity: isActionDisabled ? 0.6 : 1,
          }}
        >
          <svg
            className="icono-svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
          {updating ? "PROCESANDO..." : "✓ APROBAR"}
        </button>
        <button
          type="button"
          onClick={handleMandarRevision}
          disabled={isActionDisabled}
          style={{
            background: "none",
            border: "none",
            color: isActionDisabled ? "rgba(245,158,11,0.6)" : "#f59e0b",
            fontWeight: 600,
            cursor: isActionDisabled ? "not-allowed" : "pointer",
            padding: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            opacity: isActionDisabled ? 0.6 : 1,
          }}
        >
          <svg
            className="icono-svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          {updating ? "PROCESANDO..." : "MANDAR A REVISIÓN"}
        </button>
        <button
          type="button"
          onClick={handleRechazar}
          disabled={isActionDisabled}
          style={{
            background: "none",
            border: "none",
            color: isActionDisabled ? "rgba(220,38,38,0.6)" : "#dc2626",
            fontWeight: 600,
            cursor: isActionDisabled ? "not-allowed" : "pointer",
            padding: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            opacity: isActionDisabled ? 0.6 : 1,
          }}
        >
          <svg
            className="icono-svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
          {updating ? "PROCESANDO..." : "X RECHAZAR"}
        </button>
      </div>

      {actionError && (
        <div
          style={{
            marginTop: "12px",
            padding: "16px",
            backgroundColor: "#fee2e2",
            color: "#b91c1c",
            borderRadius: "8px",
            fontSize: "0.95rem",
          }}
        >
          {actionError}
        </div>
      )}

      {actionSuccess && (
        <div
          style={{
            marginTop: "12px",
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

      {updating && !loading && (
        <Loader text="Actualizando solicitudes..." />
      )}

      {loading && <Loader text="Cargando solicitudes..." />}

      {!loading && error && (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            backgroundColor: "#fee2e2",
            color: "#b91c1c",
            borderRadius: "8px",
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && (
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
                    disabled={loading || updating || applications.length === 0}
                    onChange={toggleSelectAll}
                    checked={allSelected}
                  />
                  <span>Seleccionar todo</span>
                </label>
                {selected.length > 0 && (
                  <span className="denuncias-mobile-counter">
                    {selected.length === 1
                      ? "1 seleccionada"
                      : `${selected.length} seleccionadas`}
                  </span>
                )}
              </div>

              {applications.length === 0 ? (
                <div className="denuncias-mobile-empty">
                <Loader text="Cargando solicitudes..." />
                </div>
              ) : (
                <div className="denuncias-mobile-list">
                  {applications.map((app) => {
                    const statusMeta =
                      STATUS_META[app.status] || {
                        label: app.statusLabel || "Desconocido",
                        color: "#64748b",
                      };

                    return (
                      <div className="denuncia-card" key={app.id}>
                        <div className="denuncia-card-header">
                          <label className="denuncia-card-select">
                            <input
                              type="checkbox"
                              checked={selected.includes(app.id)}
                              disabled={loading || updating}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleSelectOne(app.id);
                              }}
                            />
                            <span>#{app.serial}</span>
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
                            <span>Solicitante:</span>
                            {app.personName}
                          </p>
                          <p>
                            <span>Correo:</span>
                            {app.personEmail}
                          </p>
                          <p>
                            <span>Dirección:</span>
                            {app.personAddress}
                          </p>
                          <p>
                            <span>Fecha:</span>
                            {formatDateTime(app.applicationDate)}
                          </p>
                          <p>
                            <span>Propia casa:</span>
                            {app.ownHome ? "Sí" : "No"}
                          </p>
                          <p>
                            <span>Acepta visitas:</span>
                            {app.acceptsVisits ? "Sí" : "No"}
                          </p>
                        </div>

                        <div className="denuncia-card-footer">
                          <span className="denuncia-card-date">
                            {app.commitmentToSterilization && "✓ Esterilización"}
                            {app.commitmentToSterilization && app.commitmentToSendPhotos && " • "}
                            {app.commitmentToSendPhotos && "✓ Fotos"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleVerDetalle(app.id)}
                            className="denuncia-card-link"
                          >
                            VER
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
                        disabled={loading || updating || applications.length === 0}
                        onChange={toggleSelectAll}
                        checked={allSelected}
                      />
                    </th>
                    <th className="th">ID Solicitud</th>
                    <th className="th">Solicitante</th>
                    <th className="th">Correo</th>
                    <th className="th">Dirección-Ciudad</th>
                    <th className="th">Fecha</th>
                    <th className="th">Estado</th>
                    <th className="th">Propia casa</th>
                    <th className="th">Acepta visitas</th>
                    <th className="th">Opciones</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.length === 0 && (
                    <tr>
                      <td
                        className="td"
                        colSpan={9}
                        style={{ textAlign: "center" }}
                      >
                        <Loader text="Cargando solicitudes..." />
                      </td>
                    </tr>
                  )}
                  {applications.map((app) => {
                    const statusMeta =
                      STATUS_META[app.status] || {
                        label: app.statusLabel || "Desconocido",
                        color: "#64748b",
                      };

                    return (
                      <tr key={app.id}>
                        <td className="td">
                          <input
                            type="checkbox"
                            checked={selected.includes(app.id)}
                            disabled={loading || updating}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleSelectOne(app.id);
                            }}
                          />
                        </td>
                        <td className="td">{app.serial}</td>
                        <td className="td">{app.personName}</td>
                        <td className="td">{app.personEmail}</td>
                        <td className="td">{app.personAddress}</td>
                        <td className="td">{formatDateTime(app.applicationDate)}</td>
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
                        <td className="td">{app.ownHome ? "Sí" : "No"}</td>
                        <td className="td">{app.acceptsVisits ? "Sí" : "No"}</td>
                        <td className="td">
                          <button
                            type="button"
                            onClick={() => handleVerDetalle(app.id)}
                            className="denuncia-card-link"
                          >
                            VER
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

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
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: isMobile ? "90%" : "800px",
              backgroundColor: "#fff",
              borderRadius: isMobile ? "14px" : "16px",
              padding: isMobile ? "22px" : "28px",
              boxShadow: "0 24px 60px rgba(15,23,42,0.18)",
              position: "relative",
              maxHeight: isMobile ? "95vh" : "90vh",
              overflowY: "auto",
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
              aria-label="Cerrar detalle"
            >
              ×
            </button>

            <h3 style={{ marginTop: 0, marginBottom: "18px", color: "#111827" }}>
              Detalle de la solicitud de adopción
            </h3>

            {detailLoading && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "24px 0",
                }}
              >
                <Loader variant="inline" text="Cargando solicitud..." />
              </div>
            )}

            {!detailLoading && detailError && (
              <div
                style={{
                  backgroundColor: "#fee2e2",
                  color: "#b91c1c",
                  padding: "16px",
                  borderRadius: "12px",
                  fontSize: "0.95rem",
                }}
              >
                {detailError}
              </div>
            )}

            {!detailLoading && !detailError && detailData && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "0.95rem",
                  }}
                >
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td
                        style={{
                          padding: "12px 8px",
                          fontWeight: 600,
                          color: "#1f2937",
                          width: "40%",
                          verticalAlign: "top",
                        }}
                      >
                        ID Solicitud:
                      </td>
                      <td style={{ padding: "12px 8px", color: "#4b5563" }}>
                        {detailData.id}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td
                        style={{
                          padding: "12px 8px",
                          fontWeight: 600,
                          color: "#1f2937",
                          verticalAlign: "top",
                        }}
                      >
                        Fecha de solicitud:
                      </td>
                      <td style={{ padding: "12px 8px", color: "#4b5563" }}>
                        {formatDateTime(detailData.applicationDate)}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td
                        style={{
                          padding: "12px 8px",
                          fontWeight: 600,
                          color: "#1f2937",
                          verticalAlign: "top",
                        }}
                      >
                        Estado:
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: "999px",
                            backgroundColor:
                              STATUS_META[detailData.status]?.color || "#64748b",
                            color: "#fff",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                          }}
                        >
                          {detailData.statusLabel}
                        </span>
                      </td>
                    </tr>
                    {detailData.person && (
                      <>
                        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                          <td
                            colSpan={2}
                            style={{
                              padding: "12px 8px",
                              fontWeight: 700,
                              color: "#111827",
                              backgroundColor: "#f9fafb",
                            }}
                          >
                            Información del Solicitante
                          </td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                          <td
                            style={{
                              padding: "12px 8px",
                              fontWeight: 600,
                              color: "#1f2937",
                              verticalAlign: "top",
                            }}
                          >
                            Nombres:
                          </td>
                          <td style={{ padding: "12px 8px", color: "#4b5563" }}>
                            {detailData.person.firstNames}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                          <td
                            style={{
                              padding: "12px 8px",
                              fontWeight: 600,
                              color: "#1f2937",
                              verticalAlign: "top",
                            }}
                          >
                            Apellidos:
                          </td>
                          <td style={{ padding: "12px 8px", color: "#4b5563" }}>
                            {detailData.person.lastNames}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                          <td
                            style={{
                              padding: "12px 8px",
                              fontWeight: 600,
                              color: "#1f2937",
                              verticalAlign: "top",
                            }}
                          >
                            Correo electrónico:
                          </td>
                          <td style={{ padding: "12px 8px", color: "#4b5563" }}>
                            {detailData.person.email}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                          <td
                            style={{
                              padding: "12px 8px",
                              fontWeight: 600,
                              color: "#1f2937",
                              verticalAlign: "top",
                            }}
                          >
                            Teléfono:
                          </td>
                          <td style={{ padding: "12px 8px", color: "#4b5563" }}>
                            {detailData.person.phoneNumber}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                          <td
                            style={{
                              padding: "12px 8px",
                              fontWeight: 600,
                              color: "#1f2937",
                              verticalAlign: "top",
                            }}
                          >
                            DUI:
                          </td>
                          <td style={{ padding: "12px 8px", color: "#4b5563" }}>
                            {detailData.person.dui}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                          <td
                            style={{
                              padding: "12px 8px",
                              fontWeight: 600,
                              color: "#1f2937",
                              verticalAlign: "top",
                            }}
                          >
                            Dirección:
                          </td>
                          <td style={{ padding: "12px 8px", color: "#4b5563" }}>
                            {detailData.person.address}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                          <td
                            style={{
                              padding: "12px 8px",
                              fontWeight: 600,
                              color: "#1f2937",
                              verticalAlign: "top",
                            }}
                          >
                            Ciudad:
                          </td>
                          <td style={{ padding: "12px 8px", color: "#4b5563" }}>
                            {detailData.person.city}
                          </td>
                        </tr>
                      </>
                    )}
                    {detailData.dog && (
                      <>
                        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                          <td
                            colSpan={2}
                            style={{
                              padding: "12px 8px",
                              fontWeight: 700,
                              color: "#111827",
                              backgroundColor: "#f9fafb",
                            }}
                          >
                            Información del Perro
                          </td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                          <td
                            style={{
                              padding: "12px 8px",
                              fontWeight: 600,
                              color: "#1f2937",
                              verticalAlign: "top",
                            }}
                          >
                            ID Perro:
                          </td>
                          <td style={{ padding: "12px 8px", color: "#4b5563" }}>
                            {detailData.dog.id}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                          <td
                            style={{
                              padding: "12px 8px",
                              fontWeight: 600,
                              color: "#1f2937",
                              verticalAlign: "top",
                            }}
                          >
                            Nombre:
                          </td>
                          <td style={{ padding: "12px 8px", color: "#4b5563" }}>
                            {detailData.dog.name}
                          </td>
                        </tr>
                      </>
                    )}
                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td
                        colSpan={2}
                        style={{
                          padding: "12px 8px",
                          fontWeight: 700,
                          color: "#111827",
                          backgroundColor: "#f9fafb",
                        }}
                      >
                        Detalles de la Solicitud
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td
                        style={{
                          padding: "12px 8px",
                          fontWeight: 600,
                          color: "#1f2937",
                          verticalAlign: "top",
                        }}
                      >
                        Propia casa:
                      </td>
                      <td style={{ padding: "12px 8px", color: "#4b5563" }}>
                        {detailData.ownHome ? "Sí" : "No"}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td
                        style={{
                          padding: "12px 8px",
                          fontWeight: 600,
                          color: "#1f2937",
                          verticalAlign: "top",
                        }}
                      >
                        Acepta visitas:
                      </td>
                      <td style={{ padding: "12px 8px", color: "#4b5563" }}>
                        {detailData.acceptsVisits ? "Sí" : "No"}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td
                        style={{
                          padding: "12px 8px",
                          fontWeight: 600,
                          color: "#1f2937",
                          verticalAlign: "top",
                        }}
                      >
                        Nombre del veterinario:
                      </td>
                      <td style={{ padding: "12px 8px", color: "#4b5563" }}>
                        {detailData.veterinarianName}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td
                        style={{
                          padding: "12px 8px",
                          fontWeight: 600,
                          color: "#1f2937",
                          verticalAlign: "top",
                        }}
                      >
                        Teléfono del veterinario:
                      </td>
                      <td style={{ padding: "12px 8px", color: "#4b5563" }}>
                        {detailData.veterinarianPhone}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td
                        style={{
                          padding: "12px 8px",
                          fontWeight: 600,
                          color: "#1f2937",
                          verticalAlign: "top",
                        }}
                      >
                        Compromiso de esterilización:
                      </td>
                      <td style={{ padding: "12px 8px", color: "#4b5563" }}>
                        {detailData.commitmentToSterilization ? (
                          <span style={{ color: "#15803d", fontWeight: 600 }}>
                            ✓ Sí
                          </span>
                        ) : (
                          <span style={{ color: "#dc2626" }}>✗ No</span>
                        )}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td
                        style={{
                          padding: "12px 8px",
                          fontWeight: 600,
                          color: "#1f2937",
                          verticalAlign: "top",
                        }}
                      >
                        Compromiso de envío de fotos:
                      </td>
                      <td style={{ padding: "12px 8px", color: "#4b5563" }}>
                        {detailData.commitmentToSendPhotos ? (
                          <span style={{ color: "#15803d", fontWeight: 600 }}>
                            ✓ Sí
                          </span>
                        ) : (
                          <span style={{ color: "#dc2626" }}>✗ No</span>
                        )}
                      </td>
                    </tr>
                    {detailData.observations !== "—" && (
                      <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td
                          style={{
                            padding: "12px 8px",
                            fontWeight: 600,
                            color: "#1f2937",
                            verticalAlign: "top",
                          }}
                        >
                          Observaciones:
                        </td>
                        <td style={{ padding: "12px 8px", color: "#4b5563" }}>
                          {detailData.observations}
                        </td>
                      </tr>
                    )}
                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td
                        style={{
                          padding: "12px 8px",
                          fontWeight: 600,
                          color: "#1f2937",
                          verticalAlign: "top",
                        }}
                      >
                        Fecha de creación:
                      </td>
                      <td style={{ padding: "12px 8px", color: "#4b5563" }}>
                        {formatDateTime(detailData.createdAt)}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          padding: "12px 8px",
                          fontWeight: 600,
                          color: "#1f2937",
                          verticalAlign: "top",
                        }}
                      >
                        Última actualización:
                      </td>
                      <td style={{ padding: "12px 8px", color: "#4b5563" }}>
                        {formatDateTime(detailData.updatedAt)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {!detailLoading && !detailError && !detailData && (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "#475569",
                }}
              >
                No hay información disponible para esta solicitud.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}