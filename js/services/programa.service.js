import { apiFetch } from '../api.js';

export const ProgramasService = {
  // Obtener catálogo con o sin filtros de búsqueda
  obtenerTodos: async (filtros = {}) => {
    const queryParams = new URLSearchParams(filtros).toString();
    const endpoint = `/programas${queryParams ? `?${queryParams}` : ''}`;
    return await apiFetch(endpoint, { method: 'GET' });
  },

  // Obtener detalle por ID
  obtenerPorId: async (id) => {
    return await apiFetch(`/programas/${id}`, { method: 'GET' });
  },

  // Crear un programa 
  crear: async (datosPrograma) => {
    return await apiFetch('/programas', {
      method: 'POST',
      body: datosPrograma
    });
  },

  // Actualizar un programa 
  actualizar: async (id, datosActualizados) => {
    return await apiFetch(`/programas/${id}`, {
      method: 'PUT',
      body: datosActualizados
    });
  },

  // Eliminar un programa 
  eliminar: async (id) => {
    return await apiFetch(`/programas/${id}`, {
      method: 'DELETE'
    });
  }
};