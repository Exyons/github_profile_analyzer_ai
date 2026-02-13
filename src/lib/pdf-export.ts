import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportToPDF(
    elementId: string,
    username: string
): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error("Dashboard element not found for PDF export");
    }

    // Temporarily expand the element for full capture
    const originalStyle = element.style.cssText;
    element.style.overflow = "visible";
    element.style.height = "auto";

    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#0a0a0f",
            logging: false,
            // Ignore problematic elements
            ignoreElements: (el) => {
                return el.tagName === "VIDEO" || el.tagName === "IFRAME";
            },
            onclone: (clonedDoc) => {
                // Fix backdrop-filter and modern CSS colors in the clone
                const clonedElement = clonedDoc.getElementById(elementId);
                if (clonedElement) {
                    const allElements = clonedElement.querySelectorAll("*");
                    allElements.forEach((el) => {
                        const htmlEl = el as HTMLElement;
                        const computed = window.getComputedStyle(htmlEl);

                        // Fix 1: Replace backdrop-filter with solid background
                        if (computed.backdropFilter && computed.backdropFilter !== "none") {
                            htmlEl.style.backdropFilter = "none";
                            // @ts-ignore
                            htmlEl.style.webkitBackdropFilter = "none";

                            const bg = computed.backgroundColor;
                            if (bg === "rgba(0, 0, 0, 0)" || bg === "transparent") {
                                htmlEl.style.backgroundColor = "rgba(15, 15, 25, 0.95)";
                            }
                        }

                        // Fix 2: Convert modern CSS colors (oklab, lch, lab) to rgb
                        // html2canvas doesn't support them, so we force a re-computation or fallback
                        const propsToFix = ['backgroundColor', 'color', 'borderColor', 'outlineColor'];
                        propsToFix.forEach(prop => {
                            const val = computed[prop as any];
                            if (val && (val.includes('oklab') || val.includes('lch') || val.includes('lab('))) {
                                // Force a re-computation/fallback to RGB by setting explicitly
                                // This relies on the browser's ability to compute the value to RGB when setting style
                                htmlEl.style[prop as any] = val;

                                // Specific fallback if browser didn't convert it to rgb automatically
                                const newVal = htmlEl.style[prop as any];
                                if (newVal.includes('oklab') || newVal.includes('lch') || newVal.includes('lab(')) {
                                    // Fallback for dark theme transparent elements if conversion fails
                                    if (prop === 'backgroundColor') htmlEl.style.backgroundColor = 'rgba(15, 15, 25, 0.9)';
                                    if (prop === 'color') htmlEl.style.color = '#e5e5e5';
                                    if (prop === 'borderColor') htmlEl.style.borderColor = 'rgba(255,255,255,0.1)';
                                }
                            }
                        });
                    });
                }
            },
        });

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const pdf = new jsPDF("p", "mm", "a4");
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save(`GitHub_Profile_Audit_${username}.pdf`);
    } finally {
        // Restore original styles
        element.style.cssText = originalStyle;
    }
}
