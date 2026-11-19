/**
 * A esfera pontilhada da IVE, aqui no card do Laboratório.
 *
 * É o porte direto de landing-page-ive/src/componentes/telas/Esfera.tsx, sem
 * mudança de comportamento: quem já viu a landing da IVE reconhece o produto
 * pela imagem antes de ler o nome.
 *
 * O centro brilhante não é um gradiente desenhado por cima. Ele SAI da
 * distribuição: espalhar pontos uniformemente pelo VOLUME (daí o cbrt) e
 * projetar em 2D acumula mais pontos no meio, porque a corda que atravessa a
 * esfera é mais longa no centro do que na borda.
 */
import { Baldes, faixa, molejar, useTela, type Cena, type Mola } from "./pontos";

/** Fração dos pontos que fica FORA da bola, formando o halo esfumaçado. */
const HALO = 0.22;
const ALCANCE = 150;
const DESVIO = 22;
const NASCER = 1500;

type P = Mola & { x: number; y: number; z: number; brilho: number };

function semear(quantos: number, raio: number): P[] {
  const ps: P[] = new Array(quantos);
  for (let i = 0; i < quantos; i++) {
    // Direção uniforme: sortear z e o ângulo separadamente. Sortear dois
    // ângulos concentraria pontos nos polos.
    const z = Math.random() * 2 - 1;
    const a = Math.random() * Math.PI * 2;
    const s = Math.sqrt(1 - z * z);
    const halo = Math.random() < HALO;
    const r = halo ? raio * (1 + 0.75 * Math.random() ** 2) : raio * Math.cbrt(Math.random());
    ps[i] = {
      x: r * s * Math.cos(a),
      y: r * s * Math.sin(a),
      z: r * z,
      brilho: halo ? 0.1 + Math.random() * 0.3 : 0.45 + Math.random() * 0.55,
      dx: 0,
      dy: 0,
      vx: 0,
      vy: 0,
    };
  }
  return ps;
}

export function Esfera({ className }: { className?: string }) {
  const tela = useTela((ponteiro, { parado }): Cena => {
    let ps: P[] = [];
    let cx = 0;
    let cy = 0;
    const baldes = new Baldes();

    return {
      medir(larg, alt) {
        cx = larg / 2;
        cy = alt / 2;
        const raio = Math.min(larg, alt) * 0.34;
        ps = semear(Math.round(Math.max(2400, Math.min(7000, raio * 30))), raio);
      },

      quadro(ctx, t) {
        const tc = parado ? NASCER * 2 : t;
        const giro = tc * 0.00016;
        const nascendo = faixa(tc, 0, NASCER);
        const sen = Math.sin(giro);
        const cos = Math.cos(giro);
        const si = Math.sin(0.32);
        const ci = Math.cos(0.32);
        const dist = 500;

        baldes.limpar();
        for (const p of ps) {
          // gira em Y, depois inclina em X
          const x1 = p.x * cos - p.z * sen;
          const z1 = p.x * sen + p.z * cos;
          const y2 = p.y * ci - z1 * si;
          const z2 = p.y * si + z1 * ci;
          const escala = dist / (dist + z2);
          let sx = cx + x1 * escala;
          let sy = cy + y2 * escala;

          // Entrada: os pontos partem do centro e abrem até o lugar.
          if (nascendo < 1) {
            const k = 1 - (1 - nascendo) ** 3;
            sx = cx + (sx - cx) * k;
            sy = cy + (sy - cy) * k;
          }

          molejar(p, sx, sy, ponteiro, ALCANCE, DESVIO);
          sx += p.dx;
          sy += p.dy;

          const prof = (escala - 0.82) / 0.36; // 0 fundo, 1 frente
          const a = p.brilho * (0.3 + Math.max(0, Math.min(1, prof)) * 0.7) * (0.35 + nascendo * 0.65);
          baldes.por(a, sx, sy, escala > 1.02 ? 1.9 : 1.3);
        }
        baldes.pintar(ctx);
      },
    };
  });

  return <canvas ref={tela} className={`block h-full w-full ${className ?? ""}`} aria-hidden="true" />;
}
