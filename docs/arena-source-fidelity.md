# Correção de fidelidade ao Arena

Branch: `design/arena-source-fidelity`. Base: `a0762b0`. Produção não foi alterada.

A revisão anterior simplificava a referência aprovada. Esta correção recupera o código de apresentação do arquivo enviado, em vez de reproduzir apenas sua paleta e fotografia.

## O que foi recuperado

- Canvas original de fitas de luz e partículas, com pausa fora da área visível e modo de movimento reduzido.
- Profundidade por ponteiro, aproximação do cenário, luz de lente, raios e reflexo no hero.
- Escala e quebras de título, menu compacto, botões magnéticos e cards flutuantes.
- Ecossistema original em três camadas, com apresentação fixa durante a rolagem no desktop e seleção por toque no celular.
- Timeline original, cards com iluminação pelo ponteiro, composição assimétrica de inteligência, faixa fotográfica e letreiro grande.

O símbolo continua sendo o SVG aprovado. Os efeitos não redesenham a marca. Números de vendas, comissões, certificações e atividades automáticas simuladas da referência não foram importados. O catálogo e o contador usam a lista de produtos recebida pela aplicação; funções futuras são identificadas como planejadas.

A aplicação permanece React/Vite. Nenhuma dependência de produto, configuração de backend, banco ou SDK foi substituída. Tailwind 4.1.17 foi usado apenas em uma pasta de compilação separada para gerar o CSS do material original. O resultado está consolidado e limitado aos componentes de apresentação em `commerce-ui.css`; a aplicação não precisa de Tailwind em runtime.

## Comparação real

- Aplicação corrigida: http://127.0.0.1:5174/?signedOut
- Referência visual original: http://127.0.0.1:5175/

O segundo endereço executa os componentes de apresentação do pacote original em um runner local de compatibilidade. Não executa o banco, os endpoints de leads nem o servidor Next.js do outro projeto. O aviso roxo identifica a referência; o aviso azul identifica a prévia funcional com fixtures. Ambos são locais a este computador.

## Verificações executadas

- `npx vite build --config tools/visual/vite.preview.config.mjs`: passou; CSS 210,45 kB (41,82 kB gzip), JS 358,69 kB (104,50 kB gzip). O ganho visual tem custo de código, sem promessa de benchmark de produção.
- `node tools/visual/verify-source-preservation.mjs`: arquivos protegidos idênticos à base `a0762b0`, incluindo backend, configurações, aplicação operacional, SVG, fixture e contrato público Props da landing.
- `node tools/visual/verify-workspace-css.mjs`: 1.063 regras fora da landing permanecem idênticas.
- `node tools/visual/compare-type-diagnostics.mjs`: 40 diagnósticos na base e 40 atuais, idênticos. O comparador foi corrigido para não incluir arquivos novos como se existissem na base.
- `npx tsc --noEmit`: os erros preexistentes continuam; tipagem não homologada.
- `npm run build`: continua falhando pela ausência do SDK `@appdeploy/client` no ambiente exportado.
- `git diff --check`: sem erros.
- Playwright: 48 combinações de seções e viewports 375, 390, 768, 1024, 1440 e 1920 px sem overflow horizontal detectado; busca, produto individual e menu passaram; nenhuma imagem quebrada/resposta HTTP de erro no roteiro; zero animações CSS no modo reduzido e link de pular conteúdo alcançável por Tab.
- Efeitos: canvas com pixels desenhados, resposta de parallax ao ponteiro e seleção das três camadas do ecossistema conferidos no navegador real.

O verificador textual antigo `verify-preservation.mjs` aponta diferenças esperadas nos handlers e hooks da landing, pois eles foram movidos para os componentes visuais recuperados. As outras 23 comparações passam. O novo gate verifica diretamente os arquivos protegidos e o contrato externo, sem declarar que o código visual ficou idêntico.

O clique no CTA foi exercitado, mas a fixture bloqueia autenticação real. Não houve teste de login, sessão, persistência ou RBAC em produção. Não foram repetidos os roteiros internos de formulário nesta correção: seus arquivos e CSS permanecem iguais à revisão anterior. Não existe gate de lint na base funcional.

## Evidências e limites

Capturas `fidelity-*.png` e logs `fidelity-*.json/txt` acompanham esta entrega. A captura de referência é identificada como referência e pode conter demonstrações fictícias próprias daquele arquivo; esses dados não são dados do sistema.

Foi corrigida uma colisão de `.hero-content` com CSS antigo, um padrão de grid que anulava colunas responsivas e o recorte de card no hero. As capturas e as verificações responsivas foram refeitas após as correções.

Não houve deploy, gravação de dados, migração, convite ou ativação de serviço pago. O build de prévia não deve ser publicado como aplicação funcional. Para reverter somente esta revisão, compare os arquivos com `a0762b0`.

Skills efetivamente usadas nesta correção: `frontend-design` e `playwright`, com roteamento e workflows de landing/QA do Design Engine local. A qualidade visual continua sujeita à sua avaliação; os testes não substituem sua aprovação.
