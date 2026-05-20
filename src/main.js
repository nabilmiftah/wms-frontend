import './style.css'

import { createApp } from 'vue'
import App from './App.vue'

import ui from '@nuxt/ui/vue-plugin'
import router from './router'

import VueApexCharts from 'vue3-apexcharts';
import { Toaster } from "vue-sonner";
import "vue-sonner/style.css";

const app = createApp(App)

app.use(ui)
app.use(router)
app.use(VueApexCharts)

app.mount('#app')

