import React from "react";
export default function Inicio({ children }) {
  return (
    <div>
      {children}  
      <h1 className="page-title">Inicio</h1>
      <p>Puedes colocar estadísticas, gráficos o un dashboard aquí.</p>
    </div>
  );
}