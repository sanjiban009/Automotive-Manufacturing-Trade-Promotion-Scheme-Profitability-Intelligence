# QA & Business-Metric Validation

## Deterministic dataset

- Random seed: `20261113`.
- Fact count: **6,192** (43 synthetic months × 6 regions × 6 components × 4 channels).
- FY2023–24 / FY2024–25 / FY2025–26: 1,728 each (12 months).
- FY2026–27: 1,008 (7 months, Apr–Oct 2026).
- All records have an FY, FY quarter, fiscal month index, readable FY period and monthly ISO date.

## Row-level accounting identities (with normal cent rounding)

```text
Gross Sales = Actual Units × Unit List Price
Regular Discount = Gross Sales × Regular Discount Rate
Scheme Spend = Incentive + Activation + Claim Adjustment
Net Sales = Gross Sales − Regular Discount − Scheme Spend
Manufacturing COGS = Actual Units × Unit Manufacturing Cost
Distribution Cost = Actual Units × Unit Distribution Cost
Contribution = Net Sales − Manufacturing COGS − Distribution Cost
Pre-scheme Unit Margin = Unit List Price × (1 − Discount Rate) − Unit Manufacturing Cost − Unit Distribution Cost
Baseline Contribution = Baseline Units × Pre-scheme Unit Margin
Incremental Gross Margin = (Actual Units − Baseline Units) × Pre-scheme Unit Margin
Net Incremental Profit = Incremental Gross Margin − Scheme Spend
Contribution − Baseline Contribution = Net Incremental Profit
```

## Executive aggregation / audit

1. Net sales, scheme spend and contribution always sum **INR facts**; no unit transformation in storage.
2. Scheme ROI = `100 × sum(net incremental profit) / sum(scheme spend)`.
3. Unit uplift = `100 × sum(incremental units) / sum(baseline units)`.
4. Contribution margin = `100 × sum(contribution) / sum(net sales)`.
5. Winning spend share uses fact-level positive increment profitability. This differs from the ratio of profitable scheme-name totals.
6. FY2026–27 YoY compares Apr–Oct FY2026–27 to Apr–Oct FY2025–26. Any other month or quarter filter is preserved.
7. Scenario profit = original incremental gross margin + (pre-scheme contribution on observed units × scenario volume %) − (original scheme spend × (1 + scheme spend change %)).
8. Scenario spend is modeled as an independent controllable budget sensitivity, **not** automatically variable with volume. This simplifying assumption must be explicit to finance users.

## Test checklist

- [x] Indian FY year/quarter/month labels on each row; no calendar-year-only reporting.
- [x] Default complete FY2025–26 view and FY2026–27 year-to-date view.
- [x] Sidebar navigation renders all seven sections.
- [x] Global FY filter changes active observation count (1,728 to 1,008).
- [x] Executive KPIs, seven-program leaderboard and region × category ROI matrix render.
- [x] Scenario sliders update incremental profit and ROI with no reload.
- [x] Transaction explorer keyword filter works.
- [x] Python-generated source CSV and offline JavaScript data come from the same rows.
- [x] Headless browser checks found no JavaScript page errors.

## Limits / governance

This is synthetic educational data, **not a forecast or true causal scheme effectiveness study**. Actual implementation should incorporate matched control groups or robust causal identification, secondary sell-out vs primary sell-in, inventory/returns adjustment, rebate accrual and settlements, credit notes, tax/GST treatment, contract exceptions and customer data governance.
