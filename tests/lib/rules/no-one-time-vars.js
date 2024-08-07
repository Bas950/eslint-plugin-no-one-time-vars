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
    ecmaVersion: "latest",
    sourceType: "module"
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
        const {text: test} = {text: "ignored"};
        console.log(test);
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
      `
    },
    {
      code: `
        {
          const test = 'test';
          if (test) console.log(test);
        }
      `
    },
    {
      code: `
        const test = [];
        console.log(test);

        const test2 = {};
        console.log(test2);
      `,
      options: [
        {
          ignoreArrayVariables: true,
          ignoreObjectVariables: true
        }
      ]
    },
    {
      code: `
        const test = [1, 2];
        console.log(test);
      `,
      options: [
        {
          ignoreArrayVariables: 2
        }
      ]
    },
    {
      code: `
        const test = {};
        export default test;
      `
    },
    {
      code: `
        export const test = {};
        console.log(test);
      `,
      options: [
        {
          ignoreExportedVariables: true
        }
      ]
    },
    {
      code: `
        export const test = {},
          test2 = {};
        console.log(test, test2);
      `,
      options: [
        {
          ignoreExportedVariables: true
        }
      ]
    },
    {
      code: `
          const templateLiteral = "world";
          console.log(\`Hello \${templateLiteral}\`);
        `,
      output: `
          const templateLiteral = "world";
          console.log(\`Hello \${templateLiteral}\`);
        `,
      options: [
        {
          ignoreTemplateLiterals: true
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
        var {testVar: test} = {testVar: 'once'};
        console.log(test);
      `,
      output: `
        
        console.log({testVar: 'once'}.testVar);
      `,
      errors: [
        {
          message: "Variable 'test' is only used once.",
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
    },
    {
      code: `{
        const obj = {},
          path = 'test';
        
        if (path === "") {
          const title = 'test';
          if (true) {
            obj.state = title.substring(8);
          } else if (true) {
            obj.state = title.substring(9);
          } else {
            obj.state = title.substring(16);
          }
        } else if (path === "") {
          const title = 'test';
          obj.state = title.substring(21, title.length - 1);
        } else if (true) {
          const title = 'test';
          obj.state = title.substring(5);
        } else if (true) {
          const title = 'test';
          obj.state = title.substring(9);
        } else {
          const title = 'test';
          obj.state = title;
        }
      }`,
      output: `{
        const obj = {},
          path = 'test';
        
        if (path === "") {
          const title = 'test';
          if (true) {
            obj.state = title.substring(8);
          } else if (true) {
            obj.state = title.substring(9);
          } else {
            obj.state = title.substring(16);
          }
        } else if (path === "") {
          const title = 'test';
          obj.state = title.substring(21, title.length - 1);
        } else if (true) {
          
          obj.state = 'test'.substring(5);
        } else if (true) {
          
          obj.state = 'test'.substring(9);
        } else {
          
          obj.state = 'test';
        }
      }`,
      errors: [
        {
          message: "Variable 'title' is only used once.",
          type: "VariableDeclarator",
          line: 18
        },
        {
          message: "Variable 'title' is only used once.",
          type: "VariableDeclarator",
          line: 21
        },
        {
          message: "Variable 'title' is only used once.",
          type: "VariableDeclarator",
          line: 24
        }
      ]
    },
    {
      code: `
        {
          const test = 'test';
          console.log(test);
        }

        const test = () => 'test';
        test();
      `,
      output: `
        {
          
          console.log('test');
        }

        const test = () => 'test';
        test();
      `,
      errors: [
        {
          message: "Variable 'test' is only used once.",
          type: "VariableDeclarator"
        }
      ]
    },
    {
      code: `
        {
          if (true) {
            const [test] = ['test'];
            console.log(test);
          }
        }

        const test = () => 'test';
        test();
      `,
      output: `
        {
          if (true) {
            
            console.log(['test'][0]);
          }
        }

        const test = () => 'test';
        test();
      `,
      errors: [
        {
          message: "Variable 'test' is only used once.",
          type: "VariableDeclarator"
        }
      ]
    },
    {
      code: `
        if (true) {
          const [splitString] = "test".split("|");
          obj.state = splitString;
        } else if (true) {
          if (true) {
            const [splitString] = "test".split("|");
            obj.state = splitString;
          } else if (true) {
            if (true) {
              const [splitString] = "test".split("|");
              obj.state = splitString;
            } else if (true) {
              const [splitString] = "test".split("|");
              obj.state = splitString;
            } else {
              if (true) {
                const [splitString] = "test".split("|");
                obj.state = \`Test: \${splitString}\`;
              }
            }
          } else {
            switch ("test") {
              case "test": {
                if (true) {
                  const [splitString] = "test".split("|");
                  obj.details = \`Test: \${splitString}\`;
                }
                break;
              }
              case "test": {
                if (true) {
                  const [splitString] = "test".split("|");
                  obj.state = splitString;
                }
                break;
              }
              case "test": {
                if (true) {
                  const [splitString] = "test".split("|");
                  obj.state = splitString;
                }
                break;
              }
            }
          }
        }
      `,
      output: `
        if (true) {
          
          obj.state = "test".split("|")[0];
        } else if (true) {
          if (true) {
            
            obj.state = "test".split("|")[0];
          } else if (true) {
            if (true) {
              
              obj.state = "test".split("|")[0];
            } else if (true) {
              
              obj.state = "test".split("|")[0];
            } else {
              if (true) {
                
                obj.state = \`Test: \${"test".split("|")[0]}\`;
              }
            }
          } else {
            switch ("test") {
              case "test": {
                if (true) {
                  
                  obj.details = \`Test: \${"test".split("|")[0]}\`;
                }
                break;
              }
              case "test": {
                if (true) {
                  
                  obj.state = "test".split("|")[0];
                }
                break;
              }
              case "test": {
                if (true) {
                  
                  obj.state = "test".split("|")[0];
                }
                break;
              }
            }
          }
        }
      `,
      errors: [
        {
          message: "Variable 'splitString' is only used once.",
          type: "VariableDeclarator"
        },
        {
          message: "Variable 'splitString' is only used once.",
          type: "VariableDeclarator"
        },
        {
          message: "Variable 'splitString' is only used once.",
          type: "VariableDeclarator"
        },
        {
          message: "Variable 'splitString' is only used once.",
          type: "VariableDeclarator"
        },
        {
          message: "Variable 'splitString' is only used once.",
          type: "VariableDeclarator"
        },
        {
          message: "Variable 'splitString' is only used once.",
          type: "VariableDeclarator"
        },
        {
          message: "Variable 'splitString' is only used once.",
          type: "VariableDeclarator"
        },
        {
          message: "Variable 'splitString' is only used once.",
          type: "VariableDeclarator"
        }
      ]
    },
    {
      code: `
        var testVar;
        console.log(testVar);
      `,
      output: `
        
        console.log(undefined);
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
        (async () => {
          const path = window.location.pathname.split("/").slice(1);
          switch(path[0]) {
            case "true": {
              console.log(true);
              break;
            }
          }
        });
      `,
      output: `
        (async () => {
          
          switch(window.location.pathname.split("/").slice(1)[0]) {
            case "true": {
              console.log(true);
              break;
            }
          }
        });
      `,
      errors: [
        {
          message: "Variable 'path' is only used once.",
          type: "VariableDeclarator"
        }
      ]
    },
    {
      code: `
        const test = [1, 2];
        console.log(test);
      `,
      output: `
        
        console.log([1, 2]);
      `,
      options: [
        {
          ignoreArrayVariables: 3
        }
      ],
      errors: [
        {
          message: "Variable 'test' is only used once.",
          type: "VariableDeclarator"
        }
      ]
    },
    {
      code: `
        const test = {};
        export default test;
      `,
      output: `
        
        export default {};
      `,
      errors: [
        {
          message: "Variable 'test' is only used once.",
          type: "VariableDeclarator"
        }
      ],
      options: [
        {
          ignoreExportedVariables: false
        }
      ]
    },
    {
      code: `
          const [test] = [] || [];
          console.log(test);
        `,
      output: `
          
          console.log(([] || [])[0]);
        `,
      errors: [
        {
          message: "Variable 'test' is only used once.",
          type: "VariableDeclarator"
        }
      ]
    },
    {
      code: `
          const templateLiteral = "world";
          console.log(\`Hello \${templateLiteral}\`);
        `,
      output: `
          
          console.log(\`Hello \${"world"}\`);
        `,
      errors: [
        {
          message: "Variable 'templateLiteral' is only used once.",
          type: "VariableDeclarator"
        }
      ]
    },
    {
      code: `
          const world = "world";
          console.log("Hello" + world);
        `,
      output: `
          
          console.log("Hello" + "world");
        `,
      errors: [
        {
          message: "Variable 'world' is only used once.",
          type: "VariableDeclarator"
        }
      ]
    },
    {
      code: `
          const obj = { ob1: "obj", ob2: "obj" };
          export { obj };
        `,
      output: `
          
          export const obj = { ob1: "obj", ob2: "obj" };
        `,
      options: [
        {
          ignoreExportedVariables: false
        }
      ],
      errors: [
        {
          message: "Variable 'obj' is only used once.",
          type: "VariableDeclarator"
        }
      ]
    },
    {
      code: `
          const obj = { },
            obx = { };

          export { obj, obx };
        `,
      output: `
          const obj = { },
            obx = { };

          export { obj, obx };
        `,
      options: [
        {
          ignoreExportedVariables: false
        }
      ],
      errors: [
        {
          message: "Variable 'obj' is only used once.",
          type: "VariableDeclarator"
        },
        {
          message: "Variable 'obx' is only used once.",
          type: "VariableDeclarator"
        }
      ]
    },
    {
      code: `
          export function func() {
            const a = 1;
            console.log(a);
          }
        `,
      output: `
          export function func() {
            
            console.log(1);
          }
        `,
      errors: [
        {
          message: "Variable 'a' is only used once.",
          type: "VariableDeclarator"
        }
      ]
    },
    {
      code: `
          export const obj = {
            method() {
              const a = 1;
              console.log(a);
            },
          };
        `,
      output: `
          export const obj = {
            method() {
              
              console.log(1);
            },
          };
        `,
      errors: [
        {
          message: "Variable 'a' is only used once.",
          type: "VariableDeclarator"
        }
      ]
    }
  ]
});
