import { useEffect, useRef, useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { PontoFinal } from "@/componentes/PontoFinal";
import { Revela } from "@/componentes/Revela";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CENARIOS, type Cenario, type LinhaLog } from "@/dados/cenarios";
import { useConversa } from "@/estado/conversa";
import { seguirPonteiro } from "@/lib/seguirPonteiro";

/** Quantos caracteres a linha tem, contando a seta e o destaque. */
const comprimento = (l: LinhaLog) => l.texto.length + (l.destaque ? 3 + l.destaque.length : 0);

/**
 * Uma rotina rodando, linha por linha.
 *
 * Começa quando o terminal entra na tela (não adianta digitar para ninguém).
 * Trocar de aba monta um terminal novo, porque o Radix só monta o conteúdo
 * da aba ativa, e isso já reinicia a rotina de graça.
 */
function Terminal({ cenario }: { cenario: Cenario }) {
  const caixa = useRef<HTMLDivElement>(null);
  const [emVista, setEmVista] = useState(false);
  const [rodada, setRodada] = useState(0);
  const [prog, setProg] = useState({ linha: -1, chars: 0 });
  const total = cenario.linhas.length;

  useEffect(() => {
    const el = caixa.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setEmVista(true);
        io.disconnect();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!emVista) return;
    // Com menos movimento, a rotina aparece inteira e pronta.
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProg({ linha: total, chars: 0 });
      return;
    }

    let linha = 0;
    let chars = 0;
    let relogio = 0;
    setProg({ linha: 0, chars: 0 });

    const bater = () => {
      const atual = cenario.linhas[linha];
      if (!atual) return;
      if (chars < comprimento(atual)) {
        chars = Math.min(comprimento(atual), chars + 3);
        setProg({ linha, chars });
        relogio = window.setTimeout(bater, 16);
      } else {
        linha += 1;
        chars = 0;
        setProg({ linha, chars });
        // Uma pausa entre linhas, irregular de propósito: rotina real não
        // tem metrônomo, e o ritmo quebrado é o que faz parecer trabalho.
        if (linha < total) relogio = window.setTimeout(bater, 360 + Math.random() * 340);
      }
    };
    relogio = window.setTimeout(bater, 450);
    return () => clearTimeout(relogio);
  }, [emVista, rodada, cenario, total]);

  const acabou = prog.linha >= total;
  const estado = prog.linha < 0 ? "agendada" : acabou ? "concluída" : "rodando";

  return (
    <div ref={caixa}>
      <div className="terminal">
        <div className="terminal-barra">
          <span className="truncate">
            rotina: <span className="text-texto">{cenario.rotina}</span>
          </span>
          <span className="hidden truncate sm:block">{cenario.agenda}</span>
          <span className={`estado ${acabou ? "pronto" : prog.linha >= 0 ? "rodando" : ""}`}>{estado}</span>
        </div>

        <div className="terminal-corpo" aria-live="off">
          {cenario.linhas.map((l, i) => {
            if (i > prog.linha) return null;
            const parcial = i === prog.linha ? prog.chars : Infinity;
            const texto = l.texto.slice(0, parcial);
            const resto = Math.max(0, parcial - l.texto.length - 3);
            return (
              <div key={l.hora + i} className="linha-log">
                <span className="hora">{l.hora}</span>
                <span>
                  {texto}
                  {l.destaque && parcial > l.texto.length && (
                    <>
                      {" → "}
                      <span className="destaque">{l.destaque.slice(0, resto)}</span>
                    </>
                  )}
                  {i === prog.linha && !acabou && <span className="cursor" aria-hidden="true" />}
                </span>
              </div>
            );
          })}
          {acabou && (
            <div className="linha-log fim">
              <span className="hora">✓</span>
              <span>
                {cenario.fim}
                <span className="cursor" aria-hidden="true" />
              </span>
            </div>
          )}
        </div>
      </div>

      {/* A versão para leitor de tela: a rotina inteira, sem animação. */}
      <ol className="sr-only">
        {cenario.linhas.map((l) => (
          <li key={l.hora}>
            {l.hora}: {l.texto}
            {l.destaque ? `, ${l.destaque}` : ""}
          </li>
        ))}
        <li>{cenario.fim}</li>
      </ol>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <p className="font-mono text-[12px] text-apagado">
          usa: {cenario.usa.join(" · ")}
        </p>
        <button
          type="button"
          onClick={() => setRodada((r) => r + 1)}
          className="inline-flex items-center gap-2 font-mono text-[12px] text-fraco transition-colors hover:text-texto"
        >
          <RotateCcw size={13} aria-hidden="true" /> rodar de novo
        </button>
      </div>
    </div>
  );
}

/**
 * Por dentro: o lugar do portfólio que a iPEX não mostra.
 *
 * Projeto de cliente não vira vitrine. Em vez disso, a pessoa escolhe o ramo
 * dela e vê uma rotina típica rodando sozinha, com hora, decisão e
 * resultado. Mostra o jeito de pensar sem expor o processo de ninguém.
 */
export function PorDentro() {
  const { escolherRamo, escolherExemplo } = useConversa();
  const [ativo, setAtivo] = useState(CENARIOS[0].id);
  const cenario = CENARIOS.find((c) => c.id === ativo) ?? CENARIOS[0];

  return (
    <section id="por-dentro" className="secao border-t border-linha" aria-labelledby="por-dentro-titulo">
      <div className="moldura">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <Revela className="lg:sticky lg:top-[calc(var(--cabecalho)+56px)] lg:self-start">
            <p className="rotulo">por dentro</p>
            <h2 id="por-dentro-titulo" className="titulo mt-6">
              Em vez de portfólio, um raio-x
              <PontoFinal />
            </h2>
            <p className="subtitulo mt-6">
              Projetos de clientes ficam com os clientes, e o sigilo faz parte do serviço. O que dá para
              mostrar é como uma automação pensa. Escolha um ramo e veja uma rotina rodando sozinha.
            </p>
            <a
              href="#contato"
              className="botao botao-vazado mt-10"
              onMouseMove={seguirPonteiro}
              onClick={() => {
                escolherExemplo(cenario.nome);
                if (cenario.ramo) escolherRamo(cenario.ramo);
              }}
            >
              Quero uma rotina assim <ArrowRight size={16} aria-hidden="true" />
            </a>
          </Revela>

          <Revela atraso={100} className="min-w-0">
            <Tabs value={ativo} onValueChange={setAtivo}>
              <TabsList aria-label="Escolha um ramo" className="-mx-1 mb-5 gap-2 overflow-x-auto px-1 pb-1">
                {CENARIOS.map((c) => (
                  <TabsTrigger key={c.id} value={c.id} className="aba-ramo">
                    {c.aba}
                  </TabsTrigger>
                ))}
              </TabsList>
              {CENARIOS.map((c) => (
                <TabsContent key={c.id} value={c.id}>
                  <Terminal cenario={c} />
                </TabsContent>
              ))}
            </Tabs>
            <p className="mt-6 max-w-[60ch] text-[14px] leading-relaxed text-apagado">
              Exemplo ilustrativo de uma rotina comum no ramo. Os números mudam de empresa para empresa; a
              lógica é essa.
            </p>
          </Revela>
        </div>
      </div>
    </section>
  );
}
