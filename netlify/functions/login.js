// login.js
// ----------------------------------------------------------
// Autenticação simples do admin
// Valida user/senha com hash SHA256 salvo no banco
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
    const { username, password } = JSON.parse(event.body || "{}");
    if (!username || !password)
      return send(400, { error: "Usuário e senha obrigatórios" });

    // Busca credenciais cadastradas no banco
    const res = await query(`SELECT * FROM admin WHERE id=1`);
    if (res.rows.length === 0) return send(500, { error: "Admin não configurado" });

    const row = res.rows[0];
    const hash = crypto.createHash("sha256").update(password).digest("hex");

    if (username === row.username && hash === row.password_hash) {
      // ⚠️ Aqui poderia gerar JWT, mas deixei simples
      return send(200, { success: true, token: "ok" });
    } else {
      return send(401, { error: "Credenciais inválidas" });
    }
  } catch (err) {
    console.error(err);
    return send(500, { error: "Erro no login" });
  }
};
