/**
 * PDF Export Utility for Warehouse Reports
 * Provides enhanced PDF generation with proper A4 formatting and page breaks
 */

interface PDFExportOptions {
  filename?: string;
  title?: string;
  subtitle?: string;
  landscape?: boolean;
}

/**
 * Export HTML element to PDF using window.print()
 * Optimized for A4 page layout with proper pagination
 */
export function exportElementToPDF(
  element: HTMLElement,
  options: PDFExportOptions = {}
): void {
  const {
    filename = "report.pdf",
    title = "Warehouse Report",
    subtitle = "",
    landscape = false,
  } = options;

  // Store original overflow
  const originalOverflow = document.body.style.overflow;
  const originalDisplay = element.style.display;

  try {
    // Prepare for printing
    document.body.style.overflow = "hidden";

    // Create print window
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      throw new Error("Failed to open print window");
    }

    // Build HTML for print
    const printHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          html, body {
            width: 100%;
            height: 100%;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #000;
            background: #fff;
          }

          @page {
            size: ${landscape ? "A4 landscape" : "A4 portrait"};
            margin: 15mm;
          }

          @media print {
            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            html, body {
              width: 100%;
              height: auto;
              margin: 0;
              padding: 0;
            }

            body {
              margin: 15mm;
              padding: 0;
            }

            /* Hide controls */
            button, nav, header, input, select, textarea {
              display: none !important;
            }

            /* Prevent breaking inside elements */
            .rounded-2xl,
            .rounded-xl,
            table,
            .recharts-wrapper {
              page-break-inside: avoid;
            }

            /* Section page breaks */
            [data-section="true"] {
              page-break-after: auto;
              margin-bottom: 20pt;
            }

            [data-section="true"]:nth-of-type(1),
            [data-section="true"]:nth-of-type(2),
            [data-section="true"]:nth-of-type(3) {
              page-break-after: always;
            }

            /* Chart sizing */
            .recharts-wrapper {
              height: 150px !important;
              min-height: 150px !important;
              max-height: 150px !important;
              page-break-inside: avoid;
            }

            svg {
              page-break-inside: avoid;
            }

            /* Table styling */
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 10pt 0;
              font-size: 9pt;
            }

            thead {
              display: table-header-group;
              page-break-after: avoid;
            }

            tbody tr {
              page-break-inside: avoid;
            }

            /* Grid adjustments */
            .grid {
              page-break-inside: avoid;
            }

            .sm\\:grid-cols-2,
            .lg\\:grid-cols-3 {
              grid-template-columns: 1fr !important;
            }

            /* Spacing for print */
            .space-y-4 > * + * {
              margin-top: 12pt;
            }

            .mb-3, .mb-4 {
              margin-bottom: 10pt;
            }

            .mt-3, .mt-4 {
              margin-top: 10pt;
            }

            /* Text sizing */
            h1, h2, h3 {
              font-size: 13pt;
              font-weight: bold;
              margin-bottom: 8pt;
              page-break-after: avoid;
            }

            h4, h5, h6 {
              font-size: 11pt;
              font-weight: bold;
              margin-bottom: 6pt;
              page-break-after: avoid;
            }

            .text-xs {
              font-size: 8pt;
            }

            .text-sm {
              font-size: 9pt;
            }

            .text-lg {
              font-size: 12pt;
            }

            /* Border styling */
            border, border-b, border-l, border-r, border-t {
              border-color: #000 !important;
            }

            /* Remove unnecessary padding/margins for print */
            .px-6, .px-5, .px-4 {
              padding-left: 0 !important;
              padding-right: 0 !important;
            }

            .py-5, .py-4, .py-3 {
              padding-top: 6pt !important;
              padding-bottom: 6pt !important;
            }

            /* Ensure overflow is visible */
            .overflow-y-auto, .overflow-x-auto, .overflow-hidden {
              overflow: visible !important;
              height: auto !important;
              width: auto !important;
            }

            /* Background colors - print-friendly */
            .bg-slate-50, .dark\\:bg-slate-800\\/40 {
              background: #f9f9f9 !important;
            }

            .bg-violet-50, .bg-violet-100 {
              background: #f0f0ff !important;
            }

            .bg-emerald-50 {
              background: #f0fdf4 !important;
            }

            .bg-rose-50 {
              background: #fdf2f8 !important;
            }

            /* Chart element sizing */
            .recharts-text {
              font-size: 8pt !important;
              fill: #000 !important;
            }

            .recharts-cartesian-axis-tick {
              font-size: 8pt !important;
            }

            /* Remove scroll area padding */
            .flex-1.overflow-y-auto {
              margin: 0 !important;
              padding: 0 !important;
            }

            /* Ensure footer doesn't appear multiple times */
            [data-footer="true"] {
              page-break-before: avoid;
              page-break-inside: avoid;
            }
          }

          @media screen {
            body {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
      </html>
    `;

    // Write content to print window
    printWindow.document.write(printHTML);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      // Add data-section attributes for better page break control
      const sections = printWindow.document.querySelectorAll(".rounded-2xl.border");
      sections.forEach((section, index) => {
        (section as HTMLElement).setAttribute("data-section", "true");
      });

      // Trigger print
      setTimeout(() => {
        printWindow.print();
        // Close after print dialog
        setTimeout(() => printWindow.close(), 100);
      }, 250);
    };

    // Fallback if onload doesn't fire
    setTimeout(() => {
      printWindow.print();
    }, 1000);
  } catch (error) {
    console.error("PDF export error:", error);
    alert("Failed to export PDF. Please try again.");
  } finally {
    // Restore original state
    document.body.style.overflow = originalOverflow;
    element.style.display = originalDisplay;
  }
}

/**
 * Enhanced PDF download with filename
 * Uses the browser's print-to-PDF feature
 */
export function downloadReportPDF(
  element: HTMLElement,
  filename: string = `warehouse-report-${new Date().toISOString().split("T")[0]}.pdf`
): void {
  // Add a data attribute to help with filename
  const originalTitle = document.title;
  document.title = filename.replace(".pdf", "");

  try {
    exportElementToPDF(element, {
      filename,
      title: "Warehouse AI Report",
      subtitle: `Generated: ${new Date().toLocaleDateString()}`,
    });
  } finally {
    document.title = originalTitle;
  }
}

/**
 * Create print-friendly HTML from component
 * Useful for debugging print styles
 */
export function createPrintPreview(element: HTMLElement): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @page { margin: 15mm; }
        @media print { button { display: none; } }
      </style>
    </head>
    <body>
      ${element.outerHTML}
    </body>
    </html>
  `;
}
