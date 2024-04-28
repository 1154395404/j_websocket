import { defineConfig } from 'rollup'

import packageJson from '../../package.json' assert { type: 'json' }
import terser from '@rollup/plugin-terser'
import del from 'rollup-plugin-delete'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import { resolve } from 'node:path'

console.log('🌶 bundle client rollup current mode: ', process.env.BUILD)
const outPath = {
  commonjs: resolve('../', '../', packageJson.exports['./client'].require),
  esm: resolve('../', '../', packageJson.exports['./client'].import),
  umd: resolve('../', '../', packageJson.exports['./client'].browser),
  dir: resolve('../', '../', packageJson.exports['./client'].dir),
}

const plugins = [
  terser(),
  nodeResolve({
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    mainFields: ['browser', 'module', 'main'],
  }),
  typescript({
    tsconfig: '../../tsconfig.json',
    declaration: true,
    declarationDir: outPath.dir,
  }),
  del({ targets: outPath.dir, verbose: true, force: true }),
]

export default defineConfig({
  input: 'lib/index.ts',
  plugins,
  output: [
    // commonjs
    {
      file: outPath.commonjs,
      format: 'commonjs',
    },
    // es module
    {
      file: outPath.esm,
      format: 'esm',
    },
    {
      file: outPath.umd,
      format: 'umd',
      name: 'J_Websocket',
    },
  ],
})
