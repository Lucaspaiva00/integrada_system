const { createHash, randomBytes } = require("node:crypto");
const multer = require("multer");
const prisma = require("../../prisma/connection.cjs");

const MAX_PDF = 4 * 1024 * 1024;
const fields = { id: true, clienteid: true, condominioid: true, competencia: true };
const uploadOne = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PDF, files: 1, fields: 3, fieldSize: 64, parts: 5 },
}).single("pdf");

function upload(req, res, next) {
  uploadOne(req, res, (error) => {
    if (error?.code === "LIMIT_FILE_SIZE")
      return res.status(413).json({ error: "O PDF deve ter até 4 MB." });
    const file = req.file;
    if (error || !file || file.mimetype !== "application/pdf" ||
        !/^%PDF-\d\.\d[\r\n]/.test(file.buffer.subarray(0, 10).toString("ascii")) ||
        !/%%EOF\s*$/.test(file.buffer.subarray(-1024).toString("latin1"))) {
      return res.status(400).json({ error: "Anexe um arquivo PDF válido." });
    }
    next();
  });
}

const id = (value) => typeof value === "string" && /^[1-9]\d{0,9}$/.test(value) &&
  Number(value) <= 2147483647 ? Number(value) : null;
const notFound = (res) => res.status(404).json({ error: "Boleto ou proprietário não encontrado." });
const hashCode = (code) => createHash("sha256").update(code).digest("hex");
const handle = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    if (error.code === "P2025" || error.code === "P2003") return notFound(res);
    if (error.code === "P2002")
      return res.status(409).json({ error: "Já existe um PDF para essa referência. Use Substituir." });
    console.error("Erro no módulo de boletos PDF:", error.code || error.name);
    res.status(500).json({ error: "Não foi possível concluir a operação." });
  }
};

const condos = handle(async (_req, res) => {
  res.json(await prisma.condominio.findMany({
    select: { condominioid: true, nomecondominio: true },
    orderBy: { nomecondominio: "asc" },
  }));
});

const owners = handle(async (req, res) => {
  const condominioid = id(req.params.condominioid);
  if (!condominioid) return notFound(res);
  const rows = await prisma.clientes.findMany({
    where: { CondominioID: condominioid },
    select: { clienteid: true, nome: true, apartamento: true, boletoCodigoHash: true },
    orderBy: { nome: "asc" },
  });
  res.json(rows.map(({ boletoCodigoHash, ...owner }) => ({
    ...owner, temCodigo: Boolean(boletoCodigoHash),
  })));
});

function ownerScope(condominioid, clienteid) {
  return { clienteid, condominioid, Cliente: { CondominioID: condominioid } };
}

const list = handle(async (req, res) => {
  const condominioid = id(req.query.condominioid);
  const clienteid = id(req.query.clienteid);
  if (!condominioid) return notFound(res);
  res.json(await prisma.boletoPDF.findMany({
    where: { condominioid, ...(clienteid ? { clienteid } : {}) },
    select: { ...fields, Cliente: { select: { nome: true, apartamento: true } } },
    orderBy: [{ competencia: "desc" }, { id: "desc" }],
  }));
});

const create = handle(async (req, res) => {
  const clienteid = id(req.body.clienteid);
  const condominioid = id(req.body.condominioid);
  const ref = req.body.competencia;
  if (!clienteid || !condominioid || typeof ref !== "string" || !/^[2]\d{3}-(0[1-9]|1[0-2])$/.test(ref)) {
    return res.status(400).json({ error: "Informe condomínio, proprietário e mês de referência." });
  }
  const record = await prisma.$transaction(async (db) => {
    // Lock the owner while checking the condominium and inserting the document.
    const owner = await db.$queryRaw`SELECT "clienteid" FROM "Clientes"
      WHERE "clienteid" = ${clienteid} AND "CondominioID" = ${condominioid} FOR SHARE`;
    if (!owner.length) return null;
    return db.boletoPDF.create({
      data: { clienteid, condominioid, competencia: new Date(`${ref}-01T00:00:00Z`), pdf: req.file.buffer },
      select: fields,
    });
  });
  if (!record) return notFound(res);
  res.status(201).json(record);
});

const replace = handle(async (req, res) => {
  const boletoid = id(req.params.id);
  if (!boletoid) return notFound(res);
  res.json(await prisma.boletoPDF.update({
    where: { id: boletoid }, data: { pdf: req.file.buffer }, select: fields,
  }));
});

const remove = handle(async (req, res) => {
  const boletoid = id(req.params.id);
  if (!boletoid) return notFound(res);
  await prisma.boletoPDF.delete({ where: { id: boletoid }, select: { id: true } });
  res.status(204).end();
});

const issueCode = handle(async (req, res) => {
  const clienteid = id(req.params.clienteid);
  const condominioid = id(req.params.condominioid);
  if (!clienteid || !condominioid) return notFound(res);
  const codigo = randomBytes(16).toString("hex");
  await prisma.clientes.update({
    where: { clienteid, CondominioID: condominioid },
    data: { boletoCodigoHash: hashCode(codigo) },
    select: { clienteid: true },
  });
  res.json({ codigo });
});

const authorizeOwner = handle(async (req, res, next) => {
  const { clienteid, condominioid } = req.proprietario;
  const code = req.get("X-Boleto-Code")?.trim().toLowerCase();
  if (!code || !/^[a-f0-9]{32}$/.test(code)) {
    return res.status(403).json({ error: "Informe o código de acesso aos boletos." });
  }
  const where = ownerScope(condominioid, clienteid);
  where.Cliente.boletoCodigoHash = hashCode(code);
  const owner = await prisma.clientes.findFirst({
    where: { clienteid, ...where.Cliente },
    select: { clienteid: true },
  });
  if (!owner) return res.status(403).json({ error: "Código inválido. Consulte a administradora." });
  req.boletoScope = where;
  next();
});

const ownerList = handle(async (req, res) => {
  const rows = await prisma.boletoPDF.findMany({
    where: req.boletoScope,
    select: { id: true, competencia: true },
    orderBy: { competencia: "desc" },
  });
  res.json(rows.map((row) => ({ ...row, temPdf: true })));
});

const send = handle(async (req, res) => {
  const boletoid = id(req.params.id);
  if (!boletoid) return notFound(res);
  const record = await prisma.boletoPDF.findFirst({
    where: { id: boletoid, ...req.boletoScope },
    select: { competencia: true, pdf: true },
  });
  if (!record) return notFound(res);
  const ref = record.competencia.toISOString().slice(0, 7);
  const disposition = req.query.download === "1" ? "attachment" : "inline";
  res.set({
    "Cache-Control": "private, no-store",
    "Content-Type": "application/pdf",
    "Content-Disposition": `${disposition}; filename="boleto-${ref}-${boletoid}.pdf"`,
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "sandbox",
  }).send(Buffer.from(record.pdf));
});

module.exports = { upload, condos, owners, list, create, replace, remove, issueCode, authorizeOwner, ownerList, send };
