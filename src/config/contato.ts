/**
 * O único lugar que sabe como falar com a iDEA.
 *
 * Troque aqui e a página inteira acompanha: o botão do formulário de contato
 * e o rodapé leem daqui.
 *
 * `whatsapp`: formato internacional, só dígitos (55 + DDD + número), por
 * exemplo "5551999998888". Enquanto estiver vazio, o botão abre o WhatsApp
 * com a mensagem pronta e deixa a pessoa escolher o contato. Serve para
 * testar a mensagem antes de ter o número da empresa.
 *
 * `email` e `instagram` vazios simplesmente não aparecem.
 */
export const CONTATO = {
  whatsapp: "",
  email: "",
  instagram: "",
};
