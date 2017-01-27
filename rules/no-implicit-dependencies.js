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
          }
        },
        additionalProperties: false
      }
    ]
  },
  create: (context) => {
    return {
      'CallExpression:exit': (node) => {
        if (node.callee.name === 'require') {
          let moduleName;
          const name = node.arguments[0].value;

          // ignore dynamic arguments
          if (!name || typeof name !== 'string') {
            return;
          }

          if (name[0] !== '.' && name[0] !== '/') {
            // if module is a node core module then skip
            if (builtin[name]) {
              return;
            }
            // parse module name from scope packages and deep requires
            if (name[0] === '@') {
              moduleName = name.split('/').slice(0, 2).join('/');
            } else {
              moduleName = name.split('/')[0];
            }

            // find the nearest package.json
            const dir = path.dirname(context.getFilename());
            const jsonPath = path.join(findup.sync(dir, 'package.json'), 'package.json');
            const pkg = require(jsonPath);

            // check dependencies
            const opts = context.options[0] || {};
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
        }
      }
    };
  }
};
