# Disallows one-time variables (no-one-time-vars)

Please describe the origin of the rule here.

## Rule Details

This rule aims to remove "useless" variables by disallowing one-time variables.

Examples of **incorrect** code for this rule:

```js
var testVar = "once";
console.log(testVar);
```

Examples of **correct** code for this rule:

```js
var testVar = "multiple times";
console.log(testVar);
// Do other stuff...
console.log(testVar);
```

## Rule Options

- ignoredVariables

### ignoredVariables

This option allows you to ignore specified variable names.

Add the option to the rule:

```json
{
	"rules": {
		"no-one-time-vars/rule-name": [
			2,
			{
				"ignoredVariables": ["testVar"]
			}
		]
	}
}
```

Examples of **correct** code for this rule:

```js
var testVar = "once";
console.log(testVar);
```
