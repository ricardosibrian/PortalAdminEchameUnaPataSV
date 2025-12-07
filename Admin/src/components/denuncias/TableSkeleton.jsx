import React from "react";

export default function TableSkeleton({ rows = 5 }) {
  const placeholders = Array.from({ length: rows });

  return placeholders.map((_, index) => (
    <tr key={index} className="animate-pulse">

      {/* Checkbox */}
      <td className="td">
        <div className="w-4 h-8 bg-slate-300 rounded"></div>
      </td>

      {/* ID Denuncia */}
      <td className="td">
        <div className="h-8 w-20 bg-slate-300 rounded"></div>
      </td>

      {/* Denunciante */}
      <td className="td">
        <div className="h-8 w-32 bg-slate-300 rounded"></div>
      </td>

      {/* Correo */}
      <td className="td">
        <div className="h-8 w-40 bg-slate-300 rounded"></div>
      </td>

      {/* Teléfono */}
      <td className="td">
        <div className="h-8 w-24 bg-slate-300 rounded"></div>
      </td>

      {/* Fecha */}
      <td className="td">
        <div className="h-8 w-28 bg-slate-300 rounded"></div>
      </td>

      {/* Estado */}
      <td className="td">
        <div className="h-6 w-24 bg-slate-300 rounded-full"></div>
      </td>

      {/* Opciones */}
      <td className="td">
        <div className="h-8 w-16 bg-slate-300 rounded"></div>
      </td>

    </tr>
  ));
}
