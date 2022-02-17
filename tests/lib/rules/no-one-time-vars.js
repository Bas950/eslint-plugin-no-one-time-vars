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
    },
    {
      code: `
        if (true) {
          const testVar = () => 'once';
          testVar();
        } else {
          const testVar = 0;
          if (testVar) {
            console.log(testVar);
          }
        }
      `
    },
    {
      code: `
        function createPromise() {
          return new Promise((resolve) => resolve(1));
        }

        async function test() {
          const testVar = await createPromise();
          console.log(testVar);
        }
      `
    },
    {
      code: `
        const {text} = {text: "ignored"};
        console.log(text);
      `,
      options: [
        {
          ignoreObjectDestructuring: true
        }
      ]
    },
    {
      code: `
        const {text, test} = {text: "ignored", test: null};

        console.log(text, test);
      `,
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
        
        console.log(['once'][0]);
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
        var [,testVar] = [1,2];
        console.log(testVar);
      `,
      output: `
        
        console.log([1,2][1]);
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
        var {testVar} = {testVar: 'once'};
        console.log(testVar);
      `,
      output: `
        
        console.log({testVar: 'once'}.testVar);
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
        function test() {
          const testVar = 'once';
          console.log(testVar);
        }

        function test2() {
          const testVar = 'once';
          if (testVar) {
            console.log(testVar);
          }
        }
      `,
      output: `
        function test() {
          
          console.log('once');
        }

        function test2() {
          const testVar = 'once';
          if (testVar) {
            console.log(testVar);
          }
        }
      `,
      errors: [
        {
          message: "Variable 'testVar' is only used once.",
          type: "VariableDeclarator",
          line: 3
        }
      ]
    }
  ]
});
