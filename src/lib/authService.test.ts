import { test, expect, beforeEach } from "vitest";
import {
  getAccessToken,
  getUser,
  isAuthenticated,
  getUserRole,
  logout,
  clearCachedWarehouseData,
  CACHED_DATA_STORAGE_KEYS,
} from "@/lib/authService";

// Session data lives in localStorage. The rules below matter on shared
// machines, where one person's data must never survive into the next person's
// session, and where the chatbot reads the cached snapshots as its context.

beforeEach(() => {
  localStorage.clear();
});

test("no token is stored when nobody has signed in", () => {
  expect(getAccessToken()).toBeNull();
});

test("the stored access token is returned once signed in", () => {
  localStorage.setItem("predictix.access_token", "abc123");
  expect(getAccessToken()).toBe("abc123");
});

test("a token saved under the older key is still recognised", () => {
  localStorage.setItem("token", "legacy-token");
  expect(getAccessToken()).toBe("legacy-token");
});

test("a visitor with no token counts as not signed in", () => {
  expect(isAuthenticated()).toBe(false);
});

test("a visitor with a token counts as signed in", () => {
  localStorage.setItem("predictix.access_token", "abc123");
  expect(isAuthenticated()).toBe(true);
});

test("the stored user is returned as an object", () => {
  localStorage.setItem("predictix.user", JSON.stringify({ role: "ADMIN", email: "a@b.com" }));
  expect(getUser()).toEqual({ role: "ADMIN", email: "a@b.com" });
});

test("corrupted user data returns nothing instead of crashing the app", () => {
  localStorage.setItem("predictix.user", "not-valid-json{{{");
  expect(getUser()).toBeNull();
});

test("the stored role is reported", () => {
  localStorage.setItem("predictix.user", JSON.stringify({ role: "SUPER_ADMIN" }));
  expect(getUserRole()).toBe("SUPER_ADMIN");
});

test("no role is reported when no user is stored", () => {
  expect(getUserRole()).toBeNull();
});

test("signing out removes the access token", () => {
  localStorage.setItem("predictix.access_token", "abc123");
  logout();
  expect(getAccessToken()).toBeNull();
});

test("signing out removes the stored user", () => {
  localStorage.setItem("predictix.user", JSON.stringify({ role: "ADMIN" }));
  logout();
  expect(getUser()).toBeNull();
});

test("signing out removes the cached warehouse data the chatbot reads", () => {
  for (const key of CACHED_DATA_STORAGE_KEYS) localStorage.setItem(key, '{"secret":1}');
  logout();
  for (const key of CACHED_DATA_STORAGE_KEYS) expect(localStorage.getItem(key)).toBeNull();
});

test("clearing cached warehouse data leaves the session intact", () => {
  localStorage.setItem("predictix.access_token", "abc123");
  for (const key of CACHED_DATA_STORAGE_KEYS) localStorage.setItem(key, '{"a":1}');
  clearCachedWarehouseData();
  expect(getAccessToken()).toBe("abc123");
  for (const key of CACHED_DATA_STORAGE_KEYS) expect(localStorage.getItem(key)).toBeNull();
});

test("signing out leaves unrelated stored settings alone", () => {
  localStorage.setItem("theme", "dark");
  localStorage.setItem("predictix.access_token", "abc123");
  logout();
  expect(localStorage.getItem("theme")).toBe("dark");
});
