# Automotive-Manufacturing-Trade-Promotion-Scheme-Profitability-Intelligence
**Portfolio-grade, Power BI–style executive analytics built with HTML, CSS, and vanilla JavaScript.** A self-contained decision system for an automotive-components manufacturer selling through distributors, authorized dealers, workshops, and fleet/institutional accounts.

> **Synthetic dataset notice:** All data and company branding are fictional, deterministic portfolio examples. No real manufacturer, dealer, customer, or corporate financial records are represented.



## Launch in under one minute

1. Download or clone this repository.
2. Double-click **`AXIOM _ Automotive Trade Intelligence.html`** to open it in Chrome, Edge, Safari, or Firefox. The dashboard works **offline**; no login, installation, external CDNs, third-party analytics, or API keys.
3. Choose a **financial year (FY)**, quarter, month, region, channel, automotive product family, or promotion scheme. Every visual and decision signal recalculates.
4. Click **Export CSV** for the currently filtered records. Use **Print / PDF** for a boardroom snapshot.

### Online demo (GitHub Pages)

Upload the folder contents at repository root. In GitHub: **Settings → Pages → Build and deployment → Deploy from a branch → main / (root) → Save**. The expected link is `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/`. No build step or external hosting bill is required.

## Indian Financial Year (FY) coverage

| Indian FY | Period in dataset | Status | Rows |
|---|---|---|---:|
| **FY2023–24** | 1 Apr 2023–31 Mar 2024 | Complete | 1,728 |
| **FY2024–25** | 1 Apr 2024–31 Mar 2025 | Complete | 1,728 |
| **FY2025–26** | 1 Apr 2025–31 Mar 2026 | Complete; default view | 1,728 |
| **FY2026–27** | 1 Apr 2026–31 Oct 2026 | **YTD; not full FY** | 1,008 |
| **Total** | Apr 2023–Oct 2026 | **6,192** synthetic records | **6,192** |

The dataset is explicitly keyed by `financial_year`, `financial_quarter`, `fiscal_month_no` (Apr = 1), `fiscal_month`, and `fiscal_period`. Every fact belongs to an Indian FY. FY quarters are Q1 Apr–Jun, Q2 Jul–Sep, Q3 Oct–Dec and Q4 Jan–Mar. Prior-year comparisons match fiscal months, so FY2026–27 Apr–Oct is never wrongly compared with a full prior year.

## What the dashboard delivers

| Interactive view | Business decisions supported |
|---|---|
| **01 · Executive Overview** | Eight dynamic KPIs including net sales, scheme investment, weighted ROI, net incremental profit, unit uplift, contribution margin, budget utilization, and profitable spend share; month-by-month spend/profit, scheme return, mix, channel performance and actionable insights. |
| **02 · Scheme Performance** | Scheme-level profit and ROI comparisons, investment leaderboard, profitable/negative-return flags and click-to-filter scheme rows. |
| **03 · Product & Channel** | ROI by component category, channel sales mix and category commercial-performance table. |
| **04 · Regional Intelligence** | Six-zone ROI and spend ranking plus **region × product** conditional-format ROI heatmap. |
| **05 · ROI Scenario Lab** | Interactive volume (−20% to +20%) and scheme-spend (−30% to +30%) sensitivities with live incremental profit, ROI, break-even uplift and campaign decision. |
| **06 · Transaction Explorer** | Searchable, paginated monthly fact ledger with financial-year columns; download filtered CSV. |
| **07 · Metric Methodology** | Definitions, FY governance, limitations and explainable business metrics. |

### Automotive categories and channel context

- Product lines: Brake Systems; Filters & Fluids; Electrical & Sensors; Suspension & Steering; Engine & Powertrain; Cooling & Thermal.
- Selling routes: Distributor; Authorized Dealer; Workshop Network; Fleet & Institutional.
- Promotion programs: Dealer Growth Accelerator; Quarter-End Slab Bonus; Festival Trade Push; Workshop Loyalty Rewards; New-SKU Launch Support; Stock Clearance Support; Fleet Bulk Rebate.
- Commercial geography: North, South, East, West, Central and Northeast India.

## Financial logic

| Metric | Aggregated calculation | Interpretation |
|---|---|---|
| Net Sales (₹) | `SUM(gross_sales - regular_trade_discount - scheme_spend)` | Realized net sales after normal and promotional discounts. |
| Pre-scheme Unit Contribution (₹) | `list_price × (1 - regular_discount_rate) - unit_manufacturing_cost - unit_distribution_cost` | Contribution per incremental unit **before** scheme spend. |
| Incremental Gross Margin (₹) | `SUM((actual_units - baseline_units) × pre_scheme_unit_contribution)` | Modeled margin on volume above synthetic baseline. |
| **Net Incremental Profit (₹)** | `SUM(incremental_gross_margin - scheme_spend)` | Incremental margin remaining after all promotional spend. |
| **Weighted Scheme ROI (%)** | `100 × SUM(net_incremental_profit) / SUM(scheme_spend)` | Profit on campaign investment, never an average of individual ROI percentages. |
| Unit Uplift (%) | `100 × (SUM(actual_units) - SUM(baseline_units)) / SUM(baseline_units)` | Baseline-relative modeled volume change. |
| Contribution Margin (%) | `100 × SUM(contribution) / SUM(net_sales)` | After manufacturing, distribution and promotional expense. |
| Budget Utilization (%) | `100 × SUM(scheme_spend) / SUM(scheme_budget)` | Promotional budget consumed. |
| Profitable Spend Share (%) | `100 × spend on positive-incremental-profit fact rows / total spend` | How much money is allocated to observed profitable cohorts. |

**Analytical caveat:** baseline units are generated model inputs, not causal controls. These outputs are illustrative management KPIs; they do not prove that a promotion caused the uplift. The scenario model holds pre-scheme unit economics constant and is not a validated price elasticity or demand forecast. Currency is **Indian rupees (INR)**; revenue values do not include GST treatment.

## Repository structure

```text
index.html                          Main offline dashboard (open this)
assets/css/styles.css               Dark executive responsive design
assets/js/app.js                    Aggregation, filters, SVG visuals, scenario lab
data/dataset.js                     Offline browser data (auto-generated)
 data/trade_promotions_indian_fy.csv Source CSV: 6,192 observations, Indian FY
 data/trade_promotions_indian_fy.xlsx Excel workbook incl. FY overview & metric guide
 data/metadata.json                 Schema, time coverage and provenance
scripts/generate_data.py            Seeded reproducible dataset generator
docs/DATA_DICTIONARY.md             Complete field definitions
docs/VALIDATION_AND_KPIS.md         Reconciliation checks and model limitations
docs/GITHUB_PAGES_GUIDE.md          Publishing and QA instructions
LinkedIn/POST_UNDER_2000.txt        Copy-ready LinkedIn post
LinkedIn/PROJECT_DESCRIPTION.txt    Project section description (<2,000 chars)
LinkedIn/UPLOAD_GUIDE.md            Upload steps, recommended image order
LinkedIn/screenshots/              Actual browser captures and JPEG previews
```

To regenerate data after installing Python 3 (standard library only):

```bash
python3 scripts/generate_data.py
```

The CSV and JavaScript data are regenerated with a stable seed. The included XLSX is a presentation-friendly extract; if you regenerate the Python dataset, refresh the XLSX separately as needed.

## Tech stack and reproducibility

**HTML5 · CSS3 · Vanilla JavaScript · SVG · CSV · Python · Excel · GitHub Pages.** Dashboard source reads `data/dataset.js` directly, so browsing `index.html` as a local file needs no server and no CORS workaround. The figures recalculate in the browser. Every chart uses vector SVG labels rather than a low-resolution pre-rendered image.

## What the project demonstrates in a real business

A commercial finance team can uncover promotional schemes that increase shipments but destroy incremental margin, compare channel payouts with contribution, identify geographic allocation imbalance, track budget leakage, and simulate investment guardrails ahead of monthly trade review meetings. With actual, governed enterprise data substituted, the same decision framework can assist Sales, Finance, Demand Planning and Trade Marketing—not replace a causal lift study.

See [`docs/VALIDATION_AND_KPIS.md`](docs/VALIDATION_AND_KPIS.md) and [`docs/DATA_DICTIONARY.md`](docs/DATA_DICTIONARY.md) for technical details. Portfolio screenshots and publishing copy are under [`LinkedIn/sanjiban009`](LinkedIn/sanjiban009).

<img width="1800" height="1262" alt="07_metric_methodology_full" src="https://github.com/user-attachments/assets/3ff887cb-d09f-4d21-9c56-06a9d14f24fd" />
<img width="1800" height="1510" alt="06_transaction_explorer_full" src="https://github.com/user-attachments/assets/bff3de90-176f-48e5-a8a0-e06ca3bbe8e7" />
<img width="1800" height="1308" alt="05_roi_scenario_lab_full" src="https://github.com/user-attachments/assets/c06d2971-3a46-43d4-bbbb-3b2c5d349139" />
<img width="1800" height="1700" alt="04_regional_intelligence_full" src="https://github.com/user-attachments/assets/524b26c3-7928-4cba-8aeb-e8a15e0e9766" />
<img width="1800" height="1550" alt="03_product_and_channel_full" src="https://github.com/user-attachments/assets/4c881a3a-5991-4447-8eef-57146ea30a64" />
<img width="1800" height="1648" alt="02_scheme_performance_full" src="https://github.com/user-attachments/assets/3d09b498-d2f8-4be8-a018-73dd389354d4" />
<img width="1800" height="1716" alt="01_executive_overview_full" src="https://github.com/user-attachments/assets/fde0273a-b8ed-4ecb-a57a-eafde7f69093" />

**Disclaimer:** Fictional AXIOM Automotive brand and synthetic data. Educational BI portfolio demonstration, not audited corporate financial statements.
