import Firecrawl from "@mendable/firecrawl-js";
import type { FirecrawlScrapeOptions, ProductDetails } from "./firecrawl.types";
import { parseProductMarkdown } from "./firecrawl.utils";

export type { FirecrawlScrapeOptions, ProductDetails } from "./firecrawl.types";
export { parseProductMarkdown } from "./firecrawl.utils";

export function getFirecrawlClient(): Firecrawl {
	const apiKey = process.env.FIRECRAWL_API_KEY;
	if (!apiKey) {
		throw new Error("FIRECRAWL_API_KEY environment variable is not set");
	}

	return new Firecrawl({
		apiKey,
		// This handles the local/self-hosted Firecrawl scenario exactly as the guide suggests
		apiUrl: process.env.FIRECRAWL_API_URL,
	});
}

export async function scrapeUrl(
	url: string,
	options?: FirecrawlScrapeOptions,
): Promise<{ markdown: string; metadataDescription?: string }> {
	const firecrawl = getFirecrawlClient();

	console.log(url);

	const result = await firecrawl.scrape(url, {
		formats: ["markdown"],
		onlyMainContent: options?.onlyMainContent ?? true,
		waitFor: options?.waitFor ?? 2_000,
	});
	console.log(JSON.stringify(result, null, 2));

	const markdown = result.markdown?.trim();
	if (!markdown) {
		throw new Error("Firecrawl returned no markdown content for the URL");
	}

	return {
		markdown,
		metadataDescription: result.metadata?.description,
	};
}

export async function extractProductDetails(
	url: string,
	options?: FirecrawlScrapeOptions,
): Promise<ProductDetails> {
	const { markdown, metadataDescription } = await scrapeUrl(url, options);
	return parseProductMarkdown(markdown, metadataDescription);
}
