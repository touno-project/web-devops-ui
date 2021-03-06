const production = !(process.env.NODE_ENV === 'development')
const config = {
  head: {
    titleTemplate: title => `${title ? `${title} · ` : ''}DevOps`
  },
  meta: [
    { charset: 'utf-8' },
    { name: 'application-name', content: 'DevOps-UI' },
    { name: 'name', content: 'DevOps-UI' },
    { name: 'description', content: 'Server automation fix and report services.', id: 'desc' },
    { name: 'viewport', content: 'width=device-width, user-scalable=no' },
    { name: 'apple-mobile-web-app-title', content: 'DevOps-UI' },
    { name: 'author', content: 'Mr.Kananek T.' }
  ],
  icons: {
    sizes: [16, 120, 144]
  },
  manifest: {
    name: 'DevOps-UI',
    lang: 'en',
    dir: 'rtl',
    description: '',
    short_name: 'DevOps',
    icons: [
      { src: '/icon-16.png', sizes: '16x16' },
      { src: '/icon-120.png', sizes: '120x120' },
      { src: '/icon-144.png', sizes: '144x144' }
    ],
    start_url: '/',
    display: 'fullscreen',
    orientation: 'portrait',
    theme_color: '#ffffff',
    background_color: '#ffffff',
    browser_action: {
      default_icon: '/icon-16.png',
      default_popup: '/sign-in'
    }
  },
  workbox: {
    // Workbox options
  },
  router: {
    middleware: ['auth']
  },
  loading: '~/components/loading/top-bar.vue',
  css: [
    './assets/scss/index.scss'
    // 'codemirror/lib/codemirror.css',
    // 'codemirror/addon/merge/merge.css',
    // 'codemirror/theme/material.css'
  ],
  modules: [
    'nuxt-fontawesome',
    'bootstrap-vue/nuxt',
    '@nuxtjs/axios',
    '@nuxtjs/auth',
    '@nuxtjs/pwa'
  ],
  bootstrapVue: { bootstrapCSS: false },
  plugins: [
    // './plugins/vue-toast.js',
    // '~/plugins/vue-installed.js',
    { src: '~/plugins/vue-component.js', ssr: false }
    // { src: '~/plugins/vue-codemirror.js', ssr: false },
    // { src: '~/plugins/socket.io.js', ssr: false }
  ],
  // vendor: ['moment', '~/node_modules/vue-socket.io'],
  buildModules: [
    '@nuxtjs/eslint-module'
  ],
  build: {
    extend (config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    },
    parallel: !production,
    cache: true,
    extractCSS: production,
    optimization: {
      splitChunks: {
        cacheGroups: {
          styles: { name: 'styles', test: /\.(css|vue)$/, chunks: 'all', enforce: true }
        }
      }
    }
  },
  render: {
    http2: {
      push: true,
      pushAssets: (req, res, publicPath, preloadFiles) => preloadFiles
        .filter(f => f.asType === 'script' && f.file === 'runtime.js')
        .map(f => `<${publicPath}${f.file}>; rel=preload; as=${f.asType}`)
    }
  },
  auth: {
    strategies: {
      local: {
        endpoints: {
          login: { url: '/auth/login', method: 'post', propertyName: 'token' },
          logout: { url: '/auth/logout', method: 'post' },
          user: { url: '/auth/user', method: 'get', propertyName: 'user' }
        }
      }
    },
    redirect: { login: '/sign-in', logout: '/sign-in', home: '/' }
  },
  server: { port: 3000, host: '0.0.0.0', timing: false },
  fontawesome: {
    component: 'fa',
    imports: [
      { icons: ['fas'], set: '@fortawesome/free-solid-svg-icons' },
      { icons: ['far'], set: '@fortawesome/free-regular-svg-icons' }
    ]
  },
  axios: { baseURL: process.env.AXIOS_BASE_URL || 'http://10.0.80.52:25081/' },
  env: {
    dev: !production,
    baseURL: process.env.AXIOS_BASE_URL || 'http://10.0.80.52:25081/',
    SOCKET_HOST_URL: process.env.SOCKET_HOST ? `http://${process.env.SOCKET_HOST}:${process.env.SOCKET_PORT}` : 'http://10.0.80.52:25082'
  }
}

module.exports = config
