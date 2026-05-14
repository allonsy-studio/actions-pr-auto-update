import { build } from "esbuild";

await build({
	entryPoints: ["src/index.ts"],
	outfile: "bin/index.js",
	bundle: true,
	platform: "node",
	target: "node24",
	format: "esm",
	// Shim `require` so bundled CJS deps work inside an ESM output.
	banner: {
		js: "import{createRequire}from'module';const require=createRequire(import.meta.url);",
	},
});
