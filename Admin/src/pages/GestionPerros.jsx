import React,{ useState, useEffect, useRef } from "react";
import FormNuevoPerro from "../components/FormNuevoPerro";
import CustomSelect from "../components/CustomSelect";
import { API_BASE_URL, AUTH_TOKEN } from "../config";
import "../styles/TablaPerros.css";

const DEFAULT_DOG_IMAGE = "https://res.cloudinary.com/dhhftvc5t/image/upload/v1/echameunapata/animals/3232/l87pa1tuorzoiptr43ow?_a=DAGCg+ARZAA0";

const STATUS_CONFIG = {
  AVAILABLE:       { label: "Disponible",        bg: "#dcfce7", color: "#15803d" },
  UNDER_ADOPTION:  { label: "En Adopcion",        bg: "#dcfce7", color: "#175e31ff" },
  UNDER_TREATMENT: { label: "En tratamiento",    bg: "#fee2e2", color: "#b91c1c" },
  ADOPTED:         { label: "Adoptado",          bg: "#f3f4f6", color: "#475569" },
  SPONSORED:       { label: "Apadrinado",        bg: "#dbeafe", color: "#1d4ed8" },
  FOSTER_HOME:     { label: "Refugio Temporal",  bg: "#ccfbf1", color: "#0f766e" },
  DECEASED:        { label: "Fallecido",         bg: "#111827", color: "#f9fafb" }
};

const SEX_MAP = {
  MALE: "Macho",
  FEMALE: "Hembra"
};

const SPECIES_MAP = {
  DOG: "Perro",
  CAT: "Gato"
};

const Loader = ({ text, variant = "full" }) => {
  const isInline = variant === "inline";
  return (
    <div
      style={
        isInline
          ? { display: "inline-flex", alignItems: "center", gap: "8px", color: "#666", fontSize: "0.95rem" }
          : { textAlign: "center", padding: "40px", color: "#666", fontSize: "1.2rem", backgroundColor: "#f9f9f9", borderRadius: "8px", marginTop: "20px", display: "flex", alignItems: "center", justifyContent: "center" }
      }
    >
      <svg
        style={{ width: isInline ? "18px" : "24px", height: isInline ? "18px" : "24px", animation: "spin 1s linear infinite" }}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      >
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </svg>
      {text ? <span style={{ marginLeft: isInline ? 0 : "10px" }}>{text}</span> : null}
    </div>
  );
};

export default function GestionPerros() {
  const [showForm, setShowForm] = useState(false);
  const [perros, setPerros] = useState([]);
  const [loading, setLoading] = useState(true);

  const [actionSuccess, setActionSuccess] = useState(null);
  const isMountedRef = useRef(true);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  const [editForm, setEditForm] = useState({
    initialDescription: "",
    sterilized: "false",
    missingLimb: "false",
    state: "UNDER_ADOPTION",
    photoFile: null
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const fetchPerros = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/animal/find-all?page=0&size=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTH_TOKEN}`
        }
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const result = await response.json();
      
      const datosFormateados = result.data.map(item => ({
        id: item.id,
        nombre: item.name,
        animal: SPECIES_MAP[item.species] || item.species, 
        raza: item.race,
        genero: SEX_MAP[item.sex] || item.sex,
        
        rawState: item.state 
      }));

      if (isMountedRef.current) {
        setPerros(datosFormateados);
      }

    } catch (error) {
      console.error("Error al obtener perros:", error);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerros();
  }, []);

  const handleVerDetalle = async (id) => {
    setDetailModalOpen(true);
    setLoadingDetail(true);
    setDetailData(null);
    
    setEditForm({
      initialDescription: "",
      sterilized: "false",
      missingLimb: "false",
      state: "UNDER_ADOPTION",
      photoFile: null
    });

    try {
      const response = await fetch(`${API_BASE_URL}/animal/find-by-id/${id}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
      });

      if (!response.ok) throw new Error("Error al cargar detalle");
      
      const result = await response.json();
      const data = result.data;
      
      setDetailData(data);

      setEditForm({
        initialDescription: data.initialDescription || "",
        sterilized: data.sterilized ? "true" : "false",
        missingLimb: data.missingLimb ? "true" : "false",
        state: data.state || "UNDER_ADOPTION", 
        photoFile: null
      });

    } catch (error) {
      console.error("Error al ver detalle:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetalle = () => {
    setDetailModalOpen(false);
    setDetailData(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEditForm(prev => ({ ...prev, photoFile: e.target.files[0] }));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!detailData?.id) return;

    setUpdating(true);
    const formData = new FormData();
    
    formData.append("initialDescription", editForm.initialDescription);
    formData.append("sterilized", editForm.sterilized);
    formData.append("missingLimb", editForm.missingLimb);
    formData.append("state", editForm.state);
    
    if (editForm.photoFile) {
      formData.append("photo", editForm.photoFile);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/animal/update/${detailData.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` },
        body: formData
      });

      if (!response.ok) throw new Error("Error al actualizar");

      setDetailModalOpen(false);
      setActionSuccess("Información actualizada correctamente.");
      fetchPerros();
      
    } catch (error) {
      console.error("Error update:", error);
      alert("No se pudo actualizar la información.");
    } finally {
      setUpdating(false);
      setTimeout(() => setActionSuccess(null), 5000);
    }
  };

  const handleNuevo = () => setShowForm(true);
  const handleClose = () => setShowForm(false);

  const handleSubmit = async (datosFormulario) => {
    const today = new Date().toISOString().split('T')[0];
    const formData = new FormData();

    formData.append("name", datosFormulario.nombre);
    formData.append("species", datosFormulario.especie); 
    formData.append("sex", datosFormulario.genero);
    formData.append("race", datosFormulario.raza);
    formData.append("birthDate", today);   
    formData.append("rescueDate", today);  
    formData.append("rescueLocation", datosFormulario.ubicacion);
    formData.append("initialDescription", datosFormulario.descripcion);
    formData.append("missingLimb", datosFormulario.amputado);
    formData.append("observations", datosFormulario.observaciones);

    if (datosFormulario.foto) {
      formData.append("photo", datosFormulario.foto);
    } else {
      try {
        const response = await fetch(DEFAULT_DOG_IMAGE);
        const blob = await response.blob();
        const defaultFile = new File([blob], "default_image.jpg", { type: "image/jpeg" });
        formData.append("photo", defaultFile);
      } catch (imgError) {
        console.error("Error img default:", imgError);
      }
    }

    const response = await fetch(`${API_BASE_URL}/animal/register`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` },
      body: formData
    });

    if (!response.ok) throw new Error(`Error: ${response.status}`);

    setShowForm(false);
    setActionSuccess("Animal registrado correctamente.");
    setTimeout(() => { if (isMountedRef.current) setActionSuccess(null); }, 5000);
    await fetchPerros();
  };

  const totalPages = Math.ceil(perros.length / rowsPerPage);
  const startIndex = page * rowsPerPage;
  const visibleRows = perros.slice(startIndex, startIndex + rowsPerPage);

  const handleNext = () => { if (page < totalPages - 1) setPage(page + 1); };
  const handlePrev = () => { if (page > 0) setPage(page - 1); };
  const handleRowsChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(0);
  };

  return (
    <div>
      <h2 className="page-title">Gestión de Animales</h2>

      <div className="acciones-tabla" style={{ marginBottom: "20px" }}>
        <button 
          type="button" 
          onClick={handleNuevo}
          className="btn-nuevo"
          style={{
            background: "none", border: "none", color: "#16a34a", fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", padding: 0, marginRight: "20px"
          }}
        >
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          NUEVO REGISTRO
        </button>
      </div>

      {actionSuccess && (
        <div style={{ marginTop: "12px", marginBottom: "20px", padding: "16px", backgroundColor: "#dcfce7", color: "#166534", borderRadius: "8px", fontSize: "0.95rem" }}>
          {actionSuccess}
        </div>
      )}

      <div className="tabla-perros-container">
        <div className="tabla-wrapper">
          <table className="tabla-perros">
            <thead>
              <tr>
                <th className="th">Nombre</th>
                <th className="th">Animal</th>
                <th className="th">Raza</th>
                <th className="th">Género</th>
                <th className="th">Estado</th>
                <th className="th">Opciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="td" colSpan={6} style={{ textAlign: "center" }}>
                    <Loader variant="inline" text="Cargando datos..." />
                  </td>
                </tr>
              ) : (
                visibleRows.map((item) => {
                  const statusConfig = STATUS_CONFIG[item.rawState] || STATUS_CONFIG.UNDER_ADOPTION;
                  return (
                    <tr key={item.id}>
                      <td className="td">{item.nombre}</td>
                      <td className="td">{item.animal}</td>
                      <td className="td">{item.raza}</td>
                      <td className="td">{item.genero}</td>
                      <td className="td">
                        <span style={{ 
                          padding: "4px 12px", 
                          borderRadius: "999px",
                          backgroundColor: statusConfig.bg, 
                          color: statusConfig.color, 
                          fontSize: "0.85rem", 
                          fontWeight: 600,
                          display: "inline-block"
                        }}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="td">
                        <button type="button" onClick={() => handleVerDetalle(item.id)} className="denuncia-card-link">VER / EDITAR</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        <div className="paginacion">
          <div className="paginacion-botones">
            <button onClick={handlePrev} disabled={page === 0 || loading} className="paginacion-btn">Anterior</button>
            <button onClick={handleNext} disabled={page === totalPages - 1 || loading} className="paginacion-btn">Siguiente</button>
          </div>
          <span style={{ color: "#555" }}>Página <strong>{page + 1}</strong> de {totalPages || 1}</span>
          <div className="rows-control">
            <span>Rows per page:</span>
            <CustomSelect value={rowsPerPage} onChange={handleRowsChange} options={[{ value: 5, label: "5" }, { value: 10, label: "10" }, { value: 20, label: "20" }]} />
          </div>
        </div>
      </div>

      {showForm && (
        <FormNuevoPerro onClose={handleClose} onSubmit={handleSubmit} />
      )}

      {detailModalOpen && (
        <div 
          onClick={handleCloseDetalle} 
          style={{ 
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", 
            backgroundColor: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", 
            justifyContent: "center", padding: "24px", zIndex: 1000, backdropFilter: "blur(2px)" 
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              width: "100%", maxWidth: "540px", backgroundColor: "#fff", 
              borderRadius: "16px", padding: "28px", 
              boxShadow: "0 24px 60px rgba(15,23,42,0.18)", position: "relative", 
              maxHeight: "90vh", overflowY: "auto", minHeight: "150px"
            }}
          >
            <button 
              type="button" 
              onClick={handleCloseDetalle} 
              style={{ 
                position: "absolute", right: "16px", top: "16px", background: "none", 
                border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#64748b" 
              }}
            >
              ×
            </button>
            
            <h3 style={{ marginTop: 0, marginBottom: "18px", color: "#111827" }}>
              Detalle y Edición
            </h3>

            {loadingDetail ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 0' }}>
                <Loader variant="inline" text="Cargando información..." />
              </div>
            ) : detailData ? (
              <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                
                <div style={{ display: "flex", alignItems: "center", gap: "15px", backgroundColor: "#f8fafc", padding: "15px", borderRadius: "12px" }}>
                  {detailData.photo ? (
                    <img 
                      src={detailData.photo} 
                      alt="Animal" 
                      style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", border: "2px solid #fff", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }} 
                    /> 
                  ) : (
                    <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#cbd5e1" }}></div>
                  )}
                  <div>
                    <span style={{ display: "block", fontSize: "0.85rem", color: "#64748b" }}>Nombre:</span>
                    <span style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#334155" }}>{detailData.name}</span>
                    <span style={{ display: "block", fontSize: "0.9rem", color: "#1d4ed8", fontWeight: 500 }}>{detailData.race}</span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div>
                    <label style={{ fontSize: "0.85rem", color: "#64748b", display: "block" }}>Edad</label>
                    <span style={{ fontWeight: 600, color: "#334155" }}>
                      {detailData.age !== null ? `${detailData.age} años` : "Desconocida"}
                    </span>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.85rem", color: "#64748b", display: "block" }}>Estado Actual</label>
                    <span style={{ fontWeight: 600, color: "#334155" }}>
                       {(STATUS_CONFIG[detailData.state] || STATUS_CONFIG.UNDER_ADOPTION).label}
                    </span>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid #e2e8f0", margin: "5px 0" }}></div>

                <div style={{ display: "flex", flexDirection: "column", gap: "15px", color: "#1f2937", fontSize: "0.95rem" }}>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{fontWeight: 600}}>Cambiar Estado:</label>
                    <select
                      name="state"
                      value={editForm.state}
                      onChange={handleEditChange}
                      style={{ padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", width: "100%", backgroundColor: "#fff" }}
                    >
                      {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <label style={{fontWeight: 600}}>Esterilizado:</label>
                    <select 
                      name="sterilized" 
                      value={editForm.sterilized} 
                      onChange={handleEditChange}
                      style={{ padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", width: "120px" }}
                    >
                      <option value="true">Sí</option>
                      <option value="false">No</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <label style={{fontWeight: 600}}>Amputado:</label>
                    <select 
                      name="missingLimb" 
                      value={editForm.missingLimb} 
                      onChange={handleEditChange}
                      style={{ padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", width: "120px" }}
                    >
                      <option value="true">Sí</option>
                      <option value="false">No</option>
                    </select>
                  </div>

                  <div>
                    <span style={{fontWeight: 600}}>Ubicación rescate:</span> {detailData.rescueLocation || "No registrada"}
                  </div>

                  <div>
                    <label style={{ fontSize: "0.9rem", color: "#374151", display: "block", marginBottom: "5px", fontWeight: 600 }}>
                      Descripción inicial:
                    </label>
                    <textarea
                      name="initialDescription"
                      value={editForm.initialDescription}
                      onChange={handleEditChange}
                      rows={3}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box", fontFamily: "inherit" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.9rem", color: "#374151", display: "block", marginBottom: "5px", fontWeight: 600 }}>
                      Actualizar Foto (Opcional):
                    </label>
                    <input 
                      type="file" 
                      accept=".jpg, .jpeg, .png" 
                      onChange={handleEditFileChange}
                      style={{ fontSize: "0.9rem" }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: "10px" }}>
                  <button 
                    type="submit" 
                    disabled={updating}
                    style={{ 
                      width: "100%", padding: "12px", 
                      backgroundColor: "#34090b",
                      color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", 
                      cursor: updating ? "wait" : "pointer", opacity: updating ? 0.7 : 1
                    }}
                  >
                    {updating ? "Actualizando..." : "Guardar Cambios"}
                  </button>
                </div>

              </form>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}