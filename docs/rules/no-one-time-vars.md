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

## Options
### allowInsideCallback
```yml
type: boolean
default: true
```

Allows variables to be used once insdide callback function.
#
**Example**: 
```js
var startedAt = Date.now();

that.on("ready", () => console.log(Date.now() - startedAt));
```

