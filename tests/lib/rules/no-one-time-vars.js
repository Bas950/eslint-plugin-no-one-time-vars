/**
 * @fileoverview Disallows one-time variables
 * @author Bas950 <me@bas950.com>
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/no-one-time-vars"),
  RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();
ruleTester.run("no-one-time-vars", rule, {
  valid: [
    {
      code: `
            var testVar = 'multiple times';
            console.log(testVar);
            console.log(testVar);
      `
    }
  ],
  invalid: [
    {
      code: `
             var testVar = 'once';
             console.log(testVar);
      `,
      errors: [
        {
          message: "Variable 'testVar' is only used once.",
          type: "Identifier"
        }
      ]
    }
  ]
});
