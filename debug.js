const { readFileSync } = require('fs');
const { parser, generate } = require('./umd/my-babel.min');

const ast = parser.parse(readFileSync(__dirname + '/test.vx', 'utf8').trimRight(), {
  jsxTopLevel: true,
  plugins: [
    'jsx',
    'optionalChaining',
    ['decorators', { decoratorsBeforeExport: true }],
    'objectRestSpread',
    ['pipelineOperator', { proposal: 'minimal' }],
  ],
});

const out = generate(ast, {
  comments: false,
  // Should the output be minified
  minified: false,
});

console.log(out.code);

console.info(ast);
