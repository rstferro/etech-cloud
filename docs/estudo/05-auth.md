# 05 · Autenticação (Auth.js v5 / NextAuth)

Login por **credenciais** (e-mail + senha), com sessão em **JWT** e senha
protegida por **bcrypt**. A versão 5 do Auth.js (`next-auth@beta`) integra com o
App Router.

## Por que "split config" (config dividida)

O Auth.js roda em dois ambientes: o **edge** (proxy/middleware, leve, sem Node
completo) e o **servidor** (onde dá pra usar bcrypt e Prisma). Por isso a config é
dividida em dois arquivos:

```
src/lib/auth/
├─ config.ts   → authConfig: só tipos + callbacks (edge-safe, sem bcrypt/Prisma)
└─ index.ts    → NextAuth completo: + provider Credentials (usa bcrypt/Prisma)
```

## A guarda de rotas (`authorized`)

```ts
// src/lib/auth/config.ts
callbacks: {
  authorized({ auth, request }) {
    const logged = !!auth?.user;
    const protegida = ["/dashboard", "/produtos", "/ordens"].some(...);
    if (protegida && !logged) return false;     // manda pro /login
    if (request.nextUrl.pathname === "/login" && logged) {
      return Response.redirect(new URL("/dashboard", request.url)); // já logado
    }
    return true;
  },
}
```

## O provider Credentials (valida a senha)

```ts
// src/lib/auth/index.ts
Credentials({
  authorize: async (credentials) => {
    const { email, password } = loginSchema.parse(credentials); // Zod!
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return null;
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  },
});
```

> 🔒 Nunca guardamos senha em texto puro. O seed faz `bcrypt.hash("admin123", 10)`
> e o login compara com `bcrypt.compare`.

## Callbacks `jwt` e `session` (carregar a role)

O JWT guarda dados extras (id + role) pra não bater no banco a cada request:

```ts
async jwt({ token, user }) {
  if (user) { token.id = user.id; token.role = user.role; }
  return token;
},
async session({ session, token }) {
  session.user.id = token.id as string;
  session.user.role = token.role as Role; // cast: o JWT é "solto" demais p/ o TS
  return session;
},
```

## Estendendo os tipos da sessão

Como adicionamos `role` e `id`, avisamos o TypeScript via *module augmentation*:

```ts
// src/types/next-auth.d.ts
declare module "next-auth" {
  interface Session { user: { id: string; role: Role } & DefaultSession["user"]; }
}
```

## O `proxy` (antigo middleware)

> ⚠️ **Next 16 renomeou `middleware` → `proxy`.** Tem que ser **export default de
> uma função**.

```ts
// src/proxy.ts
const { auth } = NextAuth(authConfig);
export default auth;  // a guarda authorized roda a cada request casado no matcher
export const config = { matcher: ["/((?!api|_next/static|...).*)"] };
```

## Usando a sessão

```ts
const session = await auth();          // em Server Component / action
if (!session?.user) redirect("/login");
const role = session.user.role;        // "ADMIN" | "FUNCIONARIO"
```

## Ideia de evolução: RBAC de verdade
Hoje todo usuário logado pode tudo. Como já existe `role`, dá pra bloquear ações
por papel — ex.: só `ADMIN` exclui produto. Bastaria checar `session.user.role`
nas actions e esconder botões no client.

## 🧪 Pratique
Logue como `funcionario@etech.local / func123` e depois `admin@etech.local /
admin123`. Veja a `role` mudar. Tente acessar `/produtos` deslogado → você cai no
`/login` (a guarda `authorized` em ação).
