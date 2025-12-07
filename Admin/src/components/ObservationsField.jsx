
import React from "react";

export default function ObservationsField({
  title,
  description = "",
  name,
  value,
  onChange,
}) {
  return (
    <div className="w-full mt-6">
      {/* TÍTULO */}
      <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>

      {/* DESCRIPCIÓN */}
      {description && (
        <p className="text-gray-600 text-sm mb-4 leading-relaxed max-w-6xl">
          {description}
        </p>
      )}

      {/* INPUT AREA */}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder="Escribe aquí"
        className="
          w-full
          resize-none
          border-b
          border-gray-300
          focus:outline-none
          focus:border-black
          text-gray-800
        "
        rows={4}
      />
    </div>
  );
}
