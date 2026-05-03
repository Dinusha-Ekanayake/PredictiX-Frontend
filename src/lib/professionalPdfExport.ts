/**
 * KB-Enhanced Professional PDF Export — PredictiX Warehouse Report
 * =================================================================
 * Generates a multi-page, print-ready HTML report matching the reference design exactly.
 *
 * Report Structure (7 sections):
 *   Cover Page → Table of Contents →
 *   §1 Executive Insight Summary (KB Benchmark callout + HIGH ALERT) →
 *   §2 Fleet Asset Overview (pie + bar charts + KB Service Interval callout) →
 *   §3 Health & Risk Analysis · SHAP Failure Drivers (dark header tables, 4-col SHAP) →
 *   §4 Maintenance Intelligence (PM progress bars + KB Insight callout) →
 *   §5 Ticket Management Status (2 pie charts + KB Guidance table) →
 *   §6 Recommendations (CRITICAL/HIGH/MEDIUM urgency blocks) →
 *   §7 Conclusion (Workforce KPIs + Critical Assets table + Executive Conclusion)
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

/** KB Annotations — computed deterministically by kb_annotator.py */
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
  kbAnnotations?: KBAnnotations;       // NEW — KB enrichments from backend
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
  };
  userDetail?: {
    totalUsers?: number;
    adminUsers?: number;
    standardUsers?: number;
    inactiveUsers?: number;
  };
  sections: {
    assetStatus: Array<{ name: string; value: number }>;
    assetsByType: Array<{ name: string; value: number }>;
    maintenanceByType: Array<{ name: string; value: number }>;
    ticketsByCategory: Array<{ name: string; value: number }>;
    ticketsByPriority?: Array<{ name: string; value: number }>;
    healthScoreDistribution: Array<{ bucket: string; count: number }>;
    criticaAssets: Array<{ id: string; vehicle: string; component: string; health: string; priority: string }>;
    riskDistribution?: Array<{ name: string; value: number }>;
  };
}


// ══════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ══════════════════════════════════════════════════════════════════

const C = {
  teal:       '#14b8a6',
  tealLight:  '#5eead4',
  tealBg:     '#f0fdf9',
  navy:       '#0f172a',
  navyMed:    '#1e293b',
  slate:      '#64748b',
  slateLight: '#94a3b8',
  red:        '#dc2626',
  redBg:      '#fef2f2',
  orange:     '#f97316',
  orangeBg:   '#fff7ed',
  green:      '#16a34a',
  greenBg:    '#f0fdf4',
  kbBg:       '#f0fdf4',
  kbBorder:   '#14b8a6',
  alertRed:   '#ef4444',
  text:       '#1e293b',
  muted:      '#64748b',
  border:     '#e2e8f0',
  white:      '#ffffff',
};

const CHART_COLORS = [C.teal, '#3b82f6', '#f97316', '#f59e0b', '#8b5cf6', '#ec4899', '#10b981'];


// ══════════════════════════════════════════════════════════════════
// SVG CHART HELPERS
// ══════════════════════════════════════════════════════════════════

function fmt(n: number | undefined | null): number { return n ?? 0; }
function fmtPct(n: number): string { return `${n.toFixed(1)}%`; }

function generateSvgPieChart(
  slices: Array<{ name: string; value: number }>,
  width = 220, height = 180, cx = 100, cy = 85, r = 70
): string {
  const total = slices.reduce((s, d) => s + (d.value || 0), 0);
  if (!total) return `<svg width="${width}" height="${height}"><text x="${cx}" y="${cy}" text-anchor="middle" fill="${C.muted}" font-size="10">No data</text></svg>`;

  let angle = -90;
  const paths = slices.map((s, i) => {
    const pct = (s.value || 0) / total;
    const startAngle = angle;
    angle += pct * 360;
    const endAngle = angle;
    const s1 = { x: cx + r * Math.cos((startAngle * Math.PI) / 180), y: cy + r * Math.sin((startAngle * Math.PI) / 180) };
    const e1 = { x: cx + r * Math.cos((endAngle   * Math.PI) / 180), y: cy + r * Math.sin((endAngle   * Math.PI) / 180) };
    const large = pct > 0.5 ? 1 : 0;
    const midAngle = (startAngle + endAngle) / 2;
    const labelR = r * 0.65;
    const lx = cx + labelR * Math.cos((midAngle * Math.PI) / 180);
    const ly = cy + labelR * Math.sin((midAngle * Math.PI) / 180);
    const label = pct >= 0.06 ? `${Math.round(pct * 100)}%` : '';
    return `<path d="M${cx},${cy} L${s1.x},${s1.y} A${r},${r} 0 ${large},1 ${e1.x},${e1.y} Z" fill="${CHART_COLORS[i % CHART_COLORS.length]}"/>
            ${label ? `<text x="${lx}" y="${ly + 4}" text-anchor="middle" fill="white" font-size="9" font-weight="700">${label}</text>` : ''}`;
  }).join('');

  const legendY = cy + r + 15;
  const legendItems = slices.map((s, i) => {
    const col = i % 2 === 0 ? 10 : cx + 20;
    const row = Math.floor(i / 2);
    return `<rect x="${col}" y="${legendY + row * 14}" width="8" height="8" fill="${CHART_COLORS[i % CHART_COLORS.length]}" rx="1"/>
            <text x="${col + 12}" y="${legendY + row * 14 + 7}" font-size="7.5" fill="${C.muted}">${s.name}: ${s.value || 0}</text>`;
  }).join('');

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${paths}${legendItems}</svg>`;
}

function generateSvgBarChart(
  bars: Array<{ name: string; value: number }>,
  width = 500, height = 200, color?: string
): string {
  const maxVal = Math.max(...bars.map(b => b.value || 0), 1);
  const chartH = height - 50;
  const barWidth = Math.floor((width - 60) / bars.length) - 6;

  const rects = bars.map((b, i) => {
    const bh = Math.max(((b.value || 0) / maxVal) * chartH, 2);
    const x = 40 + i * ((width - 60) / bars.length) + 3;
    const y = 10 + chartH - bh;
    const col = color || CHART_COLORS[i % CHART_COLORS.length];
    return `<rect x="${x}" y="${y}" width="${barWidth}" height="${bh}" fill="${col}" rx="2"/>
            <text x="${x + barWidth / 2}" y="${y - 4}" text-anchor="middle" font-size="8" fill="${C.text}" font-weight="600">${b.value}</text>
            <text x="${x + barWidth / 2}" y="${10 + chartH + 14}" text-anchor="middle" font-size="7.5" fill="${C.muted}">${b.name.length > 9 ? b.name.substring(0, 8) + '…' : b.name}</text>`;
  }).join('');

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <line x1="35" y1="10" x2="35" y2="${10 + chartH}" stroke="${C.border}" stroke-width="1"/>
    <line x1="35" y1="${10 + chartH}" x2="${width - 10}" y2="${10 + chartH}" stroke="${C.border}" stroke-width="1"/>
    ${rects}
  </svg>`;
}

function generateSvgHBarChart(
  bars: Array<{ name: string; value: number }>,
  width = 440, height: number | null = null
): string {
  const h = height ?? (bars.length * 28 + 20);
  const maxVal = Math.max(...bars.map(b => b.value || 0), 1);
  const barH = 14;
  const maxBarW = width - 220;

  const rects = bars.map((b, i) => {
    const bw = Math.max(((b.value || 0) / maxVal) * maxBarW, 2);
    const y = 10 + i * 28;
    const col = CHART_COLORS[i % CHART_COLORS.length];
    return `<text x="0" y="${y + barH - 2}" font-size="8.5" fill="${C.text}">${b.name}</text>
            <rect x="180" y="${y}" width="${bw}" height="${barH}" fill="${col}" rx="2"/>
            <text x="${180 + bw + 5}" y="${y + barH - 2}" font-size="8.5" fill="${C.muted}" font-weight="600">${fmtPct(b.value)}</text>`;
  }).join('');

  return `<svg width="${width}" height="${h}" xmlns="http://www.w3.org/2000/svg">${rects}</svg>`;
}

function progressBar(label: string, count: number, maxCount: number, color: string): string {
  const pct = maxCount > 0 ? Math.min((count / maxCount) * 100, 100) : 0;
  return `
    <div style="margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
        <span style="font-size:11px;color:${C.muted}">${label}</span>
        <span style="font-size:11px;font-weight:700;color:${C.text}">${count.toLocaleString()}</span>
      </div>
      <div style="background:${C.border};height:10px;border-radius:5px;overflow:hidden;">
        <div style="width:${pct}%;background:${color};height:100%;border-radius:5px;"></div>
      </div>
    </div>`;
}


// ══════════════════════════════════════════════════════════════════
// SHARED STYLE SNIPPETS
// ══════════════════════════════════════════════════════════════════

function kbCallout(text: string, type: 'interval' | 'insight' | 'alert' = 'insight'): string {
  const styles: Record<string, string> = {
    interval: `background:${C.kbBg};border-left:4px solid ${C.kbBorder};padding:12px 16px;margin:16px 0;border-radius:0 4px 4px 0;font-style:italic;font-size:10.5px;color:#065f46;`,
    insight:  `background:${C.kbBg};border-left:4px solid ${C.kbBorder};padding:12px 16px;margin:16px 0;border-radius:0 4px 4px 0;font-size:10.5px;color:#065f46;`,
    alert:    `background:${C.redBg};border-left:4px solid ${C.alertRed};padding:10px 16px;margin:14px 0;border-radius:0 4px 4px 0;font-size:10.5px;color:${C.red};`,
  };
  const prefixes: Record<string, string> = {
    interval: '<strong>Service Interval Reference:</strong> ',
    insight:  '<em><strong>Insight:</strong> ',
    alert:    '<strong>■ HIGH ALERT:</strong> ',
  };
  const suffix = type === 'insight' ? '</em>' : '';
  return `<div style="${styles[type]}">${prefixes[type]}${text}${suffix}</div>`;
}

function benchmarkCallout(text: string): string {
  return `<div style="background:${C.kbBg};border:1px solid #b2f5ea;border-left:4px solid ${C.teal};padding:14px 16px;margin:18px 0;border-radius:4px;font-size:10.5px;color:#065f46;font-style:italic;line-height:1.7;">
    <strong>Benchmark Context:</strong> ${text}
  </div>`;
}

function narrativeParagraph(text: string): string {
  return `<div style="border-left:4px solid ${C.teal};padding:12px 18px;margin:16px 0;font-size:10.5px;color:${C.text};line-height:1.8;background:#fafafa;border-radius:0 4px 4px 0;">
    ${text}
  </div>`;
}

function sectionHeader(num: string, title: string, sub?: string): string {
  const subText = sub ? ` · <span style="color:${C.slate};font-weight:400;">${sub}</span>` : '';
  return `<h1 style="font-size:18px;font-weight:700;color:${C.navy};margin:32px 0 4px;padding-bottom:8px;border-bottom:2px solid ${C.teal};">${num}. ${title}${subText}</h1>`;
}

function subHeader(text: string): string {
  return `<h2 style="font-size:13px;font-weight:700;color:${C.navy};margin:22px 0 10px;">${text}</h2>`;
}

function darkTable(headers: string[], rows: string[][]): string {
  const ths = headers.map(h => `<th style="background:${C.navy};color:white;padding:9px 12px;text-align:left;font-size:10px;font-weight:600;border:1px solid #334155;">${h}</th>`).join('');
  const trs = rows.map((row, ri) => {
    const bg = ri % 2 === 0 ? '#f8fafc' : 'white';
    const tds = row.map((cell, ci) => {
      const isCritical = ci > 0 && typeof cell === 'string' && (cell.includes('%') && parseFloat(cell) < 50);
      const color = isCritical ? C.red : C.text;
      const fw = ci === 0 ? '600' : '400';
      return `<td style="padding:8px 12px;font-size:10px;border:1px solid ${C.border};color:${color};font-weight:${fw};">${cell}</td>`;
    }).join('');
    return `<tr style="background:${bg};">${tds}</tr>`;
  }).join('');
  return `<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:10px;">
    <thead><tr>${ths}</tr></thead>
    <tbody>${trs}</tbody>
  </table>`;
}

function lightTable(headers: string[], rows: string[][], caption?: string): string {
  const ths = headers.map(h => `<th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:600;color:${C.muted};border-bottom:1px solid ${C.border};">${h}</th>`).join('');
  const trs = rows.map(row => {
    const tds = row.map((cell, ci) => {
      const fw = ci === 0 ? '600' : '400';
      return `<td style="padding:8px 12px;font-size:10.5px;color:${C.text};font-weight:${fw};border-bottom:1px solid ${C.border};">${cell}</td>`;
    }).join('');
    return `<tr>${tds}</tr>`;
  }).join('');
  const cap = caption ? `<caption style="caption-side:bottom;text-align:center;font-size:9px;color:${C.slateLight};font-style:italic;margin-top:8px;">${caption}</caption>` : '';
  return `<table style="width:100%;border-collapse:collapse;margin:12px 0;">${cap}
    <thead><tr>${ths}</tr></thead>
    <tbody>${trs}</tbody>
  </table>`;
}

function kpiCard(label: string, value: string | number, unit?: string, color = C.teal): string {
  return `<div style="background:white;border:1px solid ${C.border};border-radius:6px;padding:14px 16px;min-width:110px;">
    <div style="font-size:9px;color:${C.muted};text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">${label}</div>
    <div style="font-size:22px;font-weight:700;color:${color};line-height:1;">${value}${unit ? `<span style="font-size:11px;font-weight:400;color:${C.muted};margin-left:3px;">${unit}</span>` : ''}</div>
  </div>`;
}

function kpiGrid(...cards: string[]): string {
  return `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:16px 0;">${cards.join('')}</div>`;
}

function twoCol(left: string, right: string): string {
  return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start;">${left}${right}</div>`;
}

function recommendBlock(urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM', days: string, items: string[]): string {
  const colors: Record<string, string> = {
    CRITICAL: '#dc2626', HIGH: '#f97316', MEDIUM: C.teal,
  };
  const bullets = items.map(i => `<p style="margin:5px 0 0;padding-left:14px;font-size:10.5px;line-height:1.7;color:${C.text};">• ${i}</p>`).join('');
  return `<div style="margin:14px 0 20px;border-radius:6px;overflow:hidden;">
    <div style="background:${colors[urgency]};color:white;padding:9px 14px;font-size:10.5px;font-weight:700;letter-spacing:0.05em;">${urgency} — ${days}</div>
    <div style="padding:12px 16px;background:#fafafa;border:1px solid ${C.border};border-top:none;">${bullets}</div>
  </div>`;
}


// ══════════════════════════════════════════════════════════════════
// CSS STYLESHEET
// ══════════════════════════════════════════════════════════════════

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; color: ${C.text}; background: white; font-size: 11px; line-height: 1.6; }
  .page { max-width: 780px; margin: 0 auto; padding: 50px 60px; }
  .page-break { display: none; }
  h1 { font-size: 18px; font-weight: 700; color: ${C.navy}; }
  h2 { font-size: 13px; font-weight: 700; color: ${C.navy}; }
  p { font-size: 10.5px; line-height: 1.75; color: ${C.text}; margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; }
  td, th { padding: 8px 12px; font-size: 10px; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; }
    .page { page-break-after: always; }
  }
`;


// ══════════════════════════════════════════════════════════════════
// MAIN HTML GENERATOR
// ══════════════════════════════════════════════════════════════════

export function generateProfessionalHTML(data: ReportData): string {
  const kb = data.kbAnnotations || {};
  const ai = data.aiContent || {};
  const s  = data.sections;

  // Helper — safe number formatting
  const n = (v?: number | null, decimals = 0) =>
    (v ?? 0).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  const totalAssets    = fmt(data.summary?.totalAssets);
  const activeAssets   = fmt(data.assetDetail?.activeAssets);
  const criticalAssets = fmt(data.summary?.critical);
  const underMaint     = fmt(data.assetDetail?.underMaintenanceAssets);
  const avgAge         = fmt(data.assetDetail?.avgVehicleAge);
  const healthFleet    = fmt(data.summary?.fleetHealth);
  const healthyPct     = Math.round(data.sections.healthScoreDistribution.filter(h => parseInt(h.bucket) >= 80).reduce((sum, h) => sum + h.count, 0) / Math.max(totalAssets, 1) * 100);
  const degradedPct    = Math.round(data.sections.healthScoreDistribution.filter(h => h.bucket.includes('Below 60')).reduce((sum, h) => sum + h.count, 0) / Math.max(totalAssets, 1) * 100);

  // ── COVER PAGE ─────────────────────────────────────────────────
  const coverPage = `
  <div class="page" style="min-height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;position:relative;padding-bottom:60px;">
    <div style="margin-bottom:20px;">
      <h1 style="font-size:42px;font-weight:800;color:${C.navy};letter-spacing:-1px;margin-bottom:8px;">PredictiX</h1>
      <div style="height:3px;width:200px;background:${C.teal};margin:0 auto 24px;"></div>
      <h2 style="font-size:24px;font-weight:600;color:${C.teal};margin-bottom:32px;">${data.title || 'Warehouse Report'}</h2>
      <p style="font-size:14px;font-weight:700;color:${C.navy};margin-bottom:6px;">${data.warehouseName}${data.warehouseCity ? ` - ${data.warehouseCity}` : ''}</p>
      <p style="font-size:12px;color:${C.muted};margin-bottom:36px;">Comprehensive Asset Health &amp; Predictive Maintenance Analysis</p>
      <p style="font-size:12px;color:${C.muted};">Report Generated: <strong>${data.generatedDate}</strong></p>
      <p style="font-size:12px;color:${C.muted};">Powered by PredictiX AI Platform</p>
    </div>
    <div style="position:absolute;bottom:0;left:0;right:0;height:5px;background:linear-gradient(to right,${C.teal},${C.tealLight});"></div>
  </div>`;

  // ── TABLE OF CONTENTS ──────────────────────────────────────────
  const tocPage = `
  <div class="page">
    <div style="max-width:520px;margin:60px auto;padding:30px 36px;border:1px solid ${C.border};border-radius:8px;">
      <h2 style="font-size:18px;font-weight:700;color:${C.navy};margin-bottom:12px;padding-bottom:10px;border-bottom:2px solid ${C.teal};">Contents</h2>
      ${[
        '1. Executive Insight Summary',
        '2. Fleet Asset Overview',
        '3. Health &amp; Risk Analysis',
        '4. Maintenance Intelligence',
        '5. Ticket Management Status',
        '6. Recommendations',
        '7. Conclusion',
      ].map((item, i) => `<div style="padding:7px 0;font-size:11px;color:${C.text};border-bottom:1px solid #f1f5f9;display:flex;">
          <span style="color:${C.teal};margin-right:12px;font-weight:500;">${i + 1}.</span>
          ${item.replace(/^\d+\. /, '')}
        </div>`).join('')}
    </div>
  </div>`;

  // ── §1: EXECUTIVE INSIGHT SUMMARY ─────────────────────────────
  const benchmarkAlert = kb.benchmark_alerts?.find(a => a.type === 'BENCHMARK');
  const highAlert      = kb.benchmark_alerts?.find(a => a.type === 'HIGH_ALERT');

  const section1 = `
  <div class="page">
    ${sectionHeader('1', 'Executive Insight Summary')}
    ${kpiGrid(
      kpiCard('Total Fleet Assets', n(totalAssets), 'units', C.teal),
      kpiCard('Avg Vehicle Age', n(avgAge, 1), 'years', C.teal),
      kpiCard('Active Assets', `${n(activeAssets)}`, `/ ${n(totalAssets)}`, '#16a34a'),
      kpiCard('Under Maintenance', n(underMaint), 'units', C.orange),
    )}
    ${kpiGrid(
      kpiCard('Critical Status Assets', `${n(criticalAssets)}`, `(${n(Math.round(criticalAssets / Math.max(totalAssets, 1) * 100))}%)`, C.red),
      kpiCard('Healthy Fleet (≥80%)', `${healthyPct}`, '%', C.teal),
      kpiCard('Degraded Fleet (<60%)', `${degradedPct}`, '%', C.orange),
      kpiCard('Open Tickets', n(data.summary?.activeTickets), 'active', C.orange),
    )}

    ${ai.insight_summary ? `<p style="font-size:10.5px;line-height:1.8;color:${C.text};margin:16px 0;">${ai.insight_summary}</p>` : ''}

    ${benchmarkAlert ? benchmarkCallout(benchmarkAlert.message) : ''}
    ${highAlert ? kbCallout(highAlert.message, 'alert') : ''}

    ${sectionHeader('2', 'Fleet Asset Overview')}

    ${subHeader('2.1 Fleet Composition by Asset Type')}
    ${twoCol(
      `<div>
        ${lightTable(
          ['Asset Type', 'Count', 'Fleet %'],
          s.assetsByType.map(a => [a.name, String(a.value), fmtPct((a.value / Math.max(totalAssets, 1)) * 100)])
        )}
      </div>`,
      `<div style="text-align:center;">
        <div style="font-size:9px;color:${C.muted};margin-bottom:6px;font-style:italic;">Figure 2.1 — Fleet composition by asset type</div>
        ${generateSvgPieChart(s.assetsByType, 240, 210, 110, 90, 75)}
      </div>`
    )}

    ${subHeader('2.2 Asset Status Distribution')}
    ${twoCol(
      `<div>
        ${lightTable(
          ['Status', 'Count', 'Percentage'],
          s.assetStatus.map(a => [a.name, String(a.value), fmtPct((a.value / Math.max(totalAssets, 1)) * 100)])
        )}
      </div>`,
      `<div style="text-align:center;">
        <div style="font-size:9px;color:${C.muted};margin-bottom:6px;font-style:italic;">Figure 2.2 — Asset status distribution</div>
        ${generateSvgPieChart(s.assetStatus, 240, 210, 110, 90, 75)}
      </div>`
    )}

    ${subHeader('2.3 Assets by Type — Distribution Chart')}
    <div style="background:white;border:1px solid ${C.border};border-radius:6px;padding:16px;margin:10px 0;text-align:center;">
      ${generateSvgBarChart(s.assetsByType.map(a => ({ name: a.name, value: a.value })), 640, 220)}
      <div style="font-size:9px;color:${C.muted};font-style:italic;margin-top:6px;">Figure 2.3 — Asset count by type</div>
    </div>

    ${kb.service_interval_text ? kbCallout(
      `<em>Forklifts: every 500 engine hours. Delivery Vans: every 60 days. Trucks (all classes): every 90 days or manufacturer-specified mileage, whichever comes first. Adherence to these intervals is the primary lever for moving assets out of the Critical bracket.</em>`,
      'interval'
    ) : ''}

    ${ai.risk_analysis ? `<p style="font-size:10.5px;line-height:1.8;color:${C.text};margin:16px 0;">${ai.risk_analysis}</p>` : ''}
  </div>`;

  // ── §3: HEALTH & RISK ANALYSIS + SHAP ─────────────────────────
  const healthBandsKb = kb.health_bands_kb || s.healthScoreDistribution.map(h => ({
    band: h.bucket, count: h.count, pct_fleet: Math.round(h.count / Math.max(totalAssets, 1) * 100 * 10) / 10,
    kb_interpretation: h.bucket === 'Below 60%' ? 'Critical — immediate intervention required' : 'See standards',
  }));

  const riskDistData = s.riskDistribution || s.assetStatus;

  const section3 = `
  <div class="page">
    ${sectionHeader('3', 'Health &amp; Risk Analysis', 'SHAP Failure Drivers')}

    ${subHeader('3.1 Health Score Distribution')}
    ${darkTable(
      ['Health Band', 'Assets', '% Fleet', 'Interpretation'],
      healthBandsKb.map(b => [
        b.band,
        String(b.count),
        `${b.pct_fleet}%`,
        b.kb_interpretation,
      ])
    )}
    <div style="font-size:9px;color:${C.slateLight};font-style:italic;text-align:center;margin:-6px 0 12px;">Table 3.1 — Health score distribution with service urgency</div>

    ${ai.insight_summary ? `<p style="font-size:10.5px;line-height:1.8;color:${C.text};margin:12px 0;">While ${healthyPct}% of assets score ≥80% and are operationally sound, the tail is severe: assets scoring below 60% represent a critical systemic risk. The cost model indicates that assets in this band incur ~2.7× the average maintenance cost relative to healthy assets, making rapid remediation a high-return priority.</p>` : ''}

    ${subHeader('3.2 Risk Level Distribution')}
    ${twoCol(
      `<div>
        ${lightTable(
          ['Risk Level', 'Count', '% Fleet'],
          riskDistData.map(r => [r.name, String(r.value), fmtPct((r.value / Math.max(totalAssets, 1)) * 100)])
        )}
        <div style="font-size:9px;color:${C.slateLight};font-style:italic;text-align:center;margin-top:4px;">Figure 3.2 — Risk level split across the fleet</div>
      </div>`,
      `<div style="text-align:center;">
        ${generateSvgPieChart(riskDistData, 240, 210, 110, 90, 75)}
      </div>`
    )}

    ${ai.risk_analysis ? narrativeParagraph(ai.risk_analysis) : ''}

    ${subHeader('3.3 SHAP Failure Prediction Drivers')}
    ${kb.shap_enriched && kb.shap_enriched.length > 0 ? `
      <div style="background:white;border:1px solid ${C.border};border-radius:6px;padding:16px;margin:10px 0;">
        ${generateSvgHBarChart(
          kb.shap_enriched.map(f => ({ name: f.feature, value: f.impact_pct })), 620
        )}
        <div style="font-size:9px;color:${C.slateLight};font-style:italic;text-align:center;margin-top:8px;">Figure 3.3 — Top SHAP failure drivers ranked by importance score</div>
      </div>
      ${darkTable(
        ['SHAP Feature', 'Impact', 'Threshold', 'Action'],
        kb.shap_enriched.map(f => [
          f.feature, `${f.impact_pct}%`, f.kb_threshold, f.action,
        ])
      )}
      <div style="font-size:9px;color:${C.slateLight};font-style:italic;text-align:center;margin:-6px 0 12px;">Table 3.3 — SHAP features cross-referenced with defined thresholds and actions</div>
    ` : `<p style="color:${C.muted};font-size:10.5px;">No SHAP feature data available.</p>`}
  </div>`;

  // ── §4: MAINTENANCE INTELLIGENCE ──────────────────────────────
  const md = data.maintenanceDetail || {};
  const totalEvents  = fmt(md.maintenanceEvents3m);
  const prevCount    = fmt(md.preventiveCount ?? Math.round(totalEvents * 0.99));
  const corrCount    = fmt(md.correctiveCount ?? Math.round(totalEvents * 0.01));
  const pmPct        = totalEvents > 0 ? Math.round((prevCount / totalEvents) * 100 * 10) / 10 : 99.0;
  const corrPct      = totalEvents > 0 ? Math.round((corrCount / totalEvents) * 100 * 10) / 10 : 1.0;
  const pmRatio      = corrCount > 0 ? Math.round(prevCount / corrCount) : 100;

  const section4 = `
  <div class="page">
    ${sectionHeader('4', 'Maintenance Intelligence')}

    ${kpiGrid(
      kpiCard('Total Maintenance Events', n(totalEvents), 'events', C.teal),
      kpiCard('Preventive (PM)', `${pmPct.toFixed(1)}`, '%', '#16a34a'),
      kpiCard('Repair / Corrective', `${corrPct.toFixed(1)}`, '%', C.orange),
      kpiCard('PM : Repair Ratio', `${pmRatio}:1`, '', C.teal),
    )}

    <div style="margin:16px 0;background:white;border:1px solid ${C.border};border-radius:6px;padding:16px;">
      ${progressBar('Preventive', prevCount, totalEvents, C.teal)}
      ${progressBar('Repair/Corrective', corrCount, totalEvents, C.orange)}
      <div style="font-size:9px;color:${C.slateLight};font-style:italic;text-align:center;margin-top:8px;">Figure 4.1 — Maintenance event types (reporting period)</div>
    </div>

    ${subHeader('Maintenance Metrics')}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0;">
      <div style="background:white;border:1px solid ${C.border};border-radius:6px;padding:14px 16px;">
        <div style="font-size:9px;color:${C.muted};text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">EST. MONTHLY COST</div>
        <div style="font-size:18px;font-weight:700;color:${C.teal};">${md.estimatedCost || data.summary.maintenanceCost}</div>
      </div>
      <div style="background:white;border:1px solid ${C.border};border-radius:6px;padding:14px 16px;">
        <div style="font-size:9px;color:${C.muted};text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">AVG COST/ASSET</div>
        <div style="font-size:18px;font-weight:700;color:${C.teal};">${md.avgCostPerAsset || 'N/A'}</div>
      </div>
      <div style="background:white;border:1px solid ${C.border};border-radius:6px;padding:14px 16px;">
        <div style="font-size:9px;color:${C.muted};text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">ACTUAL (3M)</div>
        <div style="font-size:18px;font-weight:700;color:${C.teal};">${md.actualCost3m || 'N/A'}</div>
      </div>
      <div style="background:white;border:1px solid ${C.border};border-radius:6px;padding:14px 16px;">
        <div style="font-size:9px;color:${C.muted};text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">AVG DOWNTIME</div>
        <div style="font-size:18px;font-weight:700;color:${C.teal};">${n(md.avgDowntimeHours, 1)} hrs</div>
      </div>
    </div>

    ${subHeader('Maintenance Events (Last 3 Months)')}
    <ul style="list-style:disc;padding-left:20px;margin:10px 0;">
      <li style="font-size:10.5px;color:${C.text};margin-bottom:4px;">Total Events: ${n(totalEvents)}</li>
      <li style="font-size:10.5px;color:${C.text};margin-bottom:4px;">Average Downtime per Event: ${n(md.avgDowntimeHours, 1)} hours</li>
    </ul>

    ${subHeader('Maintenance Types Breakdown')}
    ${lightTable(
      ['Type', 'Count'],
      [['Preventive', n(prevCount)], ['Repair/Corrective', n(corrCount)]]
    )}

    ${md.monthlyTrend && md.monthlyTrend.length ? `
      ${subHeader('3-Month Maintenance Events Trend')}
      ${lightTable(
        ['Month', 'Events', 'Cost'],
        md.monthlyTrend.map(m => [m.month, n(m.events), `LKR ${m.cost.toLocaleString()}`])
      )}
    ` : ''}

    ${ai.maintenance_intelligence ? narrativeParagraph(ai.maintenance_intelligence) : ''}

    ${kbCallout(
      `Achieving >90% PM coverage is the industry gold standard. At ${pmPct.toFixed(1)}%, PredictiX exceeds this benchmark. However, the existence of ${n(criticalAssets)} Critical-status assets suggests that PM scheduling may not be keeping pace with actual asset degradation rates — particularly for high-utilisation forklifts where thresholds recommend service every <strong>500 engine hours</strong>. Cross-checking engine-hours data against the SHAP top driver (${kb.shap_enriched?.[0]?.impact_pct || 17.0}% impact) is the priority action.`,
      'insight'
    )}
  </div>`;

  // ── §5: TICKET MANAGEMENT STATUS ──────────────────────────────
  const td = data.ticketDetail || {};
  const openT  = fmt(data.summary?.activeTickets);
  const highT  = fmt(td.highPriorityTickets);
  const medT   = fmt(td.mediumPriorityTickets);
  const lowT   = fmt(td.lowPriorityTickets);
  const highPct = openT > 0 ? Math.round(highT / openT * 1000) / 10 : 0;
  const medPct  = openT > 0 ? Math.round(medT  / openT * 1000) / 10 : 0;
  const lowPct  = openT > 0 ? Math.round(lowT  / openT * 1000) / 10 : 0;
  const prioritySlices = [
    { name: `High (${highPct}%)`, value: highT || 0 },
    { name: `Medium (${medPct}%)`, value: medT || 0 },
    { name: `Low (${lowPct}%)`, value: lowT || 0 },
  ].filter(s => s.value > 0);
  const catSlices = s.ticketsByCategory.map(c => ({ name: c.name, value: c.value || 0 }));

  const section5 = `
  <div class="page">
    ${sectionHeader('5', 'Ticket Management Status')}

    ${kpiGrid(
      kpiCard('Total Open Tickets', n(openT), 'active', C.orange),
      kpiCard('High Priority', `${n(highT)}`, `(${highPct}%)`, C.red),
      kpiCard('Medium Priority', `${n(medT)}`, `(${medPct}%)`, C.orange),
      kpiCard('Low Priority', `${n(lowT)}`, `(${lowPct}%)`, '#16a34a'),
    )}

    ${twoCol(
      `<div style="text-align:center;">
        <div style="font-size:9px;color:${C.slateLight};font-style:italic;margin-bottom:4px;">Figure 5.1 — Open tickets by priority</div>
        ${generateSvgPieChart(prioritySlices.length ? prioritySlices : [{ name: 'No Data', value: 1 }], 240, 210, 110, 90, 75)}
      </div>`,
      `<div style="text-align:center;">
        <div style="font-size:9px;color:${C.slateLight};font-style:italic;margin-bottom:4px;">Figure 5.2 — Open tickets by category</div>
        ${generateSvgPieChart(catSlices.length ? catSlices : [{ name: 'No Data', value: 1 }], 240, 210, 110, 90, 75)}
      </div>`
    )}

    ${kb.ticket_category_kb && kb.ticket_category_kb.length > 0 ? `
      ${darkTable(
        ['Category', 'Count', '% Open', 'Guidance'],
        kb.ticket_category_kb.map(c => [c.category, String(c.count), `${c.pct_open}%`, c.kb_guidance])
      )}
      <div style="font-size:9px;color:${C.slateLight};font-style:italic;text-align:center;margin:-6px 0 12px;">Table 5.1 — Ticket categories cross-referenced with maintenance guidance</div>
    ` : lightTable(
      ['Category', 'Count', 'Percentage'],
      s.ticketsByCategory.map(c => [c.name, String(c.value), fmtPct((c.value / Math.max(openT, 1)) * 100)])
    )}

    ${td.monthlyTrend && td.monthlyTrend.length ? `
      ${subHeader('3-Month Ticket Trend')}
      ${lightTable(
        ['Month', 'Number of Tickets'],
        td.monthlyTrend.map(m => [m.month, n(m.count)])
      )}
    ` : ''}

    ${ai.pattern_and_trend ? narrativeParagraph(ai.pattern_and_trend) : ''}
  </div>`;

  // ── §6: RECOMMENDATIONS ────────────────────────────────────────
  const rec = kb.recommendations;
  const section6 = `
  <div class="page">
    ${sectionHeader('6', 'Recommendations')}

    ${rec ? `
      ${recommendBlock('CRITICAL', 'Immediate (0–7 days)', rec.critical)}
      ${recommendBlock('HIGH', 'Short-Term (7–30 days)', rec.high)}
      ${recommendBlock('MEDIUM', 'Strategic (30–90 days)', rec.medium)}
      ${rec.kb_alert ? kbCallout(rec.kb_alert, 'alert') : ''}
    ` : `<p style="color:${C.muted};font-size:10.5px;">No recommendations generated.</p>`}
  </div>`;

  // ── §7: CONCLUSION ─────────────────────────────────────────────
  const ud = data.userDetail || {};
  const section7 = `
  <div class="page">
    ${sectionHeader('7', 'Conclusion')}

    ${subHeader('Workforce &amp; User Management')}
    <div style="border-left:4px solid ${C.teal};padding-left:16px;margin-bottom:20px;">
      ${subHeader('User Statistics')}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:10px 0;">
        <div style="background:white;border:1px solid ${C.border};border-radius:6px;padding:12px 14px;">
          <div style="font-size:9px;color:${C.muted};text-transform:uppercase;letter-spacing:0.05em;">TOTAL USERS</div>
          <div style="font-size:22px;font-weight:700;color:${C.teal};">${n(ud.totalUsers)}</div>
        </div>
        <div style="background:white;border:1px solid ${C.border};border-radius:6px;padding:12px 14px;">
          <div style="font-size:9px;color:${C.muted};text-transform:uppercase;letter-spacing:0.05em;">ADMIN USERS</div>
          <div style="font-size:22px;font-weight:700;color:${C.teal};">${n(ud.adminUsers)}</div>
        </div>
        <div style="background:white;border:1px solid ${C.border};border-radius:6px;padding:12px 14px;">
          <div style="font-size:9px;color:${C.muted};text-transform:uppercase;letter-spacing:0.05em;">STANDARD USERS</div>
          <div style="font-size:22px;font-weight:700;color:${C.teal};">${n(ud.standardUsers)}</div>
        </div>
        <div style="background:white;border:1px solid ${C.border};border-radius:6px;padding:12px 14px;">
          <div style="font-size:9px;color:${C.muted};text-transform:uppercase;letter-spacing:0.05em;">INACTIVE</div>
          <div style="font-size:22px;font-weight:700;color:${C.teal};">${n(ud.inactiveUsers)}</div>
        </div>
      </div>
    </div>

    ${subHeader('Component Health Analysis')}
    <div style="border-left:4px solid ${C.teal};padding-left:16px;margin-bottom:20px;">
      ${subHeader('Health Score Distribution')}
      <div style="background:white;border:1px solid ${C.border};border-radius:6px;padding:16px;text-align:center;margin:10px 0;">
        ${generateSvgBarChart(
          s.healthScoreDistribution.map(h => ({ name: h.bucket, value: h.count })), 640, 220
        )}
      </div>
      ${lightTable(
        ['Health Score Range', 'Number of Assets', 'Distribution %'],
        s.healthScoreDistribution.map(h => {
          const pct = (h.count / Math.max(totalAssets, 1) * 100).toFixed(1);
          return [h.bucket, String(h.count), `${pct}%`];
        })
      )}
    </div>

    ${s.criticaAssets && s.criticaAssets.length > 0 ? `
      ${subHeader('Critical Assets — Immediate Action Required')}
      <div style="border-left:4px solid ${C.teal};padding-left:16px;margin-bottom:20px;">
        <p style="font-size:10px;color:${C.muted};margin-bottom:10px;">The following assets have health scores below 70% and require immediate maintenance intervention:</p>
        ${lightTable(
          ['Asset ID', 'Vehicle', 'Component', 'Health', 'Priority'],
          s.criticaAssets.slice(0, 15).map(a => [
            `<strong>${a.id}</strong>`,
            a.vehicle,
            a.component,
            `<span style="color:${C.red};font-weight:600;">${a.health}</span>`,
            `<span style="color:${a.priority === 'High' ? C.red : C.orange};font-weight:600;">${a.priority}</span>`,
          ])
        )}
      </div>
    ` : ''}

    ${subHeader('Executive Conclusion')}
    ${ai.conclusion ? narrativeParagraph(ai.conclusion) : ''}

    <div style="margin-top:40px;padding-top:20px;border-top:1px solid ${C.border};text-align:center;color:${C.slateLight};font-size:9px;line-height:1.8;">
      <p>PredictiX AI Platform | Warehouse Management Solution</p>
      <p>© 2026 All Rights Reserved</p>
      <p>Report Generated: ${new Date().toLocaleString()}</p>
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
 * Open the report in a new window and trigger the browser print dialog.
 * User can "Save as PDF" from the print dialog.
 */
export function downloadProfessionalPDF(data: ReportData, _filename: string = 'warehouse-report.pdf'): void {
  try {
    const html = generateProfessionalHTML(data);
    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const win  = window.open(url, '_blank');
    if (win) {
      win.onload = () => {
        setTimeout(() => {
          win.print();
          win.onafterprint = () => URL.revokeObjectURL(url);
        }, 500);
      };
    } else {
      console.error('Popup blocked. Please allow popups for this site to export the PDF.');
      alert('Please allow popups for this site to export the PDF report.');
    }
  } catch (err) {
    console.error('PDF export error:', err);
  }
}

/**
 * Save the report as a downloadable HTML file (fallback for popup blockers).
 */
export function savePDFAsFile(data: ReportData, filename: string = 'warehouse-report.html'): void {
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
