/**
 * O vídeo do anúncio: a arte do scripts/anuncio.html com o plano em
 * movimento, como no site. Os pontos nascem espalhados, a ideia aparece,
 * toca o plano e a ordem se espalha a partir dela.
 *
 *   pnpm video
 *
 * Grava em divulgacao/:
 *
 *   anuncio-feed.mp4     1080×1350. O post do Instagram (que vira Reels) e
 *                        do LinkedIn
 *   anuncio-status.mp4   1080×1920. O status do WhatsApp e o story do
 *                        Instagram
 *
 * Os PNGs do pnpm imagens são o mesmo desenho parado e servem de capa.
 *
 * Sem ffmpeg e sem biblioteca: o vídeo sai do próprio navegador.
 *
 * 1. Abre o anuncio.html num Chrome ou Edge sem janela (scripts/navegador.mjs).
 * 2. Fotografa só o texto, com o fundo transparente. O texto não se mexe,
 *    então uma foto serve para o vídeo inteiro.
 * 3. Dentro da página, desenha cada quadro do plano, cola o texto por cima e
 *    entrega o quadro ao codificador de vídeo do navegador (WebCodecs), em
 *    H.264, o formato que todo celular toca.
 * 4. Aqui, junta os quadros codificados num arquivo MP4 (ver `mp4`).
 *
 * O roteiro (duração, toques da ideia, o plano acendendo e apagando) mora no
 * anuncio.html, junto com o desenho. Rode de novo quando mudar o anuncio.html
 * ou a marca.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { conectar } from "./navegador.mjs";

const PASTA = "divulgacao";
const FPS = 30;
/*
 * Bits por pixel em cada quadro. Ponto pequeno em movimento é o pior caso
 * para um codificador de vídeo; com pouco bit, o plano vira borrão. O
 * Instagram e o WhatsApp recomprimem tudo, então o arquivo daqui é o
 * original caprichado que eles recebem.
 */
const BPP = 0.12;
const FORMATOS = [
  ["feed", 1080, 1350],
  ["status", 1080, 1920],
];

const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`;

/**
 * Roda DENTRO da página, não aqui: o código desta função vai como texto para
 * o navegador, e por isso ela não enxerga nada deste arquivo. Desenha cada
 * quadro, cola o texto por cima e codifica em H.264. Devolve os quadros
 * codificados em base64, um atrás do outro, e o tamanho de cada um.
 */
async function gravar({ texto, fps, bitrate }) {
  const { L, A, DURACAO, quadro } = window.anuncio;
  const tela = new OffscreenCanvas(L, A);
  const ctx = tela.getContext("2d", { alpha: false, willReadFrequently: true });
  const png = Uint8Array.from(atob(texto), (c) => c.charCodeAt(0));
  const camada = await createImageBitmap(new Blob([png], { type: "image/png" }));

  /*
   * Vídeo não guarda RGB: guarda YUV 4:2:0, como todo vídeo de celular. É um
   * brilho (Y) por pixel e uma cor (U e V) para cada quatro pixels. A
   * conversão é feita aqui, na norma BT.709 e na faixa limitada (o preto em
   * 16 e o branco em 235), que é o que todo player espera. Deixada para o
   * navegador, ela mudava de faixa com a placa de vídeo ligada ou não.
   */
  const COR = { primaries: "bt709", transfer: "iec61966-2-1", matrix: "bt709", fullRange: false };
  const y = 219 / 255;
  const c = 224 / 255;
  const [yR, yG, yB] = [0.2126 * y, 0.7152 * y, 0.0722 * y];
  const [uR, uG, uB] = [(-0.2126 / 1.8556) * c, (-0.7152 / 1.8556) * c, 0.5 * c];
  const [vR, vG, vB] = [0.5 * c, (-0.7152 / 1.5748) * c, (-0.0722 / 1.5748) * c];
  const area = L * A;
  const yuv = new Uint8Array(area * 1.5);
  const Y = yuv.subarray(0, area);
  const U = yuv.subarray(area, area * 1.25);
  const V = yuv.subarray(area * 1.25);
  function converter(rgba) {
    // O + 16,5 e o + 128,5 já arredondam: o Uint8Array descarta a fração.
    for (let i = 0, p = 0; i < area; i++, p += 4) Y[i] = 16.5 + yR * rgba[p] + yG * rgba[p + 1] + yB * rgba[p + 2];
    const meia = L / 2;
    for (let lin = 0; lin < A / 2; lin++) {
      for (let col = 0; col < meia; col++) {
        const p = (2 * lin * L + 2 * col) * 4; // o canto do bloco de 2×2
        const q = p + L * 4; // a linha de baixo
        const r = (rgba[p] + rgba[p + 4] + rgba[q] + rgba[q + 4]) / 4;
        const g = (rgba[p + 1] + rgba[p + 5] + rgba[q + 1] + rgba[q + 5]) / 4;
        const b = (rgba[p + 2] + rgba[p + 6] + rgba[q + 2] + rgba[q + 6]) / 4;
        U[lin * meia + col] = 128.5 + uR * r + uG * g + uB * b;
        V[lin * meia + col] = 128.5 + vR * r + vG * g + vB * b;
      }
    }
  }

  // H.264 High, Main ou Baseline, nível 4.0: o primeiro que o navegador
  // aceitar. Por software antes, que dá o mesmo arquivo em qualquer máquina.
  let config;
  procura: for (const hardwareAcceleration of ["prefer-software", "no-preference"]) {
    for (const codec of ["avc1.640028", "avc1.4d0028", "avc1.42e028"]) {
      const c = {
        codec,
        width: L,
        height: A,
        framerate: fps,
        bitrate,
        bitrateMode: "variable",
        latencyMode: "quality",
        hardwareAcceleration,
        avc: { format: "avc" },
      };
      if ((await VideoEncoder.isConfigSupported(c)).supported) {
        config = c;
        break procura;
      }
    }
  }
  if (!config) throw new Error("Este navegador não codifica H.264.");

  const quadros = [];
  let descricao = null;
  let cores = null;
  let erro = null;
  const codificador = new VideoEncoder({
    output(pedaco, meta) {
      const dc = meta?.decoderConfig;
      if (dc?.description && !descricao) {
        const d = dc.description;
        descricao = ArrayBuffer.isView(d)
          ? new Uint8Array(d.buffer, d.byteOffset, d.byteLength).slice()
          : new Uint8Array(d).slice();
        const cs = dc.colorSpace;
        cores = cs ? { primaries: cs.primaries, transfer: cs.transfer, matrix: cs.matrix, fullRange: cs.fullRange } : COR;
      }
      const bytes = new Uint8Array(pedaco.byteLength);
      pedaco.copyTo(bytes);
      quadros.push({ bytes, chave: pedaco.type === "key", tempo: pedaco.timestamp });
    },
    error(e) {
      erro = e;
    },
  });
  codificador.configure(config);

  const n = Math.round((DURACAO / 1000) * fps);
  for (let i = 0; i < n; i++) {
    if (erro) throw erro;
    quadro(ctx, (i * 1000) / fps);
    ctx.drawImage(camada, 0, 0);
    converter(ctx.getImageData(0, 0, L, A).data);
    const frame = new VideoFrame(yuv, {
      format: "I420",
      codedWidth: L,
      codedHeight: A,
      colorSpace: COR,
      timestamp: Math.round((i * 1e6) / fps),
      duration: Math.round(1e6 / fps),
    });
    // Um quadro-chave a cada 2 s: é dele que o player parte quando pula.
    codificador.encode(frame, { keyFrame: i % (fps * 2) === 0 });
    frame.close();
    // O desenho é mais rápido que o codificador: não deixa a fila crescer.
    while (codificador.encodeQueueSize > 4 && !erro) {
      await new Promise((r) => {
        codificador.addEventListener("dequeue", r, { once: true });
        setTimeout(r, 50);
      });
    }
  }
  await codificador.flush();
  codificador.close();
  if (erro) throw erro;
  if (!descricao) throw new Error("O codificador não mandou a descrição do H.264.");

  const base64 = (partes) =>
    new Promise((ok, falha) => {
      const leitor = new FileReader();
      leitor.onload = () => ok(leitor.result.slice(leitor.result.indexOf(",") + 1));
      leitor.onerror = () => falha(leitor.error);
      leitor.readAsDataURL(new Blob(partes));
    });
  return {
    codec: config.codec,
    descricao: await base64([descricao]),
    cores,
    tamanhos: quadros.map((q) => q.bytes.length),
    chaves: quadros.map((q) => q.chave),
    tempos: quadros.map((q) => q.tempo),
    dados: await base64(quadros.map((q) => q.bytes)),
  };
}

/* --- o MP4 ------------------------------------------------------------- */

/*
 * Um MP4 é uma fila de caixas, e caixa pode ter caixa dentro. Cada uma é:
 * 4 bytes de tamanho, 4 letras de tipo e o conteúdo. As caixas "cheias" têm
 * ainda 4 bytes de versão e opções logo depois do tipo.
 */
const caixa = (tipo, ...partes) => {
  const corpo = Buffer.concat(partes);
  const cabeca = Buffer.alloc(8);
  cabeca.writeUInt32BE(8 + corpo.length);
  cabeca.write(tipo, 4, "latin1");
  return Buffer.concat([cabeca, corpo]);
};
const cheia = (tipo, opcoes, ...partes) => caixa(tipo, u32(opcoes), ...partes); // versão 0
const u16 = (...ns) => {
  const b = Buffer.alloc(2 * ns.length);
  ns.forEach((n, i) => b.writeUInt16BE(n, 2 * i));
  return b;
};
const u32 = (...ns) => {
  const b = Buffer.alloc(4 * ns.length);
  ns.forEach((n, i) => b.writeUInt32BE(n, 4 * i));
  return b;
};
const letras = (s) => Buffer.from(s, "latin1");

/* A matriz de exibição sem giro nem escala: 1 e 1 na diagonal. */
const MATRIZ = u32(0x10000, 0, 0, 0, 0x10000, 0, 0, 0, 0x40000000);

/*
 * As cores, nos números da norma (ISO/IEC 23091-2), a partir dos nomes que
 * o navegador usa. Sem elas, cada player chuta como converter o vídeo de
 * volta para RGB, e o roxo pode sair um pouco diferente.
 */
const PRIMARIAS = { bt709: 1, bt470bg: 5, smpte170m: 6, bt2020: 9, smpte432: 12 };
const TRANSFERENCIAS = { bt709: 1, smpte170m: 6, linear: 8, "iec61966-2-1": 13, pq: 16, hlg: 18 };
const MATRIZES = { rgb: 0, bt709: 1, bt470bg: 5, smpte170m: 6, "bt2020-ncl": 9 };

/**
 * Um MP4 com uma faixa de vídeo H.264 e nada mais, que é o que o Instagram,
 * o WhatsApp e qualquer player precisam:
 *
 *   ftyp   o tipo do arquivo
 *   free   uma nota que os players ignoram: aqui, a impressão digital
 *   moov   o índice: a duração, o tamanho da tela, a descrição do H.264 e
 *          onde cada quadro começa. Vem antes dos quadros, para o vídeo
 *          começar a tocar antes de chegar inteiro.
 *   mdat   os quadros, um atrás do outro
 */
function mp4({ larg, alt, fps, descricao, cores, tamanhos, chaves, dados, nota }) {
  const n = tamanhos.length;
  const escala = fps * 1000; // a régua da faixa: 1000 por quadro
  const ms = Math.round((n * 1000) / fps); // a régua do filme é o milissegundo
  const numerosChave = chaves.flatMap((chave, i) => (chave ? [i + 1] : []));

  const avc1 = caixa(
    "avc1",
    Buffer.alloc(6),
    u16(1), // as amostras estão neste arquivo (a 1ª referência de dados)
    Buffer.alloc(16),
    u16(larg, alt),
    u32(0x480000, 0x480000, 0), // 72 dpi, de praxe
    u16(1), // um quadro por amostra
    Buffer.alloc(32), // nome do compressor, vazio
    u16(0x18, 0xffff), // cor em 24 bits
    caixa("avcC", descricao),
    ...(cores
      ? [
          caixa(
            "colr",
            letras("nclx"),
            u16(PRIMARIAS[cores.primaries] ?? 2, TRANSFERENCIAS[cores.transfer] ?? 2, MATRIZES[cores.matrix] ?? 2),
            Buffer.from([cores.fullRange ? 0x80 : 0]),
          ),
        ]
      : []),
  );

  const moov = (inicio) =>
    caixa(
      "moov",
      cheia("mvhd", 0, u32(0, 0, 1000, ms, 0x10000), u16(0x100, 0), u32(0, 0), MATRIZ, u32(0, 0, 0, 0, 0, 0, 2)),
      caixa(
        "trak",
        cheia("tkhd", 3, u32(0, 0, 1, 0, ms, 0, 0), u16(0, 0, 0, 0), MATRIZ, u32(larg * 0x10000, alt * 0x10000)),
        caixa(
          "mdia",
          cheia("mdhd", 0, u32(0, 0, escala, n * 1000), u16(0x55c4, 0)), // 0x55c4: idioma "und"
          cheia("hdlr", 0, u32(0), letras("vide"), u32(0, 0, 0), letras("VideoHandler\0")),
          caixa(
            "minf",
            cheia("vmhd", 1, u16(0, 0, 0, 0)),
            caixa("dinf", cheia("dref", 0, u32(1), cheia("url ", 1))),
            caixa(
              "stbl",
              cheia("stsd", 0, u32(1), avc1),
              cheia("stts", 0, u32(1, n, 1000)), // n quadros de 1000 cada
              cheia("stss", 0, u32(numerosChave.length, ...numerosChave)), // quais são quadros-chave
              cheia("stsc", 0, u32(1, 1, n, 1)), // um bloco só, com os n quadros
              cheia("stsz", 0, u32(0, n, ...tamanhos)), // o tamanho de cada quadro
              cheia("stco", 0, u32(1, inicio)), // onde o bloco começa no arquivo
            ),
          ),
        ),
      ),
    );

  const ftyp = caixa("ftyp", letras("isom"), u32(0x200), letras("isomiso2avc1mp41"));
  const free = caixa("free", letras(nota));
  // O índice diz onde os quadros começam, e eles começam depois do índice:
  // mede o índice uma vez e monta de novo com o número certo.
  const inicio = ftyp.length + free.length + moov(0).length + 8;
  return Buffer.concat([ftyp, free, moov(inicio), caixa("mdat", dados)]);
}

/** A impressão digital que um MP4 daqui guardou na caixa "free", ou null. */
function impressaoDe(arquivo) {
  if (!existsSync(arquivo)) return null;
  const b = readFileSync(arquivo);
  const p = b.readUInt32BE(0); // onde a ftyp termina
  if (b.length < p + 8 || b.toString("latin1", p + 4, p + 8) !== "free") return null;
  return b.toString("latin1", p + 8, p + b.readUInt32BE(p)).match(/[0-9a-f]{16}$/)?.[0] ?? null;
}

/* --- o vídeo de cada formato ----------------------------------------- */

const navegador = conectar();
try {
  mkdirSync(PASTA, { recursive: true });
  for (const [formato, larg, alt] of FORMATOS) {
    const url = pathToFileURL(resolve("scripts/anuncio.html")).href + `?formato=${formato}`;
    const { cdp, avaliar } = await navegador.abrir(url, larg, alt);

    // O texto sozinho: sem o plano e sem o fundo.
    await avaliar(`(() => {
      document.getElementById("plano").style.visibility = "hidden";
      document.documentElement.style.background = "transparent";
      document.body.style.background = "transparent";
    })()`);
    await cdp("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } });
    const { data: texto } = await cdp("Page.captureScreenshot", { format: "png" });

    // O codificador do navegador não devolve o mesmo arquivo duas vezes,
    // nem com o mesmo desenho. Então o MP4 guarda a impressão digital de
    // tudo que entra nele e, se nada mudou, o vídeo de antes fica: sem isso,
    // cada rodada daria uns 15 MB novos para o Git guardar.
    const nome = `anuncio-${formato}.mp4`;
    const impressao = createHash("sha256")
      .update(readFileSync("scripts/anuncio.html"))
      .update(readFileSync("scripts/video.mjs"))
      .update(texto)
      .digest("hex")
      .slice(0, 16);
    if (impressaoDe(join(PASTA, nome)) === impressao) {
      console.log(`${nome} já estava em dia: nada mudou no desenho`);
      continue;
    }

    const bitrate = Math.round(larg * alt * FPS * BPP);
    const r = await avaliar(`(${gravar})(${JSON.stringify({ texto, fps: FPS, bitrate })})`);

    // Um pedaço por quadro, na ordem: sem quadro pulado e sem quadro B, que
    // este MP4 simples não sabe guardar.
    r.tempos.forEach((tempo, i) => {
      if (tempo !== Math.round((i * 1e6) / FPS)) {
        throw new Error(`O codificador mexeu na ordem dos quadros (quadro ${i}).`);
      }
    });

    const arquivo = mp4({
      larg,
      alt,
      fps: FPS,
      descricao: Buffer.from(r.descricao, "base64"),
      cores: r.cores,
      tamanhos: r.tamanhos,
      chaves: r.chaves,
      dados: Buffer.from(r.dados, "base64"),
      nota: `pnpm video ${impressao}`,
    });
    writeFileSync(join(PASTA, nome), arquivo);
    const segundos = r.tamanhos.length / FPS;
    console.log(`${nome} pronto: ${larg}×${alt}, ${segundos} s, ${mb(arquivo.length)} (${r.codec})`);
  }
} finally {
  await navegador.fechar();
}
