export const DOM = {
  // Muestra una notificación o mensaje de error/éxito
  showAlert: (mensaje, tipo = 'danger', contenedorId = 'alertContainer') => {
    const container = document.getElementById(contenedorId);
    if (!container) return;

    const alert = document.createElement('div');
    alert.className = `alert alert-${tipo}`;
    alert.textContent = mensaje;

    container.innerHTML = '';
    container.appendChild(alert);

    setTimeout(() => {
      alert.remove();
    }, 4000);
  },

  // Parsea un string delimitado por comas a un array limpio
  stringToArray: (str) => {
    if (!str) return [];
    return str.split(',').map(item => item.trim()).filter(Boolean);
  }
};