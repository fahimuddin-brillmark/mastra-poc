# Price Comparison Report Validation Criteria

Load this reference when validating structure, table columns, and content quality.

## Required sections (exact order)

1. `# Price Comparison Analysis Report` — H1 title
2. **Metadata** — bullet list with: Product, Seller Base Price, Date, Platforms Reviewed
3. **Executive Summary** — one paragraph (not bullets)
4. **Comprehensive Comparison Table** — markdown table; see column rules below
5. **Key Findings** — 3–6 bullet points
6. **Seller Pricing Recommendation** — actionable guidance for the seller; see rules below
7. **Caveats & Data Limitations** — bullets or explicit "None noted."

## Metadata checks

| Field | Pass criteria |
|-------|---------------|
| Product | Named; not placeholder text |
| Seller Base Price | Amount + currency, or `N/A` with explanation in Caveats |
| Date | Present (ISO or readable date) |
| Platforms Reviewed | Lists at least one platform or source |

## Comprehensive comparison table

### Required columns (11 total)

1. Product
2. Role
3. Platform
4. Price (Original)
5. Price (USD)
6. vs Base ($)
7. vs Base (%)
8. Key Features
9. Condition
10. URL
11. Notes

### Row rules

- Seller row must be first.
- Role for seller row: `Seller (Base)`.
- Role for competitors: `Competitor`.
- Every competitor mentioned elsewhere in the report must have a table row.
- No blank cells — use `N/A`, `—`, or `Unknown` as appropriate.
- Seller row: `vs Base ($)` and `vs Base (%)` must be `—`.
- Competitor rows: deltas should be present or `N/A` if base price is missing.

### Content quality checks

- **Executive Summary**: States over/under/at market position and cites a reason from the data.
- **Key Findings**: 3–6 bullets; each references a fact (price gap, feature driver, or comparability issue).
- **Seller Pricing Recommendation**: Gives the seller a clear, actionable price correction; see dedicated rules below.
- **Caveats**: Surfaces missing data, skipped listings, or ambiguity — or explicitly states none.
- **Consistency**: Product names, prices, and URLs in prose match the table.
- **No invented data**: Numbers and URLs must appear traceable to the source summary (flag if report adds competitors or prices not supported by context).

## Seller pricing recommendation

The report must help the seller decide how to adjust their listing price. This section is **required** unless the seller base price is `N/A` and Caveats already explain why pricing guidance cannot be given.

### Pass criteria

| Requirement | Pass criteria |
|-------------|---------------|
| Direction | States whether the seller should **increase**, **decrease**, or **hold** their price |
| Target price | Recommends a specific price or narrow range (e.g., `$299.99`, `$295–$305`) grounded in comparable competitor data from the report |
| Benchmark | Names the comparable listing(s) or market anchor used (e.g., closest direct competitor, median of new-condition matches) |
| Rationale | Explains why that price point is appropriate (feature parity, condition, gap vs. base price) |
| Actionability | Seller can act on the advice without re-running analysis |

### Acceptable formats

- A short paragraph with direction, target price/range, benchmark, and rationale.
- Or a bullet list covering the same four elements.

### Fail conditions

| Issue | Severity |
|-------|----------|
| Section missing entirely (and base price is known) | **Major** |
| No recommended price or range — only vague advice ("price competitively") | **Major** |
| No increase/decrease/hold direction | **Major** |
| Target price not tied to a comparable from the table or summary | **Major** |
| Recommended price contradicts the comparison table or executive summary | **Critical** |
| Invented target price with no support in report data | **Critical** |

### When base price is missing

If seller base price is `N/A`, the section may state that a specific price recommendation cannot be made and cite the closest comparable benchmark price the seller should target once their base price is known. Flag as **Minor** if this fallback is absent but Caveats already explain the gap.

## Severity levels

Use when classifying issues:

| Severity | Meaning | Examples |
|----------|---------|----------|
| **Critical** | Report is misleading or structurally broken | Missing comparison table, wrong section order, invented prices |
| **Major** | Required element missing or wrong | Missing metadata field, seller not first row, fewer than 3 Key Findings, missing or vague Seller Pricing Recommendation |
| **Minor** | Formatting or clarity issue | Inconsistent currency notation, verbose feature cells, weak executive summary |

## Recommendation format

Each finding must include:
- **Issue** — what failed validation
- **Location** — section, row, or column
- **Severity** — Critical / Major / Minor
- **Proposed change** — specific, actionable edit (not a full rewrite)
