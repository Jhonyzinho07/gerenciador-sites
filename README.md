# Gerenciador de Sites — JvSoft

Painel interno para gerenciar os sites em produção da JvSoft: board Kanban
por status, prioridade por posição no board, checklist por site copiado de
um template editável.

## Rodando localmente

1. `npm install`
2. Copie `.env.example` para `.env` e preencha `DATABASE_URL` (Postgres,
   ex: Neon/Vercel Postgres), `AUTH_SECRET` (string aleatória longa),
   `SEED_EMAIL` e `SEED_PASSWORD` (credenciais do único usuário admin).
3. `npx prisma migrate dev --name init`
4. `npx prisma db seed`
5. `npm run dev`

## Deploy na Vercel

1. Crie um banco Postgres via Vercel Postgres (Neon) no dashboard da Vercel
   e conecte ao projeto — isso preenche `DATABASE_URL` automaticamente.
2. Defina `AUTH_SECRET` nas variáveis de ambiente do projeto na Vercel.
3. Faça o deploy (`vercel --prod` ou push para a branch conectada).
4. Rode a migração e o seed contra o banco de produção uma única vez, a
   partir da sua máquina, apontando `DATABASE_URL` para a connection
   string de produção:
   ```bash
   npx prisma migrate deploy
   SEED_EMAIL="..." SEED_PASSWORD="..." npx prisma db seed
   ```

Não existe tela de cadastro — para trocar a senha ou criar outra conta,
rode o seed novamente com as variáveis atualizadas (ele faz upsert pelo
email).
