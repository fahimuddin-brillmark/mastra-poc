import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import { saveReport } from "../../helpers/report";

export const savePriceReportTool = createTool({
	id: "save-price-report",
	description:
		"Save a completed price comparison report as a markdown file in the workspace /reports/ directory. Call this after the full report is written. The filename includes the current date, time, and a slug derived from the title.",
	inputSchema: z.object({
		title: z
			.string()
			.min(3)
			.describe(
				"Short descriptive title for the report, derived from the product name (e.g. 'Sony WH-1000XM5 Price Comparison')",
			),
		content: z
			.string()
			.min(1)
			.describe("The complete markdown report content to save"),
	}),
	outputSchema: z.object({
		path: z.string().describe("Workspace path where the report was saved"),
		filename: z.string().describe("Generated markdown filename"),
	}),
	execute: async (inputData, context) => {
		return saveReport(
			context?.workspace?.filesystem,
			inputData.title,
			inputData.content,
		);
	},
});
