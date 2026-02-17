const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('.')); // sirve los archivos estáticos (html, js, css)

const USERS_FILE = path.join(__dirname, 'data', 'usuarios.json');

// GET usuarios (para el login)
app.get('/data/usuarios.json', async (req, res) => {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: 'Error leyendo usuarios' });
  }
});

// POST para registrar (actualiza el JSON)
app.post('/data/usuarios.json', async (req, res) => {
  try {
    const { usuarios } = req.body;
    await fs.writeFile(USERS_FILE, JSON.stringify({ usuarios }, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error guardando usuarios' });
  }
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});