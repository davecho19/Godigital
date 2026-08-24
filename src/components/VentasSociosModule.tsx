import React, { useState, useEffect, useMemo } from "react";
import {
  ShoppingCart,
  DollarSign,
  Users,
  Search,
  Filter,
  Calendar,
  Download,
  RefreshCw,
  TrendingUp,
  Award,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Building,
  User,
  Clock,
  Sparkles,
  Tag,
  BarChart3,
  Trash2,
  Printer,
  X,
  ExternalLink,
  Eye,
  FileText,
  Loader2,
  Landmark,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { GodiOfficialLogo } from "./GodiLogo";
import { VentaRegistrada, SocioRegistrado } from "./ComisionModule";
import { deleteVentaFromGoogleSheets } from "../utils/googleSheetsSync";
import { DeleteVentaModal } from "./DeleteVentaModal";
import { getSocioNameForSale } from "../utils/userSessionHelper";
import { notifyPointsUpdated } from "../utils/rewardsData";

export function VentasSociosModule() {
  const [ventas, setVentas] = useState<VentaRegistrada[]>([]);
  const [socios, setSocios] = useState<SocioRegistrado[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [selectedVentaToDelete, setSelectedVentaToDelete] = useState<VentaRegistrada | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // Filters
  const [selectedSocio, setSelectedSocio] = useState<string>("ALL");
  const [selectedCategoria, setSelectedCategoria] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState<"ALL" | "TODAY" | "WEEK" | "MONTH" | "YEAR">("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<"tabla" | "socios_cards">("socios_cards");

  // Expanded Socio rows in general table
  const [expandedSocios, setExpandedSocios] = useState<Record<string, boolean>>({});
  
  // Modals for Printing
  const [printIndividualSocio, setPrintIndividualSocio] = useState<string | null>(null);
  const [showGeneralPrintModal, setShowGeneralPrintModal] = useState(false);

  // Load Data
  const loadData = () => {
    try {
      const vRaw = localStorage.getItem("kpier_ventas_registradas");
      if (vRaw) {
        const parsed = JSON.parse(vRaw);
        if (Array.isArray(parsed)) {
          setVentas(parsed);
        }
      } else {
        setVentas([]);
      }

      const sRaw = localStorage.getItem("kpier_socios_registrados");
      const pRaw = localStorage.getItem("kpier_partner_codes");
      const seenNames = new Set<string>();
      const allSocios: SocioRegistrado[] = [];

      if (sRaw) {
        const parsed = JSON.parse(sRaw);
        if (Array.isArray(parsed)) {
          parsed.forEach((s) => {
            const sName = s.nombreApellido || s.nombre;
            if (sName && !seenNames.has(sName.toLowerCase())) {
              seenNames.add(sName.toLowerCase());
              allSocios.push(s);
            }
          });
        }
      }

      if (pRaw) {
        const parsed = JSON.parse(pRaw);
        if (Array.isArray(parsed)) {
          parsed.forEach((p) => {
            const pName = p.nombre || p.nombreApellido;
            if (p.used && pName && !seenNames.has(pName.toLowerCase())) {
              seenNames.add(pName.toLowerCase());
              allSocios.push({
                id: p.id || `socio-${p.code}`,
                fechaRegistro: p.fechaRegistro || "",
                nombreApellido: pName,
                cedulaTelefono: `${p.rucCedula || ""} / ${p.telefono || ""}`,
                cedulaRuc: p.rucCedula || "",
                email: p.email || "",
                telefono: p.telefono || "",
                codigoSocio: p.code,
                partnerCode: p.code,
                registradoPor: p.registradoPor || "Gerencia",
                estado: p.estado || "Activo",
                esMlm: false,
                esDistribuidorFirmas: false,
              });
            }
          });
        }
      }

      setSocios(allSocios);

      const now = new Date();
      setLastUpdated(now.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch (err) {
      console.error("Error cargando ventas de socios:", err);
    }
  };

  const confirmDeleteVenta = (id: string) => {
    const updated = ventas.filter((v) => v.id !== id);
    setVentas(updated);
    localStorage.setItem("kpier_ventas_registradas", JSON.stringify(updated));
    window.dispatchEvent(new Event("kpier_ventas_updated"));
    deleteVentaFromGoogleSheets(id);
    notifyPointsUpdated();
  };

  useEffect(() => {
    loadData();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "kpier_ventas_registradas" || e.key === "kpier_socios_registrados" || e.key === "kpier_partner_codes") {
        loadData();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("kpier_ventas_updated", loadData);
    window.addEventListener("kpier_socios_updated", loadData);

    const interval = setInterval(loadData, 4000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("kpier_ventas_updated", loadData);
      window.removeEventListener("kpier_socios_updated", loadData);
      clearInterval(interval);
    };
  }, []);

  // Filtered Sales Logic
  const filteredVentas = useMemo(() => {
    return ventas.filter((v) => {
      // Filter by Socio
      if (selectedSocio !== "ALL") {
        const vSocioName = getSocioNameForSale(v, socios);
        const matchSocio =
          vSocioName.toLowerCase() === selectedSocio.toLowerCase() ||
          v.adminResponsable === selectedSocio ||
          v.nombreCliente === selectedSocio;
        if (!matchSocio) return false;
      }

      // Filter by Categoria
      if (selectedCategoria !== "ALL") {
        if (v.categoriaProducto !== selectedCategoria) return false;
      }

      // Date Range Filter
      if (dateRange !== "ALL") {
        const vDate = new Date(v.fechaRegistro);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dateRange === "TODAY") {
          const vDateStr = v.fechaRegistro;
          const todayStr = new Date().toISOString().split("T")[0];
          if (vDateStr !== todayStr) return false;
        } else if (dateRange === "WEEK") {
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(today.getDate() - 7);
          if (vDate < sevenDaysAgo) return false;
        } else if (dateRange === "MONTH") {
          const firstDayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          if (vDate < firstDayMonth) return false;
        } else if (dateRange === "YEAR") {
          const firstDayYear = new Date(today.getFullYear(), 0, 1);
          if (vDate < firstDayYear) return false;
        }
      }

      // Search Term
      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase().trim();
        const matchClient = (v.nombreCliente || "").toLowerCase().includes(term);
        const matchProduct = (v.nombreProducto || "").toLowerCase().includes(term);
        const sSaleName = getSocioNameForSale(v, socios) || "";
        const matchSocioName = (v.adminResponsable || "").toLowerCase().includes(term) || sSaleName.toLowerCase().includes(term);
        const matchCedula = (v.cedulaCliente || "").includes(term);
        if (!matchClient && !matchProduct && !matchSocioName && !matchCedula) return false;
      }

      return true;
    });
  }, [ventas, selectedSocio, selectedCategoria, dateRange, searchTerm, socios]);

  // Executive Metrics
  const stats = useMemo(() => {
    const totalFacturado = filteredVentas.reduce((sum, v) => sum + (v.totalVenta || 0), 0);
    const totalTransacciones = filteredVentas.length;
    const totalUnidades = filteredVentas.reduce((sum, v) => sum + (v.cantidad || 1), 0);
    const ticketPromedio = totalTransacciones > 0 ? totalFacturado / totalTransacciones : 0;
    const totalComisiones = totalFacturado * 0.30;

    // Grouping sales per socio
    const socioTotalsMap: Record<string, { count: number; total: number; commission: number; sales: VentaRegistrada[] }> = {};

    // Seed registered socios
    socios.forEach((s) => {
      const sName = s?.nombreApellido || (s as any)?.nombre;
      if (sName) {
        socioTotalsMap[sName] = { count: 0, total: 0, commission: 0, sales: [] };
      }
    });

    filteredVentas.forEach((v) => {
      const sKey = getSocioNameForSale(v, socios) || v.adminResponsable || "Socio Registrado";
      if (!socioTotalsMap[sKey]) {
        socioTotalsMap[sKey] = { count: 0, total: 0, commission: 0, sales: [] };
      }
      socioTotalsMap[sKey].count += v.cantidad || 1;
      socioTotalsMap[sKey].total += v.totalVenta || 0;
      socioTotalsMap[sKey].commission += (v.totalVenta || 0) * 0.30;
      socioTotalsMap[sKey].sales.push(v);
    });

    // Find top socio
    let topSocio = { name: "N/A", total: 0, count: 0 };
    Object.entries(socioTotalsMap).forEach(([name, data]) => {
      if (data.total > topSocio.total) {
        topSocio = { name, total: data.total, count: data.count };
      }
    });

    return {
      totalFacturado,
      totalTransacciones,
      totalUnidades,
      ticketPromedio,
      totalComisiones,
      topSocio,
      socioTotalsMap,
    };
  }, [filteredVentas, socios]);

  // List of socios for the general summary table (filtered by search and selected socio)
  const summarizedSociosList = useMemo(() => {
    // Collect all partner keys
    const allKeys = Array.from(
      new Set([
        ...socios.map((s) => s?.nombreApellido || (s as any)?.nombre || ""),
        ...Object.keys(stats.socioTotalsMap),
      ])
    ).filter(Boolean);

    return allKeys
      .map((name) => {
        const socioObj = socios.find(
          (s) => (s?.nombreApellido || (s as any)?.nombre || "").toLowerCase().trim() === (name || "").toLowerCase().trim()
        );
        const data = stats.socioTotalsMap[name] || { count: 0, total: 0, commission: 0, sales: [] };
        return {
          nombre: name,
          codigo: socioObj?.codigoSocio || socioObj?.partnerCode || "N/A",
          rucCedula: socioObj?.cedulaRuc || socioObj?.cedulaTelefono || "N/A",
          telefono: socioObj?.telefono || "N/A",
          email: socioObj?.email || "N/A",
          estado: socioObj?.estado || "Activo",
          count: data.count,
          total: data.total,
          commission: data.commission,
          sales: data.sales,
        };
      })
      .filter((item) => {
        if (selectedSocio !== "ALL" && (item.nombre || "").toLowerCase() !== (selectedSocio || "").toLowerCase()) {
          return false;
        }
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase().trim();
          const matchName = (item.nombre || "").toLowerCase().includes(term);
          const matchCode = (item.codigo || "").toLowerCase().includes(term);
          const matchRuc = (item.rucCedula || "").includes(term);
          if (!matchName && !matchCode && !matchRuc) return false;
        }
        return true;
      })
      .sort((a, b) => b.total - a.total);
  }, [socios, stats.socioTotalsMap, selectedSocio, searchTerm]);

  const toggleSocioExpand = (name: string) => {
    setExpandedSocios((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const toggleAllDetails = () => {
    const allExpanded = summarizedSociosList.every((s) => expandedSocios[s.nombre]);
    const newState: Record<string, boolean> = {};
    summarizedSociosList.forEach((s) => {
      newState[s.nombre] = !allExpanded;
    });
    setExpandedSocios(newState);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredVentas.length === 0) return;
    const headers = ["Fecha", "Socio Vendedor", "Cliente", "Cédula/RUC", "Producto / Plan", "Categoría", "Cantidad", "Precio Unitario", "Total Venta", "Comisión 30%"];
    const rows = filteredVentas.map((v) => [
      v.fechaRegistro,
      `"${getSocioNameForSale(v, socios)}"`,
      `"${v.nombreCliente || ""}"`,
      `"${v.cedulaCliente || ""}"`,
      `"${v.nombreProducto || ""}"`,
      v.categoriaProducto,
      v.cantidad || 1,
      v.precioUnitario || 0,
      v.totalVenta || 0,
      ((v.totalVenta || 0) * 0.30).toFixed(2),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Ventas_Socios_UpConta_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadIndividualSocioPDF = async (
    socioName: string,
    socioObj: SocioRegistrado | undefined,
    socioSales: VentaRegistrada[],
    totalSocioFacturado: number,
    totalSocioComision: number
  ) => {
    const reportElement = document.getElementById("printable-individual-socio-report");
    if (!reportElement) {
      window.print();
      return;
    }

    try {
      setIsGeneratingPdf(true);

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 800,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const margin = 10;
      const contentWidth = pdfWidth - margin * 2;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", margin, margin, contentWidth, contentHeight);

      const safeName = (socioName || "Socio").trim().replace(/[^a-zA-Z0-9_\-]/g, "_");
      const safeFecha = new Date().toISOString().split("T")[0].replace(/[^a-zA-Z0-9_\-]/g, "_");
      const filename = `Reporte_Ventas_Comisiones_${safeName}_${safeFecha}.pdf`;

      pdf.save(filename);
    } catch (error) {
      console.error("Error al generar PDF de ventas de socio:", error);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in w-full pb-10">
      
      {/* MODULE HEADER */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-black border border-amber-300 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Módulo Exclusivo Gerencial</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShoppingCart className="w-7 h-7 text-[#0B2545]" />
            <span>Ventas Realizadas por Socios</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Control consolidado, tabla general de rendimiento por socio y reportes de comisiones en tiempo real
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setShowGeneralPrintModal(true)}
            className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer border border-blue-600 shrink-0"
            title="Imprimir reporte general consolidado de ventas y socios"
          >
            <Printer className="w-4 h-4 text-blue-200" />
            <span>Imprimir Reporte General</span>
          </button>

          <button
            onClick={loadData}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer border border-slate-200"
          >
            <RefreshCw className="w-4 h-4 text-slate-600" />
            <span>Actualizar ({lastUpdated || "Ahora"})</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={filteredVentas.length === 0}
            className={`px-4 py-2 font-black text-xs rounded-xl transition-all flex items-center gap-2 shadow-xs ${
              filteredVentas.length > 0
                ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Facturado */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
              Facturación Total Socios
            </span>
            <div className="text-2xl font-black text-emerald-600">
              ${stats.totalFacturado.toFixed(2)}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Ingresos brutos generados por la red</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Transacciones */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
              Ventas Realizadas
            </span>
            <div className="text-2xl font-black text-slate-900">
              {stats.totalTransacciones} <span className="text-xs text-slate-400 font-normal">ventas</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">{stats.totalUnidades} planes / productos en total</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        {/* Total Comisiones 30% */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
              Comisiones a Pagar (30%)
            </span>
            <div className="text-2xl font-black text-purple-700">
              ${stats.totalComisiones.toFixed(2)}
            </div>
            <p className="text-[10px] text-purple-600 font-bold">Ganancia acumulada de socios</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl border border-purple-100">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Socio Top */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
              Socio Líder en Ventas
            </span>
            <div className="text-lg font-black text-[#0B2545] truncate max-w-[170px]">
              {stats.topSocio.name}
            </div>
            <p className="text-[10px] text-emerald-600 font-bold">
              ${stats.topSocio.total.toFixed(2)} ({stats.topSocio.count} ventas)
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100">
            <Award className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* FILTER BAR & VIEW TOGGLE */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-[#0B2545]" />
            <span>Filtros de Búsqueda y Modos de Vista</span>
          </div>

          {/* View Mode Toggle & Print Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode("socios_cards")}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "socios_cards"
                    ? "bg-[#0B2545] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Tabla Resumen por Socio</span>
              </button>
              <button
                onClick={() => setViewMode("tabla")}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "tabla"
                    ? "bg-[#0B2545] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Historial de Todas las Ventas</span>
              </button>
            </div>

            {/* Print Individual Button */}
            <button
              onClick={() => {
                if (selectedSocio !== "ALL") {
                  setPrintIndividualSocio(selectedSocio);
                } else if (summarizedSociosList.length > 0) {
                  setPrintIndividualSocio(summarizedSociosList[0].nombre);
                }
              }}
              className="px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 border bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 cursor-pointer shadow-xs"
              title="Imprimir reporte individual del socio seleccionado"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Reporte Individual</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Socio Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Filtrar por Socio
            </label>
            <select
              value={selectedSocio}
              onChange={(e) => setSelectedSocio(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">Todos los Socios ({socios.length})</option>
              {socios.map((s) => (
                <option key={s.id || s.nombreApellido} value={s.nombreApellido}>
                  {s.nombreApellido} ({s.codigoSocio || "Socio"})
                </option>
              ))}
            </select>
          </div>

          {/* Categoria Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Categoría de Producto
            </label>
            <select
              value={selectedCategoria}
              onChange={(e) => setSelectedCategoria(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">Todas las Categorías</option>
              <option value="facturacion">Facturación Electrónica</option>
              <option value="erp">ERP Contable</option>
              <option value="contador">Planes Contador</option>
              <option value="firma">Firmas Electrónicas</option>
              <option value="adicional">Módulos Adicionales</option>
            </select>
          </div>

          {/* Date Range Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Período
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">Todo el Historial</option>
              <option value="TODAY">Hoy</option>
              <option value="WEEK">Última Semana</option>
              <option value="MONTH">Este Mes</option>
              <option value="YEAR">Este Año</option>
            </select>
          </div>

          {/* Search Term Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Búsqueda Rápida
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cliente, RUC, Socio, Plan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

        </div>

      </div>

      {/* VIEW MODE 1: RESUMEN GENERAL POR SOCIO (TABLA GENERAL CON FILTRO DE DETALLES E IMPRESIÓN) */}
      {viewMode === "socios_cards" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-0">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-[#0B2545]" />
              <div>
                <h3 className="text-sm font-black text-slate-900">Tabla General de Resumen por Socio</h3>
                <p className="text-[11px] text-slate-500">Métricas consolidadas de facturación y comisiones por cada socio comercial</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleAllDetails}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
              >
                <Eye className="w-3.5 h-3.5 text-slate-600" />
                <span>
                  {summarizedSociosList.every((s) => expandedSocios[s.nombre])
                    ? "Ocultar Todos los Detalles"
                    : "Ver Todos los Detalles"}
                </span>
              </button>
              <span className="text-xs font-extrabold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                {summarizedSociosList.length} socios registrados
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 text-center w-12">#</th>
                  <th className="py-3.5 px-4">Socio Comercial</th>
                  <th className="py-3.5 px-4 text-center">Código de Socio</th>
                  <th className="py-3.5 px-4">Cédula / Teléfono</th>
                  <th className="py-3.5 px-4 text-center">Ventas Realizadas</th>
                  <th className="py-3.5 px-4 text-right">Total Facturado ($)</th>
                  <th className="py-3.5 px-4 text-right bg-purple-50/50 text-purple-950">Comisión Socio (30%)</th>
                  <th className="py-3.5 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {summarizedSociosList.length > 0 ? (
                  summarizedSociosList.map((socioItem, idx) => {
                    const isExpanded = !!expandedSocios[socioItem.nombre];
                    return (
                      <React.Fragment key={socioItem.nombre}>
                        <tr className={`hover:bg-slate-50 transition-all ${isExpanded ? "bg-blue-50/20" : ""}`}>
                          {/* Index */}
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400 text-[11px]">
                            {idx + 1}
                          </td>

                          {/* Socio Name & Avatar */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#0B2545]/10 text-[#0B2545] font-black flex items-center justify-center text-xs shrink-0 border border-[#0B2545]/20">
                                {socioItem.nombre.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-black text-slate-900 leading-tight">{socioItem.nombre}</p>
                                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                  {socioItem.estado}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Socio Code */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="font-mono text-xs font-black bg-amber-100 text-amber-950 px-2.5 py-1 rounded-lg border border-amber-300 tracking-wider shadow-2xs">
                              {socioItem.codigo}
                            </span>
                          </td>

                          {/* Cedula / Contact */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <p className="font-mono font-bold text-slate-800 text-xs">{socioItem.rucCedula}</p>
                              {socioItem.telefono !== "N/A" && (
                                <p className="text-[10px] text-slate-500">{socioItem.telefono}</p>
                              )}
                            </div>
                          </td>

                          {/* Total Sales Count */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black border ${
                              socioItem.sales.length > 0
                                ? "bg-blue-100 text-blue-900 border-blue-300"
                                : "bg-slate-100 text-slate-500 border-slate-200"
                            }`}>
                              {socioItem.sales.length} ventas
                            </span>
                          </td>

                          {/* Total Facturado */}
                          <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-600 text-sm">
                            ${socioItem.total.toFixed(2)}
                          </td>

                          {/* Comision 30% */}
                          <td className="py-3.5 px-4 text-right font-mono font-black text-purple-700 bg-purple-50/30 text-sm">
                            ${socioItem.commission.toFixed(2)}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Ver Detalle button */}
                              <button
                                onClick={() => toggleSocioExpand(socioItem.nombre)}
                                className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                                  isExpanded
                                    ? "bg-[#0B2545] text-white border-[#0B2545]"
                                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                                }`}
                                title="Ver desglose detallado de ventas de este socio"
                              >
                                <span>Detalles</span>
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>

                              {/* Imprimir Reporte Individual */}
                              <button
                                onClick={() => setPrintIndividualSocio(socioItem.nombre)}
                                className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-lg transition-all cursor-pointer"
                                title={`Imprimir reporte individual de ${socioItem.nombre}`}
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* EXPANDED ACCORDION ROW WITH DETAILED SALES SUB-TABLE */}
                        {isExpanded && (
                          <tr className="bg-slate-50/80">
                            <td colSpan={8} className="p-4 border-y border-slate-200">
                              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-[#0B2545]" />
                                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                                      Detalle de Ventas Registradas ({socioItem.sales.length})
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => setPrintIndividualSocio(socioItem.nombre)}
                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
                                  >
                                    <Printer className="w-3 h-3" />
                                    <span>Imprimir Reporte de {socioItem.nombre}</span>
                                  </button>
                                </div>

                                {socioItem.sales.length > 0 ? (
                                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                                    <table className="w-full text-left text-[11px]">
                                      <thead className="bg-slate-100 text-slate-600 font-extrabold uppercase text-[9px] border-b border-slate-200">
                                        <tr>
                                          <th className="py-2 px-3">Fecha</th>
                                          <th className="py-2 px-3">Cliente</th>
                                          <th className="py-2 px-3">Cédula/RUC</th>
                                          <th className="py-2 px-3">Producto / Plan</th>
                                          <th className="py-2 px-3 text-center">Cant.</th>
                                          <th className="py-2 px-3 text-right">Precio Unit.</th>
                                          <th className="py-2 px-3 text-right">Total Venta</th>
                                          <th className="py-2 px-3 text-right">Comisión 30%</th>
                                          <th className="py-2 px-3 text-center">Eliminar</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {socioItem.sales.map((sale) => (
                                          <tr key={sale.id} className="hover:bg-slate-50/80">
                                            <td className="py-2 px-3 font-mono text-slate-500">{sale.fechaRegistro}</td>
                                            <td className="py-2 px-3 font-bold text-slate-900">{sale.nombreCliente}</td>
                                            <td className="py-2 px-3 font-mono text-slate-500">{sale.cedulaCliente || "N/A"}</td>
                                            <td className="py-2 px-3 text-slate-800">
                                              {sale.nombreProducto} <span className="text-slate-400 text-[10px]">({sale.categoriaProducto})</span>
                                            </td>
                                            <td className="py-2 px-3 text-center font-bold">{sale.cantidad || 1}</td>
                                            <td className="py-2 px-3 text-right font-mono">${(sale.precioUnitario || 0).toFixed(2)}</td>
                                            <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600">${(sale.totalVenta || 0).toFixed(2)}</td>
                                            <td className="py-2 px-3 text-right font-mono font-black text-purple-700">${((sale.totalVenta || 0) * 0.30).toFixed(2)}</td>
                                            <td className="py-2 px-3 text-center">
                                              <button
                                                onClick={() => setSelectedVentaToDelete(sale)}
                                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all cursor-pointer"
                                                title="Eliminar venta"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <div className="p-4 text-center text-xs text-slate-400 font-medium bg-slate-50 rounded-lg border border-slate-100">
                                    Este socio aún no tiene ventas registradas en el período seleccionado.
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-bold">
                      No hay socios o ventas que coincidan con los filtros seleccionados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: TABLA DE TODAS LAS VENTAS DETALLADA */}
      {viewMode === "tabla" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#0B2545]" />
              <h3 className="text-sm font-black text-slate-900">Historial Detallado de Todas las Ventas</h3>
            </div>
            <span className="text-xs font-extrabold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
              {filteredVentas.length} transacciones registradas
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Socio Vendedor</th>
                  <th className="py-3 px-4">Cliente / RUC</th>
                  <th className="py-3 px-4">Producto / Plan</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4 text-center">Cant.</th>
                  <th className="py-3 px-4 text-right">Precio Unit.</th>
                  <th className="py-3 px-4 text-right">Total Venta</th>
                  <th className="py-3 px-4 text-right bg-purple-50/40 text-purple-900">Comisión 30%</th>
                  <th className="py-3 px-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredVentas.length > 0 ? (
                  filteredVentas.map((v) => {
                    const socioName = getSocioNameForSale(v, socios);
                    return (
                      <tr key={v.id} className="hover:bg-slate-50/80 transition-all">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {v.fechaRegistro}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="font-extrabold text-slate-900">{socioName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{v.nombreCliente}</div>
                          <div className="text-[10px] font-mono text-slate-500">{v.cedulaCliente || "N/A"}</div>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {v.nombreProducto}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-bold rounded text-[10px] uppercase">
                            {v.categoriaProducto}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          {v.cantidad || 1}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-600">
                          ${(v.precioUnitario || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-emerald-600 text-sm">
                          ${(v.totalVenta || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-purple-700 bg-purple-50/30">
                          ${((v.totalVenta || 0) * 0.30).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setSelectedVentaToDelete(v)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                            title="Eliminar registro de venta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400 font-bold">
                      No hay ventas registradas por socios que coincidan con los filtros seleccionados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Gerencia Confirmation Password Delete Modal */}
      <DeleteVentaModal
        isOpen={!!selectedVentaToDelete}
        onClose={() => setSelectedVentaToDelete(null)}
        venta={selectedVentaToDelete}
        onConfirmDelete={confirmDeleteVenta}
        isGerencia={true}
      />

      {/* MODAL: REPORTE INDIVIDUAL DE VENTAS DEL SOCIO */}
      {printIndividualSocio && (() => {
        const socioName = printIndividualSocio || "";
        const socioObj = socios.find(
          (s) => (s?.nombreApellido || (s as any)?.nombre || "").toLowerCase().trim() === socioName.toLowerCase().trim()
        );
        const socioSales = ventas.filter((v) => {
          const vName = getSocioNameForSale(v, socios) || "";
          return (vName || "").toLowerCase().trim() === socioName.toLowerCase().trim() || v.adminResponsable === socioName;
        });
        const totalSocioFacturado = socioSales.reduce((acc, v) => acc + (v.totalVenta || 0), 0);
        const totalSocioComision = totalSocioFacturado * 0.30;
        const todayStr = new Date().toISOString().split("T")[0];

        return (
          <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-scale-up">
              
              {/* Header with Branding & Print Button */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-5">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 text-xs font-black text-blue-900 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    <span>GODI - Red de Distribuidores</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    REPORTE INDIVIDUAL DE VENTAS Y COMISIONES
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Socio comercial: <strong className="text-slate-900 font-bold">{socioName}</strong> | Fecha de emisión: <span className="font-mono">{todayStr}</span>
                  </p>
                </div>
                <button
                  onClick={() => setPrintIndividualSocio(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Socio Data Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Nombre del Socio</span>
                  <div className="text-sm font-black text-slate-900 truncate">{socioName}</div>
                  <span className="text-[10px] text-slate-500 font-medium font-mono">Código: {socioObj?.codigoSocio || socioObj?.partnerCode || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase block">RUC / Cédula</span>
                  <div className="text-sm font-black text-slate-900 font-mono">{socioObj?.cedulaRuc || socioObj?.cedulaTelefono || "N/A"}</div>
                  <span className="text-[10px] text-slate-500 font-medium">Tel: {socioObj?.telefono || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Total Ventas</span>
                  <div className="text-sm font-black text-blue-900">{socioSales.length} transacciones</div>
                  <span className="text-[10px] text-slate-500 font-medium font-mono">Facturado: ${totalSocioFacturado.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Comisión Red (30%)</span>
                  <div className="text-sm font-black text-purple-700 font-mono">${totalSocioComision.toFixed(2)}</div>
                  <span className="text-[10px] text-purple-700 font-bold">Generado al 30%</span>
                </div>
              </div>

              {/* Table of Sales for this Socio */}
              <div className="space-y-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Detalle de Transacciones Registradas ({socioSales.length})</span>
                  <span className="text-[11px] font-bold text-slate-500">Monto Total: ${totalSocioFacturado.toFixed(2)}</span>
                </h3>
                
                <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-80 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] border-b border-slate-200">
                        <th className="py-2.5 px-3">Fecha</th>
                        <th className="py-2.5 px-3">Cliente</th>
                        <th className="py-2.5 px-3">Cédula / RUC</th>
                        <th className="py-2.5 px-3">Producto / Plan</th>
                        <th className="py-2.5 px-3 text-right">Total Venta ($)</th>
                        <th className="py-2.5 px-3 text-right bg-purple-50 text-purple-950">Comisión 30% ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {socioSales.length > 0 ? (
                        socioSales.map((sale) => (
                          <tr key={sale.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-mono text-[11px]">{sale.fechaRegistro}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{sale.nombreCliente}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">{sale.cedulaCliente || "N/A"}</td>
                            <td className="py-2.5 px-3 text-slate-800">{sale.nombreProducto} <span className="text-[10px] text-slate-400">({sale.planElegido || sale.categoriaProducto})</span></td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">${(sale.totalVenta || 0).toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-black text-purple-700 bg-purple-50/30">${((sale.totalVenta || 0) * 0.30).toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-400 font-medium">
                            No se encontraron registros de ventas para este socio.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <p className="text-[11px] text-slate-400 italic">
                  Reporte oficial individual emitido por la Plataforma GODI.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPrintIndividualSocio(null)}
                    className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() =>
                      handleDownloadIndividualSocioPDF(
                        socioName,
                        socioObj,
                        socioSales,
                        totalSocioFacturado,
                        totalSocioComision
                      )
                    }
                    disabled={isGeneratingPdf}
                    className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-md flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {isGeneratingPdf ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generando PDF...</span>
                      </>
                    ) : (
                      <>
                        <Printer className="w-4 h-4" />
                        <span>Imprimir Reporte (PDF/Papel)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* HIDDEN PRINTABLE INDIVIDUAL SOCIO REPORT TEMPLATE FOR PDF */}
      {printIndividualSocio && (() => {
        const socioName = printIndividualSocio || "";
        const socioObj = socios.find(
          (s) => (s?.nombreApellido || (s as any)?.nombre || "").toLowerCase().trim() === socioName.toLowerCase().trim()
        );
        const socioSales = (stats.socioTotalsMap[socioName]?.sales || []).filter((s) => {
          if (selectedCategoria !== "ALL" && s.categoriaProducto !== selectedCategoria) return false;
          return true;
        });
        const totalSocioFacturado = socioSales.reduce((acc, v) => acc + (v.totalVenta || 0), 0);
        const totalSocioComision = totalSocioFacturado * 0.30;
        const todayStr = new Date().toISOString().split("T")[0];

        // Retrieve banking details
        let bankBanco = (socioObj as any)?.banco || "";
        let bankTipo = (socioObj as any)?.tipoCuenta || "Cuenta de Ahorros";
        let bankNum = (socioObj as any)?.numeroCuenta || "";
        let bankTitular = (socioObj as any)?.titularCuenta || socioName;
        let bankCedula = (socioObj as any)?.cedulaTitular || socioObj?.cedulaRuc || socioObj?.cedulaTelefono || "";

        if (!bankBanco || !bankNum) {
          try {
            const rawSlots = localStorage.getItem("kpier_partner_codes");
            if (rawSlots) {
              const slots = JSON.parse(rawSlots);
              const matchedSlot = slots.find(
                (sl: any) =>
                  (sl.nombreCompleto && sl.nombreCompleto.toLowerCase().trim() === socioName.toLowerCase().trim()) ||
                  (sl.codigo && sl.codigo === socioObj?.codigoSocio) ||
                  (sl.rucCedula && sl.rucCedula === socioObj?.cedulaRuc)
              );
              if (matchedSlot) {
                bankBanco = bankBanco || matchedSlot.banco || "";
                bankTipo = bankTipo || matchedSlot.tipoCuenta || "Cuenta de Ahorros";
                bankNum = bankNum || matchedSlot.numeroCuenta || "";
                bankTitular = bankTitular || matchedSlot.titularCuenta || matchedSlot.nombreCompleto || socioName;
                bankCedula = bankCedula || matchedSlot.cedulaTitular || matchedSlot.rucCedula || "";
              }
            }
          } catch (e) {
            console.error("Error reading bank details for PDF report:", e);
          }
        }

        return (
          <div style={{ position: "fixed", left: "-9999px", top: "-9999px", width: "800px", pointerEvents: "none", zIndex: -1 }}>
            <div
              id="printable-individual-socio-report"
              style={{
                width: "800px",
                backgroundColor: "#ffffff",
                padding: "30px",
                fontFamily: "Arial, sans-serif",
                color: "#0f172a",
                boxSizing: "border-box",
              }}
            >
              {/* Header Printable */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #0B2545", paddingBottom: "12px", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <GodiOfficialLogo size="md" />
                  <div>
                    <h1 style={{ fontSize: "17px", fontWeight: "900", color: "#0B2545", margin: 0, textTransform: "uppercase" }}>
                      REPORTE DE VENTAS Y COMISIONES DE SOCIO
                    </h1>
                    <p style={{ fontSize: "11px", color: "#64748b", margin: "2px 0 0 0", fontWeight: "bold" }}>
                      SISTEMA DE GESTIÓN GODI — RED DE DISTRIBUIDORES &amp; ASESORES
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "10px", fontWeight: "bold", color: "#475569", display: "block" }}>
                    FECHA EMISIÓN:
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: "900", color: "#0f172a" }}>
                    {todayStr}
                  </span>
                </div>
              </div>

              {/* Socio Details Box */}
              <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", fontSize: "12px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <strong style={{ color: "#475569", fontSize: "10px", textTransform: "uppercase", display: "block" }}>SOCIO COMERCIAL / DISTRIBUIDOR:</strong>
                    <span style={{ fontSize: "14px", fontWeight: "900", color: "#0B2545" }}>{socioName}</span>
                  </div>
                  <div>
                    <strong style={{ color: "#475569", fontSize: "10px", textTransform: "uppercase", display: "block" }}>CÉDULA / RUC:</strong>
                    <span style={{ fontSize: "14px", fontWeight: "900", color: "#0B2545" }}>{socioObj?.cedulaRuc || socioObj?.cedulaTelefono || "NO ESPECIFICADO"}</span>
                  </div>
                  <div>
                    <strong style={{ color: "#475569", fontSize: "10px", textTransform: "uppercase", display: "block" }}>CÓDIGO DE SOCIO:</strong>
                    <span style={{ fontSize: "12px", fontWeight: "bold", color: "#b45309" }}>{socioObj?.codigoSocio || socioObj?.partnerCode || "N/A"}</span>
                  </div>
                  <div>
                    <strong style={{ color: "#475569", fontSize: "10px", textTransform: "uppercase", display: "block" }}>TELÉFONO / CONTACTO:</strong>
                    <span style={{ fontSize: "12px", fontWeight: "bold", color: "#334155" }}>{socioObj?.telefono || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Bank Account Details Box */}
              {bankBanco && bankNum && (
                <div style={{ backgroundColor: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", fontSize: "11px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", borderBottom: "1px solid #bbf7d0", paddingBottom: "4px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "900", color: "#166534", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      DATOS BANCARIOS REGISTRADOS PARA TRANSFERENCIA / ABONO:
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                    <div>
                      <strong style={{ color: "#15803d", fontSize: "9px", textTransform: "uppercase", display: "block" }}>INSTITUCIÓN BANCARIA:</strong>
                      <span style={{ fontSize: "12px", fontWeight: "800", color: "#0f172a" }}>{bankBanco}</span>
                    </div>
                    <div>
                      <strong style={{ color: "#15803d", fontSize: "9px", textTransform: "uppercase", display: "block" }}>TIPO DE CUENTA:</strong>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a" }}>{bankTipo}</span>
                    </div>
                    <div>
                      <strong style={{ color: "#15803d", fontSize: "9px", textTransform: "uppercase", display: "block" }}>NÚMERO DE CUENTA:</strong>
                      <span style={{ fontSize: "12px", fontWeight: "900", color: "#0f172a", fontFamily: "monospace" }}>{bankNum}</span>
                    </div>
                    <div>
                      <strong style={{ color: "#15803d", fontSize: "9px", textTransform: "uppercase", display: "block" }}>TITULAR DE LA CUENTA:</strong>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a" }}>{bankTitular}</span>
                    </div>
                    <div>
                      <strong style={{ color: "#15803d", fontSize: "9px", textTransform: "uppercase", display: "block" }}>C.I. / RUC TITULAR:</strong>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a" }}>{bankCedula}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Table of Transactions */}
              <div style={{ marginBottom: "16px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10.5px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#0B2545", color: "#ffffff", fontSize: "9.5px", textTransform: "uppercase" }}>
                      <th style={{ padding: "8px 10px", textAlign: "left", borderRadius: "4px 0 0 0" }}>FECHA</th>
                      <th style={{ padding: "8px 10px", textAlign: "left" }}>CLIENTE</th>
                      <th style={{ padding: "8px 10px", textAlign: "left" }}>CÉDULA / RUC</th>
                      <th style={{ padding: "8px 10px", textAlign: "left" }}>PRODUCTO / PLAN</th>
                      <th style={{ padding: "8px 10px", textAlign: "right" }}>TOTAL VENTA</th>
                      <th style={{ padding: "8px 10px", textAlign: "right", borderRadius: "0 4px 0 0" }}>COMISIÓN 30%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {socioSales.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: "16px", textAlign: "center", color: "#64748b" }}>
                          No hay transacciones registradas para este socio.
                        </td>
                      </tr>
                    ) : (
                      socioSales.map((sale, idx) => (
                        <tr key={sale.id ? `${sale.id}-ind-${idx}` : `sale-ind-${idx}`} style={{ borderBottom: "1px solid #e2e8f0", backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                          <td style={{ padding: "8px 10px", border: "1px solid #e2e8f0", fontFamily: "monospace", fontSize: "10px" }}>
                            {sale.fechaRegistro}
                          </td>
                          <td style={{ padding: "8px 10px", border: "1px solid #e2e8f0", fontWeight: "bold", color: "#0f172a" }}>
                            {sale.nombreCliente}
                          </td>
                          <td style={{ padding: "8px 10px", border: "1px solid #e2e8f0", fontFamily: "monospace", fontSize: "10px", color: "#475569" }}>
                            {sale.cedulaCliente || "N/A"}
                          </td>
                          <td style={{ padding: "8px 10px", border: "1px solid #e2e8f0", color: "#0f172a" }}>
                            {sale.nombreProducto} {sale.planElegido ? `(${sale.planElegido})` : ""}
                          </td>
                          <td style={{ padding: "8px 10px", border: "1px solid #e2e8f0", textAlign: "right", fontWeight: "bold", color: "#0f172a" }}>
                            ${(sale.totalVenta || 0).toFixed(2)}
                          </td>
                          <td style={{ padding: "8px 10px", border: "1px solid #e2e8f0", textAlign: "right", fontWeight: "900", color: "#047857" }}>
                            ${((sale.totalVenta || 0) * 0.30).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary Box */}
              <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "10px" }}>
                <div style={{ width: "380px", fontSize: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #cbd5e1", paddingBottom: "6px", marginBottom: "6px" }}>
                    <span style={{ color: "#475569", fontWeight: "700" }}>Total Transacciones Registradas:</span>
                    <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "13px" }}>{socioSales.length} ventas</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #cbd5e1", paddingBottom: "6px", marginBottom: "6px" }}>
                    <span style={{ color: "#475569", fontWeight: "700" }}>Monto Total Facturado:</span>
                    <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "14px" }}>${totalSocioFacturado.toFixed(2)} USD</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", marginTop: "4px", fontSize: "14px", fontWeight: "900", color: "#047857", borderTop: "2px solid #0B2545" }}>
                    <span>TOTAL A COMISIONAR (30%):</span>
                    <span style={{ fontSize: "18px", color: "#047857", fontWeight: "900" }}>${totalSocioComision.toFixed(2)} USD</span>
                  </div>
                </div>
              </div>

              {/* Signatures Spot */}
              <div style={{ paddingTop: "32px", display: "flex", justifyContent: "center", textAlign: "center", fontSize: "11px" }}>
                <div style={{ borderTop: "1.5px solid #94a3b8", paddingTop: "8px", width: "260px" }}>
                  <p style={{ fontWeight: "900", color: "#0f172a", margin: 0, fontSize: "14px" }}>{socioName}</p>
                  {(socioObj?.cedulaRuc || socioObj?.cedulaTelefono) && (
                    <p style={{ fontSize: "11px", color: "#475569", margin: "2px 0 0 0", fontWeight: "700" }}>
                      C.I. / RUC: {socioObj?.cedulaRuc || socioObj?.cedulaTelefono}
                    </p>
                  )}
                  <p style={{ fontSize: "9.5px", color: "#64748b", margin: "4px 0 0 0", textTransform: "uppercase", fontWeight: "bold" }}>
                    FIRMA DEL SOCIO / DISTRIBUIDOR
                  </p>
                </div>
              </div>

              {/* Footer text */}
              <div style={{ marginTop: "24px", paddingTop: "12px", borderTop: "1px solid #e2e8f0", textAlign: "center", fontSize: "9.5px", color: "#94a3b8" }}>
                Documento oficial generado por la Plataforma GODI. Válido para control de liquidaciones y auditoría comercial.
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL: REPORTE GENERAL DE VENTAS Y SOCIOS */}
      {showGeneralPrintModal && (() => {
        const todayStr = new Date().toISOString().split("T")[0];

        return (
          <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-scale-up">
              
              {/* Header with Branding & Print Button */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-5">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 text-xs font-black text-blue-900 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    <span>GODI - Red de Distribuidores</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    REPORTE GENERAL DE RENDIMIENTO Y VENTAS POR SOCIO
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Consolidado oficial de gerencia | Fecha de emisión: <span className="font-mono font-bold">{todayStr}</span>
                  </p>
                </div>
                <button
                  onClick={() => setShowGeneralPrintModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* General Summary KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Total Socios Evaluados</span>
                  <div className="text-base font-black text-slate-900">{summarizedSociosList.length} Socios</div>
                  <span className="text-[10px] text-slate-500 font-medium">{socios.length} registrados</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Total Transacciones</span>
                  <div className="text-base font-black text-blue-900 font-mono">{stats.totalTransacciones} Ventas</div>
                  <span className="text-[10px] text-slate-500 font-medium">{stats.totalUnidades} unidades vendidas</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Facturación Global</span>
                  <div className="text-base font-black text-emerald-600 font-mono">${stats.totalFacturado.toFixed(2)}</div>
                  <span className="text-[10px] text-slate-500 font-medium">Ticket prom: ${stats.ticketPromedio.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Comisiones Totales (30%)</span>
                  <div className="text-base font-black text-purple-700 font-mono">${stats.totalComisiones.toFixed(2)}</div>
                  <span className="text-[10px] text-purple-700 font-bold">Abono total a la red</span>
                </div>
              </div>

              {/* Table of All Socios Summary */}
              <div className="space-y-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Resumen Consolidado por Socio
                </h3>
                
                <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-80 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] border-b border-slate-200">
                        <th className="py-2.5 px-3 text-center">#</th>
                        <th className="py-2.5 px-3">Socio Comercial</th>
                        <th className="py-2.5 px-3 text-center">Código</th>
                        <th className="py-2.5 px-3">RUC / Cédula</th>
                        <th className="py-2.5 px-3 text-center">Transacciones</th>
                        <th className="py-2.5 px-3 text-right">Total Facturado ($)</th>
                        <th className="py-2.5 px-3 text-right bg-purple-50 text-purple-950">Comisión 30% ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {summarizedSociosList.length > 0 ? (
                        summarizedSociosList.map((socio, index) => (
                          <tr key={socio.nombre} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 text-center font-mono text-slate-400">{index + 1}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{socio.nombre}</td>
                            <td className="py-2.5 px-3 text-center font-mono text-[11px] font-bold text-amber-900">{socio.codigo}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">{socio.rucCedula}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-slate-800">{socio.sales.length}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">${socio.total.toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-black text-purple-700 bg-purple-50/30">${socio.commission.toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-slate-400 font-medium">
                            No hay socios con registros disponibles.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <p className="text-[11px] text-slate-400 italic">
                  Reporte general corporativo emitido por la Gerencia General GODI.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowGeneralPrintModal(false)}
                    className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="py-2.5 px-5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-md flex items-center gap-2 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir Reporte General</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
