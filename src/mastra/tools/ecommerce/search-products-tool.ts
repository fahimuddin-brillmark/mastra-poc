import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import {
	DEFAULT_SEARCH_RESULT_LIMIT,
	searchProducts,
} from "../../../lib/serpapi";

const searchPlatformSchema = z.enum(["amazon", "walmart", "google_shopping"]);

const productSearchResultSchema = z.object({
	title: z.string(),
	price: z.number().nullable(),
	currency: z.string(),
	url: z.string(),
	thumbnail: z.string().nullable(),
});

const searchMetaSchema = z.object({
	totalFound: z
		.number()
		.describe("Count returned by SerpApi before ranking/limit"),
	returned: z.number().describe("Count returned after relevance ranking"),
});

export const searchProductsTool = createTool({
	id: "search-products",
	description:
		"Search for products on a specific e-commerce platform. Returns the top ranked candidates (title match, price band vs your listing, then search rank). Use google_shopping for broader platforms. Follow up with extract_product_details on 1–3 promising URLs.",
	inputSchema: z.object({
		platform: searchPlatformSchema.describe(
			"Marketplace to search: amazon, walmart, or google_shopping (for broader/competitor listings)",
		),
		query: z.string().describe('Product search query, e.g. "32 inch Apple TV"'),
		limit: z
			.number()
			.int()
			.min(1)
			.max(20)
			.optional()
			.default(DEFAULT_SEARCH_RESULT_LIMIT)
			.describe("Max products to return after relevance ranking (default 5)"),
		base_price: z
			.number()
			.positive()
			.optional()
			.describe(
				"Your product's listed price in USD; boosts competitors in a similar price tier",
			),
	}),
	outputSchema: z.object({
		results: z.array(productSearchResultSchema),
		meta: searchMetaSchema,
	}),
	execute: async (inputData) => {
		return await searchProducts(inputData.platform, inputData.query, {
			limit: inputData.limit,
			basePrice: inputData.base_price,
		});
	},
});
