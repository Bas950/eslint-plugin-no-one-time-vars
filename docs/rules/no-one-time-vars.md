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
<<<<<<< HEAD
<<<<<<< HEAD

### ignoredVariables

This option allows you to ignore specified variable names.

=======
- AllowInsideCallback

### ignoredVariables

This option allows you to ignore specified variable names.\
>>>>>>> 225b3f3 (parent e3fc276f666a92ec3b69eaeac579bf046e956147)
=======
- AllowInsideCallback

### ignoredVariables

This option allows you to ignore specified variable names.\
>>>>>>> c31171a (feat(no-one-time-vars): AllowInsideCallback option, Styling, CI)
Add the option to the rule:

```json
{
<<<<<<< HEAD
<<<<<<< HEAD
	"rules": {
		"no-one-time-vars/rule-name": [
			2,
			{
				"ignoredVariables": ["testVar"]
			}
		]
	}
=======
=======
>>>>>>> c31171a (feat(no-one-time-vars): AllowInsideCallback option, Styling, CI)
    "rules": {
        "no-one-time-vars/rule-name": [
            2,
            {
                "ignoredVariables": ["testVar"]
            }
        ]
    }
<<<<<<< HEAD
>>>>>>> 225b3f3 (parent e3fc276f666a92ec3b69eaeac579bf046e956147)
=======
>>>>>>> c31171a (feat(no-one-time-vars): AllowInsideCallback option, Styling, CI)
}
```

Examples of **correct** code for this rule:

```js
var testVar = "once";
console.log(testVar);
```
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> c31171a (feat(no-one-time-vars): AllowInsideCallback option, Styling, CI)

### AllowInsideCallback

This option allows you to use variables in the callback functions once.\
This option is enabled by default.

Examples of **correct** code for this rule:

```js
var testVar = Date.now();

test.on("ready", () => console.log(Date.now() - testVar))
```
<<<<<<< HEAD
>>>>>>> 225b3f3 (parent e3fc276f666a92ec3b69eaeac579bf046e956147)
=======
>>>>>>> c31171a (feat(no-one-time-vars): AllowInsideCallback option, Styling, CI)
