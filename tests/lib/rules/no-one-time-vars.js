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

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: "latest"
  }
});

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
    },
    {
      code: `
        var testVar = function() {
          return 'once but ignored';
        }
        console.log(testVar());
      `,
      options: [
        {
          ignoreFunctionVariables: true
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
      output: `
        
        console.log('once');
      `,
      errors: [
        {
          message: "Variable 'testVar' is only used once.",
          type: "VariableDeclarator"
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
      output: `
        module.exports = {
          create: function() {
            
            console.log(Date.now() - Date.now());
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
          type: "VariableDeclarator"
        }
      ]
    },
    {
      code: `
        var testVar = 'once';
        console.log({
          testVar
        });
      `,
      output: `
        
        console.log({
          testVar: 'once'
        });
      `,
      errors: [
        {
          message: "Variable 'testVar' is only used once.",
          type: "VariableDeclarator"
        }
      ]
    },
    {
      code: `
        var [testVar] = ['once'];
        console.log(testVar);
      `,
      output: `
        var [testVar] = ['once'];
        console.log(testVar);
      `,
      errors: [
        {
          message: "Variable 'testVar' is only used once.",
          type: "VariableDeclarator"
        }
      ]
    }
  ]
});
