
import mysql from 'mysql2/promise';

// Create MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // Default MySQL user, change if needed
  password: '', // Default empty password, change if needed
  database: 'fintrack',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
