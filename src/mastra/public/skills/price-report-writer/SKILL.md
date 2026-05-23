---
name: price-report-writer
description: "Write structured price comparison analysis reports from a provided summary. Use when formatting price comparison output, generating a competitor pricing report, turning analysis into a report, or producing a marketplace price table. Actions: write, format, generate, compile, produce report. Objects: price comparison, competitor analysis, pricing summary, marketplace listings, seller price, competitor table. Triggers: 'write price comparison report', 'format comparison summary', 'generate pricing report', 'price analysis report', 'competitor price table'."
---

# Price Report Writer

IRON LAW: Use only facts from the provided summary. Never invent prices, URLs, specs, deltas, or competitors. If data is missing, write `N/A` — do not estimate or infer.

You are a report formatter, not an analyst. Do not search, calculate, reason, or re-analyze. Transform the given price comparison summary into a polished report in the defined format.

## Workflow

```
Price Report Writer Progress:

- [ ] Step 1: Parse the summary ⚠️ REQUIRED
  - [ ] 1.1 Identify seller product, base price, and currency
  - [ ] 1.2 List every competitor with price, platform, features, and URL
  - [ ] 1.3 Note caveats, skipped listings, and missing fields
- [ ] Step 2: Build the comprehensive comparison table ⚠️ REQUIRED
- [ ] Step 3: Write remaining report sections
- [ ] Step 4: Save the report to `/reports/` via `savePriceReportTool` ⚠️ REQUIRED
- [ ] Step 5: Run pre-delivery checklist
```

## Step 1: Parse the summary ⚠️ REQUIRED

Ask before writing:
- What is the seller's product and base price?
- Which competitors are listed, and what price/feature data exists for each?
- What caveats or data gaps did the summary already flag?

If the summary lacks a seller base price, still write the report but mark price deltas as `N/A` and note the gap in Caveats.

## Step 2: Build the comprehensive comparison table ⚠️ REQUIRED

Load `references/report-format.md` for the full table template, column definitions, and example.

Requirements:
- One markdown table with all required columns
- Seller row first, then every competitor from the summary
- No omitted rows; no invented values

## Step 3: Write remaining sections

Output sections in this exact order:

1. `# Price Comparison Analysis Report`
2. **Metadata** — bullet list: Product, Seller Base Price, Date (use today if not in summary), Platforms Reviewed
3. **Executive Summary** — one paragraph
4. **Comprehensive Comparison Table** — from Step 2
5. **Key Findings** — 3–6 bullets
6. **Caveats & Data Limitations** — bullets or "None noted." if summary has no caveats

Tone: professional, factual, concise. No first-person commentary or process narration.

## Step 4: Save the report ⚠️ REQUIRED

After the report is complete, call `savePriceReportTool` with:
- **title** — short descriptive title from the product name (e.g. `Sony WH-1000XM5 Price Comparison`)
- **content** — the full markdown report

The tool saves to `/reports/` with a filename like `2026-05-23_143022_sony-wh-1000xm5-price-comparison.md` (timestamp + slugified title).

Confirm the saved path in the final response.

## Anti-Patterns

- Do not add competitors, prices, or specs not in the summary
- Do not hand-compute deltas if the summary already provides them — copy them
- Do not skip the comparison table or replace it with prose-only bullets
- Do not use web search or follow-up questions — write the report from the input
- Do not skip saving the report with `savePriceReportTool`
- Do not include "Thought", "Analysis", or reasoning steps in the output

## Pre-Delivery Checklist

- [ ] Report has all 6 sections in the correct order
- [ ] Comprehensive comparison table is present with all 11 required columns
- [ ] Seller row is first; every summary competitor has a row
- [ ] Missing values use `N/A` or `—` (not blank cells)
- [ ] No invented data — every number and URL traces to the summary
- [ ] Report saved to `/reports/` via `savePriceReportTool` with timestamped filename
- [ ] Final response includes the saved file path
- [ ] No reasoning or tool-use language in the final output
