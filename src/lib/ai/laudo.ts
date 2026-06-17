import "server-only";
import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY;
const model = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";
/** Modo demonstração: gera o laudo localmente, sem chamar a API (custo zero). */
const demoMode = process.env.LAUDO_DEMO === "true";

let client: Anthropic | null = null;
function getClient() {
  if (!apiKey) return null;
  client ??= new Anthropic({ apiKey });
  return client;
}

/** A IA está disponível com chave configurada OU em modo demonstração. */
export function isAiEnabled() {
  return demoMode || !!apiKey;
}

export type LaudoInput = {
  deviceType: string;
  deviceModel?: string | null;
  problem: string;
};

/**
 * Laudo "demo": sem chamar a API. Adapta a resposta a palavras-chave do problema
 * pra parecer realista — ideal pra testar a UX e proteger créditos no deploy.
 */
function demoLaudo({ deviceType, deviceModel, problem }: LaudoInput) {
  const aparelho = deviceModel ? `${deviceType} (${deviceModel})` : deviceType;
  const p = problem.toLowerCase();
  let causa: string;
  let testes: string;
  let solucao: string;

  if (/(tela|trinc|rachad|display|imagem)/.test(p)) {
    causa = "dano no conjunto de tela/display por impacto";
    testes = "inspeção visual, teste de toque e checagem do conector flex";
    solucao = "substituição do módulo de tela e teste de touch/brilho";
  } else if (/(n[aã]o liga|morto|sem vida|n[aã]o d[aá] imagem)/.test(p)) {
    causa = "falha de alimentação (bateria, conector de carga ou circuito de power)";
    testes = "medição de tensão de entrada, teste de fonte/bateria e busca por curto";
    solucao = "reparo do circuito de alimentação ou troca do componente em curto";
  } else if (/(bateria|vicia|descarreg|dura pouco)/.test(p)) {
    causa = "degradação da bateria (ciclos elevados ou célula viciada)";
    testes = "leitura da saúde da bateria e teste de consumo em standby";
    solucao = "substituição da bateria por original/compatível e calibração";
  } else if (/(carreg|carga|tomada|cabo)/.test(p)) {
    causa = "falha no conector de carga ou no circuito de carregamento";
    testes = "teste com cabo/fonte conhecidos, limpeza e inspeção do conector";
    solucao = "limpeza ou troca do conector de carga e reteste";
  } else if (/([aá]gua|molh|l[ií]quido|umidade)/.test(p)) {
    causa = "oxidação por contato com líquido na placa";
    testes = "abertura, inspeção de corrosão e medição ponto a ponto";
    solucao = "limpeza ultrassônica e substituição de componentes oxidados";
  } else {
    causa = "a confirmar em bancada; sintomas compatíveis com falha interna";
    testes = "diagnóstico em bancada, inspeção visual e medições nos pontos críticos";
    solucao = "reparo ou substituição do componente afetado após diagnóstico";
  }

  return (
    `Aparelho: ${aparelho}.\n` +
    `Causa provável: ${causa}. Verificações sugeridas: ${testes}. ` +
    `Possível solução: ${solucao}.\n\n` +
    `— laudo gerado em modo demonstração (sem custo de API).`
  );
}

/**
 * Gera um laudo técnico preliminar a partir do aparelho + problema relatado,
 * usando o Claude. Roda só no servidor (a chave nunca vai pro cliente).
 */
export async function suggestDiagnosis({
  deviceType,
  deviceModel,
  problem,
}: LaudoInput) {
  if (demoMode) {
    // pequena espera só pra mostrar o estado "Gerando…" na UI
    await new Promise((r) => setTimeout(r, 700));
    return demoLaudo({ deviceType, deviceModel, problem });
  }

  const anthropic = getClient();
  if (!anthropic) {
    throw new Error("IA não configurada (defina ANTHROPIC_API_KEY no .env).");
  }

  const aparelho = deviceModel ? `${deviceType} (${deviceModel})` : deviceType;

  const msg = await anthropic.messages.create({
    model,
    max_tokens: 400,
    system:
      "Você é um técnico sênior de assistência técnica de eletrônicos no Brasil. " +
      "A partir do aparelho e do problema relatado pelo cliente, escreva um LAUDO " +
      "TÉCNICO preliminar, curto e objetivo, em português do Brasil. Estruture em: " +
      "causa provável, verificações/testes sugeridos e possível solução. Seja " +
      "realista, não invente valores de preço nem garantias. Máximo ~5 linhas, tom " +
      "profissional. Responda apenas com o laudo, sem preâmbulo nem despedida.",
    messages: [
      {
        role: "user",
        content: `Aparelho: ${aparelho}\nProblema relatado: ${problem}`,
      },
    ],
  });

  return msg.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
}
