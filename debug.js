const { readFileSync } = require('fs');
const { parse, generate } = require('./lib/my-babel');

const ast = parse(readFileSync(__dirname + '/test.vx', 'utf8').trimRight(), {
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
