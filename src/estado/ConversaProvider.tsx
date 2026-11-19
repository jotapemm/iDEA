import { useCallback, useMemo, useState, type ReactNode } from "react";
import { ConversaContexto, type Conversa, type Custo } from "./conversa";

/** Guarda o estado da conversa para a página inteira. Ver conversa.ts. */
export function ConversaProvider({ children }: { children: ReactNode }) {
  const [sintomas, setSintomas] = useState<string[]>([]);
  const [ramo, escolherRamo] = useState<string | null>(null);
  const [exemplo, escolherExemplo] = useState<string | null>(null);
  const [custo, registrarCusto] = useState<Custo | null>(null);
  const [querIVE, marcarIVE] = useState(false);

  const alternarSintoma = useCallback((id: string) => {
    setSintomas((atual) =>
      atual.includes(id) ? atual.filter((s) => s !== id) : [...atual, id],
    );
  }, []);

  const valor = useMemo<Conversa>(
    () => ({
      sintomas,
      alternarSintoma,
      ramo,
      escolherRamo,
      exemplo,
      escolherExemplo,
      custo,
      registrarCusto,
      querIVE,
      marcarIVE,
    }),
    [sintomas, alternarSintoma, ramo, exemplo, custo, querIVE],
  );

  return <ConversaContexto.Provider value={valor}>{children}</ConversaContexto.Provider>;
}
