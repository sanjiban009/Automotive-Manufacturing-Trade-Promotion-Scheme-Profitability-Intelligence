/* AXIOM Automotive Trade Intelligence — no runtime dependencies, no network requests. */
(() => {
'use strict';
const DATA = window.TRADE_DATA || [];
const FY_MONTHS = ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'];
const COLORS = ['#26dcc1','#5288ff','#ab8aff','#ffbc68','#ff7b86','#5ad5ff','#b3e676'];
const MONEY_KEYS = ['gross_sales_inr','regular_trade_discount_inr','variable_incentive_inr','activation_cost_inr','claims_adjustment_inr','scheme_spend_inr','scheme_budget_inr','net_sales_inr','manufacturing_cogs_inr','distribution_cost_inr','contribution_inr','baseline_contribution_inr','incremental_gross_margin_inr','net_incremental_profit_inr'];
const state={financial_year:'FY2025-26',financial_quarter:'All',fiscal_month:'All',region:'All',channel:'All',product_category:'All',scheme_name:'All',page:'overview',pageNum:1,search:'',uplift:0,spend:0};
const pageNames={overview:'Executive Overview',schemes:'Scheme Performance',portfolio:'Product & Channel',regions:'Regional Intelligence',scenario:'ROI Scenario Lab',explorer:'Transaction Explorer',methodology:'Metric Methodology'};
const pageTitle={overview:'Trade Promotion & Scheme Profitability',schemes:'Promotional Scheme Performance',portfolio:'Product & Channel Profitability',regions:'Regional Commercial Intelligence',scenario:'Scenario & Trade ROI Optimizer',explorer:'Trade Promotion Data Explorer',methodology:'Definitions & Reporting Governance'};
const pageSub={overview:'A boardroom-ready view of promotional efficiency, incremental growth and commercial return.',schemes:'Identify winning schemes, control over-investment and prioritize the next trade-spend cycle.',portfolio:'Understand the component families and selling channels converting promotions into margin.',regions:'Trace ROI and trade-spend efficiency across the six India sales zones.',scenario:'Stress-test incremental profit as volume and trade investment assumptions change.',explorer:'Explore synthetic campaign observations with April–March fiscal-year controls.',methodology:'Transparent aggregation, financial rules, synthetic assumptions and Indian FY conventions.'};
const $ = (id)=>document.getElementById(id);
const esc = (v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sum=(rows,k)=>rows.reduce((s,r)=>s+(Number(r[k])||0),0);
const pct=(a,b)=>b ? 100*a/b : 0;
const ratio=(a,b)=>b ? a/b:0;
const sign=(n)=>n>0?'+':'';
const money=(n,d=1)=>{const neg=n<0?'−':'';const v=Math.abs(n); if(v>=10000000)return `${neg}₹${(v/10000000).toFixed(d)} Cr`; if(v>=100000)return `${neg}₹${(v/100000).toFixed(d)} L`;if(v>=1000)return `${neg}₹${(v/1000).toFixed(d)} K`;return `${neg}₹${v.toFixed(0)}`;};
const shortMoney=(n,unit='L')=>unit==='Cr'?n/10000000:n/100000;
const fmt=(n,d=1)=>Number(n).toLocaleString('en-IN',{minimumFractionDigits:d,maximumFractionDigits:d});
const pval=(n,d=1)=>`${fmt(n,d)}%`;
const classPositive=(n)=>n>=0?'score-positive':'score-negative';
const fyText=(s)=>s.replace(/^FY(\d{4})-(\d{2})$/,'FY$1–$2');
function series(rows,key){const map=new Map(); rows.forEach(r=>{const v=String(r[key]);let group=map.get(v);if(!group){group=[];map.set(v,group);}group.push(r);});return [...map].map(([name,group])=>({name,rows:group,stats:aggregate(group)}));}
function aggregate(rows){let st={rows:rows.length,actual_units:0,baseline_units:0,incremental_units:0};
 for(const key of MONEY_KEYS) st[key]=0;
 for(const r of rows){st.actual_units+=r.actual_units;st.baseline_units+=r.baseline_units;st.incremental_units+=r.incremental_units;for(const k of MONEY_KEYS)st[k]+=r[k];}
 st.roi=pct(st.net_incremental_profit_inr,st.scheme_spend_inr);
 st.uplift=pct(st.incremental_units,st.baseline_units);
 st.margin=pct(st.contribution_inr,st.net_sales_inr);
 st.utilization=pct(st.scheme_spend_inr,st.scheme_budget_inr);
 st.spend_intensity=pct(st.scheme_spend_inr,st.gross_sales_inr);
 st.profitable_spend_share=pct(sum(rows.filter(r=>r.net_incremental_profit_inr>0),'scheme_spend_inr'),st.scheme_spend_inr);
 return st;
}
function filterData(excludeFY=false){return DATA.filter(row=>Object.keys(state).every(k=>{if(!['financial_year','financial_quarter','fiscal_month','region','channel','product_category','scheme_name'].includes(k))return true;if(excludeFY && k==='financial_year')return true;return state[k]==='All'||row[k]===state[k];}));}
function priorRows(now){if(state.financial_year==='All'||!now.length)return [];
 const year=Number(state.financial_year.slice(2,6));const previous=`FY${year-1}-${String(year).slice(-2)}`;
 const monthNos=new Set(now.map(r=>r.fiscal_month_no));
 return filterData(true).filter(r=>r.financial_year===previous&&monthNos.has(r.fiscal_month_no));
}
function svg(width,height,body){return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Interactive financial chart" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;}
const vtxt=(x,y,text,cls='chart-label',anchor='middle',more='')=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}" ${more}>${esc(text)}</text>`;
function empty(text='No observations match the selected financial-year slicers.') {return `<div class="empty-state">${esc(text)}</div>`;}
function groupBars(labels,groups,{unit='L',height=300}={}){
 if(!labels.length)return empty();const w=960,h=height,L=69,R=20,T=38,B=58,CW=w-L-R,CH=h-T-B;
 const all=groups.flatMap(g=>g.values.map(v=>shortMoney(v,unit)));
 let min=Math.min(0,...all),max=Math.max(0,...all);const span=Math.max(0.1,max-min);min-=span*.11;max+=span*.15;
 const y=v=>T+(max-v)/(max-min)*CH;const zero=y(0);let output='';
 for(let t=0;t<=4;t++){const value=min+(max-min)*t/4; const yy=y(value);output+=`<line x1="${L}" y1="${yy}" x2="${w-R}" y2="${yy}" class="chart-gridline"/>`+vtxt(L-10,yy+4,fmt(value,Math.abs(value)<10?1:0),'chart-axis','end');}
 const band=CW/labels.length;const seriesWidth=Math.min(32,band*.30);const groupWidth=seriesWidth*groups.length+Math.min(7,band*.05)*(groups.length-1);const gap=Math.min(7,band*.05);
 labels.forEach((label,i)=>{const center=L+band*(i+.5);const x0=center-groupWidth/2;
 groups.forEach((g,j)=>{const val=shortMoney(g.values[i]||0,unit); const xx=x0+j*(seriesWidth+gap);let top=Math.min(y(val),zero),bottom=Math.max(y(val),zero);if(bottom-top<1)bottom=top+1;
 output+=`<rect x="${xx.toFixed(1)}" y="${top.toFixed(1)}" width="${seriesWidth.toFixed(1)}" height="${(bottom-top).toFixed(1)}" rx="3" fill="${g.color}" opacity=".91"/>`;
 const pos=val>=0;const ly=pos?Math.max(14,top-7):Math.min(h-28,bottom+15);
 output+=vtxt(xx+seriesWidth/2,ly,fmt(val,Math.abs(val)>=10?0:1),'chart-label','middle',`style="font-size:16px"`);
 });output+=vtxt(center,h-B+25,label,'chart-x-label');});
 output+=`<line x1="${L}" y1="${zero}" x2="${w-R}" y2="${zero}" class="chart-rule"/>`;
 return svg(w,h,output);
}
function hBars(groups,{key='roi',type='pct',height=null}={}){
 if(!groups.length)return empty();const w=700,rowH=47,h=height||groups.length*rowH+60;let L=238,R=90,T=29,area=w-L-R;
 const values=groups.map(g=>g.stats?g.stats[key]:g.value);
 let min=Math.min(0,...values),max=Math.max(0,...values);const pad=Math.max(3,(max-min)*.13);min-=pad;max+=pad;
 const xpos=v=>L+(v-min)/(max-min)*area;const xzero=xpos(0);let out='';
 for(let t=0;t<=4;t++){let v=min+(max-min)*t/4,xx=xpos(v);out+=`<line x1="${xx}" y1="${T-8}" x2="${xx}" y2="${h-26}" class="chart-gridline"/>`+vtxt(xx,h-9,type==='pct'?`${fmt(v,0)}%`:fmt(v/100000,0),'chart-axis','middle','style="font-size:14px"');}
 groups.forEach((g,i)=>{const val=values[i],cy=T+i*rowH+13;const vx=xpos(val);const barX=Math.min(xzero,vx);const bw=Math.abs(vx-xzero);const color=g.color||(val>=0?'#26dcc1':'#ff7b86');out+=vtxt(L-15,cy+4,g.name,'chart-x-label','end','style="font-size:16px"');out+=`<rect x="${barX.toFixed(2)}" y="${cy-11}" width="${Math.max(1,bw).toFixed(2)}" height="21" rx="4" fill="${color}" opacity=".88"/>`;
 const label=type==='pct'?pval(val,1):money(val);
 const xx=val>=0?Math.min(w-3,vx+10):Math.max(L+8,vx-10);
 out+=vtxt(xx,cy+4,label,'chart-label',val>=0?'start':'end','style="font-size:16px"');
 });return svg(w,h,out);
}
function donut(groups){const total=groups.reduce((s,g)=>s+g.stats.scheme_spend_inr,0);if(!total)return empty();const r=67,cx=90,cy=90;let curr=-Math.PI/2;const out=[];
 groups.sort((a,b)=>b.stats.scheme_spend_inr-a.stats.scheme_spend_inr).forEach((g,i)=>{const value=g.stats.scheme_spend_inr;const portion=value/total;const start=curr;const end=curr+portion*Math.PI*2;curr=end;const xx=(angle)=>cx+r*Math.cos(angle),yy=(angle)=>cy+r*Math.sin(angle);const large=portion>.5?1:0;const path=`M ${xx(start)} ${yy(start)} A ${r} ${r} 0 ${large} 1 ${xx(end)} ${yy(end)}`;out.push(`<path d="${path}" fill="none" stroke="${COLORS[i%COLORS.length]}" stroke-width="25"/>`);});
 const inner=svg(180,180,`<circle cx="90" cy="90" r="67" fill="none" stroke="#274058" stroke-width="26"/>${out.join('')}${vtxt(90,88,money(total,1),'donut-central')}${vtxt(90,106,'PROMO SPEND','donut-subtitle')}`);
 const legend=groups.map((g,i)=>`<div class="legend-item"><div class="legend-key"><i style="background:${COLORS[i%COLORS.length]}"></i><span>${esc(g.name)}</span></div><strong>${fmt(pct(g.stats.scheme_spend_inr,total),0)}%</strong></div>`).join('');
 return `<div class="donut-svg">${inner}</div><div class="donut-legend">${legend}</div>`;
}
function linesSummary(stats,previous){const metricList=[
 ['Net Sales',money(stats.net_sales_inr,1),'#5288ff','₹','net_sales_inr','money','Realized after discounts'],
 ['Trade Scheme Spend',money(stats.scheme_spend_inr,1),'#ab8aff','↗','scheme_spend_inr','money','Incentives + activation'],
 ['Incremental ROI',pval(stats.roi),'#26dcc1','%','roi','rate','Profit / promotion spend'],
 ['Net Incremental Profit',money(stats.net_incremental_profit_inr,1),stats.net_incremental_profit_inr>=0?'#26dcc1':'#ff7b86','◈','net_incremental_profit_inr','money','After scheme investment'],
 ['Promotion Unit Uplift',pval(stats.uplift),'#5ad5ff','⇧','uplift','rate','Vs modelled base volume'],
 ['Contribution Margin',pval(stats.margin),'#b3e676','◉','margin','rate','After production + freight'],
 ['Budget Utilization',pval(stats.utilization),'#ffbc68','▥','utilization','rate','Spend / allocated budget'],
 ['Winning Spend Share',pval(stats.profitable_spend_share),'#26dcc1','✓','profitable_spend_share','rate','Spend on profitable records'],
 ];
 return metricList.map(([title,value,color,icon,key,type,desc])=>{
 let delta='Not comparable',cl='delta-neutral';if(previous){const prev=previous[key],cur=stats[key];let change=type==='rate'?cur-prev:pct(cur-prev,Math.abs(prev));if(Number.isFinite(change)){
 delta=`${sign(change)}${fmt(change,1)}${type==='rate'?' pp':'%'}`;
 cl=(Math.abs(change)<.05||key==='scheme_spend_inr'||key==='utilization')?'delta-neutral':change>=0?'delta-positive':'delta-negative';
 }}return `<article class="kpi-card" style="--accent:${color}"><div class="kpi-top"><span class="kpi-name">${title}</span><span class="kpi-icon">${icon}</span></div><div class="kpi-value">${value}</div><div class="kpi-foot"><span class="delta-pill ${cl}">${delta}</span><span class="kpi-small">${desc}</span></div></article>`;
 }).join('');
}
function ribbon(items){return items.map(([name,value,helper])=>`<div class="ribbon-item"><span>${esc(name)}</span><strong>${value}</strong><small>${esc(helper)}</small></div>`).join('');}
function channelRanking(rows){const list=series(rows,'channel').sort((a,b)=>b.stats.roi-a.stats.roi);const upper=Math.max(1,...list.map(x=>Math.abs(x.stats.roi)));
 return list.map((x,i)=>`<div><div class="mini-rank-top"><strong>${esc(x.name)}</strong><span style="color:${x.stats.roi>=0?'#38e5be':'#ff8e97'}">${pval(x.stats.roi)}</span></div><div class="track"><div class="track-fill" style="width:${Math.min(100,Math.max(2,Math.abs(x.stats.roi)/upper*100))}%;background:${COLORS[i%COLORS.length]}"></div></div></div>`).join('');
}
function periodChart(rows){if(state.financial_year==='All'){
 const list=series(rows,'financial_year').sort((a,b)=>a.name.localeCompare(b.name));return groupBars(list.map(x=>fyText(x.name).replace('FY','')), [{values:list.map(x=>x.stats.scheme_spend_inr),color:'#5288ff'},{values:list.map(x=>x.stats.net_incremental_profit_inr),color:'#26dcc1'}],{unit:'L'});}
 const map=new Map();for(const r of rows){const m=r.fiscal_month_no;if(!map.has(m))map.set(m,[]);map.get(m).push(r);}
 const groups=[...map].sort((a,b)=>a[0]-b[0]).map(([i,rr])=>({name:FY_MONTHS[i-1],stats:aggregate(rr)}));
 return groupBars(groups.map(x=>x.name),[{values:groups.map(x=>x.stats.scheme_spend_inr),color:'#5288ff'},{values:groups.map(x=>x.stats.net_incremental_profit_inr),color:'#26dcc1'}],{unit:'L'});
}
function insights(rows,s){if(!rows.length)return empty();let schemes=series(rows,'scheme_name');let best=schemes.reduce((a,b)=>a.stats.roi>b.stats.roi?a:b);let worst=schemes.reduce((a,b)=>a.stats.roi<b.stats.roi?a:b);
 const reg=series(rows,'region').sort((a,b)=>b.stats.roi-a.stats.roi); const losses=rows.filter(x=>x.net_incremental_profit_inr<0);const lostSpend=sum(losses,'scheme_spend_inr');
 const messages=[
 {color:'#34d9be',title:`Top scheme: ${best.name}`,detail:`Weighted ROI ${pval(best.stats.roi)} on ${money(best.stats.scheme_spend_inr)} spend. Prioritize validated high-return cohorts.`},
 {color:'#ffbc68',title:`Review: ${worst.name}`,detail:`Weighted ROI ${pval(worst.stats.roi)}; pilot tighter payout thresholds and compare untreated groups.`},
 {color:'#a78aff',title:`At-risk spend: ${money(lostSpend)}`,detail:`${pval(pct(lostSpend,s.scheme_spend_inr),0)} of trade budget sits in negative-profit monthly observations.`},
 {color:'#5ad5ff',title:`Regional strength: ${reg[0].name}`,detail:`Highest regional program return at ${pval(reg[0].stats.roi)}. Check market comparability before scaling.`}
 ];return messages.map(x=>`<div class="insight-card" style="--accent:${x.color}"><strong>${esc(x.title)}</strong><p>${esc(x.detail)}</p></div>`).join('');
}
function renderOverview(rows,s,prev){$('kpiGrid').innerHTML=linesSummary(s,prev);$('monthlyChart').innerHTML=periodChart(rows);$('schemeRoiChart').innerHTML=hBars(series(rows,'scheme_name').sort((a,b)=>b.stats.roi-a.stats.roi));$('spendDonut').innerHTML=donut(series(rows,'scheme_type'));$('channelMini').innerHTML=channelRanking(rows);$('insightCards').innerHTML=insights(rows,s);}
function table(headers,records){return `<div class="scroll-table"><table class="data-table"><thead><tr>${headers.map(([h,right])=>`<th class="${right?'num':''}">${esc(h)}</th>`).join('')}</tr></thead><tbody>${records.join('')}</tbody></table></div>`;}
function renderSchemes(rows,s){const schemes=series(rows,'scheme_name').sort((a,b)=>b.stats.net_incremental_profit_inr-a.stats.net_incremental_profit_inr), winners=schemes.filter(x=>x.stats.roi>0);
 $('schemeSummary').innerHTML=ribbon([['Schemes with Positive ROI',`${winners.length} / ${schemes.length}`,'Return-positive programs'],['Largest Scheme Spend',schemes.length?money(Math.max(...schemes.map(x=>x.stats.scheme_spend_inr))):'₹0','Concentration of investment'],['Scheme Investment',money(s.scheme_spend_inr),'All active campaign costs'],['Net Incremental Return',money(s.net_incremental_profit_inr),'Gross lift less program cost']]);
 $('schemeProfitChart').innerHTML=hBars(schemes.map(x=>({...x,value:x.stats.net_incremental_profit_inr})),{key:'net_incremental_profit_inr',type:'money'});
 $('schemeRoiSecondary').innerHTML=hBars([...schemes].sort((a,b)=>b.stats.roi-a.stats.roi));
 $('schemeTable').innerHTML=table([['SCHEME'],['NET SALES',true],['TRADE SPEND',true],['INCREMENTAL PROFIT',true],['ROI',true],['UNIT LIFT',true],['BUDGET UTIL.',true],['DECISION']],schemes.map(x=>`<tr><td class="row-link" data-scheme="${esc(x.name)}">${esc(x.name)}</td><td class="num">${money(x.stats.net_sales_inr)}</td><td class="num">${money(x.stats.scheme_spend_inr)}</td><td class="num ${classPositive(x.stats.net_incremental_profit_inr)}">${money(x.stats.net_incremental_profit_inr)}</td><td class="num ${classPositive(x.stats.roi)}">${pval(x.stats.roi)}</td><td class="num">${pval(x.stats.uplift)}</td><td class="num">${pval(x.stats.utilization)}</td><td><span class="${x.stats.roi>=0?'pill-good':'pill-bad'}">${x.stats.roi>=0?'SCALE / TEST':'REDESIGN'}</span></td></tr>`));
 document.querySelectorAll('[data-scheme]').forEach(cell=>cell.addEventListener('click',()=>{changeFilter('scheme_name',cell.dataset.scheme);}));
}
function renderPortfolio(rows,s){const categories=series(rows,'product_category').sort((a,b)=>b.stats.roi-a.stats.roi),channels=series(rows,'channel').sort((a,b)=>b.stats.net_sales_inr-a.stats.net_sales_inr);const best=categories[0],strongest=channels[0];
 $('portfolioSummary').innerHTML=ribbon([['Component Families',`${categories.length}`,'Manufacturing product lines'],['Best Category ROI',best?pval(best.stats.roi):'—',best?best.name:'No data'],['Largest Sales Channel',strongest?strongest.name:'—',strongest?money(strongest.stats.net_sales_inr):'No data'],['Weighted Contribution Margin',pval(s.margin),'After manufacturing and freight']]);
 $('categoryChart').innerHTML=hBars(categories);$('channelChart').innerHTML=groupBars(channels.map(c=>c.name.replace(' & ',' / ')),[{values:channels.map(x=>x.stats.net_sales_inr),color:'#5288ff'},{values:channels.map(x=>x.stats.scheme_spend_inr),color:'#ffbc68'}],{unit:'Cr'});
 $('categoryTable').innerHTML=table([['PRODUCT FAMILY'],['NET SALES',true],['SCHEME SPEND',true],['SPEND / GROSS SALES',true],['CONTRIBUTION %',true],['INCREMENTAL PROFIT',true],['ROI',true]],categories.map(c=>`<tr><td>${esc(c.name)}</td><td class="num">${money(c.stats.net_sales_inr)}</td><td class="num">${money(c.stats.scheme_spend_inr)}</td><td class="num">${pval(c.stats.spend_intensity)}</td><td class="num">${pval(c.stats.margin)}</td><td class="num ${classPositive(c.stats.net_incremental_profit_inr)}">${money(c.stats.net_incremental_profit_inr)}</td><td class="num ${classPositive(c.stats.roi)}">${pval(c.stats.roi)}</td></tr>`));
}
function heatColor(val){const intensity=Math.min(.85,.25+Math.abs(val)/90);return val>=0?`rgba(11,169,130,${intensity.toFixed(2)})`:`rgba(229,89,109,${intensity.toFixed(2)})`;}
function renderRegions(rows,s){const regions=series(rows,'region').sort((a,b)=>b.stats.roi-a.stats.roi),categories=[...new Set(DATA.map(x=>x.product_category))];const worst=regions[regions.length-1],best=regions[0];
 $('regionSummary').innerHTML=ribbon([['Reporting Regions',String(regions.length),'Zones represented'],['Highest Return Zone',best?best.name:'—',best?pval(best.stats.roi):'No data'],['Lowest Return Zone',worst?worst.name:'—',worst?pval(worst.stats.roi):'No data'],['Investment Nationwide',money(s.scheme_spend_inr),'Indian ₹ programme spend']]);
 $('regionChart').innerHTML=hBars(regions);$('regionSpendChart').innerHTML=hBars([...regions].sort((a,b)=>b.stats.scheme_spend_inr-a.stats.scheme_spend_inr),{key:'scheme_spend_inr',type:'money'});
 if(!regions.length){$('regionHeatmap').innerHTML=empty();return;}
 let html='<div class="heatmap-wrap"><div class="heatmap-grid"><div></div>'+categories.map(c=>`<div class="heatmap-colhead">${esc(c)}</div>`).join('');
 for(const region of regions){html+=`<div class="heatmap-rowhead">${esc(region.name)}</div>`;for(const c of categories){const r=region.rows.filter(z=>z.product_category===c);if(!r.length){html+='<div class="heatmap-cell" style="background:#1b3349">—</div>';continue;}const st=aggregate(r);html+=`<div class="heatmap-cell" style="background:${heatColor(st.roi)}"><strong>${pval(st.roi)}</strong><small>${money(st.scheme_spend_inr)}</small></div>`;}}
 $('regionHeatmap').innerHTML=html+'</div></div>';
}
function renderScenario(rows,s){const up=state.uplift/100,sp=state.spend/100,preSchemeTotal=s.gross_sales_inr-s.regular_trade_discount_inr-s.manufacturing_cogs_inr-s.distribution_cost_inr;
 const marginVolumeDelta=preSchemeTotal*up,adjustedSpend=s.scheme_spend_inr*(1+sp),modelProfit=s.incremental_gross_margin_inr+marginVolumeDelta-adjustedSpend;
 const scenarioROI=pct(modelProfit,adjustedSpend);const compare=modelProfit-s.net_incremental_profit_inr;
 $('upliftValue').textContent=`${sign(state.uplift)}${state.uplift}%`;$('spendValue').textContent=`${sign(state.spend)}${state.spend}%`;
 $('scenarioKpis').innerHTML=`<article class="scenario-box"><small>BASE INCREMENTAL PROFIT</small><strong>${money(s.net_incremental_profit_inr)}</strong><em>Current filtered facts</em></article><article class="scenario-box"><small>MODELLED INCREMENTAL PROFIT</small><strong class="${classPositive(modelProfit)}">${money(modelProfit)}</strong><em>${sign(compare/100000)}${fmt(compare/100000)} L change</em></article><article class="scenario-box"><small>MODELLED TRADE SCHEME ROI</small><strong class="${classPositive(scenarioROI)}">${pval(scenarioROI)}</strong><em>${sign(scenarioROI-s.roi)}${fmt(scenarioROI-s.roi)} percentage points vs base</em></article><article class="scenario-box"><small>REVISED SCHEME SPEND</small><strong>${money(adjustedSpend)}</strong><em>${sign(state.spend)}${state.spend}% expenditure sensitivity</em></article>`;
 $('scenarioChart').innerHTML=groupBars(['Base profit','Volume effect','Spend effect','Scenario profit'],[{color:'#26dcc1',values:[s.net_incremental_profit_inr,marginVolumeDelta,-s.scheme_spend_inr*sp,modelProfit]}],{unit:'L',height:330});
 const avgPerUnit=ratio(preSchemeTotal,s.actual_units);const requiredUnits=avgPerUnit>0?adjustedSpend/avgPerUnit:Infinity;const breakevenUplift=pct(requiredUnits,s.baseline_units);const newObservedUnits=s.actual_units*(1+up);const scenarioUplift=pct(newObservedUnits-s.baseline_units,s.baseline_units);
 const extra=avgPerUnit>0?Math.max(0,(adjustedSpend-(s.incremental_gross_margin_inr+marginVolumeDelta))/avgPerUnit):Infinity;
 $('breakevenPanel').innerHTML=`<div><div class="mini-overline">REQUIRED INCREMENTAL VOLUME OVER BASELINE</div><div class="break-number">${Number.isFinite(breakevenUplift)?pval(breakevenUplift):'N/A'}</div><div class="break-caption">Modelled break-even uplift rate at the adjusted scheme budget. Current modelled uplift is <strong>${pval(scenarioUplift)}</strong>.</div></div><div class="break-support"><span>Incremental units still needed</span><strong>${Number.isFinite(extra)?Math.ceil(extra).toLocaleString('en-IN'):'N/A'} units</strong></div><div class="break-support"><span>Campaign decision</span><strong class="${classPositive(modelProfit)}">${modelProfit>=0?'ABOVE BREAK-EVEN':'BELOW BREAK-EVEN'}</strong></div><div class="break-support"><span>Pre-scheme contribution per unit</span><strong>${money(avgPerUnit,0)}</strong></div>`;
}
function renderExplorer(rows){const q=state.search.toLowerCase();const view=rows.filter(x=>!q||[x.record_id,x.campaign_id,x.scheme_name,x.region,x.channel,x.product_category,x.financial_year].some(z=>String(z).toLowerCase().includes(q))).sort((a,b)=>b.record_date.localeCompare(a.record_date)||a.record_id.localeCompare(b.record_id));
 const size=18,allPages=Math.max(1,Math.ceil(view.length/size));state.pageNum=Math.min(state.pageNum,allPages);const first=(state.pageNum-1)*size,part=view.slice(first,first+size);
 $('explorerMeta').textContent=`${view.length.toLocaleString('en-IN')} matching rows • FY labels on every observation • ${part.length?`${first+1}–${first+part.length}`:'0'} shown`;
 $('explorerTable').innerHTML=table([['FINANCIAL YEAR'],['FY PERIOD'],['REGION'],['PRODUCT'],['CHANNEL'],['SCHEME'],['BASE UNITS',true],['ACTUAL UNITS',true],['NET SALES',true],['SPEND',true],['NET INCR. PROFIT',true],['ROI',true]],part.map(x=>`<tr><td>${esc(fyText(x.financial_year))}</td><td>${esc(x.financial_quarter+' · '+x.fiscal_month)}</td><td>${esc(x.region)}</td><td>${esc(x.product_category)}</td><td>${esc(x.channel)}</td><td>${esc(x.scheme_name)}</td><td class="num">${x.baseline_units.toLocaleString('en-IN')}</td><td class="num">${x.actual_units.toLocaleString('en-IN')}</td><td class="num">${money(x.net_sales_inr)}</td><td class="num">${money(x.scheme_spend_inr)}</td><td class="num ${classPositive(x.net_incremental_profit_inr)}">${money(x.net_incremental_profit_inr)}</td><td class="num ${classPositive(x.net_incremental_profit_inr)}">${pval(pct(x.net_incremental_profit_inr,x.scheme_spend_inr))}</td></tr>`));
 $('pageCounter').textContent=`Page ${state.pageNum} of ${allPages}`;$('prevPage').disabled=state.pageNum===1;$('nextPage').disabled=state.pageNum===allPages;
}
function render(){const rows=filterData();const stats=aggregate(rows);const prior=priorRows(rows);const prevStats=prior.length?aggregate(prior):null;
 const period=state.financial_year==='All'?'ALL FYs':' '+fyText(state.financial_year);
 $('filterStatus').textContent=`${rows.length.toLocaleString('en-IN')} observations · ${period.trim()} · ${state.financial_year==='FY2026-27'?'YTD Apr–Oct 2026':state.financial_year==='All'?'Apr 2023–Oct 2026':'Apr–Mar full FY unless quarter/month sliced'}`;
 const isYTD=state.financial_year==='FY2026-27';$('reportingBasis').textContent=state.financial_year==='All'?'ALL INDIAN FYs · MIXED COVERAGE':`${fyText(state.financial_year)} · ${isYTD?'YTD APR–OCT':'FY BASIS'}`;
 if(state.page==='overview')renderOverview(rows,stats,prevStats);
 else if(state.page==='schemes')renderSchemes(rows,stats);
 else if(state.page==='portfolio')renderPortfolio(rows,stats);
 else if(state.page==='regions')renderRegions(rows,stats);
 else if(state.page==='scenario')renderScenario(rows,stats);
 else if(state.page==='explorer')renderExplorer(rows);
}
function navigate(name){state.page=name;document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('is-active',b.dataset.page===name));document.querySelectorAll('.page-view').forEach(p=>p.classList.toggle('is-current',p.id===`page-${name}`));$('breadcrumbLabel').textContent=pageNames[name];$('pageTitle').textContent=pageTitle[name];$('pageSubtitle').textContent=pageSub[name];render();window.scrollTo({top:0,behavior:'instant'});}
function changeFilter(key,value){state[key]=value;state.pageNum=1;document.querySelector(`[data-filter="${key}"]`).value=value;render();}
function setupFilters(){const configs=[['financial_year',DATA.map(r=>r.financial_year).filter((v,i,a)=>a.indexOf(v)===i).sort().reverse()],['financial_quarter',['Q1','Q2','Q3','Q4']],['fiscal_month',FY_MONTHS],['region',[...new Set(DATA.map(x=>x.region))].sort()],['channel',[...new Set(DATA.map(x=>x.channel))].sort()],['product_category',[...new Set(DATA.map(x=>x.product_category))].sort()],['scheme_name',[...new Set(DATA.map(x=>x.scheme_name))].sort()]];
 configs.forEach(([key,values])=>{const elem=document.querySelector(`[data-filter="${key}"]`);const top=key==='financial_year'?'All FYs':'All';elem.innerHTML=`<option value="All">${top}</option>`+values.map(value=>`<option value="${esc(value)}">${esc(key==='financial_year'?fyText(value):value)}</option>`).join('');elem.value=state[key];elem.addEventListener('change',e=>changeFilter(key,e.target.value));});
}
function downloadCsv(){const rows=filterData();if(!rows.length){alert('There are no rows to export for the current slicers.');return;}
 const cols=['record_id','record_date','financial_year','financial_quarter','fiscal_month_no','fiscal_month','region','channel','product_category','scheme_name','scheme_type','campaign_id','baseline_units','actual_units','incremental_units','gross_sales_inr','regular_trade_discount_inr','scheme_spend_inr','scheme_budget_inr','net_sales_inr','manufacturing_cogs_inr','distribution_cost_inr','contribution_inr','incremental_gross_margin_inr','net_incremental_profit_inr'];
 const lines=[cols.join(','),...rows.map(r=>cols.map(k=>{const v=String(r[k]??'');return `"${v.replace(/"/g,'""')}"`;}).join(','))];const blob=new Blob(['\ufeff'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`AXIOM_Promotions_${state.financial_year==='All'?'All_FY':state.financial_year}_Filtered.csv`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function init(){if(!DATA.length){document.querySelector('.dashboard-content').innerHTML=empty('Dataset not loaded. Keep data/dataset.js next to index.html and try again.');return;}
 setupFilters();document.querySelectorAll('.nav-btn').forEach(btn=>btn.addEventListener('click',()=>navigate(btn.dataset.page)));
 $('resetFilters').addEventListener('click',()=>{for(const k of ['financial_year','financial_quarter','fiscal_month','region','channel','product_category','scheme_name'])state[k]=k==='financial_year'?'FY2025-26':'All';state.pageNum=1;document.querySelectorAll('[data-filter]').forEach(el=>el.value=state[el.dataset.filter]);render();});
 $('exportCsv').addEventListener('click',downloadCsv);$('printBtn').addEventListener('click',()=>window.print());
 $('upliftSlider').addEventListener('input',e=>{state.uplift=Number(e.target.value);if(state.page==='scenario')render();});$('spendSlider').addEventListener('input',e=>{state.spend=Number(e.target.value);if(state.page==='scenario')render();});$('scenarioReset').addEventListener('click',()=>{state.uplift=0;state.spend=0;$('upliftSlider').value=0;$('spendSlider').value=0;render();});
 $('tableSearch').addEventListener('input',e=>{state.search=e.target.value;state.pageNum=1;if(state.page==='explorer')render();});
 $('prevPage').addEventListener('click',()=>{state.pageNum--;render();});$('nextPage').addEventListener('click',()=>{state.pageNum++;render();});
 navigate('overview');
 window.__AXIOM_TEST__={state,aggregate,filterData,getFilteredCount:()=>filterData().length};
}
init();
})();
