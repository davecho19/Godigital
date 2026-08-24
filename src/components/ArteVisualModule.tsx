import React, { useState } from "react";
import { 
  Download, 
  Upload, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  Bot, 
  Layers, 
  FileCheck, 
  Sliders, 
  Plus, 
  Trash2, 
  DollarSign, 
  Users, 
  Headphones, 
  Smartphone, 
  Award, 
  ShieldCheck, 
  Building2, 
  User, 
  Lock, 
  Cloud, 
  FileText, 
  Clock, 
  BarChart3, 
  Laptop, 
  PenTool, 
  Info,
  RefreshCw,
  Globe,
  ArrowRight,
  MessageSquare,
  Send,
  Image as ImageIcon
} from "lucide-react";
import { PLANES_DATA } from "../data";
import html2canvas from "html2canvas";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

export function ArteVisualModule() {
  // Main Sub-Tab inside Arte Visual: "sistemas" | "firmas" | "ia"
  const [subTab, setSubTab] = useState<"sistemas" | "firmas" | "ia">("sistemas");

  // ==========================================
  // STATE FOR SISTEMAS (FLYER 1)
  // ==========================================
  const [sistemasLogo, setSistemasLogo] = useState<string>("");
  const [planSelectionMode, setPlanSelectionMode] = useState<"individual" | "multiple">("individual");
  const [selectedCategory, setSelectedCategory] = useState<"facturacion" | "erp" | "contador">("facturacion");
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number>(3); // UP INICIAL default
  const [taxMode, setTaxMode] = useState<"sin_iva" | "con_iva">("sin_iva");

  // Custom Plan Fields (Editable)
  const currentPlanData = PLANES_DATA[selectedCategory][selectedPlanIndex] || PLANES_DATA.facturacion[0];
  const [customPlanName, setCustomPlanName] = useState<string>(currentPlanData.nombre.replace("UP ", ""));
  const initialPrice = selectedCategory === "erp" ? (currentPlanData.precioAnual || currentPlanData.precio * 12) : currentPlanData.precio;
  const [customPrice, setCustomPrice] = useState<number>(initialPrice);
  const [customPeriodText, setCustomPeriodText] = useState<string>("PRECIO ANUAL");
  const [customPromoText, setCustomPromoText] = useState<string>("Promociones del mes");
  
  // Customizable Modules List
  const [customModules, setCustomModules] = useState<string[]>([
    "Facturación electrónica",
    "Retenciones",
    "Notas de crédito y débito",
    "Proformas",
    "Compras",
    "Dashboard gerencial",
    "Inventario multibodega",
    "Órdenes de compra",
    "Impuestos (ATS, formularios 103 y 104)"
  ]);
  const [newModuleInput, setNewModuleInput] = useState<string>("");

  // Key Metrics
  const [metricComprobantes, setMetricComprobantes] = useState<string>(currentPlanData.modulos.find(m => m.includes("Comprobantes")) || "20 Comprobantes");
  const [metricUsuarios, setMetricUsuarios] = useState<string>(currentPlanData.modulos.find(m => m.includes("Usuario")) || "1 Usuario");
  const [metricSoporte, setMetricSoporte] = useState<string>("Soporte incluido.");
  const [metricCapacitacion, setMetricCapacitacion] = useState<string>("Capacitación gratuita.");
  const [metricApp, setMetricApp] = useState<string>("App móvil");

  // Multi-Plan list for "Múltiple" mode
  const [multiplePlansList, setMultiplePlansList] = useState<Array<{ name: string; price: number; period: string; category: string }>>([
    { name: "UP INICIAL", price: 10.00, period: "DESDE $10 + IVA ANUAL", category: "Facturación" },
    { name: "UP BASE", price: 25.00, period: "DESDE $25 + IVA ANUAL", category: "Facturación" },
    { name: "ERP START", price: 411.76, period: "DESDE $411.76 + IVA ANUAL", category: "ERP" }
  ]);

  // Handle plan dropdown switch
  const handleSelectPlan = (idx: number) => {
    setSelectedPlanIndex(idx);
    const plan = PLANES_DATA[selectedCategory][idx];
    if (plan) {
      setCustomPlanName(plan.nombre.replace("UP ", ""));
      // Reflect annual price for ERP plans
      const price = selectedCategory === "erp" ? (plan.precioAnual || plan.precio * 12) : plan.precio;
      setCustomPrice(price);
      if (selectedCategory === "erp") {
        setCustomPeriodText("PRECIO ANUAL");
      }
      
      const comp = plan.modulos.find(m => m.includes("Comprobantes")) || "100 Comprobantes";
      const usr = plan.modulos.find(m => m.includes("Usuario")) || "1 Usuario";
      setMetricComprobantes(comp);
      setMetricUsuarios(usr);

      // Reload all modules when selecting a new plan
      if (plan.modulos && plan.modulos.length > 0) {
        setCustomModules([...plan.modulos]);
      }
    }
  };

  // Upload Logo Handler for Sistemas
  const handleLogoUploadSistemas = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setSistemasLogo(uploadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Custom Module Item
  const handleAddCustomModule = () => {
    if (newModuleInput.trim()) {
      setCustomModules([...customModules, newModuleInput.trim()]);
      setNewModuleInput("");
    }
  };

  // Remove Custom Module Item
  const handleRemoveCustomModule = (idx: number) => {
    setCustomModules(customModules.filter((_, i) => i !== idx));
  };

  // Add Plan to Multiple List
  const handleAddMultiplePlan = () => {
    setMultiplePlansList([
      ...multiplePlansList,
      { name: `PLAN ${multiplePlansList.length + 1}`, price: 15.00, period: "ANUAL", category: "Facturación" }
    ]);
  };

  // Export Sistemas Flyer
  const [exportingSistemas, setExportingSistemas] = useState<boolean>(false);

  // Helper function to sanitize cloned document for html2canvas to fix oklab/oklch errors in Tailwind v4
  const sanitizeClonedDocForHtml2Canvas = (clonedDoc: Document, targetId: string) => {
    const clonedElem = clonedDoc.getElementById(targetId);
    if (!clonedElem) return;

    // Force explicit desktop dimensions on target element in cloned document so Tailwind breakpoints and flex/grid match
    clonedElem.style.width = "620px";
    clonedElem.style.minWidth = "620px";
    clonedElem.style.maxWidth = "620px";
    clonedElem.style.margin = "0 auto";
    clonedElem.style.boxSizing = "border-box";

    // Pure JS mathematical conversion for oklch/oklab -> rgb/rgba
    const convertColorFuncs = (colorStr: string): string => {
      if (!colorStr || typeof colorStr !== "string") return colorStr;
      if (!colorStr.includes("oklab") && !colorStr.includes("oklch")) return colorStr;

      return colorStr.replace(/(oklch|oklab)\(([^)]+)\)/gi, (fullMatch, type, content) => {
        try {
          const parts = content.trim().split(/[\s,\/]+/).filter(Boolean);
          if (parts.length < 3) return fullMatch;

          const isOklch = type.toLowerCase() === "oklch";

          let L = parts[0].endsWith("%") ? parseFloat(parts[0]) / 100 : parseFloat(parts[0]);
          let a = 0;
          let b = 0;

          if (isOklch) {
            let C = parts[1].endsWith("%") ? (parseFloat(parts[1]) / 100) * 0.4 : parseFloat(parts[1]);
            let H = parseFloat(parts[2].replace("deg", ""));
            if (isNaN(H)) H = 0;

            const rad = (H * Math.PI) / 180;
            a = C * Math.cos(rad);
            b = C * Math.sin(rad);
          } else {
            a = parts[1].endsWith("%") ? (parseFloat(parts[1]) / 100) * 0.4 : parseFloat(parts[1]);
            b = parts[2].endsWith("%") ? (parseFloat(parts[2]) / 100) * 0.4 : parseFloat(parts[2]);
          }

          let alpha = 1;
          if (parts.length >= 4) {
            alpha = parts[3].endsWith("%") ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]);
          }

          const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
          const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
          const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

          const l = l_ * l_ * l_;
          const m = m_ * m_ * m_;
          const s = s_ * s_ * s_;

          const rLinear = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
          const gLinear = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
          const bLinear = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

          const gamma = (c: number) =>
            c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(Math.max(0, c), 1 / 2.4) - 0.055;

          const R = Math.min(255, Math.max(0, Math.round(gamma(rLinear) * 255)));
          const G = Math.min(255, Math.max(0, Math.round(gamma(gLinear) * 255)));
          const B = Math.min(255, Math.max(0, Math.round(gamma(bLinear) * 255)));

          if (alpha < 1) {
            return `rgba(${R}, ${G}, ${B}, ${alpha.toFixed(3)})`;
          }
          return `rgb(${R}, ${G}, ${B})`;
        } catch {
          return fullMatch;
        }
      });
    };

    // 1. Convert oklab/oklch in all <style> tags without deleting any <style> tags
    const styleTags = Array.from(clonedDoc.querySelectorAll("style"));
    styleTags.forEach((styleTag) => {
      if (
        styleTag.textContent &&
        (styleTag.textContent.includes("oklab") || styleTag.textContent.includes("oklch"))
      ) {
        styleTag.textContent = convertColorFuncs(styleTag.textContent);
      }
    });

    // 2. Compute inline styles for all elements in the canvas container
    const allElements = [
      clonedElem,
      ...Array.from(clonedElem.querySelectorAll<HTMLElement>("*")),
    ];

    const colorProperties = [
      "color",
      "backgroundColor",
      "borderColor",
      "borderTopColor",
      "borderRightColor",
      "borderBottomColor",
      "borderLeftColor",
      "fill",
      "stroke",
    ];

    allElements.forEach((el) => {
      const computed = window.getComputedStyle(el);
      colorProperties.forEach((prop) => {
        const cssProp = prop.replace(/([A-Z])/g, "-$1").toLowerCase();
        const val = computed.getPropertyValue(cssProp);
        if (val && (val.includes("oklab") || val.includes("oklch"))) {
          const converted = convertColorFuncs(val);
          el.style.setProperty(cssProp, converted, "important");
        }
      });

      const styleAttr = el.getAttribute("style");
      if (styleAttr && (styleAttr.includes("oklab") || styleAttr.includes("oklch"))) {
        el.setAttribute("style", convertColorFuncs(styleAttr));
      }
    });

    // 3. HTML2CANVAS VERTICAL ALIGNMENT & BASELINE FIXES
    // Ensure standard font rendering without baseline offsets
    clonedElem.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

    // Fix number badges (w-8 h-8, w-9 h-9, etc.) centering
    const badges = Array.from(clonedElem.querySelectorAll<HTMLElement>('.w-8, .w-9, .w-7, .w-5'));
    badges.forEach((b) => {
      b.style.display = "flex";
      b.style.alignItems = "center";
      b.style.justifyContent = "center";
      b.style.lineHeight = "1";
    });

    // Fix flex item text vertical offset in html2canvas
    const flexItems = Array.from(clonedElem.querySelectorAll<HTMLElement>('.flex'));
    flexItems.forEach((f) => {
      if (f.classList.contains("items-center")) {
        f.style.alignItems = "center";
        f.style.alignContent = "center";
      }
    });

    // Fix line-through rendering
    const strikethroughs = Array.from(clonedElem.querySelectorAll<HTMLElement>('.line-through'));
    strikethroughs.forEach((s) => {
      s.style.textDecoration = "line-through";
      s.style.textDecorationColor = "#f43f5e";
    });
  };

  const handleExportSistemas = async () => {
    setExportingSistemas(true);
    const elem = document.getElementById("flyer-sistemas-canvas");
    if (!elem) {
      setExportingSistemas(false);
      return;
    }

    try {
      // Use toPng from html-to-image to capture exact DOM preview pixel-for-pixel
      const dataUrl = await toPng(elem, {
        quality: 1,
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: "#FAF9F6",
      });

      const link = document.createElement("a");
      link.download = `Arte_Visual_Plan_${(customPlanName || "Sistemas").replace(/\s+/g, "_")}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export error with toPng, falling back to html2canvas:", error);
      try {
        const canvas = await html2canvas(elem, {
          scale: 3,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#FAF9F6",
          logging: false,
          onclone: (clonedDoc) => sanitizeClonedDocForHtml2Canvas(clonedDoc, "flyer-sistemas-canvas")
        });

        const link = document.createElement("a");
        link.download = `Arte_Visual_Plan_${(customPlanName || "Sistemas").replace(/\s+/g, "_")}.png`;
        link.href = canvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err2) {
        alert("No se pudo descargar la imagen PNG. Inténtalo de nuevo.");
      }
    } finally {
      setExportingSistemas(false);
    }
  };

  // ==========================================
  // STATE FOR FIRMAS (FLYER 2)
  // ==========================================
  const [firmasLogo, setFirmasLogo] = useState<string>("");
  const [firmasPlanSelectionMode, setFirmasPlanSelectionMode] = useState<"individual" | "multiple">("multiple");
  const [firmasDiscount, setFirmasDiscount] = useState<string>("35% DE DESCUENTO");
  const [firmasBasePrice, setFirmasBasePrice] = useState<string>("$18,20");

  // Firmas Individual Plan Custom Fields
  const [firmasIndividualPlanName, setFirmasIndividualPlanName] = useState<string>("FIRMA ELECTRÓNICA INDIVIDUAL");
  const [firmasIndividualVigencia, setFirmasIndividualVigencia] = useState<string>("VIGENCIA 1 AÑO");
  const [firmasIndividualPrice, setFirmasIndividualPrice] = useState<string>("$18,20");
  const [firmasIndividualRegularPrice, setFirmasIndividualRegularPrice] = useState<string>("$28,00");
  const [firmasIndividualDetails, setFirmasIndividualDetails] = useState<string>("Persona Natural, Natural con RUC o Jurídica");

  const [firmasValidityPrices, setFirmasValidityPrices] = useState([
    { vigencia: "1 AÑO", popular: false, regular: "$28,00", promo: "$18,20", enabled: true },
    { vigencia: "2 AÑOS", popular: true, regular: "$34,16", promo: "$22,20", enabled: true },
    { vigencia: "3 AÑOS", popular: false, regular: "$51,20", promo: "$33,28", enabled: true },
    { vigencia: "4 AÑOS", popular: false, regular: "$68,25", promo: "$44,36", enabled: true },
    { vigencia: "5 AÑOS", popular: true, regular: "$85,25", promo: "$55,41", enabled: true }
  ]);

  // Upload Logo Handler for Firmas
  const handleLogoUploadFirmas = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setFirmasLogo(uploadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Export Firmas Flyer
  const [exportingFirmas, setExportingFirmas] = useState<boolean>(false);
  const handleExportFirmas = async () => {
    setExportingFirmas(true);
    const elem = document.getElementById("flyer-firmas-canvas");
    if (!elem) {
      setExportingFirmas(false);
      return;
    }

    try {
      // Use toPng from html-to-image to capture exact DOM preview pixel-for-pixel
      const dataUrl = await toPng(elem, {
        quality: 1,
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: "#FFFFFF",
      });

      const link = document.createElement("a");
      link.download = `Arte_Visual_Firmas_Electronicas.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export error with toPng, falling back to html2canvas:", error);
      try {
        const canvas = await html2canvas(elem, {
          scale: 3,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#FFFFFF",
          logging: false,
          onclone: (clonedDoc) => sanitizeClonedDocForHtml2Canvas(clonedDoc, "flyer-firmas-canvas")
        });

        const link = document.createElement("a");
        link.download = `Arte_Visual_Firmas_Electronicas.png`;
        link.href = canvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err2) {
        alert("No se pudo descargar la imagen PNG. Inténtalo de nuevo.");
      }
    } finally {
      setExportingFirmas(false);
    }
  };

  // ==========================================
  // STATE FOR INTELIGENCIA ARTIFICIAL (TAB 3)
  // ==========================================
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [customVisualDetails, setCustomVisualDetails] = useState<string>(
    "Laptop elegante con pantalla encendida mostrando un dashboard interactivo de facturación y ERP, con gráficos de ventas en azul y dorado, un candado digital 3D de seguridad SRI y destellos dorados. Fondo de oficina ejecutiva en Quito."
  );

  const PROMPT_ARTE_SISTEMAS = `[PROMPT IA PARA GENERACIÓN DE ARTE VISUAL 9:12 - MIDJOURNEY / DALL-E / CANVA / GEMINI IMAGE]

Crea una pieza gráfica publicitaria profesional en formato vertical 9:12 (aspect ratio --ar 9:12) para promocionar nuestro Sistema de Facturación Electrónica y ERP Empresarial en Ecuador.

Requisitos de Diseño Gráfico & Estética:
1. Formato: 9:12 vertical (optimizado para Instagram Stories, Reels, TikTok y estados de WhatsApp).
2. Estilo Visual: Fotografía corporativa hiperrealista combinada con renders 3D modernos, limpios y tecnológicos.
3. Paleta de Colores: Azul marino profundo (#1E293B), azul corporativo (#3B51A3), acentos dorados/naranjas y luz suave.
4. Elementos Visuales:
   - Título superior limpio: "FACTURACIÓN ELECTRÓNICA & ERP EN ECUADOR".
   - Interfaz en pantalla con comprobantes aprobados por el SRI y módulos de inventario.
   - Etiqueta de precio prominente con la leyenda "+ IVA ANUAL".

[DETALLES Y ELEMENTOS PERSONALIZADOS QUE DEBEN APARECER EN LA IMAGEN]:
${customVisualDetails.trim() || "Laptop moderna con pantalla de facturación, candado de seguridad SRI y fondo corporativo."}`;

  const PROMPT_ARTE_FIRMAS = `[PROMPT IA PARA GENERACIÓN DE ARTE VISUAL 9:12 - MIDJOURNEY / DALL-E / CANVA / GEMINI IMAGE]

Diseña un arte visual publicitario en formato vertical 9:12 (aspect ratio --ar 9:12) para promocionar Certificados de Firma Electrónica (.p12 y Token) en Ecuador.

Requisitos de Diseño Gráfico & Estética:
1. Formato: 9:12 vertical para redes sociales y mensajería.
2. Estilo Visual: Render 3D de alta definición con temática de ciberseguridad, finanzas y autenticidad legal.
3. Paleta de Colores: Azul noche, cian metálico, destellos esmeralda de seguridad y dorado premium para el porcentaje de oferta.
4. Elementos Clave: Pluma de luz digital firmando un documento PDF con sello legal SRI/BCE, certificado .p12 flotante 3D y badge de "${firmasDiscount || "35% DE DESCUENTO"}".

[DETALLES Y ELEMENTOS PERSONALIZADOS QUE DEBEN APARECER EN LA IMAGEN]:
${customVisualDetails.trim() || "Pluma estilográfica 3D iluminada firmando documento digital seguro."}`;

  const PROMPT_ARTE_CAMPAÑA = `[PROMPT IA PARA GENERACIÓN DE ARTE VISUAL 9:12 - MIDJOURNEY / DALL-E / CANVA / GEMINI IMAGE]

Genera un banner publicitario 3D en formato vertical 9:12 (aspect ratio --ar 9:12) para una campaña comercial de alto impacto de software empresarial en Ecuador.

Requisitos de Diseño Gráfico & Estética:
1. Formato: 9:12 vertical.
2. Estilo Visual: Publicidad 3D de nivel agencia con profundidad de campo, iluminación dinámica y cintas tridimensionales de oferta.
3. Mensaje Visual: "MÁS CONTROL, MÁS EFICIENCIA, MÁS RESULTADOS PARA TU NEGOCIO EN ECUADOR".

[DETALLES Y ELEMENTOS PERSONALIZADOS QUE DEBEN APARECER EN LA IMAGEN]:
${customVisualDetails.trim() || "Caja de regalo tecnológica entreabierta con destellos 3D y distintivos de oferta especial."}`;

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2500);
  };

  // Interactive Gemini Assistant preview state inside the browser view
  const [aiInput, setAiInput] = useState<string>("");
  const [aiOutput, setAiOutput] = useState<string>("");
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  const handleSimulateGemini = (customPromptText?: string) => {
    const textToRun = customPromptText || aiInput;
    if (!textToRun.trim()) return;

    setIsGeneratingAi(true);
    setAiOutput("⚡ Conectando con Google Gemini AI y analizando tu prompt...");

    setTimeout(() => {
      setAiOutput(`✨ RESPUESTA GENERADA POR GEMINI AI:

🚀 ¡Potencia tu Negocio con Facturación Electrónica 100% Legal en Ecuador! 🇪🇨

¿Cansado de perder tiempo en procesos manuales y temer multas del SRI? ⚡

Con nuestro Sistema de Facturación y ERP Empresarial obtienes:
✅ Emisión rápida de facturas, notas de crédito y retenciones.
✅ Control total de inventario multibodega y reportes de impuestos (ATS, Form. 103 y 104).
✅ App móvil para facturar desde donde estés.
✅ Capacitación gratuita y soporte especializado siempre listo para ayudarte.

🎁 PROMOCIÓN DEL MES: ¡Pregunta por nuestras tarifas exclusivas anuales desde $10 + IVA!

📲 ¡Pide tu demostración sin compromiso por WhatsApp hoy mismo!
👉 Haz clic aquí para chatear con un asesor.`);
      setIsGeneratingAi(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* ==================================================================================== */}
      {/* HIGHLY VISIBLE SUB-TAB SELECTOR NAVIGATION BAR */}
      {/* ==================================================================================== */}
      <div className="bg-slate-900 p-2 sm:p-2.5 rounded-2xl border-2 border-slate-800 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          
          {/* TAB 1: SISTEMAS */}
          <button
            onClick={() => setSubTab("sistemas")}
            className={`group relative p-3.5 sm:p-4 rounded-xl text-left transition-all duration-200 cursor-pointer flex items-center justify-between ${
              subTab === "sistemas"
                ? "bg-gradient-to-r from-[#1E293B] to-[#3B51A3] text-white border-2 border-amber-400/90 shadow-lg ring-2 ring-amber-400/20"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/70"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl transition-colors ${
                subTab === "sistemas" ? "bg-amber-400 text-slate-950 font-black" : "bg-slate-700/70 text-amber-300"
              }`}>
                <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300/90 block">
                  Volante Gráfico 1
                </span>
                <span className="text-sm sm:text-base font-black tracking-tight block">
                  1. Sistemas &amp; ERP
                </span>
              </div>
            </div>
            {subTab === "sistemas" && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
            )}
          </button>

          {/* TAB 2: FIRMAS */}
          <button
            onClick={() => setSubTab("firmas")}
            className={`group relative p-3.5 sm:p-4 rounded-xl text-left transition-all duration-200 cursor-pointer flex items-center justify-between ${
              subTab === "firmas"
                ? "bg-gradient-to-r from-[#1E293B] to-[#3B51A3] text-white border-2 border-amber-400/90 shadow-lg ring-2 ring-amber-400/20"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/70"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl transition-colors ${
                subTab === "firmas" ? "bg-amber-400 text-slate-950 font-black" : "bg-slate-700/70 text-amber-300"
              }`}>
                <FileCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300/90 block">
                  Volante Gráfico 2
                </span>
                <span className="text-sm sm:text-base font-black tracking-tight block">
                  2. Firmas Electrónicas
                </span>
              </div>
            </div>
            {subTab === "firmas" && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
            )}
          </button>

          {/* TAB 3: INTELIGENCIA ARTIFICIAL */}
          <button
            onClick={() => setSubTab("ia")}
            className={`group relative p-3.5 sm:p-4 rounded-xl text-left transition-all duration-200 cursor-pointer flex items-center justify-between ${
              subTab === "ia"
                ? "bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white border-2 border-purple-400 shadow-lg ring-2 ring-purple-400/30"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/70"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl transition-colors ${
                subTab === "ia" ? "bg-purple-500 text-white font-black" : "bg-purple-900/60 text-purple-300"
              }`}>
                <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 block">
                  Generador &amp; Navegador
                </span>
                <span className="text-sm sm:text-base font-black tracking-tight block">
                  3. Inteligencia Artificial (Gemini)
                </span>
              </div>
            </div>
            {subTab === "ia" && (
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_#A855F7]" />
            )}
          </button>

        </div>
      </div>

      {/* ==================================================================================== */}
      {/* SUB-TAB 1: SISTEMAS (FLYER ART) */}
      {/* ==================================================================================== */}
      {subTab === "sistemas" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Controls Editor Sidebar (Left) */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#3B51A3]" />
                <span>Configurar Volante de Sistemas</span>
              </h2>
              <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-md">
                Formato Personalizable
              </span>
            </div>

            {/* 1. Custom Logo Upload */}
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Logo de la Empresa / Distribuidor</span>
                {sistemasLogo && (
                  <button 
                    onClick={() => setSistemasLogo("")} 
                    className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Quitar Logo
                  </button>
                )}
              </label>
              <div className="flex items-center gap-3">
                {sistemasLogo ? (
                  <div className="h-12 w-20 rounded-lg border border-slate-300 p-1 bg-white flex items-center justify-center shrink-0">
                    <img src={sistemasLogo} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                  </div>
                ) : (
                  <div className="h-12 w-20 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-400 shrink-0">
                    <Upload className="w-5 h-5 text-[#3B51A3]" />
                  </div>
                )}
                <label className="flex-1 cursor-pointer">
                  <span className="inline-block py-2 px-3 rounded-lg text-xs font-extrabold bg-[#3B51A3] hover:bg-[#2E3E85] text-white transition-all shadow-xs text-center w-full">
                    {sistemasLogo ? "Cambiar Logo" : "Subir Logo Propio"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUploadSistemas}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Sube tu propio logo transparente en PNG o JPEG para personalizar el arte gráfico.
              </p>
            </div>

            {/* 2. Selection Mode: Individual vs Multiple */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Modo de Selección de Planes:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPlanSelectionMode("individual")}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    planSelectionMode === "individual"
                      ? "bg-[#3B51A3] text-white border-[#3B51A3] shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Plan Individual</span>
                </button>
                <button
                  onClick={() => setPlanSelectionMode("multiple")}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    planSelectionMode === "multiple"
                      ? "bg-[#3B51A3] text-white border-[#3B51A3] shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Planes Múltiples</span>
                </button>
              </div>
            </div>

            {/* INDIVIDUAL PLAN EDIT CONTROLS */}
            {planSelectionMode === "individual" ? (
              <div className="space-y-4">
                
                {/* Category & Plan Preset */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 mb-1 block">Categoría:</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        const cat = e.target.value as any;
                        setSelectedCategory(cat);
                        setSelectedPlanIndex(0);
                        const p = PLANES_DATA[cat][0];
                        if (p) {
                          setCustomPlanName(p.nombre.replace("UP ", ""));
                          const price = cat === "erp" ? (p.precioAnual || p.precio * 12) : p.precio;
                          setCustomPrice(price);
                          if (p.modulos) {
                            setCustomModules([...p.modulos]);
                          }
                        }
                      }}
                      className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800 cursor-pointer"
                    >
                      <option value="facturacion">Facturación Electrónica</option>
                      <option value="erp">ERP Empresarial</option>
                      <option value="contador">Especial Contador</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 mb-1 block">Plan Predefinido:</label>
                    <select
                      value={selectedPlanIndex}
                      onChange={(e) => handleSelectPlan(Number(e.target.value))}
                      className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800 cursor-pointer"
                    >
                      {PLANES_DATA[selectedCategory].map((p, idx) => (
                        <option key={idx} value={idx}>
                          {p.nombre} (${p.precio})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Name & Custom Price */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 mb-1 block">Nombre en el Arte:</label>
                    <input
                      type="text"
                      value={customPlanName}
                      onChange={(e) => setCustomPlanName(e.target.value)}
                      className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2 bg-white text-slate-900"
                      placeholder="Ej: INICIAL"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 mb-1 block">Precio Modificable ($):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(Number(e.target.value))}
                      className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2 bg-white text-slate-900"
                    />
                  </div>
                </div>

                {/* Period & Promo Text & Tax Mode */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 mb-1 block">Frecuencia / Periodo:</label>
                    <input
                      type="text"
                      value={customPeriodText}
                      onChange={(e) => setCustomPeriodText(e.target.value)}
                      className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2 bg-white text-slate-800"
                      placeholder="Ej: PRECIO ANUAL"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 mb-1 block">Texto Promocional:</label>
                    <input
                      type="text"
                      value={customPromoText}
                      onChange={(e) => setCustomPromoText(e.target.value)}
                      className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2 bg-white text-slate-800"
                    />
                  </div>
                </div>

                {/* Tax Option Selector (Con IVA / Sin IVA) */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                    <span>Personalización de Impuestos (IVA):</span>
                    <span className="text-[10px] text-[#FF6B00] font-black">
                      {taxMode === "con_iva" ? "Total +15% IVA" : "Valor Neto"}
                    </span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setTaxMode("sin_iva")}
                      className={`py-1.5 px-3 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                        taxMode === "sin_iva"
                          ? "bg-slate-800 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Sin IVA (${customPrice.toFixed(2)})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaxMode("con_iva")}
                      className={`py-1.5 px-3 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                        taxMode === "con_iva"
                          ? "bg-[#3B51A3] text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Con IVA (+15% = ${(customPrice * 1.15).toFixed(2)})
                    </button>
                  </div>
                </div>

                {/* Key Metrics Customization */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2">
                  <span className="text-xs font-extrabold text-slate-700 block">Métricas Destacadas (Columna Derecha):</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={metricComprobantes}
                      onChange={(e) => setMetricComprobantes(e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg p-1.5 bg-white font-medium"
                      placeholder="Comprobantes"
                    />
                    <input
                      type="text"
                      value={metricUsuarios}
                      onChange={(e) => setMetricUsuarios(e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg p-1.5 bg-white font-medium"
                      placeholder="Usuarios"
                    />
                    <input
                      type="text"
                      value={metricSoporte}
                      onChange={(e) => setMetricSoporte(e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg p-1.5 bg-white font-medium"
                      placeholder="Soporte"
                    />
                    <input
                      type="text"
                      value={metricCapacitacion}
                      onChange={(e) => setMetricCapacitacion(e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg p-1.5 bg-white font-medium"
                      placeholder="Capacitación"
                    />
                  </div>
                </div>

                {/* Modules Editor */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-700">Módulos Principales (Lista):</label>
                    <span className="text-[10px] text-slate-500 font-bold">{customModules.length} módulos</span>
                  </div>
                  
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 border border-slate-200 rounded-xl p-2 bg-slate-50">
                    {customModules.map((mod, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 bg-white p-1.5 rounded-lg border border-slate-200 text-xs text-slate-800">
                        <span className="truncate font-medium">{mod}</span>
                        <button
                          onClick={() => handleRemoveCustomModule(idx)}
                          className="text-rose-500 hover:text-rose-700 p-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add module input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newModuleInput}
                      onChange={(e) => setNewModuleInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddCustomModule()}
                      placeholder="Agregar nuevo módulo..."
                      className="flex-1 text-xs border border-slate-200 rounded-lg p-2 bg-white"
                    />
                    <button
                      onClick={handleAddCustomModule}
                      className="bg-[#3B51A3] hover:bg-[#2E3E85] text-white p-2 rounded-lg cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              /* MULTIPLE PLAN SELECTION MODE */
              <div className="space-y-4">
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 font-medium">
                  El modo Múltiple genera una tabla comparativa de tus planes seleccionados en un solo volante.
                </div>

                <div className="space-y-2">
                  {multiplePlansList.map((pItem, pIdx) => (
                    <div key={pIdx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">Plan #{pIdx + 1}</span>
                        <button
                          onClick={() => setMultiplePlansList(multiplePlansList.filter((_, i) => i !== pIdx))}
                          className="text-rose-600 hover:underline text-xs font-bold cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={pItem.name}
                          onChange={(e) => {
                            const copy = [...multiplePlansList];
                            copy[pIdx].name = e.target.value;
                            setMultiplePlansList(copy);
                          }}
                          className="text-xs border border-slate-200 rounded-lg p-1.5 bg-white font-bold"
                          placeholder="Nombre del Plan"
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={pItem.price}
                          onChange={(e) => {
                            const copy = [...multiplePlansList];
                            copy[pIdx].price = Number(e.target.value);
                            setMultiplePlansList(copy);
                          }}
                          className="text-xs border border-slate-200 rounded-lg p-1.5 bg-white font-bold"
                          placeholder="Precio"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={handleAddMultiplePlan}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Otro Plan a la Comparativa</span>
                  </button>
                </div>
              </div>
            )}

            {/* Export Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center">
              <button
                onClick={() => handleExportSistemas()}
                disabled={exportingSistemas}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{exportingSistemas ? "Generando Imagen PNG..." : "Descargar Imagen PNG (Alta Resolución)"}</span>
              </button>
            </div>

          </div>

          {/* Canvas Preview Area (Right) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            
            <div className="mb-2 text-center">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Previsualización en Tiempo Real (Formato Sistemas &amp; ERP)
              </span>
            </div>

            {/* THE CANVAS CONTAINER */}
            <div
              id="flyer-sistemas-canvas"
              className="w-full max-w-[620px] bg-[#FAF9F6] p-6 sm:p-8 rounded-[28px] border-2 border-slate-200 shadow-2xl relative overflow-hidden text-slate-900 font-sans select-none flex flex-col justify-between"
              style={{ minHeight: "600px" }}
            >
              
              {/* MAIN CONTENT WRAPPER */}
              <div className="space-y-6">
                
                {/* TOP HEADER SECTION: CUSTOM LOGO + PLAN NAME BADGE */}
                <div className="flex items-center justify-between mb-6 pt-2">
                  
                  {/* Custom Logo Area (Larger image size on upload) */}
                  <div className="flex items-center">
                    {sistemasLogo ? (
                      <div className="max-h-28 max-w-[300px] p-2 bg-white rounded-2xl shadow-md border border-slate-200 flex items-center justify-center shrink-0">
                        <img src={sistemasLogo} alt="Logo Empresa" className="max-h-24 max-w-[280px] object-contain" />
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-[#FF6B00] bg-[#FFF7ED] text-[#FF6B00] rounded-2xl p-4 sm:px-6 flex items-center gap-3 shrink-0 shadow-xs">
                        <ImageIcon className="w-7 h-7 shrink-0 text-[#FF6B00]" />
                        <div className="text-left">
                          <span className="text-xs font-black uppercase tracking-wide block">Cargar Tu Logo Aquí</span>
                          <span className="text-[10px] text-slate-600 font-medium block">Personaliza este arte con tu marca</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Top Dark Navy Pill Badge for Plan Name */}
                  <div className="bg-[#1E293B] text-white px-6 sm:px-10 py-3 rounded-2xl shadow-md border border-slate-700 flex items-center justify-center text-center">
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-center uppercase leading-tight m-0 p-0 text-white flex items-center justify-center my-auto">
                      {planSelectionMode === "individual" ? customPlanName : "Planes Comparativos"}
                    </h3>
                  </div>
                </div>

                {/* MIDDLE SECTION: MODULOS PRINCIPALES + METRICS */}
                {planSelectionMode === "individual" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start my-6 relative z-10">
                    
                    {/* LEFT COLUMN: MODULOS PRINCIPALES */}
                    <div className="sm:col-span-7 space-y-3">
                      {/* Dark Pill Header */}
                      <div className="bg-[#1E293B] text-white text-center py-2.5 px-4 rounded-xl text-sm font-extrabold tracking-wide shadow-xs flex items-center justify-center">
                        <span className="leading-tight m-0 p-0 text-center text-white flex items-center justify-center my-auto">Módulos Principales</span>
                      </div>

                      {/* Modules List */}
                      <div className="space-y-2 pl-1 pt-1">
                        {customModules.map((mod, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-[#1E293B] flex items-center justify-center shrink-0 border border-slate-700 shadow-2xs relative my-auto">
                              <Check className="w-3 h-3 text-[#FF6B00] stroke-[3.5]" />
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
                              {mod}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* VERTICAL DIVIDER */}
                    <div className="hidden sm:block absolute left-7/12 top-0 bottom-0 w-[2px] bg-slate-300/80 -ml-3" />

                    {/* RIGHT COLUMN: KEY METRICS */}
                    <div className="sm:col-span-5 space-y-3 pl-0 sm:pl-3">
                      
                      {/* Item 1: Comprobantes */}
                      <div className="bg-[#F1F5F9] p-2.5 rounded-2xl border border-[#CBD5E1] flex items-center gap-3 shadow-2xs">
                        <div className="w-9 h-9 rounded-full bg-[#1E293B] text-white flex items-center justify-center shrink-0 shadow-xs relative my-auto">
                          <DollarSign className="w-4 h-4 text-amber-300" />
                          <span className="absolute -bottom-1 -right-1 bg-[#FF6B00] text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                            <Check className="w-2 h-2 stroke-[3]" />
                          </span>
                        </div>
                        <div className="flex items-center my-auto flex-1">
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900 leading-normal my-auto">
                            {metricComprobantes}
                          </span>
                        </div>
                      </div>

                      {/* Item 2: Usuarios */}
                      <div className="bg-[#F1F5F9] p-2.5 rounded-2xl border border-[#CBD5E1] flex items-center gap-3 shadow-2xs">
                        <div className="w-9 h-9 rounded-full bg-[#1E293B] text-white flex items-center justify-center shrink-0 shadow-xs relative my-auto">
                          <Users className="w-4 h-4 text-amber-300" />
                          <span className="absolute -bottom-1 -right-1 bg-[#FF6B00] text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                            <Check className="w-2 h-2 stroke-[3]" />
                          </span>
                        </div>
                        <div className="flex items-center my-auto flex-1">
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900 leading-normal my-auto">
                            {metricUsuarios}
                          </span>
                        </div>
                      </div>

                      {/* Item 3: Soporte */}
                      <div className="bg-[#F1F5F9] p-2.5 rounded-2xl border border-[#CBD5E1] flex items-center gap-3 shadow-2xs">
                        <div className="w-9 h-9 rounded-full bg-[#1E293B] text-white flex items-center justify-center shrink-0 shadow-xs relative my-auto">
                          <Headphones className="w-4 h-4 text-amber-300" />
                          <span className="absolute -bottom-1 -right-1 bg-[#FF6B00] text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                            <Check className="w-2 h-2 stroke-[3]" />
                          </span>
                        </div>
                        <div className="flex items-center my-auto flex-1">
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900 leading-normal my-auto">
                            {metricSoporte}
                          </span>
                        </div>
                      </div>

                      {/* Item 4: Capacitación */}
                      <div className="bg-[#F1F5F9] p-2.5 rounded-2xl border border-[#CBD5E1] flex items-center gap-3 shadow-2xs">
                        <div className="w-9 h-9 rounded-full bg-[#1E293B] text-white flex items-center justify-center shrink-0 shadow-xs relative my-auto">
                          <Award className="w-4 h-4 text-amber-300" />
                          <span className="absolute -bottom-1 -right-1 bg-[#FF6B00] text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                            <Check className="w-2 h-2 stroke-[3]" />
                          </span>
                        </div>
                        <div className="flex items-center my-auto flex-1">
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900 leading-normal my-auto">
                            {metricCapacitacion}
                          </span>
                        </div>
                      </div>

                      {/* Item 5: App Móvil */}
                      <div className="bg-[#F1F5F9] p-2.5 rounded-2xl border border-[#CBD5E1] flex items-center gap-3 shadow-2xs">
                        <div className="w-9 h-9 rounded-full bg-[#1E293B] text-white flex items-center justify-center shrink-0 shadow-xs relative my-auto">
                          <Smartphone className="w-4 h-4 text-amber-300" />
                          <span className="absolute -bottom-1 -right-1 bg-[#FF6B00] text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                            <Check className="w-2 h-2 stroke-[3]" />
                          </span>
                        </div>
                        <div className="flex items-center my-auto flex-1">
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900 leading-normal my-auto">
                            {metricApp}
                          </span>
                        </div>
                      </div>

                    </div>

                  </div>
                ) : (
                  /* MULTIPLE COMPARATIVE TABLE CANVAS */
                  <div className="my-6 space-y-3 relative z-10">
                    <div className="grid grid-cols-3 gap-3">
                      {multiplePlansList.map((p, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-sm text-center space-y-2">
                          <span className="text-xs font-black text-[#FF6B00] block uppercase">{p.category}</span>
                          <h4 className="text-sm font-black text-slate-900 truncate">{p.name}</h4>
                          <div className="bg-[#1E293B] text-white p-2.5 rounded-xl flex items-center justify-center">
                            <span className="text-base font-black text-amber-300 leading-none">
                              ${(taxMode === "con_iva" ? p.price * 1.15 : p.price).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* HORIZONTAL DIVIDER */}
                <div className="w-full h-[2px] bg-[#CBD5E1] my-4 relative z-10" />

                {/* PROMOTIONS & PRICING BANNER */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                  {/* Left Promo text */}
                  <div className="text-center sm:text-left">
                    <p className="text-lg sm:text-xl font-black text-[#FF6B00] flex items-center justify-center sm:justify-start gap-1.5">
                      <span>{customPromoText}</span>
                      <Sparkles className="w-4 h-4 text-[#FF6B00] fill-[#FF6B00]" />
                    </p>
                  </div>

                  {/* Right Price Box */}
                  <div className="bg-white p-2.5 rounded-2xl border-2 border-[#1E293B] shadow-md flex flex-col items-center justify-center relative min-w-[210px]">
                    {/* "DESDE" Orange Tag */}
                    <span className="absolute -top-3 right-4 bg-[#FF6B00] text-white text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-wider shadow-2xs leading-none flex items-center justify-center text-center">
                      DESDE
                    </span>

                    <div className="flex items-center gap-2 pl-1 mb-1.5 w-full justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#FF6B00] flex items-center justify-center shrink-0">
                          <BarChart3 className="w-4 h-4" />
                        </div>
                        <div className="text-left leading-tight">
                          <span className="text-[9px] font-black uppercase text-slate-500 block">PRECIO</span>
                          <span className="text-[11px] font-black uppercase text-slate-900 block">{customPeriodText}</span>
                        </div>
                      </div>
                    </div>

                    {/* Blue Box with ONLY the price value occupying the entire container */}
                    <div className="bg-[#1E293B] text-white px-6 py-3.5 rounded-xl font-black text-2xl sm:text-3xl tracking-tight text-center w-full flex items-center justify-center shadow-xs">
                      <span className="text-amber-300 font-black leading-tight text-center block w-full my-auto">
                        ${(taxMode === "con_iva" ? customPrice * 1.15 : customPrice).toFixed(2)}
                      </span>
                    </div>

                    {/* Tax label */}
                    <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-600 block text-center pt-1.5 leading-none">
                      {taxMode === "con_iva" ? "ya incluye 15% IVA" : "no incluye impuestos"}
                    </span>
                  </div>
                </div>

              </div>

              {/* CLEAN FOOTER SLOGAN */}
              <div className="relative z-10 pt-4 mt-6 border-t border-[#CBD5E1] text-center text-xs sm:text-sm font-black text-slate-800">
                <span className="text-[#FF6B00]">✔</span> Más control. Más eficiencia. <span className="text-[#FF6B00]">Más resultados.</span>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ==================================================================================== */}
      {/* SUB-TAB 2: FIRMAS ELECTRÓNICAS (FLYER ART) */}
      {/* ==================================================================================== */}
      {subTab === "firmas" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Controls Sidebar (Left) */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#3B51A3]" />
                <span>Configurar Volante de Firmas</span>
              </h2>
              <span className="text-[11px] font-bold bg-blue-100 text-[#3B51A3] px-2.5 py-0.5 rounded-md">
                Formato Personalizable
              </span>
            </div>

            {/* Selection Mode: Individual vs Multiple */}
            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <label className="text-xs font-bold text-slate-700 block">Modo de Selección de Plan:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFirmasPlanSelectionMode("individual")}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    firmasPlanSelectionMode === "individual"
                      ? "bg-[#3B51A3] text-white border-[#3B51A3] shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Plan Individual</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFirmasPlanSelectionMode("multiple")}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    firmasPlanSelectionMode === "multiple"
                      ? "bg-[#3B51A3] text-white border-[#3B51A3] shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Vigencias Múltiples</span>
                </button>
              </div>
            </div>

            {/* Logo Upload for Firmas */}
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Logo de la Empresa / Marca</span>
                {firmasLogo && (
                  <button 
                    onClick={() => setFirmasLogo("")} 
                    className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Quitar Logo
                  </button>
                )}
              </label>
              <div className="flex items-center gap-3">
                {firmasLogo ? (
                  <div className="h-12 w-20 rounded-lg border border-slate-300 p-1 bg-white flex items-center justify-center shrink-0">
                    <img src={firmasLogo} alt="Logo Firmas" className="max-h-full max-w-full object-contain" />
                  </div>
                ) : (
                  <div className="h-12 w-20 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-400 shrink-0">
                    <Upload className="w-5 h-5 text-[#3B51A3]" />
                  </div>
                )}
                <label className="flex-1 cursor-pointer">
                  <span className="inline-block py-2 px-3 rounded-lg text-xs font-extrabold bg-[#3B51A3] hover:bg-[#2E3E85] text-white transition-all shadow-xs text-center w-full">
                    {firmasLogo ? "Cambiar Logo" : "Subir Logo Propio"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUploadFirmas}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Sube tu propio logo para el encabezado del volante de firmas electrónicas.
              </p>
            </div>

            {/* Editable Discount Badge */}
            <div className="space-y-1.5 bg-amber-50/80 p-3.5 rounded-xl border border-amber-200">
              <label className="text-xs font-extrabold text-amber-900 block flex items-center justify-between">
                <span>Mensaje de Descuento (Modificable):</span>
                <span className="text-[10px] bg-amber-200 text-amber-950 font-bold px-2 py-0.5 rounded">Encabezado</span>
              </label>
              <input
                type="text"
                value={firmasDiscount}
                onChange={(e) => setFirmasDiscount(e.target.value)}
                className="w-full text-sm font-black border-2 border-amber-300 rounded-lg p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-amber-500"
                placeholder="Ej: 35% DE DESCUENTO"
              />
              <p className="text-[10px] text-amber-800 font-medium">
                Edita este texto para personalizar tu promoción (ej: "40% OFF", "OFERTA DEL MES", "35% DE DESCUENTO").
              </p>
            </div>

            {firmasPlanSelectionMode === "individual" ? (
              /* INDIVIDUAL PLAN CONTROLS FOR FIRMAS */
              <div className="space-y-3 bg-blue-50/60 p-3.5 rounded-xl border border-blue-200">
                <span className="text-xs font-extrabold text-[#3B51A3] block">Configurar Plan Individual de Firma:</span>
                
                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 mb-1 block">Vigencia / Nombre del Plan:</label>
                    <input
                      type="text"
                      value={firmasIndividualVigencia}
                      onChange={(e) => setFirmasIndividualVigencia(e.target.value)}
                      className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2 bg-white text-slate-900"
                      placeholder="Ej: VIGENCIA 1 AÑO"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 mb-1 block">Precio Promocional ($):</label>
                      <input
                        type="text"
                        value={firmasIndividualPrice}
                        onChange={(e) => setFirmasIndividualPrice(e.target.value)}
                        className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2 bg-white text-slate-900"
                        placeholder="Ej: $18,20"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 mb-1 block">Precio Regular ($):</label>
                      <input
                        type="text"
                        value={firmasIndividualRegularPrice}
                        onChange={(e) => setFirmasIndividualRegularPrice(e.target.value)}
                        className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2 bg-white text-slate-900"
                        placeholder="Ej: $28,00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 mb-1 block">Dirigido a / Detalles:</label>
                    <input
                      type="text"
                      value={firmasIndividualDetails}
                      onChange={(e) => setFirmasIndividualDetails(e.target.value)}
                      className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2 bg-white text-slate-900"
                      placeholder="Ej: Persona Natural, Natural con RUC o Jurídica"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* MULTIPLE PLAN CONTROLS FOR FIRMAS */
              <>
                {/* Base Price "Desde" */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Precio Inicial ("Firma desde"):</label>
                  <input
                    type="text"
                    value={firmasBasePrice}
                    onChange={(e) => setFirmasBasePrice(e.target.value)}
                    className="w-full text-xs font-black border border-slate-200 rounded-lg p-2.5 bg-white text-slate-900"
                    placeholder="Ej: $18,20"
                  />
                </div>

                {/* Vigencias Prices Table */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800 block">Listado de Vigencias de Firmas:</span>
                    <span className="text-[10px] text-slate-500 font-bold">
                      {firmasValidityPrices.filter(v => v.enabled !== false).length} vigencias visibles
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {firmasValidityPrices.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border transition-all ${
                          item.enabled !== false ? "bg-slate-50 border-slate-200" : "bg-slate-100/60 border-slate-200 opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.enabled !== false}
                              onChange={(e) => {
                                const copy = [...firmasValidityPrices];
                                copy[idx].enabled = e.target.checked;
                                setFirmasValidityPrices(copy);
                              }}
                              className="rounded border-slate-300 text-[#3B51A3] focus:ring-[#3B51A3] w-4 h-4 cursor-pointer"
                            />
                            <span className="text-xs font-extrabold text-[#3B51A3]">{item.vigencia}</span>
                          </label>

                          <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.popular}
                              disabled={item.enabled === false}
                              onChange={(e) => {
                                const copy = [...firmasValidityPrices];
                                copy[idx].popular = e.target.checked;
                                setFirmasValidityPrices(copy);
                              }}
                              className="rounded border-slate-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
                            />
                            <span>Destacar ★</span>
                          </label>
                        </div>

                        {item.enabled !== false && (
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <div>
                              <span className="text-[10px] text-slate-500 block">Precio Regular:</span>
                              <input
                                type="text"
                                value={item.regular}
                                onChange={(e) => {
                                  const copy = [...firmasValidityPrices];
                                  copy[idx].regular = e.target.value;
                                  setFirmasValidityPrices(copy);
                                }}
                                className="w-full text-xs font-medium border border-slate-200 rounded-lg p-1.5 bg-white"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-emerald-600 block">Precio Oferta:</span>
                              <input
                                type="text"
                                value={item.promo}
                                onChange={(e) => {
                                  const copy = [...firmasValidityPrices];
                                  copy[idx].promo = e.target.value;
                                  setFirmasValidityPrices(copy);
                                }}
                                className="w-full text-xs font-black border border-slate-200 rounded-lg p-1.5 bg-white text-slate-900"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Export Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center">
              <button
                onClick={() => handleExportFirmas()}
                disabled={exportingFirmas}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#3B51A3] to-[#2E3E85] hover:from-[#2E3E85] hover:to-[#1E293B] text-white rounded-xl text-xs font-extrabold shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{exportingFirmas ? "Generando Imagen PNG..." : "Descargar Imagen PNG Firmas"}</span>
              </button>
            </div>

          </div>

          {/* Canvas Preview Area (Right) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            
            <div className="mb-2 text-center">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Previsualización en Tiempo Real (Formato Firmas Electrónicas)
              </span>
            </div>

            {/* THE CANVAS CONTAINER */}
            <div
              id="flyer-firmas-canvas"
              className="w-full max-w-[620px] bg-white p-6 sm:p-8 rounded-[28px] border-2 border-slate-200 shadow-2xl relative overflow-hidden text-slate-900 font-sans select-none"
              style={{ minHeight: "750px" }}
            >
              
              {/* TOP HEADER SECTION: CUSTOM LOGO + EDITABLE DISCOUNT BADGE */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
                
                {/* Custom Logo Display (or Placeholder) */}
                {firmasLogo ? (
                  <div className="max-h-28 max-w-[300px] p-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-start shrink-0">
                    <img src={firmasLogo} alt="Logo Empresa" className="max-h-24 max-w-[280px] object-contain" />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-[#3B51A3]/60 bg-blue-50/60 text-[#3B51A3] rounded-2xl px-4 py-2.5 flex items-center gap-2 shrink-0">
                    <ImageIcon className="w-6 h-6 text-[#3B51A3]" />
                    <div className="text-left">
                      <span className="text-xs font-black uppercase tracking-wide block">Cargar Tu Logo Aquí</span>
                      <span className="text-[9px] text-slate-500 font-medium block">Personaliza el encabezado</span>
                    </div>
                  </div>
                )}

                {/* Big Custom Discount Banner */}
                <div className="text-right">
                  <h2 className="text-2xl sm:text-3xl font-black text-amber-500 tracking-tight leading-none uppercase drop-shadow-xs">
                    {firmasDiscount}
                  </h2>
                </div>
              </div>

              {firmasPlanSelectionMode === "individual" ? (
                /* INDIVIDUAL PLAN LAYOUT FOR FIRMAS */
                <div className="mb-6 space-y-4">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-[#FFC107] text-[#0F172A] font-black text-lg flex items-center justify-center shadow-xs shrink-0 text-center" style={{ backgroundColor: '#FFC107', color: '#0F172A' }}>
                      <span className="leading-none text-center my-auto block">1</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-[#0B2545] tracking-tight">
                      PLAN DESTACADO DE FIRMA ELECTRÓNICA
                    </h3>
                  </div>

                  <div className="text-white p-6 rounded-2xl shadow-lg space-y-4 text-center border-2 border-amber-400" style={{ background: 'linear-gradient(to right, #003566, #001D3D)' }}>
                    <span className="inline-flex items-center justify-center bg-[#FFC107] text-[#0F172A] text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider leading-none" style={{ backgroundColor: '#FFC107', color: '#0F172A', textDecoration: 'none' }}>
                      {firmasIndividualVigencia}
                    </span>
                    <div className="space-y-1">
                      <span className="text-xs text-slate-300 font-bold block">Precio Oferta Promocional</span>
                      <div className="text-4xl sm:text-5xl font-black text-amber-400 tracking-tight flex items-baseline justify-center gap-2">
                        <span>{firmasIndividualPrice}</span>
                        <span className="text-sm font-bold text-slate-300">+ IVA</span>
                      </div>
                      {firmasIndividualRegularPrice && (
                        <p className="text-xs text-slate-300 flex items-center justify-center gap-1.5 leading-normal pt-1">
                          <span>Precio regular:</span>
                          <span className="relative inline-flex items-center justify-center font-bold text-rose-400 px-1">
                            <span className="relative z-10">{firmasIndividualRegularPrice}</span>
                            <span className="absolute inset-x-0 top-1/2 h-[2px] bg-rose-400 -translate-y-1/2 z-20 pointer-events-none" />
                          </span>
                        </p>
                      )}
                    </div>
                    <div className="pt-2 border-t border-white/20 text-xs font-bold text-slate-200 flex items-center justify-center gap-2">
                      <Check className="w-4 h-4 text-amber-400" />
                      <span>{firmasIndividualDetails}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* MULTIPLE VIGENCIAS LAYOUT FOR FIRMAS */
                <>
                  {/* SECTION 1: FIRMA DESDE $18,20 */}
                  <div className="mb-6 relative">
                    {/* Section Badge "1" */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-[#FFC107] text-[#0F172A] font-black text-lg flex items-center justify-center shadow-xs shrink-0 text-center" style={{ backgroundColor: '#FFC107', color: '#0F172A' }}>
                        <span className="leading-none text-center my-auto block">1</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-[#0B2545] tracking-tight">
                        Firma electrónica
                      </h3>
                    </div>

                    {/* Banner Gradient Card */}
                    <div className="text-white p-5 rounded-2xl shadow-md grid grid-cols-12 gap-4 items-center relative overflow-hidden" style={{ background: 'linear-gradient(to right, #003566, #001D3D)' }}>
                      
                      {/* Left Pricing */}
                      <div className="col-span-6 space-y-1">
                        <span className="text-xs text-slate-300 font-bold block">desde</span>
                        <div className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight flex items-center">
                          <span className="leading-none text-left block my-auto">{firmasBasePrice}</span>
                        </div>
                      </div>

                      {/* Right Types list */}
                      <div className="col-span-6 space-y-2 text-xs font-bold border-l border-white/20 pl-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Persona Natural</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-[#FFC107] text-[#0F172A] text-[9px] font-black flex items-center justify-center shrink-0 leading-none" style={{ backgroundColor: '#FFC107', color: '#0F172A' }}>
                            <span className="my-auto block">RUC</span>
                          </div>
                          <span>Persona Natural con RUC</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Persona Jurídica</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* SECTION 2: MAYOR VIGENCIA, MÁS AHORRO */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-[#FFC107] text-[#0F172A] font-black text-lg flex items-center justify-center shadow-xs shrink-0 text-center" style={{ backgroundColor: '#FFC107', color: '#0F172A' }}>
                        <span className="leading-none text-center my-auto block">2</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-[#0B2545] tracking-tight">
                        MAYOR VIGENCIA, <span className="text-amber-500">MÁS AHORRO</span>
                      </h3>
                    </div>

                    {/* Vigencias Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {firmasValidityPrices.filter(v => v.enabled !== false).map((v, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-2xl border-2 text-center space-y-1.5 shadow-2xs relative flex flex-col items-center justify-center ${
                            v.popular
                              ? "bg-[#FFFBEB] border-[#F59E0B]"
                              : "bg-white border-slate-200"
                          }`}
                        >
                          {/* Popular Star */}
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-xs font-black text-slate-900 leading-none">{v.vigencia}</span>
                            {v.popular && <span className="text-[#F59E0B] font-bold leading-none">★</span>}
                          </div>

                          <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1 leading-tight">
                            <span>Precio regular</span>
                            <span className="relative inline-flex items-center justify-center font-bold text-rose-500 px-1">
                              <span className="relative z-10">{v.regular}</span>
                              <span className="absolute inset-x-0 top-1/2 h-[2px] bg-rose-500 -translate-y-1/2 z-20 pointer-events-none" />
                            </span>
                          </div>

                          <div className="text-xl sm:text-2xl font-black text-[#00254D] text-center flex items-center justify-center leading-tight py-1">
                            <span className="leading-none text-center my-auto block">{v.promo}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* SECTION 3: BENEFICIOS Y VALOR */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FFC107] text-[#0F172A] font-black text-lg flex items-center justify-center shadow-xs shrink-0 text-center" style={{ backgroundColor: '#FFC107', color: '#0F172A' }}>
                    <span className="leading-none text-center my-auto block">3</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-[#0B2545] tracking-tight">
                    BENEFICIOS Y VALOR
                  </h3>
                </div>

                {/* 4 Feature Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  
                  <div className="bg-[#EFF6FF] p-3 rounded-2xl border border-blue-200 space-y-1 flex flex-col items-center justify-center text-center">
                    <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center mx-auto shadow-xs">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-blue-900 block leading-tight">PLATAFORMA GRATUITA</span>
                    <span className="text-[10px] text-slate-600 block">para administrar tu certificado.</span>
                  </div>

                  <div className="bg-[#ECFDF5] p-3 rounded-2xl border border-emerald-200 space-y-1 flex flex-col items-center justify-center text-center">
                    <div className="w-9 h-9 rounded-xl bg-[#059669] text-white flex items-center justify-center mx-auto shadow-xs">
                      <Cloud className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-emerald-900 block leading-tight">DESCARGA ILIMITADA</span>
                    <span className="text-[10px] text-slate-600 block">del certificado (.p12).</span>
                  </div>

                  <div className="bg-[#FFFBEB] p-3 rounded-2xl border border-amber-200 space-y-1 flex flex-col items-center justify-center text-center">
                    <div className="w-9 h-9 rounded-xl bg-[#D97706] text-white flex items-center justify-center mx-auto shadow-xs">
                      <Lock className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-amber-900 block leading-tight">RESETEO DE PIN</span>
                    <span className="text-[10px] text-slate-600 block">sin costo adicional.</span>
                  </div>

                  <div className="bg-[#FAF5FF] p-3 rounded-2xl border border-purple-200 space-y-1 flex flex-col items-center justify-center text-center">
                    <div className="w-9 h-9 rounded-xl bg-[#9333EA] text-white flex items-center justify-center mx-auto shadow-xs">
                      <PenTool className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-purple-900 block leading-tight">FIRMADOR DIGITAL</span>
                    <span className="text-[10px] text-slate-600 block">Tiempo ilimitado sin costo.</span>
                  </div>

                </div>
              </div>

              {/* BOTTOM BANNER */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#00254D]">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>SEGURA, LEGAL Y CONFIABLE EN ECUADOR</span>
                </div>

                <div className="bg-[#FFC107] text-[#0F172A] font-black px-6 py-2.5 rounded-xl text-xs sm:text-sm uppercase tracking-wider shadow-md flex items-center justify-center text-center" style={{ backgroundColor: '#FFC107', color: '#0F172A' }}>
                  <span className="leading-none text-center my-auto block">¡SOLICÍTALA HOY MISMO!</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ==================================================================================== */}
      {/* SUB-TAB 3: INTELIGENCIA ARTIFICIAL PROMPTS */}
      {/* ==================================================================================== */}
      {subTab === "ia" && (
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* TOP HEADER & CUSTOM DETAILS BOX */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Prompts para Generar Artes Visuales con IA (Formato 9:12)</h2>
                <p className="text-xs text-slate-500">Copia estos prompts para usarlos en Gemini AI y generar imágenes publicitarias en formato vertical 9:12.</p>
              </div>
            </div>

            {/* Custom Image Description Box */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <label className="text-xs font-extrabold text-purple-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>¿Qué quieres que aparezca en la imagen al final del prompt? (Opcional):</span>
              </label>
              <textarea
                value={customVisualDetails}
                onChange={(e) => setCustomVisualDetails(e.target.value)}
                rows={2}
                className="w-full text-xs font-medium border border-purple-200 rounded-xl p-3 bg-purple-50/40 text-slate-900 focus:ring-2 focus:ring-purple-400 focus:bg-white resize-none"
                placeholder="Ej: Un contador sonriente en una oficina moderna en Quito con laptop azul y holograma de facturas digitales..."
              />
              <p className="text-[11px] text-slate-500">
                Este texto descriptivo se añadirá automáticamente al final del prompt seleccionado para personalizar el resultado visual.
              </p>
            </div>
          </div>

          {/* TWO PROMPTS GRID: ERP & FACTURACIÓN / FIRMAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* PROMPT 1: FACTURACIÓN Y ERP */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 font-extrabold text-xs flex items-center justify-center">
                      1
                    </span>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">Prompt ERP y Facturación</h3>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Formato 9:12 Vertical</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const finalPrompt = PROMPT_ARTE_SISTEMAS + (customVisualDetails.trim() ? `\n\n[DETALLES VISUALES PERSONALIZADOS DEL CLIENTE]:\n${customVisualDetails.trim()}` : "");
                      handleCopyText(finalPrompt, "prompt1");
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                      copiedPromptId === "prompt1"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-800 hover:bg-slate-900 text-white"
                    }`}
                  >
                    {copiedPromptId === "prompt1" ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar Prompt</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800 whitespace-pre-line leading-relaxed min-h-[220px] max-h-[320px] overflow-y-auto">
                  {PROMPT_ARTE_SISTEMAS + (customVisualDetails.trim() ? `\n\n[DETALLES VISUALES PERSONALIZADOS DEL CLIENTE]:\n${customVisualDetails.trim()}` : "")}
                </div>
              </div>

              <div className="pt-2 text-right">
                <span className="text-[10px] text-slate-400 font-medium">Listo para copiar y usar en Gemini AI</span>
              </div>
            </div>

            {/* PROMPT 2: FIRMAS ELECTRÓNICAS */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-100 text-[#3B51A3] font-extrabold text-xs flex items-center justify-center">
                      2
                    </span>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">Prompt Firmas Electrónicas</h3>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Formato 9:12 Vertical</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const finalPrompt = PROMPT_ARTE_FIRMAS + (customVisualDetails.trim() ? `\n\n[DETALLES VISUALES PERSONALIZADOS DEL CLIENTE]:\n${customVisualDetails.trim()}` : "");
                      handleCopyText(finalPrompt, "prompt2");
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                      copiedPromptId === "prompt2"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-800 hover:bg-slate-900 text-white"
                    }`}
                  >
                    {copiedPromptId === "prompt2" ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar Prompt</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800 whitespace-pre-line leading-relaxed min-h-[220px] max-h-[320px] overflow-y-auto">
                  {PROMPT_ARTE_FIRMAS + (customVisualDetails.trim() ? `\n\n[DETALLES VISUALES PERSONALIZADOS DEL CLIENTE]:\n${customVisualDetails.trim()}` : "")}
                </div>
              </div>

              <div className="pt-2 text-right">
                <span className="text-[10px] text-slate-400 font-medium">Listo para copiar y usar en Gemini AI</span>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
