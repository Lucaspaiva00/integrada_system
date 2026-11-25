const { createHash, createHmac, timingSafeEqual } = require("node:crypto");

const hash = (value) => createHash("sha256").update(value).digest();
const password = process.env.BOLETOS_ADMIN_PASSWORD;
const enabled = password?.length >= 32;
const sign = (expiry) =>
  createHmac("sha256", password).update(`integrada:boletos:admin:${expiry}`).digest();

function login(req, res) {
  res.set("Cache-Control", "no-store");
  if (!enabled) return res.status(503).json({ error: "Acesso administrativo indisponível." });
  const supplied = req.body?.password;
  if (typeof supplied !== "string" || !timingSafeEqual(hash(supplied), hash(password))) {
    return res.status(401).json({ error: "Senha administrativa inválida." });
  }
  const expiry = Math.floor(Date.now() / 1000) + 8 * 60 * 60;
  return res.json({ token: `${expiry}.${sign(expiry).toString("base64url")}` });
}

function authenticate(req, res, next) {
  res.set("Cache-Control", "no-store");
  const token = req.get("Authorization")?.match(/^Bearer (\d{10})\.([\w-]{43})$/);
  if (enabled && token && Number(token[1]) > Date.now() / 1000) {
    const signature = Buffer.from(token[2], "base64url");
    if (timingSafeEqual(signature, sign(token[1]))) return next();
  }
  return res.status(401).json({ error: "Entre com a senha administrativa de boletos." });
}

module.exports = { login, authenticate };
