import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Users,
  Calendar,
  Filter,
  RefreshCw,
  Printer,
  Copy,
  Globe,
  Download,
  Image as ImageIcon,
  Sparkles,
  Calculator,
  DollarSign,
  Clock,
  ShieldCheck,
  Building2,
  FileText
} from "lucide-react";
import {
  TelemetryEvent,
  TelemetryAction,
  getTelemetryEvents,
  filterTelemetryEvents
} from "../utils/telemetry";

const COLORS = ["#0B2545", "#F97316", "#10B981", "#6366F1", "#8B5CF6", "#EC4899", "#14B8A6", "#EAB308", "#06B6D4"];

export function DashboardModule() {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("TODOS");
  const [timeRange, setTimeRange] = useState<"semana" | "rango" | "mes" | "total">("total");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const loadEvents = () => {
    setEvents(getTelemetryEvents());
  };

  useEffect(() => {
    loadEvents();
    const handleUpdate = () => loadEvents();
    window.addEventListener("godi_telemetry_update", handleUpdate);
    return () => window.removeEventListener("godi_telemetry_update", handleUpdate);
  }, []);

  // Filter events by time range and user
  const filteredEvents = useMemo(() => {
    let result = filterTelemetryEvents(events, timeRange, startDate, endDate);
    if (selectedUser !== "TODOS") {
      result = result.filter((e) => e.user === selectedUser);
    }
    return result;
  }, [events, timeRange, startDate, endDate, selectedUser]);

  // Compute counts for the 9 tracked actions
  const actionCounts = useMemo(() => {
    const counts: Record<TelemetryAction, number> = {
      fichas_impresas_sistema: 0,
      argumentos_copiados_firma: 0,
      clics_navegador_explorador: 0,
      propuestas_descargadas_cotizador: 0,
      png_descargadas_sistema: 0,
      png_descargadas_firmas: 0,
      prompts_copiados: 0,
      propuestas_impresas_contador: 0,
      resumen_comision_impreso: 0,
    };

    filteredEvents.forEach((e) => {
      if (counts[e.action] !== undefined) {
        counts[e.action]++;
      }
    });

    return counts;
  }, [filteredEvents]);

  // Prepare chart data by action
  const chartDataByAction = useMemo(() => {
    return [
      { name: "Fichas Sistema", cantidad: actionCounts.fichas_impresas_sistema, key: "fichas_impresas_sistema" },
      { name: "Arg. Firmas", cantidad: actionCounts.argumentos_copiados_firma, key: "argumentos_copiados_firma" },
      { name: "Ir Navegador", cantidad: actionCounts.clics_navegador_explorador, key: "clics_navegador_explorador" },
      { name: "Prop. Cotizador", cantidad: actionCounts.propuestas_descargadas_cotizador, key: "propuestas_descargadas_cotizador" },
      { name: "PNG Sistema", cantidad: actionCounts.png_descargadas_sistema, key: "png_descargadas_sistema" },
      { name: "PNG Firmas", cantidad: actionCounts.png_descargadas_firmas, key: "png_descargadas_firmas" },
      { name: "Prompts Copiados", cantidad: actionCounts.prompts_copiados, key: "prompts_copiados" },
      { name: "Prop. Contador", cantidad: actionCounts.propuestas_impresas_contador, key: "propuestas_impresas_contador" },
      { name: "Resumen Comisión", cantidad: actionCounts.resumen_comision_impreso, key: "resumen_comision_impreso" },
    ];
  }, [actionCounts]);

  // Prepare chart data by user
  const chartDataByUser = useMemo(() => {
    const userMap: Record<string, number> = {};
    filteredEvents.forEach((e) => {
      const u = e.user || "admin";
      userMap[u] = (userMap[u] || 0) + 1;
    });

    return Object.keys(userMap).map((u) => ({
      name: u,
      acciones: userMap[u],
    }));
  }, [filteredEvents]);

  const totalActionsCount = filteredEvents.length;

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-10">
      {/* Module Title Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-[#0B2545]" />
            <span>Dashboard de Medición e Indicadores (Telemetría Admins)</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Monitoreo en tiempo real de interacciones, impresiones, descargas y copias realizadas por los usuarios administradores
          </p>
        </div>

        <button
          onClick={loadEvents}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto border border-slate-200"
        >
          <RefreshCw className="w-4 h-4 text-slate-600" />
          <span>Actualizar Datos</span>
        </button>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-[#0B2545]" />
          <span>Filtros de Análisis Telemétrico</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Time Range Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Período de Medición
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setTimeRange("semana")}
                className={`py-1.5 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer ${
                  timeRange === "semana"
                    ? "bg-[#0B2545] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setTimeRange("mes")}
                className={`py-1.5 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer ${
                  timeRange === "mes"
                    ? "bg-[#0B2545] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Mes
              </button>
              <button
                onClick={() => setTimeRange("rango")}
                className={`py-1.5 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer ${
                  timeRange === "rango"
                    ? "bg-[#0B2545] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Rango
              </button>
              <button
                onClick={() => setTimeRange("total")}
                className={`py-1.5 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer ${
                  timeRange === "total"
                    ? "bg-[#0B2545] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Total
              </button>
            </div>
          </div>

          {/* User Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Usuario Administrador
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
            >
              <option value="TODOS">Todos los Usuarios</option>
              {Array.from(new Set(events.map((e) => e.user || "admin"))).map((usr) => (
                <option key={usr} value={usr}>
                  {usr}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Date Start */}
          {timeRange === "rango" && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          )}

          {/* Custom Date End */}
          {timeRange === "rango" && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* TRACKED METRIC CARDS GRID (9 TRACKED ACTIONS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        
        {/* 1. Fichas Impresas Sistema */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-blue-300 transition-all flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
              Fichas Impresas en Sistema
            </span>
            <div className="text-2xl font-black text-slate-900">
              {actionCounts.fichas_impresas_sistema} <span className="text-xs text-slate-400 font-normal">impresiones</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Impresión de ficha técnica ERP/Facturación</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-800 rounded-xl">
            <Printer className="w-5 h-5" />
          </div>
        </div>

        {/* 2. Argumentos / Requisitos Copiados en Firma */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-purple-300 transition-all flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
              Argumentos / Requisitos Copiados (Firma)
            </span>
            <div className="text-2xl font-black text-slate-900">
              {actionCounts.argumentos_copiados_firma} <span className="text-xs text-slate-400 font-normal">copias</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Copiado de texto para ventas de firmas ANF</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-800 rounded-xl">
            <Copy className="w-5 h-5" />
          </div>
        </div>

        {/* 3. Clics en Ir al Navegador (Explorador Inteligente) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-emerald-300 transition-all flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
              Clics Navegador (Explorador Inteligente)
            </span>
            <div className="text-2xl font-black text-slate-900">
              {actionCounts.clics_navegador_explorador} <span className="text-xs text-slate-400 font-normal">clics</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Acceso a SRI, Superintendencia, etc.</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl">
            <Globe className="w-5 h-5" />
          </div>
        </div>

        {/* 4. Propuestas Descargadas en Cotizador */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-amber-300 transition-all flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
              Propuestas Descargadas (Cotizador)
            </span>
            <div className="text-2xl font-black text-slate-900">
              {actionCounts.propuestas_descargadas_cotizador} <span className="text-xs text-slate-400 font-normal">descargas</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Generación de propuesta comercial PDF</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-800 rounded-xl">
            <Download className="w-5 h-5" />
          </div>
        </div>

        {/* 5. Imágenes PNG Descargadas de Sistema */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-cyan-300 transition-all flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
              PNG Descargadas (Sistema)
            </span>
            <div className="text-2xl font-black text-slate-900">
              {actionCounts.png_descargadas_sistema} <span className="text-xs text-slate-400 font-normal">archivos</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Artes gráficos y mockups del ERP</p>
          </div>
          <div className="p-3 bg-cyan-50 text-cyan-800 rounded-xl">
            <ImageIcon className="w-5 h-5" />
          </div>
        </div>

        {/* 6. Imágenes PNG Descargadas de Firmas */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-orange-300 transition-all flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
              PNG Descargadas (Firmas)
            </span>
            <div className="text-2xl font-black text-slate-900">
              {actionCounts.png_descargadas_firmas} <span className="text-xs text-slate-400 font-normal">archivos</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Artes promocionales de Firmas ANF .p12</p>
          </div>
          <div className="p-3 bg-orange-50 text-orange-800 rounded-xl">
            <ImageIcon className="w-5 h-5" />
          </div>
        </div>

        {/* 7. Prompts Copiados (Arte Visual) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-indigo-300 transition-all flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
              Prompts Copiados (Arte Visual / IA)
            </span>
            <div className="text-2xl font-black text-slate-900">
              {actionCounts.prompts_copiados} <span className="text-xs text-slate-400 font-normal">copias</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Generación de imágenes con IA Prompts</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-800 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* 8. Propuestas Impresas (Pestaña Contador) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-rose-300 transition-all flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
              Propuestas Impresas (Contador)
            </span>
            <div className="text-2xl font-black text-slate-900">
              {actionCounts.propuestas_impresas_contador} <span className="text-xs text-slate-400 font-normal">impresiones</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Planes especiales para contadores externos</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-800 rounded-xl">
            <Calculator className="w-5 h-5" />
          </div>
        </div>

        {/* 9. Resúmenes de Comisión Impresos */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-emerald-300 transition-all flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
              Resúmenes de Comisión Impresos
            </span>
            <div className="text-2xl font-black text-slate-900">
              {actionCounts.resumen_comision_impreso} <span className="text-xs text-slate-400 font-normal">impresiones</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Cálculo e informe de comisiones de socios</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bar Chart by Action */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#0B2545]" />
              <h3 className="text-sm font-black text-slate-900">Distribución de Acciones por Categoría</h3>
            </div>
            <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              Total: {totalActionsCount} eventos
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDataByAction}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0B2545", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px", fontWeight: "bold" }}
                  itemStyle={{ color: "#fbbf24" }}
                />
                <Bar dataKey="cantidad" name="Cantidad" radius={[6, 6, 0, 0]}>
                  {chartDataByAction.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart by User */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-[#0B2545]" />
            <h3 className="text-sm font-black text-slate-900">Actividad por Administrador</h3>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            {chartDataByUser.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartDataByUser}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="acciones"
                  >
                    {chartDataByUser.map((entry, index) => (
                      <Cell key={`user-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0B2545", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px", fontWeight: "bold" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400 font-bold">Sin eventos registrados</div>
            )}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            {chartDataByUser.map((u, i) => (
              <div key={u.name} className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-700">{u.name}</span>
                </div>
                <span className="text-slate-900 font-black">{u.acciones} acciones</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DETAILED TELEMETRY EVENT LOGS TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#0B2545]" />
            <h3 className="text-sm font-black text-slate-900">Registro Cronológico de Eventos</h3>
          </div>
          <span className="text-xs font-bold text-slate-500">
            Mostrando {filteredEvents.length} registros
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Usuario Admin</th>
                <th className="py-3 px-4">Acción Medida</th>
                <th className="py-3 px-4">Detalle / Recurso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredEvents.length > 0 ? (
                filteredEvents.slice(0, 30).map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {new Date(evt.timestamp).toLocaleString("es-EC")}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-extrabold rounded-md text-[11px]">
                        {evt.user}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">
                        {evt.action === "fichas_impresas_sistema" && "🖨️ Ficha Impresa en Sistema"}
                        {evt.action === "argumentos_copiados_firma" && "📋 Argumento Copiado en Firma"}
                        {evt.action === "clics_navegador_explorador" && "🌐 Clic Navegador Explorador"}
                        {evt.action === "propuestas_descargadas_cotizador" && "📄 Propuesta Descargada (Cotizador)"}
                        {evt.action === "png_descargadas_sistema" && "🖼️ PNG Descargado (Sistema)"}
                        {evt.action === "png_descargadas_firmas" && "🖼️ PNG Descargado (Firmas)"}
                        {evt.action === "prompts_copiados" && "✨ Prompt Copiado (Arte Visual)"}
                        {evt.action === "propuestas_impresas_contador" && "🧮 Propuesta Impresa (Contador)"}
                        {evt.action === "resumen_comision_impreso" && "💵 Resumen Comisión Impreso"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      {evt.details || "Acción estándar de usuario"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 font-bold">
                    No existen eventos registrados para los filtros seleccionados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
