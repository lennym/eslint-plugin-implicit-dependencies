# eslint-plugin-implicit-dependencies

eslint plugin to detect implicit dependencies

Detects when a module has been 'require'd or 'import'ed that is not listed as a dependency in the project's package.json.

This helps prevent accidentally depending on a module that is present in node_modules as a result of being installed further down your dependency tree, but is not listed as an explicit dependency of your project.

## Usage

Add `implicit-dependencies` to the plugins section of your [ESLint configuration file](http://eslint.org/docs/user-guide/configuring#configuration-file-formats). You can omit the `eslint-plugin-` prefix:

```yaml
plugins:
  - implicit-dependencies
```

Then configure the plugin under the rules section.

```yaml
rules:
  - implicit-dependencies/no-implicit: error
```

## Options

By default `implicit-dependencies` will only look for dependencies in the `dependencies` section of your package.json. You can include dev, peer and optional dependencies by configuring the rule to include those sections as follows:


```yaml
rules:
  - implicit-dependencies/no-implicit:
    - error
    - dev: true
      peer: true
      optional: true
```

Or if configuring with javascript:

```javascript
rules: {
  'implicit-dependencies/no-implicit': [
    'error',
    { peer: true, dev: true, optional: true }
  ]
}
```

### Restricting packages

To only assert about missing dependecies on specific packages, add a regular expression to the `include` rule configuration. That way only packages that match the given regex will be evaluated.

For instance, to match packages like `@my_target_module/util`, you could configure as:

```yaml
rules:
  - implicit-dependencies/no-implicit:
    - error
    - include: /@my_target_module\/.+$/
```

Or if configuring with javascript:

```javascript
rules: {
  'implicit-dependencies/no-implicit': [
    'error',
    { include: /@my_target_module\/.+$/ }
  ]
}
```