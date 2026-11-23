/**
 * A segunda página do site: o aviso de privacidade, em /privacidade.
 *
 * Mesmo cabeçalho e mesmo rodapé da página principal. Com `inicio="/"`, os
 * links deles levam de volta às seções de lá, em vez de procurar âncoras que
 * esta página não tem. O Vite monta esta página a partir do privacidade.html
 * (ver vite.config.ts).
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Cabecalho } from "./componentes/Cabecalho";
import { Rodape } from "./componentes/Rodape";
import { medirMarca } from "./lib/medirMarca";
import { Privacidade } from "./secoes/Privacidade";

// Como no main.tsx: a marca mede a fonte antes do primeiro desenho.
medirMarca();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <a href="#conteudo" className="pular">
      Pular para o conteúdo
    </a>
    <Cabecalho inicio="/" />
    <main id="conteudo">
      <Privacidade />
    </main>
    <Rodape inicio="/" />
  </StrictMode>,
);
