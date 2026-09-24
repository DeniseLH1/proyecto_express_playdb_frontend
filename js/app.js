import { apiFetch } from './api.js';
import { initAdminModule } from './admin.js';
import { createProgramaCard } from './components/programaCard.js';
import { StorageHelper } from './helpers/storage.js';
import { AuthService } from './services/auth.service.js';
import { CategoriaService } from './services/categoria.service.js';
import { FavoritesHelper } from './helpers/favorites.js';
import { CalificacionService } from './services/calificacion.service.js';

const catalogGrid = document.getElementById('catalogGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const categoryFilter = document.getElementById('categoryFilter');
const favoritesFilter = document.getElementById('favoritesFilter');
const catalogCount = document.getElementById('catalogCount');
const welcomeBanner = document.getElementById('welcomeBanner');
const topMoviesSection = document.getElementById('topMoviesSection');
const topMoviesGrid = document.getElementById('topMoviesGrid');

let searchTimeout;
let catalogPrograms = [];

const getCurrentUser = () => StorageHelper.obtenerUsuario();

const renderWelcomeBanner = () => {
  if (!welcomeBanner) return;

  const user = getCurrentUser();
  if (!user) {
    welcomeBanner.innerHTML = `
      <div>
        <p class="section-kicker">Explora sin límites</p>
        <h2>¡Bienvenido a PlayDB!</h2>
        <p>Explora nuestro catálogo de series, películas y anime. Inicia sesión para guardar tus favoritos.</p>
      </div>
      <button type="button" class="btn btn-primary" id="welcomeLoginBtn">Iniciar sesión</button>
    `;
    welcomeBanner.querySelector('#welcomeLoginBtn')?.addEventListener('click', () => {
      window.location.href = 'login.html';
    });
    return;
  }

  const userName = user.nombre || user.email || 'amigo';
  welcomeBanner.innerHTML = `
    <div>
      <p class="section-kicker">Tu espacio personal</p>
      <h2>¡Hola de nuevo, ${userName}!</h2>
      <p>¿Qué quieres ver hoy? Revisa tus favoritos o continúa explorando el catálogo.</p>
    </div>
    <span class="welcome-mark" aria-hidden="true">✦</span>
  `;
};

const loadTopMovies = async () => {
  if (!topMoviesSection || !topMoviesGrid) return;

  if (getCurrentUser()) {
    topMoviesSection.classList.add('hidden');
    return;
  }

  try {
    const response = await CalificacionService.obtenerTop();
    const peliculas = response.data || [];
    topMoviesSection.classList.remove('hidden');
    topMoviesGrid.innerHTML = '';

    if (!peliculas.length) {
      topMoviesGrid.innerHTML = '<p class="empty-favorites">Aún no hay suficientes calificaciones para crear el top.</p>';
      return;
    }

    peliculas.forEach((pelicula) => {
      topMoviesGrid.appendChild(createProgramaCard(pelicula));
    });
  } catch (error) {
    topMoviesSection.classList.add('hidden');
    console.warn('No se pudo cargar el top de películas:', error.message);
  }
};

const syncFavoriteButtons = () => {
  const user = getCurrentUser();
  if (!user) return;

  document.querySelectorAll('.favorite-btn').forEach((button) => {
    const isFavorite = FavoritesHelper.contiene(user, button.dataset.favoriteId);
    button.classList.toggle('is-favorite', isFavorite);
    button.setAttribute('aria-pressed', String(isFavorite));
    button.textContent = isFavorite ? '♥ Guardado' : '♡ Guardar';
  });
};

// Cargar programas desde el Backend
const loadProgramas = async (params = {}) => {
  try {
    if (catalogGrid) {
      catalogGrid.innerHTML = '<p class="loading-text">Cargando programas...</p>';
    }
    
    // Construimos la Query String
    const query = new URLSearchParams(params).toString();
    const endpoint = `/programas${query ? `?${query}` : ''}`;

    const response = params.soloFavoritos ? null : await apiFetch(endpoint);
    const user = getCurrentUser();
    let programas = params.soloFavoritos ? FavoritesHelper.obtenerTodos(user) : (response.data || []);

    if (params.soloFavoritos && params.busquedaGeneral) {
      const searchTerm = params.busquedaGeneral.toLowerCase();
      programas = programas.filter((programa) => [programa.titulo, programa.categoria, ...(programa.actores || [])]
        .some((field) => String(field || '').toLowerCase().includes(searchTerm)));
    }
    if (params.soloFavoritos && params.categoria) {
      programas = programas.filter((programa) => programa.categoria === params.categoria);
    }
    catalogPrograms = programas;

    if (catalogCount) {
      catalogCount.textContent = `${programas.length} ${programas.length === 1 ? 'título' : 'títulos'}`;
    }

    if (!catalogGrid) return;
    catalogGrid.innerHTML = '';

    if (programas.length === 0) {
      catalogGrid.innerHTML = params.soloFavoritos
        ? '<p class="empty-favorites">Aún no tienes programas guardados.</p>'
        : '<p class="no-results">No se encontraron programas.</p>';
      return;
    }

    programas.forEach((prog) => {
      const card = createProgramaCard(prog, {
        showFavorite: Boolean(getCurrentUser()),
        isFavorite: FavoritesHelper.contiene(getCurrentUser(), prog._id)
      });
      catalogGrid.appendChild(card);
    });
    syncFavoriteButtons();
  } catch (error) {
    if (catalogGrid) {
      catalogGrid.innerHTML = `<p class="error-text">Error al cargar programas: ${error.message}</p>`;
    }
  }
};

const loadCategories = async () => {
  if (!categoryFilter) return;

  try {
    const response = await CategoriaService.obtenerTodas();
    const categorias = response.data || [];
    categorias.forEach((categoria) => {
      const option = document.createElement('option');
      option.value = categoria.nombre;
      option.textContent = categoria.nombre;
      categoryFilter.appendChild(option);
    });
  } catch (error) {
    console.warn('No se pudieron cargar las categorías:', error.message);
  }
};

// Eventos de Filtro y Búsqueda
if (searchBtn) {
  searchBtn.addEventListener('click', () => {
    const busquedaGeneral = searchInput ? searchInput.value.trim() : '';
    const categoria = categoryFilter ? categoryFilter.value : '';
    
    const filters = {};
    if (busquedaGeneral) filters.busquedaGeneral = busquedaGeneral;
    if (categoria) filters.categoria = categoria;
    if (favoritesFilter?.value === 'favorites') filters.soloFavoritos = true;

    loadProgramas(filters);
  });
}

if (categoryFilter) {
  categoryFilter.addEventListener('change', () => {
    if (searchBtn) searchBtn.click();
  });
}

if (favoritesFilter) {
  favoritesFilter.addEventListener('change', () => {
    if (searchBtn) searchBtn.click();
  });
}

if (searchInput) {
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      if (searchBtn) searchBtn.click();
    }, 300);
  });
}

// Control de UI de Autenticación y Botón Admin
const setupAuthUI = () => {
  const loginBtn = document.getElementById('loginModalBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const userGreeting = document.getElementById('userGreeting');
  const adminBtn = document.getElementById('adminBtn');
  const user = StorageHelper.obtenerUsuario();

  renderWelcomeBanner();

  if (user) {
    // Si el usuario está logueado
    if (loginBtn) loginBtn.classList.add('hidden');
    if (logoutBtn) logoutBtn.classList.remove('hidden');
    
    if (userGreeting) {
      userGreeting.textContent = `Hola, ${user.nombre || user.email}`;
      userGreeting.classList.remove('hidden');
    }

    // Si el usuario es administrador, mostramos el botón al Panel Admin
    if (adminBtn) {
      if (StorageHelper.esAdmin()) {
        adminBtn.classList.remove('hidden');
      } else {
        adminBtn.classList.add('hidden');
      }
    }
    if (favoritesFilter) favoritesFilter.disabled = false;
  } else {
    // Si no hay sesión activa
    if (loginBtn) {
      loginBtn.classList.remove('hidden');
      loginBtn.addEventListener('click', () => {
        window.location.href = 'login.html';
      });
    }
    if (logoutBtn) logoutBtn.classList.add('hidden');
    if (userGreeting) userGreeting.classList.add('hidden');
    if (adminBtn) adminBtn.classList.add('hidden');
    if (favoritesFilter) {
      favoritesFilter.value = '';
      favoritesFilter.disabled = true;
    }
  }

  // Evento Cierre de Sesión
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await AuthService.logout();
      } catch (e) {
        console.warn('Error al cerrar sesión:', e.message);
      }
      StorageHelper.eliminarUsuario();
      window.location.reload();
    });
  }
};

const handleFavoriteClick = (event) => {
  const favoriteButton = event.target.closest('.favorite-btn');
  if (!favoriteButton) return;

  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  const programaId = favoriteButton.dataset.favoriteId;
  const programa = catalogPrograms.find((item) => item._id === programaId)
    || FavoritesHelper.obtenerTodos(user).find((item) => item._id === programaId);
  if (!programa) return;

  FavoritesHelper.alternar(user, programa);
  if (favoritesFilter?.value === 'favorites') {
    if (searchBtn) searchBtn.click();
  } else {
    syncFavoriteButtons();
  }
};

// Carga Inicial del DOM
document.addEventListener('DOMContentLoaded', () => {
  setupAuthUI();
  loadCategories();
  loadProgramas();
  loadTopMovies();
  initAdminModule();

  if (catalogGrid) {
    catalogGrid.addEventListener('click', (event) => {
      const detailsButton = event.target.closest('.details-btn');
      if (detailsButton?.dataset.id) {
        window.location.href = `programa-detalle.html?id=${encodeURIComponent(detailsButton.dataset.id)}`;
      }
    });
  }

  document.addEventListener('click', handleFavoriteClick);
});