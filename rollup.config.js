import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import alias from 'rollup-plugin-alias';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import inject from 'rollup-plugin-inject';
import globals from 'rollup-plugin-node-globals';
import { terser } from "rollup-plugin-terser";
import { readdirSync } from 'fs';
import { join } from 'path';

let babelVersion = require("./packages/babel-core/package.json").version;

function generateAlias() {
  const paths = readdirSync(join(__dirname, 'packages'));
  const moduleAlias = {};
  paths.forEach(mod => {
    if (mod === 'babel-parser') {
      moduleAlias['@babel/parser'] = join(__dirname, '../vx-ast-parser/src/index.js');
    } else if (mod.slice(0, 6) === 'babel-') {
      moduleAlias[`@babel/${mod.slice(6)}`] = join(__dirname, 'packages', mod, 'src/index.js');
    }
  });
  if (process.env.BUILD_TARGET === 'umd') {
    moduleAlias['debug'] = join(__dirname, 'packages/main/debug.js');
    moduleAlias['assert'] = join(__dirname, 'packages/main/assert.js');
    moduleAlias['path'] = join(__dirname, 'packages/main/path.js');
  }
  return moduleAlias;
}

let output = {
  file: 'lib/my-babel.js',
  format: 'cjs',
};
let plugins = [
  json(),
  alias(generateAlias()),
  resolve({
    browser: false,
    preferBuiltins: true,
    extensions: ['.js', '.jsx', '.json' ],
  }),
  replace({
    BABEL_VERSION: JSON.stringify(babelVersion),
    VERSION: JSON.stringify(babelVersion),
  }),
  babel({
    babelrc: false,
    comments: false,
    envName: "standalone",
    presets: [
      ["@babel/preset-env", {
        loose: true,
        modules: false,
        targets: {
          chrome: "66"
        }
      }]
    ],
    plugins: [
      "@babel/plugin-transform-flow-strip-types",
      [
        "@babel/plugin-proposal-class-properties",
        { loose: true }
      ],
      "@babel/plugin-proposal-export-namespace-from",
      "@babel/plugin-proposal-export-default-from",
      "@babel/plugin-proposal-numeric-separator",
      "babel-plugin-transform-charcodes",
    ]
  }),
  commonjs({
    sourceMap: false,
    ignoreGlobal: true,
    include: ['node_modules/**', 'packages/*/node_modules/**'],
  }),
];
if (process.env.BUILD_TARGET === 'umd') {
  output = [
    { file: 'umd/my-babel.js', name: 'MyBabel', format: 'umd' },
    // { file: 'umd/my-babel.min.js', name: 'MyBabel', format: 'umd' },
  ];
  plugins = [
    json(),
    alias(generateAlias()),
    resolve({
      browser: true,
      preferBuiltins: false,
      extensions: [ '-browser.js', '.js', '.jsx', '.json' ],
    }),
    replace({
      "global": 'window',
      "process.env.NODE_ENV": '"production"',
      "process.env.BABEL_ENV": '"production"',
      "process.env.DEBUG": 'false',
      "process.env.NODE_DEBUG": 'false',
      "Buffer.isBuffer": '() => false',
      "process.platform": '"browser"',
      "process.env": JSON.stringify({ NODE_ENV: "production" }),
      BABEL_VERSION: JSON.stringify(babelVersion),
      VERSION: JSON.stringify(babelVersion),
    }),
    babel({
      babelrc: false,
      comments: false,
      envName: "standalone",
      presets: [
        ["@babel/preset-env", {
          loose: true,
          modules: false,
          targets: {
            chrome: "66"
          }
        }]
      ],
      plugins: [
        "@babel/plugin-transform-flow-strip-types",
        [
          "@babel/plugin-proposal-class-properties",
          { loose: true }
        ],
        "@babel/plugin-proposal-export-namespace-from",
        "@babel/plugin-proposal-export-default-from",
        "@babel/plugin-proposal-numeric-separator",
        "babel-plugin-transform-charcodes",
      ]
    }),
    commonjs({
      sourceMap: false,
      ignoreGlobal: true,
      include: ['node_modules/**', 'packages/*/node_modules/**'],
    }),
    inject({
      'process.nextTick': ['process-es6', 'nextTick'],
    }),
    // FIXME: no effects
    terser({
      include: [/^.+\.min\.js$/],
      sourcemap: false,
      numWorkers: 4,
      mangle: true,
      compress: true,
      output: {
        comments: function(node, comment) {
          if (comment.type === "comment2") {
            // multiline comment
            return /@preserve|@license|@cc_on/i.test(comment.value);
          }
          return false;
        }
      }
    }),
  ];
}

export default {
  input: 'packages/main/index.js',
  output,
  plugins,
};
