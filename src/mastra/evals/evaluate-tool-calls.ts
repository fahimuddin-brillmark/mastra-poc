import {
	createAgentTestRun,
	createTestMessage,
	extractToolCalls,
} from "@mastra/evals/scorers/utils";
import { weatherAgent } from "../agents/weather-agent";
import {
	weatherToolCallAccuracyCodeScorer,
	weatherToolCallAccuracyLlmScorer,
} from "../scorers/weather-tool-call-accuracy-scorers";

const USER_PROMPT = "What is the weather in New York today?";

async function main() {
	console.log("Running weather agent...");
	const result = await weatherAgent.generate(USER_PROMPT);

	const assistantMessages = result.messages.filter(
		(message) => message.role === "assistant",
	);

	const run = createAgentTestRun({
		inputMessages: [
			createTestMessage({
				content: USER_PROMPT,
				role: "user",
				id: "input-1",
			}),
		],
		output: assistantMessages,
		runId: result.runId,
	});

	const { tools: actualTools } = extractToolCalls(run.output);
	console.log(
		"\nTool calls detected:",
		actualTools.length > 0 ? actualTools.join(", ") : "(none)",
	);

	console.log("\n--- Code-based scorer ---");
	const codeResult = await weatherToolCallAccuracyCodeScorer.run(run);
	console.log("Score:", codeResult.score);
	console.log("Details:", codeResult.preprocessStepResult);

	console.log("\n--- LLM-based scorer ---");
	const llmResult = await weatherToolCallAccuracyLlmScorer.run(run);
	console.log("Score:", llmResult.score);
	console.log("Reason:", llmResult.reason);
	console.log("Details:", llmResult.analyzeStepResult);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
