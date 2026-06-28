import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { databaseService } from "../services/appwrite";
import { Resume } from "../types";

export interface ExportResult {
  success: boolean;
  fileName?: string;
  error?: string;
}

export async function exportToPdf(resume: Resume, elementId: string): Promise<ExportResult> {
  const element = document.getElementById(elementId);
  if (!element) {
    return { success: false, error: "Preview page element not found" };
  }

  // Backup original window.getComputedStyle
  const originalGetComputedStyle = window.getComputedStyle;

  // Browser-native oklch/oklab/lab parser using canvas fills
  const convertToRgb = (colorStr: string): string => {
    return colorStr.replace(/(oklch|oklab|lab)\([^)]+\)/gi, (match) => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 1;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return match;
        ctx.fillStyle = match;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
        if (a === 255) {
          return `rgb(${r}, ${g}, ${b})`;
        } else {
          return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
        }
      } catch (e) {
        return match;
      }
    });
  };

  // Proxy getComputedStyle to strip any modern lab/oklch color spaces
  window.getComputedStyle = function (elt, pseudoElt) {
    const style = originalGetComputedStyle(elt, pseudoElt);
    return new Proxy(style, {
      get(target, prop) {
        const val = target[prop as any] as any;
        if (typeof val === "function") {
          if (prop === "getPropertyValue") {
            return function (propertyName: string) {
              const innerVal = target.getPropertyValue(propertyName);
              if (
                typeof innerVal === "string" &&
                (innerVal.includes("oklch") || innerVal.includes("oklab") || innerVal.includes("lab("))
              ) {
                return convertToRgb(innerVal);
              }
              return innerVal;
            };
          }
          return val.bind(target);
        }
        if (typeof val === "string") {
          if (val.includes("oklch") || val.includes("oklab") || val.includes("lab(")) {
            return convertToRgb(val);
          }
        }
        return val;
      },
    }) as any;
  };

  try {
    // Generate clean A4 filename
    const cleanFirstName = resume.personalInfo.firstName || "John";
    const cleanLastName = resume.personalInfo.lastName || "Doe";
    const fileName = `${cleanFirstName}_${cleanLastName}_Resume.pdf`;

    let canvas;
    try {
      // Visual configurations for canvas
      canvas = await html2canvas(element, {
        scale: 2, // High resolution scaling
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          // Copy fonts to cloned document context to ensure proper character metrics
          if (typeof window !== "undefined" && window.document.fonts && (clonedDoc as any).fonts) {
            try {
              window.document.fonts.forEach((font) => {
                (clonedDoc as any).fonts.add(font);
              });
            } catch (e) {
              console.warn("Failed to copy fonts to cloned document:", e);
            }
          }

          // Inject styling to prevent font/spacing issues in html2canvas
          const style = clonedDoc.createElement("style");
          style.innerHTML = `
            #resume-a4-sheet, #resume-a4-sheet * {
              letter-spacing: 0.01px !important;
              word-spacing: normal !important;
              font-variant-ligatures: none !important;
              font-feature-settings: "liga" 0, "clig" 0, "calt" 0 !important;
            }
          `;
          clonedDoc.head.appendChild(style);
        }
      });
    } finally {
      // Restore original getComputedStyle immediately
      window.getComputedStyle = originalGetComputedStyle;
    }

    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    
    // A4 dimensions: 210mm x 297mm
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const pdfWidth = 210;
    const pdfHeight = 297;
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Handle multi-page splits if content exceeds single A4 height
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    // Save file
    pdf.save(fileName);

    // Save to export logs history in backend database
    try {
      await databaseService.addExportRecord({
        userId: resume.userId,
        resumeId: resume.id,
        resumeTitle: resume.title,
        format: "pdf",
        fileName: fileName.replace(/\.pdf$/, "")
      });
    } catch (err) {
      console.warn("Failed to write PDF export log to database:", err);
    }

    return { success: true, fileName };
  } catch (error: any) {
    console.error("PDF compiler error:", error);
    return { success: false, error: error.message || "Failed to compile document" };
  }
}
