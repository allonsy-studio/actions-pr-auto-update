# Changelog

All notable changes to this project will be documented in this file. See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.0.0](https://github.com/castastrophe/actions-pr-auto-update/compare/v2.0.0...v3.0.0) (2026-05-14)

### ⚠ BREAKING CHANGES

- upgrade to Node 24, Yarn 4.14.1, and major dependency versions (#33)

### ✨ Features

\*upgrade to Node 24, Yarn 4.14.1, and major dependency versions ([#33](https://github.com/castastrophe/actions-pr-auto-update/issues/33)) ([b50cde2](https://github.com/castastrophe/actions-pr-auto-update/commit/b50cde2148c9a3ab6c50c33eda1650debb204593))

- Bump Node runtime from 22 to 24 (action.yml `using: node24`, `.nvmrc`, `engines`)
- Upgrade Yarn to 4.14.1 and bundle the release cjs in `.yarn/releases/`
- Upgrade `@actions/core` 1.x → 3.x and `@actions/github` 6.x → 9.x
- Upgrade `typescript` 5.x → 6.x, `eslint` 9.x → 10.x, `lint-staged` 16.x → 17.x
- Upgrade `@commitlint/*` 20.x → 21.x, `jest` + `ts-jest` to latest
- Migrate ESLint config from `.eslintrc.json` to flat `eslint.config.js`
- Migrate `commitlint.config.js` and `jest.config.js` to ESM exports
- Convert `.releaserc` JSON to `.releaserc.js` for richer semantic-release config
- Add `markdownlint` config and tooling; add `eslint-plugin-jsonc`
- Add `.env.example` and `@allons-y/envoy` for environment setup
- Scope package name to `@allons-y/actions-pr-auto-update`
- Fix optional chaining throughout `src/main.ts` for safer property access
- Update CI workflows: use `node-version-file`, bump `actions/cache` + `actions/checkout` to v6
- Improve `action.yml` input/output descriptions

## [2.0.0](https://github.com/castastrophe/actions-pr-auto-update/compare/v1.0.0...v2.0.0) (2025-11-04)

### Bug Fixes

- bypass loop when we're only fetching 1 page ([d24a5b7](https://github.com/castastrophe/actions-pr-auto-update/commit/d24a5b7511d724503960279dbbc320ec62192863))
- Clean up documentation formatting ([f121bb3](https://github.com/castastrophe/actions-pr-auto-update/commit/f121bb3cc267de17b916b296f19e7cb5e087fc61))
- pass in expected sha for update branch ([d6af7cb](https://github.com/castastrophe/actions-pr-auto-update/commit/d6af7cb3a51d40213690d600f2f269a26271bfe2))
- repair invalid variable ([fec37eb](https://github.com/castastrophe/actions-pr-auto-update/commit/fec37eb9b8133b4e21ab6765f73433c78f4d164b))
- resolve GITHUB_TOKEN error ([6f1679e](https://github.com/castastrophe/actions-pr-auto-update/commit/6f1679eb736ad2d120e597c5809c3b50f5f76854))
- standardize token structure ([4992fe6](https://github.com/castastrophe/actions-pr-auto-update/commit/4992fe610e39282e73f5605109cc3d38886917e7))
- updating release logic ([3d47bfa](https://github.com/castastrophe/actions-pr-auto-update/commit/3d47bfaf9f4fde317d906f3528d760bcbc2e8c06))
- updating release order ([704eef2](https://github.com/castastrophe/actions-pr-auto-update/commit/704eef2cce989f655c801dec7645e1ea6177f46b))
- version out of sync ([e70cc5e](https://github.com/castastrophe/actions-pr-auto-update/commit/e70cc5e6d6e40d564a9bab163543024de477bc74))

- feat!: update node and yarn versions; add funding ([16e8ea1](https://github.com/castastrophe/actions-pr-auto-update/commit/16e8ea1e1cecb770b5d699235801c2202f894b86))

### Features

- add color to console output ([1b2eccf](https://github.com/castastrophe/actions-pr-auto-update/commit/1b2eccf10b5e85f73cdd99fcb9ed6a785d9bc303))
- add debug output ([e06cc3e](https://github.com/castastrophe/actions-pr-auto-update/commit/e06cc3eee9a86bad00f712b079502c15a321f330))
- enhanced error reporting ([da4f565](https://github.com/castastrophe/actions-pr-auto-update/commit/da4f56553a0bf272b94cdfcdaddec3aba264c70b))
- fix semantic release order of tasks ([be1a27c](https://github.com/castastrophe/actions-pr-auto-update/commit/be1a27c4e4105b3b49c7900555b8b31b26f2c368))
- more extensive console reporting added ([ddaa83b](https://github.com/castastrophe/actions-pr-auto-update/commit/ddaa83b0185d54fca0664b5849f8d86ba7e2e03d))
- prevent duplicate queries ([d9dc82b](https://github.com/castastrophe/actions-pr-auto-update/commit/d9dc82b794e3ee41fbf74edefcd5fd2ffec7b622))

### BREAKING CHANGES

- Node version now updated to v22+ and project is using the latest yarn.

## [1.1.0](https://github.com/castastrophe/actions-pr-auto-update/compare/v1.0.0...v1.1.0) (2023-10-27)

### Bug Fixes

- bypass loop when we're only fetching 1 page ([d24a5b7](https://github.com/castastrophe/actions-pr-auto-update/commit/d24a5b7511d724503960279dbbc320ec62192863))
- Clean up documentation formatting ([f121bb3](https://github.com/castastrophe/actions-pr-auto-update/commit/f121bb3cc267de17b916b296f19e7cb5e087fc61))
- pass in expected sha for update branch ([d6af7cb](https://github.com/castastrophe/actions-pr-auto-update/commit/d6af7cb3a51d40213690d600f2f269a26271bfe2))
- repair invalid variable ([fec37eb](https://github.com/castastrophe/actions-pr-auto-update/commit/fec37eb9b8133b4e21ab6765f73433c78f4d164b))
- resolve GITHUB_TOKEN error ([6f1679e](https://github.com/castastrophe/actions-pr-auto-update/commit/6f1679eb736ad2d120e597c5809c3b50f5f76854))
- standardize token structure ([4992fe6](https://github.com/castastrophe/actions-pr-auto-update/commit/4992fe610e39282e73f5605109cc3d38886917e7))
- updating release logic ([3d47bfa](https://github.com/castastrophe/actions-pr-auto-update/commit/3d47bfaf9f4fde317d906f3528d760bcbc2e8c06))
- updating release order ([704eef2](https://github.com/castastrophe/actions-pr-auto-update/commit/704eef2cce989f655c801dec7645e1ea6177f46b))
- version out of sync ([e70cc5e](https://github.com/castastrophe/actions-pr-auto-update/commit/e70cc5e6d6e40d564a9bab163543024de477bc74))

### Features

- add color to console output ([1b2eccf](https://github.com/castastrophe/actions-pr-auto-update/commit/1b2eccf10b5e85f73cdd99fcb9ed6a785d9bc303))
- add debug output ([e06cc3e](https://github.com/castastrophe/actions-pr-auto-update/commit/e06cc3eee9a86bad00f712b079502c15a321f330))
- enhanced error reporting ([da4f565](https://github.com/castastrophe/actions-pr-auto-update/commit/da4f56553a0bf272b94cdfcdaddec3aba264c70b))
- fix semantic release order of tasks ([be1a27c](https://github.com/castastrophe/actions-pr-auto-update/commit/be1a27c4e4105b3b49c7900555b8b31b26f2c368))
- more extensive console reporting added ([ddaa83b](https://github.com/castastrophe/actions-pr-auto-update/commit/ddaa83b0185d54fca0664b5849f8d86ba7e2e03d))
- prevent duplicate queries ([d9dc82b](https://github.com/castastrophe/actions-pr-auto-update/commit/d9dc82b794e3ee41fbf74edefcd5fd2ffec7b622))

## 1.0.0 (2023-05-25)

### Bug Fixes

- use ref of pushed branch from event ([bb7d344](https://github.com/castastrophe/actions-pr-auto-update/commit/bb7d3447b9695e53a31dae0486d44e11ac8a9559))

### Features

- add config settings to action ([#1](https://github.com/castastrophe/actions-pr-auto-update/issues/1)) ([c52e399](https://github.com/castastrophe/actions-pr-auto-update/commit/c52e399a87703428f67136373cd5a6eb86ff6fe2))
