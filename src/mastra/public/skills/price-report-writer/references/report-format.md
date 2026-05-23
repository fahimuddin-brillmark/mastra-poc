# Price Comparison Report Format

Load this reference when building the comparison table or final report structure.

## Report sections (in order)

1. **Report title** — `Price Comparison Analysis Report`
2. **Metadata block** — product analyzed, seller/base price, report date, platforms reviewed
3. **Executive Summary** — 1 short paragraph: over/under market and why
4. **Comprehensive Comparison Table** — required; see template below
5. **Key Findings** — 3–6 bullet points on price drivers and parity gaps
6. **Caveats & Data Limitations** — missing data, skipped listings, currency/condition ambiguity

## Comprehensive comparison table

Build one markdown table covering **every product row** from the summary (seller + all competitors).

### Required columns

| Column | Content |
|--------|---------|
| Product | Listing title (shortened if needed) |
| Role | `Seller (Base)` or `Competitor` |
| Platform | amazon, walmart, google_shopping, or source from summary |
| Price (Original) | Amount + currency as given in summary |
| Price (USD) | Normalized USD from summary; use `N/A` if missing |
| vs Base ($) | Absolute delta from seller price; `—` for seller row |
| vs Base (%) | Percentage delta from summary; `—` for seller row |
| Key Features | 2–4 distinguishing specs from summary |
| Condition | new, refurbished, used, or `Unknown` |
| URL | Full link or `N/A` |
| Notes | Brief parity/comparability note from summary |

### Table rules

- Seller row must appear first.
- Include every competitor mentioned in the summary — do not drop rows.
- Use `N/A` for missing values; never leave cells blank.
- Do not add columns beyond this set unless the summary explicitly requires one (e.g., bundle contents).
- Keep feature text concise; prefer comma-separated phrases over full sentences.

### Example table

```markdown
| Product | Role | Platform | Price (Original) | Price (USD) | vs Base ($) | vs Base (%) | Key Features | Condition | URL | Notes |
|---------|------|----------|------------------|-------------|-------------|-------------|--------------|-----------|-----|-------|
| Sony WH-1000XM5 | Seller (Base) | — | $349.99 USD | $349.99 | — | — | ANC, 30h battery, BT 5.2 | new | N/A | User's listing |
| Sony WH-1000XM5 Black | Competitor | amazon | $299.99 USD | $299.99 | -$50.00 | -14.3% | ANC, 30h battery, BT 5.2 | new | https://... | Direct match |
| WH-1000XM4 Renewed | Competitor | amazon | $199.99 USD | $199.99 | -$150.00 | -42.9% | ANC, older model | refurbished | https://... | Different generation |
```

## Executive summary guidance

Answer in one paragraph:
- Is the seller priced above, below, or at market?
- What is the typical competitor price range?
- What feature or condition differences explain the largest gaps?

## Key findings guidance

Each bullet should cite a fact from the summary:
- Price position relative to closest comparable competitor
- Biggest absolute or percentage gap and its driver
- Listings excluded or flagged as non-comparable (if any)

## Caveats guidance

List only limitations present in the summary:
- Missing prices or currencies
- Ambiguous or non-comparable listings
- Skipped results and why
