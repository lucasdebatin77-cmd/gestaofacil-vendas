# Arena cinematográfico — segunda revisão visual

7 de novembro de 2026. Continuidade da branch `design/arena-visual-refinement`; ponto inicial desta revisão: `b67d497`.

## Referência recebida e conferida

A direção foi aprovada após inspeção da referência renderizada em `https://3000-iqpko6mxf5edz9h8v5l0z.e2b.app/`, nos viewports desktop e celular. A composição usa cenário fotográfico, iluminação espectral, tipografia editorial, marca de grande escala e menu flutuante.

Os arquivos fornecidos nesta revisão foram abertos em pastas separadas da aplicação:

- `GestaoFacil-PROJETO-COMPLETO-v2 (1).zip`, SHA-256 `2517446141c45f33ae2090d17c951ba601bf96ba367cca14e2c669c2ae583c9d`.
- `GestaoFacil-PROJETO-COMPLETO-v2.tar.gz`, SHA-256 `12dfa1a3933bbabf403f929d0a6652f4fc4ae38e0055fdf962486a639272a244`.

O ZIP contém os 71 arquivos enumerados pelo seu manifesto, todos com tamanho/hash correspondentes, além do próprio manifesto. Os conteúdos extraídos de ZIP e TAR.GZ são idênticos. As afirmações de homologação contidas na documentação da referência não foram adotadas como testes deste sistema.

## Mudanças implementadas

1. Hero com cenário `hero-stage.jpg`, luz azul/violeta, reflexão e profundidade. O símbolo principal e a assinatura são os mesmos SVG/componente já aprovados; não foi usado `HeroPrism` ou a nova interpretação da logo existente na referência.
2. Menu flutuante arredondado, mantendo todos os destinos e callbacks reais. O CTA leva ao login/painel existente, sem formulário paralelo de lista de espera.
3. Texto do hero ajustado para descrever vitrine, produtos, lojas, links e registros financeiros existentes. Cards decorativos mostram apenas áreas da plataforma, sem pedidos, faturamento, agentes ativos, conversões ou tendências inventadas.
4. Fundo mais escuro e sem símbolo atrás do texto no celular. As duas ações principais continuam visíveis e o menu abre abaixo do cabeçalho.
5. Ecossistema, etapas, catálogo real, Radar, inteligência, transparência, FAQ e chamada final receberam uma composição coerente. `prism.jpg` é arte de ambientação na seção de evolução; `ribbon-band.jpg` enquadra a chamada final. A imagem de prisma não substitui a marca.
6. Conteúdo honesto preservado: Radar sem pontuação fictícia, agentes em desenvolvimento, pagamentos externos e integrações pendentes. Nenhum selo de certificação, SLA, promessa de conexão ativa ou link de política fictício foi importado da referência.
7. Foram removidos 852 seletores antigos da landing antes de escrever o novo conjunto em `src/commerce-ui.css`. Não foi adicionada outra folha de sobrescritas. Classes dos anéis do Radar foram isoladas para evitar colisões com `.ring-one` etc. existentes no sistema.
8. Sem novas dependências de produto: React/Vite, SDK, configurações, backend e fontes existentes permanecem na base original. Não foi instalado Lenis, Next.js ou uma biblioteca gráfica para simular o cenário. As animações de entrada são finitas; o efeito de luz acompanha o comportamento visual já existente.

Os três recursos originais, com bytes preservados, estão em `application/public/resources/arena/`:

| Arquivo | Bytes | SHA-256 |
| --- | ---: | --- |
| `hero-stage.jpg` | 159053 | `1a0ee5c478f730b2b5ca9f63d7e09a2453c44d5f08a23d079226bfeff6bbbf69` |
| `prism.jpg` | 80510 | `be08a608a9873bf770f63bc217d0c30183c9a00f3c086cbfb3e28952fcd1389c` |
| `ribbon-band.jpg` | 70540 | `e61adf983368b9777b789d464a407368fae296c7bbd50a2c30da7985438b1323` |

## Preservação e verificações

- `node tools/visual/verify-preservation.mjs`: 25 comparações passaram com a base funcional `410aa37`. Os três arquivos de backend, configurações de autenticação, manifesto de dependências, SVG, contratos e 159 handlers de eventos permanecem iguais.
- `node tools/visual/verify-workspace-css.mjs`: 1.063 regras fora da landing são idênticas às de `b67d497`, incluindo contexto de media queries e declarações. Não houve redesign adicional das telas operacionais nesta revisão.
- `node tools/visual/compare-type-diagnostics.mjs`: os mesmos 40 diagnósticos da base, sem novos erros detectados.
- `npx tsc --noEmit`: falhou nos diagnósticos preexistentes; tipagem padrão não está aprovada.
- `npm run build`: falhou por ausência de `@appdeploy/client` no ambiente local exportado; build de produção não está aprovado.
- `npx vite build --config tools/visual/vite.preview.config.mjs`: passou. CSS de prévia: aproximadamente 136 kB, 29 kB gzip. Na entrega anterior eram aproximadamente 176 kB, 37 kB gzip. Esses tamanhos são do artefato de prévia, não uma medição de desempenho em produção.
- `git diff --check`: sem erros de whitespace.
- Lint: o projeto funcional não tem script/configuração de lint. Não foi instalado um gate novo.

No navegador real, Playwright CLI conferiu:

- Hero e sete seções em 375, 390, 768, 1024, 1440 e 1920 px: 48 combinações sem overflow horizontal de documento detectado.
- Menu móvel em 375/768; âncoras, busca, filtros e expansão/recolhimento do FAQ.
- Catálogo vazio e catálogo com um produto sintético sem preço. Busca sem resultado e clique no card para o detalhe individual passaram. O produto de teste só é retornado pela configuração de fixtures com `?catalogFixture`.
- Recursos visuais sem imagens quebradas e sem respostas HTTP de erro durante o roteiro.
- Movimento reduzido: zero animações CSS em execução; Tab alcançou o link de pular conteúdo. Isso não é auditoria completa de acessibilidade.
- Dashboard, produtos, afiliados, financeiro, Radar, equipe e configuração da loja nos cinco tamanhos anteriores, além de abertura/rolagem/cancelamento dos formulários de produto, link, financeiro e nova empresa.

A inspeção visual identificou e corrigiu um recorte de card decorativo em 1024 px, a colisão dos nomes das classes dos anéis do Radar e regras globais antigas que afetavam o layout e o tamanho da assinatura no rodapé. Capturas foram refeitas após as correções.

## Limites e execução local

Mantém-se a configuração de revisão com fixtures identificadas, sem rede de produção, autenticação real ou gravações. O teste de catálogo populado é exclusivo dessa configuração; o produto não integra a aplicação publicada.

```powershell
cd application
npm run dev -- --config tools/visual/vite.preview.config.mjs
```

Abra `http://127.0.0.1:5174/?signedOut`. O link funciona no computador em que o servidor estiver rodando. `.preview-dist` não deve ser publicado como aplicação funcional.

Nenhum deploy, migração, envio de convite, pagamento ou alteração de dados foi executado. Integração, sessão, RBAC, isolamento multiempresa e persistência continuam exigindo homologação em staging com SDK e contas de teste autorizadas. A aprovação visual não autoriza publicação em produção.

Para reverter apenas esta revisão de código, compare/restaure os arquivos alterados com `b67d497`, sem alterar registros do banco.

Skills aplicadas: `frontend-design`, `react-best-practices`, `web-design-guidelines` e `playwright`, seguindo o roteamento, workflows de redesign/dashboard e standards do Design Engine local. Nenhuma geração de imagem ou API paga foi necessária.
