import { Cabecalho } from "@/componentes/Cabecalho";
import { Rodape } from "@/componentes/Rodape";
import { ConversaProvider } from "@/estado/ConversaProvider";
import { Contato } from "@/secoes/Contato";
import { Custo } from "@/secoes/Custo";
import { Hero } from "@/secoes/Hero";
import { Laboratorio } from "@/secoes/Laboratorio";
import { Manifesto } from "@/secoes/Manifesto";
import { Metodo } from "@/secoes/Metodo";
import { PorDentro } from "@/secoes/PorDentro";
import { Servicos } from "@/secoes/Servicos";
import { Sintomas } from "@/secoes/Sintomas";

/**
 * A página, de cima para baixo. A ordem é o caminho de quem chega:
 *
 *   Hero           o que é a iDEX, numa frase
 *   Sintomas       "isso acontece aqui": a pessoa se reconhece
 *   Servicos       o que a iDEX faz (automação no centro)
 *   PorDentro      prova sem portfólio: uma rotina rodando
 *   Custo          o tamanho do problema, com os números dela
 *   Metodo         como funciona e o que ela pode cobrar
 *   Laboratorio    produtos próprios (a IVE)
 *   Manifesto      por que a iDEX existe
 *   Contato        a porta de entrada: tudo vira uma mensagem
 */
export default function App() {
  return (
    <ConversaProvider>
      <a href="#conteudo" className="pular">
        Pular para o conteúdo
      </a>
      <Cabecalho />
      <main id="conteudo">
        <Hero />
        <Sintomas />
        <Servicos />
        <PorDentro />
        <Custo />
        <Metodo />
        <Laboratorio />
        <Manifesto />
        <Contato />
      </main>
      <Rodape />
    </ConversaProvider>
  );
}
