# iDEA. — página principal

A porta de entrada da iDEA: automações, sistemas web e apps sob medida.

A marca, a voz e as regras visuais estão em [MARCA.md](MARCA.md). Este
arquivo explica o código.

## Rodar

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

```bash
pnpm build        # o site de verdade, em dist/ (é o que a Cloudflare publica)
pnpm artefato     # um HTML único em artefato/, para compartilhar ou publicar como Artifact
pnpm imagens      # refaz a prévia do link, os ícones e a arte do anúncio
```

São dois builds de propósito. O `build` (Vite) gera arquivos separados, com
cache bom, que é o que vai para o ar. O `artefato` (Parcel + scripts/artefato.mjs)
junta tudo num arquivo só, que abre em qualquer lugar.

## Pôr no ar

O site está em **https://idea-dft.pages.dev**, publicado pela Cloudflare Pages,
que está ligada a este repositório: cada `git push` na `main` publica sozinho.

Cada deploy também ganha um endereço próprio, como
`9f764895.idea-dft.pages.dev`. É uma cópia congelada daquele deploy, boa para
comparar versões, e vem com `noindex` para o Google não indexar. O endereço
para divulgar é sempre o sem número.

| Campo | Valor |
| --- | --- |
| Comando de build | `pnpm build` |
| Pasta de saída | `dist` |
| Node | o de `.node-version` (24) |
| pnpm | o de `packageManager`, no `package.json` (12.21.0) |

Antes de ligar, vale repetir o teste que um servidor de deploy faz: clonar o
repositório numa pasta vazia e rodar `pnpm install --frozen-lockfile` e
`pnpm build`. Os dois precisam terminar sem erro.

## Prévia do link e ícones

Moram em `public/`, que o Vite copia para a raiz do site:

| Arquivo | Para quê |
| --- | --- |
| `og.png` | a imagem da prévia do link (1200×630) |
| `favicon.svg`, `favicon.ico` | o "i" da marca na aba do navegador |
| `apple-touch-icon.png` | o ícone de quem salva o site na tela de início do iPhone |
| `_headers` | o cache na Cloudflare: os arquivos de `/assets` ficam guardados por um ano |

As imagens saem do `pnpm imagens` (`scripts/imagens.mjs`). A `og.png` é o
`scripts/og.html` fotografado por um Chrome ou Edge sem janela, e os ícones
são desenhados pixel a pixel. Se o título do hero ou a marca mudar, rode de
novo e faça o commit das imagens.

O WhatsApp guarda a prévia de cada link por um tempo. Para ver uma imagem
nova, mande o link com algo no fim, como `https://idea-dft.pages.dev/?v=2`.

## Arte do anúncio

A arte do anúncio de lançamento mora em `divulgacao/` e não entra no site:

| Arquivo | Onde usar |
| --- | --- |
| `anuncio-feed.png` | post do Instagram e do LinkedIn (1080×1350) |
| `anuncio-status.png` | status do WhatsApp e story do Instagram (1080×1920) |

As duas saem do `scripts/anuncio.html`, no mesmo `pnpm imagens`. É a cena da
prévia do link, em pé. No status, a arte termina pedindo resposta, porque quem
responde um status cai direto na conversa. O alto e o pé do status ficam por
baixo dos botões do aplicativo, então nada que precise ser lido mora ali.

## Lançamento

- [x] **WhatsApp** em `src/config/contato.ts`.
- [x] **Promessas** em `src/dados/metodo.ts`, revistas: entregas por etapa,
      preço fechado para o que foi desenhado, o código feito para o projeto
      fica com o cliente e o ajuste depois de no ar é um plano de
      acompanhamento. Se alguma deixar de valer, mude lá antes de mudar na
      prática.
- [x] **Laboratório**: a IVE fica, como "em desenvolvimento".
- [x] **Hospedagem**: Cloudflare Pages ligada ao GitHub, com o comando
      `pnpm build` e a pasta `dist`. O plano grátis da Vercel não permite uso
      comercial.
- [x] **Endereço**: https://idea-dft.pages.dev. Um domínio próprio
      (registro.br) continua possível: se vier, ligue ele no projeto da
      Cloudflare e troque o endereço nas três linhas marcadas no `index.html`.
- [x] **Imagem de prévia do link** (`og:image`), para o link aparecer com
      imagem no WhatsApp e no LinkedIn.
- [ ] **E-mail e Instagram** em `src/config/contato.ts`, quando existirem.

## Onde mexer

| Quero mudar | Arquivo |
| --- | --- |
| WhatsApp, e-mail, Instagram | `src/config/contato.ts` |
| Os sintomas do diagnóstico | `src/dados/sintomas.ts` |
| O que a iDEA faz (as órbitas) | `src/dados/camadas.ts` |
| O desenho das órbitas, em 3D | `src/componentes/telas/Orbitas.tsx` |
| As rotinas do terminal | `src/dados/cenarios.ts` |
| Passos do método e compromissos | `src/dados/metodo.ts` |
| Os ramos do formulário | `src/dados/ramos.ts` |
| O texto da mensagem do WhatsApp | `src/lib/mensagem.ts` |
| Cores, fontes, botões | `src/index.css` (tokens no `:root`, no topo) |
| A imagem da prévia do link | `scripts/og.html`, depois `pnpm imagens` |
| A arte do anúncio (feed e status) | `scripts/anuncio.html`, depois `pnpm imagens` |
| O favicon e o ícone do celular | `scripts/imagens.mjs`, depois `pnpm imagens` |
| Título e descrição da prévia | `index.html` (as metas `og:`) |
| Uma seção | `src/secoes/<Seção>.tsx` |
| A ordem das seções | `src/App.tsx` |

Texto mora em `dados/`, não nos componentes: dá para reescrever a página
inteira sem tocar em layout.

## Como a página funciona

A página é **uma conversa só**. Cada seção deixa alguma coisa no estado
compartilhado (`src/estado/conversa.ts`), e o contato junta tudo numa
mensagem pronta (`src/lib/mensagem.ts`):

| Seção | O que a pessoa faz | O que vai para a mensagem |
| --- | --- | --- |
| Hero | entende a proposta numa frase | |
| Diagnóstico | marca o que acontece na empresa | os sintomas marcados |
| O que fazemos | vê automação no centro, web e apps em volta | |
| Por dentro | vê uma rotina do ramo dela rodando | o exemplo escolhido e o ramo |
| Calculadora | mede quanto a tarefa custa | horas por mês e reais por ano |
| Método | vê como o projeto anda e o que pode cobrar | |
| Laboratório | conhece a IVE | o interesse em testar |
| Contato | escreve do jeito dela | tudo acima, mais o texto dela |

Nada sai do navegador sozinho. O botão do WhatsApp é um link `wa.me` com o
texto no endereço, e quem decide enviar é a pessoa. A calculadora só entra na
mensagem depois que a pessoa mexe nela: número que ela não escolheu não fala
por ela.

## As cenas de pontos

`src/componentes/telas/pontos.ts` é o mesmo motor da landing da IVE (baldes de
opacidade, Path2D, pausa fora da tela, mola do cursor). Três cenas usam ele:

- **Plano** (hero). Um chão de pontos em perspectiva, sem biblioteca 3D: um
  ponto do plano em (u, z) vai para a tela em `x = centro + u·f/z`,
  `y = horizonte + (1 − h)·f/z`. Os pontos nascem espalhados e se organizam a
  partir da ideia (o quadrado roxo), que depois toca o plano e solta ondas. Um
  clique solta uma ideia nova. Abaixo de 1024px a cena desce para baixo do
  texto e a câmera muda junto.
- **Órbitas** (O que fazemos). O sistema da automação visto um pouco de lado:
  cubos girando em órbitas de pontos e a IA numa órbita inclinada, tudo
  pintado do mais longe para o mais perto. A camada ativa vem das abas ao
  lado, e o mouse em cima de uma órbita escolhe a camada.
- **Esfera** (Laboratório). Porte direto da esfera da IVE.

Com "reduzir movimento" ligado no sistema, as três desenham um quadro só, já
no estado final.

## Decisões que valem saber

- **Nada fica invisível esperando animação.** O `<Revela>` só anima blocos que
  ainda estão FORA da tela; o estado de repouso é sempre visível. Miniatura de
  link, leitor de tela e navegador sem JS veem o texto inteiro.
- **O "i" da logo é desenhado.** `src/lib/medirMarca.ts` mede o "ı" e o "D"
  da Archivo: a haste e o pingo saem com a espessura da haste da fonte, e o
  "i" inteiro, do pé ao topo do pingo, fica com a altura do D. Tudo em `em`,
  para valer em qualquer tamanho.
- **A marca acerta o pixel.** O navegador arredonda a linha de base do texto
  e as caixas da marca (haste, pingo, ponto) cada uma por conta própria. Com
  zoom de 90%, o pingo saía do topo do D. `src/lib/baseNoPixel.ts` desloca a
  marca inteira pela fração que falta para a linha de base cair num pixel
  exato.
- **TypeScript 7 não aceita `baseUrl`.** O alias `@/` funciona só com `paths`
  (`tsconfig.app.json`).
- **Parcel precisa de `packageExports: true`** (no `package.json`) para achar
  arquivos internos do Radix.
- **O Artifact tem entrada própria.** O `pnpm artefato` parte de
  `scripts/artefato.html`, e não do `index.html`. O `index.html` aponta para
  os ícones de `public/`, uma pasta que só o Vite conhece: o Parcel quebrava
  procurando esses arquivos.
- **pnpm 12 bloqueia scripts de instalação.** Os pacotes do Parcel (swc,
  lmdb, watcher, msgpackr) já vêm com binário pronto, e o
  `pnpm-workspace.yaml` nega os scripts deles de propósito. Sem essa decisão
  escrita, o `pnpm install` termina com erro num servidor de deploy.
- **Teste visual com a aba escondida engana.** Navegador não roda
  `requestAnimationFrame` em aba oculta: o plano fica parado no caos do
  primeiro quadro. Não é bug.
- **Na pasta do OneDrive, o Vite às vezes demora a ver um arquivo salvo.** Se
  uma mudança não aparecer no localhost, espere uns segundos ou recarregue a
  página.

## Estrutura

```
divulgacao/                a arte do anúncio para as redes (fora do site)
public/                    prévia do link, ícones e o cache da Cloudflare
scripts/                   o build do Artifact, o gerador das imagens e o desenho delas
src/
├── App.tsx                a ordem das seções
├── index.css              tokens da identidade e estilos dos componentes
├── config/contato.ts      o único lugar que sabe como falar com a iDEA
├── dados/                 todo o texto da página
├── estado/                a conversa que atravessa a página
├── lib/                   mensagem, medidas da marca, formatação
├── componentes/           cabeçalho, rodapé, marca, ponto final, revela
│   └── telas/             motor de pontos, plano, órbitas e esfera
├── components/ui/         slider e tabs do shadcn/ui (Radix)
└── secoes/                uma por seção da página
```
