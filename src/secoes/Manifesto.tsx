import { useEffect, useRef } from "react";
import { PontoFinal } from "@/componentes/PontoFinal";

const TEXTO =
  "Toda empresa tem uma ideia parada. O relatório que deveria se montar sozinho. A planilha que deveria conversar com o sistema. O cliente que deveria ser avisado sem ninguém lembrar. A iDEA existe para colocar ponto final nelas";

const PALAVRAS = TEXTO.split(" ");

/**
 * O manifesto: a razão de a marca existir, em uma frase longa.
 *
 * As palavras acendem conforme a página rola. O JS escreve UMA variável
 * (--p, de 0 a 1) no bloco, e cada palavra calcula a própria opacidade no
 * CSS a partir do seu índice (ver .manifesto-palavra no index.css). Assim a
 * rolagem mexe em uma propriedade por quadro, e não em sessenta.
 *
 * O repouso é tudo aceso (--p: 1): sem JS ou com menos movimento, o texto
 * está inteiro.
 */
export function Manifesto() {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let quadro = 0;
    const calcular = () => {
      quadro = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = (vh * 0.85 - r.top) / (r.height + vh * 0.25);
      el.style.setProperty("--p", String(Math.max(0, Math.min(1, p))));
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

  return (
    <section className="secao border-t border-linha" aria-label="Manifesto">
      <div className="moldura">
        <p className="rotulo">por que a iDEA existe</p>
        <p
          ref={ref}
          className="manifesto mt-10 max-w-[25ch]"
          style={{ ["--n" as string]: PALAVRAS.length }}
        >
          {PALAVRAS.map((palavra, i) => (
            <span key={i} className="manifesto-palavra" style={{ ["--i" as string]: i }}>
              {palavra}
              {i < PALAVRAS.length - 1 ? " " : ""}
            </span>
          ))}
          <PontoFinal />
        </p>
      </div>
    </section>
  );
}
