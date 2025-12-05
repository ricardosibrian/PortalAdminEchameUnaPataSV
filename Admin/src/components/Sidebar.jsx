import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import "../styles/Sidebar.css"; 
import logo from "../assets/logo.png";

import inicioIcon from "../assets/inicio.png";
import adopcionIcon from "../assets/adopcion.png";
import emergenciasIcon from "../assets/emergencias.png";
import gestionPerrosIcon from "../assets/perro.png";
import gestionPadrinosIcon from "../assets/gestion_padrinos.png";

export default function Sidebar({ showSidebar }) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: "Inicio", to: "/", icon: inicioIcon, exact: true },
    { label: "Solicitud de adopciones", to: "/solicitudes-adopcion", icon: adopcionIcon },
    { label: "Denuncias", to: "/denuncias", icon: emergenciasIcon },
    { label: "Gestión de perros", to: "/gestion-perros", icon: gestionPerrosIcon },
    { label: "Gestión de padrinos", to: "/gestion-padrinos", icon: gestionPadrinosIcon },
  ];

  const handleLogout = () => {
    localStorage.removeItem("TOKEN_APP");
    navigate("/login");
  };

  if (!showSidebar) return null;
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Botón hamburguesa para móvil */}
      <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle menu">
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay para móvil */}
      {isMobileMenuOpen && (
        <div className="sidebar-overlay" onClick={closeMobileMenu}></div>
      )}

      <aside className={`sidebar ${isMobileMenuOpen ? "sidebar-open" : ""}`}>
        <nav>
          <div className="sidebar-logo">
            <img src={logo} alt="Logo" />
          </div>

          <h2 className="brand">Admin Portal</h2>

          <ul>
            {menuItems.map((item, index) => (
              <li key={index}>
                <NavLink
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) => (isActive ? "active menu-link" : "menu-link")}
                  onClick={closeMobileMenu}
                  data-label={item.label}
                  title={item.label}
                  >
                  <img src={item.icon} alt={item.label} className="menu-icon" />
                  <span className="menu-text">{item.label}</span>
                  </NavLink>
              </li>
            ))}
          </ul>

          <div className="logout-section">
            <button onClick={handleLogout} className="logout-button" title="Cerrar Sesión">
              <LogOut className="menu-icon" />
              <span className="menu-text">Cerrar Sesión</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}