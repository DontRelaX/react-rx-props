import pkg from './package.json';
import babel from 'rollup-plugin-babel';

export default [
  {
    input: 'src/index.js',
    external: [
      'rxjs/BehaviorSubject',
      'rxjs/Subject',
      'react',
      'babel-runtime/core-js/object/values',
      'babel-runtime/core-js/object/keys',
      'babel-runtime/helpers/classCallCheck',
      'babel-runtime/helpers/possibleConstructorReturn',
      'babel-runtime/helpers/inherits',
      'babel-runtime/core-js/object/assign',
    ],
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: pkg.module,
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: [
      babel({
        exclude: ['node_modules/**'],
        runtimeHelpers: true,
      }),
    ],
  },
];
