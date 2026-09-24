const FAVORITES_PREFIX = 'playdb_favorites_';

const getUserIdentifier = (usuario) => {
  if (!usuario) return null;
  return usuario.id || usuario._id || usuario.email || null;
};

const getStorageKey = (usuario) => {
  const identifier = getUserIdentifier(usuario);
  return identifier ? `${FAVORITES_PREFIX}${identifier}` : null;
};

const readFavorites = (usuario) => {
  const storageKey = getStorageKey(usuario);
  if (!storageKey) return [];

  try {
    const storedFavorites = localStorage.getItem(storageKey);
    const favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
    return Array.isArray(favorites) ? favorites : [];
  } catch (error) {
    console.warn('No se pudieron leer los favoritos:', error.message);
    return [];
  }
};

const writeFavorites = (usuario, favorites) => {
  const storageKey = getStorageKey(usuario);
  if (!storageKey) return;
  localStorage.setItem(storageKey, JSON.stringify(favorites));
};

export const FavoritesHelper = {
  obtenerTodos: (usuario) => readFavorites(usuario),

  contiene: (usuario, programaId) => readFavorites(usuario)
    .some((programa) => programa._id === programaId),

  alternar: (usuario, programa) => {
    const favorites = readFavorites(usuario);
    const alreadySaved = favorites.some((favorite) => favorite._id === programa._id);
    const updatedFavorites = alreadySaved
      ? favorites.filter((favorite) => favorite._id !== programa._id)
      : [programa, ...favorites];

    writeFavorites(usuario, updatedFavorites);
    return !alreadySaved;
  }
};
