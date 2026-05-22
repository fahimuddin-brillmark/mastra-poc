import { Mastra } from "@mastra/core/mastra";
import { MastraCompositeStore } from "@mastra/core/storage";
import { DuckDBStore } from "@mastra/duckdb";
import { MastraEditor } from "@mastra/editor";
import { LibSQLStore } from "@mastra/libsql";
import { PinoLogger } from "@mastra/loggers";
import {
	MastraStorageExporter,
	Observability,
	SensitiveDataFilter,
} from "@mastra/observability";
import { pricingComparisonAgent } from "./agents/price-comparison-agent";
import { weatherAgent } from "./agents/weather-agent";
import { brandSimilarityScorer } from "./scorers/brand-similarity-scorer";
import { recommendationScorer } from "./scorers/recommendation-scorer";
import {
	weatherToolCallAccuracyCodeScorer,
	weatherToolCallAccuracyLlmScorer,
} from "./scorers/weather-tool-call-accuracy-scorers";
import { weatherWorkflow } from "./workflows/weather-workflow";

export const mastra = new Mastra({
	workflows: { weatherWorkflow },
	agents: { weatherAgent, pricingComparisonAgent },
	tools: {},
	scorers: {
		brandSimilarityScorer,
		weatherToolCallAccuracyCodeScorer,
		weatherToolCallAccuracyLlmScorer,
		recommendationScorer,
	},
	editor: new MastraEditor(),
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
