/// <reference types="vitest" />
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
        server: {
            port: 3000,
            host: '0.0.0.0',
            headers: {
                'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
                // 'Cross-Origin-Embedder-Policy': 'require-corp', // Uncomment if needed, but usually COOP is enough for popup auth
            },
        },
        plugins: [react()],
        test: {
            globals: true,
            environment: 'jsdom',
            setupFiles: './src/test/setup.ts',
            coverage: {
                exclude: [
                    'src/content/blog-html/**',
                    'src/test/**',
                    '**/*.d.ts',
                    '**/*.test.tsx',
                    '**/*.test.ts',
                    'src/pages/StillWorkingPage.tsx',
                    'src/pages/PoliciesPage.tsx',
                    'src/pages/ForgotPasswordPage.tsx',
                    'src/pages/BillingSuccessPage.tsx',
                    'src/pages/dashboard/PricingPage.tsx',
                    'src/pages/dashboard/ChangelogPage.tsx',
                    'src/pages/dashboard/SessionsPage.tsx',
                    'src/pages/policies/**',
                    'src/components/Article.tsx',
                    'src/components/Diagrams.tsx',
                    'src/components/blog/**',
                    'src/components/Banner.tsx',
                    'src/components/SEO.tsx',
                    'src/lib/api.ts',
                    'src/content/blogLoader.ts',
                    'src/main.tsx',
                    'src/vite-env.d.ts'
                ]
            }
        },
        define: {
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            }
        }
    };
});
