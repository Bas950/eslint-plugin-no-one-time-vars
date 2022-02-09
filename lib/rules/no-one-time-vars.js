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
     * Add a variable to the list of variables.
     * @param {import('eslint').Rule.Node} node
     * @param {{scope: number, name: string, noCheck: boolean}} params
     * @returns {void}
     */

    function addVariable(node, params = {}) {
      const varNode = getDeclarator(node);

      if (hasKey(node) && !params.noCheck) {
        const varScope = getLastBlockStatementStartLine(node);
        const scope = variables[node.name].scope;

        if (scope && scope !== varScope) {
          return addVariable(node, {
            name: `${node.name}-${varScope}`,
            noScope: true,
            noCheck: true
          });
        } else if (getBlockStatementStartLine(node)) {
          return addVariable(node, {
            name: `${node.name}-${getBlockStatementStartLine(node)}`,
            noScope: true,
            noCheck: true
          });
        }
      } else {
        const scope = getLastBlockStatementStartLine(node);

        variables[params.name ?? node.name] = {
          varNode: varNode,
          init: varNode?.init,
          name: node.name,
          scope: params.noScope ? null : scope,
          count: 0,
          node: node
        };
      }
    }

    /**
     * increase the usage count of a variable.
     * @param {import('eslint').Rule.Node} node
     * @param {string} [key]
     * @returns {void}
     */

    function increaseUsageCount(node, key) {
      if (!key && getKey(node)) return increaseUsageCount(node, getKey(node));

      variables[key ?? node.name].node = node;
      variables[key ?? node.name].count++;
    }

    /**
     * Get the key of a node.
     * @param {import('eslint').Rule.Node} node
     * @returns {string?}
     */

    function getKey(node) {
      const varNode = getFirstVariableDeclarator(node, node.name),
        key = `${node.name}-${getBlockStatementStartLine(varNode)}`,
        key2 = `${node.name}-${getLastBlockStatementStartLine(node)}`;

      switch (true) {
        case !!variables[key]:
          return key;
        case !!variables[key2]:
          return key2;
        default:
          return null;
      }
    }

    /**
     * Check if the variable is already in the list of variables.
     * @param {import('eslint').Rule.Node} node
     * @returns {boolean}
     */

    function hasKey(node) {
      return !!(getKey(node) || variables[node.name]);
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
        prevParent = null;

      if (!parent) return null;

      while (parent !== null) {
        prevParent = parent;
        parent = getFirstParent(parent, type);
      }

      return prevParent;
    }

    /**
     * Check whether the given node is array or object pattern.
     * @param {import('eslint').Rule.Node} node
     * @returns {boolean} Whether the node is array or object pattern.
     */

    function isArrayOrObjectPattern(node) {
      return isObjectPattern(node) || isArrayPattern(node);
    }

    /**
     * Check whether the given node is a object pattern.
     * @param {import('eslint').Rule.Node} node
     * @returns {boolean} Whether the node is object pattern.
     *
     * ```
     *  const {text} = { text: "Hi" };
     * ```
     */

    function isObjectPattern(node) {
      return (
        hasVariableDeclarator(node) &&
        node.parent.parent.type === "ObjectPattern"
      );
    }

    /**
     * Check whether the given node is an array pattern.
     * @param {import('eslint').Rule.Node} node
     * @returns {boolean} Whether the node is array pattern.
     *
     * ```
     *  const [text] = ["Hi"];
     * ```
     */

    function isArrayPattern(node) {
      return hasVariableDeclarator(node) && node.parent.type === "ArrayPattern";
    }

    /**
     * @param {import('eslint').Rule.Node} node
     */

    function hasVariableDeclarator(node) {
      return (
        node?.parent?.parent?.parent?.type === "VariableDeclarator" ||
        node?.parent?.parent?.type === "VariableDeclarator"
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
     * @returns {number?} The start line of the node's block statement.
     */

    function getBlockStatementStartLine(node) {
      if (!node?.parent) return null;

      if (node.parent.type === "IfStatement")
        return node.parent.consequent.loc.start.line;
      else return getFirstParent(node, "BlockStatement")?.loc?.start?.line;
    }

    /**
     * Get the start line of the given node's last statement.
     * @param {import('eslint').Rule.Node} node
     * @returns {number?} The start line of the node's last statement.
     */

    function getLastBlockStatementStartLine(node) {
      if (!node?.parent) return null;
      else return getLastParent(node, "BlockStatement")?.loc?.start?.line;
    }

    /**
     * Get the first variable declaration node that has the given name.
     * @param {import('eslint').Rule.Node} node
     * @param {string} name
     * @returns {import('eslint').Rule.Node?} the first variable declaration node that has the given name.
     */

    function getFirstVariableDeclarator(node, name) {
      let declarator = getDeclarator(node);

      while (declarator?.id?.name !== name) {
        if (!declarator) return null;
        declarator = getDeclarator(declarator);
      }

      return declarator;
    }

    /**
     * Check whether the given node is a function declaration.
     * @param {import('eslint').Rule.Node} node
     * @returns {boolean} Whether the node is a function node.
     */

    function isFunction(node) {
      return (
        node?.type === "FunctionExpression" ||
        node?.type === "ArrowFunctionExpression"
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
     * @param {import("eslint")} node
     * @returns {boolean} Whether the node is a property of the expression.
     */

    function isProperty(node) {
      if (node.parent.type !== "MemberExpression") return false;
      else return !node.parent.computed && node.parent.property.range[0] === node.range[0];
    }

    /**
     * Check whether the given node is an object of the expression.
     * @param {import("eslint").Rule.Node} node
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

          const varNode = getDeclarator(node);

          if (varNode?.init) {
            switch (varNode.init.type) {
              case "ArrayExpression": {
                if (varNode.init.elements.length >= 4) return;
                break;
              }

              case "ObjectExpression": {
                if (
                  varNode.init.properties.some(
                    (x) => sourceCode.getText(x).length >= 40
                  ) ||
                  varNode.init.properties.length >= 5
                )
                  return;
                break;
              }

              default: {
                if (sourceCode.getText(varNode.init).length >= 100) return;
                break;
              }
            }
          }

          if (options.ignoreObjectDestructuring && isObjectPattern(node))
            return;

          if (isObjectPattern(node) && node.parent.parent.properties.length > 1)
            return;
          
          if (isArrayPattern(node) && node.parent.elements.length > 1)
            return;

          addVariable(node);
        } else if (hasKey(node)) {
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

          increaseUsageCount(node);
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
          if (value.init?.expression?.type === "AwaitExpression") continue;
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
                      `: ${
                        value.init
                          ? sourceCode.getText(value.init)
                          : "undefined"
                      }`
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
                  switch (value.init.type) {
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
                        sourceCode.getText(value.init)
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
