#!/usr/bin/env node
import { spawn, execFile } from 'node:child_process'
import { watch } from 'node:fs'
import { promisify } from 'node:util'

const exec = promisify(execFile)

let pending = false
let running = false
async function rebuildCss() {
  if (running) { pending = true; return }
  running = true
  try {
    await exec('pnpm', ['run', '--silent', 'build:css'])
    console.log('[css] copied')
  } catch (e) {
    console.error('[css] failed:', e.stderr || e.message)
  } finally {
    running = false
    if (pending) { pending = false; rebuildCss() }
  }
}

await rebuildCss()

watch('src', { recursive: true }, (_event, filename) => {
  if (filename && filename.endsWith('.css')) rebuildCss()
})

const js = spawn('pnpm', ['run', 'build:js', '--watch'], { stdio: 'inherit' })
js.on('exit', (code) => process.exit(code ?? 0))
process.on('SIGINT', () => js.kill('SIGINT'))
process.on('SIGTERM', () => js.kill('SIGTERM'))
