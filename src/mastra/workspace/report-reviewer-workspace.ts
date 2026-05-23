import { LocalFilesystem, Workspace } from "@mastra/core/workspace";
import { WORKSPACE_ROOT } from "./constants";

export const reportReviewerWorkspace = new Workspace({
	id: "report-reviewer-workspace",
	name: "Report Reviewer Workspace",
	filesystem: new LocalFilesystem({
		basePath: WORKSPACE_ROOT,
		readOnly: true,
	}),
	skills: ["skills/price-report-reviewer"],
});
