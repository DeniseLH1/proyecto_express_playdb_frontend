import { ProgramasService } from './services/programa.service.js';
import { CalificacionService } from './services/calificacion.service.js';
import { StorageHelper } from './helpers/storage.js';

const renderStars = (value) => {
  const rating = Number(value || 0);
  return Array.from({ length: 5 }, (_, index) => index < Math.round(rating) ? '★' : '☆').join('');
};

const renderOpiniones = (opiniones) => {
  const reviewList = document.getElementById('reviewList');
  if (!reviewList) return;
  reviewList.innerHTML = '';

  if (!opiniones.length) {
    reviewList.innerHTML = '<p class="empty-reviews">Todavía no hay opiniones. Sé la primera persona en compartir qué te pareció.</p>';
    return;
  }

  opiniones.forEach((opinion) => {
    const article = document.createElement('article');
    article.className = 'review-item';
    article.innerHTML = `
      <div class="review-heading">
        <strong></strong>
        <span class="review-stars">${renderStars(opinion.puntuacion)}</span>
      </div>
      <p></p>
    `;
    article.querySelector('strong').textContent = opinion.usuarioNombre || 'Usuario';
    article.querySelector('p').textContent = opinion.opinion;
    reviewList.appendChild(article);
  });
};

const cargarCalificaciones = async (programaId) => {
  const response = await CalificacionService.obtenerPorPrograma(programaId);
  const data = response.data || {};
  const summary = document.getElementById('detailRatingSummary');
  if (summary) {
    summary.innerHTML = `<span class="detail-stars">${renderStars(data.promedio)}</span><strong>${data.promedio ? data.promedio.toFixed(1) : 'Sin calificación'}</strong><small>${data.total || 0} opiniones</small>`;
  }
  renderOpiniones(data.opiniones || []);
};

const configurarFormularioCalificacion = (programaId) => {
  const form = document.getElementById('reviewForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const alert = document.getElementById('reviewAlert');
    const puntuacion = Number(form.elements.puntuacion.value);
    const opinion = form.elements.opinion.value.trim();

    try {
      await CalificacionService.guardar(programaId, { puntuacion, opinion });
      form.reset();
      if (alert) {
        alert.className = 'alert alert-success';
        alert.textContent = 'Tu opinión se guardó correctamente.';
      }
      await cargarCalificaciones(programaId);
    } catch (error) {
      if (alert) {
        alert.className = 'alert alert-danger';
        alert.textContent = error.message;
      }
    }
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('detalleContainer');
  const detailBackLink = document.getElementById('detailBackLink');
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const fromAdmin = urlParams.get('from') === 'admin';

  if (fromAdmin && detailBackLink) {
    detailBackLink.href = 'admin.html';
    detailBackLink.textContent = '← Volver al panel admin';
  }

  if (!id) {
    container.innerHTML = '<h3>Error: No se especificó ningún ID de programa.</h3>';
    return;
  }

  try {
    const response = await ProgramasService.obtenerPorId(id);
    const prog = response.data;

    container.innerHTML = `
      <div class="detail-layout">
        <img src="${prog.poster}" alt="${prog.titulo}" class="detail-poster">
        <div class="detail-copy">
          <p class="section-kicker">Ficha del programa</p>
          <h1>${prog.titulo}</h1>
          <span class="detail-badge">${prog.categoria}</span>
          <div id="detailRatingSummary" class="detail-rating-summary" aria-live="polite">Cargando calificaciones...</div>
          <p class="detail-synopsis">${prog.sinopsis}</p>
          
          <div class="detail-meta">
            <strong>Productora:</strong> ${prog.productora} <br>
            <strong>Capítulos:</strong> ${prog.capitulos}
          </div>

          <div class="detail-list">
            <strong>Actores:</strong> ${prog.actores ? prog.actores.join(', ') : 'N/A'}
          </div>

          <div class="detail-list detail-characters">
            <strong>Personajes:</strong> ${prog.personajes ? prog.personajes.join(', ') : 'N/A'}
          </div>

          ${prog.trailer ? `<a href="${prog.trailer}" target="_blank" rel="noreferrer" class="btn btn-primary">▶ Ver tráiler</a>` : ''}
        </div>
      </div>
      <section class="reviews-area">
        <div class="reviews-header">
          <div>
            <p class="section-kicker">La comunidad opina</p>
            <h2>Opiniones</h2>
          </div>
        </div>
        ${StorageHelper.obtenerUsuario() ? `
          <form id="reviewForm" class="review-form">
            <div id="reviewAlert"></div>
            <label for="reviewRating">Tu calificación</label>
            <select id="reviewRating" name="puntuacion" required>
              <option value="">Selecciona de 1 a 5 estrellas</option>
              <option value="5">5 estrellas</option>
              <option value="4">4 estrellas</option>
              <option value="3">3 estrellas</option>
              <option value="2">2 estrellas</option>
              <option value="1">1 estrella</option>
            </select>
            <label for="reviewOpinion">Tu opinión</label>
            <textarea id="reviewOpinion" name="opinion" rows="4" minlength="3" maxlength="1000" required placeholder="¿Qué te pareció este programa?"></textarea>
            <button type="submit" class="btn btn-primary">Publicar opinión</button>
          </form>
        ` : '<p class="review-login-note">Inicia sesión para dejar una opinión y calificar este programa.</p>'}
        <div id="reviewList" class="review-list"></div>
      </section>
    `;
    configurarFormularioCalificacion(id);
    await cargarCalificaciones(id);
  } catch (error) {
    container.innerHTML = `<h3 style="color: var(--danger);">Error al cargar el programa: ${error.message}</h3>`;
  }
});