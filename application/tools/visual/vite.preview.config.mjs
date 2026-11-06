// Explicit visual fixture configuration; never imported by production vite.config.ts.
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
export default defineConfig({
  plugins:[react(),{name:'visual-fixture-label',transformIndexHtml(html){return html.replace('<body>','<body><div role="note" style="position:fixed;bottom:0;left:0;right:0;z-index:9999;background:#cfe3ff;color:#04060f;padding:5px;text-align:center;font:11px system-ui">PRÉVIA VISUAL LOCAL · fixtures sintéticas · sem autenticação, gravações ou conexão com produção</div>');}}],
  resolve:{alias:{'@appdeploy/client':fileURLToPath(new URL('./fixture-client.ts',import.meta.url))}},
  server:{host:'127.0.0.1',port:5174,strictPort:true},
  build:{outDir:'.preview-dist'}
});
