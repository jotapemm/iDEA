/**
 * O que a iPEX faz, em camadas.
 *
 * A ordem é a hierarquia do negócio: automação é o núcleo, e sistemas web e
 * apps orbitam em volta dela. IA não é uma camada: ela atravessa as três, e
 * por isso no desenho ela anda numa órbita inclinada que corta as outras.
 */
export type IdCamada = "automacao" | "web" | "apps" | "ia";

export type Camada = {
  id: IdCamada;
  nome: string;
  papel: string;
  texto: string;
  exemplos: string[];
};

export const CAMADAS: Camada[] = [
  {
    id: "automacao",
    nome: "Automação",
    papel: "o núcleo",
    texto:
      "Robôs que trabalham entre os seus sistemas. Entram em portais, leem PDFs, planilhas e e-mails, conferem, preenchem e avisam quem precisa saber. Rodam no horário que você escolher, sem ninguém olhando.",
    exemplos: [
      "Conciliação bancária",
      "Emissão e conferência de notas",
      "Consulta de certidões",
      "Cobrança automática",
      "Relatórios que se montam sozinhos",
    ],
  },
  {
    id: "web",
    nome: "Sistemas web",
    papel: "primeira órbita",
    texto:
      "Quando a automação precisa de uma tela. Painéis, portais para clientes e sistemas de gestão desenhados em cima do jeito que a sua empresa já trabalha.",
    exemplos: [
      "Painel de indicadores",
      "Portal do cliente",
      "Gestão de contratos",
      "Controle de estoque",
    ],
  },
  {
    id: "apps",
    nome: "Apps",
    papel: "segunda órbita",
    texto:
      "Para quem trabalha na rua e para o seu cliente. Pedidos, vistorias, agendamentos e avisos direto no celular, conversando com o resto do sistema.",
    exemplos: [
      "App da equipe de campo",
      "App de pedidos",
      "Agendamento online",
      "Check-in de visitas",
    ],
  },
  {
    id: "ia",
    nome: "Inteligência artificial",
    papel: "atravessa tudo",
    texto:
      "Entra onde resolve: ler um documento, separar e-mails por assunto, resumir um processo, fazer o primeiro atendimento. Onde uma regra simples resolve melhor, fica a regra.",
    exemplos: [
      "Leitura de documentos",
      "Triagem de e-mails",
      "Resumos automáticos",
      "Atendimento inicial",
    ],
  },
];
