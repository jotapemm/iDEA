/**
 * Núcleo das telas de partículas.
 *
 * É o MESMO motor da landing da IVE (landing-page-ive/src/componentes/telas/
 * pontos.ts), trazido para cá quase intacto. A identidade da família é
 * "ponto branco no escuro", e as cenas das duas páginas precisam ser pintadas
 * pelo mesmo pincel para parecerem da mesma casa.
 *
 * O que mudou em relação à IVE:
 *
 * - `useTela` passa `{ parado }` para a fábrica da cena. O plano do hero
 *   precisa saber disso para desenhar o estado FINAL (pontos já organizados)
 *   quando a pessoa pediu menos movimento, em vez do caos do quadro zero.
 * - A cena pode ter `tocar(x, y)`: um clique no canvas. É o que deixa
 *   "soltar uma ideia" no plano.
 * - A cena redesenha sob pedido: com o evento "redesenhar" no canvas e
 *   quando as fontes terminam de chegar. Sem laço (menos movimento), é assim
 *   que uma cena parada responde ao que muda fora dela, como a camada ativa
 *   das Órbitas, e que um texto pintado no canvas troca a fonte de reserva
 *   pela de verdade.
 *
 * As duas decisões de desempenho seguem valendo (ver Baldes.pintar):
 * agrupar pontos em 7 baldes de opacidade e pintar cada balde com um único
 * Path2D. E toda tela pausa quando sai da vista (IntersectionObserver).
 */

import { useEffect, useRef, useState } from "react";

export type Ponteiro = { x: number; y: number; dentro: boolean };

export type Cena = {
  /** Roda na montagem e a cada mudança de tamanho. Semeie aqui. */
  medir(larg: number, alt: number): void;
  /** Um quadro. `t` é o tempo de animação em ms, e pausa junto com a tela. */
  quadro(ctx: CanvasRenderingContext2D, t: number, larg: number, alt: number): void;
  /** Arrasto do ponteiro desde o último quadro, em px. Opcional. */
  arrastar?(dx: number, dy: number): void;
  /** Clique ou toque, em px relativos ao canvas. Opcional. */
  tocar?(x: number, y: number): void;
};

export type Opcoes = {
  /** true quando o sistema pede menos movimento: só um quadro, sem laço. */
  parado: boolean;
};

/* --- curvas ---------------------------------------------------------- */

export const suave = (t: number) => t * t * (3 - 2 * t);
export const saida = (t: number) => 1 - (1 - t) ** 3;
export const faixa = (t: number, a: number, b: number) =>
  Math.max(0, Math.min(1, (t - a) / (b - a)));

/* --- pintor por baldes de opacidade ---------------------------------- */

const BALDES = 7;

export class Baldes {
  /** Cada balde é um array plano [x, y, tam, x, y, tam, ...]. */
  private listas: number[][] = Array.from({ length: BALDES }, () => []);

  limpar() {
    for (const l of this.listas) l.length = 0;
  }

  /** `a` de 0 a 1. Abaixo do primeiro balde o ponto é invisível: descarta. */
  por(a: number, x: number, y: number, tam: number) {
    const i = Math.round(Math.max(0, Math.min(1, a)) * (BALDES - 1));
    if (i === 0) return;
    this.listas[i].push(x, y, tam);
  }

  /**
   * `cor` em "r,g,b"; o alpha sai do balde.
   *
   * Os retângulos de cada balde entram num Path2D e são pintados de UMA vez.
   * Medido na IVE, com 49.500 pontos: um fillRect por ponto levava 33,6 ms,
   * e o Path2D em 6 preenchimentos, 13,3 ms. O orçamento de 60 fps é 16,7 ms.
   */
  pintar(ctx: CanvasRenderingContext2D, cor = "242,242,247", teto = 0.95) {
    for (let b = 1; b < BALDES; b++) {
      const lista = this.listas[b];
      if (!lista.length) continue;
      const caminho = new Path2D();
      for (let i = 0; i < lista.length; i += 3) {
        const s = lista[i + 2];
        caminho.rect(lista[i] - s / 2, lista[i + 1] - s / 2, s, s);
      }
      ctx.fillStyle = `rgba(${cor},${(b / (BALDES - 1)) * teto})`;
      ctx.fill(caminho);
    }
  }
}

/* --- o ponteiro, com mola -------------------------------------------- */

/**
 * Empurra um ponto para longe do cursor e o traz de volta com mola.
 * Guarda o próprio estado (deslocamento e velocidade) no objeto passado.
 */
export type Mola = { dx: number; dy: number; vx: number; vy: number };

export function molejar(
  p: Mola,
  sx: number,
  sy: number,
  ponteiro: Ponteiro,
  alcance: number,
  desvio: number,
  volta = 0.055,
  atrito = 0.86,
) {
  if (ponteiro.dentro) {
    const ax = sx + p.dx - ponteiro.x;
    const ay = sy + p.dy - ponteiro.y;
    const d2 = ax * ax + ay * ay;
    if (d2 < alcance * alcance && d2 > 0.01) {
      const d = Math.sqrt(d2);
      // Quadrático: quem está na beirada do alcance quase não sente, quem
      // está embaixo do cursor sente tudo.
      const empurra = (1 - d / alcance) ** 2 * desvio;
      p.vx += (ax / d) * empurra * 0.12;
      p.vy += (ay / d) * empurra * 0.12;
    }
  }
  p.vx += -p.dx * volta;
  p.vy += -p.dy * volta;
  p.vx *= atrito;
  p.vy *= atrito;
  p.dx += p.vx;
  p.dy += p.vy;
}

/* --- o hook ---------------------------------------------------------- */

export function useTela(fabrica: (ponteiro: Ponteiro, opcoes: Opcoes) => Cena) {
  const tela = useRef<HTMLCanvasElement>(null);
  // A fábrica é lida UMA vez, na montagem: a cena guarda o próprio estado
  // (pontos, ondas, relógio) e não pode renascer a cada render. useState
  // guarda a primeira versão e ignora as próximas.
  const [fab] = useState(() => fabrica);

  useEffect(() => {
    const cv = tela.current;
    if (!cv) return;
    const ctx = cv.getContext("2d", { alpha: true });
    if (!ctx) return;

    const parado = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ponteiro: Ponteiro = { x: -9999, y: -9999, dentro: false };
    const cena = fab(ponteiro, { parado });

    let larg = 0;
    let alt = 0;
    let tAcum = 0;

    function medir() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = cv!.getBoundingClientRect();
      if (!r.width || !r.height) return;
      larg = r.width;
      alt = r.height;
      cv!.width = Math.round(larg * dpr);
      cv!.height = Math.round(alt * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      cena.medir(larg, alt);

      // Pinta um quadro AQUI, de forma síncrona. requestAnimationFrame não
      // dispara em aba oculta, e redimensionar o canvas o apaga: sem isto a
      // pessoa veria um buraco no lugar da cena.
      ctx!.clearRect(0, 0, larg, alt);
      cena.quadro(ctx!, tAcum, larg, alt);
    }

    medir();

    let viva = true;
    const redesenhar = () => {
      if (!viva || !larg || !alt) return;
      ctx.clearRect(0, 0, larg, alt);
      cena.quadro(ctx, tAcum, larg, alt);
    };
    cv.addEventListener("redesenhar", redesenhar);
    document.fonts.ready.then(redesenhar);

    // ResizeObserver e não window.resize: a tela pode mudar de tamanho sem a
    // janela mudar (a coluna do grid encolhe quando o texto ao lado cresce).
    const ro = new ResizeObserver(medir);
    ro.observe(cv);

    /* --- ponteiro ---------------------------------------------------- */

    let arrastando = false;
    let ultimoX = 0;
    let ultimoY = 0;

    const aoMover = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      ponteiro.x = e.clientX - r.left;
      ponteiro.y = e.clientY - r.top;
      ponteiro.dentro = true;
      if (arrastando && cena.arrastar) {
        cena.arrastar(e.clientX - ultimoX, e.clientY - ultimoY);
        ultimoX = e.clientX;
        ultimoY = e.clientY;
      }
    };
    const aoSair = () => {
      ponteiro.dentro = false;
      ponteiro.x = ponteiro.y = -9999;
    };
    const aoDescer = (e: PointerEvent) => {
      if (cena.tocar) {
        const r = cv.getBoundingClientRect();
        cena.tocar(e.clientX - r.left, e.clientY - r.top);
      }
      if (!cena.arrastar) return;
      arrastando = true;
      ultimoX = e.clientX;
      ultimoY = e.clientY;
      cv.setPointerCapture(e.pointerId);
    };
    const aoSubir = (e: PointerEvent) => {
      if (!arrastando) return;
      arrastando = false;
      try {
        cv.releasePointerCapture(e.pointerId);
      } catch {
        /* o ponteiro já pode ter sido solto pelo navegador */
      }
    };

    if (!parado) {
      cv.addEventListener("pointermove", aoMover);
      cv.addEventListener("pointerleave", aoSair);
      cv.addEventListener("pointerdown", aoDescer);
      cv.addEventListener("pointerup", aoSubir);
      cv.addEventListener("pointercancel", aoSubir);
    }

    // Com menos movimento, o quadro que `medir()` pintou é o quadro final.
    if (parado) {
      return () => {
        viva = false;
        ro.disconnect();
        cv.removeEventListener("redesenhar", redesenhar);
      };
    }

    /* --- laço -------------------------------------------------------- */

    let quadro = 0;
    let ultimo = 0;
    let visivel = true;

    const passo = (agora: number) => {
      if (!ultimo) ultimo = agora;
      // Teto no delta: uma aba que volta do segundo plano entrega um salto
      // de vários segundos, e sem o teto a cena daria um pulo.
      const dt = Math.min(agora - ultimo, 64);
      ultimo = agora;
      tAcum += dt;

      ctx.clearRect(0, 0, larg, alt);
      cena.quadro(ctx, tAcum, larg, alt);

      quadro = requestAnimationFrame(passo);
    };

    // A ÚLTIMA entrada, e não a primeira: quando o layout muda rápido (a
    // janela redimensiona, a fonte chega), o navegador pode entregar várias de
    // uma vez, em ordem, e só a última diz onde a tela está agora.
    //
    // Se a cena parecer congelada durante um teste, veja antes se a aba está
    // visível: com a aba oculta o navegador não roda requestAnimationFrame nem
    // este observer, e o canvas fica no quadro em que estava.
    const io = new IntersectionObserver((entradas) => {
      const e = entradas[entradas.length - 1];
      if (e.isIntersecting === visivel) return;
      visivel = e.isIntersecting;
      if (visivel) {
        ultimo = 0; // não conta o tempo em que esteve fora da tela
        quadro = requestAnimationFrame(passo);
      } else {
        cancelAnimationFrame(quadro);
      }
    });
    io.observe(cv);

    quadro = requestAnimationFrame(passo);

    return () => {
      viva = false;
      cancelAnimationFrame(quadro);
      io.disconnect();
      ro.disconnect();
      cv.removeEventListener("redesenhar", redesenhar);
      cv.removeEventListener("pointermove", aoMover);
      cv.removeEventListener("pointerleave", aoSair);
      cv.removeEventListener("pointerdown", aoDescer);
      cv.removeEventListener("pointerup", aoSubir);
      cv.removeEventListener("pointercancel", aoSubir);
    };
  }, [fab]);

  return tela;
}
