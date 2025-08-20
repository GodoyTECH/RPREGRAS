// login.js - Função serverless para autenticação

const { Client } = require('pg');

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método não permitido" };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: "JSON inválido" }) };
  }

  const { username, password } = body;

  if (!username || !password) {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: "Informe usuário e senha" }) };
  }

  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query(
      "SELECT * FROM admin_user WHERE username=$1 AND password=$2",
      [username, password]
    );

    if (res.rows.length === 1) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, user: res.rows[0].username })
      };
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({ success: false, message: "Usuário ou senha incorretos" })
      };
    }
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ success: false, message: "Erro no servidor" }) };
  } finally {
    await client.end();
  }
};


