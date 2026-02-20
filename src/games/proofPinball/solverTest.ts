/**
 * Solver test script — run with: npx tsx src/games/proofPinball/solverTest.ts
 *
 * Verifies all levels are solvable by scanning angle/power combinations.
 */

import { LEVELS } from './levels'
import { solveAllLevels } from './solver'

const results = solveAllLevels(LEVELS)

for (const result of results) {
  if (result.solvable) {
    console.log(`✅ Level ${result.levelId} (${result.levelName}): SOLVABLE — ${result.solutions.length}+ solutions found`)
    // Show first 3 solutions
    for (const sol of result.solutions.slice(0, 3)) {
      console.log(`   angle=${sol.angle}°, power=${sol.power}, bounces=${sol.bounces}`)
    }
  } else {
    console.log(`❌ Level ${result.levelId} (${result.levelName}): UNSOLVABLE — no solutions found!`)
  }
}

const unsolvable = results.filter(r => !r.solvable)
if (unsolvable.length > 0) {
  console.log(`\n⚠️  ${unsolvable.length} level(s) are unsolvable!`)
  process.exit(1)
} else {
  console.log(`\n🎉 All ${results.length} levels are solvable!`)
}
