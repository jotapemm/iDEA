/**
 * Os sintomas do "Diagnóstico rápido".
 *
 * `texto` é o que a pessoa lê na página; `curto` é o que vai na mensagem do
 * WhatsApp. São dois porque a frase da página foi escrita para ser
 * RECONHECIDA ("isso acontece aqui"), e a da mensagem para ser lida rápido
 * por quem atende.
 *
 * Trechos entre crases viram <code> na página.
 */
export type Sintoma = { id: string; texto: string; curto: string };

export const SINTOMAS: Sintoma[] = [
  {
    id: "copia",
    texto: "Alguém da equipe passa horas copiando dados de um sistema para outro.",
    curto: "copiamos dados de um sistema para outro na mão",
  },
  {
    id: "planilha",
    texto: "A planilha mais importante da empresa se chama algo como `final_v3_agora_vai.xlsx`.",
    curto: "a operação depende de uma planilha crítica",
  },
  {
    id: "portais",
    texto: "Todo mês alguém entra nos mesmos portais para baixar as mesmas guias.",
    curto: "baixamos guias e documentos em portais todo mês",
  },
  {
    id: "uma-pessoa",
    texto: "O relatório só sai porque uma única pessoa sabe a ordem dos passos.",
    curto: "um processo importante depende de uma pessoa só",
  },
  {
    id: "erro",
    texto: "Um erro de digitação já custou dinheiro de verdade.",
    curto: "erros de digitação já deram prejuízo",
  },
  {
    id: "whatsapp",
    texto: "Pedidos, agendamentos ou cobranças chegam soltos pelo WhatsApp.",
    curto: "pedidos e cobranças chegam soltos pelo WhatsApp",
  },
  {
    id: "setenta",
    texto: "O sistema que vocês pagam faz 70% do trabalho. O resto é na mão.",
    curto: "o sistema atual não cobre o processo inteiro",
  },
  {
    id: "sem-numero",
    texto: "Ninguém sabe dizer, com números, quanto tempo a equipe gasta nisso tudo.",
    curto: "não sabemos quanto tempo essas tarefas consomem",
  },
];

/** A frase que responde à contagem. Muda de tom conforme a pessoa marca. */
export function leituraDoDiagnostico(n: number): string {
  if (n === 0) return "Marque o que você reconhece. Pode ser mais de um.";
  if (n <= 2) return "Já dá para começar por aí.";
  if (n <= 5) return "Tem um sistema escondido na sua rotina.";
  return "A sua operação está pedindo automação.";
}
