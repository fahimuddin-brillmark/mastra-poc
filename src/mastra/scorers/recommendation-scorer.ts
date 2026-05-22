import { createScorer } from "@mastra/core/evals";
import {
	extractAgentResponseMessages,
	getUserMessageFromRunInput,
} from "@mastra/evals/scorers/utils";
import { z } from "zod";

const RECOMMENDATION_INSTRUCTIONS = `You are an expert e-commerce pricing evaluator. Your job is to judge whether a price-comparison agent gave the seller a concrete pricing recommendation.

Score guidelines:
- 1.0: The agent recommends a specific price point, target price range, or actionable pricing action (e.g., "lower to $X", "price at $Y–$Z", "you are $N over market—consider reducing to …").
- 0.0: The agent only describes market position, competitor prices, or gaps without recommending what price the seller should set or move to.

A summary that says the seller is "overpriced" or "underpriced" without a concrete price recommendation scores 0.0.`;

const analyzeOutputSchema = z.object({
	score: z
		.number()
		.min(0)
		.max(1)
		.describe("1.0 if a price point is recommended, 0.0 otherwise"),
	reason: z
		.string()
		.describe(
			"Brief explanation citing whether a concrete price was recommended",
		),
});

export const recommendationScorer = createScorer({
	id: "recommendation",
	name: "Price Recommendation (LLM)",
	description:
		"Evaluates whether the agent recommends a concrete price point for the seller",
	type: "agent",
	judge: {
		model: "openai/gpt-4o",
		instructions: RECOMMENDATION_INSTRUCTIONS,
	},
})
	.analyze({
		description:
			"Judge whether the agent recommended a specific price point or range",
		outputSchema: analyzeOutputSchema,
		createPrompt: ({ run }) => {
			const userMessage = getUserMessageFromRunInput(run.input) ?? "";
			const agentResponses = extractAgentResponseMessages(run.output).join(
				"\n\n",
			);

			return `Evaluate whether this price-comparison agent recommended a concrete price point.

## User request
${userMessage}

## Agent response
${agentResponses}

Return 1.0 if the agent recommends a specific price, target range, or actionable pricing move. Return 0.0 if it only reports market position without a concrete recommendation. Include a concise reason.`;
		},
	})
	.generateScore(({ results }) => results.analyzeStepResult.score)
	.generateReason(({ results }) => results.analyzeStepResult.reason);
