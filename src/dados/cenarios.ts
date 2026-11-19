/**
 * As rotinas do "Por dentro".
 *
 * São EXEMPLOS ILUSTRATIVOS de rotinas comuns em cada ramo, e a página diz
 * isso embaixo do terminal. Nenhum é projeto de cliente: é exatamente o que
 * permite mostrar como uma automação pensa sem expor o processo de ninguém.
 *
 * `ramo` é o rótulo que vai pré-marcado no formulário de contato quando a
 * pessoa clica em "Quero uma rotina assim". Precisa existir em dados/ramos.ts
 * (ou ser null, quando o exemplo não é de um ramo, como o de RH).
 *
 * Em cada linha, o trecho em `destaque` é pintado com o roxo claro: é o
 * momento em que a rotina toma uma decisão.
 */
export type LinhaLog = { hora: string; texto: string; destaque?: string };

export type Cenario = {
  id: string;
  aba: string;
  ramo: string | null;
  rotina: string;
  nome: string;
  agenda: string;
  usa: string[];
  linhas: LinhaLog[];
  fim: string;
};

export const CENARIOS: Cenario[] = [
  {
    id: "contabil",
    aba: "Contabilidade",
    ramo: "Contabilidade",
    rotina: "guias-do-mes",
    nome: "Guias do mês",
    agenda: "todo dia 5, às 06:00",
    usa: ["portal da prefeitura", "PDF", "planilha de controle", "e-mail"],
    linhas: [
      { hora: "06:00:00", texto: "rotina iniciada" },
      { hora: "06:00:04", texto: "entrou no portal da prefeitura" },
      { hora: "06:02:31", texto: "baixou 48 guias de ISS em PDF" },
      { hora: "06:03:10", texto: "leu valor e vencimento de cada guia" },
      { hora: "06:03:12", texto: "conferiu com a planilha de controle", destaque: "2 divergências" },
      { hora: "06:04:40", texto: "enviou 46 guias aos clientes por e-mail" },
      { hora: "06:04:41", texto: "avisou a equipe", destaque: "2 guias para revisar" },
    ],
    fim: "concluída em 4 min 41 s, antes de a equipe chegar",
  },
  {
    id: "imobiliaria",
    aba: "Imobiliária",
    ramo: "Imobiliária",
    rotina: "alugueis-do-dia",
    nome: "Aluguéis do dia",
    agenda: "todo dia útil, às 08:00",
    usa: ["extrato do banco", "contratos", "WhatsApp", "PDF"],
    linhas: [
      { hora: "08:00:00", texto: "rotina iniciada" },
      { hora: "08:00:06", texto: "leu o extrato bancário do dia" },
      { hora: "08:00:09", texto: "identificou 37 pagamentos de aluguel" },
      { hora: "08:00:11", texto: "baixou cada pagamento no contrato certo" },
      { hora: "08:00:15", texto: "encontrou inquilinos em atraso", destaque: "5 lembretes no WhatsApp" },
      { hora: "08:00:52", texto: "calculou o repasse de cada proprietário, já com a taxa" },
      { hora: "08:01:30", texto: "gerou 32 demonstrativos em PDF" },
    ],
    fim: "repasses prontos para aprovação em 1 min 30 s",
  },
  {
    id: "clinica",
    aba: "Clínica",
    ramo: "Saúde",
    rotina: "agenda-de-amanha",
    nome: "Agenda de amanhã",
    agenda: "todo dia, às 17:00",
    usa: ["sistema de agenda", "WhatsApp", "lista de espera"],
    linhas: [
      { hora: "17:00:00", texto: "rotina iniciada" },
      { hora: "17:00:02", texto: "leu a agenda de amanhã: 64 consultas" },
      { hora: "17:00:20", texto: "pediu confirmação aos pacientes no WhatsApp" },
      { hora: "17:45:00", texto: "51 confirmaram, 6 remarcaram", destaque: "7 sem resposta" },
      { hora: "17:45:03", texto: "ofereceu os 6 horários livres à lista de espera" },
      { hora: "17:45:04", texto: "passou à recepção os 7 pacientes sem resposta" },
    ],
    fim: "agenda fechada; a recepção cuida só das exceções",
  },
  {
    id: "comercio",
    aba: "Comércio",
    ramo: "Comércio",
    rotina: "pedidos-da-manha",
    nome: "Pedidos da manhã",
    agenda: "a cada 30 minutos",
    usa: ["loja virtual", "marketplace", "WhatsApp", "emissor de notas"],
    linhas: [
      { hora: "09:00:00", texto: "rotina iniciada" },
      { hora: "09:00:03", texto: "juntou os pedidos do site, do marketplace e do WhatsApp: 87" },
      { hora: "09:00:09", texto: "baixou o estoque de cada item" },
      { hora: "09:00:10", texto: "3 produtos abaixo do mínimo", destaque: "pedido de compra criado" },
      { hora: "09:01:42", texto: "emitiu 87 notas fiscais" },
      { hora: "09:02:15", texto: "gerou as etiquetas de envio" },
    ],
    fim: "expedição liberada às 09:02",
  },
  {
    id: "juridico",
    aba: "Jurídico",
    ramo: "Jurídico",
    rotina: "movimentacoes",
    nome: "Movimentações do dia",
    agenda: "todo dia, às 07:00",
    usa: ["sites dos tribunais", "IA", "sistema do escritório", "e-mail"],
    linhas: [
      { hora: "07:00:00", texto: "rotina iniciada" },
      { hora: "07:00:05", texto: "consultou 210 processos nos sites dos tribunais" },
      { hora: "07:12:48", texto: "encontrou movimentação nova", destaque: "9 processos" },
      { hora: "07:13:20", texto: "resumiu cada movimentação com IA" },
      { hora: "07:13:25", texto: "criou prazos e tarefas no sistema do escritório" },
      { hora: "07:13:26", texto: "avisou o advogado responsável por cada processo" },
    ],
    fim: "prazos do dia atualizados antes das 07:15",
  },
  {
    id: "rh",
    aba: "RH e DP",
    ramo: null,
    rotina: "fechamento-do-ponto",
    nome: "Fechamento do ponto",
    agenda: "todo dia 25, às 20:00",
    usa: ["planilhas de ponto", "e-mail", "sistema de folha"],
    linhas: [
      { hora: "20:00:00", texto: "rotina iniciada" },
      { hora: "20:00:04", texto: "leu as planilhas de ponto das 3 filiais" },
      { hora: "20:00:30", texto: "encontrou batidas faltando", destaque: "14 registros" },
      { hora: "20:00:31", texto: "pediu justificativa a cada gestor" },
      { hora: "20:02:10", texto: "consolidou horas extras, faltas e adicionais" },
      { hora: "20:02:40", texto: "lançou os eventos no sistema de folha" },
    ],
    fim: "eventos do mês prontos para conferência",
  },
];
