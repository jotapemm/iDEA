/**
 * A marca: iDEA.
 *
 * Duas peças quadradas e roxas, iguais: o PINGO do "i" e o PONTO final. São
 * a mesma ideia em dois momentos. No começo ela é a faísca em cima do "i";
 * no fim ela é o ponto final, o problema resolvido e entregue. Daí a frase
 * da marca: ideias com ponto final.
 *
 * O "i" é desenhado, e não digitado: haste e pingo com a espessura da haste
 * da fonte, e do pé ao topo do pingo a altura do D (ver lib/medirMarca.ts e
 * .marca-haste no CSS).
 */
export function Marca({ tamanho = 22, className = "" }: { tamanho?: number | string; className?: string }) {
  return (
    <span
      className={`marca ${className}`}
      style={{ fontSize: typeof tamanho === "number" ? `${tamanho}px` : tamanho }}
      role="img"
      aria-label="iDEA."
    >
      <span className="marca-haste" aria-hidden="true" />
      <span className="marca-pingo" aria-hidden="true" />
      <span aria-hidden="true">DEA</span>
      <span className="marca-ponto" aria-hidden="true" />
    </span>
  );
}
