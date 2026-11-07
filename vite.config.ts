import { defineConfig } from 'vite';

export default defineConfig({
  // 'extern-wasm' = do not embed the 15 MB .wasm in the JS bundle; the app loads it from /ort/ (copied by scripts/copy-ort.mjs)
  resolve: { conditions: ['onnxruntime-web-use-extern-wasm'] },
  optimizeDeps: { exclude: ['onnxruntime-web', 'onnxruntime-web/wasm'] },
  worker: { format: 'es' },
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
  build: { target: 'es2022' },
});
