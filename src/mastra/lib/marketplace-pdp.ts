export const COMPETITOR_MARKETPLACES = [
	"amazon",
	"walmart",
	"alibaba",
] as const;

export type CompetitorMarketplace = (typeof COMPETITOR_MARKETPLACES)[number];

const MARKETPLACE_ORIGINS: Record<CompetitorMarketplace, string> = {
	amazon: "https://www.amazon.com",
	walmart: "https://www.walmart.com",
	alibaba: "https://www.alibaba.com",
};

const AMAZON_ASIN_IN_PATH = /\/dp\/([A-Z0-9]{10})(?:[/?]|$)/i;
const WALMART_IP_PATH = /\/ip\/([^/?#\s)]+)/i;
const ALIBABA_PRODUCT_PATH =
	/(?:\/product-detail\/[^/?#\s)]+|\/offer\/\d+\.html)/i;

export interface ParsedPdpProduct {
	title: string | null;
	price: number | null;
	currency: string;
	features: string[];
}

export function getMarketplaceOrigin(
	competitor: CompetitorMarketplace,
): string {
	return MARKETPLACE_ORIGINS[competitor];
}

export function getPdpIncludeSelectors(
	competitor: CompetitorMarketplace,
): string[] {
	switch (competitor) {
		case "amazon":
			return [
				"#ppd",
				"#centerCol",
				"#productTitle",
				"#feature-bullets",
				"#productDetails_feature_div",
				"#productDetails_techSpec_section_1",
				"#corePrice_feature_div",
				"#acrPopover",
			];
		case "walmart":
			return [
				'[data-testid="product-page"]',
				'[data-testid="product-title"]',
				'[data-item-id="price"]',
				"#about-this-item",
				'[data-testid="product-description-content"]',
			];
		case "alibaba":
			return [
				".product-detail",
				".module-price",
				".product-title",
				".product-params",
				".detail-desc",
			];
	}
}

/**
 * Resolve a PDP path or URL from SERP markdown into a canonical product URL.
 */
export function normalizePdpUrl(
	competitor: CompetitorMarketplace,
	href: string,
	serpUrl?: string,
): string | null {
	const trimmed = href.trim();
	if (!trimmed || trimmed.startsWith("javascript:")) {
		return null;
	}

	const baseOrigin =
		serpUrl != null
			? new URL(serpUrl).origin
			: getMarketplaceOrigin(competitor);

	let absolute: string;
	try {
		absolute = new URL(trimmed, baseOrigin).href;
	} catch {
		return null;
	}

	switch (competitor) {
		case "amazon": {
			const match = absolute.match(AMAZON_ASIN_IN_PATH);
			if (!match) return null;
			return `https://www.amazon.com/dp/${match[1]}`;
		}
		case "walmart": {
			if (!WALMART_IP_PATH.test(absolute)) return null;
			const parsed = new URL(absolute);
			const ipMatch = parsed.pathname.match(/^\/ip\/([^/]+)/);
			if (!ipMatch) return null;
			return `https://www.walmart.com/ip/${ipMatch[1]}`;
		}
		case "alibaba": {
			if (!ALIBABA_PRODUCT_PATH.test(absolute)) return null;
			const parsed = new URL(absolute);
			return `${parsed.origin}${parsed.pathname}`;
		}
	}
}

/**
 * Extract unique PDP URLs from marketplace search-result markdown.
 */
export function extractPdpUrlsFromMarkdown(
	competitor: CompetitorMarketplace,
	markdown: string,
	options?: { limit?: number; serpUrl?: string },
): string[] {
	const limit = options?.limit ?? 5;
	const seen = new Set<string>();
	const urls: string[] = [];

	const candidates: string[] = [];
	const linkPattern = /\]\(([^)]+)\)/g;
	let linkMatch: RegExpExecArray | null = linkPattern.exec(markdown);
	while (linkMatch !== null) {
		candidates.push(linkMatch[1]);
		linkMatch = linkPattern.exec(markdown);
	}

	const pathPatterns: RegExp[] = [];
	switch (competitor) {
		case "amazon":
			pathPatterns.push(/\/dp\/[A-Z0-9]{10}[^)\s]*/gi);
			break;
		case "walmart":
			pathPatterns.push(/\/ip\/[^/?#\s)]+/gi);
			break;
		case "alibaba":
			pathPatterns.push(/\/product-detail\/[^/?#\s)]+/gi, /\/offer\/\d+\.html/gi);
			break;
	}

	for (const pattern of pathPatterns) {
		const matches = markdown.match(pattern) ?? [];
		candidates.push(...matches);
	}

	for (const candidate of candidates) {
		const normalized = normalizePdpUrl(competitor, candidate, options?.serpUrl);
		if (normalized && !seen.has(normalized)) {
			seen.add(normalized);
			urls.push(normalized);
			if (urls.length >= limit) break;
		}
	}

	return urls;
}

const PRICE_PATTERN =
	/(?:USD\s*)?\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)|(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*USD/gi;

function parsePriceValue(raw: string): number | null {
	const cleaned = raw.replace(/,/g, "");
	const value = Number.parseFloat(cleaned);
	return Number.isFinite(value) ? value : null;
}

export function extractPricesFromMarkdown(markdown: string): number[] {
	const prices: number[] = [];
	let match: RegExpExecArray | null = PRICE_PATTERN.exec(markdown);
	while (match !== null) {
		const raw = match[1] ?? match[2];
		if (raw) {
			const value = parsePriceValue(raw);
			if (value != null && value > 0) {
				prices.push(value);
			}
		}
		match = PRICE_PATTERN.exec(markdown);
	}
	return prices;
}

function extractTitleFromMarkdown(markdown: string): string | null {
	const headingMatch = markdown.match(/^#\s+(.+)$/m);
	if (headingMatch?.[1]) {
		const title = headingMatch[1].trim();
		if (title.length > 3 && !title.toLowerCase().includes("amazon.com")) {
			return title;
		}
	}

	const lines = markdown.split("\n").map((line) => line.trim());
	for (const line of lines) {
		if (line.length < 10 || line.length > 300) continue;
		if (line.startsWith("!") || line.startsWith("[") || line.startsWith("*"))
			continue;
		if (/^(skip to|delivering to|sign in|search)/i.test(line)) continue;
		if (/^\$/.test(line)) continue;
		return line.replace(/^#+\s*/, "");
	}

	return null;
}

function extractFeatureBullets(markdown: string): string[] {
	const features: string[] = [];
	const seen = new Set<string>();

	const addFeature = (text: string) => {
		const normalized = text.replace(/\s+/g, " ").trim();
		if (normalized.length < 8 || normalized.length > 400) return;
		if (seen.has(normalized)) return;
		seen.add(normalized);
		features.push(normalized);
	};

	const bulletPattern = /^[\s]*(?:[-*]|\d+\.)\s+(.+)$/gm;
	let bulletMatch: RegExpExecArray | null = bulletPattern.exec(markdown);
	while (bulletMatch !== null) {
		const text = bulletMatch[1].replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
		addFeature(text);
		bulletMatch = bulletPattern.exec(markdown);
	}

	const specPattern = /^([A-Za-z][^:\n]{2,60}):\s{2,}(.+)$/gm;
	let specMatch: RegExpExecArray | null = specPattern.exec(markdown);
	while (specMatch !== null) {
		addFeature(`${specMatch[1].trim()}: ${specMatch[2].trim()}`);
		specMatch = specPattern.exec(markdown);
	}

	return features.slice(0, 40);
}

export function parsePdpMarkdown(markdown: string): ParsedPdpProduct {
	const prices = extractPricesFromMarkdown(markdown);
	const title = extractTitleFromMarkdown(markdown);

	return {
		title,
		price: prices[0] ?? null,
		currency: "USD",
		features: extractFeatureBullets(markdown),
	};
}
