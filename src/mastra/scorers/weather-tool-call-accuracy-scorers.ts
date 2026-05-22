import {
	createToolCallAccuracyScorerCode,
	createToolCallAccuracyScorerLLM,
} from "@mastra/evals/scorers/prebuilt";

/** Deterministic scorer: passes when weatherTool is called for weather queries. */
export const weatherToolCallAccuracyCodeScorer =
	createToolCallAccuracyScorerCode({
		expectedTool: "weatherTool",
		strictMode: false,
	});

/** LLM-based scorer: judges whether tool selection was appropriate for the request. */
export const weatherToolCallAccuracyLlmScorer = createToolCallAccuracyScorerLLM(
	{
		model: "openai/gpt-4o-mini",
		availableTools: [
			{ id: "weatherTool", description: "Get weather information" },
		],
	},
);
