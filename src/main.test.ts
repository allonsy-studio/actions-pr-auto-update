import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import * as coreModule from "@actions/core";
// eslint-disable-next-line jest/no-mocks-import -- type-only import to surface mock-only helper exports
import type * as coreMock from "../__mocks__/@actions/core";

import run from "./main";

jest.mock("@actions/core");

const core = coreModule as unknown as typeof coreMock;

type MockPR = {
	number: number;
	title?: string;
	draft?: boolean;
	user?: { login: string; type: string } | null;
	labels?: Array<{ name: string }>;
	head?: { sha: string };
};

const defaultUser = { login: "alice", type: "User" };

function pr(overrides: Partial<MockPR> & { number: number }): MockPR {
	return {
		title: `PR ${overrides.number}`,
		draft: false,
		user: defaultUser,
		labels: [],
		head: { sha: `sha-${overrides.number}` },
		...overrides,
	};
}

function makeContext(overrides: Record<string, unknown> = {}) {
	return {
		eventName: "push",
		repo: { owner: "monalisa", repo: "helloworld" },
		payload: { ref: "refs/heads/main" },
		...overrides,
	} as any;
}

function makeClient(
	opts: {
		pages?: MockPR[][];
		updateBranch?: ReturnType<typeof jest.fn>;
		getAuthenticated?: ReturnType<typeof jest.fn>;
	} = {},
) {
	const pages = opts.pages ?? [[]];
	const list = jest.fn<(...args: any[]) => any>();
	const iterator = jest.fn<(...args: any[]) => any>().mockImplementation(async function* () {
		for (const page of pages) {
			yield { data: page };
		}
	});
	return {
		rest: {
			users: {
				getAuthenticated: opts.getAuthenticated ?? jest.fn<(...args: any[]) => any>().mockResolvedValue({ data: { login: "bot" } }),
			},
			pulls: {
				list,
				updateBranch: opts.updateBranch ?? jest.fn<(...args: any[]) => any>().mockResolvedValue({ status: 202, data: {} }),
			},
		},
		paginate: { iterator },
	} as any;
}

function setInputs(map: Record<string, string>) {
	(core as any).__setInputs({
		limit: "100",
		include_drafts: "false",
		include_labels: "",
		exclude_labels: "",
		...map,
	});
}

beforeEach(() => {
	jest.clearAllMocks();
	(core as any).__resetInputs();
	setInputs({});
	delete process.env.GITHUB_STEP_SUMMARY;
});

describe("run", () => {
	describe("event handling", () => {
		it("returns early when the event is delete", async () => {
			const client = makeClient();
			await run(client, makeContext({ eventName: "delete" }));

			expect(client.rest.users.getAuthenticated).not.toHaveBeenCalled();
			expect(client.paginate.iterator).not.toHaveBeenCalled();
			expect(client.rest.pulls.updateBranch).not.toHaveBeenCalled();
			expect(core.setOutput).toHaveBeenCalledWith("updated", 0);
			expect(core.setOutput).toHaveBeenCalledWith("failed", 0);
		});
	});

	describe("authentication", () => {
		it("fails when authentication fails", async () => {
			const err = new Error("bad token");
			const client = makeClient({ getAuthenticated: jest.fn<(...args: any[]) => any>().mockRejectedValue(err) });

			await expect(run(client, makeContext())).rejects.toThrow("bad token");
			expect(core.setFailed).toHaveBeenCalledWith(expect.stringContaining("bad token"));
			expect(client.paginate.iterator).not.toHaveBeenCalled();
		});
	});

	describe("base branch resolution (getBaseBranch)", () => {
		it("uses payload.ref when present", async () => {
			const client = makeClient();
			await run(client, makeContext({ payload: { ref: "refs/heads/develop" } }));

			expect(client.paginate.iterator).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ base: "develop" }));
		});

		it("falls back to repository.default_branch when payload.ref is absent", async () => {
			const client = makeClient();
			await run(client, makeContext({ payload: { repository: { default_branch: "trunk" } } }));

			expect(client.paginate.iterator).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ base: "trunk" }));
		});

		it("defaults to main when nothing is provided", async () => {
			const client = makeClient();
			await run(client, makeContext({ payload: {} }));

			expect(client.paginate.iterator).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ base: "main" }));
		});
	});

	describe("filtering (passesFilters)", () => {
		it("reports zero work when no PRs match", async () => {
			const client = makeClient({ pages: [[]] });
			await run(client, makeContext());

			expect(client.rest.pulls.updateBranch).not.toHaveBeenCalled();
			expect(core.setOutput).toHaveBeenCalledWith("updated", 0);
			expect(core.setOutput).toHaveBeenCalledWith("failed", 0);
			expect(core.setFailed).not.toHaveBeenCalled();
		});

		it("skips drafts when include_drafts is false", async () => {
			setInputs({ include_drafts: "false" });
			const client = makeClient({
				pages: [[pr({ number: 1 }), pr({ number: 2, draft: true })]],
			});
			await run(client, makeContext());

			expect(client.rest.pulls.updateBranch).toHaveBeenCalledTimes(1);
			expect(client.rest.pulls.updateBranch).toHaveBeenCalledWith(expect.objectContaining({ pull_number: 1 }));
		});

		it("includes drafts when include_drafts is true", async () => {
			setInputs({ include_drafts: "true" });
			const client = makeClient({
				pages: [[pr({ number: 1 }), pr({ number: 2, draft: true })]],
			});
			await run(client, makeContext());

			expect(client.rest.pulls.updateBranch).toHaveBeenCalledTimes(2);
		});

		it("skips bot pull requests (by user.type and by known login)", async () => {
			const client = makeClient({
				pages: [[pr({ number: 1, user: { login: "octobot", type: "Bot" } }), pr({ number: 2, user: { login: "dependabot[bot]", type: "User" } }), pr({ number: 3 })]],
			});
			await run(client, makeContext());

			expect(client.rest.pulls.updateBranch).toHaveBeenCalledTimes(1);
			expect(client.rest.pulls.updateBranch).toHaveBeenCalledWith(expect.objectContaining({ pull_number: 3 }));
		});

		it("only updates PRs carrying an allowed include_label", async () => {
			setInputs({ include_labels: "ready, ship-it" });
			const client = makeClient({
				pages: [[pr({ number: 1, labels: [{ name: "ready" }] }), pr({ number: 2, labels: [{ name: "wip" }] }), pr({ number: 3, labels: [] })]],
			});
			await run(client, makeContext());

			expect(client.rest.pulls.updateBranch).toHaveBeenCalledTimes(1);
			expect(client.rest.pulls.updateBranch).toHaveBeenCalledWith(expect.objectContaining({ pull_number: 1 }));
		});

		it("skips PRs carrying any exclude_label", async () => {
			setInputs({ exclude_labels: "hold,blocked" });
			const client = makeClient({
				pages: [[pr({ number: 1, labels: [{ name: "hold" }] }), pr({ number: 2, labels: [{ name: "fine" }] })]],
			});
			await run(client, makeContext());

			expect(client.rest.pulls.updateBranch).toHaveBeenCalledTimes(1);
			expect(client.rest.pulls.updateBranch).toHaveBeenCalledWith(expect.objectContaining({ pull_number: 2 }));
		});
	});

	describe("pagination & limit", () => {
		it("honors the limit and stops paginating once reached", async () => {
			setInputs({ limit: "2" });
			const client = makeClient({
				pages: [
					[pr({ number: 1 }), pr({ number: 2 }), pr({ number: 3 })],
					[pr({ number: 4 }), pr({ number: 5 })],
				],
			});
			await run(client, makeContext());

			expect(client.rest.pulls.updateBranch).toHaveBeenCalledTimes(2);
		});

		it("iterates across multiple pages", async () => {
			const client = makeClient({
				pages: [[pr({ number: 1 })], [pr({ number: 2 })], [pr({ number: 3 })]],
			});
			await run(client, makeContext());

			expect(client.rest.pulls.updateBranch).toHaveBeenCalledTimes(3);
		});

		it("clamps a too-small limit to at least 1", async () => {
			setInputs({ limit: "0" });
			const client = makeClient({ pages: [[pr({ number: 1 }), pr({ number: 2 })]] });
			await run(client, makeContext());

			expect(client.rest.pulls.updateBranch).toHaveBeenCalledTimes(1);
		});
	});

	describe("update execution (updateBranch)", () => {
		it("updates all matching open pull requests on the happy path", async () => {
			const client = makeClient({ pages: [[pr({ number: 1 }), pr({ number: 2 })]] });
			await run(client, makeContext());

			expect(client.rest.pulls.updateBranch).toHaveBeenCalledTimes(2);
			expect(client.rest.pulls.updateBranch).toHaveBeenCalledWith({
				owner: "monalisa",
				repo: "helloworld",
				pull_number: 1,
				expected_head_sha: "sha-1",
			});
			expect(client.rest.pulls.updateBranch).toHaveBeenCalledWith({
				owner: "monalisa",
				repo: "helloworld",
				pull_number: 2,
				expected_head_sha: "sha-2",
			});
			expect(core.setOutput).toHaveBeenCalledWith("updated", 2);
			expect(core.setOutput).toHaveBeenCalledWith("failed", 0);
			expect(core.setFailed).not.toHaveBeenCalled();
		});

		it("reports partial failure without calling setFailed", async () => {
			const updateBranch = jest.fn<(...args: any[]) => any>().mockResolvedValueOnce({ status: 202, data: {} }).mockRejectedValueOnce(new Error("merge conflict"));
			const client = makeClient({
				pages: [[pr({ number: 1 }), pr({ number: 2 })]],
				updateBranch,
			});
			await run(client, makeContext());

			expect(core.setOutput).toHaveBeenCalledWith("updated", 1);
			expect(core.setOutput).toHaveBeenCalledWith("failed", 1);
			expect(core.setFailed).not.toHaveBeenCalled();
		});

		it("calls setFailed when every update fails", async () => {
			const updateBranch = jest.fn<(...args: any[]) => any>().mockRejectedValue(new Error("nope"));
			const client = makeClient({
				pages: [[pr({ number: 1 }), pr({ number: 2 })]],
				updateBranch,
			});
			await run(client, makeContext());

			expect(core.setOutput).toHaveBeenCalledWith("updated", 0);
			expect(core.setOutput).toHaveBeenCalledWith("failed", 2);
			expect(core.setFailed).toHaveBeenCalledWith(expect.stringContaining("All 2"));
		});

		it("treats non-202 responses as failure", async () => {
			const updateBranch = jest.fn<(...args: any[]) => any>().mockResolvedValue({ status: 422, data: { message: "stale" } });
			const client = makeClient({
				pages: [[pr({ number: 1 })]],
				updateBranch,
			});
			await run(client, makeContext());

			expect(core.setOutput).toHaveBeenCalledWith("updated", 0);
			expect(core.setOutput).toHaveBeenCalledWith("failed", 1);
			expect(core.setFailed).toHaveBeenCalledWith(expect.stringContaining("All 1"));
		});
	});

	describe("step summary", () => {
		it("writes a step summary when GITHUB_STEP_SUMMARY is set", async () => {
			process.env.GITHUB_STEP_SUMMARY = "/tmp/summary";
			const client = makeClient({ pages: [[pr({ number: 1 })]] });
			await run(client, makeContext());

			expect(core.summary.addHeading).toHaveBeenCalled();
			expect(core.summary.write).toHaveBeenCalled();
		});

		it("skips the step summary when GITHUB_STEP_SUMMARY is unset", async () => {
			delete process.env.GITHUB_STEP_SUMMARY;
			const client = makeClient({ pages: [[pr({ number: 1 })]] });
			await run(client, makeContext());

			expect(core.summary.write).not.toHaveBeenCalled();
		});
	});
});
