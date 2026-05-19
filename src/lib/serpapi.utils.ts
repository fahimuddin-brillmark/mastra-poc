import type {
	AmazonOrganicResult,
	GoogleShoppingResult,
	GoogleShoppingSearchResponse,
	ProductSearchResult,
	RankedProductSearchOutput,
	RankProductSearchOptions,
	SerpApiErrorResponse,
	WalmartOrganicResult,
} from "./serpapi.types";

export const SERPAPI_BASE_URL = "https://serpapi.com/search.json";

export const DEFAULT_PRICE_BAND_MIN_RATIO = 0.3;
export const DEFAULT_PRICE_BAND_MAX_RATIO = 3;
export const DEFAULT_SEARCH_RESULT_LIMIT = 5;

const STOP_WORDS = new Set([
	"a",
	"an",
	"the",
	"and",
	"or",
	"for",
	"with",
	"in",
	"on",
	"at",
	"to",
	"of",
	"by",
]);

type ScoredResult = {
	product: ProductSearchResult;
	searchRank: number;
	titleScore: number;
	priceScore: number;
	compositeScore: number;
};

export function getSerpApiKey(): string {
	const apiKey = process.env.SERPAPI_API_KEY;
	if (!apiKey) {
		throw new Error("SERPAPI_API_KEY environment variable is not set");
	}
	return apiKey;
}

export async function fetchSerpApi<T>(
	params: Record<string, string | number | boolean | undefined>,
): Promise<T> {
	const searchParams = new URLSearchParams({
		api_key: getSerpApiKey(),
		output: "json",
	});

	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== null) {
			searchParams.set(key, String(value));
		}
	}

	const response = await fetch(
		`${SERPAPI_BASE_URL}?${searchParams.toString()}`,
	);

	if (!response.ok) {
		throw new Error(`SerpApi request failed with status ${response.status}`);
	}

	const data = (await response.json()) as T & SerpApiErrorResponse;

	if (data.error) {
		throw new Error(`SerpApi error: ${data.error}`);
	}

	return data;
}

export function parseCurrencyFromPrice(price?: string): string {
	if (!price) {
		return "USD";
	}

	if (price.includes("€")) {
		return "EUR";
	}
	if (price.includes("£")) {
		return "GBP";
	}
	if (price.includes("¥") || price.includes("CN¥")) {
		return "CNY";
	}
	if (price.includes("MX$")) {
		return "MXN";
	}

	return "USD";
}

/**
 * Map API rows to products while preserving SerpApi array order.
 * Skipped invalid rows are dropped without reordering survivors.
 */
export function mapOrganicResults<T>(
	results: T[],
	toProduct: (item: T) => ProductSearchResult | null,
): ProductSearchResult[] {
	const products: ProductSearchResult[] = [];
	for (const item of results) {
		const product = toProduct(item);
		if (product) {
			products.push(product);
		}
	}
	return products;
}

export function mapAmazonResults(
	results: AmazonOrganicResult[] = [],
): ProductSearchResult[] {
	return mapOrganicResults(results, (item) => {
		const title = item.title;
		const url = item.link_clean ?? item.link;
		if (!title || !url) {
			return null;
		}
		return {
			title,
			price: item.extracted_price ?? null,
			currency: parseCurrencyFromPrice(item.price),
			url,
			thumbnail: item.thumbnail ?? null,
		};
	});
}

export function mapWalmartResults(
	results: WalmartOrganicResult[] = [],
): ProductSearchResult[] {
	return mapOrganicResults(results, (item) => {
		const title = item.title;
		const url = item.product_page_url;
		if (!title || !url) {
			return null;
		}
		return {
			title,
			price: item.primary_offer?.offer_price ?? null,
			currency: item.primary_offer?.currency ?? "USD",
			url,
			thumbnail: item.thumbnail ?? null,
		};
	});
}

/**
 * Merge Google Shopping blocks in SerpApi priority order.
 * Primary ranked list first; inline and categorized blocks follow.
 */
export function collectGoogleShoppingResults(
	data: GoogleShoppingSearchResponse,
): GoogleShoppingResult[] {
	const results: GoogleShoppingResult[] = [
		...(data.shopping_results ?? []),
		...(data.inline_shopping_results ?? []),
	];

	for (const category of data.categorized_shopping_results ?? []) {
		results.push(...(category.shopping_results ?? []));
	}

	return results;
}

export function mapGoogleShoppingResults(
	results: GoogleShoppingResult[] = [],
): ProductSearchResult[] {
	return mapOrganicResults(results, (item) => {
		const title = item.title;
		const url = item.link ?? item.product_link;
		if (!title || !url) {
			return null;
		}
		return {
			title,
			price: item.extracted_price ?? null,
			currency: parseCurrencyFromPrice(item.price),
			url,
			thumbnail: item.thumbnail ?? null,
		};
	});
}

export function tokenizeForMatching(text: string): string[] {
	return text
		.toLowerCase()
		.split(/[^a-z0-9]+/)
		.filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

export function scoreTitleTokenOverlap(query: string, title: string): number {
	const queryTokens = tokenizeForMatching(query);
	if (queryTokens.length === 0) {
		return 1;
	}

	const titleTokens = new Set(tokenizeForMatching(title));
	const matched = queryTokens.filter((token) => titleTokens.has(token));
	return matched.length / queryTokens.length;
}

export function scorePriceBand(
	price: number | null,
	basePrice: number | undefined,
	minRatio = DEFAULT_PRICE_BAND_MIN_RATIO,
	maxRatio = DEFAULT_PRICE_BAND_MAX_RATIO,
): number {
	if (basePrice === undefined || basePrice <= 0) {
		return 1;
	}
	if (price === null || price <= 0) {
		return 0.5;
	}

	const ratio = price / basePrice;
	if (ratio >= minRatio && ratio <= maxRatio) {
		return 1;
	}

	if (ratio < minRatio) {
		const distance = minRatio - ratio;
		return Math.max(0, 1 - distance / minRatio);
	}

	const distance = ratio - maxRatio;
	return Math.max(0, 1 - distance / maxRatio);
}

function scoreSearchRank(searchRank: number, totalCount: number): number {
	if (totalCount <= 1) {
		return 1;
	}
	return 1 - searchRank / (totalCount - 1);
}

function scoreProduct(
	product: ProductSearchResult,
	searchRank: number,
	totalCount: number,
	options: RankProductSearchOptions,
): ScoredResult {
	const titleScore = scoreTitleTokenOverlap(options.query, product.title);
	const priceScore = scorePriceBand(
		product.price,
		options.basePrice,
		options.priceBandMinRatio,
		options.priceBandMaxRatio,
	);
	const rankScore = scoreSearchRank(searchRank, totalCount);

	const compositeScore =
		titleScore * 0.5 + priceScore * 0.35 + rankScore * 0.15;

	return {
		product,
		searchRank,
		titleScore,
		priceScore,
		compositeScore,
	};
}

/**
 * Rank products by relevance (title tokens, price band, original search order) and return top N.
 * Input order must match SerpApi/marketplace order: index 0 is the top organic result.
 */
export function rankAndLimitProductResults(
	products: ProductSearchResult[],
	options: RankProductSearchOptions,
): RankedProductSearchOutput {
	const limit = options.limit ?? DEFAULT_SEARCH_RESULT_LIMIT;
	const totalFound = products.length;

	if (totalFound === 0) {
		return { results: [], meta: { totalFound: 0, returned: 0 } };
	}

	const scored = products.map((product, searchRank) =>
		scoreProduct(product, searchRank, totalFound, options),
	);

	scored.sort((a, b) => {
		if (b.compositeScore !== a.compositeScore) {
			return b.compositeScore - a.compositeScore;
		}
		return a.searchRank - b.searchRank;
	});

	const results = scored.slice(0, limit).map((entry) => entry.product);

	return {
		results,
		meta: { totalFound, returned: results.length },
	};
}
