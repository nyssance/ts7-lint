import { describe, expect, test } from "bun:test"

import { BEGIN, block, check, END, sync } from "../index"

const rules = '# modern\n"no-var" = "error"\n"unicorn/prefer-at" = "error"\n'
const bunfig = `[lint]\ntypeAware = true\n\n[lint.rules]\n"import/no-cycle" = "error"\n\n[[lint.overrides]]\nfiles = ["**/__tests__/**"]\n`

describe("sync", () => {
  test("inserts the block right after [lint.rules] on first run", () => {
    const next = sync(bunfig, rules)
    expect(next).toBe(
      `[lint]\ntypeAware = true\n\n[lint.rules]\n${BEGIN}\n# modern\n"no-var" = "error"\n"unicorn/prefer-at" = "error"\n${END}\n"import/no-cycle" = "error"\n\n[[lint.overrides]]\nfiles = ["**/__tests__/**"]\n`
    )
    expect(check(next, rules)).toBeNull()
  })

  test("replaces an existing block in place and keeps everything around it", () => {
    const stale = sync(bunfig, '"no-var" = "warn"\n')
    const next = sync(stale, rules)
    expect(next).toBe(sync(bunfig, rules))
    expect(sync(next, rules)).toBe(next)
  })

  test("throws when the bunfig has no [lint.rules] section", () => {
    expect(() => sync("[lint]\ntypeAware = true\n", rules)).toThrow("[lint.rules]")
  })

  test("throws on a begin marker without an end marker", () => {
    expect(() => sync(`[lint.rules]\n${BEGIN}\n`, rules)).toThrow(END)
  })
})

describe("check", () => {
  test("reports a missing block", () => {
    expect(check(bunfig, rules)).toContain("not found")
  })

  test("reports a block that drifted from the package", () => {
    expect(check(sync(bunfig, '"no-var" = "warn"\n'), rules)).toContain("differs")
  })

  test("accepts the block exactly as block() renders it", () => {
    expect(check(`[lint.rules]\n${block(rules)}\n`, rules)).toBeNull()
  })
})
