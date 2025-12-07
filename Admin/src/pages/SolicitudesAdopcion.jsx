import React, { useCallback, useEffect, useRef, useState } from "react";
import { API_BASE_URL, AUTH_TOKEN } from "../config";
import "../styles/TablaPerros.css";
import { useNavigate } from "react-router-dom";

const STATUS_META = {
  PENDING: { label: "Pendiente", color: "#1d4ed8" },
  IN_REVIEW: { label: "En revisión", color: "#f59e0b" },
  APPROVED: { label: "Aprobado", color: "#15803d" },
  REJECTED: { label: "Rechazado", color: "#dc2626" },
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
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
};

const Loader = ({ text }) => (
  <div
    style={{
      textAlign: "center",
      padding: "40px",
      color: "#666",
      fontSize: "1.2rem",
      backgroundColor: "#f9f9f9",
      borderRadius: "8px",
      marginTop: "20px",
    }}
  >
    {text}
  </div>
);

export default function SolicitudesAdopcion() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchApplications = useCallback(async (signal) => {
    if (isMountedRef.current) setLoading(true);

    const headers = { "Content-Type": "application/json" };
    if (AUTH_TOKEN) headers.Authorization = `Bearer ${AUTH_TOKEN}`;

    try {
      const response = await fetch(
        `${API_BASE_URL}/adoption/applications/find-all`,
        { method: "GET", headers, signal }
      );
      if (!response.ok)
        throw new Error(`Error al obtener solicitudes: ${response.status}`);
      const result = await response.json();
      if (!Array.isArray(result.data))
        throw new Error("La respuesta del servidor no contiene datos válidos.");

      const normalized = result.data.map((app, index) => {
        const status = safeTrim(app.status) || "PENDING";
        const statusLabel = STATUS_META[status]?.label || status;
        const personName = app.person
          ? [safeTrim(app.person.firstNames), safeTrim(app.person.lastNames)]
              .filter(Boolean)
              .join(" ")
              .trim() || "—"
          : "—";
        const personEmail = app.person
          ? safeTrim(app.person.email) || "—"
          : "—";
        const personAddress = app.person
          ? [safeTrim(app.person.address), safeTrim(app.person.city)]
              .filter(Boolean)
              .join(", ")
              .trim() || "—"
          : "—";

        return {
          id: app.id,
          serial: index + 1,
          applicationDate: app.applicationDate || app.createdAt,
          status,
          statusLabel,
          personName,
          personEmail,
          personAddress,
        };
      });

      if (isMountedRef.current) {
        setApplications(normalized);
      }
    } catch (requestError) {
      if (requestError.name === "AbortError") return;
      console.error("Error al cargar solicitudes:", requestError);
      if (isMountedRef.current)
        setError(
          requestError.message ||
            "No fue posible obtener las solicitudes en este momento."
        );
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchApplications(controller.signal);
    return () => controller.abort();
  }, [fetchApplications]);

  const handleVerDetalle = (id) => {
    navigate(`/solicitudes/${id}`);
  };

  return (
    <div className="denuncias-page">
      <h2 className="page-title">Solicitud de adopciones</h2>

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
        <div className="tabla-perros-container">
          <div className="tabla-wrapper">
            <table className="tabla-perros">
              <thead>
                <tr>
                  <th className="th">#</th>
                  <th className="th">Solicitante</th>
                  <th className="th">Correo</th>
                  <th className="th">Dirección-Ciudad</th>
                  <th className="th">Fecha</th>
                  <th className="th">Estado</th>
                  <th className="th">Opciones</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center" }}>
                      <Loader text="Cargando solicitudes..." />
                    </td>
                  </tr>
                )}
                {applications.map((app) => {
                  const statusMeta = STATUS_META[app.status] || {
                    label: app.statusLabel || "Desconocido",
                    color: "#64748b",
                  };

                  return (
                    <tr key={app.id}>
                      <td className="td">{app.serial}</td>
                      <td className="td">{app.personName}</td>
                      <td className="td">{app.personEmail}</td>
                      <td className="td">{app.personAddress}</td>
                      <td className="td">
                        {formatDateTime(app.applicationDate)}
                      </td>
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
        </div>
      )}
    </div>
  );
}
