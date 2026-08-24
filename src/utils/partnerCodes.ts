import { syncSocioToGoogleSheets, getDeletedSocioKeys, removeDeletedSocioKey } from "./googleSheetsSync";
import { validateRegistrationInput, checkDuplicateUser } from "./validation";

export interface PartnerCodeSlot {
  id: string;
  code: string; // 10-character alphanumeric code e.g. "K9X2M4P7LQ"
  used: boolean;
  userId?: string;
  nombre?: string;
  usuario?: string;
  email?: string;
  rucCedula?: string;
  telefono?: string;
  password?: string;
  role: "admin1" | "admin2" | "admin" | "gerencia";
  fechaRegistro?: string;
  estado?: "Activo" | "Inactivo" | "Por Activar";
  registradoPor?: string;
  referidoPor?: string;
  banco?: string;
  tipoCuenta?: string;
  numeroCuenta?: string;
  titularCuenta?: string;
  cedulaTitular?: string;
}

const LOCAL_STORAGE_KEY = "kpier_partner_codes";
const REGISTERED_USERS_KEY = "kpier_registered_users";

// Helper to generate a 10-character uppercase alphanumeric random code
export function generate10CharAlphanumeric(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excludes easily confused O, 0, I, 1
  let code = "";
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const STATIC_50_CODES: string[] = [
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
];

// Generate an initial pool of 50 clean, available slots with fixed static 10-character codes
export function checkSocioDuplicate(input: {
  email?: string;
  rucCedula?: string;
  telefono?: string;
  usuario?: string;
  ignoreSlotId?: string;
}): { isDuplicate: boolean; matchedField?: string; socioName?: string; partnerCode?: string; message?: string } {
  const cleanEmail = (input.email || "").toLowerCase().trim();
  const cleanRuc = (input.rucCedula || "").replace(/\s+/g, "").trim();
  const cleanTel = (input.telefono || "").replace(/\s+/g, "").trim();
  const cleanUser = (input.usuario || "").toLowerCase().trim();

  if (!cleanEmail && !cleanRuc && !cleanTel && !cleanUser) {
    return { isDuplicate: false };
  }

  const slots = getPartnerCodeSlots();

  for (const s of slots) {
    if (!s.used) continue;
    if (input.ignoreSlotId && s.id === input.ignoreSlotId) continue;

    const sEmail = (s.email || "").toLowerCase().trim();
    const sRuc = (s.rucCedula || "").replace(/\s+/g, "").trim();
    const sTel = (s.telefono || "").replace(/\s+/g, "").trim();
    const sUser = (s.usuario || s.code || "").toLowerCase().trim();

    let matchedField = "";
    if (cleanEmail && sEmail && sEmail === cleanEmail) {
      matchedField = "Correo electrónico";
    } else if (cleanRuc && sRuc && sRuc === cleanRuc) {
      matchedField = "RUC / Cédula";
    } else if (cleanTel && sTel && (sTel === cleanTel || (cleanTel.length >= 7 && sTel.includes(cleanTel)))) {
      matchedField = "Teléfono";
    } else if (cleanUser && sUser && sUser === cleanUser) {
      matchedField = "Nombre de usuario";
    }

    if (matchedField) {
      const socioName = s.nombre || "Socio Registrado";
      const partnerCode = s.code || "N/A";
      return {
        isDuplicate: true,
        matchedField,
        socioName,
        partnerCode,
        message: `El ${matchedField} ingresado ya pertenece al socio "${socioName}" registrado con el código de socio [${partnerCode}].`,
      };
    }
  }

  return { isDuplicate: false };
}

export function generateInitial50Slots(): PartnerCodeSlot[] {
  const slots: PartnerCodeSlot[] = [];

  for (let i = 0; i < 50; i++) {
    const code = STATIC_50_CODES[i] || generate10CharAlphanumeric();
    // Empty code slot waiting for single-use registration
    slots.push({
      id: `slot-${i + 1}`,
      code,
      used: false,
      role: "admin1", // default role upon registration
    });
  }

  return slots;
}

// Helper to sanitize example demo names
function isDemoNameOrEmail(name?: string, email?: string): boolean {
  const n = (name || "").toLowerCase().trim();
  const e = (email || "").toLowerCase().trim();
  return (
    n.includes("carlos andrade") ||
    n.includes("sofía mendoza") ||
    n.includes("sofia mendoza") ||
    n.includes("roberto gómez") ||
    n.includes("roberto gomez") ||
    e.includes("carlos.andrade") ||
    e.includes("sofia.mendoza") ||
    e.includes("roberto.gomez") ||
    e.includes("candrade@upconta") ||
    e.includes("mendoza@upconta") ||
    e.includes("rgomez@upconta")
  );
}

// Get all 50 slots from localStorage or initialize with static fixed codes
export function getPartnerCodeSlots(): PartnerCodeSlot[] {
  let slots: PartnerCodeSlot[] = [];
  const deletedSet = new Set(getDeletedSocioKeys().map((k) => k.toLowerCase().trim()));

  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed: PartnerCodeSlot[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= 50) {
        // Enforce the static fixed codes and strip out old demo users or deleted users
        slots = parsed.slice(0, 50).map((slot, index) => {
          const targetCode = STATIC_50_CODES[index];
          const sCode = (slot.code || "").toLowerCase().trim();
          const sEmail = (slot.email || "").toLowerCase().trim();

          if (isDemoNameOrEmail(slot.nombre, slot.email) || deletedSet.has(sCode) || (sEmail && deletedSet.has(sEmail))) {
            // Reset deleted/demo slot to available
            return {
              id: slot.id || `slot-${index + 1}`,
              code: targetCode || slot.code,
              used: false,
              role: "admin1",
            };
          }
          if (targetCode && slot.code !== targetCode && !slot.used) {
            return { ...slot, code: targetCode };
          }
          return slot;
        });
      }
    }
  } catch (err) {
    console.error("Error cargando códigos de socios:", err);
  }

  if (slots.length < 50) {
    slots = generateInitial50Slots();
  }

  // Cross-sync: Ensure any real users registered in kpier_registered_users or kpier_socios_registrados are present in slots
  try {
    const rawUsers = localStorage.getItem(REGISTERED_USERS_KEY);
    const registeredUsers: any[] = rawUsers ? JSON.parse(rawUsers) : [];

    const rawSocios = localStorage.getItem("kpier_socios_registrados");
    const registeredSocios: any[] = rawSocios ? JSON.parse(rawSocios) : [];

    // Filter out demo/deleted users from registeredUsers & registeredSocios
    const cleanUsers = registeredUsers.filter((u) => {
      if (isDemoNameOrEmail(u.nombre, u.email)) return false;
      const code = (u.partnerCode || u.codigoSocio || u.userCode || u.codigoAsignado || u.code || "").toLowerCase().trim();
      const email = (u.email || "").toLowerCase().trim();
      if (code && deletedSet.has(code)) return false;
      if (email && deletedSet.has(email)) return false;
      return true;
    });

    const cleanSocios = registeredSocios.filter((s) => {
      if (isDemoNameOrEmail(s.nombreApellido || s.nombre, s.email)) return false;
      const code = (s.codigoSocio || s.partnerCode || s.userCode || s.codigoAsignado || s.code || "").toLowerCase().trim();
      const email = (s.email || "").toLowerCase().trim();
      if (code && deletedSet.has(code)) return false;
      if (email && deletedSet.has(email)) return false;
      return true;
    });

    if (cleanUsers.length !== registeredUsers.length) {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(cleanUsers));
    }
    if (cleanSocios.length !== registeredSocios.length) {
      localStorage.setItem("kpier_socios_registrados", JSON.stringify(cleanSocios));
    }

    // Combine users from both tables into a clean map by canonical key (prefer code if available, else email/RUC)
    const allUsersMap = new Map<string, any>();

    const getCanonicalKey = (item: any): string => {
      const code = (item.partnerCode || item.codigoSocio || item.userCode || item.codigoAsignado || item.code || "").toUpperCase().trim();
      const email = (item.email || "").toLowerCase().trim();
      const ruc = (item.rucCedula || item.cedula || "").trim();
      if (code) return `CODE:${code}`;
      if (email) return `EMAIL:${email}`;
      if (ruc) return `RUC:${ruc}`;
      return `NAME:${(item.nombre || item.nombreApellido || "").toLowerCase().trim()}`;
    };

    if (Array.isArray(cleanUsers)) {
      cleanUsers.forEach((u) => {
        if (u) {
          const key = getCanonicalKey(u);
          allUsersMap.set(key, {
            nombre: u.nombre || u.nombreApellido || "Socio Registrado",
            email: u.email || "",
            rucCedula: u.rucCedula || u.cedula || "",
            telefono: u.telefono || "",
            password: u.password || "",
            partnerCode: (u.partnerCode || u.codigoSocio || u.userCode || u.codigoAsignado || u.code || "").toUpperCase().trim(),
            role: u.role || "admin1",
            fechaRegistro: u.fechaRegistro || new Date().toISOString().split("T")[0],
            registradoPor: u.registradoPor || u.referidoPor || u.referidoPorAdmin || "",
            referidoPor: u.referidoPor || u.registradoPor || u.referidoPorAdmin || "",
            estado:
              u.estado === "Inactivo"
                ? "Inactivo"
                : u.estado === "Por Activar" || (u.estado as string) === "por_activar"
                ? "Por Activar"
                : u.estado || "Activo",
          });
        }
      });
    }

    if (Array.isArray(cleanSocios)) {
      cleanSocios.forEach((s) => {
        if (s) {
          const key = getCanonicalKey(s);
          const existing = allUsersMap.get(key) || {};
          allUsersMap.set(key, {
            nombre: s.nombreApellido || s.nombre || existing.nombre || "Socio Registrado",
            email: s.email || existing.email || "",
            rucCedula: s.rucCedula || s.cedula || existing.rucCedula || (s.cedulaTelefono ? s.cedulaTelefono.split("-")[0].trim() : ""),
            telefono: s.telefono || existing.telefono || (s.cedulaTelefono ? s.cedulaTelefono.split("-")[1]?.trim() || "" : ""),
            password: s.password || existing.password || "",
            partnerCode: (s.codigoSocio || s.partnerCode || s.userCode || s.codigoAsignado || s.code || existing.partnerCode || "").toUpperCase().trim(),
            role: s.role || existing.role || "admin1",
            fechaRegistro: s.fechaRegistro || existing.fechaRegistro || new Date().toISOString().split("T")[0],
            registradoPor: s.registradoPor || s.referidoPor || s.referidoPorAdmin || existing.registradoPor || "",
            referidoPor: s.referidoPor || s.registradoPor || s.referidoPorAdmin || existing.referidoPor || "",
            estado:
              s.estado === "Inactivo" || existing.estado === "Inactivo"
                ? "Inactivo"
                : s.estado === "Por Activar" || (s.estado as string) === "por_activar" || existing.estado === "Por Activar" || (existing.estado as string) === "por_activar"
                ? "Por Activar"
                : s.estado || existing.estado || "Activo",
          });
        }
      });
    }

    let modified = false;

    // Attach each registered user to AT MOST ONE partner code slot
    allUsersMap.forEach((user) => {
      const uEmail = (user.email || "").toLowerCase().trim();
      const uCode = (user.partnerCode || "").toUpperCase().trim();
      const uRuc = (user.rucCedula || "").trim();

      // Check if user is ALREADY attached to any slot in slots array
      let targetSlotIndex = -1;
      if (uCode) {
        targetSlotIndex = slots.findIndex((s) => (s.code || "").toUpperCase().trim() === uCode);
      }
      if (targetSlotIndex === -1 && uEmail) {
        targetSlotIndex = slots.findIndex((s) => s.used && (s.email || "").toLowerCase().trim() === uEmail);
      }
      if (targetSlotIndex === -1 && uRuc) {
        targetSlotIndex = slots.findIndex((s) => s.used && (s.rucCedula || "").trim() === uRuc);
      }

      if (targetSlotIndex !== -1) {
        // Update existing slot with full user data
        const current = slots[targetSlotIndex];
        const regVal = user.registradoPor || current.registradoPor || user.referidoPor || current.referidoPor || "Gerencia";
        
        let statusVal: "Activo" | "Inactivo" | "Por Activar" = "Activo";
        if (current.estado === "Inactivo" || user.estado === "Inactivo") {
          statusVal = "Inactivo";
        } else if (user.estado === "Por Activar" || (user.estado as string) === "por_activar" || current.estado === "Por Activar" || (current.estado as string) === "por_activar") {
          statusVal = "Por Activar";
        } else {
          statusVal = user.estado || current.estado || "Activo";
        }

        slots[targetSlotIndex] = {
          ...current,
          used: true,
          code: current.code || uCode,
          nombre: user.nombre || current.nombre,
          email: user.email || current.email,
          rucCedula: user.rucCedula || current.rucCedula,
          telefono: user.telefono || current.telefono,
          password: user.password || current.password || "",
          role: user.role || current.role || "admin1",
          fechaRegistro: user.fechaRegistro || current.fechaRegistro || new Date().toISOString().split("T")[0],
          estado: statusVal,
          registradoPor: regVal,
          referidoPor: regVal,
        };
        modified = true;
      } else {
        // Only assign to a free slot if this user is NOT already assigned anywhere
        const freeIndex = slots.findIndex((s) => !s.used);
        if (freeIndex !== -1) {
          const regVal = user.registradoPor || user.referidoPor || "Gerencia";
          let statusVal: "Activo" | "Inactivo" | "Por Activar" = "Activo";
          if (user.estado === "Inactivo") {
            statusVal = "Inactivo";
          } else if (user.estado === "Por Activar" || user.estado === "por_activar") {
            statusVal = "Por Activar";
          } else {
            statusVal = user.estado || slots[freeIndex].estado || "Activo";
          }

          slots[freeIndex] = {
            ...slots[freeIndex],
            used: true,
            code: uCode || slots[freeIndex].code,
            userId: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            nombre: user.nombre,
            email: user.email || `socio${freeIndex + 1}@upconta.ec`,
            rucCedula: user.rucCedula || "1700000000001",
            telefono: user.telefono || "0990000000",
            password: user.password || "",
            role: user.role || "admin1",
            fechaRegistro: user.fechaRegistro || new Date().toISOString().split("T")[0],
            estado: statusVal,
            registradoPor: regVal,
            referidoPor: regVal,
          };
          modified = true;
        }
      }
    });

    // Cleanup: Ensure duplicate used slots with identical code or email are reset
    const seenCodes = new Set<string>();
    const seenEmails = new Set<string>();
    slots.forEach((s, idx) => {
      if (!s.used) return;
      const sCode = (s.code || "").toUpperCase().trim();
      const sEmail = (s.email || "").toLowerCase().trim();

      if ((sCode && seenCodes.has(sCode)) || (sEmail && seenEmails.has(sEmail))) {
        // Duplicate slot! Reset to unused
        slots[idx] = {
          id: s.id || `slot-${idx + 1}`,
          code: STATIC_50_CODES[idx] || s.code,
          used: false,
          role: "admin1",
        };
        modified = true;
      } else {
        if (sCode) seenCodes.add(sCode);
        if (sEmail) seenEmails.add(sEmail);
      }
    });

    if (modified) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(slots));
    }
  } catch (syncErr) {
    console.error("Error sincronizando usuarios registrados con slots:", syncErr);
  }

  return slots;
}

// Save slots to localStorage and sync registered users list
export function savePartnerCodeSlots(slots: PartnerCodeSlot[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(slots));

    const deletedSet = new Set(getDeletedSocioKeys().map((k) => k.toLowerCase().trim()));
    const userMap = new Map<string, any>();
    const sociosArr: any[] = [];

    slots
      .filter((s) => s.used && s.nombre)
      .forEach((s) => {
        const sCode = (s.code || "").toLowerCase().trim();
        const sEmail = (s.email || "").toLowerCase().trim();
        if (deletedSet.has(sCode) || (sEmail && deletedSet.has(sEmail))) {
          return;
        }

        const regVal = s.registradoPor || s.referidoPor || "Gerencia";
        const key = (s.email || s.nombre!).toLowerCase().trim();
        const codeVal = (s.code || "").toUpperCase().trim();
        const mergedUser = {
          id: s.userId || s.id || `usr-${Date.now()}`,
          email: s.email || "",
          nombre: s.nombre!,
          rucCedula: s.rucCedula || "",
          telefono: s.telefono || "",
          password: s.password || "",
          partnerCode: codeVal,
          userCode: codeVal,
          codigoAsignado: codeVal,
          codigoSocio: codeVal,
          role: s.role,
          fechaRegistro: s.fechaRegistro || new Date().toISOString().split("T")[0],
          estado: s.estado || "Activo",
          registradoPor: regVal,
          referidoPor: regVal,
        };
        userMap.set(key, mergedUser);

        sociosArr.push({
          id: `s-${s.id}`,
          nombreApellido: s.nombre!,
          email: s.email || "",
          rucCedula: s.rucCedula || "",
          telefono: s.telefono || "",
          cedulaTelefono: `${s.rucCedula || ""} - ${s.telefono || ""}`,
          codigoSocio: codeVal,
          userCode: codeVal,
          codigoAsignado: codeVal,
          partnerCode: codeVal,
          code: codeVal,
          role: s.role,
          password: s.password || "",
          esMlm: true,
          esDistribuidorFirmas: true,
          fechaRegistro: s.fechaRegistro || new Date().toISOString().split("T")[0],
          estado: s.estado || "Activo",
          registradoPor: regVal,
          referidoPor: regVal,
        });
      });

    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(Array.from(userMap.values())));
    localStorage.setItem("kpier_socios_registrados", JSON.stringify(sociosArr));
    window.dispatchEvent(new Event("kpier_socios_updated"));
  } catch (err) {
    console.error("Error guardando códigos de socios:", err);
  }
}

// Validate and claim a partner code during registration
export function claimPartnerCode(
  inputCode: string,
  userData: {
    nombre: string;
    email: string;
    rucCedula: string;
    telefono: string;
    password: string;
  }
): { success: boolean; message: string; role?: string; slot?: PartnerCodeSlot } {
  const cleanCode = inputCode.trim().toUpperCase();

  if (!cleanCode) {
    return {
      success: false,
      message: "El Código de Socio es obligatorio.",
    };
  }

  // 1. Strict input validation
  const validation = validateRegistrationInput({
    nombre: userData.nombre,
    email: userData.email,
    rucCedula: userData.rucCedula,
    telefono: userData.telefono,
    password: userData.password,
  });

  if (!validation.valid) {
    return {
      success: false,
      message: validation.error || "Los datos de registro no son válidos.",
    };
  }

  // 2. Strict duplicate check (Email and Cédula/RUC)
  const dupCheck = checkDuplicateUser(userData.email, userData.rucCedula, cleanCode);
  if (dupCheck.isDuplicate) {
    return {
      success: false,
      message: dupCheck.message || "El correo electrónico o Cédula/RUC ya existe en el sistema.",
    };
  }

  // Clear from deleted keys if re-claiming
  removeDeletedSocioKey(cleanCode, userData.email);

  const slots = getPartnerCodeSlots();
  let slotIndex = slots.findIndex((s) => s.code.toUpperCase() === cleanCode);

  if (slotIndex !== -1) {
    const slot = slots[slotIndex];
    if (slot.used) {
      return {
        success: false,
        message: `El código [${cleanCode}] ya fue utilizado para el distribuidor/socio "${slot.nombre || "Registrado"}". Este código está bloqueado y es de un solo uso.`,
      };
    }

    const regVal = slot.registradoPor || slot.referidoPor || (userData as any).referidoPor || "Gerencia";

    // Claim / update slot
    const updatedSlot: PartnerCodeSlot = {
      ...slot,
      used: true,
      userId: slot.userId || `usr-${Date.now()}`,
      nombre: userData.nombre.trim(),
      email: userData.email.trim(),
      rucCedula: userData.rucCedula.trim(),
      telefono: userData.telefono.trim(),
      password: userData.password.trim(),
      role: slot.role || "admin1",
      fechaRegistro: slot.fechaRegistro || new Date().toISOString().split("T")[0],
      estado: "Activo",
      registradoPor: regVal,
      referidoPor: regVal,
    };

    slots[slotIndex] = updatedSlot;
    savePartnerCodeSlots(slots);

    return {
      success: true,
      message: "¡Código validado y registro completado con éxito!",
      role: updatedSlot.role,
      slot: updatedSlot,
    };
  } else {
    return {
      success: false,
      message: `El código de socio "${cleanCode}" no existe en el sistema. Debe ingresar un código de socio válido asignado desde el perfil Gerencial.`,
    };
  }
}


// Update access level for a partner slot manually by Gerencia
export function updateSlotRole(
  slotId: string,
  newRole: "admin1" | "admin2" | "admin" | "gerencia"
): PartnerCodeSlot[] {
  const slots = getPartnerCodeSlots();
  let targetSlot: PartnerCodeSlot | undefined;
  const updated = slots.map((s) => {
    if (s.id === slotId) {
      targetSlot = { ...s, role: newRole };
      return targetSlot;
    }
    return s;
  });
  savePartnerCodeSlots(updated);

  if (targetSlot) {
    const code = (targetSlot.code || "").toLowerCase().trim();
    const email = (targetSlot.email || "").toLowerCase().trim();
    const nombre = (targetSlot.nombre || "").toLowerCase().trim();

    // 1. Sync role update to kpier_registered_users
    try {
      const raw = localStorage.getItem("kpier_registered_users");
      if (raw) {
        const users: any[] = JSON.parse(raw);
        let changed = false;
        users.forEach((u) => {
          const uCode = (u.partnerCode || "").toLowerCase().trim();
          const uEmail = (u.email || "").toLowerCase().trim();
          const uName = (u.nombre || "").toLowerCase().trim();
          if ((code && uCode === code) || (email && uEmail === email) || (nombre && uName === nombre)) {
            u.role = newRole;
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem("kpier_registered_users", JSON.stringify(users));
        }
      }
    } catch (e) {}

    // 2. Sync role update to kpier_socios_registrados
    try {
      const raw = localStorage.getItem("kpier_socios_registrados");
      if (raw) {
        const socios: any[] = JSON.parse(raw);
        let changed = false;
        socios.forEach((soc) => {
          const sCode = (soc.codigoSocio || "").toLowerCase().trim();
          const sEmail = (soc.email || "").toLowerCase().trim();
          const sName = (soc.nombreApellido || soc.nombre || "").toLowerCase().trim();
          if ((code && sCode === code) || (email && sEmail === email) || (nombre && sName === nombre)) {
            soc.role = newRole;
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem("kpier_socios_registrados", JSON.stringify(socios));
        }
      }
    } catch (e) {}

    // 3. Sync updated role to Google Sheets and Server Store if socio is registered/used
    if (targetSlot.used && (targetSlot.nombre || targetSlot.email)) {
      const regVal = targetSlot.registradoPor || targetSlot.referidoPor || "Gerencia";
      syncSocioToGoogleSheets({
        fechaRegistro: targetSlot.fechaRegistro || new Date().toISOString().split("T")[0],
        userCode: targetSlot.code,
        nombreApellido: targetSlot.nombre || "",
        rucCedula: targetSlot.rucCedula || "",
        email: targetSlot.email || "",
        telefono: targetSlot.telefono || "",
        role: newRole,
        codigoAsignado: targetSlot.code,
        registradoPor: regVal,
        referidoPor: regVal,
        estado: targetSlot.estado || "Activo",
        password: targetSlot.password || "",
      });
    }

    window.dispatchEvent(new Event("kpier_socios_updated"));
  }

  return updated;
}

// Clear all socios cache and reset the 50 partner code slots to clean available state
export function clearAllSociosCache(): PartnerCodeSlot[] {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(REGISTERED_USERS_KEY);
    localStorage.removeItem("kpier_socios_registrados");
    localStorage.removeItem("kpier_deleted_socios");
    localStorage.removeItem("kpier_partner_code_slots");
  } catch (e) {
    console.error("Error clearing socios cache:", e);
  }

  // Trigger server store reset
  fetch("/api/sheets/reset-data", { method: "POST" }).catch(() => {});

  const freshSlots = generateInitial50Slots();
  savePartnerCodeSlots(freshSlots);
  window.dispatchEvent(new Event("kpier_socios_updated"));
  return freshSlots;
}
