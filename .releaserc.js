/**
 * Handlebars partial for a single commit entry.
 *
 * Renders the subject line with an optional scope prefix and a commit link,
 * then appends the commit body as an indented paragraph when present. This
 * makes changelogs read as prose rather than bare commit subjects.
 *
 * The tilde (~) strips whitespace between Handlebars tags so the output
 * does not accumulate extra blank lines from the template itself.
 */
const commitPartial = `\
*{{#if scope}} **{{scope}}:**{{~/if}} \
{{~#if subject}}{{subject}}{{else}}{{header}}{{/if}} \
{{~#if @root.linkReferences}} ([{{shortHash}}]({{commitUrlFormat}})){{else}} {{shortHash}}{{/if}}
{{#if body}}

{{body}}

{{/if}}`;

/** @type {import('semantic-release').GlobalConfig} */
export default {
	branches: [{ name: "+([0-9])?(.{+([0-9]),x}).x", range: "1.x.x", channel: "v1" }, "main", { name: "beta", prerelease: true }, { name: "alpha", prerelease: true }],
	plugins: [
		[
			"@semantic-release/commit-analyzer",
			{
				preset: "conventionalcommits",
				releaseRules: [
					{ type: "feat", release: "minor" },
					{ type: "fix", release: "patch" },
					{ type: "perf", release: "patch" },
					{ type: "revert", release: "patch" },
					{ breaking: true, release: "major" },
				],
			},
		],
		[
			"@semantic-release/release-notes-generator",
			{
				preset: "conventionalcommits",
				presetConfig: {
					types: [
						{ type: "feat", section: "✨ Features", hidden: false },
						{ type: "fix", section: "🐛 Bug Fixes", hidden: false },
						{
							type: "perf",
							section: "⚡ Performance Improvements",
							hidden: false,
						},
						{
							type: "revert",
							section: "⏪ Reverts",
							hidden: false,
						},
						{
							type: "docs",
							section: "📚 Documentation",
							hidden: false,
						},
						{
							type: "refactor",
							section: "♻️ Refactoring",
							hidden: false,
						},
						{ type: "test", section: "✅ Tests", hidden: true },
						{
							type: "build",
							section: "📦 Build System",
							hidden: true,
						},
						{ type: "ci", section: "👷 CI", hidden: true },
						{
							type: "chore",
							section: "🔧 Maintenance",
							hidden: true,
						},
					],
				},
				writerOpts: { commitPartial },
			},
		],
		[
			"@semantic-release/changelog",
			{
				changelogFile: "CHANGELOG.md",
				changelogTitle: "# Changelog\n\nAll notable changes to this project will be documented in this file. See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.",
			},
		],
		"@semantic-release/npm",
		[
			"@semantic-release/github",
			{
				assets: [{ path: "CHANGELOG.md", label: "Changelog" }],
			},
		],
		[
			"@semantic-release/git",
			{
				assets: ["bin/index.js", "CHANGELOG.md", "README.md", "package.json", "yarn.lock"],
				message: "chore(release): <%= nextRelease.version %> [skip ci]\n\n<%= new Date().toLocaleDateString('en-GB', {year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }) %>\n<%= nextRelease.notes %>",
			},
		],
	],
};
