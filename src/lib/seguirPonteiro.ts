import type { MouseEvent } from "react";

/**
 * Anota onde o ponteiro está, em --x/--y do próprio elemento.
 *
 * É daqui que nasce a onda dos botões (`.botao::before`): o JS só escreve a
 * coordenada e quem cresce o círculo é a transição do CSS. Mesmo mecanismo
 * da IVE, para os botões das duas páginas se comportarem igual.
 */
export function seguirPonteiro(e: MouseEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
}
