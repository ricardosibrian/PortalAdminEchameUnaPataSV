import React,{ useState, useEffect } from "react";
import { apiGet } from "../utils/apiClient";
import "../styles/FormNuevoPerro.css";

export default function NuevoPadrino({ onClose, onSubmit }) {
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    monthlyAmount: "",
    startDate: today, 
    notes: "",
    firstNames: "",
    lastNames: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    dui: "",
    animalId: ""
  });

  const [animals, setAnimals] = useState([]);
  const [loadingAnimals, setLoadingAnimals] = useState(false);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const fetchAnimals = async () => {
      setLoadingAnimals(true);
      try {
        const response = await apiGet(`/animal/find-all`);

        if (response.ok) {
          const result = await response.json();
          if (Array.isArray(result.data)) {
            setAnimals(result.data);
          }
        }
      } catch (error) {
        console.error("Error cargando animales:", error);
      } finally {
        setLoadingAnimals(false);
      }
    };
    fetchAnimals();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);

    const payload = {
      monthlyAmount: parseFloat(form.monthlyAmount),
      startDate: form.startDate,
      notes: form.notes,
      sponsor: {
        firstNames: form.firstNames,
        lastNames: form.lastNames,
        email: form.email,
        phoneNumber: form.phoneNumber,
        address: form.address,
        city: form.city,
        dui: form.dui
      },
      animalId: form.animalId
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (error) {
      console.error("Error al guardar padrino:", error);
      alert("Hubo un error al registrar el padrino: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Nuevo Padrino</h2>
        <form onSubmit={handleSubmit}>
          
          <h4 style={{ margin: "10px 0", color: "#666", borderBottom: "1px solid #eee", paddingBottom: "5px" }}>Datos del Padrino</h4>
          
          <div className="form-row">
            <div className="form-group form-group-half">
              <label>Nombres</label>
              <input type="text" name="firstNames" value={form.firstNames} onChange={handleChange} className="form-input" required />
            </div>
            <div className="form-group form-group-half">
              <label>Apellidos</label>
              <input type="text" name="lastNames" value={form.lastNames} onChange={handleChange} className="form-input" required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group form-group-half">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="form-input" required />
            </div>
            <div className="form-group form-group-half">
              <label>Teléfono</label>
              <input type="text" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className="form-input" required />
            </div>
          </div>

          <div className="form-group">
            <label>Dirección (Opcional)</label>
            <input type="text" name="address" value={form.address} onChange={handleChange} className="form-input" />
          </div>

          <div className="form-row">
            <div className="form-group form-group-half">
              <label>Ciudad (Opcional)</label>
              <input type="text" name="city" value={form.city} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group form-group-half">
              <label>DUI (Opcional)</label>
              <input type="text" name="dui" value={form.dui} onChange={handleChange} className="form-input" />
            </div>
          </div>

          <h4 style={{ margin: "15px 0 10px 0", color: "#666", borderBottom: "1px solid #eee", paddingBottom: "5px" }}>Datos del Apadrinamiento</h4>

          <div className="form-group">
            <label>Seleccionar Animal</label>
            <select name="animalId" value={form.animalId} onChange={handleChange} className="form-input" required disabled={loadingAnimals}>
              <option value="">-- Seleccione un perro --</option>
              {animals.map((animal) => (
                <option key={animal.id} value={animal.id}>
                  {`${animal.species} - ${animal.name} - ${animal.race}`}
                </option>
              ))}
            </select>
            {loadingAnimals && <span style={{fontSize: '0.8rem', color: '#666'}}>Cargando lista...</span>}
          </div>

          <div className="form-row">
            <div className="form-group form-group-half">
              <label>Monto Mensual ($)</label>
              <input type="number" step="0.01" name="monthlyAmount" value={form.monthlyAmount} onChange={handleChange} className="form-input" required />
            </div>
            <div className="form-group form-group-half">
              <label>Fecha de Inicio</label>
              <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="form-input" required />
            </div>
          </div>

          <div className="form-group">
            <label>Notas</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className="form-input" rows="2" placeholder="Ej: Padrino para perro adulto" required />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel" disabled={cargando}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit" disabled={cargando}>
              {cargando ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}