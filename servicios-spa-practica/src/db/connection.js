// src/db/connection.js
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,       // spa-serviciosspa-xxxxx (el internal host de Dokploy)
  user: process.env.DB_USER,       // spa_user
  password: process.env.DB_PASS,   // contraseña del usuario
  database: process.env.DB_NAME,   // spa_servicios
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;


