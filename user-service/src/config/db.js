import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "ticket-konser",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

try {
  await pool.query("SELECT 1");
  console.log("✅ Connected to MySQL database:", process.env.DB_NAME);
} catch (err) {
  console.error("❌ MySQL connection failed:", err.message);
}

export default pool;
