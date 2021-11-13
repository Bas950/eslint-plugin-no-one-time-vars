/**
 * @fileoverview Disallows one-time variables
 * @author Bas950 <me@bas950.com>
 */
"use strict";

let data = {};

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
			...{
				ignoredVariables: []
			},
			...context.options[0]
		};

		return {
			Identifier(node) {
				if (
					[
						"VariableDeclarator",
						"AssignmentExpression",
						"MemberExpression",
						"CallExpression",
						"ArrayExpression",
						"AssignmentPattern",
						"Property",
						"IfStatement",
						"SwitchStatement",
						"ExpressionStatement"
					].includes(node.parent.type)
				) {
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
			"Program:exit"() {
				for (const [name, value] of Object.entries(data)) {
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

				data = {};
			}
		};
	}
};
