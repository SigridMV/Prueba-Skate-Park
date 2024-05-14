// Importar el módulo singleton que gestiona la conexión a la base de datos
const singleton = require("../data/singleton");

// Obtener una instancia única de la conexión a la base de datos
let pool = singleton.getConnection();

// Función para obtener la lista de usuarios desde la base de datos
const getUsuarios = async () => {
  const consulta = {
    text: "SELECT id, foto, nombre, anos_experiencia, especialidad, estado FROM skaters ORDER BY id",
    values: [],
  };
  try {
    const result = await pool.query(consulta);
    return result.rows;
  } catch (error) {
    throw error; // Manejar errores de manera más precisa
  }
};

// Función para insertar un nuevo usuario en la base de datos
const insertUsuario = async (
  email,
  nombre,
  password,
  experiencia,
  especialidad,
  foto
) => {
  const consulta = {
    text: "INSERT INTO skaters (email, nombre, password, anos_experiencia, especialidad, foto, estado) VALUES ($1, $2, $3, $4, $5, $6, false) RETURNING *",
    values: [email, nombre, password, experiencia, especialidad, foto],
  };
  try {
    const result = await pool.query(consulta);
    return result.rows[0];
  } catch (error) {
    throw error; // Manejar errores de manera más precisa
  }
};

// Función para cambiar el estado de un usuario (activar/desactivar)
const updateStatusUsuario = async (id, estado) => {
  const consulta = {
    text: "UPDATE skaters SET estado=$2 WHERE id=$1 RETURNING *",
    values: [id, estado],
  };
  try {
    const result = await pool.query(consulta);
    return result.rows[0];
  } catch (error) {
    throw error; // Manejo de errores
  }
};

const updateUsuario = async (
  email,
  nombre,
  password,
  experiencia,
  especialidad
) => {
  const consulta = {
      text: "UPDATE skaters SET nombre = $2, password = $3, anos_experiencia = $4, especialidad = $5 WHERE email = $1 RETURNING *",
      values: [email, nombre, password, experiencia, especialidad],
  };
  try {
      const result = await pool.query(consulta);
      return result.rows[0]; 
  } catch (error) {
      throw error;
  }
};

// Función para eliminar un usuario de la base de datos
const deleteUsuario = async (id) => {
  const consulta = {
    text: "DELETE FROM skaters WHERE id = $1",
    values: [id],
  };
  try {
    const result = await pool.query(consulta);
    return result.rowCount;
  } catch (error) {
    throw error; // Manejar errores de manera más precisa
  }
};

// Función para consultar un usuario por su email y contraseña en la base de datos
const verUsuario = async (email, password) => {
  const consulta = {
    text: "SELECT id, email, nombre, password, anos_experiencia, especialidad, foto, estado FROM skaters WHERE email=$1 AND password=$2",
    values: [email, password],
  };
  try {
    const result = await pool.query(consulta);
    return result.rows[0];
  } catch (error) {
    throw error; // Manejar errores de manera más precisa
  }
};

// Exportar todas las funciones
module.exports = {
  getUsuarios,
  updateStatusUsuario,
  insertUsuario,
  updateUsuario,
  deleteUsuario,
  verUsuario,
};

