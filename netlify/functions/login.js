// Função serverless para login do admin
import { Client } from "pg";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método não permitido" };
  }

  try {
    const { username, password } = JSON.parse(event.body);

    const client = new Client({
      connectionString: process.env.NEON_DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    const res = await client.query(
      "SELECT * FROM admin_user WHERE username=$1 AND password=$2",
      [username, password]
    );

    await client.end();

    if (res.rows.length === 1) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, user: res.rows[0] })
      };
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({ success: false, message: "Usuário ou senha incorretos" })
      };
    }
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: "Erro no servidor" })
    };
  }
}
