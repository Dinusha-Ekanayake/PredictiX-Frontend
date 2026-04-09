/**
 * Professional PDF Export Utility for Warehouse Reports
 * Creates well-formatted, multi-page PDFs with all warehouse data sections
 */

interface AIContent {
  insight_summary?: string;
  risk_analysis?: string;
  maintenance_intelligence?: string;
  pattern_and_trend?: string;
  conclusion?: string;
}

interface ReportData {
  title: string;
  warehouseName: string;
  warehouseCity?: string;
  generatedDate: string;
  aiContent?: AIContent;
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
  };
  ticketDetail?: {
    totalTickets?: number;
    openTickets?: number;
    inProgressTickets?: number;
    resolvedTickets?: number;
    closedTickets?: number;
    highPriorityTickets?: number;
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
    ticketPriority: Array<{ name: string; value: number }>;
    ticketsByCategory: Array<{ name: string; value: number }>;
    healthScoreDistribution: Array<{ bucket: string; count: number }>;
    maintenanceTypes?: Array<{ name: string; value: number }>;
    riskBreakdown?: Array<{ name: string; value: number }>;
    criticaAssets: Array<{
      id: string;
      vehicle: string;
      component: string;
      health: string;
      priority: string;
      status: string;
    }>;
  };
  trends?: {
    ticketTrend?: Array<{ month: string; tickets: number }>;
    maintenanceTrend?: Array<{ month: string; events: number; cost: number }>;
  };
  shapFeatures?: Array<{ feature: string; importance: number }>;
}

/**
 * Helper: Generate simple bar chart SVG with multiple colors
 */
function generateBarChart(
  data: Array<{ name: string; value: number }>,
  width = 500,
  height = 300
): string {
  if (!data || !data.length) return "";
  
  const maxValue = Math.max(...data.map(d => d.value || 0));
  if (maxValue === 0) return "";
  
  const colors = ["#10b981", "#3b82f6", "#ef4444", "#f97316", "#06b6d4"];
  const barWidth = width / (data.length * 1.5);
  const barGap = barWidth * 0.5;
  const chartHeight = height - 60;
  
  return `<svg width="${width}" height="${height}" style="border: 1px solid #e5e7eb; border-radius: 8px;">
    ${data.map((item, idx) => {
      const barHeight = ((item.value || 0) / maxValue) * chartHeight;
      const x = idx * (barWidth + barGap) + 40;
      const y = chartHeight - barHeight + 30;
      const label = (item.name || 'N/A').slice(0, 10);
      const color = colors[idx % colors.length];
      return `
        <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${color}" opacity="0.85" />
        <text x="${x + barWidth / 2}" y="${y - 5}" font-size="10" text-anchor="middle" font-weight="bold">${item.value || 0}</text>
        <text x="${x + barWidth / 2}" y="${height - 10}" font-size="9" text-anchor="middle" fill="#666">${label}</text>
      `;
    }).join("")}
    <line x1="40" y1="${height - 30}" x2="${width - 20}" y2="${height - 30}" stroke="#ccc" />
    <text x="10" y="20" font-size="12" font-weight="bold">Distribution Chart</text>
  </svg>`;
}

/**
 * Helper: Generate pie chart SVG
 */
function generatePieChart(
  data: Array<{ name: string; value: number }>,
  width = 450,
  height = 280
): string {
  if (!data || !data.length) return "";
  
  const total = data.reduce((sum, d) => sum + (d.value || 0), 0);
  if (total === 0) return "";
  
  const centerX = width / 2;
  const centerY = height / 2 - 20;
  const radius = 80;
  
  const colors = ["#10b981", "#3b82f6", "#ef4444", "#f97316", "#06b6d4", "#8b5cf6"];
  
  let currentAngle = -Math.PI / 2;
  const slices = data.map((item, idx) => {
    const sliceAngle = ((item.value || 0) / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    const largeArc = sliceAngle > Math.PI ? 1 : 0;
    const path = `M${centerX},${centerY} L${x1},${y1} A${radius},${radius} 0 ${largeArc},1 ${x2},${y2} Z`;
    
    const labelAngle = startAngle + sliceAngle / 2;
    const labelRadius = radius * 0.7;
    const labelX = centerX + labelRadius * Math.cos(labelAngle);
    const labelY = centerY + labelRadius * Math.sin(labelAngle);
    const percentage = ((item.value || 0) / total * 100).toFixed(0);
    
    currentAngle = endAngle;
    return { path, labelX, labelY, percentage, item, color: colors[idx % colors.length] };
  });
  
  return `<svg width="${width}" height="${height}" style="border: 1px solid #e5e7eb; border-radius: 8px;">
    <text x="10" y="20" font-size="12" font-weight="bold">Distribution Chart</text>
    ${slices.map(s => `<path d="${s.path}" fill="${s.color}" opacity="0.85" stroke="white" stroke-width="2" />`).join("")}
    ${slices.map(s => `<text x="${s.labelX}" y="${s.labelY}" font-size="10" font-weight="bold" text-anchor="middle" fill="white">${s.percentage}%</text>`).join("")}
    <g style="font-size: 9px;">
      ${data.map((item, idx) => `<g><rect x="10" y="${height - 60 + idx * 15}" width="10" height="10" fill="${colors[idx % colors.length]}" opacity="0.85" /></g><text x="25" y="${height - 50 + idx * 15}" fill="#333">${(item.name || 'N/A').slice(0, 15)}: ${item.value || 0}</text>`).join("")}
    </g>
  </svg>`;
}

/**
 * Generate professional HTML for PDF export
 * Includes multiple sections and proper formatting
 */
export function generateProfessionalHTML(data: ReportData): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #000;
          background: #fff;
        }

        @page {
          size: A4 portrait;
          margin: 20mm 15mm;
        }

        @media print {
          body { margin: 0; padding: 0; }
          .page-break { page-break-after: always; }
          .section { page-break-inside: avoid; }
          table { page-break-inside: avoid; }
          tr { page-break-inside: avoid; }
        }

        body {
          font-size: 11px;
          line-height: 1.5;
        }

        /* Cover Page */
        .cover-page {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          text-align: center;
          page-break-after: always;
          border-bottom: 3px solid #14b8a6;
          padding: 40px;
        }

        .cover-page h1 {
          font-size: 48px;
          color: #0f172a;
          margin-bottom: 10px;
          font-weight: 700;
        }

        .cover-page h2 {
          font-size: 28px;
          color: #14b8a6;
          margin-bottom: 20px;
          font-weight: 600;
        }

        .cover-page p {
          font-size: 14px;
          color: #64748b;
          margin: 10px 0;
        }

        .cover-page .date {
          margin-top: 40px;
          color: #475569;
          font-size: 12px;
        }

        /* Headers & Titles */
        h1 {
          font-size: 28px;
          color: #0f172a;
          margin: 20px 0 15px;
          font-weight: 400;
          border-bottom: 2px solid #14b8a6;
          padding-bottom: 10px;
        }

        h2 {
          font-size: 20px;
          color: #0f172a;
          margin: 18px 0 12px;
          font-weight: 600;
        }

        h3 {
          font-size: 14px;
          color: #334155;
          margin: 12px 0 8px;
          font-weight: 600;
        }

        /* Section Container */
        .section {
          margin-bottom: 24px;
          padding: 12px;
          background: #f8fafc;
          border-left: 4px solid #14b8a6;
        }

        /* KPI Grid */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin: 15px 0;
        }

        .kpi-card {
          background: white;
          padding: 12px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }

        .kpi-label {
          font-size: 10px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .kpi-value {
          font-size: 24px;
          font-weight: 700;
          color: #14b8a6;
        }

        .kpi-sub {
          font-size: 9px;
          color: #94a3b8;
          margin-top: 4px;
        }

        /* Tables */
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
          font-size: 10px;
        }

        th {
          background: #14b8a6;
          color: white;
          padding: 8px;
          text-align: left;
          font-weight: 600;
        }

        td {
          padding: 8px;
          border-bottom: 1px solid #e2e8f0;
        }

        tr:nth-child(even) {
          background: #f8fafc;
        }

        /* Lists */
        ul {
          margin-left: 20px;
          margin: 10px 0;
        }

        li {
          margin: 6px 0;
          line-height: 1.4;
        }

        /* Status Indicators */
        .status-critical {
          color: #dc2626;
          font-weight: 600;
        }

        .status-warning {
          color: #f59e0b;
          font-weight: 600;
        }

        .status-good {
          color: #10b981;
          font-weight: 600;
        }

        /* Distribution Table */
        .distribution-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .distribution-bar {
          display: inline-block;
          height: 20px;
          background: #14b8a6;
          border-radius: 3px;
          min-width: 30%;
          margin-left: 10px;
        }

        /* Footnotes */
        .footnote {
          font-size: 9px;
          color: #94a3b8;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #e2e8f0;
        }

        /* Page number */
        .page-number {
          text-align: center;
          margin-top: 20px;
          font-size: 9px;
          color: #94a3b8;
        }

        .page-break {
          page-break-after: always;
        }

        /* Executive Summary styling */
        .summary-box {
          background: #f0fdf4;
          padding: 12px;
          border-left: 4px solid #10b981;
          margin: 12px 0;
          border-radius: 4px;
        }

        .critical-warning {
          background: #fef2f2;
          padding: 12px;
          border-left: 4px solid #dc2626;
          margin: 12px 0;
          border-radius: 4px;
          font-weight: 500;
        }

        .text-muted {
          color: #64748b;
          font-size: 10px;
        }

        .text-strong {
          font-weight: 600;
          color: #0f172a;
        }
      </style>
    </head>
    <body>
      <!-- COVER PAGE -->
      <div class="cover-page">
        <h1>PredictiX</h1>
        <h2>Warehouse Report</h2>
        <p style="font-size: 16px; margin-top: 30px;"><strong>${data.warehouseName}</strong></p>
        <p>Comprehensive Asset Health & Predictive Maintenance Analysis</p>
        <div class="date">
          <p>Report Generated: <strong>${data.generatedDate}</strong></p>
          <p>Powered by PredictiX AI Platform</p>
        </div>
      </div>

      <!-- PAGE 2: ALL FOUR CAPTIONS & PARAGRAPHS -->
      <div class="page-break"></div>

      ${data.aiContent?.insight_summary ? `
      <h1>Warehouse Overview</h1>
      <div class="summary-box">
        <p>${data.aiContent.insight_summary}</p>
      </div>
      ` : ''}

      ${data.aiContent?.risk_analysis ? `
      <h1>Risk Analysis</h1>
      <div class="critical-warning" style="background: #fef2f2; border-left-color: #f59e0b; padding: 12px;">
        <p>${data.aiContent.risk_analysis}</p>
      </div>
      ` : ''}

      ${data.aiContent?.maintenance_intelligence ? `
      <h1>Maintenance Intelligence</h1>
      <div class="section">
        <p>${data.aiContent.maintenance_intelligence}</p>
      </div>
      ` : ''}

      ${data.aiContent?.pattern_and_trend ? `
      <h1>Patterns & Trends Analysis</h1>
      <div class="section">
        <p>${data.aiContent.pattern_and_trend}</p>
      </div>
      ` : ''}

      ${data.trends?.ticketTrend && data.trends.ticketTrend.length > 0 ? `
      <div class="section">
        <h2>3-Month Ticket Trend</h2>
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Number of Tickets</th>
            </tr>
          </thead>
          <tbody>
            ${data.trends.ticketTrend.map(item => `
              <tr>
                <td><strong>${item.month}</strong></td>
                <td>${item.tickets}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      ${data.trends?.maintenanceTrend && data.trends.maintenanceTrend.length > 0 ? `
      <div class="section">
        <h2>3-Month Maintenance Events Trend</h2>
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Events</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            ${data.trends.maintenanceTrend.map(item => `
              <tr>
                <td><strong>${item.month}</strong></td>
                <td>${item.events}</td>
                <td>LKR ${(item.cost || 0).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <div class="page-break"></div>

      <!-- PAGE 1 (CONTINUED): RISK DISTRIBUTION & SHAP FEATURES -->
      ${data.sections.riskBreakdown && data.sections.riskBreakdown.length > 0 ? `
      <div class="section">
        <h2>Risk Level Distribution</h2>
        <div style="display: flex; justify-content: center; margin: 15px 0;">
          ${generatePieChart(data.sections.riskBreakdown.map(item => ({ name: item.name || 'Unknown', value: item.value || 0 })), 500, 280)}
        </div>
        <table style="margin-top: 20px;">
          <thead>
            <tr>
              <th>Risk Level</th>
              <th>Count</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${data.sections.riskBreakdown.map(item => {
              const total = data.sections.riskBreakdown!.reduce((sum, s) => sum + (s.value || 0), 0);
              const percentage = ((item.value || 0) / total * 100).toFixed(1);
              return `
                <tr>
                  <td><strong>${item.name}</strong></td>
                  <td>${item.value || 0}</td>
                  <td>${percentage}%</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      ${data.shapFeatures && data.shapFeatures.length > 0 ? `
      <div class="section">
        <h2>Top Failure Prediction Drivers (SHAP)</h2>
        <p style="font-size: 10px; color: #666; margin-bottom: 10px;">Key features influencing failure predictions, ranked by importance:</p>
        <div style="display: flex; justify-content: center; margin: 15px 0;">
          ${generateBarChart(data.shapFeatures.map(item => ({ name: item.feature || 'Feature', value: Math.round((item.importance || 0) * 100) })), 520, 280)}
        </div>
        <table style="margin-top: 20px;">
          <thead>
            <tr>
              <th>Feature</th>
              <th>Importance Score</th>
              <th>Impact %</th>
            </tr>
          </thead>
          <tbody>
            ${data.shapFeatures.map(item => {
              const total = data.shapFeatures!.reduce((sum, s) => sum + (s.importance || 0), 0);
              const percentage = ((item.importance || 0) / total * 100).toFixed(1);
              return `
                <tr>
                  <td><strong>${item.feature}</strong></td>
                  <td>${(item.importance || 0).toFixed(4)}</td>
                  <td>${percentage}%</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <!-- PAGE 3: DETAILED ASSET INFORMATION -->
      <h1>Asset Inventory & Details</h1>

      ${data.assetDetail ? `
      <div class="section" style="margin-bottom: 15px;">
        <h2 style="margin-bottom: 10px;">Asset Composition</h2>
        <div class="kpi-grid" style="grid-template-columns: repeat(4, 1fr); gap: 8px;">
          <div class="kpi-card" style="padding: 8px;">
            <div class="kpi-label" style="font-size: 8px; margin-bottom: 4px;">Active Assets</div>
            <div class="kpi-value" style="color: #10b981; font-size: 18px;">${data.assetDetail.activeAssets || 0}</div>
          </div>
          <div class="kpi-card" style="padding: 8px;">
            <div class="kpi-label" style="font-size: 8px; margin-bottom: 4px;">Inactive Assets</div>
            <div class="kpi-value" style="font-size: 18px;">${data.assetDetail.inactiveAssets || 0}</div>
          </div>
          <div class="kpi-card" style="padding: 8px;">
            <div class="kpi-label" style="font-size: 8px; margin-bottom: 4px;">Under Maintenance</div>
            <div class="kpi-value" style="color: #f59e0b; font-size: 18px;">${data.assetDetail.underMaintenanceAssets || 0}</div>
          </div>
          <div class="kpi-card" style="padding: 8px;">
            <div class="kpi-label" style="font-size: 8px; margin-bottom: 4px;">Avg Vehicle Age</div>
            <div class="kpi-value" style="font-size: 18px;">${data.assetDetail.avgVehicleAge?.toFixed(1) || 'N/A'} yrs</div>
          </div>
        </div>
      </div>
      ` : ''}

      <div class="section" style="margin-bottom: 15px;">
        <h2 style="margin-bottom: 8px;">Asset Status Distribution</h2>
        <div style="display: flex; justify-content: center; margin: 8px 0;">
          ${generatePieChart(data.sections.assetStatus.map(item => ({ name: item.name || 'Unknown', value: item.value || 0 })), 420, 200)}
        </div>
        <table style="margin-top: 8px; font-size: 10px;">
          <thead>
            <tr>
              <th>Status</th>
              <th>Count</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${data.sections.assetStatus.map(item => {
              const total = data.sections.assetStatus.reduce((sum, s) => sum + s.value, 0);
              const percentage = ((item.value / total) * 100).toFixed(1);
              return `
                <tr>
                  <td><strong>${item.name}</strong></td>
                  <td>${item.value}</td>
                  <td>${percentage}%</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2 style="margin-bottom: 8px;">Assets by Type</h2>
        <div style="display: flex; justify-content: center; margin: 8px 0;">
          ${generateBarChart(data.sections.assetsByType.map(item => ({ name: item.name || 'Unknown', value: item.value || 0 })), 450, 220)}
        </div>
        <table style="margin-top: 8px; font-size: 10px;">
          <thead>
            <tr>
              <th>Asset Type</th>
              <th>Count</th>
              <th>Percentage of Fleet</th>
            </tr>
          </thead>
          <tbody>
            ${data.sections.assetsByType.map(item => {
              const total = data.sections.assetsByType.reduce((sum, s) => sum + (s.value || 0), 0);
              const percentage = ((( item.value || 0) / total) * 100).toFixed(1);
              return `
                <tr>
                  <td><strong>${item.name}</strong></td>
                  <td>${item.value || 0}</td>
                  <td>${percentage}%</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div class="page-break"></div>

      <!-- PAGE: MAINTENANCE DETAILS -->
      <h1>Maintenance & Cost Analysis</h1>

      ${data.maintenanceDetail ? `
      <div class="section">
        <h2>Maintenance Metrics</h2>
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Est. Monthly Cost</div>
            <div class="kpi-value">${data.maintenanceDetail.estimatedCost || 'N/A'}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Avg Cost/Asset</div>
            <div class="kpi-value">${data.maintenanceDetail.avgCostPerAsset || 'N/A'}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Actual (3M)</div>
            <div class="kpi-value">${data.maintenanceDetail.actualCost3m || 'N/A'}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Avg Downtime</div>
            <div class="kpi-value">${data.maintenanceDetail.avgDowntimeHours?.toFixed(1) || 'N/A'} hrs</div>
          </div>
        </div>
      </div>
      ` : ''}

      <div class="section">
        <h2>Maintenance Events (Last 3 Months)</h2>
        <ul>
          <li><strong>Total Events:</strong> ${data.maintenanceDetail?.maintenanceEvents3m || 0}</li>
          <li><strong>Average Downtime per Event:</strong> ${data.maintenanceDetail?.avgDowntimeHours?.toFixed(1) || 'N/A'} hours</li>
        </ul>
      </div>

      ${data.sections.maintenanceTypes && data.sections.maintenanceTypes.length > 0 ? `
      <div class="section">
        <h2>Maintenance Types Breakdown</h2>
        <div style="display: flex; justify-content: center; margin: 15px 0;">
          ${generateBarChart(data.sections.maintenanceTypes.map(item => ({ name: item.name || 'Unknown', value: item.value || 0 })), 520, 280)}
        </div>
        <table style="margin-top: 20px;">
          <thead>
            <tr>
              <th>Type</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            ${data.sections.maintenanceTypes.map(item => `
              <tr>
                <td><strong>${item.name}</strong></td>
                <td>${item.value}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <div class="page-break"></div>

      <!-- PAGE: TICKET MANAGEMENT -->
      <h1>Ticket Management & Tracking</h1>

      ${data.ticketDetail ? `
      <div class="section">
        <h2>Ticket Overview</h2>
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Total Tickets</div>
            <div class="kpi-value">${data.ticketDetail.totalTickets || 0}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Open Tickets</div>
            <div class="kpi-value" style="color: #f59e0b;">${data.ticketDetail.openTickets || 0}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">In Progress</div>
            <div class="kpi-value" style="color: #3b82f6;">${data.ticketDetail.inProgressTickets || 0}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Closed</div>
            <div class="kpi-value" style="color: #10b981;">${data.ticketDetail.closedTickets || 0}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Ticket Status Summary</h2>
        <ul>
          <li><strong>Resolved:</strong> ${data.ticketDetail.resolvedTickets || 0}</li>
          <li><strong>High Priority Active:</strong> ${data.ticketDetail.highPriorityTickets || 0}</li>
        </ul>
      </div>
      ` : ''}

      <div class="section">
        <h2>Ticket Priority Distribution</h2>
        <div style="display: flex; justify-content: center; margin: 15px 0;">
          ${generatePieChart(data.sections.ticketPriority.map(item => ({ name: item.name || 'Unknown', value: item.value || 0 })), 480, 280)}
        </div>
        <table style="margin-top: 20px;">
          <thead>
            <tr>
              <th>Priority Level</th>
              <th>Open Tickets</th>
            </tr>
          </thead>
          <tbody>
            ${data.sections.ticketPriority.map(item => `
              <tr>
                <td><strong>${item.name}</strong></td>
                <td>${item.value}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>Tickets by Category</h2>
        <div style="display: flex; justify-content: center; margin: 15px 0;">
          ${generateBarChart(data.sections.ticketsByCategory.map(item => ({ name: item.name || 'Uncategorized', value: item.value || 0 })), 520, 280)}
        </div>
        <table style="margin-top: 20px;">
          <thead>
            <tr>
              <th>Category</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            ${data.sections.ticketsByCategory.map(item => `
              <tr>
                <td><strong>${item.name}</strong></td>
                <td>${item.value || 0}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="page-break"></div>

      <!-- PAGE: WORKFORCE & USERS -->
      <h1>Workforce & User Management</h1>

      ${data.userDetail ? `
      <div class="section">
        <h2>User Statistics</h2>
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Total Users</div>
            <div class="kpi-value">${data.userDetail.totalUsers || 0}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Admin Users</div>
            <div class="kpi-value">${data.userDetail.adminUsers || 0}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Standard Users</div>
            <div class="kpi-value">${data.userDetail.standardUsers || 0}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Inactive</div>
            <div class="kpi-value">${data.userDetail.inactiveUsers || 0}</div>
          </div>
        </div>
      </div>
      ` : ''}

      <div class="page-break"></div>

      <!-- PAGE: HEALTH SCORE DISTRIBUTION -->
      <h1>Component Health Analysis</h1>

      <div class="section">
        <h2>Health Score Distribution</h2>
        <div style="display: flex; justify-content: center; margin: 15px 0;">
          ${generateBarChart(data.sections.healthScoreDistribution.map(item => ({ name: item.bucket || 'N/A', value: item.count || 0 })), 520, 300)}
        </div>
        <table style="margin-top: 20px;">
          <thead>
            <tr>
              <th>Health Score Range</th>
              <th>Number of Assets</th>
              <th>Distribution %</th>
            </tr>
          </thead>
          <tbody>
            ${data.sections.healthScoreDistribution.map(item => {
              const total = data.sections.healthScoreDistribution.reduce((sum, s) => sum + s.count, 0);
              const percentage = ((item.count / total) * 100).toFixed(1);
              return `
                <tr>
                  <td><strong>${item.bucket}</strong></td>
                  <td>${item.count}</td>
                  <td>
                    <div style="background: linear-gradient(to right, #14b8a6 ${percentage}%, #e2e8f0 ${percentage}%); height: 20px; border-radius: 3px; min-width: 100px;"></div>
                    ${percentage}%
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div class="page-break"></div>

      <!-- PAGE: CRITICAL ASSETS -->
      <h1>Critical Assets - Immediate Action Required</h1>

      <div class="section">
        <p class="text-muted">The following assets have health scores below 70% and require immediate maintenance intervention:</p>
        <table>
          <thead>
            <tr>
              <th>Asset ID</th>
              <th>Vehicle</th>
              <th>Component</th>
              <th>Health</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            ${data.sections.criticaAssets.slice(0, 15).map(asset => `
              <tr>
                <td><strong>${asset.id}</strong></td>
                <td>${asset.vehicle}</td>
                <td>${asset.component}</td>
                <td style="color: ${asset.health.includes('1') || asset.health.includes('2') || asset.health.includes('3') ? '#dc2626' : '#f59e0b'}; font-weight: 600;">${asset.health}</td>
                <td class="${asset.priority === 'High' ? 'status-critical' : 'status-warning'}">${asset.priority}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="page-break"></div>

      <!-- PAGE: RECOMMENDATIONS & CONCLUSIONS -->
      <h1>Conclusions & Next Steps</h1>

      ${data.aiContent?.conclusion ? `
      <div class="section">
        <h2>Executive Conclusion</h2>
        <div class="summary-box">
          <p>${data.aiContent.conclusion}</p>
        </div>
      </div>
      ` : ''}

      <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 10px;">
        <p>PredictiX AI Platform | Warehouse Management Solution</p>
        <p>© 2026 All Rights Reserved</p>
        <p>Report Generated: ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Export report data to a professional PDF
 */
export function downloadProfessionalPDF(data: ReportData, filename: string = 'warehouse-report.pdf'): void {
  try {
    // Generate HTML content
    const htmlContent = generateProfessionalHTML(data);

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Open print dialog
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.onafterprint = () => {
            URL.revokeObjectURL(url);
          };
        }, 250);
      };
    } else {
      console.error('Unable to open print window');
    }
  } catch (error) {
    console.error('PDF export error:', error);
  }
}

/**
 * Alternative: Save as actual PDF file (requires pdf library)
 * This version creates a downloadable PDF file instead of print dialog
 */
export function savePDFAsFile(data: ReportData, filename: string = 'warehouse-report.pdf'): void {
  try {
    const htmlContent = generateProfessionalHTML(data);
    
    // For now, we'll use the print approach
    // In production, you could use jsPDF + html2canvas for direct file download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('PDF file save error:', error);
  }
}
