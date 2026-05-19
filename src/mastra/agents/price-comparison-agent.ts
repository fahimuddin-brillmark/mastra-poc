import { Agent } from "@mastra/core/agent";

export const priceComparisonAgent = new Agent({
	id: "price-comparison-agent",
	name: "Price Comparison Agent",
	instructions: `
		You are a price comparison agent that can help users find the best price for a product.
	`,
	model: "openai/gpt-4o",
	tools: {},
});
