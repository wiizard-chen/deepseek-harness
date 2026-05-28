import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createContext, createTempDir } from "deepseek-harness/testing";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Session } from "@opencode-ai/sdk/v2";

describe("plan-mode", () => {
  let ctx: Awaited<ReturnType<typeof createContext>>;
  let session: Session;
  let tmp: Awaited<ReturnType<typeof createTempDir>>;

  beforeAll(async () => {
    tmp = await createTempDir(import.meta.dirname!, "plan-mode");
    ctx = await createContext({ agent: "plan" });
    session = await ctx.createSession({ directory: tmp.path });
  }, 60_000);

  afterAll(async () => {
    void ctx?.close();
    await tmp.destroy();
  });

  it("plan agent 可以创建并更新 markdown 文件", async () => {
    await ctx.promptText(
      session,
      "新建 docs/plan.md，写一个两项的实施计划，标题是 '# Plan'。",
    );

    await ctx.promptText(
      session,
      "把 docs/plan.md 里的第二项改成 '2. 验证 plan 模式下的 markdown 写入能力'。",
    );

    const content = await readFile(join(tmp.path, "docs/plan.md"), "utf-8");
    expect(content).toContain("# Plan");
    expect(content).toContain("2. 验证 plan 模式下的 markdown 写入能力");
    await ctx.logStats();
  }, 120_000);
});