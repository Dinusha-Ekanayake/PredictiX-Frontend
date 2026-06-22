import { toast as sonnerToast } from "sonner";
import { CheckCircle2, AlertCircle, Info, XCircle, X } from "lucide-react";
import * as React from "react";
import { cn } from "./utils";

// Types
type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  title: string;
  description?: string;
  type: ToastType;
  onDismiss: () => void;
  link_url?: string;
}

// Creative Custom Toast Component
function CustomToastContent({ title, description, type, onDismiss, link_url }: ToastProps) {
  const Icon = 
    type === "success" ? CheckCircle2 :
    type === "error" ? XCircle :
    type === "warning" ? AlertCircle : Info;

  const gradientClasses = 
    type === "success" ? "from-emerald-500/20 via-emerald-400/10 to-transparent border-emerald-500/30 text-emerald-600 dark:text-emerald-400" :
    type === "error" ? "from-rose-500/20 via-rose-400/10 to-transparent border-rose-500/30 text-rose-600 dark:text-rose-400" :
    type === "warning" ? "from-amber-500/20 via-amber-400/10 to-transparent border-amber-500/30 text-amber-600 dark:text-amber-400" :
    "from-violet-500/20 via-violet-400/10 to-transparent border-violet-500/30 text-violet-600 dark:text-violet-400";

  const iconBg = 
    type === "success" ? "bg-emerald-500 text-white" :
    type === "error" ? "bg-rose-500 text-white" :
    type === "warning" ? "bg-amber-500 text-white" :
    "bg-violet-500 text-white";

  return (
    <div className={cn(
      "relative overflow-hidden w-full max-w-sm rounded-2xl border bg-card/80 backdrop-blur-xl shadow-lg transition-all duration-300 transform",
      gradientClasses,
      "p-4 pr-10 animate-in slide-in-from-right-8 fade-in zoom-in-95"
    )}>
      <div className="absolute inset-0 bg-gradient-to-br opacity-50 pointer-events-none" />
      
      <div className="relative flex items-start gap-3">
        <div className={cn("flex-shrink-0 p-1.5 rounded-full shadow-sm animate-bounce-short", iconBg)}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 pt-0.5 min-w-0">
          <p className="text-sm font-bold text-foreground leading-snug">
            {title}
          </p>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
          {link_url && (
            <a 
              href={link_url} 
              className={cn("inline-block mt-2 text-xs font-semibold underline hover:opacity-80 transition-opacity")}
            >
              View Details
            </a>
          )}
        </div>
      </div>

      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 p-1 rounded-full text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Wrapper to replace standard Sonner calls
export const toast = {
  success: (title: string, data?: { description?: string, link_url?: string }) => {
    sonnerToast.custom((t) => (
      <CustomToastContent title={title} description={data?.description} link_url={data?.link_url} type="success" onDismiss={() => sonnerToast.dismiss(t)} />
    ), { duration: 4000 });
  },
  error: (title: string, data?: { description?: string, link_url?: string }) => {
    sonnerToast.custom((t) => (
      <CustomToastContent title={title} description={data?.description} link_url={data?.link_url} type="error" onDismiss={() => sonnerToast.dismiss(t)} />
    ), { duration: 5000 });
  },
  info: (title: string, data?: { description?: string, link_url?: string }) => {
    sonnerToast.custom((t) => (
      <CustomToastContent title={title} description={data?.description} link_url={data?.link_url} type="info" onDismiss={() => sonnerToast.dismiss(t)} />
    ), { duration: 4000 });
  },
  warning: (title: string, data?: { description?: string, link_url?: string }) => {
    sonnerToast.custom((t) => (
      <CustomToastContent title={title} description={data?.description} link_url={data?.link_url} type="warning" onDismiss={() => sonnerToast.dismiss(t)} />
    ), { duration: 4000 });
  }
};
