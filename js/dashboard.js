function renderDashboardView(container) {
  container.innerHTML = `
    <div class="grid">
      <div class="card">
        <h3>Incidencias Activas</h3>
        <h2 style="color:#da3633">3</h2>
        <small>2 en estadio • 1 en zona sur</small>
      </div>
      <div class="card">
        <h3>Dispositivos Conectados</h3>
        <h2>47</h2>
        <small>En tiempo real</small>
      </div>
      <div class="card">
        <h3>Último Botón de Pánico</h3>
        <p><strong>MAC: A4:BB:6D:22:11:CC</strong><br>14:32 - Estadio Jalisco</p>
      </div>
    </div>

    <h3>Últimas Alertas</h3>
    <table class="alert-table">
      <thead><tr><th>Hora</th><th>Dispositivo</th><th>Estado</th></tr></thead>
      <tbody id="alerts-body"></tbody>
    </table>
  `;

  // Datos mock
  const tbody = document.getElementById('alerts-body');
  tbody.innerHTML = `
    <tr><td>14:32</td><td>A4:BB:6D:22:11:CC</td><td><span class="badge danger">PÁNICO</span></td></tr>
    <tr><td>14:28</td><td>78:9A:BC:11:22:33</td><td><span class="badge warning">BATERÍA BAJA</span></td></tr>
  `;
}