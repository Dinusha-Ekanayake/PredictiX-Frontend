# Frontend QA Report — Helpdesk Section

## 1. Scope and Components
- **Page Files:**
  - [`help-desk/page.tsx`](file:///c:/Users/USER/Desktop/chakablast/PredictiX-Frontend/src/app/help-desk/page.tsx)

---

## 2. Code Review and Manual QA Findings

### 🟢 Issue 1: Static Category Filters vs Dynamic DB Categories (FIXED)
- **Symptoms:** FAQs created with custom categories via the API/DB will not match any filtering pill in the frontend.
- **Cause:** The category list was previously hardcoded in the frontend.
- **Fix Applied:** Updated `categories` in `help-desk/page.tsx` to dynamically inspect all loaded `faqItems` and append any custom categories to the filter pill bar. Custom categories are now fully filterable.

### 🟡 Issue 2: Role Flickering on Initial Mount
- **Symptoms:** Administrative edit/delete controls flicker visible/invisible during client hydration.
- **Cause:** `isAdmin` state reads from `localStorage` inside a standard React `useEffect`:
  ```typescript
  React.useEffect(() => {
    const r = (window.localStorage.getItem("predictix.user.role") ?? "").toLowerCase();
    setIsAdmin(r === "admin" || r === "super_admin");
  }, []);
  ```
- **Impact:** Minor layout shifts and flicker on loading.
