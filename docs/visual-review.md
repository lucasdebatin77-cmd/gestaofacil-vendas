# Revisão visual — GestãoFácil Vendas

Data: 6 de novembro de 2026. Branch: `design/arena-visual-refinement`.

## Inventário inicial

O repositório em `11accfc` continha apenas README e o ZIP. Não continha o sistema funcional, seus módulos, backend ou ambiente de homologação. Não havia AGENTS.md local, manifesto de qualidade, configuração de CI ou testes executáveis na raiz.

Os ZIPs do repositório e de Downloads são idênticos: SHA256 `22F750AD29544E6AEE46D1462B64E952120F32C857B6E8A432AD5342409F4E22`.

O ZIP foi extraído em pasta separada. É uma landing Next.js 16.2.6, React 19.2.6, Tailwind 4 e Drizzle/PostgreSQL. Possui componentes Hero, Navbar, Ecosystem, Radar, FAQ etc. Não é a aplicação React/Vite e seu package.json não foi transplantado para ela.

A referência foi executada em localhost:3000. Três arquivos referenciados não vieram no ZIP: `images/hero-stage.jpg`, `images/prism.jpg`, `images/ribbon-band.jpg`. Foram observados três erros 404. Sem banco da referência, foi usada uma URL local deliberadamente indisponível, para o código original entrar no tratamento de erro e retornar zero na lista de acesso; nenhum PostgreSQL foi provisionado, nenhum lead foi cadastrado e nenhuma imagem foi inventada.

O AppDeploy forneceu 29 arquivos do snapshot válido `1793991669421`. Arquivos com mais de 2.000 linhas foram lidos em páginas. A recuperação completa está registrada até `410aa37`. Essa é a base da aplicação em `application/`, incluindo os backends, autenticação, módulos operacionais e símbolo aprovado. A página publicada foi aberta em navegador somente para leitura e captura inicial.

## Direção e implementação

- Composição editorial e hierarquia do Arena: Cormorant Garamond no hero e títulos de página, Inter para leitura, dados e controles. Outfit continua na assinatura aprovada.
- Paleta azul obsidiana `#04060f`, superfícies `#0a0e1c`, linhas `#1b2440`, cromado `#cfe3ff`, ciano `#22d3ee` e espectro da marca. O tratamento dourado anterior foi substituído pela direção observada no ZIP.
- Hero, órbita, cards, painéis e estados vazios harmonizados. Painel com enquadramento mais compacto; valores financeiros em fonte sem serifa com algarismos tabulares.
- Sete folhas anteriores foram consolidadas em `src/commerce-ui.css`. Declarações anteriores completamente sobrescritas por uma regra idêntica no mesmo escopo foram removidas. A ordem da cascata e das media queries foi mantida. Não se trata de uma oitava folha de correção.
- Menu móvel, formulários, estados de seleção, foco visível, links de pular conteúdo, identificação de diálogos e dimensões do símbolo receberam ajustes de apresentação/acessibilidade.
- A órbita decorativa fica oculta em celular; telas operacionais continuam priorizando conteúdo e controles. Movimento reduzido é respeitado.
- Nenhuma estatística comercial, depoimento, certificação ou atividade fictícia foi incorporada ao produto. Os avisos sobre Radar sem dados, checkout externo e agentes planejados foram preservados.

## Preservação verificada

`node tools/visual/verify-preservation.mjs` compara com `410aa37`:

- Conteúdo idêntico dos três arquivos de backend, `package.json`, `vite.config.ts`, `tsconfig.json`, `appdeploy.auth-login.json`, símbolo SVG, manifest e cenários de teste originais.
- 159 atributos de eventos idênticos em cinco componentes, incluindo seus callbacks.
- 18 contratos de tipos/interfaces idênticos e 98 expressões de hooks/operações SDK idênticas.

Isso demonstra o limite do diff. Não equivale a homologação funcional de sessões, RBAC, isolamento ou persistência. Nenhuma chamada de gravação foi realizada na aplicação publicada, nenhum dado foi migrado e nenhuma configuração de infraestrutura foi modificada.

## Ambiente de revisão

O SDK `@appdeploy/client` é importado pela base, mas não está no manifesto exportado e retorna 404 no npm público. Não foi substituído na configuração de produção.

`tools/visual/vite.preview.config.mjs` é uma configuração separada, usada explicitamente só na revisão. Ela resolve o import para `fixture-client.ts`, fornece uma conta e empresa sintéticas, catálogo vazio, finanças vazias e um produto sem preço para conferir as páginas públicas. Mostra uma faixa permanente de prévia e bloqueia POST, PUT, DELETE, autenticação real e convites. O Vite padrão continua usando sua configuração original.

Essas fixtures permitem inspecionar o JSX real do sistema, mas não são um backend reconstruído ou uma homologação de funções ausentes. `.preview-dist` não deve ser publicado.

## Comandos e resultados

| Comando / verificação | Resultado efetivo |
| --- | --- |
| `npm install --ignore-scripts --no-audit --no-fund` em cada base separada | Executado; dependências locais instaladas sem ativar serviços |
| `npm run dev -- --hostname 127.0.0.1 --port 3000` na referência | Renderizou; três imagens ausentes; banco da referência indisponível |
| `npm run dev -- --host 127.0.0.1 --port 5173` na aplicação padrão | Inicializou Vite; execução completa bloqueada pelo SDK ausente |
| `npm run dev -- --config tools/visual/vite.preview.config.mjs` | Prévia local executada com fixtures, sem rede de produção |
| `npx tsc --noEmit` | Falhou: 40 diagnósticos preexistentes (SDK ausente e declarações não usadas) |
| `node tools/visual/compare-type-diagnostics.mjs` | Mesmo conjunto de 40 diagnósticos antes/depois; nenhum diagnóstico novo |
| `npm run build` | Falhou na resolução de `@appdeploy/client`; build padrão não aprovado |
| `npx vite build --config tools/visual/vite.preview.config.mjs` | Passou para a prévia visual; não é o build de produção homologado |
| `node tools/visual/verify-preservation.mjs` | 25 comparações passaram |
| `git diff --check` | Passou, sem erros de whitespace; Git informou conversão LF/CRLF no Windows |
| Lint | Não existe script ou configuração de lint na base Vite recuperada; não foi inventado um gate |
| `tests/tests.json` | Cenários manuais preservados; não há runner automatizado. Cenários reais com criação, convites e permissões não executados |

## Navegador e capturas

Playwright CLI foi usado em navegador real. A comparação inicial inclui a landing publicada e a referência Next renderizada. A captura anterior do dashboard aplica os estilos originais recuperados ao mesmo JSX e fixtures locais, para comparar a apresentação com as mesmas condições. As demais capturas posteriores da aplicação são da prévia local, identificada na imagem.

- Landing: 375, 390, 768, 1440 e 1920 px; menu, âncora de catálogo, preenchimento da busca, seleção de tipo e expansão/recolhimento do FAQ.
- Dashboard, produtos, afiliados, financeiro, Radar, equipe e configuração da loja: 35 combinações de tela/largura nos mesmos cinco tamanhos. Sem overflow horizontal de documento detectado.
- Integrações: conferência em desktop. Recursos pendentes mantiveram o status de indisponíveis.
- Loja pública e produto individual: 375, 768 e 1440 px, com dados sintéticos explicitamente identificados. Navegação do card ao detalhe conferida. Destino externo não foi acionado.
- Formulários de produto, afiliado e financeiro: nove combinações em 375/768/1440; abertura, rolagem até o rodapé e cancelamento. Rodapés acessíveis, sem overflow horizontal. Diálogo de nova empresa aberto e cancelado nos três tamanhos.
- Movimento reduzido: zero animações em execução após a preferência. Tab focou o link de pular conteúdo.
- Console da prévia: apenas mensagens informativas do React DevTools durante os fluxos capturados; nenhum erro registrado.

Inspeção visual levou à correção de background-clip do título, recaptura de menus após transições, remoção de acentos verde-limão herdados e melhoria dos valores financeiros. As capturas não demonstram saúde operacional de produção.

## Pendências de homologação

1. Obter ambiente de staging com SDK original do AppDeploy, sem apontar gravações para produção.
2. Executar o build padrão e tipagem com SDK disponível; tratar os diagnósticos de código não usado em alteração separada se desejado.
3. Testar login, expiração/restauração de sessão, duas organizações e os quatro papéis usando contas de teste autorizadas.
4. Exercitar cadastro/edição/publicação/exclusão, convites/revogação, links e finanças em staging; testar páginas públicas com catálogo populado real de teste.
5. Validar teclado completo, leitores de tela, foco contido/restaurado em diálogos e contraste sistemático. Só os checks descritos acima foram executados.
6. Conferir tabelas densas, paginação, nomes longos, erros de rede e múltiplos colaboradores com fixtures adicionais ou staging; o conjunto atual privilegia estados vazios.
7. Recuperar as três imagens ausentes se for necessária uma comparação integral com o Arena. Não se redesenhou o símbolo para compensar essa ausência.

Não houve deploy, compra, ativação de serviço pago, envio de convite, migração ou mudança de banco. Publicação em produção requer autorização específica após revisão do resultado e homologação em staging. Reversão visual: restaurar os arquivos da aplicação do commit `410aa37`; esse procedimento de código não altera registros.

## Skills usadas

`frontend-design`, `react-best-practices`, `web-design-guidelines` e `playwright`, compatíveis com React/Vite e com a referência Next. Aplicados os workflows de revisão visual/dashboard e os standards locais do Design Engine. As diretrizes web foram consultadas em https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md. Não foram adicionadas bibliotecas de UI, imagem ou animação ao manifesto do aplicativo.
