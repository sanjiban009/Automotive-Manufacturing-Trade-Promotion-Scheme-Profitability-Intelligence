# Source Data Dictionary — Indian FY Automotive Trade Promotion

**Grain:** One month × Indian sales region × automotive component family × selling channel. Exactly 6,192 synthetic facts, all with an explicit April–March `financial_year`.

| Column | Data type / unit | Meaning |
|---|---|---|
| `record_id` | Text | Unique source observation. |
| `record_date` | ISO YYYY-MM-DD | First calendar day of synthetic month. |
| `financial_year` | Text | FY2023-24, FY2024-25, FY2025-26, FY2026-27. |
| `fy_start_year` | Integer | Calendar year containing 1 April of FY. |
| `financial_quarter` | Q1..Q4 | April–March quarter; Q1 = April–June. |
| `fiscal_month_no` | 1..12 | Apr=1, May=2, …, Mar=12. |
| `fiscal_month` | Apr..Mar | Indian fiscal month label. |
| `fiscal_period` | Text | FY + fiscal quarter + fiscal month, suitable for readable labels. |
| `region` | Text | North, South, East, West, Central, Northeast. |
| `channel` | Text | Distributor, Authorized Dealer, Workshop Network, Fleet & Institutional. |
| `product_category` | Text | Six synthetic manufactured automotive component families. |
| `sku_family` | Text | Representative category subset / SKU-family label. |
| `scheme_name` | Text | Trade incentive / commercial program name. |
| `scheme_type` | Text | Rebate, loyalty, launch support, clearance and so on. |
| `scheme_objective` | Text | Plain-English commercial intent. |
| `campaign_id` | Text | Synthetic month-region-channel-campaign ID; may repeat across component families. |
| `baseline_units` | Units | Synthetic no-scheme counterfactual volume. |
| `actual_units` | Units | Modeled units sold with promotional activity. |
| `incremental_units` | Units | `actual_units - baseline_units`, can be negative. |
| `unit_list_price_inr` | ₹/unit | Pre-discount unit selling price. |
| `regular_discount_rate_pct` | Percentage points | Standard trade discount, stored e.g. 11.2 for 11.2%, not 0.112. |
| `unit_manufacturing_cost_inr` | ₹/unit | Direct manufacturing COGS. |
| `unit_distribution_cost_inr` | ₹/unit | Allocated distribution/freight cost. |
| `gross_sales_inr` | ₹ | `actual_units × unit_list_price_inr`. |
| `regular_trade_discount_inr` | ₹ | `gross_sales × regular_discount_rate/100`. |
| `variable_incentive_inr` | ₹ | Volume-linked promotional payout. |
| `activation_cost_inr` | ₹ | Fixed activation / marketing execution cost. |
| `claims_adjustment_inr` | ₹ | Claims settlement adjustment (can be negative). |
| `scheme_spend_inr` | ₹ | `variable_incentive + activation_cost + claims_adjustment`. |
| `scheme_budget_inr` | ₹ | Synthetic spend budget allocation. |
| `net_sales_inr` | ₹ | `gross_sales - regular_trade_discount - scheme_spend`. |
| `manufacturing_cogs_inr` | ₹ | `actual_units × unit_manufacturing_cost`. |
| `distribution_cost_inr` | ₹ | `actual_units × unit_distribution_cost`. |
| `contribution_inr` | ₹ | `net_sales - manufacturing_cogs - distribution_cost`. |
| `baseline_contribution_inr` | ₹ | `baseline_units × pre_scheme_unit_contribution`. |
| `incremental_gross_margin_inr` | ₹ | `incremental_units × pre_scheme_unit_contribution`. |
| `net_incremental_profit_inr` | ₹ | `incremental_gross_margin - scheme_spend`. |
| `unit_uplift_pct` | Percentage points | `100 × incremental_units / baseline_units`, row-level only. |
| `scheme_roi_pct` | Percentage points | `100 × net_incremental_profit / scheme_spend`, row-level only. |
| `contribution_margin_pct` | Percentage points | `100 × contribution / net_sales`, row-level only. |
| `data_type` | Text | Explicit synthetic / demonstration disclosure. |

### Ratio aggregation rule

Never calculate `AVG(scheme_roi_pct)` or `AVG(unit_uplift_pct)` to produce management KPIs: those averages incorrectly weight a small program like a large program. Recalculate using the summed currency or unit numerators and denominators.

### Currency notes

Source columns ending `_inr` contain **full rupees**, not crore-scaled or lakh-scaled input values. The dashboard converts INR to **₹ Cr** or **₹ L** only at presentation time. Values are illustrative and exclude tax invoice / GST accounting.

### Fiscal-year boundary check

For a calendar date in April–December of year Y, the FY begins in Y. For January–March, the FY begins in Y−1. FY2026–27 is capped at October 2026 for the dataset supplied in November 2026; there are no Nov 2026–Mar 2027 actuals.
