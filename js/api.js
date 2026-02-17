
const BASE_URL = 'http://localhost:8000'; // cambia por tu FastAPI

async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    ...options
  };

  const res = await fetch(BASE_URL + endpoint, config);
  
  if (!res.ok) {
    if (res.status === 401) {
      logout();
      throw new Error('Sesión expirada');
    }
    throw new Error('Error en la petición');
  }
  
  return res.json();
}

// Ejemplos de uso (puedes agregar más)
async function getDevices() {
  return apiFetch('/devices');
}

async function sendCommand(mac, command) {
  return apiFetch(`/devices/${mac}/command`, {
    method: 'POST',
    body: JSON.stringify({ command })
  });
}

window.apiFetch = apiFetch;
window.getDevices = getDevices;
window.sendCommand = sendCommand;