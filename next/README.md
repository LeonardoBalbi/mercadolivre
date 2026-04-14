# MercadoLivre Clone - Next.js

Versão Next.js do clone MercadoLivre com suporte completo a TypeScript, Prisma ORM e Tailwind CSS.

## 🚀 Tecnologias Utilizadas

- **Next.js 14** - Framework React moderno
- **TypeScript** - Tipagem estática
- **Prisma** - ORM para banco de dados
- **Tailwind CSS** - Framework CSS utilitário
- **MySQL** - Banco de dados relacional

## 📦 Installação

### Pré-requisitos

- Node.js 18+ e npm
- MySQL 8.0+

### Passos de Instalação

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente:**
   
   Copie `.env.example` para `.env.local` e configure:
   ```bash
   DATABASE_URL="mysql://seu_usuario:sua_senha@localhost:3306/mercadolivre"
   ```

3. **Gerar cliente Prisma:**
   ```bash
   npx prisma generate
   ```

4. **Executar migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Seed inicial (opcional):**
   ```bash
   npx prisma db seed
   ```

## 🏃 Rodando a Aplicação

### Desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000)

### Produção
```bash
npm run build
npm start
```

## 📁 Estrutura do Projeto

```
next/
├── app/
│   ├── api/
│   │   ├── products/
│   │   │   └── route.ts      # Endpoints de produtos
│   │   └── orders/
│   │       └── route.ts       # Endpoints de pedidos
│   ├── globals.css            # Estilos globais
│   ├── layout.tsx             # Layout raiz
│   └── page.tsx               # Página inicial
├── components/                # Componentes React reutilizáveis
├── lib/
│   └── prisma.ts              # Cliente Prisma singleton
├── prisma/
│   └── schema.prisma          # Schema do banco de dados
├── package.json
├── tsconfig.json
├── next.config.js
└── tailwind.config.ts
```

## 📊 Modelos de Dados

### Product
- `id` - Identificador único
- `title` - Título do produto
- `price` - Preço
- `discount` - Desconto percentual
- `image` - URL da imagem
- `description` - Descrição
- `published` - Status de publicação

### Customer
- `id` - Identificador único
- `name` - Nome
- `email` - Email único
- `phone` - Telefone

### Order
- `id` - Identificador único
- `customer_id` - Referência ao cliente
- `status_id` - Status do pedido
- `total_price` - Preço total
- `created_at` - Data de criação

## 🔌 API Endpoints

### Produtos

**GET /api/products**
- Lista todos os produtos publicados
- Resposta: Array de produtos

**POST /api/products**
- Cria novo produto
- Body: `{ title, price, discount, image, description }`

### Pedidos

**GET /api/orders**
- Lista todos os pedidos
- Resposta: Array de pedidos com detalhes

**POST /api/orders**
- Cria novo pedido
- Body: `{ customer_id, items: [{ product_id, quantity, price }] }`

## 🛠️ Utilitários Disponíveis

### Prisma Studio
Para visualizar/editar dados interativamente:
```bash
npx prisma studio
```

## 📝 Variáveis de Ambiente

```
DATABASE_URL=mysql://usuario:senha@localhost:3306/mercadolivre
NODE_ENV=development
```

## 🤝 Contribuindo

Pull requests são bem-vindos! Para mudanças maiores, abra uma issue primeiro.

## 📄 Licença

MIT
