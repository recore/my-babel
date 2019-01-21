import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import alias from 'rollup-plugin-alias';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import ignore from 'rollup-plugin-ignore';
import inject from 'rollup-plugin-inject';
import globals from 'rollup-plugin-node-globals';
import { readdirSync } from 'fs';
import { join } from 'path';

let babelVersion = require("./packages/babel-core/package.json").version;

function generateAlias() {
  const paths = readdirSync(join(__dirname, 'packages'));
  const moduleAlias = {};
  paths.forEach(mod => {
    if (mod === 'babel-parser') {
      moduleAlias['@babel/parser'] = join(__dirname, 'packages', 'vx-ast-parser/src/index.js');
    } else if (mod.slice(0, 6) === 'babel-') {
      moduleAlias[`@babel/${mod.slice(6)}`] = join(__dirname, 'packages', mod, 'src/index.js');
    }
  });
  // moduleAlias['debug'] = join(__dirname, 'src/debug.js');
  return moduleAlias;
}

export default {
  input: 'src/index.js',
  output: {
    file: 'lib/babel.js',
    name: 'MyBabel',
    format: 'iife',
  },
  plugins: [
    ignore(['module', 'fs', 'net', 'path', 'buffer']),
    json(),
    alias(generateAlias()),
    resolve({
      browser: true,
      preferBuiltins: false,
      extensions: [ '-browser.js', '.js', '.jsx', '.json' ],
    }),
    commonjs({
      sourceMap: false,
      // ignoreGlobal: true,
      include: ['node_modules/**', 'packages/*/node_modules/**']
    }),
    replace({
      "process.env.NODE_ENV": '"production"',
      "process.env.BABEL_ENV": '"production"',
      "process.env.DEBUG": 'false',
      "process.env.NODE_DEBUG": 'false',
      "process.env": JSON.stringify({ NODE_ENV: "production" }),
      BABEL_VERSION: JSON.stringify(babelVersion),
      VERSION: JSON.stringify(babelVersion),
    }),
    babel({
      babelrc: false,
      comments: false,
      envName: "standalone",
      presets: [["@babel/preset-env", {
        loose: true,
        modules: false,
        targets: {
          chrome: "66"
        }
      }]],
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
    inject({
      'process.nextTick': ['process-es6', 'nextTick'],
    })
  ]
};
