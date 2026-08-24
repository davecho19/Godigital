import { getPartnerCodeSlots, savePartnerCodeSlots } from "./partnerCodes";
import { syncPermissionsFromRemote } from "./permissions";

export interface SocioSyncPayload {
  id?: string;
  fechaRegistro?: string;
  userCode?: string;
  nombreApellido?: string;
  nombre?: string;
  rucCedula?: string;
  email?: string;
  telefono?: string;
  password?: string;
  role?: string;
  usuario?: string;
  codigoAsignado?: string;
  registradoPor?: string;
  referidoPor?: string;
  referidoPorAdmin?: string;
  estado?: string;
  banco?: string;
  tipoCuenta?: string;
  numeroCuenta?: string;
  titularCuenta?: string;
  cedulaTitular?: string;
}

export function getRoleDisplayName(roleKey?: string): string {
  if (!roleKey) return "Administrativo";
  const key = roleKey.toLowerCase().trim();
  if (key === "gerencia" || key === "gerencia general") return "Gerencia";
  return "Administrativo";
}

export async function logUserAccess(data: {
  userCode?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  tipoAcceso?: string;
}) {
  try {
    const payload = {
      userCode: data.userCode || "",
      userName: data.userName || "Usuario",
      userEmail: data.userEmail || "",
      userRole: data.userRole || "admin1",
      tipoAcceso: data.tipoAcceso || "Ingreso Exitoso al Sistema",
      fechaHora: new Date().toLocaleString("es-EC", { timeZone: "America/Guayaquil" }),
      ipNavegador: typeof navigator !== "undefined" ? navigator.userAgent.substring(0, 100) : "Navegador Web",
    };
    await fetch("/api/sheets/accesos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("Error logging user access:", e);
  }
}

// Helpers for tracking deleted socios locally to prevent auto-restoration
export function getDeletedSocioKeys(): string[] {
  try {
    const raw = localStorage.getItem("kpier_deleted_socios");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function addDeletedSocioKey(userCode?: string, email?: string): void {
  try {
    const list = getDeletedSocioKeys();
    const set = new Set(list.map((k) => k.toLowerCase().trim()));
    if (userCode) set.add(userCode.toLowerCase().trim());
    if (email) set.add(email.toLowerCase().trim());
    localStorage.setItem("kpier_deleted_socios", JSON.stringify(Array.from(set)));
  } catch (e) {}
}

export function removeDeletedSocioKey(userCode?: string, email?: string): void {
  try {
    const list = getDeletedSocioKeys();
    const codeKey = (userCode || "").toLowerCase().trim();
    const emailKey = (email || "").toLowerCase().trim();
    const filtered = list.filter((k) => {
      const lower = k.toLowerCase().trim();
      if (codeKey && lower === codeKey) return false;
      if (emailKey && lower === emailKey) return false;
      return true;
    });
    localStorage.setItem("kpier_deleted_socios", JSON.stringify(filtered));
  } catch (e) {}
}

export interface VentaSyncPayload {
  id?: string;
  fecha?: string;
  fechaRegistro?: string;
  nombreCliente?: string;
  clienteNombre?: string;
  cedulaCliente?: string;
  cedula?: string;
  producto?: string;
  plan?: string;
  cantidad?: number;
  totalVenta?: number;
  vendedor?: string;
  socioNombre?: string;
  adminResponsable?: string;
  userEmail?: string;
  userCode?: string;
  userRole?: string;
  estadoComision?: string;
}

export const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyZBp1JIa0IHTRe6HfTNN7COlEW__KWGNr0nxSuTGbFPLSHHHtk9tgvKAUzvDzPCIFp/exec";

// Pending Sync Queue Interface
export interface PendingSyncItem {
  id: string;
  type: "sync_socio" | "delete_socio" | "sync_venta" | "delete_venta";
  payload: any;
  attempts: number;
  createdAt: number;
}

export function getPendingQueue(): PendingSyncItem[] {
  try {
    const raw = localStorage.getItem("kpier_pending_sync_queue");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function savePendingQueue(queue: PendingSyncItem[]): void {
  try {
    localStorage.setItem("kpier_pending_sync_queue", JSON.stringify(queue));
  } catch (e) {}
}

/**
 * Generates a simple, deterministic 32-bit FNV-1a hash checksum for any JavaScript data structure.
 */
export function calculateChecksum(data: any): string {
  if (data === null || data === undefined) return "chk-00000000";

  const normalize = (val: any): any => {
    if (Array.isArray(val)) {
      return val.map(normalize);
    } else if (val !== null && typeof val === "object") {
      const sortedKeys = Object.keys(val).sort();
      const obj: any = {};
      for (const k of sortedKeys) {
        if (k === "attempts" || k === "createdAt" || k === "_checksum") continue;
        obj[k] = normalize(val[k]);
      }
      return obj;
    }
    return val;
  };

  const normalizedStr = JSON.stringify(normalize(data));
  let hash = 0x811c9dc5;
  for (let i = 0; i < normalizedStr.length; i++) {
    hash ^= normalizedStr.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return `chk-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

/**
 * Compares local data checksums with remote Google Sheets data to detect mismatches
 * and verify data integrity upon reconnection.
 */
export async function compareDataChecksums(): Promise<{
  sociosMatch: boolean;
  ventasMatch: boolean;
  localSociosChecksum: string;
  remoteSociosChecksum: string;
  localVentasChecksum: string;
  remoteVentasChecksum: string;
}> {
  const localSocios = JSON.parse(localStorage.getItem("kpier_socios_registrados") || "[]");
  const localVentas = JSON.parse(localStorage.getItem("kpier_ventas_registradas") || "[]");

  const remoteSocios = await fetchSociosFromGoogleSheets();
  const remoteVentas = await fetchVentasFromGoogleSheets();

  const cleanSocios = (list: any[]) =>
    list
      .map((s) => ({
        code: (s.userCode || s.codigoAsignado || s.codigoSocio || s.code || "").toUpperCase().trim(),
        email: (s.email || "").toLowerCase().trim(),
        pass: s.password || "",
        estado: s.estado || "Activo",
      }))
      .sort((a, b) => a.code.localeCompare(b.code));

  const cleanVentas = (list: any[]) =>
    list
      .map((v) => ({
        id: String(v.id || `${v.fecha}-${v.nombreCliente}`),
        total: Number(v.totalVenta || 0),
        cliente: (v.nombreCliente || "").toLowerCase().trim(),
      }))
      .sort((a, b) => a.id.localeCompare(b.id));

  const localSociosChecksum = calculateChecksum(cleanSocios(localSocios));
  const remoteSociosChecksum = calculateChecksum(cleanSocios(remoteSocios));

  const localVentasChecksum = calculateChecksum(cleanVentas(localVentas));
  const remoteVentasChecksum = calculateChecksum(cleanVentas(remoteVentas));

  return {
    sociosMatch: localSociosChecksum === remoteSociosChecksum,
    ventasMatch: localVentasChecksum === remoteVentasChecksum,
    localSociosChecksum,
    remoteSociosChecksum,
    localVentasChecksum,
    remoteVentasChecksum,
  };
}

/**
 * Deduplicates the pending queue by comparing pending item checksums
 * against current remote data to avoid duplicate POSTs when restoring connection.
 */
export async function deduplicatePendingQueueWithChecksum(): Promise<{
  removedCount: number;
  remainingCount: number;
}> {
  const queue = getPendingQueue();
  if (queue.length === 0) return { removedCount: 0, remainingCount: 0 };

  let remoteSocios: any[] = [];
  let remoteVentas: any[] = [];

  try {
    remoteSocios = await fetchSociosFromGoogleSheets();
    remoteVentas = await fetchVentasFromGoogleSheets();
  } catch (e) {
    return { removedCount: 0, remainingCount: queue.length };
  }

  const remoteSocioKeys = new Set(
    remoteSocios.map((s: any) =>
      `${(s.userCode || s.codigoAsignado || s.codigoSocio || "").toUpperCase().trim()}:${(s.email || "").toLowerCase().trim()}:${s.password || ""}:${s.estado || "Activo"}`
    )
  );

  const remoteVentaKeys = new Set(
    remoteVentas.map((v: any) =>
      `${v.id || `${v.fecha}-${v.nombreCliente}`}:${v.totalVenta || 0}`
    )
  );

  let removedCount = 0;
  const filteredQueue: PendingSyncItem[] = [];

  for (const item of queue) {
    let isAlreadySynced = false;

    if (item.type === "sync_socio") {
      const code = (item.payload.userCode || item.payload.codigoAsignado || "").toUpperCase().trim();
      const email = (item.payload.email || "").toLowerCase().trim();
      const pass = item.payload.password || "";
      const estado = item.payload.estado || "Activo";
      const checksumKey = `${code}:${email}:${pass}:${estado}`;

      if (remoteSocioKeys.has(checksumKey)) {
        isAlreadySynced = true;
      }
    } else if (item.type === "sync_venta") {
      const vId = item.payload.id || `${item.payload.fecha}-${item.payload.nombreCliente}`;
      const vTotal = item.payload.totalVenta || 0;
      const checksumKey = `${vId}:${vTotal}`;

      if (remoteVentaKeys.has(checksumKey)) {
        isAlreadySynced = true;
      }
    }

    if (isAlreadySynced) {
      removedCount++;
    } else {
      filteredQueue.push(item);
    }
  }

  if (removedCount > 0) {
    savePendingQueue(filteredQueue);
  }

  return { removedCount, remainingCount: filteredQueue.length };
}

export function addToPendingQueue(type: PendingSyncItem["type"], payload: any): void {
  const queue = getPendingQueue();
  // Check if item with same ID/code already exists in queue to prevent duplicate entries
  const existingIdx = queue.findIndex((q) => {
    if (q.type !== type) return false;
    if (type === "sync_socio" || type === "delete_socio") {
      const qCode = (q.payload.userCode || q.payload.email || "").toLowerCase().trim();
      const pCode = (payload.userCode || payload.email || "").toLowerCase().trim();
      return qCode === pCode && qCode !== "";
    }
    if (type === "sync_venta" || type === "delete_venta") {
      return q.payload.id === payload.id && payload.id !== undefined;
    }
    return false;
  });

  const newItem: PendingSyncItem = {
    id: `queue-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    payload,
    attempts: 0,
    createdAt: Date.now(),
  };

  if (existingIdx >= 0) {
    queue[existingIdx] = newItem;
  } else {
    queue.push(newItem);
  }
  savePendingQueue(queue);
}

export async function processPendingSyncQueue(): Promise<void> {
  const queue = getPendingQueue();
  if (queue.length === 0) return;

  const remaining: PendingSyncItem[] = [];

  for (const item of queue) {
    try {
      let success = false;
      if (item.type === "sync_socio") {
        const res = await syncSocioToGoogleSheetsDirect(item.payload);
        success = res && res.success !== false;
      } else if (item.type === "delete_socio") {
        const res = await deleteSocioFromGoogleSheetsDirect(item.payload);
        success = res && res.success !== false;
      } else if (item.type === "sync_venta") {
        const res = await syncVentaToGoogleSheetsDirect(item.payload);
        success = res && res.success !== false;
      } else if (item.type === "delete_venta") {
        const res = await deleteVentaFromGoogleSheetsDirect(item.payload);
        success = res && res.success !== false;
      }

      if (!success) {
        item.attempts += 1;
        if (item.attempts < 10) {
          remaining.push(item);
        }
      }
    } catch (e) {
      item.attempts += 1;
      if (item.attempts < 10) {
        remaining.push(item);
      }
    }
  }

  savePendingQueue(remaining);
}

// Auto retry trigger setup
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    processPendingSyncQueue();
    syncAllFromRemote();
  });

  // Run periodic queue processor every 30 seconds
  setInterval(() => {
    processPendingSyncQueue();
  }, 30000);
}

// Helper fetch with exponential retry
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3, initialDelay = 800): Promise<any> {
  let attempt = 0;
  let lastError: any = null;

  while (attempt < maxRetries) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        const json = await response.json();
        return json;
      } else {
        lastError = new Error(`HTTP Error status ${response.status}`);
      }
    } catch (err) {
      lastError = err;
    }
    attempt++;
    if (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, initialDelay * Math.pow(2, attempt - 1)));
    }
  }
  throw lastError || new Error(`Failed to execute request to ${url}`);
}

async function syncSocioToGoogleSheetsDirect(socio: SocioSyncPayload) {
  const displayRole = getRoleDisplayName(socio.role);
  const regName =
    socio.registradoPor ||
    socio.referidoPor ||
    socio.referidoPorAdmin ||
    (socio.role === "Gerencia" || socio.role === "gerencia" ? "Gerencia" : "") ||
    "Gerencia";

  const userCodeVal = (socio.userCode || socio.codigoAsignado || "").toUpperCase().trim();

  const payload = {
    ...socio,
    userCode: userCodeVal,
    codigoAsignado: userCodeVal,
    role: displayRole,
    registradoPor: regName,
    referidoPor: regName,
  };

  return await fetchWithRetry("/api/sheets/socios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }, 3, 500);
}

export async function syncSocioToGoogleSheets(socio: SocioSyncPayload) {
  // Clean from deleted keys if re-registered
  removeDeletedSocioKey(socio.userCode || socio.codigoAsignado, socio.email);

  try {
    const result = await syncSocioToGoogleSheetsDirect(socio);
    return result;
  } catch (error) {
    console.warn("Sync socio failed after retries, queuing for background retry:", error);
    addToPendingQueue("sync_socio", socio);
    return { success: true, queued: true, message: "Operación guardada localmente y encolada para sincronización." };
  }
}

export async function resetAllSociosAndVentas() {
  try {
    // 1. Call server reset
    await fetch("/api/sheets/reset-data", { method: "POST" });
  } catch (e) {
    console.error("Error calling server reset-data:", e);
  }

  // 2. Clear client storage
  try {
    localStorage.removeItem("kpier_socios_registrados");
    localStorage.removeItem("kpier_registered_users");
    localStorage.removeItem("kpier_ventas_registradas");
    localStorage.removeItem("kpier_ventas_socios");
    localStorage.removeItem("kpier_registered_sales");
    localStorage.removeItem("kpier_ventas_historial");
    localStorage.removeItem("kpier_deleted_socios");
    localStorage.removeItem("kpier_redemptions");
    localStorage.removeItem("kpier_historial_canjes");
    localStorage.removeItem("kpier_redemption_requests");
    localStorage.removeItem("kpier_user_access_logs");
    localStorage.removeItem("kpier_pending_sync_queue");
    localStorage.removeItem("kpier_points_history");
    localStorage.removeItem("kpier_movement_history");
    localStorage.removeItem("kpier_event_registrations");
    localStorage.removeItem("kpier_partner_code_slots");

    // Reset partner slots to 50 empty unused slots
    const staticSlots = Array.from({ length: 50 }, (_, i) => ({
      id: `slot-${i + 1}`,
      code: [
        "UPC9X2M4PQ", "UPC3K8N7WY", "UPC7R4T2VH", "UPC5L9B8DX", "UPC2M6P4FZ",
        "UPC8V3N9KJ", "UPC4T7W2RH", "UPC6X5Y9ML", "UPC1B8K3NQ", "UPC9D4Z7PV",
        "UPC3H2F8WS", "UPC7K6R4TC", "UPC5P9N2XB", "UPC2Y4M8QJ", "UPC8W7V3KD",
        "UPC4Z2L9FN", "UPC6R8T5HP", "UPC1X3M7WC", "UPC9N5K2YB", "UPC3P8D4QF",
        "UPC7V2W9TH", "UPC5M6R3KZ", "UPC2K8N4XJ", "UPC8F7P2WD", "UPC4Y9T5MC",
        "UPC6B3Z8QH", "UPC1N7K4VP", "UPC9R2M8FW", "UPC3X5T9LD", "UPC7P4K2ZJ",
        "UPC5W8N3YC", "UPC2D6R9HT", "UPC8M4P7FQ", "UPC4K2Z8VW", "UPC6T9N3XJ",
        "UPC1P5R8YD", "UPC9W3K7FC", "UPC3Z8M2TH", "UPC7N4V9QJ", "UPC5R6K3WD",
        "UPC2X9P4ZC", "UPC8T2N7MH", "UPC4M8K3FW", "UPC6W5R9VD", "UPC1Y7P2XQ",
        "UPC9K4Z8TH", "UPC3T6N2WC", "UPC7M9R5FJ", "UPC5P2K8YD", "UPC8Z4W7VQ"
      ][i],
      used: false,
      role: "admin1",
    }));

    localStorage.setItem("kpier_partner_codes", JSON.stringify(staticSlots));
    window.dispatchEvent(new Event("kpier_socios_updated"));
    window.dispatchEvent(new Event("kpier_ventas_updated"));
  } catch (err) {
    console.error("Error clearing local storage socios and sales:", err);
  }
}

async function deleteSocioFromGoogleSheetsDirect(data: { userCode?: string; email?: string; rucCedula?: string }) {
  return await fetchWithRetry("/api/sheets/socios/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }, 3, 500);
}

export async function deleteSocioFromGoogleSheets(data: { userCode?: string; email?: string; rucCedula?: string }) {
  // Track deleted key locally so syncAllFromRemote ignores it
  addDeletedSocioKey(data.userCode, data.email);
  if (data.rucCedula) addDeletedSocioKey(data.rucCedula, undefined);

  try {
    const result = await deleteSocioFromGoogleSheetsDirect(data);
    return result;
  } catch (error) {
    console.warn("Delete socio failed after retries, queuing for background retry:", error);
    addToPendingQueue("delete_socio", data);
    return { success: true, queued: true, message: "Eliminación registrada localmente y encolada para sincronización." };
  }
}

export async function fetchSociosFromGoogleSheets() {
  try {
    const json = await fetchWithRetry("/api/sheets/socios", { method: "GET" }, 2, 500);
    const rawList: any[] = json?.data || [];

    const deletedSet = new Set(getDeletedSocioKeys().map((k) => k.toLowerCase().trim()));
    if (deletedSet.size === 0) return rawList;

    return rawList.filter((s) => {
      const code = (s.userCode || s.codigoAsignado || s.partnerCode || s.code || "").toLowerCase().trim();
      const email = (s.email || "").toLowerCase().trim();
      if (code && deletedSet.has(code)) return false;
      if (email && deletedSet.has(email)) return false;
      return true;
    });
  } catch (error) {
    console.warn("Could not fetch socios from Google Sheets API, using cached data:", error);
    return [];
  }
}

async function deleteVentaFromGoogleSheetsDirect(data: { id: string }) {
  return await fetchWithRetry("/api/sheets/ventas/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }, 3, 500);
}

export async function deleteVentaFromGoogleSheets(id: string) {
  try {
    const result = await deleteVentaFromGoogleSheetsDirect({ id });
    return result;
  } catch (error) {
    console.warn("Delete venta failed after retries, queuing for background retry:", error);
    addToPendingQueue("delete_venta", { id });
    return { success: true, queued: true, message: "Eliminación de venta encolada para sincronización." };
  }
}

async function syncVentaToGoogleSheetsDirect(venta: VentaSyncPayload) {
  return await fetchWithRetry("/api/sheets/ventas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(venta),
  }, 3, 500);
}

export async function syncVentaToGoogleSheets(venta: VentaSyncPayload) {
  try {
    const result = await syncVentaToGoogleSheetsDirect(venta);
    return result;
  } catch (error) {
    console.warn("Sync venta failed after retries, queuing for background retry:", error);
    addToPendingQueue("sync_venta", venta);
    return { success: true, queued: true, message: "Venta guardada localmente y encolada para sincronización." };
  }
}

export async function fetchVentasFromGoogleSheets() {
  try {
    const json = await fetchWithRetry("/api/sheets/ventas", { method: "GET" }, 2, 500);
    return json?.data || [];
  } catch (error) {
    console.warn("Could not fetch ventas from Google Sheets API, using cached data:", error);
    return [];
  }
}

export async function getSheetsConfig() {
  try {
    const response = await fetch("/api/sheets/config");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    return { spreadsheetId: "1XBKHujGg75HfmCxNpLJwiLOaVhOVOMueEHm0BnhxbB0", hasAuth: false };
  }
}

export async function syncAllFromRemote() {
  try {
    const remoteSocios = await fetchSociosFromGoogleSheets();
    const deletedSet = new Set(getDeletedSocioKeys().map((k) => k.toLowerCase().trim()));

    if (Array.isArray(remoteSocios) && remoteSocios.length > 0) {
      const existingSociosStr = localStorage.getItem("kpier_socios_registrados");
      const existingSocios: any[] = existingSociosStr ? JSON.parse(existingSociosStr) : [];

      const socioMap = new Map<string, any>();
      existingSocios.forEach((s) => {
        const key = (s.userCode || s.codigoSocio || s.codigoAsignado || s.email || s.id || "").toLowerCase().trim();
        if (key && !deletedSet.has(key)) socioMap.set(key, s);
      });

      let changed = false;
      remoteSocios.forEach((rs) => {
        const rsCode = (rs.userCode || rs.codigoAsignado || rs.codigoSocio || "").toLowerCase().trim();
        const rsEmail = (rs.email || "").toLowerCase().trim();
        if ((rsCode && deletedSet.has(rsCode)) || (rsEmail && deletedSet.has(rsEmail))) {
          return;
        }

        const key = (rs.userCode || rs.codigoAsignado || rs.email || rs.id || "").toLowerCase().trim();
        if (key) {
          const existing = socioMap.get(key);
          if (!existing || existing.password !== rs.password || existing.estado !== rs.estado) {
            socioMap.set(key, { ...existing, ...rs });
            changed = true;
          }
        }
      });

      if (changed) {
        const updatedList = Array.from(socioMap.values());
        localStorage.setItem("kpier_socios_registrados", JSON.stringify(updatedList));
        window.dispatchEvent(new Event("kpier_socios_updated"));
      }

      // Sync into 50 partner code slots
      let slotsStr = localStorage.getItem("kpier_partner_codes");
      if (!slotsStr) {
        getPartnerCodeSlots();
        slotsStr = localStorage.getItem("kpier_partner_codes");
      }
      if (slotsStr) {
        try {
          const slots: any[] = JSON.parse(slotsStr);
          let slotsChanged = false;
          remoteSocios.forEach((rs) => {
            const rsCode = (rs.userCode || rs.codigoAsignado || rs.codigoSocio || rs.code || "").toUpperCase().trim();
            const rsEmail = (rs.email || "").toLowerCase().trim();
            if (!rsCode && !rsEmail) return;
            if ((rsCode && deletedSet.has(rsCode.toLowerCase())) || (rsEmail && deletedSet.has(rsEmail))) {
              return;
            }

            const slotIdx = slots.findIndex(
              (sl) => (rsCode && sl.code.toUpperCase() === rsCode) || (rsEmail && sl.email?.toLowerCase() === rsEmail)
            );
            if (slotIdx >= 0) {
              const currentSlot = slots[slotIdx];
              const newPass = rs.password || currentSlot.password || "";
              const newName = rs.nombreApellido || rs.nombre || currentSlot.nombre;
              if (
                !currentSlot.used ||
                currentSlot.nombre !== newName ||
                currentSlot.password !== newPass ||
                currentSlot.estado !== (rs.estado || "Activo")
              ) {
                slots[slotIdx] = {
                  ...currentSlot,
                  used: true,
                  nombre: newName,
                  email: rs.email || currentSlot.email,
                  rucCedula: rs.rucCedula || currentSlot.rucCedula,
                  telefono: rs.telefono || currentSlot.telefono,
                  role: rs.role || currentSlot.role || "admin1",
                  password: newPass,
                  fechaRegistro: rs.fechaRegistro || currentSlot.fechaRegistro,
                  estado: rs.estado || currentSlot.estado || "Activo",
                  registradoPor: rs.registradoPor || currentSlot.registradoPor || "Gerencia",
                  referidoPor: rs.referidoPor || currentSlot.referidoPor || "Gerencia",
                };
                slotsChanged = true;
              }
            } else {
              // Find first unused slot to assign
              const freeIdx = slots.findIndex((sl) => !sl.used);
              if (freeIdx >= 0) {
                const newName = rs.nombreApellido || rs.nombre || "Socio Registrado";
                const newPass = rs.password || "";
                slots[freeIdx] = {
                  ...slots[freeIdx],
                  used: true,
                  code: rsCode || slots[freeIdx].code,
                  userId: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                  nombre: newName,
                  email: rs.email || `socio${freeIdx + 1}@upconta.ec`,
                  rucCedula: rs.rucCedula || "",
                  telefono: rs.telefono || "",
                  role: rs.role || "admin1",
                  password: newPass,
                  fechaRegistro: rs.fechaRegistro || new Date().toISOString().split("T")[0],
                  estado: rs.estado || "Activo",
                  registradoPor: rs.registradoPor || "Gerencia",
                  referidoPor: rs.referidoPor || "Gerencia",
                };
                slotsChanged = true;
              }
            }
          });
          if (slotsChanged) {
            savePartnerCodeSlots(slots);
          }
        } catch (e) {
          console.error("Error updating partner slots:", e);
        }
      }

      // Also sync into kpier_registered_users
      try {
        const regUsersStr = localStorage.getItem("kpier_registered_users");
        const regUsersList: any[] = regUsersStr ? JSON.parse(regUsersStr) : [];
        const regUserMap = new Map<string, any>();
        regUsersList.forEach((u) => {
          const key = (u.partnerCode || u.email || "").toLowerCase().trim();
          if (key && !deletedSet.has(key)) regUserMap.set(key, u);
        });

        let regChanged = false;
        remoteSocios.forEach((rs) => {
          const rsCode = (rs.userCode || rs.codigoAsignado || rs.codigoSocio || "").toUpperCase().trim();
          const rsEmail = (rs.email || "").toLowerCase().trim();
          if (!rsCode && !rsEmail) return;
          if ((rsCode && deletedSet.has(rsCode.toLowerCase())) || (rsEmail && deletedSet.has(rsEmail))) return;

          const key = (rsCode || rsEmail).toLowerCase();
          const existing = regUserMap.get(key);
          const newPass = rs.password || existing?.password || "";

          if (!existing || existing.password !== newPass || existing.estado !== (rs.estado || "Activo")) {
            let roleKey = "admin1";
            const r = (rs.role || "").toLowerCase().trim();
            if (r.includes("gerencia")) roleKey = "gerencia";
            else if (r.includes("administrador") || r === "admin" || r.includes("admin3")) roleKey = "admin";
            else if (r.includes("supervisor") || r === "admin2") roleKey = "admin2";
            else roleKey = "admin1";

            regUserMap.set(key, {
              id: existing?.id || `usr-${Date.now()}`,
              email: rs.email || existing?.email || "",
              nombre: rs.nombreApellido || rs.nombre || existing?.nombre || "",
              rucCedula: rs.rucCedula || existing?.rucCedula || "",
              telefono: rs.telefono || existing?.telefono || "",
              password: newPass,
              partnerCode: rsCode || existing?.partnerCode || "",
              role: roleKey,
              fechaRegistro: rs.fechaRegistro || existing?.fechaRegistro || new Date().toISOString().split("T")[0],
              estado: rs.estado || existing?.estado || "Activo",
            });
            regChanged = true;
          }
        });

        if (regChanged) {
          localStorage.setItem("kpier_registered_users", JSON.stringify(Array.from(regUserMap.values())));
        }
      } catch (e) {
        console.error("Error updating kpier_registered_users:", e);
      }
    }

    const remoteVentas = await fetchVentasFromGoogleSheets();
    if (Array.isArray(remoteVentas) && remoteVentas.length > 0) {
      const existingVentasStr = localStorage.getItem("kpier_ventas_registradas");
      const existingVentas: any[] = existingVentasStr ? JSON.parse(existingVentasStr) : [];

      const ventasMap = new Map<string, any>();
      existingVentas.forEach((v) => {
        const key = (v.id || `${v.fecha}-${v.nombreCliente}`).toLowerCase().trim();
        if (key) ventasMap.set(key, v);
      });

      let vChanged = false;
      remoteVentas.forEach((rv) => {
        const key = (rv.id || `${rv.fecha}-${rv.nombreCliente}`).toLowerCase().trim();
        if (key && !ventasMap.has(key)) {
          ventasMap.set(key, rv);
          vChanged = true;
        }
      });

      if (vChanged) {
        const updatedVentas = Array.from(ventasMap.values());
        localStorage.setItem("kpier_ventas_registradas", JSON.stringify(updatedVentas));
        window.dispatchEvent(new Event("kpier_ventas_updated"));
      }
    }

    // Sync permissions matrix across browsers
    await syncPermissionsFromRemote();
  } catch (err) {
    console.error("Error in syncAllFromRemote:", err);
  }
}

export async function checkDuplicateInGoogleSheets(payload: {
  target: "USUARIOS" | "SOCIOS";
  cedula?: string;
  telefono?: string;
  email?: string;
  usuario?: string;
  excludeCode?: string;
  excludeEmail?: string;
}): Promise<{ isDuplicate: boolean; field?: string; value?: string; sheet?: string; message?: string }> {
  try {
    const res = await fetch("/api/sheets/check-duplicate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json.isDuplicate) {
      return json;
    }
  } catch (e) {
    console.warn("Backend duplicate check failed, falling back to client-side check:", e);
  }

  // Client-side fallback duplicate check
  const cleanRuc = (payload.cedula || "").replace(/\s+/g, "").toLowerCase().trim();
  const cleanTel = (payload.telefono || "").replace(/\s+/g, "").toLowerCase().trim();
  const cleanEmail = (payload.email || "").toLowerCase().trim();
  const cleanUser = (payload.usuario || "").toLowerCase().trim();
  const cleanExCode = (payload.excludeCode || "").toLowerCase().trim();
  const cleanExEmail = (payload.excludeEmail || "").toLowerCase().trim();

  if (payload.target === "USUARIOS") {
    try {
      const regUsersRaw = localStorage.getItem("kpier_registered_users");
      const regUsers: any[] = regUsersRaw ? JSON.parse(regUsersRaw) : [];
      for (const u of regUsers) {
        const uEmail = (u.email || "").toLowerCase().trim();
        const uTel = (u.telefono || "").replace(/\s+/g, "").toLowerCase().trim();
        const uUser = (u.usuario || u.nombreUsuario || u.partnerCode || "").toLowerCase().trim();
        const uRuc = (u.rucCedula || "").replace(/\s+/g, "").toLowerCase().trim();
        const uCode = (u.partnerCode || u.idSocio || "").toLowerCase().trim();

        if (cleanExCode && (uCode === cleanExCode || uUser === cleanExCode)) continue;
        if (cleanExEmail && uEmail === cleanExEmail) continue;

        if (cleanEmail && uEmail && uEmail === cleanEmail) {
          return { isDuplicate: true, field: "Correo electrónico", value: uEmail, sheet: "USUARIOS", message: `Ya existe un usuario con el correo "${uEmail}" en la pestaña USUARIOS de Google Sheets.` };
        }
        if (cleanTel && uTel && uTel === cleanTel) {
          return { isDuplicate: true, field: "Teléfono", value: uTel, sheet: "USUARIOS", message: `Ya existe un usuario con el teléfono "${uTel}" en la pestaña USUARIOS de Google Sheets.` };
        }
        if (cleanUser && uUser && uUser === cleanUser) {
          return { isDuplicate: true, field: "Nombre de usuario", value: uUser, sheet: "USUARIOS", message: `Ya existe un usuario con el nombre de usuario "${uUser}" en la pestaña USUARIOS de Google Sheets.` };
        }
        if (cleanRuc && uRuc && uRuc === cleanRuc) {
          return { isDuplicate: true, field: "Cédula / RUC", value: uRuc, sheet: "USUARIOS", message: `Ya existe un usuario con la Cédula/RUC "${uRuc}" en la pestaña USUARIOS de Google Sheets.` };
        }
      }
    } catch (e) {}
  } else if (payload.target === "SOCIOS") {
    try {
      const sociosRaw = localStorage.getItem("kpier_socios_registrados");
      const socios: any[] = sociosRaw ? JSON.parse(sociosRaw) : [];
      for (const s of socios) {
        const sEmail = (s.email || "").toLowerCase().trim();
        const sTel = (s.telefono || "").replace(/\s+/g, "").toLowerCase().trim();
        const sRuc = (s.rucCedula || s.cedulaRuc || "").replace(/\s+/g, "").toLowerCase().trim();
        const sUser = (s.usuario || s.userCode || s.codigoSocio || "").toLowerCase().trim();
        const sCode = (s.userCode || s.codigoAsignado || s.partnerCode || "").toLowerCase().trim();

        if (cleanExCode && sCode === cleanExCode) continue;
        if (cleanExEmail && sEmail === cleanExEmail) continue;

        if (cleanEmail && sEmail && sEmail === cleanEmail) {
          return { isDuplicate: true, field: "Correo electrónico", value: sEmail, sheet: "SOCIOS", message: `Ya existe un socio con el correo "${sEmail}" en la pestaña SOCIOS de Google Sheets.` };
        }
        if (cleanTel && sTel && sTel === cleanTel) {
          return { isDuplicate: true, field: "Teléfono", value: sTel, sheet: "SOCIOS", message: `Ya existe un socio con el teléfono "${sTel}" en la pestaña SOCIOS de Google Sheets.` };
        }
        if (cleanRuc && sRuc && sRuc === cleanRuc) {
          return { isDuplicate: true, field: "Cédula / RUC", value: sRuc, sheet: "SOCIOS", message: `Ya existe un socio con la Cédula/RUC "${sRuc}" en la pestaña SOCIOS de Google Sheets.` };
        }
        if (cleanUser && sUser && sUser === cleanUser) {
          return { isDuplicate: true, field: "Nombre de usuario", value: cleanUser, sheet: "SOCIOS", message: `Ya existe un socio con el usuario/código "${cleanUser}" en la pestaña SOCIOS de Google Sheets.` };
        }
      }
    } catch (e) {}
  }

  return { isDuplicate: false };
}

export async function syncUserDirectToSheets(userPayload: any) {
  try {
    const res = await fetch("/api/sheets/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userPayload),
    });
    return await res.json();
  } catch (e: any) {
    console.error("Error in syncUserDirectToSheets:", e);
    return { success: false, message: e.message };
  }
}


