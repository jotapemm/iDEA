import { PontoFinal } from "@/componentes/PontoFinal";
import { CONTATO } from "@/config/contato";
import { EMPRESA } from "@/config/empresa";
import { ATUALIZADO, BLOCOS, RESUMO } from "@/dados/privacidade";

/** 5545999473692 vira +55 45 99947-3692. Número de outro tamanho sai só com o +. */
function telefone(digitos: string) {
  if (digitos.length !== 13) return `+${digitos}`;
  return `+${digitos.slice(0, 2)} ${digitos.slice(2, 4)} ${digitos.slice(4, 9)}-${digitos.slice(9)}`;
}

const LINK = "text-texto underline decoration-linha-forte underline-offset-4 transition-colors hover:decoration-texto";

/**
 * O aviso de privacidade, em blocos: a pergunta à esquerda e a resposta ao
 * lado, no ritmo de documento técnico do resto do site. O texto mora em
 * dados/privacidade.ts; daqui só sai o desenho e o contato, que vem de
 * config/ para não existir em dois lugares.
 */
export function Privacidade() {
  const whatsapp = CONTATO.whatsapp.replace(/\D/g, "");

  return (
    <section className="secao" aria-labelledby="privacidade-titulo">
      <div className="moldura">
        <p className="rotulo">aviso de privacidade</p>
        <h1 id="privacidade-titulo" className="titulo mt-6">
          Privacidade
          <PontoFinal />
        </h1>
        <p className="subtitulo mt-6">{RESUMO}</p>

        <div className="mt-16 border-t border-linha">
          {BLOCOS.map((b) => (
            <div
              key={b.titulo}
              className="grid gap-4 border-b border-linha py-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12"
            >
              <h2 className="titulo-menor">{b.titulo}</h2>
              <div className="grid max-w-[62ch] content-start gap-4 leading-relaxed text-fraco">
                {b.paragrafos.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                {b.itens && (
                  <dl className="grid gap-3">
                    {b.itens.map((i) => (
                      <div
                        key={i.quem}
                        className="grid gap-1 border-l border-linha-forte pl-4 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-4"
                      >
                        <dt className="font-mono text-[14px] leading-[1.75] text-texto">{i.quem}</dt>
                        <dd>{i.oque}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {b.fim && <p>{b.fim}</p>}
                {b.link && (
                  <p>
                    <a href={b.link.href} className={LINK} target="_blank" rel="noopener noreferrer">
                      {b.link.rotulo}
                    </a>
                  </p>
                )}
                {b.contato && (
                  <p>
                    {EMPRESA.razaoSocial && (
                      <span className="block text-texto">
                        {EMPRESA.razaoSocial}
                        {EMPRESA.cnpj && `, CNPJ ${EMPRESA.cnpj}`}
                      </span>
                    )}
                    {whatsapp && (
                      <>
                        WhatsApp{" "}
                        <a href={`https://wa.me/${whatsapp}`} className={LINK} target="_blank" rel="noopener noreferrer">
                          {telefone(whatsapp)}
                        </a>
                      </>
                    )}
                    {CONTATO.email && (
                      <span className="block">
                        E-mail <span className="select-all text-texto">{CONTATO.email}</span>
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 font-mono text-[12.5px] text-apagado">atualizado em {ATUALIZADO}</p>
      </div>
    </section>
  );
}
