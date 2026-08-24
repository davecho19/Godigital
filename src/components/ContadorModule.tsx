import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { 
  Calculator, 
  Send, 
  Sparkles, 
  Building2, 
  Layers, 
  CheckCircle2, 
  DollarSign, 
  Award, 
  ShieldCheck, 
  FileText,
  HelpCircle,
  Briefcase,
  TrendingUp,
  Boxes,
  Printer
} from "lucide-react";

export function ContadorModule() {
  // Form state
  const [tipoEmpresaBase, setTipoEmpresaBase] = useState<string>("0");

  // Facturación e Inventarios
  const [cant70, setCant70] = useState<number>(0);
  const [cant500, setCant500] = useState<number>(0);
  const [cantIlim, setCantIlim] = useState<number>(0);

  // Módulos Corporativos
  const [mTesoreriaCant, setMTesoreriaCant] = useState<number>(0);
  const [mNominaCant, setMNominaCant] = useState<number>(0);
  const [mActivosCant, setMActivosCant] = useState<number>(0);
  const [mRestaurantesCant, setMRestaurantesCant] = useState<number>(0);
  const [mContabilidadCant, setMContabilidadCant] = useState<number>(0);

  // Prices
  const getBaseEmpresasPrice = (tipo: string): number => {
    switch (tipo) {
      case "1": return 50;
      case "3": return 100;
      case "6": return 150;
      case "10": return 200;
      case "tax_ilimitado": return 100;
      case "ilimitadas": return 300;
      default: return 0;
    }
  };

  const getPlanBaseText = () => {
    switch (tipoEmpresaBase) {
      case "1": return "1 EMPRESA ($50.00)";
      case "3": return "3 EMPRESAS ($100.00)";
      case "6": return "6 EMPRESAS ($150.00)";
      case "10": return "10 EMPRESAS ($200.00)";
      case "tax_ilimitado": return "TAX ILIMITADO ($100.00)";
      case "ilimitadas": return "ILIMITADAS SOCIO ESTRATÉGICO ($300.00)";
      default: return "Sin selección";
    }
  };

  const precioBaseEmpresas = getBaseEmpresasPrice(tipoEmpresaBase);

  // Facturación packages total
  const totalComprobantes = (cant70 * 10) + (cant500 * 25) + (cantIlim * 55);

  // Módulos corporativos total
  const totalModulosCantidad = mTesoreriaCant + mNominaCant + mActivosCant + mRestaurantesCant + mContabilidadCant;
  const totalModulos = totalModulosCantidad * 75;

  // Subtotal, IVA, Total
  const subtotal = precioBaseEmpresas + totalComprobantes + totalModulos;
  const iva = subtotal * 0.15;
  const totalAnual = subtotal + iva;

  // Quantity counts
  const totalPlanesFactura = cant70 + cant500 + cantIlim;

  let divisor = 0;
  let descPromedio = "";

  if (tipoEmpresaBase === "tax_ilimitado") {
    if (totalPlanesFactura > totalModulosCantidad) {
      divisor = totalPlanesFactura;
      descPromedio = `Valor promedio anual por cada uno de tus ${divisor} planes de facturación`;
    } else if (totalModulosCantidad > totalPlanesFactura) {
      divisor = totalModulosCantidad;
      descPromedio = `Valor por cada uno de tus ${divisor} módulos corporativos`;
    } else if (totalPlanesFactura > 0 && totalPlanesFactura === totalModulosCantidad) {
      divisor = totalPlanesFactura;
      descPromedio = `Valor promedio anual por cada uno de tus ${divisor} ítems contratados`;
    } else {
      divisor = 0;
      descPromedio = "Agrega planes de facturación o módulos corporativos para calcular";
    }
  } else if (tipoEmpresaBase === "ilimitadas") {
    if (totalPlanesFactura > totalModulosCantidad) {
      divisor = totalPlanesFactura;
      descPromedio = `Valor por cada uno de tus ${divisor} planes de facturación. (Empresas contables ilimitadas)`;
    } else if (totalModulosCantidad > totalPlanesFactura) {
      divisor = totalModulosCantidad;
      descPromedio = `Valor por cada uno de tus ${divisor} módulos corporativos. (Empresas contables ilimitadas)`;
    } else if (totalPlanesFactura > 0 && totalPlanesFactura === totalModulosCantidad) {
      divisor = totalPlanesFactura;
      descPromedio = `Valor por cada uno de tus ${divisor} ítems contratados. (Empresas contables ilimitadas)`;
    } else {
      divisor = 0;
      descPromedio = "Agrega planes de facturación o módulos corporativos. ¡Empresas bases sin costo extra!";
    }
  } else if (["1", "3", "6", "10"].includes(tipoEmpresaBase)) {
    const numEmpresas = parseInt(tipoEmpresaBase, 10);
    if (totalPlanesFactura > totalModulosCantidad && totalPlanesFactura > numEmpresas) {
      divisor = totalPlanesFactura;
      descPromedio = `Valor promedio anual por cada uno de tus ${divisor} planes de facturación`;
    } else if (totalModulosCantidad > totalPlanesFactura && totalModulosCantidad > numEmpresas) {
      divisor = totalModulosCantidad;
      descPromedio = `Valor promedio por cada uno de tus ${divisor} módulos corporativos`;
    } else {
      divisor = numEmpresas;
      descPromedio = `Valor de tu plan base dividido entre las ${numEmpresas} empresas incluidas`;
    }
  } else {
    if (totalPlanesFactura > totalModulosCantidad) {
      divisor = totalPlanesFactura;
      descPromedio = `Valor promedio por cada uno de tus ${divisor} planes de facturación`;
    } else if (totalModulosCantidad > totalPlanesFactura) {
      divisor = totalModulosCantidad;
      descPromedio = `Valor promedio por cada uno de tus ${divisor} módulos corporativos`;
    } else if (totalPlanesFactura > 0) {
      divisor = totalPlanesFactura;
      descPromedio = `Valor por cada uno de tus ${divisor} ítems contratados`;
    } else {
      divisor = 0;
      descPromedio = "Selecciona un plan base o módulos para calcular";
    }
  }

  const valPromedio = divisor > 0 ? totalAnual / divisor : 0;

  const formatMoney = (val: number) => {
    return val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Export PDF with the exact official Ficha Técnica layout & styling
  const handleExportPropuestaPDF = () => {
    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4"
    });

    const PAGE_W = 210;
    const MX = 12;

    const C_NAVY: [number, number, number] = [11, 37, 69];    // #0B2545 Dark Navy
    const C_BLUE: [number, number, number] = [59, 81, 163];   // #3B51A3 Connect Royal Blue
    const C_LIGHT_BG: [number, number, number] = [248, 250, 252]; // Slate 50
    const C_TEXT_DARK: [number, number, number] = [15, 23, 42];  // Slate 900
    const C_TEXT_MUTED: [number, number, number] = [100, 116, 139]; // Slate 500

    // Render Godi Official Logo to Canvas for high-definition PDF embedding
    const canvas = document.createElement("canvas");
    canvas.width = 650;
    canvas.height = 180;
    const ctx = canvas.getContext("2d");

    let logoDataUrl = "";
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // "GoDi" in Deep Navy gradient
      const gradient = ctx.createLinearGradient(0, 0, 480, 0);
      gradient.addColorStop(0, "#072044");
      gradient.addColorStop(1, "#0B2545");

      ctx.font = "900 120px 'Montserrat', 'Inter', 'SF Pro Display', sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillStyle = gradient;
      ctx.fillText("GoDi", 10, 90);

      logoDataUrl = canvas.toDataURL("image/png");
    }

    // 1. Header Section
    pdf.setFillColor(250, 252, 255);
    pdf.rect(0, 0, PAGE_W, 30, "F");

    pdf.setFillColor(...C_BLUE);
    pdf.rect(0, 30, PAGE_W, 1.8, "F");

    if (logoDataUrl) {
      pdf.addImage(logoDataUrl, "PNG", MX, 7, 52, 14.5);
    }

    const todayStr = new Date().toLocaleDateString("es-EC", { day: "2-digit", month: "2-digit", year: "numeric" });

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(...C_NAVY);
    pdf.text("PROPUESTA COMERCIAL - PLAN CONTADOR", PAGE_W - MX, 11, { align: "right" });

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(...C_BLUE);
    pdf.text(getPlanBaseText().toUpperCase(), PAGE_W - MX, 18, { align: "right" });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(...C_TEXT_MUTED);
    pdf.text(`GODI • ECUADOR • ${todayStr}`, PAGE_W - MX, 24, { align: "right" });

    // 2. Overview & Financial Summary Side-by-Side
    const cardY = 36;
    const boxW = (PAGE_W - 2 * MX - 5) / 2;

    // Left Box: Configuration Specifications
    pdf.setFillColor(...C_LIGHT_BG);
    pdf.setDrawColor(...C_NAVY);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(MX, cardY, boxW, 44, 2, 2, "FD");

    pdf.setFillColor(...C_NAVY);
    pdf.rect(MX + 0.2, cardY + 0.2, boxW - 0.4, 6.5, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.setTextColor(255, 255, 255);
    pdf.text("CONFIGURACIÓN DE PROPUESTA", MX + boxW / 2, cardY + 4.8, { align: "center" });

    pdf.setTextColor(...C_TEXT_DARK);
    pdf.setFontSize(8);

    let lineY = cardY + 12;
    const drawLeftRow = (label: string, val: string) => {
      pdf.setFont("helvetica", "bold");
      pdf.text(label, MX + 4, lineY);
      pdf.setFont("helvetica", "normal");
      pdf.text(val, MX + boxW - 4, lineY, { align: "right" });
      lineY += 5.2;
    };

    drawLeftRow("Plan Base:", getPlanBaseText());
    drawLeftRow("Paquetes Facturación:", `${totalPlanesFactura} paquete(s)`);
    drawLeftRow("Módulos Corporativos:", `${totalModulosCantidad} módulo(s)`);
    drawLeftRow("Modalidad de Pago:", "Anual Proyectado");
    drawLeftRow("Vigencia Propuesta:", "15 Días Calendario");

    // Right Box: Financial Summary (+ 15% IVA)
    const rightX = MX + boxW + 5;
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(...C_BLUE);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(rightX, cardY, boxW, 44, 2, 2, "FD");

    pdf.setFillColor(...C_BLUE);
    pdf.rect(rightX + 0.2, cardY + 0.2, boxW - 0.4, 6.5, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.setTextColor(255, 255, 255);
    pdf.text("DESGLOSE FINANCIERO OFICIAL", rightX + boxW / 2, cardY + 4.8, { align: "center" });

    let rightLineY = cardY + 11.5;
    const drawRightRow = (label: string, val: string) => {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(...C_TEXT_DARK);
      pdf.text(label, rightX + 4, rightLineY);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.text(val, rightX + boxW - 4, rightLineY, { align: "right" });
      rightLineY += 5.1;
    };

    drawRightRow("Plan Base Empresas:", `$${precioBaseEmpresas.toFixed(2)} USD`);
    drawRightRow("Facturación e Inventarios:", `$${totalComprobantes.toFixed(2)} USD`);
    drawRightRow("Módulos Corporativos:", `$${totalModulos.toFixed(2)} USD`);
    drawRightRow("Subtotal Neto:", `$${subtotal.toFixed(2)} USD`);
    drawRightRow("IVA Ecuador (15%):", `$${iva.toFixed(2)} USD`);

    pdf.setFillColor(...C_NAVY);
    pdf.rect(rightX + 0.2, cardY + 33.5, boxW - 0.4, 10, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.setTextColor(255, 255, 255);
    pdf.text("TOTAL ESTIMADO CON IVA", rightX + 4, cardY + 40);
    pdf.setFontSize(10.5);
    pdf.setTextColor(255, 180, 50);
    pdf.text(`$${totalAnual.toFixed(2)} USD`, rightX + boxW - 4, cardY + 40, { align: "right" });

    // 3. Efficiency Banner
    const effY = 82;
    pdf.setFillColor(...C_NAVY);
    pdf.roundedRect(MX, effY, PAGE_W - 2 * MX, 10, 1.5, 1.5, "F");
    pdf.setFillColor(...C_BLUE);
    pdf.rect(MX, effY, 3, 10, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(255, 220, 150);
    pdf.text("ANÁLISIS DE EFICIENCIA POR EMPRESA / ÍTEM:", MX + 6, effY + 4);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(255, 255, 255);
    pdf.text(descPromedio || "Configuración actual de plan contable", MX + 6, effY + 8);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(255, 180, 50);
    pdf.text(`$${valPromedio.toFixed(2)} USD / año`, PAGE_W - MX - 4, effY + 6.5, { align: "right" });

    // 4. DETALLE ESPECÍFICO DE FACTURACIÓN Y MÓDULOS SELECCIONADOS
    const detY = 94;
    const detH = 37;

    // Left Box: DETALLE DE PAQUETES DE FACTURACIÓN
    pdf.setFillColor(...C_LIGHT_BG);
    pdf.setDrawColor(...C_NAVY);
    pdf.setLineWidth(0.25);
    pdf.roundedRect(MX, detY, boxW, detH, 1.5, 1.5, "FD");

    pdf.setFillColor(...C_NAVY);
    pdf.rect(MX + 0.2, detY + 0.2, boxW - 0.4, 5.5, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.setTextColor(255, 255, 255);
    pdf.text("PAQUETES Y COMPROBANTES DE FACTURACIÓN", MX + boxW / 2, detY + 4, { align: "center" });

    let itemFactY = detY + 9;
    pdf.setFontSize(7.5);

    const factLines: { text: string; price: string }[] = [];
    if (cant70 > 0) {
      factLines.push({
        text: `• UP LIGHT 70: ${cant70} paq. (${cant70 * 70} comprobantes)`,
        price: `$${(cant70 * 10).toFixed(2)}`
      });
    }
    if (cant500 > 0) {
      factLines.push({
        text: `• UP BASE 500: ${cant500} paq. (${cant500 * 500} comprobantes)`,
        price: `$${(cant500 * 25).toFixed(2)}`
      });
    }
    if (cantIlim > 0) {
      factLines.push({
        text: `• UP POWER: ${cantIlim} paq. (Comprobantes Ilimitados)`,
        price: `$${(cantIlim * 55).toFixed(2)}`
      });
    }

    if (factLines.length === 0) {
      pdf.setFont("helvetica", "italic");
      pdf.setTextColor(...C_TEXT_MUTED);
      pdf.text("Sin paquetes de facturación adicionales seleccionados.", MX + 4, itemFactY);
    } else {
      factLines.forEach((fl) => {
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...C_NAVY);
        pdf.text(fl.text, MX + 3, itemFactY);
        pdf.setFont("helvetica", "normal");
        pdf.text(fl.price, MX + boxW - 3, itemFactY, { align: "right" });
        itemFactY += 4.8;
      });
    }

    // Right Box: DETALLE DE MÓDULOS CORPORATIVOS ADICIONALES
    pdf.setFillColor(...C_LIGHT_BG);
    pdf.setDrawColor(...C_BLUE);
    pdf.setLineWidth(0.25);
    pdf.roundedRect(rightX, detY, boxW, detH, 1.5, 1.5, "FD");

    pdf.setFillColor(...C_BLUE);
    pdf.rect(rightX + 0.2, detY + 0.2, boxW - 0.4, 5.5, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.setTextColor(255, 255, 255);
    pdf.text("MÓDULOS CORPORATIVOS ADICIONALES", rightX + boxW / 2, detY + 4, { align: "center" });

    let itemModY = detY + 9;
    pdf.setFontSize(7.5);

    const modLines: { text: string; price: string }[] = [];
    if (mTesoreriaCant > 0) {
      modLines.push({ text: `• Módulo Tesorería: ${mTesoreriaCant} unidad(es)`, price: `$${(mTesoreriaCant * 75).toFixed(2)}` });
    }
    if (mNominaCant > 0) {
      modLines.push({ text: `• Módulo Nómina: ${mNominaCant} unidad(es)`, price: `$${(mNominaCant * 75).toFixed(2)}` });
    }
    if (mActivosCant > 0) {
      modLines.push({ text: `• Módulo Activos Fijos: ${mActivosCant} unidad(es)`, price: `$${(mActivosCant * 75).toFixed(2)}` });
    }
    if (mRestaurantesCant > 0) {
      modLines.push({ text: `• Módulo Restaurantes: ${mRestaurantesCant} unidad(es)`, price: `$${(mRestaurantesCant * 75).toFixed(2)}` });
    }
    if (mContabilidadCant > 0) {
      modLines.push({ text: `• Contabilidad Avanzada: ${mContabilidadCant} unidad(es)`, price: `$${(mContabilidadCant * 75).toFixed(2)}` });
    }

    if (modLines.length === 0) {
      pdf.setFont("helvetica", "italic");
      pdf.setTextColor(...C_TEXT_MUTED);
      pdf.text("Sin módulos corporativos adicionales seleccionados.", rightX + 4, itemModY);
    } else {
      modLines.forEach((ml) => {
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...C_TEXT_DARK);
        pdf.text(ml.text, rightX + 3, itemModY);
        pdf.setFont("helvetica", "normal");
        pdf.text(ml.price, rightX + boxW - 3, itemModY, { align: "right" });
        itemModY += 4.8;
      });
    }

    // 5. Detailed Modules Section
    const modsY = 134;
    pdf.setFillColor(...C_NAVY);
    pdf.rect(MX, modsY, PAGE_W - 2 * MX, 6.0, "F");
    pdf.setFillColor(...C_BLUE);
    pdf.rect(MX, modsY, 3.5, 6.0, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.setTextColor(255, 255, 255);
    pdf.text("FICHA TÉCNICA - MÓDULOS Y CAPACIDADES INCLUIDAS EN LA PROPUESTA", PAGE_W / 2 + 1.5, modsY + 4.2, { align: "center" });

    const modulesToRender = [
      {
        title: "Módulo Administrativo",
        items: [
          "Dashboard Informativo",
          "Proformas y Cotizaciones",
          "Facturación Electrónica SRI",
          "Facturas de reembolso y por lote",
          "Comprobantes de retención",
          "Notas de Crédito / Débito",
          "Liquidación de Compras y Guías",
          "Facturación recurrente / Contratos"
        ]
      },
      {
        title: "Módulo de Impuestos",
        items: [
          "ATS (Anexo Transaccional Simplificado)",
          "Formulario 103 (Retenciones)",
          "Formulario 104 (IVA)",
          "Reporte SRI automatizado"
        ]
      },
      {
        title: "Módulo Contabilidad",
        items: [
          "Plan de Cuentas flexible",
          "Centro de costos",
          "Reglas Contables y Asientos",
          "Balance de Comprobación y General",
          "Estado de Pérdidas y Ganancias (P&L)"
        ]
      }
    ];

    if (totalPlanesFactura > 0) {
      modulesToRender.push({
        title: "Producción & Inventarios",
        items: [
          "Catálogo de productos y servicios",
          "Productos con receta / combos",
          "Multibodega y transferencias",
          "Liquidación de importaciones",
          "Análisis de Rotación e Inventarios",
          "Órdenes de compra y producción"
        ]
      });
    }

    if (mTesoreriaCant > 0) {
      modulesToRender.push({
        title: "Módulo de Tesorería",
        items: [
          "Estado de cuenta proveedores/clientes",
          "Histórico de pagos y cobros masivos",
          "Anticipos y compensaciones",
          "Conciliación bancaria y cajas chicas"
        ]
      });
    }

    if (mNominaCant > 0) {
      modulesToRender.push({
        title: "Módulo de Nómina",
        items: [
          "Base de datos de empleados y roles",
          "Kardex de vacaciones y certificados",
          "RDEP, Formulario 107 y gastos",
          "Cargas familiares, horas extras"
        ]
      });
    }

    if (mActivosCant > 0) {
      modulesToRender.push({
        title: "Módulo Activos Fijos",
        items: [
          "Ficha detallada de activos",
          "Depreciaciones automáticas",
          "Kárdex de control de activos",
          "Acta de entrega recepción"
        ]
      });
    }

    if (mRestaurantesCant > 0) {
      modulesToRender.push({
        title: "Módulo Restaurantes",
        items: [
          "Gestión de meseros y mesas",
          "Comandas e impresora de cocina",
          "Caja Restaurante y pre-cuenta",
          "Informe diario de ventas"
        ]
      });
    }

    const numCols = 3;
    const colW = (PAGE_W - 2 * MX - (numCols - 1) * 3) / numCols;
    const colGap = 3;
    const gridStartY = modsY + 9;

    modulesToRender.forEach((mod, mIdx) => {
      const colIdx = mIdx % numCols;
      const rowIdx = Math.floor(mIdx / numCols);
      const x = MX + colIdx * (colW + colGap);
      const y = gridStartY + rowIdx * 42;

      pdf.setDrawColor(...C_NAVY);
      pdf.setLineWidth(0.25);
      pdf.setFillColor(...C_LIGHT_BG);
      pdf.roundedRect(x, y, colW, 39, 1.5, 1.5, "FD");

      pdf.setFillColor(...C_NAVY);
      pdf.rect(x + 0.2, y + 0.2, colW - 0.4, 5.5, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      pdf.setTextColor(255, 255, 255);
      pdf.text(mod.title.toUpperCase(), x + colW / 2, y + 4, { align: "center" });

      let itemY = y + 8.5;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6.5);
      pdf.setTextColor(...C_TEXT_DARK);

      mod.items.forEach((itemText) => {
        pdf.setFillColor(...C_BLUE);
        pdf.circle(x + 3, itemY - 0.8, 0.4, "F");
        const cleanText = itemText.length > 32 ? itemText.substring(0, 31) + "..." : itemText;
        pdf.text(cleanText, x + 5, itemY);
        itemY += 3.7;
      });
    });

    // 5. Footer Section
    const footerY = 278;
    pdf.setDrawColor(...C_BLUE);
    pdf.setLineWidth(0.8);
    pdf.line(MX, footerY, PAGE_W - MX, footerY);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9.5);
    pdf.setTextColor(...C_NAVY);
    pdf.text("GODI — TECNOLOGÍA QUE IMPULSA NEGOCIOS", PAGE_W / 2, footerY + 5.5, { align: "center" });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text("Documento oficial emitido por la Red Godi para distribución y cotización de software", PAGE_W / 2, footerY + 9.5, { align: "center" });

    pdf.save(`Propuesta-Godi-Plan-Contador.pdf`);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Main Grid: Configurator Left, Summary Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Configurator Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
            
            {/* Plan Base */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Ajustes de Plan Base</h3>
                  <p className="text-xs text-slate-500">Selecciona la base de empresas para la propuesta contable</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Empresas Base <span className="text-orange-600">*</span>
                </label>
                <select
                  value={tipoEmpresaBase}
                  onChange={e => setTipoEmpresaBase(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 text-white font-black text-sm rounded-xl focus:ring-2 focus:ring-orange-400 transition-all cursor-pointer"
                >
                  <option value="0">SELECCIONA PLAN BASE...</option>
                  <option value="1">1 EMPRESA ($50.00)</option>
                  <option value="3">3 EMPRESAS ($100.00)</option>
                  <option value="6">6 EMPRESAS ($150.00)</option>
                  <option value="10">10 EMPRESAS ($200.00)</option>
                  <option value="tax_ilimitado">TAX ILIMITADO ($100.00)</option>
                  <option value="ilimitadas">ILIMITADAS SOCIO ESTRATÉGICO ($300.00)</option>
                </select>
              </div>
            </div>

            {/* Facturación e Inventarios */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Facturación e Inventarios</h3>
                  <p className="text-xs text-slate-500">Paquetes de comprobantes electrónicos autorizados</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-800 text-sm">UP LIGHT 70</span>
                    <span className="bg-orange-100 text-orange-700 font-extrabold text-xs px-2 py-0.5 rounded-md">$10.00</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={cant70}
                    onChange={e => setCant70(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-24 px-3 py-2 bg-white border border-slate-300 rounded-xl text-center font-black text-slate-900 text-sm"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-800 text-sm">UP BASE 500</span>
                    <span className="bg-orange-100 text-orange-700 font-extrabold text-xs px-2 py-0.5 rounded-md">$25.00</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={cant500}
                    onChange={e => setCant500(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-24 px-3 py-2 bg-white border border-slate-300 rounded-xl text-center font-black text-slate-900 text-sm"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-800 text-sm">UP POWER ILIMITADO</span>
                    <span className="bg-orange-100 text-orange-700 font-extrabold text-xs px-2 py-0.5 rounded-md">$55.00</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={cantIlim}
                    onChange={e => setCantIlim(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-24 px-3 py-2 bg-white border border-slate-300 rounded-xl text-center font-black text-slate-900 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Módulos Corporativos */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Módulos Corporativos</h3>
                  <p className="text-xs text-slate-500">Añade tesorería, nómina, activos fijos y más ($75.00 c/u)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-bold text-slate-800 text-xs">Tesorería ($75)</span>
                  <input
                    type="number"
                    min="0"
                    value={mTesoreriaCant}
                    onChange={e => setMTesoreriaCant(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-center font-black text-xs text-slate-900"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-bold text-slate-800 text-xs">Nómina ($75)</span>
                  <input
                    type="number"
                    min="0"
                    value={mNominaCant}
                    onChange={e => setMNominaCant(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-center font-black text-xs text-slate-900"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-bold text-slate-800 text-xs">Activos Fijos ($75)</span>
                  <input
                    type="number"
                    min="0"
                    value={mActivosCant}
                    onChange={e => setMActivosCant(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-center font-black text-xs text-slate-900"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-bold text-slate-800 text-xs">Restaurantes ($75)</span>
                  <input
                    type="number"
                    min="0"
                    value={mRestaurantesCant}
                    onChange={e => setMRestaurantesCant(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-center font-black text-xs text-slate-900"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200 sm:col-span-2">
                  <span className="font-bold text-slate-800 text-xs">Contabilidad Avanzada ($75)</span>
                  <input
                    type="number"
                    min="0"
                    value={mContabilidadCant}
                    onChange={e => setMContabilidadCant(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-center font-black text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Financial Summary Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0B2545] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6 sticky top-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-orange-500/20 text-orange-400 rounded-xl border border-orange-500/30">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Resumen de Propuesta</h3>
                  <p className="text-xs text-slate-300">Valores sin IVA e IVA incluido (15%)</p>
                </div>
              </div>
              <span className="text-[10px] font-black bg-orange-500 text-white px-2.5 py-1 rounded-full uppercase">
                Anual
              </span>
            </div>

            {/* Financial Line Items */}
            <div className="space-y-3 text-sm font-medium">
              <div className="flex justify-between items-center text-slate-300">
                <span>Plan Base:</span>
                <span className="font-black text-white">${formatMoney(precioBaseEmpresas)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Facturación e Inventarios:</span>
                <span className="font-black text-white">${formatMoney(totalComprobantes)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Módulos Adicionales:</span>
                <span className="font-black text-white">${formatMoney(totalModulos)}</span>
              </div>

              <div className="pt-2 border-t border-white/10 flex justify-between items-center text-slate-200">
                <span className="font-bold">Subtotal:</span>
                <span className="font-black text-white">${formatMoney(subtotal)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>IVA (15%):</span>
                <span className="font-black text-amber-300">${formatMoney(iva)}</span>
              </div>

              {/* Total Anual Highlight */}
              <div className="pt-3 border-t-2 border-orange-500/40 flex justify-between items-center">
                <div>
                  <span className="text-xs uppercase font-black text-orange-400 tracking-wider block">TOTAL ANUAL</span>
                  <span className="text-xs text-slate-400">Incluye IVA oficial</span>
                </div>
                <span className="text-2xl sm:text-3xl font-black text-orange-400 tracking-tight">
                  ${formatMoney(totalAnual)}
                </span>
              </div>
            </div>

            {/* Print Proposal Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleExportPropuestaPDF}
                className="w-full py-3.5 px-4 bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-black text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-orange-400"
              >
                <Printer className="w-4 h-4 text-white" />
                <span>Imprimir Propuesta Comercial (PDF)</span>
              </button>
            </div>

            {/* Partner Alliance Badge (Only for ILIMITADAS) */}
            {tipoEmpresaBase === "ilimitadas" && (
              <div className="bg-gradient-to-br from-emerald-950/90 via-slate-900 to-emerald-950/90 border-2 border-emerald-400/80 p-5 rounded-2xl space-y-2.5 shadow-xl animate-fade-in">
                <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
                  <Award className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>¡FELICIDADES! SOCIO ESTRATÉGICO</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  Este plan te convierte en <strong className="text-emerald-300 font-bold">SOCIO ESTRATÉGICO</strong> de UpConta.
                </p>
                <div className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-emerald-800/60">
                  <p>🔥 Distribuye <strong>Firmas Electrónicas</strong> junto a nuestra certificadora <strong>ANF</strong> con <strong className="text-amber-300">50% DE DESCUENTO</strong>.</p>
                  <p>💰 Comisiona hasta un <strong className="text-amber-300">30%</strong> por cada plan que refieras.</p>
                </div>
              </div>
            )}

            {/* Analysis Box */}
            <div className="bg-slate-900/90 p-4 rounded-2xl border-l-4 border-orange-500 border-r border-t border-b border-slate-800 space-y-1">
              <span className="text-[10px] font-black uppercase text-orange-400 tracking-wider block">
                ANÁLISIS DE EFICIENCIA POR EMPRESA
              </span>
              <p className="text-xs text-slate-300 font-medium leading-tight">
                {descPromedio}
              </p>
              <span className="text-2xl font-black text-white block pt-1">
                ${formatMoney(valPromedio)} <span className="text-xs font-normal text-slate-400">/ año</span>
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Dynamic Module Showcase ("Ficha Técnica de tu Plan") */}
      {tipoEmpresaBase !== "0" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-2xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                Ficha Técnica de tu Plan
              </h3>
              <p className="text-xs text-slate-500">
                Módulos y capacidades incluidas en la configuración actual
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Módulo Administrativo & Comprobantes */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-orange-600 pb-2 border-b border-slate-200">
                Módulo Administrativo
              </h4>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                <li>Dashboard Informativo</li>
                <li>Proformas y Cotizaciones</li>
                <li>Facturación Electrónica SRI</li>
                <li>Facturas de reembolso</li>
                <li>Facturación por Lote</li>
                <li>Comprobantes de retención</li>
                <li>Notas de Crédito / Débito</li>
                <li>Liquidación de Compras</li>
                <li>Guías de Remisión</li>
                <li>Notas de Venta / Compras</li>
                <li>Facturación recurrente / Contratos</li>
              </ul>
            </div>

            {/* Módulo de Impuestos */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-orange-600 pb-2 border-b border-slate-200">
                Módulo de Impuestos
              </h4>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                <li>ATS (Anexo Transaccional Simplificado)</li>
                <li>Formulario 103 (Retenciones)</li>
                <li>Formulario 104 (IVA)</li>
                <li>Reporte SRI automatizado</li>
              </ul>
            </div>

            {/* Módulo Contabilidad */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-orange-600 pb-2 border-b border-slate-200">
                Módulo Contabilidad
              </h4>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                <li>Plan de Cuentas flexible</li>
                <li>Centro de costos</li>
                <li>Reglas Contables y Asientos automáticos</li>
                <li>Balance de Comprobación</li>
                <li>Balance General</li>
                <li>Estado de Pérdidas y Ganancias (P&amp;L)</li>
              </ul>
            </div>

            {/* Módulo de Producción (shown if Facturación packages > 0) */}
            {totalPlanesFactura > 0 && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-orange-600 pb-2 border-b border-slate-200">
                  Módulo de Producción &amp; Inventarios
                </h4>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                  <li>Catálogo de productos y servicios</li>
                  <li>Productos con receta / combos</li>
                  <li>Multibodega y transferencias</li>
                  <li>Liquidación de importaciones</li>
                  <li>Análisis de Rotación e Inventarios</li>
                  <li>Análisis de rentabilidad</li>
                  <li>Órdenes de compra y producción</li>
                </ul>
              </div>
            )}

            {/* Módulo de Tesorería */}
            {mTesoreriaCant > 0 && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-orange-600 pb-2 border-b border-slate-200">
                  Módulo de Tesorería
                </h4>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                  <li>Estado de cuenta proveedores y clientes</li>
                  <li>Histórico de pagos y cobros masivos</li>
                  <li>Anticipos y compensaciones</li>
                  <li>Cuentas bancarias y tarjetas de crédito</li>
                  <li>Cajas chicas y conciliación bancaria</li>
                </ul>
              </div>
            )}

            {/* Módulo de Nómina */}
            {mNominaCant > 0 && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-orange-600 pb-2 border-b border-slate-200">
                  Módulo de Nómina
                </h4>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                  <li>Base de datos de empleados y roles de pago</li>
                  <li>Kardex de vacaciones y certificados</li>
                  <li>RDEP, Formulario 107 y gastos personales</li>
                  <li>Cargas familiares, novedades y horas extras</li>
                  <li>Anticipos, préstamos e incremento de sueldos</li>
                </ul>
              </div>
            )}

            {/* Módulo Activos Fijos */}
            {mActivosCant > 0 && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-orange-600 pb-2 border-b border-slate-200">
                  Módulo Activos Fijos
                </h4>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                  <li>Ficha detallada de activos</li>
                  <li>Depreciaciones automáticas</li>
                  <li>Kárdex de control</li>
                  <li>Acta de entrega recepción</li>
                </ul>
              </div>
            )}

            {/* Módulo Restaurantes */}
            {mRestaurantesCant > 0 && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-orange-600 pb-2 border-b border-slate-200">
                  Módulo Restaurantes
                </h4>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                  <li>Gestión de meseros y mesas</li>
                  <li>Comandas e impresora de cocina</li>
                  <li>Caja Restaurante y pre-cuenta</li>
                  <li>Informe diario de ventas</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
