import React, { useState, useEffect, useMemo } from "react";
import {
  DollarSign,
  Plus,
  Trash2,
  Calculator,
  TrendingUp,
  FileCheck2,
  PackageCheck,
  FileText,
  Percent,
  Download,
  Loader2,
  Layers,
  Search,
  CheckCircle2,
  Minus,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Tag,
  ArrowRight,
  ShieldCheck,
  Info,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { trackActivity } from "../utils/telemetry";
import { getActivePartnerName } from "../utils/userSessionHelper";

export interface ItemComision {
  id: string;
  categoria: "plan" | "firma" | "adicional";
  subcategoria?: "facturacion" | "erp" | "contador";
  nombre: string;
  vigencia?: string;
  costoBase: number;
  precioVenta: number;
  cantidad: number;
  porcentajeComision: number;
  comisionUnitaria: number;
  comisionTotal: number;
}

export interface ItemComisionFirma {
  id: string;
  tipoFirma: string;
  vigencia: string;
  formato: string;
  costoBase: number;
  precioVenta: number;
  cantidad: number;
  gananciaUnitaria: number;
  gananciaTotal: number;
  totalVenta: number;
}

export interface VentaRegistrada {
  id: string;
  nombreCliente: string;
  cedulaCliente: string;
  productoId: string;
  nombreProducto: string;
  categoriaProducto: "facturacion" | "erp" | "contador" | "adicional" | "firma";
  precioUnitario: number;
  cantidad: number;
  totalVenta: number;
  fechaRegistro: string;
  adminResponsable?: string;
  vendedor?: string;
  socioNombre?: string;
  userEmail?: string;
  userCode?: string;
  userRole?: string;
}

export interface SocioRegistrado {
  id: string;
  nombreApellido: string;
  cedulaTelefono: string;
  cedulaRuc?: string;
  telefono?: string;
  email?: string;
  esMlm: boolean;
  esDistribuidorFirmas: boolean;
  fechaRegistro: string;
  estado: "Activo" | "Inactivo" | "Por Activar";
  referidoPorAdmin?: string;
  registradoPor?: string;
  referidoPor?: string;
  codigoSocio?: string;
  partnerCode?: string;
  password?: string;
}

export const FIRMA_BASE_COSTS: Record<string, { costoBase: number; sugerido: number }> = {
  "15 Días": { costoBase: 3.16, sugerido: 6.0 },
  "1 Año": { costoBase: 8.99, sugerido: 18.0 },
  "2 Años": { costoBase: 14.5, sugerido: 28.0 },
  "3 Años": { costoBase: 19.1, sugerido: 38.0 },
  "4 Años": { costoBase: 23.8, sugerido: 48.0 },
  "5 Años": { costoBase: 28.17, sugerido: 58.0 },
};

export const FIRMA_TYPES = [
  "Persona Natural",
  "Persona Natural con RUC",
  "Persona Jurídica (Representante Legal)",
  "Promo Emprende",
];

export const ADICIONALES_PRESETS = [
  { id: "tesoreria", nombre: "TESORERIA", precio: 75.0 },
  { id: "nomina", nombre: "NOMINA", precio: 75.0 },
  { id: "activos_fijos", nombre: "ACTIVOS FIJOS", precio: 75.0 },
  { id: "restaurantes", nombre: "RESTAURANTES", precio: 75.0 },
  { id: "contabilidad", nombre: "CONTABILIDAD", precio: 75.0 },
  { id: "produccion", nombre: "PRODUCCIÓN", precio: 75.0 },
];

export const PLAN_PRESETS = [
  // Facturación Electrónica
  { id: "fac_up_light", categoria: "facturacion", nombre: "Facturación UP LIGHT", precio: 10.0 },
  { id: "fac_up_base", categoria: "facturacion", nombre: "Facturación UP BASE", precio: 25.0 },
  { id: "fac_up_power", categoria: "facturacion", nombre: "Facturación UP POWER", precio: 55.0 },
  { id: "fac_up_inicial", categoria: "facturacion", nombre: "Facturación UP INICIAL", precio: 10.0 },
  { id: "fac_up_intermedio", categoria: "facturacion", nombre: "Facturación UP INTERMEDIO", precio: 15.0 },
  { id: "fac_up_ideal_plus", categoria: "facturacion", nombre: "Facturación UP IDEAL PLUS", precio: 25.0 },
  { id: "fac_up_profesional_plus", categoria: "facturacion", nombre: "Facturación UP PROFESIONAL PLUS", precio: 80.0 },
  { id: "fac_up_ultra", categoria: "facturacion", nombre: "Facturación UP ULTRA", precio: 150.0 },

  // ERP PYMES (Mensuales y Anuales)
  { id: "erp_start_m", categoria: "erp", nombre: "ERP START (Mensual)", precio: 34.31 },
  { id: "erp_start_a", categoria: "erp", nombre: "ERP START (Anual)", precio: 411.76 },
  { id: "erp_plus_m", categoria: "erp", nombre: "ERP PLUS (Mensual)", precio: 50.0 },
  { id: "erp_plus_a", categoria: "erp", nombre: "ERP PLUS (Anual)", precio: 600.0 },
  { id: "erp_premium_m", categoria: "erp", nombre: "ERP PREMIUM (Mensual)", precio: 79.9 },
  { id: "erp_premium_a", categoria: "erp", nombre: "ERP PREMIUM (Anual)", precio: 958.82 },

  // Planes Contadores
  { id: "cont_1_emp", categoria: "contador", nombre: "CONTADOR 1 EMPRESA", precio: 50.0 },
  { id: "cont_3_emp", categoria: "contador", nombre: "CONTADOR 3 EMPRESA", precio: 100.0 },
  { id: "cont_6_emp", categoria: "contador", nombre: "CONTADOR 6 EMPRESA", precio: 150.0 },
  { id: "cont_10_emp", categoria: "contador", nombre: "CONTADOR 10 EMPRESA", precio: 200.0 },
  { id: "cont_tax_ilim", categoria: "contador", nombre: "TAX ILIMITADOS", precio: 100.0 },
  { id: "cont_ilimitado", categoria: "contador", nombre: "CONTADOR ILIMITADO", precio: 300.0 },
];

export const INITIAL_VENTAS_DATA: VentaRegistrada[] = [];
export const INITIAL_SOCIOS_DATA: SocioRegistrado[] = [];
export const MOCK_RANDOM_SOCIOS: SocioRegistrado[] = [];

export type KPierSubTab = "comisiones_sistema" | "comisiones_firmas" | "comisiones";

interface ComisionModuleProps {
  subTab?: KPierSubTab;
  onSubTabChange?: (tab: KPierSubTab) => void;
}

export function ComisionModule({ subTab, onSubTabChange }: ComisionModuleProps) {
  const isGerenciaUser = sessionStorage.getItem("godi_user") === "gerencia";
  const activePartnerName = getActivePartnerName() || "Socio Comercial";

  // Internal Subtab State
  const [internalSubTab, setInternalSubTab] = useState<KPierSubTab>("comisiones_sistema");
  const activeSubTab = subTab || internalSubTab;

  const handleTabSwitch = (tab: KPierSubTab) => {
    setInternalSubTab(tab);
    if (onSubTabChange) {
      onSubTabChange(tab);
    }
  };

  // =========================================================================
  // 1. CALCULADORA DE COMISIONES SISTEMAS (UPCONTA) STATE
  // =========================================================================
  const [selectedCategoria, setSelectedCategoria] = useState<"facturacion" | "erp" | "contador" | "adicional">("facturacion");
  const [selectedProductoId, setSelectedProductoId] = useState<string>("fac_up_base");
  const [sistemaPrecioUnitario, setSistemaPrecioUnitario] = useState<number>(25.0);
  const [sistemaCantidad, setSistemaCantidad] = useState<number>(1);
  const [sistemaCopied, setSistemaCopied] = useState<boolean>(false);
  const [isGeneratingPdfSistema, setIsGeneratingPdfSistema] = useState<boolean>(false);

  // Lista de items simulados en la calculadora de sistemas
  const [itemsSistema, setItemsSistema] = useState<ItemComision[]>(() => {
    try {
      const saved = localStorage.getItem("godi_calc_sistema_items");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem("godi_calc_sistema_items", JSON.stringify(itemsSistema));
    } catch {}
  }, [itemsSistema]);

  // Manejar cambio de categoría en sistemas
  const handleCategoriaChange = (cat: "facturacion" | "erp" | "contador" | "adicional") => {
    setSelectedCategoria(cat);
    if (cat === "adicional") {
      const first = ADICIONALES_PRESETS[0];
      setSelectedProductoId(first.id);
      setSistemaPrecioUnitario(first.precio);
    } else {
      const filtered = PLAN_PRESETS.filter((p) => p.categoria === cat);
      if (filtered.length > 0) {
        setSelectedProductoId(filtered[0].id);
        setSistemaPrecioUnitario(filtered[0].precio);
      }
    }
  };

  // Manejar cambio de producto en sistemas
  const handleProductoChange = (prodId: string) => {
    setSelectedProductoId(prodId);
    if (selectedCategoria === "adicional") {
      const found = ADICIONALES_PRESETS.find((a) => a.id === prodId);
      if (found) setSistemaPrecioUnitario(found.precio);
    } else {
      const found = PLAN_PRESETS.find((p) => p.id === prodId);
      if (found) setSistemaPrecioUnitario(found.precio);
    }
  };

  // Agregar plan a la calculadora de sistemas
  const handleAddPlanToCalculator = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let nombreProd = "Plan UpConta";
    if (selectedCategoria === "adicional") {
      const found = ADICIONALES_PRESETS.find((a) => a.id === selectedProductoId);
      nombreProd = found ? `Módulo ${found.nombre}` : "Módulo Adicional";
    } else {
      const found = PLAN_PRESETS.find((p) => p.id === selectedProductoId);
      nombreProd = found ? found.nombre : "Plan UpConta";
    }

    const unitPrice = Number(sistemaPrecioUnitario) || 0;
    const qty = Math.max(1, Number(sistemaCantidad) || 1);
    const comisionUnit = unitPrice * 0.3;
    const comisionTot = comisionUnit * qty;

    const newItem: ItemComision = {
      id: `calc-plan-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      categoria: selectedCategoria === "adicional" ? "adicional" : "plan",
      subcategoria: selectedCategoria !== "adicional" ? selectedCategoria : undefined,
      nombre: nombreProd,
      costoBase: 0,
      precioVenta: unitPrice,
      cantidad: qty,
      porcentajeComision: 30,
      comisionUnitaria: comisionUnit,
      comisionTotal: comisionTot,
    };

    setItemsSistema((prev) => [newItem, ...prev]);
    trackActivity("resumen_comision_impreso", `Simulación Plan: ${nombreProd} x${qty} ($${unitPrice})`);
  };

  // Actualizar cantidad de un item en sistemas
  const handleUpdateItemQtySistema = (id: string, newQty: number) => {
    const qty = Math.max(1, newQty);
    setItemsSistema((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const comisionTot = it.comisionUnitaria * qty;
          return { ...it, cantidad: qty, comisionTotal: comisionTot };
        }
        return it;
      })
    );
  };

  // Actualizar precio de venta de un item en sistemas
  const handleUpdateItemPriceSistema = (id: string, newPrice: number) => {
    const price = Math.max(0, newPrice);
    setItemsSistema((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const comisionUnit = price * 0.3;
          const comisionTot = comisionUnit * it.cantidad;
          return {
            ...it,
            precioVenta: price,
            comisionUnitaria: comisionUnit,
            comisionTotal: comisionTot,
          };
        }
        return it;
      })
    );
  };

  // Eliminar un item en sistemas
  const handleDeleteItemSistema = (id: string) => {
    setItemsSistema((prev) => prev.filter((it) => it.id !== id));
  };

  // Vaciar calculadora de sistemas
  const handleClearSistema = () => {
    setItemsSistema([]);
  };

  // Totales de la calculadora de sistemas
  const totalQtySistema = useMemo(() => itemsSistema.reduce((acc, it) => acc + it.cantidad, 0), [itemsSistema]);
  const totalVentaBrutaSistema = useMemo(
    () => itemsSistema.reduce((acc, it) => acc + it.precioVenta * it.cantidad, 0),
    [itemsSistema]
  );
  const totalComisionSistema = useMemo(
    () => itemsSistema.reduce((acc, it) => acc + it.comisionTotal, 0),
    [itemsSistema]
  );

  // Copiar resumen de sistemas
  const handleCopySummarySistema = () => {
    let text = `💼 *SIMULACIÓN DE COMISIONES UPCONTA (SISTEMAS)*\n`;
    text += `📅 Fecha: ${new Date().toLocaleDateString("es-EC")}\n`;
    text += `👤 Consultor / Socio: ${activePartnerName}\n\n`;
    text += `📋 *DETALLE DE PLANES AGREGADOS:*\n`;
    itemsSistema.forEach((it, idx) => {
      text += `${idx + 1}. ${it.nombre} | Cant: ${it.cantidad} | P.Unit: $${it.precioVenta.toFixed(2)} | Comis. (30%): +$${it.comisionTotal.toFixed(2)}\n`;
    });
    text += `\n📊 *TOTALES:*\n`;
    text += `• Total Unidades: ${totalQtySistema}\n`;
    text += `• Facturación Bruta: $${totalVentaBrutaSistema.toFixed(2)} USD\n`;
    text += `• 🔥 *TU GANANCIA TOTAL EN COMISIÓN (30%): $${totalComisionSistema.toFixed(2)} USD*\n`;

    navigator.clipboard.writeText(text);
    setSistemaCopied(true);
    setTimeout(() => setSistemaCopied(false), 2500);
  };

  // =========================================================================
  // 2. CALCULADORA DE COMISIONES FIRMAS STATE
  // =========================================================================
  const [firmaTipo, setFirmaTipo] = useState<string>("Persona Natural");
  const [firmaVigencia, setFirmaVigencia] = useState<string>("1 Año");
  const [firmaPrecioVenta, setFirmaPrecioVenta] = useState<number>(18.0);
  const [firmaCantidad, setFirmaCantidad] = useState<number>(1);
  const [firmaCopied, setFirmaCopied] = useState<boolean>(false);
  const [isGeneratingPdfFirmas, setIsGeneratingPdfFirmas] = useState<boolean>(false);

  // Lista de items simulados en la calculadora de firmas
  const [itemsFirmas, setItemsFirmas] = useState<ItemComisionFirma[]>(() => {
    try {
      const saved = localStorage.getItem("godi_calc_firmas_items");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem("godi_calc_firmas_items", JSON.stringify(itemsFirmas));
    } catch {}
  }, [itemsFirmas]);

  // Manejar cambio de vigencia en firmas
  const handleFirmaVigenciaChange = (vig: string) => {
    setFirmaVigencia(vig);
    const config = FIRMA_BASE_COSTS[vig] || { costoBase: 8.99, sugerido: 18.0 };
    setFirmaPrecioVenta(config.sugerido);
  };

  // Costo base actual seleccionado para la firma
  const currentFirmaCostoBase = useMemo(() => {
    return FIRMA_BASE_COSTS[firmaVigencia]?.costoBase || 8.99;
  }, [firmaVigencia]);

  // Ganancia unitaria calculada en vivo
  const liveFirmaGananciaUnitaria = useMemo(() => {
    return Math.max(0, (Number(firmaPrecioVenta) || 0) - currentFirmaCostoBase);
  }, [firmaPrecioVenta, currentFirmaCostoBase]);

  // Ganancia subtotal calculada en vivo
  const liveFirmaGananciaSubtotal = useMemo(() => {
    return liveFirmaGananciaUnitaria * (Math.max(1, Number(firmaCantidad) || 1));
  }, [liveFirmaGananciaUnitaria, firmaCantidad]);

  // Agregar firma a la calculadora
  const handleAddFirmaToCalculator = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const unitPrice = Number(firmaPrecioVenta) || 0;
    const qty = Math.max(1, Number(firmaCantidad) || 1);
    const costoBase = currentFirmaCostoBase;
    const gananciaUnit = Math.max(0, unitPrice - costoBase);
    const gananciaTot = gananciaUnit * qty;
    const totVenta = unitPrice * qty;

    const newItem: ItemComisionFirma = {
      id: `calc-firma-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      tipoFirma: firmaTipo,
      vigencia: firmaVigencia,
      formato: "Archivo .p12",
      costoBase: costoBase,
      precioVenta: unitPrice,
      cantidad: qty,
      gananciaUnitaria: gananciaUnit,
      gananciaTotal: gananciaTot,
      totalVenta: totVenta,
    };

    setItemsFirmas((prev) => [newItem, ...prev]);
    trackActivity("argumentos_copiados_firma", `Simulación Firma: ${firmaTipo} (${firmaVigencia}) x${qty}`);
  };

  // Actualizar cantidad en firmas
  const handleUpdateItemQtyFirmas = (id: string, newQty: number) => {
    const qty = Math.max(1, newQty);
    setItemsFirmas((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const gananciaTot = it.gananciaUnitaria * qty;
          const totVenta = it.precioVenta * qty;
          return { ...it, cantidad: qty, gananciaTotal: gananciaTot, totalVenta: totVenta };
        }
        return it;
      })
    );
  };

  // Actualizar precio de venta en firmas
  const handleUpdateItemPriceFirmas = (id: string, newPrice: number) => {
    const price = Math.max(0, newPrice);
    setItemsFirmas((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const gananciaUnit = Math.max(0, price - it.costoBase);
          const gananciaTot = gananciaUnit * it.cantidad;
          const totVenta = price * it.cantidad;
          return {
            ...it,
            precioVenta: price,
            gananciaUnitaria: gananciaUnit,
            gananciaTotal: gananciaTot,
            totalVenta: totVenta,
          };
        }
        return it;
      })
    );
  };

  // Eliminar un item en firmas
  const handleDeleteItemFirmas = (id: string) => {
    setItemsFirmas((prev) => prev.filter((it) => it.id !== id));
  };

  // Vaciar calculadora de firmas
  const handleClearFirmas = () => {
    setItemsFirmas([]);
  };

  // Totales de la calculadora de firmas
  const totalQtyFirmas = useMemo(() => itemsFirmas.reduce((acc, it) => acc + it.cantidad, 0), [itemsFirmas]);
  const totalVentaBrutaFirmas = useMemo(() => itemsFirmas.reduce((acc, it) => acc + it.totalVenta, 0), [itemsFirmas]);
  const totalCostoBaseFirmas = useMemo(
    () => itemsFirmas.reduce((acc, it) => acc + it.costoBase * it.cantidad, 0),
    [itemsFirmas]
  );
  const totalGananciaFirmas = useMemo(
    () => itemsFirmas.reduce((acc, it) => acc + it.gananciaTotal, 0),
    [itemsFirmas]
  );

  // Copiar resumen de firmas
  const handleCopySummaryFirmas = () => {
    let text = `✍️ *SIMULACIÓN DE COMISIONES — FIRMAS ELECTRÓNICAS*\n`;
    text += `📅 Fecha: ${new Date().toLocaleDateString("es-EC")}\n`;
    text += `👤 Consultor / Socio: ${activePartnerName}\n\n`;
    text += `📋 *DETALLE DE FIRMAS AGREGADAS:*\n`;
    itemsFirmas.forEach((it, idx) => {
      text += `${idx + 1}. ${it.tipoFirma} (${it.vigencia}) | Cant: ${it.cantidad} | Costo: $${it.costoBase.toFixed(2)} | P.Venta: $${it.precioVenta.toFixed(2)} | Ganancia Neta: +$${it.gananciaTotal.toFixed(2)}\n`;
    });
    text += `\n📊 *TOTALES:*\n`;
    text += `• Total Firmas: ${totalQtyFirmas}\n`;
    text += `• Facturación Bruta: $${totalVentaBrutaFirmas.toFixed(2)} USD\n`;
    text += `• Costo Base Total: $${totalCostoBaseFirmas.toFixed(2)} USD\n`;
    text += `• 🔥 *TU GANANCIA NETA TOTAL EN COMISIÓN: $${totalGananciaFirmas.toFixed(2)} USD*\n`;

    navigator.clipboard.writeText(text);
    setFirmaCopied(true);
    setTimeout(() => setFirmaCopied(false), 2500);
  };

  // =========================================================================
  // PDF GENERATION (SISTEMAS & FIRMAS)
  // =========================================================================
  const handleDownloadPDF = async (tipo: "sistema" | "firmas") => {
    const isSistema = tipo === "sistema";
    if (isSistema) setIsGeneratingPdfSistema(true);
    else setIsGeneratingPdfFirmas(true);

    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const today = new Date().toLocaleDateString("es-EC");

      // Header background
      doc.setFillColor(11, 37, 69);
      doc.rect(0, 0, pageWidth, 40, "F");

      // Title & Header Text
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text(
        isSistema ? "REPORTE DE SIMULACIÓN DE COMISIONES (UPCONTA)" : "REPORTE DE SIMULACIÓN — FIRMAS ELECTRÓNICAS",
        15,
        20
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(200, 220, 255);
      doc.text(`Consultor: ${activePartnerName} | Fecha de Emisión: ${today}`, 15, 30);

      // Section Content
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("Detalle de la Simulación", 15, 52);

      let currentY = 60;
      doc.setFillColor(241, 245, 249);
      doc.rect(15, currentY, pageWidth - 30, 8, "F");

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(71, 85, 105);

      if (isSistema) {
        doc.text("ÍTEM / PLAN", 18, currentY + 5.5);
        doc.text("CANT.", 100, currentY + 5.5, { align: "center" });
        doc.text("PRECIO", 125, currentY + 5.5, { align: "right" });
        doc.text("VENTA TOTAL", 155, currentY + 5.5, { align: "right" });
        doc.text("COMISIÓN (30%)", pageWidth - 18, currentY + 5.5, { align: "right" });

        currentY += 12;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(15, 23, 42);

        itemsSistema.forEach((item, idx) => {
          if (currentY > 250) {
            doc.addPage();
            currentY = 20;
          }
          doc.text(`${idx + 1}. ${item.nombre}`, 18, currentY);
          doc.text(`${item.cantidad}`, 100, currentY, { align: "center" });
          doc.text(`$${item.precioVenta.toFixed(2)}`, 125, currentY, { align: "right" });
          doc.text(`$${(item.precioVenta * item.cantidad).toFixed(2)}`, 155, currentY, { align: "right" });
          doc.setFont("helvetica", "bold");
          doc.setTextColor(5, 150, 105);
          doc.text(`+$${item.comisionTotal.toFixed(2)}`, pageWidth - 18, currentY, { align: "right" });
          doc.setFont("helvetica", "normal");
          doc.setTextColor(15, 23, 42);

          doc.setDrawColor(226, 232, 240);
          doc.line(15, currentY + 3, pageWidth - 15, currentY + 3);
          currentY += 8;
        });

        // Totals Box
        currentY += 10;
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(15, currentY, pageWidth - 30, 35, 3, 3, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text(`Total Unidades Simuladas: ${totalQtySistema}`, 20, currentY + 10);
        doc.text(`Facturación Total Estimada: $${totalVentaBrutaSistema.toFixed(2)} USD`, 20, currentY + 18);

        doc.setFontSize(13);
        doc.setTextColor(5, 150, 105);
        doc.text(`GANANCIA TOTAL EN COMISIÓN (30%): $${totalComisionSistema.toFixed(2)} USD`, 20, currentY + 28);
      } else {
        doc.text("TIPO / VIGENCIA DE FIRMA", 18, currentY + 5.5);
        doc.text("CANT.", 95, currentY + 5.5, { align: "center" });
        doc.text("COSTO BASE", 120, currentY + 5.5, { align: "right" });
        doc.text("PRECIO VENTA", 150, currentY + 5.5, { align: "right" });
        doc.text("GANANCIA NETA", pageWidth - 18, currentY + 5.5, { align: "right" });

        currentY += 12;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(15, 23, 42);

        itemsFirmas.forEach((item, idx) => {
          if (currentY > 250) {
            doc.addPage();
            currentY = 20;
          }
          doc.text(`${idx + 1}. ${item.tipoFirma} (${item.vigencia})`, 18, currentY);
          doc.text(`${item.cantidad}`, 95, currentY, { align: "center" });
          doc.text(`$${item.costoBase.toFixed(2)}`, 120, currentY, { align: "right" });
          doc.text(`$${item.precioVenta.toFixed(2)}`, 150, currentY, { align: "right" });
          doc.setFont("helvetica", "bold");
          doc.setTextColor(5, 150, 105);
          doc.text(`+$${item.gananciaTotal.toFixed(2)}`, pageWidth - 18, currentY, { align: "right" });
          doc.setFont("helvetica", "normal");
          doc.setTextColor(15, 23, 42);

          doc.setDrawColor(226, 232, 240);
          doc.line(15, currentY + 3, pageWidth - 15, currentY + 3);
          currentY += 8;
        });

        // Totals Box
        currentY += 10;
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(15, currentY, pageWidth - 30, 42, 3, 3, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text(`Total Firmas Simuladas: ${totalQtyFirmas}`, 20, currentY + 10);
        doc.text(`Facturación Bruta Estimada: $${totalVentaBrutaFirmas.toFixed(2)} USD`, 20, currentY + 18);
        doc.text(`Costo Base Total Proveedor: $${totalCostoBaseFirmas.toFixed(2)} USD`, 20, currentY + 26);

        doc.setFontSize(13);
        doc.setTextColor(5, 150, 105);
        doc.text(`GANANCIA NETA TOTAL EN COMISIÓN: $${totalGananciaFirmas.toFixed(2)} USD`, 20, currentY + 36);
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.setFont("helvetica", "normal");
      doc.text("Plataforma Comercial UpConta & ANF • Generado automáticamente", pageWidth / 2, 285, {
        align: "center",
      });

      doc.save(`Simulacion_Comisiones_${isSistema ? "UpConta_Sistemas" : "Firmas"}_${Date.now()}.pdf`);
    } catch (e) {
      console.error("Error generating PDF", e);
    } finally {
      setIsGeneratingPdfSistema(false);
      setIsGeneratingPdfFirmas(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ========================================================================= */}
      {/* PESTAÑA 1: CALCULADORA DE COMISIONES SISTEMAS (UPCONTA)                   */}
      {/* ========================================================================= */}
      {(activeSubTab === "comisiones" || activeSubTab === "comisiones_sistema") && (
        <div className="space-y-6 animate-fade-in">
          {/* Formulario de Selección y Agregado de Planes */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-blue-50 text-blue-700 rounded-2xl">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Elegir y Agregar Planes al Simulador</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Selecciona una categoría, el plan deseado y presiona "Agregar Plan a la Calculadora".
                  </p>
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleCategoriaChange("facturacion")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                  selectedCategoria === "facturacion"
                    ? "bg-[#0B2545] text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Facturación Electrónica</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoriaChange("erp")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                  selectedCategoria === "erp"
                    ? "bg-[#0B2545] text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>ERP PYMES</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoriaChange("contador")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                  selectedCategoria === "contador"
                    ? "bg-[#0B2545] text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Planes Contadores</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoriaChange("adicional")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                  selectedCategoria === "adicional"
                    ? "bg-[#0B2545] text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Módulos Adicionales</span>
              </button>
            </div>

            <form onSubmit={handleAddPlanToCalculator} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
                {/* Specific Plan / Module Picker */}
                <div className="lg:col-span-5">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Seleccionar Plan / Módulo
                  </label>
                  <select
                    value={selectedProductoId}
                    onChange={(e) => handleProductoChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    {selectedCategoria === "adicional"
                      ? ADICIONALES_PRESETS.map((a) => (
                          <option key={a.id} value={a.id}>
                            Módulo {a.nombre} — ${a.precio.toFixed(2)} USD (Comisión 30%: ${(a.precio * 0.3).toFixed(2)})
                          </option>
                        ))
                      : PLAN_PRESETS.filter((p) => p.categoria === selectedCategoria).map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nombre} — ${p.precio.toFixed(2)} USD (Comisión 30%: ${(p.precio * 0.3).toFixed(2)})
                          </option>
                        ))}
                  </select>
                </div>

                {/* Editable Unit Price */}
                <div className="lg:col-span-3">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Valor del Plan ($ USD)
                  </label>
                  <div className="relative">
                    <span className="text-slate-400 font-bold text-xs absolute left-3 top-1/2 -translate-y-1/2">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={sistemaPrecioUnitario}
                      onChange={(e) => setSistemaPrecioUnitario(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Quantity with Stepper */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Cantidad
                  </label>
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setSistemaCantidad((prev) => Math.max(1, prev - 1))}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold transition-all cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={sistemaCantidad}
                      onChange={(e) => setSistemaCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full text-center py-1 bg-transparent font-black text-xs text-slate-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setSistemaCantidad((prev) => prev + 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Submit Add Button */}
                <div className="lg:col-span-2 flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Plan</span>
                  </button>
                </div>
              </div>

              {/* Real-time Subtotal Preview Pill */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-extrabold text-emerald-950">
                    Comisión por unidad (30%):{" "}
                    <span className="text-emerald-700 font-black">
                      ${((Number(sistemaPrecioUnitario) || 0) * 0.3).toFixed(2)} USD
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 font-medium">Subtotal a comisionar ({sistemaCantidad} und):</span>
                  <span className="font-black text-emerald-700 text-sm">
                    +${((Number(sistemaPrecioUnitario) || 0) * 0.3 * (Number(sistemaCantidad) || 1)).toFixed(2)} USD
                  </span>
                </div>
              </div>
            </form>
          </div>

          {/* Interactive List & Summary KPI Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Interactive Items Table */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>Planes Agregados a la Simulación ({itemsSistema.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Puedes ajustar las cantidades o precios directamente en la tabla para recalcular tu ganancia.
                  </p>
                </div>

                {itemsSistema.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSistema}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Vaciar Calculadora</span>
                  </button>
                )}
              </div>

              {itemsSistema.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-3">
                  <Calculator className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-600">No has agregado planes a la calculadora aún.</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Selecciona un plan en el formulario superior y haz clic en "Agregar Plan" para simular tus comisiones.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <th className="p-3 rounded-l-lg">Plan / Módulo</th>
                        <th className="p-3">Categoría</th>
                        <th className="p-3 text-center">Cant.</th>
                        <th className="p-3 text-right">Precio ($)</th>
                        <th className="p-3 text-right">Comisión (30%)</th>
                        <th className="p-3 text-center rounded-r-lg">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {itemsSistema.map((item, idx) => (
                        <tr key={item.id || `sys-${idx}`} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-extrabold text-slate-900">
                            <div>{item.nombre}</div>
                          </td>

                          <td className="p-3">
                            {item.categoria === "adicional" ? (
                              <span className="inline-flex items-center px-2 py-0.5 bg-purple-100 text-purple-800 font-black text-[10px] rounded-md uppercase">
                                Adicional
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-800 font-black text-[10px] rounded-md uppercase">
                                {item.subcategoria || "Plan"} 30%
                              </span>
                            )}
                          </td>

                          <td className="p-3 text-center">
                            <div className="inline-flex items-center gap-1 justify-center">
                              <input
                                type="number"
                                min="1"
                                value={item.cantidad}
                                onChange={(e) => handleUpdateItemQtySistema(item.id, parseInt(e.target.value) || 1)}
                                className="w-14 text-center py-1 bg-slate-100 border border-slate-200 rounded-lg font-black text-slate-900 focus:bg-white focus:outline-none"
                              />
                            </div>
                          </td>

                          <td className="p-3 text-right">
                            <div className="inline-flex items-center gap-1 justify-end">
                              <span className="text-slate-400 font-bold">$</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.precioVenta}
                                onChange={(e) => handleUpdateItemPriceSistema(item.id, parseFloat(e.target.value) || 0)}
                                className="w-20 text-right py-1 px-1.5 bg-slate-100 border border-slate-200 rounded-lg font-black text-slate-900 focus:bg-white focus:outline-none"
                              />
                            </div>
                          </td>

                          <td className="p-3 text-right font-black text-emerald-600 text-sm">
                            +${item.comisionTotal.toFixed(2)}
                          </td>

                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteItemSistema(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                              title="Eliminar de la simulación"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right 1 Col: Summary Box */}
            <div className="bg-[#0B2545] text-white rounded-3xl p-6 shadow-md border border-blue-900/50 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-blue-900/60 pb-3">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-extrabold text-white text-base">Resumen de Comisiones</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-blue-900/40 text-blue-200">
                    <span>Planes / Módulos Simulados:</span>
                    <span className="font-bold text-white text-sm">{totalQtySistema} unidades</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-blue-900/40 text-blue-200">
                    <span>Facturación Total Estimada:</span>
                    <span className="font-bold text-white text-sm">${totalVentaBrutaSistema.toFixed(2)} USD</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-blue-900/40 text-emerald-300">
                    <span>Porcentaje de Comisión:</span>
                    <span className="font-black text-emerald-400 text-sm">30% DIRECTO</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-5 rounded-2xl text-white shadow-lg text-center space-y-1">
                  <span className="text-[11px] uppercase font-black tracking-widest text-emerald-100">
                    TU GANANCIA ESTIMADA
                  </span>
                  <div className="text-3xl font-black text-white drop-shadow-xs">
                    +${totalComisionSistema.toFixed(2)} USD
                  </div>
                  <p className="text-[10px] text-emerald-100 font-medium pt-1">
                    Comisión neta calculada
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleCopySummarySistema}
                  className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20"
                >
                  {sistemaCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300">¡Resumen Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-blue-200" />
                      <span>Copiar Resumen de Ganancias</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadPDF("sistema")}
                  disabled={isGeneratingPdfSistema || itemsSistema.length === 0}
                  className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isGeneratingPdfSistema ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generando PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Descargar Reporte PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 2: CALCULADORA DE COMISIONES FIRMAS ELECTRÓNICAS                   */}
      {/* ========================================================================= */}
      {activeSubTab === "comisiones_firmas" && (
        <div className="space-y-6 animate-fade-in">
          {/* Formulario de Selección y Agregado de Firmas - Exact Same Layout */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Elegir y Agregar Firmas al Simulador</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Selecciona el tipo de firma, vigencia y precio de venta para calcular tu ganancia neta.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Type Selection Pills */}
            <div className="flex flex-wrap gap-2">
              {FIRMA_TYPES.map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setFirmaTipo(tipo)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                    firmaTipo === tipo
                      ? "bg-[#0B2545] text-white shadow-sm"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>{tipo}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleAddFirmaToCalculator} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
                {/* Vigencia Selector */}
                <div className="lg:col-span-4">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Vigencia de Firma
                  </label>
                  <select
                    value={firmaVigencia}
                    onChange={(e) => handleFirmaVigenciaChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    {Object.entries(FIRMA_BASE_COSTS).map(([v, config]) => (
                      <option key={v} value={v}>
                        {v} — Costo Base: ${config.costoBase.toFixed(2)} USD (Sugerido: ${config.sugerido.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Base Cost Badge (Read-only) */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Costo Base ($)
                  </label>
                  <div className="px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-black text-slate-700">
                    ${currentFirmaCostoBase.toFixed(2)} USD
                  </div>
                </div>

                {/* Selling Price */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Precio Venta ($ USD)
                  </label>
                  <div className="relative">
                    <span className="text-slate-400 font-bold text-xs absolute left-3 top-1/2 -translate-y-1/2">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min={currentFirmaCostoBase}
                      value={firmaPrecioVenta}
                      onChange={(e) => setFirmaPrecioVenta(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Quantity with Stepper */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Cantidad
                  </label>
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setFirmaCantidad((prev) => Math.max(1, prev - 1))}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold transition-all cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={firmaCantidad}
                      onChange={(e) => setFirmaCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full text-center py-1 bg-transparent font-black text-xs text-slate-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setFirmaCantidad((prev) => prev + 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Submit Add Button */}
                <div className="lg:col-span-2 flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Firma</span>
                  </button>
                </div>
              </div>

              {/* Real-time Subtotal Preview Pill */}
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-extrabold text-amber-950">
                    Ganancia neta por firma:{" "}
                    <span className="text-emerald-700 font-black">
                      +${liveFirmaGananciaUnitaria.toFixed(2)} USD
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 font-medium">Subtotal a ganar ({firmaCantidad} und):</span>
                  <span className="font-black text-emerald-700 text-sm">
                    +${liveFirmaGananciaSubtotal.toFixed(2)} USD
                  </span>
                </div>
              </div>
            </form>
          </div>

          {/* Interactive List & Summary KPI Section - Exact Same Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Interactive Items Table */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-600" />
                    <span>Firmas Agregadas a la Simulación ({itemsFirmas.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Puedes ajustar las cantidades o precios de venta directamente en la tabla para recalcular tu ganancia.
                  </p>
                </div>

                {itemsFirmas.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearFirmas}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Vaciar Calculadora</span>
                  </button>
                )}
              </div>

              {itemsFirmas.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-3">
                  <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-600">No has agregado firmas a la calculadora aún.</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Selecciona una vigencia y precio arriba y haz clic en "Agregar Firma" para simular tus ganancias.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <th className="p-3 rounded-l-lg">Tipo / Vigencia</th>
                        <th className="p-3 text-center">Cant.</th>
                        <th className="p-3 text-right">Costo Base</th>
                        <th className="p-3 text-right">Precio Venta ($)</th>
                        <th className="p-3 text-right">Ganancia Neta</th>
                        <th className="p-3 text-center rounded-r-lg">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {itemsFirmas.map((item, idx) => (
                        <tr key={item.id || `firma-${idx}`} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-extrabold text-slate-900">
                            <div>{item.tipoFirma}</div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-900 font-black text-[10px] rounded-md mt-0.5">
                              {item.vigencia} • {item.formato}
                            </span>
                          </td>

                          <td className="p-3 text-center">
                            <input
                              type="number"
                              min="1"
                              value={item.cantidad}
                              onChange={(e) => handleUpdateItemQtyFirmas(item.id, parseInt(e.target.value) || 1)}
                              className="w-14 text-center py-1 bg-slate-100 border border-slate-200 rounded-lg font-black text-slate-900 focus:bg-white focus:outline-none"
                            />
                          </td>

                          <td className="p-3 text-right font-bold text-slate-500">
                            ${item.costoBase.toFixed(2)}
                          </td>

                          <td className="p-3 text-right">
                            <div className="inline-flex items-center gap-1 justify-end">
                              <span className="text-slate-400 font-bold">$</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.precioVenta}
                                onChange={(e) => handleUpdateItemPriceFirmas(item.id, parseFloat(e.target.value) || 0)}
                                className="w-20 text-right py-1 px-1.5 bg-slate-100 border border-slate-200 rounded-lg font-black text-slate-900 focus:bg-white focus:outline-none"
                              />
                            </div>
                          </td>

                          <td className="p-3 text-right font-black text-emerald-600 text-sm">
                            +${item.gananciaTotal.toFixed(2)}
                          </td>

                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteItemFirmas(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                              title="Eliminar de la simulación"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right 1 Col: Summary Box - Same Style */}
            <div className="bg-[#0B2545] text-white rounded-3xl p-6 shadow-md border border-amber-900/40 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-blue-900/60 pb-3">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  <h3 className="font-extrabold text-white text-base">Resumen de Ganancias Firmas</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-blue-900/40 text-blue-200">
                    <span>Total Firmas Simuladas:</span>
                    <span className="font-bold text-white text-sm">{totalQtyFirmas} unidades</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-blue-900/40 text-blue-200">
                    <span>Facturación Total Bruta:</span>
                    <span className="font-bold text-white text-sm">${totalVentaBrutaFirmas.toFixed(2)} USD</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-blue-900/40 text-blue-300">
                    <span>Costo Base Total (Proveedor):</span>
                    <span className="font-bold text-slate-300 text-sm">${totalCostoBaseFirmas.toFixed(2)} USD</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500 to-emerald-600 p-5 rounded-2xl text-white shadow-lg text-center space-y-1">
                  <span className="text-[11px] uppercase font-black tracking-widest text-amber-100">
                    TU GANANCIA NETA TOTAL
                  </span>
                  <div className="text-3xl font-black text-white drop-shadow-xs">
                    +${totalGananciaFirmas.toFixed(2)} USD
                  </div>
                  <p className="text-[10px] text-amber-100 font-medium pt-1">
                    (Precio Venta − Costo Base)
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleCopySummaryFirmas}
                  className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20"
                >
                  {firmaCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300">¡Resumen Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-amber-200" />
                      <span>Copiar Resumen de Ganancias</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadPDF("firmas")}
                  disabled={isGeneratingPdfFirmas || itemsFirmas.length === 0}
                  className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isGeneratingPdfFirmas ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generando PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Descargar Reporte PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
