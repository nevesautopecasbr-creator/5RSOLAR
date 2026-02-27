# Configuração do Supabase (banco e tabelas)

Este guia descreve como criar o projeto no Supabase e preparar o banco. **Para o portal (apps/portal):** use as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` e crie as tabelas executando os SQL em `docs/supabase/sql/` (ver README da pasta). As seções abaixo sobre Prisma, `migrate:deploy` e `seed` referem-se à API antiga (apps/api), já removida; podem ser ignoradas se você usar apenas o portal.

---

## 1. Criar o projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login.
2. **New project** → escolha a organização.
3. Preencha:
   - **Name:** ex. `5rsolar` ou `erp-solar`.
   - **Database Password:** defina e **guarde** (será usada na `DATABASE_URL`).
   - **Region:** escolha a mais próxima (ex. South America).
4. Clique em **Create new project** e aguarde o provisionamento.

---

## 2. Obter a URL de conexão (Session pooler)

1. No dashboard do projeto: **Project Settings** (ícone de engrenagem) → **Database**.
2. Em **Connection string**, selecione **URI**.
3. Escolha o modo **Session** (porta **5432** — recomendado para Prisma).
4. Copie a URL. Ela terá a forma:
   ```text
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
   ```
5. Substitua `[YOUR-PASSWORD]` pela senha do banco que você definiu no passo 1.

Exemplo (valores fictícios):

```text
postgresql://postgres.abcdefghij:MinHaS3nhaS3gura@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

---

## 3. (Opcional) Criar usuário dedicado para a API

Para não usar o usuário `postgres` em produção, você pode criar um usuário só para o Prisma:

1. No Supabase: **SQL Editor** → **New query**.
2. Cole e execute (troque `'sua_senha_segura'` por uma senha forte):

```sql
-- Criar usuário para a API/Prisma
CREATE USER prisma WITH PASSWORD 'sua_senha_segura' BYPASSRLS CREATEDB;

-- Dar permissões ao prisma no schema public
GRANT "prisma" TO "postgres";
GRANT USAGE ON SCHEMA public TO prisma;
GRANT CREATE ON SCHEMA public TO prisma;
GRANT ALL ON ALL TABLES IN SCHEMA public TO prisma;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO prisma;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO prisma;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO prisma;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO prisma;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO prisma;
```

3. Na connection string, use o usuário `prisma` e a senha que você definiu:
   ```text
   postgresql://prisma.[PROJECT-REF]:sua_senha_segura@aws-0-[REGION].pooler.supabase.com:5432/postgres
   ```
   (troque `postgres.[PROJECT-REF]` por `prisma.[PROJECT-REF]` na URL que o Supabase mostra para o usuário `prisma`).

Se pular esta etapa, use a URL do passo 2 com o usuário `postgres` e a senha do projeto.

---

## 4. Configurar a API (`.env`)

O arquivo `.env` não é versionado (está no `.gitignore`). Crie-o a partir do exemplo:

1. Na raiz do monorepo, copie o exemplo de env da API:
   ```bash
   cp apps/api/.env.example apps/api/.env
   ```
2. Edite `apps/api/.env` e defina pelo menos:
   - **DATABASE_URL** = a URL do passo 2 (ou 3, se criou o usuário `prisma`).

Exemplo:

```env
DATABASE_URL="postgresql://postgres.xxxxx:SuaSenha@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
```

---

## 5. Criar as tabelas no Supabase

Você pode fazer de duas formas:

### Opção A – Scripts SQL no Supabase (recomendado para projeto novo)

1. Abra o **SQL Editor** no dashboard do seu projeto Supabase.
2. Use **um** dos seguintes:
   - **Script único:** abra o arquivo `docs/supabase/sql/00-schema-completo.sql` do repositório, copie todo o conteúdo, cole no SQL Editor e execute.
   - **Scripts em sequência:** execute na ordem os arquivos `01-init.sql`, `02-refresh-tokens.sql`, … até `11-workflow-approvals.sql` (veja `docs/supabase/sql/README.md`).

Assim as tabelas são criadas direto no Supabase, sem rodar o Prisma na sua máquina.

### Opção B – Prisma Migrate (a partir da API)

Com o `DATABASE_URL` apontando para o Supabase, rode as migrations a partir da pasta da API:

**Pela raiz do monorepo:**

```bash
pnpm --filter @erp/api run migrate:deploy
```

**Dentro de apps/api:**

```bash
cd apps/api
pnpm run migrate:deploy
```

Isso aplica todas as migrations em `apps/api/prisma/migrations/` e deixa o banco igual ao schema do Prisma.

Se aparecer erro de conexão, confira:

- Senha e usuário na URL.
- Se a região e o `PROJECT-REF` estão corretos (copie de novo em **Database** → **Connection string**).

---

## 6. (Opcional) Rodar o seed (dados iniciais)

Para criar empresa demo, usuário admin e permissões iniciais:

```bash
pnpm --filter @erp/api run seed
```

Ou, dentro de `apps/api`:

```bash
pnpm run seed
```

Variáveis opcionais para o seed (em `apps/api/.env` ou no ambiente):

- `SEED_COMPANY_NAME` – nome da empresa (padrão: "Empresa Demo").
- `SEED_ADMIN_EMAIL` – e-mail do admin (padrão: "admin@erp.local").
- `SEED_ADMIN_PASSWORD` – senha do admin (padrão: "Admin@123").
- `SEED_ADMIN_NAME` – nome do admin (padrão: "Administrador").

---

## 7. Resumo rápido

| Etapa          | Onde                                                            | Ação                                         |
| -------------- | --------------------------------------------------------------- | -------------------------------------------- |
| Projeto        | Supabase Dashboard                                              | New project → definir senha do banco         |
| URL            | Project Settings → Database → Connection string (Session, 5432) | Copiar URI e trocar `[YOUR-PASSWORD]`        |
| Env            | `apps/api/.env`                                                 | `DATABASE_URL` = URL do Supabase             |
| Tabelas        | Terminal (raiz ou `apps/api`)                                   | `pnpm --filter @erp/api run migrate:deploy`  |
| Dados iniciais | Terminal                                                        | `pnpm --filter @erp/api run seed` (opcional) |

Depois disso, a API (local ou em produção) deve conectar ao Supabase usando a mesma `DATABASE_URL` no ambiente (Railway, Render, Vercel, etc.).
