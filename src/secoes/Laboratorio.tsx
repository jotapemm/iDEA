import { ArrowRight } from "lucide-react";
import { PontoFinal } from "@/componentes/PontoFinal";
import { Revela } from "@/componentes/Revela";
import { Esfera } from "@/componentes/telas/Esfera";
import { useConversa } from "@/estado/conversa";
import { seguirPonteiro } from "@/lib/seguirPonteiro";

/**
 * Laboratório: os produtos próprios da iPEX.
 *
 * É a prova que não depende de cliente nenhum. A IVE é da casa, então pode
 * ser mostrada inteira, e mostra do que a iPEX é capaz (um agente de IA que
 * opera a tela) sem quebrar o sigilo de ninguém.
 *
 * A esfera é a mesma da landing da IVE: o produto é reconhecido pela imagem.
 */
export function Laboratorio() {
  const { marcarIVE } = useConversa();

  return (
    <section id="laboratorio" className="secao border-t border-linha bg-fundo-alto" aria-labelledby="lab-titulo">
      <div className="moldura grid items-center gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
        <Revela>
          <p className="rotulo">laboratório</p>
          <h2 id="lab-titulo" className="titulo mt-6">
            Produtos da casa
            <PontoFinal />
          </h2>
          <p className="subtitulo mt-6">
            Além dos projetos sob medida, a iPEX desenvolve produtos próprios. É onde as ideias são levadas
            ao limite antes de chegarem aos clientes.
          </p>
          <p className="mt-5 max-w-[52ch] text-[16px] leading-relaxed text-fraco">
            O primeiro é a I.V.E, um modelo de IA que enxerga a tela e executa tarefas de escritório. Ela
            nasceu resolvendo planilha, boleto e CNPJ, que é o tipo de trabalho que a iPEX automatiza todo
            dia.
          </p>
        </Revela>

        <Revela atraso={120} className="border border-linha-forte bg-fundo">
          <div className="flex items-center justify-between border-b border-linha px-5 py-3 font-mono text-[12px] text-apagado">
            <span>produto 01</span>
            <span className="estado rodando">em desenvolvimento</span>
          </div>
          <div className="grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="relative aspect-square max-h-[420px] w-full border-b border-linha sm:border-b-0 sm:border-r">
              <Esfera />
            </div>
            <div className="flex flex-col justify-between gap-8 p-6 sm:p-8">
              <div>
                <h3 className="font-titulo text-[44px] font-[760] leading-none tracking-[-0.03em] [font-stretch:80%]">I.V.E</h3>
                <p className="mt-5 text-[16px] leading-relaxed text-fraco">
                  Um modelo de IA que trabalha na sua tela. Lê a planilha aberta, preenche o campo, confere o
                  boleto e mostra cada passo enquanto faz. Você interrompe quando quiser.
                </p>
              </div>
              <a
                href="#contato"
                className="botao botao-vazado botao-pequeno self-start"
                onMouseMove={seguirPonteiro}
                onClick={() => marcarIVE(true)}
              >
                Quero testar quando abrir <ArrowRight size={15} aria-hidden="true" />
              </a>
            </div>
          </div>
        </Revela>
      </div>
    </section>
  );
}
