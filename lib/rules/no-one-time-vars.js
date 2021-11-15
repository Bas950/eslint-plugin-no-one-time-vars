/**
 * @fileoverview Disallows one-time variables
 * @author Bas950 <me@bas950.com>
 */
"use strict";

/**
 * @type {import('eslint').Rule.RuleModule}
 */
module.exports = {
  meta: {
    type: "problem",
    fixable: null,
    schema: [
      {
        type: "object",
        properties: {
          ignoredVariables: {
            type: "array",
            description: "Variable names that should be ignored.",
            items: {
              type: "string",
              description: "Variable name."
            },
            default: []
          },
          allowInsideCallback: {
            type: "boolean",
            description:
              "Allows variables to be used once inside callback functions.",
            default: true
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      "used-once": "Variable '{{name}}' is only used once."
    }
  },
  create(context) {
    const options = {
      ignoredVariables: [],
      allowInsideCallback: true,
      ...context.options[0]
    };

    const variables = {};
    const functions = [];

    function addFunction(node) {
      functions.push({
        start: node.loc.start.line,
        end: node.loc.end.line
      });
    }

    return {
      Identifier(node) {
        if (node.parent.type === "VariableDeclarator") {
          variables[node.name] = {
            init: node.parent.init,
            varNode: node.parent,
            node: node,
            count: 0
          };
        } else if (variables[node.name]) {
          variables[node.name].count += 1;
          variables[node.name].node = node;
        }
      },
      FunctionExpression: addFunction,
      ArrowFunctionExpression: addFunction,
      "Program:exit"() {
        for (const [name, value] of Object.entries(variables)) {
          if (
            options.allowInsideCallback &&
            functions.some(
              (func) =>
                func.start >= value.varNode.loc.start.line &&
                func.start <= value.node.loc.start.line &&
                func.end >= value.node.loc.end.line
            )
          )
            continue;
          if (options.ignoredVariables.includes(name)) continue;
          if (value.init?.type === "AwaitExpression") continue;
          if (value.count === 1) {
            context.report({
              node: value.node,
              messageId: "used-once",
              data: {
                name
              }
            });
          }
        }
      }
    };
  }
};
