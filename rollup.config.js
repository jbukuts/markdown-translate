import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: 'bin.js',
  output: {
    dir: 'output',
    format: 'cjs'
  },
  plugins: [commonjs(), json(), nodeResolve()]
};
