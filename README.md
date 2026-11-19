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
pnpm build        # o site de verdade, em dist/ (sobe na Vercel, Netlify, GitHub Pages)
pnpm artefato     # um HTML único em artefato/, para compartilhar ou publicar como Artifact
```

São dois builds de propósito. O `build` (Vite) gera arquivos separados, com
cache bom, que é o que vai para o ar. O `artefato` (Parcel + scripts/artefato.mjs)
junta tudo num arquivo só, que abre em qualquer lugar.

## Antes de colocar no ar

- [x] **WhatsApp** em `src/config/contato.ts`.
- [x] **Promessas** em `src/dados/metodo.ts`, revistas: entregas por etapa,
      preço fechado para o que foi desenhado, o código feito para o projeto
      fica com o cliente e o ajuste depois de no ar é um plano de
      acompanhamento. Se alguma deixar de valer, mude lá antes de mudar na
      prática.
- [x] **Laboratório**: a IVE fica, como "em desenvolvimento".
- [ ] **Domínio** no registro.br e, se quiser, e-mail e Instagram no mesmo
      `contato.ts`.
- [ ] **Imagem de prévia do link** (`og:image`), para o link aparecer com
      imagem no WhatsApp e no LinkedIn.
- [ ] **Hospedagem**: Cloudflare Pages ligada ao GitHub, com o comando
      `pnpm build` e a pasta `dist`. O plano grátis da Vercel não permite uso
      comercial.

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
- **A logo mede a fonte real.** `src/lib/medirMarca.ts` mede o "ı" da Archivo
  e posiciona o pingo pela espessura exata da haste, em `em`, para valer em
  qualquer tamanho.
- **TypeScript 7 não aceita `baseUrl`.** O alias `@/` funciona só com `paths`
  (`tsconfig.app.json`).
- **Parcel precisa de `packageExports: true`** (no `package.json`) para achar
  arquivos internos do Radix.
- **pnpm 12 bloqueia scripts de instalação.** Os pacotes do Parcel (swc,
  lmdb, watcher, msgpackr) já vêm com binário pronto para Windows, então não
  é preciso aprovar nada.
- **Teste visual com a aba escondida engana.** Navegador não roda
  `requestAnimationFrame` em aba oculta: o plano fica parado no caos do
  primeiro quadro. Não é bug.
- **Na pasta do OneDrive, o Vite às vezes demora a ver um arquivo salvo.** Se
  uma mudança não aparecer no localhost, espere uns segundos ou recarregue a
  página.

## Estrutura

```
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
