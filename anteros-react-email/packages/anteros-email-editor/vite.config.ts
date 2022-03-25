import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  plugins: [],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@anterostecnologia/anteros-email-core': path.resolve('../anteros-email-core'),
    },
  },
  define: {},
  build: {
    emptyOutDir: false,
    minify: true,
    manifest: false,
    sourcemap: true,
    target: 'es2015',
    lib: {
      entry: path.resolve(__dirname, 'src/index.tsx'),
      name: 'anteros-email-editor',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      plugins: [],
      external: [
        'react',
        'react-dom',
        'react-dom/server',
        'mjml-browser',
        'react-final-form',
        '@anterostecnologia/anteros-email-core',
      ],
      output: {},
    },
    outDir: 'lib',
  },
  optimizeDeps: {
    include: ['@anterostecnologia/anteros-email-core'],
  },
  css: {
    modules: {
      localsConvention: 'dashes',
    },
    preprocessorOptions: {
      scss: {},
    },
  },
});
