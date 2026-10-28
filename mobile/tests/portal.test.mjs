import { test, after } from "node:test";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    const path = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
    const content = await readFile(
      new URL("../../web_user/" + path, import.meta.url),
    );
    res.setHeader(
      "Content-Type",
      { ".html": "text/html", ".css": "text/css", ".js": "text/javascript" }[
        extname(path)
      ] || "application/octet-stream",
    );
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = "http://127.0.0.1:" + server.address().port;
after(() => server.close());
const user = {
  nome: "Proprietária de Teste",
  apartamento: "12",
  clienteid: 7,
  condominioid: 3,
  condominio: { nome: "Condomínio de Teste" },
};
const data = {
  boletos: [
    {
      competencia: "2026-10-01",
      vencimento: "2026-10-10",
      valorTotal: "123.45",
      status: "REGISTRADO",
      linhaDigitavel: "12345678901234567890123456789012345678901234567",
      Itens: [
        { descricao: "Taxa <script>alert(1)</script>", valorTotal: "123.45" },
      ],
    },
  ],
  comunicados: [
    {
      descricao: "Aviso <img src=x onerror=alert(1)>",
      datacomunicado: "2026-10-01",
      documento: "https://example.org/aviso.pdf",
    },
  ],
  prestacoes: [
    { mes: "2026-10-01", documento: "https://example.org/contas.pdf" },
  ],
  assembleias: [
    { descricao: "Assembleia do condomínio", documento: "javascript:alert(1)" },
  ],
};
test("mobile and desktop layouts, authenticated navigation and hostile data", async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH,
  });
  try {
    for (const width of [320, 360, 390, 412, 768, 1440]) {
      const context = await browser.newContext({
        viewport: { width, height: 844 },
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.route(
        "https://integrada-api.onrender.com/**",
        async (route) => {
          const path = new URL(route.request().url()).pathname;
          assert.match(route.request().headers().authorization, /Bearer test/);
          await route.fulfill({
            json:
              path === "/portal/me" ? user : data[path.split("/").at(-1)] || [],
          });
        },
      );
      await page.addInitScript(() =>
        sessionStorage.setItem("integrada.token", "test"),
      );
      for (const file of [
        "index.html",
        "boleto.html",
        "comunicados.html",
        "prestacaocontas.html",
        "assembleias.html",
      ]) {
        await page.goto(base + "/" + file);
        await page.waitForSelector(".topbar");
        await page.waitForFunction(() => !document.querySelector(".loading"));
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `${width}: ${file} horizontal overflow`,
        );
        assert.equal(await page.locator("main script,main img").count(), 0);
        if (file === "assembleias.html")
          assert.equal(await page.locator("[data-document]").count(), 0);
        if (width < 700) {
          await page.getByRole("button", { name: "Abrir menu" }).click();
          assert.equal(
            await page
              .locator("#sidebar")
              .evaluate((e) => e.classList.contains("open")),
            true,
          );
          await page.keyboard.press("Escape");
        }
      }
      assert.deepEqual(errors, []);
      if (width === 390)
        await page.screenshot({
          path: "/tmp/integrada-assembleias.png",
          fullPage: true,
        });
      await context.close();
    }
  } finally {
    await browser.close();
  }
});
test("login, loading failure, retry, empty state, session expiry and logout", async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH,
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  let mode = "ok";
  await page.route("https://integrada-api.onrender.com/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/login/proprietario") {
      assert.deepEqual(route.request().postDataJSON(), {
        apartamento: "12",
        cpf: "8900",
      });
      return route.fulfill({ json: { token: "test", cliente: user } });
    }
    if (path === "/portal/me") return route.fulfill({ json: user });
    if (mode === "error")
      return route.fulfill({ status: 500, json: { error: "Falha de teste" } });
    if (mode === "expired")
      return route.fulfill({ status: 401, json: { error: "Expirou" } });
    return route.fulfill({ json: [] });
  });
  try {
    await page.goto(base + "/boleto.html");
    await page.waitForURL("**/login_inquilino.html");
    await page.locator("#apartamento").fill("12");
    await page.locator("#cpf").fill("8900");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL("**/index.html");
    await page.waitForSelector(".hero");
    await page.screenshot({ path: "/tmp/integrada-home.png", fullPage: true });
    mode = "error";
    await page.goto(base + "/boleto.html");
    await page.getByRole("button", { name: "Tentar novamente" }).waitFor();
    mode = "ok";
    await page.getByRole("button", { name: "Tentar novamente" }).click();
    await page.getByText("Nenhum registro disponível").waitFor();
    mode = "expired";
    await page.getByRole("button", { name: "Atualizar dados" }).click();
    await page.waitForURL("**/login_inquilino.html");
    assert.equal(
      await page.evaluate(() => sessionStorage.getItem("integrada.token")),
      null,
    );
    await page.screenshot({ path: "/tmp/integrada-login.png", fullPage: true });
  } finally {
    await browser.close();
  }
});
