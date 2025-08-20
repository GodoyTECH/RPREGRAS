import { Client } from "pg";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método não permitido" };
  }

  let client;

  try {
    const { username, password } = JSON.parse(event.body);

    // Conexão com Neon
    client = new Client({
      connectionString: process.env.NEON_DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    // Busca usuário no banco
    const res = await client.query(
      "SELECT * FROM admin_user WHERE username = $1 AND password = $2",
      [username, password]
    );

    await client.end();

    if (res.rows.length === 1) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, admin: res.rows[0] })
      };
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: false, message: "Usuário ou senha incorretos" })
      };
    }

  } catch (error) {
    console.error("Erro no login:", error);
    if (client) await client.end();
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: "Erro no servidor" })
    };
  }
}
