# ts7-lint

[![npm version](https://img.shields.io/npm/v/%40nyssance%2Fts7-lint)](https://www.npmjs.com/package/@nyssance/ts7-lint)

The TypeScript 7 modern-syntax rules for `bun lint`, run as their own check next to `bun lint`.

`tsc` 7 targets `esnext`, so every current language and runtime feature can be used directly:
`.at(-1)`, `toSorted()`, `structuredClone()`, `??=`, `replaceAll()`, `findLast()`, `prepend()`,
`Object.hasOwn()`, `Math.hypot()`, `String.raw`, `for…of`, `import type`, optional chaining and
nullish coalescing. It also gates import cycles (`import/no-cycle`). `bun lint` does not enable the rules that reject the older forms, and
`bunfig.toml` cannot extend another file, so the rules live only in this package's `rules.toml`
and never in a repository's `bunfig.toml`.

## Usage

```sh
bun add -d @nyssance/ts7-lint
bun x ts7-lint          # check; exits 1 on a finding
bun x ts7-lint --fix    # apply the safe rewrites; any bun lint argument passes through
```

Add a `"ts7-lint": "ts7-lint"` script and run it in CI next to `bun lint`. `ts7-lint` runs
`bun lint --type-aware` with every built-in rule turned off and exactly these rules turned on,
so it reports nothing `bun lint` already reports. The repository's `bunfig.toml` still supplies
`ignorePatterns`, and `bun lint` keeps its own rules there.

`--fix-suggestions` and `--fix-dangerously` apply more rewrites, and three of them need a human
look afterwards: `?.` rewrites of negated `null`/`undefined` checks, named function expressions
(component names, mocks passed to `new`), and `.at(-1)` on arrays the surrounding code already
proved non-empty.

## Requirements

Bun 1.4.4 or later; the rules are the ones `bun lint` ships natively.

## License

Apache-2.0
