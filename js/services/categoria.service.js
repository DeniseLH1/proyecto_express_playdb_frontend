import { apiFetch } from '../api.js';

export const CategoriaService = {
  // Obtener todas las categorías
  obtenerTodas: async () => {
    return await apiFetch('/categorias', { method: 'GET' });
  },

  // Crear una nueva categoría 
  crear: async (nombre, descripcion = '') => {
    return await apiFetch('/categorias', {
      method: 'POST',
      body: { nombre, descripcion }
    });
  },

  eliminar: async (id) => {
    return await apiFetch(`/categorias/${id}`, {
      method: 'DELETE'
    });
  }
};