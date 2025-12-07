import React,{ useState } from "react";
// Asegúrate de importar el CSS donde tienes los estilos del modal
// Si los tienes en un archivo global o en FormNuevoPerro.css, impórtalo aquí:
import "../styles/FormNuevoPerro.css"; 

export default function FormRenovarPadrino({ currentAmount, onClose, onSubmit }) {
  const [amount, setAmount] = useState(currentAmount || 0);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || amount <= 0) {
      alert("Por favor ingrese un monto válido.");
      return;
    }

    setCargando(true);
    try {
      // Pasamos el monto al padre para que haga la petición
      await onSubmit(Number(amount)); 
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "400px" }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#111827' }}>Renovar Apadrinamiento</h2>
        
        <p style={{ textAlign: "center", color: "#666", marginBottom: "20px", fontSize: "0.95rem" }}>
          Ingrese el nuevo monto mensual acordado para este periodo.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Monto Mensual ($)</label>
            <input 
              type="number" 
              step="0.01" 
              min="0.01"
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              className="form-input" 
              autoFocus
              required 
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel" disabled={cargando}>
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-submit" 
              disabled={cargando}
              style={{ backgroundColor: "#390b0d" }} // Forzamos azul para distinguir que es renovación
            >
              {cargando ? "Renovando..." : "Confirmar Renovación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}