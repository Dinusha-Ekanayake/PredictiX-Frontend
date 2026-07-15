/**
 * PredictiX — Asset Performance Report
 * Professional PDF with logo, 4-side margins, no browser chrome, full cost SHAP
 */

export interface AssetReportData {
  assetName: string; assetCode: string; warehouseName: string; reportDate: string;
  asset: {
    asset_type?: string; vehicle_type?: string; make?: string; model?: string;
    manufacture_year?: number|string; status?: string; health_band?: string;
    criticality_score?: string|number; fuel_type?: string; current_mileage?: string|number;
    purchase_date?: string; warranty_expiry_date?: string; last_service_date?: string;
    next_service_date?: string; vehicle_role?: string; payload_capacity_kg?: string|number;
    vehicle_age_years?: string|number; lifetime_service_count?: string|number;
    lifetime_breakdown_count?: string|number; description?: string;
  };
  health_score?: number; failure_probability?: number; risk_level?: string;
  days_until_maintenance?: number|null; predicted_maintenance_date?: string;
  estimated_cost?: number; cost_lower?: number; cost_upper?: number;
  /** LKR difference between this asset's estimate and fleet mean (real currency, not log-space) */
  cost_net_shap?: number;
  /** Fleet mean cost from the cost model's extra_data.fleet_mean_lkr — no longer hardcoded */
  fleet_avg_cost?: number;
  /** breakdown-cost label, e.g. "CatBoost v5.0" — shown instead of a hardcoded model name */
  cost_model_version?: string;
  /** Bundle-level accuracy stats for whichever cost model is currently loaded —
   *  real numbers from the model bundle, never hardcoded, so they never go
   *  stale when the model is retrained/replaced. */
  cost_test_r2?: number; cost_test_mae?: number; cost_test_medae?: number; cost_picp_80?: number;
  /** If the cost prediction endpoint failed, the real reason (HTTP status +
   *  backend error detail) — shown in place of a generic empty-state message
   *  so a failure is diagnosable directly from the report, without needing
   *  the browser Network tab or backend logs. */
  cost_error?: string;
  /** Cost model returns relative_impact (0-100%) + direction, NOT a raw LKR shap value.
   *  Per the model docs: "Never display sv_log directly — it is in log-ratio space." */
  cost_drivers?: Array<{feature:string;value:string;relative_impact:number;direction:"increases"|"decreases"}>;
  currency?: string; top_explanations?: Record<string,number>;
  ai_narrative?: string;
  sensor?: {
    recorded_at?: string; tire_health_pct?: string|number; brake_health_pct?: string|number;
    battery_health_pct?: string|number; oil_life_pct?: string|number;
    hydraulic_health_pct?: string|number; coolant_temp_max_c?: string|number;
    engine_temp_avg_c?: string|number; active_fault_code_count?: string|number;
    days_since_last_service?: string|number; engine_hours_since_last_service?: string|number;
    downtime_hours_last_90d?: string|number; fuel_level?: string|number; odometer_km?: string|number;
  };
  maintenance: Array<{performed_at?: string;event_type?: string;description?: string;cost_amount?: number;downtime_hours?: number}>;
  maintenanceMetrics: {total_events:number;preventive_count:number;corrective_count:number;total_cost:number;total_downtime_hours:number};
  tickets: Array<{ticket_number?: string;title?: string;priority?: string;status?: string;created_at?: string}>;
  ticketMetrics: {total_tickets:number;open_tickets:number;high_priority_tickets:number;closed_tickets:number};
  fleet: {
    total_assets:number; fleet_health:number; critical_alerts:number; open_tickets:number;
    predicted_failures:number; est_maintenance_cost:number;
    health_distribution: Array<{name:string;count:number}>;
    status_distribution: Array<{name:string;count:number}>;
    vehicle_distribution: Array<{name:string;count:number}>;
    top_risk_assets: Array<{name:string;location:string;healthScore:number;failureProbability:number;daysToMaintenance:number|null}>;
  };
  insights: {
    executive_summary?: string; ai_narrative?: string;
    cost_driver_sentences?: string[];
    recommendations?: {critical:string[];high:string[];medium:string[]};
    conclusion?: string;
  };
}

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  teal:"#0d9488", tealDark:"#0f766e", tealLight:"#f0fdfa", tealBorder:"#99f6e4",
  emerald:"#059669", amber:"#d97706", rose:"#e11d48", sky:"#0284c7",
  violet:"#7c3aed", orange:"#ea580c", slate:"#64748b",
  textDark:"#111827", textMid:"#374151", textLight:"#6b7280",
  border:"#e5e7eb", bg:"#f9fafb", white:"#ffffff",
};

function fmt(v:any,fb="—"):string{return(v==null||v===""||v==="—")?fb:String(v);}
function fmtCost(v:number,cur="LKR"):string{return`${cur} ${Number(v).toLocaleString()}`;}
function fmtDate(v:any):string{return v?String(v).slice(0,10):"—";}
function cap(s:string):string{return s?s.charAt(0).toUpperCase()+s.slice(1):s;}

// ── PredictiX Logo — uses actual icon from public/logo/ ─────────────────────
// The icon SVG is embedded inline as fallback; the img tag loads the real file
function buildLogo(origin: string): string {
  return `<div style="display:flex;align-items:center;gap:10px">
    <img src="${origin}/logo/predictix-icon.svg" width="40" height="40"
      style="display:block"
      onerror="this.style.display='none'"
      alt="PredictiX"/>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 48" width="180" height="33">
      <text font-family="Georgia,'Times New Roman',serif" font-size="40" font-weight="700" y="38">
        <tspan x="0" fill="#111827">Predic</tspan><tspan fill="#0d9488">ti</tspan><tspan fill="#111827">X</tspan>
      </text>
    </svg>
  </div>`;
}

// ── SVG Vertical Bar ──────────────────────────────────────────────────────────
function svgVBar(data:Array<{name:string;count:number}>,colors:string[],w=460,h=165):string{
  if(!data.length)return`<p style="color:${C.textLight};font-size:10px;text-align:center;padding:12px">No data</p>`;
  const mx=Math.max(...data.map(d=>d.count));
  const bw=Math.min(50,Math.floor((w-48)/data.length)-6);
  const ch=h-32;
  const grid=[0,Math.round(mx/2),mx].map(v=>{
    const y=ch-(mx?(v/mx)*ch:0)+2;
    return`<text x="35" y="${y+3}" text-anchor="end" font-size="8" fill="${C.textLight}">${v}</text><line x1="38" y1="${y}" x2="${w}" y2="${y}" stroke="${C.border}" stroke-width="0.5" stroke-dasharray="3,3"/>`;
  }).join("");
  const bars=data.map((d,i)=>{
    const bh=mx?Math.max(2,Math.round((d.count/mx)*ch)):2;
    const x=42+i*(bw+6);const y=ch-bh+2;
    return`<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="2" fill="${colors[i%colors.length]}"/>
      <text x="${x+bw/2}" y="${y-3}" text-anchor="middle" font-size="8" fill="${C.textMid}" font-weight="600">${d.count}</text>
      <text x="${x+bw/2}" y="${h-3}" text-anchor="middle" font-size="7.5" fill="${C.textLight}">${d.name.replace(/_/g," ").slice(0,10)}</text>`;
  }).join("");
  return`<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}">${grid}${bars}</svg>`;
}

// ── SVG Horizontal Bar (SHAP failure) ────────────────────────────────────────
function svgHBar(data:Array<{name:string;pct:number}>,colors:string[],w=440):string{
  if(!data.length)return"";
  const bH=19,gap=4,lW=185,totalH=data.length*(bH+gap);
  const bars=data.map((d,i)=>{
    const bw=Math.max(3,(d.pct/100)*(w-lW-55));
    const y=i*(bH+gap);
    return`<text x="${lW-5}" y="${y+bH*0.72}" text-anchor="end" font-size="10" fill="${C.textMid}">${d.name}</text>
      <rect x="${lW}" y="${y}" width="${bw.toFixed(1)}" height="${bH}" rx="2" fill="${colors[i%colors.length]}"/>
      <text x="${lW+bw+5}" y="${y+bH*0.72}" font-size="10" fill="${C.textMid}" font-weight="600">${d.pct}%</text>`;
  }).join("");
  return`<svg viewBox="0 0 ${w} ${totalH}" width="100%" height="${totalH}">${bars}</svg>`;
}

// ── SVG Cost Driver Bars (relative importance %, per v4 API contract) ────────
// v4's /predictions/cost/{id} returns extra_data.top_drivers with `relative_impact`
// (0-100, share of total SHAP impact) and `direction` ("increases"|"decreases").
// There is no per-feature LKR amount — sv_log is log1p-space and must never be shown.
function svgCostBars(drivers:Array<{feature:string;value:string;relative_impact:number;direction:string}>,w=440):string{
  if(!drivers.length)return"";
  const bH=20,gap=6,lW=190,totalH=drivers.length*(bH+gap);
  const bars=drivers.map((d,i)=>{
    const isUp=d.direction==="increases";
    const col=isUp?C.rose:C.emerald;
    const pct=Math.max(0,Math.min(100,d.relative_impact));
    const bw=Math.max(3,(pct/100)*(w-lW-60));
    const y=i*(bH+gap);
    const featLbl=d.feature.replace(/_/g," ").replace(/^part /,"").slice(0,22);
    const valLbl=d.value?` (${String(d.value).replace(/_/g," ").slice(0,16)})`:"";
    const lbl=(featLbl+valLbl).slice(0,34);
    return`<text x="${lW-5}" y="${y+bH*0.72}" text-anchor="end" font-size="9.5" fill="${C.textMid}">${lbl}</text>
      <rect x="${lW}" y="${y}" width="${bw.toFixed(1)}" height="${bH}" rx="2" fill="${col}"/>
      <text x="${lW+bw+5}" y="${y+bH*0.72}" font-size="9.5" fill="${col}" font-weight="700">${isUp?"▲":"▼"} ${pct.toFixed(1)}%</text>`;
  }).join("");
  return`<svg viewBox="0 0 ${w} ${totalH}" width="100%" height="${totalH}">${bars}</svg>`;
}

// ── Donut chart ───────────────────────────────────────────────────────────────
function svgDonut(data:Array<{name:string;count:number}>,colors:string[],size=100):string{
  const total=data.reduce((s,d)=>s+d.count,0);
  if(!total)return`<p style="color:${C.textLight};font-size:10px">No data</p>`;
  let cum=-Math.PI/2;
  const cx=size/2,cy=size/2,r=size/2-7,ir=size/2-20;
  let paths="";
  data.forEach((d,i)=>{
    const a=(d.count/total)*2*Math.PI;
    const x1=cx+r*Math.cos(cum),y1=cy+r*Math.sin(cum);
    const x2=cx+r*Math.cos(cum+a),y2=cy+r*Math.sin(cum+a);
    const ix1=cx+ir*Math.cos(cum),iy1=cy+ir*Math.sin(cum);
    const ix2=cx+ir*Math.cos(cum+a),iy2=cy+ir*Math.sin(cum+a);
    const lg=a>Math.PI?1:0;
    const lp=Math.round((d.count/total)*100);
    paths+=`<path d="M${ix1.toFixed(1)},${iy1.toFixed(1)} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${lg},1 ${x2.toFixed(1)},${y2.toFixed(1)} L${ix2.toFixed(1)},${iy2.toFixed(1)} A${ir},${ir} 0 ${lg},0 ${ix1.toFixed(1)},${iy1.toFixed(1)} Z" fill="${colors[i%colors.length]}" stroke="white" stroke-width="1.5"/>`;
    if(lp>6){const mx=cx+(r+ir)/2*Math.cos(cum+a/2),my=cy+(r+ir)/2*Math.sin(cum+a/2);paths+=`<text x="${mx.toFixed(1)}" y="${my.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="8" font-weight="bold">${lp}%</text>`;}
    cum+=a;
  });
  const legend=data.map((d,i)=>`<div style="display:flex;align-items:center;gap:4px;margin-bottom:3px"><div style="width:8px;height:8px;border-radius:1px;background:${colors[i%colors.length]};flex-shrink:0"></div><span style="font-size:9.5px;color:${C.textDark}">${d.name}: <b>${d.count}</b></span></div>`).join("");
  return`<div style="display:flex;align-items:center;gap:12px"><svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${paths}</svg><div>${legend}</div></div>`;
}

// ── Components ────────────────────────────────────────────────────────────────
function kpiRow(items:Array<{label:string;value:string;color?:string}>):string{
  return`<div class="no-break" style="display:grid;grid-template-columns:repeat(${items.length},1fr);border:1px solid ${C.border};border-radius:6px;overflow:hidden;margin-bottom:14px">
    ${items.map((it,i)=>`<div style="padding:10px 12px;${i<items.length-1?`border-right:1px solid ${C.border};`:""} background:white">
      <div style="font-size:7.5px;color:${C.textLight};text-transform:uppercase;letter-spacing:.7px;margin-bottom:2px">${it.label}</div>
      <div style="font-size:17px;font-weight:800;color:${it.color||C.teal};line-height:1">${it.value}</div>
    </div>`).join("")}
  </div>`;
}

function infoTbl(rows:Array<[string,string]>):string{
  return`<div class="no-break" style="border:1px solid ${C.border};border-radius:5px;overflow:hidden;margin-bottom:12px"><table style="width:100%;border-collapse:collapse">
    ${rows.map(([l,v],i)=>`<tr style="background:${i%2===0?C.bg:"white"}"><td style="padding:5px 11px;font-size:10px;color:${C.textLight};width:40%;border-bottom:1px solid ${C.border}">${l}</td><td style="padding:5px 11px;font-size:10px;font-weight:600;color:${C.textDark};border-bottom:1px solid ${C.border}">${v}</td></tr>`).join("")}
  </table></div>`;
}

function dataTbl(headers:string[],rows:string[][],caption=""):string{
  const th=`<tr>${headers.map(h=>`<th style="padding:7px 10px;font-size:9.5px;font-weight:700;color:white;background:${C.textDark};text-align:left;white-space:nowrap">${h}</th>`).join("")}</tr>`;
  const tb=rows.map((row,i)=>`<tr class="no-break" style="background:${i%2===0?C.bg:"white"}">${row.map(c=>`<td style="padding:5px 10px;font-size:9.5px;color:${C.textDark};border-bottom:1px solid ${C.border}">${c}</td>`).join("")}</tr>`).join("");
  return`<div class="no-break" style="border:1px solid ${C.border};border-radius:5px;overflow:hidden;margin-bottom:8px"><table style="width:100%;border-collapse:collapse"><thead>${th}</thead><tbody>${tb}</tbody></table></div>${caption?`<p style="font-size:9px;font-style:italic;color:${C.textLight};text-align:center;margin:2px 0 12px">${caption}</p>`:""}`;
}

function chartBox(title:string,content:string,caption=""):string{
  return`<div class="no-break" style="border:1px solid ${C.border};border-radius:6px;padding:11px 14px;margin-bottom:12px;background:white">
    <div style="font-size:8.5px;font-weight:700;color:${C.textLight};letter-spacing:.9px;text-transform:uppercase;margin-bottom:8px">${title}</div>
    ${content}
    ${caption?`<p style="font-size:9px;font-style:italic;color:${C.textLight};text-align:center;margin:6px 0 0">${caption}</p>`:""}
  </div>`;
}

function hlBox(label:string,body:string,color=C.teal):string{
  return`<div class="no-break" style="border-left:4px solid ${color};background:${color}08;border-radius:0 5px 5px 0;padding:9px 14px;margin-bottom:10px">
    <div style="font-size:8px;font-weight:700;color:${color};letter-spacing:.8px;text-transform:uppercase;margin-bottom:4px">${label}</div>
    <div style="font-size:10px;color:${C.textMid};line-height:1.65">${body}</div>
  </div>`;
}

function riskBadge(level:string):string{
  const col:Record<string,string>={Low:C.emerald,Medium:C.amber,High:C.rose,Critical:"#dc2626"};
  return`<span style="display:inline-block;padding:1px 7px;border-radius:3px;font-size:9px;font-weight:700;color:white;background:${col[level]||C.slate}">${level}</span>`;
}

function secH(num:string,title:string,sub=""):string{
  return`<div class="no-break" style="margin:18px 0 8px;break-after:avoid;page-break-after:avoid">
    <div style="display:flex;align-items:center;gap:8px">
      <div style="background:${C.teal};color:white;font-size:9px;font-weight:700;padding:2px 7px;border-radius:3px">${num}</div>
      <h2 style="font-size:15px;font-weight:700;color:${C.textDark};margin:0">${title}${sub?` <span style="font-size:11px;font-weight:400;color:${C.textLight}">· ${sub}</span>`:""}</h2>
    </div>
    <div style="height:2.5px;background:${C.teal};border-radius:2px;margin-top:5px"></div>
  </div>`;
}

function subH(title:string):string{
  return`<h3 style="font-size:12px;font-weight:700;color:${C.textDark};margin:12px 0 6px;break-after:avoid;page-break-after:avoid">${title}</h3>`;
}

// ── Page wrapper: header + content + footer (no browser chrome) ───────────────
function page(content:string,warehouse:string,section:string,origin=""):string{
  return`<div class="page">
    <!-- inner border frame -->
    <div style="border:1.5px solid ${C.teal};border-radius:4px;min-height:calc(100% - 0px);display:flex;flex-direction:column">
      <!-- page header -->
      <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 14px;background:${C.tealLight};border-bottom:1px solid ${C.tealBorder};flex-shrink:0">
        <div style="display:flex;align-items:center;gap:7px">
          <img src="${origin}/logo/predictix-icon.svg" width="18" height="18" style="display:block;opacity:0.85" onerror="this.style.display='none'" alt=""/>
          <span style="font-size:8.5px;font-weight:700;color:${C.teal};letter-spacing:.7px;text-transform:uppercase">PREDICTIX</span>
        </div>
        <span style="font-size:8.5px;color:${C.textLight}">${section}</span>
      </div>
      <!-- page body — footer removed here; a repeating footer (with a live,
           correct page count that includes any overflow pages) is now
           rendered by Playwright itself, once per physical PDF page, via
           reports.py's footer_template. See downloadAssetPDFServer. -->
      <div style="padding:14px 18px;flex:1">${content}</div>
    
      </div>
  </div>`;
}

// ── Sensorhealth bars ─────────────────────────────────────────────────────────
function sensorBars(fields:Array<{name:string;value:number;color:string}>,w=440):string{
  const bH=16,gap=7,lW=165,totalH=fields.length*(bH+gap);
  const bars=fields.map((f,i)=>{
    const bw=Math.max(2,(f.value/100)*(w-lW-50));const y=i*(bH+gap);
    return`<text x="${lW-5}" y="${y+bH*0.75}" text-anchor="end" font-size="9.5" fill="${C.textMid}">${f.name}</text>
      <rect x="${lW}" y="${y}" width="${w-lW-50}" height="${bH}" rx="2" fill="${C.border}"/>
      <rect x="${lW}" y="${y}" width="${bw.toFixed(1)}" height="${bH}" rx="2" fill="${f.color}"/>
      <text x="${lW+bw+5}" y="${y+bH*0.75}" font-size="9.5" fill="${C.textMid}" font-weight="600">${f.value}%</text>`;
  }).join("");
  return`<svg viewBox="0 0 ${w} ${totalH}" width="100%" height="${totalH}">${bars}</svg>`;
}

// ── CSS — proper margins, no browser chrome ───────────────────────────────────
const CSS=`
  @page {
    size: A4 portrait;
    margin: 14mm 13mm 13mm 13mm;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
    color: ${C.textDark}; background: white; font-size: 10.5px; line-height: 1.5;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .page {
    page-break-after: always;
    background: white;
    /* No fixed height/overflow here anymore — a topic's content can now
       naturally overflow onto additional physical pages instead of being
       silently clipped once it grows past one sheet's worth of content
       (e.g. once real cost-model data fills out Health/Risk/Cost). */
    min-height: calc(297mm - 27mm);
  }
  .page:last-child { page-break-after: auto; }
  .no-break { break-inside: avoid; page-break-inside: avoid; }
  h2, h3 { break-after: avoid; page-break-after: avoid; }
  tr { break-inside: avoid; page-break-inside: avoid; }
  table { border-collapse: collapse; width: 100%; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @page { margin: 14mm 13mm 13mm 13mm; }
  }
`;

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN GENERATOR
// ══════════════════════════════════════════════════════════════════════════════
function generateHTML(data:AssetReportData, origin=""):string{
  const {asset,fleet,sensor,maintenance,tickets,maintenanceMetrics,ticketMetrics,insights}=data;
  const cur=data.currency||"LKR";
  const hs=data.health_score, fp=data.failure_probability, rl=data.risk_level??"—";
  const hCol=hs!=null?(hs>=80?C.emerald:hs>=60?C.amber:C.rose):C.slate;
  const rColors:Record<string,string>={Low:C.emerald,Medium:C.amber,High:C.rose,Critical:"#dc2626"};
  const rCol=rColors[rl]??C.slate;
  const recs=insights.recommendations||{critical:[],high:[],medium:[]};
  const wLbl=data.warehouseName.toUpperCase().replace(/[^A-Z0-9 \-]/g,"");
  // Page numbering is now handled entirely by Playwright's footer template
  // (see reports.py) using its own live pageNumber/totalPages — no longer
  // tracked here, since a topic can now span a variable number of physical
  // pages depending on content length.

  const shapCols=[C.teal,"#3b82f6",C.amber,C.violet,C.orange,"#db2777",C.emerald,C.rose];

  // ── PAGE 1: COVER ──────────────────────────────────────────────────────────
  const cover=`<div class="page" style="background:white;height:calc(297mm - 27mm);display:flex;flex-direction:column">
    <!-- top teal stripe -->
    <div style="background:${C.teal};height:6px;flex-shrink:0"></div>

    <!-- body -->
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 40px;text-align:center">

      <!-- logo -->
      <div style="margin-bottom:6px">${buildLogo(origin)}</div>
      <div style="font-size:8.5px;color:${C.textLight};letter-spacing:1.4px;text-transform:uppercase;margin-bottom:24px">AI-Powered Asset Management Platform</div>

      <!-- teal rule -->
      <div style="width:52px;height:2.5px;background:${C.teal};border-radius:2px;margin-bottom:26px"></div>

      <!-- report card -->
      <div style="border:1px solid ${C.tealBorder};border-radius:8px;padding:24px 40px;background:${C.tealLight};max-width:400px;width:100%;margin-bottom:26px">
        <div style="font-size:9px;font-weight:700;color:${C.teal};letter-spacing:1.8px;text-transform:uppercase;margin-bottom:10px">Asset Performance Report</div>
        <h1 style="font-size:22px;font-weight:800;color:${C.textDark};line-height:1.2;margin-bottom:5px">${data.assetName}</h1>
        <div style="font-size:12px;color:${C.textLight};margin-bottom:0">${data.warehouseName}</div>
      </div>

      <!-- meta -->
      <div style="font-size:10.5px;color:${C.textLight};margin-bottom:3px">
        Report Generated: <strong style="color:${C.textDark}">${data.reportDate}</strong>
      </div>
      <div style="font-size:10.5px;color:${C.textLight};margin-bottom:16px">
        Asset Code: <strong style="color:${C.textDark}">${data.assetCode}</strong>
        &nbsp;·&nbsp; Make / Model: <strong style="color:${C.textDark}">${[asset.make,asset.model,asset.manufacture_year].filter(Boolean).join(" ")||"—"}</strong>
      </div>
      <div style="display:inline-block;border:1px solid ${C.amber};color:${C.amber};font-size:8.5px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;padding:3px 14px;border-radius:3px">Confidential</div>
    </div>

    <!-- bottom teal stripe -->
    <div style="background:${C.teal};height:6px;flex-shrink:0"></div>
  </div>`;

  // ── PAGE 1 (content): ASSET OVERVIEW ─────────────────────────────────────────
  const healthGauge=hs!=null?`
    <div style="display:flex;align-items:center;gap:18px;padding:8px 0">
      <div style="position:relative;width:80px;height:80px;flex-shrink:0">
        <svg viewBox="0 0 80 80" width="80" height="80">
          <circle cx="40" cy="40" r="32" fill="none" stroke="${C.border}" stroke-width="9"/>
          <circle cx="40" cy="40" r="32" fill="none" stroke="${hCol}" stroke-width="9"
            stroke-dasharray="${Math.round((hs/100)*201)} 201" stroke-linecap="round"
            transform="rotate(-90 40 40)"/>
          <text x="40" y="44" text-anchor="middle" dominant-baseline="middle" font-size="14" font-weight="800" fill="${hCol}">${hs}%</text>
        </svg>
      </div>
      <div>
        <div style="font-size:8px;color:${C.textLight};text-transform:uppercase;letter-spacing:.6px;margin-bottom:3px">Overall Health Score</div>
        <div style="font-size:20px;font-weight:800;color:${hCol}">${hs}%</div>
        <div style="font-size:9.5px;color:${C.textMid};margin-top:2px">${hs>=80?"Optimal — maintain schedule":hs>=60?"Moderate — service soon":"Critical — immediate action"}</div>
        ${fp!=null?`<div style="font-size:9px;color:${C.textLight};margin-top:4px">Failure Probability: <strong style="color:${C.rose}">${fp}%</strong></div>`:""}
        ${rl!=="—"?`<div style="font-size:9px;color:${C.textLight};margin-top:2px">Risk Level: ${riskBadge(rl)}</div>`:""}
      </div>
    </div>`
    :`<p style="font-size:10px;color:${C.textLight};padding:10px 0">No prediction data — run AI prediction to generate health scores.</p>`;

  const assetRows:[string,string][]=[
    ["Asset Code",          fmt(data.assetCode)],
    ["Asset Type",         [asset.asset_type,asset.vehicle_type].filter(Boolean).join(" · ")||"—"],
    ["Make / Model",       [asset.make,asset.model,asset.manufacture_year].filter(Boolean).join(" ")||"—"],
    ["Status",              cap(fmt(asset.status))],
    ["Health Band",         cap(fmt(asset.health_band))],
    ["Criticality Score",   fmt(asset.criticality_score)],
    ["Fuel Type",           fmt(asset.fuel_type)],
    ["Current Mileage",     asset.current_mileage?`${asset.current_mileage} km`:"—"],
    ["Vehicle Role",        fmt(asset.vehicle_role)],
    ["Vehicle Age",         asset.vehicle_age_years?`${asset.vehicle_age_years} yrs`:"—"],
    ["Payload Capacity",    asset.payload_capacity_kg?`${asset.payload_capacity_kg} kg`:"—"],
    ["Purchase Date",       fmtDate(asset.purchase_date)],
    ["Warranty Expiry",     fmtDate(asset.warranty_expiry_date)],
    ["Last Service",        fmtDate(asset.last_service_date)],
    ["Next Service",        fmtDate(asset.next_service_date)],
    ["Lifetime Services",   fmt(asset.lifetime_service_count)],
    ["Lifetime Breakdowns", fmt(asset.lifetime_breakdown_count)],
    ["Warehouse",           fmt(data.warehouseName)],
  ];

  const p3=page(`
    ${secH("1","Asset Overview","Asset details and prediction summary")}

    ${subH("1.1 Prediction Summary")}
    ${chartBox("ASSET HEALTH & PREDICTION",`
      <div style="display:grid;grid-template-columns:auto 1fr;gap:18px;align-items:start">
        <div>${healthGauge}</div>
        <table style="width:100%;border-collapse:collapse">
          ${([
            ["Est. Cost (v5)",           data.estimated_cost?fmtCost(data.estimated_cost,cur):"Run AI prediction"],
            ["80% Confidence Lower",     data.cost_lower?fmtCost(data.cost_lower,cur):"—"],
            ["80% Confidence Upper",     data.cost_upper?fmtCost(data.cost_upper,cur):"—"],
            ["Days Until Maintenance",   data.days_until_maintenance!=null?`${data.days_until_maintenance} days`:"—"],
            ["Predicted Maint. Date",    fmtDate(data.predicted_maintenance_date)],
          ] as [string,string][]).map(([l,v],i)=>`<tr style="background:${i%2===0?C.bg:"white"}">
            <td style="padding:4px 10px;font-size:9.5px;color:${C.textLight};border-bottom:1px solid ${C.border};width:48%">${l}</td>
            <td style="padding:4px 10px;font-size:9.5px;font-weight:600;color:${C.textDark};border-bottom:1px solid ${C.border}">${v}</td>
          </tr>`).join("")}
        </table>
      </div>
    `,"Figure 1.1 — Health score and cost prediction summary")}

    ${subH("1.2 Asset Details")}
    ${infoTbl(assetRows)}
  `,wLbl,"Asset Overview",origin);

  // ── PAGE 2: HEALTH, RISK & COST ESTIMATION ───────────────────────────────────────
  // Build SHAP data — normalise to 0-100% regardless of input format
  const shapData=(()=>{
    const raw=data.top_explanations;
    if(!raw||typeof raw!=="object") return [];
    const entries=Object.entries(raw);
    if(!entries.length) return [];
    // Check if keys are numeric indices (bad format) — skip if so
    const allNumeric=entries.every(([k])=>!isNaN(Number(k)));
    if(allNumeric) return []; // no named features — show "no data"
    // Values may be 0-1 or already 0-100; normalise to sum=100
    const vals=entries.map(([,v])=>Math.abs(Number(v)));
    const total=vals.reduce((a,b)=>a+b,0)||1;
    const maxV=Math.max(...vals)||1;
    // If sum ≈ 1, values are fractions → multiply by 100; if sum > 5, already pct
    const scale=total<2?100:1;
    return entries
      .map(([name,val],i)=>({
        name:name.replace(/_/g," ").replace(/pct/g,"%").replace(/\w/g,c=>c.toUpperCase()),
        pct:Math.round((vals[i]/maxV)*100*10)/10,
      }))
      .sort((a,b)=>b.pct-a.pct)
      .slice(0,8);
  })();

  const costDrivers=data.cost_drivers||[];

  const recBlock=(level:string,items:string[],col:string)=>
    items.length?`<div class="no-break" style="break-inside:avoid;page-break-inside:avoid">${hlBox(level+" PRIORITY",items.map(r=>`• ${r}`).join("<br/>"),col)}</div>`:"";

  const p4=page(`
    ${secH("2","Health, Risk Analysis & Cost Estimation",`Key factors · ${data.cost_model_version||"AI Cost Model"}`)}

    ${subH("2.1 Failure Prediction — Key Risk Factors")}
    ${shapData.length
      ?`${chartBox("KEY FACTORS DRIVING FAILURE RISK",svgHBar(shapData,shapCols,430),"Figure 2.1 — Relative importance of each factor, normalised to 100%")}
        ${dataTbl(["Factor","Relative Importance"],shapData.map(d=>[d.name,`${d.pct}%`]),
          "Figure 2.2 — Factors ranked by influence on failure risk")}`
      :hlBox("RISK FACTOR DATA NOT AVAILABLE","Run the AI prediction engine to generate risk factor scores.",C.amber)}

    ${subH("2.2 Explanation of Your Estimated Cost")}
    ${costDrivers.length?`
      ${(()=>{
        const statParts=[
          data.cost_test_mae!=null?`Test MAE: ${fmtCost(data.cost_test_mae,cur)}`:null,
          data.cost_test_r2!=null?`R² = ${data.cost_test_r2.toFixed(2)}`:null,
          data.cost_test_medae!=null?`MedAE: ${fmtCost(data.cost_test_medae,cur)}`:null,
          data.cost_picp_80!=null?`80% PI coverage: ${data.cost_picp_80.toFixed(1)}%`:null,
        ].filter(Boolean);
        const statSuffix=statParts.length?` · ${statParts.join(" · ")}`:"";
        return hlBox("HOW TO READ THIS",
          `These are the factors that influenced this cost estimate the most, shown as their share of total impact (0–100%) rather than a direct LKR amount.<br/>
           Red bars = factors that push cost above the fleet average &nbsp;|&nbsp; Green bars = factors that pull cost below the fleet average.<br/>
           Model: ${data.cost_model_version||"AI Cost Model"} · Target: cost in the next 30 days given current health${statSuffix}`,
          C.amber);
      })()}
      ${chartBox("COST DRIVERS — RELATIVE IMPORTANCE",
        svgCostBars(costDrivers,430),
        `Figure 2.3 — ${data.cost_model_version||"AI Cost Model"} relative importance of each cost factor · red = increases estimate · green = decreases estimate`)}
      ${dataTbl(
        ["Feature","Current Value","Relative Impact","Effect"],
        costDrivers.map(d=>{
          const isUp=d.direction==="increases";
          const col=isUp?C.rose:C.emerald;
          return[
            d.feature.replace(/_/g," "),
            String(d.value).slice(0,28),
            `<span style="color:${col};font-weight:700">${d.relative_impact.toFixed(1)}%</span>`,
            `<span style="color:${col}">${isUp?"▲ Increases cost":"▼ Decreases cost"}</span>`,
          ];
        }),
        `Figure 2.4 — Top cost factors ranked by relative importance (${data.cost_model_version||"AI Cost Model"})`
      )}
      <div class="no-break" style="border:1px solid ${C.border};border-radius:5px;overflow:hidden;margin-bottom:12px">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr">
          ${[
            ["Point Estimate",   data.estimated_cost?fmtCost(data.estimated_cost,cur):"—",  C.teal],
            ["80% CI Lower",    data.cost_lower?fmtCost(data.cost_lower,cur):"—",          C.emerald],
            ["80% CI Upper",    data.cost_upper?fmtCost(data.cost_upper,cur):"—",          C.rose],
          ].map(([l,v,c],i)=>`<div style="padding:10px 13px;${i<2?`border-right:1px solid ${C.border};`:""}background:white">
            <div style="font-size:7.5px;color:${C.textLight};text-transform:uppercase;letter-spacing:.6px;margin-bottom:2px">${l}</div>
            <div style="font-size:15px;font-weight:800;color:${c}">${v}</div>
          </div>`).join("")}
        </div>
        <div style="padding:8px 13px;background:${C.bg};border-top:1px solid ${C.border};font-size:9px;color:${C.textLight}">
          Fleet average cost: <strong>${data.fleet_avg_cost?fmtCost(data.fleet_avg_cost,cur):"—"}</strong> &nbsp;·&nbsp;
          This asset vs average: <strong style="color:${data.cost_net_shap!=null?(data.cost_net_shap>0?C.rose:C.emerald):C.slate}">
            ${data.cost_net_shap!=null?(data.cost_net_shap>0?"+":"")+fmtCost(data.cost_net_shap,cur)+" vs fleet average":"—"}
          </strong>
        </div>
      </div>
    `:hlBox("COST MODEL DATA NOT AVAILABLE",
        data.cost_error
          ? `The cost prediction request failed: <strong>${data.cost_error}</strong>. Contact your system administrator with this message.`
          : "Run the cost prediction model to generate a cost breakdown.",
        C.amber)}

    ${insights.executive_summary?`${subH("2.3 AI Executive Summary")}${hlBox("AI ANALYSIS",
      String(insights.executive_summary).slice(0,350)+(String(insights.executive_summary).length>350?"…":""),
      C.teal)}`:""}
    ${insights.ai_narrative&&insights.ai_narrative!==insights.executive_summary&&insights.ai_narrative.length>5?
      hlBox("AI NARRATIVE",String(insights.ai_narrative).slice(0,250),C.sky):""}

    ${subH("2.4 Recommendations")}
    ${recBlock("Critical",recs.critical,C.rose)}
    ${recBlock("High",recs.high,C.amber)}
    ${recBlock("Medium",recs.medium,C.sky)}
    ${!recs.critical.length&&!recs.high.length&&!recs.medium.length
      ?hlBox("RECOMMENDATIONS","No specific recommendations. Run AI prediction for asset-specific guidance.",C.slate):""}
  `,wLbl,"Health, Risk & Cost Estimation",origin);

  // ── PAGE 3: SENSOR + MAINTENANCE ──────────────────────────────────
  const sRows:[string,string][]=sensor?[
    ["Recorded At",               fmt(sensor.recorded_at)],
    ["Tire Health",               sensor.tire_health_pct!=null?`${sensor.tire_health_pct}%`:"—"],
    ["Brake Health",              sensor.brake_health_pct!=null?`${sensor.brake_health_pct}%`:"—"],
    ["Battery Health",            sensor.battery_health_pct!=null?`${sensor.battery_health_pct}%`:"—"],
    ["Oil Life",                  sensor.oil_life_pct!=null?`${sensor.oil_life_pct}%`:"—"],
    ["Hydraulic Health",          sensor.hydraulic_health_pct!=null?`${sensor.hydraulic_health_pct}%`:"—"],
    ["Coolant Temp Max (°C)",     fmt(sensor.coolant_temp_max_c)],
    ["Engine Temp Avg (°C)",      fmt(sensor.engine_temp_avg_c)],
    ["Active Fault Codes",        fmt(sensor.active_fault_code_count)],
    ["Days Since Service",        fmt(sensor.days_since_last_service)],
    ["Engine Hours Since Service",fmt(sensor.engine_hours_since_last_service)],
    ["Downtime Last 90d (h)",     fmt(sensor.downtime_hours_last_90d)],
    ["Fuel Level",                sensor.fuel_level!=null?`${sensor.fuel_level}%`:"—"],
    ["Odometer (km)",             fmt(sensor.odometer_km)],
  ]:[];

  const sensorHealthFields=sensor?[
    {name:"Tire Health",      value:parseFloat(String(sensor.tire_health_pct||0)),      color:parseFloat(String(sensor.tire_health_pct||0))>=70?C.emerald:C.rose},
    {name:"Brake Health",     value:parseFloat(String(sensor.brake_health_pct||0)),     color:parseFloat(String(sensor.brake_health_pct||0))>=70?C.emerald:C.rose},
    {name:"Battery Health",   value:parseFloat(String(sensor.battery_health_pct||0)),   color:parseFloat(String(sensor.battery_health_pct||0))>=70?C.emerald:C.amber},
    {name:"Oil Life",         value:parseFloat(String(sensor.oil_life_pct||0)),         color:parseFloat(String(sensor.oil_life_pct||0))>=50?C.emerald:C.rose},
    {name:"Hydraulic Health", value:parseFloat(String(sensor.hydraulic_health_pct||0)),color:parseFloat(String(sensor.hydraulic_health_pct||0))>=70?C.emerald:C.amber},
  ].filter(f=>f.value>0):[];

  const maintRows=maintenance.slice(0,8).map(m=>[
    fmtDate(m.performed_at),cap(fmt(m.event_type)),
    fmt(String(m.description??"—").slice(0,50)),
    m.cost_amount?fmtCost(m.cost_amount,cur):"—",
    m.downtime_hours?`${m.downtime_hours}h`:"—",
  ]);

  const ticketRows=tickets.slice(0,8).map(t=>{
    const pri=(t.priority||"").toLowerCase();
    const pc=pri==="high"?C.rose:pri==="medium"?C.amber:C.emerald;
    return[fmt(t.ticket_number),fmt(String(t.title??"—").slice(0,55)),
      `<span style="color:${pc};font-weight:700">${cap(fmt(t.priority))}</span>`,
      cap(fmt(t.status)),fmtDate(t.created_at)];
  });

  const maintDonut=maintenanceMetrics.total_events>0
    ?svgDonut([{name:"Preventive",count:maintenanceMetrics.preventive_count},{name:"Corrective",count:maintenanceMetrics.corrective_count}],[C.emerald,C.rose],90):"";
  const ticketDonut=ticketMetrics.total_tickets>0
    ?svgDonut([{name:"Open",count:ticketMetrics.open_tickets},{name:"High Pri.",count:ticketMetrics.high_priority_tickets},{name:"Closed",count:ticketMetrics.closed_tickets}],[C.rose,C.amber,C.emerald],90):"";

  const p5=page(`
    ${secH("3","Sensor Data & Maintenance","Latest readings and maintenance history")}

    ${subH("3.1 Latest Sensor Snapshot")}
    ${sRows.length?infoTbl(sRows)
      :hlBox("SENSOR STATUS","No sensor readings available. Connect asset to the PredictiX monitoring system.",C.slate)}

    ${sensorHealthFields.length?`${subH("3.2 Component Health Levels")}${chartBox("COMPONENT HEALTH",sensorBars(sensorHealthFields,430),"Figure 3.1 — Component health as percentage")}` :""}

    ${subH("3.3 Maintenance Summary")}
    ${infoTbl([
      ["Total Events",       String(maintenanceMetrics.total_events)],
      ["Preventive Events",  String(maintenanceMetrics.preventive_count)],
      ["Corrective Events",  String(maintenanceMetrics.corrective_count)],
      ["Total Cost",         fmtCost(maintenanceMetrics.total_cost,cur)],
      ["Total Downtime",     `${maintenanceMetrics.total_downtime_hours} hours`],
      ["Avg Cost / Event",   maintenanceMetrics.total_events?fmtCost(Math.round(maintenanceMetrics.total_cost/maintenanceMetrics.total_events),cur):"—"],
    ])}
    ${maintDonut?chartBox("MAINTENANCE TYPE BREAKDOWN",maintDonut,"Figure 3.2 — Preventive vs corrective events"):""}
    ${maintenance.length?`${subH("3.4 Recent Maintenance Events")}${dataTbl(["Date","Type","Description",`Cost (${cur})`,"Downtime"],maintRows,"Figure 3.3 — Most recent maintenance events")}`
      :hlBox("MAINTENANCE HISTORY","No maintenance events recorded.",C.slate)}
  `,wLbl,"Sensor & Maintenance",origin);

  // ── PAGE 4: TICKETS + INSIGHTS ────────────────────────────────────────────
  const p6=page(`
    ${secH("4","Ticket Management & Insights","Support tickets · Conclusion")}

    ${subH("4.1 Ticket Summary")}
    ${infoTbl([
      ["Total Tickets",  String(ticketMetrics.total_tickets)],
      ["Open Tickets",   String(ticketMetrics.open_tickets)],
      ["High Priority",  String(ticketMetrics.high_priority_tickets)],
      ["Closed Tickets", String(ticketMetrics.closed_tickets)],
    ])}
    ${ticketDonut?chartBox("TICKET DISTRIBUTION",ticketDonut,"Figure 4.1 — Ticket status distribution"):""}
    ${tickets.length?`${subH("4.2 Recent Tickets")}${dataTbl(["Ticket ID","Title","Priority","Status","Created"],ticketRows,"Figure 4.2 — Most recent support tickets")}`
      :hlBox("TICKET HISTORY","No tickets raised for this asset.",C.slate)}

    ${insights.conclusion?`${subH("4.3 Conclusion")}${hlBox("EXECUTIVE CONCLUSION",insights.conclusion,C.teal)}`:""}
  `,wLbl,"Tickets & Insights",origin);

  return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Asset Report — ${data.assetName}</title>
  <style>${CSS}</style>
</head>
<body>${cover}${p3}${p4}${p5}${p6}</body>
</html>`;
}

// ── Export functions ──────────────────────────────────────────────────────────

/** Exposes the HTML this module generates, so callers (e.g. AssetReportModal)
 *  can POST it to a server-side PDF renderer instead of using window.print(). */
export function generateAssetReportHtml(data:AssetReportData, origin=""):string{
  const o = origin || (typeof window !== "undefined" ? window.location.origin : "");
  return generateHTML(data, o);
}

/**
 * Renders the report to a real PDF via the backend (/reports/render-pdf,
 * headless Chromium) and downloads it directly — no browser print dialog,
 * so no browser-injected URL/date header or footer ever appears; only this
 * module's own "Page X of Y" footer shows.
 *
 * apiUrl should be the same base URL used elsewhere (e.g. NEXT_PUBLIC_API_URL).
 * authHeaders lets the caller pass an Authorization header since this module
 * has no access to the app's auth token itself.
 */
export async function downloadAssetPDFServer(
  data: AssetReportData,
  filename = "asset-report.pdf",
  apiUrl: string,
  authHeaders: Record<string,string> = {},
): Promise<void> {
  const html = generateAssetReportHtml(data);
  const res = await fetch(`${apiUrl}/reports/render-pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify({ html, filename }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`PDF render failed (${res.status})${detail ? `: ${detail}` : ""}`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Fallback path: opens the browser's native print dialog (shows the
 *  browser's own header/footer unless the person manually disables it there).
 *  Kept as a degraded-mode fallback if the server-side renderer is
 *  unavailable — see downloadAssetPDFServer for the primary path. */
export function downloadAssetPDF(data:AssetReportData,filename="asset-report.pdf"):void{
  try{
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const html=generateHTML(data, origin);
    const ex=document.getElementById("__px_asset_pdf__");
    if(ex)ex.remove();
    const blob=new Blob([html],{type:"text/html"}),url=URL.createObjectURL(blob);
    const iframe=document.createElement("iframe");
    iframe.id="__px_asset_pdf__";
    iframe.style.cssText="position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:0;";
    iframe.src=url;
    document.body.appendChild(iframe);
    iframe.onload=()=>{
      setTimeout(()=>{
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(()=>{iframe.remove();URL.revokeObjectURL(url);},3000);
      },700);
    };
  }catch(err){console.error("PDF error:",err);saveAssetReportAsFile(data,filename);}
}

export function saveAssetReportAsFile(data:AssetReportData,filename="asset-report.html"):void{
  try{
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const html=generateHTML(data, origin);
    const blob=new Blob([html],{type:"text/html"}),url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download=filename;
    document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
  }catch(err){console.error("Save error:",err);}
}