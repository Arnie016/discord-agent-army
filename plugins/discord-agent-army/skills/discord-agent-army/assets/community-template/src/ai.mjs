import { createHash } from "node:crypto";
import OpenAI from "openai";

export async function groundedFaqAnswer({ question, faq, userId, env }) {
  if (!env.openaiKey) return faq.answer;
  const client = new OpenAI({ apiKey: env.openaiKey });
  const safetyIdentifier = createHash("sha256").update(`${env.safetySalt}:${userId}`).digest("hex").slice(0, 48);

  try {
    const response = await client.responses.create({
      model: env.openaiModel,
      store: false,
      safety_identifier: safetyIdentifier,
      reasoning: { effort: "low" },
      max_output_tokens: 220,
      instructions: "You are a visibly labeled Discord AI support assistant. Answer only from the supplied approved FAQ. Be concise. Do not invent policy, identity, or account facts.",
      input: `Member question: ${question}\nApproved FAQ: ${faq.question}\nApproved answer: ${faq.answer}`
    });
    return response.output_text?.trim() || faq.answer;
  } catch (error) {
    console.error("AI response failed; using approved FAQ:", error.message);
    return faq.answer;
  }
}
