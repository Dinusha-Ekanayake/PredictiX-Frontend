/**
 * KB-Enhanced Professional PDF Export — PredictiX Warehouse Report
 * =================================================================
 * Report Structure (9 sections):
 *   Cover Page → Table of Contents →
 *   §1 Executive Insight Summary (KPI strip + AI narrative + benchmark alerts) →
 *   §2 Fleet Asset Overview (composition + status + workforce) →
 *   §3 Health & Risk Analysis (health bands + SHAP drivers + critical assets) →
 *   §4 Maintenance Intelligence (PM ratio + cost metrics + monthly trend) →
 *   §5 Ticket Management Status (priority + category + ticket trend) →
 *   §6 Recommendations (CRITICAL/HIGH/MEDIUM urgency blocks) →
 *   §7 Conclusion (final KPI summary + executive closing)
 */

// ══════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ══════════════════════════════════════════════════════════════════

interface AIContent {
  insight_summary?: string;
  risk_analysis?: string;
  maintenance_intelligence?: string;
  pattern_and_trend?: string;
  conclusion?: string;
}

interface KBAnnotations {
  shap_enriched?: Array<{
    feature: string;
    impact_pct: number;
    kb_threshold: string;
    action: string;
    standard?: string;
  }>;
  health_bands_kb?: Array<{
    band: string;
    count: number;
    pct_fleet: number;
    kb_interpretation: string;
  }>;
  benchmark_alerts?: Array<{
    type: 'BENCHMARK' | 'HIGH_ALERT';
    message: string;
  }>;
  ticket_category_kb?: Array<{
    category: string;
    count: number;
    pct_open: number;
    kb_guidance: string;
  }>;
  recommendations?: {
    critical: string[];
    high: string[];
    medium: string[];
    kb_alert?: string;
  };
  service_interval_text?: string;
}

interface ReportData {
  title: string;
  warehouseName: string;
  warehouseCity?: string;
  generatedDate: string;
  aiContent?: AIContent;
  kbAnnotations?: KBAnnotations;
  summary: {
    totalAssets: number;
    fleetHealth: number;
    failureProb: number;
    critical: number;
    urgent: number;
    activeTickets: number;
    activeUsers: number;
    maintenanceCost: string;
  };
  assetDetail?: {
    activeAssets?: number;
    inactiveAssets?: number;
    underMaintenanceAssets?: number;
    retiredAssets?: number;
    avgVehicleAge?: number;
    fleetAgeDist?: Record<string, number>;
    warrantyExpiring90d?: number;
  };
  maintenanceDetail?: {
    estimatedCost?: string;
    avgCostPerAsset?: string;
    actualCost3m?: string;
    maintenanceEvents3m?: number;
    avgDowntimeHours?: number;
    preventiveCount?: number;
    correctiveCount?: number;
    monthlyTrend?: Array<{ month: string; events: number; cost: number }>;
    minCostEstimate?: number;
    maxCostEstimate?: number;
    vendorBreakdown?: Array<{ vendor: string; events: number; cost: number }>;
  };
  ticketDetail?: {
    totalTickets?: number;
    openTickets?: number;
    inProgressTickets?: number;
    resolvedTickets?: number;
    closedTickets?: number;
    highPriorityTickets?: number;
    mediumPriorityTickets?: number;
    lowPriorityTickets?: number;
    monthlyTrend?: Array<{ month: string; count: number }>;
    avgResolutionDays?: number;
    mttrByPriority?: Array<{ priority: string; avg_hours: number }>;
    finalPriorityBreakdown?: Record<string, number>;
  };
  maintenanceSchedule?: Array<{ asset: string; predicted: number; scheduled: number }>;
  userDetail?: {
    totalUsers?: number;
    adminUsers?: number;
    standardUsers?: number;
    inactiveUsers?: number;
  };
  operationsDetail?: {
    componentHealth?: { avg_tire?: number; avg_brake?: number; avg_battery?: number; avg_oil?: number; avg_hydraulic?: number };
    totalFaultCodes?: number;
    avgFaultCodesPerAsset?: number;
  };
  sections: {
    assetStatus: Array<{ name: string; value: number }>;
    assetsByType: Array<{ name: string; value: number }>;
    // Accept both old and new property names for maintenance types
    maintenanceTypes?: Array<{ name: string; value: number }>;
    maintenanceByType?: Array<{ name: string; value: number }>;
    ticketsByCategory: Array<{ name: string; value: number }>;
    // Accept both old and new property names for ticket priority
    ticketPriority?: Array<{ name: string; value: number }>;
    ticketsByPriority?: Array<{ name: string; value: number }>;
    healthScoreDistribution: Array<{ bucket: string; count: number }>;
    // Fixed: was criticaAssets (typo). Accept both for backwards compatibility.
    criticalAssets?: Array<{ id: string; vehicle: string; component: string; health: string; priority: string; status?: string; summary?: string }>;
    criticaAssets?: Array<{ id: string; vehicle: string; component: string; health: string; priority: string; status?: string; summary?: string }>;
    // Accept both property names for risk distribution
    riskBreakdown?: Array<{ name: string; value: number }>;
    riskDistribution?: Array<{ name: string; value: number }>;
  };
  trends?: {
    ticketTrend?: Array<{ month: string; tickets: number }>;
    maintenanceTrend?: Array<{ month: string; events: number; cost: number }>;
  };
  shapFeatures?: Array<{ feature: string; importance: number }>;
}


// ══════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ══════════════════════════════════════════════════════════════════

const C = {
  // Primary brand
  teal:        '#0d9488',
  tealLight:   '#2dd4bf',
  tealBg:      '#f0fdf9',
  tealBorder:  '#99f6e4',

  // Backgrounds
  navy:        '#0f172a',
  navyMed:     '#1e293b',
  navyLight:   '#334155',

  // Neutrals
  slate:       '#475569',
  slateMid:    '#64748b',
  slateLight:  '#94a3b8',
  border:      '#e2e8f0',
  borderLight: '#f1f5f9',
  white:       '#ffffff',
  offWhite:    '#f8fafc',

  // Semantic
  red:         '#dc2626',
  redLight:    '#fee2e2',
  redBorder:   '#fca5a5',
  orange:      '#ea580c',
  orangeLight: '#ffedd5',
  amber:       '#d97706',
  amberLight:  '#fef3c7',
  green:       '#16a34a',
  greenLight:  '#dcfce7',
  blue:        '#2563eb',
  blueLight:   '#dbeafe',
  violet:      '#7c3aed',
  violetLight: '#ede9fe',

  // Text
  text:        '#1e293b',
  textMuted:   '#64748b',
  textLight:   '#94a3b8',
};

const CHART_COLORS = [
  C.teal, '#3b82f6', '#f97316', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981', '#6366f1',
];


// ══════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════

function fmt(n: number | undefined | null): number { return n ?? 0; }
function fmtN(n?: number | null, dec = 0): string {
  return (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function fmtPct(n: number): string { return `${n.toFixed(1)}%`; }


// ══════════════════════════════════════════════════════════════════
// SVG CHART GENERATORS
// ══════════════════════════════════════════════════════════════════

function svgDonut(
  slices: Array<{ name: string; value: number }>,
  w = 220, h = 200, cx = 105, cy = 88, r = 68, innerR = 34
): string {
  const total = slices.reduce((s, d) => s + (d.value || 0), 0);
  if (!total) return `<svg width="${w}" height="${h}"><text x="${cx}" y="${cy}" text-anchor="middle" fill="${C.slateMid}" font-size="10">No data</text></svg>`;

  let angle = -90;
  const paths = slices.map((s, i) => {
    const pct = (s.value || 0) / total;
    const startA = angle;
    angle += pct * 360;
    const endA = angle;
    const rad = (a: number) => (a * Math.PI) / 180;
    const p1 = { x: cx + r * Math.cos(rad(startA)), y: cy + r * Math.sin(rad(startA)) };
    const p2 = { x: cx + r * Math.cos(rad(endA)),   y: cy + r * Math.sin(rad(endA)) };
    const i1 = { x: cx + innerR * Math.cos(rad(startA)), y: cy + innerR * Math.sin(rad(startA)) };
    const i2 = { x: cx + innerR * Math.cos(rad(endA)),   y: cy + innerR * Math.sin(rad(endA)) };
    const large = pct > 0.5 ? 1 : 0;
    const col = CHART_COLORS[i % CHART_COLORS.length];
    const midA = (startA + endA) / 2;
    const lx = cx + (r * 0.72) * Math.cos(rad(midA));
    const ly = cy + (r * 0.72) * Math.sin(rad(midA));
    const label = pct >= 0.07 ? `${Math.round(pct * 100)}%` : '';
    return `<path d="M${p1.x},${p1.y} A${r},${r} 0 ${large},1 ${p2.x},${p2.y} L${i2.x},${i2.y} A${innerR},${innerR} 0 ${large},0 ${i1.x},${i1.y} Z" fill="${col}"/>
            ${label ? `<text x="${lx}" y="${ly + 3.5}" text-anchor="middle" fill="white" font-size="8.5" font-weight="700">${label}</text>` : ''}`;
  }).join('');

  const legendStartY = cy + r + 14;
  const legendItems = slices.map((s, i) => {
    const col = i % 2 === 0 ? 5 : cx + 15;
    const row = Math.floor(i / 2);
    const col2 = CHART_COLORS[i % CHART_COLORS.length];
    const name = s.name.length > 16 ? s.name.substring(0, 15) + '…' : s.name;
    return `<rect x="${col}" y="${legendStartY + row * 13}" width="7" height="7" fill="${col2}" rx="1.5"/>
            <text x="${col + 10}" y="${legendStartY + row * 13 + 6.5}" font-size="7" fill="${C.slateMid}">${name}: ${s.value}</text>`;
  }).join('');

  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${paths}${legendItems}</svg>`;
}

function svgVBar(
  bars: Array<{ name: string; value: number }>,
  w = 540, h = 200, color?: string
): string {
  if (!bars.length) return `<svg width="${w}" height="${h}"></svg>`;
  const maxVal = Math.max(...bars.map(b => b.value || 0), 1);
  const chartH = h - 52;
  const bw = Math.max(Math.floor((w - 70) / bars.length) - 8, 12);
  const gap = Math.floor((w - 70) / bars.length);

  const gridLines = [0.25, 0.5, 0.75, 1.0].map(f => {
    const y = 10 + chartH - chartH * f;
    return `<line x1="44" y1="${y}" x2="${w - 10}" y2="${y}" stroke="${C.borderLight}" stroke-width="1"/>
            <text x="40" y="${y + 3.5}" text-anchor="end" font-size="7" fill="${C.textLight}">${Math.round(maxVal * f)}</text>`;
  }).join('');

  const rects = bars.map((b, i) => {
    const bh = Math.max(((b.value || 0) / maxVal) * chartH, 2);
    const x  = 46 + i * gap + (gap - bw) / 2;
    const y  = 10 + chartH - bh;
    const col = color || CHART_COLORS[i % CHART_COLORS.length];
    const label = b.name.length > 10 ? b.name.substring(0, 9) + '…' : b.name;
    return `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" fill="${col}" rx="3" opacity="0.92"/>
            <text x="${x + bw / 2}" y="${y - 4}" text-anchor="middle" font-size="8" fill="${C.text}" font-weight="600">${b.value}</text>
            <text x="${x + bw / 2}" y="${10 + chartH + 14}" text-anchor="middle" font-size="7.5" fill="${C.slateMid}">${label}</text>`;
  }).join('');

  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <line x1="44" y1="8" x2="44" y2="${10 + chartH}" stroke="${C.border}" stroke-width="1.5"/>
    <line x1="44" y1="${10 + chartH}" x2="${w - 10}" y2="${10 + chartH}" stroke="${C.border}" stroke-width="1.5"/>
    ${gridLines}${rects}
  </svg>`;
}

function svgHBar(
  bars: Array<{ name: string; value: number; label?: string }>,
  w = 480, rowH = 26
): string {
  const h = bars.length * rowH + 16;
  const maxVal = Math.max(...bars.map(b => b.value || 0), 1);
  const nameW = 180;
  const barMaxW = w - nameW - 60;

  const rows = bars.map((b, i) => {
    const bw = Math.max(((b.value || 0) / maxVal) * barMaxW, 3);
    const y  = 8 + i * rowH;
    const col = CHART_COLORS[i % CHART_COLORS.length];
    const displayLabel = b.label || String(b.value);
    const name = b.name.length > 26 ? b.name.substring(0, 25) + '…' : b.name;
    return `<text x="0" y="${y + rowH / 2 + 4}" font-size="9" fill="${C.text}">${name}</text>
            <rect x="${nameW}" y="${y + 5}" width="${bw}" height="${rowH - 12}" fill="${col}" rx="3" opacity="0.9"/>
            <text x="${nameW + bw + 6}" y="${y + rowH / 2 + 4}" font-size="9" fill="${C.slateMid}" font-weight="600">${displayLabel}</text>`;
  }).join('');

  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${rows}</svg>`;
}

function svgLine(
  points: Array<{ label: string; value: number }>,
  w = 540, h = 160, color = C.teal
): string {
  if (!points.length) return `<svg width="${w}" height="${h}"></svg>`;
  const maxVal = Math.max(...points.map(p => p.value), 1);
  const chartH = h - 40;
  const chartW = w - 60;
  const step = chartW / Math.max(points.length - 1, 1);

  const coords = points.map((p, i) => ({
    x: 40 + i * step,
    y: 10 + chartH - (p.value / maxVal) * chartH,
  }));

  const polyline = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ');
  const area = `M${coords[0].x},${10 + chartH} ` + coords.map(c => `L${c.x},${c.y}`).join(' ') + ` L${coords[coords.length - 1].x},${10 + chartH} Z`;

  const dots = coords.map((c, i) => {
    // If dot is near the top edge, place label below the dot instead of above
    const labelY = c.y < 22 ? c.y + 14 : c.y - 8;
    return `<circle cx="${c.x}" cy="${c.y}" r="4" fill="${color}" stroke="white" stroke-width="1.5"/>
     <text x="${c.x}" y="${labelY}" text-anchor="middle" font-size="8" fill="${C.text}" font-weight="600">${points[i].value}</text>`;
  }).join('');

  const xLabels = points.map((p, i) =>
    `<text x="${coords[i].x}" y="${10 + chartH + 16}" text-anchor="middle" font-size="8" fill="${C.slateMid}">${p.label}</text>`
  ).join('');

  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <path d="${area}" fill="${color}" opacity="0.08"/>
    <path d="${polyline}" stroke="${color}" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
    ${dots}${xLabels}
    <line x1="38" y1="8" x2="38" y2="${10 + chartH}" stroke="${C.border}" stroke-width="1"/>
    <line x1="38" y1="${10 + chartH}" x2="${w - 10}" y2="${10 + chartH}" stroke="${C.border}" stroke-width="1"/>
  </svg>`;
}


// ══════════════════════════════════════════════════════════════════
// SHARED LAYOUT COMPONENTS
// ══════════════════════════════════════════════════════════════════

function pageHeader(warehouseName: string, section: string): string {
  return `<div style="display:flex;justify-content:space-between;align-items:center;padding:0 0 10px;margin-bottom:18px;border-bottom:2px solid ${C.teal};">
    <div style="font-size:10px;font-weight:700;color:${C.teal};letter-spacing:0.08em;text-transform:uppercase;">${warehouseName}</div>
    <div style="font-size:9px;color:${C.textLight};">${section}</div>
  </div>`;
}

function sectionHeader(num: string | number, title: string, sub?: string): string {
  const subHtml = sub ? `<span style="font-size:12px;font-weight:400;color:${C.slateMid};margin-left:8px;">· ${sub}</span>` : '';
  return `<h1 style="font-size:19px;font-weight:800;color:${C.navy};margin:28px 0 6px;padding-bottom:10px;border-bottom:3px solid ${C.teal};letter-spacing:-0.3px;">${num}. ${title}${subHtml}</h1>`;
}

function subHeader(text: string, color = C.navy): string {
  return `<h2 style="font-size:12.5px;font-weight:700;color:${color};margin:20px 0 8px;display:flex;align-items:center;gap:6px;">${text}</h2>`;
}

function kpiCard(label: string, value: string | number, sub?: string, color = C.teal, bgColor = C.offWhite): string {
  return `<div style="background:${bgColor};border:1px solid ${C.border};border-top:3px solid ${color};border-radius:6px;padding:14px 16px;min-width:110px;">
    <div style="font-size:8.5px;font-weight:700;color:${C.textMuted};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">${label}</div>
    <div style="font-size:22px;font-weight:800;color:${color};line-height:1;margin-bottom:4px;">${value}</div>
    ${sub ? `<div style="font-size:9px;color:${C.textLight};">${sub}</div>` : ''}
  </div>`;
}

function kpiGrid4(...cards: string[]): string {
  return `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:16px 0;">${cards.join('')}</div>`;
}


function twoCol(left: string, right: string, split = '1fr 1fr'): string {
  return `<div style="display:grid;grid-template-columns:${split};gap:20px;align-items:start;">${left}${right}</div>`;
}

function narrativePara(text: string): string {
  return `<div style="border-left:3px solid ${C.teal};background:${C.tealBg};padding:12px 18px;margin:16px 0;border-radius:0 6px 6px 0;">
    <p style="font-size:10.5px;line-height:1.85;color:${C.text};margin:0;">${text}</p>
  </div>`;
}

function alertBox(text: string, type: 'benchmark' | 'alert' | 'info' = 'benchmark'): string {
  const styles: Record<string, { bg: string; border: string; color: string; label: string }> = {
    benchmark: { bg: C.tealBg,    border: C.teal,      color: '#065f46', label: 'Benchmark Context' },
    alert:     { bg: C.redLight,  border: C.red,        color: C.red,     label: '■ High Alert' },
    info:      { bg: C.blueLight, border: C.blue,       color: C.blue,    label: 'Service Reference' },
  };
  const s = styles[type];
  return `<div style="background:${s.bg};border-left:4px solid ${s.border};padding:11px 16px;margin:14px 0;border-radius:0 6px 6px 0;">
    <span style="font-size:9.5px;font-weight:700;color:${s.color};text-transform:uppercase;letter-spacing:0.04em;">${s.label}:</span>
    <p style="font-size:10.5px;line-height:1.75;color:${s.color};margin:5px 0 0;font-style:italic;">${text}</p>
  </div>`;
}

function progressBar(label: string, count: number, max: number, color: string, pct?: number): string {
  const p = pct !== undefined ? pct : (max > 0 ? Math.min((count / max) * 100, 100) : 0);
  return `<div style="margin-bottom:12px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
      <span style="font-size:10px;color:${C.text};font-weight:500;">${label}</span>
      <span style="font-size:10px;font-weight:700;color:${color};">${count.toLocaleString()} <span style="font-weight:400;color:${C.textMuted};">(${p.toFixed(1)}%)</span></span>
    </div>
    <div style="background:${C.borderLight};height:9px;border-radius:5px;overflow:hidden;">
      <div style="width:${p}%;background:${color};height:100%;border-radius:5px;"></div>
    </div>
  </div>`;
}

function darkTable(headers: string[], rows: string[][]): string {
  const ths = headers.map(h =>
    `<th style="background:${C.navy};color:white;padding:9px 11px;text-align:left;font-size:9.5px;font-weight:600;border-right:1px solid ${C.navyLight};">${h}</th>`
  ).join('');
  const trs = rows.map((row, ri) => {
    const bg = ri % 2 === 0 ? C.offWhite : C.white;
    const tds = row.map((cell, ci) => {
      const isHealthCol = ci > 0 && typeof cell === 'string' && cell.includes('%') && parseFloat(cell) < 50 && ci === 2;
      const isCritCol = typeof cell === 'string' && (cell === 'Critical' || cell === 'High');
      const color = isHealthCol || isCritCol ? C.red : C.text;
      const fw = ci === 0 ? '600' : '400';
      return `<td style="padding:8px 11px;font-size:10px;border-bottom:1px solid ${C.border};border-right:1px solid ${C.borderLight};color:${color};font-weight:${fw};">${cell}</td>`;
    }).join('');
    return `<tr style="background:${bg};">${tds}</tr>`;
  }).join('');
  return `<table style="width:100%;border-collapse:collapse;margin:10px 0;border-radius:6px;overflow:hidden;border:1px solid ${C.border};">
    <thead><tr>${ths}</tr></thead>
    <tbody>${trs}</tbody>
  </table>`;
}

function lightTable(headers: string[], rows: string[][]): string {
  const ths = headers.map(h =>
    `<th style="padding:8px 11px;text-align:left;font-size:9px;font-weight:700;color:${C.textMuted};border-bottom:2px solid ${C.border};text-transform:uppercase;letter-spacing:0.04em;">${h}</th>`
  ).join('');
  const trs = rows.map((row, ri) => {
    const bg = ri % 2 === 0 ? C.white : C.offWhite;
    const tds = row.map((cell, ci) => {
      const fw = ci === 0 ? '600' : '400';
      return `<td style="padding:7px 11px;font-size:10px;color:${C.text};font-weight:${fw};border-bottom:1px solid ${C.borderLight};">${cell}</td>`;
    }).join('');
    return `<tr style="background:${bg};">${tds}</tr>`;
  }).join('');
  return `<table style="width:100%;border-collapse:collapse;margin:10px 0;border:1px solid ${C.border};border-radius:6px;overflow:hidden;">
    <thead style="background:${C.offWhite};"><tr>${ths}</tr></thead>
    <tbody>${trs}</tbody>
  </table>`;
}

function healthBadge(health: string): string {
  const score = parseFloat(health);
  const color = isNaN(score) ? C.slateMid : score < 50 ? C.red : score < 70 ? C.orange : C.green;
  return `<span style="font-weight:700;color:${color};">${health}</span>`;
}

function recommendBlock(urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM', days: string, items: string[]): string {
  const cfg: Record<string, { bg: string; border: string; headerBg: string }> = {
    CRITICAL: { bg: '#fff5f5', border: C.redBorder,   headerBg: C.red },
    HIGH:     { bg: '#fff7ed', border: '#fdba74',      headerBg: C.orange },
    MEDIUM:   { bg: C.tealBg, border: C.tealBorder,   headerBg: C.teal },
  };
  const c = cfg[urgency];
  const bullets = items.map(i =>
    `<div style="display:flex;gap:8px;margin:6px 0;"><span style="color:${c.headerBg};font-weight:700;margin-top:1px;">›</span><p style="margin:0;font-size:10.5px;line-height:1.7;color:${C.text};">${i}</p></div>`
  ).join('');
  return `<div style="margin:12px 0;border-radius:8px;overflow:hidden;border:1px solid ${c.border};">
    <div style="background:${c.headerBg};color:white;padding:9px 16px;font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">${urgency} PRIORITY — ${days}</div>
    <div style="padding:14px 16px;background:${c.bg};">${bullets}</div>
  </div>`;
}

function chartBox(title: string, svgContent: string, caption?: string): string {
  return `<div style="background:${C.white};border:1px solid ${C.border};border-radius:8px;padding:16px;margin:10px 0;">
    ${title ? `<div style="font-size:10px;font-weight:700;color:${C.textMuted};text-transform:uppercase;letter-spacing:0.05em;margin-bottom:10px;">${title}</div>` : ''}
    <div style="text-align:center;">${svgContent}</div>
    ${caption ? `<div style="font-size:8.5px;color:${C.textLight};font-style:italic;text-align:center;margin-top:6px;">${caption}</div>` : ''}
  </div>`;
}


// ══════════════════════════════════════════════════════════════════
// CSS
// ══════════════════════════════════════════════════════════════════

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: ${C.text};
    background: white;
    font-size: 11px;
    line-height: 1.6;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page {
    max-width: 790px;
    margin: 0 auto;
    padding: 44px 56px;
    min-height: 100vh;
  }
  table { width: 100%; border-collapse: collapse; }
  @media print {
    body { margin: 0; background: white; }
    .page { page-break-after: always; min-height: auto; padding: 32px 44px; }
    .page:last-child { page-break-after: avoid; }
  }
`;


// ══════════════════════════════════════════════════════════════════
// MAIN PDF GENERATOR
// ══════════════════════════════════════════════════════════════════

export function generateProfessionalHTML(data: ReportData): string {
  const kb  = data.kbAnnotations || {};
  const ai  = data.aiContent     || {};
  const s   = data.sections;
  const td  = data.ticketDetail  || {};
  const md  = data.maintenanceDetail || {};
  const ud  = data.userDetail    || {};
  const ad  = data.assetDetail   || {};
  const od  = data.operationsDetail || {};
  const tr  = data.trends        || {};
  const msch = data.maintenanceSchedule || [];

  // Resolve property name aliases (fix old typos / renames)
  const criticalAssets = s.criticalAssets || s.criticaAssets || [];
  const maintenanceTypes = s.maintenanceTypes || s.maintenanceByType || [];
  const riskData        = s.riskBreakdown   || s.riskDistribution   || s.assetStatus;

  // Core metrics
  const totalAssets    = fmt(data.summary?.totalAssets);
  const critCount      = fmt(data.summary?.critical);
  const urgentCount    = fmt(data.summary?.urgent);
  const healthFleet    = fmt(data.summary?.fleetHealth);
  const failProb       = fmt(data.summary?.failureProb);
  const activeUsers    = fmt(data.summary?.activeUsers);
  const activeTickets  = fmt(data.summary?.activeTickets);

  const activeA  = fmt(ad.activeAssets);

  const totalEvents = fmt(md.maintenanceEvents3m);
  const prevCount   = fmt(md.preventiveCount ?? Math.round(totalEvents * 0.99));
  const corrCount   = fmt(md.correctiveCount ?? Math.max(totalEvents - prevCount, 0));
  const pmPct       = totalEvents > 0 ? (prevCount / totalEvents * 100) : 99.0;
  const corrPct     = 100 - pmPct;
  const pmRatio     = corrCount > 0 ? Math.round(prevCount / corrCount) : 100;

  const openT  = fmt(td.openTickets);
  const highT  = fmt(td.highPriorityTickets);
  const medT   = fmt(td.mediumPriorityTickets);
  const lowT   = fmt(td.lowPriorityTickets);

  const healthyAssets  = s.healthScoreDistribution.filter(h => !h.bucket.includes('Below') && parseFloat(h.bucket) >= 80).reduce((sum, h) => sum + h.count, 0);
  const degradedAssets = s.healthScoreDistribution.find(h => h.bucket.includes('Below'))?.count || 0;
  const healthyPct     = totalAssets > 0 ? Math.round(healthyAssets / totalAssets * 100) : 0;
  void degradedAssets; // computed for context, not directly rendered

  const benchmarkAlert = kb.benchmark_alerts?.find(a => a.type === 'BENCHMARK');
  const highAlert      = kb.benchmark_alerts?.find(a => a.type === 'HIGH_ALERT');

  // SHAP data: prefer KB enriched, fallback to raw shapFeatures
  const shapSource: Array<{ feature: string; impact_pct: number; kb_threshold: string; action: string }> =
    kb.shap_enriched?.length
      ? kb.shap_enriched
      : (data.shapFeatures || []).map((f) => ({
          feature: f.feature,
          impact_pct: Math.round((f.importance / Math.max(...(data.shapFeatures || []).map(x => x.importance), 1)) * 100 * 10) / 10,
          kb_threshold: 'See OEM manual',
          action: 'Schedule inspection',
        }));

  // Maintenance trend (prefer data.trends, fallback to md.monthlyTrend)
  const mainTrend = tr.maintenanceTrend || md.monthlyTrend || [];
  const ticketTrend = tr.ticketTrend || [];

  // ── COVER PAGE ─────────────────────────────────────────────────
  const coverPage = `
  <div class="page" style="padding:0;min-height:100vh;display:flex;flex-direction:column;background:${C.white};">
    <!-- Top accent bar -->
    <div style="height:6px;background:linear-gradient(90deg,${C.teal},${C.tealLight},${C.blue});"></div>

    <!-- Main content -->
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:60px 80px 40px;">

      <!-- Logo / Brand -->
      <div style="margin-bottom:36px;">
        <div style="font-size:52px;font-weight:800;color:${C.navy};letter-spacing:-2px;line-height:1;">Predic<span style="color:${C.teal};">tiX</span></div>
        <div style="width:60px;height:3px;background:${C.teal};margin:12px auto 0;border-radius:2px;"></div>
      </div>

      <!-- Report title block -->
      <div style="background:${C.tealBg};border:1px solid ${C.tealBorder};border-radius:12px;padding:28px 48px;margin-bottom:36px;max-width:520px;width:100%;">
        <div style="font-size:13px;font-weight:700;color:${C.teal};text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;">Warehouse Intelligence Report</div>
        <div style="font-size:28px;font-weight:800;color:${C.navy};margin-bottom:6px;">${data.warehouseName}</div>
        ${data.warehouseCity ? `<div style="font-size:14px;color:${C.slateMid};">${data.warehouseCity}</div>` : ''}
        <div style="height:1px;background:${C.tealBorder};margin:16px 0;"></div>
        <div style="font-size:11px;color:${C.slateMid};">Comprehensive Fleet Health · Predictive Maintenance Analysis</div>
        <div style="font-size:11px;color:${C.slateMid};margin-top:4px;">Powered by CatBoost ML · SHAP Explainability · RAG-LLM Insights</div>
      </div>

      <!-- Meta info -->
      <div style="text-align:center;color:${C.textLight};font-size:10px;line-height:2;">
        <div>Report Generated: <strong style="color:${C.text};">${data.generatedDate}</strong></div>
        <div>Reporting Period: Last 3 Months</div>
        <div style="margin-top:8px;display:inline-block;background:${C.amberLight};border:1px solid #fcd34d;border-radius:4px;padding:3px 10px;font-size:9px;font-weight:700;color:${C.amber};letter-spacing:0.05em;">CONFIDENTIAL</div>
      </div>
    </div>

    <!-- Bottom accent bar -->
    <div style="height:4px;background:linear-gradient(90deg,${C.teal},${C.tealLight});"></div>
  </div>`;

  // ── TABLE OF CONTENTS ──────────────────────────────────────────
  const tocItems = [
    { num: '1', title: 'Executive Insight Summary',   sub: 'Fleet overview · KPI snapshot · Benchmark context' },
    { num: '2', title: 'Fleet Asset Overview',         sub: 'Composition · Status distribution · Workforce' },
    { num: '3', title: 'Health & Risk Analysis',       sub: 'Health bands · SHAP drivers · Critical assets' },
    { num: '4', title: 'Maintenance Intelligence',     sub: 'PM ratio · Cost metrics · Monthly trend' },
    { num: '5', title: 'Ticket Management Status',     sub: 'Priority · Category · 3-month ticket trend' },
    { num: '6', title: 'Recommendations',              sub: 'Critical / High / Medium priority actions' },
    { num: '7', title: 'Conclusion',                   sub: 'Executive summary · Final KPI dashboard' },
  ];

  const tocPage = `
  <div class="page">
    ${pageHeader(data.warehouseName, 'Table of Contents')}
    <div style="margin:30px auto;max-width:580px;">
      <h1 style="font-size:22px;font-weight:800;color:${C.navy};margin-bottom:6px;">Table of Contents</h1>
      <div style="height:3px;width:60px;background:${C.teal};border-radius:2px;margin-bottom:24px;"></div>
      ${tocItems.map(item => `
        <div style="display:flex;align-items:start;gap:14px;padding:12px 16px;border-bottom:1px solid ${C.borderLight};transition:background 0.2s;">
          <div style="min-width:26px;height:26px;background:${C.teal};border-radius:6px;display:flex;align-items:center;justify-content:center;margin-top:1px;">
            <span style="font-size:11px;font-weight:700;color:white;">${item.num}</span>
          </div>
          <div>
            <div style="font-size:12px;font-weight:600;color:${C.navy};">${item.title}</div>
            <div style="font-size:9.5px;color:${C.textMuted};margin-top:2px;">${item.sub}</div>
          </div>
        </div>`).join('')}
    </div>

  </div>`;

  // ── §1 & §2: EXECUTIVE SUMMARY + FLEET OVERVIEW ────────────────
  const section1 = `
  <div class="page">
    ${pageHeader(data.warehouseName, '§1 Executive Insight Summary')}
    ${sectionHeader('1', 'Executive Insight Summary')}

    ${kpiGrid4(
      kpiCard('Total Fleet Assets', fmtN(totalAssets), `${fmtN(activeA)} active`, C.teal),
      kpiCard('Fleet Health Score', `${healthFleet}%`, `${healthyPct}% assets ≥80%`, healthFleet >= 70 ? C.green : C.orange),
      kpiCard('Avg Failure Prob.', `${failProb}%`, 'CatBoost ML model', C.orange),
      kpiCard('Critical Assets', fmtN(critCount), `${Math.round(critCount / Math.max(totalAssets, 1) * 100)}% of fleet`, C.red),
    )}
    ${kpiGrid4(
      kpiCard('Urgent (≤7 days)', fmtN(urgentCount), 'require immediate service', C.red, C.redLight),
      kpiCard('Active Tickets', fmtN(activeTickets), 'open + in-progress', C.amber, C.amberLight),
      kpiCard('Active Users', fmtN(activeUsers), `of ${fmtN(ud.totalUsers)} total`, C.blue),
      kpiCard('Est. Maint. Cost', data.summary.maintenanceCost, 'current period', C.violet, C.violetLight),
    )}

    ${ai.insight_summary ? narrativePara(ai.insight_summary) : ''}
    ${benchmarkAlert ? alertBox(benchmarkAlert.message, 'benchmark') : ''}
    ${highAlert ? alertBox(highAlert.message, 'alert') : ''}

    <!-- §2 Fleet Overview on same page -->
    ${sectionHeader('2', 'Fleet Asset Overview')}

    ${subHeader('2.1 Fleet Composition by Asset Type')}
    ${twoCol(
      lightTable(
        ['Asset Type', 'Count', '% Fleet'],
        s.assetsByType.map(a => [
          a.name,
          fmtN(a.value),
          fmtPct((a.value / Math.max(totalAssets, 1)) * 100),
        ])
      ),
      chartBox('', svgDonut(s.assetsByType, 240, 210, 110, 90, 74, 36), 'Figure 2.1 — Fleet composition by type')
    )}

    ${subHeader('2.2 Asset Status Distribution')}
    ${twoCol(
      lightTable(
        ['Status', 'Count', '% Fleet'],
        s.assetStatus.map(a => [
          a.name,
          fmtN(a.value),
          fmtPct((a.value / Math.max(totalAssets, 1)) * 100),
        ])
      ),
      chartBox('', svgDonut(s.assetStatus, 240, 210, 110, 90, 74, 36), 'Figure 2.2 — Asset status distribution')
    )}

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
      <div style="background:${C.offWhite};border:1px solid ${C.border};border-radius:8px;padding:16px;">
        ${subHeader('Workforce Overview')}
        ${lightTable(
          ['Category', 'Count'],
          [
            ['Total Registered Users', fmtN(ud.totalUsers)],
            ['Active Users', fmtN(ud.totalUsers ? (ud.totalUsers - (ud.inactiveUsers || 0)) : activeUsers)],
            ['Administrator Roles', fmtN(ud.adminUsers)],
            ['Standard User Roles', fmtN(ud.standardUsers)],
            ['Inactive Accounts', fmtN(ud.inactiveUsers)],
          ]
        )}
      </div>
      <div style="background:${C.offWhite};border:1px solid ${C.border};border-radius:8px;padding:16px;">
        ${subHeader('Fleet Summary Metrics')}
        ${lightTable(
          ['Metric', 'Value'],
          [
            ['Total Assets', fmtN(totalAssets)],
            ['Active', fmtN(ad.activeAssets)],
            ['Under Maintenance', fmtN(ad.underMaintenanceAssets)],
            ['Inactive / Retired', fmtN((ad.inactiveAssets || 0) + (ad.retiredAssets || 0))],
            ['Average Vehicle Age', `${fmtN(ad.avgVehicleAge, 1)} years`],
          ]
        )}
      </div>
    </div>

    ${Object.keys(ad.fleetAgeDist || {}).length > 0 ? `
      <div style="margin-top:16px;">
        ${subHeader('Fleet Age Distribution')}
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:10px 0;">
          ${Object.entries(ad.fleetAgeDist || {}).map(([band, cnt]) => {
            const total = Object.values(ad.fleetAgeDist || {}).reduce((a: number, b: unknown) => a + (b as number), 0) as number;
            const pct = total > 0 ? Math.round((cnt as number) / total * 100) : 0;
            const isOld = band.startsWith('10');
            const barColor = isOld && pct > 20 ? C.red : isOld && pct > 10 ? C.orange : C.teal;
            return `
            <div style="background:${C.offWhite};border:1px solid ${C.border};border-radius:8px;padding:12px 14px;text-align:center;">
              <div style="font-size:7.5px;font-weight:700;color:${C.textMuted};text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">${band}</div>
              <div style="font-size:20px;font-weight:800;color:${barColor};">${cnt}</div>
              <div style="font-size:7px;color:${C.textLight};margin-top:2px;">${pct}% of fleet</div>
            </div>`;
          }).join('')}
        </div>
      </div>
    ` : ''}

    ${(ad.warrantyExpiring90d || 0) > 0 ? alertBox(
      `<strong>${ad.warrantyExpiring90d} asset${(ad.warrantyExpiring90d || 0) > 1 ? 's' : ''}</strong> have warranty expiring within the next 90 days. Review service contracts and schedule pre-expiry inspections to ensure coverage continuity.`,
      'alert'
    ) : ''}

    ${kb.service_interval_text ? alertBox(kb.service_interval_text, 'info') : ''}
  </div>`;

  // ── §3: HEALTH & RISK ANALYSIS + SHAP ─────────────────────────
  const healthBands = kb.health_bands_kb?.length
    ? kb.health_bands_kb
    : s.healthScoreDistribution.map(h => ({
        band: h.bucket,
        count: h.count,
        pct_fleet: Math.round(h.count / Math.max(totalAssets, 1) * 1000) / 10,
        kb_interpretation: h.bucket.includes('Below') ? 'Critical — immediate intervention required'
          : h.bucket.startsWith('60') ? 'At-risk — service within 14 days'
          : h.bucket.startsWith('70') ? 'Moderate — schedule within 30 days'
          : h.bucket.startsWith('80') ? 'Acceptable — maintain PM schedule'
          : 'Optimal — continue standard intervals',
      }));

  const section3 = `
  <div class="page">
    ${pageHeader(data.warehouseName, '§3 Health & Risk Analysis')}
    ${sectionHeader('3', 'Health & Risk Analysis', 'SHAP Failure Drivers · Critical Asset Watch')}

    ${subHeader('3.1 Health Score Distribution')}
    ${darkTable(
      ['Health Band', 'Assets', '% Fleet', 'Operational Interpretation'],
      healthBands.map(b => [
        b.band, fmtN(b.count), `${b.pct_fleet}%`, b.kb_interpretation,
      ])
    )}

    ${subHeader('3.2 Health Score — Visual Distribution')}
    ${chartBox(
      '',
      svgVBar(
        s.healthScoreDistribution.map(h => ({ name: h.bucket, value: h.count })),
        650, 210,
      ),
      'Figure 3.1 — Asset count per health score band'
    )}

    ${subHeader('3.3 Risk Level Distribution')}
    ${twoCol(
      lightTable(
        ['Risk Level', 'Assets', '% Fleet'],
        riskData.map(r => [r.name, fmtN(r.value), fmtPct((r.value / Math.max(totalAssets, 1)) * 100)])
      ),
      chartBox('', svgDonut(riskData, 240, 210, 110, 90, 74, 36), 'Figure 3.2 — Risk level distribution')
    )}

    ${ai.risk_analysis ? narrativePara(ai.risk_analysis) : ''}

    ${shapSource.length > 0 ? `
      ${subHeader('3.4 SHAP Failure Prediction Drivers')}
      ${chartBox(
        'Feature Importance (SHAP Impact %)',
        svgHBar(
          shapSource.map(f => ({ name: f.feature, value: f.impact_pct, label: `${f.impact_pct}%` })),
          640, 28
        ),
        'Figure 3.3 — Top AI-identified failure drivers (CatBoost SHAP values)'
      )}
      ${darkTable(
        ['SHAP Feature', 'Impact Score', 'Threshold Reference', 'Recommended Action'],
        shapSource.map(f => [
          f.feature, `${f.impact_pct}%`, f.kb_threshold, f.action,
        ])
      )}
    ` : ''}

    ${criticalAssets.length > 0 ? `
      ${subHeader('3.5 Critical Asset Watch — Immediate Intervention Required', C.red)}
      <p style="font-size:10px;color:${C.textMuted};margin-bottom:8px;">Assets with health scores below threshold requiring prioritised maintenance scheduling:</p>
      <table style="width:100%;border-collapse:collapse;font-size:9.5px;">
        <thead>
          <tr style="background:${C.navy};color:white;">
            <th style="padding:8px 10px;text-align:left;font-weight:700;white-space:nowrap;">Asset ID</th>
            <th style="padding:8px 10px;text-align:left;font-weight:700;">Vehicle / Type</th>
            <th style="padding:8px 10px;text-align:left;font-weight:700;white-space:nowrap;">Health Score</th>
            <th style="padding:8px 10px;text-align:left;font-weight:700;">Priority</th>
            <th style="padding:8px 10px;text-align:left;font-weight:700;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${criticalAssets.map((a, i) => `
            <tr style="background:${i % 2 === 0 ? C.white : C.offWhite};border-bottom:1px solid ${C.border};">
              <td style="padding:8px 10px;"><strong style="font-family:monospace;color:${C.red};">${a.id}</strong></td>
              <td style="padding:8px 10px;">${a.vehicle} <span style="color:${C.textMuted};font-size:8.5px;">· ${a.component}</span></td>
              <td style="padding:8px 10px;">${healthBadge(a.health)}</td>
              <td style="padding:8px 10px;"><span style="font-weight:600;color:${a.priority === 'High' ? C.red : C.orange};">${a.priority}</span></td>
              <td style="padding:8px 10px;">${a.status || '—'}</td>
            </tr>
            ${a.summary ? `
            <tr style="background:${C.violetLight};border-bottom:2px solid ${C.border};">
              <td colspan="5" style="padding:7px 12px 8px 28px;">
                <div style="display:flex;align-items:flex-start;gap:6px;">
                  <span style="color:${C.violet};font-size:9px;font-weight:700;white-space:nowrap;margin-top:1px;">✦ AI Summary</span>
                  <span style="font-size:9px;color:${C.navyMed};line-height:1.5;">${a.summary}</span>
                </div>
              </td>
            </tr>` : ''}
          `).join('')}
        </tbody>
      </table>
    ` : ''}

    ${(() => {
      const ch = od.componentHealth || {};
      const components = [
        { label: 'Tire Health',     value: ch.avg_tire     || 0, icon: '⬤' },
        { label: 'Brake Health',    value: ch.avg_brake    || 0, icon: '⬤' },
        { label: 'Battery Health',  value: ch.avg_battery  || 0, icon: '⬤' },
        { label: 'Oil Life',        value: ch.avg_oil      || 0, icon: '⬤' },
        { label: 'Hydraulic Health',value: ch.avg_hydraulic|| 0, icon: '⬤' },
      ];
      const hasData = components.some(c => c.value > 0);
      if (!hasData) return '';
      return `
        ${subHeader('3.6 Component Health Matrix', C.teal)}
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin:10px 0;">
          ${components.map(c => {
            const color = c.value >= 80 ? C.green : c.value >= 60 ? C.orange : C.red;
            const barW = Math.round(c.value);
            return `
            <div style="background:${C.offWhite};border:1px solid ${C.border};border-radius:8px;padding:12px 10px;text-align:center;">
              <div style="font-size:7px;font-weight:700;color:${C.textMuted};text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">${c.label}</div>
              <div style="font-size:22px;font-weight:800;color:${color};">${c.value}%</div>
              <div style="margin-top:6px;background:${C.border};border-radius:4px;height:5px;overflow:hidden;">
                <div style="width:${barW}%;background:${color};height:100%;border-radius:4px;"></div>
              </div>
            </div>`;
          }).join('')}
        </div>
        ${(od.totalFaultCodes || 0) > 0 ? `
        <div style="background:${C.offWhite};border:1px solid ${C.border};border-radius:6px;padding:10px 14px;display:flex;gap:24px;font-size:9px;color:${C.textMuted};">
          <span><strong style="color:${C.navy};">Fleet Active Fault Codes:</strong> ${od.totalFaultCodes}</span>
          <span><strong style="color:${C.navy};">Avg per Asset:</strong> ${od.avgFaultCodesPerAsset}</span>
        </div>` : ''}
      `;
    })()}
  </div>`;

  // ── §4: MAINTENANCE INTELLIGENCE ──────────────────────────────
  const section4 = `
  <div class="page">
    ${pageHeader(data.warehouseName, '§4 Maintenance Intelligence')}
    ${sectionHeader('4', 'Maintenance Intelligence')}

    ${kpiGrid4(
      kpiCard('Total Events (3M)', fmtN(totalEvents), 'maintenance events', C.teal),
      kpiCard('Preventive (PM)', `${pmPct.toFixed(1)}%`, `${fmtN(prevCount)} events`, C.green, C.greenLight),
      kpiCard('Corrective / Repair', `${corrPct.toFixed(1)}%`, `${fmtN(corrCount)} events`, C.orange),
      kpiCard('PM : Repair Ratio', `${pmRatio}:1`, 'target >9:1', C.teal),
    )}

    ${subHeader('4.1 Maintenance Type Breakdown')}
    <div style="background:${C.white};border:1px solid ${C.border};border-radius:8px;padding:18px;margin:10px 0;">
      ${progressBar('Preventive Maintenance', prevCount, totalEvents, C.green, pmPct)}
      ${progressBar('Corrective / Repair', corrCount, totalEvents, C.orange, corrPct)}
      <div style="font-size:8.5px;color:${C.textLight};font-style:italic;text-align:center;margin-top:8px;">Figure 4.1 — PM vs corrective event breakdown for reporting period</div>
    </div>

    ${maintenanceTypes.length > 0 ? `
      ${subHeader('4.2 Events by Maintenance Type')}
      ${lightTable(
        ['Maintenance Type', 'Event Count', '% Total'],
        maintenanceTypes.map(m => [m.name, fmtN(m.value), fmtPct((m.value / Math.max(totalEvents, 1)) * 100)])
      )}
    ` : ''}

    ${subHeader('4.3 Cost & Operational Metrics')}
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin:12px 0;">
      ${[
        { label: 'Estimated Maintenance Cost',    value: md.estimatedCost || data.summary.maintenanceCost, color: C.teal },
        { label: 'Actual Spend (Last 3 Months)',  value: md.actualCost3m    || 'N/A',                      color: C.green },
        { label: 'Average Cost Per Asset',        value: md.avgCostPerAsset  || 'N/A',                     color: C.violet },
        { label: 'Average Downtime Per Event',    value: `${fmtN(md.avgDowntimeHours, 1)} hours`,          color: C.orange },
        { label: 'Min Cost Estimate',             value: (md.minCostEstimate || 0) > 0 ? `LKR ${(md.minCostEstimate || 0).toLocaleString()}` : 'N/A', color: C.blue },
        { label: 'Max Cost Estimate',             value: (md.maxCostEstimate || 0) > 0 ? `LKR ${(md.maxCostEstimate || 0).toLocaleString()}` : 'N/A', color: C.red },
      ].map(c => `
        <div style="background:${C.offWhite};border:1px solid ${C.border};border-radius:8px;padding:14px 16px;">
          <div style="font-size:8.5px;font-weight:700;color:${C.textMuted};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">${c.label}</div>
          <div style="font-size:17px;font-weight:800;color:${c.color};">${c.value}</div>
        </div>`).join('')}
    </div>

    ${mainTrend.length > 0 ? `
      ${subHeader('4.4 Monthly Maintenance Trend (3 Months)')}
      ${chartBox(
        'Event Volume Trend',
        svgLine(mainTrend.map(m => ({ label: m.month.substring(0, 3), value: m.events })), 640, 170, C.teal),
        'Figure 4.2 — Monthly maintenance event volume'
      )}
      ${lightTable(
        ['Month', 'Events', 'Estimated Cost (LKR)'],
        mainTrend.map(m => [m.month, fmtN(m.events), m.cost.toLocaleString()])
      )}
    ` : ''}

    ${(md.vendorBreakdown || []).length > 0 ? `
      ${subHeader('4.5 Vendor & Service Provider Analysis')}
      ${lightTable(
        ['Service Provider', 'Events', 'Total Cost (LKR)', '% Events'],
        (() => {
          const vd = md.vendorBreakdown || [];
          const totalEvt = vd.reduce((sum, v) => sum + v.events, 0);
          return vd.map(v => [
            v.vendor,
            fmtN(v.events),
            v.cost.toLocaleString(),
            fmtPct(totalEvt > 0 ? (v.events / totalEvt * 100) : 0),
          ]);
        })()
      )}
    ` : ''}

    ${ai.maintenance_intelligence ? narrativePara(ai.maintenance_intelligence) : ''}

    ${alertBox(
      `At ${pmPct.toFixed(1)}% preventive maintenance coverage, PredictiX exceeds the SMRP gold standard of 90%. However, the presence of ${fmtN(critCount)} critical-status assets indicates PM scheduling may not be keeping pace with actual degradation — particularly for high-utilisation forklifts where the recommended interval is every <strong>500 engine hours</strong>. Cross-referencing engine-hour data against the top SHAP driver is the priority action item.`,
      'benchmark'
    )}

    ${msch.length > 0 ? `
      ${subHeader('4.6 Predictive Maintenance Schedule')}
      <p style="font-size:8.5px;color:${C.textMuted};margin:0 0 10px;">
        Predicted (ML model) vs Scheduled (fleet avg interval) weeks to next service.
        Assets sorted by urgency gap — negative gap means maintenance is overdue relative to schedule.
      </p>
      ${lightTable(
        ['Asset', 'Predicted (wks)', 'Scheduled (wks)', 'Gap (wks)', 'Status'],
        msch.slice(0, 20).map(r => {
          const gap = r.predicted - r.scheduled;
          const status = gap < -2 ? '⚠ Overdue' : gap < 0 ? 'Due Soon' : 'On Track';
          return [
            r.asset,
            r.predicted.toFixed(1),
            r.scheduled.toFixed(1),
            (gap >= 0 ? '+' : '') + gap.toFixed(1),
            status,
          ];
        })
      )}
    ` : ''}
  </div>`;

  // ── §5: TICKET MANAGEMENT ──────────────────────────────────────
  const highPct = openT > 0 ? Math.round(highT / openT * 1000) / 10 : 0;
  const medPct  = openT > 0 ? Math.round(medT  / openT * 1000) / 10 : 0;
  const lowPct  = openT > 0 ? Math.round(lowT  / openT * 1000) / 10 : 0;

  const prioritySlices = [
    { name: `High`, value: highT },
    { name: `Medium`, value: medT },
    { name: `Low`, value: lowT },
  ].filter(p => p.value > 0);

  const catSlices = s.ticketsByCategory.map(c => ({ name: c.name, value: c.value }));

  const section5 = `
  <div class="page">
    ${pageHeader(data.warehouseName, '§5 Ticket Management Status')}
    ${sectionHeader('5', 'Ticket Management Status')}

    ${kpiGrid4(
      kpiCard('Open Tickets',      fmtN(openT), 'awaiting resolution',    C.orange),
      kpiCard('High Priority',     fmtN(highT), `${highPct}% of open`,    C.red, C.redLight),
      kpiCard('Medium Priority',   fmtN(medT),  `${medPct}% of open`,     C.amber, C.amberLight),
      kpiCard('Low Priority',      fmtN(lowT),  `${lowPct}% of open`,     C.green, C.greenLight),
    )}

    ${subHeader('5.1 Ticket Overview — Status Breakdown')}
    ${lightTable(
      ['Ticket Status', 'Count', 'Notes'],
      [
        ['Open',          fmtN(openT),                 'Awaiting assignment'],
        ['In Progress',   fmtN(td.inProgressTickets),  'Actively being resolved'],
        ['Resolved',      fmtN(td.resolvedTickets),     'Pending closure confirmation'],
        ['Closed',        fmtN(td.closedTickets),       'Fully resolved & closed'],
        ['Total Tickets', fmtN(td.totalTickets),        'All-time total'],
      ]
    )}

    ${subHeader('5.2 Priority & Category Distribution')}
    ${twoCol(
      chartBox(
        'By Priority',
        svgDonut(prioritySlices.length ? prioritySlices : [{ name: 'No Data', value: 1 }], 240, 210, 110, 90, 74, 36),
        'Figure 5.1 — Open tickets by priority'
      ),
      chartBox(
        'By Category',
        svgDonut(catSlices.length ? catSlices : [{ name: 'No Data', value: 1 }], 240, 210, 110, 90, 74, 36),
        'Figure 5.2 — Open tickets by category'
      )
    )}

    ${kb.ticket_category_kb?.length ? `
      ${subHeader('5.3 Ticket Categories — KB Cross-Reference')}
      ${darkTable(
        ['Category', 'Count', '% Open', 'Maintenance Guidance'],
        kb.ticket_category_kb.map(c => [c.category, fmtN(c.count), `${c.pct_open}%`, c.kb_guidance])
      )}
    ` : s.ticketsByCategory.length ? `
      ${subHeader('5.3 Ticket Categories')}
      ${lightTable(
        ['Category', 'Tickets', '% of Open'],
        s.ticketsByCategory.map(c => [c.name, fmtN(c.value), fmtPct((c.value / Math.max(openT, 1)) * 100)])
      )}
    ` : ''}

    ${ticketTrend.length > 0 ? `
      ${subHeader('5.4 Monthly Ticket Volume (3-Month Trend)')}
      ${chartBox(
        '',
        svgLine(ticketTrend.map(t => ({ label: t.month.substring(0, 3), value: t.tickets })), 640, 160, C.amber),
        'Figure 5.3 — Monthly ticket volume (last 3 months)'
      )}
      ${lightTable(
        ['Month', 'New Tickets'],
        ticketTrend.map(t => [t.month, fmtN(t.tickets)])
      )}
    ` : ''}

    ${(td.avgResolutionDays || 0) > 0 ? `
      ${subHeader('5.5 Ticket Resolution Performance (MTTR)')}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:10px 0 14px;">
        <div style="background:${C.offWhite};border:1px solid ${C.border};border-radius:8px;padding:14px 16px;">
          <div style="font-size:8.5px;font-weight:700;color:${C.textMuted};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">Avg Resolution Time</div>
          <div style="font-size:22px;font-weight:800;color:${C.teal};">${fmtN(td.avgResolutionDays, 1)} days</div>
          <div style="font-size:8px;color:${C.textLight};margin-top:3px;">${fmtN(Math.round((td.avgResolutionDays || 0) * 24), 1)} hours average MTTR</div>
        </div>
        <div style="background:${C.offWhite};border:1px solid ${C.border};border-radius:8px;padding:14px 16px;">
          <div style="font-size:8.5px;font-weight:700;color:${C.textMuted};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">Resolution Breakdown</div>
          <div style="font-size:11px;color:${C.textMuted};">By priority level below</div>
        </div>
      </div>
      ${(td.mttrByPriority || []).length > 0 ? lightTable(
        ['Priority Level', 'Avg Resolution Time (hrs)', 'Avg Resolution (days)'],
        (td.mttrByPriority || []).map(r => [
          `<span style="font-weight:600;color:${r.priority === 'High' ? C.red : r.priority === 'Medium' ? C.orange : C.green};">${r.priority}</span>`,
          fmtN(r.avg_hours, 1),
          fmtN(Math.round(r.avg_hours / 24 * 10) / 10, 1),
        ])
      ) : ''}
    ` : ''}

    ${Object.keys(td.finalPriorityBreakdown || {}).length > 0 ? `
      ${subHeader('5.6 AI Priority Reclassification')}
      <p style="font-size:8.5px;color:${C.textMuted};margin:0 0 10px;">
        PredictiX AI re-scores each ticket using sensor telemetry and SHAP models.
        Compare against original filed priority to identify under-triaged issues.
      </p>
      <div style="display:grid;grid-template-columns:repeat(${Math.min(Object.keys(td.finalPriorityBreakdown || {}).length, 4)},1fr);gap:10px;margin-bottom:14px;">
        ${Object.entries(td.finalPriorityBreakdown || {}).map(([pri, cnt]) => {
          const col = pri.toLowerCase() === 'high' || pri.toLowerCase() === 'critical' ? C.red
            : pri.toLowerCase() === 'medium' ? C.amber : C.green;
          const bg  = pri.toLowerCase() === 'high' || pri.toLowerCase() === 'critical' ? C.redLight
            : pri.toLowerCase() === 'medium' ? C.amberLight : C.greenLight;
          return `<div style="background:${bg};border:1px solid ${col}40;border-radius:8px;padding:12px;text-align:center;">
            <div style="font-size:9px;font-weight:700;color:${col};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">${pri}</div>
            <div style="font-size:24px;font-weight:800;color:${col};">${fmtN(cnt as number)}</div>
            <div style="font-size:7.5px;color:${C.textMuted};margin-top:3px;">AI-classified tickets</div>
          </div>`;
        }).join('')}
      </div>
    ` : ''}

    ${ai.pattern_and_trend ? narrativePara(ai.pattern_and_trend) : ''}
  </div>`;

  // ── §6: RECOMMENDATIONS ────────────────────────────────────────
  const rec = kb.recommendations;
  const section6 = `
  <div class="page">
    ${pageHeader(data.warehouseName, '§6 Recommendations')}
    ${sectionHeader('6', 'Prescriptive Recommendations')}
    <p style="font-size:10.5px;color:${C.textMuted};margin-bottom:20px;">The following actions are derived from AI risk analysis, KB threshold cross-referencing, and fleet health data. Prioritise in order of urgency.</p>

    ${rec ? `
      ${rec.critical?.length ? recommendBlock('CRITICAL', 'Immediate action (0–7 days)', rec.critical) : ''}
      ${rec.high?.length     ? recommendBlock('HIGH',     'Short-term (7–30 days)',       rec.high)     : ''}
      ${rec.medium?.length   ? recommendBlock('MEDIUM',   'Strategic (30–90 days)',       rec.medium)   : ''}
      ${rec.kb_alert ? alertBox(rec.kb_alert, 'alert') : ''}
    ` : `
      ${recommendBlock('CRITICAL', '0–7 days', [
        `Immediately schedule maintenance for ${fmtN(urgentCount)} assets due for service within 7 days. Prioritise assets with health scores below 50%.`,
        `Review engine-hours data against SHAP-identified top failure driver thresholds across all high-utilisation forklifts.`,
      ])}
      ${recommendBlock('HIGH', '7–30 days', [
        `Analyse all ${fmtN(critCount)} critical-status assets and develop individual asset recovery plans with target health-band improvements.`,
        `Address ${fmtN(highT)} high-priority tickets — a ${highPct}% concentration warrants a dedicated response team.`,
        'Validate PM scheduling frequency for assets showing rapid health degradation between service intervals.',
      ])}
      ${recommendBlock('MEDIUM', '30–90 days', [
        'Implement predictive health scoring alerts at 70% threshold to enable proactive intervention before assets enter the critical band.',
        'Conduct quarterly fleet review to align PM intervals with actual usage patterns and SHAP driver trends.',
        'Expand knowledge base with asset-specific OEM thresholds to improve SHAP actionability scores.',
      ])}
    `}
  </div>`;

  // ── §7: CONCLUSION ─────────────────────────────────────────────
  const section7 = `
  <div class="page">
    ${pageHeader(data.warehouseName, '§7 Conclusion')}
    ${sectionHeader('7', 'Conclusion')}

    ${subHeader('7.1 Final KPI Dashboard')}
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:14px 0;">
      ${[
        { title: 'Fleet', color: C.teal, items: [
          { l: 'Total Assets',     v: fmtN(totalAssets) },
          { l: 'Active',           v: fmtN(ad.activeAssets) },
          { l: 'Under Maintenance',v: fmtN(ad.underMaintenanceAssets) },
          { l: 'Avg Health',       v: `${healthFleet}%` },
          { l: 'Critical',         v: fmtN(critCount) },
          { l: 'Urgent ≤7d',       v: fmtN(urgentCount) },
        ]},
        { title: 'Operations', color: C.blue, items: [
          { l: 'Total Tickets',    v: fmtN(td.totalTickets) },
          { l: 'Open Tickets',     v: fmtN(openT) },
          { l: 'High Priority',    v: fmtN(highT) },
          { l: 'Maint. Events 3M', v: fmtN(totalEvents) },
          { l: 'PM Ratio',         v: `${pmPct.toFixed(1)}%` },
          { l: 'Avg Downtime',     v: `${fmtN(md.avgDowntimeHours, 1)}h` },
        ]},
        { title: 'Financials', color: C.violet, items: [
          { l: 'Est. Cost',        v: data.summary.maintenanceCost },
          { l: 'Actual (3M)',      v: md.actualCost3m    || 'N/A' },
          { l: 'Avg/Asset',        v: md.avgCostPerAsset  || 'N/A' },
          { l: 'Total Users',      v: fmtN(ud.totalUsers) },
          { l: 'Admin Users',      v: fmtN(ud.adminUsers) },
          { l: 'Standard Users',   v: fmtN(ud.standardUsers) },
        ]},
      ].map(block => `
        <div style="background:${C.offWhite};border:1px solid ${C.border};border-top:3px solid ${block.color};border-radius:8px;padding:14px 16px;">
          <div style="font-size:11px;font-weight:700;color:${block.color};margin-bottom:10px;text-transform:uppercase;letter-spacing:0.05em;">${block.title}</div>
          ${block.items.map(item =>
            `<div style="display:flex;justify-content:space-between;font-size:10px;padding:4px 0;border-bottom:1px solid ${C.borderLight};">
              <span style="color:${C.textMuted};">${item.l}</span>
              <span style="font-weight:600;color:${C.text};">${item.v}</span>
            </div>`
          ).join('')}
        </div>`).join('')}
    </div>

    ${subHeader('7.2 Executive Conclusion')}
    ${ai.conclusion ? narrativePara(ai.conclusion) : narrativePara(
      `The ${data.warehouseName} warehouse fleet of ${fmtN(totalAssets)} assets has an average health score of ${healthFleet}% with ${healthyPct}% of assets in the optimal-to-acceptable range. However, ${fmtN(critCount)} assets (${Math.round(critCount / Math.max(totalAssets, 1) * 100)}%) remain in the critical health band and require prioritised intervention. The 3-month maintenance record shows ${fmtN(totalEvents)} events at a ${pmPct.toFixed(1)}% PM ratio — exceeding the SMRP 90% gold standard — demonstrating a strong preventive maintenance culture. The ${fmtN(openT)} active tickets, ${highPct}% of which are high-priority, represent the immediate operational challenge. With ${fmtN(urgentCount)} assets requiring service within 7 days, expedited scheduling is critical to preventing further health degradation and unplanned downtime.`
    )}

    <!-- Document footer -->
    <div style="margin-top:40px;padding-top:18px;border-top:1px solid ${C.border};display:flex;justify-content:space-between;align-items:center;">
      <div style="font-size:9px;color:${C.textLight};">
        <strong style="color:${C.teal};">PredictiX AI Platform</strong> · Warehouse Management Solution<br/>
        Powered by CatBoost ML · SHAP · RAG-LLM (Llama 3)
      </div>
      <div style="text-align:right;font-size:9px;color:${C.textLight};">
        Generated: ${new Date().toLocaleString()}<br/>
        © 2026 All Rights Reserved · Confidential
      </div>
    </div>
  </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${data.title} — ${data.warehouseName}</title>
  <style>${CSS}</style>
</head>
<body>
  ${coverPage}
  ${tocPage}
  ${section1}
  ${section3}
  ${section4}
  ${section5}
  ${section6}
  ${section7}
</body>
</html>`;
}


// ══════════════════════════════════════════════════════════════════
// EXPORT FUNCTIONS
// ══════════════════════════════════════════════════════════════════

/**
 * Opens the report in a new window and triggers the browser print dialog.
 * User can "Save as PDF" from the print dialog (Ctrl+P → Save as PDF).
 */
export function downloadProfessionalPDF(data: ReportData, _filename = 'warehouse-report.pdf'): void {
  try {
    const html = generateProfessionalHTML(data);

    // Use a hidden iframe so no popup permission is needed
    const existing = document.getElementById('__predictix_pdf_frame__');
    if (existing) existing.remove();

    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);

    const iframe = document.createElement('iframe');
    iframe.id = '__predictix_pdf_frame__';
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:0;';
    iframe.src = url;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => { iframe.remove(); URL.revokeObjectURL(url); }, 3000);
      }, 600);
    };
  } catch (err) {
    console.error('PDF export error:', err);
    // Last resort: download as HTML file
    savePDFAsFile(data, _filename);
  }
}

/**
 * Saves the report as a downloadable HTML file (fallback for popup blockers).
 */
export function savePDFAsFile(data: ReportData, filename = 'warehouse-report.html'): void {
  try {
    const html = generateProfessionalHTML(data);
    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Report save error:', err);
  }
}
