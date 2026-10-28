const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createHmac } = require("node:crypto");
process.env.PROPRIETARIO_SESSION_SECRET = "test-only-secret";
const security = require("../src/security/proprietario.cjs");
const prismaPath = require.resolve("../prisma/connection.cjs");
let owner = {
  clienteid: 7,
  CondominioID: 3,
  nome: "Teste",
  apartamento: "12",
  Condominio: { condominioid: 3, nomecondominio: "Condomínio" },
};
let customers = [];
let query;
const model = {
  findMany: async (q) => {
    query = q;
    return [];
  },
};
require.cache[prismaPath] = {
  id: prismaPath,
  filename: prismaPath,
  loaded: true,
  exports: {
    clientes: {
      findUnique: async () => owner,
      findMany: async () => customers,
    },
    boleto: model,
    comunicados: model,
    prestacaoContas: model,
    assembleia: model,
  },
};
const portal = require("../src/controllers/portalcontroller.cjs");
const login = require("../src/controllers/logincontroller.cjs");
function response() {
  return {
    code: 200,
    data: null,
    status(n) {
      this.code = n;
      return this;
    },
    json(v) {
      this.data = v;
      return this;
    },
    set() {
      return this;
    },
  };
}
test("session signature, expiry and missing token are rejected", () => {
  const token = security.issue(7, 3);
  assert.equal(security.verify(token).clienteid, 7);
  assert.throws(() => security.verify(token + "x"));
  assert.throws(() => security.verify());
  const payload = Buffer.from(
    JSON.stringify({ clienteid: 7, condominioid: 3, exp: 1 }),
  ).toString("base64url");
  assert.throws(() =>
    security.verify(
      payload +
        "." +
        createHmac("sha256", process.env.PROPRIETARIO_SESSION_SECRET)
          .update(payload)
          .digest("base64url"),
    ),
  );
  const res = response();
  let called = false;
  security.authenticate({ headers: {} }, res, () => (called = true));
  assert.equal(res.code, 401);
  assert.equal(called, false);
});
test("portal ignores injected owner/condominium IDs and restricts all queries on server", async () => {
  const req = {
    proprietario: { clienteid: 7, condominioid: 3 },
    query: { clienteid: 999, condominioid: 999 },
  };
  for (const name of ["boletos", "comunicados", "prestacoes", "assembleias"]) {
    const res = response();
    await portal[name](req, res);
    assert.equal(res.code, 200);
    assert.deepEqual(
      query.where,
      name === "boletos" ? { clienteid: 7 } : { CondominioID: 3 },
    );
    assert.equal(query.select?.respostaBanco, undefined);
  }
  owner = { ...owner, CondominioID: 9 };
  const res = response();
  await portal.boletos(req, res);
  assert.equal(res.code, 401);
  owner = { ...owner, CondominioID: 3 };
});
test("login handles repeated apartment, formatted CPF, ambiguity and malformed input", async () => {
  customers = [
    { ...owner, cpf: "123.456.789-00" },
    { ...owner, clienteid: 8, cpf: "111.111.111-11" },
  ];
  let res = response();
  await login.loginProprietario(
    { body: { apartamento: "12", cpf: "8900" } },
    res,
  );
  assert.equal(res.code, 200);
  assert.equal(security.verify(res.data.token).clienteid, 7);
  assert.equal(res.data.cliente.cpf, undefined);
  res = response();
  await login.loginProprietario(
    { body: { apartamento: "12", cpf: "0000" } },
    res,
  );
  assert.equal(res.code, 401);
  customers.push({ ...customers[0], clienteid: 9 });
  res = response();
  await login.loginProprietario(
    { body: { apartamento: "12", cpf: "8900" } },
    res,
  );
  assert.equal(res.code, 401);
  res = response();
  await login.loginProprietario(
    { body: { apartamento: {}, cpf: "8900" } },
    res,
  );
  assert.equal(res.code, 400);
});
test("login throttle blocks repeated attempts", () => {
  for (let i = 0; i < 16; i++) {
    const res = response();
    security.loginLimit({ ip: "test" }, res, () => {});
    if (i === 15) assert.equal(res.code, 429);
  }
});
