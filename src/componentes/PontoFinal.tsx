/**
 * O ponto final dos títulos: o quadrado roxo no lugar do ponto da fonte.
 *
 * O "." de verdade continua lá para leitor de tela (sr-only). Quem enxerga
 * vê o quadrado; quem ouve, ouve o fim da frase.
 */
export function PontoFinal() {
  return (
    <>
      <span className="ponto-final" aria-hidden="true" />
      <span className="sr-only">.</span>
    </>
  );
}
