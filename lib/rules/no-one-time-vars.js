/**
 * @fileoverview Disallows one-time variables
 * @author Bas950 <me@bas950.com>
 */
"use strict";

/**
 *  @type {Array<{start: number, end: number}>}
 */
const functions = [];

/**
 *
 * @param {import("eslint").Rule.Node} node
 */
function addFunction(node) {
  functions.push({
    start: node.loc.start.line,
    end: node.loc.end.line
  });
}

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
      },
      data = {};

    return {
      Identifier(node) {
        if (node.parent.type === "VariableDeclarator") {
          data[node.name] = {
            node: node,
            count: 0
          };
        } else if (data[node.name]) {
          data[node.name].count += 1;
          data[node.name].node = node;
        }
      },
      FunctionExpression: addFunction,
      ArrowFunctionExpression: addFunction,
      "Program:exit"() {
        for (const [name, value] of Object.entries(data)) {
          if (
            options.allowInsideCallback &&
            functions.some(
              (f) =>
                f.start <= value.node.loc.start.line &&
                f.end >= value.node.loc.end.line
            )
          )
            continue;
          if (options.ignoredVariables.includes(name)) continue;
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

        functions.splice(0, functions.length);
      }
    };
  }
};
