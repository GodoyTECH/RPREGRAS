//saveAd.jsimport { Client } from "pg";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método não permitido" };
  }

  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const { id, title, price, rent, description, images } = JSON.parse(event.body);

    if (id) {
      // Atualizar
      await client.query(
        "UPDATE anuncios SET title=$1, price=$2, rent=$3, description=$4, images=$5 WHERE id=$6",
        [title, price, rent, description, JSON.stringify(images), id]
      );
    } else {
      // Criar
      await client.query(
        "INSERT INTO anuncios (title, price, rent, description, images) VALUES ($1,$2,$3,$4,$5)",
        [title, price, rent, description, JSON.stringify(images)]
      );
    }

    await client.end();
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error("Erro saveAd:", err);
    return { statusCode: 500, body: "Erro ao salvar anúncio" };
  }
}
