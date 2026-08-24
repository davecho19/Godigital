export type TelemetryAction =
  | "fichas_impresas_sistema"
  | "argumentos_copiados_firma"
  | "clics_navegador_explorador"
  | "propuestas_descargadas_cotizador"
  | "png_descargadas_sistema"
  | "png_descargadas_firmas"
  | "prompts_copiados"
  | "propuestas_impresas_contador"
  | "resumen_comision_impreso";

export interface TelemetryEvent {
  id: string;
  user: string;
  action: TelemetryAction;
  timestamp: string; // ISO date string
  details?: string;
}

const LOCAL_STORAGE_KEY = "godi_telemetry_events";

// Initial seed data for demo so the telemetry dashboard shows historical activity
const INITIAL_SEED_EVENTS: TelemetryEvent[] = [
  // Admin events
  { id: "e1", user: "admin", action: "fichas_impresas_sistema", timestamp: "2026-08-03T10:15:00.000Z", details: "Ficha ERP Plus" },
  { id: "e2", user: "admin", action: "argumentos_copiados_firma", timestamp: "2026-08-03T10:20:00.000Z", details: "Persona Natural 3 Años" },
  { id: "e3", user: "admin", action: "clics_navegador_explorador", timestamp: "2026-08-03T11:00:00.000Z", details: "Navegador SRI" },
  { id: "e4", user: "admin", action: "propuestas_descargadas_cotizador", timestamp: "2026-08-03T11:30:00.000Z", details: "Cotización Up Power" },
  { id: "e5", user: "admin", action: "png_descargadas_sistema", timestamp: "2026-08-02T14:10:00.000Z", details: "Arte ERP Start" },
  { id: "e6", user: "admin", action: "png_descargadas_firmas", timestamp: "2026-08-02T15:20:00.000Z", details: "Firma Jurídica PNG" },
  { id: "e7", user: "admin", action: "prompts_copiados", timestamp: "2026-08-01T09:45:00.000Z", details: "Prompt Arte Comercial" },
  { id: "e8", user: "admin", action: "propuestas_impresas_contador", timestamp: "2026-08-01T16:00:00.000Z", details: "Plan Contador 6 Empresas" },
  { id: "e9", user: "admin", action: "resumen_comision_impreso", timestamp: "2026-07-31T17:30:00.000Z", details: "Comisiones Julio 2026" },

  // Admin1 events
  { id: "e10", user: "admin1", action: "fichas_impresas_sistema", timestamp: "2026-08-03T09:00:00.000Z", details: "Ficha Up Base" },
  { id: "e11", user: "admin1", action: "argumentos_copiados_firma", timestamp: "2026-08-03T10:05:00.000Z", details: "Persona Natural RUC" },
  { id: "e12", user: "admin1", action: "clics_navegador_explorador", timestamp: "2026-08-02T12:00:00.000Z", details: "Navegador UpConta" },
  { id: "e13", user: "admin1", action: "propuestas_descargadas_cotizador", timestamp: "2026-08-02T16:15:00.000Z", details: "Propuesta Cotizador" },
  { id: "e14", user: "admin1", action: "png_descargadas_sistema", timestamp: "2026-08-01T11:10:00.000Z", details: "Mockup Sistema" },
  { id: "e15", user: "admin1", action: "prompts_copiados", timestamp: "2026-07-30T10:00:00.000Z", details: "Prompt Copiado" },
  { id: "e16", user: "admin1", action: "propuestas_impresas_contador", timestamp: "2026-07-29T14:20:00.000Z", details: "Propuesta Contador" },

  // Admin2 events
  { id: "e17", user: "admin2", action: "fichas_impresas_sistema", timestamp: "2026-08-03T08:30:00.000Z", details: "Ficha Up Power" },
  { id: "e18", user: "admin2", action: "clics_navegador_explorador", timestamp: "2026-08-03T09:15:00.000Z", details: "Ir al Navegador" },
  { id: "e19", user: "admin2", action: "png_descargadas_firmas", timestamp: "2026-08-02T10:45:00.000Z", details: "Arte Firma Natural" },
  { id: "e20", user: "admin2", action: "prompts_copiados", timestamp: "2026-08-01T15:30:00.000Z", details: "Copiar Prompt IA" },
  { id: "e21", user: "admin2", action: "resumen_comision_impreso", timestamp: "2026-07-31T18:00:00.000Z", details: "Resumen Comisiones" },

  // Gerencia events
  { id: "e22", user: "gerencia", action: "fichas_impresas_sistema", timestamp: "2026-08-03T11:45:00.000Z", details: "Ficha Sistema ERP" },
  { id: "e23", user: "gerencia", action: "propuestas_descargadas_cotizador", timestamp: "2026-08-02T17:00:00.000Z", details: "Cotización Corporativa" },
];

export function getTelemetryEvents(): TelemetryEvent[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_SEED_EVENTS));
      return INITIAL_SEED_EVENTS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_SEED_EVENTS;
  }
}

export function trackActivity(action: TelemetryAction, details?: string) {
  try {
    const user = sessionStorage.getItem("godi_user") || "admin";
    const currentEvents = getTelemetryEvents();
    const newEvent: TelemetryEvent = {
      id: "evt_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      user,
      action,
      timestamp: new Date().toISOString(),
      details,
    };
    const updated = [newEvent, ...currentEvents];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("godi_telemetry_update"));
  } catch (err) {
    console.error("Error tracking telemetry activity:", err);
  }
}

export function filterTelemetryEvents(
  events: TelemetryEvent[],
  timeRange: "semana" | "rango" | "mes" | "total",
  startDate?: string,
  endDate?: string
): TelemetryEvent[] {
  const now = new Date();

  if (timeRange === "total") {
    return events;
  }

  if (timeRange === "semana") {
    // Current week (Monday to Sunday)
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    return events.filter((e) => {
      const d = new Date(e.timestamp);
      return d >= monday;
    });
  }

  if (timeRange === "mes") {
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    return events.filter((e) => {
      const d = new Date(e.timestamp);
      return d >= firstDayOfMonth;
    });
  }

  if (timeRange === "rango") {
    const start = startDate ? new Date(startDate + "T00:00:00") : new Date(0);
    const end = endDate ? new Date(endDate + "T23:59:59") : new Date();

    return events.filter((e) => {
      const d = new Date(e.timestamp);
      return d >= start && d <= end;
    });
  }

  return events;
}
