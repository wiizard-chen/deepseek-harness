import { type AgentConfig } from "@opencode-ai/sdk/v2";
import { readPromptWithShared, withPlanPermission } from "./_shared.ts";

export const plan = {
  mode: "primary" as const,
  prompt: await readPromptWithShared("plan.md"),
  temperature: 0.0,
  top_p: 0.9,
  permission: withPlanPermission(),
} satisfies AgentConfig;
