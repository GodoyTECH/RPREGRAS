// getAd.js
// ----------------------------------------------------------
// Busca um anúncio específico pelo ID
// ----------------------------------------------------------

const { query, send } = require("./_util");

exports.handler = async (event) => {
  const id = event.queryStringParameters?.id;
  if (!id) return send(400, { error: "ID obrigatório" });

  try {
    const res = await query(`SELECT * FROM machines WHERE id=$1`, [id]);
    if (res.rows.length === 0) return send(404, { error: "Não encontrado" });
    return send(200, res.rows[0]);
  } catch (err) {
    console.error(err);
    return send(500, { error: "Erro ao buscar anúncio" });
  }
};
