import { Client } from "pg";

export async function handler(event) {
  const { id } = event.queryStringParameters;

  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const res = await client.query("SELECT * FROM anuncios WHERE id=$1", [id]);
    await client.end();

    if (res.rows.length === 0) {
      return { statusCode: 404, body: "Anúncio não encontrado" };
    }

    const ad = res.rows[0];
    ad.images = ad.images ? JSON.parse(ad.images) : [];

    return { statusCode: 200, body: JSON.stringify(ad) };
  } catch (err) {
    console.error("Erro getAd:", err);
    return { statusCode: 500, body: "Erro ao buscar anúncio" };
  }
}
