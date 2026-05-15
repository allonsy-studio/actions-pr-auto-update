import type { context as Context } from "@actions/github";
import type { GitHub } from "@actions/github/lib/utils";

import * as core from "@actions/core";

type Octokit = InstanceType<typeof GitHub>;
type PullRequest = Awaited<ReturnType<Octokit["rest"]["pulls"]["list"]>>["data"][number];

const KNOWN_BOT_LOGINS = new Set(["dependabot[bot]"]);

function parseInput(name: string): string[] {
	const raw = core.getInput(name);
	if (!raw) return [];
	return raw
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
}

function getBaseBranch(context: typeof Context): string {
	const ref = context.payload?.ref;
	if (typeof ref === "string" && ref.startsWith("refs/heads/")) {
		return ref.slice("refs/heads/".length);
	}
	const defaultBranch = context.payload?.repository?.default_branch;
	return typeof defaultBranch === "string" && defaultBranch.length > 0 ? defaultBranch : "main";
}

function isBot(pr: PullRequest): boolean {
	if (pr.user?.type === "Bot") return true;
	return pr.user?.login != null && KNOWN_BOT_LOGINS.has(pr.user.login);
}

function describe(pr: PullRequest): string {
	return `#${pr.number} ${pr.title}`;
}

function report(updated: number, failed: number): void {
	core.setOutput("updated", updated);
	core.setOutput("failed", failed);
}

interface UpdateResult {
	pr: PullRequest;
	ok: boolean;
	message?: string;
}

/**
 * The main function for the action.
 * @param client - The GitHub client instance.
 * @param context - The context instance.
 */
export default async function run(client: Octokit, context: typeof Context): Promise<void> {
	// If the ref was deleted, no pull requests need updating.
	if (context.eventName === "delete") {
		core.info("The ref was deleted; no pull requests need updating.");
		report(0, 0);
		return;
	}

	const baseBranch = getBaseBranch(context);
	const rawLimit = core.getInput("limit");
	const limit = rawLimit ? Math.max(1, Number.parseInt(rawLimit, 10)) : 100;
	const includeDrafts = core.getBooleanInput("include_drafts");
	const allowLabels = parseInput("include_labels");
	const denyLabels = parseInput("exclude_labels");

	core.info(`Searching for open pull requests targeting ${baseBranch} (limit: ${limit}).`);

	const passesFilters = (pr: PullRequest): boolean => {
		if (isBot(pr)) {
			core.info(`Skipping ${describe(pr)}: bot pull request.`);
			return false;
		}
		if (!includeDrafts && pr.draft) {
			core.info(`Skipping ${describe(pr)}: draft.`);
			return false;
		}
		const labels = pr.labels.map((l) => l.name).filter((n): n is string => typeof n === "string");
		if (allowLabels.length > 0 && !labels.some((l) => allowLabels.includes(l))) {
			core.info(`Skipping ${describe(pr)}: missing required label (${allowLabels.join(", ")}).`);
			return false;
		}
		if (denyLabels.length > 0 && labels.some((l) => denyLabels.includes(l))) {
			core.info(`Skipping ${describe(pr)}: has excluded label (${denyLabels.join(", ")}).`);
			return false;
		}
		return true;
	};

	const toUpdate: PullRequest[] = [];
	const iterator = client.paginate.iterator(client.rest.pulls.list, {
		...context.repo,
		base: baseBranch,
		sort: "updated",
		direction: "desc",
		state: "open",
		per_page: 100,
	});
	outer: for await (const { data: page } of iterator) {
		for (const pr of page) {
			if (passesFilters(pr)) toUpdate.push(pr);
			if (toUpdate.length >= limit) break outer;
		}
	}

	if (toUpdate.length === 0) {
		core.info("No pull requests matched the configured filters.");
		report(0, 0);
		return;
	}

	core.info(`Updating ${toUpdate.length} pull request${toUpdate.length === 1 ? "" : "s"}.`);

	const results: UpdateResult[] = await Promise.all(
		toUpdate.map(async (pr): Promise<UpdateResult> => {
			try {
				const response = await client.rest.pulls.updateBranch({
					...context.repo,
					pull_number: pr.number,
					expected_head_sha: pr.head.sha,
				});
				// updateBranch returns 202 Accepted on success.
				const ok = response.status === 202;
				return { pr, ok, message: response.data?.message };
			} catch (err) {
				const message = err instanceof Error ? err.message : "Unknown error";
				return { pr, ok: false, message };
			}
		}),
	);

	results.sort((a, b) => a.pr.number - b.pr.number);

	const passed = results.filter((r) => r.ok);
	const failed = results.filter((r) => !r.ok);

	for (const r of results) {
		const status = r.ok ? "✅" : "❌";
		const detail = r.message ? ` — ${r.message}` : "";
		core.info(`${status} ${describe(r.pr)}${detail}`);
	}
	core.info(`Summary: ${passed.length} succeeded, ${failed.length} failed.`);

	if (process.env.GITHUB_STEP_SUMMARY) {
		await core.summary
			.addHeading("Auto-update pull requests", 2)
			.addRaw(`Attempted ${results.length} update${results.length === 1 ? "" : "s"} against \`${baseBranch}\`.`)
			.addList(
				results.map((r) => {
					const status = r.ok ? "✅" : "❌";
					const detail = r.message ? ` — ${r.message}` : "";
					return `${status} #${r.pr.number} ${r.pr.title}${detail}`;
				}),
			)
			.addRaw(`\n**${passed.length}** succeeded · **${failed.length}** failed`)
			.write();
	}

	core.setOutput("updated", passed.length);
	core.setOutput("failed", failed.length);

	if (failed.length > 0 && passed.length === 0) {
		core.setFailed(`All ${failed.length} pull request updates failed.`);
	}
}
