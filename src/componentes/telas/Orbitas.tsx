/**
 * As órbitas do "O que fazemos", em 3D.
 *
 * É a mesma hierarquia do desenho visto de cima, agora visto um pouco de
 * lado: a automação é o cubo roxo no centro, sistemas web e apps giram nas
 * duas órbitas do plano, e a IA corre numa órbita inclinada que atravessa as
 * outras. Cada órbita é uma fila de pontos quadrados, e cada planeta é um
 * cubo: o quadrado da marca, com profundidade.
 *
 * Sem biblioteca 3D, como o plano do hero. Um ponto (x, y, z) do mundo gira
 * para o ponto de vista da câmera e vai para a tela dividido pela distância
 * até ela. É pouca conta para pouca coisa na tela, e o site não carrega os
 * ~150 KB de uma biblioteca para desenhar doze cubos.
 *
 * A ordem de pintura é a profundidade: o que está mais longe pinta primeiro.
 * As órbitas não se mexem (só os cubos andam sobre elas), então os pontos
 * são projetados e ordenados uma vez por tamanho de tela; a cada quadro, os
 * cubos entram nessa fila no lugar certo. Cada cubo esconde o trecho da
 * própria órbita que passa por dentro dele, senão a linha o atravessaria
 * como um espeto.
 *
 * A camada ativa vem de fora (das abas ao lado) e acende a órbita, o rótulo
 * e os cubos dela. O mouse escolhe a camada pela geometria da tela (ver
 * `alvo`). Com menos movimento, a cena fica parada no quadro inicial e só
 * redesenha quando a camada muda.
 */
import { useEffect, useRef } from "react";
import type { IdCamada } from "@/dados/camadas";
import { useTela, type Cena } from "./pontos";

type V3 = [number, number, number];
type IdOrbita = Exclude<IdCamada, "automacao">;

/* --- o mundo --------------------------------------------------------- */

// Unidades do mundo: as mesmas do desenho de cima, em que o sistema cabia
// num quadrado de 600.
const RAIO: Record<IdOrbita, number> = { web: 150, apps: 250, ia: 268 };
/** A órbita da IA sai ~25° do plano das outras... */
const IA_INCLINA = 0.44;
/** ...e cruza esse plano numa linha girada: sobe atrás, à direita, e desce na frente, à esquerda. */
const IA_NOS = -0.62;

/** Distância entre dois pontos da mesma órbita, em unidades do mundo. */
const ESPACO: Record<IdOrbita, number> = { web: 7, apps: 7, ia: 9 };
/** Opacidade da órbita em repouso e como camada ativa. */
const BRILHO: Record<IdOrbita, [number, number]> = { web: [0.34, 0.95], apps: [0.34, 0.95], ia: [0.5, 1] };
/** Milissegundos por volta. Negativo gira ao contrário. */
const VOLTA: Record<IdOrbita, number> = { web: 48000, apps: -90000, ia: 16000 };

type Material = { escuro: V3; claro: V3 };
const BRANCO: Material = { escuro: [74, 74, 86], claro: [246, 246, 250] };
const CINZA: Material = { escuro: [56, 56, 68], claro: [176, 176, 192] };
const ROXO: Material = { escuro: [54, 30, 132], claro: [178, 158, 255] };
const LILAS: Material = { escuro: [78, 58, 168], claro: [210, 200, 255] };

type Planeta = { orbita: IdOrbita; fase: number; lado: number; material: Material; giro: number };

const grau = (g: number) => (g * Math.PI) / 180;

const PLANETAS: Planeta[] = [
  ...[40, 160, 280].map(
    (g, i): Planeta => ({ orbita: "web", fase: grau(g), lado: 11, material: BRANCO, giro: 0.0009 + i * 0.0002 }),
  ),
  ...[20, 110, 200, 290].map(
    (g, i): Planeta => ({ orbita: "apps", fase: grau(g), lado: 9, material: CINZA, giro: 0.0007 + i * 0.00015 }),
  ),
  { orbita: "ia", fase: 0, lado: 12, material: LILAS, giro: 0.0016 },
];

/** O cubo da automação, no centro. */
const LADO_NUCLEO = 28;

/* --- a câmera -------------------------------------------------------- */

/** ~29° acima do plano: a vista "um pouco de lado". */
const ELEVACAO = 0.5;
/** Da câmera ao centro. Quanto menor, mais forte a perspectiva. */
const DIST = 1500;
const SEN = Math.sin(ELEVACAO);
const COS = Math.cos(ELEVACAO);
/** A luz vem do alto, da esquerda e da frente. */
const LUZ = normalizar([-0.45, 1, 0.55]);

const FUNDO: V3 = [5, 5, 9];
const APAGADO: V3 = [127, 127, 146];
const TEXTO: V3 = [242, 242, 247];
const ROXO_BRILHO: V3 = [130, 87, 245];
const LILAS_BRILHO: V3 = [160, 140, 255];

/* --- contas ---------------------------------------------------------- */

function normalizar([x, y, z]: V3): V3 {
  const n = Math.hypot(x, y, z);
  return [x / n, y / n, z / n];
}

const escalar = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Uma cor entre `a` e `b`: t = 0 é `a`, t = 1 é `b`. */
function mistura(a: V3, b: V3, t: number): V3 {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

const rgb = ([r, g, b]: V3) => `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;

/**
 * Do mundo para o olho da câmera. O mundo tem y para cima e o plano das
 * órbitas em y = 0; a câmera fica na frente, ELEVACAO acima do plano, e
 * olhar de lá é o mesmo que inclinar o mundo em torno do eixo X.
 */
function paraCamera([x, y, z]: V3): V3 {
  return [x, y * COS - z * SEN, y * SEN + z * COS];
}

/** O ponto de ângulo `a` (em radianos) de uma órbita, no mundo. */
function naOrbita(id: IdOrbita, a: number): V3 {
  const r = RAIO[id];
  const x = r * Math.cos(a);
  const z = r * Math.sin(a);
  if (id !== "ia") return [x, 0, z];
  // A IA: inclina o círculo em torno do eixo X e gira a linha dos nós em
  // torno do eixo vertical.
  const y = -z * Math.sin(IA_INCLINA);
  const zi = z * Math.cos(IA_INCLINA);
  const c = Math.cos(IA_NOS);
  const s = Math.sin(IA_NOS);
  return [x * c + zi * s, y, -x * s + zi * c];
}

/* --- a geometria de cada tamanho de tela ------------------------------ */

/** Um ponto na tela: posição, distância da câmera e px por unidade do mundo ali. */
type Proj = { x: number; y: number; d: number; px: number };
type PontoOrbita = Proj & { orbita: IdOrbita; a: number; perto: number };
type Rotulo = { id: IdCamada; texto: string; x: number; y: number; alinha: CanvasTextAlign };

type Geometria = {
  /** Do espaço da câmera para a tela. */
  projetar(c: V3): Proj;
  /** 0 no ponto mais distante do sistema, 1 no mais próximo. */
  perto(d: number): number;
  /** Os pontos de todas as órbitas, do mais longe para o mais perto. */
  pontos: PontoOrbita[];
  centro: Proj;
  rotulos: Rotulo[];
  /** A camada embaixo do ponteiro, ou null. */
  alvo(x: number, y: number): IdCamada | null;
};

const ORBITAS: IdOrbita[] = ["web", "apps", "ia"];
/** Folga em volta do sistema, em px, para os rótulos caberem. */
const FOLGA = { cima: 30, baixo: 12, esq: 12, dir: 36 };
/** Até quantos px de distância o ponteiro ainda pega uma órbita. */
const PEGA = 18;

let guardada: { chave: string; geo: Geometria } | null = null;

/**
 * A geometria de um tamanho de tela, calculada uma vez e reaproveitada pelos
 * quadros e pelo ponteiro.
 */
function geometria(larg: number, alt: number): Geometria | null {
  if (larg < 20 || alt < 20) return null;
  const chave = `${larg}x${alt}`;
  if (guardada?.chave === chave) return guardada.geo;

  // 1) Amostra as órbitas e projeta com escala 1, para medir a caixa do sistema.
  const crus = ORBITAS.flatMap((orbita) => {
    const n = Math.round((2 * Math.PI * RAIO[orbita]) / ESPACO[orbita]);
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * 2 * Math.PI;
      const c = paraCamera(naOrbita(orbita, a));
      const f = DIST / (DIST - c[2]);
      return { orbita, a, x: c[0] * f, y: -c[1] * f, d: DIST - c[2], f };
    });
  });
  let x0 = Infinity;
  let x1 = -Infinity;
  let y0 = Infinity;
  let y1 = -Infinity;
  let d0 = Infinity;
  let d1 = -Infinity;
  for (const c of crus) {
    x0 = Math.min(x0, c.x);
    x1 = Math.max(x1, c.x);
    y0 = Math.min(y0, c.y);
    y1 = Math.max(y1, c.y);
    d0 = Math.min(d0, c.d);
    d1 = Math.max(d1, c.d);
  }

  // 2) Encaixa a caixa no canvas, centrada no espaço que sobra das folgas.
  const livreL = larg - FOLGA.esq - FOLGA.dir;
  const livreA = alt - FOLGA.cima - FOLGA.baixo;
  const k = Math.min(livreL / (x1 - x0), livreA / (y1 - y0));
  const ox = FOLGA.esq + (livreL - k * (x1 - x0)) / 2 - k * x0;
  const oy = FOLGA.cima + (livreA - k * (y1 - y0)) / 2 - k * y0;

  const projetar = (c: V3): Proj => {
    const f = DIST / (DIST - c[2]);
    return { x: ox + k * c[0] * f, y: oy - k * c[1] * f, d: DIST - c[2], px: k * f };
  };
  const perto = (d: number) => Math.max(0, Math.min(1, (d1 - d) / (d1 - d0)));

  const pontos: PontoOrbita[] = crus
    .map((c) => ({ orbita: c.orbita, a: c.a, x: ox + k * c.x, y: oy + k * c.y, d: c.d, px: k * c.f, perto: perto(c.d) }))
    .sort((p, q) => q.d - p.d);

  // 3) Os rótulos, espalhados para não se empilharem: apps em cima do fundo
  //    da órbita dela, sistemas web embaixo da frente da dele (entre as duas
  //    órbitas), a IA na ponta direita e a automação embaixo do cubo.
  const centro = projetar([0, 0, 0]);
  const apps = projetar(paraCamera(naOrbita("apps", -Math.PI / 2)));
  const web = projetar(paraCamera(naOrbita("web", Math.PI / 2)));
  const ponta = pontos.filter((p) => p.orbita === "ia").reduce((m, p) => (p.x > m.x ? p : m));
  const rotulos: Rotulo[] = [
    { id: "apps", texto: "apps", x: apps.x, y: apps.y - 14, alinha: "center" },
    { id: "web", texto: "sistemas web", x: web.x, y: web.y + 18, alinha: "center" },
    { id: "ia", texto: "IA", x: ponta.x + 12, y: ponta.y + 4, alinha: "left" },
    { id: "automacao", texto: "automação", x: centro.x, y: centro.y + LADO_NUCLEO * centro.px + 16, alinha: "center" },
  ];

  const alvo = (x: number, y: number): IdCamada | null => {
    if (Math.hypot(x - centro.x, y - centro.y) < LADO_NUCLEO * centro.px + 10) return "automacao";
    let melhor: IdCamada | null = null;
    let menor = PEGA * PEGA;
    for (const p of pontos) {
      const dd = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (dd < menor) {
        menor = dd;
        melhor = p.orbita;
      }
    }
    return melhor;
  };

  const geo: Geometria = { projetar, perto, pontos, centro, rotulos, alvo };
  guardada = { chave, geo };
  return geo;
}

/* --- pincéis ----------------------------------------------------------- */

const VERTICES: V3[] = Array.from({ length: 8 }, (_, i): V3 => [i & 1 ? 1 : -1, i & 2 ? 1 : -1, i & 4 ? 1 : -1]);
const FACES: { v: [number, number, number, number]; n: V3 }[] = [
  { v: [1, 3, 7, 5], n: [1, 0, 0] },
  { v: [0, 4, 6, 2], n: [-1, 0, 0] },
  { v: [2, 6, 7, 3], n: [0, 1, 0] },
  { v: [0, 1, 5, 4], n: [0, -1, 0] },
  { v: [4, 5, 7, 6], n: [0, 0, 1] },
  { v: [0, 2, 3, 1], n: [0, 0, -1] },
];

/**
 * Um cubo: gira em torno do próprio eixo, inclina esse eixo, vai para o
 * lugar no mundo e é pintado face a face. Só entram as faces viradas para a
 * câmera (no máximo três), e a cor de cada uma sai de quanto ela encara a
 * luz. `nevoa` apaga o cubo em direção ao fundo quando ele está longe.
 */
function pintarCubo(
  ctx: CanvasRenderingContext2D,
  geo: Geometria,
  centro: V3,
  lado: number,
  giro: number,
  inclina: number,
  m: Material,
  nevoa: number,
) {
  const h = lado / 2;
  const cg = Math.cos(giro);
  const sg = Math.sin(giro);
  const ci = Math.cos(inclina);
  const si = Math.sin(inclina);
  const girar = ([x, y, z]: V3): V3 => {
    const x1 = x * cg + z * sg;
    const z1 = -x * sg + z * cg;
    return [x1, y * ci - z1 * si, y * si + z1 * ci];
  };
  const cam = VERTICES.map((v) => {
    const r = girar(v);
    return paraCamera([centro[0] + r[0] * h, centro[1] + r[1] * h, centro[2] + r[2] * h]);
  });
  const tela = cam.map((c) => geo.projetar(c));

  ctx.lineWidth = 0.75;
  ctx.lineJoin = "round";
  for (const f of FACES) {
    const n = girar(f.n);
    // Do centro da face até a câmera, que no espaço dela fica em z = DIST.
    let mx = 0;
    let my = 0;
    let mz = 0;
    for (const i of f.v) {
      mx += cam[i][0];
      my += cam[i][1];
      mz += cam[i][2];
    }
    if (escalar(paraCamera(n), [-mx / 4, -my / 4, DIST - mz / 4]) <= 0) continue; // de costas
    const luz = Math.max(0, escalar(n, LUZ));
    const cor = rgb(mistura(FUNDO, mistura(m.escuro, m.claro, 0.1 + 0.9 * luz), nevoa));
    ctx.fillStyle = cor;
    // O contorno da mesma cor fecha a fresta clara que o antialias deixa
    // entre duas faces vizinhas.
    ctx.strokeStyle = cor;
    ctx.beginPath();
    ctx.moveTo(tela[f.v[0]].x, tela[f.v[0]].y);
    for (let j = 1; j < 4; j++) ctx.lineTo(tela[f.v[j]].x, tela[f.v[j]].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

function brilho(ctx: CanvasRenderingContext2D, x: number, y: number, raio: number, cor: V3, alfa: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, raio);
  g.addColorStop(0, `rgba(${cor[0]},${cor[1]},${cor[2]},${alfa})`);
  g.addColorStop(1, `rgba(${cor[0]},${cor[1]},${cor[2]},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - raio, y - raio, raio * 2, raio * 2);
}

type Ocupado = { a: number; folga: number };

/** Se o ponto da órbita cai dentro de um dos cubos que andam nela. */
function escondido(p: PontoOrbita, ocupados: Ocupado[]) {
  for (const o of ocupados) {
    const d = Math.abs(((((p.a - o.a) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI);
    if (d < o.folga) return true;
  }
  return false;
}

/* --- o componente ------------------------------------------------------ */

export function Orbitas({ ativa, aoEscolher }: { ativa: IdCamada; aoEscolher: (id: IdCamada) => void }) {
  const ativaRef = useRef(ativa);
  const escolherRef = useRef(aoEscolher);

  const tela = useTela((_ponteiro, { parado }): Cena => {
    const foco: Record<IdCamada, number> = { automacao: 0, web: 0, apps: 0, ia: 0 };
    let antes = -1;
    let fonte = "monospace";

    return {
      medir() {
        const raiz = getComputedStyle(document.documentElement);
        fonte = raiz.getPropertyValue("--fonte-mono").trim() || "monospace";
      },

      quadro(ctx, t, larg, alt) {
        const geo = geometria(larg, alt);
        if (!geo) return;
        const tc = parado ? 0 : t;

        // O foco anda até a camada ativa em ~0,15 s; parado, chega de uma vez.
        const dt = antes < 0 ? Infinity : t - antes;
        antes = t;
        const passo = parado ? 1 : 1 - Math.exp(-dt / 150);
        for (const id of Object.keys(foco) as IdCamada[]) {
          foco[id] += ((ativaRef.current === id ? 1 : 0) - foco[id]) * passo;
        }

        // Os cubos deste quadro, cada um com a sua profundidade.
        const ocupados: Record<IdOrbita, Ocupado[]> = { web: [], apps: [], ia: [] };
        const cubos: { d: number; pintar: () => void }[] = [];
        for (const pl of PLANETAS) {
          const a = pl.fase + (2 * Math.PI * tc) / VOLTA[pl.orbita];
          const lado = pl.lado * (1 + 0.2 * foco[pl.orbita]);
          ocupados[pl.orbita].push({ a, folga: (0.75 * lado) / RAIO[pl.orbita] });
          const mundo = naOrbita(pl.orbita, a);
          const pr = geo.projetar(paraCamera(mundo));
          cubos.push({
            d: pr.d,
            pintar: () => {
              if (pl.orbita === "ia") brilho(ctx, pr.x, pr.y, lado * pr.px * 2.6, LILAS_BRILHO, 0.3 + 0.25 * foco.ia);
              pintarCubo(ctx, geo, mundo, lado, pl.fase + tc * pl.giro, 0.5, pl.material, 0.55 + 0.45 * geo.perto(pr.d));
            },
          });
        }
        const nucleo = LADO_NUCLEO * (1 + 0.15 * foco.automacao);
        cubos.push({
          d: geo.centro.d,
          pintar: () => {
            brilho(ctx, geo.centro.x, geo.centro.y, nucleo * geo.centro.px * 2.4, ROXO_BRILHO, 0.3 + 0.25 * foco.automacao);
            pintarCubo(ctx, geo, [0, 0, 0], nucleo, 0.6 + tc * 0.00022, 0, ROXO, 1);
          },
        });
        cubos.sort((p, q) => q.d - p.d);

        // Pontos e cubos juntos, do mais longe para o mais perto.
        const branco = "rgb(242,242,247)";
        ctx.fillStyle = branco;
        let c = 0;
        for (const p of geo.pontos) {
          while (c < cubos.length && cubos[c].d > p.d) {
            ctx.globalAlpha = 1;
            cubos[c++].pintar();
            ctx.fillStyle = branco;
          }
          if (escondido(p, ocupados[p.orbita])) continue;
          const [b0, b1] = BRILHO[p.orbita];
          ctx.globalAlpha = (b0 + (b1 - b0) * foco[p.orbita]) * (0.4 + 0.6 * p.perto);
          const s = (p.orbita === "ia" ? 1.15 : 1) * (1.2 + p.perto) * (1 + 0.15 * foco[p.orbita]);
          ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
        }
        ctx.globalAlpha = 1;
        while (c < cubos.length) cubos[c++].pintar();

        // Os rótulos, por cima de tudo.
        ctx.font = `500 12px ${fonte}`;
        ctx.textBaseline = "alphabetic";
        for (const r of geo.rotulos) {
          ctx.fillStyle = rgb(mistura(APAGADO, TEXTO, foco[r.id]));
          ctx.textAlign = r.alinha;
          ctx.fillText(r.texto, r.x, r.y);
        }
      },
    };
  });

  // A camada ativa vem das abas. Com menos movimento não há laço, então a
  // cena precisa ser avisada para redesenhar.
  useEffect(() => {
    ativaRef.current = ativa;
    tela.current?.dispatchEvent(new Event("redesenhar"));
  }, [ativa, tela]);

  useEffect(() => {
    escolherRef.current = aoEscolher;
  }, [aoEscolher]);

  // O ponteiro escolhe a camada pela geometria: o núcleo, ou a órbita mais
  // perto do cursor, até PEGA px. No celular, o toque escolhe.
  useEffect(() => {
    const cv = tela.current;
    if (!cv) return;
    const alvo = (e: MouseEvent) => {
      const r = cv.getBoundingClientRect();
      return geometria(r.width, r.height)?.alvo(e.clientX - r.left, e.clientY - r.top) ?? null;
    };
    const mover = (e: PointerEvent) => {
      const id = alvo(e);
      cv.style.cursor = id ? "pointer" : "";
      if (id && e.pointerType === "mouse") escolherRef.current(id);
    };
    const tocar = (e: MouseEvent) => {
      const id = alvo(e);
      if (id) escolherRef.current(id);
    };
    cv.addEventListener("pointermove", mover);
    cv.addEventListener("click", tocar);
    return () => {
      cv.removeEventListener("pointermove", mover);
      cv.removeEventListener("click", tocar);
    };
  }, [tela]);

  return <canvas ref={tela} className="block h-full w-full" aria-hidden="true" />;
}
