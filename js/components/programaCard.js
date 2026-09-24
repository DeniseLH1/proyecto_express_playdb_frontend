export const createProgramaCard = (programa) => {
  const card = document.createElement('article');
  card.className = 'programa-card';

  card.innerHTML = `
    <div class="poster-container">
      <img src="${programa.poster || 'https://via.placeholder.com/300x400'}" alt="${programa.titulo}" class="poster-img" />
      <span class="badge">${programa.categoria || 'Sin Categoría'}</span>
    </div>
    <div class="card-content">
      <h3 class="card-title">${programa.titulo}</h3>
      <p class="card-sinopsis">${programa.sinopsis ? programa.sinopsis.substring(0, 90) + '...' : ''}</p>
      <div class="card-footer">
        <span>Capítulos: <strong>${programa.capitulos || 1}</strong></span>
        <button class="btn btn-primary btn-sm details-btn" data-id="${programa._id}">Ver detalle</button>
      </div>
    </div>
  `;

  return card;
};