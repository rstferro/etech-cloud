// Helpers puros (sem acesso a banco) pra geração de SKU de produtos.
// Isolados aqui pra ficarem fáceis de testar.

/**
 * Prefixo de 3 letras a partir da categoria (sem acento), ou "GEN".
 * Ex.: "Acessórios" -> "ACE", "TV" -> "TVX", undefined -> "GEN".
 */
export function categoryPrefix(category?: string | null) {
  if (!category) return "GEN";
  const norm = category
    .normalize("NFD") // separa letra-base do acento
    .replace(/[^\x00-\x7F]/g, "") // remove os acentos (não-ASCII)
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
  return (norm.slice(0, 3) || "GEN").padEnd(3, "X");
}

/** Monta o SKU final no formato ETC-XXX-0001. */
export function formatSku(prefix: string, n: number) {
  return `ETC-${prefix}-${String(n).padStart(4, "0")}`;
}
