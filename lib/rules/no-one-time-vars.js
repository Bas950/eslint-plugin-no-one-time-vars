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
      allowInsideCallback: true,
      ...context.options[0]
    };

    const sourceCode = context.getSourceCode();
    const variables = {};
    const functions = [];

    /**
     * Add function node to the list of functions.
     * @param {import('eslint').Rule.Node} node
     * @returns {void}
     */

    function addFunction(node) {
      functions.push({
        start: node.loc.start.line,
        end: node.loc.end.line
      });
    }

    /**
     * Get the first parent node of the given node that has the given type.
     * @param {import('eslint').Rule.Node} node
     * @param {import('eslint').Rule.NodeTypes} type
     * @returns {import('eslint').Rule.Node|null}
     */

    function getFirstParent(node, type) {
      if (node?.parent?.type === type) return node?.parent;
      let parent = node?.parent;

      while (parent?.type !== type) {
        if (!parent?.parent) return null;
        parent = parent?.parent;
      }

      return parent;
    }

    /**
     * Get the last parent node of the given node that has the given type.
     * @param {import('eslint').Rule.Node} node
     * @param {import('eslint').Rule.NodeTypes} type
     * @returns {import('eslint').Rule.Node|null}
     */

    function getLastParent(node, type) {
      let parent = getFirstParent(node, type),
        prevParent;
      if (!parent) return null;

      while (parent !== null) {
        prevParent = parent;
        parent = getFirstParent(parent, type);
      }

      return prevParent;
    }

    /**
     * Check whether the given node is a an array or a object pattern.
     * @param {import('eslint').Rule.Node} node
     * @returns {boolean} Whether the node is array or object pattern.
     */

    function isArrayOrObjectPattern(node) {
      return (
        (node?.parent?.parent?.parent?.type === "VariableDeclarator" ||
          node?.parent?.parent?.type === "VariableDeclarator") &&
        (node?.parent?.parent?.type === "ObjectPattern" ||
          node?.parent?.type === "ArrayPattern")
      );
    }

    /**
     * Check whether the given node is a variable declarator.
     * @param {import('eslint').Rule.Node} node
     * @returns {boolean} Whether the node is a variable declarator.
     */

    function isVariableDeclarator(node) {
      return (
        node?.parent?.type === "VariableDeclarator" &&
        node?.parent?.id?.range[0] === node?.range[0]
      );
    }

    /**
     * Get the variable declaration node of the given node.
     * @param {import("eslint").Rule.Node} node
     * @returns {import("eslint").Rule.Node|null}
     */

    function getDeclarator(node) {
      return getFirstParent(node, "VariableDeclarator");
    }

    /**
     * Get the start line of the given node's block statement.
     * @param {import('eslint').Rule.Node} node
     * @returns The start line of the node's block statement.
     */

    function getBlockStatementStartLine(node) {
      if (node.parent.type === "IfStatement")
        return node.parent.consequent.loc.start.line;
      else return getFirstParent(node, "BlockStatement")?.loc?.start?.line;
    }

    /**
     * Get the start line of the given node's last statement.
     * @param {import('eslint').Rule.Node} node
     * @returns The start line of the node's last statement.
     */

    function getLastBlockStatementStartLine(node) {
      if (node.parent.type === "IfStatement")
        return node.parent.consequent.loc.start.line;
      else return getLastParent(node, "BlockStatement")?.loc?.start?.line;
    }

    /**
     * Check whether the given node is a function declaration.
     * @param {import('eslint').Rule.Node} node
     * @returns {boolean} Whether the node is a function node.
     */

    function isFunction(node) {
      return (
        node?.type === "FunctionDeclaration" ||
        node?.type === "FunctionExpression"
      );
    }

    /**
     * Check whether the given node is inside member expression and is property of the expression.
     * @param {import('eslint').Rule.Node} node
     * @returns {boolean} Whether the node is inside member expression.
     */

    function isInsideMemberExpression(node) {
      return node?.parent?.type === "MemberExpression" && isProperty(node);
    }

    /**
     * Check whether the given node is a property of the expression.
     * @param {{node: import("eslint").Rule.Node, callee: boolean}} node
     * @returns {boolean} Whether the node is a property of the expression.
     */

    function isProperty(node) {
      if (!node?.parent?.parent?.parent?.callee)
        return (
          node?.parent?.parent?.parent?.object?.property?.range[0] ===
          node?.range[0]
        );
      else
        return (
          node?.parent?.parent?.parent?.callee?.object?.property?.range[0] ===
          node?.range[0]
        );
    }

    /**
     * Check whether the given node is an object of the expression.
     * @param {{node: import("eslint").Rule.Node, callee: boolean}} node
     * @returns {boolean} Whether the node is an object of the expression.
     */

    function isObject(node) {
      if (node.parent.type !== "MemberExpression") return false;
      else return node.parent.object.range[0] === node.range[0];
    }

    return {
      Identifier(node) {
        if (isVariableDeclarator(node) || isArrayOrObjectPattern(node)) {
          if (isFunction(node.parent.init) && options.ignoreFunctionVariables)
            return;

          const statement = getBlockStatementStartLine(node);
          const varNode = getDeclarator(node);

          if (varNode?.init) {
            switch (varNode.init.type) {
              case "ArrayExpression": {
                if (varNode.init.elements.length >= 6) return;
                break;
              }

              case "ObjectExpression": {
                if (
                  varNode.init.properties.some(
                    (x) => sourceCode.getText(x).length >= 50
                  )
                )
                  return;
                break;
              }

              default: {
                if (sourceCode.getText(varNode.init).length >= 130) return;
                break;
              }
            }
          }

          if (isArrayOrObjectPattern(node)) {
            if (node.parent.properties?.length > 1) return;
            if (node.parent.elements?.filter((x) => x)?.length > 1) return;
          }

          if (variables[node.name]) {
            if (
              variables[node.name].scope &&
              variables[node.name].scope !==
                getLastBlockStatementStartLine(node)
            ) {
              variables[
                `${node.name}-${getLastBlockStatementStartLine(node)}`
              ] = {
                varNode: varNode,
                init: varNode.init,
                name: node.name,
                node: node,
                count: 0
              };
            }

            if (statement) {
              variables[`${node.name}-${statement}`] = {
                varNode: varNode,
                init: varNode.init,
                name: node.name,
                node: node,
                count: 0
              };
            }
          } else {
            variables[node.name] = {
              varNode: varNode,
              scope: getLastBlockStatementStartLine(node),
              init: varNode.init,
              name: node.name,
              node: node,
              count: 0
            };
          }
        } else if (
          variables[`${node.name}-${getLastBlockStatementStartLine(node)}`] ??
          variables[`${node.name}-${getBlockStatementStartLine(node)}`] ??
          variables[node.name]
        ) {
          if (isInsideMemberExpression(node)) return;
          if (node.parent.type === "Property") {
            if (
              node.parent.key.type == "Identifier" &&
              node.parent.value.type === "Identifier"
            ) {
              if (
                node.parent.key.range[0] === node.range[0] &&
                !node.parent.shorthand
              )
                return; // If the current node is the key of an object, we don't count it (we count the value instead)
              if (variables[node.name].node.range[0] === node.range[0]) return; // If the current node is already counted, we don't count it
            } else {
              if (
                node.parent.value.type === "Literal" &&
                node.parent.key.name === node.name
              )
                return; // If the current node is the key of an object and the value is literal, we don't count it, as it isn't a variable
            }
          }

          const key = `${node.name}-${getBlockStatementStartLine(node)}`,
            key2 = `${node.name}-${getLastBlockStatementStartLine(node)}`;

          if (variables[key]) {
            variables[key].count += 1;
            variables[key].node = node;
          } else if (variables[key2]) {
            variables[key2].count += 1;
            variables[key2].node = node;
          } else {
            variables[node.name].count += 1;
            variables[node.name].node = node;
          }
        }
      },
      FunctionExpression: addFunction,
      ArrowFunctionExpression: addFunction,
      "Program:exit"() {
        for (const value of Object.values(variables)) {
          if (
            options.allowInsideCallback &&
            functions.some(
              (func) =>
                // Make sure the variable is declared outside the callback.
                func.start >= value.varNode.loc.start.line &&
                // Make sure the variable is used inside the callback.
                func.start <= value.node.loc.start.line &&
                func.end >= value.node.loc.end.line
            )
          )
            continue; // If the variable is used inside a callback function, we skip it (If allowInsideCallback is on).
          if (options.ignoredVariables.includes(value.name)) continue;
          if (value.init?.type === "AwaitExpression") continue;
          if (
            [value.node.parent.type, value.varNode.parent.parent.type].some(
              (x) =>
                ["ForOfStatement", "ForInStatement", "ForStatement"].includes(x)
            )
          )
            continue; // If the variable is used or declared inside a for ... loop, we skip it.
          if (value.count === 1) {
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
                    const lastComma =
                      sourceCode.getTokenBefore(lastDeclaration);

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
                    const nextComma = sourceCode.getTokenAfter(value.varNode);

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
                      `: ${sourceCode.getText(value.init)}`
                    );
                  } else {
                    // Else if the property is a normal property, we replace the value of the property with the init value (of the variable).
                    yield fixer.replaceTextRange(
                      value.node.parent.value.range,
                      sourceCode.getText(value.init)
                    );
                  }
                } else if (value.varNode?.id?.type === "ObjectPattern") {
                  // If the variable is an object pattern (e.g. const { a, b } = c),
                  // we replace the variable with the init value (of the variable) and access the property with dot notation.

                  yield fixer.replaceTextRange(
                    value.node.range,
                    `${sourceCode.getText(value.init)}.${value.name}`
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
                    `${sourceCode.getText(value.init)}[${index}]`
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
                          `(${sourceCode.getText(value.init)})`
                        );
                      } else {
                        // Not an object of member expression. We replace the variable with the init value (of the variable).
                        yield fixer.replaceTextRange(
                          value.node.range,
                          sourceCode.getText(value.init)
                        );
                      }
                      break;

                    default:
                      // Fallback to replace the variable with the init value (of the variable).
                      yield fixer.replaceTextRange(
                        value.node.range,
                        value.init ? sourceCode.getText(value.init) : ""
                      );
                      break;
                  }
                }
              }
            });
          }
        }
      }
    };
  }
};
