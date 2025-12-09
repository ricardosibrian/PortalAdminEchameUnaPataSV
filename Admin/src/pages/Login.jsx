
import React,{ useState, useEffect } from "react"
import { Eye, EyeOff, Lock, Mail, AlertCircle, X } from "lucide-react"
import "../styles/Login.css"
import { API_BASE_URL } from "../config"
import { clearAuthData } from "../utils/apiClient"

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // Clear auth data when login page mounts
  useEffect(() => {
    clearAuthData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const status = response.status;
      if (status === 200) {
            const data = await response.json();
            localStorage.setItem("TOKEN_APP", data.data.token);
            window.location.href = "/";
      } else {
        const errorData = await response.json().catch(() => ({ message: "Error al iniciar sesión" }));
        setErrorMessage(errorData.message || "Credenciales incorrectas. Por favor, intenta nuevamente.");
      }
    } catch (error) {
      setErrorMessage("Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.");
      console.error("Error al iniciar sesión:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Auto-ocultar notificación después de 5 segundos
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  return (
    <div className="login-container">
      {/* Notificación de Error */}
      {errorMessage && (
        <div className="error-notification">
          <div className="error-notification-content">
            <AlertCircle className="error-icon" />
            <span className="error-message">Credenciales incorrectas. Por favor, intenta nuevamente.</span>
            <button 
              onClick={() => setErrorMessage("")} 
              className="error-close-btn"
              aria-label="Cerrar notificación"
            >
              <X className="error-close-icon" />
            </button>
          </div>
        </div>
      )}

      <div className="login-wrapper">
        {/* Logo y Título */}
        <div className="login-header">
          <div className="login-logo">
            <span>🐾</span>
          </div>
          <h1 className="login-title">Admin Portal</h1>
          <p className="login-subtitle">Inicia sesión en tu cuenta</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Input Email */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Correo Electrónico
            </label>
            <div className="form-input-wrapper">
              <Mail className="form-icon" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@ejemplo.com"
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Input Contraseña */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <div className="form-input-wrapper">
              <Lock className="form-icon" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="toggle-password">
                {showPassword ? <EyeOff className="icon-sm" /> : <Eye className="icon-sm" />}
              </button>
            </div>
          </div>

          {/* Botón Submit */}
          <button type="submit" disabled={isLoading} className={`submit-button ${isLoading ? "loading" : ""}`}>
            {isLoading ? (
              <>
                <span className="spinner">⏳</span>
                Iniciando sesión...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
