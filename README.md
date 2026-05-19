# Mastra POC

A Proof of Concept (POC) project demonstrating the capabilities of the [Mastra](https://mastra.ai/) framework. This project features an AI-powered Weather Agent that can fetch real-time weather forecasts and dynamically suggest activities based on the weather conditions.

## Features

- **AI Weather Agent**: Powered by OpenAI (`gpt-4o-mini`) to provide intelligent weather summaries and activity planning.
- **Mastra Workflows**: Chains together multiple steps (fetching weather -> planning activities) using `@mastra/core/workflows`.
- **Custom Tools**: Integrates with the [Open-Meteo API](https://open-meteo.com/) for accurate geocoding and weather forecasting.
- **Local Storage**: Uses LibSQL and DuckDB for local storage and observability data.
- **Observability**: Built-in logging with Pino and Mastra's observability exporters.

## Prerequisites

- **Node.js**: `>= 20.9.0`
- **Bun**: This project strictly uses [Bun](https://bun.sh/) as the package manager.
- **OpenAI API Key**: Required for the AI agent to generate responses.

## Setup Instructions

1. **Install Dependencies**
  Use Bun to install the project dependencies:
2. **Environment Variables**
  Copy the example environment file and add your OpenAI API key:
   Open the `.env` file and set your `OPENAI_API_KEY`:

## Running the Project

Mastra provides a CLI to run the development server and build the project.

- **Development Server**:
  ```bash
  bun run dev
  ```
- **Build for Production**:
  ```bash
  bun run build
  ```
- **Start Production Server**:
  ```bash
  bun run start
  ```

## Mastra Studio & Editor

When you run the development server (`bun run dev`), it also launches **Mastra Studio**, a powerful local UI for managing your AI features. 

Inside Mastra Studio, you can use the **visual editor** feature to:
- Visually inspect, prompt, and test your Agents (like the `weather-agent`) in a chat interface.
- Run and debug Workflows (like the `weather-workflow`) step-by-step to see data pass between steps.
- View observability logs, traces, and memory states in real-time.
- Manage and inspect your local DuckDB/LibSQL storage directly from the browser.

## Project Structure

- `src/mastra/index.ts`: The main entry point that initializes the Mastra instance, configuring agents, workflows, tools, storage, and observability.
- `src/mastra/agents/weather-agent.ts`: Defines the `Weather Agent` with its instructions, model (`gpt-4o-mini`), and associated tools.
- `src/mastra/tools/weather-tool.ts`: The custom tool used by the agent to fetch weather data.
- `src/mastra/workflows/weather-workflow.ts`: A multi-step workflow that first fetches the weather for a given city and then streams AI-generated activity suggestions based on that forecast.

## Technologies Used

- [Mastra](https://mastra.ai/) - AI Agent Framework
- [OpenAI](https://openai.com/) - LLM Provider
- [Zod](https://zod.dev/) - Schema Validation
- [Bun](https://bun.sh/) - JavaScript Runtime & Package Manager
- [Open-Meteo](https://open-meteo.com/) - Free Weather API

