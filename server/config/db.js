const { Pool } = require('pg')
require('dotenv').config()

/**
 * PostgreSQL Database Connection Pool
 * 
 * Uses connection string from DATABASE_URL environment variable
 * Pool manages multiple client connections for better performance
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Test the connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

module.exports = pool