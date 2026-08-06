import { mkdir, writeFile } from 'node:fs/promises'

await mkdir('dist/server', { recursive: true })
await writeFile('dist/server/index.js', `export default { fetch(request, env) {
  return env.ASSETS.fetch(request).then(response => response.status === 404
    ? env.ASSETS.fetch(new Request(new URL('/', request.url), request))
    : response)
} }\n`)
