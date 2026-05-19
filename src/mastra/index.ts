import { Mastra } from "@mastra/core/mastra";
import { MastraCompositeStore } from "@mastra/core/storage";
import { DuckDBStore } from "@mastra/duckdb";
import { LibSQLStore } from "@mastra/libsql";
import { PinoLogger } from "@mastra/loggers";
import {
	MastraStorageExporter,
	Observability,
	SensitiveDataFilter,
} from "@mastra/observability";
import { weatherAgent } from "./agents/weather-agent";
import { scrapeCompetitorPageTool } from "./tools/scrape-competitor-page-tool";
import { scrapeProductDetailPageTool } from "./tools/scrape-product-detail-page-tool";
import { weatherWorkflow } from "./workflows/weather-workflow";

export const mastra = new Mastra({
	workflows: { weatherWorkflow },
	agents: { weatherAgent },
	tools: { scrapeCompetitorPageTool, scrapeProductDetailPageTool },
	scorers: {},
	// storage: new LibSQLStore({
	// 	// stores observability, scores, ... into memory storage, if it needs to persist, change to file:../mastra.db
	// 	id: "mastra-storage",
	// 	url: ":memory:",
	// }),
	storage: new MastraCompositeStore({
		id: "composite-storage",
		default: new LibSQLStore({
			id: "mastra-storage",
			url: "file:./mastra.db",
		}),
		domains: {
			observability: await new DuckDBStore().getStore("observability"),
		},
	}),
	logger: new PinoLogger({
		name: "Mastra",
		level: "info",
	}),
	observability: new Observability({
		configs: {
			default: {
				serviceName: "mastra",
				exporters: [
					new MastraStorageExporter(), // Persists observability events to Mastra Storage
				],
				spanOutputProcessors: [
					new SensitiveDataFilter(), // Redacts sensitive data like passwords, tokens, keys
				],
			},
		},
	}),
});
