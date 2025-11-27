import express from 'express';
import Usuario from '../models/Usuario.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  const { email, contrasena } = req.body;
  console.log(`[LOGIN] Intento de acceso: email=${email}, fecha=${new Date().toISOString()}`);
  if (!email || !contrasena) {
    console.warn(`[LOGIN] Fallo: email o contraseña vacíos (${email})`);
    return res.status(400).json({
      success: false,
      error: 'Email y contraseña son obligatorios',
      data: null
    });
  }
  const user = await Usuario.findOne({ email });
  if (!user) {
    console.warn(`[LOGIN] Fallo: usuario no existe (${email})`);
    return res.status(401).json({
      success: false,
      error: 'No existe el usuario',
      data: null
    });
  }
  if (user.contrasena !== contrasena) {
    console.warn(`[LOGIN] Fallo: contraseña incorrecta (${email})`);
    return res.status(401).json({
      success: false,
      error: 'La contraseña es incorrecta',
      data: null
    });
  }
  console.log(`[LOGIN] Acceso exitoso: email=${email}, fecha=${new Date().toISOString()}`);
  res.json({
    success: true,
    mensaje: 'Login correcto',
    data: {
      nombre: user.nombre,
      rol: user.rol,
      email: user.email,
      departamento: user.departamento,
      equipoAsignado: user.equipoAsignado,
      pantallaAsignada: user.pantallaAsignada
    }
  });
});

// Puedes agregar aquí más endpoints de usuarios (registro, edición, etc)
// Editar usuario
router.put('/:id', async (req, res) => {
  try {
    const { nombre, email, contrasena, departamento, fechaAlta, equipoAsignado, pantallaAsignada, rol, extra } = req.body;
    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { nombre, email, contrasena, departamento, fechaAlta, equipoAsignado, pantallaAsignada, rol, extra },
      { new: true }
    );
    if (!usuario) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    res.json({ success: true, usuario });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al editar usuario' });
  }
});

// Eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    res.json({ success: true, mensaje: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al eliminar usuario' });
  }
});
// Registro de usuario con política de contraseña fuerte
router.post('/register', async (req, res) => {
  const { nombre, email, contrasena, departamento, fechaAlta, equipoAsignado, pantallaAsignada, rol, extra } = req.body;
  console.log(`[REGISTER] Intento de registro: email=${email}, fecha=${new Date().toISOString()}`);
  try {
    const usuario = new Usuario({ nombre, email, contrasena, departamento, fechaAlta, equipoAsignado, pantallaAsignada, rol, extra });
    await usuario.save();
    console.log(`[REGISTER] Registro exitoso: email=${email}, fecha=${new Date().toISOString()}`);
    res.json({ success: true, mensaje: 'Usuario registrado correctamente' });
  } catch (err) {
    console.error(`[REGISTER] Error al registrar usuario (${email}): ${err.message}`);
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
