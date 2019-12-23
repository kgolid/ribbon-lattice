import pkg from './package.json';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default [
  {
    input: 'index.js',
    output: {
      name: 'isometric-automata',
      file: pkg.browser,
      format: 'umd'
    },
    plugins: [resolve(), commonjs()]
  },
  {
    input: 'index-reflect.js',
    output: {
      name: 'isometric-automata',
      file: pkg.reflect,
      format: 'umd'
    },
    plugins: [resolve(), commonjs()]
  }
];
