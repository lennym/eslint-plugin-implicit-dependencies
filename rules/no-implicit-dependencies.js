'use strict';

const path = require('path');
const findup = require('findup');
const builtin = require('builtin-modules').reduce((map, key) => {
  map[key] = true;
  return map;
}, {});

module.exports = {
  meta: {
    schema: [
      {
        type: 'object',
        properties: {
          optional: {
            type: 'boolean'
          },
          peer: {
            type: 'boolean'
          },
          dev: {
            type: 'boolean'
          },

          ignore: {
            type: 'array',
            items: {
              type: 'string'
            },
          },
        },
        additionalProperties: false
      }
    ]
  },
  create: (context) => {
    const opts = context.options[0] || {};

    // find the nearest package.json
    const dir = path.dirname(context.getFilename());
    const jsonPath = path.join(findup.sync(dir, 'package.json'), 'package.json');
    const pkg = require(jsonPath);

    const checkModuleName = (name, node) => {
      let moduleName;

      // ignore dynamic arguments
      if (!name || typeof name !== 'string') {
        return;
      }

      if (name[0] !== '.' && name[0] !== '/') {
        // parse module name from scope packages and deep requires
        if (name[0] === '@') {
          moduleName = name.split('/').slice(0, 2).join('/');
        } else {
          moduleName = name.split('/')[0];
        }
        // if module is a node core module then skip
        if (builtin[moduleName]) {
          return;
        }

        // skip modules that are explicitly ignored in the rule's options
        if (opts.ignore && opts.ignore.includes(moduleName)) {
          return;
        }

        // check dependencies
        if (pkg.dependencies && pkg.dependencies[moduleName]) {
          return;
        } else if (pkg.optionalDependencies && pkg.optionalDependencies[moduleName] && opts.optional) {
          return;
        } else if (pkg.peerDependencies && pkg.peerDependencies[moduleName] && opts.peer) {
          return;
        } else if (pkg.devDependencies && pkg.devDependencies[moduleName] && opts.dev) {
          return;
        } else {
          context.report({
            node,
            message: `Module "${moduleName}" is not listed as a dependency in package.json`
          });
        }
      }
    };
    return {
      'CallExpression:exit': (node) => {
        if (node.callee.name === 'require') {
          const name = node.arguments[0].value;
          checkModuleName(name, node);
        }
      },
      'ImportDeclaration:exit': (node) => {
        const name = node.source.value;
        checkModuleName(name, node);
      }
    };
  }
};
