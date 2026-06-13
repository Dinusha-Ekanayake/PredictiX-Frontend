/**
 * Asset Performance Report — Compact 4-page HTML PDF Export
 * Cover + 3 content pages, minimal spacing, dense layout.
 */

export interface AssetReportData {
    assetName: string;
    assetCode: string;
    warehouseName: string;
    reportDate: string;
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
    estimated_cost?: number; currency?: string;
    top_explanations?: Record<string, number>;
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
    teal:"#0d9488", tealDark:"#0f766e", tealLight:"#f0fdfa",
    emerald:"#059669", amber:"#d97706", rose:"#e11d48",
    sky:"#0284c7", violet:"#7c3aed", slate:"#64748b",
    textDark:"#1e293b", textLight:"#64748b",
    border:"#e2e8f0", bg:"#f8fafc", white:"#ffffff",
  };
  
  function fmt(v: any, fb = "—"): string { return (v == null || v === "" || v === "—") ? fb : String(v); }
  function fmtCost(v: number, cur = "LKR"): string { return `${cur} ${Number(v).toLocaleString()}`; }
  function fmtDate(v: any): string { return v ? String(v).slice(0,10) : "—"; }
  
  function svgPie(data: Array<{name:string;count:number}>, colors: string[], size=120): string {
    const total = data.reduce((s,d)=>s+d.count,0);
    if (!total) return `<span style="color:#94a3b8;font-size:10px">No data</span>`;
    let cum = -Math.PI/2; const cx=size/2,cy=size/2,r=size/2-4;
    let paths="";
    data.forEach((d,i)=>{
      const a=(d.count/total)*2*Math.PI,x1=cx+r*Math.cos(cum),y1=cy+r*Math.sin(cum);
      const x2=cx+r*Math.cos(cum+a),y2=cy+r*Math.sin(cum+a),lg=a>Math.PI?1:0;
      const mx=cx+r*0.65*Math.cos(cum+a/2),my=cy+r*0.65*Math.sin(cum+a/2);
      const lp=Math.round((d.count/total)*100);
      paths+=`<path d="M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${lg},1 ${x2.toFixed(1)},${y2.toFixed(1)} Z" fill="${colors[i%colors.length]}" stroke="white" stroke-width="1.5"/>`;
      if(lp>5) paths+=`<text x="${mx.toFixed(1)}" y="${my.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="9" font-weight="bold">${lp}%</text>`;
      cum+=a;
    });
    const legend=data.map((d,i)=>`<div style="display:flex;align-items:center;gap:4px;margin-bottom:3px"><div style="width:8px;height:8px;border-radius:1px;background:${colors[i%colors.length]};flex-shrink:0"></div><span style="font-size:9px;color:${C.textDark}">${d.name}: <b>${d.count}</b></span></div>`).join("");
    return `<div style="display:flex;align-items:center;gap:12px"><svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${paths}</svg><div>${legend}</div></div>`;
  }
  
  function svgHBar(data: Array<{name:string;count:number}>, color=C.teal, width=420, barH=16, gap=5): string {
    if(!data.length) return `<span style="color:#94a3b8;font-size:10px">No data</span>`;
    const maxVal=Math.max(...data.map(d=>d.count)),lw=130,avail=width-lw-40;
    const totalH=data.length*(barH+gap);
    const bars=data.map((d,i)=>{
      const bw=maxVal?Math.max(2,(d.count/maxVal)*avail):2,y=i*(barH+gap);
      return `<text x="${lw-4}" y="${y+barH*0.72}" text-anchor="end" font-size="8.5" fill="${C.textLight}">${d.name.replace(/_/g," ").slice(0,20)}</text><rect x="${lw}" y="${y}" width="${bw.toFixed(1)}" height="${barH}" rx="2" fill="${color}"/><text x="${lw+bw+3}" y="${y+barH*0.72}" font-size="8.5" fill="${C.textDark}" font-weight="600">${d.count}</text>`;
    }).join("");
    return `<svg viewBox="0 0 ${width} ${totalH+2}" width="${width}" height="${totalH+2}" style="overflow:visible">${bars}</svg>`;
  }
  
  function kpi(label:string,value:string,color=C.teal): string {
    return `<div style="background:white;border:1px solid ${C.border};border-top:3px solid ${color};border-radius:5px;padding:8px 10px;text-align:center;flex:1;min-width:80px"><div style="font-size:17px;font-weight:800;color:${color};line-height:1.1">${value}</div><div style="font-size:8px;color:${C.textLight};margin-top:2px;text-transform:uppercase;letter-spacing:.5px;font-weight:600">${label}</div></div>`;
  }
  
  function secHead(num:string,title:string): string {
    return `<div style="display:flex;align-items:center;gap:8px;margin:16px 0 6px"><div style="background:${C.teal};color:white;font-size:9px;font-weight:700;padding:2px 7px;border-radius:3px;flex-shrink:0">${num}</div><div style="font-size:13px;font-weight:700;color:${C.textDark}">${title}</div></div><div style="border-top:2px solid ${C.teal};margin-bottom:10px"></div>`;
  }
  
  function card(title:string,content:string): string {
    return `<div style="background:white;border:1px solid ${C.border};border-radius:5px;overflow:hidden;margin-bottom:10px"><div style="background:${C.bg};border-bottom:1px solid ${C.border};padding:5px 10px;font-size:10px;font-weight:700;color:${C.textDark}">${title}</div><div style="padding:10px">${content}</div></div>`;
  }
  
  function fRow(label:string,value:string): string {
    return `<tr><td style="padding:3px 8px 3px 0;font-size:9.5px;color:${C.textLight};white-space:nowrap;width:140px;vertical-align:top">${label}</td><td style="padding:3px 0;font-size:9.5px;color:${C.textDark};font-weight:600;border-bottom:1px solid ${C.border}">${value}</td></tr>`;
  }
  
  function thRow(cols:string[]): string {
    return `<tr>${cols.map(c=>`<th style="padding:5px 8px;font-size:9px;color:white;background:${C.tealDark};text-align:left;font-weight:600;white-space:nowrap">${c}</th>`).join("")}</tr>`;
  }
  function tdRow(cells:string[],even:boolean): string {
    return `<tr style="background:${even?C.bg:"white"}">${cells.map(c=>`<td style="padding:4px 8px;font-size:9px;color:${C.textDark};border-bottom:1px solid ${C.border}">${c}</td>`).join("")}</tr>`;
  }
  
  function riskBadge(level:string): string {
    const col:Record<string,string>={Low:C.emerald,Medium:C.amber,High:C.rose,Critical:"#dc2626"};
    const c=col[level]||C.slate;
    return `<span style="display:inline-block;padding:1px 6px;border-radius:3px;font-size:8.5px;font-weight:700;color:white;background:${c}">${level}</span>`;
  }
  
  const CSS = `
    @page{size:A4 portrait;margin:0}
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:${C.textDark};background:white;font-size:10px;line-height:1.4}
    .page{page-break-after:always}
    .page:last-child{page-break-after:auto}
    .inner{padding:12mm 12mm 8mm}
    table{border-collapse:collapse;width:100%}
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  `;
  
  function generateAssetReportHTML(data: AssetReportData): string {
    const {asset,fleet,sensor,maintenance,tickets,maintenanceMetrics,ticketMetrics,insights} = data;
    const cur=data.currency||"LKR";
    const hs=data.health_score, fp=data.failure_probability, rl=data.risk_level??"—";
    const hCol=hs!=null?(hs>=80?C.emerald:hs>=60?C.amber:C.rose):C.slate;
    const rCol=({Low:C.emerald,Medium:C.amber,High:C.rose,Critical:"#dc2626"}[rl]??C.slate);
  
    // ── COVER PAGE ────────────────────────────────────────────────
    const cover=`<div class="page" style="background:white;min-height:297mm;display:flex;flex-direction:column">
      <div style="background:${C.teal};padding:14px 24px;display:flex;justify-content:space-between;align-items:center">
        <div><div style="font-size:16px;font-weight:800;color:white">PredictiX</div><div style="font-size:8px;color:rgba(255,255,255,0.7);letter-spacing:1px;text-transform:uppercase">AI-Powered Asset Management</div></div>
        <div style="text-align:right"><div style="font-size:8px;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:.8px">Confidential</div><div style="font-size:9px;color:white;font-weight:600;margin-top:1px">${data.reportDate}</div></div>
      </div>
      <div style="flex:1;padding:32px 24px 0">
        <div style="display:inline-block;background:${C.tealLight};border:1px solid ${C.teal}40;color:${C.tealDark};font-size:9px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;padding:4px 12px;border-radius:3px;margin-bottom:18px">Asset Performance Report</div>
        <h1 style="font-size:30px;font-weight:800;color:${C.textDark};line-height:1.2;margin-bottom:4px">${data.assetName}</h1>
        <div style="font-size:12px;color:${C.textLight};margin-bottom:24px">${data.assetCode} · ${data.warehouseName} · ${[asset.make,asset.model,asset.manufacture_year].filter(Boolean).join(" ")||"—"}</div>
        <div style="height:3px;background:linear-gradient(to right,${C.teal},${C.teal}20,transparent);border-radius:2px;margin-bottom:22px"></div>
  
        <!-- Detail grid 4×2 -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid ${C.border};border-radius:6px;overflow:hidden;margin-bottom:22px">
          ${[
            ["Asset Type",        [asset.asset_type,asset.vehicle_type].filter(Boolean).join(" / ")||"—"],
            ["Status",            (asset.status??"—").toUpperCase()],
            ["Health Band",       (asset.health_band??"—").toUpperCase()],
            ["Criticality Score", fmt(asset.criticality_score)],
            ["Fuel Type",         fmt(asset.fuel_type)],
            ["Current Mileage",   asset.current_mileage?`${asset.current_mileage} km`:"—"],
            ["Last Service",      fmtDate(asset.last_service_date)],
            ["Next Service",      fmtDate(asset.next_service_date)],
          ].map(([label,value],i)=>`<div style="padding:11px 16px;${i%2===0?`border-right:1px solid ${C.border};`:""}${i<6?`border-bottom:1px solid ${C.border};`:""}background:${i%4<2?"white":C.bg}">
            <div style="font-size:8px;color:${C.textLight};text-transform:uppercase;letter-spacing:.7px;margin-bottom:2px">${label}</div>
            <div style="font-size:12px;font-weight:700;color:${C.textDark}">${value}</div>
          </div>`).join("")}
        </div>
  
        <!-- KPI 3×2 grid -->
        <div style="margin-bottom:22px">
          <div style="font-size:9px;color:${C.textLight};text-transform:uppercase;letter-spacing:.7px;font-weight:600;margin-bottom:10px">AI Prediction Summary</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
            ${[
              ["Health Score",        hs!=null?`${hs}%`:"—",   hCol],
              ["Failure Probability", fp!=null?`${fp}%`:"—",   C.rose],
              ["Risk Level",          rl,                        rCol],
              ["Days to Maintenance", data.days_until_maintenance!=null?`${data.days_until_maintenance}d`:"—", C.teal],
              ["Estimated Cost",      data.estimated_cost?`LKR ${(data.estimated_cost/1000).toFixed(0)}K`:"—", C.violet],
              ["Open Tickets",        String(ticketMetrics.open_tickets), C.amber],
            ].map(([label,value,col])=>`<div style="border:1px solid ${C.border};border-left:4px solid ${col};border-radius:0 5px 5px 0;padding:10px 12px;background:white">
              <div style="font-size:8px;color:${C.textLight};text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px">${label}</div>
              <div style="font-size:17px;font-weight:800;color:${col};line-height:1.1">${value}</div>
            </div>`).join("")}
          </div>
        </div>
  
        ${insights.executive_summary?`<div style="background:${C.tealLight};border:1px solid ${C.teal}30;border-radius:5px;padding:11px 14px">
          <div style="font-size:8.5px;color:${C.tealDark};font-weight:700;text-transform:uppercase;letter-spacing:.7px;margin-bottom:5px">AI Executive Summary</div>
          <p style="font-size:9.5px;color:${C.textDark};line-height:1.65;margin:0">${insights.executive_summary}</p>
        </div>`:""}
      </div>
      <div style="margin:0 24px;padding:10px 0;border-top:1px solid ${C.border};display:flex;justify-content:space-between;font-size:7.5px;color:${C.textLight}">
        <span>LankaLogix · ${data.warehouseName}</span>
        <span>Powered by PredictiX AI Platform · Comprehensive Asset Health & Predictive Maintenance Analysis</span>
        <span>Page 1</span>
      </div>
    </div>`;
  
    // ── PAGE 2: FLEET OVERVIEW + ASSET OVERVIEW ───────────────────
    const HCOLS=["#059669","#0284c7","#d97706","#f97316","#e11d48"];
    const PCOLS=[C.teal,C.sky,C.emerald,C.amber,C.rose,C.violet,C.slate];
  
    const fleetKpis=`<div style="display:flex;gap:8px;margin-bottom:10px">
      ${kpi("Total Assets",String(fleet.total_assets),C.teal)}
      ${kpi("Fleet Health",`${fleet.fleet_health}%`,fleet.fleet_health>=70?C.emerald:C.rose)}
      ${kpi("Critical Alerts",String(fleet.critical_alerts),C.rose)}
      ${kpi("Open Tickets",String(fleet.open_tickets),C.amber)}
      ${kpi("Pred. Failures",String(fleet.predicted_failures),C.rose)}
      ${kpi("Est. Cost",`LKR ${(fleet.est_maintenance_cost/1_000_000).toFixed(1)}M`,C.violet)}
    </div>`;
  
    const topRiskRows=fleet.top_risk_assets.slice(0,5).map((r,i)=>
      tdRow([r.name,r.location,`<span style="color:${r.healthScore<30?C.rose:C.amber};font-weight:700">${r.healthScore}%</span>`,`${(r.failureProbability*100).toFixed(1)}%`,r.daysToMaintenance!=null?`${r.daysToMaintenance}d`:"—"],i%2===0)
    ).join("");
  
    // Asset detail cols
    const assetLeftRows=[
      ["Asset Code",        fmt(data.assetCode)],
      ["Type",             [asset.asset_type,asset.vehicle_type].filter(Boolean).join(" · ")||"—"],
      ["Make / Model",     [asset.make,asset.model,asset.manufacture_year].filter(Boolean).join(" ")||"—"],
      ["Fuel Type",         fmt(asset.fuel_type)],
      ["Status",            fmt(asset.status)],
      ["Health Band",       fmt(asset.health_band)],
      ["Criticality",       fmt(asset.criticality_score)],
      ["Mileage",           asset.current_mileage?`${asset.current_mileage} km`:"—"],
      ["Vehicle Age",       asset.vehicle_age_years?`${asset.vehicle_age_years} yrs`:"—"],
    ];
    const assetRightRows=[
      ["Health Score",      `<span style="color:${hCol};font-weight:700">${hs!=null?`${hs}%`:"—"}</span>`],
      ["Failure Prob.",     fp!=null?`${fp}%`:"—"],
      ["Risk Level",        riskBadge(rl)],
      ["Days to Maint.",    data.days_until_maintenance!=null?`${data.days_until_maintenance}d`:"—"],
      ["Pred. Maint. Date", fmtDate(data.predicted_maintenance_date)],
      ["Est. Cost",         data.estimated_cost?fmtCost(data.estimated_cost,cur):"—"],
      ["Purchase Date",     fmtDate(asset.purchase_date)],
      ["Last Service",      fmtDate(asset.last_service_date)],
      ["Next Service",      fmtDate(asset.next_service_date)],
    ];
  
    const shapData=data.top_explanations
      ?Object.entries(data.top_explanations).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([name,val])=>({name,count:Math.round(val*1000)}))
      :[];
  
    const page2=`<div class="page"><div class="inner">
      ${secHead("1","Fleet Overview")}
      ${fleetKpis}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
        ${card("Health Band Distribution", svgPie(fleet.health_distribution,HCOLS,110))}
        ${card("Asset Status Distribution", svgPie(fleet.status_distribution,PCOLS,110))}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
        ${fleet.vehicle_distribution.length?card("Assets by Vehicle Type",svgHBar(fleet.vehicle_distribution,C.teal,300,14,4)):""}
        ${fleet.top_risk_assets.length?card("Top At-Risk Assets",`<table><thead>${thRow(["Asset","Location","Health","Fail%","Days"])}</thead><tbody>${topRiskRows}</tbody></table>`):""}
      </div>
  
      ${secHead("2","Asset Overview")}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <table><tbody>${assetLeftRows.map(([l,v])=>fRow(l,v)).join("")}</tbody></table>
        <div>
          <table style="margin-bottom:10px"><tbody>${assetRightRows.map(([l,v])=>fRow(l,v)).join("")}</tbody></table>
          ${shapData.length?card("Top Failure Drivers (SHAP)",svgHBar(shapData,C.rose,280,14,4)):""}
        </div>
      </div>
    </div></div>`;
  
    // ── PAGE 3: SENSOR + MAINTENANCE ──────────────────────────────
    const sensorFields=sensor?[
      ["Recorded At",                fmt(sensor.recorded_at)],
      ["Tire Health",                sensor.tire_health_pct!=null?`${sensor.tire_health_pct}%`:"—"],
      ["Brake Health",               sensor.brake_health_pct!=null?`${sensor.brake_health_pct}%`:"—"],
      ["Battery Health",             sensor.battery_health_pct!=null?`${sensor.battery_health_pct}%`:"—"],
      ["Oil Life",                   sensor.oil_life_pct!=null?`${sensor.oil_life_pct}%`:"—"],
      ["Hydraulic Health",           sensor.hydraulic_health_pct!=null?`${sensor.hydraulic_health_pct}%`:"—"],
      ["Coolant Temp Max (°C)",      fmt(sensor.coolant_temp_max_c)],
      ["Engine Temp Avg (°C)",       fmt(sensor.engine_temp_avg_c)],
      ["Active Fault Codes",         fmt(sensor.active_fault_code_count)],
      ["Days Since Service",         fmt(sensor.days_since_last_service)],
      ["Engine Hours Since Service", fmt(sensor.engine_hours_since_last_service)],
      ["Downtime Last 90d (h)",      fmt(sensor.downtime_hours_last_90d)],
      ["Fuel Level",                 sensor.fuel_level!=null?`${sensor.fuel_level}%`:"—"],
      ["Odometer (km)",              fmt(sensor.odometer_km)],
    ]:[];
  
    const sL=sensorFields.slice(0,7),sR=sensorFields.slice(7);
  
    const maintRows=maintenance.slice(0,8).map((m,i)=>
      tdRow([fmtDate(m.performed_at),fmt(m.event_type),fmt(String(m.description??"—").slice(0,45)),m.cost_amount?fmtCost(m.cost_amount,cur):"—",m.downtime_hours?`${m.downtime_hours}h`:"—"],i%2===0)
    ).join("");
  
    const maintTypePie=maintenanceMetrics.total_events>0
      ?svgPie([{name:"Preventive",count:maintenanceMetrics.preventive_count},{name:"Corrective",count:maintenanceMetrics.corrective_count}],[C.emerald,C.rose],100)
      :`<span style="color:#94a3b8;font-size:10px">No data</span>`;
  
    const page3=`<div class="page"><div class="inner">
      ${secHead("3","Sensor Data & Maintenance History")}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
        <div>
          <div style="font-size:10px;font-weight:700;color:${C.textDark};margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid ${C.border}">Latest Sensor Snapshot</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0">
            <table><tbody>${sL.map(([l,v])=>fRow(l,v)).join("")}</tbody></table>
            <table style="padding-left:8px"><tbody>${sR.map(([l,v])=>fRow(l,v)).join("")}</tbody></table>
          </div>
        </div>
        <div>
          <div style="font-size:10px;font-weight:700;color:${C.textDark};margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid ${C.border}">Maintenance Summary</div>
          <table style="margin-bottom:10px"><tbody>
            ${fRow("Total Events",     String(maintenanceMetrics.total_events))}
            ${fRow("Preventive",       String(maintenanceMetrics.preventive_count))}
            ${fRow("Corrective",       String(maintenanceMetrics.corrective_count))}
            ${fRow("Total Cost",       fmtCost(maintenanceMetrics.total_cost,cur))}
            ${fRow("Total Downtime",   `${maintenanceMetrics.total_downtime_hours}h`)}
            ${fRow("Avg Cost/Event",   maintenanceMetrics.total_events?fmtCost(Math.round(maintenanceMetrics.total_cost/maintenanceMetrics.total_events),cur):"—")}
          </tbody></table>
          <div style="font-size:10px;font-weight:700;color:${C.textDark};margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid ${C.border}">Maintenance Types</div>
          ${maintTypePie}
        </div>
      </div>
      ${maintenance.length?`<div style="font-size:10px;font-weight:700;color:${C.textDark};margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid ${C.border}">Recent Maintenance Events</div>
      <table><thead>${thRow(["Date","Type","Description",`Cost (${cur})`,"Downtime"])}</thead><tbody>${maintRows}</tbody></table>`:""}
    </div></div>`;
  
    // ── PAGE 4: TICKETS + AI INSIGHTS ─────────────────────────────
    const ticketPie=ticketMetrics.total_tickets>0
      ?svgPie([{name:"Open",count:ticketMetrics.open_tickets},{name:"High Priority",count:ticketMetrics.high_priority_tickets},{name:"Closed",count:ticketMetrics.closed_tickets}],[C.rose,C.amber,C.emerald],100)
      :`<span style="color:#94a3b8;font-size:10px">No data</span>`;
  
    const ticketRows=tickets.slice(0,8).map((t,i)=>{
      const pri=(t.priority||"").toLowerCase(),pc=pri==="high"?C.rose:pri==="medium"?C.amber:C.emerald;
      return tdRow([fmt(t.ticket_number),fmt(String(t.title??"—").slice(0,50)),`<span style="color:${pc};font-weight:700">${fmt(t.priority)}</span>`,fmt(t.status),fmtDate(t.created_at)],i%2===0);
    }).join("");
  
    const recs=insights.recommendations||{critical:[],high:[],medium:[]};
    const recBlock=(level:string,items:string[],col:string)=>
      items.length?`<div style="background:${col}10;border-left:3px solid ${col};border-radius:0 4px 4px 0;padding:7px 10px;margin-bottom:7px">
        <div style="font-size:8px;font-weight:700;color:${col};text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">${level} Priority</div>
        ${items.map(r=>`<div style="font-size:9px;color:${C.textDark};margin-bottom:2px">• ${r}</div>`).join("")}
      </div>`:"";
  
    const page4=`<div class="page"><div class="inner">
      ${secHead("4","Ticket Management & AI Insights")}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
        <div>
          <div style="font-size:10px;font-weight:700;color:${C.textDark};margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid ${C.border}">Ticket Summary</div>
          <table style="margin-bottom:10px"><tbody>
            ${fRow("Total Tickets",   String(ticketMetrics.total_tickets))}
            ${fRow("Open",            String(ticketMetrics.open_tickets))}
            ${fRow("High Priority",   String(ticketMetrics.high_priority_tickets))}
            ${fRow("Closed",          String(ticketMetrics.closed_tickets))}
          </tbody></table>
          <div style="font-size:10px;font-weight:700;color:${C.textDark};margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid ${C.border}">Ticket Distribution</div>
          ${ticketPie}
        </div>
        <div>
          ${(recs.critical.length||recs.high.length||recs.medium.length)?`
          <div style="font-size:10px;font-weight:700;color:${C.textDark};margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid ${C.border}">Recommendations</div>
          ${recBlock("Critical",recs.critical,C.rose)}${recBlock("High",recs.high,C.amber)}${recBlock("Medium",recs.medium,C.sky)}`:""}
          ${insights.conclusion?`<div style="font-size:10px;font-weight:700;color:${C.textDark};margin:10px 0 6px;padding-bottom:4px;border-bottom:1px solid ${C.border}">Conclusion & Next Steps</div>
          <div style="background:${C.tealLight};border-left:3px solid ${C.teal};border-radius:0 4px 4px 0;padding:9px 11px">
            <p style="font-size:9.5px;color:${C.textDark};line-height:1.6;margin:0">${insights.conclusion}</p>
          </div>`:""}
        </div>
      </div>
      ${tickets.length?`<div style="font-size:10px;font-weight:700;color:${C.textDark};margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid ${C.border}">Recent Tickets</div>
      <table><thead>${thRow(["Ticket ID","Title","Priority","Status","Created"])}</thead><tbody>${ticketRows}</tbody></table>`:""}
      <div style="margin-top:20px;padding-top:8px;border-top:1px solid ${C.border};display:flex;justify-content:space-between;font-size:7.5px;color:${C.textLight}">
        <span>PredictiX AI Platform · Asset Management Solution · © 2026 All Rights Reserved</span>
        <span>Generated: ${data.reportDate} · Confidential</span>
      </div>
    </div></div>`;
  
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Asset Report — ${data.assetName}</title><style>${CSS}</style></head><body>${cover}${page2}${page3}${page4}</body></html>`;
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
    } catch(err){console.error("Asset PDF export error:",err);saveAssetReportAsFile(data,filename);}
  }
  
  export function saveAssetReportAsFile(data: AssetReportData, filename="asset-report.html"): void {
    try {
      const html=generateAssetReportHTML(data);
      const blob=new Blob([html],{type:"text/html"}),url=URL.createObjectURL(blob);
      const a=document.createElement("a");
      a.href=url;a.download=filename;
      document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
    } catch(err){console.error("Asset report save error:",err);}
  }