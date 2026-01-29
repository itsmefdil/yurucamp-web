import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        proxy: {
            '/sitemap.xml': {
                target: process.env.VITE_API_URL || 'http://localhost:3333',
                changeOrigin: true,
            },
        },
        allowedHosts: ['localhost', '127.0.0.1', '0.0.0.0', 'yc.noma.my.id'],
    },
    build: {
        outDir: 'dist',
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    ui: ['@radix-ui/react-dialog', '@radix-ui/react-slot', '@radix-ui/react-label', 'lucide-react', 'class-variance-authority', 'clsx', 'tailwind-merge'],
                    query: ['@tanstack/react-query'],
                },
            },
        },
    },
});
