import React, { useState, useEffect } from "react";
import {
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  Trash2,
  Database,
  ArrowUpRight,
} from "lucide-react";
import {
  getPendingQueue,
  processPendingSyncQueue,
  syncAllFromRemote,
  savePendingQueue,
  PendingSyncItem,
} from "../utils/googleSheetsSync";

export function SyncMonitorCard() {
  const [pendingQueue, setPendingQueue] = useState<PendingSyncItem[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncMsg, setLastSyncMsg] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const refreshQueue = () => {
    setPendingQueue(getPendingQueue());
  };

  useEffect(() => {
    refreshQueue();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const interval = setInterval(() => {
      refreshQueue();
    }, 4000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleForceSync = async () => {
    setIsSyncing(true);
    setLastSyncMsg("Procesando la cola de sincronización...");
    try {
      await processPendingSyncQueue();
      await syncAllFromRemote();
      refreshQueue();
      const updatedQueue = getPendingQueue();
      if (updatedQueue.length === 0) {
        setLastSyncMsg("✅ ¡Sincronización completada con éxito! Todos los registros fueron enviados a Google Sheets.");
      } else {
        setLastSyncMsg(`⚠️ Se procesaron los registros. ${updatedQueue.length} elemento(s) reintentarán en la siguiente conexión.`);
      }
    } catch (err) {
      console.error("Error al forzar sincronización:", err);
      setLastSyncMsg("❌ Ocurrió un error al intentar la sincronización. Verifique la conexión.");
    } finally {
      setIsSyncing(false);
      setTimeout(() => setLastSyncMsg(null), 5000);
    }
  };

  const handleRemovePendingItem = (id: string) => {
    const queue = getPendingQueue().filter((item) => item.id !== id);
    savePendingQueue(queue);
    refreshQueue();
  };

  const getItemLabel = (item: PendingSyncItem) => {
    switch (item.type) {
      case "sync_socio":
        return {
          title: "Socio / Usuario Registrado",
          desc: item.payload.nombreApellido || item.payload.userCode || item.payload.email || "Datos de Socio",
          badge: "bg-blue-100 text-blue-800 border-blue-200",
        };
      case "delete_socio":
        return {
          title: "Eliminación de Socio",
          desc: item.payload.userCode || item.payload.email || "Código de Socio",
          badge: "bg-rose-100 text-rose-800 border-rose-200",
        };
      case "sync_venta":
        return {
          title: "Registro de Venta",
          desc: `Plan: ${item.payload.nombreProducto || "Venta"} - Cliente: ${item.payload.nombreCliente || "N/A"} ($${item.payload.totalVenta || 0})`,
          badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
        };
      case "delete_venta":
        return {
          title: "Eliminación de Venta",
          desc: `ID de Venta: ${item.payload.id || "N/A"}`,
          badge: "bg-amber-100 text-amber-800 border-amber-200",
        };
      default:
        return {
          title: "Operación de Datos",
          desc: "Objeto en cola",
          badge: "bg-slate-100 text-slate-800 border-slate-200",
        };
    }
  };

  const hasPending = pendingQueue.length > 0;

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 ${
      hasPending
        ? "bg-amber-50/70 border-amber-300 shadow-sm"
        : "bg-white border-slate-200/80 shadow-xs"
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Title & Status info */}
        <div className="flex items-start gap-3.5">
          <div className={`p-3 rounded-xl border flex-shrink-0 ${
            hasPending
              ? "bg-amber-500 text-white border-amber-600 animate-pulse"
              : isOnline
              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
              : "bg-rose-50 text-rose-600 border-rose-200"
          }`}>
            {hasPending ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : isOnline ? (
              <Cloud className="w-5 h-5" />
            ) : (
              <CloudOff className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-extrabold text-slate-900">
                Monitor de Sincronización en la Nube
              </h3>
              
              {/* Connection state pill */}
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                isOnline
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : "bg-rose-100 text-rose-800 border-rose-300"
              }`}>
                {isOnline ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                {isOnline ? "En Línea (Conectado)" : "Sin Conexión (Offline)"}
              </span>

              {/* Pending Queue count pill */}
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                hasPending
                  ? "bg-amber-200 text-amber-900 border-amber-400 font-black"
                  : "bg-slate-100 text-slate-700 border-slate-300"
              }`}>
                <Database className="w-3 h-3" />
                {hasPending ? `${pendingQueue.length} Pendiente(s) en localStorage` : "0 Pendientes (Sincronizado)"}
              </span>
            </div>

            <p className="text-xs text-slate-600 font-medium mt-1">
              {hasPending
                ? "Existen registros guardados localmente que aún no se han confirmado en Google Sheets. Se reintentarán automáticamente."
                : "Todos los usuarios, perfiles y ventas de la sesión están 100% sincronizados con la base de datos principal y Google Sheets."}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
          {hasPending && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <span>{isExpanded ? "Ocultar Detalles" : "Ver Detalle"}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            onClick={handleForceSync}
            disabled={isSyncing}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
              hasPending
                ? "bg-amber-600 hover:bg-amber-700 active:scale-95 text-white"
                : "bg-[#0B2545] hover:bg-[#133E72] active:scale-95 text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Sincronizando..." : "Forzar Sincronización Ahora"}</span>
          </button>
        </div>
      </div>

      {/* Sync Status Banner Message */}
      {lastSyncMsg && (
        <div className="mt-3 p-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white animate-fade-in flex items-center justify-between">
          <span>{lastSyncMsg}</span>
          <button onClick={() => setLastSyncMsg(null)} className="text-slate-400 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Expanded List of Pending Operations */}
      {hasPending && isExpanded && (
        <div className="mt-4 pt-4 border-t border-amber-200/80 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-700" />
              Cola de Operaciones Pendientes ({pendingQueue.length})
            </span>
            <span className="text-[11px] text-amber-800 font-medium">
              Sincronización automática activa
            </span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {pendingQueue.map((item) => {
              const info = getItemLabel(item);
              const dateStr = new Date(item.createdAt).toLocaleTimeString("es-EC", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              });

              return (
                <div
                  key={item.id}
                  className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border uppercase tracking-wider ${info.badge}`}>
                      {info.title}
                    </span>
                    <span className="font-bold text-slate-800 truncate">{info.desc}</span>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {dateStr}
                    </span>

                    <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md border border-slate-200">
                      {item.attempts} intento(s)
                    </span>

                    <button
                      onClick={() => handleRemovePendingItem(item.id)}
                      title="Descartar esta operación de la cola local"
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
