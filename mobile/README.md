# Integrada — Android do proprietário

HTML/CSS/JavaScript em `../web_user` é a única fonte das telas web e Android.
Identidade derivada de `web/css/style.css`: #0b0c10, #11131a, #e11d2e,
cards claros com borda vermelha, raios de 16px e menu lateral escuro.
Nenhuma migração ou alteração no painel administrativo.

## Compilar

Requisitos: Node 22+, JDK 21, Android SDK 36 e Build Tools 36.0.0.

```sh
cd mobile
npm ci
npm run sync
npm run apk
```

Saída: `android/app/build/outputs/apk/debug/app-debug.apk`.
APK debug é assinado automaticamente para instalação direta, Android 7+.
Para distribuição permanente, gerar chave de release privada e preservá-la;
instalações debug não são a estratégia de atualização de produção.
Não há servidor remoto carregado no WebView: telas ficam no APK, somente os
pedidos HTTPS usam a API existente. Sem permissão de arquivos, câmera ou localização.
Documentos abrem no navegador nativo. Clipboard e botão Voltar usam plugins Capacitor.
Não há modo offline, push ou versão iOS nativa.

## API e publicação

Publicar a API atualizada **antes** de liberar este portal/app. O novo cliente
não faz fallback para consultas públicas. Utiliza `/login/proprietario` e
`/portal/{me,boletos,comunicados,prestacoes,assembleias}`. O login antigo continua
recebendo `cliente`; agora também recebe sessão assinada de oito horas. Imóvel e
últimos quatro dígitos continuam sendo as credenciais. CPF formatado e unidades
com nomes repetidos são tratados; combinações ambíguas são negadas.

Configurar `PROPRIETARIO_SESSION_SECRET` com segredo aleatório de 48 bytes ou mais
no Render. Sem ele, um segredo efêmero é criado por processo e reinícios exigem
novo login. `TRUST_PROXY_HOPS=1` corresponde ao proxy de entrada; ajustar se a
infraestrutura mudar. O limite de tentativas é em memória, por IP e por processo.
Para múltiplas instâncias, compartilhar segredo e implementar limitador central.
A sessão fica em sessionStorage e não persiste após encerramento do WebView.

**Dívida de segurança anterior:** as rotas administrativas legadas não exigem
sessão no código atual. Não foram bloqueadas aqui porque o painel não possui
fluxo de autenticação de administrador e isso o interromperia. A proteção dos
novos endpoints NÃO fecha essas rotas públicas. Antes de disponibilizar o sistema
amplamente, implementar autenticação/autorização administrativa e proteger
rotas de leitura/escrita e documentos. O login com quatro dígitos também deve
futuramente evoluir para senha ou código validado. Não afirmar que a API inteira
está protegida com esta alteração.

O schema Boleto não tem campo de PDF. Por isso o app exibe linha digitável,
código de barras/Pix quando fornecidos, valores, composição, situação e pagamento;
não inventa URL de boleto nem consulta o Santander diretamente. Comunicados,
prestações e assembleias exibem documentos HTTPS existentes.

## Validação

```sh
node --test api/tests/*.cjs # executar na raiz do repositório
cd mobile
npx playwright install chromium
npm test
```

Testes de navegador iniciam servidor local automaticamente, interceptam apenas a
API e usam dados fictícios. Cobrem 320/360/390/412/768/1440 px, todos os módulos,
login, erro/repetição, estado vazio, expiração, menu e conteúdo hostil.
`CHROME_PATH` permite usar um Chromium já instalado.
Os testes da API usam Prisma simulado: cobrem assinatura, expiração, isolamento,
reassociação de condomínio, login e limite de tentativas.
Validação com banco real e teste em aparelho precisam de credenciais legítimas;
não usar cadastros pessoais do repositório como conta de teste.
