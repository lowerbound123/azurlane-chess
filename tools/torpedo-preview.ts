import {createApp} from 'vue';
import '@fontsource-variable/saira/wdth.css';
import '@fontsource-variable/jetbrains-mono/wght.css';
import '../src/theme.css';
import '../src/styles/primitives.css';
import '../src/style.css';
if(import.meta.env.DEV){const {default:Preview}=await import('../src/dev/TorpedoPreview.vue');createApp(Preview).mount('#app');}
