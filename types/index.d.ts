import * as types from './types';

export function transformFromAst(ast: types.File, code: string, options?: object): { code: string; ast: object };
export function transform(code: string, options?: object): { code: string; ast: object };

export type TraversalAncestors = ReadonlyArray<{
  node: types.Node,
  key: string,
  index?: number,
}>;
export type TraversalHandler<T> = (node: types.Node, parent: TraversalAncestors, type: T) => void;
export type TraversalHandlers<T> = {
  enter?: TraversalHandler<T>,
  exit?: TraversalHandler<T>,
};
export function traverse<T>(n: types.Node, h: TraversalHandler<T> | TraversalHandlers<T>, state?: T): void;

/**
 * Parse the provided code as an entire ECMAScript program.
 */
export function parse(input: string, options?: ParserOptions): types.File;

/**
 * Parse the provided code as a single expression.
 */
export function parseExpression(input: string, options?: ParserOptions): types.Expression;

export interface ParserOptions {
  jsxTopLevel?: boolean;

  /**
   * By default, import and export declarations can only appear at a program's top level.
   * Setting this option to true allows them anywhere where a statement is allowed.
   */
  allowImportExportEverywhere?: boolean;

  /**
   * By default, await use is not allowed outside of an async function.
   * Set this to true to accept such code.
   */
  allowAwaitOutsideFunction?: boolean;

  /**
   * By default, a return statement at the top level raises an error.
   * Set this to true to accept such code.
   */
  allowReturnOutsideFunction?: boolean;

  allowSuperOutsideMethod?: boolean;

  /**
   * Indicate the mode the code should be parsed in.
   * Can be one of "script", "module", or "unambiguous". Defaults to "script".
   * "unambiguous" will make @babel/parser attempt to guess, based on the presence
   * of ES6 import or export statements.
   * Files with ES6 imports and exports are considered "module" and are otherwise "script".
   */
  sourceType?: 'script' | 'module' | 'unambiguous';

  /**
   * Correlate output AST nodes with their source filename.
   * Useful when generating code and source maps from the ASTs of multiple input files.
   */
  sourceFilename?: string;

  /**
   * By default, the first line of code parsed is treated as line 1.
   * You can provide a line number to alternatively start with.
   * Useful for integration with other source tools.
   */
  startLine?: number;

  /**
   * Array containing the plugins that you want to enable.
   */
  plugins?: any[];

  /**
   * Should the parser work in strict mode.
   * Defaults to true if sourceType === 'module'. Otherwise, false.
   */
  strictMode?: boolean;

  /**
   * Adds a ranges property to each node: [node.start, node.end]
   */
  ranges?: boolean;

  /**
   * Adds all parsed tokens to a tokens property on the File node.
   */
  tokens?: boolean;
}

export { types };

export interface GenerateOptions {
  /**
   * Optional string to add as a block comment at the start of the output file
   */
  auxiliaryCommentBefore?: string;

  /**
   * Optional string to add as a block comment at the end of the output file
   */
  auxiliaryCommentAfter?: string;

  /**
   * Function that takes a comment (as a string) and returns true
   * if the comment should be included in the output. By default,
   * comments are included if opts.comments is true or if opts.minifed
   * is false and the comment contains @preserve or @license
   *
   * @default opts.comments
   */
  shouldPrintComment?: string;

  /**
   * Attempt to use the same line numbers in the output code as
   * in the source code (helps preserve stack traces)
   *
   * @default false
   */
  retainLines?: boolean;

  /**
   * Retain parens around function expressions
   * (could be used to change engine parsing behavior)
   *
   * @default false
   */
  retainFunctionParens?: boolean;

  /**
   * Should comments be included in output
   *
   * @default true
   */
  comments?: boolean;

  /**
   * Set to true to avoid adding whitespace for formatting
   *
   * @default opts.minified
   */
  compact?: boolean | 'auto';

  /**
   * Should the output be minified
   *
   * @default false
   */
  minified?: boolean;

  /**
   * Set to true to reduce whitespace (but not as much as opts.compact)
   *
   * @default false
   */
  concise?: boolean;

  /**
   * Used in warning messages
   */
  filename?: string;

  /**
   * Set to true to run jsesc with "json": true to print "\u00A9" vs. "©";
   * @default  false
   */
  jsonCompatibleStrings?: string;
  decoratorsBeforeExport?: boolean;
}

export function generate(ast: object, opts?: GenerateOptions): { code: string; map?: string };
export const NodePath: any;
export const Scope: any;
export const Hub: any;
export const template: any;
export const Context: any;
