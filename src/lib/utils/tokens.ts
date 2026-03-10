import type { Model } from '@/lib/types/database';

export function estimateTokens(text: string): number {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / 0.75);
}

export function estimateCost(
  tokens: number,
  model: Model,
  includeOutput = true
): { inputCost: number; outputCost: number; totalCost: number; contextUsage: number } {
  const avgOutputTokens = includeOutput ? Math.ceil(tokens * 1.5) : 0;
  const inputCost = (tokens / 1_000_000) * Number(model.input_price_per_million_tokens);
  const outputCost = (avgOutputTokens / 1_000_000) * Number(model.output_price_per_million_tokens);
  const contextUsage = tokens / model.max_context_tokens;

  return {
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
    contextUsage,
  };
}

export function formatCost(cost: number): string {
  if (cost < 0.01) return `$${cost.toFixed(6)}`;
  return `$${cost.toFixed(4)}`;
}

export function formatTokens(tokens: number): string {
  if (tokens >= 1000) return `~${(tokens / 1000).toFixed(1)}k tokens`;
  return `~${tokens} tokens`;
}
