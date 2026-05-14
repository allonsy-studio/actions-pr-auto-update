const isCI = !!process.env.CI;

/** @type {import('jest').Config} */
export default {
	clearMocks: true,
	moduleFileExtensions: ["js", "ts"],
	testEnvironment: "node",
	testMatch: ["**/*.test.ts"],
	transform: {
		"^.+\\.ts$": "ts-jest",
	},
	verbose: true,
	collectCoverageFrom: ["src/*.ts", "!src/*.test.ts", "!**/node_modules/**", "!**/vendor/**"],
	coverageDirectory: "./coverage",
	coverageReporters: isCI ? ["cobertura", "json"] : ["text", "text-summary"],
	coverageThreshold: {
		global: {
			branches: 80,
			functions: 80,
			lines: 80,
			statements: -10,
		},
	},
};
