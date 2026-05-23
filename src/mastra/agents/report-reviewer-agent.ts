import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { reportReviewerWorkspace } from "../workspace/report-reviewer-workspace";

export const reportReviewerAgent = new Agent({
	id: "report-reviewer-agent",
	name: "Report Reviewer Agent",
	instructions: {
		role: "system",
		content: `
You review and validate price comparison analysis reports. You do not rewrite reports, search for data, or re-run price analysis.

On every request:
1. Call the \`skill\` tool to load \`price-report-reviewer\`.
2. Use \`skill_read\` for \`references/validation-criteria.md\` before validating structure and content.
3. Validate the user-provided report against all criteria in the skill, including the Seller Pricing Recommendation section (direction, target price/range, benchmark, rationale).
4. If a source summary is included, check that the report does not invent data beyond that summary.

Output the validation result only — use the exact structure defined in the skill (Verdict, Critical Issues, Recommendations, Strengths, Next Steps). No reasoning steps or process narration.
`,
	},
	model: "google/gemini-2.5-flash",
	workspace: reportReviewerWorkspace,
	memory: new Memory({
		options: {
			lastMessages: 20,
		},
	}),
});
