import { describe, expect, it } from "vitest";

import { LOCAL_API_URL, resolveApiBaseUrl, resolveChatbotBaseUrl, resolveWsBaseUrl } from "./apiConfig";

describe("resolveApiBaseUrl", () => {
  it("uses the configured URL without a trailing slash", () => {
    expect(resolveApiBaseUrl("https://api.example.com/")).toBe("https://api.example.com");
  });

  it("falls back to the local backend when nothing is configured", () => {
    expect(resolveApiBaseUrl(undefined)).toBe(LOCAL_API_URL);
    expect(resolveApiBaseUrl("   ")).toBe(LOCAL_API_URL);
  });
});

describe("resolveWsBaseUrl", () => {
  it("follows the API URL, upgrading https to wss", () => {
    expect(resolveWsBaseUrl(undefined, "https://api.example.com")).toBe("wss://api.example.com");
    expect(resolveWsBaseUrl("", "http://127.0.0.1:8000")).toBe("ws://127.0.0.1:8000");
  });

  it("prefers an explicit WebSocket URL", () => {
    expect(resolveWsBaseUrl("wss://realtime.example.com/", "https://api.example.com")).toBe(
      "wss://realtime.example.com",
    );
  });
});

describe("resolveChatbotBaseUrl", () => {
  it("defaults to the API and honours an override", () => {
    expect(resolveChatbotBaseUrl(undefined, "https://api.example.com")).toBe("https://api.example.com");
    expect(resolveChatbotBaseUrl("https://bot.example.com/", "https://api.example.com")).toBe("https://bot.example.com");
  });
});
