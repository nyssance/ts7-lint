#!/usr/bin/env bun
// `ts7-lint` runs the TypeScript 7 modern-syntax rules on their own, next to `bun lint`: every
// other rule is turned off and the rules come from this package's rules.toml, so a repository's
// bunfig.toml keeps only its own lint settings (typeAware, ignorePatterns, its own gates).
// Arguments pass through: `ts7-lint --fix`, `ts7-lint src`.
import { resolve } from "node:path"

/** `--rule` arguments: every built-in plugin off, then exactly the modern-syntax rules. */
export function ruleArguments(plugins: readonly string[], rules: Record<string, unknown>): string[] {
  return [
    ...plugins.flatMap((plugin) => ["--rule", `${plugin}/*: off`]),
    ...Object.entries(rules).flatMap(([name, value]) => ["--rule", `${name}: ${JSON.stringify(value)}`])
  ]
}

/** Plugin names in `bun lint --rules`, so a plugin Bun adds later is turned off too. */
export function pluginsOf(listing: string): string[] {
  return [...new Set(listing.split("\n").flatMap((line) => /^([a-z][a-z0-9-]*)\//.exec(line.trim())?.[1] ?? []))]
}

if (import.meta.main) {
  const rules = Bun.TOML.parse(await Bun.file(resolve(import.meta.dirname, "../rules.toml")).text()) as Record<
    string,
    unknown
  >
  const listing = Bun.spawnSync([process.execPath, "lint", "--no-script", "--rules"], { stderr: "inherit" })
  if (!listing.success) throw new Error("bun lint --rules failed")
  const listed = pluginsOf(listing.stdout.toString())
  if (!listed.length) throw new Error("bun lint --rules listed no plugins")
  // A plugin for another file language (json, markdown) has no wildcard until a config loads it.
  const accepted = await Promise.all(
    listed.map(async (plugin) => {
      const probe = Bun.spawn(
        [process.execPath, "lint", "--no-script", "--rule", `${plugin}/*: off`, "--print-config", "ts7-lint.ts"],
        { stdout: "ignore", stderr: "ignore" }
      )
      return (await probe.exited) === 0
    })
  )
  const plugins = listed.filter((_, index) => accepted[index])
  const lint = Bun.spawn(
    [
      process.execPath,
      "lint",
      "--no-script",
      "--type-aware",
      ...ruleArguments(plugins, rules),
      ...process.argv.slice(2)
    ],
    { stdio: ["inherit", "inherit", "inherit"] }
  )
  process.exit(await lint.exited)
}
