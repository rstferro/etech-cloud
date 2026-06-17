# 06 · Tailwind CSS v4

Tailwind = classes utilitárias (`flex`, `px-4`, `text-muted`) que você compõe
direto no JSX, sem escrever CSS à parte. A **v4** mudou bastante: a config agora é
**CSS-first** (dentro do `globals.css`), sem `tailwind.config.js`.

## `@theme` — tokens no CSS

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  --color-background: #060409;
  --color-surface:    #0d0a14;
  --color-primary:    #8c5aff;   /* roxo da marca E-Tech */
  --color-muted:      #968ab3;
  --color-danger:     #ef4444;
}
```

Cada `--color-xxx` no `@theme` **vira utilities automaticamente**:
`bg-background`, `text-primary`, `border-surface`, `bg-danger/10` (com opacidade)...

> 🎨 Por isso o tema cyberpunk é consistente: tudo puxa dos mesmos tokens. Mudou o
> token, mudou o app inteiro.

## Lendo uma classe Tailwind

```
bg-surface-2   → background-color: var(--color-surface-2)
px-4 py-2.5    → padding horizontal 1rem, vertical 0.625rem
rounded-xl     → border-radius grande
text-sm        → font-size pequeno
hover:bg-...   → aplica no hover
sm: / lg:      → responsivo (a partir de tal largura)
```

Exemplo real (botão "Novo produto"):
```tsx
className="glow rounded-lg bg-primary px-4 py-2.5 text-sm font-medium
           text-primary-foreground transition hover:bg-primary-strong"
```

## Utilities customizadas (`@utility`)

Pra efeitos próprios do tema (gradiente de texto, brilho):
```css
@utility text-gradient {
  background: var(--gradient-cyber);
  -webkit-background-clip: text;
  color: transparent;
}
```
Aí no JSX é só `className="text-gradient"`.

## Cores com opacidade
`bg-warning/10` = cor `warning` com 10% de opacidade. Usado nos badges de estoque
baixo (`border-warning/40 bg-warning/10 text-warning`).

## Responsividade (mobile-first)
```tsx
className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
// 1 coluna no celular, 2 em tablet (sm), 4 no desktop (lg)
```

## 🧪 Pratique
Em [`globals.css`](../../src/app/globals.css), troque `--color-primary` por outra
cor e recarregue: todos os botões, links ativos e gráficos roxos mudam de uma vez.
Depois volte pro `#8c5aff` (a marca 💜).
