import { LocalFilesystem, Workspace } from "@mastra/core/workspace";
import { WORKSPACE_ROOT } from "./constants";

// const disabledWorkspaceTools = {
//  ...Object.fromEntries(
//      Object.values(WORKSPACE_TOOLS.FILESYSTEM).map((toolName) => [
//          toolName,
//          { enabled: false },
//      ]),
//  ),
//  [WORKSPACE_TOOLS.SEARCH.SEARCH]: { enabled: false },
//  [WORKSPACE_TOOLS.SEARCH.INDEX]: { enabled: false },
//  [WORKSPACE_TOOLS.SANDBOX.EXECUTE_COMMAND]: { enabled: false },
//  [WORKSPACE_TOOLS.SANDBOX.GET_PROCESS_OUTPUT]: { enabled: false },
//  [WORKSPACE_TOOLS.SANDBOX.KILL_PROCESS]: { enabled: false },
//  [WORKSPACE_TOOLS.LSP.LSP_INSPECT]: { enabled: false },
// };

export const reportWriterWorkspace = new Workspace({
	id: "report-writer-workspace",
	name: "Report Writer Workspace",
	filesystem: new LocalFilesystem({
		basePath: WORKSPACE_ROOT,
		readOnly: false,
	}),
	skills: ["skills/price-report-writer"],
	// tools: disabledWorkspaceTools,
});
