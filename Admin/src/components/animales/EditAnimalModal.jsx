import React, { useState } from "react";
import { Loader } from "../Loader";
import { STATUS_CONFIG } from "../../utils/animalConfig";
import CloseIcon from "@mui/icons-material/Close";
import EditAnimalSkeleton from "./EditAnimalSkeleton";

export default function EditAnimalModal({
  open,
  loading,
  data,
  form,
  onChange,
  onFileChange,
  onSubmit,
  onClose,
  updating,
}) {
  const [preview, setPreview] = useState(null);

  if (!open) return null;

  const handleFilePreview = (e) => {
    onFileChange(e);
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-5 z-[2000]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white rounded-2xl p-7 shadow-2xl max-h-[90vh] overflow-y-auto relative animate-fadeIn"
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute cursor-pointer right-5 top-5 text-gray-500 hover:text-gray-700 transition"
        >
          <CloseIcon />
        </button>

        <h2 className="text-xl font-bold text-slate-900 mb-6">
          Detalle y edición del animal
        </h2>

        {/* LOADING */}
        {loading ? (
          <EditAnimalSkeleton />
        ) : (
          data && (
            <form onSubmit={onSubmit} className="flex flex-col gap-6">
              {/* CARD SUPERIOR */}
              <div className="flex gap-4 bg-slate-50 p-4 rounded-xl shadow">
                <img
                  src={preview || data.photo}
                  alt="Foto animal"
                  className="w-40 h-40 rounded-lg object-cover shadow-md border"
                />

                <div className="flex flex-col justify-center">
                  <p className="text-sm text-gray-500">Nombre</p>
                  <h3 className="text-xl font-bold text-slate-900">
                    {data.name}
                  </h3>

                  <p className="text-sm text-gray-500 mt-2">Raza</p>
                  <span className="text-blue-600 font-semibold">
                    {data.race}
                  </span>
                </div>
              </div>

              {/* GRID DE EDAD Y ESTADO */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-100 p-4 rounded-lg">
                  <p className="text-xs text-gray-500">Edad</p>
                  <p className="font-semibold">
                    {data.age ? `${data.age} años` : "Desconocida"}
                  </p>
                </div>

                <div className="bg-slate-100 p-4 rounded-lg">
                  <p className="text-xs text-gray-500">Estado actual</p>
                  <p className="font-semibold">
                    {
                      (
                        STATUS_CONFIG[data.state] ||
                        STATUS_CONFIG.UNDER_ADOPTION
                      ).label
                    }
                  </p>
                </div>
              </div>

              {/* DESCRIPCIÓN */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Descripción inicial
                </label>
                <textarea
                  name="initialDescription"
                  value={form.initialDescription}
                  onChange={onChange}
                  rows={3}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-lg p-3 focus:ring focus:ring-blue-300 focus:outline-none"
                />
              </div>

              {/* SELECTS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Esterilizado
                  </label>
                  <select
                    name="sterilized"
                    value={form.sterilized}
                    onChange={onChange}
                    className="w-full mt-1 border border-slate-300 rounded-lg p-2.5 focus:ring focus:ring-blue-300"
                  >
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Amputado
                  </label>
                  <select
                    name="missingLimb"
                    value={form.missingLimb}
                    onChange={onChange}
                    className="w-full mt-1 border border-slate-300 rounded-lg p-2.5 focus:ring focus:ring-blue-300"
                  >
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              {/* ESTADO */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Estado
                </label>
                <select
                  name="state"
                  value={form.state}
                  onChange={onChange}
                  className="w-full mt-1 border border-slate-300 rounded-lg p-2.5 focus:ring focus:ring-blue-300"
                >
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>
                      {cfg.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* CAMBIAR FOTO */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Nueva foto
                </label>
                <input
                  type="file"
                  onChange={handleFilePreview}
                  className="w-full mt-1 border border-slate-300 bg-slate-50 rounded-lg p-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-600 file:text-white cursor-pointer"
                />
              </div>

              {/* BOTÓN SUBMIT */}
              <button
                type="submit"
                disabled={updating}
                className={`w-full py-3 rounded-lg text-white font-semibold transition ${
                  updating
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {updating ? "Guardando..." : "Guardar cambios"}
              </button>
            </form>
          )
        )}
      </div>
    </div>
  );
}
