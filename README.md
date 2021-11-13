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
		"no-one-time-vars/rule-name": 2
	}
}
```

To add an option to the rule configuration do the following:

```json
{
	"rules": {
		"no-one-time-vars/rule-name": [
			2,
			{
				"option-name": option
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
