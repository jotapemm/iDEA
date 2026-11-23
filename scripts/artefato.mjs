/**
 * Junta o build do Parcel num HTML só.
 *
 *   pnpm artefato
 *
 * Gera dois arquivos em artefato/:
 *
 *   bundle.html   página completa e autossuficiente (abre com dois cliques,
 *                 manda por e-mail, sobe em qualquer lugar)
 *   idea.html     o mesmo conteúdo SEM <html>/<head>/<body>, que é o formato
 *                 que o Artifact do Claude pede (ele mesmo põe o esqueleto)
 *
 * Por que não o html-inline da skill: ele tenta embutir TODO <link>, inclusive
 * o CSS do Google Fonts, e quebra procurando "https:" como se fosse pasta. Aqui
 * só o JS e o CSS do próprio build entram no arquivo; as fontes continuam
 * vindo do Google, que é o único host de fonte que o Artifact aceita.
 *
 * O site de verdade NÃO sai daqui: para publicar, use `pnpm build` (Vite),
 * que gera dist/ com arquivos separados e cache melhor.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PASTA = "artefato";
const BUILD = join(PASTA, "parcel");
// O Parcel parte de scripts/artefato.html, não do index.html do site.
const html = readFileSync(join(BUILD, "artefato.html"), "utf8");

const arquivo = (re, tipo) => {
  const m = html.match(re);
  if (!m) throw new Error(`Não achei o ${tipo} do build em ${BUILD}/artefato.html`);
  return readFileSync(join(BUILD, m[1].replace(/^\//, "")), "utf8");
};

const css = arquivo(/<link rel=stylesheet href=["']?(\/[^"'\s>]+\.css)/, "CSS");
// `</script` dentro do JS fecharia a tag antes da hora. `<\/script` é a
// mesma string para o JavaScript e inofensivo para o HTML.
const js = arquivo(/<script type=module src=["']?(\/[^"'\s>]+\.js)/, "JS").replace(/<\/script/gi, "<\\/script");

const fontes = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=JetBrains+Mono:wght@400;500;700&display=swap">`;

const icone = `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23050509'/%3E%3Crect x='13' y='13' width='6' height='14' fill='%23f2f2f7'/%3E%3Crect x='13' y='4' width='6' height='6' fill='%238257f5'/%3E%3C/svg%3E">`;

const corpo = `<style>${css}</style>
<div id="root"></div>
<script type="module">${js}</script>`;

// O fragmento do Artifact: título primeiro (ele só lê os primeiros 8 KB),
// e a meta que promete calha lateral com safe-area (ver .moldura no CSS).
writeFileSync(
  join(PASTA, "idea.html"),
  `<title>iDEA.</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="theme-color" content="#050509">
${fontes}
${corpo}
`,
);

writeFileSync(
  join(PASTA, "bundle.html"),
  `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>iDEA. | Automações, sistemas web e apps sob medida</title>
<meta name="theme-color" content="#050509">
${icone}
${fontes}
</head>
<body>
${corpo}
</body>
</html>
`,
);

const kb = (s) => `${(Buffer.byteLength(s) / 1024).toFixed(0)} KB`;
console.log(`artefato/idea.html e artefato/bundle.html prontos (JS ${kb(js)}, CSS ${kb(css)})`);
