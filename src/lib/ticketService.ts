import { supabase } from "./supabaseBrowserClient";
import { apiPost, apiGet, apiPut, apiDelete, apiFetch } from "./apiClient";

// ─── FastAPI-backed ticket preview (calls POST /tickets/preview) ──────────────

export interface TicketAiPreview {
  predicted_category: string | null;
  predicted_priority: string | null;
  errors: Record<string, string>;
}

export async function previewTicketAI(title: string, description: string): Promise<TicketAiPreview> {
  return apiPost<TicketAiPreview>("/tickets/preview", { title, description });
}

// ─── AI summaries (local ONNX Seq2Seq models via FastAPI) ────────────────────

/** (Re)generate the ticket AI summary from the ticket's own fields. */
export async function generateTicketSummaryById(ticketId: string): Promise<{ summary: string }> {
  return apiGet<{ summary: string }>(`/ticket-summaries/by-ticket/${ticketId}`);
}

/** Generate the AI summary for the ticket's linked asset. */
export async function generateAssetSummaryById(assetId: string): Promise<{ summary: string }> {
  return apiGet<{ summary: string }>(`/asset-summaries/by-asset/${assetId}`);
}

// ─── FastAPI-backed admin ticket create (POST /tickets/) ──────────────────────

export interface AdminTicketCreatePayload {
  asset_id: string | null;
  title: string;
  description: string;
  priority: string;
  predicted_priority?: string | null;
  predicted_category?: string | null;
  assigned_to?: string | null;
  created_by: string;
}

export async function createTicketViaApi(payload: AdminTicketCreatePayload): Promise<Ticket> {
  const data = await apiPost<any>("/tickets/", {
    asset_id: payload.asset_id || null,
    title: payload.title,
    description: payload.description,
    priority: payload.priority.toLowerCase(),
    predicted_priority: payload.predicted_priority?.toLowerCase() ?? null,
    predicted_category: payload.predicted_category?.toLowerCase() ?? null,
    assigned_to: payload.assigned_to || null,
    created_by: payload.created_by,
  });
  return {
    id: data.id,
    ticket_number: data.ticket_number,
    asset_id: data.asset_id,
    title: data.title,
    description: data.description,
    status: data.status ?? "open",
    priority: uiPriority(data.priority ?? "medium"),
    predicted_category: data.predicted_category ?? null,
    final_category: data.final_category ?? null,
    created_by: data.created_by,
    assigned_to: data.assigned_to,
    opened_at: data.opened_at,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export type TicketStatus = "open" | "in-progress" | "resolved" | "closed";
export type TicketPriority = "High" | "Medium" | "Low";
export type TicketCategory = "Mechanical" | "Electrical" | "Software";

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
  ticket_summary?: string | null;
  asset_summary?: string | null;
  created_by: string | null;
  assigned_to: string | null;
  opened_at: string | null;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
  closed_at?: string | null;
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
    ticket_summary: row.ticket_summary ?? null,
    asset_summary: row.asset_summary ?? null,
    created_by: row.created_by,
    assigned_to: row.assigned_to,
    opened_at: row.opened_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    resolved_at: row.resolved_at,
    closed_at: row.closed_at,
  };
}

export async function fetchTickets(
  page: number,
  search: string,
  status: string,
  priority: string
): Promise<{ tickets: Ticket[]; total: number }> {
  // Build query params for the FastAPI backend endpoint
  const params = new URLSearchParams();
  params.set("limit", String(PAGE_SIZE));
  params.set("offset", String(page * PAGE_SIZE));
  if (search.trim()) params.set("search", search.trim());
  if (status && status !== "all") params.set("status", dbStatus(status));
  if (priority && priority !== "all") params.set("priority", dbPriority(priority));

  // Call FastAPI — this uses the authenticated session and the backend DB connection
  // which is resilient to Supabase sleeping. Response includes X-Total-Count header.
  const resp = await apiFetch(`/tickets/paginated?${params.toString()}`);
  if (!resp.ok) {
    const detail = await resp.text().catch(() => resp.statusText);
    throw new Error(`Failed to fetch tickets: ${detail}`);
  }
  const json = await resp.json();
  const rows: any[] = json.tickets ?? json ?? [];
  const total: number = json.total ?? rows.length;

  return {
    tickets: rows.map(mapRow),
    total,
  };
}

export async function createTicket(payload: {
  asset_id: string | null;
  title: string;
  description: string;
  priority: TicketPriority;
  category: TicketCategory;
  assigned_to?: string | null;
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
      predicted_category: payload.category.toLowerCase(),
      assigned_to: payload.assigned_to || null,
      opened_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("*, assets(asset_name)")
    .single();

  if (error) throw error;
  return mapRow(data);
}

export async function fetchTicketById(id: string): Promise<Ticket> {
  const row = await apiGet<any>(`/tickets/${id}`);
  return mapRow(row);
}

export async function fetchTicketStatusCounts(): Promise<Record<string, number>> {
  return apiGet<Record<string, number>>("/tickets/status-counts");
}

// These four previously wrote/deleted directly via the Supabase client,
// relying on RLS to enforce that only an admin can change/delete a ticket
// that isn't theirs. The real tickets_update_creator_assignee_or_admin and
// tickets_delete policies both have qual = 'true' (no actual restriction),
// so that path let ANY authenticated user update or delete ANY ticket in
// the system. Routed through the backend's PUT/DELETE /tickets/{id}
// instead, which correctly enforces is_admin_role()/require_admin
// server-side and also logs the status-transition history the direct
// Supabase path silently skipped.

export async function updateTicketStatus(id: string, status: TicketStatus): Promise<void> {
  await apiPut(`/tickets/${id}`, { status: dbStatus(status) });
}

export async function updateTicketPriority(id: string, priority: TicketPriority): Promise<void> {
  await apiPut(`/tickets/${id}`, { priority: dbPriority(priority) });
}

export async function updateTicketAssignee(id: string, assignedTo: string | null): Promise<void> {
  await apiPut(`/tickets/${id}`, { assigned_to: assignedTo });
}

export async function deleteTicket(id: string): Promise<void> {
  await apiDelete(`/tickets/${id}`);
}

export async function addTicketAttachment(
  ticketId: string,
  filePath: string,
  mimeType?: string | null,
  originalFilename?: string | null
): Promise<void> {
  await apiPost(`/ticket-attachments/`, {
    ticket_id: ticketId,
    file_path: filePath,
    mime_type: mimeType,
    original_filename: originalFilename,
  });
}

export async function fetchTicketAttachments(ticketId: string): Promise<any[]> {
  try {
    const data = await apiGet<any[]>(`/ticket-attachments/?ticket_id=${ticketId}`);
    return data || [];
  } catch (err) {
    console.error("Failed to fetch attachments via API", err);
    return [];
  }
}

export async function deleteTicketAttachment(attachmentId: string): Promise<void> {
  await apiDelete(`/ticket-attachments/${attachmentId}`);
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

  const { data: historyData, error: historyError } = await supabase
    .from("ticket_status_history")
    .select("id,old_status,new_status,changed_by,note,created_at")
    .eq("ticket_id", ticket.id)
    .order("created_at", { ascending: true });

  if (historyError) throw historyError;

  const historyRows = (historyData ?? []) as Array<{
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
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id,full_name,email")
      .in("id", Array.from(profileIds));

    if (profilesError) throw profilesError;

    nameById = new Map(
      ((profiles ?? []) as Array<{ id: string; full_name: string | null; email: string | null }>).map(
        (p) => [p.id, { name: p.full_name, email: p.email }],
      ),
    );

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
  }

  if (ticket.asset_id) {
    const { data: asset, error: assetError } = await supabase
      .from("assets")
      .select("warehouse_id,department_id")
      .eq("id", ticket.asset_id)
      .maybeSingle();

    if (assetError) throw assetError;

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

export async function fetchTicketComments(ticketId: string): Promise<any[]> {
  try {
    const data = await apiGet<any[]>(`/ticket-comments/?ticket_id=${ticketId}`);
    return data || [];
  } catch (err) {
    console.error("Failed to fetch ticket comments:", err);
    return [];
  }
}

export async function createTicketComment(
  ticketId: string,
  userId: string,
  comment: string,
  isInternal: boolean = false
): Promise<any> {
  return apiPost<any>("/ticket-comments/", {
    ticket_id: ticketId,
    user_id: userId,
    comment,
    is_internal: isInternal,
  });
}

export async function deleteTicketComment(commentId: string): Promise<void> {
  await apiDelete(`/ticket-comments/${commentId}`);
}

export interface AgentResponse {
  answer: string;
  action_buttons: Array<{ label: string; path: string }>;
  tool_trace: Array<{ name: string; args: any; result_preview: string }>;
  iterations: number;
}

export async function askChatbotAgent(
  question: string,
  history?: Array<{ role: string; content: string }>,
  frontendContext?: any
): Promise<AgentResponse> {
  return apiPost<AgentResponse>("/chatbot/agent", {
    question,
    history,
    frontend_context: frontendContext,
  });
}

