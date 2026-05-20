import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import { calculatePriceMetrics } from "../../../helpers/price-metrics";

const priceMetricsSchema = z.object({
	normalized_competitor_price_usd: z
		.number()
		.describe(
			"Competitor price converted to USD using fixed MVP exchange rates",
		),
	absolute_difference: z
		.number()
		.describe(
			"USD gap (competitor minus your base). Positive = competitor costs more",
		),
	percentage_difference: z
		.number()
		.describe(
			"Percent gap vs your base price. Positive = competitor is more expensive",
		),
});

export const calculatePriceMetricsTool = createTool({
	id: "calculate-price-metrics",
	description:
		"Compute exact price comparison math between your listing and a competitor. Converts competitor currency to USD, then returns absolute and percentage differences. Use after you have both prices—never estimate percentages in prose.",
	inputSchema: z.object({
		base_price: z
			.number()
			.positive()
			.describe("Your product's listed price in USD"),
		competitor_price: z
			.number()
			.positive()
			.describe("Competitor's listed price in its native currency"),
		competitor_currency: z
			.string()
			.describe(
				"ISO-style currency code from search results (e.g. USD, EUR, GBP, CNY)",
			),
	}),
	outputSchema: priceMetricsSchema,
	execute: async (inputData) => {
		return calculatePriceMetrics(
			inputData.base_price,
			inputData.competitor_price,
			inputData.competitor_currency,
		);
	},
});
