# Contributing

Thanks for considering a contribution! This project is small and friendly — here's what you need to know.

## Development setup

```bash
nvm use            # Node 24 (see .nvmrc)
corepack enable    # Yarn 4
yarn install
```

## Common commands

| Command         | What it does                                      |
| --------------- | ------------------------------------------------- |
| `yarn build`    | Type-check (tsc `--noEmit`) and bundle to `bin/`. |
| `yarn test`     | Run the Jest test suite.                          |
| `yarn coverage` | Run tests with coverage. Locally, prints a table. |
| `yarn lint`     | Run prettier, eslint, and markdownlint.           |
| `yarn format`   | Auto-fix lint and formatting issues.              |

## Commit conventions

Commits must follow [Conventional Commits](https://www.conventionalcommits.org), enforced by commitlint via a pre-commit hook. The commit type drives the next release via semantic-release:

- `fix:` → patch release
- `feat:` → minor release
- `feat!:` or any commit with a `BREAKING CHANGE:` footer → major release
- `chore:`, `docs:`, `refactor:`, `test:`, `ci:`, `build:` → no release

If you're not sure, `fix:` is almost always a safe choice for bug fixes.

## Pull requests

- Open an issue first for substantive changes — small fixes can skip this.
- Keep PRs focused. One change per PR is easier to review.
- Update tests for any behavior change.
- The CI workflow runs build, lint, and the full test suite — make sure it's green.
- Releases are automatic: once a PR merges to `main`, semantic-release decides the next version based on commit types and publishes a tag (and updates the floating `vN` major tag).

## Questions

Stuck on something? Start a thread in [Discussions](https://github.com/castastrophe/actions-pr-auto-update/discussions). The issue tracker is for bugs and feature requests.
