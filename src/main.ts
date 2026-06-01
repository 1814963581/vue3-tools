import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { logger } from './services/logger'
import './styles/main.scss'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)

app.use(router)

logger.configure(true, import.meta.env.PROD ? 'warn' : 'debug')

app.config.errorHandler = (err, instance, info) => {
  logger.error('Global', 'Application error', {
    error: err instanceof Error ? err.message : String(err),
    component: instance?.$?.type?.name || 'unknown',
    info,
  })
}

router.onError((error) => {
  logger.error('Router', 'Navigation error', { error: error.message })
})

window.addEventListener('unhandledrejection', (event) => {
  logger.error('Global', 'Unhandled rejection', { reason: event.reason })
})

window.addEventListener('error', (event) => {
  logger.error('Global', 'Window error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  })
})

app.mount('#app')
