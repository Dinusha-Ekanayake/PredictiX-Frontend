import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Uploads and ticket details go through the API only: the browser never
// writes to storage or reads the database itself (backend ADR-0008).

vi.mock("./authService", () => ({
  logout: vi.fn(),
  getAccessToken: () => "tok-123",
}));

import { fetchTicketEnrichment, uploadTicketAttachment } from "./ticketService";
import { uploadMyTicketAttachment } from "./api/userTickets";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

const png = () => new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], "photo.png", { type: "image/png" });

describe("attachment uploads and ticket details", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => vi.unstubAllGlobals());

  it("uploads a staff attachment as multipart to the API with the session token", async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, { id: "a1" }));
    const file = png();

    await uploadTicketAttachment("t-1", file);

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/ticket-attachments\/upload$/);
    expect(init?.method).toBe("POST");
    const body = init?.body as FormData;
    expect(body).toBeInstanceOf(FormData);
    expect(body.get("ticket_id")).toBe("t-1");
    expect(body.get("file")).toBe(file);
    const headers = init?.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer tok-123");
    // The browser must set the multipart boundary itself.
    expect(headers["Content-Type"]).toBeUndefined();
  });

  it("uploads a user attachment to the user ticket route", async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, { id: "a2" }));

    await uploadMyTicketAttachment("t-9", png());

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/user\/tickets\/t-9\/attachments\/upload$/);
    expect((init?.body as FormData).get("file")).toBeInstanceOf(File);
  });

  it("surfaces the API's reason when an upload is refused", async () => {
    fetchMock.mockResolvedValue(jsonResponse(415, { detail: "Upload a JPG, PNG, WebP or GIF image." }));

    await expect(uploadTicketAttachment("t-1", png())).rejects.toThrow("Upload a JPG, PNG, WebP or GIF image.");
  });

  it("reads ticket details from the API", async () => {
    const details = {
      creator_name: "Nuwan", creator_email: null, assignee_name: null,
      warehouse_name: "Colombo", department_name: null, history: [],
    };
    fetchMock.mockResolvedValue(jsonResponse(200, details));

    await expect(fetchTicketEnrichment({ id: "t-1" })).resolves.toEqual(details);
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/tickets\/t-1\/details$/);
  });
});
