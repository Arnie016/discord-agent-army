import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { scaffold } from "../scripts/scaffold-community.mjs";

test("scaffolds an isolated community contract without a token", async () => {
  const root = await mkdtemp(resolve(tmpdir(), "discord-agent-army-"));
  const target = resolve(root, "alpha");
  try {
    const result = await scaffold({ slug: "alpha", name: "Alpha Guild", "guild-id": "123456789012345", "client-id": "987654321098765", output: target });
    assert.equal(result.contract.agents.length, 7);
    assert.equal(result.contract.data.messageTraining, false);
    const env = await readFile(resolve(target, ".env"), "utf8");
    assert.match(env, /DISCORD_TOKEN=\n/);
    assert.match(env, /DISCORD_GUILD_ID=123456789012345/);
    const server = JSON.parse(await readFile(resolve(target, "config/server.json"), "utf8"));
    assert.equal(server.guildLabel, "Alpha Guild");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
