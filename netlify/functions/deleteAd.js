// deleteAd.js
// ----------------------------------------------------------
// Exclui um anúncio pelo ID
// ----------------------------------------------------------

const { query, send } = require("./_util");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return send(200, {});
  }
  if (event.httpMethod !== "POST") {
    return send(405, { error: "Método não permitido" });
  }

  try {
    const { id } = JSON.parse(event.body || "{}");
    if (!id) return send(400, { error: "ID obrigatório" });

    await query(`DELETE FROM machines WHERE id=$1`, [id]);
    return send(200, { success: true });
  } catch (err) {
    console.error(err);
    return send(500, { error: "Erro ao excluir anúncio" });
  }
};
