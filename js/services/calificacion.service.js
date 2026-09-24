import { apiFetch } from '../api.js';

export const CalificacionService = {
  obtenerPorPrograma: async (programaId) => {
    return apiFetch(`/programas/${programaId}/calificaciones`, { method: 'GET' });
  },

  guardar: async (programaId, datos) => {
    return apiFetch(`/programas/${programaId}/calificaciones`, {
      method: 'POST',
      body: datos
    });
  },

  obtenerTop: async () => {
    return apiFetch('/programas/top-calificados?categoria=pel', { method: 'GET' });
  }
};
