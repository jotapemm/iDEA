/**
 * O plano de pontos do hero.
 *
 * A metáfora inteira da marca numa cena só:
 *
 * - Os pontos NASCEM espalhados pela tela, à deriva. É a bagunça: planilha
 *   solta, copia-e-cola, processo que só existe na cabeça de alguém.
 * - O quadrado roxo é a ideia. Ela aparece primeiro, e a ordem se espalha a
 *   partir dela: os pontos mais próximos entram no lugar antes, os mais
 *   distantes depois. A bagunça vira sistema, em onda.
 * - Depois disso a ideia flutua sobre o plano e, de tempos em tempos, toca a
 *   superfície. Cada toque é uma onda que atravessa o sistema inteiro.
 * - Um clique no plano solta uma ideia nova, que cai e faz a própria onda.
 *
 * Não é 3D de verdade nem usa biblioteca. É a projeção clássica de um chão
 * em perspectiva: um ponto do plano em (u, z), onde u é o lado e z a
 * distância, aparece na tela em
 *
 *     x = centro + u · f / z
 *     y = horizonte + (1 - h) · f / z
 *
 * com f a distância focal e h a altura da onda naquele ponto. As fileiras
 * são espaçadas por igual NA TELA (e não no plano), o que dá a compressão
 * natural perto do horizonte sem gastar pontos onde ninguém enxerga.
 */
import { Baldes, faixa, molejar, saida, useTela, type Cena, type Mola } from "./pontos";

const TAU = Math.PI * 2;

/* Reação ao cursor (px). Igual à esfera da IVE, um pouco mais contida. */
const ALCANCE = 140;
const DESVIO = 20;

/* As ondas. Distâncias em unidades do plano; a câmera está a 1 de altura. */
const VELOCIDADE = 0.0016; // por ms
const COMPRIMENTO = 0.6; // entre cristas
const PACOTE = 0.85; // largura do anel
const AMPLITUDE = 0.05;
const VIDA_ONDA = 7000; // ms
const MAX_ONDAS = 10;

/* O ritmo da ideia. */
const INTERVALO = 3600; // ms entre um toque e outro
const PRIMEIRO_TOQUE = 650;
const QUEDA = 420; // ms que uma ideia solta pelo clique leva para cair

/* A entrada: quanto cada ponto leva para sair do caos e chegar ao lugar. */
const ENTRADA = 1300;

type P = Mola & {
  u: number;
  z: number;
  /** 0 no horizonte, 1 na frente. Manda na neblina e no tamanho. */
  q: number;
  caosX: number;
  caosY: number;
  fase: number;
  atraso: number;
  brilho: number;
};

type Onda = { u: number; z: number; t0: number; forca: number };
type Gota = { u: number; z: number; t0: number };

/**
 * As proporções da câmera.
 *
 * A partir de 1024px o plano fica ATRÁS do título (ver Hero.tsx): o
 * horizonte sobe para o meio e o céu fica para o texto. Abaixo disso a cena
 * mora embaixo do texto, e quase tudo vira chão. O ponto de troca é o mesmo
 * `lg` do Tailwind que o Hero usa; mudou lá, muda aqui.
 */
function camera(larg: number, alt: number) {
  const sobreposto = window.matchMedia("(min-width: 1024px)").matches;
  return sobreposto
    ? {
        horizonte: alt * 0.43,
        f: alt * 0.62,
        alvoX: 0.77,
        espaco: Math.max(11, Math.min(15, larg / 105)),
      }
    : { horizonte: alt * 0.12, f: Math.min(larg, alt * 1.6) * 0.8, alvoX: 0.7, espaco: 11 };
}

export function Plano({ className }: { className?: string }) {
  const tela = useTela((ponteiro, { parado }): Cena => {
    let ps: P[] = [];
    let ondas: Onda[] = [];
    let gotas: Gota[] = [];
    const baldes = new Baldes();

    let larg = 0;
    let cx = 0;
    let horizonte = 0;
    let f = 1;
    let Z0 = 1;
    let Z1 = 20;
    let U = 6;
    const ideia = { u: 0, z: 3 };

    let tAtual = 0;
    let ultimoToque = -99999;
    let proximoToque = PRIMEIRO_TOQUE;

    function emitir(u: number, z: number, t0: number, forca: number) {
      ondas.push({ u, z, t0, forca });
      if (ondas.length > MAX_ONDAS) ondas.shift();
    }

    return {
      medir(l, a) {
        larg = l;
        cx = l / 2;
        const cam = camera(l, a);
        horizonte = cam.horizonte;
        f = cam.f;

        // A fileira da frente nasce um pouco abaixo da borda: o chão sangra
        // para fora da tela em vez de terminar numa linha reta.
        const yPerto = a * 1.06;
        const yLonge = horizonte + Math.max(8, a * 0.028);
        Z0 = f / (yPerto - horizonte);
        Z1 = f / (yLonge - horizonte);

        // A ideia mora a 3,2 fileiras-da-frente de distância e é posicionada
        // pela TELA (77% da largura), não pelo plano: em qualquer proporção
        // ela cai no mesmo lugar do desenho.
        ideia.z = Z0 * 3.2;
        ideia.u = ((cam.alvoX * l - cx) * ideia.z) / f;

        // Até ~5 fileiras-da-frente o chão cobre a largura toda; dali para o
        // fundo ele afunila, e a neblina esconde a borda.
        U = Math.max(((l / 2 + 60) * Z0 * 5) / f, Math.abs(ideia.u) * 1.8);

        const du = (cam.espaco * Z0) / f;
        ps = [];
        for (let y = yPerto; y > yLonge; y -= cam.espaco) {
          const z = f / (y - horizonte);
          const q = (y - yLonge) / (yPerto - yLonge);
          // Perto do horizonte os pontos de uma fileira ficariam a menos de
          // 4px um do outro: pula colunas em vez de empilhar tinta.
          const pulo = Math.max(1, Math.ceil(4 / ((du * f) / z)));
          const meia = Math.min(U, ((l / 2 + 40) * z) / f);
          const n = Math.floor(meia / du);
          for (let k = -n; k <= n; k += pulo) {
            const u = k * du;
            const r = Math.hypot(u - ideia.u, z - ideia.z);
            ps.push({
              u,
              z,
              q,
              caosX: Math.random() * l,
              caosY: Math.random() * a,
              fase: Math.random() * TAU,
              // A ordem se espalha a partir da ideia. 230 ms por unidade de
              // distância: o fundo do plano fica pronto em ~4,5 s.
              atraso: 300 + r * 230 + Math.random() * 260,
              brilho: 0.55 + Math.random() * 0.45,
              dx: 0,
              dy: 0,
              vx: 0,
              vy: 0,
            });
          }
        }

        // Com menos movimento só existe um quadro: ele mostra o plano já
        // organizado e uma onda congelada no meio do caminho.
        if (parado && !ondas.length) emitir(ideia.u, ideia.z, 9000 - 1800, 1);
      },

      tocar(x, y) {
        if (y < horizonte + 6) return; // clique no céu
        const z = f / (y - horizonte);
        if (z > Z1 || z < Z0 * 0.7) return;
        gotas.push({ u: ((x - cx) * z) / f, z, t0: tAtual });
        if (gotas.length > 6) gotas.shift();
      },

      quadro(ctx, t) {
        tAtual = t;
        const tc = parado ? 9000 : t;

        /* --- eventos -------------------------------------------------- */

        if (!parado && tc >= proximoToque) {
          emitir(ideia.u, ideia.z, tc, 1);
          ultimoToque = tc;
          proximoToque = tc + INTERVALO + Math.random() * 900;
        }

        gotas = gotas.filter((g) => {
          if (tc - g.t0 < QUEDA) return true;
          emitir(g.u, g.z, tc, 1.3);
          return false;
        });

        ondas = ondas.filter((o) => tc - o.t0 < VIDA_ONDA);

        /* --- o plano -------------------------------------------------- */

        baldes.limpar();

        for (const p of ps) {
          // Uma ondulação de fundo, bem baixa, para o plano nunca parar.
          let h = 0.01 * Math.sin(p.u * 1.9 + tc * 0.00055) + 0.008 * Math.sin(p.z * 2.4 - tc * 0.0004);

          // As ondas são anéis que se afastam da origem. Cada uma só
          // calcula onde o anel está passando; o resto do plano ela pula.
          for (const o of ondas) {
            const idade = tc - o.t0;
            const du = p.u - o.u;
            const dz = p.z - o.z;
            const d = Math.sqrt(du * du + dz * dz) - VELOCIDADE * idade;
            if (d > 2.6 * PACOTE || d < -2.6 * PACOTE) continue;
            const envelope = Math.exp(-(d * d) / (PACOTE * PACOTE)) * Math.exp(-idade / 3800);
            h += AMPLITUDE * o.forca * envelope * Math.cos((TAU * d) / COMPRIMENTO);
          }

          const esc = f / p.z;
          const ox = cx + p.u * esc;
          const oy = horizonte + (1 - h) * esc;

          // A entrada: do caos (à deriva) para o lugar no plano.
          const e = parado ? 1 : saida(faixa(tc, p.atraso, p.atraso + ENTRADA));
          let sx = ox;
          let sy = oy;
          if (e < 1) {
            const vx = p.caosX + Math.sin(tc * 0.0012 + p.fase) * 9;
            const vy = p.caosY + Math.cos(tc * 0.001 + p.fase * 1.3) * 9;
            sx = vx + (ox - vx) * e;
            sy = vy + (oy - vy) * e;
          }

          molejar(p, sx, sy, ponteiro, ALCANCE, DESVIO);
          sx += p.dx;
          sy += p.dy;

          // Luz: neblina no fundo, borda lateral apagada, cristas acesas.
          const neblina = 0.14 + 0.86 * p.q ** 1.3;
          const borda = 1 - faixa(Math.abs(p.u) / U, 0.78, 1);
          const crista = Math.max(-1, Math.min(1, h / (AMPLITUDE * 0.55)));
          const aOrdem = Math.min(1, 1.3 * p.brilho * neblina * borda * (0.62 + 0.38 * crista));
          const aCaos = 0.1 + p.brilho * 0.22;

          baldes.por(aCaos + (aOrdem - aCaos) * e, sx, sy, 1.1 + 1.4 * p.q + Math.max(0, crista) * 0.7);
        }

        baldes.pintar(ctx);

        /* --- as ideias soltas pelo clique, caindo --------------------- */

        for (const g of gotas) {
          const k = faixa(tc, g.t0, g.t0 + QUEDA);
          const altura = 0.7 * (1 - k * k); // acelera como queda de verdade
          const esc = f / g.z;
          const lado = Math.max(4, Math.min(13, 9 * (ideia.z / g.z)));
          quadrado(ctx, cx + g.u * esc, horizonte + (1 - altura) * esc, lado, 1);
        }

        /* --- a ideia -------------------------------------------------- */

        // Ela desce até quase tocar o plano na hora do toque e volta a
        // flutuar. O mergulho é calculado pelos DOIS toques, o último e o
        // próximo, para a descida começar antes da onda nascer.
        const mergulho =
          Math.exp(-(((tc - proximoToque) / 150) ** 2)) + Math.exp(-(((tc - ultimoToque) / 190) ** 2));
        const nasce = parado ? 1 : saida(faixa(tc, 0, 500));
        const altura = 0.46 + 0.03 * Math.sin(tc * 0.0019) - 0.3 * Math.min(1, mergulho);
        const esc = f / ideia.z;
        const x = cx + ideia.u * esc;
        const lado = Math.max(9, Math.min(14, larg / 110)) * (0.3 + 0.7 * nasce);

        // O reflexo no plano, bem fraco: é ele que dá a altura do ponto.
        ctx.fillStyle = `rgba(130,87,245,${0.18 * nasce})`;
        ctx.fillRect(x - lado / 2, horizonte + (1 + altura * 0.3) * esc - lado * 0.3, lado, lado * 0.6);

        quadrado(ctx, x, horizonte + (1 - altura) * esc, lado, nasce);
      },
    };
  });

  return <canvas ref={tela} className={`block h-full w-full ${className ?? ""}`} aria-hidden="true" />;
}

/** O quadrado roxo com brilho. É o único desenho colorido da cena. */
function quadrado(ctx: CanvasRenderingContext2D, x: number, y: number, lado: number, alfa: number) {
  ctx.save();
  ctx.globalAlpha = alfa;
  ctx.shadowColor = "rgba(130,87,245,0.9)";
  ctx.shadowBlur = 24;
  ctx.fillStyle = "#8257f5";
  ctx.fillRect(x - lado / 2, y - lado / 2, lado, lado);
  ctx.restore();
}
