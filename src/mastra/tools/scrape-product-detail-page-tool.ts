import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import {
	COMPETITOR_MARKETPLACES,
	normalizePdpUrl,
} from "../lib/marketplace-pdp";
import { scrapeMarketplacePdps } from "../lib/scrape-marketplace-pdp";
import { TssScraperClient } from "../lib/tss-scraper-client";

const scrapedPdpSchema = z.object({
	url: z.string(),
	status: z.string(),
	scrapeJobId: z.string(),
	title: z.string().nullable(),
	price: z.number().nullable(),
	currency: z.string(),
	features: z.array(z.string()),
	markdown: z.string(),
});

export const scrapeProductDetailPageTool = createTool({
	id: "scrape-product-detail-page",
	description:
		"Scrape one or more competitor product detail pages (PDP) via TSS. " +
		"Use after a search scrape when you need full title, price, and feature bullets for specific listings. " +
		"Pass canonical product URLs (Amazon /dp/ASIN, Walmart /ip/..., Alibaba product-detail).",
	inputSchema: z.object({
		competitor: z
			.enum(COMPETITOR_MARKETPLACES)
			.describe("Marketplace (amazon, walmart, or alibaba)"),
		productUrls: z
			.array(z.string().url())
			.min(1)
			.max(3)
			.describe("Product detail page URLs to scrape (max 3 per call)"),
	}),
	outputSchema: z.object({
		competitor: z.string(),
		products: z.array(scrapedPdpSchema),
	}),
	execute: async (inputData) => {
		const { competitor, productUrls } = inputData;

		const normalizedUrls = productUrls
			.map((url) => normalizePdpUrl(competitor, url))
			.filter((url): url is string => url != null);

		if (normalizedUrls.length === 0) {
			throw new Error(
				"No valid product detail URLs. Use Amazon /dp/ASIN, Walmart /ip/slug, or Alibaba product-detail links.",
			);
		}

		const client = new TssScraperClient();
		const products = await scrapeMarketplacePdps(
			client,
			competitor,
			normalizedUrls,
		);

		return { competitor, products };
	},
});
