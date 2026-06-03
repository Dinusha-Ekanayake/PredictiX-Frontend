import { supabase } from "./supabaseBrowserClient";

export type TicketStatus = "open" | "in-progress" | "resolved" | "closed";
export type TicketPriority = "High" | "Medium" | "Low";
export type TicketCategory = "Mechanical" | "Electrical" | "Software" | "General";

export type Ticket = {
  id: string;
  ticket_number: string | null;
  asset_id: string | null;
  asset_name?: string;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  predicted_category: string | null;
  final_category: string | null;
  created_by: string | null;
  assigned_to: string | null;
  opened_at: string | null;
  created_at: string;
  updated_at: string;
};

const PAGE_SIZE = 10;

function dbPriority(p: string) {
  return p.toLowerCase() as "high" | "medium" | "low";
}

function dbStatus(s: string) {
  // Supabase enum uses 'in_progress', not 'in-progress'
  return s === "in-progress" ? "in_progress" : s;
}

function uiStatus(s: string): TicketStatus {
  return s === "in_progress" ? "in-progress" : (s as TicketStatus);
}

function uiPriority(p: string): TicketPriority {
  const map: Record<string, TicketPriority> = { high: "High", medium: "Medium", low: "Low" };
  return map[p?.toLowerCase()] ?? "Medium";
}

function mapRow(row: any): Ticket {
  return {
    id: row.id,
    ticket_number: row.ticket_number,
    asset_id: row.asset_id,
    asset_name: row.assets?.asset_name ?? null,
    title: row.title,
    description: row.description,
    status: uiStatus(row.status),
    priority: uiPriority(row.priority),
    predicted_category: row.predicted_category,
    final_category: row.final_category,
    created_by: row.created_by,
    assigned_to: row.assigned_to,
    opened_at: row.opened_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function fetchTickets(
  page: number,
  search: string,
  status: string,
  priority: string
): Promise<{ tickets: Ticket[]; total: number }> {
  if (!supabase) throw new Error("Supabase not configured");

  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("tickets")
    .select("*, assets(asset_name)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (search.trim()) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }
  if (status && status !== "all") {
    query = query.eq("status", dbStatus(status));
  }
  if (priority && priority !== "all") {
    query = query.eq("priority", dbPriority(priority));
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  return {
    tickets: (data ?? []).map(mapRow),
    total: count ?? 0,
  };
}

export async function createTicket(payload: {
  asset_id: string | null;
  title: string;
  description: string;
  priority: TicketPriority;
  category: TicketCategory;
}): Promise<Ticket> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("tickets")
    .insert({
      asset_id: payload.asset_id || null,
      title: payload.title,
      description: payload.description,
      status: "open",
      priority: dbPriority(payload.priority),
      predicted_category: payload.category === "General" ? "mechanical" : payload.category.toLowerCase(),
      opened_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("*, assets(asset_name)")
    .single();

  if (error) throw error;
  return mapRow(data);
}

export async function fetchTicketStatusCounts(): Promise<Record<string, number>> {
  if (!supabase) throw new Error("Supabase not configured");

  const statuses = ["open", "in_progress", "resolved", "closed"];
  const counts: Record<string, number> = { open: 0, "in-progress": 0, resolved: 0, closed: 0 };

  await Promise.all(
    statuses.map(async (s) => {
      const { count } = await supabase!
        .from("tickets")
        .select("id", { count: "exact", head: true })
        .eq("status", s);
      const uiKey = s === "in_progress" ? "in-progress" : s;
      counts[uiKey] = count ?? 0;
    })
  );

  return counts;
}

export async function updateTicketStatus(id: string, status: TicketStatus): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured");

  const updates: Record<string, string> = {
    status: dbStatus(status),
    updated_at: new Date().toISOString(),
  };
  if (status === "resolved") updates.resolved_at = new Date().toISOString();
  if (status === "closed") updates.closed_at = new Date().toISOString();
  if (status === "in-progress") updates.reviewed_at = new Date().toISOString();

  const { error } = await supabase.from("tickets").update(updates).eq("id", id);
  if (error) throw error;
}

export async function updateTicketPriority(id: string, priority: TicketPriority): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase
    .from("tickets")
    .update({ priority: dbPriority(priority), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteTicket(id: string): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase.from("tickets").delete().eq("id", id);
  if (error) throw error;
}

export type TicketHistoryEntry = {
  id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string | null;
  changed_by_name: string | null;
  note: string | null;
  created_at: string;
};

export type TicketEnrichment = {
  creator_name: string | null;
  creator_email: string | null;
  assignee_name: string | null;
  warehouse_name: string | null;
  department_name: string | null;
  history: TicketHistoryEntry[];
};

export async function fetchTicketEnrichment(ticket: {
  id: string;
  created_by: string | null;
  assigned_to: string | null;
  asset_id: string | null;
}): Promise<TicketEnrichment> {
  if (!supabase) throw new Error("Supabase not configured");

  const result: TicketEnrichment = {
    creator_name: null,
    creator_email: null,
    assignee_name: null,
    warehouse_name: null,
    department_name: null,
    history: [],
  };

  const profileIds = new Set<string>();
  if (ticket.created_by) profileIds.add(ticket.created_by);
  if (ticket.assigned_to) profileIds.add(ticket.assigned_to);

  const historyResp = await supabase
    .from("ticket_status_history")
    .select("id,old_status,new_status,changed_by,note,created_at")
    .eq("ticket_id", ticket.id)
    .order("created_at", { ascending: true });

  const historyRows = (historyResp.data ?? []) as Array<{
    id: string;
    old_status: string | null;
    new_status: string;
    changed_by: string | null;
    note: string | null;
    created_at: string;
  }>;
  for (const h of historyRows) {
    if (h.changed_by) profileIds.add(h.changed_by);
  }

  let nameById = new Map<string, { name: string | null; email: string | null }>();
  if (profileIds.size > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id,full_name,email")
      .in("id", Array.from(profileIds));
    nameById = new Map(
      ((profiles ?? []) as Array<{ id: string; full_name: string | null; email: string | null }>).map(
        (p) => [p.id, { name: p.full_name, email: p.email }],
      ),
    );
  }

  if (ticket.created_by) {
    const p = nameById.get(ticket.created_by);
    result.creator_name = p?.name ?? null;
    result.creator_email = p?.email ?? null;
  }
  if (ticket.assigned_to) {
    result.assignee_name = nameById.get(ticket.assigned_to)?.name ?? null;
  }

  result.history = historyRows.map((h) => ({
    id: h.id,
    old_status: h.old_status,
    new_status: h.new_status,
    changed_by: h.changed_by,
    changed_by_name: h.changed_by ? nameById.get(h.changed_by)?.name ?? null : null,
    note: h.note,
    created_at: h.created_at,
  }));

  if (ticket.asset_id) {
    const { data: asset } = await supabase
      .from("assets")
      .select("warehouse_id,department_id")
      .eq("id", ticket.asset_id)
      .maybeSingle();
    const a = asset as { warehouse_id: string | null; department_id: string | null } | null;
    if (a?.warehouse_id) {
      const { data: w } = await supabase
        .from("warehouses")
        .select("name")
        .eq("id", a.warehouse_id)
        .maybeSingle();
      result.warehouse_name = (w as { name: string } | null)?.name ?? null;
    }
    if (a?.department_id) {
      const { data: d } = await supabase
        .from("departments")
        .select("name")
        .eq("id", a.department_id)
        .maybeSingle();
      result.department_name = (d as { name: string } | null)?.name ?? null;
    }
  }

  return result;
}
