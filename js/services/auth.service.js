import { apiFetch } from '../api.js';

export const AuthService = {
  login: async (email, password) => {
    return await apiFetch('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
  },

  registro: async (datosUsuario) => {
    return await apiFetch('/auth/registro', {
      method: 'POST',
      body: datosUsuario
    });
  },

  logout: async () => {
    return await apiFetch('/auth/logout', {
      method: 'POST'
    });
  }
};