import React from "react";

export default function TableSkeleton({ rows = 6 }) {
  return (
    <>
      {[...Array(rows)].map((_, i) => (
        <tr key={i} className="animate-pulse">
          {/* # */}
          <td className="td">
            <div className="h-8 w-6 bg-gray-300 rounded"></div>
          </td>

          {/* Solicitante */}
          <td className="td">
            <div className="h-8 w-32 bg-gray-300 rounded"></div>
          </td>

          {/* Correo */}
          <td className="td">
            <div className="h-8 w-40 bg-gray-300 rounded"></div>
          </td>

          {/* Dirección-Ciudad */}
          <td className="td">
            <div className="h-8 w-48 bg-gray-300 rounded"></div>
          </td>

          {/* Fecha */}
          <td className="td">
            <div className="h-8 w-28 bg-gray-300 rounded"></div>
          </td>

          {/* Estado */}
          <td className="td">
            <div className="h-8 w-20 bg-gray-300 rounded-full"></div>
          </td>

          {/* Opciones */}
          <td className="td">
            <div className="h-6 w-12 bg-gray-300 rounded"></div>
          </td>
        </tr>
      ))}
    </>
  );
}
