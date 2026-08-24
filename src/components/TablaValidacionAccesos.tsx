import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Sliders,
  Layers,
  FileText,
  ShoppingBag,
  BarChart3,
  Globe,
  HelpCircle,
  Users,
  LayoutDashboard,
  Sparkles,
  Save,
  RotateCcw,
  Info,
  Check,
  Building,
  Key,
  UserCheck,
  Gift,
  Calculator,
} from "lucide-react";
import {
  PermissionsMap,
  RolePermissions,
  DistributorType,
  TabPermissionConfig,
  getPermissionsMap,
  savePermissionsMap,
  getPermissionsForDistributorType,
  DEFAULT_ROLE_PERMISSIONS,
} from "../utils/permissions";
import { getPartnerCodeSlots, PartnerCodeSlot } from "../utils/partnerCodes";

export function TablaValidacionAccesos() {
  const [permissionsMap, setPermissionsMap] = useState<PermissionsMap>(getPermissionsMap());
  const [selectedRole, setSelectedRole] = useState<"admin" | "gerencia">("admin");
  const [selectedSocioKey, setSelectedSocioKey] = useState<string>("admin");
  const [createdSociosList, setCreatedSociosList] = useState<PartnerCodeSlot[]>([]);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    setPermissionsMap(getPermissionsMap());
    const slots = getPartnerCodeSlots();
    const usedSlots = slots.filter((s) => s.used && (s.nombre || s.code));
    setCreatedSociosList(usedSlots);
  }, []);

  const getActiveKey = (): string => {
    if (selectedRole === "gerencia") return "gerencia";
    return selectedSocioKey;
  };

  const handleDistributorTypeChange = (type: DistributorType) => {
    const defaultPreset = getPermissionsForDistributorType(type);
    const keyToUpdate = getActiveKey();
    
    setPermissionsMap((prev) => {
      const currentRoleObj = prev[keyToUpdate] || prev.admin || DEFAULT_ROLE_PERMISSIONS.admin;
      const updated: RolePermissions = {
        distributorType: type,
        permissions: {
          ...currentRoleObj.permissions,
          ...defaultPreset,
          ...(selectedRole === "gerencia"
            ? { dashboard: true, empresa: true, noticias: true, soporte: true }
            : {}),
        },
      };

      if (keyToUpdate === "admin") {
        return {
          ...prev,
          admin: updated,
          admin1: updated,
          admin2: updated,
        };
      }

      return {
        ...prev,
        [keyToUpdate]: updated,
      };
    });
  };

  const handleTogglePermission = (key: keyof TabPermissionConfig) => {
    const keyToUpdate = getActiveKey();

    setPermissionsMap((prev) => {
      const currentRoleObj = prev[keyToUpdate] || prev.admin || DEFAULT_ROLE_PERMISSIONS.admin;
      const currentVal = currentRoleObj.permissions[key];
      const updatedPermissions: TabPermissionConfig = {
        ...currentRoleObj.permissions,
        [key]: !currentVal,
      };

      const updatedRoleObj: RolePermissions = {
        ...currentRoleObj,
        permissions: updatedPermissions,
      };

      if (keyToUpdate === "admin") {
        return {
          ...prev,
          admin: updatedRoleObj,
          admin1: updatedRoleObj,
          admin2: updatedRoleObj,
        };
      }

      return {
        ...prev,
        [keyToUpdate]: updatedRoleObj,
      };
    });
  };

  const handleSave = () => {
    const mapToSave = { ...permissionsMap };
    if (mapToSave.admin) {
      mapToSave.admin1 = mapToSave.admin;
      mapToSave.admin2 = mapToSave.admin;
    }
    savePermissionsMap(mapToSave);
    setPermissionsMap(mapToSave);
    setSavedMessage("¡Matriz de permisos y accesos guardada exitosamente! Se han actualizado los accesos en el sistema.");
    setTimeout(() => setSavedMessage(null), 3500);
  };

  const handleReset = () => {
    savePermissionsMap(DEFAULT_ROLE_PERMISSIONS);
    setPermissionsMap(DEFAULT_ROLE_PERMISSIONS);
    setSelectedSocioKey("admin");
    setSavedMessage("Permisos restablecidos a los valores por defecto.");
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const activeKey = getActiveKey();
  const activeRoleConfig = permissionsMap[activeKey] || permissionsMap[selectedRole] || DEFAULT_ROLE_PERMISSIONS[selectedRole] || DEFAULT_ROLE_PERMISSIONS.admin;

  const roleLabels = {
    admin: {
      title: "Perfil Socio Administrativo (Socio Creado)",
      badge: "Socio Creado",
      desc: "Perfil de acceso administrativo para los socios registrados. Puede configurar de forma general o por socio individual.",
    },
    gerencia: {
      title: "Perfil Gerencia General",
      badge: "Gerencia",
      desc: "Perfil ejecutivo con control total y posibilidad de habilitar/deshabilitar pestañas para su uso.",
    },
  };

  // Structured list of tabs & subtabs with descriptions and categories
  const mainTabItems: Array<{ key: keyof TabPermissionConfig; label: string; icon: React.ReactNode; desc: string }> = [
    { key: "empresa", label: "Socio Estratégico", icon: <Building className="w-4 h-4 text-slate-700" />, desc: "Información corporativa para socios estratégicos ANF y UpConta" },
    { key: "noticias", label: "Noticias y Novedades", icon: <FileText className="w-4 h-4 text-blue-600" />, desc: "Boletines, actualizaciones y avisos importantes" },
    { key: "dashboard", label: "Dashboard Gerencial", icon: <LayoutDashboard className="w-4 h-4 text-indigo-600" />, desc: "Panel de control estadístico consolidado" },
    { key: "planes_fichas", label: "Planes y Fichas Técnicas", icon: <Layers className="w-4 h-4 text-purple-600" />, desc: "Fichas de productos, ERP, Facturación y Firmas" },
    { key: "comercial", label: "Comercial", icon: <ShoppingBag className="w-4 h-4 text-purple-600" />, desc: "Simulador de precios y ventas comerciales" },
    { key: "arte_visual", label: "Arte Visual", icon: <Sparkles className="w-4 h-4 text-pink-600" />, desc: "Generador de artes publicitarias y recursos visuales" },
    { key: "plataforma_prueba", label: "Plataforma de prueba", icon: <Sliders className="w-4 h-4 text-purple-600" />, desc: "Catálogo interactivo y prueba de planes y fichas técnicas" },
    { key: "kpier", label: "Calcula tu comisión", icon: <Calculator className="w-4 h-4 text-emerald-600" />, desc: "Calculadora interactiva de prueba y simulación de comisiones" },
    { key: "mlm", label: "Red MLM", icon: <Globe className="w-4 h-4 text-cyan-600" />, desc: "Estructura de red y comisiones multinivel" },
    { key: "distribucion_firmas", label: "Plataforma Connect", icon: <ShieldCheck className="w-4 h-4 text-sky-600" />, desc: "Gestión y entrega de firmas electrónicas ANF" },
    { key: "soporte", label: "Soporte Técnico", icon: <HelpCircle className="w-4 h-4 text-rose-600" />, desc: "Canales de soporte y mesas de ayuda" },
  ];

  const subTabEmpresaItems: Array<{ key: keyof TabPermissionConfig; label: string; desc: string; icon: React.ReactNode; color: "blue" | "amber" }> = [
    {
      key: "sub_empresa_anf",
      label: "Información ANF AC (Firmas Electrónicas)",
      desc: "Autoridad de Certificación Acreditada por ARCOTEL, misión, visión y validez legal de firmas .p12",
      icon: <ShieldCheck className="w-4 h-4 text-blue-600" />,
      color: "blue",
    },
    {
      key: "sub_empresa_upconta",
      label: "Información UpConta (Software ERP Cloud)",
      desc: "Software contable y facturación electrónica para Pymes y Contadores, misión, visión e integración SRI",
      icon: <Building className="w-4 h-4 text-amber-600" />,
      color: "amber",
    },
  ];

  const subTabSoporteItems: Array<{ key: keyof TabPermissionConfig; label: string; desc: string; icon: React.ReactNode; color: "amber" | "blue" }> = [
    {
      key: "sub_soporte_upconta",
      label: "Soporte UpConta Sistemas (ERP Cloud)",
      desc: "Líneas de ventas, atención al cliente y equipo de soporte técnico directo para software contable",
      icon: <Building className="w-4 h-4 text-amber-600" />,
      color: "amber",
    },
    {
      key: "sub_soporte_anf",
      label: "Soporte Firmas Electrónicas (ANF AC)",
      desc: "Líneas de atención al cliente, línea Fedotaxi y ventas/renovación de firmas electrónicas .p12",
      icon: <ShieldCheck className="w-4 h-4 text-blue-600" />,
      color: "blue",
    },
  ];

  const subTabPlanesItems: Array<{ key: keyof TabPermissionConfig; label: string; desc: string }> = [
    { key: "sub_planes_facturacion", label: "Planes Facturación Electrónica", desc: "Fichas y precios de planes de facturación" },
    { key: "sub_planes_erp", label: "Planes ERP Contables", desc: "Fichas y precios de planes ERP Pymes" },
    { key: "sub_planes_contador", label: "Planes Contador", desc: "Fichas y precios de planes para contadores" },
    { key: "sub_planes_firmas", label: "Cotizador & Requisitos de Firmas", desc: "Precios y requisitos para personas naturales y jurídicas" },
    { key: "sub_planes_explorador", label: "Explorador de Funciones ERP", desc: "Herramienta interactiva de características de módulos" },
  ];

  const subTabComercialItems: Array<{ key: keyof TabPermissionConfig; label: string; desc: string }> = [
    { key: "sub_comercial_simulador", label: "Simulador de Cotización", desc: "Calculadora interactiva de ventas" },
    { key: "sub_comercial_comision", label: "Registro de Ventas & Comisiones", desc: "Módulo de liquidación y registro de ventas" },
    { key: "sub_comercial_arte_visual", label: "Material de Marketing / Arte Visual", desc: "Diseños publicitarios y artes de marca" },
  ];

  const subTabKpierItems: Array<{ key: keyof TabPermissionConfig; label: string; desc: string }> = [
    { key: "sub_kpier_comisiones_sistema", label: "Comisiones UpConta Sistemas", desc: "Liquidación y detalle de comisiones de software y planes ERP (30%)" },
    { key: "sub_kpier_comisiones_firmas", label: "Comisiones Firmas Electrónicas", desc: "Calculadora de margen y consulta de ventas de firmas ANF" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
      {/* Save Notification Toast */}
      {savedMessage && (
        <div className="p-4 bg-emerald-900/90 text-emerald-100 border border-emerald-500 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Access Level Selector Tabs: Socio Administrativo vs Gerencia General */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(["admin", "gerencia"] as const).map((role) => {
          const isSel = selectedRole === role;
          const info = roleLabels[role];
          const distType = permissionsMap[role]?.distributorType || "total";

          return (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                isSel
                  ? "bg-[#0B2545] text-white border-[#3B51A3] shadow-md ring-2 ring-blue-400/40"
                  : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md ${
                  isSel ? "bg-amber-400 text-slate-950" : "bg-slate-100 text-slate-700"
                }`}>
                  {info.badge}
                </span>
                <span className={`text-[10px] font-bold uppercase ${isSel ? "text-blue-200" : "text-slate-500"}`}>
                  Tipo de Distribución: {distType.toUpperCase()}
                </span>
              </div>
              <h3 className="font-extrabold text-base">{info.title}</h3>
              <p className={`text-xs mt-1 ${isSel ? "text-slate-300" : "text-slate-500"}`}>
                {info.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Selector de Socios Creados para darles Acceso Independiente */}
      {selectedRole === "admin" && (
        <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div>
            <label className="text-xs font-black text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Listado de Socios Creados para Acceso Independiente:</span>
            </label>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Elija "Configuración General" para aplicar a todos los socios, o seleccione un socio registrado específico para asignarle permisos personalizados.
            </p>
          </div>
          <select
            value={selectedSocioKey}
            onChange={(e) => setSelectedSocioKey(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer min-w-[280px]"
          >
            <option value="admin">-- Configuración General (Todos los Socios) --</option>
            {createdSociosList.map((socio) => (
              <option key={socio.code} value={socio.code}>
                {socio.nombre ? `${socio.nombre} [Código: ${socio.code}]` : `Socio Código ${socio.code}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Main Configuration Card for Selected Profile */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
        
        {/* Header & Distributor Type Preset Selection */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80">
                Configurando Accesos Para
              </span>
              <h3 className="text-base font-extrabold text-slate-900">
                {selectedRole === "admin" && selectedSocioKey !== "admin"
                  ? `Acceso Independiente: ${createdSociosList.find(s => s.code === selectedSocioKey)?.nombre || selectedSocioKey}`
                  : roleLabels[selectedRole].title}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {selectedRole === "admin"
                ? "Seleccione un preajuste de tipo de distribuidor o configure manualmente cada casilla de verificación."
                : "Active o desactive las pestañas que desea mantener visibles y utilizables en su perfil gerencial."}
            </p>
          </div>

          {/* Tipo de Distribuidor Selector */}
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-2">
            <span className="text-xs font-bold text-slate-700 px-2 flex items-center gap-1 shrink-0">
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span>Cargar Preajuste Rápido:</span>
            </span>
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              {(["total", "sistemas", "firmas"] as DistributorType[]).map((t) => {
                const isActive = activeRoleConfig.distributorType === t;
                return (
                  <button
                    key={t}
                    onClick={() => handleDistributorTypeChange(t)}
                    className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer uppercase tracking-wider ${
                      isActive
                        ? "bg-[#0B2545] text-white shadow-sm ring-1 ring-blue-500"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {t === "total" ? "1. Total (Todas)" : t === "sistemas" ? "2. Sistemas" : "3. Firmas"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Informative Banner based on selected Distributor Type */}
        <div className="p-4 bg-blue-50/80 border border-blue-200/80 rounded-2xl text-xs text-slate-700 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-slate-900">
              Preajuste Seleccionado: <span className="uppercase font-black text-blue-700">{activeRoleConfig.distributorType}</span>
            </p>
            <p className="text-slate-600 leading-relaxed">
              {activeRoleConfig.distributorType === "sistemas" &&
                "El perfil de Sistemas habilita por defecto las pestañas de software contable (Planes ERP, Cotizador Comercial, Red KPIer y Soporte UpConta), omitiendo firmas electrónicas, y en Empresa visualiza únicamente UpConta."}
              {activeRoleConfig.distributorType === "firmas" &&
                "El perfil de Firmas habilita por defecto las pestañas de Firmas Electrónicas (Requisitos, Cotizador, GoDi y Soporte ANF AC), desactivando software contable, y en Socio Estratégico visualiza únicamente ANF AC."}
              {activeRoleConfig.distributorType === "total" &&
                "El perfil Total habilita el acceso completo a todas las pestañas y subpestañas disponibles, mostrando tanto ANF AC como UpConta en Empresa y Soporte."}
            </p>
          </div>
        </div>

        {/* SECTION 1: MAIN TABS VALIDATION MATRIX */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Layers className="w-5 h-5 text-[#3B51A3]" />
            <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              1. Permisos de Pestañas Principales
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {mainTabItems.map((item) => {
              const isChecked = activeRoleConfig.permissions[item.key] ?? false;

              return (
                <div
                  key={item.key}
                  onClick={() => handleTogglePermission(item.key)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isChecked
                      ? "bg-emerald-50/50 border-emerald-300 text-slate-900"
                      : "bg-slate-50/60 border-slate-200 text-slate-400 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5">{item.icon}</div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">{item.label}</span>
                      <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">{item.desc}</span>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // handled by parent onClick
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer mt-0.5 shrink-0"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: SUBTABS OF EMPRESA (ANF AC / UPCONTA) */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building className="w-5 h-5 text-blue-700" />
            <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              2. Visualización de Información de Empresa (ANF AC / UpConta)
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {subTabEmpresaItems.map((item) => {
              const isChecked = activeRoleConfig.permissions[item.key] ?? false;
              const isBlue = item.color === "blue";

              return (
                <div
                  key={item.key}
                  onClick={() => handleTogglePermission(item.key)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isChecked
                      ? isBlue
                        ? "bg-blue-50/70 border-blue-300 text-slate-900"
                        : "bg-amber-50/70 border-amber-300 text-slate-900"
                      : "bg-slate-50/60 border-slate-200 text-slate-400 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5">{item.icon}</div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">{item.label}</span>
                      <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">{item.desc}</span>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className={`w-4 h-4 rounded border-slate-300 cursor-pointer mt-0.5 shrink-0 ${
                      isBlue ? "text-blue-600 focus:ring-blue-500" : "text-amber-600 focus:ring-amber-500"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: SUBTABS OF SOPORTE (UPCONTA / ANF AC FIRMAS) */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <HelpCircle className="w-5 h-5 text-rose-600" />
            <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              3. Visualización de Canales de Soporte (UpConta / ANF AC Firmas)
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {subTabSoporteItems.map((item) => {
              const isChecked = activeRoleConfig.permissions[item.key] ?? false;
              const isAmber = item.color === "amber";

              return (
                <div
                  key={item.key}
                  onClick={() => handleTogglePermission(item.key)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isChecked
                      ? isAmber
                        ? "bg-amber-50/70 border-amber-300 text-slate-900"
                        : "bg-blue-50/70 border-blue-300 text-slate-900"
                      : "bg-slate-50/60 border-slate-200 text-slate-400 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5">{item.icon}</div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">{item.label}</span>
                      <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">{item.desc}</span>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className={`w-4 h-4 rounded border-slate-300 cursor-pointer mt-0.5 shrink-0 ${
                      isAmber ? "text-amber-600 focus:ring-amber-500" : "text-blue-600 focus:ring-blue-500"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 4: SUBTABS OF PLANES & FICHAS */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <FileText className="w-5 h-5 text-purple-600" />
            <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              4. Subpestañas de "Planes y Fichas Técnicas"
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {subTabPlanesItems.map((item) => {
              const isChecked = activeRoleConfig.permissions[item.key] ?? false;
              return (
                <div
                  key={item.key}
                  onClick={() => handleTogglePermission(item.key)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isChecked
                      ? "bg-purple-50/50 border-purple-300 text-slate-900"
                      : "bg-slate-50/60 border-slate-200 text-slate-400 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">{item.label}</span>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">{item.desc}</span>
                  </div>

                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer mt-0.5 shrink-0"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 5: SUBTABS OF COTIZADOR COMERCIAL */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ShoppingBag className="w-5 h-5 text-amber-600" />
            <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              5. Subpestañas de "Cotizador Comercial"
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {subTabComercialItems.map((item) => {
              const isChecked = activeRoleConfig.permissions[item.key] ?? false;
              return (
                <div
                  key={item.key}
                  onClick={() => handleTogglePermission(item.key)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isChecked
                      ? "bg-amber-50/50 border-amber-300 text-slate-900"
                      : "bg-slate-50/60 border-slate-200 text-slate-400 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">{item.label}</span>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">{item.desc}</span>
                  </div>

                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer mt-0.5 shrink-0"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 6: SUBTABS OF RED KPIER */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              6. Subpestañas de "Red KPIer"
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {subTabKpierItems.map((item) => {
              const isChecked = activeRoleConfig.permissions[item.key] ?? false;
              return (
                <div
                  key={item.key}
                  onClick={() => handleTogglePermission(item.key)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isChecked
                      ? "bg-emerald-50/50 border-emerald-300 text-slate-900"
                      : "bg-slate-50/60 border-slate-200 text-slate-400 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">{item.label}</span>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">{item.desc}</span>
                  </div>

                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer mt-0.5 shrink-0"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Table Comparison for Socio Administrativo vs Gerencia General */}
        <div className="pt-6 border-t border-slate-200 space-y-4">
          <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-700" />
            <span>Matriz Comparativa de Accesos</span>
          </h4>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0B2545] text-white">
                  <th className="p-3 font-extrabold border-b border-slate-700">Pestaña / Módulo</th>
                  <th className="p-3 font-extrabold border-b border-slate-700 text-center">Perfil Socio Administrativo</th>
                  <th className="p-3 font-extrabold border-b border-slate-700 text-center">Perfil Gerencia General</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {mainTabItems.map((item) => {
                  const isEmpresa = item.key === "empresa";
                  const isSoporte = item.key === "soporte";
                  const isKpier = item.key === "kpier";
                  return (
                    <React.Fragment key={item.key}>
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-slate-800 flex items-center gap-2">
                          {item.icon}
                          <span>{item.label}</span>
                        </td>
                        {(["admin", "gerencia"] as const).map((r) => {
                          const active = permissionsMap[r]?.permissions[item.key];
                          return (
                            <td key={r} className="p-3 text-center">
                              {active ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-full">
                                  <Check className="w-3 h-3" /> Habilitado
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 text-slate-400 font-bold text-[10px] rounded-full">
                                  Oculto
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Sub-rows for KPIer specific info */}
                      {isKpier &&
                        subTabKpierItems.map((subItem) => (
                          <tr key={subItem.key} className="bg-slate-50/50 hover:bg-slate-100/60 transition-colors text-[11px]">
                            <td className="p-2.5 pl-8 font-medium text-slate-700 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>{subItem.label}</span>
                            </td>
                            {(["admin", "gerencia"] as const).map((r) => {
                              const active = permissionsMap[r]?.permissions[subItem.key];
                              return (
                                <td key={r} className="p-2.5 text-center">
                                  {active ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[9px] rounded-full">
                                      <Check className="w-2.5 h-2.5" /> Visible
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-400 font-medium text-[9px] rounded-full">
                                      No Visible
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}

                      {/* Sub-rows for Empresa specific info */}
                      {isEmpresa &&
                        subTabEmpresaItems.map((subItem) => (
                          <tr key={subItem.key} className="bg-slate-50/50 hover:bg-slate-100/60 transition-colors text-[11px]">
                            <td className="p-2.5 pl-8 font-medium text-slate-700 flex items-center gap-2">
                              {subItem.icon}
                              <span>{subItem.label}</span>
                            </td>
                            {(["admin", "gerencia"] as const).map((r) => {
                              const active = permissionsMap[r]?.permissions[subItem.key];
                              return (
                                <td key={r} className="p-2.5 text-center">
                                  {active ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 font-bold text-[9px] rounded-full">
                                      <Check className="w-2.5 h-2.5" /> Visible
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-400 font-medium text-[9px] rounded-full">
                                      No Visible
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}

                      {/* Sub-rows for Soporte specific info */}
                      {isSoporte &&
                        subTabSoporteItems.map((subItem) => (
                          <tr key={subItem.key} className="bg-slate-50/50 hover:bg-slate-100/60 transition-colors text-[11px]">
                            <td className="p-2.5 pl-8 font-medium text-slate-700 flex items-center gap-2">
                              {subItem.icon}
                              <span>{subItem.label}</span>
                            </td>
                            {(["admin", "gerencia"] as const).map((r) => {
                              const active = permissionsMap[r]?.permissions[subItem.key];
                              return (
                                <td key={r} className="p-2.5 text-center">
                                  {active ? (
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 font-bold text-[9px] rounded-full ${
                                      subItem.color === "amber" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                                    }`}>
                                      <Check className="w-2.5 h-2.5" /> Visible
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-400 font-medium text-[9px] rounded-full">
                                      No Visible
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions at the bottom */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={handleReset}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-300"
            title="Restablecer a valores por defecto"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Restablecer Valores por Defecto</span>
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-3 bg-[#0B2545] hover:bg-[#133E72] text-white font-black rounded-xl text-xs shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer border border-blue-400/30"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>Guardar Configuración</span>
          </button>
        </div>

      </div>
    </div>
  );
}
