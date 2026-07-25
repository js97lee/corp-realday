import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const netlifyCommand = process.platform === 'win32' ? 'netlify.cmd' : 'netlify'

console.log('로컬 API와 프론트엔드를 Netlify Dev로 시작합니다.')

const child = spawn(netlifyCommand, ['dev'], {
  cwd: projectRoot,
  env: process.env,
  stdio: 'inherit',
})

child.on('error', (error) => {
  if (error.code === 'ENOENT') {
    console.error('Netlify CLI가 없습니다. `npm install -g netlify-cli` 후 다시 실행해주세요.')
  } else {
    console.error('Netlify Dev 실행에 실패했습니다:', error)
  }
  process.exitCode = 1
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exitCode = code ?? 1
})
