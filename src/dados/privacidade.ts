/**
 * O aviso de privacidade (a página /privacidade).
 *
 * É o que a LGPD pede de quem trata dados pessoais: o que chega, para quê,
 * com quem passa, por quanto tempo e como pedir para ver, corrigir ou apagar.
 *
 * O texto descreve o site COMO ELE É hoje. Se o site passar a guardar alguma
 * coisa (um formulário que envia, uma ferramenta de estatística, um cookie),
 * este texto muda junto, antes de ir para o ar. Mudou, troque a data.
 *
 * Os prazos daqui são promessas da iPEX: os 12 meses de guarda e os 15 dias
 * de resposta precisam ser cumpridos de verdade. O porquê de cada frase está
 * na aba LGPD do doc da empresa.
 */

export type Bloco = {
  titulo: string;
  paragrafos: string[];
  /** Quem recebe o quê, uma linha por serviço. */
  itens?: { quem: string; oque: string }[];
  /** Um parágrafo depois dos itens. */
  fim?: string;
  link?: { rotulo: string; href: string };
  /** O bloco que termina com o contato da iPEX (montado de config/). */
  contato?: true;
};

export const ATUALIZADO = "23 de novembro de 2026";

export const RESUMO =
  "O site não guarda nada sobre você. O que chega para a iPEX é só o que você decide mandar pelo WhatsApp.";

export const BLOCOS: Bloco[] = [
  {
    titulo: "O que o site guarda",
    paragrafos: [
      "Nada. Não tem cadastro, cookie nem ferramenta de estatística.",
      "O que você marca no diagnóstico, escolhe no “Por dentro” e preenche na calculadora fica só no seu navegador. Ao fechar a página, some.",
    ],
  },
  {
    titulo: "O que chega para a iPEX",
    paragrafos: [
      "Só a mensagem que você envia pelo WhatsApp: o seu nome, a empresa, o ramo, o que você quer tirar das costas e o que deixou marcado na página. Junto vêm o seu número e o seu perfil do WhatsApp.",
      "Antes de enviar, você vê a mensagem inteira e pode mudar ou tirar o que quiser.",
    ],
  },
  {
    titulo: "Para que a gente usa",
    paragrafos: [
      "Para responder você e preparar a conversa que você pediu. Se ela virar projeto, os mesmos dados servem para a proposta e o contrato.",
      "Nada é vendido nem usado para propaganda. Na LGPD, é o uso feito a seu pedido, antes de um contrato (art. 7º, V).",
    ],
  },
  {
    titulo: "Quem mais vê alguma coisa",
    paragrafos: ["Três empresas participam, cada uma com a sua parte:"],
    itens: [
      { quem: "Cloudflare", oque: "hospeda o site e recebe o endereço IP e o tipo de navegador a cada visita." },
      { quem: "Google Fonts", oque: "entrega as fontes do site e recebe o endereço IP de quem as baixa." },
      { quem: "WhatsApp", oque: "leva a mensagem que você enviar, pelas regras da Meta, dona do aplicativo." },
    ],
    fim: "As três são de fora do Brasil, então esses dados podem passar por servidores no exterior.",
  },
  {
    titulo: "Por quanto tempo",
    paragrafos: [
      "Os contatos ficam no WhatsApp e numa lista interna da iPEX, guardada num serviço online. Se a conversa não virar projeto, os seus dados saem da lista e a conversa é apagada em até 12 meses.",
    ],
  },
  {
    titulo: "Seus direitos",
    paragrafos: [
      "Você pode perguntar se a iPEX tem dados seus, ver quais são, corrigir, apagar ou saber com quem eles foram compartilhados. É só mandar uma mensagem no WhatsApp: a resposta sai em até 15 dias.",
      "Se achar que o pedido não foi atendido, você pode reclamar na Autoridade Nacional de Proteção de Dados.",
    ],
    link: { rotulo: "gov.br/anpd", href: "https://www.gov.br/anpd/pt-br" },
  },
  {
    titulo: "Quem cuida dos seus dados",
    paragrafos: ["A iPEX. Para qualquer pedido sobre os seus dados, fale com a gente:"],
    contato: true,
  },
];
