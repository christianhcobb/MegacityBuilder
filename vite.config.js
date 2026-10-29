import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)));

// SINGLEFILE=1 inlines everything into dist/index.html (for the claude.ai artifact or Add-to-Home-Screen testing).
// The default build is a normal multi-file site for GitHub Pages.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  plugins: process.env.SINGLEFILE ? [viteSingleFile()] : [],
  build: { target: 'es2020', outDir: 'dist', emptyOutDir: true },
  test: { environment: 'node' },
});
