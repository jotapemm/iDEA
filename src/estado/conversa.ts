/**
 * O que a pessoa foi deixando pela página.
 *
 * A página é um funil de uma conversa só: a pessoa marca sintomas no
 * diagnóstico, escolhe um exemplo no "Por dentro", mexe na calculadora, e
 * tudo isso chega montado na mensagem do contato. Ela não precisa repetir
 * nada, e quem atende já sabe por onde começar.
 *
 * Nada disso sai do navegador. Só vira texto quando a pessoa aperta o botão
 * do WhatsApp, e é ela quem decide enviar.
 */
import { createContext, useContext } from "react";

export type Custo = { horasMes: number; reaisAno: number };

export type Conversa = {
  sintomas: string[];
  alternarSintoma: (id: string) => void;
  ramo: string | null;
  escolherRamo: (ramo: string | null) => void;
  exemplo: string | null;
  escolherExemplo: (nome: string | null) => void;
  /** null até a pessoa mexer na calculadora: número padrão não vai na mensagem. */
  custo: Custo | null;
  registrarCusto: (c: Custo | null) => void;
  querIVE: boolean;
  marcarIVE: (quer: boolean) => void;
};

export const ConversaContexto = createContext<Conversa | null>(null);

export function useConversa(): Conversa {
  const c = useContext(ConversaContexto);
  if (!c) throw new Error("useConversa precisa estar dentro de <ConversaProvider>.");
  return c;
}
