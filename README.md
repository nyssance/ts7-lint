# ts7-lint

[![npm version](https://img.shields.io/npm/v/%40nyssance%2Fts7-lint)](https://www.npmjs.com/package/@nyssance/ts7-lint)

The TypeScript 7 modern-syntax rule block for `bun lint`, kept identical across repositories.

`tsc` 7 targets `esnext`, so every current language and runtime feature can be used directly:
`.at(-1)`, `toSorted()`, `structuredClone()`, `??=`, `replaceAll()`, `findLast()`, `prepend()`,
`Object.hasOwn()`, `Math.hypot()`, `String.raw`, `for…of`, `import type`, optional chaining and
nullish coalescing. `bun lint` does not enable the rules that reject the older forms, and `bunfig.toml`
cannot extend another file, so this package owns the block and writes it into each repository.

## Usage

```sh
bun add -d @nyssance/ts7-lint
bun x ts7-lint            # writes the block into bunfig.toml, after [lint.rules]
bun x ts7-lint --check    # exits 1 when the block is missing or differs; run it in CI
```

The block lives between `# ts7-lint:begin` and `# ts7-lint:end` inside `[lint.rules]`. Edit the
rules only in this package's `rules.toml`; a later `bun x ts7-lint` rewrites every repository.
Repository-specific entries stay outside the markers; `bunfig.toml` lets a later key override an
earlier one, so a repository can still turn a rule off below the block.

`bun lint --fix` applies the safe rewrites. `--fix-suggestions` and `--fix-dangerously` apply more,
and three of them need a human look afterwards: `?.` rewrites of negated `null`/`undefined` checks,
named function expressions (component names, mocks passed to `new`), and `.at(-1)` on arrays the
surrounding code already proved non-empty.

## Requirements

Bun 1.4.4 or later; the rules are the ones `bun lint` ships natively.

## License

Apache-2.0
