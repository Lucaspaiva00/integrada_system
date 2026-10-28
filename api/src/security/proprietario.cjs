const { createHmac, randomBytes, timingSafeEqual } = require("node:crypto");
// Configure PROPRIETARIO_SESSION_SECRET for sessions to survive API restarts.
const secret =
  process.env.PROPRIETARIO_SESSION_SECRET || randomBytes(48).toString("hex");
const ttl = 8 * 60 * 60;
function issue(clienteid, condominioid) {
  const payload = Buffer.from(
    JSON.stringify({
      clienteid,
      condominioid,
      exp: Math.floor(Date.now() / 1000) + ttl,
    }),
  ).toString("base64url");
  return `${payload}.${createHmac("sha256", secret).update(payload).digest("base64url")}`;
}
function verify(token) {
  if (typeof token !== "string" || token.length > 2048)
    throw new Error("Sessão inválida");
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) throw new Error("Sessão inválida");
  const expected = createHmac("sha256", secret).update(payload).digest();
  const actual = Buffer.from(signature, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
    throw new Error("Sessão inválida");
  const data = JSON.parse(Buffer.from(payload, "base64url").toString());
  if (
    !Number.isInteger(data.clienteid) ||
    !Number.isInteger(data.condominioid) ||
    !(data.exp > Date.now() / 1000)
  )
    throw new Error("Sessão expirada");
  return data;
}
function authenticate(req, res, next) {
  try {
    req.proprietario = verify(
      req.headers.authorization?.replace(/^Bearer /, ""),
    );
    res.set("Cache-Control", "no-store");
    next();
  } catch {
    res.status(401).json({ error: "Sua sessão expirou. Entre novamente." });
  }
}
// Bound memory and per-IP throttling; does not retain CPF or credentials.
const attempts = new Map();
function loginLimit(req, res, next) {
  const now = Date.now();
  for (const [key, value] of attempts)
    if (value.until < now) attempts.delete(key);
  const key = req.ip;
  const value = attempts.get(key) || { count: 0, until: now + 15 * 60 * 1000 };
  value.count++;
  if (attempts.size >= 10000 && !attempts.has(key))
    return res
      .status(429)
      .json({ error: "Tente novamente em alguns minutos." });
  attempts.set(key, value);
  res.once?.("finish", () => {
    if (res.statusCode < 400) attempts.delete(key);
  });
  if (value.count > 15)
    return res
      .status(429)
      .set("Retry-After", String(Math.ceil((value.until - now) / 1000)))
      .json({ error: "Muitas tentativas. Aguarde 15 minutos." });
  next();
}
module.exports = { issue, verify, authenticate, loginLimit };
