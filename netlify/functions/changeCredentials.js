// changeCredentials.js
// ----------------------------------------------------------
// Altera usuário/senha do admin
// Senha é salva com SHA256
// ----------------------------------------------------------

const { query, send } = require("./_util");
const crypto = require("crypto");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return send(200, {});
  }
  if (event.httpMethod !== "POST") {
    return send(405, { error: "Método não permitido" });
  }

  try {
    const { newUser, newPass } = JSON.parse(event.body || "{}");
    if (!newUser || !newPass)
      return send(400, { error: "Usuário e senha obrigatórios" });

    const hash = crypto.createHash("sha256").update(newPass).digest("hex");

    await query(
      `UPDATE admin SET username=$1, password_hash=$2 WHERE id=1`,
      [newUser, hash]
    );

    return send(200, { success: true });
  } catch (err) {
    console.error(err);
    return send(500, { error: "Erro ao alterar credenciais" });
  }
};
