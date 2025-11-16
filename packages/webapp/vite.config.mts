import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'
import { ConfigEnv, loadEnv } from 'vite'
import svgr from 'vite-plugin-svgr'
import webfontDownload from 'vite-plugin-webfont-dl'
import { analyzer } from 'vite-bundle-analyzer'

export default ({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd())
  
  // Default proxy target to localhost:9157 (default server port)
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:9157'
  const cookieDomainRewrite = env.VITE_COOKIE_DOMAIN_REWRITE || 'localhost'
  const cookieDomain = env.VITE_COOKIE_DOMAIN || 'localhost'
  
  const plugins = [
    react({
      fastRefresh: true
    }),
    svgr(),
    webfontDownload(['https://rsms.me/inter/inter.css'])
  ]

  if (process.env.ANALYZER) {
    plugins.push(analyzer())
  }

  return {
    assetsInclude: ['**/*.svg'],
    plugins,
    optimizeDeps: {
      force: true // Force re-optimization of dependencies
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler' // Use modern Sass API to avoid deprecation warnings
        }
      }
    },
    define: {
      'import.meta.env.PACKAGE_VERSION': JSON.stringify(process.env.npm_package_version),
      'process.env': {
        VALIDATE_CLIENT_SIDE: true
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src')
      }
    },
    build: {
      target: 'es2015',
      assetsDir: 'static',
      assetsInlineLimit: 0,
      rollupOptions: {
        external: ['react', 'react-dom'],
        output: {
          manualChunks: {
            vendor: [
              'react-router-dom',
              'axios',
              'i18next',
              'i18next-browser-languagedetector',
              'react-i18next'
            ],
            ui: [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-popover',
              '@radix-ui/react-select',
              '@radix-ui/react-tabs',
              '@radix-ui/react-toast',
              '@radix-ui/react-tooltip',
              '@radix-ui/react-visually-hidden',
              'react-flow-renderer',
              'react-resizable-panels',
              'react-sortablejs',
              'qrcode.react'
            ],
            heyform: [
              '@heyooo-inc/react-router',
              '@heyform-inc/answer-utils',
              '@heyform-inc/shared-types-enums',
              '@heyform-inc/utils'
            ]
          }
        }
      }
    },
    server: {
      port: 3000,
      strictPort: true,
      proxy: {
        '/graphql': {
          target: proxyTarget,
          secure: false,
          changeOrigin: true,
          cookieDomainRewrite: {
            [cookieDomainRewrite]: cookieDomain
          },
          
          configure: (proxy: any) => {
            proxy.on('proxyRes', function(proxyRes: any) {
              const removeSecure = (str: string) => str.replace(/; Secure|; SameSite=[^;]/gi, '')
              const set = proxyRes.headers['set-cookie']

              if (set) {
                proxyRes.headers['set-cookie'] = Array.isArray(set)
                  ? set.map(removeSecure)
                  : removeSecure(set)
              }
            })
          }
        },
        '/api': {
          target: proxyTarget,
          secure: false,
          changeOrigin: true
        },
        // Development-only: Proxy OAuth routes to backend
        // This is NOT needed in production (backend serves everything)
        '/connect': {
          target: proxyTarget,
          secure: false,
          changeOrigin: true,
          // Let browser handle OAuth redirects to Google (no followRedirects)
          cookieDomainRewrite: {
            [cookieDomainRewrite]: cookieDomain
          },
          configure: (proxy: any) => {
            proxy.on('proxyRes', function(proxyRes: any) {
              const removeSecure = (str: string) => str.replace(/; Secure|; SameSite=[^;]/gi, '')
              const set = proxyRes.headers['set-cookie']

              if (set) {
                proxyRes.headers['set-cookie'] = Array.isArray(set)
                  ? set.map(removeSecure)
                  : removeSecure(set)
              }
            })
          }
        },
        // Development-only: Proxy logout route to backend
        '/logout': {
          target: proxyTarget,
          secure: false,
          changeOrigin: true
        }
      }
    }
  }
}
