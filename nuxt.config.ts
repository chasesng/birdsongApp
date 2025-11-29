// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: [
    '@nuxt/ui',
    '@nuxt/image',
    '@nuxt/icon',
    '@nuxt/content',
    '@nuxtjs/color-mode',
  ],
  css: ['~/assets/css/main.css'],
  devtools: { enabled: false },
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css'
        }
      ],
      script: [
        {
          src: 'https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.js',
          body: true // load in body, after DOM
        }
      ]
    }
  },
  colorMode: {
    preference: "system",
  },
  ssr: false,
  devServer: {
    host: '0.0.0.0',
    port: 3000,
  },
})