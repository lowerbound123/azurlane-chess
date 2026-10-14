import {defineConfig} from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import {fileURLToPath,URL} from 'node:url';
export default defineConfig({plugins:[vue()],resolve:{alias:{'@':fileURLToPath(new URL('./src',import.meta.url))}},test:{include:['tests/**/*.test.ts'],environment:'node',maxWorkers:1,testTimeout:30000,hookTimeout:30000,setupFiles:['tests/helpers/setup.ts']}});
