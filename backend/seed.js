const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function seedDatabase() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ims_odoo',
    multipleStatements: true, // Crucial for running an entire SQL file
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  try {
    console.log('Connecting to database...');
    
    // Read the dummy_data.sql file
    const sqlPath = path.join(__dirname, '../database/dummy_data.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Parsing and executing 100% of dummy_data queries...');
    await pool.query(sql);
    
    console.log('==============================================');
    console.log('SUCCESS: Database Seeded! Check your dashboard!');
    console.log('==============================================');
  } catch (error) {
    console.error('Failed to seed the database:', error);
  } finally {
    await pool.end();
  }
}

seedDatabase();
