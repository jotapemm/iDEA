/**
 * Leva a linha de base da marca para um pixel inteiro da tela.
 *
 * O navegador arredonda a linha de base do TEXTO para o pixel mais próximo,
 * e arredonda as CAIXAS (a haste, o pingo e o ponto final) cada uma por conta
 * própria. Quando a marca cai numa posição fracionada, o que é comum com o
 * zoom em 90% ou com a escala do Windows em 125%, o D sobe ou desce meio
 * pixel e o pingo não vai junto: ele sai do alinhamento com o topo do D.
 *
 * A saída é deslocar a marca inteira pelo que falta para a linha de base
 * cair exatamente num pixel. Aí o arredondamento do texto não muda nada, e
 * texto e caixas partem da mesma linha. O deslocamento é com `top` (posição
 * relativa, que entra na conta do layout) e não com transform, que pintaria
 * as caixas fora da grade de pixels.
 *
 * Refaz quando a fonte chega e quando a janela muda de tamanho (mudar o zoom
 * do navegador também dispara resize). Rolar a página não muda a conta: a
 * rolagem anda em pixels inteiros da tela. A marca precisa ter
 * `position: relative` e uma `.marca-haste` dentro: o pé dela é a linha de
 * base.
 *
 * Uso, dentro de um efeito: `return alinharBaseAoPixel(elemento)`. A volta é
 * a função que desliga tudo.
 */
export function alinharBaseAoPixel(marca: HTMLElement): () => void {
  let viva = true;

  const ajustar = () => {
    const haste = marca.querySelector(".marca-haste");
    if (!viva || !haste) return;
    marca.style.top = "";
    const dpr = window.devicePixelRatio || 1;
    const base = haste.getBoundingClientRect().bottom * dpr;
    const resto = (Math.round(base) - base) / dpr;
    marca.style.top = Math.abs(resto) > 0.001 ? `${resto.toFixed(3)}px` : "";
  };

  ajustar();
  document.fonts.ready.then(ajustar);
  window.addEventListener("resize", ajustar);
  return () => {
    viva = false;
    window.removeEventListener("resize", ajustar);
  };
}
