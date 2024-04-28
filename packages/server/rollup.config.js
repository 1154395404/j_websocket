import { defineConfig } from 'rollup'

import packageJson from '../../package.json' assert { type: 'json' }
import terser from '@rollup/plugin-terser'
import del from 'rollup-plugin-delete'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import { resolve } from 'node:path'
import commonjs from '@rollup/plugin-commonjs';

console.log(process.env)
console.log('🌶 bundle server rollup current mode: ', process.env.BUILD)
const outPath = {
  commonjs: resolve('../', '../', packageJson.exports['./server'].require),
  esm: resolve('../', '../', packageJson.exports['./server'].import),
  dir: resolve('../', '../', packageJson.exports['./server'].dir),
}

const plugins = [
  terser(),
  commonjs(),
  nodeResolve({
    browser: false,
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    mainFields: ['module', 'main'],
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
  ],
})
