console.log('Router usuarios cargado');
// Middleware de autenticación JWT
console.log('INICIO usuarios.js');
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'Token no proporcionado' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecreto');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Token inválido' });
  }
}
import express from 'express';
import Usuario from '../models/Usuario.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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
  // Mostrar el usuario recuperado para depuración
  console.log('Usuario recuperado:', user);
  // Usar el campo 'password' o 'contrasena' según exista en el usuario
  const hash = user.password || user.contrasena;
  if (!hash) {
    console.warn(`[LOGIN] Fallo: usuario sin contraseña (${email})`);
    return res.status(401).json({
      success: false,
      error: 'Usuario sin contraseña',
      data: null
    });
  }
  const validPassword = await bcrypt.compare(contrasena, hash);
  if (!validPassword) {
    console.warn(`[LOGIN] Fallo: contraseña incorrecta (${email})`);
    return res.status(401).json({
      success: false,
      error: 'La contraseña es incorrecta',
      data: null
    });
  }
  // Generar token JWT
  const token = jwt.sign({
    id: user._id,
    email: user.email,
    rol: user.rol
  }, process.env.JWT_SECRET || 'supersecreto', { expiresIn: '8h' });
  console.log(`[LOGIN] Acceso exitoso: email=${email}, fecha=${new Date().toISOString()}`);
  res.json({
    success: true,
    mensaje: 'Login correcto',
    token,
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
// Crear usuario de prueba (solo adminIT)
router.post('/crear', async (req, res) => {
  const { nombre, email, contrasena, departamento, rol } = req.body;
  if (!nombre || !email || !contrasena || !rol) {
    return res.status(400).json({ success: false, error: 'Faltan campos obligatorios' });
  }
  // Solo adminIT puede crear usuarios
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'Token no proporcionado' });
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecreto');
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Token inválido' });
  }
  if (decoded.rol !== 'adminIT') {
    return res.status(403).json({ success: false, error: 'Solo adminIT puede crear usuarios' });
  }
  // Verificar si el usuario ya existe
  const existe = await Usuario.findOne({ email });
  if (existe) {
    return res.status(409).json({ success: false, error: 'El usuario ya existe' });
  }
  // Crear y guardar usuario, asignando username = email
  const nuevoUsuario = new Usuario({ nombre, email, contrasena, departamento, rol, username: email });
  await nuevoUsuario.save();
  res.json({ success: true, mensaje: 'Usuario creado correctamente', usuario: { nombre, email, rol, departamento } });
});
// Editar usuario
router.put('/:id', async (req, res) => {
  authMiddleware(req, res, async () => {
    if (!['adminIT', 'rrhh', 'admin'].includes(req.user.rol)) {
      return res.status(403).json({ success: false, error: 'No tienes permisos para editar usuarios.' });
    }
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
});

// Eliminar usuario
router.delete('/:id', async (req, res) => {
  authMiddleware(req, res, async () => {
    if (!['adminIT', 'rrhh', 'admin'].includes(req.user.rol)) {
      return res.status(403).json({ success: false, error: 'No tienes permisos para eliminar usuarios.' });
    }
    try {
      const usuario = await Usuario.findByIdAndDelete(req.params.id);
      if (!usuario) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      res.json({ success: true, mensaje: 'Usuario eliminado correctamente' });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Error al eliminar usuario' });
    }
  });
});
// Registro de usuario con política de contraseña fuerte
router.post('/register', async (req, res) => {
  authMiddleware(req, res, async () => {
    if (!['adminIT', 'rrhh', 'admin'].includes(req.user.rol)) {
      return res.status(403).json({ success: false, error: 'No tienes permisos para registrar usuarios.' });
    }
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
});
// Logout
router.post('/logout', (req, res) => {
  // Aquí podrías limpiar la sesión si usas sesiones en el backend
  res.json({ success: true, mensaje: 'Sesión cerrada correctamente' });
});

// Listar todos los usuarios
router.get('/', async (req, res) => {
  // Proteger la ruta con el middleware de autenticación
  authMiddleware(req, res, async () => {
    try {
      const usuarios = await Usuario.find();
      res.json({ success: true, usuarios });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Error al obtener usuarios', usuarios: [] });
    }
  });
});
export default router;

