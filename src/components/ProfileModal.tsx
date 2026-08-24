import React, { useState, useEffect } from "react";
import { X, User, Mail, Lock, Phone, FileText, Key, CheckCircle2, Eye, EyeOff, Save, ShieldCheck, Landmark, CreditCard, Building2 } from "lucide-react";
import { getPartnerCodeSlots, savePartnerCodeSlots } from "../utils/partnerCodes";
import { syncSocioToGoogleSheets } from "../utils/googleSheetsSync";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (newName: string) => void;
}

const ECUADOR_BANKS = [
  "Banco Pichincha",
  "Banco Guayaquil",
  "Produbanco (Grupo Promerica)",
  "Banco del Pacífico",
  "Banco Bolivariano",
  "Banco Internacional",
  "Banco del Austro",
  "Banco General Rumiñahui",
  "Banco de Loja",
  "Banco Machala",
  "Banco Solidario",
  "Cooperativa JEP",
  "Cooperativa Policía Nacional",
  "Cooperativa 29 de Octubre",
  "Cooperativa Alianza del Valle",
  "Cooperativa Andalucía",
  "Mutualista Pichincha",
  "Otro Banco / Cooperativa",
];

export function ProfileModal({ isOpen, onClose, onProfileUpdated }: ProfileModalProps) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rucCedula, setRucCedula] = useState("");
  const [telefono, setTelefono] = useState("");
  const [partnerCode, setPartnerCode] = useState("");
  const [role, setRole] = useState("admin1");

  // Bank account fields
  const [banco, setBanco] = useState("");
  const [tipoCuenta, setTipoCuenta] = useState("Cuenta de Ahorros");
  const [numeroCuenta, setNumeroCuenta] = useState("");
  const [titularCuenta, setTitularCuenta] = useState("");
  const [cedulaTitular, setCedulaTitular] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSuccessMsg("");
      setErrorMsg("");

      const sName = sessionStorage.getItem("godi_user_name") || "";
      const sEmail = sessionStorage.getItem("godi_user_email") || "";
      const sRuc = sessionStorage.getItem("godi_user_ruc") || "";
      const sPhone = sessionStorage.getItem("godi_user_phone") || "";
      const sCode = sessionStorage.getItem("godi_user_code") || "";
      const sRole = sessionStorage.getItem("godi_user") || "admin1";

      const sBanco = sessionStorage.getItem("godi_user_banco") || "";
      const sTipoCuenta = sessionStorage.getItem("godi_user_tipo_cuenta") || "Cuenta de Ahorros";
      const sNumCuenta = sessionStorage.getItem("godi_user_numero_cuenta") || "";
      const sTitular = sessionStorage.getItem("godi_user_titular_cuenta") || sName;
      const sCedTitular = sessionStorage.getItem("godi_user_cedula_titular") || sRuc;

      const isGerenciaUser = sRole === "gerencia";

      const currentNombre = isGerenciaUser ? (sName && sName !== "Diego Santander" ? sName : "David Santander") : (sName || "Usuario Registrado");
      const currentRuc = isGerenciaUser ? "1722388426" : sRuc;

      setNombre(currentNombre);
      setEmail(isGerenciaUser ? "dsantander@upconta.com" : sEmail);
      setRucCedula(currentRuc);
      setTelefono(isGerenciaUser ? "098 069 0459" : sPhone);
      setPartnerCode(sCode || (isGerenciaUser ? "GER-001" : ""));
      setRole(sRole);

      setBanco(sBanco);
      setTipoCuenta(sTipoCuenta);
      setNumeroCuenta(sNumCuenta);
      setTitularCuenta(sTitular || currentNombre);
      setCedulaTitular(sCedTitular || currentRuc);

      // Try to read existing password and bank info from localStorage across all stores
      try {
        let realPassword = "";
        let foundBanco = sBanco;
        let foundTipo = sTipoCuenta;
        let foundNum = sNumCuenta;
        let foundTitular = sTitular;
        let foundCedTitular = sCedTitular;
        
        // 1. Check kpier_partner_codes
        const slotsStr = localStorage.getItem("kpier_partner_codes");
        if (slotsStr) {
          const slots: any[] = JSON.parse(slotsStr);
          const foundSlot = slots.find(
            (s) =>
              (sCode && s.code?.toUpperCase() === sCode.toUpperCase()) ||
              (sEmail && s.email?.toLowerCase() === sEmail.toLowerCase()) ||
              (sName && s.nombre?.toLowerCase() === sName.toLowerCase())
          );
          if (foundSlot) {
            if (foundSlot.password) realPassword = foundSlot.password;
            if (foundSlot.banco) foundBanco = foundSlot.banco;
            if (foundSlot.tipoCuenta) foundTipo = foundSlot.tipoCuenta;
            if (foundSlot.numeroCuenta) foundNum = foundSlot.numeroCuenta;
            if (foundSlot.titularCuenta) foundTitular = foundSlot.titularCuenta;
            if (foundSlot.cedulaTitular) foundCedTitular = foundSlot.cedulaTitular;
          }
        }

        // 2. Check kpier_registered_users if not found
        const registeredUsersStr = localStorage.getItem("kpier_registered_users");
        if (registeredUsersStr) {
          const registeredUsers = JSON.parse(registeredUsersStr);
          const found = registeredUsers.find(
            (u: any) =>
              (sEmail && u.email?.toLowerCase() === sEmail.toLowerCase()) ||
              (sName && u.nombre?.toLowerCase() === sName.toLowerCase()) ||
              (sCode && u.partnerCode === sCode)
          );
          if (found) {
            if (!realPassword && found.password) realPassword = found.password;
            if (!foundBanco && found.banco) foundBanco = found.banco;
            if (!foundTipo && found.tipoCuenta) foundTipo = found.tipoCuenta;
            if (!foundNum && found.numeroCuenta) foundNum = found.numeroCuenta;
            if (!foundTitular && found.titularCuenta) foundTitular = found.titularCuenta;
            if (!foundCedTitular && found.cedulaTitular) foundCedTitular = found.cedulaTitular;
          }
        }

        // 3. Check kpier_socios_registrados
        const sociosStr = localStorage.getItem("kpier_socios_registrados");
        if (sociosStr) {
          const socios = JSON.parse(sociosStr);
          const foundSoc = socios.find(
            (s: any) =>
              (sEmail && s.email?.toLowerCase() === sEmail.toLowerCase()) ||
              (sName && (s.nombreApellido || s.nombre)?.toLowerCase() === sName.toLowerCase()) ||
              (sCode && (s.codigoSocio || s.partnerCode) === sCode)
          );
          if (foundSoc) {
            if (!realPassword && foundSoc.password) realPassword = foundSoc.password;
            if (!foundBanco && foundSoc.banco) foundBanco = foundSoc.banco;
            if (!foundTipo && foundSoc.tipoCuenta) foundTipo = foundSoc.tipoCuenta;
            if (!foundNum && foundSoc.numeroCuenta) foundNum = foundSoc.numeroCuenta;
            if (!foundTitular && foundSoc.titularCuenta) foundTitular = foundSoc.titularCuenta;
            if (!foundCedTitular && foundSoc.cedulaTitular) foundCedTitular = foundSoc.cedulaTitular;
          }
        }

        setPassword(realPassword);
        if (foundBanco) setBanco(foundBanco);
        if (foundTipo) setTipoCuenta(foundTipo);
        if (foundNum) setNumeroCuenta(foundNum);
        if (foundTitular) setTitularCuenta(foundTitular);
        if (foundCedTitular) setCedulaTitular(foundCedTitular);
      } catch (err) {
        setPassword("");
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const isGerencia = role === "gerencia" || sessionStorage.getItem("godi_user") === "gerencia";

    if (!nombre.trim() || !email.trim() || !password.trim()) {
      setErrorMsg("Nombre, correo electrónico y contraseña son campos obligatorios.");
      return;
    }

    try {
      const cleanNombre = isGerencia ? "David Santander" : nombre.trim();
      const cleanEmail = isGerencia ? "dsantander@upconta.com" : email.trim();
      const cleanPassword = password.trim();
      const cleanRuc = isGerencia ? "1722388426" : rucCedula.trim();
      const cleanPhone = isGerencia ? "098 069 0459" : telefono.trim();

      const cleanBanco = banco.trim();
      const cleanTipoCuenta = tipoCuenta.trim();
      const cleanNumeroCuenta = numeroCuenta.trim();
      const cleanTitular = titularCuenta.trim() || cleanNombre;
      const cleanCedulaTitular = cedulaTitular.trim() || cleanRuc;

      // 1. Update sessionStorage
      sessionStorage.setItem("godi_user_name", cleanNombre);
      sessionStorage.setItem("godi_user_email", cleanEmail);
      sessionStorage.setItem("godi_user_pass", cleanPassword);
      sessionStorage.setItem("godi_user_ruc", cleanRuc);
      sessionStorage.setItem("godi_user_phone", cleanPhone);
      sessionStorage.setItem("godi_user_banco", cleanBanco);
      sessionStorage.setItem("godi_user_tipo_cuenta", cleanTipoCuenta);
      sessionStorage.setItem("godi_user_numero_cuenta", cleanNumeroCuenta);
      sessionStorage.setItem("godi_user_titular_cuenta", cleanTitular);
      sessionStorage.setItem("godi_user_cedula_titular", cleanCedulaTitular);

      // If Gerencia, DO NOT create a new socio and DO NOT sync to Google Sheets
      if (isGerencia) {
        try {
          const usersStr = localStorage.getItem("kpier_registered_users");
          if (usersStr) {
            const usersArr: any[] = JSON.parse(usersStr);
            const updated = usersArr.map((u) => {
              if (u.role === "gerencia" || u.email?.toLowerCase() === "dsantander@upconta.com") {
                return {
                  ...u,
                  password: cleanPassword,
                  banco: cleanBanco,
                  tipoCuenta: cleanTipoCuenta,
                  numeroCuenta: cleanNumeroCuenta,
                  titularCuenta: cleanTitular,
                  cedulaTitular: cleanCedulaTitular,
                };
              }
              return u;
            });
            localStorage.setItem("kpier_registered_users", JSON.stringify(updated));
          }
        } catch (e) {}

        setSuccessMsg("¡Contraseña y datos de perfil de Gerencia actualizados exitosamente!");
        setTimeout(() => {
          onClose();
        }, 1200);
        return;
      }

      // 2. Update kpier_registered_users for non-gerencia partners
      const usersStr = localStorage.getItem("kpier_registered_users");
      const usersArr: any[] = usersStr ? JSON.parse(usersStr) : [];
      let updatedUsers = false;

      const newUsersArr = usersArr.map((u) => {
        if (
          (partnerCode && u.partnerCode === partnerCode) ||
          (cleanEmail && u.email?.toLowerCase() === cleanEmail.toLowerCase()) ||
          (cleanNombre && u.nombre?.toLowerCase() === cleanNombre.toLowerCase())
        ) {
          updatedUsers = true;
          return {
            ...u,
            nombre: cleanNombre,
            email: cleanEmail,
            password: cleanPassword,
            rucCedula: cleanRuc,
            telefono: cleanPhone,
            banco: cleanBanco,
            tipoCuenta: cleanTipoCuenta,
            numeroCuenta: cleanNumeroCuenta,
            titularCuenta: cleanTitular,
            cedulaTitular: cleanCedulaTitular,
          };
        }
        return u;
      });

      if (!updatedUsers) {
        newUsersArr.push({
          id: "usr-" + Date.now(),
          nombre: cleanNombre,
          email: cleanEmail,
          password: cleanPassword,
          rucCedula: cleanRuc,
          telefono: cleanPhone,
          partnerCode: partnerCode || "UPC-PARTNER",
          role: role,
          fechaRegistro: new Date().toISOString().split("T")[0],
          estado: "Activo",
          banco: cleanBanco,
          tipoCuenta: cleanTipoCuenta,
          numeroCuenta: cleanNumeroCuenta,
          titularCuenta: cleanTitular,
          cedulaTitular: cleanCedulaTitular,
        });
      }
      localStorage.setItem("kpier_registered_users", JSON.stringify(newUsersArr));

      // 3. Update partner code slots
      const slots = getPartnerCodeSlots();
      const updatedSlots = slots.map((s) => {
        if (
          (partnerCode && s.code.toUpperCase() === partnerCode.toUpperCase()) ||
          (cleanEmail && s.email?.toLowerCase() === cleanEmail.toLowerCase()) ||
          (cleanNombre && s.nombre?.toLowerCase() === cleanNombre.toLowerCase())
        ) {
          return {
            ...s,
            used: true,
            nombre: cleanNombre,
            email: cleanEmail,
            password: cleanPassword,
            rucCedula: cleanRuc,
            telefono: cleanPhone,
            banco: cleanBanco,
            tipoCuenta: cleanTipoCuenta,
            numeroCuenta: cleanNumeroCuenta,
            titularCuenta: cleanTitular,
            cedulaTitular: cleanCedulaTitular,
          };
        }
        return s;
      });
      savePartnerCodeSlots(updatedSlots);

      // 4. Update kpier_socios_registrados
      const sociosStr = localStorage.getItem("kpier_socios_registrados");
      if (sociosStr) {
        const sociosArr: any[] = JSON.parse(sociosStr);
        const newSocios = sociosArr.map((soc) => {
          if (
            (partnerCode && soc.codigoSocio === partnerCode) ||
            (cleanEmail && soc.email?.toLowerCase() === cleanEmail.toLowerCase()) ||
            (cleanNombre && soc.nombreApellido?.toLowerCase() === cleanNombre.toLowerCase())
          ) {
            return {
              ...soc,
              nombreApellido: cleanNombre,
              email: cleanEmail,
              rucCedula: cleanRuc,
              telefono: cleanPhone,
              cedulaTelefono: `${cleanRuc} - ${cleanPhone}`,
              banco: cleanBanco,
              tipoCuenta: cleanTipoCuenta,
              numeroCuenta: cleanNumeroCuenta,
              titularCuenta: cleanTitular,
              cedulaTitular: cleanCedulaTitular,
            };
          }
          return soc;
        });
        localStorage.setItem("kpier_socios_registrados", JSON.stringify(newSocios));
      }

      // Notify updates
      window.dispatchEvent(new Event("kpier_socios_updated"));
      if (onProfileUpdated) {
        onProfileUpdated(cleanNombre);
      }

      setSuccessMsg("¡Datos personales y datos de cuenta bancaria actualizados exitosamente!");
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Error al actualizar perfil:", err);
      setErrorMsg("Ocurrió un error al guardar los cambios.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5 animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0B2545] text-white font-black flex items-center justify-center shadow-md">
              <User className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Mi Perfil y Credenciales</h3>
              <p className="text-xs text-slate-500 font-medium">Actualiza tus datos personales, contraseña y cuenta bancaria</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Badges bar - Shows only Código */}
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-extrabold text-slate-700">Código de Socio:</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-mono font-black text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-lg text-xs shadow-2xs">
              {partnerCode || "UPC-PARTNER"}
            </span>
          </div>
        </div>

        {/* Feedback messages */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {role === "gerencia" && (
            <div className="p-3 bg-amber-50/80 border border-amber-200 text-amber-900 rounded-2xl text-[11px] font-bold flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Los datos de Gerencia General están protegidos. Únicamente puedes modificar tu contraseña de acceso.</span>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-extrabold uppercase text-[10px] mb-1">
              Nombre Completo <span className="text-rose-500">*</span> {role === "gerencia" && <span className="text-amber-700 lowercase font-semibold">(Bloqueado)</span>}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                disabled={role === "gerencia"}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Ing. Carlos Andrade"
                className={`w-full pl-9 pr-3 py-2 rounded-xl font-bold text-slate-900 border ${
                  role === "gerencia"
                    ? "bg-slate-100/90 text-slate-500 border-slate-200 cursor-not-allowed"
                    : "bg-slate-50 border-slate-200 focus:bg-white focus:border-[#0B2545] focus:outline-none"
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-extrabold uppercase text-[10px] mb-1">
                Correo Electrónico <span className="text-rose-500">*</span> {role === "gerencia" && <span className="text-amber-700 lowercase font-semibold">(Bloqueado)</span>}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  disabled={role === "gerencia"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@upconta.ec"
                  className={`w-full pl-9 pr-3 py-2 rounded-xl font-bold text-slate-900 border ${
                    role === "gerencia"
                      ? "bg-slate-100/90 text-slate-500 border-slate-200 cursor-not-allowed"
                      : "bg-slate-50 border-slate-200 focus:bg-white focus:border-[#0B2545] focus:outline-none"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-extrabold uppercase text-[10px] mb-1">
                Contraseña de Acceso <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña secreta"
                  className="w-full pl-9 pr-9 py-2 bg-amber-50/70 border border-amber-300 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:border-[#0B2545] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? "Ocultar" : "Mostrar"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-extrabold uppercase text-[10px] mb-1">
                RUC / Cédula {role === "gerencia" && <span className="text-amber-700 lowercase font-semibold">(Bloqueado)</span>}
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  disabled={role === "gerencia"}
                  value={rucCedula}
                  onChange={(e) => setRucCedula(e.target.value)}
                  placeholder="1720394857001"
                  className={`w-full pl-9 pr-3 py-2 rounded-xl font-mono font-bold text-slate-900 border ${
                    role === "gerencia"
                      ? "bg-slate-100/90 text-slate-500 border-slate-200 cursor-not-allowed"
                      : "bg-slate-50 border-slate-200 focus:bg-white focus:border-[#0B2545] focus:outline-none"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-extrabold uppercase text-[10px] mb-1">
                Teléfono de Contacto {role === "gerencia" && <span className="text-amber-700 lowercase font-semibold">(Bloqueado)</span>}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  disabled={role === "gerencia"}
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="0991234567"
                  className={`w-full pl-9 pr-3 py-2 rounded-xl font-bold text-slate-900 border ${
                    role === "gerencia"
                      ? "bg-slate-100/90 text-slate-500 border-slate-200 cursor-not-allowed"
                      : "bg-slate-50 border-slate-200 focus:bg-white focus:border-[#0B2545] focus:outline-none"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* APARTADO: REGISTRO DE CUENTA BANCARIA PARA PAGO DE COMISIONES */}
          <div className="pt-3 border-t border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-black text-xs">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <p className="leading-tight">Registro de Cuenta Bancaria</p>
                <p className="text-[10px] text-slate-500 font-medium">Datos para depósito y transferencia de comisiones liquidadas</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-emerald-50/40 p-3.5 rounded-2xl border border-emerald-200/80">
              <div>
                <label className="block text-slate-700 font-extrabold uppercase text-[10px] mb-1">
                  Institución Financiera / Banco
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    list="bancos-ecuador-list"
                    value={banco}
                    onChange={(e) => setBanco(e.target.value)}
                    placeholder="Ej. Banco Pichincha"
                    className="w-full pl-9 pr-3 py-2 bg-white rounded-xl font-bold text-slate-900 border border-emerald-300 focus:border-emerald-600 focus:outline-none shadow-2xs"
                  />
                  <datalist id="bancos-ecuador-list">
                    {ECUADOR_BANKS.map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold uppercase text-[10px] mb-1">
                  Tipo de Cuenta
                </label>
                <select
                  value={tipoCuenta}
                  onChange={(e) => setTipoCuenta(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl font-bold text-slate-900 border border-emerald-300 focus:border-emerald-600 focus:outline-none shadow-2xs cursor-pointer"
                >
                  <option value="Cuenta de Ahorros">Cuenta de Ahorros</option>
                  <option value="Cuenta Corriente">Cuenta Corriente</option>
                  <option value="Cuenta Digital / Billetera">Cuenta Digital / Billetera</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold uppercase text-[10px] mb-1">
                  Número de Cuenta
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={numeroCuenta}
                    onChange={(e) => setNumeroCuenta(e.target.value)}
                    placeholder="Ej. 2201948572"
                    className="w-full pl-9 pr-3 py-2 bg-white rounded-xl font-mono font-bold text-slate-900 border border-emerald-300 focus:border-emerald-600 focus:outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold uppercase text-[10px] mb-1">
                  Titular de la Cuenta
                </label>
                <input
                  type="text"
                  value={titularCuenta}
                  onChange={(e) => setTitularCuenta(e.target.value)}
                  placeholder="Nombre y Apellido del Titular"
                  className="w-full px-3 py-2 bg-white rounded-xl font-bold text-slate-900 border border-emerald-300 focus:border-emerald-600 focus:outline-none shadow-2xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-extrabold uppercase text-[10px] mb-1">
                  Cédula / RUC del Titular
                </label>
                <input
                  type="text"
                  value={cedulaTitular}
                  onChange={(e) => setCedulaTitular(e.target.value)}
                  placeholder="10 o 13 dígitos del titular bancario"
                  className="w-full px-3 py-2 bg-white rounded-xl font-mono font-bold text-slate-900 border border-emerald-300 focus:border-emerald-600 focus:outline-none shadow-2xs"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="py-2.5 px-5 bg-[#0B2545] hover:bg-[#071930] text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
