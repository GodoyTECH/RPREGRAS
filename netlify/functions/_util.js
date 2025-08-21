// _util.js
// ----------------------------------------------------------
// Arquivo utilitário para centralizar:
// - Conexão com o PostgreSQL (Neon ou outro host)
// - Função para executar queries
// - Função padrão para retornar respostas com CORS
// ----------------------------------------------------------

const { Pool } = require("pg"); // Driver PostgreSQL

let pool; // Variável que guarda a pool de conexões (singleton)

// Retorna a pool de conexões, inicializando apenas 1x
function getPool() {
  if (!pool) {
    const connStr =
      process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
    if (!connStr) {
      throw new Error("Variável NEON_DATABASE_URL ou DATABASE_URL não definida");
    }
    pool = new Pool({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false }, // necessário pro Neon
    });
  }
  return pool;
}

// Função para executar queries SQL
async function query(text, params) {
  const client = await getPool().connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release(); // Libera conexão de volta para o pool
  }
}

// Função para padronizar resposta com CORS liberado
function send(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*", // Permite chamadas de qualquer origem
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
    body: JSON.stringify(body), // Sempre retorna JSON
  };
}

module.exports = { query, send };
