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
    return user && (user.rol === 'admin' || user.rol === 'administrador');
  }
};