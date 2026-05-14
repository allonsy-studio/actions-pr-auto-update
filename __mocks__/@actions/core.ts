import type * as core from "@actions/core";
import { jest } from "@jest/globals";

type InputMap = Record<string, string>;

let inputs: InputMap = {};

export function __setInputs(next: InputMap): void {
	inputs = next;
}

export function __resetInputs(): void {
	inputs = {};
}

export const getInput = jest.fn<typeof core.getInput>((name: string) => inputs[name] ?? "").mockName("core.getInput");

export const getBooleanInput = jest
	.fn<typeof core.getBooleanInput>((name: string) => {
		const value = (inputs[name] ?? "").toLowerCase();
		if (value === "true") return true;
		if (value === "false" || value === "") return false;
		throw new TypeError(`Input does not meet YAML 1.2 "Core Schema" specification: ${name}`);
	})
	.mockName("core.getBooleanInput");

export const debug = jest.fn<typeof core.debug>().mockName("core.debug");
export const info = jest.fn<typeof core.info>().mockName("core.info");
export const warning = jest.fn<typeof core.warning>().mockName("core.warning");
export const error = jest.fn<typeof core.error>().mockName("core.error");
export const setOutput = jest.fn<typeof core.setOutput>().mockName("core.setOutput");
export const setFailed = jest.fn<typeof core.setFailed>().mockName("core.setFailed");

const addHeading = jest.fn<typeof core.summary.addHeading>().mockName("core.summary.addHeading");
const addRaw = jest.fn<typeof core.summary.addRaw>().mockName("core.summary.addRaw");
const addList = jest.fn<typeof core.summary.addList>().mockName("core.summary.addList");
const write = jest.fn<typeof core.summary.write>().mockName("core.summary.write");

const summaryChain = { addHeading, addRaw, addList, write } as unknown as typeof core.summary;

addHeading.mockReturnValue(summaryChain);
addRaw.mockReturnValue(summaryChain);
addList.mockReturnValue(summaryChain);
write.mockResolvedValue(summaryChain);

export const summary = summaryChain;
