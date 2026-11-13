#!/usr/bin/env python3
"""Reproducible synthetic automotive-aftermarket promotions, Indian April-March FY."""
from __future__ import annotations
import csv, json, random
from pathlib import Path
from datetime import date

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / 'data'
DATA.mkdir(exist_ok=True)
RANDOM_SEED = 20261113
r = random.Random(RANDOM_SEED)

regions = [('North',1.25),('West',1.40),('South',1.30),('East',1.08),('Central',0.95),('Northeast',0.70)]
channels = [('Distributor',1.25,0.110),('Authorized Dealer',1.12,0.085),('Workshop Network',0.78,0.070),('Fleet & Institutional',0.72,0.140)]
categories = [
 ('Brake Systems','Disc Pads / Brake Assemblies',3350,0.645,0.17),
 ('Filters & Fluids','Air / Oil Filtration',1580,0.665,0.13),
 ('Electrical & Sensors','Lighting / Ignition Modules',4700,0.630,0.20),
 ('Suspension & Steering','Struts / Linkages',5680,0.680,0.16),
 ('Engine & Powertrain','Clutch / Drivetrain Parts',7350,0.690,0.15),
 ('Cooling & Thermal','Radiators / Pumps',4150,0.655,0.18),
]
schemes = [
 ('Dealer Growth Accelerator','Volume Rebate','Grow secondary channel throughput',0.026,0.24),
 ('Quarter-End Slab Bonus','Volume Rebate','Drive quarterly volume achievement',0.030,0.33),
 ('Festival Trade Push','Seasonal Incentive','Accelerate festive sell-in',0.042,0.39),
 ('Workshop Loyalty Rewards','Loyalty','Increase workshop repeat purchasing',0.023,0.20),
 ('New-SKU Launch Support','Launch Support','Expand adoption of new component families',0.057,0.22),
 ('Stock Clearance Support','Inventory Clearance','Clear ageing channel inventory',0.067,0.14),
 ('Fleet Bulk Rebate','Institutional Rebate','Convert high-volume fleet opportunity',0.029,0.28),
]
month_names=['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar']
fields=[
 'record_id','record_date','financial_year','fy_start_year','financial_quarter','fiscal_month_no',
 'fiscal_month','fiscal_period','region','channel','product_category','sku_family',
 'scheme_name','scheme_type','scheme_objective','campaign_id',
 'baseline_units','actual_units','incremental_units','unit_list_price_inr','regular_discount_rate_pct',
 'unit_manufacturing_cost_inr','unit_distribution_cost_inr','gross_sales_inr',
 'regular_trade_discount_inr','variable_incentive_inr','activation_cost_inr',
 'claims_adjustment_inr','scheme_spend_inr','scheme_budget_inr','net_sales_inr','manufacturing_cogs_inr',
 'distribution_cost_inr','contribution_inr','baseline_contribution_inr',
 'incremental_gross_margin_inr','net_incremental_profit_inr',
 'unit_uplift_pct','scheme_roi_pct','contribution_margin_pct',
 'data_type'
]
rows=[]
for year in range(2023,2027):
 for month in range(1,13):
  if year==2026 and month>10: break
  d=date(year,month,1)
  if d < date(2023,4,1): continue
  fy_start=year if month>=4 else year-1
  fy=f'FY{fy_start}-{str(fy_start+1)[-2:]}'
  fy_month=(month-4)%12+1
  fq='Q'+str((fy_month-1)//3+1)
  fiscal_label=month_names[fy_month-1]
  # sales indexed by time but no forward forecast data beyond Oct 2026.
  trend=1+0.053*(year-2023)+(month-1)*0.0015
  seasonal={1:1.00,2:1.01,3:1.08,4:0.97,5:0.98,6:0.95,7:1.01,8:1.06,9:1.14,10:1.27,11:1.19,12:1.23}[month]
  for reg_i,(region,reg_scale) in enumerate(regions):
   for cat_i,(category,sku,price,cost_ratio,discount_base) in enumerate(categories):
    for ch_i,(channel,ch_scale,ch_discount) in enumerate(channels):
     # Stable, intentionally varied scheme mix with independent observation per cohort/month.
     si=(reg_i*2+cat_i*3+ch_i*5+year*2+month)%len(schemes)
     if channel=='Fleet & Institutional' and month%3!=0: si=6
     if month in [9,10,11] and (cat_i+reg_i+ch_i)%3==0: si=2
     name,scheme_type,objective,incentive_rate,base_uplift=schemes[si]
     baseline_units=round((105+cat_i*15+r.randint(-12,30))*reg_scale*ch_scale*trend*seasonal)
     unit_price=round(price*(1+(year-2023)*0.037)*r.uniform(0.965,1.037),2)
     discount_rate=max(0.05,min(0.185,ch_discount+r.uniform(-0.013,0.018)))
     unit_cogs=round(unit_price*(cost_ratio+r.uniform(-0.018,0.018)),2)
     unit_dist=round(unit_price*(0.021+r.uniform(-0.005,0.010)),2)
     # Campaign uplift is baseline-relative; some campaigns underperform.
     uplift=max(-0.035,min(0.52,base_uplift+r.gauss(0,0.099)+(0.046 if month in [10,11] and si==2 else 0)
                               +(0.035 if scheme_type=='Volume Rebate' and channel=='Distributor' else 0)))
     actual_units=max(1,round(baseline_units*(1+uplift)))
     incremental_units=actual_units-baseline_units
     gross=round(actual_units*unit_price,2)
     regular_discount=round(gross*discount_rate,2)
     variable=round(gross*incentive_rate*r.uniform(0.78,1.14),2)
     activation=round(1850+r.uniform(400,6200)*(1.32 if si in [2,4] else 1),2)
     claim=round(variable*r.uniform(-0.028,0.061),2)
     spend=round(variable+activation+claim,2)
     budget=round(spend*r.uniform(0.82,1.24),2)
     sales=round(gross-regular_discount-spend,2)
     cogs=round(actual_units*unit_cogs,2)
     dist=round(actual_units*unit_dist,2)
     contrib=round(sales-cogs-dist,2)
     unit_base=unit_price*(1-discount_rate)-unit_cogs-unit_dist
     baseline_contrib=round(baseline_units*unit_base,2)
     incremental_gm=round(incremental_units*unit_base,2)
     incremental_profit=round(incremental_gm-spend,2)
     # Identity: contribution - baseline contribution = net incremental profit.
     # All marketing spend is taken against observed campaign, not baseline.
     assert abs((contrib-baseline_contrib)-incremental_profit)<0.12
     record={
      'record_id':f'TP-{year}{month:02d}-{reg_i+1}{cat_i+1}{ch_i+1}',
      'record_date':d.isoformat(),'financial_year':fy,'fy_start_year':fy_start,
      'financial_quarter':fq,'fiscal_month_no':fy_month,'fiscal_month':fiscal_label,
      'fiscal_period':f'{fy} {fq} {fiscal_label}',
      'region':region,'channel':channel,'product_category':category,'sku_family':sku,
      'scheme_name':name,'scheme_type':scheme_type,'scheme_objective':objective,
      'campaign_id':f'CAM-{fy_start}-{year}{month:02d}-{reg_i+1}{ch_i+1}-{si+1}',
      'baseline_units':baseline_units,'actual_units':actual_units,'incremental_units':incremental_units,
      'unit_list_price_inr':unit_price,'regular_discount_rate_pct':round(discount_rate*100,3),
      'unit_manufacturing_cost_inr':unit_cogs,'unit_distribution_cost_inr':unit_dist,
      'gross_sales_inr':gross,'regular_trade_discount_inr':regular_discount,
      'variable_incentive_inr':variable,'activation_cost_inr':activation,'claims_adjustment_inr':claim,
      'scheme_spend_inr':spend,'scheme_budget_inr':budget,'net_sales_inr':sales,
      'manufacturing_cogs_inr':cogs,'distribution_cost_inr':dist,'contribution_inr':contrib,
      'baseline_contribution_inr':baseline_contrib,'incremental_gross_margin_inr':incremental_gm,
      'net_incremental_profit_inr':incremental_profit,
      'unit_uplift_pct':round((actual_units/baseline_units-1)*100,3),
      'scheme_roi_pct':round(incremental_profit/spend*100,3),
      'contribution_margin_pct':round(contrib/sales*100,3) if sales else 0,
      'data_type':'Synthetic — not actual business data'
     }
     rows.append(record)

with open(DATA/'trade_promotions_indian_fy.csv','w',newline='',encoding='utf-8-sig') as f:
 writer=csv.DictWriter(f, fieldnames=fields)
 writer.writeheader();writer.writerows(rows)
# Float to cents for consistency while reducing client data size; direct JSON remains auditable.
client_fields=[field for field in fields if field not in ['scheme_objective','sku_family','unit_uplift_pct','scheme_roi_pct','contribution_margin_pct','data_type']]
client=[{key:row[key] for key in client_fields} for row in rows]
with open(DATA/'dataset.js','w',encoding='utf-8') as f:
 f.write('/* Synthetic automotive trade promotions. Generated by scripts/generate_data.py */\n')
 f.write('window.TRADE_DATA=')
 json.dump(client,f,separators=(',',':'),ensure_ascii=False)
 f.write(';\n')
with open(DATA/'metadata.json','w',encoding='utf-8') as f:
 json.dump({'dataset':'Automotive Manufacturing — Trade Promotion & Scheme Profitability',
 'synthetic':True,'random_seed':RANDOM_SEED,'rows':len(rows),'records_through':'2026-10-31',
 'fiscal_year_definition':'April 1–March 31 (India)',
 'available_years':sorted({row['financial_year'] for row in rows}),
 'FY2026-27_status':'Year to date: Apr–Oct 2026',
 'currency':'INR','grain':'Month × region × category × channel',
 'column_names':fields},f,indent=2,ensure_ascii=False)
print('Generated',len(rows),'rows; all FYs:',sorted({rr['financial_year'] for rr in rows}))
for fy in sorted({rr['financial_year'] for rr in rows}):
 x=[z for z in rows if z['financial_year']==fy]
 print(fy,len(x),'Spend INR',round(sum(z['scheme_spend_inr'] for z in x)),
       'Net Incremental Profit INR',round(sum(z['net_incremental_profit_inr'] for z in x)),
       'ROI %',round(100*sum(z['net_incremental_profit_inr'] for z in x)/sum(z['scheme_spend_inr'] for z in x),2))
