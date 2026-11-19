import { useEffect, useState } from "react";
import { PontoFinal } from "@/componentes/PontoFinal";
import { Revela } from "@/componentes/Revela";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CAMADAS, type IdCamada } from "@/dados/camadas";

const R_WEB = 150;
const R_APPS = 250;
const IA = { rx: 278, ry: 86, giro: -28 };

const MENOS_MOVIMENTO = "(prefers-reduced-motion: reduce)";

function usePoucoMovimento() {
  // A página só roda no navegador, então dá para ler a preferência já no
  // primeiro render, sem esperar um efeito.
  const [parado, setParado] = useState(() => matchMedia(MENOS_MOVIMENTO).matches);
  useEffect(() => {
    const m = matchMedia(MENOS_MOVIMENTO);
    const aoMudar = () => setParado(m.matches);
    m.addEventListener("change", aoMudar);
    return () => m.removeEventListener("change", aoMudar);
  }, []);
  return parado;
}

/**
 * O que a iDEA faz, desenhado como órbitas.
 *
 * O desenho É a hierarquia: automação no centro (e o centro é o ponto roxo),
 * sistemas web na primeira órbita, apps na segunda, e a IA numa órbita
 * inclinada que corta todas, porque ela não é uma camada a mais e sim algo
 * que entra em qualquer uma.
 *
 * Passar o mouse numa órbita seleciona a camada; quem usa teclado navega
 * pela lista ao lado (Tabs do Radix, com setas). O SVG é decorativo para
 * leitor de tela: a lista tem o mesmo conteúdo.
 *
 * As órbitas giram com <animateTransform> (SMIL) e não com CSS: rotação CSS
 * em elemento de SVG tem origem ambígua entre navegadores, e o SMIL gira em
 * torno do (0,0) do grupo, que aqui é o centro.
 */
export function Servicos() {
  const [ativo, setAtivo] = useState<IdCamada>("automacao");
  const parado = usePoucoMovimento();

  const anel = (id: IdCamada) => `orbita-anel ${ativo === id ? "ativo" : ""}`;
  const rotulo = (id: IdCamada) => `orbita-rotulo ${ativo === id ? "ativo" : ""}`;
  const alvo = (id: IdCamada) => ({
    onPointerEnter: () => setAtivo(id),
    onClick: () => setAtivo(id),
  });
  const gira = (dur: string, contra = false) =>
    parado ? null : (
      <animateTransform
        attributeName="transform"
        type="rotate"
        from={contra ? "360" : "0"}
        to={contra ? "0" : "360"}
        dur={dur}
        repeatCount="indefinite"
      />
    );

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
          <Revela className="mx-auto w-full max-w-[560px]">
            <svg viewBox="0 0 600 600" className="block h-auto w-full overflow-visible" aria-hidden="true">
              <defs>
                <filter id="brilho-ponto" x="-150%" y="-150%" width="400%" height="400%">
                  <feGaussianBlur stdDeviation="7" result="borrado" />
                  <feMerge>
                    <feMergeNode in="borrado" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <g transform="translate(300 300)">
                {/* apps, a órbita de fora */}
                <circle r={R_APPS} className={anel("apps")} />
                <g>
                  {gira("120s", true)}
                  {[20, 110, 200, 290].map((a) => (
                    <rect key={a} transform={`rotate(${a}) translate(${R_APPS} 0)`} x={-3.5} y={-3.5} width={7} height={7} fill="var(--fraco)" />
                  ))}
                </g>
                <circle r={R_APPS} className="orbita-alvo" {...alvo("apps")} />
                <text y={-R_APPS - 14} textAnchor="middle" className={rotulo("apps")}>
                  apps
                </text>

                {/* sistemas web, a primeira órbita */}
                <circle r={R_WEB} className={anel("web")} />
                <g>
                  {gira("70s")}
                  {[40, 160, 280].map((a) => (
                    <rect key={a} transform={`rotate(${a}) translate(${R_WEB} 0)`} x={-3.5} y={-3.5} width={7} height={7} fill="var(--texto)" />
                  ))}
                </g>
                <circle r={R_WEB} className="orbita-alvo" {...alvo("web")} />
                <text y={-R_WEB - 14} textAnchor="middle" className={rotulo("web")}>
                  sistemas web
                </text>

                {/* IA, inclinada, cortando as duas */}
                <g transform={`rotate(${IA.giro})`}>
                  <ellipse rx={IA.rx} ry={IA.ry} className={anel("ia")} style={{ strokeDasharray: "1 7", strokeWidth: 1.5 }} />
                  {!parado && (
                    <rect x={-4.5} y={-4.5} width={9} height={9} fill="var(--ponto-claro)">
                      <animateMotion
                        dur="16s"
                        repeatCount="indefinite"
                        path={`M ${IA.rx} 0 A ${IA.rx} ${IA.ry} 0 1 1 ${-IA.rx} 0 A ${IA.rx} ${IA.ry} 0 1 1 ${IA.rx} 0`}
                      />
                    </rect>
                  )}
                  <ellipse rx={IA.rx} ry={IA.ry} className="orbita-alvo" style={{ strokeWidth: 26 }} {...alvo("ia")} />
                  <text x={IA.rx + 14} y={5} className={rotulo("ia")}>
                    IA
                  </text>
                </g>

                {/* o núcleo: a automação é o ponto */}
                <circle r={60} fill="transparent" className="cursor-pointer" {...alvo("automacao")} />
                <rect
                  x={-12}
                  y={-12}
                  width={24}
                  height={24}
                  fill="var(--ponto)"
                  filter="url(#brilho-ponto)"
                  style={{
                    transformBox: "fill-box",
                    transformOrigin: "center",
                    transform: ativo === "automacao" ? "scale(1.15)" : "scale(1)",
                    transition: "transform .35s cubic-bezier(.34,1.56,.64,1)",
                  }}
                />
                <text y={46} textAnchor="middle" className={rotulo("automacao")}>
                  automação
                </text>
              </g>
            </svg>
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
              {CAMADAS.map((c) => (
                <TabsContent key={c.id} value={c.id} className="border-t border-linha pt-7">
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
            </Tabs>
          </Revela>
        </div>
      </div>
    </section>
  );
}
