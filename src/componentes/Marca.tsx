import { useEffect, useRef } from "react";
import { alinharBaseAoPixel } from "@/lib/baseNoPixel";

/**
 * A marca: iPEX.
 *
 * Duas peças quadradas e roxas, iguais: o PINGO do "i" e o PONTO final. São
 * a mesma ideia em dois momentos. No começo ela é a faísca em cima do "i";
 * no fim ela é o ponto final, o problema resolvido e entregue. Daí a frase
 * da marca: ideias com ponto final.
 *
 * O "i" é desenhado, e não digitado: haste e pingo com a espessura da haste
 * da fonte, e do pé ao topo do pingo a altura do P (ver lib/medirMarca.ts e
 * .marca-haste no CSS). A marca inteira desce ou sobe uma fração de pixel
 * para a linha de base cair num pixel exato (ver lib/baseNoPixel.ts): sem
 * isso, com zoom de 90%, o pingo saía do alinhamento com o topo do P.
 */
export function Marca({ tamanho = 22, className = "" }: { tamanho?: number | string; className?: string }) {
  const raiz = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = raiz.current;
    return el ? alinharBaseAoPixel(el) : undefined;
  }, []);

  return (
    <span
      ref={raiz}
      className={`marca relative ${className}`}
      style={{ fontSize: typeof tamanho === "number" ? `${tamanho}px` : tamanho }}
      role="img"
      aria-label="iPEX."
    >
      <span className="marca-haste" aria-hidden="true" />
      <span className="marca-pingo" aria-hidden="true" />
      <span aria-hidden="true">PEX</span>
      <span className="marca-ponto" aria-hidden="true" />
    </span>
  );
}
