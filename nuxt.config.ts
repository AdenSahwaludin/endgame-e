// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Sistem Inventaris TK Teratai',
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' }
      ]
    }
  },

  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    'nuxt-auth-utils',
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    session: {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      password: process.env.NUXT_SESSION_PASSWORD || 'a-very-long-secret-password-at-least-32-chars!',
    },
  },

  nitro: {
    preset: 'node-server',
  },

  ui: {
    colorMode: true,
  },
})
