import { jest } from "@jest/globals";
import type * as github from "@actions/github";

export const context: Partial<typeof github.context> = {
	eventName: "push",
	repo: { owner: "monalisa", repo: "helloworld" },
	payload: { ref: "refs/heads/main" },
};

export const getOctokit = jest.fn<typeof github.getOctokit>().mockName("github.getOctokit");
