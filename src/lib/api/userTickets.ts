/**
 * Typed client for the user-role ticket endpoints (FastAPI: /user/tickets/*).
 *
 * Auth: the project currently stores the JWT under TWO different localStorage
 * keys depending on how the user logged in (`token` from the login page,
 * `predictix.access_token` from the shared authService). We read both, just
 * like `userProfileApi.ts` does, so requests always carry the bearer.
 *
 * Response shapes mirror `app/schemas/user_tickets.py`.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TicketStatus = "open" | "in-progress" | "resolved" | "closed" | string;
export type TicketPriority = "low" | "medium" | "high" | "critical" | string;

export interface UserTicketSummary {
  id: string;
  ticket_number: string;
  title: string;
  status: TicketStatus;
  priority: string | null;
  predicted_priority: string | null;
  final_priority: string | null;
  predicted_category: string | null;
  final_category: string | null;
  asset_id: string | null;
  warehouse_id: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserTicketComment {
  id: string;
  ticket_id: string;
  user_id: string;
  comment: string;
  is_internal: boolean;
  created_at: string;
}

export interface UserTicketAttachment {
  id: string;
  ticket_id: string;
  file_path: string;
  mime_type: string | null;
  original_filename: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface UserTicketHistory {
  id: string;
  ticket_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string | null;
  note: string | null;
  created_at: string;
}

export interface UserTicketDetail extends UserTicketSummary {
  description: string;
  ticket_summary: string | null;
  asset_summary: string | null;
  created_by: string;
  assigned_to: string | null;
  reviewed_by: string | null;
  opened_at: string | null;
  reviewed_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  comments: UserTicketComment[];
  attachments: UserTicketAttachment[];
  history: UserTicketHistory[];
}

export interface UserTicketListResponse {
  items: UserTicketSummary[];
  total: number;
  page: number;
  page_size: number;
}

export interface ListTicketsParams {
  status?: string;
  priority?: string;
  asset_id?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: "created_at" | "updated_at" | "priority" | "status" | "ticket_number";
  sort_dir?: "asc" | "desc";
  page?: number;
  page_size?: number;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  asset_id?: string;
  warehouse_id?: string;
  priority?: string;
  use_ai_predictions?: boolean;
  // When the user previewed and accepted AI suggestions, the dialog re-sends
  // those values here with use_ai_predictions=false so the backend stores
  // them without re-running the models.
  predicted_priority?: string;
  predicted_category?: string;
  ticket_summary?: string;
  assigned_to?: string | null;
}

export interface PreviewTicketPayload {
  title: string;
  description: string;
  asset_id?: string;
  priority?: string;
}

export interface TicketPreviewResponse {
  predicted_priority: string | null;
  predicted_category: string | null;
  ticket_summary: string | null;
  /** Per-model error messages — populated when a prediction failed. */
  errors: Record<string, string>;
}

export interface UpdateTicketPayload {
  title?: string;
  description?: string;
  priority?: string;
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

function getAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") ||
        localStorage.getItem("predictix.access_token")
      : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...(init.headers as Record<string, string> | undefined),
    },
  });

  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const body = (await res.json()) as { detail?: string };
      if (body.detail) detail = body.detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }

  // The list endpoint always returns JSON; everything else does too.
  return res.json() as Promise<T>;
}

function toQuery(params: Record<string, unknown> | object): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    qs.append(k, String(v));
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export async function listMyTickets(
  params: ListTicketsParams = {}
): Promise<UserTicketListResponse> {
  return request<UserTicketListResponse>(`/user/tickets${toQuery(params)}`);
}

export interface UserTicketStats {
  open: number;
  in_progress: number;
  pending: number;
  resolved: number;
  closed: number;
  cancelled: number;
  total: number;
}

/** Authoritative status counts for the current user's own tickets (unfiltered). */
export async function getMyTicketStats(): Promise<UserTicketStats> {
  return request<UserTicketStats>(`/user/tickets/stats`);
}

export async function getMyTicket(ticketId: string): Promise<UserTicketDetail> {
  return request<UserTicketDetail>(`/user/tickets/${ticketId}`);
}

export async function createMyTicket(
  payload: CreateTicketPayload
): Promise<UserTicketDetail> {
  return request<UserTicketDetail>(`/user/tickets`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function previewMyTicketAI(
  payload: PreviewTicketPayload
): Promise<TicketPreviewResponse> {
  return request<TicketPreviewResponse>(`/user/tickets/preview`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateMyTicket(
  ticketId: string,
  payload: UpdateTicketPayload
): Promise<UserTicketDetail> {
  return request<UserTicketDetail>(`/user/tickets/${ticketId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function listMyTicketComments(
  ticketId: string
): Promise<UserTicketComment[]> {
  return request<UserTicketComment[]>(`/user/tickets/${ticketId}/comments`);
}

export async function addMyTicketComment(
  ticketId: string,
  comment: string
): Promise<UserTicketComment> {
  return request<UserTicketComment>(`/user/tickets/${ticketId}/comments`, {
    method: "POST",
    body: JSON.stringify({ comment }),
  });
}
