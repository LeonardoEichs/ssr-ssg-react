import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'
import express from 'express'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

export async function createServer() {
  const resolve = (p) => path.resolve(__dirname, p)

  let vite = null

  app.use((await import('compression')).default())
  app.use(
    (await import('serve-static')).default(resolve('dist/client'), {
      index: false,
    })
  )
  app.use('*', async (req, res) => {
    const url = '/'

    const template = fs.readFileSync(resolve('dist/client/index.html'), 'utf8')
    const render = (await import('./dist/server/entry-server.js')).SSRRender

    const appHtml = render(url)
    const html = template.replace(`<!--app-html-->`, appHtml)

    res.status(200).set('Content-Type', 'text/html').send(html)
  })
  return { app, vite }
}

createServer().then(({ app }) => {
  app.listen(3000, () => {
    console.log('Server listening on port 3000')
  })
})