import React from "react";
import { Loader } from "../Loader";

export default function ReportDetailModal({
  open,
  loading,
  error,
  data,
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative min-h-[50vh]: bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-fadeIn ">
        {/* BOTÓN CERRAR */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition"
        >
          ✕
        </button>

        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
          Detalle de Denuncia
        </h3>

        {/* SKELETON MIENTRAS CARGA */}
        {loading && (
          <div className="space-y-4 animate-pulse min-h-[50vh]">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>

            <div className="h-56 bg-gray-200 rounded-xl mt-4"></div>

            <div className="flex justify-center mt-6">
              <Loader text="Cargando información..." />
            </div>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
            {error}
          </div>
        )}

        {/* DATOS */}
        {!loading && !error && data && (
          <div className="space-y-3 overflow-y-auto max-h-[calc(70vh-100px)] pr-2">
            <p>
              <span className="font-bold text-gray-700">Descripción:</span>{" "}
              {data.description}
            </p>

            <p>
              <span className="font-bold text-gray-700 ">Correo:</span>{" "}
              {data.email}
            </p>

            <p>
              <span className="font-bold text-gray-700">Teléfono:</span>{" "}
              {data.phone}
            </p>

            <p>
              <span className="font-bold text-gray-700">Tipo:</span>{" "}
              {data.type || "—"}
            </p>

            <p>
              <span className="font-bold text-gray-700">Ubicación:</span>{" "}
              {data.location || "—"}
            </p>
            <p>
              <span className="font-bold text-gray-700">Ubicación url:</span>{" "}
              {data.locationUrl ? (
                <a
                  href={data.locationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800 break-all"
                >
                  {data.locationUrl}
                </a>
              ) : (
                "—"
              )}
            </p>

            {data.photo && (
              <div className="mt-4 w-full h-64 overflow-hidden rounded-xl shadow-md">
                <img
                  src={data.photo}
                  alt="Evidencia"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
