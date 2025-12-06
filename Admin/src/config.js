// src/config.js

export const API_BASE_URL = import.meta.env.VITE_BASE_API_URL;

// NOTA: Este token eventualmente debería venir de un contexto de autenticación o localStorage
export const AUTH_TOKEN = localStorage.getItem("TOKEN_APP");