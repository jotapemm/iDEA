/**
 * Como um projeto anda, e o que o cliente pode cobrar da iPEX.
 *
 * ATENÇÃO: prazos e compromissos aqui são PROMESSAS públicas. Só deixe na
 * página o que você consegue cumprir sempre. Se "30 minutos, sem custo"
 * ou "preço fechado" deixarem de valer, mude aqui antes de mudar na prática.
 *
 * Três detalhes que protegem o negócio:
 * - As entregas são por etapa, e não "toda semana": o ritmo é combinado no
 *   desenho, conforme a agenda de verdade.
 * - O preço fechado vale para o que foi desenhado. Pedido novo no meio do
 *   caminho é desenhado e combinado antes de ser feito.
 * - Fica com o cliente o código feito para o projeto dele. As peças que a
 *   iPEX reaproveita entre clientes entram no contrato com licença de uso.
 *   E o ajuste depois de no ar é o plano de acompanhamento, a mensalidade.
 */
export type Passo = { n: string; nome: string; texto: string };

export const PASSOS: Passo[] = [
  {
    n: "01",
    nome: "Conversa",
    texto:
      "30 minutos, sem custo. Você conta como a rotina funciona hoje, com os atalhos e as gambiarras. A gente escuta e faz as perguntas certas.",
  },
  {
    n: "02",
    nome: "Desenho",
    texto:
      "Você recebe o mapa do sistema: o que entra, o que sai, o que muda na rotina, prazo e preço fechado. Só começa se fizer sentido para você.",
  },
  {
    n: "03",
    nome: "Construção",
    texto:
      "Entregas curtas, a cada etapa combinada no desenho. Você testa com os seus dados desde cedo e corrige a rota antes de ficar pronto, e não depois.",
  },
  {
    n: "04",
    nome: "No ar",
    texto:
      "Sistema rodando, equipe treinada e um plano de acompanhamento: se um portal mudar ou a planilha ganhar uma coluna, a gente ajusta.",
  },
];

export const COMPROMISSOS: { titulo: string; texto: string }[] = [
  {
    titulo: "Preço fechado antes de começar.",
    texto:
      "O valor sai no desenho, sem taxa surpresa. Se aparecer algo novo no caminho, a gente desenha e combina o valor antes de fazer.",
  },
  {
    titulo: "Você vê funcionando antes de pagar tudo.",
    texto: "O pagamento acompanha as entregas, e cada entrega roda com os seus dados.",
  },
  {
    titulo: "O sistema é seu.",
    texto:
      "O código feito para o seu projeto, os dados e os acessos ficam com a sua empresa, mesmo se um dia a parceria acabar.",
  },
  {
    titulo: "Documentação em português.",
    texto: "Escrita para quem vai usar e para quem vier a manter depois.",
  },
  {
    titulo: "Sigilo sobre os seus processos.",
    texto: "Nenhum projeto de cliente vira vitrine. Por isso esta página não tem portfólio.",
  },
  {
    titulo: "Tecnologia escolhida pelo problema.",
    texto: "Robô, sistema, IA ou uma planilha bem feita: entra o que resolve, nunca o que está na moda.",
  },
];
