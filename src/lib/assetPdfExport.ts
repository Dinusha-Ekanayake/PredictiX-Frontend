/**
 * Asset Performance Report — PredictiX Professional Style
 * Clean headers/footers, proper logo, no symbols
 */

export interface AssetReportData {
    assetName: string; assetCode: string; warehouseName: string; reportDate: string;
    asset: {
      asset_type?: string; vehicle_type?: string; make?: string; model?: string;
      manufacture_year?: number | string; status?: string; health_band?: string;
      criticality_score?: string | number; fuel_type?: string; current_mileage?: string | number;
      purchase_date?: string; warranty_expiry_date?: string; last_service_date?: string;
      next_service_date?: string; vehicle_role?: string; payload_capacity_kg?: string | number;
      vehicle_age_years?: string | number; lifetime_service_count?: string | number;
      lifetime_breakdown_count?: string | number; description?: string;
    };
    health_score?: number; failure_probability?: number; risk_level?: string;
    days_until_maintenance?: number | null; predicted_maintenance_date?: string;
    estimated_cost?: number; currency?: string; top_explanations?: Record<string, number>;
    sensor?: {
      recorded_at?: string; tire_health_pct?: string | number; brake_health_pct?: string | number;
      battery_health_pct?: string | number; oil_life_pct?: string | number;
      hydraulic_health_pct?: string | number; coolant_temp_max_c?: string | number;
      engine_temp_avg_c?: string | number; active_fault_code_count?: string | number;
      days_since_last_service?: string | number; engine_hours_since_last_service?: string | number;
      downtime_hours_last_90d?: string | number; fuel_level?: string | number; odometer_km?: string | number;
    };
    maintenance: Array<{ performed_at?: string; event_type?: string; description?: string; cost_amount?: number; downtime_hours?: number; }>;
    maintenanceMetrics: { total_events: number; preventive_count: number; corrective_count: number; total_cost: number; total_downtime_hours: number; };
    tickets: Array<{ ticket_number?: string; title?: string; priority?: string; status?: string; created_at?: string; }>;
    ticketMetrics: { total_tickets: number; open_tickets: number; high_priority_tickets: number; closed_tickets: number; };
    fleet: {
      total_assets: number; fleet_health: number; critical_alerts: number; open_tickets: number;
      predicted_failures: number; est_maintenance_cost: number;
      health_distribution: Array<{ name: string; count: number }>;
      status_distribution: Array<{ name: string; count: number }>;
      vehicle_distribution: Array<{ name: string; count: number }>;
      top_risk_assets: Array<{ name: string; location: string; healthScore: number; failureProbability: number; daysToMaintenance: number | null; }>;
    };
    insights: {
      executive_summary?: string;
      recommendations?: { critical: string[]; high: string[]; medium: string[]; };
      conclusion?: string;
    };
  }
  
  const C = {
    teal:"#0d9488", tealDark:"#0f766e", tealLight:"#f0fdfa", tealBorder:"#99f6e4",
    emerald:"#059669", amber:"#d97706", rose:"#e11d48", sky:"#0284c7",
    violet:"#7c3aed", pink:"#db2777", orange:"#ea580c", slate:"#64748b",
    textDark:"#111827", textMid:"#374151", textLight:"#6b7280",
    border:"#e5e7eb", bg:"#f9fafb", white:"#ffffff",
  };
  
  function fmt(v: any, fb = "—"): string { return (v==null||v===""||v==="—")?fb:String(v); }
  function fmtCost(v: number, cur="LKR"): string { return `${cur} ${Number(v).toLocaleString()}`; }
  function fmtDate(v: any): string { return v ? String(v).slice(0,10) : "—"; }
  function cap(s: string): string { return s ? s.charAt(0).toUpperCase()+s.slice(1) : s; }
  
  // ── PredictiX Logo — properly spaced SVG text ─────────────────────
  const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 52" width="200" height="35">
    <text font-family="Georgia,'Times New Roman',serif" font-size="42" font-weight="700">
      <tspan x="0" y="42" fill="${C.textDark}">Predic</tspan><tspan fill="${C.teal}">ti</tspan><tspan fill="${C.textDark}">X</tspan>
    </text>
  </svg>`;
  
  // ── Vertical bar chart ────────────────────────────────────────────
  function svgVBar(data: Array<{name:string;count:number}>, colors: string[], width=460, height=175): string {
    if(!data.length) return `<p style="color:${C.textLight};font-size:11px;text-align:center;padding:16px">No data available</p>`;
    const maxVal=Math.max(...data.map(d=>d.count));
    const n=data.length;
    const barW=Math.min(52,Math.floor((width-50)/n)-6);
    const chartH=height-34;
    const gridVals=[0,Math.round(maxVal/2),maxVal];
    const grid=gridVals.map(v=>{
      const y=chartH-(maxVal?Math.round((v/maxVal)*chartH):0)+2;
      return `<text x="36" y="${y+3}" text-anchor="end" font-size="8.5" fill="${C.textLight}">${v}</text><line x1="40" y1="${y}" x2="${width}" y2="${y}" stroke="${C.border}" stroke-width="0.5" stroke-dasharray="3,3"/>`;
    }).join("");
    const bars=data.map((d,i)=>{
      const bh=maxVal?Math.max(2,Math.round((d.count/maxVal)*chartH)):2;
      const x=44+i*(barW+6);
      const y=chartH-bh+2;
      return `<rect x="${x}" y="${y}" width="${barW}" height="${bh}" rx="3" fill="${colors[i%colors.length]}"/>
        <text x="${x+barW/2}" y="${y-4}" text-anchor="middle" font-size="9" fill="${C.textMid}" font-weight="600">${d.count}</text>
        <text x="${x+barW/2}" y="${height-4}" text-anchor="middle" font-size="8" fill="${C.textLight}">${d.name.replace(/_/g," ").slice(0,11)}</text>`;
    }).join("");
    return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}">${grid}${bars}</svg>`;
  }
  
  // ── Horizontal bar chart (SHAP / sensor) ─────────────────────────
  function svgHBar(data: Array<{name:string;pct:number}>, colors: string[], width=440): string {
    if(!data.length) return "";
    const barH=20,gap=5,labelW=188,totalH=data.length*(barH+gap);
    const bars=data.map((d,i)=>{
      const bw=Math.max(3,(d.pct/100)*(width-labelW-52));
      const y=i*(barH+gap);
      return `<text x="${labelW-5}" y="${y+barH*0.72}" text-anchor="end" font-size="10.5" fill="${C.textMid}">${d.name}</text>
        <rect x="${labelW}" y="${y}" width="${bw.toFixed(1)}" height="${barH}" rx="3" fill="${colors[i%colors.length]}"/>
        <text x="${labelW+bw+5}" y="${y+barH*0.72}" font-size="10.5" fill="${C.textMid}" font-weight="600">${d.pct}%</text>`;
    }).join("");
    return `<svg viewBox="0 0 ${width} ${totalH}" width="100%" height="${totalH}">${bars}</svg>`;
  }
  
  // ── Sensor health visual bars ─────────────────────────────────────
  function sensorHealthBars(fields: Array<{name:string;value:number;color:string}>, width=440): string {
    const barH=16,gap=8,labelW=175,totalH=fields.length*(barH+gap);
    const bars=fields.map((f,i)=>{
      const bw=Math.max(2,(f.value/100)*(width-labelW-50));
      const y=i*(barH+gap);
      return `<text x="${labelW-5}" y="${y+barH*0.75}" text-anchor="end" font-size="10" fill="${C.textMid}">${f.name}</text>
        <rect x="${labelW}" y="${y}" width="${width-labelW-50}" height="${barH}" rx="3" fill="${C.border}"/>
        <rect x="${labelW}" y="${y}" width="${bw.toFixed(1)}" height="${barH}" rx="3" fill="${f.color}"/>
        <text x="${labelW+bw+5}" y="${y+barH*0.75}" font-size="10" fill="${C.textMid}" font-weight="600">${f.value}%</text>`;
    }).join("");
    return `<svg viewBox="0 0 ${width} ${totalH}" width="100%" height="${totalH}">${bars}</svg>`;
  }
  
  // ── Donut chart ───────────────────────────────────────────────────
  function svgDonut(data: Array<{name:string;count:number}>, colors: string[], size=110): string {
    const total=data.reduce((s,d)=>s+d.count,0);
    if(!total) return `<p style="color:${C.textLight};font-size:10px">No data</p>`;
    let cum=-Math.PI/2;
    const cx=size/2,cy=size/2,r=size/2-8,ir=size/2-22;
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
      if(lp>7){
        const mx=cx+(r+ir)/2*Math.cos(cum+a/2),my=cy+(r+ir)/2*Math.sin(cum+a/2);
        paths+=`<text x="${mx.toFixed(1)}" y="${my.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="8" font-weight="bold">${lp}%</text>`;
      }
      cum+=a;
    });
    const legend=data.map((d,i)=>`<div style="display:flex;align-items:center;gap:5px;margin-bottom:3px"><div style="width:9px;height:9px;border-radius:2px;background:${colors[i%colors.length]};flex-shrink:0"></div><span style="font-size:10px;color:${C.textDark}">${d.name}: <b>${d.count}</b></span></div>`).join("");
    return `<div style="display:flex;align-items:center;gap:14px"><svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${paths}</svg><div>${legend}</div></div>`;
  }
  
  // ── Components ────────────────────────────────────────────────────
  function kpiStrip(items: Array<{label:string;value:string;color?:string}>): string {
    return `<div style="display:grid;grid-template-columns:repeat(${items.length},1fr);gap:0;border:1px solid ${C.border};border-radius:8px;overflow:hidden;margin-bottom:16px">
      ${items.map((it,i)=>`<div style="padding:11px 13px;${i<items.length-1?`border-right:1px solid ${C.border};`:""}background:white">
        <div style="font-size:8px;color:${C.textLight};text-transform:uppercase;letter-spacing:.7px;margin-bottom:3px">${it.label}</div>
        <div style="font-size:18px;font-weight:800;color:${it.color||C.teal};line-height:1">${it.value}</div>
      </div>`).join("")}
    </div>`;
  }
  
  function dataTable(headers: string[], rows: string[][], caption=""): string {
    const th=`<tr>${headers.map(h=>`<th style="padding:8px 11px;font-size:10.5px;font-weight:700;color:white;background:${C.textDark};text-align:left;white-space:nowrap">${h}</th>`).join("")}</tr>`;
    const tb=rows.map((row,i)=>`<tr style="background:${i%2===0?C.bg:"white"}">${row.map(c=>`<td style="padding:6px 11px;font-size:10.5px;color:${C.textDark};border-bottom:1px solid ${C.border}">${c}</td>`).join("")}</tr>`).join("");
    return `<div style="border:1px solid ${C.border};border-radius:6px;overflow:hidden;margin-bottom:9px"><table style="width:100%;border-collapse:collapse"><thead>${th}</thead><tbody>${tb}</tbody></table></div>${caption?`<p style="font-size:9.5px;font-style:italic;color:${C.textLight};text-align:center;margin:2px 0 12px">${caption}</p>`:""}`;
  }
  
  function infoTable(rows: Array<[string,string]>): string {
    return `<div style="border:1px solid ${C.border};border-radius:6px;overflow:hidden;margin-bottom:12px"><table style="width:100%;border-collapse:collapse">
      ${rows.map(([l,v],i)=>`<tr style="background:${i%2===0?C.bg:"white"}"><td style="padding:5.5px 11px;font-size:10.5px;color:${C.textLight};width:42%;border-bottom:1px solid ${C.border}">${l}</td><td style="padding:5.5px 11px;font-size:10.5px;font-weight:600;color:${C.textDark};border-bottom:1px solid ${C.border}">${v}</td></tr>`).join("")}
    </table></div>`;
  }
  
  function chartBox(title: string, content: string, caption=""): string {
    return `<div style="border:1px solid ${C.border};border-radius:8px;padding:13px 16px;margin-bottom:13px;background:white">
      <div style="font-size:9px;font-weight:700;color:${C.textLight};letter-spacing:1px;text-transform:uppercase;margin-bottom:9px">${title}</div>
      ${content}
      ${caption?`<p style="font-size:9.5px;font-style:italic;color:${C.textLight};text-align:center;margin:7px 0 0">${caption}</p>`:""}
    </div>`;
  }
  
  function highlightBox(label: string, content: string, color=C.teal): string {
    return `<div style="border-left:4px solid ${color};background:${color}08;border-radius:0 6px 6px 0;padding:10px 15px;margin-bottom:11px">
      <div style="font-size:8.5px;font-weight:700;color:${color};letter-spacing:.8px;text-transform:uppercase;margin-bottom:4px">${label}</div>
      <div style="font-size:10.5px;color:${C.textMid};line-height:1.65">${content}</div>
    </div>`;
  }
  
  function riskBadge(level: string): string {
    const col:Record<string,string>={Low:C.emerald,Medium:C.amber,High:C.rose,Critical:"#dc2626"};
    return `<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;color:white;background:${col[level]||C.slate}">${level}</span>`;
  }
  
  function secH(num: string, title: string, sub=""): string {
    return `<div style="margin:0 0 13px">
      <h2 style="font-size:20px;font-weight:700;color:${C.textDark};margin:0 0 3px">${num}. ${title}${sub?` <span style="font-size:12px;font-weight:400;color:${C.textLight}">· ${sub}</span>`:""}</h2>
      <div style="height:3px;background:${C.teal};border-radius:2px"></div>
    </div>`;
  }
  
  function subH(title: string): string {
    return `<h3 style="font-size:13px;font-weight:700;color:${C.textDark};margin:13px 0 7px">${title}</h3>`;
  }
  
  // ── Page with consistent header + footer ──────────────────────────
  function buildPage(content: string, warehouse: string, section: string, pageNum: number, total: number): string {
    return `<div class="page">
      <div style="border:2px solid ${C.teal};border-radius:4px;min-height:calc(297mm - 20mm);display:flex;flex-direction:column;overflow:hidden">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 18px;background:${C.tealLight};border-bottom:1px solid ${C.tealBorder}">
          <span style="font-size:9px;font-weight:700;color:${C.teal};letter-spacing:.8px;text-transform:uppercase">${warehouse}</span>
          <span style="font-size:9px;color:${C.textLight}">${section}</span>
        </div>
        <div style="padding:16px 22px;flex:1">${content}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 18px;background:${C.tealLight};border-top:1px solid ${C.tealBorder}">
          <span style="font-size:8.5px;color:${C.textLight}">PredictiX AI Platform &nbsp;·&nbsp; Asset Performance Report &nbsp;·&nbsp; Confidential</span>
          <span style="font-size:8.5px;color:${C.textLight}">Page ${pageNum} of ${total}</span>
        </div>
      </div>
    </div>`;
  }
  
  const CSS = `
    @page{size:A4 portrait;margin:10mm}
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:${C.textDark};background:white;font-size:11px;line-height:1.5}
    .page{page-break-after:always;background:white;min-height:277mm}
    .page:last-child{page-break-after:auto}
    table{border-collapse:collapse;width:100%}
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  `;
  
  function generateAssetReportHTML(data: AssetReportData): string {
    const {asset,fleet,sensor,maintenance,tickets,maintenanceMetrics,ticketMetrics,insights}=data;
    const cur=data.currency||"LKR";
    const hs=data.health_score, fp=data.failure_probability, rl=data.risk_level??"—";
    const hCol=hs!=null?(hs>=80?C.emerald:hs>=60?C.amber:C.rose):C.slate;
    const rColors:Record<string,string>={Low:C.emerald,Medium:C.amber,High:C.rose,Critical:"#dc2626"};
    const rCol=rColors[rl]??C.slate;
    const recs=insights.recommendations||{critical:[],high:[],medium:[]};
    // Clean warehouse label — no special chars
    const wLbl=data.warehouseName.toUpperCase().replace(/[^A-Z0-9 \-]/g,"");
    const TOTAL=5;
  
    // ── COVER ──────────────────────────────────────────────────────
    const cover=`<div class="page">
      <div style="border:2px solid ${C.teal};border-radius:4px;min-height:277mm;display:flex;flex-direction:column;overflow:hidden">
        <div style="background:${C.teal};height:7px"></div>
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:44px 56px;text-align:center">
          ${LOGO_SVG}
          <div style="width:52px;height:3px;background:${C.teal};border-radius:2px;margin:14px auto 26px"></div>
          <div style="border:1px solid ${C.tealBorder};border-radius:10px;padding:26px 42px;background:${C.tealLight};max-width:420px;width:100%;margin-bottom:26px">
            <div style="font-size:10px;font-weight:700;color:${C.teal};letter-spacing:2px;text-transform:uppercase;margin-bottom:10px">Asset Performance Report</div>
            <h1 style="font-size:24px;font-weight:800;color:${C.textDark};line-height:1.2;margin-bottom:6px">${data.assetName}</h1>
            <div style="font-size:13px;color:${C.textLight};margin-bottom:13px">${data.warehouseName}</div>
            <div style="border-top:1px solid ${C.tealBorder};padding-top:13px">
              <div style="font-size:10px;color:${C.textLight}">Comprehensive Asset Health &nbsp;·&nbsp; Predictive Maintenance Analysis</div>
              <div style="font-size:10px;color:${C.textLight};margin-top:2px">Powered by PredictiX AI &nbsp;·&nbsp; SHAP Explainability</div>
            </div>
          </div>
          <div style="font-size:11px;color:${C.textLight};margin-bottom:3px">Report Generated: <strong style="color:${C.textDark}">${data.reportDate}</strong></div>
          <div style="font-size:11px;color:${C.textLight};margin-bottom:13px">Asset Code: <strong style="color:${C.textDark}">${data.assetCode}</strong></div>
          <div style="display:inline-block;border:1px solid ${C.amber};color:${C.amber};font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:4px 14px;border-radius:3px">Confidential</div>
        </div>
        <div style="background:${C.teal};height:7px"></div>
      </div>
    </div>`;
  
    // ── PAGE 2: FLEET OVERVIEW ─────────────────────────────────────
    const HCOLS=[C.teal,"#3b82f6",C.amber,C.orange,C.rose];
    const PCOLS=[C.teal,C.sky,C.emerald,C.amber,C.rose,C.violet,C.slate,"#06b6d4"];
    const DCOLS=[C.teal,C.sky,C.emerald,C.amber,C.rose];
  
    const fleetKpis=kpiStrip([
      {label:"Total Assets",    value:String(fleet.total_assets),                              color:C.teal},
      {label:"Fleet Health",    value:`${fleet.fleet_health}%`,                               color:fleet.fleet_health>=70?C.emerald:C.rose},
      {label:"Critical Alerts", value:String(fleet.critical_alerts),                          color:C.rose},
      {label:"Open Tickets",    value:String(fleet.open_tickets),                             color:C.amber},
      {label:"Pred. Failures",  value:String(fleet.predicted_failures),                       color:C.rose},
      {label:"Est. Cost LKR",   value:`${(fleet.est_maintenance_cost/1_000_000).toFixed(1)}M`,color:C.violet},
    ]);
  
    // Side-by-side: health donut + status donut
    const healthDonut=fleet.health_distribution.length?svgDonut(fleet.health_distribution,HCOLS,105):"";
    const statusDonut=fleet.status_distribution.length?svgDonut(fleet.status_distribution,DCOLS,105):"";
  
    const topRiskRows=fleet.top_risk_assets.slice(0,5).map(r=>[
      r.name,r.location,
      `<span style="color:${r.healthScore<30?C.rose:C.amber};font-weight:700">${r.healthScore}%</span>`,
      `${(r.failureProbability*100).toFixed(1)}%`,
      r.daysToMaintenance!=null?`${r.daysToMaintenance}d`:"—",
    ]);
  
    const p2=buildPage(`
      ${secH("1","Fleet Overview","Fleet health and composition")}
      ${subH("1.1 Key Performance Indicators")}
      ${fleetKpis}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:13px">
        ${chartBox("HEALTH BAND DISTRIBUTION",healthDonut||`<p style="color:${C.textLight};font-size:10px">No data</p>`,"Figure 1.1 — Fleet health bands")}
        ${chartBox("ASSET STATUS DISTRIBUTION",statusDonut||`<p style="color:${C.textLight};font-size:10px">No data</p>`,"Figure 1.2 — Asset status breakdown")}
      </div>
      ${fleet.vehicle_distribution.length?`
        ${subH("1.2 Fleet Composition by Vehicle Type")}
        ${chartBox("ASSETS BY VEHICLE TYPE",svgVBar(fleet.vehicle_distribution.slice(0,8),PCOLS,440,160),"Figure 1.3 — Fleet composition by vehicle type")}
      `:""}
      ${fleet.top_risk_assets.length?`
        ${subH("1.3 Top At-Risk Assets")}
        ${dataTable(["Asset","Location","Health Score","Fail. Prob.","Days to Maint."],topRiskRows,"Figure 1.4 — Top 5 highest-risk assets by failure probability")}
      `:""}
    `,wLbl,"Fleet Overview",2,TOTAL);
  
    // ── PAGE 3: ASSET OVERVIEW + HEALTH & RISK ────────────────────
    const assetKpis=kpiStrip([
      {label:"Health Score",        value:hs!=null?`${hs}%`:"—",                              color:hCol},
      {label:"Failure Probability", value:fp!=null?`${fp}%`:"—",                              color:C.rose},
      {label:"Risk Level",          value:rl,                                                  color:rCol},
      {label:"Days to Maint.",      value:data.days_until_maintenance!=null?`${data.days_until_maintenance}d`:"—",color:C.teal},
      {label:"Est. Cost",           value:data.estimated_cost?`LKR ${(data.estimated_cost/1000).toFixed(0)}K`:"—",color:C.violet},
      {label:"Open Tickets",        value:String(ticketMetrics.open_tickets),                 color:C.amber},
    ]);
  
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
      ["Last Service Date",   fmtDate(asset.last_service_date)],
      ["Next Service Date",   fmtDate(asset.next_service_date)],
      ["Lifetime Services",   fmt(asset.lifetime_service_count)],
      ["Lifetime Breakdowns", fmt(asset.lifetime_breakdown_count)],
      ["Warehouse",           fmt(data.warehouseName)],
    ];
  
    const shapData=data.top_explanations
      ?Object.entries(data.top_explanations).sort((a,b)=>b[1]-a[1]).slice(0,8)
          .map(([name,val])=>({name:name.replace(/_/g," "),pct:Math.round(val*100*10)/10}))
      :[];
    const shapCols=[C.teal,"#3b82f6",C.amber,C.violet,C.orange,C.pink,C.emerald,C.rose];
  
    // Asset health gauge — simple visual
    const healthGauge=hs!=null?`
      <div style="display:flex;align-items:center;gap:16px;padding:10px 0">
        <div style="position:relative;width:90px;height:90px;flex-shrink:0">
          <svg viewBox="0 0 90 90" width="90" height="90">
            <circle cx="45" cy="45" r="36" fill="none" stroke="${C.border}" stroke-width="10"/>
            <circle cx="45" cy="45" r="36" fill="none" stroke="${hCol}" stroke-width="10"
              stroke-dasharray="${Math.round((hs/100)*226)} 226" stroke-linecap="round"
              transform="rotate(-90 45 45)"/>
            <text x="45" y="48" text-anchor="middle" dominant-baseline="middle" font-size="16" font-weight="800" fill="${hCol}">${hs}%</text>
          </svg>
        </div>
        <div>
          <div style="font-size:10px;color:${C.textLight};text-transform:uppercase;letter-spacing:.7px;margin-bottom:4px">Overall Health Score</div>
          <div style="font-size:22px;font-weight:800;color:${hCol}">${hs}%</div>
          <div style="font-size:10.5px;color:${C.textMid};margin-top:3px">${hs>=80?"Optimal — maintain schedule":hs>=60?"Moderate — schedule service soon":"Critical — immediate attention required"}</div>
          ${fp!=null?`<div style="font-size:10px;color:${C.textLight};margin-top:6px">Failure Probability: <strong style="color:${C.rose}">${fp}%</strong></div>`:""}
          ${rl!=="—"?`<div style="font-size:10px;color:${C.textLight};margin-top:2px">Risk Level: ${riskBadge(rl)}</div>`:""}
        </div>
      </div>`
      :`<p style="font-size:10.5px;color:${C.textLight};padding:12px 0">No prediction data available — run AI prediction to generate health scores.</p>`;
  
    const p3=buildPage(`
      ${secH("2","Asset Overview","Asset details and prediction summary")}
      ${subH("2.1 Prediction Summary")}
      ${assetKpis}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:13px">
        ${chartBox("ASSET HEALTH",healthGauge,"Figure 2.1 — Current health score and risk classification")}
        ${chartBox("PREDICTION DATA",`<table style="width:100%;border-collapse:collapse">
          ${[
            ["Health Score",          hs!=null?`<span style="color:${hCol};font-weight:700">${hs}%</span>`:"Run AI prediction"],
            ["Failure Probability",   fp!=null?`${fp}%`:"Run AI prediction"],
            ["Risk Level",            rl!=="—"?riskBadge(rl):"Run AI prediction"],
            ["Days to Maintenance",   data.days_until_maintenance!=null?`${data.days_until_maintenance} days`:"—"],
            ["Predicted Maint. Date", fmtDate(data.predicted_maintenance_date)],
            ["Estimated Cost",        data.estimated_cost?fmtCost(data.estimated_cost,cur):"—"],
          ].map(([l,v],i)=>`<tr style="background:${i%2===0?C.bg:"white"}">
            <td style="padding:5px 10px;font-size:10px;color:${C.textLight};border-bottom:1px solid ${C.border};width:48%">${l}</td>
            <td style="padding:5px 10px;font-size:10px;font-weight:600;color:${C.textDark};border-bottom:1px solid ${C.border}">${v}</td>
          </tr>`).join("")}
        </table>`,"Figure 2.2 — AI prediction data")}
      </div>
      ${subH("2.2 Asset Details")}
      ${infoTable(assetRows)}
    `,wLbl,"Asset Overview",3,TOTAL);
  
    const p4=buildPage(`
      ${secH("3","Health and Risk Analysis","SHAP failure drivers and risk classification")}
      ${shapData.length?`
        ${subH("3.1 SHAP Failure Prediction Drivers")}
        ${chartBox("RELATIVE SHAP FEATURE IMPORTANCE",svgHBar(shapData,shapCols,430),"Figure 3.1 — Relative SHAP importance per feature, normalised to 100%")}
        ${dataTable(["SHAP Feature","Relative Importance"],shapData.map(d=>[d.name,`${d.pct}%`]))}
      `:highlightBox("SHAP DATA NOT AVAILABLE","Run the AI prediction engine on this asset to generate SHAP feature importance scores and failure driver analysis.",C.amber)}
      ${insights.executive_summary?`${subH("3.2 AI Executive Summary")}${highlightBox("AI ANALYSIS",insights.executive_summary,C.teal)}`:""}
    `,wLbl,"Health and Risk Analysis",4,TOTAL);
  
    // ── PAGE 4: SENSOR + MAINTENANCE + TICKETS ────────────────────
    const sRows:[string,string][]=sensor?[
      ["Recorded At",                fmt(sensor.recorded_at)],
      ["Tire Health",                sensor.tire_health_pct!=null?`${sensor.tire_health_pct}%`:"—"],
      ["Brake Health",               sensor.brake_health_pct!=null?`${sensor.brake_health_pct}%`:"—"],
      ["Battery Health",             sensor.battery_health_pct!=null?`${sensor.battery_health_pct}%`:"—"],
      ["Oil Life",                   sensor.oil_life_pct!=null?`${sensor.oil_life_pct}%`:"—"],
      ["Hydraulic Health",           sensor.hydraulic_health_pct!=null?`${sensor.hydraulic_health_pct}%`:"—"],
      ["Coolant Temp Max (C)",       fmt(sensor.coolant_temp_max_c)],
      ["Engine Temp Avg (C)",        fmt(sensor.engine_temp_avg_c)],
      ["Active Fault Codes",         fmt(sensor.active_fault_code_count)],
      ["Days Since Service",         fmt(sensor.days_since_last_service)],
      ["Engine Hours Since Service", fmt(sensor.engine_hours_since_last_service)],
      ["Downtime Last 90d (h)",      fmt(sensor.downtime_hours_last_90d)],
      ["Fuel Level",                 sensor.fuel_level!=null?`${sensor.fuel_level}%`:"—"],
      ["Odometer (km)",              fmt(sensor.odometer_km)],
    ]:[];
  
    // Sensor health visual bars
    const sensorHealthFields=sensor?[
      {name:"Tire Health",      value:parseFloat(String(sensor.tire_health_pct||0)),      color:parseFloat(String(sensor.tire_health_pct||0))>=70?C.emerald:C.rose},
      {name:"Brake Health",     value:parseFloat(String(sensor.brake_health_pct||0)),     color:parseFloat(String(sensor.brake_health_pct||0))>=70?C.emerald:C.rose},
      {name:"Battery Health",   value:parseFloat(String(sensor.battery_health_pct||0)),   color:parseFloat(String(sensor.battery_health_pct||0))>=70?C.emerald:C.amber},
      {name:"Oil Life",         value:parseFloat(String(sensor.oil_life_pct||0)),         color:parseFloat(String(sensor.oil_life_pct||0))>=50?C.emerald:C.rose},
      {name:"Hydraulic Health", value:parseFloat(String(sensor.hydraulic_health_pct||0)),color:parseFloat(String(sensor.hydraulic_health_pct||0))>=70?C.emerald:C.amber},
    ].filter(f=>f.value>0):[];
  
    const maintRows=maintenance.slice(0,7).map(m=>[
      fmtDate(m.performed_at),cap(fmt(m.event_type)),
      fmt(String(m.description??"—").slice(0,48)),
      m.cost_amount?fmtCost(m.cost_amount,cur):"—",
      m.downtime_hours?`${m.downtime_hours}h`:"—",
    ]);
  
    const ticketRows=tickets.slice(0,7).map(t=>{
      const pri=(t.priority||"").toLowerCase();
      const pc=pri==="high"?C.rose:pri==="medium"?C.amber:C.emerald;
      return [fmt(t.ticket_number),fmt(String(t.title??"—").slice(0,52)),
        `<span style="color:${pc};font-weight:700">${cap(fmt(t.priority))}</span>`,
        cap(fmt(t.status)),fmtDate(t.created_at)];
    });
  
    // Ticket distribution donut
    const ticketDonut=ticketMetrics.total_tickets>0
      ?svgDonut([
          {name:"Open",         count:ticketMetrics.open_tickets},
          {name:"High Priority",count:ticketMetrics.high_priority_tickets},
          {name:"Closed",       count:ticketMetrics.closed_tickets},
        ],[C.rose,C.amber,C.emerald],95)
      :"";
  
    // Maintenance type donut
    const maintDonut=maintenanceMetrics.total_events>0
      ?svgDonut([
          {name:"Preventive",count:maintenanceMetrics.preventive_count},
          {name:"Corrective", count:maintenanceMetrics.corrective_count},
        ],[C.emerald,C.rose],95)
      :"";
  
    const recBlock=(level:string,items:string[],col:string)=>
      items.length?highlightBox(level+" PRIORITY",items.map(r=>`• ${r}`).join("<br/>"),col):"";
  
    const p5=buildPage(`
      ${secH("4","Sensor Data and Maintenance","Latest sensor readings and maintenance history")}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:13px">
        <div>
          ${subH("4.1 Latest Sensor Snapshot")}
          ${sRows.length?infoTable(sRows.slice(0,8)):highlightBox("SENSOR STATUS","No sensor readings available for this asset. Connect to the PredictiX monitoring system to start receiving data.",C.slate)}
        </div>
        <div>
          ${sensorHealthFields.length?`${subH("4.2 Component Health Overview")}${chartBox("COMPONENT HEALTH LEVELS",sensorHealthBars(sensorHealthFields,300),"Figure 4.1 — Component health as percentage")}`:
            `${subH("4.2 Maintenance Summary")}${infoTable([
              ["Total Events",      String(maintenanceMetrics.total_events)],
              ["Preventive Events", String(maintenanceMetrics.preventive_count)],
              ["Corrective Events", String(maintenanceMetrics.corrective_count)],
              ["Total Cost",        fmtCost(maintenanceMetrics.total_cost,cur)],
              ["Total Downtime",    `${maintenanceMetrics.total_downtime_hours} hours`],
              ["Avg Cost per Event",maintenanceMetrics.total_events?fmtCost(Math.round(maintenanceMetrics.total_cost/maintenanceMetrics.total_events),cur):"—"],
            ])}`}
          ${maintDonut?chartBox("MAINTENANCE TYPE BREAKDOWN",maintDonut,"Figure 4.2 — Preventive vs corrective events"):""}
        </div>
      </div>
      ${sRows.length>8?infoTable(sRows.slice(8)):""}
      ${maintenance.length?`${subH("4.3 Recent Maintenance Events")}${dataTable(["Date","Type","Description",`Cost (${cur})`,"Downtime"],maintRows,"Figure 4.3 — Most recent maintenance events")}`:
        highlightBox("MAINTENANCE HISTORY","No maintenance events recorded. Log events to track history, costs and downtime.",C.slate)}
      ${secH("5","Ticket Management and AI Insights","Support tickets and recommendations")}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:13px">
        <div>
          ${subH("5.1 Ticket Summary")}
          ${infoTable([
            ["Total Tickets",  String(ticketMetrics.total_tickets)],
            ["Open Tickets",   String(ticketMetrics.open_tickets)],
            ["High Priority",  String(ticketMetrics.high_priority_tickets)],
            ["Closed Tickets", String(ticketMetrics.closed_tickets)],
          ])}
        </div>
        ${ticketDonut?`<div>${subH("5.2 Ticket Distribution")}${chartBox("TICKET STATUS",ticketDonut,"Figure 5.1 — Ticket distribution by status")}</div>`:"<div></div>"}
      </div>
      ${tickets.length?dataTable(["Ticket ID","Title","Priority","Status","Created"],ticketRows,"Figure 5.2 — Most recent support tickets"):
        highlightBox("TICKET HISTORY","No tickets raised for this asset.",C.slate)}
      ${subH("5.3 Recommendations")}
      ${recBlock("Critical",recs.critical,C.rose)}
      ${recBlock("High",recs.high,C.amber)}
      ${recBlock("Medium",recs.medium,C.sky)}
      ${!recs.critical.length&&!recs.high.length&&!recs.medium.length?highlightBox("RECOMMENDATIONS","No specific recommendations. Run AI prediction to get asset-specific guidance.",C.slate):""}
      ${insights.conclusion?`${subH("5.4 Conclusion")}${highlightBox("EXECUTIVE CONCLUSION",insights.conclusion,C.teal)}`:""}
    `,wLbl,"Sensor, Maintenance, Tickets and Insights",5,TOTAL);
  
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Asset Report — ${data.assetName}</title><style>${CSS}</style></head><body>${cover}${p2}${p3}${p4}${p5}</body></html>`;
  }
  
  export function downloadAssetPDF(data: AssetReportData, filename="asset-report.pdf"): void {
    try {
      const html=generateAssetReportHTML(data);
      const ex=document.getElementById("__predictix_asset_pdf_frame__");
      if(ex) ex.remove();
      const blob=new Blob([html],{type:"text/html"}),url=URL.createObjectURL(blob);
      const iframe=document.createElement("iframe");
      iframe.id="__predictix_asset_pdf_frame__";
      iframe.style.cssText="position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:0;";
      iframe.src=url;
      document.body.appendChild(iframe);
      iframe.onload=()=>{setTimeout(()=>{iframe.contentWindow?.focus();iframe.contentWindow?.print();setTimeout(()=>{iframe.remove();URL.revokeObjectURL(url);},3000);},600);};
    }catch(err){console.error("PDF error:",err);saveAssetReportAsFile(data,filename);}
  }
  
  export function saveAssetReportAsFile(data: AssetReportData, filename="asset-report.html"): void {
    try {
      const html=generateAssetReportHTML(data);
      const blob=new Blob([html],{type:"text/html"}),url=URL.createObjectURL(blob);
      const a=document.createElement("a");a.href=url;a.download=filename;
      document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
    }catch(err){console.error("Save error:",err);}
  }