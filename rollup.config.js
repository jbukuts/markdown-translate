/* eslint-disable no-useless-escape */
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';

export default {
  input: {
    bin: 'bin.js',
    'src/worker': 'src/worker.js'
  },
  output: {
    dir: 'output',
    format: 'cjs'
  },
  plugins: [
    commonjs(),
    json(),
    nodeResolve({
      exportConditions: ['node'],
      preferBuiltins: true
    }),
    replace({
      "'./src/worker.js'": 'require.resolve("./src/worker.js")',
      delimiters: ['', ''],
      preventAssignment: true
    })
  ]
};
