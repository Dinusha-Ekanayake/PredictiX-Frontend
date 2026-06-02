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

interface TicketRow {
  id: string;
  ticket_number: string | null;
  asset_id: string | null;
  assets?: { asset_name?: string | null } | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  predicted_category: string | null;
  final_category: string | null;
  created_by: string | null;
  assigned_to: string | null;
  opened_at: string | null;
  created_at: string;
  updated_at: string;
}

function mapRow(row: TicketRow): Ticket {
  return {
    id: row.id,
    ticket_number: row.ticket_number,
    asset_id: row.asset_id,
    asset_name: row.assets?.asset_name ?? undefined,
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

function dbCategory(c: TicketCategory) {
  return c === "General" ? "mechanical" : c.toLowerCase();
}

export async function createTicket(payload: {
  asset_id: string | null;
  title: string;
  description: string;
  priority: TicketPriority;
  category: TicketCategory;
  created_by?: string | null;
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
      predicted_category: dbCategory(payload.category),
      created_by: payload.created_by ?? null,
      opened_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("*, assets(asset_name)")
    .single();

  if (error) throw error;
  return mapRow(data);
}

/**
 * Fetch tickets CREATED BY a specific user (ownership-scoped — used by the
 * non-admin user tickets page, where a user may only see their own tickets).
 */
export async function fetchMyTickets(
  userId: string,
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
    .eq("created_by", userId)
    .order("created_at", { ascending: false });

  if (search.trim()) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }
  if (status && status !== "all") query = query.eq("status", dbStatus(status));
  if (priority && priority !== "all") query = query.eq("priority", dbPriority(priority));

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  return { tickets: (data ?? []).map(mapRow), total: count ?? 0 };
}

/** Full edit of a ticket's editable fields (title/description/priority/category). */
export async function updateTicket(
  id: string,
  fields: {
    title?: string;
    description?: string;
    priority?: TicketPriority;
    category?: TicketCategory;
  }
): Promise<Ticket> {
  if (!supabase) throw new Error("Supabase not configured");

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (fields.title !== undefined) updates.title = fields.title;
  if (fields.description !== undefined) updates.description = fields.description;
  if (fields.priority) updates.priority = dbPriority(fields.priority);
  if (fields.category) updates.predicted_category = dbCategory(fields.category);

  const { data, error } = await supabase
    .from("tickets")
    .update(updates)
    .eq("id", id)
    .select("*, assets(asset_name)")
    .single();

  if (error) throw error;
  return mapRow(data);
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

export async function deleteTicket(id: string): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase.from("tickets").delete().eq("id", id);
  if (error) throw error;
}
