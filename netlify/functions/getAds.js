// getAds.js
// ----------------------------------------------------------
// Lista todos os anúncios (mais recentes primeiro)
// ----------------------------------------------------------

const { query, send } = require("./_util");

exports.handler = async () => {
  try {
    const res = await query(
      `SELECT id, title, price, rent, description, images, created_at
       FROM machines ORDER BY created_at DESC`
    );
    return send(200, res.rows);
  } catch (err) {
    console.error(err);
    return send(500, { error: "Erro ao buscar anúncios" });
  }
};
