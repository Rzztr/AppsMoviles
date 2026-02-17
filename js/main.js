// js/main.js ── Versión limpia y consistente (febrero 2026)

const state = {
  currentView: 'login',
  user: null,
  token: null
};

const app = document.getElementById('app');

function render(view) {
  state.currentView = view;
  
  if (view === 'login') {
    renderLogin();
  } else {
    renderDashboardLayout();   // crea el layout con sidebar + content
    navigate(view);            // carga la vista específica dentro del content
  }
}

function renderLogin() {
  app.innerHTML = `
    <div class="login-container">
      <h1>Ghost <span style="color:#238636">prISM</span></h1>
      <p>Estación de Operación Alfa • Mundial 2026</p>

      <div id="login-form-container">
        <form id="loginForm">
          <input type="text" id="curp" placeholder="CURP (18 caracteres)" maxlength="18" required>
          <input type="password" id="password" placeholder="Contraseña" required>
          <button type="submit" class="btn-primary">Iniciar Sesión</button>
        </form>
        
      </div>

      <div id="register-form-container" class="hidden">
        <h2>Registro de Sentinel</h2>
        <form id="registerForm">
          <input type="text" id="reg-curp" placeholder="CURP (18 caracteres)" maxlength="18" required>
          <input type="text" id="reg-nombre" placeholder="Nombre completo" required>
          <input type="password" id="reg-password" placeholder="Contraseña" required>
          <input type="password" id="reg-password-confirm" placeholder="Confirmar contraseña" required>
        </form>
        <h1>Privacidad</h1>
        <p>Aviso y consentimiento de uso de datos personales</p>

        <div class="card" style="text-align: left; margin-bottom: 1.5rem; max-height: 250px; overflow-y: auto;">
            <h3 style="color: var(--primary);">Términos y Condiciones</h3>
            <p style="font-size: 0.85rem; color: var(--text);">
                En cumplimiento con la normativa de protección de datos, <strong>Ghost prISM</strong> le informa que los datos recolectados (incluyendo direcciones MAC, registros de red y actividad del sistema) serán utilizados exclusivamente para:
            </p>
            <ul style="font-size: 0.85rem; color: var(--text-light); padding-left: 1rem; margin: 1rem 0;">
                <li>Monitoreo de seguridad en tiempo real.</li>
                <li>Generación de reportes de diagnóstico.</li>
                <li>Optimización del rendimiento del Dashboard.</li>
            </ul>
            <p style="font-size: 0.85rem; color: var(--text);">
                Al hacer clic en "Aceptar", usted confirma que es mayor de edad y autoriza el tratamiento de su información técnica bajo nuestros protocolos de cifrado de grado militar.
            </p>
            <span class="badge warning">Sesión Encriptada AES-256</span>
        </div>
        <button type="submit" class="btn-primary">Crear Cuenta</button>
  `;
// Eventos
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const curp = document.getElementById('curp').value.trim();
    const password = document.getElementById('password').value;

    if (curp.length !== 18) {
      alert('La CURP debe tener exactamente 18 caracteres');
      return;
    }

    const resultado = await login(curp, password);
    if (resultado.success) {
      render('dashboard');
    } else {
      alert(resultado.message || 'Error al iniciar sesión');
    }
  });

  // Mostrar/ocultar formularios
  document.getElementById('show-register-btn').addEventListener('click', () => {
    document.getElementById('login-form-container').classList.add('hidden');
    document.getElementById('register-form-container').classList.remove('hidden');
  });

  document.getElementById('show-login-btn').addEventListener('click', () => {
    document.getElementById('register-form-container').classList.add('hidden');
    document.getElementById('login-form-container').classList.remove('hidden');
  });

  // Registro
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const curp = document.getElementById('reg-curp').value.trim();
    const nombre = document.getElementById('reg-nombre').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-password-confirm').value;

    if (curp.length !== 18) {
      alert('La CURP debe tener exactamente 18 caracteres');
      return;
    }

    if (password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirm) {
      alert('Las contraseñas no coinciden');
      return;
    }

    const resultado = await register(curp, nombre, password);

    if (resultado.success) {
      alert('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.');
      // Volver al login
      document.getElementById('register-form-container').classList.add('hidden');
      document.getElementById('login-form-container').classList.remove('hidden');
      document.getElementById('curp').value = curp;  // prellenar CURP
    } else {
      alert(resultado.message || 'Error al crear la cuenta');
    }
  });
}

function renderDashboardLayout() {
  app.innerHTML = `
    <div class="dashboard-wrapper">
      <aside class="sidebar">
        <div class="logo">GHOST PRISM</div>
        <nav>
          <button onclick="navigate('dashboard')" class="nav-btn active">Dashboard</button>
          <button onclick="navigate('map')" class="nav-btn">Mapa en Tiempo Real</button>
          <button onclick="navigate('control')" class="nav-btn">Control Remoto</button>
          <button onclick="navigate('historial')" class="nav-btn">Historial</button>
        </nav>
        <div class="user-info">
          <strong id="user-name">${state.user || 'Usuario'}</strong><br>
          <small>Sentinel - Operador</small>
          <button onclick="logout()" class="btn-danger small">Cerrar Sesión</button>
        </div>
      </aside>
      <main class="content">
        <header>
          <h2 id="page-title">Dashboard</h2>
        </header>
        <div id="view-content"></div>
      </main>
    </div>
  `;
}

window.navigate = function(view) {
  // Actualiza botones active
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  const btn = document.querySelector(`button[onclick="navigate('${view}')"]`);
  if (btn) btn.classList.add('active');

  const content = document.getElementById('view-content');
  if (!content) return;

  content.innerHTML = '';

  // Actualiza título
  document.getElementById('page-title').textContent = 
    view.charAt(0).toUpperCase() + view.slice(1).replace('-', ' ');

  if (view === 'dashboard')      renderDashboardView(content);
  else if (view === 'map')       renderMapView(content);
  else if (view === 'control')   renderControlView(content);
  else if (view === 'historial') renderHistorialView(content);
  else content.innerHTML = '<p>Vista no implementada aún</p>';
};

// Inicialización
window.onload = () => {
  if (estaAutenticado()) {
    const usuario = obtenerUsuarioActual();
    if (usuario) {
      state.user = usuario.nombre.split(" ")[0] || 'Sentinel';
      render('dashboard');
    } else {
      render('login');
    }
  } else {
    render('login');
  }
};