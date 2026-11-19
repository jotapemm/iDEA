import { useId, useState } from "react";
import { Check } from "lucide-react";
import { PontoFinal } from "@/componentes/PontoFinal";
import { Revela } from "@/componentes/Revela";
import { Slider } from "@/components/ui/slider";
import { useConversa } from "@/estado/conversa";
import { decimal, inteiro, reais } from "@/lib/formato";

/** Semanas por mês: 52 semanas divididas por 12 meses. */
const SEMANAS_MES = 52 / 12;

type Valores = { minutos: number; vezes: number; pessoas: number; hora: number };

const CAMPOS: {
  chave: keyof Valores;
  rotulo: string;
  min: number;
  max: number;
  passo: number;
  unidade: (v: number) => string;
}[] = [
  { chave: "minutos", rotulo: "minutos por vez", min: 5, max: 240, passo: 5, unidade: (v) => `${v} min` },
  { chave: "vezes", rotulo: "vezes por semana", min: 1, max: 40, passo: 1, unidade: (v) => `${v}×` },
  { chave: "pessoas", rotulo: "pessoas fazendo", min: 1, max: 15, passo: 1, unidade: (v) => `${v}` },
  { chave: "hora", rotulo: "custo da hora, com encargos", min: 15, max: 150, passo: 5, unidade: (v) => reais.format(v) },
];

/**
 * Quanto custa fazer na mão.
 *
 * A conta é a da própria pessoa, com os números dela, e a página diz com
 * todas as letras que isso é o tamanho do PROBLEMA e não uma promessa de
 * economia. É isso que separa uma calculadora honesta de uma isca.
 *
 * Os valores iniciais só aparecem na tela. O custo só entra na mensagem do
 * contato depois que a pessoa mexe em algum controle: um número que ela não
 * escolheu não pode falar por ela.
 */
export function Custo() {
  const id = useId();
  const { custo, registrarCusto } = useConversa();
  const [v, setV] = useState<Valores>({ minutos: 45, vezes: 5, pessoas: 2, hora: 35 });

  const horasMes = (v.minutos * v.vezes * v.pessoas * SEMANAS_MES) / 60;
  const reaisAno = horasMes * 12 * v.hora;
  const diasAno = (horasMes * 12) / 8;

  function mudar(chave: keyof Valores, valor: number) {
    const novo = { ...v, [chave]: valor };
    setV(novo);
    const h = (novo.minutos * novo.vezes * novo.pessoas * SEMANAS_MES) / 60;
    registrarCusto({ horasMes: h, reaisAno: h * 12 * novo.hora });
  }

  return (
    <section id="custo" className="secao border-t border-linha" aria-labelledby="custo-titulo">
      <div className="moldura">
        <Revela className="max-w-[880px]">
          <p className="rotulo">calculadora</p>
          <h2 id="custo-titulo" className="titulo mt-6">
            O preço de fazer na mão
            <PontoFinal />
          </h2>
          <p className="subtitulo mt-6">
            Pense numa tarefa só, daquelas que voltam toda semana. Ajuste os números e veja o tamanho dela
            no ano.
          </p>
        </Revela>

        <Revela atraso={100} className="mt-14 grid border border-linha-forte md:grid-cols-2">
          <div className="grid gap-8 p-6 sm:p-9">
            {CAMPOS.map((c) => (
              <div key={c.chave}>
                <div className="mb-2 flex items-baseline justify-between gap-4">
                  <span id={`${id}-${c.chave}`} className="campo-rotulo !mb-0">
                    {c.rotulo}
                  </span>
                  <span className="font-mono text-[15px] tabular-nums text-texto">{c.unidade(v[c.chave])}</span>
                </div>
                <Slider
                  aria-labelledby={`${id}-${c.chave}`}
                  value={[v[c.chave]]}
                  min={c.min}
                  max={c.max}
                  step={c.passo}
                  onValueChange={([valor]) => mudar(c.chave, valor)}
                />
              </div>
            ))}
          </div>

          <div className="grid content-center gap-9 border-t border-linha-forte bg-fundo-alto p-6 sm:p-9 md:border-l md:border-t-0" aria-live="polite">
            <div>
              <div className="numero-grande">{decimal.format(horasMes)} h</div>
              <p className="mt-2 text-fraco">por mês, só nessa tarefa</p>
            </div>
            <div>
              <div className="numero-grande">{reais.format(reaisAno)}</div>
              <p className="mt-2 text-fraco">por ano</p>
            </div>
            <div>
              <div className="numero-grande">{inteiro.format(diasAno)}</div>
              <p className="mt-2 text-fraco">dias úteis de 8 horas por ano</p>
            </div>
          </div>
        </Revela>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-x-10 gap-y-4">
          <p className="max-w-[64ch] text-[15px] leading-relaxed text-apagado">
            Esse é o custo da tarefa hoje, e não uma promessa de economia. Quanto dele uma automação devolve
            depende do processo, e é isso que a primeira conversa responde.
          </p>
          {custo && (
            <p className="inline-flex items-center gap-2 font-mono text-[12px] text-fraco">
              <Check size={14} className="text-ponto-claro" aria-hidden="true" /> essa conta vai junto na mensagem
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
