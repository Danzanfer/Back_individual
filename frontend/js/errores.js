// ── CLASES DE ERROR ──

class AppError extends Error {
  constructor(mensaje, codigo = 'APP_ERROR') {
    super(mensaje);
    this.name    = 'AppError';
    this.codigo  = codigo;
    this.fecha   = new Date().toISOString();
  }

  toString() {
    return `[${this.codigo}] ${this.message}`;
  }
}

class NetworkError extends AppError {
  constructor(mensaje, url = '') {
    super(mensaje, 'NETWORK_ERROR');
    this.name = 'NetworkError';
    this.url  = url;
  }
}

class StorageError extends AppError {
  constructor(mensaje) {
    super(mensaje, 'STORAGE_ERROR');
    this.name = 'StorageError';
  }
}

class ValidationError extends AppError {
  constructor(mensaje, campo = '') {
    super(mensaje, 'VALIDATION_ERROR');
    this.name  = 'ValidationError';
    this.campo = campo;
  }
}

class AuthError extends AppError {
  constructor(mensaje) {
    super(mensaje, 'AUTH_ERROR');
    this.name = 'AuthError';
  }
}

// ── UTILIDADES ──

function manejarError(error, contexto = '') {
  const prefix = contexto ? `[${contexto}]` : '';
  if (error instanceof NetworkError) {
    console.warn(`${prefix} Red: ${error.message}`, error.url);
  } else if (error instanceof StorageError) {
    console.warn(`${prefix} Storage: ${error.message}`);
  } else if (error instanceof ValidationError) {
    console.warn(`${prefix} Validación (${error.campo}): ${error.message}`);
  } else if (error instanceof AuthError) {
    console.warn(`${prefix} Auth: ${error.message}`);
  } else {
    console.error(`${prefix} Error inesperado:`, error);
  }
}

function storageGet(clave, fallback = null) {
  try {
    const val = localStorage.getItem(clave);
    return val !== null ? JSON.parse(val) : fallback;
  } catch (e) {
    throw new StorageError(`No se pudo leer '${clave}': ${e.message}`);
  }
}

function storageSet(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch (e) {
    throw new StorageError(`No se pudo guardar '${clave}': ${e.message}`);
  }
}
