const { readFileSync } = require('fs');
const { parser } = require('./dist/my-babel.min');

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

console.info(ast);
