import { Client } from "pg";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método não permitido" };
  }

  const { newUser, newPass } = JSON.parse(event.body);

  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query("UPDATE admin SET username=$1, password=$2 WHERE id=1", [newUser, newPass]);
    await client.end();

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error("Erro changeCredentials:", err);
    return { statusCode: 500, body: "Erro ao alterar credenciais" };
  }
}
