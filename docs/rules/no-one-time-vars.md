# Disallows one-time variables (no-one-time-vars)

## Rule Details

This rule aims to remove "useless" variables by disallowing one-time variables.

Examples of **incorrect** code for this rule:

```js
const testVar = "once";
console.log(testVar);
```

Examples of **correct** code for this rule:

```js
const testVar = "multiple times";
console.log(testVar);
// Do other stuff...
console.log(testVar);
```

## Rule Options

- allowInsideCallback
- allowedVariableLength
- ignoredVariables
- ignoreFunctionVariables
- ignoreArrayVariables
- ignoreObjectVariables
- ignoreObjectDestructuring
- ignoreExportedVariables
- ignoreTemplateLiterals

### allowInsideCallback

This option allows you to use variables in the callback functions.\
This option is enabled by default.

Examples of **correct** code for this rule:

```js
const testVar = Date.now();

test.on("ready", () => console.log(Date.now() - testVar));
```

### allowedVariableLength

If the length of the variable value stringified code is longer than or equal to this value, it will be ignored.
This option default value is 100


### ignoredVariables

This option allows you to ignore specified variable names.\
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
const testVar = "once";
console.log(testVar);
```

### ignoreFunctionVariables

This option allows you to use the function variables.\
This option is enabled by default.

Examples of **correct** code for this rule:

```js
const testVar = function () {
  return "once";
};
console.log(testVar());
```

### ignoreArrayVariables

This option allows you to use array variables.\
If number is specified this option will allow array variables with length that is >=
specified value.

### ignoreObjectVariables

This option allows you to use objects variables.

### ignoreObjectDestructuring

This option allows you to use object destructuring variables.

Examples of **correct** code for this rule:

```js
const { test } = { test: "hi" };
console.log(test);
```

### ignoreExportedVariables

This option allows you to export the variables.\
This option is enabled by default.

Examples of **correct** code for this rule:

```js
const test = {};
export default test;
```

### ignoreTemplateLiterals

This option allows variables used in template literals to be used once without being flagged.