"use strict";

/**
 * @fileoverview Disallows one-time variables
 * @author Bas950 <me@bas950.com>
 */

const nodeTypes = [
  "AssignmentExpression",
  "ExpressionStatement",
  "VariableDeclarator",
  "AssignmentPattern",
  "LogicalExpression",
  "MemberExpression",
  "ArrayExpression",
  "SwitchStatement",
  "AwaitExpression",
  "CallExpression",
  "IfStatement",
  "Property"
];

const functions = [];

function addFunction(node) {
  functions.push({
    start: node.start,
    end: node.end
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
          allowInsideFunctions: {
            type: "boolean",
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
	const data = {};

    return {
      Identifier(node) {
        if (nodeTypes.includes(node.parent.type)) {
          if (node.parent.type === "VariableDeclarator") {
            if (!data[node.name]) {
              data[node.name] = {
                node: node,
                count: 0
              };
            }
          } else if (data[node.name]) data[node.name].count += 1;
        }
      },
      ArrowFunctionExpression: addFunction,
      FunctionExpression: addFunction,
      FunctionDeclaration: addFunction,
      "Program:exit"() {
        Object.entries(data).forEach(([name, value]) => {
          if ((context.options[0] || {allowInsideFunctions: true}).allowInsideFunctions) {
            functions.forEach((func) => {
              if (value.node.start >= func.start && value.node.end <= func.end)
                return;
            });
          }

          if (value.count === 1) {
            context.report({
              node: value.node,
              messageId: "used-once",
              data: {
                name
              }
            });
          }
        });
      }
    };
  }
};
