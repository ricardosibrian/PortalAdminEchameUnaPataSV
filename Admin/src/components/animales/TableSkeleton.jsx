import React from "react";
export default function TableSkeleton({ rows = 6 }) {
  const skeleton = [...Array(rows)];

  return skeleton.map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="td">
        <div className="h-7 w-24 bg-gray-200 rounded"></div>
      </td>
      <td className="td">
        <div className="h-7 w-20 bg-gray-200 rounded"></div>
      </td>
      <td className="td">
        <div className="h-7 w-28 bg-gray-200 rounded"></div>
      </td>
      <td className="td">
        <div className="h-7 w-20 bg-gray-200 rounded"></div>
      </td>
      <td className="td">
        <div className="h-7 w-24 bg-gray-300 rounded-full"></div>
      </td>
      <td className="td">
        <div className="h-7 w-16 bg-gray-200 rounded"></div>
      </td>
    </tr>
  ));
}
