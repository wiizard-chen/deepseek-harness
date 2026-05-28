import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createContext,
  createTempDir,
  toolsCalled,
} from "deepseek-harness/testing";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Session } from "@opencode-ai/sdk/v2";

describe("doc-mode", () => {
  let ctx: Awaited<ReturnType<typeof createContext>>;
  let session: Session;
  let tmp: Awaited<ReturnType<typeof createTempDir>>;

  beforeAll(async () => {
    tmp = await createTempDir(import.meta.dirname!, "doc-mode");
    await tmp.putFiles({
      "src/pool.ts": `export interface StockPoolSpec {
  name: string;
  version: string;
}
`,
    });
    ctx = await createContext({ agent: "doc" });
    session = await ctx.createSession({ directory: tmp.path });
  }, 60_000);

  afterAll(async () => {
    void ctx?.close();
    await tmp.destroy();
  });

  it("doc agent 新建 markdown 时直接使用 write", async () => {
    await ctx.promptText(
      session,
      "新建 docs/spec.md，写一个简短设计说明，包含标题 '# Spec'，并提到 StockPoolSpec。",
    );

    const content = await readFile(join(tmp.path, "docs/spec.md"), "utf-8");
    expect(content).toContain("# Spec");
    expect(content).toContain("StockPoolSpec");

    const messages = await ctx.messages(session);
    expect(toolsCalled(messages, "write")).toBeGreaterThan(0);
    expect(toolsCalled(messages, "hashedit")).toBe(0);
    await ctx.logStats();
  }, 120_000);
});
