import React, { useState } from "react";
import {
  Lock,
  User,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  TrendingUp,
  Award,
  CheckCircle2,
  Mail,
  Phone,
  FileText,
  UserPlus,
  IdCard,
  Info,
  XCircle,
} from "lucide-react";
import { DynamicBrandLogo } from "./GodiLogo";
import { logUserAccess } from "../utils/googleSheetsSync";
import { claimPartnerCode } from "../utils/partnerCodes";
import { validateRegistrationInput, checkDuplicateUser, getPasswordRequirements } from "../utils/validation";

interface LoginModalProps {
  onLoginSuccess: (userRole: string) => void;
}

interface RegisteredUser {
  id: string;
  email: string;
  nombre: string;
  rucCedula: string;
  telefono: string;
  password: string;
  partnerCode: string;
  role: string;
  fechaRegistro: string;
}

export function LoginModal({ onLoginSuccess }: LoginModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");

  // Login Form States
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // Register Form States
  const [regEmail, setRegEmail] = useState("");
  const [regNombre, setRegNombre] = useState("");
  const [regRuc, setRegRuc] = useState("");
  const [regTelefono, setRegTelefono] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPartnerCode, setRegPartnerCode] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showInactiveModal, setShowInactiveModal] = useState(false);

  // Live Password Requirement Checks
  const passReq = getPasswordRequirements(regPassword);
  const isPasswordValid = passReq.hasMinLength && passReq.hasUppercase && passReq.hasNumber && passReq.hasSpecial;

  // Live Registration Form Validity Check
  const isNombreValid = regNombre.trim().length >= 3;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim());
  const isRucValid = /^\d{10,13}$/.test(regRuc.trim().replace(/\s+/g, ""));
  const isPhoneValid = /^\d{10}$/.test(regTelefono.trim().replace(/\s+/g, ""));
  const isCodeValid = regPartnerCode.trim().length > 0;

  const isRegisterFormValid =
    isNombreValid && isEmailValid && isRucValid && isPhoneValid && isPasswordValid && isCodeValid;

  // Helper to resolve role from partner code
  const resolveRoleFromCode = (code: string): { role: string; label: string } | null => {
    const cleaned = code.trim().toLowerCase();
    if (["admin1", "socio-admin1", "socio1", "1001"].includes(cleaned)) {
      return { role: "admin1", label: "Admin Nivel 1 (Operativo / Asesor)" };
    }
    if (["admin2", "socio-admin2", "socio2", "2002"].includes(cleaned)) {
      return { role: "admin2", label: "Admin Nivel 2 (Supervisor Operativo)" };
    }
    if (["admin3", "admin", "socio-admin3", "socio-admin", "socio3", "3003"].includes(cleaned)) {
      return { role: "admin", label: "Admin Nivel 3 (Administrador General)" };
    }
    if (["gerencia", "socio-gerencia", "gerencia1", "9009"].includes(cleaned)) {
      return { role: "gerencia", label: "Nivel Dirección / Gerencia General" };
    }
    return null;
  };

  // Login Submit Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    const u = username.trim().toLowerCase();
    const p = password.trim();

    // 1. Primary check: Call Central Backend Authentication (/api/auth/login)
    try {
      const resp = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
      });

      const json = await resp.json();

      if (resp.ok && json.success) {
        const user = json.user;
        const roleKey = user.rol || "admin1";

        sessionStorage.setItem("godi_auth", "true");
        sessionStorage.setItem("godi_user", roleKey);
        sessionStorage.setItem("godi_user_pass", p);
        sessionStorage.setItem(
          "godi_user_name",
          `${user.nombre || ""} ${user.apellido || ""}`.trim() || user.usuario
        );
        sessionStorage.setItem("godi_user_email", user.email || "");
        sessionStorage.setItem("godi_user_phone", user.telefono || "");
        sessionStorage.setItem("godi_user_code", user.idSocio || user.usuario || "");
        sessionStorage.setItem("godi_id_usuario", user.idUsuario || "");
        sessionStorage.setItem("godi_user_status", user.estado || "ACTIVO");

        logUserAccess({
          userCode: user.idSocio || user.usuario || "GER-001",
          userName: user.nombre || user.usuario,
          userEmail: user.email || "",
          userRole: roleKey,
          tipoAcceso: "Ingreso Central Exitoso",
        });

        setIsLoading(false);
        onLoginSuccess(roleKey);
        return;
      } else if (resp.status === 403 && json.code === "PENDIENTE_VALIDACION") {
        setIsLoading(false);
        setErrorMsg(
          "⚡ Su usuario se encuentra PENDIENTE DE VALIDACIÓN por Gerencia General. Un administrador debe autorizar su acceso en la pestaña USUARIOS antes de ingresar."
        );
        return;
      } else if (resp.status === 403 && json.code === "INACTIVO") {
        setIsLoading(false);
        setShowInactiveModal(true);
        return;
      } else if (resp.status === 403 && json.code === "BLOQUEADO") {
        setIsLoading(false);
        setErrorMsg("⛔ Su usuario se encuentra BLOQUEADO. Póngase en contacto con Gerencia General.");
        return;
      }
    } catch (err) {
      console.error("Error al conectar con /api/auth/login:", err);
    }

    // 2. Fallback check for built-in master Gerencia account if offline
    if (u === "gerencia" && p === "gerencia") {
      sessionStorage.setItem("godi_auth", "true");
      sessionStorage.setItem("godi_user", "gerencia");
      sessionStorage.setItem("godi_user_pass", p);
      sessionStorage.setItem("godi_user_name", "David Santander");
      sessionStorage.setItem("godi_user_email", "dsantander@upconta.com");
      sessionStorage.setItem("godi_user_ruc", "1722388426");
      sessionStorage.setItem("godi_user_phone", "098 069 0459");
      sessionStorage.setItem("godi_user_code", "GER-001");

      logUserAccess({
        userCode: "GER-001",
        userName: "David Santander",
        userEmail: "dsantander@upconta.com",
        userRole: "gerencia",
        tipoAcceso: "Ingreso Perfil Gerencia (Local)",
      });

      setIsLoading(false);
      onLoginSuccess("gerencia");
      return;
    }

    // 3. Fallback: Local Storage verification
    try {
      const savedUsers = localStorage.getItem("kpier_registered_users");
      if (savedUsers) {
        const usersList: RegisteredUser[] = JSON.parse(savedUsers);
        const matched = usersList.find(
          (user) =>
            (user.email.toLowerCase() === u || user.rucCedula === u || user.nombre.toLowerCase() === u) &&
            user.password === p
        );

        if (matched) {
          if ((matched as any).estado === "Inactivo") {
            setIsLoading(false);
            setShowInactiveModal(true);
            return;
          }
          sessionStorage.setItem("godi_auth", "true");
          sessionStorage.setItem("godi_user", matched.role);
          sessionStorage.setItem("godi_user_pass", p);
          sessionStorage.setItem("godi_user_name", matched.nombre);
          sessionStorage.setItem("godi_user_email", matched.email);
          sessionStorage.setItem("godi_user_ruc", matched.rucCedula || "");
          sessionStorage.setItem("godi_user_phone", matched.telefono || "");
          sessionStorage.setItem("godi_user_code", matched.partnerCode || "");

          setIsLoading(false);
          onLoginSuccess(matched.role);
          return;
        }
      }
    } catch (err) {}

    setErrorMsg("Credenciales no válidas. Verifique usuario/correo/código y contraseña.");
    setIsLoading(false);
  };

  // Register Submit Handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // 1. Synchronous Input Validation
    const validation = validateRegistrationInput({
      nombre: regNombre,
      email: regEmail,
      rucCedula: regRuc,
      telefono: regTelefono,
      password: regPassword,
    });

    if (!validation.valid) {
      setErrorMsg(validation.error || "Los datos ingresados no son válidos.");
      return;
    }

    // 2. Partner Code Validation
    const cleanCode = regPartnerCode.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg("El Código de Socio es obligatorio. Sin este código no se puede crear ningún perfil.");
      return;
    }

    setIsLoading(true);

    try {
      // 3. Call Central Registration Endpoint (/api/auth/register)
      const resp = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: regNombre.trim(),
          email: regEmail.trim(),
          telefono: regTelefono.trim(),
          usuario: regRuc.trim(), // Cédula is the user's username
          cedula: regRuc.trim(),
          password: regPassword.trim(),
          rol: "admin1",
          idSocio: cleanCode,
          createdByRole: "socio",
          createdByName: regNombre.trim(),
        }),
      });

      const json = await resp.json();

      if (resp.ok && json.success) {
        // Claim partner code locally if available
        claimPartnerCode(cleanCode, {
          nombre: regNombre,
          email: regEmail,
          rucCedula: regRuc,
          telefono: regTelefono,
          password: regPassword,
        });

        setIsLoading(false);
        setSuccessMsg(
          "✅ " +
            (json.message ||
              "Usuario registrado exitosamente. Su cuenta se encuentra en estado PENDIENTE DE VALIDACIÓN por Gerencia General.")
        );

        setRegEmail("");
        setRegNombre("");
        setRegRuc("");
        setRegTelefono("");
        setRegPassword("");
        setRegPartnerCode("");

        setTimeout(() => {
          setMode("login");
        }, 3000);
        return;
      } else {
        setErrorMsg(json.message || "Error al registrar el usuario.");
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.error("Error al registrar usuario en el servidor central:", err);
      setErrorMsg("Ocurrió un error al procesar el registro. Intente nuevamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-[#0B2545] via-[#133E72] to-[#0a192f] border border-blue-400/20 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden animate-scale-up flex flex-col my-auto text-white">
        
        {/* TOP FULL-WIDTH BRAND HEADER: Name & Slogan */}
        <div className="w-full px-4 py-4 sm:px-6 sm:py-5 border-b border-white/10 flex flex-col items-center justify-center text-center gap-2 sm:gap-3">
          <div className="w-full flex flex-col justify-center items-center">
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-white select-none leading-none">
              GoDi
            </span>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="h-[1px] w-4 bg-white/60 hidden sm:inline-block"></span>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.18em] text-white/90 select-none">
                TECNOLOGÍA QUE IMPULSA NEGOCIOS
              </span>
              <span className="h-[1px] w-4 bg-white/60 hidden sm:inline-block"></span>
            </div>
          </div>
          <h2 className="text-xs sm:text-sm md:text-base font-black text-amber-400 text-center tracking-wide uppercase whitespace-nowrap">
            Plataforma Exclusiva para Distribuidores y Socios
          </h2>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 w-full flex-1">
          {/* LEFT PANEL: Levels & Brand Info */}
          <div className="md:col-span-5 text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-white/10">
            <div className="absolute -bottom-10 -left-10 opacity-10 pointer-events-none">
              <Lock className="w-56 h-56 text-blue-300" />
            </div>

            <div className="relative z-10 space-y-5">
              <div className="space-y-3 text-center sm:text-left">
                <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed text-justify">
                  Aquí empieza tu camino para crecer comercialmente, multiplicar tus ingresos y formarte como un <strong>Socio de Éxito</strong> en nuestra plataforma.
                </p>
              </div>

              {/* Commercial Highlights */}
              <div className="space-y-2.5 pt-3 border-t border-white/10 text-xs font-bold text-slate-100">
                <div className="flex items-center gap-2.5 p-2.5 bg-white/10 backdrop-blur-xs rounded-xl border border-white/15 shadow-xs">
                  <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Escala tus ventas y comisiones en tiempo real</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 bg-white/10 backdrop-blur-xs rounded-xl border border-white/15 shadow-xs">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Formación continua y aceleración comercial</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 bg-white/10 backdrop-blur-xs rounded-xl border border-white/15 shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Infraestructura integral para tu crecimiento</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4 mt-4 border-t border-white/10">
              <p className="text-[10px] text-slate-400 font-medium">
                GoDi Ecuador & ANF AC © {new Date().getFullYear()}
              </p>
            </div>
          </div>

          {/* RIGHT PANEL: Login Form */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-5">
            
            {/* Alert Messages */}
            {errorMsg && (
              <div className="p-3 bg-rose-950/80 border border-rose-500/60 text-rose-200 rounded-xl text-xs font-bold flex items-start gap-2 animate-shake shadow-md">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in shadow-md">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white tracking-tight">Acceso al Sistema</h3>
                <p className="text-xs text-slate-300 font-medium">Ingrese su número de cédula y contraseña para ingresar</p>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-amber-300 uppercase tracking-wider mb-1.5">
                  Cédula / RUC del Socio (o Usuario)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-amber-400/80 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="ej. 1722388426, gerencia o su correo"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-white/15 rounded-xl text-xs font-bold text-white placeholder-slate-400 focus:bg-slate-900 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 focus:outline-none transition-all shadow-inner font-mono"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-amber-300 uppercase tracking-wider mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-amber-400/80 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-white/15 rounded-xl text-xs font-bold text-white placeholder-slate-400 focus:bg-slate-900 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 focus:outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 active:scale-[0.99] text-slate-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 mt-2"
              >
                <span>{isLoading ? "Verificando acceso..." : "Acceder al Sistema"}</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </form>

            {/* Info notice about registration restriction */}
            <div className="p-3.5 bg-amber-500/10 border border-amber-400/25 rounded-2xl flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-xs font-black text-amber-300 block">¿Necesitas un perfil de socio?</span>
                <p className="text-[11px] text-slate-200 font-medium leading-relaxed">
                  La creación y asignación de cuentas de socio se gestiona únicamente por la <strong className="text-amber-200">Gerencia General</strong>. Solicite su activación a la administración.
                </p>
              </div>
            </div>

            <div className="pt-2 text-center border-t border-white/10">
              <span className="text-[11px] text-slate-400 font-semibold">
                Soporte de credenciales UpConta Ecuador & ANF AC.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* POPUP DE ALERTA CUANDO LA CUENTA ESTÁ INACTIVA */}
      {showInactiveModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0B2545] border border-rose-500/50 rounded-3xl max-w-md w-full p-6 shadow-2xl text-center space-y-5 animate-scale-up text-white relative">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-lg">
              <Lock className="w-8 h-8 text-rose-400" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-rose-400 tracking-tight">Cuenta Inactiva</h3>
              <p className="text-sm font-bold text-slate-100 leading-relaxed">
                Su cuenta se encuentra inactiva, contacte con un asesor de GoDi.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowInactiveModal(false)}
                className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white font-black rounded-xl text-xs transition-all shadow-md cursor-pointer uppercase tracking-wider"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
