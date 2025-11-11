import mysql from 'mysql2/promise'; // ✅ Ganti dari mongoose
import dotenv from 'dotenv';
dotenv.config();

// ✅ Gunakan MySQL Pool, sama seperti service lain
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ticket-konser',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test koneksi
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Event Service connected to MySQL database');
    connection.release();
  } catch (error) {
    console.error('❌ MySQL connection error:', error.message);
    process.exit(1);
  }
})();

export default pool; // ✅ Ekspor pool-nya