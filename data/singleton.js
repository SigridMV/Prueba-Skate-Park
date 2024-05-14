const { Pool } = require("pg");
require("dotenv").config();

const config = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  max: 20,
  min: 5,
  idleTimeoutMillis: 15000,
  connectionTimeoutMillis: 2000,
};

const singleton = (function () {
  let instance;

  function crearPool() {
    try {
      const pool = new Pool(config);
      return pool;
    } catch (error) {
      console.error("Error al crear el pool de conexiones:", error);
      throw error; // Lanzar el error para que sea manejado externamente
    }
  }

  return {
    getConnection: () => {
      if (!instance) {
        instance = crearPool();
      } else {
        console.log("Ya hay un pool de conexiones en funcionamiento.");
      }
      return instance;
    },
  };
})();

module.exports = singleton;

