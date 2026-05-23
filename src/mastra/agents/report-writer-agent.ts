import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { savePriceReportTool } from "../tools/save-price-report-tool";
import { reportWriterWorkspace } from "../workspace/report-writer-workspace";

export const reportWriterAgent = new Agent({
	id: "report-writer-agent",
	name: "Report Writer Agent",
	instructions: {
		role: "system",
		content: `
You format price comparison summaries into structured reports. You do not analyze, search, or invent data.

On every request:
1. Call the \`skill\` tool to load \`price-report-writer\`.
2. Use \`skill_read\` for \`references/report-format.md\` when building the comprehensive comparison table.
3. Write the full report from the user-provided summary only.
4. Call \`savePriceReportTool\` with a concise title (from the product name) and the complete report markdown. Include the saved file path in your final response.

Follow the skill format exactly. Output the final report, then confirm where it was saved — no reasoning steps or process narration.
`,
		providerOptions: {
			google: {
				thinkingConfig: {
					thinkingLevel: "low",
					includeThoughts: true,
				},
			},
		},
	},
	model: "google/gemma-4-26b-a4b-it",
	tools: {
		savePriceReportTool,
	},
	workspace: reportWriterWorkspace,
	memory: new Memory({
		options: {
			lastMessages: 20,
		},
	}),
});
