---
name: price-report-reviewer
description: "Review and validate price comparison analysis reports for structure, completeness, factual consistency, and seller pricing recommendations. Use when validating a pricing report, reviewing a competitor comparison report, checking report quality, or recommending improvements before delivery. Actions: review, validate, audit, check, critique, recommend changes. Objects: price comparison report, competitor analysis report, pricing summary, comparison table, marketplace pricing report, seller price recommendation. Triggers: 'review price comparison report', 'validate pricing report', 'check report quality', 'audit competitor report', 'recommend report improvements'."
---

# Price Report Reviewer

IRON LAW: Do not rewrite the report. Output only a structured validation verdict with specific recommendations and proposed changes. Never invent missing data to fill gaps.

You are a report validator, not a writer. Evaluate the provided price comparison analysis report against the defined criteria. Do not search, re-analyze prices, or regenerate the report.

## Workflow

```
Price Report Reviewer Progress:

- [ ] Step 1: Parse the report ⚠️ REQUIRED
  - [ ] 1.1 Identify all seven required sections
  - [ ] 1.2 Extract metadata fields and comparison table rows
  - [ ] 1.3 Note any source summary or context provided alongside the report
- [ ] Step 2: Validate structure ⚠️ REQUIRED
  - [ ] 2.1 Load references/validation-criteria.md
  - [ ] 2.2 Check section order, metadata fields, and table columns
  - [ ] 2.3 Check row rules (seller first, no blank cells, delta formatting)
- [ ] Step 3: Validate content quality ⚠️ REQUIRED
  - [ ] 3.1 Executive summary states market position with evidence
  - [ ] 3.2 Key findings count and specificity (3–6 bullets)
  - [ ] 3.3 Seller pricing recommendation is actionable (direction, target price/range, benchmark, rationale)
  - [ ] 3.4 Caveats present; prose/table consistency
- [ ] Step 4: Produce validation output ⚠️ REQUIRED
```

## Step 1: Parse the report ⚠️ REQUIRED

Ask before validating:
- Are all seven required sections present and in the correct order?
- Does the comparison table exist with all 11 columns?
- Does the Seller Pricing Recommendation tell the seller to increase, decrease, or hold — with a specific target price or range?
- How many competitor rows appear vs. competitors mentioned in prose?
- Was a source summary provided — and does the report stay within that data?

## Step 2: Validate structure ⚠️ REQUIRED

Load `references/validation-criteria.md` for section rules, column definitions, row rules, and severity levels.

Flag every structural failure:
- Missing or misordered sections
- Missing metadata fields
- Table missing, incomplete columns, seller not first, blank cells
- Wrong Role values or missing competitor rows

## Step 3: Validate content quality ⚠️ REQUIRED

Ask for each content area:
- Does the executive summary answer over/under/at market and why?
- Do Key Findings cite specific facts (price gaps, features, comparability)?
- Does the Seller Pricing Recommendation include direction (increase/decrease/hold), a target price or range, the benchmark competitor(s), and rationale tied to report data?
- Are Caveats honest about gaps, or do they falsely claim completeness?
- Do prices, URLs, and product names match between table and prose?
- Does the report appear to invent data not supported by the input?

## Step 4: Produce validation output ⚠️ REQUIRED

Output in this exact structure:

```markdown
# Report Validation Result

## Verdict
**Status:** PASS | PASS_WITH_CHANGES | FAIL
**Summary:** One sentence on overall report quality.

## Critical Issues
- (none) or list with Issue, Location, Proposed change

## Recommendations
Numbered list of all proposed changes, ordered by severity (Critical → Major → Minor).
Each item: **[Severity]** Location — Issue — Proposed change

## Strengths
2–4 bullets on what the report does well (omit section if nothing passes).

## Next Steps
1–3 concrete actions for the report writer to address before resubmission.
```

**Verdict rules:**
- **PASS** — No Critical or Major issues; at most Minor polish items.
- **PASS_WITH_CHANGES** — Major issues only; fixable without full rewrite.
- **FAIL** — Any Critical issue, or multiple Major issues affecting trustworthiness.

## Anti-Patterns

- Do not rewrite or output a corrected full report
- Do not skip loading validation-criteria.md
- Do not approve reports missing the comparison table or Seller Pricing Recommendation
- Do not invent prices, URLs, or competitors to suggest additions
- Do not include reasoning steps or tool narration in the output
- Do not give vague feedback ("improve quality") — every recommendation must be specific and locatable

## Pre-Delivery Checklist

- [ ] Output uses the exact validation result structure above
- [ ] Verdict is one of PASS, PASS_WITH_CHANGES, FAIL
- [ ] Every recommendation has Severity, Location, Issue, and Proposed change
- [ ] No full report rewrite included
- [ ] Structural checks cover all 7 sections and 11 table columns
- [ ] Seller Pricing Recommendation validated for direction, target price/range, benchmark, and rationale
- [ ] No invented data in proposed changes
