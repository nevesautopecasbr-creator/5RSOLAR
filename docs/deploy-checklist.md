# Checklist técnico de implantação (portal)

O projeto atual é apenas **apps/portal** (Next.js + Supabase Auth). Não há API separada.

## Ambientes

- `dev`: desenvolvimento local.
- `staging`: homologação (preview na Vercel).
- `prod`: produção.

## 1) Banco (Supabase)

- [ ] Projeto Supabase criado.
- [ ] Região definida próxima dos usuários.
- [ ] Tabelas criadas (SQL em `docs/supabase/sql/` — ver README da pasta).
- [ ] Política de backup/retenção confirmada.
- [ ] Authentication → Providers: Email ativado.

## 2) Portal (`apps/portal`) na Vercel

- [ ] Projeto Vercel criado e conectado ao repositório.
- [ ] **Root Directory** = `apps/portal` (obrigatório).
- [ ] Variáveis de ambiente:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Build do portal executa sem erro.
- [ ] Rotas protegidas (ex.: `/dashboard`) validando sessão Supabase.

## 3) Segurança

- [ ] Segredos apenas nas variáveis da Vercel (nunca no repo).
- [ ] Cookies/headers de auth em HTTPS.

## 4) Go-live

- [ ] Login e logout funcionando.
- [ ] Acesso ao dashboard após login.
- [ ] Plano de rollback e backup validado.

Ver também: `docs/vercel-deploy.md`, `docs/portal-nextjs-supabase.md`.
