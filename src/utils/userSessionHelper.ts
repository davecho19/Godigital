export interface ActivePartnerProfile {
  nombre: string;
  rucCedula: string;
  email: string;
  telefono: string;
  code: string;
  role: string;
  banco: string;
  tipoCuenta: string;
  numeroCuenta: string;
  titularCuenta: string;
  cedulaTitular: string;
}

export function getActivePartnerProfile(): ActivePartnerProfile {
  const profile: ActivePartnerProfile = {
    nombre: "Socio Registrado",
    rucCedula: "",
    email: "",
    telefono: "",
    code: "",
    role: "admin1",
    banco: "",
    tipoCuenta: "Cuenta de Ahorros",
    numeroCuenta: "",
    titularCuenta: "",
    cedulaTitular: "",
  };

  try {
    const sName = sessionStorage.getItem("godi_user_name") || "";
    const sRuc = sessionStorage.getItem("godi_user_ruc") || sessionStorage.getItem("godi_user_cedula") || "";
    const sEmail = sessionStorage.getItem("godi_user_email") || "";
    const sPhone = sessionStorage.getItem("godi_user_phone") || "";
    const sCode = sessionStorage.getItem("godi_user_code") || "";
    const sRole = sessionStorage.getItem("godi_user") || "admin1";

    const sBanco = sessionStorage.getItem("godi_user_banco") || "";
    const sTipoCuenta = sessionStorage.getItem("godi_user_tipo_cuenta") || "Cuenta de Ahorros";
    const sNumCuenta = sessionStorage.getItem("godi_user_numero_cuenta") || "";
    const sTitular = sessionStorage.getItem("godi_user_titular_cuenta") || "";
    const sCedTitular = sessionStorage.getItem("godi_user_cedula_titular") || "";

    const isGerencia = sRole === "gerencia";

    profile.role = sRole;
    profile.code = sCode || (isGerencia ? "GER-001" : "");
    profile.email = isGerencia ? "dsantander@upconta.com" : sEmail;
    profile.telefono = isGerencia ? "098 069 0459" : sPhone;
    profile.nombre = isGerencia ? (sName && sName !== "Diego Santander" ? sName : "David Santander") : (sName || "Socio Registrado");
    profile.rucCedula = isGerencia ? "1722388426" : sRuc;
    profile.banco = sBanco;
    profile.tipoCuenta = sTipoCuenta;
    profile.numeroCuenta = sNumCuenta;
    profile.titularCuenta = sTitular || profile.nombre;
    profile.cedulaTitular = sCedTitular || profile.rucCedula;

    // Search in kpier_partner_codes
    const slotsStr = localStorage.getItem("kpier_partner_codes");
    if (slotsStr) {
      const slots = JSON.parse(slotsStr);
      if (Array.isArray(slots)) {
        const found = slots.find((s: any) =>
          (sCode && s.code?.toUpperCase() === sCode.toUpperCase()) ||
          (sEmail && s.email?.toLowerCase() === sEmail.toLowerCase()) ||
          (sName && (s.nombre?.toLowerCase() === sName.toLowerCase() || s.nombreApellido?.toLowerCase() === sName.toLowerCase())) ||
          (sRuc && s.rucCedula === sRuc)
        );
        if (found) {
          if (found.nombre && (profile.nombre === "Socio Registrado" || !profile.nombre)) profile.nombre = found.nombre;
          if (found.rucCedula && !profile.rucCedula) profile.rucCedula = found.rucCedula;
          if (found.email && !profile.email) profile.email = found.email;
          if (found.telefono && !profile.telefono) profile.telefono = found.telefono;
          if (found.code && !profile.code) profile.code = found.code;
          if (found.banco && !profile.banco) profile.banco = found.banco;
          if (found.tipoCuenta && !profile.tipoCuenta) profile.tipoCuenta = found.tipoCuenta;
          if (found.numeroCuenta && !profile.numeroCuenta) profile.numeroCuenta = found.numeroCuenta;
          if (found.titularCuenta && (!profile.titularCuenta || profile.titularCuenta === "Socio Registrado")) profile.titularCuenta = found.titularCuenta;
          if (found.cedulaTitular && !profile.cedulaTitular) profile.cedulaTitular = found.cedulaTitular;
        }
      }
    }

    // Search in kpier_registered_users
    const regUsersStr = localStorage.getItem("kpier_registered_users");
    if (regUsersStr) {
      const regUsers = JSON.parse(regUsersStr);
      if (Array.isArray(regUsers)) {
        const found = regUsers.find((u: any) =>
          (sEmail && u.email?.toLowerCase() === sEmail.toLowerCase()) ||
          (sName && u.nombre?.toLowerCase() === sName.toLowerCase()) ||
          (sCode && u.partnerCode?.toUpperCase() === sCode.toUpperCase()) ||
          (sRuc && u.rucCedula === sRuc)
        );
        if (found) {
          if (found.nombre && (profile.nombre === "Socio Registrado" || !profile.nombre)) profile.nombre = found.nombre;
          if (found.rucCedula && !profile.rucCedula) profile.rucCedula = found.rucCedula;
          if (found.email && !profile.email) profile.email = found.email;
          if (found.telefono && !profile.telefono) profile.telefono = found.telefono;
          if (found.banco && !profile.banco) profile.banco = found.banco;
          if (found.tipoCuenta && !profile.tipoCuenta) profile.tipoCuenta = found.tipoCuenta;
          if (found.numeroCuenta && !profile.numeroCuenta) profile.numeroCuenta = found.numeroCuenta;
          if (found.titularCuenta && (!profile.titularCuenta || profile.titularCuenta === "Socio Registrado")) profile.titularCuenta = found.titularCuenta;
          if (found.cedulaTitular && !profile.cedulaTitular) profile.cedulaTitular = found.cedulaTitular;
        }
      }
    }

    // Search in kpier_socios_registrados
    const sociosStr = localStorage.getItem("kpier_socios_registrados");
    if (sociosStr) {
      const socios = JSON.parse(sociosStr);
      if (Array.isArray(socios)) {
        const found = socios.find((soc: any) =>
          (sEmail && soc.email?.toLowerCase() === sEmail.toLowerCase()) ||
          (sName && (soc.nombreApellido?.toLowerCase() === sName.toLowerCase() || soc.nombre?.toLowerCase() === sName.toLowerCase())) ||
          (sCode && soc.codigoSocio?.toUpperCase() === sCode.toUpperCase()) ||
          (sRuc && (soc.rucCedula === sRuc || soc.cedulaRuc === sRuc))
        );
        if (found) {
          if ((found.nombreApellido || found.nombre) && (profile.nombre === "Socio Registrado" || !profile.nombre)) {
            profile.nombre = found.nombreApellido || found.nombre;
          }
          if ((found.rucCedula || found.cedulaRuc) && !profile.rucCedula) {
            profile.rucCedula = found.rucCedula || found.cedulaRuc;
          }
          if (found.banco && !profile.banco) profile.banco = found.banco;
          if (found.tipoCuenta && !profile.tipoCuenta) profile.tipoCuenta = found.tipoCuenta;
          if (found.numeroCuenta && !profile.numeroCuenta) profile.numeroCuenta = found.numeroCuenta;
        }
      }
    }
  } catch (e) {
    console.error("Error reading active partner profile:", e);
  }

  if (!profile.titularCuenta) profile.titularCuenta = profile.nombre;
  if (!profile.cedulaTitular) profile.cedulaTitular = profile.rucCedula;

  return profile;
}

export function getActivePartnerName(): string {
  try {
    const sessionName = sessionStorage.getItem("godi_user_name") || "";
    const sessionEmail = sessionStorage.getItem("godi_user_email") || "";
    const sessionCode = sessionStorage.getItem("godi_user_code") || "";

    if (sessionName && sessionName !== "Socio Registrado" && sessionName !== "Gerencia General") {
      return sessionName.trim();
    }

    if (sessionCode || sessionEmail) {
      const slotsStr = localStorage.getItem("kpier_partner_codes");
      if (slotsStr) {
        const slots = JSON.parse(slotsStr);
        if (Array.isArray(slots)) {
          const match = slots.find((s: any) =>
            (sessionCode && s.code?.toUpperCase() === sessionCode.toUpperCase()) ||
            (sessionEmail && s.email?.toLowerCase() === sessionEmail.toLowerCase())
          );
          if (match?.nombre && match.nombre !== "Socio Registrado") {
            return match.nombre.trim();
          }
        }
      }

      const regStr = localStorage.getItem("kpier_registered_users");
      if (regStr) {
        const reg = JSON.parse(regStr);
        if (Array.isArray(reg)) {
          const match = reg.find((u: any) =>
            (sessionCode && u.partnerCode?.toUpperCase() === sessionCode.toUpperCase()) ||
            (sessionEmail && u.email?.toLowerCase() === sessionEmail.toLowerCase())
          );
          if (match?.nombre) return match.nombre.trim();
        }
      }
    }

    if (sessionName) return sessionName.trim();
  } catch (e) {
    console.error("Error resolving active partner name:", e);
  }
  return "Socio Registrado";
}

export function getSocioNameForSale(v: any, sociosList: any[] = []): string {
  if (!v) return "Socio General";

  const directCandidate = v.vendedor || v.socioNombre || v.adminResponsable || "";
  const cleanCandidate = directCandidate.trim();

  if (
    cleanCandidate &&
    cleanCandidate !== "Socio Registrado" &&
    cleanCandidate !== "admin" &&
    cleanCandidate !== "admin1" &&
    cleanCandidate !== "admin2" &&
    cleanCandidate !== "Socio KPIer" &&
    cleanCandidate !== "Asesor General"
  ) {
    return cleanCandidate;
  }

  const code = (v.userCode || "").toLowerCase().trim();
  const email = (v.userEmail || "").toLowerCase().trim();

  if (code || email) {
    const matched = sociosList.find((s) => {
      const sCode = (s.codigoSocio || s.userCode || s.partnerCode || "").toLowerCase().trim();
      const sEmail = (s.email || "").toLowerCase().trim();
      return (code && sCode === code) || (email && sEmail === email);
    });
    if (matched && (matched.nombreApellido || matched.nombre)) {
      return (matched.nombreApellido || matched.nombre).trim();
    }
  }

  if (cleanCandidate && cleanCandidate !== "admin" && cleanCandidate !== "admin1" && cleanCandidate !== "admin2") {
    return cleanCandidate;
  }
  return "Socio General";
}
