
import mysql from 'mysql2/promise';

// Create MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // Default MySQL user, change if needed
  password: '', // Default empty password, change if needed
  database: 'fintrack',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test the connection
async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 as test');
    console.log('Database connection established successfully');
    return true;
  } catch (error) {
    console.error('Error connecting to database:', error.message);
    
    // Attempt to create the database if it doesn't exist
    try {
      // Create a connection without specifying database
      const tempPool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: ''
      });
      
      console.log('Attempting to create the database...');
      await tempPool.query('CREATE DATABASE IF NOT EXISTS fintrack');
      console.log('Database created or already exists.');
      
      // Close the temporary connection
      await tempPool.end();
      
      console.log('Please run the setup-database.sql script to initialize the schema.');
      return false;
    } catch (createError) {
      console.error('Failed to create database:', createError.message);
      return false;
    }
  }
}

// Export both the pool and the test connection function
export { testConnection };
export default pool;
