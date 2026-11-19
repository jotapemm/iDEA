import { useEffect, useRef, useState } from "react";
import { PontoFinal } from "@/componentes/PontoFinal";
import { Revela } from "@/componentes/Revela";
import { COMPROMISSOS, PASSOS } from "@/dados/metodo";

/**
 * O método, com o ponto andando.
 *
 * O quadrado roxo percorre o trilho conforme a página rola, acende cada
 * passo ao passar por ele e chega no último, onde vira o ponto final do
 * "No ar". É a marca contando a mesma história do rodapé: a ideia que anda
 * até virar entrega.
 *
 * O progresso começa em 1 (tudo aceso). É o estado de repouso: sem JS, com
 * menos movimento ou numa miniatura, o método aparece inteiro.
 */
function useProgresso() {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let quadro = 0;
    const calcular = () => {
      quadro = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 quando o topo do trilho passa de 75% da tela; 1 quando o fim do
      // bloco chega a 45%. A janela é estreita o bastante para a viagem
      // inteira caber numa rolagem confortável.
      const v = (vh * 0.75 - r.top) / (r.height + vh * 0.3);
      setP(Math.max(0, Math.min(1, v)));
    };
    const pedir = () => {
      if (!quadro) quadro = requestAnimationFrame(calcular);
    };
    calcular();
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    return () => {
      cancelAnimationFrame(quadro);
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
    };
  }, []);

  return { ref, p };
}

export function Metodo() {
  const { ref, p } = useProgresso();
  const n = PASSOS.length;

  return (
    <section id="metodo" className="secao border-t border-linha" aria-labelledby="metodo-titulo">
      <div className="moldura">
        <Revela className="max-w-[880px]">
          <p className="rotulo">método</p>
          <h2 id="metodo-titulo" className="titulo mt-6">
            Da conversa ao ponto final
            <PontoFinal />
          </h2>
          <p className="subtitulo mt-6">
            Quatro passos, sempre os mesmos. Você sabe o que acontece em cada um, quanto custa e quando fica
            pronto antes de assinar qualquer coisa.
          </p>
        </Revela>

        <div ref={ref} className="relative mt-16 pl-8 md:mt-20 md:pl-0">
          {/* O trilho: vertical no celular, horizontal do tablet para cima. */}
          <div className="absolute bottom-0 left-0 top-0 w-px bg-linha-forte md:bottom-auto md:right-0 md:h-px md:w-auto" aria-hidden="true">
            {/* Estilo inline só define a variável: um `height` inline venceria
                o `md:h-px` e a linha sumiria no computador. */}
            <div
              className="absolute left-0 top-0 h-[var(--cheio)] w-px bg-texto md:h-px md:w-[var(--cheio)]"
              style={{ ["--cheio" as string]: `${p * 100}%` }}
            />
            <div
              className="absolute left-0 top-[var(--anda)] h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 bg-ponto shadow-[0_0_18px_rgba(130,87,245,0.75)] md:left-[var(--anda)] md:top-0"
              style={{ ["--anda" as string]: `${p * 100}%` }}
            />
          </div>

          <ol className="grid gap-12 md:grid-cols-4 md:gap-8">
            {PASSOS.map((passo, i) => {
              const ativo = p >= i / n;
              const ultimo = i === n - 1;
              return (
                <li key={passo.n} className={`passo ${ativo ? "ativo" : ""}`}>
                  <span className="passo-numero">{passo.n}</span>
                  <h3 className="titulo-menor mt-3">
                    {passo.nome}
                    {ultimo && p >= 0.98 && <PontoFinal />}
                  </h3>
                  <p className="mt-4 text-[16px] leading-relaxed text-fraco">{passo.texto}</p>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-28">
          <Revela>
            <h3 className="titulo-menor">O que você pode cobrar da gente</h3>
          </Revela>
          <ul className="mt-10 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
            {COMPROMISSOS.map((c, i) => (
              <Revela como="li" key={c.titulo} atraso={(i % 3) * 80} className="border-t border-linha py-7">
                <p className="flex items-start gap-3 text-[18px] font-semibold leading-snug tracking-[-0.01em]">
                  <span className="mt-[0.45em] h-[7px] w-[7px] flex-none bg-ponto" aria-hidden="true" />
                  {c.titulo}
                </p>
                <p className="mt-3 pl-[19px] text-[15.5px] leading-relaxed text-fraco">{c.texto}</p>
              </Revela>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
