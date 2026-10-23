import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main.ts', 'src/worker-main.ts', 'src/migrate-main.ts', 'src/make-admin.ts'],
  format: ['esm'],
  target: 'node22',
  platform: 'node',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  // Ortak paket TypeScript kaynağı olduğu için pakete gömülür.
  noExternal: ['@rifftown/shared'],
});
