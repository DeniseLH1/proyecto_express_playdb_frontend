export const createProgramaCard = (programa, options = {}) => {
  const { showFavorite = false, isFavorite = false } = options;
  const promedio = Number(programa.promedioCalificacion || 0);
  const estrellas = Array.from({ length: 5 }, (_, index) => index < Math.round(promedio) ? '★' : '☆').join('');
  const card = document.createElement('article');
  card.className = 'programa-card';

  card.innerHTML = `
    <div class="poster-container">
      <img src="${programa.poster || 'https://via.placeholder.com/300x400'}" alt="${programa.titulo}" class="poster-img" />
      <span class="badge">${programa.categoria || 'Sin Categoría'}</span>
    </div>
    <div class="card-content">
      <h3 class="card-title">${programa.titulo}</h3>
      <div class="card-rating" aria-label="${promedio ? `${promedio} de 5 estrellas` : 'Sin calificaciones'}">
        <span>${estrellas}</span> ${promedio ? `<strong>${promedio.toFixed(1)}</strong> <small>(${programa.totalCalificaciones || 0})</small>` : '<small>Sin calificaciones</small>'}
      </div>
      <p class="card-sinopsis">${programa.sinopsis ? programa.sinopsis.substring(0, 90) + '...' : ''}</p>
      <div class="card-footer">
        <span>Capítulos: <strong>${programa.capitulos || 1}</strong></span>
        <div class="card-actions">
          ${showFavorite ? `<button type="button" class="favorite-btn ${isFavorite ? 'is-favorite' : ''}" data-favorite-id="${programa._id}" aria-pressed="${isFavorite}">${isFavorite ? '♥ Guardado' : '♡ Guardar'}</button>` : ''}
          <button type="button" class="btn btn-primary btn-sm details-btn" data-id="${programa._id}">Ver detalle</button>
        </div>
      </div>
    </div>
  `;

  return card;
};