import { ProgramasService } from './services/programa.service.js';
import { CategoriaService } from './services/categoria.service.js';
import { StorageHelper } from './helpers/storage.js';
import { DOM } from './helpers/dom.js';
import { createProgramaCard } from './components/programaCard.js';
import { AuthService } from './services/auth.service.js';

export const initAdminModule = async () => {
  const adminTableBody = document.getElementById('adminTableBody');
  if (!adminTableBody) return;

  if (!StorageHelper.esAdmin()) {
    window.location.replace(StorageHelper.obtenerUsuario() ? 'index.html' : 'login.html');
    return;
  }

  const modalPrograma = document.getElementById('modalPrograma');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const nuevoProgramaBtn = document.getElementById('nuevoProgramaBtn');
  const programaForm = document.getElementById('programaForm');
  const categoriaSelect = document.getElementById('formCategoria');
  const modalTitle = document.getElementById('modalTitle');
  const categoriasTableBody = document.getElementById('categoriasTableBody');
  const categoriaForm = document.getElementById('categoriaForm');
  const categoriaAlert = document.getElementById('categoriaAlert');
  const sidebarLinks = document.querySelectorAll('[data-section]');
  const adminCatalogGrid = document.getElementById('adminCatalogGrid');
  const adminSearchInput = document.getElementById('adminSearchInput');
  const adminCategoryFilter = document.getElementById('adminCategoryFilter');
  const adminLogoutBtn = document.getElementById('adminLogoutBtn');
  let adminSearchTimeout;

  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', async () => {
      adminLogoutBtn.disabled = true;
      try {
        await AuthService.logout();
      } catch (error) {
        console.warn('No se pudo cerrar la sesión en el servidor:', error.message);
      } finally {
        StorageHelper.eliminarUsuario();
        window.location.replace('login.html');
      }
    });
  }

  // Cargar categorías en el select del formulario
  const cargarCategoriasForm = async () => {
    try {
      const response = await CategoriaService.obtenerTodas();
      const categorias = response.data || [];
      if (categoriaSelect) {
        categoriaSelect.innerHTML = '<option value="">Selecciona una categoría</option>';
        categorias.forEach((cat) => {
          const option = document.createElement('option');
          option.value = cat.nombre;
          option.textContent = cat.nombre;
          categoriaSelect.appendChild(option);
        });
      }
      if (adminCategoryFilter) {
        const currentFilter = adminCategoryFilter.value;
        adminCategoryFilter.innerHTML = '<option value="">Todas las categorías</option>';
        categorias.forEach((cat) => {
          const option = document.createElement('option');
          option.value = cat.nombre;
          option.textContent = cat.nombre;
          adminCategoryFilter.appendChild(option);
        });
        adminCategoryFilter.value = currentFilter;
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error.message);
    }
  };

  const cargarCatalogoAdmin = async (filtros = {}) => {
    if (!adminCatalogGrid) return;

    try {
      adminCatalogGrid.innerHTML = '<p class="loading-text">Cargando catálogo...</p>';
      const response = await ProgramasService.obtenerTodos(filtros);
      const programas = response.data || [];
      adminCatalogGrid.innerHTML = '';

      if (programas.length === 0) {
        adminCatalogGrid.innerHTML = '<p class="empty-catalog">No se encontraron programas.</p>';
        return;
      }

      programas.forEach((programa) => {
        adminCatalogGrid.appendChild(createProgramaCard(programa));
      });
    } catch (error) {
      adminCatalogGrid.innerHTML = `<p class="error-text">Error al cargar catálogo: ${error.message}</p>`;
    }
  };

  const aplicarFiltrosCatalogo = () => {
    const filtros = {};
    const busqueda = adminSearchInput?.value.trim();
    const categoria = adminCategoryFilter?.value;
    if (busqueda) filtros.busquedaGeneral = busqueda;
    if (categoria) filtros.categoria = categoria;
    cargarCatalogoAdmin(filtros);
  };

  const cargarTablaCategorias = async () => {
    if (!categoriasTableBody) return;

    try {
      categoriasTableBody.innerHTML = '<tr><td colspan="3" class="empty-row">Cargando categorías...</td></tr>';
      const response = await CategoriaService.obtenerTodas();
      const categorias = response.data || [];

      if (categorias.length === 0) {
        categoriasTableBody.innerHTML = '<tr><td colspan="3" class="empty-row">No hay categorías registradas.</td></tr>';
        return;
      }

      categoriasTableBody.innerHTML = '';
      categorias.forEach((categoria) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${categoria.nombre}</strong></td>
          <td>${categoria.descripcion || 'Sin descripción'}</td>
          <td><button type="button" class="btn btn-danger btn-sm btn-delete-category" data-id="${categoria._id}">Eliminar</button></td>
        `;
        categoriasTableBody.appendChild(tr);
      });
    } catch (error) {
      categoriasTableBody.innerHTML = `<tr><td colspan="3" class="empty-row">Error al cargar categorías: ${error.message}</td></tr>`;
    }
  };

  // Renderizar la tabla de administración
  const cargarTablaProgramas = async () => {
    if (!adminTableBody) return;
    try {
      adminTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Cargando programas...</td></tr>';
      const response = await ProgramasService.obtenerTodos();
      const programas = response.data || [];

      if (programas.length === 0) {
        adminTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay programas registrados.</td></tr>';
        return;
      }

      adminTableBody.innerHTML = '';
      programas.forEach((prog) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><img src="${prog.poster || 'https://via.placeholder.com/50'}" class="img-thumb" alt="${prog.titulo}"></td>
          <td><strong>${prog.titulo}</strong></td>
          <td>${prog.categoria || 'N/A'}</td>
          <td>${prog.capitulos || 1}</td>
          <td>
            <button class="btn btn-secondary btn-sm btn-edit" data-id="${prog._id}">Editar</button>
            <button class="btn btn-danger btn-sm btn-delete" data-id="${prog._id}" style="background-color: var(--danger); color: white;">Eliminar</button>
          </td>
        `;
        adminTableBody.appendChild(tr);
      });
    } catch (error) {
      adminTableBody.innerHTML = `<tr><td colspan="5" style="color:var(--danger);">Error al cargar tabla: ${error.message}</td></tr>`;
    }
  };

  // Abrir Modal para Crear
  if (nuevoProgramaBtn) {
    nuevoProgramaBtn.addEventListener('click', async () => {
      programaForm.reset();
      document.getElementById('programaId').value = '';
      if (modalTitle) modalTitle.textContent = 'Nuevo Programa';
      await cargarCategoriasForm();
      modalPrograma.classList.remove('hidden');
    });
  }

  // Cerrar Modal
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      modalPrograma.classList.add('hidden');
    });
  }

  if (modalPrograma) {
    modalPrograma.addEventListener('click', (event) => {
      if (event.target === modalPrograma) modalPrograma.classList.add('hidden');
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modalPrograma) modalPrograma.classList.add('hidden');
  });

  sidebarLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const sectionId = link.dataset.section;
      document.querySelectorAll('.admin-section').forEach((section) => {
        section.classList.toggle('hidden', section.id !== sectionId);
      });
      sidebarLinks.forEach((item) => item.classList.toggle('is-active', item === link));
      if (sectionId === 'categoriasSection') cargarTablaCategorias();
      if (sectionId === 'inicioSection') aplicarFiltrosCatalogo();
    });
  });

  if (adminCategoryFilter) {
    adminCategoryFilter.addEventListener('change', aplicarFiltrosCatalogo);
  }

  if (adminSearchInput) {
    adminSearchInput.addEventListener('input', () => {
      clearTimeout(adminSearchTimeout);
      adminSearchTimeout = setTimeout(aplicarFiltrosCatalogo, 300);
    });
  }

  if (adminCatalogGrid) {
    adminCatalogGrid.addEventListener('click', (event) => {
      const detailsButton = event.target.closest('.details-btn');
      if (detailsButton?.dataset.id) {
        window.location.href = `programa-detalle.html?id=${encodeURIComponent(detailsButton.dataset.id)}`;
      }
    });
  }

  // Guardar (Crear o Actualizar)
  if (programaForm) {
    programaForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = document.getElementById('programaId').value;
      const datosPrograma = {
        titulo: document.getElementById('titulo').value.trim(),
        sinopsis: document.getElementById('sinopsis').value.trim(),
        categoria: document.getElementById('formCategoria').value,
        productora: document.getElementById('productora').value.trim(),
        poster: document.getElementById('poster').value.trim(),
        trailer: document.getElementById('trailer').value.trim(),
        capitulos: parseInt(document.getElementById('capitulos').value, 10) || 1,
        actores: DOM.stringToArray(document.getElementById('actores').value),
        personajes: DOM.stringToArray(document.getElementById('personajes').value)
      };

      try {
        if (id) {
          await ProgramasService.actualizar(id, datosPrograma);
          DOM.showAlert('¡Programa actualizado correctamente!', 'success', 'formAlert');
        } else {
          await ProgramasService.crear(datosPrograma);
          DOM.showAlert('¡Programa creado exitosamente!', 'success', 'formAlert');
        }

        setTimeout(() => {
          modalPrograma.classList.add('hidden');
          cargarTablaProgramas();
        }, 1200);

      } catch (error) {
        DOM.showAlert(error.message, 'danger', 'formAlert');
      }
    });
  }

  // Acciones en la Tabla (Editar y Eliminar)
  if (adminTableBody) {
    adminTableBody.addEventListener('click', async (e) => {
      const actionButton = e.target.closest('[data-id]');
      const id = actionButton?.getAttribute('data-id');
      if (!id) return;

      // EDITAR
      if (actionButton.classList.contains('btn-edit')) {
        try {
          const res = await ProgramasService.obtenerPorId(id);
          const prog = res.data;

          await cargarCategoriasForm();

          document.getElementById('programaId').value = prog._id;
          document.getElementById('titulo').value = prog.titulo || '';
          document.getElementById('sinopsis').value = prog.sinopsis || '';
          document.getElementById('formCategoria').value = prog.categoria || '';
          document.getElementById('productora').value = prog.productora || '';
          document.getElementById('poster').value = prog.poster || '';
          document.getElementById('trailer').value = prog.trailer || '';
          document.getElementById('capitulos').value = prog.capitulos || 1;
          document.getElementById('actores').value = Array.isArray(prog.actores) ? prog.actores.join(', ') : '';
          document.getElementById('personajes').value = Array.isArray(prog.personajes) ? prog.personajes.join(', ') : '';

          if (modalTitle) modalTitle.textContent = 'Editar Programa';
          modalPrograma.classList.remove('hidden');
        } catch (err) {
          alert(`Error al obtener programa: ${err.message}`);
        }
      }

      // ELIMINAR
      if (actionButton.classList.contains('btn-delete')) {
        if (confirm('¿Estás seguro de que deseas eliminar este programa?')) {
          try {
            await ProgramasService.eliminar(id);
            cargarTablaProgramas();
          } catch (err) {
            alert(`Error al eliminar: ${err.message}`);
          }
        }
      }
    });
  }

  if (categoriaForm) {
    categoriaForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const nombreInput = document.getElementById('categoriaNombre');
      const descripcionInput = document.getElementById('categoriaDescripcion');

      try {
        await CategoriaService.crear(nombreInput.value.trim(), descripcionInput.value.trim());
        categoriaForm.reset();
        DOM.showAlert('Categoría creada correctamente.', 'success', 'categoriaAlert');
        await cargarTablaCategorias();
        await cargarCategoriasForm();
      } catch (error) {
        DOM.showAlert(error.message, 'danger', 'categoriaAlert');
      }
    });
  }

  if (categoriasTableBody) {
    categoriasTableBody.addEventListener('click', async (event) => {
      const deleteButton = event.target.closest('.btn-delete-category');
      if (!deleteButton) return;

      if (!confirm('¿Eliminar esta categoría? Los programas existentes conservarán su texto de categoría.')) return;

      try {
        await CategoriaService.eliminar(deleteButton.dataset.id);
        await cargarTablaCategorias();
        await cargarCategoriasForm();
      } catch (error) {
        DOM.showAlert(error.message, 'danger', 'categoriaAlert');
      }
    });
  }

  // Carga Inicial de la Tabla
  cargarTablaProgramas();
  cargarTablaCategorias();
  cargarCategoriasForm();
  cargarCatalogoAdmin();
};

// Auto-inicializar si estamos en admin.html
if (window.location.pathname.includes('admin.html')) {
  document.addEventListener('DOMContentLoaded', () => {
    initAdminModule();
  });
}