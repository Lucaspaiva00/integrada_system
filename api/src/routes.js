import { Router } from "express";
import * as clientesController from "./controllers/clientescontroller.cjs";
import * as inquilinosController from "./controllers/inquilinoscontroller.cjs";
import * as condominioController from "./controllers/condominiocontrollers.cjs";
import * as assembleiasController from "./controllers/assembleiascontroller.cjs";
import * as comunicadosController from "./controllers/comunicadoscontroller.cjs";
import * as prestacaoContasController from "./controllers/prestacaocontascontroller.cjs";
import * as loginControllerfrom from "./controllers/logincontroller.cjs";
import * as filesController from "./controllers/filescontroller.cjs";
import * as boletosController from "./controllers/boletoscontroller.cjs";
import * as configuracaoCobrancaController from "./controllers/configuracaocobrancacontroller.cjs";
import * as itensCobrancaController from "./controllers/itenscobrancacontroller.cjs";
import * as clienteItemCobrancaController from "./controllers/clienteitemcobrancacontroller.cjs";
import * as leiturasController from "./controllers/leiturascontroller.cjs";
import * as webhookController from "./controllers/webhookcontroller.cjs";

const router = Router();

router.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

router.post("/login/proprietario", loginControllerfrom.loginProprietario);

router.get("/", (req, res) => res.json("API respondendo"));

// CLIENTES
router.post("/clientescontroller", clientesController.create);
router.get("/clientescontroller", clientesController.read);
router.put("/clientescontroller/:id", clientesController.update);

// INQUILINOS
router.post("/inquilinoscontroller", inquilinosController.create);
router.get("/inquilinoscontroller", inquilinosController.read);
router.put("/inquilinoscontroller/:id", inquilinosController.update);

// CONDOMINIOS
router.post("/condominiocontroller", condominioController.create);
router.get("/condominiocontroller", condominioController.read);
router.get("/condominiocontroller/:id", condominioController.readById);
router.put("/condominiocontroller/:id", condominioController.update);

// ASSEMBLEIAS
router.post("/assembleiascontroller", assembleiasController.create);
router.get("/assembleiascontroller", assembleiasController.read);
router.delete("/assembleiascontroller/:id", assembleiasController.delete);

// COMUNICADOS ✅ (com GET por id + PUT + DELETE)
router.post("/comunicadoscontroller", comunicadosController.create);
router.get("/comunicadoscontroller", comunicadosController.read);
router.get("/comunicadoscontroller/:id", comunicadosController.readById); // ✅ importante p/ modal
router.put("/comunicadoscontroller/:id", comunicadosController.update);
router.delete("/comunicadoscontroller/:id", comunicadosController.delete);

// PRESTACAO CONTAS
router.get("/prestacaocontascontroller", prestacaoContasController.read);
router.post("/prestacaocontascontroller", prestacaoContasController.create);
router.delete("/prestacaocontascontroller/:id", prestacaoContasController.delete);

// BOLETOS (Santander)
router.post("/boletoscontroller", boletosController.create);
router.post("/boletoscontroller/lote", boletosController.gerarLote);
router.get("/boletoscontroller", boletosController.read);
router.get("/boletoscontroller/:id", boletosController.readById);
router.get("/boletoscontroller/:id/sincronizar", boletosController.sincronizarStatus);
router.delete("/boletoscontroller/:id", boletosController.cancelar);

// CONFIGURAÇÃO DE COBRANÇA (regras por condomínio: vencimento, multa, juros, workspace Santander)
router.get("/configuracaocobrancacontroller/:condominioid", configuracaoCobrancaController.readByCondominio);
router.put("/configuracaocobrancacontroller/:condominioid", configuracaoCobrancaController.upsert);

// ITENS DE COBRANÇA (catálogo por condomínio: taxa, gás, água, fundo de reserva...)
router.post("/itenscobrancacontroller", itensCobrancaController.create);
router.get("/itenscobrancacontroller", itensCobrancaController.read);
router.put("/itenscobrancacontroller/:id", itensCobrancaController.update);
router.delete("/itenscobrancacontroller/:id", itensCobrancaController.desativar);

// VÍNCULO DE ITEM DE COBRANÇA POR UNIDADE (opt-in/opt-out e valor customizado)
router.get("/clienteitemcobrancacontroller/:clienteid", clienteItemCobrancaController.readByCliente);
router.put("/clienteitemcobrancacontroller", clienteItemCobrancaController.upsert);

// LEITURAS DE CONSUMO (água, gás - itens do tipo MEDIDO)
router.get("/leiturascontroller", leiturasController.read);
router.put("/leiturascontroller", leiturasController.upsert);

// WEBHOOK do Santander (confirmação de pagamento/baixa)
router.post("/webhooks/santander", webhookController.receberNotificacao);

// FILES
router.get("/documentos/:modulo/:filename", filesController.readFile);
router.get("/documentos-disponiveis", filesController.readAllDocuments);

router.get("/health", (req, res) => res.status(200).send("OK"));

export default router;
