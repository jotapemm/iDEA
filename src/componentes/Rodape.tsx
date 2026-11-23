import { MarcaViva } from "./MarcaViva";
import { PontoFinal } from "./PontoFinal";
import { CONTATO } from "@/config/contato";
import { EMPRESA, PRIVACIDADE } from "@/config/empresa";

const ANO = new Date().getFullYear();

const NAVEGACAO = [
  { href: "#diagnostico", rotulo: "Diagnóstico rápido" },
  { href: "#servicos", rotulo: "O que fazemos" },
  { href: "#por-dentro", rotulo: "Por dentro" },
  { href: "#custo", rotulo: "Calculadora" },
  { href: "#metodo", rotulo: "Método" },
  { href: "#laboratorio", rotulo: "Laboratório" },
];

/**
 * O rodapé assina a página com a marca grande, que conta a própria história
 * (ver MarcaViva.tsx), e a frase dela.
 *
 * Contatos vazios em config/contato.ts não aparecem: link que não leva a
 * lugar nenhum é pior do que link nenhum. A razão social e o CNPJ, de
 * config/empresa.ts, entram na última linha quando a empresa existir.
 *
 * `inicio` funciona como no Cabecalho: "/" fora da página principal. O aviso
 * de privacidade abre em outra aba, para quem está escrevendo a mensagem do
 * contato não perder o que já escreveu.
 */
export function Rodape({ inicio = "" }: { inicio?: string }) {
  const canais = [
    CONTATO.whatsapp && { rotulo: "WhatsApp", href: `https://wa.me/${CONTATO.whatsapp.replace(/\D/g, "")}` },
    CONTATO.instagram && { rotulo: "Instagram", href: `https://instagram.com/${CONTATO.instagram}` },
  ].filter(Boolean) as { rotulo: string; href: string }[];

  return (
    <footer className="border-t border-linha">
      <div className="moldura pb-10 pt-20 sm:pt-28">
        <div className="overflow-hidden pb-2 pt-[0.3em]">
          <MarcaViva tamanho="clamp(84px, 21vw, 280px)" />
        </div>
        <p className="titulo-menor mt-6 text-fraco">
          Ideias com ponto final
          <PontoFinal />
        </p>

        <div className="mt-20 grid gap-10 border-t border-linha pt-10 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <p className="max-w-[38ch] text-[15px] leading-relaxed text-apagado">
            Automações, sistemas web e aplicativos sob medida, para empresas de qualquer ramo que cansaram do
            trabalho repetido.
          </p>
          <nav aria-label="Rodapé">
            <p className="campo-rotulo">a página</p>
            <ul className="mt-3 grid gap-2 text-[15px]">
              {NAVEGACAO.map((l) => (
                <li key={l.href}>
                  <a href={`${inicio}${l.href}`} className="nav-item">
                    {l.rotulo}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="campo-rotulo">fale com a gente</p>
            <ul className="mt-3 grid gap-2 text-[15px]">
              <li>
                <a href={`${inicio}#contato`} className="nav-item">
                  Conte sua ideia
                </a>
              </li>
              {canais.map((c) => (
                <li key={c.rotulo}>
                  <a href={c.href} className="nav-item" target="_blank" rel="noopener noreferrer">
                    {c.rotulo}
                  </a>
                </li>
              ))}
              {CONTATO.email && <li className="select-all text-fraco">{CONTATO.email}</li>}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap justify-between gap-4 font-mono text-[12px] text-apagado">
          <span>
            © {ANO} iDEA.
            {EMPRESA.razaoSocial && ` · ${EMPRESA.razaoSocial}`}
            {EMPRESA.cnpj && ` · CNPJ ${EMPRESA.cnpj}`}
          </span>
          <a href={PRIVACIDADE} className="transition-colors hover:text-texto" target="_blank" rel="noopener">
            privacidade
          </a>
          <span>feito no Brasil</span>
        </div>
      </div>
    </footer>
  );
}
