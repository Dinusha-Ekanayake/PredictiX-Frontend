"use client";

import * as React from "react";
import { notFound } from "next/navigation";
import { Plus, Search, BookOpen, Edit, Trash2, Eye, EyeOff, X, Loader2, Tag, Calendar, FileText, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import PageHero from "@/components/common/PageHero";
import { toast } from "@/lib/customToast";
import { 
  listKBArticles, 
  createKBArticle, 
  updateKBArticle, 
  toggleKBArticle, 
  deleteKBArticle, 
  getKBCategories, 
  type KBArticle 
} from "@/lib/api/knowledgeBaseApi";

export default function KnowledgeBasePage() {
  notFound();
  return null;
  const [articles, setArticles] = React.useState<KBArticle[]>([]);
  const [categories, setCategories] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterCategory, setFilterCategory] = React.useState("");
  const [showInactive, setShowInactive] = React.useState(false);
  
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [editingArticle, setEditingArticle] = React.useState<KBArticle | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const [formTitle, setFormTitle] = React.useState("");
  const [formContent, setFormContent] = React.useState("");
  const [formCategory, setFormCategory] = React.useState("");
  const [formSource, setFormSource] = React.useState("");
  const [formTags, setFormTags] = React.useState("");

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedArticles, fetchedCategories] = await Promise.all([
        listKBArticles({ include_inactive: true }),
        getKBCategories()
      ]);
      setArticles(fetchedArticles);
      setCategories(fetchedCategories);
      if (fetchedCategories.length > 0 && !formCategory) {
        setFormCategory(fetchedCategories[0]);
      }
    } catch (error) {
      toast.error("Failed to load knowledge base data.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingArticle(null);
    setFormTitle("");
    setFormContent("");
    setFormCategory(categories.length > 0 ? categories[0] : "General");
    setFormSource("");
    setFormTags("");
    setShowCreateDialog(true);
  };

  const handleOpenEdit = (article: KBArticle) => {
    setEditingArticle(article);
    setFormTitle(article.title);
    setFormContent(article.content);
    setFormCategory(article.category || "General");
    setFormSource(article.source || "");
    setFormTags(article.tags?.join(", ") || "");
    setShowCreateDialog(true);
  };

  const handleCloseDialog = () => {
    setShowCreateDialog(false);
    setEditingArticle(null);
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !formContent.trim()) {
      toast.error("Title and content are required.");
      return;
    }

    setSaving(true);
    try {
      const tags = formTags.split(",").map(t => t.trim()).filter(Boolean);
      
      if (editingArticle) {
        await updateKBArticle(editingArticle.id, {
          title: formTitle,
          content: formContent,
          category: formCategory || "General",
          source: formSource,
          tags
        });
        toast.success("Article updated successfully");
      } else {
        await createKBArticle({
          title: formTitle,
          content: formContent,
          category: formCategory || "General",
          source: formSource,
          tags
        });
        toast.success("Article created successfully");
      }
      handleCloseDialog();
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to save article");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await toggleKBArticle(id);
      toast.success("Article status updated");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to toggle article status");
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deleteKBArticle(id);
      toast.success("Article deleted successfully");
      setDeletingId(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete article");
    } finally {
      setDeleting(false);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.source && article.source.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCategory = filterCategory === "" || article.category === filterCategory;
    const matchesActive = showInactive || article.is_active;
    
    return matchesSearch && matchesCategory && matchesActive;
  });

  const getCategoryColor = (cat: string | null) => {
    const colorMap: Record<string, string> = {
      Maintenance: "text-violet-700 bg-violet-50 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-850",
      Safety: "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-850",
      Operations: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-850",
      Troubleshooting: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-850",
      Policies: "text-sky-700 bg-sky-50 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-850",
      Training: "text-indigo-700 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-850",
      General: "text-slate-700 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-850",
    };
    return colorMap[cat || "General"] || colorMap.General;
  };

  return (
    <div className="space-y-6">
      <PageHero
        crumbs={["PredictiX", "Admin", "Knowledge Base"]}
        title="Knowledge Base"
        subtitle="Manage articles that power Sidekick's AI knowledge. Articles are automatically embedded for semantic search."
        right={
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium px-4 py-2.5 shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            New Article
          </button>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm select-none cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded text-violet-600 focus:ring-violet-500 border-slate-200 dark:border-white/10 h-4.5 w-4.5 bg-white dark:bg-slate-950"
            />
            <span className="text-muted-foreground font-medium">Show Inactive</span>
          </label>

          <div className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-lg">
            {filteredArticles.length} Articles
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-white/20 dark:bg-slate-900/20">
          <BookOpen className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-600 mb-3" />
          <h3 className="font-semibold text-lg">No articles found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Try adjusting your search filters or create a new article.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className={cn(
                "group relative flex flex-col justify-between rounded-2xl border bg-white dark:bg-slate-900 p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-violet-500/30 dark:hover:border-violet-500/20",
                !article.is_active ? "border-dashed opacity-60 hover:opacity-100" : "border-slate-200 dark:border-white/10"
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2.5 mb-3.5">
                  <span className={cn("text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md border", getCategoryColor(article.category))}>
                    {article.category || "General"}
                  </span>
                  
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(article)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 transition-all"
                      title="Edit article"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(article.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 transition-all"
                      title={article.is_active ? "Deactivate" : "Activate"}
                    >
                      {article.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => setDeletingId(article.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                      title="Delete article"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-base mb-2 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors leading-tight">
                  {article.title}
                </h3>
                
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed whitespace-pre-line">
                  {article.content}
                </p>
              </div>

              <div className="space-y-3.5 pt-3 border-t border-slate-100 dark:border-white/5">
                {article.source && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate font-medium">{article.source}</span>
                  </div>
                )}
                
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5"
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-muted-foreground/70">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Seeded / Updated</span>
                  </div>
                  <span>
                    {article.updated_at 
                      ? new Date(article.updated_at).toLocaleDateString()
                      : article.created_at 
                        ? new Date(article.created_at).toLocaleDateString()
                        : "N/A"}
                  </span>
                </div>
              </div>

              {/* Delete Confirm Panel */}
              {deletingId === article.id && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-2xl transition-all duration-300">
                  <div className="text-center max-w-xs space-y-3">
                    <h4 className="font-semibold text-sm">Delete Article?</h4>
                    <p className="text-xs text-muted-foreground leading-snug">
                      This will remove this article permanently. This cannot be undone.
                    </p>
                    <div className="flex items-center gap-2 justify-center pt-1.5">
                      <button
                        onClick={() => setDeletingId(null)}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                        disabled={deleting}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium shadow-sm transition-all"
                        disabled={deleting}
                      >
                        {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Overlay Drawer */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm transition-all duration-300">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl p-6 md:p-7 max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseDialog}
              className="absolute right-4 top-4 p-1.5 rounded-xl text-slate-500 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-violet-500" />
              {editingArticle ? "Edit Knowledge Article" : "Create Knowledge Article"}
            </h2>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-350">
                  Article Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Toyota Forklift OEM 500-Hour Scope"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-350">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-350">
                    Source Document / Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Factories Ordinance No. 45"
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-350">
                  Article Content (Markdown support)
                </label>
                <textarea
                  placeholder="Enter main content of the knowledge base article..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={8}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all font-mono whitespace-pre-wrap leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-350">
                    Tags
                  </label>
                  <span className="text-[10px] text-muted-foreground/80">Comma-separated</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. compliance, inspections, mechanical, legal"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 justify-end mt-7 pt-4 border-t border-slate-100 dark:border-white/5">
              <button
                onClick={handleCloseDialog}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 font-medium text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium px-5 py-2.5 shadow-sm transition-all"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    {editingArticle ? "Update" : "Create"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
