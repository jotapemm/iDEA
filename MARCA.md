# iPEX. — manual da marca

O que a marca é, como ela aparece e como ela fala. Toda página, proposta,
post ou produto novo da iPEX parte daqui.

## O nome

**iPEX.** vem de *apex*, que é ápice em inglês: o ponto mais alto. É onde a
ideia chega quando sai do papel e passa a funcionar sozinha.

- O **i** minúsculo é de propósito. Ele puxa para o design e para a
  tecnologia, como em iPhone, e é o "i" desenhado da logo, com o pingo
  quadrado.
- **PEX** vem em maiúsculas, com o topo na mesma altura do pingo.
- O **ponto final** fecha o nome. Sem ele, não é a marca.

No meio de uma frase, é "a iPEX" (a empresa), sem ponto: "a iPEX faz",
"fale com a iPEX". O ponto aparece quando a marca está sozinha, como logo,
título ou assinatura.

O nome já foi iDEA e depois iDEX. Os dois já eram marcas de outras empresas,
então ele mudou antes de a empresa abrir.

**Registro.** Na pesquisa no INPI de 24/11/2026, não havia nenhuma marca IPEX
registrada para software ou serviços de TI. O que existe perto:

- IPEX, de uma indústria de plásticos, nas classes 20 e 35;
- IPEX CONSTRUTORA, ainda em exame, inclusive na classe 42;
- IPEXTREME, de uma empresa de tecnologia, nas classes 35, 38 e 42;
- uma microempresa de assistência técnica que usa "IPEX TECNOLOGIA" desde
  2020, sem marca registrada.

No Brasil, a marca é de quem deposita primeiro. Por isso, a **iPEX.** precisa
ser depositada na classe 42 (desenvolvimento de software e serviços de TI)
antes de qualquer investimento em divulgação.

## A frase

**Ideias com ponto final.**

Toda empresa tem ideias paradas: o relatório que deveria se montar sozinho,
a planilha que deveria conversar com o sistema, o cliente que deveria ser
avisado sem ninguém lembrar. A iPEX existe para colocar ponto final nelas,
ou seja, entregar funcionando.

A frase também responde ao maior medo de quem contrata software: pagar por
promessa. A iPEX vende a ideia **terminada**.

## O símbolo: o ponto

A marca é `iPEX.`, com duas peças quadradas e roxas:

- o **pingo** do "i", que é a ideia no começo, a faísca;
- o **ponto final**, que é a mesma ideia no fim, entregue.

São a mesma peça em dois momentos. No rodapé do site, o ponto final da vez
anterior cai e sai pela borda, e o pingo pula por cima do P, do E e do X até
pousar no lugar dele: é a história da marca em menos de três segundos.

O quadrado também é um pixel, a menor unidade de software. E ele veio da
logo da IVE, que já tinha o "i" com o pingo quadrado.

**Construção do "i":** ele é desenhado, não digitado. A haste e o pingo têm a
espessura da haste da fonte, e o "i" inteiro, do pé ao topo do pingo, tem a
altura das maiúsculas: o topo do pingo alinha com o topo do P. O vão entre o
pingo e a haste é meia espessura.

**Ícone:** onde a marca inteira não cabe (a aba do navegador, a tela de
início do celular, uma foto de perfil), fica só o "i": haste branca e pingo
roxo no fundo escuro, nas mesmas proporções. Os arquivos saem de
`scripts/imagens.mjs`.

**Regra de ouro:** o ponto é a ÚNICA coisa colorida. Ele aparece na logo, no
fim de cada título afirmativo, nos marcadores, no cursor do terminal e no
foco do teclado. Todo o resto é branco sobre preto.

## Posicionamento

| | |
| --- | --- |
| **Para** | donos e gestores de pequenas e médias empresas, de qualquer ramo, com rotina administrativa pesada |
| **Que** | perdem horas com tarefas repetidas entre planilhas, portais, PDFs, e-mails e sistemas que não conversam |
| **A iPEX** | constrói automações sob medida e, quando precisa, o sistema web ou o app em volta delas |
| **Diferente de** | software pronto (que obriga a empresa a mudar o processo), agências (que vendem site) e ferramentas sem código (que não chegam em portal do governo, PDF e sistema antigo) |
| **Porque** | começa pelo processo real, entrega em etapas curtas, tem preço fechado e sigilo, e o que é feito para o cliente fica com ele |

### Automação no centro

A ordem do que a iPEX faz é uma hierarquia, não uma lista:

1. **Automação**, o núcleo. Robôs que trabalham entre os sistemas.
2. **Sistemas web**, a primeira órbita: quando a automação precisa de uma tela.
3. **Apps**, a segunda órbita: quando ela precisa ir para o celular.
4. **IA** atravessa as três. Entra onde resolve e fica de fora onde uma regra
   simples resolve melhor.

### Por que não tem portfólio

Projeto de cliente fica com o cliente. Em vez de vitrine, a página mostra
**como a iPEX pensa** (as rotinas de exemplo do "Por dentro") e o que ela faz
para si mesma (o Laboratório). O sigilo é argumento de venda, não um buraco
na página.

## Arquitetura

```
iPEX.                    a casa: fala baixo (preto, branco, o ponto)
├── sob medida           automações, sistemas web, apps
└── laboratório          produtos próprios
    └── I.V.E            produto 01: pode ser expressivo (o degradê roxo é dela)
```

Produto pode ter personalidade própria. A casa não muda de roupa.

## Identidade visual

| | |
| --- | --- |
| Fundo | `#050509`, quase preto, puxado para o azul |
| Texto | `#f2f2f7` |
| O ponto | `#8257f5` (o mesmo roxo da IVE); `#a08cff` quando vira texto |
| Títulos | Archivo, estreita (largura 78–86%) e pesada (720–760) |
| Texto | Archivo, largura normal |
| Voz técnica | JetBrains Mono: rótulos, números, terminal |
| Forma | o quadrado, e o cubo quando a cena é 3D. Cantos retos em tudo |
| Movimento | pontos que se organizam, ondas que se espalham, a ideia que anda até virar ponto final. Sempre respeitando quem pede menos movimento |

Os valores exatos moram em `src/index.css` (bloco `:root`). Mudou lá, muda o
site inteiro.

## Voz

- **Fala como gente.** "A gente", "você". Frases curtas.
- **Usa a palavra do cliente.** Planilha, portal, guia, boleto, WhatsApp.
- **Não inventa número.** Exemplo diz que é exemplo. A calculadora mostra o
  tamanho do problema e não promete economia.
- **Sem jargão para quem compra.** O termo técnico fica para a conversa
  técnica.

| Assim | Não assim |
| --- | --- |
| Trabalho repetido vira sistema. | Soluções inovadoras em transformação digital. |
| Um robô que entra no portal e baixa as guias. | Automação RPA ponta a ponta. |
| Preço fechado antes de começar. | Orçamento sob consulta. |
| Exemplo ilustrativo de uma rotina comum no ramo. | Aumente sua produtividade em 300%! |
| Conte a sua ideia. | Solicite uma proposta comercial. |

## Frases da casa

- Ideias com ponto final.
- Trabalho repetido vira sistema.
- Tudo gira em torno da automação.
- Em vez de portfólio, um raio-x.
- Da conversa ao ponto final.
