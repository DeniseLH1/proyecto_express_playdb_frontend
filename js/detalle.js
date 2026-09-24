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
      <div style="display: grid; grid-template-columns: 300px 1fr; gap: 2rem;">
        <img src="${prog.poster}" alt="${prog.titulo}" style="width: 100%; border-radius: 8px; object-fit: cover;">
        <div>
          <h1 style="margin-bottom: 0.5rem;">${prog.titulo}</h1>
          <span style="background: var(--accent); padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem;">${prog.categoria}</span>
          <p style="margin: 1.5rem 0; color: var(--text-muted); font-size: 1.1rem; line-height: 1.6;">${prog.sinopsis}</p>
          
          <div style="margin-bottom: 1rem;">
            <strong>Productora:</strong> ${prog.productora} <br>
            <strong>Capítulos:</strong> ${prog.capitulos}
          </div>

          <div style="margin-bottom: 1rem;">
            <strong>Actores:</strong> ${prog.actores ? prog.actores.join(', ') : 'N/A'}
          </div>

          <div style="margin-bottom: 2rem;">
            <strong>Personajes:</strong> ${prog.personajes ? prog.personajes.join(', ') : 'N/A'}
          </div>

          ${prog.trailer ? `<a href="${prog.trailer}" target="_blank" class="btn btn-primary">▶ Ver Tráiler</a>` : ''}
        </div>
      </div>
    `;
  } catch (error) {
    container.innerHTML = `<h3 style="color: var(--danger);">Error al cargar el programa: ${error.message}</h3>`;
  }
});