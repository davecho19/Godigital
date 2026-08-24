import { getPartnerCodeSlots } from "./partnerCodes";

export interface RegistrationValidationInput {
  nombre?: string;
  email: string;
  rucCedula: string;
  telefono: string;
  password: string;
}

export function getPasswordRequirements(password: string = "") {
  const trimmed = password.trim();
  return {
    hasMinLength: trimmed.length >= 6,
    hasUppercase: /[A-Z]/.test(trimmed),
    hasNumber: /[0-9]/.test(trimmed),
    hasSpecial: /[^a-zA-Z0-9]/.test(trimmed),
  };
}

export function validateRegistrationInput(data: RegistrationValidationInput): { valid: boolean; error?: string } {
  const nombre = (data.nombre || "").trim();
  const email = (data.email || "").trim();
  const rucCedula = (data.rucCedula || "").trim().replace(/\s+/g, "");
  const telefono = (data.telefono || "").trim().replace(/\s+/g, "");
  const password = data.password ? data.password.trim() : "";

  if (data.nombre !== undefined && (!nombre || nombre.length < 3)) {
    return { valid: false, error: "El Nombre y Apellido es obligatorio (mínimo 3 caracteres)." };
  }

  // 1. Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { valid: false, error: "El correo electrónico debe tener un formato válido (ejemplo: usuario@correo.com)." };
  }

  // 2. Cédula o RUC (mínimo 10, máximo 13 dígitos)
  const rucRegex = /^\d{10,13}$/;
  if (!rucCedula || !rucRegex.test(rucCedula)) {
    return { valid: false, error: "La Cédula o RUC debe tener entre 10 y 13 dígitos numéricos." };
  }

  // 3. Teléfono (exactamente 10 dígitos)
  const phoneRegex = /^\d{10}$/;
  if (!telefono || !phoneRegex.test(telefono)) {
    return { valid: false, error: "El teléfono es obligatorio y debe tener exactamente 10 dígitos numéricos (ej. 0991234567)." };
  }

  // 4. Contraseña (al menos 6 caracteres, 1 mayúscula, 1 número y 1 carácter especial)
  if (!password) {
    return { valid: false, error: "La contraseña es obligatoria." };
  }
  if (password.length < 6) {
    return { valid: false, error: "La contraseña debe tener al menos 6 caracteres." };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "La contraseña debe contener al menos 1 letra MAYÚSCULA (A-Z)." };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "La contraseña debe contener al menos 1 NÚMERO (0-9)." };
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    return { valid: false, error: "La contraseña debe contener al menos 1 CARÁCTER ESPECIAL (ej. '.', '-', '_', '#', '$')." };
  }

  return { valid: true };
}

export function checkDuplicateUser(
  email: string,
  rucCedula: string,
  excludeCodeOrId?: string
): { isDuplicate: boolean; field?: "email" | "rucCedula"; message?: string } {
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanRuc = (rucCedula || "").trim().replace(/\s+/g, "");
  const excludeKey = (excludeCodeOrId || "").trim().toLowerCase();

  if (!cleanEmail && !cleanRuc) return { isDuplicate: false };

  // 1. Check partner code slots
  try {
    const slots = getPartnerCodeSlots();
    for (const s of slots) {
      if (!s.used) continue;
      const sCode = (s.code || "").trim().toLowerCase();
      const sId = (s.id || "").trim().toLowerCase();
      const sEmail = (s.email || "").trim().toLowerCase();
      const sRuc = (s.rucCedula || "").trim().replace(/\s+/g, "");

      // Skip if checking the same slot
      if (excludeKey && (sCode === excludeKey || sId === excludeKey)) {
        continue;
      }

      if (cleanEmail && sEmail && sEmail === cleanEmail) {
        return {
          isDuplicate: true,
          field: "email",
          message: `El correo electrónico [${cleanEmail}] ya se encuentra registrado en la base de datos.`,
        };
      }

      if (cleanRuc && sRuc && sRuc === cleanRuc) {
        return {
          isDuplicate: true,
          field: "rucCedula",
          message: `La Cédula o RUC [${cleanRuc}] ya se encuentra registrada en la base de datos.`,
        };
      }
    }
  } catch (err) {}

  // 2. Check registered users list
  try {
    const rawUsers = localStorage.getItem("kpier_registered_users");
    if (rawUsers) {
      const usersList: any[] = JSON.parse(rawUsers);
      for (const u of usersList) {
        const uCode = (u.partnerCode || u.codigoSocio || u.id || "").trim().toLowerCase();
        if (excludeKey && uCode === excludeKey) continue;

        const uEmail = (u.email || "").trim().toLowerCase();
        const uRuc = (u.rucCedula || u.cedula || "").trim().replace(/\s+/g, "");

        if (cleanEmail && uEmail && uEmail === cleanEmail) {
          return {
            isDuplicate: true,
            field: "email",
            message: `El correo electrónico [${cleanEmail}] ya se encuentra registrado.`,
          };
        }

        if (cleanRuc && uRuc && uRuc === cleanRuc) {
          return {
            isDuplicate: true,
            field: "rucCedula",
            message: `La Cédula o RUC [${cleanRuc}] ya se encuentra registrada.`,
          };
        }
      }
    }
  } catch (err) {}

  return { isDuplicate: false };
}

