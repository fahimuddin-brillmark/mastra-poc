const DEFAULT_API_URL = "https://api.snapit.intelliconvert.ai";
const DEFAULT_EXCLUDE_SELECTORS = [
	".header",
	".footer",
	".nav",
	".navbar",
	".sidebar",
	".cookie-banner",
];

const MAX_POLL_ATTEMPTS = 40;
const INITIAL_POLL_DELAY_MS = 2000;
const MAX_POLL_DELAY_MS = 15000;

export interface TriggerScrapeResponse {
	status: string;
	job_id: string;
	req_id?: string;
	timestamp?: string;
}

export interface PreviewResponse {
	status: string;
	job_id: string;
	metadata?: Record<string, unknown>;
	result?: Record<string, string>;
}

export interface ScrapeOptions {
	includeSelectors?: string[];
	excludeSelectors?: string[];
	region?: string;
}

export interface TssScraperConfig {
	apiUrl: string;
	apiKey: string;
	user: string;
	project: string;
}

export interface ScrapePageResult {
	url: string;
	jobId: string;
	status: string;
	markdown: string;
}

export function loadTssScraperConfigFromEnv(
	overrides?: Partial<TssScraperConfig>,
): TssScraperConfig {
	const apiUrl =
		overrides?.apiUrl ?? process.env.TSS_API_URL ?? DEFAULT_API_URL;
	const apiKey = overrides?.apiKey ?? process.env.TSS_API_KEY;
	const user = overrides?.user ?? process.env.TSS_USER;
	const project = overrides?.project ?? process.env.TSS_PROJECT;

	if (!apiKey) {
		throw new Error("TSS_API_KEY environment variable is required");
	}
	if (!user) {
		throw new Error("TSS_USER environment variable is required");
	}
	if (!project) {
		throw new Error("TSS_PROJECT environment variable is required");
	}

	return {
		apiUrl: apiUrl.replace(/\/+$/, ""),
		apiKey,
		user,
		project,
	};
}

export class TssScraperClient {
	private readonly apiUrl: string;
	private readonly apiKey: string;
	private readonly user: string;
	private readonly project: string;

	constructor(config?: TssScraperConfig) {
		const resolved = config ?? loadTssScraperConfigFromEnv();
		this.apiUrl = resolved.apiUrl.replace(/\/+$/, "");
		this.apiKey = resolved.apiKey;
		this.user = resolved.user;
		this.project = resolved.project;
	}

	private get headers(): Record<string, string> {
		return {
			"Content-Type": "application/json",
			"x-api-key": this.apiKey,
		};
	}

	async triggerScrapeJob(
		url: string,
		options?: ScrapeOptions & { user?: string; project?: string },
	): Promise<TriggerScrapeResponse> {
		const body: Record<string, unknown> = {
			user: options?.user ?? this.user,
			project: options?.project ?? this.project,
			url,
			exclude_selectors: options?.excludeSelectors ?? DEFAULT_EXCLUDE_SELECTORS,
		};

		if (options?.includeSelectors?.length) {
			body.include_selectors = options.includeSelectors;
		}
		if (options?.region) {
			body.region = options.region;
		}

		const response = await fetch(`${this.apiUrl}/scrape`, {
			method: "POST",
			headers: this.headers,
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			const text = await response.text();
			throw new Error(`TSS /scrape failed (${response.status}): ${text}`);
		}

		return (await response.json()) as TriggerScrapeResponse;
	}

	async getPreview(
		jobId: string,
		scope?: { user?: string; project?: string },
	): Promise<PreviewResponse> {
		const params = new URLSearchParams({
			user: scope?.user ?? this.user,
			project: scope?.project ?? this.project,
			job_id: jobId,
		});

		const response = await fetch(`${this.apiUrl}/preview?${params}`, {
			method: "GET",
			headers: this.headers,
		});

		if (!response.ok) {
			const text = await response.text();
			throw new Error(`TSS /preview failed (${response.status}): ${text}`);
		}

		return (await response.json()) as PreviewResponse;
	}

	async fetchMarkdownContent(presignedUrl: string): Promise<string> {
		const response = await fetch(presignedUrl);

		if (!response.ok) {
			throw new Error(
				`Failed to fetch markdown from presigned URL (${response.status})`,
			);
		}

		return response.text();
	}

	private async pollUntilReady(
		jobId: string,
		scope?: { user?: string; project?: string },
	): Promise<PreviewResponse> {
		let delay = INITIAL_POLL_DELAY_MS;

		for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
			await new Promise((resolve) => setTimeout(resolve, delay));

			const preview = await this.getPreview(jobId, scope);

			if (preview.status === "complete" || preview.status === "completed") {
				return preview;
			}

			if (preview.status === "failed") {
				throw new Error(
					`Scrape job ${jobId} failed: ${JSON.stringify(preview.metadata)}`,
				);
			}

			delay = Math.min(delay * 1.5, MAX_POLL_DELAY_MS);
		}

		throw new Error(
			`Scrape job ${jobId} timed out after ${MAX_POLL_ATTEMPTS} poll attempts`,
		);
	}

	/**
	 * Trigger a scrape job, poll /preview until complete, and return markdown content.
	 */
	async scrapePage(
		url: string,
		options?: ScrapeOptions & {
			user?: string;
			project?: string;
			maxMarkdownLength?: number;
		},
	): Promise<ScrapePageResult> {
		const scope = { user: options?.user, project: options?.project };
		const trigger = await this.triggerScrapeJob(url, options);
		const preview = await this.pollUntilReady(trigger.job_id, scope);

		const markdownUrl = preview.result?.markdown;
		if (!markdownUrl) {
			throw new Error(
				`No markdown URL in preview response for job ${trigger.job_id}`,
			);
		}

		let markdown = (await this.fetchMarkdownContent(markdownUrl)).trim();

		if (
			options?.maxMarkdownLength !== undefined &&
			markdown.length > options.maxMarkdownLength
		) {
			markdown = `${markdown.slice(0, options.maxMarkdownLength)}\n\n[truncated]`;
		}

		return {
			url,
			jobId: trigger.job_id,
			status: preview.status,
			markdown,
		};
	}
}
