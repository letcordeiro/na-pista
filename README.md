# Na Pista — painel do motorista

App mobile-first para motoristas de aplicativo controlarem ganhos (corridas
avulsas ou fechamento do dia), gastos do carro e consumo de combustível
(km/L real por tipo — etanol × gasolina). Multiusuário: cada motorista tem
sua conta e enxerga apenas os próprios dados.

## Stack

- Next.js (App Router) full-stack — todo dado passa por server actions
- Tailwind CSS v4 · Recharts
- PostgreSQL via Prisma
- Auth.js (NextAuth) com Credentials (e-mail + senha, bcrypt), sessão JWT

## Rodando local

```bash
npm install
cp .env.example .env   # preencher DATABASE_URL e AUTH_SECRET
npx prisma migrate dev
npm run dev
```

Variáveis (`.env`):

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Postgres, ex.: `postgresql://user:senha@host:5432/napista?schema=public` |
| `AUTH_SECRET` | gerar com `openssl rand -base64 32` |
| `AUTH_TRUST_HOST` | `true` (necessário atrás do Traefik) |

## Deploy (VPS Hostinger + Dokploy)

1. **Banco**: criar um serviço PostgreSQL no Dokploy (banco `napista`).
   Usar o host interno do Dokploy na `DATABASE_URL` — o banco não é
   exposto à internet.
2. **App**: criar aplicação apontando para este repositório GitHub,
   build via **Dockerfile** (na raiz). O container aplica
   `prisma migrate deploy` automaticamente antes de subir.
3. **Env**: definir `DATABASE_URL`, `AUTH_SECRET` e `AUTH_TRUST_HOST=true`.
4. **Domínio**: cadastrar `napista.bionatural.tech` no Dokploy (porta 3000).
   O wildcard `*.bionatural.tech` já aponta para a VPS; o Traefik emite o
   certificado sozinho.

Qualquer push na branch principal dispara o redeploy.

## Estrutura

- `prisma/schema.prisma` — modelo de dados (fonte da verdade)
- `src/lib/metrics.js` — cálculos puros (resumo do período, km/L método
  tanque cheio, R$/km por combustível)
- `src/lib/acoes.js` — server actions (toda escrita filtra por `usuarioId`
  da sessão via `getUsuarioSessao()`)
- `src/app/` — telas: resumo `/`, `/ganhos`, `/gastos`, `/combustivel`,
  `/login`, `/cadastro`

---

© 2026 Letícia Cordeiro — software proprietário, todos os direitos reservados. Ver [LICENSE](LICENSE).
