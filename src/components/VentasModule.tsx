import React, { useState, useEffect } from "react";
import { 
  DollarSign, 
  Calendar, 
  User, 
  Building, 
  FileText, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Send, 
  Tag, 
  ShieldCheck, 
  Sparkles, 
  CreditCard,
  Percent,
  Layers,
  HelpCircle,
  Clock,
  Award
} from "lucide-react";
import { UpContaLogo, AnfLogo, CoBrandLogo } from "./GodiLogo";
import { syncVentaToGoogleSheets } from "../utils/googleSheetsSync";
import { getActivePartnerName } from "../utils/userSessionHelper";

// Google Apps Script WebApp Endpoint URL
const SHEET_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbyZBp1JIa0IHTRe6HfTNN7COlEW__KWGNr0nxSuTGbFPLSHHHtk9tgvKAUzvDzPCIFp/exec";

// IVA factor for adicionales (1.15 = 15% IVA)
const IVA_FACTOR = 1.15;

const ADICIONALES_PRECIOS: Record<string, number> = {
  "CONTABILIDAD": 75 * IVA_FACTOR,
  "NOMINA": 75 * IVA_FACTOR,
  "TESORERIA": 75 * IVA_FACTOR,
  "ACTIVOS FIJOS": 75 * IVA_FACTOR,
  "RESTAURANTES": 75 * IVA_FACTOR,
  "UP LIGHT": 10 * IVA_FACTOR,
  "BASE": 25 * IVA_FACTOR,
  "POWER": 55 * IVA_FACTOR,
};

const ADICIONALES_BASE = ["CONTABILIDAD", "NOMINA", "TESORERIA", "ACTIVOS FIJOS", "RESTAURANTES"];
const ADICIONALES_CONTADOR = ["UP LIGHT", "BASE", "POWER"];

const ASESORES: Record<string, string> = {
  salome: "Salomé Estrella",
  karla: "Karla Haro",
  ismenia: "Ismenia Escalona",
  evelyn: "Evelyn Narváez",
  david: "David Santander",
};

interface PlanOption {
  label: string;
  precio: number;
}

interface ProductCatalogItem {
  label: string;
  planes?: PlanOption[];
  planesNuevo?: PlanOption[];
  planesRenovacion?: PlanOption[];
}

const PRODUCTOS: Record<string, ProductCatalogItem> = {
  facturacion: {
    label: "Planes Facturación",
    planes: [
      { label: "UP LIGHT", precio: 11.50 },
      { label: "UP BASE", precio: 28.75 },
      { label: "UP POWER", precio: 63.25 },
      { label: "UP INICIAL", precio: 11.50 },
      { label: "UP INTERMEDIO", precio: 17.25 },
      { label: "UP IDEAL PLUS", precio: 28.75 },
      { label: "UP PROFESIONAL PLUS", precio: 92.00 },
      { label: "UP ULTRA", precio: 172.50 },
    ],
  },
  contador: {
    label: "Plan Contador",
    planes: [
      { label: "ILIMITADO", precio: 345.00 },
      { label: "TAX", precio: 115.00 },
      { label: "1 EMPRESA", precio: 57.50 },
      { label: "3 EMPRESAS", precio: 115.00 },
      { label: "6 EMPRESAS", precio: 172.50 },
      { label: "10 EMPRESAS", precio: 230.00 },
    ],
  },
  erp: {
    label: "Planes ERP Contable",
    planes: [
      { label: "ERP UPCONTA START", precio: 473.52 },
      { label: "ERP UPCONTA PLUS", precio: 690.00 },
      { label: "ERP UPCONTA PREMIUN", precio: 1102.64 },
    ],
  },
  natural: {
    label: "Firma Natural",
    planesNuevo: [
      { label: "15 Días", precio: 4.49 },
      { label: "1 Año", precio: 18.20 },
      { label: "2 Años", precio: 22.20 },
      { label: "3 Años", precio: 33.28 },
      { label: "4 Años", precio: 44.36 },
      { label: "5 Años", precio: 55.41 },
    ],
    planesRenovacion: [
      { label: "15 Días", precio: 4.14 },
      { label: "1 Año", precio: 16.80 },
      { label: "2 Años", precio: 20.50 },
      { label: "3 Años", precio: 30.72 },
      { label: "4 Años", precio: 40.95 },
      { label: "5 Años", precio: 51.15 },
    ],
  },
  natural_ruc: {
    label: "Firma Natural con RUC",
    planesNuevo: [
      { label: "15 Días", precio: 4.49 },
      { label: "1 Año", precio: 18.20 },
      { label: "2 Años", precio: 22.20 },
      { label: "3 Años", precio: 33.28 },
      { label: "4 Años", precio: 44.36 },
      { label: "5 Años", precio: 55.41 },
    ],
    planesRenovacion: [
      { label: "15 Días", precio: 4.14 },
      { label: "1 Año", precio: 16.80 },
      { label: "2 Años", precio: 20.50 },
      { label: "3 Años", precio: 30.72 },
      { label: "4 Años", precio: 40.95 },
      { label: "5 Años", precio: 51.15 },
    ],
  },
  juridica: {
    label: "Firma Jurídica",
    planesNuevo: [
      { label: "1 Año", precio: 21.84 },
      { label: "2 Años", precio: 25.84 },
      { label: "3 Años", precio: 38.22 },
      { label: "4 Años", precio: 50.93 },
      { label: "5 Años", precio: 63.12 },
    ],
    planesRenovacion: [
      { label: "1 Año", precio: 20.16 },
      { label: "2 Años", precio: 23.86 },
      { label: "3 Años", precio: 35.28 },
      { label: "4 Años", precio: 47.01 },
      { label: "5 Años", precio: 58.26 },
    ],
  },
  emprende: {
    label: "Promo Emprende",
    planes: [
      { label: "1 Año", precio: 24.00 },
      { label: "2 Años", precio: 30.00 },
      { label: "3 Años", precio: 38.00 },
    ],
  },
};

interface AdicionalItem {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export function VentasModule() {
  // Form State
  const [ruc, setRuc] = useState<string>("");
  const [nombre, setNombre] = useState<string>("");
  const [fecha, setFecha] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [asesor, setAsesor] = useState<string>("");
  const [productoKey, setProductoKey] = useState<string>("");
  const [tipoVenta, setTipoVenta] = useState<"Nuevo" | "Renovación">("Nuevo");
  
  // Selected Plan Index or Value
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number>(0);
  const [montoRegistrado, setMontoRegistrado] = useState<number>(0);
  const [descuento, setDescuento] = useState<number>(0);

  // Adicionales
  const [adicionales, setAdicionales] = useState<AdicionalItem[]>([]);
  const [selectedAdicionalNombre, setSelectedAdicionalNombre] = useState<string>("");
  const [adicionalCantidad, setAdicionalCantidad] = useState<number>(1);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Format currency helpers
  const formatMoney = (val: number) => {
    return val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Determine available planes list based on product & tipoVenta
  const getPlanesList = (): PlanOption[] => {
    if (!productoKey || !PRODUCTOS[productoKey]) return [];
    const prod = PRODUCTOS[productoKey];
    if (prod.planesNuevo && prod.planesRenovacion) {
      return tipoVenta === "Renovación" ? prod.planesRenovacion : prod.planesNuevo;
    }
    return prod.planes || [];
  };

  const planesList = getPlanesList();

  // Show/Hide rules
  const productosConAdicionales = ["facturacion", "contador"];
  const productosConTipoVentaPlan = ["erp", "natural", "natural_ruc", "juridica", "emprende"];
  
  const showAdicionales = productosConAdicionales.includes(productoKey);
  const showTipoVentaPlan = productosConTipoVentaPlan.includes(productoKey);
  const showTipoVentaAdicionales = productosConAdicionales.includes(productoKey);

  // Populate default plan price whenever product or tipoVenta changes
  useEffect(() => {
    const planes = getPlanesList();
    if (planes.length > 0) {
      setSelectedPlanIndex(0);
      setMontoRegistrado(planes[0].precio);
    } else {
      setMontoRegistrado(0);
    }

    // Default select first available adicional option if showing
    if (showAdicionales) {
      const list = productoKey === "contador" ? [...ADICIONALES_BASE, ...ADICIONALES_CONTADOR] : ADICIONALES_BASE;
      if (list.length > 0) setSelectedAdicionalNombre(list[0]);
    }
  }, [productoKey, tipoVenta]);

  // Handle plan dropdown selection
  const handlePlanChange = (index: number) => {
    setSelectedPlanIndex(index);
    const planes = getPlanesList();
    if (planes[index]) {
      setMontoRegistrado(planes[index].precio);
    }
  };

  // Add Adicional Line Item
  const handleAddAdicional = () => {
    if (!selectedAdicionalNombre || adicionalCantidad <= 0) return;
    const precioUnitario = ADICIONALES_PRECIOS[selectedAdicionalNombre];
    if (!precioUnitario) return;

    const subtotal = cantidad => cantidad * precioUnitario;
    const newItem: AdicionalItem = {
      nombre: selectedAdicionalNombre,
      cantidad: adicionalCantidad,
      precioUnitario,
      subtotal: subtotal(adicionalCantidad),
    };

    setAdicionales(prev => [...prev, newItem]);
    setAdicionalCantidad(1);
  };

  // Remove Adicional Item
  const handleRemoveAdicional = (index: number) => {
    setAdicionales(prev => prev.filter((_, i) => i !== index));
  };

  // Total calculation
  const totalAdicionales = adicionales.reduce((acc, item) => acc + item.subtotal, 0);
  const totalInvertir = Math.max(0, montoRegistrado - descuento + totalAdicionales);

  // Sanitized RUC input
  const handleRucChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/[^0-9A-Za-z]/g, "").toUpperCase().slice(0, 13);
    setRuc(clean);
  };

  // Form Submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatusMessage(null);

    // Validation checks
    if (!ruc || ruc.length < 10 || ruc.length > 13) {
      setStatusMessage({
        type: "error",
        text: "El RUC, Cédula o Pasaporte debe tener entre 10 y 13 caracteres alfanuméricos.",
      });
      return;
    }

    if (!nombre.trim()) {
      setStatusMessage({ type: "error", text: "Por favor ingresa el Nombre o Razón Social del cliente." });
      return;
    }

    if (!asesor) {
      setStatusMessage({ type: "error", text: "Por favor selecciona un asesor comercial." });
      return;
    }

    if (!productoKey) {
      setStatusMessage({ type: "error", text: "Por favor selecciona un producto de venta." });
      return;
    }

    const currentPlanes = getPlanesList();
    const selectedPlanObj = currentPlanes[selectedPlanIndex];
    const planLabel = selectedPlanObj ? `${selectedPlanObj.label} ($${formatMoney(selectedPlanObj.precio)})` : "";

    if (!planLabel) {
      setStatusMessage({ type: "error", text: "Por favor selecciona un plan válido." });
      return;
    }

    const adicionalesTexto = adicionales.map(a => `${a.nombre} x${a.cantidad}`).join(", ");
    const finalTipoVenta = showTipoVentaPlan || showTipoVentaAdicionales ? tipoVenta : "";

    const payload = {
      asesor: ASESORES[asesor] || asesor,
      fecha: fecha,
      ruc: ruc,
      nombre: nombre,
      producto: PRODUCTOS[productoKey]?.label || productoKey,
      plan: planLabel,
      adicionales: adicionalesTexto,
      valorPlan: montoRegistrado,
      valorAdicional: totalAdicionales,
      descuento: descuento,
      total: totalInvertir,
      tipoVenta: finalTipoVenta,
    };

    setIsSubmitting(true);

    try {
      const params = new URLSearchParams();
      Object.entries(payload).forEach(([k, v]) => params.append(k, String(v)));

      await fetch(SHEET_WEBAPP_URL + "?" + params.toString(), {
        method: "GET",
        mode: "no-cors",
      });

      // Save sale to local storage system table so Gerencia & Socio Profile can reflect it immediately
      try {
        const activePartnerName = getActivePartnerName();
        const loggedUserEmail = sessionStorage.getItem("godi_user_email") || "";
        const loggedUserCode = sessionStorage.getItem("godi_user_code") || "";
        const loggedUserRole = sessionStorage.getItem("godi_user") || "";

        const newVentaRecord = {
          id: "v-" + Date.now(),
          clienteNombre: nombre,
          nombreCliente: nombre,
          clienteCedula: ruc,
          cedulaCliente: ruc,
          categoria: productoKey,
          productoNombre: `${PRODUCTOS[productoKey]?.label || productoKey} (${planLabel})`,
          precioUnitario: montoRegistrado,
          cantidad: 1,
          totalVenta: totalInvertir,
          fecha: fecha,
          fechaRegistro: fecha,
          vendedor: activePartnerName,
          socioNombre: activePartnerName,
          adminResponsable: activePartnerName,
          userEmail: loggedUserEmail,
          userCode: loggedUserCode,
          userRole: loggedUserRole,
          estadoComision: "Pendiente",
        };

        const existingStr = localStorage.getItem("kpier_ventas_registradas");
        const existingVentas = existingStr ? JSON.parse(existingStr) : [];
        if (Array.isArray(existingVentas)) {
          existingVentas.unshift(newVentaRecord);
          localStorage.setItem("kpier_ventas_registradas", JSON.stringify(existingVentas));
        }

        // Sync to Google Sheets backend
        syncVentaToGoogleSheets({
          id: newVentaRecord.id,
          fecha: newVentaRecord.fecha,
          nombreCliente: newVentaRecord.clienteNombre,
          cedulaCliente: newVentaRecord.clienteCedula,
          producto: newVentaRecord.productoNombre,
          cantidad: newVentaRecord.cantidad,
          totalVenta: newVentaRecord.totalVenta,
          vendedor: newVentaRecord.vendedor,
          userEmail: newVentaRecord.userEmail,
          userCode: newVentaRecord.userCode,
          userRole: newVentaRecord.userRole,
          estadoComision: "Pendiente",
        });
      } catch (errLocal) {
        console.error("Error guardando venta en kpier_ventas_registradas:", errLocal);
      }

      setStatusMessage({
        type: "success",
        text: "¡Venta registrada exitosamente en el sistema KPIer UpConta & ANF!",
      });

      // Reset form
      setRuc("");
      setNombre("");
      setDescuento(0);
      setAdicionales([]);
      setFecha(new Date().toISOString().split("T")[0]);
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: "Ocurrió un error al registrar la venta. Verifica tu conexión e inténtalo de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const listaAdicionalesOpciones = productoKey === "contador" ? [...ADICIONALES_BASE, ...ADICIONALES_CONTADOR] : ADICIONALES_BASE;

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Status Message Banner if present */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border font-bold text-xs sm:text-sm flex items-center gap-3 ${
            statusMessage.type === "success"
              ? "bg-emerald-900 text-emerald-100 border-emerald-500/50 shadow-md"
              : "bg-rose-900 text-rose-100 border-rose-500/50 shadow-md"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Form Content: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Client Data & Product/Plan Configuration */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Client & Asesor Data */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">Datos del Cliente &amp; Asesor</h3>
                <p className="text-xs text-slate-500">Identificación y fecha de la transacción</p>
              </div>
            </div>

            {/* RUC / Cédula */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                RUC o Cédula / Pasaporte <span className="text-orange-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={ruc}
                  maxLength={13}
                  onChange={handleRucChange}
                  placeholder="Ej: 1792345678001 (10 a 13 caracteres)"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium text-sm focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all uppercase"
                />
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Nombre / Empresa <span className="text-orange-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Razón Social o Nombre Completo"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium text-sm focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                />
                <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Fecha & Asesor Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Fecha <span className="text-orange-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={fecha}
                    onChange={e => setFecha(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium text-sm focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Asesor Comercial <span className="text-orange-600">*</span>
                </label>
                <select
                  value={asesor}
                  onChange={e => setAsesor(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold text-sm focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                >
                  <option value="">Selecciona un asesor</option>
                  {Object.entries(ASESORES).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Producto Selection */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Elige tu Producto de Venta <span className="text-orange-600">*</span>
              </label>
              <select
                value={productoKey}
                onChange={e => setProductoKey(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 text-white border border-slate-800 rounded-xl font-bold text-sm focus:ring-2 focus:ring-orange-400 transition-all"
              >
                <option value="">Selecciona un producto</option>
                <optgroup label="Software Contable & ERP (UpConta)">
                  <option value="facturacion">Planes Facturación</option>
                  <option value="erp">Planes ERP Contable</option>
                  <option value="contador">Plan Contador</option>
                  <option value="emprende">Promo Emprende</option>
                </optgroup>
                <optgroup label="Firma Electrónica (ANF AC)">
                  <option value="natural">Firma Natural</option>
                  <option value="natural_ruc">Firma Natural con RUC</option>
                  <option value="juridica">Firma Jurídica</option>
                </optgroup>
              </select>
            </div>
          </div>

          {/* Card 2: Plan Selector, Tipo de Venta & Adicionales (Moved below Client & Asesor group) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">Plan Seleccionado &amp; Adicionales</h3>
                <p className="text-xs text-slate-500">Configura la modalidad y módulos opcionales</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Plan Seleccionado <span className="text-orange-600">*</span>
              </label>
              <select
                value={selectedPlanIndex}
                onChange={e => handlePlanChange(Number(e.target.value))}
                disabled={!productoKey}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-extrabold text-sm focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all disabled:opacity-50"
              >
                {!productoKey ? (
                  <option value={0}>Selecciona un producto primero</option>
                ) : (
                  planesList.map((p, idx) => (
                    <option key={idx} value={idx}>
                      {p.label} — (${formatMoney(p.precio)})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Tipo de Venta Radios */}
            {(showTipoVentaPlan || showTipoVentaAdicionales) && (
              <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Tipo de Venta:
                </label>
                <div className="flex items-center gap-6 pt-1">
                  <label className="inline-flex items-center gap-2 font-bold text-sm text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="tipoVentaRadio"
                      value="Nuevo"
                      checked={tipoVenta === "Nuevo"}
                      onChange={() => setTipoVenta("Nuevo")}
                      className="text-orange-600 focus:ring-orange-500 w-4 h-4"
                    />
                    <span>Nuevo</span>
                  </label>
                  <label className="inline-flex items-center gap-2 font-bold text-sm text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="tipoVentaRadio"
                      value="Renovación"
                      checked={tipoVenta === "Renovación"}
                      onChange={() => setTipoVenta("Renovación")}
                      className="text-orange-600 focus:ring-orange-500 w-4 h-4"
                    />
                    <span>Renovación</span>
                  </label>
                </div>
              </div>
            )}

            {/* Adicionales Module Adder */}
            {showAdicionales && (
              <div className="pt-2 space-y-3 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Agregar Módulos Adicionales:
                </label>
                <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                  <select
                    value={selectedAdicionalNombre}
                    onChange={e => setSelectedAdicionalNombre(e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-xs focus:bg-white focus:border-orange-500"
                  >
                    {listaAdicionalesOpciones.map(nom => (
                      <option key={nom} value={nom}>
                        {nom} (${formatMoney(ADICIONALES_PRECIOS[nom])})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min={1}
                    value={adicionalCantidad}
                    onChange={e => setAdicionalCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-center font-black text-xs text-slate-900"
                  />

                  <button
                    type="button"
                    onClick={handleAddAdicional}
                    className="bg-[#0B2545] hover:bg-[#123866] text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-orange-400" />
                    <span>Agregar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing Summary & Submit Action */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main Calculation & Submit Card */}
          <div className="bg-[#0B2545] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6 sticky top-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-orange-500/20 text-orange-400 rounded-xl border border-orange-500/30">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Monto Registrado</h3>
                  <p className="text-xs text-slate-300">Desglose de valores e IVA</p>
                </div>
              </div>
              <span className="text-xs font-extrabold bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full border border-orange-500/30">
                USD ($)
              </span>
            </div>

            {/* Price Inputs */}
            <div className="space-y-3 text-sm font-medium">
              <div className="flex items-center justify-between gap-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-300 font-bold">Monto Registrado:</span>
                <div className="relative w-36">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={montoRegistrado || ""}
                    onChange={e => setMontoRegistrado(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-right font-black text-white text-base focus:border-orange-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-300 font-bold">Descuento ($):</span>
                <div className="relative w-36">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={descuento || ""}
                    onChange={e => setDescuento(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-right font-black text-emerald-400 text-base focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Added Adicionales Breakdown Lines */}
              {adicionales.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-xs font-extrabold text-orange-400 uppercase tracking-wider block">
                    Módulos Adicionales:
                  </span>
                  {adicionales.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-900/80 px-3 py-2 rounded-lg text-xs">
                      <span className="text-slate-200 font-bold">
                        {item.nombre} <span className="text-orange-400 font-extrabold">x{item.cantidad}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white">${formatMoney(item.subtotal)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAdicional(idx)}
                          className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                          title="Eliminar adicional"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <hr className="border-slate-800" />

            {/* Total Highlight */}
            <div className="bg-gradient-to-r from-orange-600/30 via-orange-500/20 to-amber-500/30 p-4 rounded-2xl border border-orange-500/40 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-black text-orange-300 tracking-wider block">TOTAL A INVERTIR</span>
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  ${formatMoney(totalInvertir)}
                </span>
              </div>
              <div className="p-3 bg-orange-500 text-white rounded-xl shadow-lg">
                <DollarSign className="w-7 h-7" />
              </div>
            </div>

            {/* Action Submit Button inside Monto Registrado card */}
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm py-4 rounded-2xl shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/40 uppercase tracking-wider disabled:opacity-50"
            >
              <Send className="w-5 h-5 text-white" />
              <span>{isSubmitting ? "REGISTRANDO..." : "REGISTRAR VENTA"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
