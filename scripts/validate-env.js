const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '..', 'server', '.env')
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath })
}

const requiredGroupA = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']
const requiredGroupB = ['DATABASE_URL']

function missing(keys) {
  return keys.filter((k) => !process.env[k] || String(process.env[k]).trim() === '')
}

const missingA = missing(requiredGroupA)
const missingB = missing(requiredGroupB)

const hasGroupA = missingA.length === 0
const hasGroupB = missingB.length === 0

if (!hasGroupA && !hasGroupB) {
  console.error('Erro: variaveis de ambiente ausentes.')
  console.error('Defina um dos grupos:')
  console.error(`- Grupo A: ${requiredGroupA.join(', ')}`)
  console.error(`- Grupo B: ${requiredGroupB.join(', ')}`)
  process.exit(1)
}

console.log('Ambiente validado com sucesso.')
