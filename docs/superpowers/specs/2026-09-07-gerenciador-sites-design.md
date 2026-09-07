# Gerenciador de Sites JvSoft — Design

Data: 2026-09-07

## Objetivo

App web para o admin único da JvSoft (Jhony) gerenciar os sites em produção
para clientes: acompanhar prioridade entre projetos e progresso de um
checklist de etapas por site.

## Fora do escopo

- Sem cadastro/self-signup — a conta é criada direto no banco via seed.
- Sem múltiplos usuários ou permissões — um único admin.
- Sem dados de cliente (nome, contato, empresa).
- Sem dados financeiros (valor, pagamento, prazos).
- Apenas o nome do site + checklist + prioridade/status.

## Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Banco de dados:** Postgres via Vercel Postgres (Neon)
- **ORM:** Prisma
- **Deploy:** Vercel
- **Auth:** login único email/senha, sem tela de cadastro

## Autenticação

- Rota `/login` com formulário email + senha.
- Senha armazenada com hash (bcrypt) na tabela `User`.
- Conta criada via script de seed do Prisma (`prisma/seed.ts`), rodado
  manualmente contra o banco — não existe rota de criação de conta na
  aplicação.
- Sessão via cookie httpOnly assinado (JWT), validada em middleware que
  protege todas as rotas exceto `/login`.

## Modelo de dados

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}

enum SiteStatus {
  NAO_INICIADO
  EM_ANDAMENTO
  REVISAO
  CONCLUIDO
  PAUSADO
}

model Site {
  id        String     @id @default(cuid())
  name      String
  status    SiteStatus @default(NAO_INICIADO)
  priority  Int        // posição dentro da coluna (status); menor = mais prioritário
  checklist ChecklistItem[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model ChecklistItem {
  id        String   @id @default(cuid())
  siteId    String
  site      Site     @relation(fields: [siteId], references: [id], onDelete: Cascade)
  label     String
  done      Boolean  @default(false)
  order     Int
}

model ChecklistTemplateItem {
  id    String @id @default(cuid())
  label String
  order Int
}
```

Ao criar um `Site`, os itens de `ChecklistTemplateItem` são copiados para
`ChecklistItem` daquele site (mesmo texto e ordem), servindo de ponto de
partida editável.

## Telas

### `/login`
Formulário simples de email + senha. Erro genérico em caso de falha.

### `/` — Dashboard (Kanban)
- Colunas fixas, uma por `SiteStatus`: Não iniciado, Em andamento, Revisão,
  Concluído, Pausado.
- Cada card mostra: nome do site, barra/label de progresso do checklist
  (ex: "3/8").
- Drag-and-drop:
  - Arrastar entre colunas → atualiza `status` do site.
  - Arrastar dentro da coluna → atualiza `priority` (posição) dos sites
    afetados naquela coluna.
- Botão para criar novo site (nome + checklist copiado do template).

### `/sites/[id]` — Detalhe do site
- Nome do site (editável), status atual.
- Lista de checklist: checkbox por item, reordenável (drag), com opção de
  adicionar novo item e remover item existente.

### `/templates` — Checklist padrão
- Lista de `ChecklistTemplateItem` editável (adicionar, remover, reordenar,
  renomear). Alterações aqui não afetam sites já criados, só os próximos.

## Identidade visual

- Paleta de marca JvSoft, reaproveitando os tokens do site institucional
  (`Site JvSoft/css/style.css`):
  - `--blue-800: #1E3F82`, `--blue-700: #2D559B`, `--blue-600: #3A6EAC`
  - `--teal-700: #1F6E63`, `--teal-600: #2F9385`, `--teal-500: #45A99A`,
    `--mint: #79C0C5`
  - Gradiente de marca: `linear-gradient(135deg,#2D559B 0%,#3A6EAC 45%,#2F9385 100%)`
  - Base clara: `--paper: #FAFAF9`, `--paper-2: #F1F3F7`, `--line: #E4E7EC`
  - Escuro: `--ink: #0B0D14`, `--ink-2: #141824`
  - Texto: `--text: #0B0D14`, `--text-2: #5A6472`
- Logo: `Site JvSoft/img/logo-jvsoft-icon.webp` (símbolo "JV" com seta, sem
  moldura) no header/sidebar do app e como favicon.

## Testes

- Testes unitários para lógica de reordenação de prioridade (cálculo de
  posição ao mover card entre/dentro de colunas).
- Teste de integração do fluxo de login (credenciais válidas/inválidas,
  proteção de rotas via middleware).
- Teste do seed de checklist ao criar um novo site (itens copiados do
  template corretamente).

## Erros e casos de borda

- Login inválido → mensagem genérica, sem indicar se é email ou senha errada.
- Sessão expirada → redireciona para `/login`.
- Mover card no Kanban falha (erro de rede) → reverte posição visualmente e
  mostra aviso.
- Checklist de um site sem itens (template vazio no momento da criação) →
  permite adicionar itens manualmente depois.
