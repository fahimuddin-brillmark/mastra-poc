import type { ProductDetails } from "./firecrawl.types";

const FEATURE_SECTION_PATTERN =
	/^(?:features?|specifications?|product\s+details?|about\s+this\s+item|technical\s+details?|what'?s\s+in\s+the\s+box|key\s+features?|item\s+details?)\s*$/i;

const DESCRIPTION_SECTION_PATTERN =
	/^(?:description|product\s+description|overview|about\s+(?:the\s+)?(?:product|item))\s*$/i;

const BULLET_LINE_PATTERN = /^[\s>*-]*(?:[-*•]|\d+\.)\s+\S/;

function normalizeMarkdown(markdown: string): string {
	return markdown.replace(/\r\n/g, "\n").trim();
}

function parseMarkdownSections(markdown: string): Array<{ heading: string; body: string }> {
	const sections: Array<{ heading: string; body: string }> = [];
	const lines = markdown.split("\n");
	let currentHeading = "";
	let currentBody: string[] = [];

	const flush = () => {
		if (currentHeading || currentBody.length > 0) {
			sections.push({
				heading: currentHeading,
				body: currentBody.join("\n").trim(),
			});
		}
	};

	for (const line of lines) {
		const headingMatch = line.match(/^(#{1,6})\s+(.+?)\s*$/);
		if (headingMatch) {
			flush();
			currentHeading = headingMatch[2].trim();
			currentBody = [];
			continue;
		}

		currentBody.push(line);
	}

	flush();
	return sections;
}

function collectBulletBlocks(text: string): string[] {
	const blocks: string[] = [];
	const lines = text.split("\n");
	let currentBlock: string[] = [];

	const flush = () => {
		if (currentBlock.length > 0) {
			blocks.push(currentBlock.join("\n").trim());
			currentBlock = [];
		}
	};

	for (const line of lines) {
		if (BULLET_LINE_PATTERN.test(line.trim())) {
			currentBlock.push(line);
			continue;
		}

		flush();
	}

	flush();
	return blocks;
}

function joinSections(sections: string[]): string {
	return sections
		.map((section) => section.trim())
		.filter(Boolean)
		.join("\n\n");
}

function extractIntroDescription(markdown: string): string {
	const withoutLeadingTitle = markdown.replace(/^#\s+.+$/m, "").trim();
	const firstSectionBreak = withoutLeadingTitle.search(/\n#{1,6}\s+/);

	if (firstSectionBreak === -1) {
		return withoutLeadingTitle.slice(0, 2_000).trim();
	}

	return withoutLeadingTitle.slice(0, firstSectionBreak).trim();
}

export function parseProductMarkdown(
	markdown: string,
	metadataDescription?: string,
): ProductDetails {
	const normalized = normalizeMarkdown(markdown);
	const sections = parseMarkdownSections(normalized);

	const featureSections: string[] = [];
	const descriptionSections: string[] = [];

	for (const section of sections) {
		const heading = section.heading.trim();
		const body = section.body.trim();
		if (!body) {
			continue;
		}

		if (FEATURE_SECTION_PATTERN.test(heading)) {
			featureSections.push(`## ${heading}\n\n${body}`);
			continue;
		}

		if (DESCRIPTION_SECTION_PATTERN.test(heading)) {
			descriptionSections.push(body);
		}
	}

	if (featureSections.length === 0) {
		const bulletBlocks = collectBulletBlocks(normalized);
		if (bulletBlocks.length > 0) {
			featureSections.push(bulletBlocks.join("\n\n"));
		}
	}

	const metadataBlock = metadataDescription?.trim();
	const intro = extractIntroDescription(normalized);

	const descriptionParts = [metadataBlock, ...descriptionSections, intro].filter(
		Boolean,
	) as string[];

	const features = joinSections(featureSections);
	const description = joinSections(descriptionParts);

	return {
		features: features || "No structured features found on the product page.",
		description:
			description ||
			"No product description found on the page. Review the features section for context.",
	};
}
