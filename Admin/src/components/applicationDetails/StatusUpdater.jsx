// components/StatusUpdater.jsx
import React, { useState, useEffect } from "react";
import ObservationsField from "../ObservationsField";

export default function StatusUpdater({ currentStatus, onUpdate, successMessage = "", errorMessage = "" }) {
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [observation, setObservation] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Keep newStatus in sync if the prop changes externally
  useEffect(() => {
    setNewStatus(currentStatus);
  }, [currentStatus]);

  // Define allowed transitions: include the current status so the select can show it
  const allowedNext = (() => {
    switch (currentStatus) {
      case "PENDING":
        return ["PENDING", "IN_REVIEW"];
      case "IN_REVIEW":
        return ["IN_REVIEW", "APPROVED", "REJECTED"];
      case "APPROVED":
      case "REJECTED":
        return [currentStatus];
      default:
        return ["PENDING", "IN_REVIEW", "APPROVED", "REJECTED"];
    }
  })();

  const handleClick = async () => {
    if (newStatus === currentStatus) return; // safety guard
    try {
      setIsUpdating(true);
      // Await in case onUpdate is async (it is in ApplicationDetalle)
      await onUpdate(newStatus, observation);
    } finally {
      setIsUpdating(false);
    }
  };

  const isDisabled = isUpdating || newStatus === currentStatus;

  return (
    <div className="bg-white shadow rounded-xl p-6 mb-2.5">
      <h4 className="text-lg font-bold mb-3">Actualizar estado</h4>

      {/* Visual hint about allowed transition sequence */}
      <div className="mb-3 p-3 rounded border-l-4 border-amber-400 bg-amber-50 text-amber-800 text-sm">
        Secuencia permitida de estados: <strong>Pendiente</strong> → <strong>En revisión</strong> → <strong>Aprobada</strong> /{" "}
        <strong>Rechazada</strong>.
        <div className="mt-1 text-gray-600">
          Solo podrás seleccionar opciones válidas desde el estado actual; las
          demás estarán deshabilitadas.
        </div>
      </div>

      {/* Inline messages (appear near the controls) */}
      {(successMessage || errorMessage) && (
        <div className="mb-3">
          {successMessage && (
            <div className="p-3 rounded-md bg-green-50 border-l-4 border-green-400 text-green-800 text-sm">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="p-3 rounded-md bg-red-50 border-l-4 border-red-400 text-red-800 text-sm">
              {errorMessage}
            </div>
          )}
        </div>
      )}

      {/* Controls row: select + update button (responsive) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Seleccionar nuevo estado"
          >
            <option
              value="PENDING"
              disabled={!allowedNext.includes("PENDING")}
              title={
                !allowedNext.includes("PENDING")
                  ? "No disponible desde el estado actual"
                  : ""
              }
            >
              Pendiente
            </option>
            <option
              value="IN_REVIEW"
              disabled={!allowedNext.includes("IN_REVIEW")}
              title={
                !allowedNext.includes("IN_REVIEW")
                  ? "No disponible desde el estado actual"
                  : ""
              }
            >
              En Revisión
            </option>
            <option
              value="APPROVED"
              disabled={!allowedNext.includes("APPROVED")}
              title={
                !allowedNext.includes("APPROVED")
                  ? "No disponible desde el estado actual"
                  : ""
              }
            >
              Aprobada
            </option>
            <option
              value="REJECTED"
              disabled={!allowedNext.includes("REJECTED")}
              title={
                !allowedNext.includes("REJECTED")
                  ? "No disponible desde el estado actual"
                  : ""
              }
            >
              Rechazada
            </option>
          </select>
        </div>

        <div className="flex-shrink-0">
          <button
            onClick={handleClick}
            disabled={isDisabled}
            className={`btn-update-sidebar`}
            aria-disabled={isDisabled}
          >
            {isUpdating ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      </div>

      {/* Observations field (kept below controls so button is immediately available) */}
      {(newStatus === "REJECTED" ||
        newStatus === "APPROVED" ||
        newStatus === "IN_REVIEW") && (
        <div className="mt-3">
          <ObservationsField
            title="Observaciones"
            description={
              newStatus === "REJECTED"
                ? "Indica el motivo del rechazo"
                : "Puedes agregar un comentario opcional sobre la toma en cuenta"
            }
            name="observation"
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
