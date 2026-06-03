# Backend prompt — Admin Dashboard endpoint + Users list optimization

> Paste everything below into the backend agent (it works in `predictix_backend/PredictiX_backend`).

---

You are working in the PredictiX FastAPI backend (`predictix_backend/PredictiX_backend`).
The admin frontend now expects **one new endpoint** and **one performance fix**. Follow the
existing patterns in `app/routers/warehouse_dashboard.py` (raw SQLAlchemy queries against the
PostgreSQL/Supabase DB, wrapped in try/except that returns an `HTTPException(500, detail=...)`
on failure and `503` when `db is None`).

Models available (see `app/models.py`): `Asset`, `Ticket`, `AssetFailurePrediction`,
`AssetCostPrediction`, `MaintenanceEvent`, `Notification`, `Warehouse`, `Profile`, `Department`.

## TASK 1 — New endpoint: `GET /admin-dashboard/summary`

Create a new router `app/routers/admin_dashboard.py` with prefix `/admin-dashboard`, register it
in `app/main.py` (e.g. `app.include_router(admin_dashboard_router)`). It must return JSON in
**exactly** this shape (the frontend `src/lib/dashboardService.ts` is already typed to it). Every
array may be empty and every number may be 0 — the frontend degrades gracefully — but field names
and types must match precisely.

```json
{
  "kpis": {
    "totalAssets": 1156,
    "criticalAlerts": 318,
    "openTickets": 208,
    "highPriorityTickets": 127,
    "fleetHealth": 68,
    "predictedFailures": 18,
    "estMaintenanceCost": 36295890
  },
  "healthTrend": [ { "month": "Jan", "avgHealth": 72 } ],
  "ticketTrend": [ { "period": "Jan", "opened": 40, "inProgress": 12, "resolved": 30 } ],
  "healthDistribution": [ { "name": "Excellent", "count": 98 } ],
  "costTrend": [ { "month": "Mar", "estimated": 2100000, "actual": 2280000 } ],
  "downtimeByWarehouse": [ { "warehouse": "Colombo", "planned": 12, "unplanned": 8 } ],
  "topRiskAssets": [
    { "id": "FL-22", "name": "Forklift FL-22", "location": "Colombo",
      "healthScore": 41, "failureProbability": 0.91, "daysToMaintenance": 3 }
  ],
  "recentAlerts": [
    { "id": "AL-1042", "severity": "critical", "asset": "Forklift FL-22",
      "location": "Colombo", "message": "Health score dropped below 40%.",
      "createdAt": "2026-05-20T08:00:00Z" }
  ],
  "latestTickets": [
    { "id": "TK-2201", "title": "Hydraulic seal replacement", "asset": "Forklift FL-22",
      "priority": "high", "status": "in_progress", "assignedTo": "Sahan S." }
  ],
  "footerStats": { "avgHealthScore": 68, "ticketsResolved": 148, "avgResolutionDays": 3.4 },
  "aiSummary": null,
  "aiInsights": [
    { "tone": "critical", "title": "Imminent failure cluster",
      "body": "3 assets predicted to fail within 14 days." }
  ]
}
```

### Field-by-field derivation (use real DB data; never hardcode)

- **kpis.totalAssets** — `count(Asset)`.
- **kpis.criticalAlerts** — count of assets in a critical condition, e.g.
  `count(AssetFailurePrediction where health_score < 60)` OR `count(Asset where status='critical')`.
  Pick one and be consistent.
- **kpis.openTickets** — `count(Ticket where status != 'closed')`.
- **kpis.highPriorityTickets** — `count(Ticket where priority='high' and status != 'closed')`.
- **kpis.fleetHealth** — `avg(AssetFailurePrediction.health_score)` rounded to int (0–100).
- **kpis.predictedFailures** — count of failure predictions indicating likely failure, e.g.
  `failure_probability >= 0.5` (or your model's threshold) within the prediction horizon.
- **kpis.estMaintenanceCost** — `sum(AssetCostPrediction.estimated_cost)` as an integer (LKR).
- **healthTrend** — last 6 months; `month` = abbreviated month name, `avgHealth` = avg health that
  month. If you don't store health history, approximate from current avg (as
  `warehouse_dashboard.py` already does for `healthMaintenanceTrends`) — reuse that logic.
- **ticketTrend** — last 6 months (or weeks); per period count tickets `opened`, `inProgress`
  (status='in_progress'), `resolved` (status in ('resolved','closed')). Group by
  `extract(month from Ticket.created_at)`.
- **healthDistribution** — bucket `AssetFailurePrediction.health_score` into bands. Either reuse the
  exact buckets from `warehouse_dashboard.py` (`"90–100%"`, `"80–89%"`, …) OR use friendly band
  names `Excellent/Good/Moderate/Poor/Critical`. `name` + `count` only. Order best→worst.
- **costTrend** — last ~4 months. `estimated` = sum of `AssetCostPrediction.estimated_cost` for that
  month; `actual` = sum of real maintenance cost from `MaintenanceEvent` (cost/actual_cost column)
  for that month, or `null` if not available (e.g. current month). Raw LKR amounts.
- **downtimeByWarehouse** — group `MaintenanceEvent` by warehouse; sum planned vs unplanned hours.
  Derive planned/unplanned from the event type/category column (e.g. `event_type` =
  'preventive'/'scheduled' → planned, else unplanned) and a duration/hours column. If
  `MaintenanceEvent` has no warehouse link, join via `Asset.warehouse_id → Warehouse.name`. If hours
  aren't tracked, return `[]` (frontend hides the chart).
- **topRiskAssets** — top 5–10 assets by lowest health / highest failure probability. Join `Asset`
  with its latest `AssetFailurePrediction`. `name` = asset_name or model; `location` = warehouse
  name; `healthScore` 0–100; `failureProbability` 0–1; `daysToMaintenance` = days until
  `next_service_date` (or `null`). Order most-at-risk first.
- **recentAlerts** — most recent 5 from the `Notification` table (map notification severity/type to
  `"critical" | "warning" | "info"`; `asset` + `location` from the related asset if present;
  `message` = notification body; `createdAt` = ISO timestamp). If no notifications, you may synthesize
  from assets whose health just dropped below thresholds, or return `[]`.
- **latestTickets** — latest 5 tickets ordered by `created_at desc`. `asset` = joined asset name;
  `priority` mapped to one of `critical|high|medium|low` (lowercase); `status` one of
  `open|in_progress|resolved|closed`; `assignedTo` = assignee display name or `"—"`.
- **footerStats.avgHealthScore** — same as fleetHealth (0–100).
- **footerStats.ticketsResolved** — `count(Ticket where status in ('resolved','closed'))`.
- **footerStats.avgResolutionDays** — average `(closed_at - created_at)` in days for resolved/closed
  tickets; `0` if none.
- **aiSummary** — optional. `null` is fine. If easy, reuse the warehouse report agent
  (`run_warehouse_agent`) `insight_summary` text. Do **not** block the endpoint on the LLM — wrap in
  try/except and fall back to `null`.
- **aiInsights** — optional, `[]` is fine. If you want rule-based insights, generate 2–4 items with
  `tone` ∈ `critical|warning|info|positive`, a short `title`, and a one-sentence `body` derived from
  the numbers above (e.g. "{n} assets predicted to fail within 14 days").

### Requirements
- Single endpoint, single DB session, **no N+1 loops** — use aggregate queries (`func.count`,
  `func.avg`, `func.sum`, `group_by`) and at most a couple of small `.limit()` queries for the lists.
- Wrap the body in try/except; on error `raise HTTPException(500, detail=f"Admin dashboard failed: {e}")`
  and `traceback.print_exc()`. If `db is None` → `raise HTTPException(503, detail="Database unavailable")`.
- No authentication dependency is required (match `warehouse_dashboard.py`), but it's fine to add
  `Depends(get_current_user)` if you want it admin-only — the frontend sends the JWT.

## TASK 2 — Fix the slow `GET /users/` endpoint (N+1)

`app/routers/users.py::list_users` currently calls `_user_to_item` per profile, and `_user_to_item`
runs **3 separate queries** (department name, warehouse name, assigned-asset count) for **every**
user. With ~98 profiles that's ~300 sequential round-trips to the Supabase pooler and the endpoint
**times out**.

Rewrite `list_users` to avoid per-row queries:
- Fetch all departments and warehouses once into `{id: name}` dicts.
- Compute assigned-asset counts in one grouped query:
  `select assigned_to, count(*) from assets where status='active' group by assigned_to`,
  loaded into a `{assigned_to: count}` dict.
- Then build each `UserItemOut` from those in-memory maps (no DB calls inside the loop).

Keep the response shape identical to today's `UserItemOut` (the frontend `src/lib/userService.ts`
depends on it). After the change, `GET /users/` should respond in well under a second.

---

When done, restart is automatic (`uvicorn --reload`). Verify:
- `GET /admin-dashboard/summary` returns 200 with the shape above.
- `GET /users/` returns 200 quickly (< 1s).
