import { AuthService } from './services/auth.service.js';
import { StorageHelper } from './helpers/storage.js';
import { DOM } from './helpers/dom.js';

let isLogin = true;

const authForm = document.getElementById('authForm');
const formTitle = document.getElementById('formTitle');
const nombreGroup = document.getElementById('nombreGroup');
const submitBtn = document.getElementById('submitBtn');
const toggleAuth = document.getElementById('toggleAuth');

if (toggleAuth) {
  toggleAuth.addEventListener('click', (e) => {
    e.preventDefault();
    isLogin = !isLogin;
    formTitle.textContent = isLogin ? 'Iniciar Sesión' : 'Crear Cuenta';
    submitBtn.textContent = isLogin ? 'Ingresar' : 'Registrarse';
    if (isLogin) {
      nombreGroup.classList.add('hidden');
    } else {
      nombreGroup.classList.remove('hidden');
    }
  });
}

if (authForm) {
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const nombre = document.getElementById('nombre').value.trim();

    try {
      if (isLogin) {
        const res = await AuthService.login(email, password);
        StorageHelper.guardarUsuario(res.usuario || { email, rol: 'admin' });
        window.location.href = 'index.html';
      } else {
        await AuthService.registro({ nombre, email, password });
        DOM.showAlert('Registro exitoso. ¡Inicia sesión ahora!', 'success');
        isLogin = true;
        formTitle.textContent = 'Iniciar Sesión';
        submitBtn.textContent = 'Ingresar';
        nombreGroup.classList.add('hidden');
      }
    } catch (err) {
      DOM.showAlert(err.message, 'danger');
    }
  });
}