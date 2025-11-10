import express from 'express';
import Usuario from '../models/Usuario.js';
const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Usuario y contraseña son obligatorios',
      data: null
    });
  }
  const user = await Usuario.findOne({ username });
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'No existe el usuario',
      data: null
    });
  }
  if (user.password !== password) {
    return res.status(401).json({
      success: false,
      error: 'La contraseña es incorrecta',
      data: null
    });
  }
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
