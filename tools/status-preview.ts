import {createApp} from 'vue';
import '@fontsource-variable/saira/wdth.css';
import '@fontsource-variable/jetbrains-mono/wght.css';
import '../src/theme.css';
import '../src/styles/primitives.css';
import '../src/style.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
if(import.meta.env.DEV){const {default:Preview}=await import('../src/dev/StatusPreview.vue');createApp(Preview).mount('#app');}
