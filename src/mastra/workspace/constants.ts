// import path from "node:path";
// import { fileURLToPath } from "node:url";

// const currentDir = path.dirname(fileURLToPath(import.meta.url));

// export const WORKSPACE_ROOT = path.resolve(currentDir, "../public");
export const WORKSPACE_ROOT = process.cwd();
export const REPORTS_DIR = `${WORKSPACE_ROOT}/reports`;
