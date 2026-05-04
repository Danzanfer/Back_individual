import Usuario from '../models/Usuario.js';
import crypto from 'crypto';

function hashPassword(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}

export async function registro(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const usuarioExistente = await Usuario.findOne({ where: { username } });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const nuevoUsuario = await Usuario.create({
      username,
      password: hashPassword(password),
      coins: 100
    });

    return res.status(201).json({ 
      id: nuevoUsuario.id, 
      username: nuevoUsuario.username, 
      coins: nuevoUsuario.coins,
      mensaje: 'Usuario registrado exitosamente'
    });
  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({ error: 'Error al registrar' });
  }
}

export async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const usuario = await Usuario.findOne({ where: { username } });
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const passwordHash = hashPassword(password);
    if (usuario.password !== passwordHash) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    // Token simple (base64 de id + timestamp)
    const token = Buffer.from(`${usuario.id}:${Date.now()}`).toString('base64');

    return res.json({ 
      id: usuario.id, 
      username: usuario.username, 
      coins: usuario.coins,
      token,
      mensaje: 'Login exitoso'
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ error: 'Error al iniciar sesión' });
  }
}
