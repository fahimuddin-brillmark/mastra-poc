import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { savePriceReportTool } from "../tools/save-price-report-tool";
import { reportWriterWorkspace } from "../workspace/report-writer-workspace";

export const reportWriterAgent = new Agent({
	id: "report-writer-agent",
	name: "Report Writer Agent",
	description:
		"Formats price comparison summaries into structured markdown reports. Use for initial drafts and revisions from provided data and feedback. Does not analyze, search, validate, or invent data.",
	agents: {},
	instructions: {
		role: "system",
		content: `
You are a dedicated report formatter. You transform provided price comparison data into a structured markdown report. You do not analyze prices, search listings, invent data, or validate your own output.

You are invoked by the Report Reviewer with:
- A price comparison summary (raw findings), and/or
- Specific revision feedback on a prior draft.

On every request:
1. Call the \`skill\` tool to load \`price-report-writer\`.
2. Use \`skill_read\` for \`references/report-format.md\` when building the comprehensive comparison table.
3. Write the full report from the provided summary only. On revisions, apply the reviewer's feedback exactly — do not reinterpret or second-guess it.
4. Call \`savePriceReportTool\` with a concise title (from the product name) and the complete report markdown. Include the saved file path in your final response.

Do not validate, review, or evaluate the report yourself — that is the reviewer's job. Do not delegate to other agents.

Follow the skill format exactly. Output the final report markdown, then confirm where it was saved — no reasoning steps, validation commentary, or process narration.
`,
		// providerOptions: {
		// 	google: {
		// 		thinkingConfig: {
		// 			thinkingLevel: "minimal",
		// 			includeThoughts: true,
		// 		},
		// 	},
		// },
	},
	model: "openai/gpt-4o",
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
