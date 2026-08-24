export interface SociosCountInfo {
  baseSocios: number;
  addedSociosCount: number;
  totalSocios: number;
}

export const SOCIOS_BASE_KEY = "kpier_news_socios_base";
export const SOCIOS_BASE_UPDATED_EVENT = "kpier_news_base_updated";
export const SOCIOS_UPDATED_EVENT = "kpier_socios_updated";

export function getSociosCountInfo(): SociosCountInfo {
  let baseSocios = 75;
  try {
    const local = localStorage.getItem(SOCIOS_BASE_KEY);
    if (local) {
      const parsed = parseInt(local, 10);
      if (!isNaN(parsed) && parsed >= 0) baseSocios = parsed;
    }
  } catch (e) {}

  let addedSociosCount = 0;
  try {
    const rawSocios = localStorage.getItem("kpier_socios_registrados");
    const rawUsers = localStorage.getItem("kpier_registered_users");
    const rawSlots = localStorage.getItem("kpier_partner_codes");

    const sociosArr = rawSocios ? JSON.parse(rawSocios) : [];
    const usersArr = rawUsers ? JSON.parse(rawUsers) : [];
    const slotsArr = rawSlots ? JSON.parse(rawSlots) : [];

    const uniqueKeys = new Set<string>();

    if (Array.isArray(sociosArr)) {
      sociosArr.forEach((s: any) => {
        const key = (s.id || s.email || s.rucCedula || s.nombreApellido || s.nombre || "").toLowerCase().trim();
        if (key) uniqueKeys.add(key);
      });
    }

    if (Array.isArray(usersArr)) {
      usersArr.forEach((u: any) => {
        const key = (u.id || u.email || u.rucCedula || u.nombre || "").toLowerCase().trim();
        if (key) uniqueKeys.add(key);
      });
    }

    if (Array.isArray(slotsArr)) {
      slotsArr.forEach((sl: any) => {
        if (sl && sl.used) {
          const key = (sl.code || sl.email || sl.rucCedula || sl.nombre || "").toLowerCase().trim();
          if (key) uniqueKeys.add(key);
        }
      });
    }

    addedSociosCount = uniqueKeys.size;
  } catch (err) {
    console.error("Error calculating socios count:", err);
  }

  return {
    baseSocios,
    addedSociosCount,
    totalSocios: baseSocios + addedSociosCount,
  };
}

export async function saveBaseSociosCount(newBase: number): Promise<void> {
  if (isNaN(newBase) || newBase < 0) return;
  try {
    localStorage.setItem(SOCIOS_BASE_KEY, newBase.toString());
    window.dispatchEvent(new Event(SOCIOS_BASE_UPDATED_EVENT));
    window.dispatchEvent(new Event(SOCIOS_UPDATED_EVENT));
  } catch (e) {}

  try {
    await fetch("/api/news/base-socios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ baseCount: newBase }),
    });
  } catch (err) {
    console.error("Error sending base count to server:", err);
  }
}
