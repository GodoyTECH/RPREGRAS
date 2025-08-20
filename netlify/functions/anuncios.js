import { Client } from "pg";

export async function handler(event) {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  if (event.httpMethod === "GET") {
    const res = await client.query("SELECT * FROM anuncios ORDER BY id ASC");
    await client.end();
    return { statusCode: 200, body: JSON.stringify(res.rows) };
  }

  if (event.httpMethod === "POST") {
    const { id, title, price, rent, description, images } = JSON.parse(event.body);

    if (id) {
      // Update
      await client.query(
        "UPDATE anuncios SET title=$1, price=$2, rent=$3, description=$4, images=$5 WHERE id=$6",
        [title, price, rent, description, images, id]
      );
    } else {
      // Insert
      await client.query(
        "INSERT INTO anuncios (title, price, rent, description, images) VALUES ($1,$2,$3,$4,$5)",
        [title, price, rent, description, images]
      );
    }

    await client.end();
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  }

  if (event.httpMethod === "DELETE") {
    const { id } = JSON.parse(event.body);
    await client.query("DELETE FROM anuncios WHERE id=$1", [id]);
    await client.end();
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  }

  await client.end();
  return { statusCode: 400, body: "Requisição inválida" };
}
