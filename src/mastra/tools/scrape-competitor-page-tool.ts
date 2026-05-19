import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import {
	COMPETITOR_MARKETPLACES,
	extractPdpUrlsFromMarkdown,
	type CompetitorMarketplace,
} from "../lib/marketplace-pdp";
import {
	DEFAULT_PDP_FOLLOW_UP_COUNT,
	scrapeMarketplacePdps,
} from "../lib/scrape-marketplace-pdp";
import { TssScraperClient } from "../lib/tss-scraper-client";

const MAX_SERP_MARKDOWN_LENGTH = 12_000;

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

function buildCompetitorSearchUrl(
	competitor: CompetitorMarketplace,
	searchQuery: string,
): string {
	const query = encodeURIComponent(searchQuery.trim());

	switch (competitor) {
		case "amazon":
			return `https://www.amazon.com/s?k=${query}`;
		case "walmart":
			return `https://www.walmart.com/search?q=${query}`;
		case "alibaba":
			return `https://www.alibaba.com/trade/search?SearchText=${query}`;
	}
}

export const scrapeCompetitorPageTool = createTool({
	id: "scrape-competitor-page",
	description:
		"Scrape a competitor marketplace search results page via TSS (SnapIt). " +
		"Returns SERP markdown plus suggested PDP URLs. " +
		"Set followUpPdpCount (1–3) to automatically scrape top product detail pages for structured title, price, and features.",
	inputSchema: z.object({
		competitor: z
			.enum(COMPETITOR_MARKETPLACES)
			.describe("Marketplace to scrape (amazon, walmart, or alibaba)"),
		searchQuery: z
			.string()
			.describe('Product search terms, e.g. "32 inch Apple TV"'),
		url: z
			.string()
			.url()
			.optional()
			.describe(
				"Optional explicit search URL; if omitted, a marketplace search URL is built from competitor + searchQuery",
			),
		followUpPdpCount: z
			.number()
			.int()
			.min(0)
			.max(3)
			.optional()
			.describe(
				`After SERP scrape, auto-scrape up to N product detail pages (default ${DEFAULT_PDP_FOLLOW_UP_COUNT}). Use 0 for SERP only.`,
			),
	}),
	outputSchema: z.object({
		competitor: z.string(),
		url: z.string(),
		status: z.string(),
		markdown: z.string(),
		scrapeJobId: z.string(),
		suggestedPdpUrls: z.array(z.string()),
		pdpResults: z.array(scrapedPdpSchema).optional(),
	}),
	execute: async (inputData) => {
		const {
			competitor,
			searchQuery,
			url: explicitUrl,
			followUpPdpCount = DEFAULT_PDP_FOLLOW_UP_COUNT,
		} = inputData;

		const url =
			explicitUrl ?? buildCompetitorSearchUrl(competitor, searchQuery);

		const client = new TssScraperClient();
		const result = await client.scrapePage(url, {
			maxMarkdownLength: MAX_SERP_MARKDOWN_LENGTH,
		});

		const suggestedPdpUrls = extractPdpUrlsFromMarkdown(
			competitor,
			result.markdown,
			{ limit: 5, serpUrl: url },
		);

		let pdpResults:
			| Awaited<ReturnType<typeof scrapeMarketplacePdps>>
			| undefined;

		if (followUpPdpCount > 0 && suggestedPdpUrls.length > 0) {
			const pdpUrls = suggestedPdpUrls.slice(0, followUpPdpCount);
			pdpResults = await scrapeMarketplacePdps(client, competitor, pdpUrls);
		}

		return {
			competitor,
			url: result.url,
			status: result.status,
			markdown: result.markdown,
			scrapeJobId: result.jobId,
			suggestedPdpUrls,
			...(pdpResults?.length ? { pdpResults } : {}),
		};
	},
});
