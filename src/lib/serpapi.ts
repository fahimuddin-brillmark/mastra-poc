import type {
	AmazonSearchResponse,
	GoogleShoppingSearchResponse,
	ProductSearchResult,
	RankedProductSearchOutput,
	SearchPlatform,
	SearchProductsOptions,
	WalmartSearchResponse,
} from "./serpapi.types";
import {
	collectGoogleShoppingResults,
	fetchSerpApi,
	mapAmazonResults,
	mapGoogleShoppingResults,
	mapWalmartResults,
	rankAndLimitProductResults,
} from "./serpapi.utils";

export type {
	ProductSearchResult,
	RankedProductSearchMeta,
	RankedProductSearchOutput,
	RankProductSearchOptions,
	SearchPlatform,
	SearchProductsOptions,
} from "./serpapi.types";

export {
	DEFAULT_SEARCH_RESULT_LIMIT,
	rankAndLimitProductResults,
} from "./serpapi.utils";

export async function searchAmazon(
	query: string,
): Promise<ProductSearchResult[]> {
	const data = await fetchSerpApi<AmazonSearchResponse>({
		engine: "amazon",
		amazon_domain: "amazon.com",
		k: query,
	});

	return mapAmazonResults(data.organic_results);
}

export async function searchWalmart(
	query: string,
): Promise<ProductSearchResult[]> {
	const data = await fetchSerpApi<WalmartSearchResponse>({
		engine: "walmart",
		walmart_domain: "walmart.com",
		query,
	});

	return mapWalmartResults(data.organic_results);
}

export async function searchGoogleShopping(
	query: string,
): Promise<ProductSearchResult[]> {
	const data = await fetchSerpApi<GoogleShoppingSearchResponse>({
		engine: "google_shopping",
		q: query,
		google_domain: "google.com",
		gl: "us",
		hl: "en",
	});

	return mapGoogleShoppingResults(collectGoogleShoppingResults(data));
}

async function fetchRawSearchResults(
	platform: SearchPlatform,
	query: string,
): Promise<ProductSearchResult[]> {
	switch (platform) {
		case "amazon":
			return searchAmazon(query);
		case "walmart":
			return searchWalmart(query);
		case "google_shopping":
			return searchGoogleShopping(query);
		default: {
			const exhaustiveCheck: never = platform;
			throw new Error(`Unsupported search platform: ${exhaustiveCheck}`);
		}
	}
}

export async function searchProducts(
	platform: SearchPlatform,
	query: string,
	options?: SearchProductsOptions,
): Promise<RankedProductSearchOutput> {
	const rawResults = await fetchRawSearchResults(platform, query);

	return rankAndLimitProductResults(rawResults, {
		query,
		limit: options?.limit,
		basePrice: options?.basePrice,
		priceBandMinRatio: options?.priceBandMinRatio,
		priceBandMaxRatio: options?.priceBandMaxRatio,
	});
}
