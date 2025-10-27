# 🏢 Sistema Integrada

**Integrada** é uma aplicação completa de gestão desenvolvida com foco em condomínios e empreendimentos imobiliários.  
O sistema possui uma **API Node.js com Prisma** para gerenciamento de dados, uma **interface web administrativa** e uma **interface web para proprietários**, oferecendo controle total de operações e informações.

---

## 🚀 Tecnologias Utilizadas

**Back-end:**
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Prisma ORM](https://www.prisma.io/)
- [MySQL](https://www.mysql.com/)
- [Cors](https://www.npmjs.com/package/cors)
- [Dotenv](https://www.npmjs.com/package/dotenv)

**Front-end (Web Proprietária e Web ADM):**
- HTML5 / CSS3 / JavaScript
- Bootstrap 5
- Fetch API (para comunicação com a API)
- Estrutura modular de páginas

---

## 🧩 Estrutura do Projeto

```
integrada_system/
│
├── api/                      # API Node.js com Prisma
│   ├── prisma/               # Schemas e migrations
│   ├── controllers/          # Lógica de controle das rotas
│   ├── routes/               # Definição de endpoints
│   ├── middlewares/          # Middlewares de autenticação e validação
│   ├── services/             # Camada de regras de negócio
│   ├── app.js                # Configuração principal do servidor
│   └── .env                  # Variáveis de ambiente
│
├── web/adm/                  # Interface administrativa
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── imagens/
│
├── web/propietario/          # Interface do proprietário
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── imagens/
│
└── README.md
```

---

## ⚙️ Funcionalidades Principais

### 🔹 API (Node.js + Prisma)
- CRUD completo para entidades principais (condomínios, assembleias, comunicados, usuários, etc)
- Autenticação de usuários (administrador e proprietário)
- Validação e controle de acesso por perfil
- Conexão com banco MySQL via Prisma ORM

### 🔹 Web Administrativa
- Painel de controle com visão geral do sistema
- Cadastro e edição de condomínios, assembleias, comunicados e usuários
- Controle de acessos e permissões
- Relatórios e listagens dinâmicas

### 🔹 Web Proprietária
- Acesso restrito para proprietários
- Visualização de comunicados, assembleias e informações do condomínio
- Interface leve e responsiva

---

## 🧠 Estrutura do Banco (Prisma)

Exemplo simplificado do schema Prisma:

```prisma
model Usuario {
  id         Int      @id @default(autoincrement())
  nome       String
  email      String   @unique
  senha      String
  tipo       TipoUsuario
  criadoEm   DateTime @default(now())
}

model Condominio {
  id          Int        @id @default(autoincrement())
  nome        String
  endereco    String
  criadoEm    DateTime   @default(now())
  assembleias Assembleias[]
}

model Assembleias {
  id             Int      @id @default(autoincrement())
  descricao      String
  data           DateTime
  condominioId   Int
  condominio     Condominio @relation(fields: [condominioId], references: [id])
}

enum TipoUsuario {
  ADMIN
  PROPRIETARIO
}
```

---

## 💻 Como Rodar o Projeto Localmente

### 1️⃣ Clonar o repositório
```bash
git clone https://github.com/Lucaspaiva00/integrada_system.git
cd integrada_system/api
```

### 2️⃣ Instalar dependências
```bash
npm install
```

### 3️⃣ Configurar o `.env`
Crie um arquivo `.env` com as seguintes variáveis:
```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/integrada"
PORT=3000
```

### 4️⃣ Rodar o Prisma
```bash
npx prisma migrate dev
```

### 5️⃣ Iniciar o servidor
```bash
npm start
```

### 6️⃣ Acessar os front-ends
- **Web Admin:** `http://localhost:5500/web/adm`
- **Web Proprietário:** `http://localhost:5500/web/propietario`

---

## 🌐 Deploy

- **API:** hospedada na [Render](https://render.com/)
- **Web (ADM e Proprietário):** hospedadas na [Netlify](https://www.netlify.com/)
- Comunicação via requisições HTTPS com CORS liberado por domínio autorizado.

---

## 👨‍💻 Autor

**Lucas Paiva**  
📍 Jaguariúna - SP  
📧 [paival907@gmail.com](mailto:paival907@gmail.com)  
📱 (19) 99689-2382  
📸 [@paivatech__](https://www.instagram.com/paivatech__)  
💼 [Paiva Tech](https://github.com/Lucaspaiva00)
