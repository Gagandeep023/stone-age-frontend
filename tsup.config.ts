import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'index': 'src/index.ts',
    'frontend/index': 'src/frontend/index.ts',
    'types/index': 'src/types/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  minify: false,
  external: ['react', 'react-dom', 'socket.io-client'],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
  onSuccess: 'cp src/styles/stone-age.css dist/styles.css 2>/dev/null || true',
});
