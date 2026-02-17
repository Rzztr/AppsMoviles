// js/auth.js

// ── Simulación de base de datos JSON (luego se cambia por fetch a backend) ──
let usuariosDB = null;

async function cargarUsuarios() {
  if (usuariosDB) return usuariosDB;

  try {
    const response = await fetch('data/usuarios.json');
    if (!response.ok) throw new Error('No se pudo cargar usuarios.json');
    const data = await response.json();
    usuariosDB = data.usuarios;
    return usuariosDB;
  } catch (error) {
    console.error('Error cargando usuarios:', error);
    alert('Error interno: no se pudo cargar la lista de usuarios');
    return [];
  }
}

async function login(curpIngresada, passwordPlana) {
  const usuarios = await cargarUsuarios();
  
  // Limpieza agresiva de la CURP ingresada
  const curpLimpia = curpIngresada
    .trim()                     // quita espacios al inicio y final
    .replace(/\s+/g, '')        // elimina TODOS los espacios internos
    .replace(/[^A-Z0-9]/gi, '') // solo letras mayúsculas y números (elimina guiones, puntos, etc.)
    .toUpperCase();

  console.log("CURP ingresada limpia:", curpLimpia);   // ← para depurar
  console.log("Longitud después de limpiar:", curpLimpia.length);

  const hashIngresado = await calcularSHA256(passwordPlana);
  
  const usuario = usuarios.find(u => {
    const curpDB = u.curp.trim().toUpperCase();
    return curpDB === curpLimpia;
  });

  if (!usuario) {
    console.log("No se encontró coincidencia. CURPs en BD:");
    usuarios.forEach(u => console.log("  -", u.curp));
    return { success: false, message: "CURP no encontrada" };
  }

  if (usuario.password_hash !== hashIngresado) {
    return { success: false, message: "Contraseña incorrecta" };
  }
  const sesion = {
    curp: usuario.curp,
    nombre: usuario.nombre,
    rol: usuario.rol,
    timestamp: Date.now()
  };

  localStorage.setItem('sesionGhostPrism', JSON.stringify(sesion));
  
  state.token = "fake-jwt-" + Date.now(); // simulado
  state.user = usuario.nombre.split(" ")[0]; // nombre corto para UI

  return { success: true, message: "Bienvenido" };
}

// Función auxiliar para SHA-256 en el navegador (usando Web Crypto API)
async function calcularSHA256(texto) {
  const msgBuffer = new TextEncoder().encode(texto);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

function estaAutenticado() {
  const sesionStr = localStorage.getItem('sesionGhostPrism');
  if (!sesionStr) return false;
  
  const sesion = JSON.parse(sesionStr);
  // Podrías agregar validación de tiempo de expiración aquí
  return !!sesion.curp;
}

function obtenerUsuarioActual() {
  const sesionStr = localStorage.getItem('sesionGhostPrism');
  return sesionStr ? JSON.parse(sesionStr) : null;
}

function logout() {
  localStorage.removeItem('sesionGhostPrism');
  state.token = null;
  state.user = null;
  render('login');
}

async function register(curpIngresada, nombre, passwordPlana) {
  const usuarios = await cargarUsuarios();

  // Limpieza de CURP (igual que en login)
  const curpLimpia = curpIngresada
    .trim()
    .replace(/\s+/g, '')
    .replace(/[^A-Z0-9]/gi, '')
    .toUpperCase();

  // Verificar si ya existe
  const existe = usuarios.some(u => 
    u.curp.trim().toUpperCase() === curpLimpia
  );

  if (existe) {
    return { success: false, message: "Esta CURP ya está registrada" };
  }

  // Generar hash
  const passwordHash = await calcularSHA256(passwordPlana);

  // Crear nuevo usuario
  const nuevoUsuario = {
    curp: curpLimpia,
    nombre: nombre.trim(),
    rol: "sentinel",
    password_hash: passwordHash
  };

  // Agregar al array (en memoria)
  usuarios.push(nuevoUsuario);

  // Guardar de vuelta en el archivo JSON
  // Nota: Esto SOLO funciona en desarrollo con un backend que permita escritura
  // En producción o en PWA pura NO se puede escribir directamente en JSON
  try {
    await fetch('/data/usuarios.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarios })
    });
    return { success: true, message: "Usuario registrado" };
  } catch (error) {
    console.error("Error al guardar usuario:", error);
    // Si falla la escritura, al menos mostramos éxito en cliente (para simulación)
    return { success: true, message: "Usuario registrado (simulado - JSON no se actualizó)" };
  }
}

// Exponer funciones globales necesarias
window.login = login;
window.logout = logout;
window.estaAutenticado = estaAutenticado;
window.obtenerUsuarioActual = obtenerUsuarioActual;