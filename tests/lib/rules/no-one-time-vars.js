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
    },
    {
      code: `
            var testVar = 'once but ignored';
            console.log(testVar);
            `,
      options: [
        {
          ignoredVariables: ["testVar"]
        }
      ]
    },
    {
      code: `
            var testVar = Date.now();

            module.exports = {
              create: function() {
                  console.log(Date.now() - testVar);
              }
            }
            `,
      options: [
        {
          allowInsideCallback: true
        }
      ]
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
    },
    {
      code: `
            module.exports = {
              create: function() {
                var testVar = Date.now();

                console.log(Date.now() - testVar);
              }
            }
            `,
      options: [
        {
          allowInsideCallback: true
        }
      ],
      errors: [
        {
          message: "Variable 'testVar' is only used once.",
          type: "Identifier"
        }
      ]
    }
  ]
});
