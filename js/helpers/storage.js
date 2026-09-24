const USER_KEY = 'playdb_user';

export const StorageHelper = {
  guardarUsuario: (usuario) => {
    localStorage.setItem(USER_KEY, JSON.stringify(usuario));
  },

  obtenerUsuario: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  eliminarUsuario: () => {
    localStorage.removeItem(USER_KEY);
  },

  esAdmin: () => {
    const user = StorageHelper.obtenerUsuario();
    const rol = typeof user?.rol === 'string' ? user.rol.toLowerCase() : '';
    return rol === 'administrador';
  }
};