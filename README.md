# gestaofacil-vendas

## Bases separadas

- `premium-ai-commerce-platform-design (3).zip`: referência visual original Arena, Next.js 16 / React 19. Não é o sistema operacional.
- `application/`: código React/Vite recuperado do AppDeploy, snapshot válido `1793991669421`, sem migração de infraestrutura.
- `application/public/gestaofacil-symbol.svg` e `src/BrandIdentity.tsx`: identidade aprovada.

A branch `design/arena-visual-refinement` contém a recuperação da base e uma alteração exclusivamente visual. O ponto de comparação completo é o commit `410aa37`.

Consulte [a revisão e as limitações](docs/visual-review.md) antes de executar ou publicar.

## Prévia visual local isolada

```powershell
cd application
npm ci --ignore-scripts --no-audit --no-fund
npm run dev -- --config tools/visual/vite.preview.config.mjs
```

Essa configuração usa fixtures sintéticas identificadas na tela e bloqueia todas as gravações. Não substitui o SDK nem a autenticação do aplicativo real. Não use a saída `.preview-dist` em produção.

O build padrão depende de `@appdeploy/client`, fornecido pela plataforma e ausente no export local. O manifesto original foi preservado.
