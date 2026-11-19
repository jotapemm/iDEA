import { useEffect, useState } from "react";
import { Marca } from "./Marca";
import { seguirPonteiro } from "@/lib/seguirPonteiro";

/** A partir de quantos px de rolagem o cabeçalho ganha fundo e borda. */
const LIMIAR = 24;

const LINKS = [
  { href: "#servicos", rotulo: "O que fazemos" },
  { href: "#por-dentro", rotulo: "Por dentro" },
  { href: "#metodo", rotulo: "Método" },
  { href: "#laboratorio", rotulo: "Laboratório" },
];

export function Cabecalho() {
  const [rolou, setRolou] = useState(false);

  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > LIMIAR);
    aoRolar();
    // passive: este ouvinte nunca chama preventDefault, e dizer isso deixa o
    // navegador rolar sem esperar o JS.
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  return (
    <header className={`cabecalho ${rolou ? "rolou" : ""}`}>
      <div className="moldura flex h-[var(--cabecalho)] items-center justify-between gap-6">
        <a href="#topo" aria-label="iDEA, voltar ao topo" className="-my-2 py-2">
          <Marca tamanho={23} />
        </a>

        {/* Abaixo de 900px o menu sai: sobra a marca e a única ação que importa. */}
        <nav aria-label="Seções" className="hidden items-center gap-8 min-[900px]:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="nav-item">
              {l.rotulo}
            </a>
          ))}
        </nav>

        <a href="#contato" className="botao botao-cheio botao-pequeno" onMouseMove={seguirPonteiro}>
          Conte sua ideia
        </a>
      </div>
    </header>
  );
}
