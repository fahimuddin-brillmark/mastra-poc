import { TssScraperClient } from "./tss-scraper-client";
import {
	type CompetitorMarketplace,
	getPdpIncludeSelectors,
	parsePdpMarkdown,
} from "./marketplace-pdp";

export const MAX_PDP_MARKDOWN_LENGTH = 20_000;
export const DEFAULT_PDP_FOLLOW_UP_COUNT = 2;

export interface ScrapedPdpResult {
	url: string;
	status: string;
	scrapeJobId: string;
	title: string | null;
	price: number | null;
	currency: string;
	features: string[];
	markdown: string;
}

export async function scrapeMarketplacePdps(
	client: TssScraperClient,
	competitor: CompetitorMarketplace,
	urls: string[],
): Promise<ScrapedPdpResult[]> {
	const includeSelectors = getPdpIncludeSelectors(competitor);

	const results = await Promise.all(
		urls.map(async (url) => {
			const scrape = await client.scrapePage(url, {
				includeSelectors,
				maxMarkdownLength: MAX_PDP_MARKDOWN_LENGTH,
			});
			const parsed = parsePdpMarkdown(scrape.markdown);

			return {
				url: scrape.url,
				status: scrape.status,
				scrapeJobId: scrape.jobId,
				title: parsed.title,
				price: parsed.price,
				currency: parsed.currency,
				features: parsed.features,
				markdown: scrape.markdown,
			};
		}),
	);

	return results;
}
