import { createScorer } from "@mastra/core/evals";
import {
	extractAgentResponseMessages,
	getUserMessageFromRunInput,
} from "@mastra/evals/scorers/utils";
import { z } from "zod";

const BRAND_SIMILARITY_INSTRUCTIONS = `You are an expert e-commerce pricing evaluator. Your job is to judge whether a price-comparison agent respected brand alignment when selecting and analyzing competitors.

Score guidelines:
- 1.0: The agent only used competitors of the same brand as the seller's product, or clearly stated that no same-brand listings were found and did not treat cross-brand products as direct comparables.
- 0.5–0.9: Mostly same-brand focus with minor cross-brand mentions that were explicitly flagged as alternatives, not primary comparables.
- 0.0–0.4: The agent analyzed or recommended cross-brand competitors (e.g., Samsung vs Sony) as primary comparables when the user's product or query specified a brand.
- If no brand is mentioned in the user request, score based on whether the agent avoided inventing a brand constraint while still being coherent.`;

const analyzeOutputSchema = z.object({
	score: z
		.number()
		.min(0)
		.max(1)
		.describe("Brand alignment score from 0.0 (poor) to 1.0 (excellent)"),
	reason: z
		.string()
		.describe("Brief explanation of the score citing brands mentioned"),
});

export const brandSimilarityScorer = createScorer({
	id: "brand-similarity",
	name: "Brand Similarity (LLM)",
	description:
		"Evaluates whether the agent compared prices using same-brand competitors rather than cross-brand alternatives",
	type: "agent",
	judge: {
		model: "openai/gpt-4o",
		instructions: BRAND_SIMILARITY_INSTRUCTIONS,
	},
})
	.analyze({
		description:
			"Judge brand alignment between the user's product and competitors analyzed",
		outputSchema: analyzeOutputSchema,
		createPrompt: ({ run }) => {
			const userMessage = getUserMessageFromRunInput(run.input) ?? "";
			const agentResponses = extractAgentResponseMessages(run.output).join(
				"\n\n",
			);

			return `Evaluate brand similarity for this price-comparison interaction.

## User request
${userMessage}

## Agent response
${agentResponses}

Identify the seller's brand (if stated) and each competitor brand the agent treated as a comparable listing. Return a score from 0.0 to 1.0 and a concise reason.`;
		},
	})
	.generateScore(({ results }) => results.analyzeStepResult.score)
	.generateReason(({ results }) => results.analyzeStepResult.reason);
