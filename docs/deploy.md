# Deploy — Turso + Vercel

Guia pra colocar o E-Tech Cloud no ar com banco **Turso** (libSQL) e hospedagem na **Vercel**.

O app usa o adapter `@prisma/adapter-libsql`, que fala tanto com SQLite local
(`file:./dev.db`) quanto com o Turso remoto (`libsql://...`). A mesma config
serve pros dois ambientes — só muda o `.env`.

---

## 1. Criar o banco no Turso

Instale a CLI (https://docs.turso.tech/cli/installation) e autentique:

```bash
turso auth login
```

Crie o banco e pegue as credenciais:

```bash
turso db create etech-cloud
turso db show etech-cloud --url      # => libsql://etech-cloud-SEU-USER.turso.io
turso db tokens create etech-cloud   # => o auth token
```

## 2. Aplicar o schema e semear

Aponte o `.env` pro Turso (temporariamente, pra rodar local contra o remoto):

```env
DATABASE_URL="libsql://etech-cloud-SEU-USER.turso.io"
TURSO_AUTH_TOKEN="o-token-gerado-acima"
```

Crie as tabelas e popule os dados de demonstração:

```bash
npm run db:push    # cria as tabelas no Turso
npm run db:seed    # cria usuários demo, produtos, OS e vendas
```

> Depois é só voltar o `.env` local pra `DATABASE_URL="file:./dev.db"` pro dev do dia a dia.

## 3. Deploy na Vercel

1. Importe o repositório em https://vercel.com/new.
2. Em **Settings → Environment Variables**, configure (Production):

   | Variável | Valor |
   |----------|-------|
   | `DATABASE_URL` | `libsql://etech-cloud-SEU-USER.turso.io` |
   | `TURSO_AUTH_TOKEN` | o token do Turso |
   | `AUTH_SECRET` | gere com `npx auth secret` |
   | `AUTH_TRUST_HOST` | `true` |
   | `LAUDO_DEMO` | `true` (laudo IA em modo demo, custo zero) |
   | `ANTHROPIC_API_KEY` | opcional — só se for usar a IA real |

3. Deploy. A Vercel roda `npm run build` (que já dispara `prisma generate`).

## 4. Logins de demonstração

```
admin@etech.local       / admin123
funcionario@etech.local / func123
```

---

### Notas

- **Migrations vs db push:** pro portfólio usamos `prisma db push` (mais simples).
  Se quiser histórico de migrations versionado, rode `prisma migrate deploy`
  contra o Turso no lugar do push.
- **Re-seed:** o seed é idempotente (usa `upsert`), então pode rodar de novo sem duplicar.
