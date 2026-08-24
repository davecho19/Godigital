import React, { useState, useEffect, useMemo } from "react";
import {
  DollarSign,
  Plus,
  Trash2,
  Calculator,
  TrendingUp,
  User,
  Calendar,
  FileCheck2,
  PackageCheck,
  FileText,
  Percent,
  Download,
  Loader2,
  CreditCard,
  Layers,
  ShoppingCart,
  Users,
  UserCheck,
  Search,
  CheckCircle2,
  Minus,
  Building2,
  Filter,
  Mail,
  Phone,
  AlertCircle,
  Key,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  FileSpreadsheet,
  ExternalLink,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { trackActivity } from "../utils/telemetry";
import { syncVentaToGoogleSheets, fetchVentasFromGoogleSheets, deleteVentaFromGoogleSheets, syncSocioToGoogleSheets } from "../utils/googleSheetsSync";
import { DeleteVentaModal } from "./DeleteVentaModal";
import { getPartnerCodeSlots, savePartnerCodeSlots, checkSocioDuplicate } from "../utils/partnerCodes";
import { getActivePartnerName, getActivePartnerProfile, ActivePartnerProfile } from "../utils/userSessionHelper";
import { notifyPointsUpdated } from "../utils/rewardsData";

export interface ItemComision {
  id: string;
  categoria: "plan" | "firma" | "adicional";
  subcategoria?: "facturacion" | "erp" | "contador";
  nombre: string;
  vigencia?: string;
  costoBase: number;
  precioVenta: number;
  cantidad: number;
  porcentajeComision: number;
  comisionUnitaria: number;
  comisionTotal: number;
}

export interface VentaRegistrada {
  id: string;
  nombreCliente: string;
  cedulaCliente: string;
  productoId: string;
  nombreProducto: string;
  categoriaProducto: "facturacion" | "erp" | "contador" | "adicional" | "firma";
  precioUnitario: number;
  cantidad: number;
  totalVenta: number;
  fechaRegistro: string;
  adminResponsable?: string;
  vendedor?: string;
  socioNombre?: string;
  userEmail?: string;
  userCode?: string;
  userRole?: string;
}

export interface SocioRegistrado {
  id: string;
  nombreApellido: string;
  cedulaTelefono: string;
  cedulaRuc?: string;
  telefono?: string;
  email?: string;
  esMlm: boolean;
  esDistribuidorFirmas: boolean;
  fechaRegistro: string;
  estado: "Activo" | "Inactivo" | "Por Activar";
  referidoPorAdmin?: string;
  registradoPor?: string;
  referidoPor?: string;
  codigoSocio?: string;
  partnerCode?: string;
  password?: string;
}

export const FIRMA_BASE_COSTS: Record<string, { costoBase: number; sugerido: number }> = {
  "15 Días": { costoBase: 3.16, sugerido: 6.0 },
  "1 Año": { costoBase: 8.99, sugerido: 18.0 },
  "2 Años": { costoBase: 14.5, sugerido: 28.0 },
  "3 Años": { costoBase: 19.1, sugerido: 38.0 },
  "4 Años": { costoBase: 23.8, sugerido: 48.0 },
  "5 Años": { costoBase: 28.17, sugerido: 58.0 },
};

export const ADICIONALES_PRESETS = [
  { id: "tesoreria", nombre: "TESORERIA", precio: 75.0 },
  { id: "nomina", nombre: "NOMINA", precio: 75.0 },
  { id: "activos_fijos", nombre: "ACTIVOS FIJOS", precio: 75.0 },
  { id: "restaurantes", nombre: "RESTAURANTES", precio: 75.0 },
  { id: "contabilidad", nombre: "CONTABILIDAD", precio: 75.0 },
  { id: "produccion", nombre: "PRODUCCIÓN", precio: 75.0 },
];

export const PLAN_PRESETS = [
  // Facturación Electrónica
  { id: "fac_up_light", categoria: "facturacion", nombre: "Facturación UP LIGHT", precio: 10.0 },
  { id: "fac_up_base", categoria: "facturacion", nombre: "Facturación UP BASE", precio: 25.0 },
  { id: "fac_up_power", categoria: "facturacion", nombre: "Facturación UP POWER", precio: 55.0 },
  { id: "fac_up_inicial", categoria: "facturacion", nombre: "Facturación UP INICIAL", precio: 10.0 },
  { id: "fac_up_intermedio", categoria: "facturacion", nombre: "Facturación UP INTERMEDIO", precio: 15.0 },
  { id: "fac_up_ideal_plus", categoria: "facturacion", nombre: "Facturación UP IDEAL PLUS", precio: 25.0 },
  { id: "fac_up_profesional_plus", categoria: "facturacion", nombre: "Facturación UP PROFESIONAL PLUS", precio: 80.0 },
  { id: "fac_up_ultra", categoria: "facturacion", nombre: "Facturación UP ULTRA", precio: 150.0 },

  // ERP PYMES (Mensuales y Anuales)
  { id: "erp_start_m", categoria: "erp", nombre: "ERP START (Mensual)", precio: 34.31 },
  { id: "erp_start_a", categoria: "erp", nombre: "ERP START (Anual)", precio: 411.76 },
  { id: "erp_plus_m", categoria: "erp", nombre: "ERP PLUS (Mensual)", precio: 50.0 },
  { id: "erp_plus_a", categoria: "erp", nombre: "ERP PLUS (Anual)", precio: 600.0 },
  { id: "erp_premium_m", categoria: "erp", nombre: "ERP PREMIUM (Mensual)", precio: 79.9 },
  { id: "erp_premium_a", categoria: "erp", nombre: "ERP PREMIUM (Anual)", precio: 958.82 },

  // Planes Contadores
  { id: "cont_1_emp", categoria: "contador", nombre: "CONTADOR 1 EMPRESA", precio: 50.0 },
  { id: "cont_3_emp", categoria: "contador", nombre: "CONTADOR 3 EMPRESA", precio: 100.0 },
  { id: "cont_6_emp", categoria: "contador", nombre: "CONTADOR 6 EMPRESA", precio: 150.0 },
  { id: "cont_10_emp", categoria: "contador", nombre: "CONTADOR 10 EMPRESA", precio: 200.0 },
  { id: "cont_tax_ilim", categoria: "contador", nombre: "TAX ILIMITADOS", precio: 100.0 },
  { id: "cont_ilimitado", categoria: "contador", nombre: "CONTADOR ILIMITADO", precio: 300.0 },
];

export const INITIAL_VENTAS_DATA: VentaRegistrada[] = [];

export const INITIAL_SOCIOS_DATA: SocioRegistrado[] = [];

export const MOCK_RANDOM_SOCIOS: SocioRegistrado[] = [
  { id: "mock-1", nombreApellido: "Carlos Alberto Mendoza", cedulaTelefono: "0987654321", esMlm: true, esDistribuidorFirmas: false, fechaRegistro: "2026-08-01", estado: "Activo" },
  { id: "mock-2", nombreApellido: "María Fernanda Torres", cedulaTelefono: "0991234567", esMlm: true, esDistribuidorFirmas: true, fechaRegistro: "2026-08-01", estado: "Activo" },
  { id: "mock-3", nombreApellido: "Juan Pablo Jaramillo", cedulaTelefono: "0982345678", esMlm: false, esDistribuidorFirmas: true, fechaRegistro: "2026-08-02", estado: "Activo" },
  { id: "mock-4", nombreApellido: "Ana Lucía Benítez", cedulaTelefono: "0973456789", esMlm: true, esDistribuidorFirmas: false, fechaRegistro: "2026-08-02", estado: "Activo" },
  { id: "mock-5", nombreApellido: "Galo Enrique Salazar", cedulaTelefono: "0964567890", esMlm: true, esDistribuidorFirmas: true, fechaRegistro: "2026-08-03", estado: "Activo" },
  { id: "mock-6", nombreApellido: "Valeria Isabel Morales", cedulaTelefono: "0955678901", esMlm: false, esDistribuidorFirmas: true, fechaRegistro: "2026-08-04", estado: "Activo" },
  { id: "mock-7", nombreApellido: "Diego Fernando Cárdenas", cedulaTelefono: "0946789012", esMlm: true, esDistribuidorFirmas: false, fechaRegistro: "2026-08-05", estado: "Activo" },
  { id: "mock-8", nombreApellido: "Sofia Elizabeth Romero", cedulaTelefono: "0937890123", esMlm: true, esDistribuidorFirmas: true, fechaRegistro: "2026-08-05", estado: "Activo" },
  { id: "mock-9", nombreApellido: "Ricardo Xavier Castro", cedulaTelefono: "0928901234", esMlm: false, esDistribuidorFirmas: true, fechaRegistro: "2026-08-06", estado: "Activo" },
  { id: "mock-10", nombreApellido: "Elena Patricia Vargas", cedulaTelefono: "0919012345", esMlm: true, esDistribuidorFirmas: false, fechaRegistro: "2026-08-06", estado: "Activo" },
];

export type KPierSubTab = "comisiones_sistema" | "comisiones_firmas" | "comisiones";

interface ComisionModuleProps {
  subTab?: KPierSubTab;
  onSubTabChange?: (tab: KPierSubTab) => void;
}

export function ComisionModule({ subTab, onSubTabChange }: ComisionModuleProps) {
  const isGerenciaUser = sessionStorage.getItem("godi_user") === "gerencia";
  const currentYear = new Date().getFullYear();
  const MONTHS = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  // Internal Subtab State
  const [internalSubTab, setInternalSubTab] = useState<KPierSubTab>("comisiones_sistema");
  const activeSubTab = subTab || internalSubTab;

  const handleTabSwitch = (tab: KPierSubTab) => {
    setInternalSubTab(tab);
    if (onSubTabChange) {
      onSubTabChange(tab);
    }
  };

  // ==========================================
  // TAB 1: COMISIONES SISTEMA STATE
  // ==========================================
  const [activeProfile, setActiveProfile] = useState<ActivePartnerProfile>(getActivePartnerProfile);

  useEffect(() => {
    const updateProfile = () => {
      setActiveProfile(getActivePartnerProfile());
    };
    updateProfile();
    window.addEventListener("storage", updateProfile);
    window.addEventListener("kpier_socios_updated", updateProfile);
    window.addEventListener("kpier_profile_updated", updateProfile);
    return () => {
      window.removeEventListener("storage", updateProfile);
      window.removeEventListener("kpier_socios_updated", updateProfile);
      window.removeEventListener("kpier_profile_updated", updateProfile);
    };
  }, []);

  const todayDateISO = useMemo(() => new Date().toISOString().split("T")[0], []);
  const todayDateFormatted = useMemo(() => new Date().toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }), []);

  const currentMonthName = MONTHS[new Date().getMonth()];
  const [mesSeleccionado, setMesSeleccionado] = useState(currentMonthName);
  const [observaciones, setObservaciones] = useState(`Comisiones ${currentMonthName} ${currentYear}`);

  // Form State: Plan
  const [selectedPlanPreset, setSelectedPlanPreset] = useState(PLAN_PRESETS[1].id);
  const [planNombreCustom, setPlanNombreCustom] = useState(PLAN_PRESETS[1].nombre);
  const [planPrecioVenta, setPlanPrecioVenta] = useState<number>(PLAN_PRESETS[1].precio);
  const [planCantidad, setPlanCantidad] = useState<number>(1);
  const [planSubcategoria, setPlanSubcategoria] = useState<"facturacion" | "erp" | "contador">("facturacion");

  // Form State: Firma (.p12)
  const [firmaVigencia, setFirmaVigencia] = useState<string>("1 Año");
  const [firmaTipo, setFirmaTipo] = useState<string>("Archivo .p12");
  const [firmaPrecioVenta, setFirmaPrecioVenta] = useState<number>(18.0);
  const [firmaCantidad, setFirmaCantidad] = useState<number>(1);
  const [firmaClienteNombre, setFirmaClienteNombre] = useState<string>("");
  const [firmaClienteCedula, setFirmaClienteCedula] = useState<string>("");
  const [firmaSearchTerm, setFirmaSearchTerm] = useState<string>("");

  // Form State: Adicionales (30% comisión)
  const [selectedAdicional, setSelectedAdicional] = useState(ADICIONALES_PRESETS[0].id);
  const [adicionalPrecioVenta, setAdicionalPrecioVenta] = useState<number>(75.0);
  const [adicionalCantidad, setAdicionalCantidad] = useState<number>(1);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // ==========================================
  // TAB 2: REGISTRO DE VENTAS STATE
  // ==========================================
  const [vNombreCliente, setVNombreCliente] = useState("");
  const [vCedulaCliente, setVCedulaCliente] = useState("");
  const [vCategoria, setVCategoria] = useState<"facturacion" | "erp" | "contador" | "adicional">("facturacion");
  const [vProductoId, setVProductoId] = useState(PLAN_PRESETS[0].id);
  const [vPrecioUnitario, setVPrecioUnitario] = useState<number>(PLAN_PRESETS[0].precio);
  const [vCantidad, setVCantidad] = useState<number>(1);
  const [vAdminResponsable, setVAdminResponsable] = useState<string>("admin");
  const [vSearchTerm, setVSearchTerm] = useState("");
  const [vErrors, setVErrors] = useState<{ nombre?: string; cedula?: string }>({});

  const [ventasRegistradas, setVentasRegistradas] = useState<VentaRegistrada[]>(() => {
    try {
      const saved = localStorage.getItem("kpier_ventas_registradas");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((v: any) => ({
            ...v,
            precioUnitario: typeof v.precioUnitario === "number" && !isNaN(v.precioUnitario) ? v.precioUnitario : (parseFloat(v.precioUnitario) || 0),
            totalVenta: typeof v.totalVenta === "number" && !isNaN(v.totalVenta) ? v.totalVenta : (parseFloat(v.totalVenta) || 0),
            cantidad: typeof v.cantidad === "number" && !isNaN(v.cantidad) ? v.cantidad : 1,
          }));
        }
      }
    } catch (e) {
      console.error("Error loading kpier_ventas_registradas", e);
    }
    return INITIAL_VENTAS_DATA;
  });

  const [items, setItems] = useState<ItemComision[]>(() => {
    try {
      const saved = localStorage.getItem("kpier_comision_items");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((i: any) => ({
            ...i,
            precioVenta: typeof i.precioVenta === "number" && !isNaN(i.precioVenta) ? i.precioVenta : (parseFloat(i.precioVenta) || 0),
            comisionTotal: typeof i.comisionTotal === "number" && !isNaN(i.comisionTotal) ? i.comisionTotal : (parseFloat(i.comisionTotal) || 0),
            costoBase: typeof i.costoBase === "number" && !isNaN(i.costoBase) ? i.costoBase : 0,
            cantidad: typeof i.cantidad === "number" && !isNaN(i.cantidad) ? i.cantidad : 1,
          }));
        }
      }
    } catch (e) {
      console.error("Error loading kpier_comision_items", e);
    }
    return [];
  });

  // Convert VentaRegistrada to ItemComision
  const createItemFromVenta = (v: VentaRegistrada): ItemComision => {
    const cat = v.categoriaProducto === "adicional" ? "adicional" : (v.categoriaProducto === "firma" ? "firma" : "plan");
    const precio = Number(v.precioUnitario) || 0;
    const cant = Math.max(1, Number(v.cantidad) || 1);
    let costoBase = 0;
    let comUnitaria = precio * 0.3;

    if (cat === "firma") {
      let vigKey = "1 Año";
      for (const key of Object.keys(FIRMA_BASE_COSTS)) {
        if (v.nombreProducto?.toLowerCase().includes(key.toLowerCase())) {
          vigKey = key;
          break;
        }
      }
      const config = FIRMA_BASE_COSTS[vigKey] || { costoBase: 8.99 };
      costoBase = config.costoBase;
      comUnitaria = Math.max(0, precio - costoBase);
    }

    return {
      id: v.id,
      categoria: cat,
      nombre: v.nombreProducto ? `${v.nombreProducto}${v.nombreCliente ? ` — ${v.nombreCliente}` : ""}` : "Producto KPIer",
      costoBase,
      precioVenta: precio,
      cantidad: cant,
      porcentajeComision: cat === "firma" ? 0 : 30,
      comisionUnitaria: comUnitaria,
      comisionTotal: comUnitaria * cant,
    };
  };

  // Convert ItemComision to VentaRegistrada
  const createVentaFromItem = (i: ItemComision, distNombre?: string, distCedula?: string): VentaRegistrada => {
    const loggedUserName = sessionStorage.getItem("godi_user_name") || "";
    const loggedUserEmail = sessionStorage.getItem("godi_user_email") || "";
    const loggedUserCode = sessionStorage.getItem("godi_user_code") || "";
    const loggedUserRole = sessionStorage.getItem("godi_user") || "";

    return {
      id: i.id,
      nombreCliente: distNombre?.trim() || "Cliente Directo",
      cedulaCliente: distCedula?.trim() || "1700000000",
      productoId: i.id,
      nombreProducto: i.nombre,
      categoriaProducto: i.categoria === "adicional" ? "adicional" : "facturacion",
      precioUnitario: i.precioVenta,
      cantidad: i.cantidad,
      totalVenta: i.precioVenta * i.cantidad,
      fechaRegistro: new Date().toLocaleDateString("es-EC"),
      adminResponsable: "admin",
      vendedor: loggedUserName || "Socio KPIer",
      socioNombre: loggedUserName || "Socio KPIer",
      userEmail: loggedUserEmail,
      userCode: loggedUserCode,
      userRole: loggedUserRole,
    };
  };

  // Helper to check if a sale belongs to the logged-in user (User Isolation)
  const isVentaBelongingToUser = (v: VentaRegistrada) => {
    if (!v) return false;
    const currentRole = sessionStorage.getItem("godi_user") || "";
    if (currentRole === "gerencia") return true;

    const currentEmail = (sessionStorage.getItem("godi_user_email") || "").toLowerCase().trim();
    const currentCode = (sessionStorage.getItem("godi_user_code") || "").toUpperCase().trim();
    const currentName = (sessionStorage.getItem("godi_user_name") || "").toLowerCase().trim();

    const vEmail = ((v as any).userEmail || "").toLowerCase().trim();
    const vCode = ((v as any).userCode || "").toUpperCase().trim();
    const vVend = ((v as any).vendedor || (v as any).socioNombre || (v as any).adminResponsable || "").toLowerCase().trim();

    if (currentEmail && vEmail && currentEmail === vEmail) return true;
    if (currentCode && vCode && currentCode === vCode) return true;
    if (currentName && vVend && (vVend.includes(currentName) || currentName.includes(vVend))) return true;

    return false;
  };

  // Keep items synced with ventasRegistradas (filtered by user isolation for socio profile)
  useEffect(() => {
    const userVentas = isGerenciaUser
      ? ventasRegistradas
      : ventasRegistradas.filter(isVentaBelongingToUser);

    const syncedItems = userVentas.map((v) => createItemFromVenta(v));
    setItems(syncedItems);
  }, [ventasRegistradas, isGerenciaUser]);

  // Keep localStorage and storage events in sync
  useEffect(() => {
    try {
      localStorage.setItem("kpier_ventas_registradas", JSON.stringify(ventasRegistradas));
      localStorage.setItem("kpier_comision_items", JSON.stringify(items));
    } catch (e) {
      console.error("Error saving kpier data", e);
    }
  }, [ventasRegistradas, items]);

  // Handle category selection for Registro de Ventas
  const handleVCategoriaChange = (cat: "facturacion" | "erp" | "contador" | "adicional") => {
    setVCategoria(cat);
    if (cat === "adicional") {
      const first = ADICIONALES_PRESETS[0];
      if (first) {
        setVProductoId(first.id);
        setVPrecioUnitario(first.precio);
      }
    } else {
      const filtered = PLAN_PRESETS.filter((p) => p.categoria === cat);
      if (filtered.length > 0) {
        setVProductoId(filtered[0].id);
        setVPrecioUnitario(filtered[0].precio);
      }
    }
  };

  // Handle product selection change in Registro de Ventas
  const handleVProductoChange = (prodId: string) => {
    setVProductoId(prodId);
    if (vCategoria === "adicional") {
      const found = ADICIONALES_PRESETS.find((a) => a.id === prodId);
      if (found) setVPrecioUnitario(found.precio);
    } else {
      const found = PLAN_PRESETS.find((p) => p.id === prodId);
      if (found) setVPrecioUnitario(found.precio);
    }
  };

  // Add Venta Handler (from Registro de Ventas tab) -> syncs to Comisiones items automatically
  const handleAddVenta = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { nombre?: string; cedula?: string } = {};

    if (!vNombreCliente.trim()) {
      errors.nombre = "El nombre del cliente es obligatorio";
    }
    const cleanCedula = vCedulaCliente.trim();
    if (!cleanCedula) {
      errors.cedula = "La Cédula / RUC es obligatoria";
    } else if (cleanCedula.length < 10 || cleanCedula.length > 13) {
      errors.cedula = "Debe tener entre 10 y 13 dígitos";
    }

    if (Object.keys(errors).length > 0) {
      setVErrors(errors);
      return;
    }
    setVErrors({});

    let nombreProducto = "";
    if (vCategoria === "adicional") {
      const found = ADICIONALES_PRESETS.find((a) => a.id === vProductoId);
      nombreProducto = found ? `Módulo ${found.nombre}` : "Módulo Adicional";
    } else {
      const found = PLAN_PRESETS.find((p) => p.id === vProductoId);
      nombreProducto = found ? found.nombre : "Plan de Sistema";
    }

    const unitPrice = Number(vPrecioUnitario) || 0;
    const qty = Math.max(1, Number(vCantidad) || 1);

    const activePartnerName = getActivePartnerName();
    const loggedUserEmail = sessionStorage.getItem("godi_user_email") || "";
    const loggedUserCode = sessionStorage.getItem("godi_user_code") || "";
    const loggedUserRole = sessionStorage.getItem("godi_user") || "";

    const sellerName = activePartnerName && activePartnerName !== "Socio Registrado" ? activePartnerName : (vAdminResponsable || "Socio Registrado");

    const nuevaVenta: VentaRegistrada & { userEmail?: string; userCode?: string; userRole?: string; vendedor?: string; socioNombre?: string } = {
      id: `v-${Date.now()}`,
      nombreCliente: vNombreCliente.trim(),
      cedulaCliente: cleanCedula,
      productoId: vProductoId,
      nombreProducto,
      categoriaProducto: vCategoria,
      precioUnitario: unitPrice,
      cantidad: qty,
      totalVenta: unitPrice * qty,
      fechaRegistro: new Date().toLocaleDateString("es-EC"),
      adminResponsable: sellerName,
      vendedor: sellerName,
      socioNombre: sellerName,
      userEmail: loggedUserEmail,
      userCode: loggedUserCode,
      userRole: loggedUserRole,
    };

    const newItem = createItemFromVenta(nuevaVenta);

    setVentasRegistradas((prev) => [nuevaVenta, ...prev]);
    setItems((prev) => [newItem, ...prev]);

    // Sync sale to Google Sheets automatically
    syncVentaToGoogleSheets({
      id: nuevaVenta.id,
      fecha: nuevaVenta.fechaRegistro,
      nombreCliente: nuevaVenta.nombreCliente,
      cedulaCliente: nuevaVenta.cedulaCliente,
      producto: nuevaVenta.nombreProducto,
      cantidad: nuevaVenta.cantidad,
      totalVenta: nuevaVenta.totalVenta,
      vendedor: nuevaVenta.vendedor,
      userEmail: nuevaVenta.userEmail,
      userCode: nuevaVenta.userCode,
      userRole: nuevaVenta.userRole,
      estadoComision: "Pendiente",
    });

    // Reset form fields
    setVNombreCliente("");
    setVCedulaCliente("");
    setVCantidad(1);
    notifyPointsUpdated();
  };

  const [selectedVentaToDelete, setSelectedVentaToDelete] = useState<VentaRegistrada | null>(null);

  const confirmDeleteVenta = (id: string) => {
    setVentasRegistradas((prev) => {
      const updated = prev.filter((v) => v.id !== id);
      try {
        localStorage.setItem("kpier_ventas_registradas", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    setItems((prev) => prev.filter((i) => i.id !== id));
    deleteVentaFromGoogleSheets(id);
    window.dispatchEvent(new Event("kpier_ventas_updated"));
    notifyPointsUpdated();
  };

  // ==========================================
  // TAB 3: REGISTRO DE SOCIOS STATE
  // ==========================================
  const [sNombreApellido, setSNombreApellido] = useState("");
  const [sCedulaRuc, setSCedulaRuc] = useState("");
  const [sTelefono, setSTelefono] = useState("");
  const [sEmail, setSEmail] = useState("");
  const [sEsMlm, setSEsMlm] = useState(true);
  const [sEsDistribuidorFirmas, setSEsDistribuidorFirmas] = useState(false);
  const [sReferidoPorAdmin, setSReferidoPorAdmin] = useState<string>("");
  const [sSearchTerm, setSSearchTerm] = useState("");
  const [sErrors, setSErrors] = useState<{ nombre?: string; cedulaRuc?: string; telefono?: string; email?: string; perfil?: string; general?: string }>({});

  const [showActivationModal, setShowActivationModal] = useState(false);
  const [registeredSocioInfo, setRegisteredSocioInfo] = useState<{ nombre: string; email: string; code: string } | null>(null);

  // Gerencia Socio Activation Modal States
  const [selectedSocioToActivate, setSelectedSocioToActivate] = useState<SocioRegistrado | null>(null);
  const [activatePassword, setActivatePassword] = useState("");
  const [showActivateModalGerencia, setShowActivateModalGerencia] = useState(false);
  const [showPasswordInModal, setShowPasswordInModal] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [activateSuccessMsg, setActivateSuccessMsg] = useState<string | null>(null);

  const [sociosRegistrados, setSociosRegistrados] = useState<SocioRegistrado[]>(() => {
    try {
      const saved = localStorage.getItem("kpier_socios_registrados");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Error loading kpier_socios_registrados", e);
    }
    return INITIAL_SOCIOS_DATA;
  });

  useEffect(() => {
    try {
      localStorage.setItem("kpier_socios_registrados", JSON.stringify(sociosRegistrados));
    } catch (e) {
      console.error("Error saving kpier_socios_registrados", e);
    }
  }, [sociosRegistrados]);

  // Keep sociosRegistrados synced when profile changes occur elsewhere
  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem("kpier_socios_registrados");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setSociosRegistrados(parsed);
          }
        }
      } catch (e) {
        console.error("Error updating sociosRegistrados", e);
      }
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("kpier_socios_updated", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("kpier_socios_updated", handleUpdate);
    };
  }, []);

  // Add Socio Handler
  const handleAddSocio = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { nombre?: string; cedulaRuc?: string; telefono?: string; email?: string; perfil?: string; general?: string } = {};

    const cleanNombre = sNombreApellido.trim();
    const cleanCedulaRuc = sCedulaRuc.trim();
    const cleanTelefono = sTelefono.trim();
    const cleanEmail = sEmail.trim();

    if (!cleanNombre) {
      errors.nombre = "El Nombre y Apellido es obligatorio";
    }
    if (!cleanCedulaRuc) {
      errors.cedulaRuc = "El número de Cédula o RUC es obligatorio";
    } else if (cleanCedulaRuc.length < 10 || cleanCedulaRuc.length > 13) {
      errors.cedulaRuc = `Cédula / RUC debe tener entre 10 y 13 caracteres (Ingresados: ${cleanCedulaRuc.length})`;
    }
    if (!cleanTelefono) {
      errors.telefono = "El número de teléfono es obligatorio";
    } else if (cleanTelefono.length > 10) {
      errors.telefono = "El número de teléfono no debe exceder 10 caracteres";
    }
    if (!cleanEmail) {
      errors.email = "El correo electrónico es obligatorio";
    } else if (!cleanEmail.includes("@")) {
      errors.email = "Ingrese un correo electrónico válido";
    }
    if (isGerenciaUser && !sEsMlm && !sEsDistribuidorFirmas) {
      errors.perfil = "Debe seleccionar al menos un tipo de socio (MLM o Distribuidor Firmas)";
    }

    // Check for duplicate user by Email, RUC/Cedula or Telefono
    const dupCheck = checkSocioDuplicate({
      email: cleanEmail,
      rucCedula: cleanCedulaRuc,
      telefono: cleanTelefono,
    });

    if (dupCheck.isDuplicate) {
      errors.general = dupCheck.message || "Los datos ingresados ya pertenecen a un socio registrado.";
    }

    if (Object.keys(errors).length > 0) {
      setSErrors(errors);
      return;
    }
    setSErrors({});

    const generatedCode = `UPC${Math.floor(100000 + Math.random() * 900000)}`;
    const randomPassword = "Clave" + Math.floor(1000 + Math.random() * 9000);
    const fecha = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const finalEsMlm = isGerenciaUser ? sEsMlm : true;
    const finalEsDistribuidorFirmas = isGerenciaUser ? sEsDistribuidorFirmas : false;

    const loggedUserName = sessionStorage.getItem("godi_user_name") || "";
    const regName = isGerenciaUser
      ? "Gerencia"
      : (loggedUserName.trim() || sReferidoPorAdmin.trim() || "Socio Registrador");

    const nuevoSocioState = isGerenciaUser ? "Activo" : "Por Activar";

    const nuevoSocio: SocioRegistrado = {
      id: `s-${Date.now()}`,
      nombreApellido: cleanNombre,
      cedulaTelefono: `${cleanCedulaRuc} - ${cleanTelefono}`,
      cedulaRuc: cleanCedulaRuc,
      telefono: cleanTelefono,
      email: cleanEmail,
      esMlm: finalEsMlm,
      esDistribuidorFirmas: finalEsDistribuidorFirmas,
      fechaRegistro: fecha,
      estado: nuevoSocioState,
      referidoPorAdmin: regName,
      registradoPor: regName,
      referidoPor: regName,
      codigoSocio: generatedCode,
      partnerCode: generatedCode,
      password: randomPassword,
    };

    const updatedSocios = [nuevoSocio, ...sociosRegistrados];
    setSociosRegistrados(updatedSocios);

    // Save directly to localStorage FIRST before dispatching events
    try {
      localStorage.setItem("kpier_socios_registrados", JSON.stringify(updatedSocios));
    } catch (e) {
      console.error("Error saving kpier_socios_registrados", e);
    }

    // Cross-save to registered users table
    try {
      const rawUsers = localStorage.getItem("kpier_registered_users");
      const usersArr = rawUsers ? JSON.parse(rawUsers) : [];
      usersArr.push({
        id: `usr-${Date.now()}`,
        nombre: cleanNombre,
        email: cleanEmail,
        password: randomPassword,
        telefono: cleanTelefono,
        rucCedula: cleanCedulaRuc,
        partnerCode: generatedCode,
        role: "admin1",
        fechaRegistro: fecha,
        referidoPor: regName,
        registradoPor: regName,
        estado: nuevoSocioState,
      });
      localStorage.setItem("kpier_registered_users", JSON.stringify(usersArr));
    } catch (e) {
      console.error("Error saving to kpier_registered_users", e);
    }

    // Always attach to a slot in kpier_partner_codes for Gerencia view
    try {
      const slotsArr = getPartnerCodeSlots();
      const existingIdx = slotsArr.findIndex(
        (s) =>
          (s.code && s.code.toUpperCase() === generatedCode.toUpperCase()) ||
          (s.email && cleanEmail && s.email.toLowerCase() === cleanEmail.toLowerCase())
      );
      const targetIdx = existingIdx !== -1 ? existingIdx : slotsArr.findIndex((s) => !s.used);
      if (targetIdx !== -1) {
        slotsArr[targetIdx] = {
          ...slotsArr[targetIdx],
          used: true,
          code: generatedCode,
          nombre: cleanNombre,
          email: cleanEmail,
          rucCedula: cleanCedulaRuc,
          telefono: cleanTelefono,
          password: randomPassword,
          role: "admin1",
          fechaRegistro: fecha,
          estado: nuevoSocioState,
          registradoPor: regName,
          referidoPor: regName,
        };
        savePartnerCodeSlots(slotsArr);
      }
    } catch (e) {
      console.error("Error saving to kpier_partner_codes", e);
    }

    // Always sync new socio to Server Database & Google Sheets
    syncSocioToGoogleSheets({
      fechaRegistro: fecha,
      userCode: generatedCode,
      nombreApellido: cleanNombre,
      rucCedula: cleanCedulaRuc,
      email: cleanEmail,
      telefono: cleanTelefono,
      password: randomPassword,
      role: "admin1",
      codigoAsignado: generatedCode,
      registradoPor: regName,
      referidoPor: regName,
      estado: isGerenciaUser ? "Activo" : "Por Activar",
    });

    // Notify components
    window.dispatchEvent(new Event("kpier_socios_updated"));

    // Check if registered from socio profile (!isGerenciaUser)
    const activeRole = sessionStorage.getItem("godi_user");
    const isGerencia = activeRole === "gerencia";

    if (!isGerencia) {
      setRegisteredSocioInfo({
        nombre: cleanNombre,
        email: cleanEmail,
        code: generatedCode,
      });
      setShowActivationModal(true);
    }

    // Reset inputs
    setSNombreApellido("");
    setSCedulaRuc("");
    setSTelefono("");
    setSEmail("");
    setSEsMlm(true);
    setSEsDistribuidorFirmas(false);
  };

  // Handle Gerencia activation of socio
  const handleOpenActivateModal = (socio: SocioRegistrado) => {
    setSelectedSocioToActivate(socio);
    setActivatePassword(socio.password || `Clave${Math.floor(1000 + Math.random() * 9000)}`);
    setShowActivateModalGerencia(true);
    setActivateSuccessMsg(null);
  };

  const handleActivateSocio = async () => {
    if (!selectedSocioToActivate) return;
    setIsActivating(true);

    const cleanPass = activatePassword.trim() || `Clave${Math.floor(1000 + Math.random() * 9000)}`;
    const updatedSocio: SocioRegistrado = {
      ...selectedSocioToActivate,
      password: cleanPass,
      estado: "Activo",
    };

    // 1. Update sociosRegistrados state & localStorage
    const updatedList = sociosRegistrados.map((s) => (s.id === selectedSocioToActivate.id ? updatedSocio : s));
    setSociosRegistrados(updatedList);
    localStorage.setItem("kpier_socios_registrados", JSON.stringify(updatedList));

    // 2. Update kpier_registered_users
    try {
      const rawUsers = localStorage.getItem("kpier_registered_users");
      const usersArr: any[] = rawUsers ? JSON.parse(rawUsers) : [];
      const codeMatch = (selectedSocioToActivate.partnerCode || selectedSocioToActivate.codigoSocio || "").toUpperCase().trim();
      const idx = usersArr.findIndex(
        (u) =>
          (codeMatch && u.partnerCode?.toUpperCase().trim() === codeMatch) ||
          (selectedSocioToActivate.email && u.email?.toLowerCase() === selectedSocioToActivate.email.toLowerCase())
      );
      if (idx !== -1) {
        usersArr[idx] = { ...usersArr[idx], password: cleanPass, estado: "Activo" };
      } else {
        usersArr.push({
          id: `usr-${Date.now()}`,
          nombre: selectedSocioToActivate.nombreApellido,
          email: selectedSocioToActivate.email,
          rucCedula: selectedSocioToActivate.cedulaRuc,
          telefono: selectedSocioToActivate.telefono,
          password: cleanPass,
          partnerCode: selectedSocioToActivate.partnerCode || selectedSocioToActivate.codigoSocio,
          role: "admin1",
          fechaRegistro: selectedSocioToActivate.fechaRegistro || new Date().toISOString().split("T")[0],
          estado: "Activo",
        });
      }
      localStorage.setItem("kpier_registered_users", JSON.stringify(usersArr));
    } catch (e) {
      console.error("Error updating kpier_registered_users", e);
    }

    // 3. Update kpier_partner_codes
    try {
      const slotsArr = getPartnerCodeSlots();
      const codeMatch = (selectedSocioToActivate.partnerCode || selectedSocioToActivate.codigoSocio || "").toUpperCase().trim();
      const targetIdx = slotsArr.findIndex(
        (s) =>
          (s.code && s.code.toUpperCase().trim() === codeMatch) ||
          (s.email && selectedSocioToActivate.email && s.email.toLowerCase() === selectedSocioToActivate.email.toLowerCase())
      );
      if (targetIdx !== -1) {
        slotsArr[targetIdx] = {
          ...slotsArr[targetIdx],
          password: cleanPass,
          estado: "Activo",
        };
        savePartnerCodeSlots(slotsArr);
      }
    } catch (e) {
      console.error("Error updating kpier_partner_codes", e);
    }

    // 4. Sync to Google Sheets
    const regBy = selectedSocioToActivate.registradoPor || selectedSocioToActivate.referidoPor || "Gerencia";
    await syncSocioToGoogleSheets({
      fechaRegistro: selectedSocioToActivate.fechaRegistro || new Date().toISOString().split("T")[0],
      userCode: selectedSocioToActivate.partnerCode || selectedSocioToActivate.codigoSocio,
      nombreApellido: selectedSocioToActivate.nombreApellido,
      rucCedula: selectedSocioToActivate.cedulaRuc || selectedSocioToActivate.cedulaTelefono?.split("-")[0]?.trim(),
      email: selectedSocioToActivate.email,
      telefono: selectedSocioToActivate.telefono || selectedSocioToActivate.cedulaTelefono?.split("-")[1]?.trim(),
      password: cleanPass,
      role: "admin1",
      codigoAsignado: selectedSocioToActivate.partnerCode || selectedSocioToActivate.codigoSocio,
      registradoPor: regBy,
      referidoPor: regBy,
      estado: "Activo",
    });

    window.dispatchEvent(new Event("kpier_socios_updated"));
    setIsActivating(false);
    setActivateSuccessMsg("¡Socio activado correctamente y registrado en Google Sheets!");
    setTimeout(() => {
      setShowActivateModalGerencia(false);
      setSelectedSocioToActivate(null);
      setActivateSuccessMsg(null);
    }, 1800);
  };

  const handleDeleteSocio = (id: string) => {
    setSociosRegistrados((prev) => prev.filter((s) => s.id !== id));
  };

  // ==========================================
  // COMISIONES LOGIC (Tab 1)
  // ==========================================
  const handlePlanPresetChange = (presetId: string) => {
    setSelectedPlanPreset(presetId);
    if (presetId === "custom") {
      setPlanNombreCustom("Plan Personalizado");
      setPlanPrecioVenta(50);
    } else {
      const found = PLAN_PRESETS.find((p) => p.id === presetId);
      if (found) {
        setPlanNombreCustom(found.nombre);
        setPlanPrecioVenta(found.precio);
        setPlanSubcategoria(found.categoria as any);
      }
    }
  };

  const handleFirmaVigenciaChange = (vigencia: string) => {
    setFirmaVigencia(vigencia);
    const config = FIRMA_BASE_COSTS[vigencia];
    if (config) {
      setFirmaPrecioVenta(config.sugerido);
    }
  };

  const handleAdicionalPresetChange = (presetId: string) => {
    setSelectedAdicional(presetId);
    const found = ADICIONALES_PRESETS.find((a) => a.id === presetId);
    if (found) {
      setAdicionalPrecioVenta(found.precio);
    }
  };

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (planPrecioVenta <= 0 || planCantidad <= 0) return;

    const comisionUnitaria = planPrecioVenta * 0.3;
    const comisionTotal = comisionUnitaria * planCantidad;

    const newItem: ItemComision = {
      id: `plan-${Date.now()}`,
      categoria: "plan",
      subcategoria: planSubcategoria,
      nombre: planNombreCustom || "Plan de Sistema",
      costoBase: 0,
      precioVenta: Number(planPrecioVenta),
      cantidad: Number(planCantidad),
      porcentajeComision: 30,
      comisionUnitaria,
      comisionTotal,
    };

    const nuevaVenta = createVentaFromItem(newItem, activeProfile.nombre, activeProfile.rucCedula);

    setItems((prev) => [...prev, newItem]);
    setVentasRegistradas((prev) => [nuevaVenta, ...prev]);
    notifyPointsUpdated();
  };

  const handleAddFirma = (e: React.FormEvent) => {
    e.preventDefault();
    const unitPrice = Number(firmaPrecioVenta) || 0;
    const qty = Math.max(1, Number(firmaCantidad) || 1);
    if (unitPrice <= 0 || qty <= 0) return;

    const activePartnerName = getActivePartnerName();
    const loggedUserEmail = sessionStorage.getItem("godi_user_email") || "";
    const loggedUserCode = sessionStorage.getItem("godi_user_code") || "";
    const loggedUserRole = sessionStorage.getItem("godi_user") || "";

    const sellerName = activePartnerName || "Socio Registrado";
    const clienteName = firmaClienteNombre.trim() || "Cliente Firma Electrónica";
    const clienteCedula = firmaClienteCedula.trim() || "1700000000";

    const nuevaVenta: VentaRegistrada & { userEmail?: string; userCode?: string; userRole?: string; vendedor?: string; socioNombre?: string } = {
      id: `v-${Date.now()}`,
      nombreCliente: clienteName,
      cedulaCliente: clienteCedula,
      productoId: `firma-${firmaVigencia.replace(/\s+/g, "_")}`,
      nombreProducto: `Firma Electrónica (${firmaTipo}) - ${firmaVigencia}`,
      categoriaProducto: "firma",
      precioUnitario: unitPrice,
      cantidad: qty,
      totalVenta: unitPrice * qty,
      fechaRegistro: new Date().toLocaleDateString("es-EC"),
      adminResponsable: sellerName,
      vendedor: sellerName,
      socioNombre: sellerName,
      userEmail: loggedUserEmail,
      userCode: loggedUserCode,
      userRole: loggedUserRole,
    };

    setVentasRegistradas((prev) => [nuevaVenta, ...prev]);
    notifyPointsUpdated();

    // Reset customer fields
    setFirmaClienteNombre("");
    setFirmaClienteCedula("");

    // Sync sale to Google Sheets automatically
    syncVentaToGoogleSheets({
      id: nuevaVenta.id,
      fecha: nuevaVenta.fechaRegistro,
      nombreCliente: nuevaVenta.nombreCliente,
      cedulaCliente: nuevaVenta.cedulaCliente,
      producto: nuevaVenta.nombreProducto,
      cantidad: nuevaVenta.cantidad,
      totalVenta: nuevaVenta.totalVenta,
      vendedor: nuevaVenta.vendedor,
      userEmail: nuevaVenta.userEmail,
      userCode: nuevaVenta.userCode,
      userRole: nuevaVenta.userRole,
      estadoComision: "Pendiente",
    });
  };

  const handleAddAdicional = (e: React.FormEvent) => {
    e.preventDefault();
    if (adicionalPrecioVenta <= 0 || adicionalCantidad <= 0) return;

    const found = ADICIONALES_PRESETS.find((a) => a.id === selectedAdicional);
    const nombreAdicional = found ? `Módulo Adicional: ${found.nombre}` : "Módulo Adicional";

    const comisionUnitaria = adicionalPrecioVenta * 0.3;
    const comisionTotal = comisionUnitaria * adicionalCantidad;

    const newItem: ItemComision = {
      id: `adicional-${Date.now()}`,
      categoria: "adicional",
      nombre: nombreAdicional,
      costoBase: 0,
      precioVenta: Number(adicionalPrecioVenta),
      cantidad: Number(adicionalCantidad),
      porcentajeComision: 30,
      comisionUnitaria,
      comisionTotal,
    };

    const nuevaVenta = createVentaFromItem(newItem, activeProfile.nombre, activeProfile.rucCedula);

    setItems((prev) => [...prev, newItem]);
    setVentasRegistradas((prev) => [nuevaVenta, ...prev]);
    notifyPointsUpdated();
  };

  const handleUpdateItem = (id: string, field: "precioVenta" | "cantidad", value: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newQty = field === "cantidad" ? Math.max(1, value) : item.cantidad;
        const newPrecio = field === "precioVenta" ? Math.max(0, value) : item.precioVenta;

        let comisionUnitaria = 0;
        if (item.categoria === "plan" || item.categoria === "adicional") {
          comisionUnitaria = newPrecio * 0.3;
        } else {
          comisionUnitaria = newPrecio - item.costoBase;
        }

        return {
          ...item,
          cantidad: newQty,
          precioVenta: newPrecio,
          comisionUnitaria,
          comisionTotal: comisionUnitaria * newQty,
        };
      })
    );

    setVentasRegistradas((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
        const q = field === "cantidad" ? Math.max(1, value) : v.cantidad;
        const p = field === "precioVenta" ? Math.max(0, value) : v.precioUnitario;
        return {
          ...v,
          cantidad: q,
          precioUnitario: p,
          totalVenta: p * q,
        };
      })
    );
    notifyPointsUpdated();
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setVentasRegistradas((prev) => {
      const updated = prev.filter((v) => v.id !== id);
      try {
        localStorage.setItem("kpier_ventas_registradas", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    deleteVentaFromGoogleSheets(id);
    window.dispatchEvent(new Event("kpier_ventas_updated"));
    notifyPointsUpdated();
  };

  const handleClearAll = () => {
    if (window.confirm("¿Deseas vaciar todos los elementos de la lista de comisiones y registro de ventas?")) {
      if (isGerenciaUser) {
        setItems([]);
        setVentasRegistradas([]);
        try {
          localStorage.setItem("kpier_ventas_registradas", JSON.stringify([]));
        } catch (e) {}
      } else {
        setVentasRegistradas((prev) => {
          const updated = prev.filter((v) => !isVentaBelongingToUser(v));
          try {
            localStorage.setItem("kpier_ventas_registradas", JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      }
      window.dispatchEvent(new Event("kpier_ventas_updated"));
      notifyPointsUpdated();
    }
  };

  // Totals calculations for comisiones sistema (Planes y Adicionales 30%)
  const itemsSistema = items.filter((i) => i.categoria === "plan" || i.categoria === "adicional");

  const totalCantPlanes = itemsSistema
    .filter((i) => i.categoria === "plan")
    .reduce((acc, curr) => acc + curr.cantidad, 0);

  const totalCantFirmas = items
    .filter((i) => i.categoria === "firma")
    .reduce((acc, curr) => acc + curr.cantidad, 0);

  const totalCantAdicionales = itemsSistema
    .filter((i) => i.categoria === "adicional")
    .reduce((acc, curr) => acc + curr.cantidad, 0);

  const totalVentaBruta = itemsSistema.reduce((acc, curr) => acc + curr.precioVenta * curr.cantidad, 0);

  const totalComisionPlanes = itemsSistema
    .filter((i) => i.categoria === "plan")
    .reduce((acc, curr) => acc + curr.comisionTotal, 0);

  const totalComisionAdicionales = itemsSistema
    .filter((i) => i.categoria === "adicional")
    .reduce((acc, curr) => acc + curr.comisionTotal, 0);

  const totalComisionFirmas = items
    .filter((i) => i.categoria === "firma")
    .reduce((acc, curr) => acc + curr.comisionTotal, 0);

  const totalComisionFinal = totalComisionPlanes + totalComisionAdicionales;

  // Partner firm sales for "Comisiones Firmas" tab
  const partnerFirmasVentas = (ventasRegistradas || []).filter((v) => {
    if (!v) return false;
    if (v.categoriaProducto !== "firma") return false;
    if (!isVentaBelongingToUser(v)) return false;
    return true;
  });

  const filteredFirmasVentas = partnerFirmasVentas.filter((v) => {
    const term = (firmaSearchTerm || "").toLowerCase().trim();
    if (!term) return true;
    const nombre = (v.nombreCliente || "").toLowerCase();
    const cedula = v.cedulaCliente || "";
    const producto = (v.nombreProducto || "").toLowerCase();
    return nombre.includes(term) || cedula.includes(term) || producto.includes(term);
  });

  const totalFirmasCount = partnerFirmasVentas.reduce((acc, v) => acc + (v.cantidad || 1), 0);
  const totalFirmasFacturado = partnerFirmasVentas.reduce((acc, v) => acc + (v.totalVenta || 0), 0);
  const totalFirmasGanancia = partnerFirmasVentas.reduce((acc, v) => {
    let vigKey = "1 Año";
    for (const key of Object.keys(FIRMA_BASE_COSTS)) {
      if (v.nombreProducto?.toLowerCase().includes(key.toLowerCase())) {
        vigKey = key;
        break;
      }
    }
    const costoBase = FIRMA_BASE_COSTS[vigKey]?.costoBase || 8.99;
    const precio = v.precioUnitario || (v.totalVenta / (v.cantidad || 1));
    const gananciaUnitaria = Math.max(0, precio - costoBase);
    return acc + gananciaUnitaria * (v.cantidad || 1);
  }, 0);

  // Direct PDF Download Handler (uses socio profile and current liquidation date automatically)
  const handleDownloadPDF = async () => {
    const reportElement = document.getElementById("printable-commission-report");
    if (!reportElement) return;

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

      const socioNombre = activeProfile.nombre || "Socio";
      const safeName = socioNombre.trim().replace(/[^a-zA-Z0-9_\-]/g, "_");
      const safeFecha = (todayDateISO || new Date().toISOString().split("T")[0]).replace(/[^a-zA-Z0-9_\-]/g, "_");
      const filename = `Reporte_Comisiones_${safeName}_${safeFecha}.pdf`;

      pdf.save(filename);
      trackActivity("resumen_comision_impreso", `Resumen de comisión: ${socioNombre}`);
    } catch (error) {
      console.error("Error al generar PDF con jsPDF:", error);
      trackActivity("resumen_comision_impreso", `Resumen de comisión (impresión): ${activeProfile.nombre}`);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Filtered sales with user isolation
  const filteredVentas = (ventasRegistradas || []).filter((v) => {
    if (!v) return false;

    if (!isVentaBelongingToUser(v)) return false;

    const term = (vSearchTerm || "").toLowerCase();
    const nombre = (v.nombreCliente || "").toLowerCase();
    const cedula = v.cedulaCliente || "";
    const producto = (v.nombreProducto || "").toLowerCase();
    return nombre.includes(term) || cedula.includes(term) || producto.includes(term);
  });

  // Filtered real socios excluding demo users
  const realSocios = (sociosRegistrados || []).filter((s) => {
    if (!s) return false;
    const sName = (s.nombreApellido || "").toLowerCase().trim();
    return !(
      sName.includes("carlos andrade") ||
      sName.includes("carlos andres") ||
      sName.includes("sofía mendoza") ||
      sName.includes("sofia mendoza") ||
      sName.includes("roberto gómez") ||
      sName.includes("roberto gomez")
    );
  });

  // Displayed socios: For partner profile (!isGerenciaUser), fill up to 10 with random filler mock socios.
  // As real partners are added, real partners take top slots and mock filler partners disappear!
  const displayedSocios = useMemo(() => {
    if (isGerenciaUser) {
      const term = (sSearchTerm || "").toLowerCase();
      return realSocios.filter((s) => {
        const nombre = (s.nombreApellido || "").toLowerCase();
        const cedula = s.cedulaTelefono || "";
        return nombre.includes(term) || cedula.includes(term);
      });
    }

    // Partner profile (!isGerenciaUser):
    const realList = realSocios.slice(0, 10);
    const neededFiller = Math.max(0, 10 - realList.length);
    const fillerList = MOCK_RANDOM_SOCIOS.slice(0, neededFiller);
    const combined = [...realList, ...fillerList];

    if (!sSearchTerm) return combined;

    const term = sSearchTerm.toLowerCase();
    return combined.filter((s) => {
      const nombre = (s.nombreApellido || "").toLowerCase();
      const cedula = s.cedulaTelefono || "";
      return nombre.includes(term) || cedula.includes(term);
    });
  }, [isGerenciaUser, realSocios, sSearchTerm]);

  const filteredSocios = displayedSocios;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ========================================================================= */}
      {/* PESTAÑA 1: COMISIONES SISTEMA (Planes y Adicionales 30% con Reporte PDF) */}
      {/* ========================================================================= */}
      {(activeSubTab === "comisiones" || activeSubTab === "comisiones_sistema") && (
        <div className="space-y-6 animate-fade-in">
          {/* Resumen Informativo del Socio & Fecha de Liquidación Actual */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Liquidación de Comisiones — Perfil del Socio</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Datos tomados automáticamente del perfil verificado para la emisión del reporte</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Socio Activo: {activeProfile.code || "Verificado"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
                  Nombre del Socio
                </span>
                <div className="flex items-center gap-2 text-slate-900 font-black text-xs truncate">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{activeProfile.nombre || "Socio Registrado"}</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
                  Cédula / RUC
                </span>
                <div className="flex items-center gap-2 text-slate-900 font-black text-xs">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{activeProfile.rucCedula || "No registrada en perfil"}</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
                  Fecha de Solicitud
                </span>
                <div className="flex items-center gap-2 text-slate-900 font-black text-xs">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-emerald-700">{todayDateFormatted} (Hoy)</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Período a Liquidar ({currentYear})
                </label>
                <select
                  value={mesSeleccionado}
                  onChange={(e) => {
                    const newMonth = e.target.value;
                    setMesSeleccionado(newMonth);
                    setObservaciones(`Comisiones ${newMonth} ${currentYear}`);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>
                      {m} {currentYear}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {activeProfile.banco && (
              <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-600 bg-emerald-50/50 border border-emerald-100 rounded-xl px-3 py-2">
                <span className="font-extrabold text-emerald-800 uppercase text-[10px]">Cuenta Registrada:</span>
                <span className="font-bold text-slate-800">{activeProfile.banco}</span>
                <span className="text-slate-400">•</span>
                <span>{activeProfile.tipoCuenta}</span>
                <span className="text-slate-400">•</span>
                <span className="font-mono font-bold text-slate-800">N° {activeProfile.numeroCuenta}</span>
                <span className="text-slate-400">•</span>
                <span>Titular: {activeProfile.titularCuenta || activeProfile.nombre}</span>
              </div>
            )}
          </div>

          {/* List & Summary Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>Detalle de Ventas a Comisionar (Planes & Adicionales) ({itemsSistema.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500">Comisión del 30% calculada directamente sobre las ventas registradas del sistema</p>
                </div>

                {itemsSistema.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Vaciar Lista</span>
                  </button>
                )}
              </div>

              {itemsSistema.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-3">
                  <Calculator className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-600">No hay ventas de planes o adicionales registradas aún.</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Las ventas registradas de Planes UpConta y Módulos Adicionales aparecerán automáticamente aquí para su liquidación.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <th className="p-3 rounded-l-lg">Item / Descripción</th>
                        <th className="p-3">Categoría</th>
                        <th className="p-3 text-center">Cant.</th>
                        <th className="p-3 text-right">Precio Venta</th>
                        <th className="p-3 text-right">Comisión (30%)</th>
                        <th className="p-3 text-center rounded-r-lg">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {itemsSistema.map((item, idx) => (
                        <tr key={item.id ? `${item.id}-${idx}` : `com-item-${idx}`} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-extrabold text-slate-900">
                            <div>{item.nombre}</div>
                          </td>

                          <td className="p-3">
                            {item.categoria === "plan" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 font-black text-[10px] rounded-md uppercase">
                                Plan 30%
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-800 font-black text-[10px] rounded-md uppercase">
                                Adicional 30%
                              </span>
                            )}
                          </td>

                          <td className="p-3 text-center">
                            <input
                              type="number"
                              min="1"
                              value={item.cantidad}
                              onChange={(e) => handleUpdateItem(item.id, "cantidad", parseInt(e.target.value) || 1)}
                              className="w-14 text-center py-1 bg-slate-100 border border-slate-200 rounded-lg font-extrabold text-slate-900 focus:bg-white focus:outline-none"
                            />
                          </td>

                          <td className="p-3 text-right">
                            <div className="inline-flex items-center gap-1 justify-end">
                              <span className="text-slate-400 font-bold">$</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.precioVenta}
                                onChange={(e) => handleUpdateItem(item.id, "precioVenta", parseFloat(e.target.value) || 0)}
                                className="w-20 text-right py-1 px-1.5 bg-slate-100 border border-slate-200 rounded-lg font-extrabold text-slate-900 focus:bg-white focus:outline-none"
                              />
                            </div>
                          </td>

                          <td className="p-3 text-right font-black text-emerald-600 text-sm">
                            +${item.comisionTotal.toFixed(2)}
                          </td>

                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Total Summary Box */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-extrabold text-white text-base">Resumen de Comisión</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800 text-slate-300">
                    <span>Planes Vendidos:</span>
                    <span className="font-bold text-white text-sm">{totalCantPlanes} unidades</span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800 text-slate-300">
                    <span>Adicionales Vendidos:</span>
                    <span className="font-bold text-white text-sm">{totalCantAdicionales} unidades</span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800 text-slate-300">
                    <span>Venta Total Bruta:</span>
                    <span className="font-bold text-white text-sm">${totalVentaBruta.toFixed(2)} USD</span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800 text-blue-300">
                    <span>Comisión por Planes (30%):</span>
                    <span className="font-extrabold text-blue-400 text-sm">+${totalComisionPlanes.toFixed(2)} USD</span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800 text-purple-300">
                    <span>Comisión por Adicionales (30%):</span>
                    <span className="font-extrabold text-purple-400 text-sm">+${totalComisionAdicionales.toFixed(2)} USD</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-5 rounded-2xl text-white shadow-lg text-center space-y-1">
                  <span className="text-[11px] uppercase font-black tracking-widest text-emerald-100">
                    VALOR TOTAL A COMISIONAR
                  </span>
                  <div className="text-3xl font-black text-white drop-shadow-xs">
                    ${totalComisionFinal.toFixed(2)} USD
                  </div>
                  <p className="text-[10px] text-emerald-100 font-medium pt-1">
                    Aprobado para pago
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPdf}
                  className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isGeneratingPdf ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generando PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Generar Reporte PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA: COMISIONES FIRMAS (Calculadora y Detalle de Ventas de Firmas)   */}
      {/* ========================================================================= */}
      {activeSubTab === "comisiones_firmas" && (
        <div className="space-y-6 animate-fade-in">
          {/* Calculadora de Comisión — Firma Electrónica */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">Calculadora de Comisión — Firma Electrónica</h3>
                  <p className="text-xs font-semibold text-slate-500">
                    Calcula la ganancia y comisión por firma electrónica en tiempo real (Comisión = Precio Venta − Costo Base)
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleAddFirma} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Vigencia */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Vigencia de Firma
                  </label>
                  <select
                    value={firmaVigencia}
                    onChange={(e) => handleFirmaVigenciaChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    {Object.entries(FIRMA_BASE_COSTS).map(([v, config]) => (
                      <option key={v} value={v}>
                        {v} — Costo Base: ${config.costoBase.toFixed(2)} USD
                      </option>
                    ))}
                  </select>
                </div>

                {/* Formato de Firma */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Formato de Firma
                  </label>
                  <select
                    value="Archivo .p12"
                    disabled
                    className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-not-allowed"
                  >
                    <option value="Archivo .p12">Archivo digital (.p12)</option>
                  </select>
                </div>

                {/* Precio Venta */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Precio Venta ($)
                  </label>
                  <div className="relative">
                    <span className="text-slate-400 font-bold text-xs absolute left-3 top-1/2 -translate-y-1/2">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      value={firmaPrecioVenta}
                      onChange={(e) => setFirmaPrecioVenta(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Cantidad */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={firmaCantidad}
                    onChange={(e) => setFirmaCantidad(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Resumen de Comisión (Calculadora Vivo) */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Costo Base Unit.</div>
                  <div className="text-sm font-extrabold text-slate-800">
                    ${(FIRMA_BASE_COSTS[firmaVigencia]?.costoBase || 0).toFixed(2)} USD
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Precio Venta Unit.</div>
                  <div className="text-sm font-extrabold text-slate-900">
                    ${(Number(firmaPrecioVenta) || 0).toFixed(2)} USD
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">Ganancia / Unidad</div>
                  <div className="text-sm font-black text-emerald-700">
                    +${Math.max(0, (Number(firmaPrecioVenta) || 0) - (FIRMA_BASE_COSTS[firmaVigencia]?.costoBase || 0)).toFixed(2)} USD
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xs p-2.5 rounded-lg border border-emerald-200 text-right">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900">Comisión Total (x{firmaCantidad})</div>
                  <div className="text-base font-black text-emerald-600">
                    +${(Math.max(0, (Number(firmaPrecioVenta) || 0) - (FIRMA_BASE_COSTS[firmaVigencia]?.costoBase || 0)) * firmaCantidad).toFixed(2)} USD
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-[#0B2545] hover:bg-[#133E72] text-white font-black rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>Registrar Venta de Firma</span>
                </button>
              </div>
            </form>
          </div>

          {/* Detalle de Ventas de Firmas (Consulta del Socio) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-600" />
                  <span>Detalle de Ventas de Firmas (Consulta del Socio) ({filteredFirmasVentas.length})</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Historial de firmas electrónicas emitidas y comisiones generadas para consulta exclusiva del socio.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={firmaSearchTerm}
                  onChange={(e) => setFirmaSearchTerm(e.target.value)}
                  placeholder="Buscar firma o cliente..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {filteredFirmasVentas.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-3">
                <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-600">No hay ventas de firmas registradas aún.</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Utiliza la calculadora superior para registrar una venta de firma electrónica.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <th className="p-3 rounded-l-lg">Fecha</th>
                      <th className="p-3">Cliente</th>
                      <th className="p-3">Tipo / Vigencia</th>
                      <th className="p-3 text-center">Cant.</th>
                      <th className="p-3 text-right">Precio Venta</th>
                      <th className="p-3 text-right">Costo Base</th>
                      <th className="p-3 text-right">Ganancia Neta</th>
                      <th className="p-3 text-right">Total Venta</th>
                      <th className="p-3 text-center rounded-r-lg">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredFirmasVentas.map((v, idx) => {
                      let vigKey = "1 Año";
                      for (const key of Object.keys(FIRMA_BASE_COSTS)) {
                        if (v.nombreProducto?.toLowerCase().includes(key.toLowerCase())) {
                          vigKey = key;
                          break;
                        }
                      }
                      const costoBase = FIRMA_BASE_COSTS[vigKey]?.costoBase || 8.99;
                      const unitPrice = v.precioUnitario || (v.totalVenta / (v.cantidad || 1));
                      const gananciaUnitaria = Math.max(0, unitPrice - costoBase);
                      const gananciaTotal = gananciaUnitaria * (v.cantidad || 1);

                      return (
                        <tr key={v.id || `firma-venta-${idx}`} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-bold text-slate-600 whitespace-nowrap">
                            {v.fechaRegistro}
                          </td>
                          <td className="p-3 font-extrabold text-slate-900">
                            <div>{v.nombreCliente || "Cliente Firma"}</div>
                            {v.cedulaCliente && (
                              <div className="text-[10px] text-slate-400 font-normal">
                                CI/RUC: {v.cedulaCliente}
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-900 font-black text-[10px] rounded-md">
                              {v.nombreProducto || "Firma Electrónica"}
                            </span>
                          </td>
                          <td className="p-3 text-center font-bold text-slate-800">
                            {v.cantidad || 1}
                          </td>
                          <td className="p-3 text-right font-extrabold text-slate-900">
                            ${unitPrice.toFixed(2)}
                          </td>
                          <td className="p-3 text-right font-bold text-slate-500">
                            ${costoBase.toFixed(2)}
                          </td>
                          <td className="p-3 text-right font-black text-emerald-600 text-sm">
                            +${gananciaTotal.toFixed(2)}
                          </td>
                          <td className="p-3 text-right font-extrabold text-slate-900">
                            ${(v.totalVenta || 0).toFixed(2)}
                          </td>
                          <td className="p-3 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                              Registrada
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 2: REGISTRO DE VENTAS                                            */}
      {/* ========================================================================= */}
      {activeSubTab === "registro_ventas" && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Banner & Stats (Gerencia only) */}
          {isGerenciaUser && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Ventas Registradas</p>
                  <p className="text-2xl font-black text-slate-900">{ventasRegistradas.length} ventas</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <PackageCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unidades Vendidas</p>
                  <p className="text-2xl font-black text-slate-900">
                    {ventasRegistradas.reduce((acc, v) => acc + v.cantidad, 0)} items
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monto Recaudado</p>
                  <p className="text-2xl font-black text-emerald-600">
                    ${ventasRegistradas.reduce((acc, v) => acc + v.totalVenta, 0).toFixed(2)} USD
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Registrar Nueva Venta</h3>
                  <p className="text-xs text-slate-500">
                    Ingresa los datos del cliente obligatorios y selecciona el producto o adicional.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleAddVenta} className="space-y-5">
              {/* Mandatory Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                    Nombre Completo del Cliente <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={vNombreCliente}
                      onChange={(e) => {
                        setVNombreCliente(e.target.value);
                        if (e.target.value.trim()) setVErrors((prev) => ({ ...prev, nombre: undefined }));
                      }}
                      placeholder="Ej. Comercializadora Quito S.A."
                      className={`w-full pl-9 pr-3 py-2 bg-white border ${
                        vErrors.nombre ? "border-red-500 bg-red-50/30" : "border-slate-200"
                      } rounded-xl text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none`}
                    />
                  </div>
                  {vErrors.nombre && (
                    <p className="text-[11px] font-bold text-red-600 mt-1">{vErrors.nombre}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                    Cédula / RUC del Cliente <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={13}
                      value={vCedulaCliente}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                        setVCedulaCliente(val);
                        if (val.length >= 10 && val.length <= 13) {
                          setVErrors((prev) => ({ ...prev, cedula: undefined }));
                        }
                      }}
                      placeholder="10 a 13 dígitos..."
                      className={`w-full pl-9 pr-3 py-2 bg-white border ${
                        vErrors.cedula ? "border-red-500 bg-red-50/30" : "border-slate-200"
                      } rounded-xl text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none`}
                    />
                  </div>
                  {vErrors.cedula ? (
                    <p className="text-[11px] font-bold text-red-600 mt-1">{vErrors.cedula}</p>
                  ) : (
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">Obligatorio (10 a 13 caracteres)</p>
                  )}
                </div>
              </div>

              {/* Product Category Selector, Item Pick, Price & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
                {/* Category Selector */}
                <div className="lg:col-span-3">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Tipo de Producto
                  </label>
                  <select
                    value={vCategoria}
                    onChange={(e) => handleVCategoriaChange(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="facturacion">Planes Facturación</option>
                    <option value="erp">Planes ERP</option>
                    <option value="contador">Planes Contadores</option>
                    <option value="adicional">Módulos Adicionales</option>
                  </select>
                </div>

                {/* Specific Item Pick */}
                <div className="lg:col-span-4">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Seleccionar Plan / Adicional
                  </label>
                  <select
                    value={vProductoId}
                    onChange={(e) => handleVProductoChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    {vCategoria === "adicional"
                      ? ADICIONALES_PRESETS.map((a) => (
                          <option key={a.id} value={a.id}>
                            Módulo {a.nombre} — ${a.precio.toFixed(2)} USD
                          </option>
                        ))
                      : PLAN_PRESETS.filter((p) => p.categoria === vCategoria).map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nombre} — ${p.precio.toFixed(2)} USD
                          </option>
                        ))}
                  </select>
                </div>

                {/* Editable Unit Price Textbox */}
                <div className="lg:col-span-3">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Valor del Plan ($)
                  </label>
                  <div className="relative">
                    <span className="text-slate-400 font-bold text-xs absolute left-3 top-1/2 -translate-y-1/2">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={vPrecioUnitario}
                      onChange={(e) => setVPrecioUnitario(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Quantity */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Cantidad
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setVCantidad((q) => Math.max(1, q - 1))}
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black text-xs transition-all cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={vCantidad}
                      onChange={(e) => setVCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full text-center py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:bg-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setVCantidad((q) => q + 1)}
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black text-xs transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Price Summary & Submit */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-blue-50/60 border border-blue-200/80 p-4 rounded-xl">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-3">
                  <span>Precio Unitario: <strong className="text-slate-900">${(Number(vPrecioUnitario) || 0).toFixed(2)} USD</strong></span>
                  <span className="text-slate-300">|</span>
                  <span>Total Venta: <strong className="text-emerald-700 text-sm font-black">${((Number(vPrecioUnitario) || 0) * vCantidad).toFixed(2)} USD</strong></span>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#0B2545] hover:bg-[#133E72] text-white font-black rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>Agregar Venta al Registro</span>
                </button>
              </div>
            </form>
          </div>

          {/* Table Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Tabla de Registro de Ventas ({filteredVentas.length})</span>
                </h3>
                <p className="text-xs text-slate-500">Historial completo de clientes y productos registrados</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={vSearchTerm}
                  onChange={(e) => setVSearchTerm(e.target.value)}
                  placeholder="Buscar cliente, RUC o plan..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {filteredVentas.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-2">
                <ShoppingCart className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-600">No hay ventas registradas aún.</p>
                <p className="text-xs text-slate-400">Completa el formulario anterior para agregar ventas al listado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <th className="p-3 rounded-l-lg">Cliente</th>
                      <th className="p-3">Cédula / RUC</th>
                      <th className="p-3">Producto / Plan</th>
                      <th className="p-3 text-center">Cant.</th>
                      <th className="p-3 text-right">Precio Unit.</th>
                      <th className="p-3 text-right">Total Venta</th>
                      <th className="p-3 text-center">Fecha</th>
                      <th className="p-3 text-center rounded-r-lg">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredVentas.map((venta, idx) => (
                      <tr key={venta.id ? `${venta.id}-${idx}` : `venta-${idx}`} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-extrabold text-slate-900">{venta.nombreCliente}</td>
                        <td className="p-3 font-mono font-bold text-slate-700">{venta.cedulaCliente}</td>
                        <td className="p-3">
                          <div className="font-extrabold text-slate-800">{venta.nombreProducto}</div>
                          <span className="text-[10px] uppercase font-bold text-slate-400">{venta.categoriaProducto}</span>
                        </td>
                        <td className="p-3 text-center font-bold text-slate-900">{venta.cantidad}</td>
                        <td className="p-3 text-right font-medium text-slate-700">${venta.precioUnitario.toFixed(2)}</td>
                        <td className="p-3 text-right font-black text-emerald-600 text-sm">
                          ${venta.totalVenta.toFixed(2)}
                        </td>
                        <td className="p-3 text-center font-bold text-slate-500 text-[11px]">{venta.fechaRegistro}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setSelectedVentaToDelete(venta)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                            title="Eliminar registro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 3: REGISTRO DE SOCIOS                                            */}
      {/* ========================================================================= */}
      {activeSubTab === "registro_socios" && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Banner & Stats (Gerencia only) */}
          {isGerenciaUser && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Socios Registrados</p>
                  <p className="text-2xl font-black text-slate-900">{sociosRegistrados.length} socios</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Socios Red MLM</p>
                  <p className="text-2xl font-black text-slate-900">
                    {sociosRegistrados.filter((s) => s.esMlm).length} activos
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Distribuidores Firmas</p>
                  <p className="text-2xl font-black text-slate-900">
                    {sociosRegistrados.filter((s) => s.esDistribuidorFirmas).length} activos
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Registrar Nuevo Socio</h3>
                  <p className="text-xs text-slate-500">
                    Ingresa el Nombre y Apellido y elige si el socio es MLM, Distribuidor Firmas o ambos.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleAddSocio} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nombre y Apellido (Un solo cuadro de texto) */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                    Nombre y Apellido del Socio <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={sNombreApellido}
                      onChange={(e) => {
                        setSNombreApellido(e.target.value);
                        if (e.target.value.trim()) setSErrors((prev) => ({ ...prev, nombre: undefined }));
                      }}
                      placeholder="Ej. Juan Pablo Moreno Jaramillo"
                      className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border ${
                        sErrors.nombre ? "border-red-500 bg-red-50/30" : "border-slate-200"
                      } rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none`}
                    />
                  </div>
                  {sErrors.nombre && (
                    <p className="text-[11px] font-bold text-red-600 mt-1">{sErrors.nombre}</p>
                  )}
                </div>

                {/* Cédula o RUC (10 a 13 caracteres) */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                    Cédula o RUC <span className="text-red-500">*</span>
                    <span className="text-[10px] text-slate-400 font-normal lowercase ml-1">(10 a 13 digitos)</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={13}
                      value={sCedulaRuc}
                      onChange={(e) => {
                        setSCedulaRuc(e.target.value);
                        if (e.target.value.trim()) setSErrors((prev) => ({ ...prev, cedulaRuc: undefined }));
                      }}
                      placeholder="Ej. 1718293041001"
                      className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border ${
                        sErrors.cedulaRuc ? "border-red-500 bg-red-50/30" : "border-slate-200"
                      } rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none font-mono`}
                    />
                  </div>
                  {sErrors.cedulaRuc && (
                    <p className="text-[11px] font-bold text-red-600 mt-1">{sErrors.cedulaRuc}</p>
                  )}
                </div>

                {/* Teléfono de Contacto (Máximo 10 caracteres) */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                    Número de Teléfono <span className="text-red-500">*</span>
                    <span className="text-[10px] text-slate-400 font-normal lowercase ml-1">(máx 10 dígitos)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={10}
                      value={sTelefono}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setSTelefono(val);
                        if (val.trim()) setSErrors((prev) => ({ ...prev, telefono: undefined }));
                      }}
                      placeholder="Ej. 0991234567"
                      className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border ${
                        sErrors.telefono ? "border-red-500 bg-red-50/30" : "border-slate-200"
                      } rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none font-mono`}
                    />
                  </div>
                  {sErrors.telefono && (
                    <p className="text-[11px] font-bold text-red-600 mt-1">{sErrors.telefono}</p>
                  )}
                </div>

                {/* Correo Electrónico */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                    Correo Electrónico <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={sEmail}
                      onChange={(e) => {
                        setSEmail(e.target.value);
                        if (e.target.value.trim()) setSErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      placeholder="Ej. juan.moreno@ejemplo.com"
                      className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border ${
                        sErrors.email ? "border-red-500 bg-red-50/30" : "border-slate-200"
                      } rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none`}
                    />
                  </div>
                  {sErrors.email && (
                    <p className="text-[11px] font-bold text-red-600 mt-1">{sErrors.email}</p>
                  )}
                </div>
              </div>

              {/* Socio Profile Selection Options - Solo visible para Gerencia */}
              {isGerenciaUser && (
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Tipo / Perfil de Socio <span className="text-red-500">*</span>
                    <span className="text-[11px] font-medium text-slate-400 normal-case ml-2">
                      (Puedes seleccionar solo 1 o ambos perfiles)
                    </span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* MLM Option */}
                    <label
                      onClick={() => setSEsMlm(!sEsMlm)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
                        sEsMlm
                          ? "bg-blue-50/80 border-blue-600 text-blue-950 shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          sEsMlm ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 bg-white"
                        }`}
                      >
                        {sEsMlm && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-extrabold text-xs uppercase tracking-wider">Socio MLM (Red)</div>
                        <div className="text-[11px] font-medium text-slate-500">
                          Acceso a la red de mercadeo y referidos
                        </div>
                      </div>
                    </label>

                    {/* Distribuidor Firmas Option */}
                    <label
                      onClick={() => setSEsDistribuidorFirmas(!sEsDistribuidorFirmas)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
                        sEsDistribuidorFirmas
                          ? "bg-amber-50/80 border-amber-600 text-amber-950 shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          sEsDistribuidorFirmas ? "bg-amber-600 border-amber-600 text-white" : "border-slate-300 bg-white"
                        }`}
                      >
                        {sEsDistribuidorFirmas && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-extrabold text-xs uppercase tracking-wider">Distribuidor de Firmas</div>
                        <div className="text-[11px] font-medium text-slate-500">
                          Venta directa de firmas electrónicas
                        </div>
                      </div>
                    </label>
                  </div>

                  {sErrors.perfil && (
                    <p className="text-[11px] font-bold text-red-600 mt-1">{sErrors.perfil}</p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#0B2545] hover:bg-[#133E72] text-white font-black rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>Agregar Socio al Sistema</span>
                </button>
              </div>
            </form>
          </div>

          {/* Table Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span>
                    {isGerenciaUser
                      ? `Tabla de Registro de Socios (${filteredSocios.length})`
                      : `Últimos 10 Socios Registrados (${filteredSocios.length})`}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  {isGerenciaUser
                    ? "Listado general de socios MLM y distribuidores de firmas"
                    : "Listado de los últimos socios incorporados a la red KPIer"}
                </p>
              </div>

              {isGerenciaUser && (
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={sSearchTerm}
                    onChange={(e) => setSSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre o teléfono..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              )}
            </div>

            {filteredSocios.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-2">
                <Users className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-600">No hay socios registrados aún.</p>
                <p className="text-xs text-slate-400">Completa el formulario anterior para registrar socios en el sistema.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <th className="p-3 rounded-l-lg">Nombre del Socio</th>
                      {isGerenciaUser && <th className="p-3">Cédula / Teléfono</th>}
                      {isGerenciaUser && <th className="p-3">Perfil de Socio</th>}
                      {isGerenciaUser && <th className="p-3 text-center">Fecha Registro</th>}
                      <th className={`p-3 text-center ${!isGerenciaUser ? "rounded-r-lg" : ""}`}>Estado Activo</th>
                      {isGerenciaUser && <th className="p-3 text-center rounded-r-lg">Acción</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSocios.map((socio, idx) => (
                      <tr key={socio.id ? `${socio.id}-${idx}` : `socio-${idx}`} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-extrabold text-slate-900">{socio.nombreApellido}</td>
                        {isGerenciaUser && <td className="p-3 font-mono font-bold text-slate-700">{socio.cedulaTelefono}</td>}
                        {isGerenciaUser && (
                          <td className="p-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {socio.esMlm && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 font-black text-[10px] rounded-lg uppercase">
                                  MLM (Red)
                                </span>
                              )}
                              {socio.esDistribuidorFirmas && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-900 font-black text-[10px] rounded-lg uppercase">
                                  Distribuidor Firmas
                                </span>
                              )}
                            </div>
                          </td>
                        )}
                        {isGerenciaUser && <td className="p-3 text-center font-bold text-slate-500 text-[11px]">{socio.fechaRegistro}</td>}
                        <td className="p-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 font-black text-[10px] rounded-md uppercase border ${
                              socio.estado === "Por Activar" || (socio.estado as string) === "por_activar"
                                ? "bg-amber-100 text-amber-900 border-amber-300"
                                : socio.estado === "Inactivo"
                                ? "bg-rose-100 text-rose-800 border-rose-200"
                                : "bg-emerald-100 text-emerald-800 border-emerald-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                socio.estado === "Por Activar" || (socio.estado as string) === "por_activar"
                                  ? "bg-amber-500 animate-pulse"
                                  : socio.estado === "Inactivo"
                                  ? "bg-rose-500"
                                  : "bg-emerald-500"
                              }`}
                            ></span>
                            {socio.estado === "por_activar" ? "Por Activar" : socio.estado || "Activo"}
                          </span>
                        </td>
                        {isGerenciaUser && (
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {(socio.estado === "Por Activar" || (socio.estado as string) === "por_activar") && (
                                <button
                                  onClick={() => handleOpenActivateModal(socio)}
                                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[10px] rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1 animate-pulse"
                                  title="Registrar socio activándolo y enviando a Google Sheets"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Registrar Socio</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteSocio(socio.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                                title="Eliminar socio"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HIDDEN PRINTABLE REPORT TEMPLATE FOR DIRECT PDF GENERATION */}
      <div style={{ position: "fixed", left: "-9999px", top: "-9999px", width: "800px", pointerEvents: "none", zIndex: -1 }}>
        <div
          id="printable-commission-report"
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
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{ fontSize: "28px", fontWeight: "900", color: "#0B2545", letterSpacing: "-0.5px" }}>
                GoDi
              </span>
              <div>
                <h1 style={{ fontSize: "18px", fontWeight: "900", color: "#0B2545", margin: 0, textTransform: "uppercase" }}>
                  REPORTE DE LIQUIDACIÓN DE COMISIONES
                </h1>
                <p style={{ fontSize: "11px", color: "#64748b", margin: "2px 0 0 0", fontWeight: "bold" }}>
                  SISTEMA DE GESTIÓN KPIer — ASESORES &amp; DISTRIBUIDORES
                </p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "10px", fontWeight: "bold", color: "#475569", display: "block" }}>
                FECHA EMISIÓN:
              </span>
              <span style={{ fontSize: "12px", fontWeight: "900", color: "#0f172a" }}>
                {todayDateFormatted}
              </span>
            </div>
          </div>

          {/* Info Box */}
          <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", fontSize: "12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <strong style={{ color: "#475569", fontSize: "10px", textTransform: "uppercase", display: "block" }}>DISTRIBUIDOR / ASESOR:</strong>
                <span style={{ fontSize: "14px", fontWeight: "900", color: "#0B2545" }}>{activeProfile.nombre || "SOCIO REGISTRADO"}</span>
              </div>
              <div>
                <strong style={{ color: "#475569", fontSize: "10px", textTransform: "uppercase", display: "block" }}>CÉDULA / RUC:</strong>
                <span style={{ fontSize: "14px", fontWeight: "900", color: "#0B2545" }}>{activeProfile.rucCedula || "NO REGISTRADA"}</span>
              </div>
              <div>
                <strong style={{ color: "#475569", fontSize: "10px", textTransform: "uppercase", display: "block" }}>PERÍODO LIQUIDADO:</strong>
                <span style={{ fontSize: "12px", fontWeight: "bold", color: "#334155" }}>{mesSeleccionado} {currentYear}</span>
              </div>
              <div>
                <strong style={{ color: "#475569", fontSize: "10px", textTransform: "uppercase", display: "block" }}>DESCRIPCIÓN / OBSERVACIONES:</strong>
                <span style={{ fontSize: "12px", fontWeight: "bold", color: "#334155" }}>{observaciones}</span>
              </div>
            </div>
          </div>

          {/* Table Items */}
          <div style={{ marginBottom: "16px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
              <thead>
                <tr style={{ backgroundColor: "#0B2545", color: "#ffffff", fontSize: "10px", textTransform: "uppercase" }}>
                  <th style={{ padding: "8px 12px", textAlign: "left", borderRadius: "4px 0 0 0" }}>DESCRIPCIÓN ITEM</th>
                  <th style={{ padding: "8px 12px", textAlign: "left" }}>TIPO</th>
                  <th style={{ padding: "8px 12px", textAlign: "center" }}>CANT.</th>
                  <th style={{ padding: "8px 12px", textAlign: "right" }}>PRECIO VENTA</th>
                  <th style={{ padding: "8px 12px", textAlign: "right", borderRadius: "0 4px 0 0" }}>COMISIÓN TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "16px", textAlign: "center", color: "#64748b" }}>
                      No hay items registrados.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={item.id ? `${item.id}-pdf-${idx}` : `pdf-item-${idx}`} style={{ borderBottom: "1px solid #e2e8f0", backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                      <td style={{ padding: "9px 12px", border: "1px solid #e2e8f0", fontWeight: "bold", color: "#0f172a" }}>
                        {item.nombre} {item.vigencia ? `(${item.vigencia})` : ""}
                      </td>
                      <td style={{ padding: "9px 12px", border: "1px solid #e2e8f0", color: "#475569", fontWeight: "700", fontSize: "10px", textTransform: "uppercase" }}>
                        {item.categoria === "plan" ? "PLAN (30%)" : item.categoria === "adicional" ? "ADICIONAL (30%)" : "FIRMA (MARGEN)"}
                      </td>
                      <td style={{ padding: "9px 12px", border: "1px solid #e2e8f0", textAlign: "center", fontWeight: "bold", color: "#0f172a", fontSize: "12px" }}>{item.cantidad}</td>
                      <td style={{ padding: "9px 12px", border: "1px solid #e2e8f0", textAlign: "right", color: "#0f172a", fontSize: "12px" }}>${item.precioVenta.toFixed(2)}</td>
                      <td style={{ padding: "9px 12px", border: "1px solid #e2e8f0", textAlign: "right", fontWeight: "900", color: "#047857", fontSize: "13px" }}>
                        ${item.comisionTotal.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Box */}
          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "10px" }}>
            <div style={{ width: "380px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #cbd5e1", paddingBottom: "6px", marginBottom: "6px", whiteSpace: "nowrap" }}>
                <span style={{ color: "#475569", fontWeight: "700" }}>Total Planes Vendidos:</span>
                <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "14px" }}>{totalCantPlanes}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #cbd5e1", paddingBottom: "6px", marginBottom: "6px", whiteSpace: "nowrap" }}>
                <span style={{ color: "#475569", fontWeight: "700" }}>Total Firmas Vendidas:</span>
                <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "14px" }}>{totalCantFirmas}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #cbd5e1", paddingBottom: "6px", marginBottom: "6px", whiteSpace: "nowrap" }}>
                <span style={{ color: "#475569", fontWeight: "700" }}>Total Adicionales Vendidos:</span>
                <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "14px" }}>{totalCantAdicionales}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #cbd5e1", paddingBottom: "6px", marginBottom: "6px", whiteSpace: "nowrap" }}>
                <span style={{ color: "#475569", fontWeight: "700" }}>Monto Total Vendido:</span>
                <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "15px" }}>${totalVentaBruta.toFixed(2)} USD</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", marginTop: "4px", fontSize: "15px", fontWeight: "900", color: "#047857", borderTop: "2px solid #0B2545", whiteSpace: "nowrap" }}>
                <span>A COMISIONAR:</span>
                <span style={{ fontSize: "20px", color: "#047857", fontWeight: "900" }}>${totalComisionFinal.toFixed(2)} USD</span>
              </div>
            </div>
          </div>

          {/* Signatures Spot */}
          <div style={{ paddingTop: "32px", display: "flex", justifyContent: "center", textAlign: "center", fontSize: "12px" }}>
            <div style={{ borderTop: "1.5px solid #94a3b8", paddingTop: "8px", width: "260px" }}>
              <p style={{ fontWeight: "900", color: "#0f172a", margin: 0, fontSize: "15px" }}>{activeProfile.nombre || "Socio Registrado"}</p>
              {activeProfile.rucCedula && (
                <p style={{ fontSize: "11px", color: "#475569", margin: "2px 0 0 0", fontWeight: "700" }}>C.I. / RUC: {activeProfile.rucCedula}</p>
              )}
              <p style={{ fontSize: "10px", color: "#64748b", margin: "4px 0 0 0", textTransform: "uppercase", fontWeight: "bold" }}>FIRMA DEL DISTRIBUIDOR / ASESOR</p>
            </div>
          </div>

          {/* Bank Account Details */}
          {(() => {
            const finalBanco = activeProfile.banco;
            const finalTipo = activeProfile.tipoCuenta || "Cuenta de Ahorros";
            const finalNum = activeProfile.numeroCuenta;
            const finalTitular = activeProfile.titularCuenta || activeProfile.nombre;
            const finalCedula = activeProfile.cedulaTitular || activeProfile.rucCedula;

            if (!finalBanco && !finalNum) return null;

            return (
              <div
                style={{
                  marginTop: "20px",
                  padding: "12px 18px",
                  backgroundColor: "#f0fdf4",
                  border: "1.5px solid #86efac",
                  borderRadius: "8px",
                  fontSize: "11px",
                  color: "#166534",
                }}
              >
                <p style={{ margin: "0 0 6px 0", fontWeight: "900", fontSize: "11px", textTransform: "uppercase", color: "#15803d", letterSpacing: "0.5px" }}>
                  DATOS BANCARIOS REGISTRADOS PARA PAGO DE COMISIONES:
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "11px" }}>
                  <div><strong>Banco / Entidad:</strong> {finalBanco || "No especificado"}</div>
                  <div><strong>Tipo de Cuenta:</strong> {finalTipo || "Cuenta de Ahorros"}</div>
                  <div><strong>N° de Cuenta:</strong> {finalNum || "No registrada"}</div>
                  <div><strong>Titular:</strong> {finalTitular || activeProfile.nombre || "Socio"} {finalCedula ? `(C.I. ${finalCedula})` : ""}</div>
                </div>
              </div>
            );
          })()}

          {/* Legal Disclaimer */}
          <div
            style={{
              marginTop: "20px",
              padding: "16px 20px",
              backgroundColor: "#f8fafc",
              border: "1.5px solid #cbd5e1",
              borderRadius: "10px",
              fontSize: "11px",
              color: "#334155",
              lineHeight: "1.45",
              textAlign: "justify",
            }}
          >
            <p style={{ fontWeight: "900", color: "#0f172a", margin: "0 0 4px 0", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              IMPORTANTE:
            </p>
            <p style={{ margin: "0 0 4px 0" }}>
              Este documento es únicamente de carácter informativo y referencial. No constituye un documento con validez legal, contractual o tributaria, ni representa un compromiso de pago. Asimismo, no tiene relación oficial con UpConta, ANF ni con ninguna de las empresas aliadas.
            </p>
            <p style={{ margin: "0 0 4px 0" }}>
              Su único propósito es servir como herramienta de consulta para que el distribuidor lleve un control interno y referencial de sus comisiones.
            </p>
            <p style={{ margin: 0 }}>
              Queda strictly prohibido utilizar o presentar este documento como respaldo para solicitar, exigir o gestionar el cobro de comisiones ante UpConta, ANF o cualquier empresa aliada, con el fin de evitar confusiones, interpretaciones erróneas o inconvenientes administrativos.
            </p>
          </div>
        </div>
      </div>

      {/* Delete Venta Confirmation Modal with Gerencia / Socio Password */}
      <DeleteVentaModal
        isOpen={!!selectedVentaToDelete}
        onClose={() => setSelectedVentaToDelete(null)}
        venta={selectedVentaToDelete}
        onConfirmDelete={confirmDeleteVenta}
        isGerencia={isGerenciaUser}
      />

      {/* Pop-up de Activacion para Socios Registrados desde Perfil Socio */}
      {showActivationModal && registeredSocioInfo && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5 animate-scale-up border border-slate-200">
            <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Socio Creado con Éxito
              </h3>
              <p className="text-xs text-[#0B2545] font-extrabold leading-relaxed px-2 bg-amber-50 py-2.5 rounded-2xl border border-amber-200 shadow-xs">
                Socio creado con éxito, comunícate con soporte para que activen su perfil.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2 font-medium">
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Nombre del Socio:</span>
                <span className="font-extrabold text-slate-900 text-right">{registeredSocioInfo.nombre}</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Correo Electrónico:</span>
                <span className="font-extrabold text-slate-900 text-right break-all">{registeredSocioInfo.email}</span>
              </div>
              <div className="flex justify-between items-center pt-0.5">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Código Asignado:</span>
                <span className="font-mono font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                  {registeredSocioInfo.code}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowActivationModal(false)}
                className="w-full py-3 bg-[#0B2545] hover:bg-[#133E72] text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Entendido</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GERENCIA ACTIVATION MODAL */}
      {showActivateModalGerencia && selectedSocioToActivate && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5 animate-scale-up border border-slate-200">
            <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Key className="w-6 h-6 text-amber-600" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Activar Socio & Asignar Contraseña
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Crea la contraseña de acceso para que el socio pase a estado **Activo** y se registre en Google Sheets.
              </p>
            </div>

            {activateSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{activateSuccessMsg}</span>
              </div>
            )}

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2.5 font-medium">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Socio:</span>
                <span className="font-extrabold text-slate-900 text-right">{selectedSocioToActivate.nombreApellido}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Correo:</span>
                <span className="font-extrabold text-slate-900 text-right break-all">{selectedSocioToActivate.email}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Código:</span>
                <span className="font-mono font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  {selectedSocioToActivate.partnerCode || selectedSocioToActivate.codigoSocio}
                </span>
              </div>

              {/* Password Input */}
              <div className="space-y-1 pt-1">
                <label className="text-[10px] text-amber-900 font-black uppercase flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-600" />
                  <span>Contraseña de Acceso (Asignar):</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswordInModal ? "text" : "password"}
                    value={activatePassword}
                    onChange={(e) => setActivatePassword(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 bg-amber-50/90 border border-amber-300 rounded-xl text-xs font-bold text-amber-950 font-mono focus:bg-white focus:border-amber-500 focus:outline-none"
                    placeholder="Clave1234"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordInModal(!showPasswordInModal)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-700 hover:text-amber-900 p-1 cursor-pointer"
                  >
                    {showPasswordInModal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowActivateModalGerencia(false)}
                className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleActivateSocio}
                disabled={isActivating}
                className="w-2/3 py-2.5 bg-[#0B2545] hover:bg-[#133E72] text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isActivating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                )}
                <span>Activar & Registrar en Sheets</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
