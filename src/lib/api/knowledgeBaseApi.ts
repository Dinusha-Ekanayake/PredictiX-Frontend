/**
 * Knowledge Base API service
 * CRUD operations for knowledge base articles used by the chatbot RAG pipeline.
 */

import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/apiClient";

export interface KBArticle {
  id: string;
  title: string;
  content: string;
  category: string | null;
  tags: string[] | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface KBArticleCreate {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
}

export interface KBArticleUpdate {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  is_active?: boolean;
}

/** Fetch predefined category list. */
export async function getKBCategories(): Promise<string[]> {
  return apiGet<string[]>("/knowledge-base/categories");
}

/** List all KB articles with optional filters. */
export async function listKBArticles(opts?: {
  category?: string;
  search?: string;
  include_inactive?: boolean;
}): Promise<KBArticle[]> {
  const params = new URLSearchParams();
  if (opts?.category) params.set("category", opts.category);
  if (opts?.search) params.set("search", opts.search);
  if (opts?.include_inactive) params.set("include_inactive", "true");
  const qs = params.toString();
  return apiGet<KBArticle[]>(`/knowledge-base/${qs ? `?${qs}` : ""}`);
}

/** Get a single article by ID. */
export async function getKBArticle(id: string): Promise<KBArticle> {
  return apiGet<KBArticle>(`/knowledge-base/${id}`);
}

/** Create a new KB article. */
export async function createKBArticle(data: KBArticleCreate): Promise<KBArticle> {
  return apiPost<KBArticle>("/knowledge-base/", data);
}

/** Update an existing KB article. */
export async function updateKBArticle(id: string, data: KBArticleUpdate): Promise<KBArticle> {
  return apiPut<KBArticle>(`/knowledge-base/${id}`, data);
}

/** Toggle an article's active/inactive status. */
export async function toggleKBArticle(id: string): Promise<KBArticle> {
  return apiPost<KBArticle>(`/knowledge-base/${id}/toggle`, {});
}

/** Delete a KB article permanently. */
export async function deleteKBArticle(id: string): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/knowledge-base/${id}`);
}
