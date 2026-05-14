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
};
