import React, { useState } from "react";
import {
  Headphones,
  MapPin,
  Mail,
  Clock,
  Building2,
  FileCheck,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Briefcase,
  Users,
  FileText,
  ShieldCheck,
  Download,
  AlertCircle
} from "lucide-react";
import { generateProcessManualPDF } from "../utils/generateProcessManualPDF";
import { TabPermissionConfig, getPermissionsForSocio } from "../utils/permissions";

interface SoporteModuleProps {
  isGerencia?: boolean;
  userPerms?: TabPermissionConfig;
}

export function SoporteModule({ isGerencia, userPerms }: SoporteModuleProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const activeUser = sessionStorage.getItem("godi_user") || "admin";
  const checkIsGerencia = isGerencia !== undefined 
    ? isGerencia 
    : activeUser === "gerencia";

  const effectivePerms = userPerms || getPermissionsForSocio(activeUser);
  const showUpConta = effectivePerms.sub_soporte_upconta ?? true;
  const showAnf = effectivePerms.sub_soporte_anf ?? true;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const formatWhatsappUrl = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    let fullPhone = cleanPhone;
    if (fullPhone.startsWith("0")) {
      fullPhone = "593" + fullPhone.substring(1);
    } else if (!fullPhone.startsWith("593")) {
      fullPhone = "593" + fullPhone;
    }
    return `https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`;
  };

  const equipoSoporteUpConta = [
    { nombre: "Gabriela Calva", telefono: "099 465 1787", rawPhone: "0994651787" },
    { nombre: "Carolina Cedeño", telefono: "098 470 1938", rawPhone: "0984701938" },
    { nombre: "Cinthya Robalino", telefono: "098 788 4668", rawPhone: "0987884668" },
    { nombre: "John Torres", telefono: "097 905 4677", rawPhone: "0979054677" },
    { nombre: "Carolina Yanez", telefono: "098 182 1410", rawPhone: "0981821410" },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Title Bar (Clean & Professional) */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Headphones className="w-6 h-6 text-[#0B2545]" />
          <span>Soporte y Canales de Atención</span>
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Contactos directos de soporte técnico y atención para UpConta Sistemas y Firmas Electrónicas ANF AC
        </p>
      </div>

      {/* GERENCIA EXCLUSIVE: Manual de Procesos Banner */}
      {checkIsGerencia && (
        <div className="bg-gradient-to-r from-[#0B2545] via-[#12305B] to-[#1A3C6E] text-white p-5 rounded-2xl border border-blue-900 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-amber-500/20 text-amber-400 border border-amber-400/40 rounded-xl shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black uppercase rounded-md tracking-wider">
                  Exclusivo Gerencia
                </span>
                <span className="text-xs text-blue-200 font-medium">Documentación Oficial de Procesos</span>
              </div>
              <h2 className="text-base font-black text-white mt-1">
                Manual de Procesos Operativos Paso a Paso (Godi Platform)
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Descargue el documento PDF explicativo con la guía paso a paso para el uso de cada pestaña, mapas de flujo, reglas de validación anti-duplicidad y sincronización con Google Sheets.
              </p>
            </div>
          </div>

          <button
            onClick={() => generateProcessManualPDF()}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 shadow-md hover:scale-105 active:scale-95"
            title="Descargar Manual de Procesos Operativos en PDF"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>Descargar Manual PDF</span>
          </button>
        </div>
      )}

      {/* When no support channel is enabled */}
      {!showUpConta && !showAnf && (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No hay canales de soporte habilitados</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Este perfil no tiene asignados canales de atención en la matriz de validación de accesos.
          </p>
        </div>
      )}

      {/* Main Content Grid (Adaptive layout based on single vs both cards) */}
      {(showUpConta || showAnf) && (
        <div
          className={`grid gap-6 items-start ${
            showUpConta && showAnf
              ? "grid-cols-1 lg:grid-cols-2"
              : "grid-cols-1 max-w-3xl mx-auto"
          }`}
        >
          {/* ================= CARD 1: UPCONTA SISTEMAS (ORANGE/AMBER THEME) ================= */}
          {showUpConta && (
            <div className="bg-white rounded-2xl border border-amber-200/80 shadow-xs hover:border-amber-300 transition-all overflow-hidden">
              {/* Header Indicator Bar - Orange/Amber */}
              <div className="h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />

              <div className="p-6 space-y-6">
                {/* Card Title */}
                <div className="flex items-center justify-between pb-3 border-b border-amber-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
                      <Building2 className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">UpConta Sistemas</h2>
                      <p className="text-xs text-slate-500 font-medium">Sistemas contables y ERP en la nube</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 font-extrabold text-[10px] uppercase rounded-lg">
                    Sistemas
                  </span>
                </div>

                {/* General Info: Location & Hours */}
                <div className="space-y-3">
                  {/* Direction */}
                  <div className="flex items-start gap-3 text-xs text-slate-700">
                    <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <p className="font-semibold text-slate-800 leading-relaxed">
                        Av. 12 de Octubre N24-739 y Av. Colón, Edif. Torre Boreal, Torre A,{" "}
                        <span className="font-extrabold text-slate-900">Piso 6 (Of. 608 - 609)</span>, Quito
                      </p>
                      <button
                        onClick={() =>
                          handleCopy(
                            "Av. 12 de Octubre N24-739 y Av. Colón, Edif. Torre Boreal, Torre A, Piso 6 – Oficinas 608 y 609, Quito"
                          )
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-900 cursor-pointer pt-0.5"
                      >
                        {copiedText ===
                        "Av. 12 de Octubre N24-739 y Av. Colón, Edif. Torre Boreal, Torre A, Piso 6 – Oficinas 608 y 609, Quito" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Dirección copiada</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar dirección</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-center gap-3 text-xs text-slate-700 pt-1">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    <p className="font-medium">
                      Horario de Soporte: <span className="font-extrabold text-slate-900">08:00 a.m. – 8:00 p.m.</span>
                    </p>
                  </div>
                </div>

                {/* Contact Buttons: Ventas & Atención al Cliente */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {/* Ventas */}
                  <div className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <Briefcase className="w-4 h-4 text-emerald-600" />
                      <span>Ventas</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <a
                        href={formatWhatsappUrl(
                          "0980690459",
                          "Hola, vengo de la plataforma de distribuidores, necesito conocer de los planes en ventas"
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between font-bold text-emerald-800 hover:text-emerald-900 group"
                      >
                        <span>+593 98 069 0459</span>
                        <MessageCircle className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                      </a>
                      <a
                        href="mailto:DSANTANDER@upconta.com"
                        className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 hover:text-slate-900 truncate"
                      >
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">DSANTANDER@upconta.com</span>
                      </a>
                    </div>
                  </div>

                  {/* Atención al Cliente */}
                  <div className="p-3.5 rounded-xl border border-amber-200 hover:border-amber-300 hover:bg-amber-50/30 transition-all space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <Users className="w-4 h-4 text-amber-600" />
                      <span>Atención al Cliente</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <a
                        href={formatWhatsappUrl(
                          "0997347543",
                          "Hola, vengo de la plataforma de distribuidores, necesito ayuda sobre mi cuenta de distribuidor"
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between font-bold text-amber-800 hover:text-amber-900 group"
                      >
                        <span>+593 99 734 7543</span>
                        <MessageCircle className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                      </a>
                      <a
                        href="mailto:mvelez@upconta.com"
                        className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 hover:text-slate-900 truncate"
                      >
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">mvelez@upconta.com</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Equipo de Soporte Técnico */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
                      <Headphones className="w-3.5 h-3.5 text-amber-600" />
                      <span>Equipo de Soporte Técnico</span>
                    </h3>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      Atención Directa
                    </span>
                  </div>

                  <div className="space-y-2">
                    {equipoSoporteUpConta.map((item, idx) => (
                      <div
                        key={idx}
                        className="py-2 px-3 hover:bg-amber-50/40 rounded-xl border border-slate-100 hover:border-amber-200 flex items-center justify-between gap-2 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0">
                            {item.nombre.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{item.nombre}</p>
                            <p className="text-[11px] text-slate-500 font-medium">{item.telefono}</p>
                          </div>
                        </div>

                        <a
                          href={formatWhatsappUrl(
                            item.rawPhone,
                            "Hola, vengo de la plataforma de distribuidores, necesito soporte"
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-lg transition-all text-[11px] font-bold shrink-0 cursor-pointer border border-emerald-200 hover:border-emerald-600"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= CARD 2: FIRMAS ELECTRÓNICAS ANF AC (BLUE THEME) ================= */}
          {showAnf && (
            <div className="bg-white rounded-2xl border border-blue-200/80 shadow-xs hover:border-blue-300 transition-all overflow-hidden">
              {/* Header Indicator Bar - ANF Blue */}
              <div className="h-1.5 bg-gradient-to-r from-[#0B2545] via-blue-700 to-indigo-800" />

              <div className="p-6 space-y-6">
                {/* Card Title */}
                <div className="flex items-center justify-between pb-3 border-b border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-800 rounded-xl border border-blue-200">
                      <ShieldCheck className="w-5 h-5 text-blue-700" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">Firmas Electrónicas</h2>
                      <p className="text-xs text-slate-500 font-medium">ANF AC Ecuador - Emisión y renovación</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 font-extrabold text-[10px] uppercase rounded-lg">
                    Firmas .p12
                  </span>
                </div>

                {/* General Info: Location & Hours */}
                <div className="space-y-3">
                  {/* Direction */}
                  <div className="flex items-start gap-3 text-xs text-slate-700">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <p className="font-semibold text-slate-800 leading-relaxed">
                        Av. 12 de Octubre N24-739 y Av. Colón. Edif. Torre Boreal, Torre A,{" "}
                        <span className="font-extrabold text-slate-900">Piso 6 Of. 603</span> (Quito - Ecuador)
                      </p>
                      <button
                        onClick={() =>
                          handleCopy(
                            "Av. 12 de Octubre N24-739 y Av. Colón. Edif. Torre Boreal, Torre A, Piso 6 Of. 603 (Quito - Ecuador)"
                          )
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer pt-0.5"
                      >
                        {copiedText ===
                        "Av. 12 de Octubre N24-739 y Av. Colón. Edif. Torre Boreal, Torre A, Piso 6 Of. 603 (Quito - Ecuador)" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Dirección copiada</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar dirección</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-center gap-3 text-xs text-slate-700 pt-1">
                    <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                    <p className="font-medium">
                      Horario de Atención:{" "}
                      <span className="font-extrabold text-slate-900">Lun-Vie 9:00 - 13:00 / 14:00 - 20:00</span>
                    </p>
                  </div>
                </div>

                {/* Contact Sections: Líneas Directas */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
                    <Headphones className="w-3.5 h-3.5 text-blue-600" />
                    <span>Líneas Directas de Atención</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Atención al Cliente Firmas */}
                    <div className="p-3.5 rounded-xl border border-blue-200 hover:border-blue-300 hover:bg-blue-50/20 transition-all flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">Atención al Cliente</p>
                        <p className="text-xs font-black text-slate-800 mt-0.5">098 772 1412</p>
                      </div>
                      <a
                        href={formatWhatsappUrl(
                          "0987721412",
                          "Hola, vengo de la plataforma de distribuidores, necesito ayuda sobre mi cuenta de distribuidor"
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-lg transition-all border border-emerald-200 hover:border-emerald-600 cursor-pointer"
                        title="WhatsApp Atención al Cliente"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </div>

                    {/* Fedotaxi */}
                    <div className="p-3.5 rounded-xl border border-blue-200 hover:border-blue-300 hover:bg-blue-50/20 transition-all flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">Línea Fedotaxi</p>
                        <p className="text-xs font-black text-slate-800 mt-0.5">099 933 2855</p>
                      </div>
                      <a
                        href={formatWhatsappUrl(
                          "0999332855",
                          "Hola, vengo de la plataforma de distribuidores, necesito información"
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-lg transition-all border border-emerald-200 hover:border-emerald-600 cursor-pointer"
                        title="WhatsApp Fedotaxi"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Ventas o Renovaciones Firmas */}
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3 pt-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                      Ventas o Renovaciones
                    </h3>
                    <span className="text-[10px] font-extrabold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200">
                      Firmas ANF AC
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <a
                      href={formatWhatsappUrl(
                        "0997347543",
                        "Hola, vengo de la plataforma de distribuidores, necesito conocer de los planes en ventas"
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 font-bold rounded-lg border border-slate-200 hover:border-emerald-300 transition-all group"
                    >
                      <span>+593 99 734 7543</span>
                      <MessageCircle className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                    </a>

                    <a
                      href="mailto:mvelez@upconta.com"
                      className="flex items-center gap-2 p-2.5 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-lg border border-slate-200 transition-all truncate"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate text-xs">mvelez@upconta.com</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 ml-auto shrink-0" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

