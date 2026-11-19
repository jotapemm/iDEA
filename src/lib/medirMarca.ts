/**
 * Mede o "ı" da fonte real e escreve as medidas da marca em :root.
 *
 * A logo é o glifo "ı" (i sem pingo) com um quadrado no lugar do pingo, e o
 * quadrado precisa ter EXATAMENTE a espessura da haste. Chumbar "0,17em"
 * funciona com uma fonte e quebra com outra; então medimos, como a logo da
 * IVE já fazia.
 *
 * Mede uma vez, a 100px, e grava em `em`. Como tudo na marca é relativo ao
 * tamanho da fonte, a medida vale para a logo do cabeçalho (22px) e para a
 * do rodapé (200px) sem medir de novo a cada redimensionamento.
 */
const TAMANHO = 100;

function medir(): boolean {
  const raiz = document.documentElement;
  const familia = getComputedStyle(raiz).getPropertyValue("--fonte-titulo").trim();
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx || !familia) return false;

  // O peso entra na conta: a marca usa 800, e 800 tem haste mais grossa.
  ctx.font = `800 ${TAMANHO}px ${familia}`;
  const m = ctx.measureText("ı");

  const xh = m.actualBoundingBoxAscent;
  // actualBoundingBoxLeft é positivo para a ESQUERDA da origem; a lateral
  // vazia do glifo é o oposto disso.
  const esq = -m.actualBoundingBoxLeft;
  const haste = m.actualBoundingBoxRight + m.actualBoundingBoxLeft;

  // Fonte ainda chegando: a métrica vem degenerada. Melhor ficar com o padrão.
  if (!xh || haste < 4) return false;

  const em = (v: number) => `${(v / TAMANHO).toFixed(4)}em`;
  raiz.style.setProperty("--i-xh", em(xh));
  raiz.style.setProperty("--i-haste", em(haste));
  raiz.style.setProperty("--i-esq", em(esq));
  raiz.style.setProperty("--i-avanco", em(m.width));
  return true;
}

export function medirMarca() {
  medir();
  // A Archivo vem do Google Fonts e pode chegar depois do primeiro desenho.
  document.fonts?.load(`800 ${TAMANHO}px Archivo`).then(medir, () => undefined);
  document.fonts?.ready.then(medir, () => undefined);
}
