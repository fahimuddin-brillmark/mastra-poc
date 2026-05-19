export type SearchPlatform = 'amazon' | 'walmart' | 'google_shopping';

export type SearchProductsOptions = {
  /** Max results after relevance ranking (default 5). */
  limit?: number;
  /** User's listed price (USD) for price-band scoring. */
  basePrice?: number;
  priceBandMinRatio?: number;
  priceBandMaxRatio?: number;
};

export type RankProductSearchOptions = {
  query: string;
  limit?: number;
  basePrice?: number;
  priceBandMinRatio?: number;
  priceBandMaxRatio?: number;
};

export type RankedProductSearchMeta = {
  totalFound: number;
  returned: number;
};

export type RankedProductSearchOutput = {
  results: ProductSearchResult[];
  meta: RankedProductSearchMeta;
};

export type ProductSearchResult = {
  title: string;
  price: number | null;
  currency: string;
  url: string;
  thumbnail: string | null;
};

export type SerpApiErrorResponse = {
  error?: string;
};

export type AmazonOrganicResult = {
  title?: string;
  extracted_price?: number;
  price?: string;
  link_clean?: string;
  link?: string;
  thumbnail?: string;
};

export type AmazonSearchResponse = SerpApiErrorResponse & {
  organic_results?: AmazonOrganicResult[];
};

export type WalmartOrganicResult = {
  title?: string;
  thumbnail?: string;
  product_page_url?: string;
  primary_offer?: {
    offer_price?: number;
    currency?: string;
  };
};

export type WalmartSearchResponse = SerpApiErrorResponse & {
  organic_results?: WalmartOrganicResult[];
};

export type GoogleShoppingResult = {
  title?: string;
  extracted_price?: number;
  price?: string;
  link?: string;
  product_link?: string;
  thumbnail?: string;
};

export type GoogleShoppingSearchResponse = SerpApiErrorResponse & {
  shopping_results?: GoogleShoppingResult[];
  inline_shopping_results?: GoogleShoppingResult[];
  categorized_shopping_results?: {
    shopping_results?: GoogleShoppingResult[];
  }[];
};
