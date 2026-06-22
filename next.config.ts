import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const nextConfig: NextConfig = {
  // gera um bundle mínimo (.next/standalone) com só o necessário pra rodar —
  // deixa a imagem Docker bem mais leve.
  output: "standalone",
  // fixa a raiz do file-tracing neste projeto. Sem isso, o Next pode inferir a
  // raiz errada se houver outro lockfile em uma pasta acima (ex.: no home),
  // jogando o server.js pra um subdiretório dentro de .next/standalone.
  outputFileTracingRoot: dirname(fileURLToPath(import.meta.url)),
};

export default nextConfig;
