export interface RewardItem {
  id: string;
  title: string;
  category: "Firmas" | "Planes ERP" | "Herramientas" | "Descuentos" | "Capacitaciones & Bonos" | string;
  pointsCost: number;
  description: string;
  icon?: string;
  badge?: string;
  activo?: boolean;
  vigencia?: string;
  esPromocion?: boolean;
}

export const REWARDS_STORAGE_KEY = "kpier_rewards_catalog";
export const REWARDS_UPDATED_EVENT = "kpier_rewards_updated";
export const POINTS_UPDATED_EVENT = "kpier_points_updated";

export const DEFAULT_REWARDS_CATALOG: RewardItem[] = [
  {
    id: "rw-1",
    title: "Firma Electrónica Persona Natural 1 Año (.p12)",
    category: "Firmas",
    pointsCost: 120,
    description: "",
    icon: "ShieldCheck",
    badge: "Más Popular",
    activo: true,
    esPromocion: true,
    vigencia: "Válido hasta el 31/12/2026",
  },
  {
    id: "rw-2",
    title: "Firma Electrónica Representante Legal 2 Años",
    category: "Firmas",
    pointsCost: 250,
    description: "",
    icon: "Award",
    badge: "Jurídico",
    activo: true,
    esPromocion: true,
  },
  {
    id: "rw-3",
    title: "Licencia Extra UpConta ERP (1 Mes Gratis)",
    category: "Planes ERP",
    pointsCost: 180,
    description: "",
    icon: "Building2",
    badge: "Alta demanda",
    activo: true,
    esPromocion: true,
    vigencia: "Promoción de Verano 2026",
  },
  {
    id: "rw-4",
    title: "Módulo Adicional Facturación Ilimitada (6 Meses)",
    category: "Herramientas",
    pointsCost: 350,
    description: "",
    icon: "Zap",
    activo: true,
    esPromocion: false,
  },
  {
    id: "rw-5",
    title: "Bono Descuento de $50 USD en Siguiente Renovación",
    category: "Descuentos",
    pointsCost: 400,
    description: "",
    icon: "Coins",
    badge: "VIP Gold",
    activo: true,
    esPromocion: false,
  },
  {
    id: "rw-6",
    title: "Pack Capacitación VIP SRI y Contabilidad en la Nube",
    category: "Capacitaciones & Bonos",
    pointsCost: 200,
    description: "",
    icon: "Users",
    badge: "Bono Especial",
    activo: true,
    esPromocion: true,
  },
];

export function getStoredRewardsCatalog(): RewardItem[] {
  if (typeof window === "undefined") return DEFAULT_REWARDS_CATALOG;
  try {
    const saved = localStorage.getItem(REWARDS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading rewards catalog from localStorage", e);
  }
  return DEFAULT_REWARDS_CATALOG;
}

export function saveRewardsCatalog(items: RewardItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(REWARDS_UPDATED_EVENT, { detail: items }));
    window.dispatchEvent(new CustomEvent(POINTS_UPDATED_EVENT));
  } catch (e) {
    console.error("Error saving rewards catalog to localStorage", e);
  }
}

export function notifyPointsUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(POINTS_UPDATED_EVENT));
  window.dispatchEvent(new Event("storage"));
}

// Calculate total points balance for the active partner session
export function calculateActiveSocioPoints(): number {
  if (typeof window === "undefined") return 0;
  try {
    const userRole = sessionStorage.getItem("godi_user") || "";
    const isGerencia = userRole === "gerencia";

    const sCode = (sessionStorage.getItem("godi_user_code") || "").toUpperCase().trim();
    const sEmail = (sessionStorage.getItem("godi_user_email") || "").toLowerCase().trim();
    const sName = (sessionStorage.getItem("godi_user_name") || sessionStorage.getItem("godi_user") || "").toLowerCase().trim();

    // 1. Sales points
    let sales: any[] = [];
    const rawSales = localStorage.getItem("kpier_ventas_registradas");
    if (rawSales) {
      sales = JSON.parse(rawSales);
    }

    const mySales = isGerencia
      ? sales
      : sales.filter((v: any) => {
          const vName = (v.vendedor || v.socioNombre || v.adminResponsable || "").toLowerCase().trim();
          const vCode = (v.userCode || "").toUpperCase().trim();
          const vEmail = (v.userEmail || "").toLowerCase().trim();

          if (sCode && vCode && vCode === sCode) return true;
          if (sEmail && vEmail && vEmail === sEmail) return true;
          if (sName && sName !== "socio registrado" && vName && (vName.includes(sName) || sName.includes(vName))) return true;
          // Fallback if registered without explicit code
          if (!vCode && !vEmail && vName && sName && (vName === sName || vName === "socio registrado")) return true;
          return false;
        });

    let salesPoints = mySales.reduce((sum: number, v: any) => {
      const qty = typeof v.cantidad === "number" && v.cantidad > 0 ? v.cantidad : 1;
      const name = (v.nombreProducto || "").toLowerCase();
      const cat = (v.categoriaProducto || "").toLowerCase();

      let pts = 15;
      if (name.includes("star") || name.includes("erp star")) {
        pts = name.includes("anual") || name.includes("12") ? 70 : 50;
      } else if (name.includes("plus") || name.includes("erp plus")) {
        pts = name.includes("anual") || name.includes("12") ? 100 : 50;
      } else if (name.includes("premium") || name.includes("erp premium")) {
        pts = name.includes("anual") || name.includes("12") ? 150 : 50;
      } else if (name.includes("ilimitado") || name.includes("contador ilimitado")) {
        pts = 300;
      } else if (cat.includes("contador") || name.includes("contador")) {
        pts = 50;
      } else if (name.includes("ultra") || name.includes("profesional") || name.includes("professional")) {
        pts = 30;
      } else if (name.includes("light") || name.includes("base") || name.includes("power") || cat.includes("facturacion")) {
        pts = 15;
      } else if (cat.includes("firma") || name.includes("firma")) {
        const isJuridica = name.includes("juridica") || name.includes("jurídica") || name.includes("representante");
        const isLong = name.includes("4") || name.includes("5") || name.includes("4 años") || name.includes("5 años");
        if (isJuridica) {
          pts = isLong ? 70 : 30;
        } else {
          pts = isLong ? 50 : 20;
        }
      }
      return sum + (pts * qty);
    }, 0);

    // 2. Events points
    let eventsRegs: any[] = [];
    const rawEvents = localStorage.getItem("kpier_event_registrations");
    if (rawEvents) {
      eventsRegs = JSON.parse(rawEvents);
    }

    const eventPoints = eventsRegs.filter((r: any) => {
      if (isGerencia) return r.registrationType === "Reserva Pagada" && r.pointsAwarded > 0;
      const rName = (r.socioNombre || "").toLowerCase().trim();
      const rEmail = (r.socioEmail || "").toLowerCase().trim();
      const rCode = (r.socioCode || "").toUpperCase().trim();

      const isMatch =
        (sCode && rCode && rCode === sCode) ||
        (sEmail && rEmail && rEmail === sEmail) ||
        (sName && sName !== "socio registrado" && rName && (rName.includes(sName) || sName.includes(rName)));

      return isMatch && r.registrationType === "Reserva Pagada" && r.pointsAwarded > 0;
    }).reduce((sum: number, r: any) => sum + (Number(r.pointsAwarded) || 0), 0);

    // 3. Deduct redemptions
    let redemptions: any[] = [];
    const rawRed = localStorage.getItem("kpier_redemption_requests");
    if (rawRed) {
      redemptions = JSON.parse(rawRed);
    }

    const myRedeemed = redemptions.filter((req: any) => {
      if (isGerencia) return req.status === "Pendiente" || req.status === "Entregado";
      const rName = (req.socioNombre || "").toLowerCase().trim();
      const rEmail = (req.socioEmail || "").toLowerCase().trim();
      const rCode = (req.socioCode || "").toUpperCase().trim();

      const isMatch =
        (sCode && rCode && rCode === sCode) ||
        (sEmail && rEmail && rEmail === sEmail) ||
        (sName && sName !== "socio registrado" && rName && (rName.includes(sName) || sName.includes(rName)));

      return isMatch && (req.status === "Pendiente" || req.status === "Entregado");
    }).reduce((sum: number, req: any) => sum + (Number(req.pointsCost) || 0), 0);

    const baseWelcome = isGerencia ? 1000 : 150;
    const totalEarned = baseWelcome + salesPoints + eventPoints;
    return Math.max(0, totalEarned - myRedeemed);
  } catch (e) {
    console.error("Error calculating partner points", e);
    return 150;
  }
}

