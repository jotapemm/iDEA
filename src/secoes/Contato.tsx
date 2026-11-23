import { useId, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Check, Copy, X } from "lucide-react";
import { PontoFinal } from "@/componentes/PontoFinal";
import { Revela } from "@/componentes/Revela";
import { CONTATO } from "@/config/contato";
import { PRIVACIDADE } from "@/config/empresa";
import { RAMOS } from "@/dados/ramos";
import { SINTOMAS } from "@/dados/sintomas";
import { useConversa } from "@/estado/conversa";
import { decimal } from "@/lib/formato";
import { linkWhatsApp, montarMensagem } from "@/lib/mensagem";
import { seguirPonteiro } from "@/lib/seguirPonteiro";

/** Uma etiqueta do que vai junto na mensagem, com o × para tirar. */
function Levado({ children, tirar }: { children: string; tirar: () => void }) {
  return (
    <li className="inline-flex max-w-full items-center gap-2 border border-linha-forte py-1.5 pl-3 pr-1.5 text-[14px] text-fraco">
      <span className="truncate">{children}</span>
      <button
        type="button"
        onClick={tirar}
        className="grid h-6 w-6 flex-none place-items-center text-apagado transition-colors hover:bg-linha hover:text-texto"
        aria-label={`Tirar da mensagem: ${children}`}
      >
        <X size={13} aria-hidden="true" />
      </button>
    </li>
  );
}

/**
 * Conte a sua ideia: a porta de entrada.
 *
 * Tudo que a pessoa deixou pela página chega aqui montado. Ela escreve do
 * jeito dela, vê a mensagem pronta ao lado e leva para o WhatsApp, que é
 * onde pequena e média empresa conversa de verdade no Brasil.
 *
 * A página NÃO envia nada sozinha, e diz isso. O botão é um link comum para
 * o WhatsApp com o texto no endereço; quem decide mandar é a pessoa.
 */
export function Contato() {
  const id = useId();
  const conversa = useConversa();
  const { sintomas, alternarSintoma, ramo, escolherRamo, exemplo, escolherExemplo, custo, registrarCusto, querIVE, marcarIVE } = conversa;
  const [nome, setNome] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [tarefa, setTarefa] = useState("");
  const [copiado, setCopiado] = useState<"" | "sim" | "selecionado">("");
  const previa = useRef<HTMLPreElement>(null);

  const mensagem = useMemo(
    () => montarMensagem({ nome, empresa, ramo, tarefa, sintomas, exemplo, custo, querIVE }),
    [nome, empresa, ramo, tarefa, sintomas, exemplo, custo, querIVE],
  );

  const marcados = SINTOMAS.filter((s) => sintomas.includes(s.id));
  const levaAlgo = marcados.length > 0 || !!exemplo || !!custo || querIVE;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(mensagem);
      setCopiado("sim");
    } catch {
      // Alguns navegadores (e alguns apps) recusam a área de transferência.
      // Plano B: seleciona o texto da prévia para a pessoa copiar na mão.
      const el = previa.current;
      const sel = window.getSelection();
      if (el && sel) {
        const r = document.createRange();
        r.selectNodeContents(el);
        sel.removeAllRanges();
        sel.addRange(r);
      }
      setCopiado("selecionado");
    }
    window.setTimeout(() => setCopiado(""), 2600);
  }

  return (
    <section id="contato" className="secao border-t border-linha" aria-labelledby="contato-titulo">
      <div className="moldura">
        <Revela className="max-w-[880px]">
          <p className="rotulo">contato</p>
          <h2 id="contato-titulo" className="titulo mt-6">
            Conte a sua ideia
            <PontoFinal />
          </h2>
          <p className="subtitulo mt-6">
            Escreva do seu jeito, sem termo técnico. A mensagem sai pronta para o WhatsApp, junto com o que
            você marcou pela página.
          </p>
        </Revela>

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
          {/* --- o formulário ------------------------------------------- */}
          <form className="grid gap-10" onSubmit={(e) => e.preventDefault()} aria-label="Sua ideia">
            <div className="grid gap-10 sm:grid-cols-2 sm:gap-8">
              <div>
                <label htmlFor={`${id}-nome`} className="campo-rotulo">
                  seu nome
                </label>
                <input id={`${id}-nome`} className="campo" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" placeholder="Como você prefere ser chamado" />
              </div>
              <div>
                <label htmlFor={`${id}-empresa`} className="campo-rotulo">
                  empresa (opcional)
                </label>
                <input id={`${id}-empresa`} className="campo" value={empresa} onChange={(e) => setEmpresa(e.target.value)} autoComplete="organization" placeholder="Nome da empresa" />
              </div>
            </div>

            <fieldset>
              <legend className="campo-rotulo">ramo</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {RAMOS.map((r) => (
                  <label key={r} className="chip">
                    <input
                      type="radio"
                      name={`${id}-ramo`}
                      className="sr-only"
                      checked={ramo === r}
                      onChange={() => escolherRamo(r)}
                    />
                    {r}
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor={`${id}-tarefa`} className="campo-rotulo">
                o que você quer tirar das costas?
              </label>
              <textarea
                id={`${id}-tarefa`}
                className="campo"
                value={tarefa}
                onChange={(e) => setTarefa(e.target.value)}
                placeholder="Ex.: toda segunda alguém baixa os boletos do banco e lança um por um na planilha."
              />
            </div>

            <div>
              <p className="campo-rotulo">vai junto na mensagem</p>
              {levaAlgo ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {marcados.map((s) => (
                    <Levado key={s.id} tirar={() => alternarSintoma(s.id)}>
                      {s.curto}
                    </Levado>
                  ))}
                  {exemplo && <Levado tirar={() => escolherExemplo(null)}>{`exemplo: ${exemplo}`}</Levado>}
                  {custo && (
                    <Levado tirar={() => registrarCusto(null)}>{`calculadora: ${decimal.format(custo.horasMes)} h por mês`}</Levado>
                  )}
                  {querIVE && <Levado tirar={() => marcarIVE(false)}>quero testar a I.V.E</Levado>}
                </ul>
              ) : (
                <p className="mt-3 max-w-[56ch] text-[15px] leading-relaxed text-apagado">
                  Nada ainda. Os sintomas que você marcar no diagnóstico, o exemplo que escolher no “Por dentro”
                  e a conta da calculadora aparecem aqui.
                </p>
              )}
            </div>
          </form>

          {/* --- a prévia ----------------------------------------------- */}
          <div className="lg:sticky lg:top-[calc(var(--cabecalho)+40px)] lg:self-start">
            <div className="terminal">
              <div className="terminal-barra">
                <span>mensagem.txt</span>
                <span>{mensagem.length} caracteres</span>
              </div>
              <pre ref={previa} className="mensagem max-h-[460px] overflow-auto p-5">
                {mensagem}
              </pre>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <a
                className="botao botao-cheio w-full"
                href={linkWhatsApp(mensagem)}
                target="_blank"
                rel="noopener noreferrer"
                onMouseMove={seguirPonteiro}
              >
                Enviar no WhatsApp <ArrowUpRight size={17} aria-hidden="true" />
              </a>
              <button type="button" className="botao botao-vazado w-full" onClick={copiar} onMouseMove={seguirPonteiro}>
                {copiado === "sim" ? (
                  <>
                    Copiada <Check size={16} aria-hidden="true" />
                  </>
                ) : (
                  <>
                    Copiar mensagem <Copy size={16} aria-hidden="true" />
                  </>
                )}
              </button>
            </div>

            <p className="mt-4 text-[14px] leading-relaxed text-apagado" aria-live="polite">
              {copiado === "selecionado"
                ? "O navegador não deixou copiar sozinho. O texto já está selecionado: use Ctrl+C."
                : "Esta página não envia nada sozinha. O botão abre o WhatsApp com o texto pronto, e você decide se manda."}
            </p>
            {/* Em outra aba: quem clica aqui está no meio da mensagem. */}
            <p className="mt-3 text-[14px]">
              <a
                href={PRIVACIDADE}
                className="text-apagado underline decoration-linha-forte underline-offset-4 transition-colors hover:text-texto"
                target="_blank"
                rel="noopener"
              >
                Como a iDEA cuida dos seus dados
              </a>
            </p>
            {CONTATO.email && (
              <p className="mt-3 text-[14px] text-apagado">
                Prefere e-mail? <span className="select-all text-texto">{CONTATO.email}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
