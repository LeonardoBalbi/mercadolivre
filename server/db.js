const { Sequelize } = require('sequelize')
const mysql = require('mysql2/promise')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const host = process.env.DB_HOST || '127.0.0.1'
const user = process.env.DB_USER || 'root'
const password = process.env.DB_PASSWORD || 'root'
const database = process.env.DB_NAME || 'mercadolivre'
const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'mysql',
      logging: false
    })
  : new Sequelize(database, user, password, {
      host,
      port,
      dialect: 'mysql',
      logging: false
    })

async function ensureDatabase() {
  const conn = await mysql.createConnection({ host, user, password, port })
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`)
  await conn.end()
}

module.exports = { sequelize, ensureDatabase }