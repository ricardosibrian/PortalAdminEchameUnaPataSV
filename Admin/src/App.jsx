import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

import Inicio from "./pages/Inicio";
import SolicitudesAdopcion from "./pages/SolicitudesAdopcion";
import Denuncias from "./pages/Denuncias";
import SolicitudesApadrinamiento from "./pages/SolicitudesApadrinamiento";
import GestionPerros from "./pages/GestionPerros";
import GestionPadrinos from "./pages/GestionPadrinos";

import "./App.css"; 
import Login from "./pages/Login";

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Verificar si existe el token TOKEN_APP
    const token = localStorage.getItem("TOKEN_APP");
    const hasToken = token && token.trim() !== "";
    
    if (location.pathname === "/login") {
      setIsLoggedIn(false);
    } else {
      setIsLoggedIn(hasToken);
    }
  }, [location.pathname]);

  return (
    <div className="app-root">
      <Sidebar showSidebar={isLoggedIn}/>
      <main className={`content${isLoggedIn ? "" : " content--login"}`}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Inicio />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/solicitudes-adopcion" 
            element={
              <ProtectedRoute>
                <SolicitudesAdopcion />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/denuncias" 
            element={
              <ProtectedRoute>
                <Denuncias />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/solicitudes-apadrinamiento" 
            element={
              <ProtectedRoute>
                <SolicitudesApadrinamiento />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/gestion-perros" 
            element={
              <ProtectedRoute>
                <GestionPerros />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/gestion-padrinos" 
            element={
              <ProtectedRoute>
                <GestionPadrinos />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="*" 
            element={
              <ProtectedRoute>
                <Inicio />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
