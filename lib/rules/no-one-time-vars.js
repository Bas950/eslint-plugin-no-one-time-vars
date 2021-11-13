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
		docs: {
			description: "Disallows one-time variables",
			category: "Fill me in",
			recommended: false,
			url: null
		},
		fixable: null,
		schema: [],
		messages: {
			"used-once": "Variable '{{name}}' is only used once."
		}
	},
	create(context) {
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
						"Property"
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
				Object.entries(data).forEach(([name, value]) => {
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

				data = {};
			}
		};
	}
};
