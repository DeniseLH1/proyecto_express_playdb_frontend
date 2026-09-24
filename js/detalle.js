import { ProgramasService } from './services/programa.service.js';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('detalleContainer');
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

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
    `;
  } catch (error) {
    container.innerHTML = `<h3 style="color: var(--danger);">Error al cargar el programa: ${error.message}</h3>`;
  }
});