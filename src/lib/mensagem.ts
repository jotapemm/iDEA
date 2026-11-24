/**
 * Monta a mensagem que a pessoa leva para o WhatsApp.
 *
 * É um briefing curto: quem é, o que quer tirar das costas, e o que deixou
 * pela página (sintomas, exemplo, calculadora). Linhas vazias separam os
 * blocos, porque no WhatsApp parágrafo é o que dá respiro.
 */
import { CONTATO } from "@/config/contato";
import { SINTOMAS } from "@/dados/sintomas";
import type { Custo } from "@/estado/conversa";
import { decimal, reais } from "./formato";

export type Rascunho = {
  nome: string;
  empresa: string;
  ramo: string | null;
  tarefa: string;
  sintomas: string[];
  exemplo: string | null;
  custo: Custo | null;
  querIVE: boolean;
};

export function montarMensagem(r: Rascunho): string {
  const nome = r.nome.trim();
  const empresa = r.empresa.trim();
  const tarefa = r.tarefa.trim();
  const blocos: string[][] = [];

  // "da empresa X" e não "da X": o artigo de "empresa" é sempre feminino,
  // e o nome da empresa pode ser de qualquer gênero.
  let oi = "Olá, iDEX!";
  if (nome && empresa) oi += ` Aqui é ${nome}, da empresa ${empresa}.`;
  else if (nome) oi += ` Aqui é ${nome}.`;
  else if (empresa) oi += ` Escrevo pela empresa ${empresa}.`;
  blocos.push([oi]);

  const pedido: string[] = [];
  if (r.ramo && r.ramo !== "Outro") pedido.push(`Ramo: ${r.ramo}`);
  pedido.push(
    tarefa
      ? `O que eu quero tirar das costas: ${tarefa}`
      : "Quero conversar sobre automatizar uma rotina da empresa.",
  );
  if (r.exemplo) pedido.push(`Vi no site o exemplo "${r.exemplo}" e quero algo parecido.`);
  blocos.push(pedido);

  const marcados = SINTOMAS.filter((s) => r.sintomas.includes(s.id));
  if (marcados.length) {
    blocos.push(["No diagnóstico do site, marquei:", ...marcados.map((s) => `• ${s.curto}`)]);
  }

  if (r.custo) {
    blocos.push([
      `Pela calculadora, essa tarefa consome cerca de ${decimal.format(r.custo.horasMes)} h por mês (${reais.format(r.custo.reaisAno)} por ano).`,
    ]);
  }

  if (r.querIVE) blocos.push(["Também quero testar a I.V.E quando ela abrir."]);

  return blocos.map((b) => b.join("\n")).join("\n\n");
}

/**
 * O link do WhatsApp com o texto pronto.
 *
 * Sem número configurado, `wa.me/?text=` abre o WhatsApp e deixa a pessoa
 * escolher o contato. Com número, vai direto para a conversa da iDEX.
 */
export function linkWhatsApp(texto: string): string {
  const numero = CONTATO.whatsapp.replace(/\D/g, "");
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}
