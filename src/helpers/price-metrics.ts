/**
 * Fixed MVP exchange rates: 1 unit of foreign currency → USD.
 * Replace with a live rates API when moving beyond the POC.
 */
const EXCHANGE_RATE_TO_USD: Record<string, number> = {
	USD: 1,
	EUR: 1.08,
	GBP: 1.27,
	CNY: 0.14,
	MXN: 0.058,
	JPY: 0.0067,
	CAD: 0.74,
	AUD: 0.65,
};

export type PriceMetrics = {
	normalized_competitor_price_usd: number;
	absolute_difference: number;
	percentage_difference: number;
};

function roundMoney(value: number): number {
	return Math.round(value * 100) / 100;
}

function roundPercent(value: number): number {
	return Math.round(value * 100) / 100;
}

export function convertToUsd(amount: number, currency: string): number {
	const code = currency.trim().toUpperCase();
	const rate = EXCHANGE_RATE_TO_USD[code];

	if (rate === undefined) {
		const supported = Object.keys(EXCHANGE_RATE_TO_USD).join(", ");
		throw new Error(
			`Unsupported currency "${currency}". Supported: ${supported}`,
		);
	}

	return roundMoney(amount * rate);
}

/**
 * Compare a competitor listing to your base price (assumed USD).
 * Positive difference means the competitor is more expensive in USD terms.
 */
export function calculatePriceMetrics(
	basePrice: number,
	competitorPrice: number,
	competitorCurrency: string,
): PriceMetrics {
	const normalizedCompetitorPriceUsd = convertToUsd(
		competitorPrice,
		competitorCurrency,
	);
	const absoluteDifference = roundMoney(
		normalizedCompetitorPriceUsd - basePrice,
	);
	const percentageDifference = roundPercent(
		(absoluteDifference / basePrice) * 100,
	);

	return {
		normalized_competitor_price_usd: normalizedCompetitorPriceUsd,
		absolute_difference: absoluteDifference,
		percentage_difference: percentageDifference,
	};
}
