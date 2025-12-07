import React from "react";

export const TableSkeleton = ({ rows = 6 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {/* Checkbox */}
          <td className="td">
            <div className="w-4 h-7 bg-gray-300 rounded"></div>
          </td>
          

          {/* Padrino */}
          <td className="td">
            <div className="h-7 w-32 bg-gray-300 rounded"></div>
          </td>

          {/* Correo */}
          <td className="td">
            <div className="h-7 w-40 bg-gray-300 rounded"></div>
          </td>

          {/* Teléfono */}
          <td className="td">
            <div className="h-7 w-24 bg-gray-300 rounded"></div>
          </td>

          {/* Vencimiento */}
          <td className="td">
            <div className="h-7 w-28 bg-gray-300 rounded"></div>
          </td>

          {/* Estado */}
          <td className="td">
            <div className="h-5 w-20 bg-gray-300 rounded-full"></div>
          </td>

          {/* Opciones */}
          <td className="td">
            <div className="h-6 w-14 bg-gray-300 rounded"></div>
          </td>
        </tr>
      ))}
    </>
  );
};
