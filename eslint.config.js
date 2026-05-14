import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import jest from "eslint-plugin-jest";
import jsonc from "eslint-plugin-jsonc";
import { defineConfig } from "eslint/config";
import globals from "globals";
import * as jsoncParser from "jsonc-eslint-parser";

export default defineConfig([
	{
		ignores: [
			"**/dist/**",
			"**/node_modules/**",
			".yarn/**",
			".cache/**",
			"bin/**",
		],
	},

	// ───────── TypeScript ─────────
	{
		...ts.configs.recommended,
		files: ["**/*.ts"],
	},

	// ───────── JavaScript ─────────
	{
		...js.configs.recommended,
		files: ["*.js"],
		languageOptions: {
			sourceType: "module",
			globals: {
				...globals.node,
			},
		},
	},
	{
		...jest.configs.recommended,
		files: ["**/*.test.js"],
		languageOptions: {
			globals: {
				...globals.jest,
			},
		},
	},

	// ───────── JSON / JSONC base ─────────
	// Start from the plugin's flat `recommended-with-jsonc` config so we get rule
	// defaults consistent with the legacy `plugin:jsonc/recommended-with-jsonc`.
	// Each preset block is re-scoped to **/*.json so it doesn't bleed onto .js files.
	...jsonc.configs["flat/recommended-with-jsonc"].map((config) => ({
		...config,
		files: ["**/*.json"],
	})),
	{
		files: ["**/*.json"],
		languageOptions: {
			parser: jsoncParser,
		},
		rules: {
			"jsonc/sort-keys": [
				"warn",
				{
					pathPattern: ".*",
					hasProperties: ["type"],
					order: [
						"$schema",
						"extends",
						"type",
						"properties",
						"items",
						"required",
						"minItems",
						"additionalProperties",
						"additionalItems",
					],
				},
				{
					pathPattern: ".*",
					order: { type: "asc" },
				},
			],
		},
	},

	// ───────── package.json ─────────
	{
		files: ["package.json"],
		rules: {
			"jsonc/sort-keys": [
				"warn",
				{
					pathPattern: "^$",
					order: [
						"$schema",
						"private",
						"name",
						"version",
						"description",
						"license",
						"author",
						"maintainers",
						"contributors",
						"homepage",
						"repository",
						"bugs",
						"type",
						"exports",
						"main",
						"module",
						"browser",
						"man",
						"preferGlobal",
						"bin",
						"files",
						"directories",
						"scripts",
						"config",
						"sideEffects",
						"types",
						"typings",
						"workspaces",
						"resolutions",
						"dependencies",
						"bundleDependencies",
						"bundledDependencies",
						"peerDependencies",
						"peerDependenciesMeta",
						"optionalDependencies",
						"devDependencies",
						"keywords",
						"engines",
						"engineStrict",
						"os",
						"cpu",
						"publishConfig",
					],
				},
				{ pathPattern: "^repository$", order: ["type", "url", "directory"] },
				{ pathPattern: "^vague$", order: { type: "asc" } },
				{ pathPattern: "^exports$", order: ["."] },
				{ pathPattern: ".*", order: { type: "asc" } },
			],
		},
	},
]);
