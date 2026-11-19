import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { medirMarca } from "./lib/medirMarca";

// Antes do primeiro desenho: a marca aparece com as medidas da fonte real
// assim que ela chega, sem esperar nenhum componente montar.
medirMarca();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
