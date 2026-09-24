import { ProgramasService } from './services/programa.service.js';
import { CategoriaService } from './services/categoria.service.js';
import { StorageHelper } from './helpers/storage.js';
import { DOM } from './helpers/dom.js';

export const initAdminModule = async () => {
  const modalPrograma = document.getElementById('modalPrograma');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const nuevoProgramaBtn = document.getElementById('nuevoProgramaBtn');
  const programaForm = document.getElementById('programaForm');
  const categoriaSelect = document.getElementById('formCategoria');
  const adminTableBody = document.getElementById('adminTableBody');
  const modalTitle = document.getElementById('modalTitle');

  // Cargar categorías en el select del formulario
  const cargarCategoriasForm = async () => {
    try {
      const response = await CategoriaService.obtenerTodas();
      const categorias = response.data || [];
      if (categoriaSelect) {
        categoriaSelect.innerHTML = '<option value="">Selecciona una categoría</option>';
        categorias.forEach(cat => {
          categoriaSelect.innerHTML += `<option value="${cat.nombre}">${cat.nombre}</option>`;
        });
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error.message);
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
      const id = e.target.getAttribute('data-id');
      if (!id) return;

      // EDITAR
      if (e.target.classList.contains('btn-edit')) {
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
      if (e.target.classList.contains('btn-delete')) {
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

  // Carga Inicial de la Tabla
  cargarTablaProgramas();
};

// Auto-inicializar si estamos en admin.html
if (window.location.pathname.includes('admin.html')) {
  document.addEventListener('DOMContentLoaded', () => {
    initAdminModule();
  });
}