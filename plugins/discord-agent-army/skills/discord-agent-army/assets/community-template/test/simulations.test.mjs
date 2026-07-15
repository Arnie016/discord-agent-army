import test from "node:test";
import assert from "node:assert/strict";
import { testNews } from "../src/handlers/simulations.mjs";

test("simulation news is explicitly non-live", () => {
  assert.equal(testNews.length, 3);
  for (const story of testNews) assert.match(story.body, /fiction|pretend|simulation/i);
});
