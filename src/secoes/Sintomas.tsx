import { ArrowRight } from "lucide-react";
import { PontoFinal } from "@/componentes/PontoFinal";
import { Revela } from "@/componentes/Revela";
import { SINTOMAS, leituraDoDiagnostico } from "@/dados/sintomas";
import { useConversa } from "@/estado/conversa";

/** Trechos entre crases viram <code>. Só isso, sem markdown inteiro. */
function comCodigo(texto: string) {
  return texto.split("`").map((parte, i) => (i % 2 ? <code key={i}>{parte}</code> : parte));
}

/**
 * Diagnóstico rápido.
 *
 * A primeira coisa que a página pede é que a pessoa se RECONHEÇA. Antes de
 * falar de serviço, ela marca o que acontece na empresa dela, e a contagem
 * responde. Cada caixa é um <input type="checkbox"> de verdade dentro do
 * <label>: teclado, leitor de tela e clique na frase inteira funcionam sem
 * uma linha de JS a mais.
 */
export function Sintomas() {
  const { sintomas, alternarSintoma } = useConversa();
  const n = sintomas.length;

  return (
    <section id="diagnostico" className="secao" aria-labelledby="sintomas-titulo">
      <div className="moldura grid gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <Revela className="lg:sticky lg:top-[calc(var(--cabecalho)+56px)] lg:self-start">
          <p className="rotulo">diagnóstico rápido</p>
          <h2 id="sintomas-titulo" className="titulo mt-6">
            Marque o que acontece aí
            <PontoFinal />
          </h2>
          <p className="subtitulo mt-6">
            Cada item marcado é uma tarefa que um sistema poderia fazer. O que você marcar segue com você
            até a mensagem do fim da página.
          </p>

          <div className="mt-10 flex flex-wrap items-end gap-x-6 gap-y-3" aria-live="polite">
            <span className="numero-grande">
              {n}
              <span className="text-apagado">/{SINTOMAS.length}</span>
            </span>
            <span className="max-w-[26ch] pb-1.5 text-fraco">{leituraDoDiagnostico(n)}</span>
          </div>

          {n > 0 && (
            <a href="#contato" className="link-seta mt-8">
              levar para a conversa <ArrowRight size={14} aria-hidden="true" />
            </a>
          )}
        </Revela>

        <div>
          {SINTOMAS.map((s, i) => (
            <Revela key={s.id} atraso={i * 50} className="border-t border-linha last:border-b">
              <label className="sintoma">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={sintomas.includes(s.id)}
                  onChange={() => alternarSintoma(s.id)}
                />
                <span className="sintoma-caixa" aria-hidden="true" />
                <span className="sintoma-frase">{comCodigo(s.texto)}</span>
              </label>
            </Revela>
          ))}
        </div>
      </div>
    </section>
  );
}
