# Auto-update pull requests

A configurable GitHub Action that keeps your open pull requests in sync with their base branch.

[![Build](https://github.com/castastrophe/actions-pr-auto-update/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/castastrophe/actions-pr-auto-update/actions/workflows/build.yml)
[![Testing](https://github.com/castastrophe/actions-pr-auto-update/actions/workflows/testing.yml/badge.svg?branch=main)](https://github.com/castastrophe/actions-pr-auto-update/actions/workflows/testing.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

When you merge to `main` (or push to any long-lived branch), every open PR targeting that branch falls behind. This action picks them up and runs GitHub's "Update branch" API on each one, so your contributors don't have to. Bot PRs (Dependabot et al.), closed PRs, and — by default — drafts are skipped. Label-based include/exclude rules let you scope it further.

This project was originally forked from [maxkomarychev/pr-updater-action](https://github.com/maxkomarychev/pr-updater-action) and has since diverged substantially — modernized tooling, broader filter support, output reporting, and a step summary.

## Quickstart

Drop this into `.github/workflows/pr-update.yml`:

```yaml
name: Pull request update

on:
    push:
        branches: [main]

jobs:
    autoupdate:
        runs-on: ubuntu-latest
        permissions:
            contents: read
            pull-requests: write
        steps:
            - uses: castastrophe/actions-pr-auto-update@v3
```

That's it. Defaults: 100 PRs/run, drafts skipped, no label filters, uses `github.token`.

## Full configuration

```yaml
name: Pull request update

on:
    push:
        branches: [main]

jobs:
    autoupdate:
        runs-on: ubuntu-latest
        permissions:
            contents: read
            pull-requests: write
        steps:
            - name: Update ALL THE PRS! 🎉
              uses: castastrophe/actions-pr-auto-update@v3
              with:
                  # Token used for API calls. Defaults to github.token.
                  # Override only if you need cross-repo access or a higher rate limit.
                  token: ${{ secrets.USER_TOKEN }}
                  # Cap on PRs to update per run (default: 100). Sorted by most-recently-updated.
                  limit: 10
                  # Include open drafts in the update set (default: false).
                  include_drafts: true
                  # Comma-separated. If set, at least one match is required to update a PR.
                  include_labels: "update,update me"
                  # Comma-separated. If set, any match causes a PR to be skipped.
                  exclude_labels: "do not update,skip update"
```

### Scheduled runs

You can also run on a cron schedule — useful if pushes to `main` are infrequent but PRs still drift:

```yaml
on:
    schedule:
        - cron: "0 */6 * * *" # every 6 hours
    workflow_dispatch: # also allow manual triggers from the UI
```

### Consuming outputs

```yaml
- id: pr-update
  uses: castastrophe/actions-pr-auto-update@v3

- name: Report results
  run: |
      echo "Updated ${{ steps.pr-update.outputs.updated }} PRs"
      echo "Failed ${{ steps.pr-update.outputs.failed }} PRs"
```

## Inputs

Defined in [`action.yml`](action.yml).

| Name             | Description                                                                                                                          | Default        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| `token`          | Token used to perform API calls. Requires `pull-requests:write` access.                                                              | `github.token` |
| `limit`          | Max number of pull requests to update per run. Pull requests are sorted by last updated date; the rest are deferred to the next run. | `100`          |
| `include_drafts` | Whether to include draft pull requests.                                                                                              | `false`        |
| `include_labels` | Comma-separated list of labels. If set, at least one **must** be present on the pull request for it to be updated.                   |                |
| `exclude_labels` | Comma-separated list of labels. If set, any match causes the pull request to be skipped.                                             |                |

Have ideas for additional features? [Open an issue](https://github.com/castastrophe/actions-pr-auto-update/issues/new).

## Outputs

| Name      | Description                                        |
| --------- | -------------------------------------------------- |
| `updated` | The number of pull requests that were updated.     |
| `failed`  | The number of pull requests that failed to update. |

## How it works

1. **List** open pull requests targeting the pushed branch, paginated (100/page), sorted by most recently updated.
2. **Filter** each PR: skip bots (Dependabot + any `user.type === "Bot"`), drafts (unless `include_drafts: true`), and label include/exclude rules.
3. **Update in parallel** — calls GitHub's [Update pull request branch](https://docs.github.com/en/rest/pulls/pulls#update-a-pull-request-branch) API for each survivor, passing `expected_head_sha` for safety against concurrent pushes.
4. **Report** outputs (`updated`, `failed`) and write a markdown step summary to the workflow run.
5. **Fail loud** if every update fails, but allow partial-failure runs to succeed (so one stale PR doesn't tank the rest).

## Versioning

This action follows [Semantic Versioning](https://semver.org). Major versions are exposed as floating tags (e.g. `v3`) so you can opt into all non-breaking updates with a single pin. Examples:

- `@v3` — latest 3.x.x (recommended for most users)
- `@v3.0.0` — exact version (recommended if you pin via digest or want zero-churn updates)

Breaking changes go in a new major. Minor and patch releases are documented in the [CHANGELOG](CHANGELOG.md).

## Limitations

GitHub's REST API is [rate-limited](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting) — typically 5,000 requests/hour for user tokens. Each PR update consumes one request; the listing call consumes one per 100 PRs. For most repos this is irrelevant, but `limit` exists to bound API spend on very large repos.

## Roadmap

- [ ] Optional rebase strategy instead of merge
- [ ] Skip PRs already ahead of base (currently every match is poked, GitHub's API short-circuits if no-op)
- [ ] Configurable concurrency cap (currently all updates fire in parallel)

## Contributing

Contributions are welcome! Please open an [issue](https://github.com/castastrophe/actions-pr-auto-update/issues/new) or submit a pull request.

## License

This project is licensed under the [MIT license](LICENSE).

## Funding ☕️

If you find this action useful and would like to buy me a coffee/beer as a small thank you, I would greatly appreciate it. Funding links are available in the GitHub UI for this repo.

<a href="https://www.buymeacoffee.com/castastrophe" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
