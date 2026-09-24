import { API_BASE_URL, DEFAULT_HEADERS } from './config.js';

/**
 * Función centralizada para realizar peticiones HTTP a la API de PlayDB
 * @param {string} endpoint - Ruta relativa del endpoint (ej. '/programas', '/auth/login')
 * @param {object} options - Opciones de la petición Fetch (method, body, headers, etc.)
 */
export const apiFetch = async (endpoint, options = {}) => {
  const config = {
    ...options,
    headers: {
      ...DEFAULT_HEADERS,
      ...options.headers
    },
    // Permite el envío y recepción automática de cookies firmadas de sesión
    credentials: 'include'
  };

  // Si enviamos un objeto en el body, lo convertimos automáticamente a JSON
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Error en la petición (${response.status})`);
    }

    return data;
  } catch (error) {
    console.error(`Error HTTP en [${options.method || 'GET'}] ${endpoint}:`, error.message);
    throw error;
  }
};