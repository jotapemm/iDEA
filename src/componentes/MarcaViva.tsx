/**
 * A marca grande do rodapé, contando a própria história.
 *
 * Primeiro o ponto final da vez anterior cai e sai pela borda de baixo: a
 * ideia entregue sai de cena. Aí o pingo sai do "i", pula por cima do D, do
 * E e do A, e pousa no fim como o novo ponto final, enquanto um pingo novo
 * nasce no "i". É a frase da marca em menos de três segundos: a ideia
 * começa num ponto, termina em ponto final, e a próxima já está nascendo.
 *
 * Toca uma vez quando o rodapé aparece, e de novo a cada vez que o ponteiro
 * passa por cima. Com menos movimento, fica parada.
 *
 * As posições são MEDIDAS na hora de cada salto (getBoundingClientRect), e
 * não chumbadas: o tamanho da logo acompanha a largura da tela, e as letras
 * dependem da fonte que de fato carregou. A queda também é medida: ela vai
 * até a borda da primeira caixa que corta o que passa dela (overflow), que
 * no rodapé é a moldura da logo.
 */
import { useCallback, useEffect, useRef } from "react";

const DURACAO = 2400; // a viagem do pingo, do "i" até virar ponto final
const CAI = 480; // a queda do ponto final antigo
const ESTICA = 1.2; // quanto o ponto alonga na queda, com a velocidade
// A viagem começa aos 400ms e ainda passa os primeiros 6% parada no "i":
// o pingo só decola depois que o ponto antigo sumiu pela borda.
const ESPERA = 400;
const SUBIDA = "cubic-bezier(.2,.65,.4,1)"; // desacelera até o alto do salto
const QUEDA = "cubic-bezier(.55,0,.85,.35)"; // acelera na descida

/** A borda de baixo da primeira caixa acima de `el` que corta o que passa dela. */
function bordaQueCorta(el: HTMLElement): number {
  for (let caixa = el.parentElement; caixa; caixa = caixa.parentElement) {
    const cs = getComputedStyle(caixa);
    if (cs.overflowY !== "visible") {
      return caixa.getBoundingClientRect().bottom - parseFloat(cs.borderBottomWidth);
    }
  }
  return window.innerHeight;
}

export function MarcaViva({ tamanho, className = "" }: { tamanho: string; className?: string }) {
  const raiz = useRef<HTMLSpanElement>(null);
  const pingo = useRef<HTMLSpanElement>(null);
  const letras = useRef<(HTMLSpanElement | null)[]>([]);
  const ponto = useRef<HTMLSpanElement>(null);
  const viajante = useRef<HTMLSpanElement>(null);
  const rodando = useRef(false);

  const lancar = useCallback(() => {
    const r = raiz.current;
    const pi = pingo.current;
    const po = ponto.current;
    const vi = viajante.current;
    if (!r || !pi || !po || !vi || rodando.current) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const R = r.getBoundingClientRect();
    const P = pi.getBoundingClientRect();
    const F = po.getBoundingClientRect();
    const lado = P.width;
    const fs = parseFloat(getComputedStyle(r).fontSize);

    // O ponto final pousa na linha de base; a altura das maiúsculas sai da
    // fonte real. Juntas, dão o topo de cada letra.
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return;
    const cs = getComputedStyle(r);
    ctx.font = `${cs.fontWeight} ${fs}px ${cs.fontFamily}`;
    const topo = F.bottom - ctx.measureText("D").actualBoundingBoxAscent;

    const inicio = { x: P.left, y: P.top };
    const paradas = letras.current
      .filter((l): l is HTMLSpanElement => !!l)
      .map((l) => {
        const b = l.getBoundingClientRect();
        return { x: b.left + b.width / 2 - lado / 2 - inicio.x, y: topo - lado - inicio.y };
      });
    paradas.push({ x: F.left - inicio.x, y: F.top - inicio.y });

    const salto = fs * 0.3;
    const passo = 0.84 / paradas.length;
    const quadros: Keyframe[] = [
      { offset: 0, transform: "translate(0px, 0px)" },
      { offset: 0.06, transform: "translate(0px, 0px)", easing: SUBIDA },
    ];
    let antes = { x: 0, y: 0 };
    paradas.forEach((q, i) => {
      const t0 = 0.06 + i * passo;
      const apice = { x: (antes.x + q.x) / 2, y: Math.min(antes.y, q.y) - salto };
      quadros.push({ offset: t0 + passo / 2, transform: `translate(${apice.x}px, ${apice.y}px)`, easing: QUEDA });
      quadros.push({ offset: t0 + passo, transform: `translate(${q.x}px, ${q.y}px)`, easing: SUBIDA });
      antes = q;
    });
    quadros.push({ offset: 1, transform: `translate(${antes.x}px, ${antes.y}px)` });

    vi.style.left = `${P.left - R.left}px`;
    vi.style.top = `${P.top - R.top}px`;

    // Até onde o ponto antigo cai: até o topo dele passar da borda que corta.
    // Ele alonga a partir da base, então o topo fica ESTICA vezes a altura
    // acima dela.
    const queda = bordaQueCorta(r) - F.bottom + F.height * ESTICA;
    const total = ESPERA + DURACAO;
    const em = (ms: number) => ms / total; // tempo em ms → posição na linha do tempo inteira

    rodando.current = true;
    const pousa = 0.9;
    const viagem = { duration: DURACAO, delay: ESPERA };
    vi.animate(quadros, viagem);
    vi.animate(
      [
        { offset: 0, opacity: 1 },
        { offset: pousa, opacity: 1 },
        { offset: pousa + 0.001, opacity: 0 },
        { offset: 1, opacity: 0 },
      ],
      viagem,
    );
    // O pingo some do "i" e renasce no fim, crescendo de baixo.
    pi.animate(
      [
        { offset: 0, opacity: 0, transform: "scale(1)" },
        { offset: pousa - 0.04, opacity: 0, transform: "scale(0)" },
        { offset: pousa - 0.039, opacity: 1, transform: "scale(0)" },
        { offset: 1, opacity: 1, transform: "scale(1)" },
      ],
      { ...viagem, easing: "linear" },
    );
    // O ponto final antigo cai, esticando com a velocidade, e sai pela borda.
    // Lá embaixo ele volta ao lugar já invisível, e só reaparece quando a
    // ideia chega nele, achatando no pouso.
    const pf = po.animate(
      [
        { offset: 0, transform: "translateY(0px) scale(1, 1)", easing: QUEDA },
        { offset: em(CAI), transform: `translateY(${queda}px) scale(${1 / ESTICA}, ${ESTICA})` },
        { offset: em(CAI), transform: "translateY(0px) scale(0, 0)" },
        { offset: em(ESPERA + pousa * DURACAO), transform: "translateY(0px) scale(0, 0)" },
        { offset: em(ESPERA + (pousa + 0.035) * DURACAO), transform: "translateY(0px) scale(1.35, 0.7)" },
        { offset: 1, transform: "translateY(0px) scale(1, 1)" },
      ],
      { duration: total },
    );
    pf.onfinish = pf.oncancel = () => {
      rodando.current = false;
    };
  }, []);

  useEffect(() => {
    const r = raiz.current;
    if (!r) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        // Espera a fonte: medir com a fonte de reserva erraria as letras.
        document.fonts.ready.then(() => setTimeout(lancar, 250));
        io.disconnect();
      },
      { threshold: 0.6 },
    );
    io.observe(r);
    return () => io.disconnect();
  }, [lancar]);

  return (
    <span
      ref={raiz}
      className={`marca relative cursor-default select-none ${className}`}
      style={{ fontSize: tamanho }}
      role="img"
      aria-label="iDEA."
      onPointerEnter={lancar}
      onClick={lancar}
    >
      <span aria-hidden="true">ı</span>
      <span ref={pingo} className="marca-pingo" aria-hidden="true" />
      {["D", "E", "A"].map((l, i) => (
        <span
          key={l}
          aria-hidden="true"
          ref={(el) => {
            letras.current[i] = el;
          }}
        >
          {l}
        </span>
      ))}
      <span ref={ponto} className="marca-ponto" aria-hidden="true" />
      <span ref={viajante} className="marca-viajante pointer-events-none absolute opacity-0" aria-hidden="true" />
    </span>
  );
}
