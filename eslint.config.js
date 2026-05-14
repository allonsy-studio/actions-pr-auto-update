import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import ts from "typescript-eslint";
import jest from "eslint-plugin-jest";
import jsonc from "eslint-plugin-jsonc";
import * as jsoncParser from "jsonc-eslint-parser";

export default defineConfig([
	{
		ignores: ["**/node_modules/**", ".yarn/**", ".cache/**", "bin/**"],
	},
	// ───────── TypeScript ─────────
	...ts.configs.recommended.map((config) => ({
		...config,
		files: ["**/*.ts"],
	})),
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
		...jest.configs["flat/recommended"],
		files: ["**/*.test.js", "**/*.test.ts"],
		languageOptions: {
			globals: {
				...globals.jest,
			},
		},
	},
	// ───────── Tests & mocks: allow `any` for fixture/cast helpers ─────────
	{
		files: ["**/*.test.ts", "__mocks__/**/*.ts"],
		rules: {
			"@typescript-eslint/no-explicit-any": "off",
		},
	},
	// ───────── JSON ─────────
	...jsonc.configs["recommended-with-json"].map((config) => ({
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
					order: ["$schema", "extends", "type", "properties", "items", "required", "minItems", "additionalProperties", "additionalItems"],
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
					order: ["$schema", "private", "publishConfig", "name", "version", "description", "license", "author", "maintainers", "contributors", "homepage", "funding", "repository", "bugs", "type", "exports", "main", "module", "browser", "man", "preferGlobal", "bin", "files", "directories", "scripts", "config", "sideEffects", "types", "typings", "workspaces", "resolutions", "dependencies", "bundleDependencies", "bundledDependencies", "peerDependencies", "peerDependenciesMeta", "optionalDependencies", "devDependencies", "keywords", "engines", "engineStrict", "os", "cpu", "*", "packageManager"],
				},
				{ pathPattern: "^repository$", order: ["type", "url", "directory"] },
				{ pathPattern: "^vague$", order: { type: "asc" } },
				{ pathPattern: "^exports$", order: ["."] },
				{ pathPattern: ".*", order: { type: "asc" } },
			],
		},
	},
]);
