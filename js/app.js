import { apiFetch } from './api.js';
import { initAdminModule } from './admin.js';
import { createProgramaCard } from './components/programaCard.js';
import { StorageHelper } from './helpers/storage.js';
import { AuthService } from './services/auth.service.js';
import { CategoriaService } from './services/categoria.service.js';

const catalogGrid = document.getElementById('catalogGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const categoryFilter = document.getElementById('categoryFilter');
const catalogCount = document.getElementById('catalogCount');

let searchTimeout;

// Cargar programas desde el Backend
const loadProgramas = async (params = {}) => {
  try {
    if (catalogGrid) {
      catalogGrid.innerHTML = '<p class="loading-text">Cargando programas...</p>';
    }
    
    // Construimos la Query String
    const query = new URLSearchParams(params).toString();
    const endpoint = `/programas${query ? `?${query}` : ''}`;

    const response = await apiFetch(endpoint);
    const programas = response.data || [];

    if (catalogCount) {
      catalogCount.textContent = `${programas.length} ${programas.length === 1 ? 'título' : 'títulos'}`;
    }

    if (!catalogGrid) return;
    catalogGrid.innerHTML = '';

    if (programas.length === 0) {
      catalogGrid.innerHTML = '<p class="no-results">No se encontraron programas.</p>';
      return;
    }

    programas.forEach((prog) => {
      const card = createProgramaCard(prog);
      catalogGrid.appendChild(card);
    });
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

    loadProgramas(filters);
  });
}

if (categoryFilter) {
  categoryFilter.addEventListener('change', () => {
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

// Carga Inicial del DOM
document.addEventListener('DOMContentLoaded', () => {
  setupAuthUI();
  loadCategories();
  loadProgramas();
  initAdminModule();

  if (catalogGrid) {
    catalogGrid.addEventListener('click', (event) => {
      const detailsButton = event.target.closest('.details-btn');
      if (detailsButton?.dataset.id) {
        window.location.href = `programa-detalle.html?id=${encodeURIComponent(detailsButton.dataset.id)}`;
      }
    });
  }
});