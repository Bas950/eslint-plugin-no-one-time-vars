# eslint-plugin-no-one-time-vars

Disallows one-time variables

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm i eslint --save-dev
```

Next, install `eslint-plugin-no-one-time-vars`:

```sh
npm install eslint-plugin-no-one-time-vars --save-dev
```

## Usage

Add `no-one-time-vars` to the plugins section of your `.eslintrc` configuration
file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["no-one-time-vars"]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "no-one-time-vars/no-one-time-vars": "error"
  }
}
```

To add an option to the rule configuration do the following:

```json
{
  "rules": {
    "no-one-time-vars/no-one-time-vars": [
      "error",
      {
        "option-name": "option-value"
      }
    ]
  }
}
```

## Supported Rules

- no-one-time-vars

## Supported Options

- ignoredVariables
  - type: `Array of strings`
  - default: `[]`
- allowInsideCallback
  - type: `Boolean`
  - default: `true`
- ignoreFunctionVariables
  - type: `Boolean`
  - default: `true`
- ignoreArrayVariables
  - type: `Boolean`, `Number`
  - default: `false`
- ignoreObjectVariables
  - type: `Boolean`
  - default: `false`
- ignoreObjectDestructuring:
  - type: `Boolean`
  - default: `false`
- ignoreExportedVariables:
  - type: `Boolean`
  - default: `true`
- ignoreTemplateLiterals:
  - type: `Boolean`
  - default: `false`
