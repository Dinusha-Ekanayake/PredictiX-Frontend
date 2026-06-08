import sys

file_path = r'd:\Project\PredictiX-Frontend\src\components\admin\warehouse\WarehouseReportModal.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_sections = """        {/* ── S1: Executive Summary ── */}
        <Section icon={Brain} accent={P.violet} title="1. Executive Insight Summary" subtitle="Top-level AI intelligence & benchmark context">
          <AIBlock text={ai.insight_summary} />
          {kb.benchmark_alerts?.map((a: any, i: number) => (
            <div key={i} className="my-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
              <span className="font-bold flex items-center gap-1.5"><AlertTriangle className="h-4 w-4" /> Benchmark Alert</span>
              <p className="mt-1">{a.message}</p>
            </div>
          ))}
        </Section>

        {/* ── S2: Fleet Asset Overview ── */}
        <Section icon={ClipboardList} accent={P.sky} title="2. Fleet Asset Overview" subtitle="Status distribution · Fleet compilation">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assetStatusData.length > 0 && (
              <div>
                <CLabel text="Asset Status" />
                <ResponsiveContainer width="100%" height={155}>
                  <PieChart>
                    <Pie data={assetStatusData} cx="50%" cy="50%" innerRadius={32} outerRadius={58} paddingAngle={3} dataKey="value">
                      {assetStatusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CTip />} />
                    <Legend iconType="circle" iconSize={7} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {assetTypeData.length > 0 && (
              <div>
                <CLabel text="Assets by Type" />
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={assetTypeData} layout="vertical" margin={{ left: 130, right: 20, top: 10, bottom: 10 }}>
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
                    <Tooltip content={<CTip />} />
                    <Bar dataKey="value" fill={P.sky} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            <div>
              <CLabel text="Workforce Structure" />
              <div className="space-y-1.5 mt-1">
                {[
                  { l: "Total Users",    v: ctx.total_users,    c: P.slate },
                  { l: "Active",         v: ctx.active_users,   c: P.emerald },
                  { l: "Inactive",       v: ctx.inactive_users, c: P.slate },
                  { l: "Admin",          v: ctx.admin_users,    c: P.violet },
                  { l: "Standard",       v: ctx.standard_users, c: P.sky },
                ].map(({ l, v, c }) => <KpiRow key={l} label={l} val={v} color={c} />)}
              </div>
            </div>
          </div>
        </Section>

        {/* ── S3: Health & Risk Analysis ── */}
        <Section icon={AlertTriangle} accent={P.rose} title="3. Health & Risk Analysis" subtitle="AI-identified risks · SHAP drivers · Critical asset table">
          <AIBlock text={ai.risk_analysis} />
          <Divider label="Risk Distribution" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {riskData.length > 0 && (
              <div>
                <CLabel text="Risk Levels" />
                <ResponsiveContainer width="100%" height={155}>
                  <PieChart>
                    <Pie data={riskData} cx="50%" cy="50%" innerRadius={30} outerRadius={58} paddingAngle={3} dataKey="value">
                      {riskData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CTip />} />
                    <Legend iconType="circle" iconSize={7} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {healthDistData.length > 0 && (
              <div>
                <CLabel text="Health Score Buckets" />
                <ResponsiveContainer width="100%" height={155}>
                  <BarChart data={healthDistData} margin={{ left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip content={<CTip />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {healthDistData.map((_, i) => (
                        <Cell key={i} fill={[P.emerald, P.sky, P.amber, P.amber, P.rose][i] || P.slate} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {kb.shap_enriched && kb.shap_enriched.length > 0 ? (
              <div className="lg:col-span-2">
                <CLabel text="Enriched SHAP Failure Drivers" />
                <div className="mt-2 space-y-2">
                  {kb.shap_enriched.slice(0, 4).map((f: any, i: number) => (
                    <div key={i} className="flex flex-col gap-1 rounded-lg border border-slate-100 bg-slate-50/50 p-2 dark:border-slate-800 dark:bg-slate-800/20 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-700 dark:text-slate-200">{f.feature}</span>
                        <span className="font-bold text-rose-600">{f.impact_pct}%</span>
                      </div>
                      <div className="flex flex-col gap-0.5 text-[10px] text-muted-foreground">
                        <span><span className="font-semibold text-amber-600">Threshold:</span> {f.kb_threshold}</span>
                        <span><span className="font-semibold text-emerald-600">Action:</span> {f.action}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : shapData.length > 0 ? (
              <div>
                <CLabel text="Top SHAP Failure Drivers" />
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={shapData} layout="vertical" margin={{ left: 130, right: 20, top: 10, bottom: 10 }}>
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
                    <Tooltip content={<CTip />} />
                    <Bar dataKey="value" fill={P.rose} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : null}
          </div>

          <Divider label="Critical Assets (Lowest Health)" />
          {(ctx.critical_assets?.length ?? 0) > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    {["Code", "Name / Type", "Health", "Fail Prob", "Risk", "Days to Svc", "Status"].map((h) => (
                      <th key={h} className="pb-2 pr-3 text-left text-[10px] font-bold uppercase tracking-wide text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ctx.critical_assets!.map((a) => (
                    <tr key={a.code} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="py-2 pr-3 font-mono font-bold text-rose-600">{a.code}</td>
                      <td className="py-2 pr-3"><div className="font-medium">{a.name}</div><div className="text-muted-foreground">{a.type}</div></td>
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-14 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div className="h-full rounded-full" style={{
                              width: `${a.health_score}%`,
                              backgroundColor: a.health_score < 50 ? P.rose : a.health_score < 70 ? P.amber : P.emerald,
                            }} />
                          </div>
                          <span className="font-semibold">{a.health}</span>
                        </div>
                      </td>
                      <td className="py-2 pr-3 font-semibold" style={{ color: P.rose }}>{a.failure_prob}</td>
                      <td className="py-2 pr-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: `${P.rose}20`, color: P.rose }}>{a.risk}</span>
                      </td>
                      <td className="py-2 pr-3 font-semibold" style={{
                        color: a.days_to_service != null && a.days_to_service <= 7 ? P.rose
                          : a.days_to_service != null && a.days_to_service <= 30 ? P.amber : P.slate,
                      }}>
                        {a.days_to_service != null ? `${a.days_to_service}d` : "N/A"}
                      </td>
                      <td className="py-2 capitalize text-muted-foreground">{a.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-sm text-muted-foreground italic text-center py-3">No critical assets found.</p>}
        </Section>

        {/* ── S4: Maintenance ── */}
        <Section icon={Wrench} accent={P.amber} title="4. Maintenance Intelligence" subtitle="Service urgency · Cost predictions · Downtime analysis">
          <AIBlock text={ai.maintenance_intelligence} />
          <Divider label="Service Urgency & Costs" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              {[
                { l: "Urgent ≤7 days",            v: ctx.urgent_maintenance_count,       c: P.rose },
                { l: "Service ≤30 days",           v: ctx.soon_maintenance_count,         c: P.amber },
                { l: "Avg Days to Service",        v: ctx.avg_days_to_maintenance ?? "N/A", c: P.sky },
                { l: "Events (3 months)",          v: ctx.total_maintenance_events_3m,    c: P.teal },
                { l: "Avg Downtime/Event",         v: `${ctx.avg_downtime_hours}h`,       c: P.slate },
                { l: `Est. Cost (${cur})`,         v: (ctx.total_estimated_cost ?? 0).toLocaleString(),   c: P.violet },
                { l: `Actual Spend 3M (${cur})`,   v: (ctx.actual_cost_3m ?? 0).toLocaleString(),         c: P.emerald },
                { l: `Avg per Asset (${cur})`,     v: (ctx.avg_cost_per_asset ?? 0).toLocaleString(),     c: P.indigo },
              ].map(({ l, v, c }) => <KpiRow key={l} label={l} val={v} color={c} />)}
            </div>
            {maintenTypeData.length > 0 && (
              <div>
                <CLabel text="Event Types" />
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={maintenTypeData} cx="50%" cy="50%" outerRadius={57} dataKey="value">
                      {maintenTypeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CTip />} />
                    <Legend iconType="circle" iconSize={7} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          {maintenTrend.length > 0 && (
            <>
              <Divider label="Monthly Events (3 Months)" />
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={maintenTrend} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip content={<CTip />} />
                  <Bar dataKey="events" name="Events" fill={P.amber} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </Section>

        {/* ── S5: Ticket Management ── */}
        <Section icon={Database} accent={P.sky} title="5. Ticket Management Status" subtitle="3-month ticket trends · Priority & category breakdown">
          <AIBlock text={ai.pattern_and_trend} />
          
          <div className="grid gap-4 sm:grid-cols-2 mt-4">
            <div>
              <CLabel text="Tickets Standing" />
              <div className="space-y-1.5 mt-1 border border-slate-100 dark:border-slate-800 rounded-lg p-3 bg-slate-50/50 dark:bg-slate-900/50">
                {[
                  { l: "Open",              v: ctx.open_tickets,              c: P.amber },
                  { l: "In Progress",       v: ctx.in_progress_tickets,       c: P.sky },
                  { l: "Resolved",          v: ctx.resolved_tickets,          c: P.emerald },
                  { l: "Closed",            v: ctx.closed_tickets,            c: P.slate },
                  { l: "High Priority Active", v: ctx.high_priority_active_tickets, c: P.rose },
                ].map(({ l, v, c }) => <KpiRow key={l} label={l} val={v} color={c} />)}
              </div>
            </div>
            {ticketPriData.length > 0 && (
              <div>
                <CLabel text="Ticket Priority" />
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={ticketPriData} cx="50%" cy="50%" innerRadius={28} outerRadius={55} paddingAngle={3} dataKey="value">
                      {ticketPriData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CTip />} />
                    <Legend iconType="circle" iconSize={7} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          
          <Divider label="Ticket Trends" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ticketTrend.length > 0 && (
              <div className="lg:col-span-2">
                <CLabel text={`Monthly Ticket Volume (${ctx.ticket_trend_direction ?? "stable"})`} />
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={ticketTrend} margin={{ left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip content={<CTip />} />
                    <Line type="monotone" dataKey="tickets" name="Tickets" stroke={P.sky} strokeWidth={2.5} dot={{ r: 4, fill: P.sky }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          {ticketCatData.length > 0 && (
            <>
              <Divider label="Ticket Categories" />
              <div className="grid gap-4 sm:grid-cols-2">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={ticketCatData} layout="vertical" margin={{ left: 130, right: 20, top: 10, bottom: 10 }}>
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
                    <Tooltip content={<CTip />} />
                    <Bar dataKey="value" fill={P.sky} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="space-y-1.5">
                  {ticketCatData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                         <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-muted-foreground truncate max-w-[130px]">{d.name}</span>
                      </div>
                      <span className="font-semibold">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </Section>

        {/* ── S6: Recommendations ── */}
        <Section icon={ShieldAlert} accent={P.emerald} title="6. Recommendations" subtitle="Data-driven prescriptive actions">
          {kb.recommendations ? (
            <div className="grid gap-4">
              {kb.recommendations.critical?.length > 0 && (
                <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 overflow-hidden text-xs">
                  <div className="bg-rose-600 px-3 py-1.5 font-bold text-white tracking-widest uppercase text-[10px]">Critical (0-7 Days)</div>
                  <ul className="px-5 py-3 list-disc space-y-1.5 text-rose-900 dark:text-rose-200">
                    {kb.recommendations.critical.map((r: string, i: number) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
              {kb.recommendations.high?.length > 0 && (
                <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 overflow-hidden text-xs">
                  <div className="bg-amber-500 px-3 py-1.5 font-bold text-white tracking-widest uppercase text-[10px]">High (7-30 Days)</div>
                  <ul className="px-5 py-3 list-disc space-y-1.5 text-amber-900 dark:text-amber-200">
                    {kb.recommendations.high.map((r: string, i: number) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
              {kb.recommendations.medium?.length > 0 && (
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 overflow-hidden text-xs">
                  <div className="bg-emerald-600 px-3 py-1.5 font-bold text-white tracking-widest uppercase text-[10px]">Medium (30-90 Days)</div>
                  <ul className="px-5 py-3 list-disc space-y-1.5 text-emerald-900 dark:text-emerald-200">
                    {kb.recommendations.medium.map((r: string, i: number) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm italic text-muted-foreground">No recommendations generated.</p>
          )}
        </Section>

        {/* ── S7: Conclusion ── */}
        <Section icon={FileText} accent={P.indigo} title="7. Conclusion" subtitle="Overall summary and metric snapshots">
          <AIBlock text={ai.conclusion} />
          <Divider label="3-Month Dashboard Summary" />
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                title: "Fleet", color: P.violet, icon: Activity,
                items: [
                  { l: "Total Assets", v: ctx.total_assets, c: P.violet },
                  { l: "Active", v: ctx.active_assets, c: P.emerald },
                  { l: "Inactive", v: ctx.inactive_assets, c: P.slate },
                  { l: "Avg Health", v: `${ctx.avg_health_pct}%`, c: (ctx.avg_health_pct ?? 0) > 70 ? P.emerald : P.rose },
                  { l: "Critical", v: ctx.critical_count, c: P.rose },
                ],
              },
              {
                title: "Tickets", color: P.sky, icon: ClipboardList,
                items: [
                  { l: "Total", v: ctx.total_tickets, c: P.slate },
                  { l: "Active", v: ctx.active_tickets, c: P.amber },
                  { l: "Open", v: ctx.open_tickets, c: P.amber },
                  { l: "In Progress", v: ctx.in_progress_tickets, c: P.sky },
                  { l: "High Priority", v: ctx.high_priority_active_tickets, c: P.rose },
                ],
              },
              {
                title: "Financials", color: P.emerald, icon: DollarSign,
                items: [
                  { l: `Est. Maint. (${cur})`, v: `${fmtM(ctx.total_estimated_cost ?? 0)}M`, c: P.violet },
                  { l: `Actual 3M (${cur})`, v: `${fmtM(ctx.actual_cost_3m ?? 0)}M`, c: P.emerald },
                  { l: "Avg/Asset", v: (ctx.avg_cost_per_asset ?? 0).toLocaleString(), c: P.slate },
                  { l: "Events (3m)", v: ctx.total_maintenance_events_3m, c: P.teal },
                  { l: "Avg Downtime", v: `${ctx.avg_downtime_hours}h`, c: P.slate },
                ],
              },
            ].map(({ title, color, icon: Icon, items }) => (
              <div key={title} className="rounded-2xl border p-4" style={{ borderColor: `${color}30`, background: `${color}08` }}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="h-4 w-4" style={{ color }} />
                  <span className="text-xs font-bold" style={{ color }}>{title}</span>
                </div>
                <div className="space-y-1.5">
                  {items.map(({ l, v, c }) => <KpiRow key={l} label={l} val={v} color={c} />)}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/20 px-4 py-3 mt-4">
            <Clock className="h-5 w-5 text-rose-600 shrink-0" />
            <p className="text-xs text-rose-600 dark:text-rose-300">
              <strong>{ctx.urgent_maintenance_count}</strong> assets need service within 7 days · 
              <strong>{ctx.soon_maintenance_count}</strong> within 30 days · 
              Avg: <strong>{ctx.avg_days_to_maintenance ?? "N/A"} days</strong> to next service
            </p>
          </div>
        </Section>
"""

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if "{/* ── S1: Executive Summary ── */}" in line:
        start_idx = i
        break

for i in range(len(lines)-1, -1, -1):
    if "<div className=\"h-4\" />" in lines[i]:
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    lines = lines[:start_idx] + [new_sections + '\n'] + lines[end_idx:]
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Success!")
else:
    print(f"Failed to find markers: {start_idx}, {end_idx}")
