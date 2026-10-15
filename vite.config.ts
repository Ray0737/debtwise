import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { loadEnv, type Plugin } from 'vite'

// `npm run dev` only serves the UI. This runs the files in /api in the dev server too,
// with the same request and response shape Vercel gives them, so chat and upload work locally.
function localApi(): Plugin {
  return {
    name: 'local-api',
    apply: 'serve',
    configureServer(server) {
      Object.assign(process.env, loadEnv(server.config.mode, process.cwd(), ''))
      server.middlewares.use(async (req, res, next) => {
        const m = req.url?.match(/^\/api\/(ai|stt|tts)(\?|$)/)
        if (!m) return next()
        const chunks: Buffer[] = []
        for await (const c of req) chunks.push(c as Buffer)
        let body: unknown = {}
        try { body = JSON.parse(Buffer.concat(chunks).toString() || '{}') } catch { /* empty body */ }
        const out: any = res
        out.status = (code: number) => { res.statusCode = code; return out }
        out.json = (o: unknown) => { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(o)); return out }
        out.send = (b: Buffer | string) => { res.end(b); return out }
        try {
          const mod = await server.ssrLoadModule(`/api/${m[1]}.ts`)
          await mod.default(Object.assign(req, { body, query: {} }), out)
        } catch (e) {
          server.config.logger.error(String(e))
          if (!res.writableEnded) { res.statusCode = 500; res.end('api error') }
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    localApi(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Debtwise', short_name: 'Debtwise', start_url: '/', display: 'standalone',
        theme_color: '#292d7a', background_color: '#292d7a',
        icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
      workbox: { navigateFallbackDenylist: [/^\/api\//] },
    }),
  ],
  test: { environment: 'node', include: ['src/**/*.test.ts', 'api/**/*.test.ts'] },
})
