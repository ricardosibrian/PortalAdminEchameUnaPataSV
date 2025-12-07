// components/StatusUpdater.jsx
import React, { useState } from "react";
import ObservationsField from "../ObservationsField";

export default function StatusUpdater({ currentStatus, onUpdate }) {
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [observation, setObservation] = useState("");

  const handleClick = () => {
    onUpdate(newStatus, observation);
  };

  return (
    <div className="bg-white shadow rounded-xl p-6 mb-2.5">
      <h4 className="text-lg font-bold mb-3">Actualizar estado</h4>
      <div className="flex flex-col gap-3">
        <select
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          className="border border-gray-300 rounded w-fit px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="PENDING">Pendiente</option>
          <option value="IN_REVIEW">En Revisión</option>
          <option value="APPROVED">Aprobada</option>
          <option value="REJECTED">Rechazada</option>
        </select>

        {(newStatus === "REJECTED" ||
          newStatus === "APPROVED" ||
          newStatus === "IN_REVIEW") && (
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
        )}

        <button
          onClick={handleClick}
          className="px-4 py-2 rounded font-semibold transition bg-amber-500 text-white hover:bg-amber-600 w-fit"
        >
          Actualizar
        </button>
      </div>
    </div>
  );
}
