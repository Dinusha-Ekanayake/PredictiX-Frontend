/**
 * KB-Enhanced Professional PDF Export - PredictiX Warehouse Report
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

import { HEALTH_GOOD } from "@/lib/healthBands";

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
  // ── Enhanced KB tables (statutory / OEM / FMEA / climate) ──
  oem_intervals?: Array<{
    asset_class: string;
    source: string;
    tiers: Array<{ cadence: string; trigger: string; scope: string }>;
  }>;
  statutory_compliance?: Array<{
    equipment: string;
    interval_months: number;
    by: string;
    record: string;
    reference: string;
  }>;
  fmea_criticality?: Array<{
    code: string;
    name: string;
    type: string;
    health: string;
    severity: number;
    occurrence: number;
    criticality: number;
    band: string;
    rationale: string;
  }>;
  climate_risk?: Array<{
    driver: string;
    metric: string;
    action: string;
  }>;
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
    eventTrendDirection?: string;
    costTrendDirection?: string;
    dataConcentrated?: boolean;
    reportingPeriod?: string;
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
    monitoredAssets?: number;
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
  // FRSO survival analysis (Weibull AFT) aggregated over critical assets - §4.8
  survival?: {
    assets_analyzed: number;
    horizon_days: number;
    currency?: string;
    expected_spend_7d?: number;
    expected_spend_30d?: number;
    component_summary: Array<{
      component: string; avg_rul_days: number | null;
      avg_fail_prob_7d?: number; avg_fail_prob_30d?: number;
      expected_failures_7d?: number; expected_failures_30d?: number;
      at_risk_7d: number; at_risk_30d: number; assets_scored: number;
    }>;
    watchlist: Array<{ asset: string; component: string; rul_days: number | null; risk: string }>;
  } | null;
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

// Round a number to a "nice" 1/2/5 × 10^n value - used for chart axis steps so
// gridline labels are round (e.g. 100/200/300) rather than auto-scaled (125/251/376).
function niceNum(x: number, round: boolean): number {
  if (x <= 0) return 1;
  const exp = Math.floor(Math.log10(x));
  const f = x / Math.pow(10, exp);
  let nf: number;
  if (round) nf = f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10;
  else nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return nf * Math.pow(10, exp);
}

// Integer percentages that sum to exactly 100 (largest-remainder method) - avoids
// donut slice labels summing to 100.8%.
function pctsTo100(values: number[]): number[] {
  const total = values.reduce((a, b) => a + (b || 0), 0);
  if (total <= 0) return values.map(() => 0);
  const raw = values.map(v => (v || 0) / total * 100);
  const floored = raw.map(Math.floor);
  let remainder = 100 - floored.reduce((a, b) => a + b, 0);
  const order = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);
  for (let k = 0; k < remainder && k < order.length; k++) floored[order[k].i]++;
  return floored;
}


// ══════════════════════════════════════════════════════════════════
// SVG CHART GENERATORS
// ══════════════════════════════════════════════════════════════════

function svgDonut(
  slices: Array<{ name: string; value: number }>,
  w = 220, h = 200, cx = 105, cy = 88, r = 68, innerR = 34
): string {
  const total = slices.reduce((s, d) => s + (d.value || 0), 0);
  if (!total) return `<svg width="${w}" height="${h}"><text x="${cx}" y="${cy}" text-anchor="middle" fill="${C.slateMid}" font-size="10">No data</text></svg>`;

  // Integer label percentages that sum to exactly 100 (largest-remainder).
  const labelPcts = pctsTo100(slices.map(s => s.value || 0));

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
    const label = pct >= 0.07 ? `${labelPcts[i]}%` : '';
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
  const dataMax = Math.max(...bars.map(b => b.value || 0), 1);
  const chartH = h - 52;
  const bw = Math.max(Math.floor((w - 70) / bars.length) - 8, 12);
  const gap = Math.floor((w - 70) / bars.length);

  // Round axis: pick a nice step (~4 divisions) and round the top up to a multiple
  // of it, so gridline labels are round numbers and bars scale to the same max.
  const step = niceNum(dataMax / 4, true) || 1;
  const maxVal = Math.max(step * Math.ceil(dataMax / step), step);
  const ticks: number[] = [];
  for (let v = step; v <= maxVal + step * 0.001; v += step) ticks.push(v);

  const gridLines = ticks.map(v => {
    const y = 10 + chartH - chartH * (v / maxVal);
    return `<line x1="44" y1="${y}" x2="${w - 10}" y2="${y}" stroke="${C.borderLight}" stroke-width="1"/>
            <text x="40" y="${y + 3.5}" text-anchor="end" font-size="7" fill="${C.textLight}">${v.toLocaleString()}</text>`;
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
  const dataMax = Math.max(...points.map(p => p.value), 1);
  const chartH = h - 40;
  const chartW = w - 60;
  const step = chartW / Math.max(points.length - 1, 1);

  // Round y-axis: scale to a nice max so gridlines/labels are round numbers.
  const yStep = niceNum(dataMax / 4, true) || 1;
  const maxVal = Math.max(yStep * Math.ceil(dataMax / yStep), yStep);
  const yTicks: number[] = [];
  for (let v = 0; v <= maxVal + yStep * 0.001; v += yStep) yTicks.push(v);
  const gridLines = yTicks.map(v => {
    const gy = 10 + chartH - chartH * (v / maxVal);
    return `<line x1="38" y1="${gy}" x2="${w - 10}" y2="${gy}" stroke="${C.borderLight}" stroke-width="1"/>
            <text x="34" y="${gy + 3}" text-anchor="end" font-size="7" fill="${C.textLight}">${v.toLocaleString()}</text>`;
  }).join('');

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
    ${gridLines}
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
  return `<h2 style="font-size:12.5px;font-weight:700;color:${color};margin:12px 0 8px;display:flex;align-items:center;gap:6px;">${text}</h2>`;
}

function kpiCard(label: string, value: string | number, sub?: string, color = C.teal, bgColor = C.offWhite): string {
  return `<div style="background:${bgColor};border:1px solid ${C.border};border-top:3px solid ${color};border-radius:6px;padding:14px 16px;min-width:110px;">
    <div style="font-size:8.5px;font-weight:700;color:${C.textMuted};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">${label}</div>
    <div style="font-size:22px;font-weight:800;color:${color};line-height:1;margin-bottom:4px;">${value}</div>
    ${sub ? `<div style="font-size:9px;color:${C.textLight};">${sub}</div>` : ''}
  </div>`;
}

function kpiGrid4(...cards: string[]): string {
  return `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:0 0 16px 0;">${cards.join('')}</div>`;
}


function twoCol(left: string, right: string, split = '1fr 1fr'): string {
  return `<div style="display:grid;grid-template-columns:${split};gap:20px;align-items:start;">${left}${right}</div>`;
}

function narrativePara(text: string): string {
  return `<div style="border-left:3px solid ${C.teal};background:${C.tealBg};padding:12px 18px;margin:0 0 20px 0;border-radius:0 6px 6px 0;">
    <p style="font-size:10.5px;line-height:1.85;color:${C.text};margin:0;">${text}</p>
  </div>`;
}

function alertBox(text: string, type: 'benchmark' | 'alert' | 'advisory' | 'info' = 'benchmark'): string {
  const styles: Record<string, { bg: string; border: string; color: string; label: string }> = {
    benchmark: { bg: C.blueLight, border: C.blue,      color: '#1e3a8a', label: 'Benchmark Context' },
    alert:     { bg: C.red,       border: '#b91c1c',   color: '#ffffff', label: '■ CRITICAL ALERT' },
    advisory:  { bg: C.amberLight, border: C.amber,     color: C.amber,   label: 'Advisory' },
    info:      { bg: C.blueLight, border: C.blue,       color: C.blue,    label: 'Service Reference' },
  };
  const s = styles[type];
  return `<div style="background:${s.bg};border-left:4px solid ${s.border};padding:11px 16px;margin:0 0 16px 0;border-radius:0 6px 6px 0;">
    <span style="font-size:9.5px;font-weight:700;color:${s.color};text-transform:uppercase;letter-spacing:0.04em;">${s.label}:</span>
    <div style="font-size:10.5px;line-height:1.75;color:${s.color};margin:5px 0 0;${type !== 'alert' ? 'font-style:italic;' : 'font-weight:600;'}">${text}</div>
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
    `<th style="background:${C.navy};color:white;padding:7px 11px;text-align:left;font-size:9.5px;font-weight:600;border-right:1px solid ${C.navyLight};">${h}</th>`
  ).join('');
  const trs = rows.map((row, ri) => {
    const bg = ri % 2 === 0 ? C.offWhite : C.white;
    const tds = row.map((cell, ci) => {
      // Only flag genuine danger labels red. (Previously any "% Fleet" value < 50
      // was reddened, which painted even the healthiest bands red - misleading.)
      const isCritCol = typeof cell === 'string' && (cell === 'Critical' || cell === 'High' || cell === 'Ground Now');
      const color = isCritCol ? C.red : C.text;
      const fw = ci === 0 ? '600' : '400';
      return `<td style="padding:7px 11px;font-size:10px;border-bottom:1px solid ${C.border};border-right:1px solid ${C.borderLight};color:${color};font-weight:${fw};">${cell}</td>`;
    }).join('');
    return `<tr style="background:${bg};">${tds}</tr>`;
  }).join('');
  return `<table style="width:100%;border-collapse:collapse;margin:0 0 16px 0;border-radius:6px;overflow:hidden;border:1px solid ${C.border};">
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
  return `<table style="width:100%;border-collapse:collapse;margin:0 0 16px 0;border:1px solid ${C.border};border-radius:6px;overflow:hidden;">
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
    <div style="background:${c.headerBg};color:white;padding:9px 16px;font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">${urgency} PRIORITY - ${days}</div>
    <div style="padding:14px 16px;background:${c.bg};">${bullets}</div>
  </div>`;
}

function chartBox(title: string, svgContent: string, caption?: string): string {
  return `<div style="background:${C.white};border:1px solid ${C.border};border-radius:8px;padding:12px;margin:0 0 16px 0;">
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
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 210mm;
    margin: 0;
    padding: 0;
    background: #f1f5f9;
  }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: ${C.text};
    font-size: 10.5px;
    line-height: 1.55;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page {
    width: 210mm;
    height: 297mm;
    padding: 18mm 16mm 22mm;
    margin: 0 auto 10mm;
    background: white;
    box-shadow: 0 2px 8px rgba(15,23,42,0.08);
    page-break-after: always;
    break-after: page;
    position: relative;
    overflow: hidden;
  }
  .page:last-child { page-break-after: avoid; break-after: auto; }
  .page.cover { padding: 0; }
  .page::before {
    content: '';
    position: absolute;
    inset: 10mm;
    border: 1.2px solid ${C.navy};
    border-radius: 2px;
    pointer-events: none;
    z-index: 0;
  }
  .page::after {
    content: '';
    position: absolute;
    inset: 12mm;
    border: 0.4px solid ${C.teal};
    border-radius: 1px;
    pointer-events: none;
    z-index: 0;
  }
  .page > * { position: relative; z-index: 1; }
  .page.cover::before { inset: 8mm;  border-color: ${C.teal}; border-width: 1.5px; }
  .page.cover::after  { inset: 10mm; border-color: ${C.navy}; border-width: 0.5px; }
  table { width: 100%; border-collapse: collapse; }
  tr, img { page-break-inside: avoid; break-inside: avoid; }
  h1, h2, h3 { page-break-after: avoid; break-after: avoid; }
  @media print {
    html, body { background: white; width: 210mm; }
    .page {
      margin: 0;
      box-shadow: none;
      width: 210mm;
      height: 297mm;
      overflow: hidden;
    }
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
  // All non-preventive events (repair + corrective + any other type), derived from
  // the total so nothing is dropped. Using only the 'corrective' bucket previously
  // hid repair events from the ratio and the KPI card (e.g. 360:1 instead of 360:5).
  const nonPrevCount = Math.max(totalEvents - prevCount, 0);
  const pmPct        = totalEvents > 0 ? (prevCount / totalEvents * 100) : 0.0;
  const corrPct      = totalEvents > 0 ? (nonPrevCount / totalEvents * 100) : 0.0;
  const pmRatio      = nonPrevCount > 0 ? Math.round(prevCount / nonPrevCount) : prevCount;

  const openT  = fmt(td.openTickets);
  // Priority counts come from the all-ticket priority breakdown for ALL three,
  // so the cards, donut and §7 share one consistent population. (Previously
  // "High" used the active-only count while Medium/Low were all-ticket counts,
  // mixing two populations.)
  const _prioMap: Record<string, number> = Object.fromEntries(
    (s.ticketPriority || []).map(p => [String(p.name).toLowerCase(), p.value])
  );
  const highT  = fmt(_prioMap['high'] ?? td.highPriorityTickets);
  const medT   = fmt(_prioMap['medium'] ?? td.mediumPriorityTickets);
  const lowT   = fmt(_prioMap['low'] ?? td.lowPriorityTickets);

  // Assets in the "good" band or better, using the shared cut-off from
  // @/lib/healthBands (which mirrors app/services/health_bands.py).
  //
  // This filter previously required a bucket of >= 80. health_score is the mean
  // of the component health percentages *minus* a failure-probability and
  // urgency penalty, so across the real fleet it peaks at 79 - the "90-100%"
  // and "80-89%" buckets are always empty and this count was always 0. Every
  // warehouse report therefore claimed none of its assets were healthy. At the
  // canonical cut-off the same fleet reports 229 of 850.
  //
  // Buckets are labelled "N-M%" or "Below N%", so parseFloat gives the lower
  // bound and NaN for the "Below" bucket, which drops out of the comparison.
  const healthyAssets  = s.healthScoreDistribution.filter(h => !h.bucket.includes('Below') && parseFloat(h.bucket) >= HEALTH_GOOD).reduce((sum, h) => sum + h.count, 0);
  const degradedAssets = s.healthScoreDistribution.find(h => h.bucket.includes('Below'))?.count || 0;
  const healthyPct     = totalAssets > 0 ? Math.round(healthyAssets / totalAssets * 100) : 0;
  void degradedAssets; // computed for context, not directly rendered

  const benchmarkAlert = kb.benchmark_alerts?.find(a => a.type === 'BENCHMARK');
  const highAlert      = kb.benchmark_alerts?.find(a => a.type === 'HIGH_ALERT');

  // SHAP data: prefer KB enriched, fallback to raw shapFeatures
  const shapSource: Array<{ feature: string; impact_pct: number; kb_threshold: string; action: string }> =
    (kb.shap_enriched?.length
      ? kb.shap_enriched
      : (data.shapFeatures || []).map((f) => ({
          feature: f.feature,
          impact_pct: Math.round((f.importance / Math.max(...(data.shapFeatures || []).map(x => x.importance), 1)) * 100 * 10) / 10,
          kb_threshold: '-',
          action: '-',
        }))).filter((f: any) => !/brake|hydraulic/i.test(f.feature));

  // Maintenance trend (prefer data.trends, fallback to md.monthlyTrend)
  const mainTrend = tr.maintenanceTrend || md.monthlyTrend || [];
  const ticketTrend = tr.ticketTrend || [];

  // ── COVER PAGE ─────────────────────────────────────────────────
  const coverPage = `
  <div class="page cover" style="display:flex;flex-direction:column;background:${C.white};">
    <!-- Top accent bar -->
    <div style="height:6px;background:linear-gradient(90deg,${C.teal},${C.tealLight},${C.blue});"></div>

    <!-- Main content -->
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:60px 80px 40px;">

      <!-- Logo / Brand -->
      <div style="margin-bottom:36px;">
        <img src="${typeof window !== 'undefined' ? window.location.origin : ''}/logo/predictix-icon.svg" alt="PredictiX" style="display:block;height:76px;width:auto;margin:0 auto 16px;" />
        <div style="font-size:52px;font-weight:800;color:${C.navy};letter-spacing:-2px;line-height:1;">Predic<span style="color:${C.teal};">tiX</span></div>
        <div style="width:60px;height:3px;background:${C.teal};margin:12px auto 0;border-radius:2px;"></div>
      </div>

      <!-- Report title block -->
      <div style="background:${C.tealBg};border:1px solid ${C.tealBorder};border-radius:12px;padding:28px 48px;margin-bottom:36px;max-width:520px;width:100%;">
        <div style="font-size:13px;font-weight:700;color:${C.teal};text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;">Warehouse Intelligence Report</div>
        <div style="font-size:28px;font-weight:800;color:${C.navy};margin-bottom:6px;">${data.warehouseName}</div>
        ${data.warehouseCity ? `<div style="font-size:14px;color:${C.slateMid};">${data.warehouseCity}</div>` : ''}
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
    { num: '3', title: 'Health & Risk Analysis',       sub: 'Health bands · Primary failure indicators · Critical assets · Climate' },
    { num: '4', title: 'Maintenance Intelligence',     sub: 'PM ratio · Cost variance · Trend analysis · Compliance' },
    { num: '5', title: 'Ticket Management Status',     sub: 'Priority · Category · 3-month ticket trend' },
    { num: '6', title: 'Recommendations',              sub: 'Business impact · Operational readiness · Compliance' },
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

  // ── §1: EXECUTIVE SUMMARY ──────────────────────────────────────
  const section1 = `
  <div class="page">
    ${pageHeader(data.warehouseName, '§1 Executive Insight Summary')}
    ${sectionHeader('1', 'Executive Insight Summary')}

    ${kpiGrid4(
      kpiCard('Total Fleet Assets', fmtN(totalAssets), `${fmtN(activeA)} active`, C.teal),
      // Caption reads from the same constant as the filter above, so the two
      // cannot drift apart.
      kpiCard('Fleet Health Score', `${healthFleet}%`, `${healthyPct}% assets ≥${HEALTH_GOOD}%`, healthFleet >= HEALTH_GOOD ? C.green : C.orange),
      kpiCard('Avg Failure Prob.', `${failProb}%`, 'Fleet average', C.orange),
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
  </div>`;

  // ── §2: FLEET ASSET OVERVIEW ───────────────────────────────────
  const section2 = `
  <div class="page">
    ${pageHeader(data.warehouseName, '§2 Fleet Asset Overview')}
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
      chartBox('', svgDonut(s.assetsByType, 240, 210, 110, 90, 74, 36), 'Figure 2.1 - Fleet composition by type')
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
      chartBox('', svgDonut(s.assetStatus, 240, 210, 110, 90, 74, 36), 'Figure 2.2 - Asset status distribution')
    )}

  </div>`;

  const section2b = `
  <div class="page">
    ${pageHeader(data.warehouseName, '§2 Fleet Asset Overview (cont.)')}

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
      <div style="background:${C.offWhite};border:1px solid ${C.border};border-radius:8px;padding:12px;">
        <h2 style="font-size:11.5px;font-weight:700;color:${C.navy};margin:0 0 10px 0;">Workforce Overview</h2>
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
      <div style="background:${C.offWhite};border:1px solid ${C.border};border-radius:8px;padding:12px;">
        <h2 style="font-size:11.5px;font-weight:700;color:${C.navy};margin:0 0 10px 0;">Fleet Summary Metrics</h2>
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
      <div>
        <h2 style="font-size:11.5px;font-weight:700;color:${C.navy};margin:10px 0 10px 0;">Fleet Age Distribution</h2>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:0 0 16px 0;">
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

    ${(ad.warrantyExpiring90d || 0) > 0 ? (() => {
      const n = ad.warrantyExpiring90d || 0;
      const plural = n === 1 ? 'asset has' : 'assets have';
      // Warranty expiry is a planning advisory; only escalate to a red High Alert
      // when it is material to the fleet (≥10 assets or ≥5% of the fleet).
      const material = n >= Math.max(10, totalAssets * 0.05);
      return alertBox(
        `<strong>${n} ${plural}</strong> warranty expiring within the next 90 days. Review service contracts and schedule pre-expiry inspections to ensure coverage continuity.`,
        material ? 'alert' : 'advisory'
      );
    })() : ''}

    ${kb.service_interval_text ? alertBox(kb.service_interval_text, 'info') : ''}
  </div>`;

  // ── §3: HEALTH & RISK ANALYSIS + SHAP ─────────────────────────
  const healthBands = kb.health_bands_kb?.length
    ? kb.health_bands_kb
    : s.healthScoreDistribution.map(h => ({
        band: h.bucket,
        count: h.count,
        pct_fleet: Math.round(h.count / Math.max(totalAssets, 1) * 1000) / 10,
        kb_interpretation: h.bucket.includes('Below 30') ? 'Critical - immediate intervention required'
          : h.bucket.startsWith('30') ? 'At-Risk - schedule service within 14 days'
          : h.bucket.startsWith('50') ? 'Moderate - schedule within 30 days'
          : h.bucket.startsWith('70') ? 'Good - monitor; preventive care on-track'
          : h.bucket.startsWith('80') ? 'Optimal - maintain current schedule'
          : 'Optimal - continue standard intervals',
      }));

  // Health bands are derived from scored assets; show % of the scored population so
  // the bands sum to 100%. "Critical" here = the Below-50% band (same as the §1 KPI).
  const scoredFromBands = healthBands.reduce((sum, b) => sum + (b.count || 0), 0) || totalAssets;
  const isCriticalBand = (band: string) => /below\s*50/i.test(band);

  const section3a = `
  <div class="page">
    ${pageHeader(data.warehouseName, '§3 Health & Risk Analysis')}
    ${sectionHeader('3', 'Health & Risk Analysis', 'Primary Failure Indicators · Critical Asset Watch')}

    ${subHeader('3.1 Health Score Distribution')}
    ${darkTable(
      ['Health Band', 'Assets', '% Scored', 'Operational Interpretation'],
      healthBands.map(b => {
        const crit = isCriticalBand(b.band);
        const bandCell = crit ? `<span style="color:${C.red};font-weight:700;">${b.band}</span>` : b.band;
        const interp = crit ? `<span style="color:${C.red};">${b.kb_interpretation}</span>` : b.kb_interpretation;
        return [bandCell, fmtN(b.count), `${(b.count / Math.max(scoredFromBands, 1) * 100).toFixed(1)}%`, interp];
      })
    )}

    ${subHeader('3.2 Health Score - Visual Distribution')}
    ${chartBox(
      '',
      svgVBar(
        s.healthScoreDistribution.map(h => ({ name: h.bucket, value: h.count })),
        650, 180,
      ),
      'Figure 3.1 - Asset count per health score band'
    )}

    ${(() => {
      const riskTotal = riskData.reduce((sum, r) => sum + (r.value || 0), 0) || 1;
      return `
    ${subHeader('3.3 Risk Level Distribution', C.navy)}
    ${twoCol(
      lightTable(
        ['Risk Level', 'Assets', '% Fleet'],
        riskData.map(r => [r.name, fmtN(r.value), fmtPct((r.value / riskTotal) * 100)])
      ),
      chartBox('', svgDonut(riskData, 240, 180, 100, 80, 74, 36), 'Figure 3.2 - Risk level distribution')
    )}
    <p style="font-size:8px;color:${C.textLight};font-style:italic;margin:6px 2px 0;">Model risk_level over all ${fmtN(riskTotal)} assets; "Unknown" = not yet risk-scored. This categorical "Critical" is distinct from the health-band Critical (&lt;50%) in §3.1.</p>

    ${ai.risk_analysis ? `
      </div>
      <div class="page">
        ${pageHeader(data.warehouseName, '§3 Health & Risk Analysis (cont.)')}
        ${narrativePara(ai.risk_analysis)}
    ` : ''}
  </div>`;
    })()}
  `;

  const section3b = shapSource.length > 0 ? `
  <div class="page">
    ${pageHeader(data.warehouseName, '§3 Health & Risk Analysis (cont.)')}
    ${subHeader('3.4 Primary Failure Indicators')}
    ${chartBox(
      'Relative Feature Importance',
      svgHBar(
        shapSource.map(f => ({ name: f.feature, value: f.impact_pct, label: `${f.impact_pct}%` })),
        640, 28
      ),
      'Figure 3.3 - Primary indicators of asset degradation across the fleet. Shows the relative impact of each factor on overall equipment health and failure risk.'
    )}
    ${darkTable(
      ['Primary Indicator', 'Relative Importance', 'Threshold Reference', 'Recommended Action'],
      shapSource.map(f => [
        f.feature, `${f.impact_pct}%`, 
        f.kb_threshold === 'See OEM manual' ? '-' : f.kb_threshold, 
        f.action === 'Inspect and service per schedule' ? '-' : f.action,
      ])
    )}
  </div>` : '';

  const section3c = '';

  // ── §3 (cont.): FMEA CRITICALITY + CLIMATE RISK ───────────────
  const fmeaRank = kb.fmea_criticality || [];
  const climateRisk = kb.climate_risk || [];
  const section3d = '';

  // ── §4: MAINTENANCE INTELLIGENCE ──────────────────────────────
  const section4a = `
  <div class="page">
    ${pageHeader(data.warehouseName, '§4 Maintenance Intelligence')}
    ${sectionHeader('4', 'Maintenance Intelligence')}

    ${kpiGrid4(
      kpiCard('Total Events (3M)', fmtN(totalEvents), 'maintenance events', C.teal),
      kpiCard('Preventive (PM)', `${pmPct.toFixed(1)}%`, `${fmtN(prevCount)} events`, C.green, C.greenLight),
      kpiCard('Corrective / Repair', `${corrPct.toFixed(1)}%`, `${fmtN(nonPrevCount)} events`, C.orange),
      kpiCard('PM : Repair Ratio', `${pmRatio}:1`, 'target >9:1', C.teal),
    )}

    ${maintenanceTypes.length > 0 ? `
      ${subHeader('4.1 Events by Maintenance Type')}
      ${lightTable(
        ['Maintenance Type', 'Event Count', '% Total'],
        maintenanceTypes.map(m => [m.name, fmtN(m.value), fmtPct((m.value / Math.max(totalEvents, 1)) * 100)])
      )}
    ` : ''}

    ${subHeader('4.2 Cost & Operational Metrics')}
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin:0 0 16px 0;">
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
  </div>`;

  const section4a2 = '';

  const section4b = `
  <div class="page">
    ${pageHeader(data.warehouseName, '§4 Maintenance Intelligence (cont.)')}

    ${mainTrend.length > 0 ? `
    ${subHeader(`4.3 Monthly Maintenance Trend${md.reportingPeriod ? ` (${md.reportingPeriod})` : ''}`)}

    ${md.dataConcentrated ? alertBox(
      `<strong>Demonstration-data notice:</strong> the maintenance history is concentrated in a single month, so the month-over-month change below is a <strong>data-loading artifact, not an operational trend</strong> - it must not be read as a change in workload or efficiency. With production data spread across the period this chart will reflect a genuine trend. Monthly figures sum exactly to the §4 headline total.`,
      'advisory'
    ) : ''}

    ${twoCol(
      chartBox(
        'Maintenance Event Volume',
        svgLine(mainTrend.map(m => ({ label: m.month.substring(0, 3), value: m.events })), 300, 170, C.teal),
        'Figure 4.1 - Events per calendar month'
      ),
      chartBox(
        'Maintenance Cost (LKR)',
        svgLine(mainTrend.map(m => ({ label: m.month.substring(0, 3), value: m.cost })), 300, 170, C.violet),
        'Figure 4.2 - Recorded cost per calendar month'
      )
    )}

    ${lightTable(
      ['Month', 'Events', 'Cost (LKR)'],
      mainTrend.map(m => [m.month, fmtN(m.events), m.cost.toLocaleString()])
    )}

    ${(!md.dataConcentrated && (md.eventTrendDirection || md.costTrendDirection)) ? alertBox(
      `Across the period, maintenance event volume is <strong>${md.eventTrendDirection ?? 'n/a'}</strong> and recorded maintenance cost is <strong>${md.costTrendDirection ?? 'n/a'}</strong>. Maintenance events and support tickets are <em>separate</em> series - ticket volume is reported in §5 and is not interchangeable with event counts.`,
      'benchmark'
    ) : ''}
    ` : ''}

    ${(md.vendorBreakdown || []).length > 0 ? `
      ${subHeader('4.4 Vendor & Service Provider Analysis')}
      ${lightTable(
        ['Service Provider', 'Events', 'Total Cost (LKR)', '% Events'],
        (() => {
          const vd = md.vendorBreakdown || [];
          const totalEvt = vd.reduce((sum, v) => sum + v.events, 0);
          return vd.map(v => {
            const pctVal = totalEvt > 0 ? (v.events / totalEvt * 100) : 0;
            const pctStr = pctVal > 0 && pctVal < 0.05 ? '<0.1%' : fmtPct(pctVal);
            return [v.vendor, fmtN(v.events), v.cost.toLocaleString(), pctStr];
          });
        })()
      )}
    ` : ''}
    ${(mainTrend.length > 0 || (md.vendorBreakdown || []).length > 0) ? `
      </div>
      <div class="page">
        ${pageHeader(data.warehouseName, '§4 Maintenance Intelligence (cont.)')}
    ` : ''}

    ${ai.maintenance_intelligence ? narrativePara(ai.maintenance_intelligence) : ''}

    ${alertBox(
      `At ${pmPct.toFixed(1)}% preventive maintenance coverage, PredictiX ${pmPct >= 90 ? 'exceeds' : 'falls short of'} the SMRP gold standard of 90%. However, the presence of ${fmtN(critCount)} critical-status assets indicates PM scheduling may not be keeping pace with actual degradation - particularly for high-utilisation forklifts where the recommended interval is every <strong>500 engine hours</strong>. Cross-referencing engine-hour data against the primary failure indicators is the priority action item.`,
      'benchmark'
    )}

  </div>
  ${msch.length > 0 ? `
    <div class="page">
      ${pageHeader(data.warehouseName, '§4 Maintenance Intelligence (cont.)')}
      ${subHeader('4.5 Predictive Maintenance Schedule')}
      <p style="font-size:8.5px;color:${C.textMuted};margin:0 0 10px;">
        Predicted (ML model) vs Scheduled (fleet avg interval) weeks to next service.
        Assets sorted by urgency gap - negative gap means maintenance is overdue relative to schedule.
        ${msch.length > 18 ? `Showing the 18 most urgent of ${fmtN(msch.length)} assets.` : ''}
      </p>
      ${lightTable(
        ['Asset', 'Predicted (days)', 'Scheduled (days)', 'Gap (days)', 'Status'],
        msch.slice(0, 18).map(r => {
          const gap = r.predicted - r.scheduled;
          const status = gap < -14 ? '⚠ Overdue' : gap < 0 ? 'Due Soon' : 'On Track';
          return [
            r.asset,
            r.predicted.toFixed(1),
            r.scheduled.toFixed(1),
            (gap >= 0 ? '+' : '') + gap.toFixed(1),
            status,
          ];
        })
      )}
    </div>` : ''}`;

  // ── §4 (cont.): MAINTENANCE COMPLIANCE FRAMEWORK ──────────────
  const statutory = kb.statutory_compliance || [];
  const oemIntervals = kb.oem_intervals || [];

  const section4c = '';

  const section4d = oemIntervals.length ? `
  <div class="page">
    ${pageHeader(data.warehouseName, '§4 Maintenance Intelligence (cont.)')}
    ${subHeader('4.6 Maintenance Compliance Framework')}
    <p style="font-size:10px;color:${C.textMuted};margin-bottom:10px;">Maintenance adherence ensures operational readiness, mitigates business impact from unexpected downtime, and maintains statutory compliance across the fleet.</p>
    ${oemIntervals.map(cls => `
      <div style="margin:14px 0 4px;font-size:11px;font-weight:700;color:${C.navy};">${cls.asset_class}</div>
      ${lightTable(
        ['Cadence', 'Trigger', 'Service Scope'],
        cls.tiers.map(t => [t.cadence, t.trigger, t.scope])
      )}
    `).join('')}
  </div>` : '';

  // ── §4 (cont.): ASSET COMPONENT SURVIVAL ANALYSIS ──────────────
  const surv = data.survival;
  const buildWatchlistTable = (items: any[]) => {
    if (!items.length) return '';
    let html = '<table style="width:100%;border-collapse:collapse;font-size:8.5px;margin-bottom:10px;">';
    html += '<tr style="border-bottom:1px solid #e2e8f0;color:#64748b;font-size:7px;text-transform:uppercase;">';
    html += '<th style="text-align:left;padding:6px 4px;">Asset</th>';
    html += '<th style="text-align:left;padding:6px 4px;">Component</th>';
    html += '<th style="text-align:left;padding:6px 4px;">Next Maintenance Day</th>';
    html += '<th style="text-align:left;padding:6px 4px;">Risk</th>';
    html += '</tr>';
    items.forEach(w => {
      html += '<tr style="border-bottom:1px solid #f1f5f9;">';
      html += `<td style="padding:6px 4px;font-weight:700;color:${C.red};font-family:monospace;">${w.asset}</td>`;
      html += `<td style="padding:6px 4px;">${w.component}</td>`;
      html += `<td style="padding:6px 4px;font-weight:600;">${w.rul_days == null ? '-' : w.rul_days.toLocaleString()}</td>`;
      html += `<td style="padding:6px 4px;">${w.risk}</td>`;
      html += '</tr>';
      const summary = criticalAssets.find(c => c.id === w.asset)?.summary;
      if (summary) {
        html += '<tr style="border-bottom:1px solid #e2e8f0;background-color:#f8fafc;">';
        html += `<td colspan="4" style="padding:8px;font-size:8px;color:#334155;line-height:1.4;">`;
        html += `<span style="font-weight:700;color:#6366f1;">AI Summary:</span> ${summary}`;
        html += `</td></tr>`;
      }
    });
    html += '</table>';
    return html;
  };

  const section4e = (surv && surv.component_summary && surv.component_summary.length) ? `
  <div class="page">
    ${pageHeader(data.warehouseName, '§4 Maintenance Intelligence (cont.)')}
    ${subHeader('4.7 Asset component survival analysis')}
    <p style="font-size:8.5px;color:${C.textMuted};margin:0 0 10px;">
      Component-level failure probability and associated financial risk across the ${fmtN(surv.assets_analyzed)} most vulnerable assets. Proactive visibility into 7-day and 30-day component vulnerabilities ensures operational readiness, avoids unplanned downtime, and allows for accurate budget allocation for compliance-critical replacements.
    </p>
    ${subHeader('Component Failure Risk - 7 & 30 days', C.teal)}
    <div style="font-size:9px;color:#0f766e;margin:0 0 10px;padding:9px 12px;background:#f0fdfa;border:1px solid #99f6e4;border-radius:6px;">
      Expected replacement spend:
      <b>LKR ${fmtN(Math.round(surv.expected_spend_30d || 0))}</b> within 30 days
      &nbsp;·&nbsp; <b>LKR ${fmtN(Math.round(surv.expected_spend_7d || 0))}</b> within 7 days.
    </div>
    ${(() => {
      const COL: Record<string, string> = { Brake: '#ef4444', Tire: '#f59e0b', Battery: '#10b981', Oil: '#0ea5e9', Hydraulic: '#8b5cf6' };
      const order = ['tire', 'battery', 'hydraulic', 'oil', 'brake'];
      const comps = [...surv.component_summary].sort((a, b) => order.indexOf(a.component.toLowerCase()) - order.indexOf(b.component.toLowerCase()));
      
      const w = 540;
      const h = 220;
      const chartH = h - 60;
      const gap = Math.floor((w - 70) / comps.length);
      const bw = 24; // Width of each bar
      
      // Calculate max probability to scale Y axis (round up to nearest 10%)
      const maxP = Math.max(0.1, ...comps.map(c => Math.max(c.avg_fail_prob_30d ?? 0, c.avg_fail_prob_7d ?? 0)));
      const step = 0.2; // 20% steps
      const maxVal = Math.ceil(maxP / step) * step;
      
      const ticks = [];
      for (let v = step; v <= maxVal + 0.001; v += step) ticks.push(v);

      const gridLines = ticks.map(v => {
        const y = 20 + chartH - chartH * (v / maxVal);
        return `<line x1="44" y1="${y}" x2="${w - 10}" y2="${y}" stroke="${C.borderLight}" stroke-width="1" stroke-dasharray="3 3"/>
                <text x="40" y="${y + 3}" text-anchor="end" font-size="8" fill="${C.textLight}">${(v * 100).toFixed(0)}%</text>`;
      }).join('');

      const rects = comps.map((c, i) => {
        const p30 = c.avg_fail_prob_30d ?? 0;
        const p7 = c.avg_fail_prob_7d ?? 0;
        const bh30 = Math.max((p30 / maxVal) * chartH, 2);
        const bh7 = Math.max((p7 / maxVal) * chartH, 2);
        const cx = 50 + i * gap + gap / 2;
        const x30 = cx - bw - 2;
        const x7 = cx + 2;
        const col = COL[c.component] || '#0ea5e9';
        
        return `
          <!-- 30-day bar (shaded) -->
          <rect x="${x30}" y="${20 + chartH - bh30}" width="${bw}" height="${bh30}" fill="${col}" rx="2" opacity="0.4"/>
          <text x="${x30 + bw/2}" y="${20 + chartH - bh30 - 6}" text-anchor="middle" font-size="7.5" fill="${C.textMuted}" font-weight="600">${(p30 * 100).toFixed(1)}%</text>
          
          <!-- 7-day bar (solid) -->
          <rect x="${x7}" y="${20 + chartH - bh7}" width="${bw}" height="${bh7}" fill="${col}" rx="2" opacity="0.9"/>
          <text x="${x7 + bw/2}" y="${20 + chartH - bh7 - 6}" text-anchor="middle" font-size="7.5" fill="${col}" font-weight="700">${(p7 * 100).toFixed(1)}%</text>
          
          <!-- X-axis label -->
          <text x="${cx}" y="${20 + chartH + 16}" text-anchor="middle" font-size="9" fill="${C.text}" font-weight="600">${c.component}</text>
        `;
      }).join('');

      const svgBlock = `<div style="margin-top:10px;margin-bottom:20px;">
        <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
          <line x1="44" y1="20" x2="44" y2="${20 + chartH}" stroke="${C.border}" stroke-width="1.5"/>
          <line x1="44" y1="${20 + chartH}" x2="${w - 10}" y2="${20 + chartH}" stroke="${C.border}" stroke-width="1.5"/>
          ${gridLines}${rects}
          <!-- Legend -->
          <rect x="${w/2 - 50}" y="${h - 12}" width="8" height="8" fill="#94a3b8" opacity="0.4" rx="1"/>
          <text x="${w/2 - 38}" y="${h - 5}" font-size="8" fill="${C.textMuted}">30-day risk</text>
          <rect x="${w/2 + 10}" y="${h - 12}" width="8" height="8" fill="#94a3b8" opacity="0.9" rx="1"/>
          <text x="${w/2 + 22}" y="${h - 5}" font-size="8" fill="${C.textMuted}">7-day risk</text>
        </svg>
      </div>`;
      
      return svgBlock + `<div style="margin-top:20px;margin-bottom:6px;">
        <div style="font-size:10px;font-weight:700;color:${C.navy};text-transform:uppercase;letter-spacing:0.04em;margin-bottom:6px;border-bottom:1px solid ${C.border};padding-bottom:4px;">At-Risk Component Counts</div>
        ${lightTable(
          ['Component', 'Failing in 7 Days', 'Failing in 30 Days'],
          comps.map(c => [
            `<span style="font-weight:600;color:${COL[c.component] || '#333'};">${c.component}</span>`, 
            String(c.at_risk_7d ?? 0), 
            String(c.at_risk_30d ?? 0)
          ])
        )}
      </div>`;
    })()}
    ${(surv.watchlist && surv.watchlist.length) ? `
    </div>
    <div class="page">
      ${pageHeader(data.warehouseName, '§4 Maintenance Intelligence (cont.)')}
      ${subHeader('Soonest-Failing Watchlist', C.red)}
      <p style="font-size:8.5px;color:${C.textMuted};margin:0 0 8px;">
        Each asset's soonest-failing component, sorted by predicted next maintenance day - prioritise these for inspection.
      </p>
      ${buildWatchlistTable(surv.watchlist.slice(0, 25))}
      ${surv.watchlist.length > 25 ? `
    </div>
    <div class="page">
      ${pageHeader(data.warehouseName, '§4 Maintenance Intelligence (cont.)')}
      ${subHeader('Soonest-Failing Watchlist (cont.)', C.red)}
      ${buildWatchlistTable(surv.watchlist.slice(25))}
      ` : ''}
    ` : ''}
    ${alertBox(
      `Predictive degradation tracking flags vulnerable components ahead of scheduled service. Where the predicted remaining useful life falls below the statutory or manufacturer service interval, proactively bringing the inspection forward is the recommended override to maintain operational readiness, prevent compliance breaches, and avoid unplanned downtime.`,
      'benchmark'
    )}
  </div>` : '';

  // ── §5: TICKET MANAGEMENT ──────────────────────────────────────
  // Percentages are the share of each priority within the prioritised tickets
  // (High+Medium+Low) - NOT divided by the open-ticket count, which produced
  // nonsensical shares summing to >100%.
  const prioTotal = highT + medT + lowT;
  const highPct = prioTotal > 0 ? Math.round(highT / prioTotal * 1000) / 10 : 0;
  const medPct  = prioTotal > 0 ? Math.round(medT  / prioTotal * 1000) / 10 : 0;
  const lowPct  = prioTotal > 0 ? Math.round(lowT  / prioTotal * 1000) / 10 : 0;

  const prioritySlices = [
    { name: `High`, value: highT },
    { name: `Medium`, value: medT },
    { name: `Low`, value: lowT },
  ].filter(p => p.value > 0);

  const catSlices = s.ticketsByCategory.map(c => ({ name: c.name, value: c.value }));

  const section5a = `
  <div class="page">
    ${pageHeader(data.warehouseName, '§5 Ticket Management Status')}
    ${sectionHeader('5', 'Ticket Management Status')}

    ${kpiGrid4(
      kpiCard('Open Tickets',      fmtN(openT), 'awaiting resolution',    C.orange),
      kpiCard('High Priority',     fmtN(highT), `${highPct}% of prioritised`,    C.red, C.redLight),
      kpiCard('Medium Priority',   fmtN(medT),  `${medPct}% of prioritised`,     C.amber, C.amberLight),
      kpiCard('Low Priority',      fmtN(lowT),  `${lowPct}% of prioritised`,     C.green, C.greenLight),
    )}

    ${subHeader('5.1 Ticket Overview - Status Breakdown')}
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

    ${subHeader('5.2 Filed Priority & Category Distribution')}
    ${twoCol(
      chartBox(
        'By Filed Priority',
        svgDonut(prioritySlices.length ? prioritySlices : [{ name: 'No Data', value: 1 }], 240, 190, 110, 80, 64, 30),
        'Figure 5.1 - Tickets by filed priority'
      ),
      chartBox(
        'By Category',
        svgDonut(catSlices.length ? catSlices : [{ name: 'No Data', value: 1 }], 240, 190, 110, 80, 64, 30),
        'Figure 5.2 - Tickets by category'
      )
    )}

  </div>`;

  const section5b = `
  <div class="page">
    ${pageHeader(data.warehouseName, '§5 Ticket Management Status (cont.)')}

    ${kb.ticket_category_kb?.length ? `
      ${subHeader('5.3 Ticket Categories')}
      ${darkTable(
        ['Category', 'Count', '% of Total', 'Maintenance Guidance'],
        kb.ticket_category_kb.map(c => [c.category, fmtN(c.count), `${c.pct_open}%`, c.kb_guidance])
      )}
    ` : s.ticketsByCategory.length ? `
      ${subHeader('5.3 Ticket Categories')}
      ${lightTable(
        ['Category', 'Tickets', '% of Total'],
        (() => {
          const catTotal = s.ticketsByCategory.reduce((sum, c) => sum + c.value, 0) || fmt(td.totalTickets);
          return s.ticketsByCategory.map(c => [c.name, fmtN(c.value), fmtPct((c.value / Math.max(catTotal, 1)) * 100)]);
        })()
      )}
    ` : ''}

    ${ticketTrend.length > 0 ? `
      ${subHeader('5.4 Monthly Ticket Volume (New Tickets per Calendar Month)')}
      ${chartBox(
        '',
        svgLine(ticketTrend.map(t => ({ label: t.month.substring(0, 3), value: t.tickets })), 640, 170, C.amber),
        'Figure 5.3 - New support tickets per month (a separate series from maintenance events in §4)'
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
        ${(td.mttrByPriority || []).length > 0 ? `
        <div style="background:${C.offWhite};border:1px solid ${C.border};border-radius:8px;padding:14px 16px;">
          <div style="font-size:8.5px;font-weight:700;color:${C.textMuted};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">Resolution Breakdown</div>
          <div style="font-size:11px;color:${C.textMuted};">By priority level - see table below</div>
        </div>
        ` : ''}
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
  </div>`;

  // §5.6 on its own page - the before/after comparison table + Unset advisory +
  // trend narrative are substantial, so keep them off the §5.4/§5.5 page.
  const section5c = `
  <div class="page">
    ${pageHeader(data.warehouseName, '§5 Ticket Management Status (cont.)')}

    ${Object.keys(td.finalPriorityBreakdown || {}).length > 0 ? (() => {
      // Before/after re-triage view: priority AS FILED (§5.2 source) vs the AI
      // re-classification. Both columns cover the SAME ticket population, so the
      // (previously contradictory-looking) 173-vs-228 difference reads as a feature.
      const aiMap = td.finalPriorityBreakdown || {};
      const aiByLower: Record<string, number> = Object.fromEntries(
        Object.entries(aiMap).map(([k, v]) => [k.toLowerCase(), v as number])
      );
      const order = ['critical', 'high', 'medium', 'low', 'unset'];
      const rank = (k: string) => { const i = order.indexOf(k); return i < 0 ? 99 : i; };
      const keys = Array.from(new Set([...Object.keys(_prioMap), ...Object.keys(aiByLower)]))
        .sort((a, b) => rank(a) - rank(b));
      const filedTotal = Object.values(_prioMap).reduce((a, b) => a + b, 0);
      const aiTotal = Object.values(aiByLower).reduce((a, b) => a + b, 0);
      const rows = keys.map(k => {
        const f = _prioMap[k] || 0;
        const a = aiByLower[k] || 0;
        const d = a - f;
        const label = k.charAt(0).toUpperCase() + k.slice(1);
        return [label, fmtN(f), fmtN(a), d === 0 ? '-' : `${d > 0 ? '+' : ''}${d}`];
      });
      rows.push(['Total', fmtN(filedTotal), fmtN(aiTotal),
        filedTotal === aiTotal ? '-' : `${aiTotal - filedTotal > 0 ? '+' : ''}${aiTotal - filedTotal}`]);
      const aiUnset = aiByLower['unset'] || 0;
      const aiUnsetPct = aiTotal > 0 ? Math.round(aiUnset / aiTotal * 1000) / 10 : 0;
      return `
      ${subHeader('5.6 AI-Reclassified Priority (vs Filed)', C.navy)}
      ${darkTable(['Priority', 'Filed', 'AI-Reclassified', 'Change'], rows)}
      ${aiUnset > 0 ? alertBox(
        `<strong>${fmtN(aiUnset)} tickets (${aiUnsetPct}%) remain Unset by the AI classifier</strong> - a model-coverage limitation (low confidence or not yet scored), <em>not</em> a low-priority grade. These need manual triage; widening classifier coverage is a model-improvement action, and the share should be tracked down over time.`,
        'advisory'
      ) : ''}`;
    })() : ''}

    ${ai.pattern_and_trend ? narrativePara(ai.pattern_and_trend) : ''}
  </div>`;

  // ── §6: RECOMMENDATIONS ────────────────────────────────────────
  const rec = kb.recommendations;
  const section6 = `
  <div class="page">
    ${pageHeader(data.warehouseName, '§6 Recommendations')}
    ${sectionHeader('6', 'Prescriptive Recommendations')}
    <p style="font-size:10.5px;color:${C.textMuted};margin-bottom:20px;">The following actions are prioritized to ensure maximum operational readiness, mitigate business impact from unexpected downtime, and maintain strict compliance standards across the fleet.</p>

    ${rec ? `
      ${rec.critical?.length ? recommendBlock('CRITICAL', 'Immediate action (0-7 days)', rec.critical) : ''}
      ${rec.high?.length     ? recommendBlock('HIGH',     'Short-term (7-30 days)',       rec.high)     : ''}
      ${rec.medium?.length   ? recommendBlock('MEDIUM',   'Strategic (30-90 days)',       rec.medium)   : ''}
      ${rec.kb_alert ? alertBox(rec.kb_alert, 'alert') : ''}
    ` : `
      ${recommendBlock('CRITICAL', '0-7 days', [
        `Immediately schedule maintenance for ${fmtN(urgentCount)} assets due for service within 7 days. Prioritise assets with health scores below 30%.`,
        `Review engine-hours data against top failure indicator thresholds across all high-utilisation forklifts.`,
      ])}
      ${recommendBlock('HIGH', '7-30 days', [
        `Analyse all ${fmtN(critCount)} critical-status assets and develop individual asset recovery plans with target health-band improvements.`,
        `Address ${fmtN(highT)} high-priority tickets - a ${highPct}% concentration warrants a dedicated response team.`,
        'Validate PM scheduling frequency for assets showing rapid health degradation between service intervals.',
      ])}
      ${recommendBlock('MEDIUM', '30-90 days', [
        'Implement predictive health scoring alerts at 70% threshold to enable proactive intervention before assets enter the critical band.',
        'Conduct quarterly fleet review to align PM intervals with actual usage patterns and failure indicator trends.',
        'Expand knowledge base with asset-specific OEM thresholds to improve actionability scores.',
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
      `The ${data.warehouseName} warehouse fleet of ${fmtN(totalAssets)} assets has an average health score of ${healthFleet}% with ${healthyPct}% of assets in the optimal-to-acceptable range. However, ${fmtN(critCount)} assets (${Math.round(critCount / Math.max(totalAssets, 1) * 100)}%) remain in the critical health band and require prioritised intervention. The 3-month maintenance record shows ${fmtN(totalEvents)} events at a ${pmPct.toFixed(1)}% PM ratio${pmPct >= 90 ? ' - exceeding the SMRP 90% gold standard - demonstrating a strong preventive maintenance culture' : ' - below the SMRP 90% gold standard'}. The ${fmtN(openT)} open tickets, including ${fmtN(highT)} classified high-priority, represent the immediate operational challenge. With ${fmtN(urgentCount)} assets requiring service within 7 days, expedited scheduling is critical to preventing further health degradation and unplanned downtime.`
    )}

    <!-- Document footer -->
    <div style="margin-top:40px;padding-top:18px;border-top:1px solid ${C.border};display:flex;justify-content:flex-end;align-items:center;">
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
  <title>${data.title} - ${data.warehouseName}</title>
  <style>${CSS}</style>
</head>
<body>
  ${coverPage}
  ${tocPage}
  ${section1}
  ${section2}
  ${section2b}
  ${section3a}
  ${section3b}
  ${section3c}
  ${section3d}
  ${section4a}
  ${section4a2}
  ${section4b}
  ${section4c}
  ${section4d}
  ${section4e}
  ${section5a}
  ${section5b}
  ${section5c}
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
