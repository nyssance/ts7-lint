#!/usr/bin/env bun
// Keeps the TypeScript 7 modern-syntax rule block in a repo's bunfig.toml identical to rules.toml.
// `ts7-lint` writes the block (between the markers, inserted after [lint.rules] on first run);
// `ts7-lint --check` exits 1 when the block is missing or differs, for `fab check` and CI.
import { readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

export const BEGIN = "# ts7-lint:begin"
export const END = "# ts7-lint:end"
const RULES_SECTION = "[lint.rules]"

export function block(rules: string): string {
  return `${BEGIN}\n${rules.trim()}\n${END}`
}

/** The bunfig text with the rule block in place; throws when there is no [lint.rules] section to hold it. */
export function sync(bunfig: string, rules: string): string {
  const next = block(rules)
  const begin = bunfig.indexOf(BEGIN)
  if (begin !== -1) {
    const end = bunfig.indexOf(END, begin)
    if (end === -1) throw new Error(`${BEGIN} without ${END}`)
    return bunfig.slice(0, begin) + next + bunfig.slice(end + END.length)
  }
  const section = bunfig.indexOf(`${RULES_SECTION}\n`)
  if (section === -1) throw new Error(`bunfig.toml has no ${RULES_SECTION} section`)
  const at = section + RULES_SECTION.length + 1
  return `${bunfig.slice(0, at)}${next}\n${bunfig.slice(at)}`
}

/** Null when the block is in sync, otherwise why not. */
export function check(bunfig: string, rules: string): string | null {
  const begin = bunfig.indexOf(BEGIN)
  if (begin === -1) return `${BEGIN} not found; run ts7-lint`
  const end = bunfig.indexOf(END, begin)
  if (end === -1) return `${BEGIN} without ${END}`
  return bunfig.slice(begin, end + END.length) === block(rules)
    ? null
    : "rule block differs from @nyssance/ts7-lint; run ts7-lint"
}

if (import.meta.main) {
  const rules = readFileSync(resolve(import.meta.dirname, "../rules.toml"), "utf8")
  const path = resolve(process.cwd(), "bunfig.toml")
  const bunfig = readFileSync(path, "utf8")
  if (process.argv.includes("--check")) {
    const problem = check(bunfig, rules)
    if (problem !== null) {
      console.error(`bunfig.toml: ${problem}`)
      process.exit(1)
    }
    console.log("bunfig.toml: ts7-lint rules in sync")
  } else {
    const next = sync(bunfig, rules)
    if (next !== bunfig) writeFileSync(path, next)
    console.log(next === bunfig ? "bunfig.toml: already in sync" : "bunfig.toml: ts7-lint rules written")
  }
}
