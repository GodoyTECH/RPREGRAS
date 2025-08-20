import { Client } from "pg";

export async function handler() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const res = await client.query("SELECT * FROM anuncios ORDER BY id ASC");
    await client.end();

    const ads = res.rows.map(r => ({
      ...r,
      images: r.images ? JSON.parse(r.images) : []
    }));

    return { statusCode: 200, body: JSON.stringify(ads) };
  } catch (err) {
    console.error("Erro getAds:", err);
    return { statusCode: 500, body: "Erro ao buscar anúncios" };
  }
}
