import { describe, expect, test } from "bun:test"

import { pluginsOf, ruleArguments } from "../index"

describe("ruleArguments", () => {
  test("turns every plugin off before enabling exactly the package rules", () => {
    expect(
      ruleArguments(["eslint", "unicorn"], {
        "no-var": "error",
        "prefer-arrow-callback": ["error", { allowNamedFunctions: true }]
      })
    ).toEqual([
      "--rule",
      "eslint/*: off",
      "--rule",
      "unicorn/*: off",
      "--rule",
      'no-var: "error"',
      "--rule",
      'prefer-arrow-callback: ["error",{"allowNamedFunctions":true}]'
    ])
  })
})

describe("pluginsOf", () => {
  test("collects each plugin of the rule listing once", () => {
    expect(
      pluginsOf(
        "$ bun lint --rules\nbun/format\neslint/no-var\neslint/no-undef\nnode/no-unsupported-features/es-syntax\n"
      )
    ).toEqual(["bun", "eslint", "node"])
  })
})
