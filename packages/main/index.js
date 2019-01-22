/**
 * Entry point for @babel/standalone. This wraps Babel's API in a version that's
 * friendlier for use in web browers. It removes the automagical detection of
 * plugins, instead explicitly registering all the available plugins and
 * presets, and requiring custom ones to be registered through `registerPlugin`
 * and `registerPreset` respectively.
 */

/* global VERSION */
/* eslint-disable max-len */

import * as Babel from "@babel/core";

import externalhelpers from '@babel/plugin-external-helpers';
import syntaxclassproperties from '@babel/plugin-syntax-class-properties';
import syntaxobjectrestspread from '@babel/plugin-syntax-object-rest-spread';
import syntaxasyncgenerators from '@babel/plugin-syntax-async-generators';
import syntaxdecorators from '@babel/plugin-syntax-decorators';
import syntaxdoexpressions from '@babel/plugin-syntax-do-expressions';
import syntaxdynamicimport from '@babel/plugin-syntax-dynamic-import';
import syntaxexportdefaultfrom from '@babel/plugin-syntax-export-default-from';
import syntaxexportnamespacefrom from '@babel/plugin-syntax-export-namespace-from';
import syntaxfunctionbind from '@babel/plugin-syntax-function-bind';
import syntaxfunctionsent from '@babel/plugin-syntax-function-sent';
import syntaximportmeta from '@babel/plugin-syntax-import-meta';
import syntaxoptionalcatchbinding from '@babel/plugin-syntax-optional-catch-binding';
import syntaxpipelineoperator from '@babel/plugin-syntax-pipeline-operator';
import syntaxjsx from '@babel/plugin-syntax-jsx';
import syntaxtypescript from '@babel/plugin-syntax-typescript';
import proposalasyncgeneratorfunctions from '@babel/plugin-proposal-async-generator-functions';
import proposalclassproperties from '@babel/plugin-proposal-class-properties';
import proposaldecorators from '@babel/plugin-proposal-decorators';
import proposaldoexpressions from '@babel/plugin-proposal-do-expressions';
import proposalexportdefaultfrom from '@babel/plugin-proposal-export-default-from';
import proposalexportnamespacefrom from '@babel/plugin-proposal-export-namespace-from';
import proposalpipelineoperator from '@babel/plugin-proposal-pipeline-operator';
import proposalprivatemethods from '@babel/plugin-proposal-private-methods';
import transformmodulescommonjs from '@babel/plugin-transform-modules-commonjs';
import transformmemberexpressionliterals from '@babel/plugin-transform-member-expression-literals';
import transformpropertyliterals from '@babel/plugin-transform-property-literals';
import transformpropertymutators from '@babel/plugin-transform-property-mutators';
import proposalfunctionbind from '@babel/plugin-proposal-function-bind';
import transformnewtarget from '@babel/plugin-transform-new-target';
import transformobjectassign from '@babel/plugin-transform-object-assign';
import transformobjectsetprototypeoftoassign from '@babel/plugin-transform-object-set-prototype-of-to-assign';
import proposaloptionalcatchbinding from '@babel/plugin-proposal-optional-catch-binding';
import transformprototoassign from '@babel/plugin-transform-proto-to-assign';
import transformtypescript from '@babel/plugin-transform-typescript';
import transformreactconstantelements from '@babel/plugin-transform-react-constant-elements';
import transformreactdisplayname from '@babel/plugin-transform-react-display-name';
import transformreactinlineelements from '@babel/plugin-transform-react-inline-elements';
import transformreactjsx from '@babel/plugin-transform-react-jsx';
import transformreactjsxcompat from '@babel/plugin-transform-react-jsx-compat';
import transformreactjsxself from '@babel/plugin-transform-react-jsx-self';
import transformreactjsxsource from '@babel/plugin-transform-react-jsx-source';
import transformruntime from '@babel/plugin-transform-runtime';
import presetstage0 from './preset-stage-0';
import presetstage1 from './preset-stage-1';
import presetstage2 from './preset-stage-2';
import presetstage3 from './preset-stage-3';
import presetreact from '@babel/preset-react';
import presettypescript from '@babel/preset-typescript';
import { runScripts } from "./transformScriptTags";

const isArray =
  Array.isArray ||
  (arg => Object.prototype.toString.call(arg) === "[object Array]");

/**
 * Loads the given name (or [name, options] pair) from the given table object
 * holding the available presets or plugins.
 *
 * Returns undefined if the preset or plugin is not available; passes through
 * name unmodified if it (or the first element of the pair) is not a string.
 */
function loadBuiltin(builtinTable, name) {
  if (isArray(name) && typeof name[0] === "string") {
    if (builtinTable.hasOwnProperty(name[0])) {
      return [builtinTable[name[0]]].concat(name.slice(1));
    }
    return;
  } else if (typeof name === "string") {
    return builtinTable[name];
  }
  // Could be an actual preset/plugin module
  return name;
}

/**
 * Parses plugin names and presets from the specified options.
 */
function processOptions(options) {
  // Parse preset names
  const presets = (options.presets || []).map(presetName => {
    const preset = loadBuiltin(availablePresets, presetName);

    if (preset) {
      // workaround for babel issue
      // at some point, babel copies the preset, losing the non-enumerable
      // buildPreset key; convert it into an enumerable key.
      if (
        isArray(preset) &&
        typeof preset[0] === "object" &&
        preset[0].hasOwnProperty("buildPreset")
      ) {
        preset[0] = { ...preset[0], buildPreset: preset[0].buildPreset };
      }
    } else {
      throw new Error(
        `Invalid preset specified in Babel options: "${presetName}"`,
      );
    }
    return preset;
  });

  // Parse plugin names
  const plugins = (options.plugins || []).map(pluginName => {
    const plugin = loadBuiltin(availablePlugins, pluginName);

    if (!plugin) {
      throw new Error(
        `Invalid plugin specified in Babel options: "${pluginName}"`,
      );
    }
    return plugin;
  });

  return {
    babelrc: false,
    ...options,
    presets,
    plugins,
  };
}

export function transform(code, options) {
  return Babel.transform(code, processOptions(options));
}

export function transformFromAst(ast, code, options) {
  return Babel.transformFromAst(ast, code, processOptions(options));
}
export const availablePlugins = {};
export const availablePresets = {};
export const buildExternalHelpers = Babel.buildExternalHelpers;
/**
 * Registers a named plugin for use with Babel.
 */
export function registerPlugin(name, plugin) {
  if (availablePlugins.hasOwnProperty(name)) {
    console.warn(
      `A plugin named "${name}" is already registered, it will be overridden`,
    );
  }
  availablePlugins[name] = plugin;
}
/**
 * Registers multiple plugins for use with Babel. `newPlugins` should be an object where the key
 * is the name of the plugin, and the value is the plugin itself.
 */
export function registerPlugins(newPlugins) {
  Object.keys(newPlugins).forEach(name =>
    registerPlugin(name, newPlugins[name]),
  );
}

/**
 * Registers a named preset for use with Babel.
 */
export function registerPreset(name, preset) {
  if (availablePresets.hasOwnProperty(name)) {
    console.warn(
      `A preset named "${name}" is already registered, it will be overridden`,
    );
  }
  availablePresets[name] = preset;
}
/**
 * Registers multiple presets for use with Babel. `newPresets` should be an object where the key
 * is the name of the preset, and the value is the preset itself.
 */
export function registerPresets(newPresets) {
  Object.keys(newPresets).forEach(name =>
    registerPreset(name, newPresets[name]),
  );
}

// All the plugins we should bundle
// Want to get rid of this long whitelist of plugins?
// Wait! Please read https://github.com/babel/babel/pull/6177 first.
registerPlugins({
  "external-helpers": externalhelpers,
  "syntax-class-properties": syntaxclassproperties,
  "syntax-object-rest-spread": syntaxobjectrestspread,
  "syntax-async-generators": syntaxasyncgenerators,
  "syntax-decorators": syntaxdecorators,
  "syntax-do-expressions": syntaxdoexpressions,
  "syntax-dynamic-import": syntaxdynamicimport,
  "syntax-export-default-from": syntaxexportdefaultfrom,
  "syntax-export-namespace-from": syntaxexportnamespacefrom,
  "syntax-function-bind": syntaxfunctionbind,
  "syntax-function-sent": syntaxfunctionsent,
  "syntax-import-meta": syntaximportmeta,
  "syntax-optional-catch-binding": syntaxoptionalcatchbinding,
  "syntax-pipeline-operator": syntaxpipelineoperator,
  "syntax-jsx": syntaxjsx,
  "syntax-typescript": syntaxtypescript,

  "proposal-async-generator-functions": proposalasyncgeneratorfunctions,
  "proposal-class-properties": proposalclassproperties,
  "proposal-decorators": proposaldecorators,
  "proposal-do-expressions": proposaldoexpressions,
  "proposal-export-default-from": proposalexportdefaultfrom,
  "proposal-export-namespace-from": proposalexportnamespacefrom,
  "proposal-pipeline-operator": proposalpipelineoperator,
  "proposal-private-methods": proposalprivatemethods,
  "transform-modules-commonjs": transformmodulescommonjs,
  "transform-member-expression-literals": transformmemberexpressionliterals,
  "transform-property-literals": transformpropertyliterals,
  "transform-property-mutators": transformpropertymutators,
  "proposal-function-bind": proposalfunctionbind,
  "transform-new-target": transformnewtarget,
  "transform-object-assign": transformobjectassign,
  "transform-object-set-prototype-of-to-assign": transformobjectsetprototypeoftoassign,
  "proposal-optional-catch-binding": proposaloptionalcatchbinding,
  "transform-proto-to-assign": transformprototoassign,

  "transform-typescript": transformtypescript,
  "transform-react-constant-elements": transformreactconstantelements,
  "transform-react-display-name": transformreactdisplayname,
  "transform-react-inline-elements": transformreactinlineelements,
  "transform-react-jsx": transformreactjsx,
  "transform-react-jsx-compat": transformreactjsxcompat,
  "transform-react-jsx-self": transformreactjsxself,
  "transform-react-jsx-source": transformreactjsxsource,
  "transform-runtime": transformruntime,
});

// All the presets we should bundle
// Want to get rid of this whitelist of presets?
// Wait! Please read https://github.com/babel/babel/pull/6177 first.
registerPresets({
  "stage-0": presetstage0,
  "stage-1": presetstage1,
  "stage-2": presetstage2,
  "stage-3": presetstage3,
  react: presetreact,
  typescript: presettypescript,
});

export const version = VERSION;

/**
 * Transform <script> tags with "text/babel" type.
 * @param {Array} scriptTags specify script tags to transform, transform all in the <head> if not given
 */
export function transformScriptTags(scriptTags) {
  runScripts(transform, scriptTags);
}

export { Babel };
export * as parser from '@babel/parser';
export * as types from '@babel/types';
export generate from '@babel/generator';
export traverse from "@babel/traverse";
export template from "@babel/template";
