/**
 * Gera as imagens da marca. Todas vão para o Git.
 *
 *   pnpm imagens
 *
 * Em public/, as do site (o deploy só copia essa pasta):
 *
 *   og.png                1200×630. A prévia do link no WhatsApp, LinkedIn e
 *                         afins. É o scripts/og.html fotografado por um Chrome
 *                         ou Edge sem janela.
 *   favicon.svg           o "i" da marca, na aba do navegador
 *   favicon.ico           o mesmo "i" em 16, 32 e 48 px, para navegador antigo
 *                         e para robô que pede /favicon.ico direto
 *   apple-touch-icon.png  180×180. O ícone de quem salva o site na tela de
 *                         início do iPhone
 *
 * Em divulgacao/, a arte do anúncio para as redes, que não entra no site.
 * As duas são o scripts/anuncio.html fotografado em cada formato:
 *
 *   anuncio-feed.png      1080×1350. O post do Instagram e do LinkedIn
 *   anuncio-status.png    1080×1920. O status do WhatsApp e o story do
 *                         Instagram
 *
 * O mesmo anúncio em movimento, em MP4, sai do pnpm video (scripts/video.mjs).
 *
 * Os ícones são três retângulos, então saem pixel a pixel daqui mesmo, sem
 * navegador e sem biblioteca. A og.png e o anúncio precisam de navegador, por
 * causa da fonte e do plano de pontos (ver scripts/navegador.mjs).
 *
 * Rode de novo quando mudar o og.html, o anuncio.html ou a marca. Se o
 * navegador estiver em outro lugar, diga onde:
 * NAVEGADOR="C:/caminho/chrome.exe" pnpm imagens
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { crc32, deflateSync } from "node:zlib";
import { navegador } from "./navegador.mjs";

const PASTA = "public";
const DIVULGACAO = "divulgacao";

const FUNDO = [0x05, 0x05, 0x09];
const TEXTO = [0xf2, 0xf2, 0xf7];
const PONTO = [0x82, 0x57, 0xf5];

/*
 * O "i" em cada tamanho, em pixels inteiros. As proporções são as da marca
 * (ver MARCA.md): o pingo tem a espessura da haste, o vão é meia espessura e
 * o "i" inteiro tem a altura do D, umas 3,8 espessuras. Em tamanho pequeno a
 * conta não fecha em pixel inteiro, então cada tamanho foi acertado à mão
 * para ficar nítido, sem borda borrada.
 *
 *   x      onde a haste começa
 *   t      espessura (e lado do pingo)
 *   topo   onde o pingo começa
 *   vao    entre o pingo e a haste
 *   haste  altura da haste
 */
const I = {
  16: { x: 6, t: 3, topo: 2, vao: 1, haste: 7 },
  32: { x: 13, t: 6, topo: 4, vao: 3, haste: 14 },
  48: { x: 19, t: 9, topo: 6, vao: 5, haste: 21 },
  // No iPhone o sistema arredonda os cantos, então o "i" ganha mais folga.
  180: { x: 77, t: 26, topo: 40, vao: 13, haste: 61 },
};

/** Um PNG RGBA, pintado por uma função que diz a cor de cada pixel. */
function png(larg, alt, cor) {
  const linha = larg * 4 + 1;
  const crus = Buffer.alloc(linha * alt);
  for (let y = 0; y < alt; y++) {
    // Cada linha começa com o filtro 0 (nenhum). O deflate cuida do resto.
    for (let x = 0; x < larg; x++) {
      const [r, g, b] = cor(x, y);
      crus.set([r, g, b, 255], y * linha + 1 + x * 4);
    }
  }
  const bloco = (tipo, dados) => {
    const cabeca = Buffer.alloc(4);
    cabeca.writeUInt32BE(dados.length);
    const corpo = Buffer.concat([Buffer.from(tipo, "latin1"), dados]);
    const soma = Buffer.alloc(4);
    soma.writeUInt32BE(crc32(corpo));
    return Buffer.concat([cabeca, corpo, soma]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(larg, 0);
  ihdr.writeUInt32BE(alt, 4);
  ihdr.set([8, 6, 0, 0, 0], 8); // 8 bits por canal, RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    bloco("IHDR", ihdr),
    bloco("IDAT", deflateSync(crus, { level: 9 })),
    bloco("IEND", Buffer.alloc(0)),
  ]);
}

function icone(lado) {
  const { x, t, topo, vao, haste } = I[lado];
  const pe = topo + t + vao;
  return png(lado, lado, (px, py) => {
    if (px < x || px >= x + t) return FUNDO;
    if (py >= topo && py < topo + t) return PONTO;
    if (py >= pe && py < pe + haste) return TEXTO;
    return FUNDO;
  });
}

/** Um .ico com PNGs dentro, que todo navegador atual entende. */
function ico(lados) {
  const imagens = lados.map(icone);
  const cabeca = Buffer.alloc(6 + 16 * lados.length);
  cabeca.writeUInt16LE(1, 2); // tipo 1: ícone
  cabeca.writeUInt16LE(lados.length, 4);
  let onde = cabeca.length;
  lados.forEach((lado, i) => {
    const e = 6 + 16 * i;
    cabeca[e] = lado;
    cabeca[e + 1] = lado;
    cabeca.writeUInt16LE(1, e + 4); // planos
    cabeca.writeUInt16LE(32, e + 6); // bits por pixel
    cabeca.writeUInt32LE(imagens[i].length, e + 8);
    cabeca.writeUInt32LE(onde, e + 12);
    onde += imagens[i].length;
  });
  return Buffer.concat([cabeca, ...imagens]);
}

function svg() {
  const { x, t, topo, vao, haste } = I[32];
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">` +
    `<rect width="32" height="32" fill="#050509"/>` +
    `<rect x="${x}" y="${topo + t + vao}" width="${t}" height="${haste}" fill="#f2f2f7"/>` +
    `<rect x="${x}" y="${topo}" width="${t}" height="${t}" fill="#8257f5"/>` +
    `</svg>\n`
  );
}

/**
 * Abre o HTML num navegador sem janela e salva a tela como PNG. O perfil é
 * descartável: assim não mexe no navegador de ninguém, mesmo aberto. O
 * tempo virtual dá conta das fontes do Google chegarem antes da foto.
 * `busca` vai no fim do endereço, como o "?formato=status" do anúncio.
 */
function fotografar(html, saida, larg, alt, busca = "") {
  const perfil = mkdtempSync(join(tmpdir(), "idea-imagens-"));
  try {
    execFileSync(
      navegador(),
      [
        "--headless",
        "--disable-gpu",
        "--hide-scrollbars",
        "--no-first-run",
        "--no-default-browser-check",
        `--user-data-dir=${perfil}`,
        "--force-device-scale-factor=1",
        `--window-size=${larg},${alt}`,
        "--virtual-time-budget=15000",
        `--screenshot=${resolve(saida)}`,
        pathToFileURL(resolve(html)).href + busca,
      ],
      { stdio: "ignore", timeout: 90_000 },
    );
  } finally {
    rmSync(perfil, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
  }
  const foto = readFileSync(saida);
  const l = foto.readUInt32BE(16);
  const a = foto.readUInt32BE(20);
  if (l !== larg || a !== alt) {
    throw new Error(`${saida} saiu com ${l}×${a}, e não ${larg}×${alt}.`);
  }
  return foto.length;
}

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;

mkdirSync(PASTA, { recursive: true });
writeFileSync(join(PASTA, "favicon.svg"), svg());
const icoBytes = ico([16, 32, 48]);
writeFileSync(join(PASTA, "favicon.ico"), icoBytes);
const toque = icone(180);
writeFileSync(join(PASTA, "apple-touch-icon.png"), toque);
console.log(`ícones prontos: favicon.svg, favicon.ico (${kb(icoBytes.length)}), apple-touch-icon.png (${kb(toque.length)})`);

const og = fotografar("scripts/og.html", join(PASTA, "og.png"), 1200, 630);
// O WhatsApp às vezes deixa a prévia sem imagem quando ela passa de 300 KB.
console.log(`og.png pronta: 1200×630, ${kb(og)}${og > 300 * 1024 ? " (acima de 300 KB: o WhatsApp pode ignorar)" : ""}`);

mkdirSync(DIVULGACAO, { recursive: true });
for (const [formato, larg, alt] of [
  ["feed", 1080, 1350],
  ["status", 1080, 1920],
]) {
  const nome = `anuncio-${formato}.png`;
  const bytes = fotografar("scripts/anuncio.html", join(DIVULGACAO, nome), larg, alt, `?formato=${formato}`);
  console.log(`${nome} pronta: ${larg}×${alt}, ${kb(bytes)}`);
}
