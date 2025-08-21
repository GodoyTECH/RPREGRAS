//saveAd.jsimport { Client } from "pg";
// saveAd.js
// ----------------------------------------------------------
// Cria ou atualiza um anúncio no banco de dados
// Requer: title, images[] obrigatórios
// Se enviar "id", atualiza o anúncio existente
// ----------------------------------------------------------

const { query, send } = require("./_util");

exports.handler = async (event) => {
  // CORS para requisições OPTIONS (pré-flight)
  if (event.httpMethod === "OPTIONS") {
    return send(200, {});
  }
  if (event.httpMethod !== "POST") {
    return send(405, { error: "Método não permitido" });
  }

  try {
    const data = JSON.parse(event.body || "{}");
    const { id, title, price, rent, description, images } = data;

    // Validação básica
    if (!title || !Array.isArray(images)) {
      return send(400, { error: "Título e imagens são obrigatórios" });
    }

    if (id) {
      // Atualizar anúncio existente
      await query(
        `UPDATE machines
         SET title=$1, price=$2, rent=$3, description=$4, images=$5
         WHERE id=$6`,
        [title, price, rent, description, JSON.stringify(images), id]
      );
      return send(200, { success: true, id });
    } else {
      // Criar novo anúncio
      const res = await query(
        `INSERT INTO machines (title, price, rent, description, images)
         VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [title, price, rent, description, JSON.stringify(images)]
      );
      return send(200, { success: true, id: res.rows[0].id });
    }
  } catch (err) {
    console.error(err);
    return send(500, { error: "Erro ao salvar anúncio" });
  }
};
