import { useState } from "react";
import { PontoFinal } from "@/componentes/PontoFinal";
import { Revela } from "@/componentes/Revela";
import { Orbitas } from "@/componentes/telas/Orbitas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CAMADAS, type IdCamada } from "@/dados/camadas";

/**
 * O que a iDEA faz, desenhado como um sistema de órbitas em 3D.
 *
 * O desenho É a hierarquia: automação no centro (e o centro é o cubo roxo),
 * sistemas web na primeira órbita, apps na segunda, e a IA numa órbita
 * inclinada que corta todas, porque ela não é uma camada a mais e sim algo
 * que entra em qualquer uma. A cena mora em componentes/telas/Orbitas.tsx.
 *
 * Passar o mouse numa órbita (ou tocar nela) seleciona a camada; quem usa
 * teclado navega pela lista ao lado (Tabs do Radix, com setas). O canvas é
 * decorativo para leitor de tela: a lista tem o mesmo conteúdo.
 *
 * Os quatro textos ficam montados (forceMount), um em cima do outro, e só o
 * da camada ativa aparece (ver .camada-paineis no index.css). Assim a altura
 * da coluna é sempre a do texto mais longo, e trocar de camada não mexe no
 * layout: sem isso, as órbitas, centralizadas na altura da coluna, subiam e
 * desciam a cada clique.
 */
export function Servicos() {
  const [ativo, setAtivo] = useState<IdCamada>("automacao");

  return (
    <section id="servicos" className="secao border-t border-linha" aria-labelledby="servicos-titulo">
      <div className="moldura">
        <Revela className="max-w-[880px]">
          <p className="rotulo">o que fazemos</p>
          <h2 id="servicos-titulo" className="titulo mt-6">
            Tudo gira em torno da automação
            <PontoFinal />
          </h2>
          <p className="subtitulo mt-6">
            Todo projeto começa pela mesma pergunta: o que dá para tirar das mãos da sua equipe? Quando a
            automação precisa de uma tela ou de um celular, ela ganha um sistema web ou um app.
          </p>
        </Revela>

        <div className="mt-16 grid items-center gap-12 lg:mt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
          <Revela className="mx-auto w-full max-w-[600px]">
            <div className="aspect-[5/4] w-full">
              <Orbitas ativa={ativo} aoEscolher={setAtivo} />
            </div>
          </Revela>

          <Revela atraso={120}>
            <Tabs value={ativo} onValueChange={(v) => setAtivo(v as IdCamada)} orientation="vertical">
              <TabsList aria-label="Camadas do que a iDEA faz" className="flex-col">
                {CAMADAS.map((c) => (
                  <TabsTrigger key={c.id} value={c.id} className="camada-aba">
                    <span className="flex items-center text-[19px] font-semibold tracking-[-0.01em]">
                      <span className="camada-marca" aria-hidden="true" />
                      {c.nome}
                    </span>
                    <span className="font-mono text-[12px]">{c.papel}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="camada-paineis">
                {CAMADAS.map((c) => (
                  <TabsContent key={c.id} value={c.id} forceMount className="border-t border-linha pt-7">
                    <p className="max-w-[54ch] text-[18px] leading-relaxed text-texto">{c.texto}</p>
                    <ul className="mt-6 grid gap-2.5 font-mono text-[13px] text-fraco sm:grid-cols-2">
                      {c.exemplos.map((e) => (
                        <li key={e} className="flex items-center gap-3">
                          <span className="h-[5px] w-[5px] flex-none bg-apagado" aria-hidden="true" />
                          {e}
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </Revela>
        </div>
      </div>
    </section>
  );
}
