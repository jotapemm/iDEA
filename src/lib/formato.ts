/** Números no jeito brasileiro: 13.650 e não 13,650; 32,5 e não 32.5. */
export const reais = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export const decimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

export const inteiro = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
