import test from "node:test";
import assert from "node:assert/strict";
import { matchFaq } from "../src/faq.mjs";

const faqs = [
  { id: "verify", question: "How does verification work?", keywords: ["verify", "access"], answer: "Human review." },
  { id: "events", question: "Where are events?", keywords: ["event", "hype"], answer: "Events channel." }
];

test("selects the relevant FAQ", () => {
  const result = matchFaq("How can I verify for access?", faqs);
  assert.equal(result.faq.id, "verify");
  assert.ok(result.score >= 0.34);
});

test("returns a weak score for unrelated requests", () => {
  assert.ok(matchFaq("refund my purchase", faqs).score < 0.34);
});
