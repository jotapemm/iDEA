import { Plano } from "@/componentes/telas/Plano";
import { PontoFinal } from "@/componentes/PontoFinal";
import { seguirPonteiro } from "@/lib/seguirPonteiro";

/**
 * O hero.
 *
 * Do computador para cima (lg, 1024px), o plano fica ATRÁS do texto e ocupa
 * o hero inteiro; o título mora no "céu", acima do horizonte. Abaixo disso o
 * plano desce para baixo do texto, com altura própria. A troca de câmera
 * acontece no mesmo ponto dentro de Plano.tsx.
 *
 * O bloco de texto tem `pointer-events: none` para o cursor atravessar até o
 * canvas (é assim que o plano reage ao mouse por trás do título). Só os
 * botões voltam a receber clique.
 */
export function Hero() {
  return (
    <section id="topo" className="relative isolate overflow-hidden" aria-labelledby="hero-titulo">
      <div className="moldura pointer-events-none relative z-10 flex flex-col pt-[calc(var(--cabecalho)+clamp(40px,8vh,104px))] lg:min-h-[min(92svh,880px)] lg:justify-center lg:pb-24">
        <p className="rotulo">automações · sistemas web · apps</p>
        <h1 id="hero-titulo" className="titulo-hero mt-7 max-w-[11ch]">
          Trabalho repetido vira sistema
          <PontoFinal />
        </h1>
        <p className="subtitulo mt-8">
          A iPEX cria automações, sistemas web e aplicativos sob medida para empresas que cansaram de
          fazer na mão o que um software faria sozinho.
        </p>
        <div className="pointer-events-auto mt-10 flex flex-wrap gap-3">
          <a className="botao botao-cheio" href="#contato" onMouseMove={seguirPonteiro}>
            Conte sua ideia
          </a>
          <a className="botao botao-vazado" href="#por-dentro" onMouseMove={seguirPonteiro}>
            Ver uma automação por dentro
          </a>
        </div>
      </div>

      {/* O véu escuro à esquerda segura a leitura do título por cima dos pontos. */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] hidden lg:block"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,5,9,0.92) 0%, rgba(5,5,9,0.6) 34%, rgba(5,5,9,0) 60%)",
        }}
      />

      <div className="relative mt-4 h-[54svh] min-h-[320px] lg:absolute lg:inset-0 lg:mt-0 lg:h-auto">
        <Plano />
        <p className="pointer-events-none absolute bottom-5 right-[max(20px,env(safe-area-inset-right,0px))] z-[2] font-mono text-[12px] text-apagado">
          clique no plano para soltar uma ideia
        </p>
      </div>
    </section>
  );
}
