import { useEffect, useRef } from "react";
import { PontoFinal } from "@/componentes/PontoFinal";

const TEXTO =
  "Toda empresa tem uma ideia parada. O relatório que deveria se montar sozinho. A planilha que deveria conversar com o sistema. O cliente que deveria ser avisado sem ninguém lembrar. A iDEX existe para colocar ponto final nelas";

const PALAVRAS = TEXTO.split(" ");

/**
 * Quanto do trecho fixo é gasto acendendo as palavras. No resto, o texto
 * fica inteiro e aceso, com o ponto final no lugar, antes de a seção soltar.
 */
const ACENDE = 0.8;

/** Onde a seção fixa. Precisa bater com a @media do .manifesto-palco no index.css. */
const FIXA = "(min-height: 600px) and (prefers-reduced-motion: no-preference)";

/**
 * O manifesto: a razão de a marca existir, em uma frase longa.
 *
 * A seção FIXA na tela enquanto as palavras acendem. É um trilho alto com
 * um palco dentro: o palco gruda no topo (position: sticky) e o trilho passa
 * por baixo dele. A página parece parada, a rolagem vira o progresso do
 * texto, e a seção só solta depois que a última palavra acendeu e o ponto
 * final pousou. A rolagem não é sequestrada: quem rola é o navegador, e o JS
 * só lê onde o trilho está.
 *
 * O JS escreve UMA variável (--p, de 0 a 1) no texto, e cada palavra
 * calcula a própria opacidade no CSS a partir do seu índice (ver
 * .manifesto-palavra no index.css). Assim a rolagem mexe em uma propriedade
 * por quadro, e não em sessenta.
 *
 * Em tela baixa, onde o texto não caberia fixo, a seção não fixa e as
 * palavras acendem enquanto ela passa. Com menos movimento, nada fixa nem
 * anima: o repouso é tudo aceso (--p: 1) e com o ponto no lugar.
 */
export function Manifesto() {
  const trilho = useRef<HTMLElement>(null);
  const palco = useRef<HTMLDivElement>(null);
  const texto = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const t = trilho.current;
    const pa = palco.current;
    const el = texto.current;
    if (!t || !pa || !el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fixa = matchMedia(FIXA);
    let quadro = 0;
    const calcular = () => {
      quadro = 0;
      let p: number;
      if (fixa.matches) {
        // Quanto o palco já andou grudado: 0 quando acaba de fixar, 1 quando vai soltar.
        const r = t.getBoundingClientRect();
        const curso = r.height - pa.offsetHeight;
        p = curso > 0 ? -r.top / curso / ACENDE : 1;
      } else {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        p = (vh * 0.85 - r.top) / (r.height + vh * 0.25);
      }
      p = Math.max(0, Math.min(1, p));
      el.style.setProperty("--p", String(p));
      el.classList.toggle("acendendo", p < 1);
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
    <section ref={trilho} className="manifesto-trilho border-t border-linha" aria-label="Manifesto">
      <div ref={palco} className="manifesto-palco secao">
        <div className="moldura">
          <p className="rotulo">por que a iDEX existe</p>
          <p
            ref={texto}
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
      </div>
    </section>
  );
}
