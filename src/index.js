const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const path = require('path');

// Middleware para servir archivos estáticos desde 'public' y parsear datos del formulario
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));

// Usuarios simulados
const users = [
  {
    username: 'jdoe',
    password: '1234',
    firstName: 'John',
    lastName: 'Doe',
    department: 'IT',
    email: 'jdoe@example.com'
  },
  {
    username: 'asmith',
    password: '5678',
    firstName: 'Alice',
    lastName: 'Smith',
    department: 'HR',
    email: 'asmith@example.com'
  }
];

// Ruta principal para servir la página de login
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'views', 'login.html'));
});

// Ruta para /login que sirve login.html
app.get('/login', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'views', 'login.html'));
});

// Ruta para manejar el inicio de sesión
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    if (user.department === 'IT') {
      // Redirigir al dashboard principal del frontend
      res.sendFile(path.resolve(__dirname, '../public/dashboard.html'));
    } else {
      res.send(`
        <h1>Panel de Empleado</h1>
        <h2>Bienvenido, ${user.firstName} ${user.lastName}</h2>
        <p>Departamento: ${user.department}</p>
        <p>Correo: ${user.email}</p>
        <a href="/">Cerrar sesión</a>
      `);
    }
  } else {
    res.send(`
      <h1>Credenciales inválidas</h1>
      <a href="/">Volver al login</a>
    `);
  }
});

// API para dashboard
app.get('/api/dashboard', async (req, res) => {
  try {
    // Usuarios registrados
    const empleados = await Empleado.find();
    // Dispositivos IT
    const dispositivos = await Inventario.find();
    // Licencias
    const licencias = await Licencia.find();
    // Tickets (simulado, puedes conectar a tu modelo real si lo tienes)
    const tickets = [
      { id: 1245, asunto: 'PC no enciende', usuario: 'maria.lopez@empresa.com', prioridad: 'Alta', fecha: '2025-10-30', urgente: true },
      { id: 1246, asunto: 'Error de red', usuario: 'luis.martin@empresa.com', prioridad: 'Alta', fecha: '2025-10-29', urgente: true }
    ];
    // Licencias próximas a caducar
    const hoy = new Date();
    const proximasLicencias = licencias.filter(l => {
      const exp = new Date(l.expiracion);
      return exp > hoy && (exp - hoy) / (1000*60*60*24) < 30;
    });
    // Últimos 2 dispositivos IT registrados
    const ultimosDispositivos = await Inventario.find().sort({ _id: -1 }).limit(2);
    res.json({
      usuariosRegistrados: empleados.length,
      dispositivosIT: dispositivos.length,
      ticketsUrgentes: tickets.filter(t => t.urgente).length,
      ticketsAbiertos: tickets.length,
      licenciasPorCaducar: proximasLicencias.length,
      ultimosDispositivos
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener datos del dashboard' });
  }
});


// Inventario simulado
const inventario = [
  { _id: '1', modelo: 'Dell Optiplex 3080', tipo: 'PC', serie: 'SN12345', estado: 'Activo' },
  { _id: '2', modelo: 'HP EliteBook 840', tipo: 'Laptop', serie: 'SN67890', estado: 'Activo' },
  { _id: '3', modelo: 'Samsung Monitor 24"', tipo: 'Monitor', serie: 'SN54321', estado: 'Activo' }
];

// Ruta GET /api/inventario
app.get('/api/inventario', (req, res) => {
  res.json(inventario);
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
