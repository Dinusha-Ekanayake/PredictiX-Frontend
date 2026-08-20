/**
 * User (owner-scoped) Ticket Service.
 *
 * Talks to the backend /tickets/mine* endpoints via apiClient, so the user's
 * identity comes from the app JWT and ownership is enforced SERVER-SIDE
 * (a user can only read/edit/delete tickets they created). Returns the same
 * UI `Ticket` shape used across the ticket components.
 */

import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/apiClient";
import type { Ticket, TicketStatus, TicketPriority, TicketCategory } from "@/lib/ticketService";

interface BackendTicket {
  id: string;
  ticket_number: string | null;
  asset_id: string | null;
  asset_name: string | null;
  title: string;
  description: string | null;
  status: string;            // DB: open | in_progress | resolved | closed
  priority: string | null;   // DB: high | medium | low
  predicted_category: string | null;
  final_category: string | null;
  created_by: string | null;
  assigned_to: string | null;
  opened_at: string | null;
  created_at: string | null;
}

function uiStatus(s: string): TicketStatus {
  return s === "in_progress" ? "in-progress" : (s as TicketStatus);
}
function uiPriority(p: string | null): TicketPriority {
  const map: Record<string, TicketPriority> = { high: "High", medium: "Medium", low: "Low" };
  return map[(p ?? "").toLowerCase()] ?? "Medium";
}
function dbStatusFilter(s: string): string {
  return s === "in-progress" ? "in_progress" : s;
}
function dbCategory(c: TicketCategory): string {
  return c.toLowerCase();
}

function mapTicket(t: BackendTicket): Ticket {
  return {
    id: t.id,
    ticket_number: t.ticket_number,
    asset_id: t.asset_id,
    asset_name: t.asset_name ?? undefined,
    title: t.title,
    description: t.description,
    status: uiStatus(t.status),
    priority: uiPriority(t.priority),
    predicted_category: t.predicted_category,
    final_category: t.final_category,
    created_by: t.created_by,
    assigned_to: t.assigned_to,
    opened_at: t.opened_at,
    created_at: t.created_at ?? new Date().toISOString(),
    updated_at: t.created_at ?? new Date().toISOString(),
  };
}

export async function fetchMyTickets(
  search: string,
  status: string,
  priority: string,
): Promise<Ticket[]> {
  const params = new URLSearchParams();
  if (search.trim()) params.set("q", search.trim());
  if (status && status !== "all") params.set("status", dbStatusFilter(status));
  if (priority && priority !== "all") params.set("priority", priority.toLowerCase());
  params.set("limit", "200");
  const rows = await apiGet<BackendTicket[]>(`/tickets/mine?${params.toString()}`);
  return rows.map(mapTicket);
}

export async function createMyTicket(payload: {
  asset_id: string | null;
  title: string;
  description: string;
  priority: TicketPriority;
  category: TicketCategory;
  assigned_to?: string | null;
}): Promise<Ticket> {
  const body = {
    asset_id: payload.asset_id,
    title: payload.title,
    description: payload.description,
    priority: payload.priority.toLowerCase(),
    category: dbCategory(payload.category),
    assigned_to: payload.assigned_to || null,
  };
  return mapTicket(await apiPost<BackendTicket>("/tickets/mine", body));
}

export async function updateMyTicket(
  id: string,
  fields: { title?: string; description?: string; priority?: TicketPriority; category?: TicketCategory },
): Promise<Ticket> {
  const body: Record<string, unknown> = {};
  if (fields.title !== undefined) body.title = fields.title;
  if (fields.description !== undefined) body.description = fields.description;
  if (fields.priority) body.priority = fields.priority.toLowerCase();
  if (fields.category) body.category = dbCategory(fields.category);
  return mapTicket(await apiPut<BackendTicket>(`/tickets/mine/${id}`, body));
}

export async function deleteMyTicket(id: string): Promise<void> {
  await apiDelete(`/tickets/mine/${id}`);
}
