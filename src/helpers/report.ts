import type { WorkspaceFilesystem } from "@mastra/core/workspace";
import { formatTimestamp } from "../mastra/utils/date";
import { slugifyTitle } from "../mastra/utils/string";
import { REPORTS_DIR } from "../mastra/workspace/constants";

export function buildReportFilename(title: string, date = new Date()): string {
	const slug = slugifyTitle(title) || "price-comparison-report";
	return `${formatTimestamp(date)}_${slug}.md`;
}

export async function saveReport(
	filesystem: WorkspaceFilesystem | undefined,
	title: string,
	content: string,
): Promise<{ path: string; filename: string }> {
	if (!filesystem) {
		throw new Error(
			"Workspace filesystem is not available. Attach a workspace to the report writer agent.",
		);
	}

	if (filesystem.readOnly) {
		throw new Error("Workspace filesystem is read-only.");
	}

	const filename = buildReportFilename(title);
	const reportPath = `${REPORTS_DIR}/${filename}`;

	await filesystem.mkdir(REPORTS_DIR, { recursive: true });
	await filesystem.writeFile(reportPath, content, {
		recursive: true,
		overwrite: false,
		mimeType: "text/markdown",
	});

	return {
		path: reportPath,
		filename,
	};
}
