import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import { extractProductDetails } from "../../../lib/firecrawl";

const productDetailsSchema = z.object({
	features: z
		.string()
		.describe("Product features and specifications as clean Markdown"),
	description: z
		.string()
		.describe("Product overview and marketing description as clean Markdown"),
});

export const extractProductDetailsTool = createTool({
	id: "extract-product-details",
	description:
		"Deep-dive into a single product URL to extract features, specifications, and descriptions. Use after search_products when you need more than title and price to compare listings.",
	inputSchema: z.object({
		url: z
			.string()
			.describe(
				"Full product page URL from search results (Amazon, Walmart, etc.)",
			),
	}),
	outputSchema: productDetailsSchema,
	execute: async (inputData) => {
		return await extractProductDetails(inputData.url);
	},
});
