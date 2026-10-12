import fs from 'node:fs'
import path from 'node:path'

// Keep this repository's historical source; publish only migration pages.
const output = 'docs/.vitepress/redirect-dist'
const host = 'https://namwoongchan.github.io/pmoffice/'
fs.mkdirSync(output, { recursive: true })
const pages = []
function collect(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'public') continue
    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) collect(file)
    else if (entry.name.endsWith('.md')) pages.push(path.relative('docs', file).replaceAll('\\', '/').replace(/\.md$/, '.html'))
  }
}
collect('docs')
function destination(route) {
  return host + route.replace(/^training\//, 'ai-edu/').replace(/index\.html$/, '')
}
for (const route of pages) {
  const target = destination(route)
  const file = path.join(output, route)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>피엠오피스 새 홈페이지</title><link rel="canonical" href="${target}"><meta http-equiv="refresh" content="0;url=${target}"><script>location.replace(${JSON.stringify(target)}+location.search+location.hash)</script></head><body><h1>피엠오피스 홈페이지 주소가 변경되었습니다.</h1><p><a href="${target}">새 홈페이지로 이동</a></p></body></html>`)
}
fs.writeFileSync(path.join(output, '404.html'), `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>피엠오피스 새 홈페이지</title><script>const route=location.pathname.replace(/^\\/pmoffice-wiki-site\\//,'').replace(/^training\\//,'ai-edu/');location.replace(${JSON.stringify(host)}+route+location.search+location.hash)</script></head><body><a href="${host}">피엠오피스 새 홈페이지로 이동</a></body></html>`)
fs.cpSync('docs/public/downloads', path.join(output, 'downloads'), { recursive: true })
fs.writeFileSync(path.join(output, '.nojekyll'), '')
for (const route of pages) {
  const contents = fs.readFileSync(path.join(output, route), 'utf8')
  if (!contents.includes(destination(route)) || !contents.includes('location.search+location.hash')) throw new Error(`Invalid redirect: ${route}`)
}
console.log(`Verified ${pages.length} legacy page redirects; binary downloads preserved.`)
