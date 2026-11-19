/**
 * Tailwind cuida de layout, espaçamento e tamanhos. As CORES e as FONTES não
 * moram aqui: elas são variáveis CSS em src/index.css, e o Tailwind só aponta
 * para elas. Assim existe um lugar só para mudar a identidade.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        fundo: "var(--fundo)",
        "fundo-alto": "var(--fundo-alto)",
        texto: "var(--texto)",
        fraco: "var(--fraco)",
        apagado: "var(--apagado)",
        linha: "var(--linha)",
        "linha-forte": "var(--linha-forte)",
        ponto: "var(--ponto)",
        "ponto-claro": "var(--ponto-claro)",
        tinta: "var(--tinta)",
      },
      fontFamily: {
        titulo: ["var(--fonte-titulo)"],
        texto: ["var(--fonte-texto)"],
        mono: ["var(--fonte-mono)"],
      },
      maxWidth: {
        moldura: "var(--largura)",
        leitura: "62ch",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
