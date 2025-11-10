import express from 'express';
import Usuario from '../models/Usuario.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  // Log de intento de login (sin guardar contraseña)
  console.log(`[LOGIN] Intento de acceso: usuario=${username}, fecha=${new Date().toISOString()}`);
  if (!username || !password) {
    console.warn(`[LOGIN] Fallo: usuario o contraseña vacíos (${username})`);
    return res.status(400).json({
      success: false,
      error: 'Usuario y contraseña son obligatorios',
      data: null
    });
  }
  const user = await Usuario.findOne({ username }).select('+password');
  if (!user) {
    console.warn(`[LOGIN] Fallo: usuario no existe (${username})`);
    return res.status(401).json({
      success: false,
      error: 'No existe el usuario',
      data: null
    });
  }
  // Comparar contraseña directamente (sin bcrypt)
  if (user.password !== password) {
    console.warn(`[LOGIN] Fallo: contraseña incorrecta (${username})`);
    return res.status(401).json({
      success: false,
      error: 'La contraseña es incorrecta',
      data: null
    });
  }
  console.log(`[LOGIN] Acceso exitoso: usuario=${username}, fecha=${new Date().toISOString()}`);
  res.json({
    success: true,
    mensaje: 'Login correcto',
    data: {
      username: user.username,
      nombre: user.nombre,
      rol: user.rol,
      email: user.email,
      departamento: user.departamento
    }
  });
});

// Puedes agregar aquí más endpoints de usuarios (registro, edición, etc)
// Registro de usuario con política de contraseña fuerte
router.post('/register', async (req, res) => {
  console.log(`[REGISTER] Intento de registro: usuario=${username}, fecha=${new Date().toISOString()}`);
  const { username, password, nombre, departamento, email, rol } = req.body;
  // Validación de contraseña desactivada temporalmente
  try {
    const usuario = new Usuario({ username, password, nombre, departamento, email, rol });
    await usuario.save();
    console.log(`[REGISTER] Registro exitoso: usuario=${username}, fecha=${new Date().toISOString()}`);
    res.json({ success: true, mensaje: 'Usuario registrado correctamente' });
  } catch (err) {
    console.error(`[REGISTER] Error al registrar usuario (${username}): ${err.message}`);
    res.status(500).json({ success: false, error: 'Error al registrar usuario' });
  }
});
// Logout
router.post('/logout', (req, res) => {
  // Aquí podrías limpiar la sesión si usas sesiones en el backend
  res.json({ success: true, mensaje: 'Sesión cerrada correctamente' });
});

// Listar todos los usuarios
router.get('/', async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json({ success: true, usuarios });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al obtener usuarios', usuarios: [] });
  }
});

export default router;
