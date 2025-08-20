import { Client } from "pg";

export async function handler(event) {
  const { id } = event.queryStringParameters;

  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query("DELETE FROM anuncios WHERE id=$1", [id]);
    await client.end();

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error("Erro deleteAd:", err);
    return { statusCode: 500, body: "Erro ao excluir anúncio" };
  }
}
