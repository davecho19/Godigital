import React, { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  Users,
  DollarSign,
  ShoppingBag,
  Award,
  BarChart3,
  PieChart as PieIcon,
  Calendar,
  Filter,
  Download,
  Search,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  UserCheck,
  PackageCheck,
  Target,
  FileSpreadsheet,
  Layers,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Clock,
  Printer,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Info,
  Building,
  UserX,
  UserCheck2,
  Repeat,
  Trash2,
} from "lucide-react";
import { VentaRegistrada, SocioRegistrado } from "./ComisionModule";
import { deleteVentaFromGoogleSheets } from "../utils/googleSheetsSync";
import { DeleteVentaModal } from "./DeleteVentaModal";
import { getSocioNameForSale } from "../utils/userSessionHelper";
import { SyncMonitorCard } from "./SyncMonitorCard";
import { notifyPointsUpdated } from "../utils/rewardsData";

// Recharts Color Palette for Executive Dark Blue Theme
const COLORS = [
  "#0B2545",
  "#133E72",
  "#3B51A3",
  "#2563EB",
  "#0284C7",
  "#0D9488",
  "#059669",
  "#D97706",
  "#7C3AED",
  "#DB2777",
];

interface SocioSalesData {
  count: number;
  total: number;
  lastDate: string;
  topPlan: Record<string, number>;
}

export function GerenciaDashboard() {
  // State for raw data loaded directly from system tables (localStorage)
  const [ventas, setVentas] = useState<VentaRegistrada[]>([]);
  const [allRawVentas, setAllRawVentas] = useState<VentaRegistrada[]>([]);
  const [socios, setSocios] = useState<SocioRegistrado[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [selectedVentaToDelete, setSelectedVentaToDelete] = useState<VentaRegistrada | null>(null);

  // Filters state
  const [dateRange, setDateRange] = useState<"ALL" | "TODAY" | "WEEK" | "MONTH" | "YEAR" | "CUSTOM">("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedSocioFilter, setSelectedSocioFilter] = useState<string>("ALL");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Table Sort State
  const [sortField, setSortField] = useState<"nombre" | "ventas" | "facturacion" | "ticket" | "comision" | "fecha">("facturacion");
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Time Series Granularity for Evolution Chart
  const [timeGranularity, setTimeGranularity] = useState<"DIA" | "MES" | "ANO">("MES");

  // Load Data Function from localStorage
  const loadSystemData = () => {
    try {
      const vData = localStorage.getItem("kpier_ventas_registradas");
      if (vData) {
        const parsedV = JSON.parse(vData);
        if (Array.isArray(parsedV)) {
          setAllRawVentas(parsedV);
          setVentas(parsedV);
        }
      } else {
        setVentas([]);
        setAllRawVentas([]);
      }

      const sData = localStorage.getItem("kpier_socios_registrados");
      if (sData) {
        const parsedS = JSON.parse(sData);
        if (Array.isArray(parsedS)) setSocios(parsedS);
      } else {
        setSocios([]);
      }

      const now = new Date();
      setLastUpdated(now.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch (err) {
      console.error("Error cargando datos para el Dashboard Gerencial:", err);
    }
  };

  const confirmDeleteVenta = (id: string) => {
    try {
      const vData = localStorage.getItem("kpier_ventas_registradas");
      if (vData) {
        const parsedV = JSON.parse(vData);
        if (Array.isArray(parsedV)) {
          const updated = parsedV.filter((v: any) => v.id !== id);
          localStorage.setItem("kpier_ventas_registradas", JSON.stringify(updated));
          window.dispatchEvent(new Event("kpier_ventas_updated"));
          notifyPointsUpdated();
        }
      }
      deleteVentaFromGoogleSheets(id);
      loadSystemData();
    } catch (err) {
      console.error("Error al eliminar venta desde Gerencia:", err);
    }
  };

  // Initial load and real-time event listener
  useEffect(() => {
    loadSystemData();

    // Listen to localStorage changes (from other tabs or modules)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "kpier_ventas_registradas" || e.key === "kpier_socios_registrados") {
        loadSystemData();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("kpier_ventas_updated", loadSystemData);
    // Interval check every 5 seconds for same-window state updates
    const interval = setInterval(loadSystemData, 5000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("kpier_ventas_updated", loadSystemData);
      clearInterval(interval);
    };
  }, []);

  // Filtered Sales Calculation - Only include sales from registered active socios/users
  const activeSocioNames = useMemo(() => {
    const setNames = new Set<string>();
    socios.forEach((s) => {
      if (s.nombreApellido) setNames.add(s.nombreApellido.toLowerCase().trim());
      if (s.email) setNames.add(s.email.toLowerCase().trim());
      if (s.codigoSocio) setNames.add(s.codigoSocio.toLowerCase().trim());
    });
    return setNames;
  }, [socios]);

  const filteredVentas = useMemo(() => {
    return ventas.filter((v) => {
      const socioName = getSocioNameForSale(v, socios);

      // Date Filter
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
        } else if (dateRange === "CUSTOM") {
          if (startDate && v.fechaRegistro < startDate) return false;
          if (endDate && v.fechaRegistro > endDate) return false;
        }
      }

      // Socio / Admin Filter
      if (selectedSocioFilter !== "ALL") {
        if (socioName !== selectedSocioFilter && v.adminResponsable !== selectedSocioFilter && v.nombreCliente !== selectedSocioFilter) {
          return false;
        }
      }

      // Category Filter
      if (selectedCategoryFilter !== "ALL") {
        if (v.categoriaProducto !== selectedCategoryFilter && v.productoId !== selectedCategoryFilter) {
          return false;
        }
      }

      // Search Term
      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase();
        const matchClient = v.nombreCliente?.toLowerCase().includes(term);
        const matchProduct = v.nombreProducto?.toLowerCase().includes(term);
        const matchAdmin = v.adminResponsable?.toLowerCase().includes(term);
        const matchCedula = v.cedulaCliente?.includes(term);
        if (!matchClient && !matchProduct && !matchAdmin && !matchCedula) return false;
      }

      return true;
    });
  }, [ventas, socios, activeSocioNames, dateRange, startDate, endDate, selectedSocioFilter, selectedCategoryFilter, searchTerm]);

  // Executive KPI Calculations
  const kpis = useMemo(() => {
    const totalSocios = socios.length;
    const sociosActivos = socios.filter((s) => s.estado === "Activo").length;
    const totalVentasCount = filteredVentas.reduce((sum, v) => sum + (v.cantidad || 1), 0);
    const totalRegistrosVentas = filteredVentas.length;
    const valorTotalVendido = filteredVentas.reduce((sum, v) => sum + (v.totalVenta || 0), 0);
    
    const ticketPromedioVenta = totalRegistrosVentas > 0 ? valorTotalVendido / totalRegistrosVentas : 0;
    const ticketPromedioSocio = totalSocios > 0 ? valorTotalVendido / totalSocios : 0;
    const promedioVentasSocio = totalSocios > 0 ? totalVentasCount / totalSocios : 0;
    
    // Commission calculated at 30% over total sales
    const comisionTotalGenerada = valorTotalVendido * 0.30;

    // Sales per Socio / Admin grouping
    const socioSalesMap: Record<string, SocioSalesData> = {};
    
    // Seed with existing registered partners
    socios.forEach((s) => {
      socioSalesMap[s.nombreApellido] = { count: 0, total: 0, lastDate: "", topPlan: {} };
    });

    filteredVentas.forEach((v) => {
      const sellerKey = getSocioNameForSale(v, socios);
      if (!socioSalesMap[sellerKey]) {
        socioSalesMap[sellerKey] = { count: 0, total: 0, lastDate: "", topPlan: {} };
      }
      socioSalesMap[sellerKey].count += v.cantidad || 1;
      socioSalesMap[sellerKey].total += v.totalVenta || 0;
      if (!socioSalesMap[sellerKey].lastDate || v.fechaRegistro > socioSalesMap[sellerKey].lastDate) {
        socioSalesMap[sellerKey].lastDate = v.fechaRegistro;
      }
      const prodName = v.nombreProducto || "Plan";
      socioSalesMap[sellerKey].topPlan[prodName] = (socioSalesMap[sellerKey].topPlan[prodName] || 0) + (v.cantidad || 1);
    });

    // Top Socio by Facturación
    let topSocioFacturacion = { name: "N/A", value: 0 };
    let topSocioVentas = { name: "N/A", value: 0 };
    Object.entries(socioSalesMap).forEach(([name, data]) => {
      if (data.total > topSocioFacturacion.value) {
        topSocioFacturacion = { name, value: data.total };
      }
      if (data.count > topSocioVentas.value) {
        topSocioVentas = { name, value: data.count };
      }
    });

    // Top Plan
    const planCountMap: Record<string, number> = {};
    const planTotalMap: Record<string, number> = {};
    filteredVentas.forEach((v) => {
      const pName = v.nombreProducto || "Sin Especificar";
      planCountMap[pName] = (planCountMap[pName] || 0) + (v.cantidad || 1);
      planTotalMap[pName] = (planTotalMap[pName] || 0) + (v.totalVenta || 0);
    });

    let topPlan = { name: "N/A", count: 0, total: 0 };
    Object.entries(planCountMap).forEach(([name, count]) => {
      if (count > topPlan.count) {
        topPlan = { name, count, total: planTotalMap[name] || 0 };
      }
    });

    // Partners with 0 sales, 1 sale, 2+ sales
    let sociosSinVentas = 0;
    let sociosUnaVenta = 0;
    let sociosRecurrentes = 0;

    Object.values(socioSalesMap).forEach((d) => {
      if (d.count === 0) sociosSinVentas++;
      else if (d.count === 1) sociosUnaVenta++;
      else if (d.count >= 2) sociosRecurrentes++;
    });

    // Unique Clients
    const uniqueClientsSet = new Set(filteredVentas.map((v) => v.cedulaCliente || v.nombreCliente));
    const totalClientesUnicos = uniqueClientsSet.size;

    // Min & Max Sale values
    const saleValues = filteredVentas.map((v) => v.totalVenta || 0);
    const maxVenta = saleValues.length > 0 ? Math.max(...saleValues) : 0;
    const minVenta = saleValues.length > 0 ? Math.min(...saleValues) : 0;

    return {
      totalSocios,
      sociosActivos,
      totalVentasCount,
      totalRegistrosVentas,
      valorTotalVendido,
      ticketPromedioVenta,
      ticketPromedioSocio,
      promedioVentasSocio,
      comisionTotalGenerada,
      topSocioFacturacion,
      topSocioVentas,
      topPlan,
      sociosSinVentas,
      sociosUnaVenta,
      sociosRecurrentes,
      totalClientesUnicos,
      maxVenta,
      minVenta,
      socioSalesMap,
      planCountMap,
      planTotalMap,
    };
  }, [socios, filteredVentas]);

  // Chart Data 1: Sales per Socio (Bar Chart)
  const chartSalesPerSocio = useMemo(() => {
    return (Object.entries(kpis.socioSalesMap) as [string, SocioSalesData][])
      .map(([name, data]) => ({
        socio: name.length > 15 ? name.substring(0, 15) + "..." : name,
        fullSocio: name,
        ventas: data.count,
        facturacion: Number(data.total.toFixed(2)),
      }))
      .sort((a, b) => b.facturacion - a.facturacion);
  }, [kpis.socioSalesMap]);

  // Chart Data 2: Top 10 Ranking Socios
  const chartTop10Socios = useMemo(() => {
    return chartSalesPerSocio.slice(0, 10);
  }, [chartSalesPerSocio]);

  // Chart Data 3: Plans Distribution (Donut Chart)
  const chartPlanesDistribucion = useMemo(() => {
    const total = kpis.valorTotalVendido || 1;
    return Object.entries(kpis.planCountMap).map(([name, count]) => {
      const val = kpis.planTotalMap[name] || 0;
      const pct = Number(((val / total) * 100).toFixed(1));
      return {
        name,
        count,
        value: Number(val.toFixed(2)),
        percentage: pct,
      };
    }).sort((a, b) => b.value - a.value);
  }, [kpis.planCountMap, kpis.planTotalMap, kpis.valorTotalVendido]);

  // Chart Data 4: Sales Evolution over Time (Line Chart)
  const chartEvolucionVentas = useMemo(() => {
    const grouped: Record<string, { label: string; facturacion: number; cantidad: number }> = {};

    filteredVentas.forEach((v) => {
      if (!v.fechaRegistro) return;
      const dateObj = new Date(v.fechaRegistro);
      let key = v.fechaRegistro;

      if (timeGranularity === "MES") {
        key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
      } else if (timeGranularity === "ANO") {
        key = `${dateObj.getFullYear()}`;
      }

      if (!grouped[key]) {
        let displayLabel = key;
        if (timeGranularity === "MES") {
          const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
          displayLabel = `${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
        }
        grouped[key] = { label: displayLabel, facturacion: 0, cantidad: 0 };
      }

      grouped[key].facturacion += v.totalVenta || 0;
      grouped[key].cantidad += v.cantidad || 1;
    });

    return Object.keys(grouped)
      .sort()
      .map((k) => ({
        fecha: grouped[k].label,
        Facturacion: Number(grouped[k].facturacion.toFixed(2)),
        Ventas: grouped[k].cantidad,
      }));
  }, [filteredVentas, timeGranularity]);

  // Chart Data 5: Share by Socio (Pie Chart)
  const chartParticipacionSocio = useMemo(() => {
    const total = kpis.valorTotalVendido || 1;
    return chartSalesPerSocio.map((s) => ({
      name: s.fullSocio,
      value: s.facturacion,
      percentage: Number(((s.facturacion / total) * 100).toFixed(1)),
    }));
  }, [chartSalesPerSocio, kpis.valorTotalVendido]);

  // Chart Data 6: Category Breakdown
  const chartCategorias = useMemo(() => {
    const catMap: Record<string, number> = {
      facturacion: 0,
      erp: 0,
      contador: 0,
      adicional: 0,
    };
    filteredVentas.forEach((v) => {
      const cat = v.categoriaProducto || "facturacion";
      catMap[cat] = (catMap[cat] || 0) + (v.totalVenta || 0);
    });

    const labelMap: Record<string, string> = {
      facturacion: "Facturación Electrónica",
      erp: "Sistemas ERP PYMES",
      contador: "Planes Contadores",
      adicional: "Módulos Adicionales",
    };

    return Object.entries(catMap).map(([key, val]) => ({
      name: labelMap[key] || key.toUpperCase(),
      facturacion: Number(val.toFixed(2)),
    }));
  }, [filteredVentas]);

  // Detailed Partner Summary Table Data
  const partnerSummaryTable = useMemo(() => {
    const rows = (Object.entries(kpis.socioSalesMap) as [string, SocioSalesData][]).map(([name, data]) => {
      const partnerObj = socios.find((s) => s.nombreApellido === name);
      const ticketProm = data.count > 0 ? data.total / data.count : 0;
      
      let topPlanName = "N/A";
      let topPlanQty = 0;
      (Object.entries(data.topPlan) as [string, number][]).forEach(([pName, pQty]) => {
        if (pQty > topPlanQty) {
          topPlanQty = pQty;
          topPlanName = pName;
        }
      });

      return {
        id: partnerObj?.id || name,
        nombre: name,
        cedulaTelefono: partnerObj?.cedulaTelefono || "N/A",
        ventas: data.count,
        facturacion: data.total,
        ticketPromedio: ticketProm,
        ultimaVenta: data.lastDate || "Sin ventas",
        planMasVendido: topPlanName,
        comision: data.total * 0.15,
        estado: partnerObj?.estado || "Activo",
      };
    });

    // Apply Sorting
    return rows.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [kpis.socioSalesMap, socios, sortField, sortAsc]);

  // Export Table to CSV Handler
  const exportToCSV = () => {
    const headers = ["Socio", "Cedula/Telefono", "Cant Ventas", "Facturacion ($)", "Ticket Promedio ($)", "Ultima Venta", "Plan Mas Vendido", "Comision Est. ($)", "Estado"];
    const rows = partnerSummaryTable.map((r) => [
      `"${r.nombre}"`,
      `"${r.cedulaTelefono}"`,
      r.ventas,
      r.facturacion.toFixed(2),
      r.ticketPromedio.toFixed(2),
      `"${r.ultimaVenta}"`,
      `"${r.planMasVendido}"`,
      r.comision.toFixed(2),
      `"${r.estado}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Reporte_Gerencial_Socios_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-7xl mx-auto px-2 sm:px-4">

      {/* MONITOR DE SINCRONIZACIÓN GOOGLE SHEETS & LOCAL STORAGE */}
      <SyncMonitorCard />

      {/* FILTROS DINÁMICOS GERENCIALES & ACCIONES */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
            <Filter className="w-4 h-4 text-[#3B51A3]" />
            <span>Filtros Dinámicos de Consulta</span>
          </div>

          <div className="flex items-center gap-2">
            {(dateRange !== "ALL" || selectedSocioFilter !== "ALL" || selectedCategoryFilter !== "ALL" || searchTerm !== "") && (
              <button
                onClick={() => {
                  setDateRange("ALL");
                  setSelectedSocioFilter("ALL");
                  setSelectedCategoryFilter("ALL");
                  setSearchTerm("");
                  setStartDate("");
                  setEndDate("");
                }}
                className="text-xs font-bold text-red-600 hover:text-red-800 hover:underline cursor-pointer mr-2"
              >
                Limpiar filtros
              </button>
            )}

            <button
              onClick={loadSystemData}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span>Actualizar ({lastUpdated || "Ahora"})</span>
            </button>

            <button
              onClick={exportToCSV}
              className="px-3.5 py-1.5 bg-[#0B2545] hover:bg-[#133E72] active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Exportar Reporte CSV</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Date Filter */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
              Rango de Fechas
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todo el Histórico</option>
              <option value="TODAY">Hoy</option>
              <option value="WEEK">Últimos 7 Días</option>
              <option value="MONTH">Este Mes</option>
              <option value="YEAR">Este Año</option>
              <option value="CUSTOM">Rango Personalizado</option>
            </select>
          </div>

          {/* Socio Filter */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
              Filtrar por Socio / Admin
            </label>
            <select
              value={selectedSocioFilter}
              onChange={(e) => setSelectedSocioFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todos los Socios y Admins</option>
              {socios.map((s) => (
                <option key={s.id} value={s.nombreApellido}>
                  {s.nombreApellido}
                </option>
              ))}
              <option value="admin">admin (Admin General)</option>
              <option value="admin1">admin1 (Operativo 1)</option>
              <option value="admin2">admin2 (Supervisor 2)</option>
              <option value="gerencia">gerencia (Gerencia General)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
              Categoría de Producto
            </label>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todas las Categorías</option>
              <option value="facturacion">Facturación Electrónica</option>
              <option value="erp">ERP PYMES</option>
              <option value="contador">Planes Contadores</option>
              <option value="adicional">Módulos Adicionales</option>
            </select>
          </div>

          {/* Search Term */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
              Búsqueda Rápida
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar cliente, plan, cédula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

        </div>

        {/* Custom Date Picker (if selected) */}
        {dateRange === "CUSTOM" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 animate-fade-in">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Fecha Desde</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Fecha Hasta</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
          </div>
        )}
      </div>

      {/* SECCIÓN 1: TARJETAS DE INDICADORES PRINCIPALES (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Socios */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Total Socios Registrados</span>
            <div className="text-2xl font-black text-slate-900">{kpis.totalSocios}</div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <UserCheck className="w-3 h-3" /> {kpis.sociosActivos} Activos
            </span>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-[#0B2545] border border-blue-100">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Valor Total Vendido */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Valor Total Vendido</span>
            <div className="text-2xl font-black text-emerald-600">${kpis.valorTotalVendido.toFixed(2)}</div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
              <ShoppingBag className="w-3 h-3 text-slate-500" /> {kpis.totalVentasCount} Planes vend.
            </span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700 border border-emerald-100">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Ticket Promedio Venta */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Ticket Promedio / Venta</span>
            <div className="text-2xl font-black text-slate-900">${kpis.ticketPromedioVenta.toFixed(2)}</div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              <Target className="w-3 h-3" /> Prom: ${kpis.ticketPromedioSocio.toFixed(2)} / socio
            </span>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl text-purple-700 border border-purple-100">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Comisión Total Generada */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Comisión Total Generada</span>
            <div className="text-2xl font-black text-amber-600">${kpis.comisionTotalGenerada.toFixed(2)}</div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              <Sparkles className="w-3 h-3 text-amber-500" /> Comisión Red (30%)
            </span>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-700 border border-amber-100">
            <Award className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* HIGHLIGHT CARDS: TOP SOCIO & TOP PLAN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Top Socio Facturación */}
        <div className="bg-gradient-to-br from-slate-900 to-[#0B2545] text-white p-5 rounded-2xl shadow-md border border-slate-800 flex items-center gap-4">
          <div className="p-3.5 bg-amber-400/20 text-amber-400 rounded-2xl border border-amber-400/30 shrink-0">
            <Award className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">Socio con Mayor Facturación</span>
            <div className="text-base font-black truncate max-w-[200px]">{kpis.topSocioFacturacion.name}</div>
            <div className="text-xs text-slate-300 font-bold">
              Facturado: <span className="text-amber-400 font-extrabold">${kpis.topSocioFacturacion.value.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Top Socio Cantidad Ventas */}
        <div className="bg-gradient-to-br from-slate-900 to-[#133E72] text-white p-5 rounded-2xl shadow-md border border-slate-800 flex items-center gap-4">
          <div className="p-3.5 bg-emerald-400/20 text-emerald-400 rounded-2xl border border-emerald-400/30 shrink-0">
            <UserCheck className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-emerald-300 tracking-wider">Socio Más Activo en Ventas</span>
            <div className="text-base font-black truncate max-w-[200px]">{kpis.topSocioVentas.name}</div>
            <div className="text-xs text-slate-300 font-bold">
              Cantidad: <span className="text-emerald-400 font-extrabold">{kpis.topSocioVentas.value} ventas</span>
            </div>
          </div>
        </div>

        {/* Top Plan Comercializado */}
        <div className="bg-gradient-to-br from-slate-900 to-[#3B51A3] text-white p-5 rounded-2xl shadow-md border border-slate-800 flex items-center gap-4">
          <div className="p-3.5 bg-blue-400/20 text-blue-300 rounded-2xl border border-blue-400/30 shrink-0">
            <PackageCheck className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-blue-300 tracking-wider">Plan Más Comercializado</span>
            <div className="text-base font-black truncate max-w-[200px]">{kpis.topPlan.name}</div>
            <div className="text-xs text-slate-300 font-bold">
              Vendidos: <span className="text-blue-300 font-extrabold">{kpis.topPlan.count} unidades</span> (${kpis.topPlan.total.toFixed(2)})
            </div>
          </div>
        </div>

      </div>

      {/* SECCIÓN 2: GRÁFICOS INTERACTIVOS (RECHARTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GRÁFICO 1: Ventas por Socio */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#3B51A3]" />
                1. Ventas por Socio ($)
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">Comparativo de monto facturado por cada socio o administrador</p>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
              {chartSalesPerSocio.length} socios
            </span>
          </div>

          <div className="h-72 w-full">
            {chartSalesPerSocio.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <Info className="w-8 h-8 mb-2 stroke-1" />
                <span>No hay ventas registradas en el período seleccionado.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartSalesPerSocio} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="socio" tick={{ fontSize: 10, fill: "#64748b" }} interval={0} angle={-25} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                  <Tooltip
                    formatter={(val: number) => [`$${val.toFixed(2)}`, "Facturación"]}
                    labelFormatter={(label, item) => item[0]?.payload?.fullSocio || label}
                    contentStyle={{ backgroundColor: "#0F172A", borderRadius: "12px", color: "#fff", border: "none", fontSize: "12px" }}
                  />
                  <Bar dataKey="facturacion" fill="#0B2545" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* GRÁFICO 2: Top 10 Ranking de Socios */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                2. Top 10 Ranking de Socios
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">Líderes comerciales según facturación acumulada</p>
            </div>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
              Ranking Top 10
            </span>
          </div>

          <div className="h-72 w-full">
            {chartTop10Socios.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <Info className="w-8 h-8 mb-2 stroke-1" />
                <span>Sin datos suficientes para el ranking.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={chartTop10Socios} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis dataKey="socio" type="category" tick={{ fontSize: 10, fill: "#64748b" }} width={85} />
                  <Tooltip
                    formatter={(val: number) => [`$${val.toFixed(2)}`, "Facturación"]}
                    labelFormatter={(label, item) => item[0]?.payload?.fullSocio || label}
                    contentStyle={{ backgroundColor: "#0F172A", borderRadius: "12px", color: "#fff", border: "none", fontSize: "12px" }}
                  />
                  <Bar dataKey="facturacion" fill="#3B51A3" radius={[0, 6, 6, 0]}>
                    {chartTop10Socios.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* GRÁFICO 3: Planes Más Comercializados (Donut Chart) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-600" />
                3. Planes Más Comercializados
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">Distribución por producto y cuota de participación</p>
            </div>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            {chartPlanesDistribucion.length === 0 ? (
              <div className="flex flex-col items-center text-slate-400 text-xs">
                <Info className="w-8 h-8 mb-2 stroke-1" />
                <span>No hay datos de productos.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartPlanesDistribucion}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartPlanesDistribucion.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number, name, item: any) => [`$${val.toFixed(2)} (${item.payload.percentage}%)`, item.payload.name]}
                    contentStyle={{ backgroundColor: "#0F172A", borderRadius: "12px", color: "#fff", border: "none", fontSize: "12px" }}
                  />
                  <Legend
                    formatter={(value) => <span className="text-[10px] font-bold text-slate-700">{value}</span>}
                    layout="horizontal"
                    align="center"
                    verticalAlign="bottom"
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* GRÁFICO 4: Evolución de Ventas (Line/Area Chart) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                4. Evolución Temporal de Ventas
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">Tendencia comercial en el tiempo</p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setTimeGranularity("DIA")}
                className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md ${timeGranularity === "DIA" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"}`}
              >
                Día
              </button>
              <button
                onClick={() => setTimeGranularity("MES")}
                className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md ${timeGranularity === "MES" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"}`}
              >
                Mes
              </button>
              <button
                onClick={() => setTimeGranularity("ANO")}
                className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md ${timeGranularity === "ANO" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"}`}
              >
                Año
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            {chartEvolucionVentas.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <Info className="w-8 h-8 mb-2 stroke-1" />
                <span>Sin suficientes registros históricos.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartEvolucionVentas} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFact" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                  <Tooltip
                    formatter={(val: number) => [`$${val.toFixed(2)}`, "Facturado"]}
                    contentStyle={{ backgroundColor: "#0F172A", borderRadius: "12px", color: "#fff", border: "none", fontSize: "12px" }}
                  />
                  <Area type="monotone" dataKey="Facturacion" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorFact)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* SECCIÓN 3: ESTADÍSTICAS DETALLADAS GERENCIALES (BENTO METRICS) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <SlidersHorizontal className="w-4 h-4 text-[#3B51A3]" />
          <h2 className="text-sm font-extrabold text-slate-900">Análisis Comercial Detallado & Métricas Clave</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          
          <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Clientes Únicos</span>
            <div className="text-base font-black text-slate-900">{kpis.totalClientesUnicos}</div>
            <span className="text-[9px] text-slate-400 font-medium">Registrados</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Socios Sin Ventas</span>
            <div className="text-base font-black text-amber-600">{kpis.sociosSinVentas}</div>
            <span className="text-[9px] text-amber-600 font-bold">Oportunidad red</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Socios Con 1 Venta</span>
            <div className="text-base font-black text-blue-600">{kpis.sociosUnaVenta}</div>
            <span className="text-[9px] text-blue-600 font-bold">En activación</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Socios Recurrentes</span>
            <div className="text-base font-black text-emerald-600">{kpis.sociosRecurrentes}</div>
            <span className="text-[9px] text-emerald-600 font-bold">2+ ventas</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Venta Máxima</span>
            <div className="text-base font-black text-slate-900">${kpis.maxVenta.toFixed(2)}</div>
            <span className="text-[9px] text-slate-400 font-medium">Mayor transacción</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Venta Mínima</span>
            <div className="text-base font-black text-slate-900">${kpis.minVenta.toFixed(2)}</div>
            <span className="text-[9px] text-slate-400 font-medium">Menor transacción</span>
          </div>

        </div>
      </div>

      {/* SECCIÓN 4: TABLA RESUMEN DINÁMICA DE SOCIOS */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden space-y-4 p-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#3B51A3]" />
              Tabla Resumen de Desempeño por Socio
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Detalle consolidado de ventas, facturación, ticket promedio, comisiones y último registro por socio.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={exportToCSV}
              className="px-3.5 py-2 bg-[#0B2545] hover:bg-[#133E72] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Excel/CSV</span>
            </button>
          </div>
        </div>

        {/* Dynamic Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th onClick={() => toggleSort("nombre")} className="p-3 rounded-l-lg cursor-pointer hover:bg-slate-200 transition-colors">
                  <div className="flex items-center gap-1">
                    Socio {sortField === "nombre" && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="p-3">Cédula / Contacto</th>
                <th onClick={() => toggleSort("ventas")} className="p-3 text-center cursor-pointer hover:bg-slate-200 transition-colors">
                  <div className="flex items-center justify-center gap-1">
                    Ventas {sortField === "ventas" && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th onClick={() => toggleSort("facturacion")} className="p-3 text-right cursor-pointer hover:bg-slate-200 transition-colors">
                  <div className="flex items-center justify-end gap-1">
                    Facturación ($) {sortField === "facturacion" && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th onClick={() => toggleSort("ticket")} className="p-3 text-right cursor-pointer hover:bg-slate-200 transition-colors">
                  <div className="flex items-center justify-end gap-1">
                    Ticket Prom. ($) {sortField === "ticket" && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th onClick={() => toggleSort("comision")} className="p-3 text-right cursor-pointer hover:bg-slate-200 transition-colors">
                  <div className="flex items-center justify-end gap-1">
                    Comisión Est. ($) {sortField === "comision" && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="p-3">Plan Más Vendido</th>
                <th onClick={() => toggleSort("fecha")} className="p-3 text-center rounded-r-lg cursor-pointer hover:bg-slate-200 transition-colors">
                  <div className="flex items-center justify-center gap-1">
                    Última Venta {sortField === "fecha" && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {partnerSummaryTable.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                    No se encontraron registros de socios que coincidan con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                partnerSummaryTable.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-extrabold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#0B2545]/10 text-[#0B2545] font-black text-xs flex items-center justify-center shrink-0">
                        {row.nombre.charAt(0).toUpperCase()}
                      </div>
                      <span>{row.nombre}</span>
                    </td>

                    <td className="p-3 font-mono text-slate-600 font-medium">{row.cedulaTelefono}</td>

                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full font-black text-xs ${row.ventas > 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"}`}>
                        {row.ventas}
                      </span>
                    </td>

                    <td className="p-3 text-right font-black text-slate-900">${row.facturacion.toFixed(2)}</td>

                    <td className="p-3 text-right font-extrabold text-slate-700">${row.ticketPromedio.toFixed(2)}</td>

                    <td className="p-3 text-right font-black text-amber-600">${row.comision.toFixed(2)}</td>

                    <td className="p-3 font-semibold text-slate-800">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-900 rounded-md font-bold text-[11px]">
                        {row.planMasVendido}
                      </span>
                    </td>

                    <td className="p-3 text-center font-mono text-[11px] text-slate-500">
                      {row.ultimaVenta || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* SECCIÓN 5: GESTIÓN Y ELIMINACIÓN DE VENTAS REGISTRADAS (AUTORIZACIÓN GERENCIAL) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-red-600" />
              Gestión Directa y Control de Ventas Registradas
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Listado general de transacciones registradas. Para eliminar un registro se requiere la clave de autorización de Gerencia.
            </p>
          </div>
          <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
            Total Registros: <span className="text-slate-900 font-black">{allRawVentas.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="p-3">Fecha</th>
                <th className="p-3">Vendedor / Socio</th>
                <th className="p-3">Cliente / Cédula</th>
                <th className="p-3">Producto / Plan</th>
                <th className="p-3 text-center">Cant.</th>
                <th className="p-3 text-right">Precio Unit.</th>
                <th className="p-3 text-right">Total Venta</th>
                <th className="p-3 text-center">Control / Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allRawVentas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                    No existen ventas registradas en el sistema actualmente.
                  </td>
                </tr>
              ) : (
                allRawVentas.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {v.fechaRegistro}
                    </td>
                    <td className="p-3 font-extrabold text-slate-900">
                      {getSocioNameForSale(v, socios)}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{v.nombreCliente}</div>
                      <div className="text-[10px] font-mono text-slate-500">{v.cedulaCliente || "N/A"}</div>
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      {v.nombreProducto}
                    </td>
                    <td className="p-3 text-center font-bold">{v.cantidad || 1}</td>
                    <td className="p-3 text-right font-mono text-slate-600 font-bold">
                      ${(v.precioUnitario || 0).toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-mono font-black text-emerald-600 text-sm">
                      ${(v.totalVenta || 0).toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedVentaToDelete(v)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-all cursor-pointer flex items-center gap-1 mx-auto font-bold text-[11px]"
                        title="Eliminar venta (requiere clave de Gerencia)"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        <span>Eliminar</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Venta Confirmation Modal with Gerencia Password */}
      <DeleteVentaModal
        isOpen={!!selectedVentaToDelete}
        onClose={() => setSelectedVentaToDelete(null)}
        venta={selectedVentaToDelete}
        onConfirmDelete={confirmDeleteVenta}
      />

    </div>
  );
}
