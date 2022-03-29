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
    fixable: "code",
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
          ignoreFunctionVariables: {
            type: "boolean",
            description: "Ignores function variables",
            default: true
          },
          ignoreObjectDestructuring: {
            type: "boolean",
            description: "Ignores object destructuring",
            default: false
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
      ignoreFunctionVariables: true,
      ignoreObjectDestructuring: false,
      allowInsideCallback: true,
      ...context.options[0]
    };

    const code = context.getSourceCode();
    const variables = [];
    const functions = [];

    function isObject(node) {
      if (node.parent.type !== "MemberExpression") return false;
      else return node.parent.object.range[0] === node.range[0];
    }

    function collectOneTimeVariables(scope, a) {
      const wVariables = scope.variables.filter(
        (x) => x.defs[0]?.type === "Variable"
      );
      const childScope = scope.childScopes;

      for (const variable of wVariables) {
        const refs = variable.references.filter((x) => !x.init),
          { type, node } = variable.defs[0];

        if (
          options.ignoreFunctionVariables &&
          ["FunctionExpression", "ArrowFunctionExpression"].includes(
            node.init?.type
          )
        )
          continue;

        if (
          options.ignoreObjectDestructuring &&
          node.id.type === "ObjectPattern"
        )
          continue;

        if (node.init) {
          if (
            [node.init.expression?.type, node.init.type].includes(
              "AwaitExpression"
            )
          )
            continue;

          switch (node.init.type) {
            case "ArrayExpression": {
              if (node.init.elements.length >= 4) continue;
              break;
            }

            case "ObjectExpression": {
              if (
                node.init.properties.some((x) => code.getText(x).length >= 40)
              )
                continue;
              if (node.init.properties.length >= 5) continue;
              break;
            }

            default: {
              if (code.getText(node.init).length >= 100) continue;
              break;
            }
          }
        }

        switch (node.id.type) {
          case "ArrayPattern": {
            if (node.id.elements.filter(Boolean).length > 1) continue;
            break;
          }

          case "ObjectPattern": {
            if (node.id.properties.length > 1) continue;
            break;
          }
        }

        if (refs.length === 1) {
          variables.push({
            name: variable.name,
            node: refs[0].identifier,
            varNode: node,
            init: node.init
          });
        }
      }

      childScope.forEach((scope) => collectOneTimeVariables(scope, 0));
    }

    return {
      FunctionExpression: (node) => functions.push(node),
      ArrowFunctionExpression: (node) => functions.push(node),
      "Program:exit"() {
        collectOneTimeVariables(context.getScope());

        for (const value of Object.values(variables)) {
          if (options.ignoredVariables.includes(value.name)) continue;
          if (
            options.allowInsideCallback &&
            functions.some(
              (func) =>
                func.range[0] > value.varNode.range[0] &&
                func.range[0] < value.node.range[0] &&
                func.range[1] > value.node.range[1]
            )
          )
            continue;
          if (
            [value.node.parent.type, value.varNode.parent.parent.type].some(
              (x) =>
                ["ForOfStatement", "ForInStatement", "ForStatement"].includes(x)
            )
          )
            continue;

          context.report({
            node: value.varNode,
            messageId: "used-once",
            data: {
              name: value.name
            },
            *fix(fixer) {
              if (value.varNode.parent.declarations?.length > 1) {
                // If there are multiple declarations, remove the current one.
                const lastDeclaration =
                  value.varNode.parent.declarations[
                    value.varNode.parent.declarations.length - 1
                  ];

                if (lastDeclaration.range[1] === value.varNode.range[1]) {
                  // If the last declaration is the same as the current one.
                  const lastComma = code.getTokenBefore(lastDeclaration);

                  if (
                    lastComma?.type === "Punctuator" &&
                    lastComma?.value === ","
                  ) {
                    // Remove the previous comma.
                    yield fixer.remove(lastComma);
                  }

                  // Remove the variable declaration.
                  yield fixer.removeRange([
                    value.varNode.range[0],
                    value.varNode.range[1]
                  ]);
                } else {
                  const nextComma = code.getTokenAfter(value.varNode);

                  if (
                    nextComma?.type === "Punctuator" &&
                    nextComma?.value === ","
                  ) {
                    // Remove the comma after the variable declaration.
                    yield fixer.remove(nextComma);
                  }

                  // Remove the variable declaration.
                  yield fixer.removeRange([
                    value.varNode.range[0],
                    value.varNode.range[1]
                  ]);
                }
              } else {
                // Remove the variable declaration.
                yield fixer.removeRange([
                  value.varNode.parent.range[0],
                  value.varNode.parent.range[1]
                ]);
              }

              if (value.node.parent.type === "Property") {
                if (value.node.parent.shorthand) {
                  // If the property is a shorthand (e.g. const {a} = b),
                  // we make it a normal property use the init value (of the variable) as value of the property.
                  yield fixer.insertTextAfterRange(
                    value.node.parent.key.range,
                    `: ${value.init ? code.getText(value.init) : "undefined"}`
                  );
                } else {
                  // Else if the property is a normal property, we replace the value of the property with the init value (of the variable).
                  yield fixer.replaceTextRange(
                    value.node.parent.value.range,
                    code.getText(value.init)
                  );
                }
              } else if (value.varNode?.id?.type === "ObjectPattern") {
                // If the variable is an object pattern (e.g. const { a, b } = c),
                // we replace the variable with the init value (of the variable) and access the property with dot notation.
                const name = value.varNode.id.properties.find(
                  (x) => x.value.name === value.name
                ).key.name;

                yield fixer.replaceTextRange(
                  value.node.range,
                  `${code.getText(value.init)}.${name}`
                );
              } else if (value.varNode?.id?.type === "ArrayPattern") {
                // If the variable is an array pattern (e.g. const [a, b] = c),
                // we replace the variable with the init value (of the variable) and access the property with bracket notation.

                // Get the current index of the variable.
                const index = value.varNode.id.elements.findIndex(
                  (element) => element?.name === value.name
                );

                // Replace the variable with the init value (of the variable) and access the property with bracket notation.
                yield fixer.replaceTextRange(
                  value.node.range,
                  `${code.getText(value.init)}[${index}]`
                );
              } else {
                switch (value.init?.type) {
                  case "ConditionalExpression":
                  case "SequenceExpression":
                  case "LogicalExpression":
                  case "BinaryExpression":
                  case "UnaryExpression":
                  case "TSAsExpression":
                    if (isObject(value.node)) {
                      // If the variable is an object of member expression (e.g. a.b, a[b], a?.b, a?.[b]),
                      // we replace the variable with the init value (of the variable) and add brackets around it.
                      yield fixer.replaceTextRange(
                        value.node.range,
                        `(${code.getText(value.init)})`
                      );
                    } else {
                      // Not an object of member expression. We replace the variable with the init value (of the variable).
                      yield fixer.replaceTextRange(
                        value.node.range,
                        code.getText(value.init)
                      );
                    }
                    break;

                  default:
                    // Fallback to replace the variable with the init value (of the variable).
                    yield fixer.replaceTextRange(
                      value.node.range,
                      value.init ? code.getText(value.init) : "undefined"
                    );
                    break;
                }
              }
            }
          });
        }
      }
    };
  }
};
