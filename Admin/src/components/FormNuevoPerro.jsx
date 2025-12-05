import { useState } from "react";
import "../styles/FormNuevoPerro.css";

export default function FormNuevoPerro({ onClose, onSubmit }) {
  const [form, setForm] = useState({ 
    nombre: "", 
    especie: "DOG", 
    raza: "", 
    genero: "MALE", 
    ubicacion: "",
    descripcion: "",
    amputado: "false", 
    observaciones: ""
  });
  
  const [foto, setFoto] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    
    const datosCompletos = {
      ...form,
      foto: foto 
    };

    try {
      await onSubmit(datosCompletos);
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al guardar.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Nuevo Registro</h2>

        <form onSubmit={handleSubmit}>
          
          <div className="form-row">
            <div className="form-group form-group-half">
              <label>Nombre</label>
              <input type="text" name="nombre" value={form.nombre} onChange={handleChange} className="form-input" required />
            </div>
            
            <div className="form-group form-group-half">
              <label>Especie</label>
              <select name="especie" value={form.especie} onChange={handleChange} className="form-input">
                <option value="DOG">Perro</option>
                <option value="CAT">Gato</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group form-group-half">
              <label>Raza</label>
              <input type="text" name="raza" value={form.raza} onChange={handleChange} className="form-input" required />
            </div>
            <div className="form-group form-group-half">
              <label>Género</label>
              <select name="genero" value={form.genero} onChange={handleChange} className="form-input">
                <option value="MALE">Macho</option>
                <option value="FEMALE">Hembra</option>
              </select>
            </div>
          </div>

          <div className="form-row">
             <div className="form-group form-group-half">
              <label>¿Tiene algún miembro amputado?</label>
              <select name="amputado" value={form.amputado} onChange={handleChange} className="form-input">
                <option value="false">No</option>
                <option value="true">Sí</option>
              </select>
            </div>
            <div className="form-group form-group-half">
              <label>Ubicación de rescate</label>
              <input type="text" name="ubicacion" value={form.ubicacion} onChange={handleChange} className="form-input" required placeholder="Ej: San Salvador" />
            </div>
          </div>

          <div className="form-group">
            <label>Descripción Inicial</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} className="form-input" rows="2" required placeholder="Ej: Encontrado cerca del parque..." />
          </div>

          <div className="form-group">
            <label>Observaciones</label>
            <textarea name="observaciones" value={form.observaciones} onChange={handleChange} className="form-input" rows="2" placeholder="Ej: Muy amigable con niños." />
          </div>

          <div className="form-group">
            <label>Fotografía (Opcional)</label>
            <div style={{ border: '2px dashed #ccc', padding: '10px', textAlign: 'center', borderRadius: '5px' }}>
                <input 
                  type="file" 
                  accept=".jpg, .jpeg, .png" 
                  onChange={handleFileChange} 
                />
                {foto && <p style={{fontSize: '0.8rem', color: 'green', marginTop: '5px'}}>Archivo: {foto.name}</p>}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel" disabled={cargando}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit" disabled={cargando}>
              {cargando ? "Enviando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}