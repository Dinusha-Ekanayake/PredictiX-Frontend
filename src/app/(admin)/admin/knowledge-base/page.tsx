"use client";

import * as React from "react";
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
  const [formTags, setFormTags] = React.useState("");

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedArticles, fetchedCategories] = await Promise.all([
        listKBArticles(),
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
    setFormTags("");
    setShowCreateDialog(true);
  };

  const handleOpenEdit = (article: KBArticle) => {
    setEditingArticle(article);
    setFormTitle(article.title);
    setFormContent(article.content);
    setFormCategory(article.category);
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
          tags
        });
        toast.success("Article updated successfully.");
      } else {
        await createKBArticle({
          title: formTitle,
          content: formContent,
          category: formCategory || "General",
          tags
        });
        toast.success("Article created successfully.");
      }
      handleCloseDialog();
      fetchData();
    } catch (error) {
      toast.error(editingArticle ? "Failed to update article." : "Failed to create article.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await toggleKBArticle(id);
      toast.success(currentStatus ? "Article deactivated." : "Article activated.");
      fetchData();
    } catch (error) {
      toast.error("Failed to toggle article status.");
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deleteKBArticle(id);
      toast.success("Article deleted successfully.");
      setDeletingId(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to delete article.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredArticles = articles.filter(article => {
    if (!showInactive && !article.active) return false;
    if (filterCategory && article.category !== filterCategory) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return article.title.toLowerCase().includes(query) || 
             article.content.toLowerCase().includes(query) ||
             (article.tags && article.tags.some(t => t.toLowerCase().includes(query)));
    }
    return true;
  });

  const getCategoryColor = (category: string) => {
    if (!category) return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    switch (category.toLowerCase()) {
      case 'maintenance': return 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-violet-200 dark:border-violet-800';
      case 'safety': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'operations': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'troubleshooting': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'policies': return 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200 dark:border-sky-800';
      case 'training': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background pb-12">
      <PageHero
        crumbs={["PredictiX", "Admin", "Knowledge Base"]}
        title="Knowledge Base"
        subtitle="Manage articles that power Sidekick's AI knowledge. Articles are automatically embedded for semantic search."
        right={
          <button 
            onClick={handleOpenCreate}
            className="flex items-center px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" /> New Article
          </button>
        }
      />

      <div className="container mx-auto px-4 md:px-6 mt-8 space-y-6">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-6 w-full md:w-auto">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                />
                <div className={cn(
                  "block w-10 h-6 rounded-full transition-colors",
                  showInactive ? "bg-violet-600" : "bg-slate-300 dark:bg-slate-700"
                )}></div>
                <div className={cn(
                  "dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform",
                  showInactive ? "transform translate-x-4" : ""
                )}></div>
              </div>
              <span className="text-sm font-medium text-muted-foreground">Show Inactive</span>
            </label>
            <div className="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-full text-sm font-medium">
              {filteredArticles.length} Articles
            </div>
          </div>
        </div>

        {/* Article Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-violet-600" />
            <p>Loading knowledge base...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <BookOpen className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No articles found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchQuery || filterCategory 
                ? "Try adjusting your search or filters to find what you're looking for." 
                : "Get started by creating your first knowledge base article."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <div 
                key={article.id} 
                className="group relative flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-card shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {!article.active && (
                  <div className="absolute top-0 right-0 left-0 h-1 bg-slate-300 dark:bg-slate-600 z-10" />
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                      getCategoryColor(article.category)
                    )}>
                      {article.category}
                    </span>
                    <span className={cn(
                      "flex items-center text-xs font-medium px-2 py-0.5 rounded-full",
                      article.active 
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    )}>
                      {article.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {article.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                    {article.content}
                  </p>
                  
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
                      {article.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="inline-flex items-center text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          <Tag className="h-3 w-3 mr-1 opacity-50" />
                          {tag}
                        </span>
                      ))}
                      {article.tags.length > 3 && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                          +{article.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center text-xs text-muted-foreground mb-4 mt-auto pt-2">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    {new Date(article.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="border-t border-slate-100 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenEdit(article)}
                      className="p-2 text-slate-500 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
                      title="Edit article"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleToggle(article.id, article.active)}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        article.active 
                          ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20" 
                          : "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                      )}
                      title={article.active ? "Deactivate" : "Activate"}
                    >
                      {article.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {deletingId === article.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-rose-600 font-medium">Confirm?</span>
                      <button 
                        onClick={() => handleDelete(article.id)}
                        disabled={deleting}
                        className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md transition-colors"
                      >
                        {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                      </button>
                      <button 
                        onClick={() => setDeletingId(null)}
                        disabled={deleting}
                        className="p-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-md transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setDeletingId(article.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                      title="Delete article"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog Overlay */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-foreground flex items-center">
                {editingArticle ? (
                  <><Edit className="h-5 w-5 mr-2 text-violet-600" /> Edit Article</>
                ) : (
                  <><FileText className="h-5 w-5 mr-2 text-violet-600" /> New Article</>
                )}
              </h2>
              <button 
                onClick={handleCloseDialog}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Article Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g., Boiler Maintenance Protocol"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
                <select
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  {/* Fallback option if categories are empty */}
                  {categories.length === 0 && <option value="General">General</option>}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Content</label>
                <textarea
                  value={formContent}
                  onChange={e => setFormContent(e.target.value)}
                  placeholder="Enter the detailed knowledge base article content here..."
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[200px] resize-y"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formTags}
                  onChange={e => setFormTags(e.target.value)}
                  placeholder="e.g., hvac, maintenance, safety-first"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
            
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50">
              <button
                onClick={handleCloseDialog}
                disabled={saving}
                className="px-5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-foreground font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors"
              >
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingArticle ? "Save Changes" : "Create Article"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
