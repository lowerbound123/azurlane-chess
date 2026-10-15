import {privateAssetsGuard} from './scripts/vite-private-assets.ts';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
export default defineConfig({publicDir:'.generated/public',plugins:[privateAssetsGuard(),vue(),tailwindcss()],build:{manifest:'assets/spine-assets.json'},resolve:{alias:{'@':fileURLToPath(new URL('./src',import.meta.url))}},server:{watch:{usePolling:true,interval:300}}});
