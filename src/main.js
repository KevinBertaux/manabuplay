/* eslint-disable no-console */
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import '@fontsource/lexend/400.css';
import '@fontsource/lexend/600.css';
import '@fontsource/lexend/700.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/800.css';
import App from './App.vue';
import router from './router';
import './styles/base.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.mount('#app');

console.log('App Vue initialisée');
