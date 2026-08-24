import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  User,
  Mail,
  Phone,
  IdCard,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Lock,
  Trash2,
  RefreshCw,
  Sparkles,
  X,
  Copy,
  Check,
  KeyRound,
  ChevronDown,
  ShieldCheck,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  UserCheck,
  Award,
  UserPlus,
  Plus,
  Clock,
  FileSpreadsheet,
  ExternalLink,
  Landmark,
  Building2,
  CreditCard,
} from "lucide-react";
import {
  PartnerCodeSlot,
  getPartnerCodeSlots,
  savePartnerCodeSlots,
  updateSlotRole,
  generate10CharAlphanumeric,
  clearAllSociosCache,
  checkSocioDuplicate,
} from "../utils/partnerCodes";
import { syncSocioToGoogleSheets, deleteSocioFromGoogleSheets, resetAllSociosAndVentas, checkDuplicateInGoogleSheets, syncUserDirectToSheets } from "../utils/googleSheetsSync";
import { validateRegistrationInput, checkDuplicateUser, getPasswordRequirements } from "../utils/validation";
import { validateGerenciaPassword } from "./DeleteVentaModal";
import { SyncMonitorCard } from "./SyncMonitorCard";

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

export function SociosRegistradosModule() {
  const [slots, setSlots] = useState<PartnerCodeSlot[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("todos");
  const [usageFilter, setUsageFilter] = useState<"todos" | "activos" | "por_activar" | "inactivos" | "disponibles" | "registrados">("activos");
  const [selectedSlot, setSelectedSlot] = useState<PartnerCodeSlot | null>(null);
  const [assignModalSlot, setAssignModalSlot] = useState<PartnerCodeSlot | null>(null);
  const [newNombre, setNewNombre] = useState("");
  const [newUsuario, setNewUsuario] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newTelefono, setNewTelefono] = useState("");
  const [newRuc, setNewRuc] = useState("");
  const [newRole, setNewRole] = useState<"admin1" | "admin2" | "admin" | "gerencia">("admin1");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showSlotPassword, setShowSlotPassword] = useState<boolean>(false);
  const [deleteConfirmSlot, setDeleteConfirmSlot] = useState<PartnerCodeSlot | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [assignModalError, setAssignModalError] = useState<string>("");

  // States for Inactivating Socio Modal
  const [inactivateConfirmSlot, setInactivateConfirmSlot] = useState<PartnerCodeSlot | null>(null);
  const [inactivatePassword, setInactivatePassword] = useState("");
  const [inactivateError, setInactivateError] = useState("");

  // States for editing selected socio in detail modal
  const [editNombre, setEditNombre] = useState("");
  const [editUsuario, setEditUsuario] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRuc, setEditRuc] = useState("");
  const [editTelefono, setEditTelefono] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState<"admin1" | "admin2" | "admin" | "gerencia">("admin1");
  const [editBanco, setEditBanco] = useState("");
  const [editTipoCuenta, setEditTipoCuenta] = useState("Cuenta de Ahorros");
  const [editNumeroCuenta, setEditNumeroCuenta] = useState("");
  const [editTitularCuenta, setEditTitularCuenta] = useState("");
  const [editCedulaTitular, setEditCedulaTitular] = useState("");
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState<string | null>(null);

  // Helper to retrieve password created during registration for a slot
  const getPasswordForSlot = (slot: PartnerCodeSlot): string => {
    if (slot.password) return slot.password;
    try {
      const raw = localStorage.getItem("kpier_registered_users");
      if (raw) {
        const users: any[] = JSON.parse(raw);
        const match = users.find(
          (u) =>
            (slot.code && u.partnerCode === slot.code) ||
            (slot.email && u.email?.toLowerCase() === slot.email.toLowerCase()) ||
            (slot.nombre && u.nombre?.toLowerCase() === slot.nombre.toLowerCase())
        );
        if (match && match.password) return match.password;
      }
    } catch (e) {}
    return "Clave123*";
  };

  useEffect(() => {
    if (selectedSlot) {
      setEditNombre(selectedSlot.nombre || "");
      setEditUsuario(selectedSlot.usuario || selectedSlot.email?.split("@")[0] || selectedSlot.code || "");
      setEditEmail(selectedSlot.email || "");
      setEditRuc(selectedSlot.rucCedula || "");
      setEditTelefono(selectedSlot.telefono || "");
      setEditPassword(getPasswordForSlot(selectedSlot));
      setEditRole(selectedSlot.role || "admin1");
      setEditBanco(selectedSlot.banco || "");
      setEditTipoCuenta(selectedSlot.tipoCuenta || "Cuenta de Ahorros");
      setEditNumeroCuenta(selectedSlot.numeroCuenta || "");
      setEditTitularCuenta(selectedSlot.titularCuenta || selectedSlot.nombre || "");
      setEditCedulaTitular(selectedSlot.cedulaTitular || selectedSlot.rucCedula || "");
      setEditSuccessMsg(null);
    }
  }, [selectedSlot]);

  // 1. UPDATE DATA ONLY (No Google Sheets sync - Updates local data & password)
  const handleUpdateSlotDataOnly = () => {
    if (!selectedSlot) return;

    const cleanNombre = editNombre.trim();
    const cleanUsuario = editUsuario.trim().toLowerCase() || editEmail.trim().toLowerCase().split("@")[0] || selectedSlot.code.toLowerCase();
    const cleanRuc = editRuc.trim();
    const cleanEmail = editEmail.trim();
    const cleanTelefono = editTelefono.trim();
    const cleanPassword = editPassword.trim();
    const cleanBanco = editBanco.trim();
    const cleanTipoCuenta = editTipoCuenta;
    const cleanNumeroCuenta = editNumeroCuenta.trim();
    const cleanTitularCuenta = editTitularCuenta.trim() || cleanNombre;
    const cleanCedulaTitular = editCedulaTitular.trim() || cleanRuc;

    if (!cleanNombre) {
      showNotification("⚠️ El nombre del socio es obligatorio.");
      return;
    }
    if (cleanRuc && (cleanRuc.length < 10 || cleanRuc.length > 13)) {
      showNotification(`⚠️ Cédula / RUC debe tener entre 10 y 13 caracteres (ingresados: ${cleanRuc.length}).`);
      return;
    }

    const currentStatus = selectedSlot.estado || (selectedSlot.used ? "Activo" : "Por Activar");

    const updatedSlot: PartnerCodeSlot = {
      ...selectedSlot,
      nombre: cleanNombre,
      usuario: cleanUsuario,
      rucCedula: cleanRuc,
      email: cleanEmail,
      telefono: cleanTelefono,
      role: editRole,
      password: cleanPassword,
      estado: currentStatus,
      banco: cleanBanco,
      tipoCuenta: cleanTipoCuenta,
      numeroCuenta: cleanNumeroCuenta,
      titularCuenta: cleanTitularCuenta,
      cedulaTitular: cleanCedulaTitular,
    };

    // 1. Update in slots state & localStorage
    setSlots((prev) => {
      const next = prev.map((s) => (s.id === selectedSlot.id ? updatedSlot : s));
      savePartnerCodeSlots(next);
      return next;
    });

    // 2. Cross-sync to kpier_registered_users
    try {
      const raw = localStorage.getItem("kpier_registered_users");
      const users: any[] = raw ? JSON.parse(raw) : [];
      const idx = users.findIndex(
        (u) =>
          (selectedSlot.code && u.partnerCode === selectedSlot.code) ||
          (selectedSlot.email && u.email?.toLowerCase() === selectedSlot.email.toLowerCase())
      );
      if (idx !== -1) {
        users[idx] = {
          ...users[idx],
          nombre: cleanNombre,
          usuario: cleanUsuario,
          rucCedula: cleanRuc,
          email: cleanEmail,
          telefono: cleanTelefono,
          password: cleanPassword,
          role: editRole,
          banco: cleanBanco,
          tipoCuenta: cleanTipoCuenta,
          numeroCuenta: cleanNumeroCuenta,
          titularCuenta: cleanTitularCuenta,
          cedulaTitular: cleanCedulaTitular,
        };
      }
      localStorage.setItem("kpier_registered_users", JSON.stringify(users));
    } catch (e) {
      console.error("Error updating kpier_registered_users:", e);
    }

    // 3. Cross-sync to kpier_socios_registrados
    try {
      const rawSocios = localStorage.getItem("kpier_socios_registrados");
      if (rawSocios) {
        const sociosArr = JSON.parse(rawSocios);
        const idx = sociosArr.findIndex(
          (s: any) =>
            (s.codigoSocio && s.codigoSocio.toUpperCase() === selectedSlot.code.toUpperCase()) ||
            (s.partnerCode && s.partnerCode.toUpperCase() === selectedSlot.code.toUpperCase()) ||
            (s.email && s.email.toLowerCase() === selectedSlot.email?.toLowerCase())
        );
        if (idx !== -1) {
          sociosArr[idx] = {
            ...sociosArr[idx],
            nombreApellido: cleanNombre,
            nombre: cleanNombre,
            cedulaRuc: cleanRuc,
            rucCedula: cleanRuc,
            email: cleanEmail,
            telefono: cleanTelefono,
            password: cleanPassword,
            cedulaTelefono: `${cleanRuc} - ${cleanTelefono}`,
            banco: cleanBanco,
            tipoCuenta: cleanTipoCuenta,
            numeroCuenta: cleanNumeroCuenta,
            titularCuenta: cleanTitularCuenta,
            cedulaTitular: cleanCedulaTitular,
          };
          localStorage.setItem("kpier_socios_registrados", JSON.stringify(sociosArr));
        }
      }
    } catch (e) {
      console.error("Error updating kpier_socios_registrados:", e);
    }

    // 4. Sync updated details & password to Server Store & Google Sheets
    syncSocioToGoogleSheets({
      userCode: selectedSlot.code,
      nombreApellido: cleanNombre,
      rucCedula: cleanRuc,
      email: cleanEmail,
      telefono: cleanTelefono,
      password: cleanPassword,
      role: editRole,
      usuario: cleanUsuario,
      codigoAsignado: selectedSlot.code,
      registradoPor: selectedSlot.registradoPor || "Gerencia",
      referidoPor: selectedSlot.referidoPor || "Gerencia",
      estado: currentStatus,
    });

    setSelectedSlot(updatedSlot);
    window.dispatchEvent(new Event("kpier_socios_updated"));

    setEditSuccessMsg(`¡Datos y cuenta bancaria de "${cleanNombre}" actualizados correctamente!`);
    showNotification(`✅ Datos del socio "${cleanNombre}" actualizados.`);
    setTimeout(() => setEditSuccessMsg(null), 3500);
  };

  // 2. REGISTER SOCIO IN GOOGLE SHEETS & ACTIVATE (Used when in "Por Activar")
  const handleRegisterSocioToSheets = async (targetSlot?: PartnerCodeSlot) => {
    const slotToProcess = targetSlot || selectedSlot;
    if (!slotToProcess) return;

    const isFromModal = !targetSlot && selectedSlot;
    const cleanNombre = (isFromModal ? editNombre.trim() : slotToProcess.nombre?.trim()) || slotToProcess.nombre || "";
    const cleanRuc = (isFromModal ? editRuc.trim() : slotToProcess.rucCedula?.trim()) || slotToProcess.rucCedula || "";
    const cleanEmail = (isFromModal ? editEmail.trim() : slotToProcess.email?.trim()) || slotToProcess.email || "";
    const cleanTelefono = (isFromModal ? editTelefono.trim() : slotToProcess.telefono?.trim()) || slotToProcess.telefono || "";
    const cleanPassword = (isFromModal ? editPassword.trim() : getPasswordForSlot(slotToProcess)) || getPasswordForSlot(slotToProcess);
    const roleToUse = (isFromModal ? editRole : slotToProcess.role) || "admin1";

    if (!cleanNombre) {
      showNotification("⚠️ El nombre del socio es obligatorio.");
      return;
    }

    setIsSyncingSheets(true);

    const updatedSlot: PartnerCodeSlot = {
      ...slotToProcess,
      nombre: cleanNombre,
      rucCedula: cleanRuc,
      email: cleanEmail,
      telefono: cleanTelefono,
      role: roleToUse,
      password: cleanPassword,
      estado: "Activo",
    };

    // Update in state & localStorage
    setSlots((prev) => {
      const next = prev.map((s) => (s.id === slotToProcess.id ? updatedSlot : s));
      savePartnerCodeSlots(next);
      return next;
    });

    try {
      const raw = localStorage.getItem("kpier_registered_users");
      const users: any[] = raw ? JSON.parse(raw) : [];
      const idx = users.findIndex(
        (u) =>
          (slotToProcess.code && u.partnerCode === slotToProcess.code) ||
          (slotToProcess.email && u.email?.toLowerCase() === slotToProcess.email.toLowerCase())
      );
      if (idx !== -1) {
        users[idx] = { ...users[idx], estado: "Activo", password: cleanPassword, nombre: cleanNombre };
      }
      localStorage.setItem("kpier_registered_users", JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }

    try {
      const rawSocios = localStorage.getItem("kpier_socios_registrados");
      if (rawSocios) {
        const sociosArr = JSON.parse(rawSocios);
        const idx = sociosArr.findIndex(
          (s: any) =>
            (s.codigoSocio && s.codigoSocio.toUpperCase() === slotToProcess.code.toUpperCase()) ||
            (s.email && s.email.toLowerCase() === slotToProcess.email?.toLowerCase())
        );
        if (idx !== -1) {
          sociosArr[idx] = { ...sociosArr[idx], estado: "Activo", password: cleanPassword, nombreApellido: cleanNombre };
          localStorage.setItem("kpier_socios_registrados", JSON.stringify(sociosArr));
        }
      }
    } catch (e) {
      console.error(e);
    }

    const existingRegistrador =
      slotToProcess.registradoPor ||
      slotToProcess.referidoPor ||
      slotToProcess.referidoPorAdmin;

    const regBy = existingRegistrador && existingRegistrador !== "Gerencia"
      ? existingRegistrador
      : "Gerencia";

    await syncSocioToGoogleSheets({
      fechaRegistro: slotToProcess.fechaRegistro || new Date().toISOString().split("T")[0],
      userCode: slotToProcess.code,
      nombreApellido: cleanNombre,
      rucCedula: cleanRuc,
      email: cleanEmail,
      telefono: cleanTelefono,
      password: cleanPassword,
      role: roleToUse,
      codigoAsignado: slotToProcess.code,
      registradoPor: regBy,
      referidoPor: regBy,
      estado: "Activo",
    });

    setIsSyncingSheets(false);
    window.dispatchEvent(new Event("kpier_socios_updated"));

    showNotification(`✨ Socio "${cleanNombre}" activado y registrado exitosamente en Google Sheets.`);
    setUsageFilter("activos");
    setSelectedSlot(null);
  };

  // 3. CREATE USER IN USUARIOS TAB (Central credentials and full user profile in Google Sheets)
  const handleCreateUserInSheets = async () => {
    if (!selectedSlot) return;

    const cleanNombre = editNombre.trim();
    const cleanUsuario = editUsuario.trim().toLowerCase() || editEmail.trim().toLowerCase().split("@")[0] || selectedSlot.code.toLowerCase();
    const cleanEmail = editEmail.trim().toLowerCase();
    const cleanRuc = editRuc.trim();
    const cleanTelefono = editTelefono.trim();
    const cleanPassword = editPassword.trim();
    const cleanBanco = (editBanco || selectedSlot.banco || "").trim();
    const cleanTipoCuenta = (editTipoCuenta || selectedSlot.tipoCuenta || "Ahorros").trim();
    const cleanNumeroCuenta = (editNumeroCuenta || selectedSlot.numeroCuenta || "").trim();
    const cleanTitularCuenta = (editTitularCuenta || selectedSlot.titularCuenta || cleanNombre).trim();
    const cleanCedulaTitular = (editCedulaTitular || selectedSlot.cedulaTitular || cleanRuc).trim();

    if (!cleanNombre || !cleanEmail || !cleanUsuario) {
      showNotification("⚠️ Nombre, correo y nombre de usuario son obligatorios para crear el usuario.");
      return;
    }

    setIsSyncingSheets(true);
    setEditSuccessMsg(null);

    // PRE-VALIDATION LOOKUP IN USUARIOS SHEET
    const dupCheck = await checkDuplicateInGoogleSheets({
      target: "USUARIOS",
      cedula: cleanRuc,
      telefono: cleanTelefono,
      email: cleanEmail,
      usuario: cleanUsuario,
      excludeCode: selectedSlot.code,
      excludeEmail: selectedSlot.email,
    });

    if (dupCheck.isDuplicate) {
      setIsSyncingSheets(false);
      const msg = dupCheck.message || `Ya existe un registro en la pestaña USUARIOS con los mismos datos (${dupCheck.field}: ${dupCheck.value}).`;
      alert(`⚠️ ALERTA: REGISTRO DUPLICADO EN PESTAÑA USUARIOS\n\n${msg}\n\nNo se guardó la información.`);
      showNotification(`⚠️ Duplicado en USUARIOS: ${dupCheck.field}`);
      return;
    }

    // Complete User Profile Payload for Google Sheets
    const userPayload = {
      idUsuario: `USR-${selectedSlot.code || Date.now()}`,
      nombre: cleanNombre,
      apellido: "",
      email: cleanEmail,
      telefono: cleanTelefono,
      usuario: cleanUsuario,
      password: cleanPassword,
      passwordHash: cleanPassword,
      rol: editRole === "gerencia" ? "gerencia" : "administrador",
      idSocio: selectedSlot.code,
      estado: "ACTIVO",
      creadoPor: "Gerencia General",
      rucCedula: cleanRuc,
      cedula: cleanRuc,
      banco: cleanBanco,
      tipoCuenta: cleanTipoCuenta,
      numeroCuenta: cleanNumeroCuenta,
      titularCuenta: cleanTitularCuenta,
      cedulaTitular: cleanCedulaTitular,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
    };

    // 1. Sync to USUARIOS tab
    await syncUserDirectToSheets(userPayload);

    // 2. Also ensure SOCIOS tab has the full updated record with bank details
    const regBy = selectedSlot.registradoPor || selectedSlot.referidoPor || "Gerencia";
    await syncSocioToGoogleSheets({
      fechaRegistro: selectedSlot.fechaRegistro || new Date().toISOString().split("T")[0],
      userCode: selectedSlot.code,
      nombreApellido: cleanNombre,
      rucCedula: cleanRuc,
      email: cleanEmail,
      telefono: cleanTelefono,
      password: cleanPassword,
      role: editRole,
      usuario: cleanUsuario,
      codigoAsignado: selectedSlot.code,
      registradoPor: regBy,
      referidoPor: regBy,
      estado: "Activo",
      banco: cleanBanco,
      tipoCuenta: cleanTipoCuenta,
      numeroCuenta: cleanNumeroCuenta,
      titularCuenta: cleanTitularCuenta,
      cedulaTitular: cleanCedulaTitular,
    });

    const updatedSlot: PartnerCodeSlot = {
      ...selectedSlot,
      nombre: cleanNombre,
      usuario: cleanUsuario,
      rucCedula: cleanRuc,
      email: cleanEmail,
      telefono: cleanTelefono,
      role: editRole,
      password: cleanPassword,
      banco: cleanBanco,
      tipoCuenta: cleanTipoCuenta,
      numeroCuenta: cleanNumeroCuenta,
      titularCuenta: cleanTitularCuenta,
      cedulaTitular: cleanCedulaTitular,
      estado: "Activo",
      used: true,
    };

    // Update in memory & storage
    setSlots((prev) => {
      const next = prev.map((s) => (s.id === selectedSlot.id ? updatedSlot : s));
      savePartnerCodeSlots(next);
      return next;
    });

    // Update local cache
    try {
      const raw = localStorage.getItem("kpier_registered_users");
      const users: any[] = raw ? JSON.parse(raw) : [];
      const idx = users.findIndex(
        (u) =>
          (u.usuario && u.usuario.toLowerCase() === cleanUsuario) ||
          (u.email && u.email.toLowerCase() === cleanEmail) ||
          (selectedSlot.code && u.partnerCode === selectedSlot.code)
      );
      if (idx !== -1) {
        users[idx] = {
          ...users[idx],
          nombre: cleanNombre,
          usuario: cleanUsuario,
          email: cleanEmail,
          telefono: cleanTelefono,
          rucCedula: cleanRuc,
          password: cleanPassword,
          role: editRole,
          banco: cleanBanco,
          tipoCuenta: cleanTipoCuenta,
          numeroCuenta: cleanNumeroCuenta,
          titularCuenta: cleanTitularCuenta,
          cedulaTitular: cleanCedulaTitular,
          estado: "ACTIVO",
        };
      } else {
        users.unshift({
          id: userPayload.idUsuario,
          email: cleanEmail,
          nombre: cleanNombre,
          usuario: cleanUsuario,
          rucCedula: cleanRuc,
          telefono: cleanTelefono,
          password: cleanPassword,
          partnerCode: selectedSlot.code,
          role: editRole === "gerencia" ? "gerencia" : "admin1",
          banco: cleanBanco,
          tipoCuenta: cleanTipoCuenta,
          numeroCuenta: cleanNumeroCuenta,
          titularCuenta: cleanTitularCuenta,
          cedulaTitular: cleanCedulaTitular,
          fechaRegistro: new Date().toISOString().split("T")[0],
          estado: "ACTIVO",
        });
      }
      localStorage.setItem("kpier_registered_users", JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }

    try {
      const rawSocios = localStorage.getItem("kpier_socios_registrados");
      const sociosArr: any[] = rawSocios ? JSON.parse(rawSocios) : [];
      const idx = sociosArr.findIndex(
        (s) =>
          (s.codigoSocio && s.codigoSocio.toUpperCase() === selectedSlot.code.toUpperCase()) ||
          (s.email && s.email.toLowerCase() === cleanEmail)
      );
      const socioObj = {
        fechaRegistro: selectedSlot.fechaRegistro || new Date().toISOString().split("T")[0],
        codigoSocio: selectedSlot.code,
        userCode: selectedSlot.code,
        nombreApellido: cleanNombre,
        nombre: cleanNombre,
        cedulaRuc: cleanRuc,
        rucCedula: cleanRuc,
        email: cleanEmail,
        telefono: cleanTelefono,
        password: cleanPassword,
        role: editRole === "gerencia" ? "Gerencia" : "Administrativo",
        registradoPor: regBy,
        referidoPor: regBy,
        estado: "Activo",
        banco: cleanBanco,
        tipoCuenta: cleanTipoCuenta,
        numeroCuenta: cleanNumeroCuenta,
        titularCuenta: cleanTitularCuenta,
        cedulaTitular: cleanCedulaTitular,
      };
      if (idx !== -1) {
        sociosArr[idx] = { ...sociosArr[idx], ...socioObj };
      } else {
        sociosArr.unshift(socioObj);
      }
      localStorage.setItem("kpier_socios_registrados", JSON.stringify(sociosArr));
    } catch (e) {
      console.error(e);
    }

    setSelectedSlot(updatedSlot);
    setIsSyncingSheets(false);
    window.dispatchEvent(new Event("kpier_socios_updated"));

    setEditSuccessMsg(`¡Usuario "${cleanUsuario}" registrado exitosamente en Google Sheets! Cédula, datos bancarios, correo y credenciales sincronizados.`);
    showNotification(`✅ Usuario "${cleanUsuario}" creado y sincronizado a Google Sheets.`);
  };

  // 4. CREATE SOCIO IN SOCIOS TAB (Registers socio and activates profile)
  const handleCreateSocioInSheets = async () => {
    if (!selectedSlot) return;

    const cleanNombre = editNombre.trim();
    const cleanUsuario = editUsuario.trim().toLowerCase() || selectedSlot.code.toLowerCase();
    const cleanEmail = editEmail.trim().toLowerCase();
    const cleanRuc = editRuc.trim();
    const cleanTelefono = editTelefono.trim();
    const cleanPassword = editPassword.trim();
    const cleanBanco = (editBanco || selectedSlot.banco || "").trim();
    const cleanTipoCuenta = (editTipoCuenta || selectedSlot.tipoCuenta || "Ahorros").trim();
    const cleanNumeroCuenta = (editNumeroCuenta || selectedSlot.numeroCuenta || "").trim();
    const cleanTitularCuenta = (editTitularCuenta || selectedSlot.titularCuenta || cleanNombre).trim();
    const cleanCedulaTitular = (editCedulaTitular || selectedSlot.cedulaTitular || cleanRuc).trim();

    if (!cleanNombre || !cleanEmail) {
      showNotification("⚠️ Nombre y correo electrónico son obligatorios para crear el socio.");
      return;
    }

    setIsSyncingSheets(true);
    setEditSuccessMsg(null);

    // PRE-VALIDATION LOOKUP IN SOCIOS SHEET
    const dupCheck = await checkDuplicateInGoogleSheets({
      target: "SOCIOS",
      cedula: cleanRuc,
      telefono: cleanTelefono,
      email: cleanEmail,
      usuario: cleanUsuario,
      excludeCode: selectedSlot.code,
      excludeEmail: selectedSlot.email,
    });

    if (dupCheck.isDuplicate) {
      setIsSyncingSheets(false);
      const msg = dupCheck.message || `Ya existe un socio registrado en la pestaña SOCIOS con los mismos datos (${dupCheck.field}: ${dupCheck.value}).`;
      alert(`⚠️ ALERTA: SOCIO DUPLICADO EN PESTAÑA SOCIOS\n\n${msg}\n\nNo se guardó la información.`);
      showNotification(`⚠️ Duplicado en SOCIOS: ${dupCheck.field}`);
      return;
    }

    const updatedSlot: PartnerCodeSlot = {
      ...selectedSlot,
      nombre: cleanNombre,
      usuario: cleanUsuario,
      rucCedula: cleanRuc,
      email: cleanEmail,
      telefono: cleanTelefono,
      role: editRole,
      password: cleanPassword,
      banco: cleanBanco,
      tipoCuenta: cleanTipoCuenta,
      numeroCuenta: cleanNumeroCuenta,
      titularCuenta: cleanTitularCuenta,
      cedulaTitular: cleanCedulaTitular,
      estado: "Activo",
    };

    setSlots((prev) => {
      const next = prev.map((s) => (s.id === selectedSlot.id ? updatedSlot : s));
      savePartnerCodeSlots(next);
      return next;
    });

    const regBy =
      selectedSlot.registradoPor ||
      selectedSlot.referidoPor ||
      "Gerencia";

    await syncSocioToGoogleSheets({
      fechaRegistro: selectedSlot.fechaRegistro || new Date().toISOString().split("T")[0],
      userCode: selectedSlot.code,
      nombreApellido: cleanNombre,
      rucCedula: cleanRuc,
      email: cleanEmail,
      telefono: cleanTelefono,
      password: cleanPassword,
      role: editRole,
      usuario: cleanUsuario,
      codigoAsignado: selectedSlot.code,
      registradoPor: regBy,
      referidoPor: regBy,
      estado: "Activo",
      banco: cleanBanco,
      tipoCuenta: cleanTipoCuenta,
      numeroCuenta: cleanNumeroCuenta,
      titularCuenta: cleanTitularCuenta,
      cedulaTitular: cleanCedulaTitular,
    });

    setIsSyncingSheets(false);
    setSelectedSlot(updatedSlot);
    window.dispatchEvent(new Event("kpier_socios_updated"));

    setEditSuccessMsg(`¡Socio "${cleanNombre}" registrado y activado exitosamente en la pestaña SOCIOS de Google Sheets!`);
    showNotification(`✅ Socio "${cleanNombre}" registrado en la pestaña SOCIOS.`);
  };

  // Open modal to assign/create a new socio with an automatically generated random 10-char code
  const handleOpenNewSocioModal = () => {
    const newCode = generate10CharAlphanumeric();
    const newSlot: PartnerCodeSlot = {
      id: `slot-${Date.now()}`,
      code: newCode,
      used: false,
      role: "admin1",
    };
    setAssignModalError("");
    setAssignModalSlot(newSlot);
    setNewNombre("");
    setNewUsuario("");
    setNewEmail("");
    setNewRuc("");
    setNewTelefono("");
    setNewPassword("MiClave2026.");
    setNewRole("admin1");
  };

  const handleRegenerateModalCode = () => {
    if (assignModalSlot) {
      const freshCode = generate10CharAlphanumeric();
      setAssignModalSlot({ ...assignModalSlot, code: freshCode });
    }
  };

  // Manual socio assignment handler
  const handleSaveManualSocio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalSlot) return;

    setAssignModalError("");

    // 1. Check password security rules specifically
    const passReq = getPasswordRequirements(newPassword);
    if (!passReq.hasMinLength || !passReq.hasUppercase || !passReq.hasNumber || !passReq.hasSpecial) {
      const err = "La contraseña no es válida. Debe tener mínimo 6 caracteres, 1 letra mayúscula (A-Z), 1 número (0-9) y 1 símbolo especial (. - _ # $). No se ha guardado nada.";
      setAssignModalError(err);
      showNotification(`⚠️ ${err}`);
      return;
    }

    // 2. Strict input validation
    const validation = validateRegistrationInput({
      nombre: newNombre,
      email: newEmail,
      rucCedula: newRuc,
      telefono: newTelefono,
      password: newPassword,
    });

    if (!validation.valid) {
      const err = validation.error || "Los datos ingresados no son válidos. Verifique la información.";
      setAssignModalError(err);
      showNotification(`⚠️ ${err}`);
      return;
    }

    const cleanUserVal = (newRuc.trim() || newUsuario.trim()).toLowerCase();
    if (!cleanUserVal) {
      const err = "El número de Cédula / RUC es obligatorio para el usuario.";
      setAssignModalError(err);
      showNotification(`⚠️ ${err}`);
      return;
    }

    // 3. Pre-check duplicate in SOCIOS tab before assigning
    const dupCheck = await checkDuplicateInGoogleSheets({
      target: "SOCIOS",
      cedula: newRuc,
      telefono: newTelefono,
      email: newEmail,
      usuario: cleanUserVal,
    });

    if (dupCheck.isDuplicate) {
      const err = dupCheck.message || "El correo electrónico, Cédula, Teléfono o Usuario ya existe en la pestaña SOCIOS.";
      setAssignModalError(err);
      showNotification(`⚠️ ${err}`);
      return;
    }

    const assignedPass = newPassword.trim();
    const cleanCode = assignModalSlot.code.trim().toUpperCase();
    const fecha = new Date().toISOString().split("T")[0];

    // 4. Update slots in memory & set estado: "Por Activar"
    let slotFound = false;
    let updated = slots.map((s) => {
      if (s.id === assignModalSlot.id || (s.code && s.code.toUpperCase() === cleanCode)) {
        slotFound = true;
        return {
          ...s,
          used: true,
          userId: s.userId || `usr-${Date.now()}`,
          code: cleanCode,
          nombre: newNombre.trim(),
          usuario: cleanUserVal,
          email: newEmail.trim(),
          password: assignedPass,
          telefono: newTelefono.trim(),
          rucCedula: newRuc.trim(),
          role: newRole,
          fechaRegistro: fecha,
          estado: "Por Activar" as const, // MOVED TO POR ACTIVAR
        };
      }
      return s;
    });

    if (!slotFound) {
      const newSlotEntry: PartnerCodeSlot = {
        id: assignModalSlot.id || `slot-${Date.now()}`,
        code: cleanCode,
        used: true,
        userId: `usr-${Date.now()}`,
        nombre: newNombre.trim(),
        usuario: cleanUserVal,
        email: newEmail.trim(),
        password: assignedPass,
        telefono: newTelefono.trim(),
        rucCedula: newRuc.trim(),
        role: newRole,
        fechaRegistro: fecha,
        estado: "Por Activar" as const,
        registradoPor: "Gerencia",
      };
      updated = [newSlotEntry, ...updated];
    }

    setSlots(updated);
    savePartnerCodeSlots(updated);

    showNotification(`✨ Socio "${newNombre}" asignado exitosamente con código "${cleanCode}". Pasó al grupo 'Socio por Activar' con estado POR ACTIVAR.`);

    // Reset form & state
    setAssignModalError("");
    setAssignModalSlot(null);
    setNewNombre("");
    setNewUsuario("");
    setNewEmail("");
    setNewRuc("");
    setNewTelefono("");
    setNewPassword("MiClave2026.");
    setNewRole("admin1");

    // Automatically switch view filter to "Socio por Activar"
    setUsageFilter("por_activar");
  };

  const handleResetAll = async () => {
    if (window.confirm("¿Está seguro de eliminar TODAS las ventas y socios registrados? Esta acción dejará la base de datos vacía y lista para nuevos registros.")) {
      await resetAllSociosAndVentas();
      clearAllSociosCache();
      loadData();
      showNotification("Se han eliminado todas las ventas y socios registrados correctamente.");
    }
  };

  const handleClearCache = () => {
    const updatedSlots = clearAllSociosCache();
    setSlots(updatedSlots);
    showNotification("Caché de socios eliminado. Se restauraron los 50 códigos de socio a estado disponible.");
  };

  // Load 50 codes on mount and merge any newly registered users
  const loadData = (showToast: boolean = false) => {
    const data = getPartnerCodeSlots();
    setSlots(data);

    const hasPorActivar = data.some(
      (s) => s.used && (s.estado === "Por Activar" || (s.estado as string) === "por_activar")
    );
    if (hasPorActivar) {
      setUsageFilter("por_activar");
    }

    if (showToast) {
      showNotification("¡Directorio y lista de códigos de socios actualizados con éxito!");
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("kpier_socios_updated", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("kpier_socios_updated", handleUpdate);
    };
  }, []);

  // Keep selectedSlot in sync with latest slot updates (e.g., when partner updates profile)
  useEffect(() => {
    if (selectedSlot && slots.length > 0) {
      const match = slots.find(
        (s) =>
          s.id === selectedSlot.id ||
          (s.code && selectedSlot.code && s.code.toUpperCase() === selectedSlot.code.toUpperCase()) ||
          (s.email && selectedSlot.email && s.email.toLowerCase() === selectedSlot.email.toLowerCase())
      );
      if (match) {
        setSelectedSlot(match);
      }
    }
  }, [slots]);

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3500);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showNotification(`¡Código ${code} copiado al portapapeles!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filter slots
  const filteredSlots = useMemo(() => {
    return slots.filter((s) => {
      // Only show registered / assigned socios in the system
      if (!s.used) return false;

      // Usage / status filter
      if (usageFilter === "activos") {
        if (s.estado === "Inactivo" || s.estado === "Por Activar" || s.estado === "por_activar") return false;
      } else if (usageFilter === "por_activar") {
        if (s.estado !== "Por Activar" && s.estado !== "por_activar") return false;
      } else if (usageFilter === "inactivos") {
        if (s.estado !== "Inactivo") return false;
      }

      // Role filter
      if (roleFilter !== "todos" && s.role !== roleFilter) return false;

      // Search term
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const codeMatch = s.code ? s.code.toLowerCase().includes(term) : false;
      const nameMatch = s.nombre ? s.nombre.toLowerCase().includes(term) : false;
      const emailMatch = s.email ? s.email.toLowerCase().includes(term) : false;
      const rucMatch = s.rucCedula ? s.rucCedula.includes(term) : false;
      const phoneMatch = s.telefono ? s.telefono.includes(term) : false;

      return codeMatch || nameMatch || emailMatch || rucMatch || phoneMatch;
    });
  }, [slots, searchTerm, roleFilter, usageFilter]);

  // Stats
  const stats = useMemo(() => {
    const usados = slots.filter((s) => s.used).length;
    const porActivar = slots.filter((s) => s.used && (s.estado === "Por Activar" || s.estado === "por_activar")).length;
    const activos = slots.filter((s) => s.used && (s.estado === "Activo" || (!s.estado && s.used))).length;
    const inactivos = slots.filter((s) => s.used && s.estado === "Inactivo").length;
    const admin1 = slots.filter((s) => s.used && s.role === "admin1").length;
    const admin2 = slots.filter((s) => s.used && s.role === "admin2").length;
    const admin3 = slots.filter((s) => s.used && (s.role === "admin" || s.role === "admin3")).length;
    const gerencia = slots.filter((s) => s.used && s.role === "gerencia").length;

    return { total: usados, usados, porActivar, activos, inactivos, admin1, admin2, admin3, gerencia };
  }, [slots]);

  // Handle role change directly by Gerencia
  const handleRoleChange = (slotId: string, newRole: "admin1" | "admin2" | "admin" | "gerencia") => {
    const updated = updateSlotRole(slotId, newRole);
    setSlots(updated);
    const updatedSlot = updated.find((s) => s.id === slotId);
    
    if (selectedSlot?.id === slotId && updatedSlot) {
      setSelectedSlot(updatedSlot);
    }

    const roleNames: Record<string, string> = {
      admin1: "Socio Administrativo",
      admin2: "Socio Administrativo",
      admin: "Socio Administrativo",
      gerencia: "Gerencia General",
    };

    if (updatedSlot?.nombre) {
      showNotification(`Nivel de acceso de "${updatedSlot.nombre}" actualizado a ${roleNames[newRole]}.`);
    } else {
      showNotification(`Nivel predeterminado para el código ${updatedSlot?.code} actualizado a ${roleNames[newRole]}.`);
    }
  };

  // Helper to compute activity metrics (registered partners & total sales)
  const getSocioActivityStats = (slot: PartnerCodeSlot | null) => {
    if (!slot || !slot.used || !slot.nombre) {
      return { sociosCount: 0, salesCount: 0, salesTotal: 0 };
    }

    const sName = (slot.nombre || "").toLowerCase().trim();
    const sEmail = (slot.email || "").toLowerCase().trim();
    const sCode = (slot.code || "").toLowerCase().trim();
    const sRuc = (slot.rucCedula || "").toLowerCase().trim();

    let sociosCount = 0;

    // 1. Calculate registered partners from "kpier_socios_registrados"
    try {
      const rawSocios = localStorage.getItem("kpier_socios_registrados");
      if (rawSocios) {
        const parsedSocios = JSON.parse(rawSocios);
        if (Array.isArray(parsedSocios)) {
          sociosCount += parsedSocios.filter((soc: any) => {
            const ref = (soc.referidoPorAdmin || soc.vendedor || soc.socioPadre || soc.referidoPor || soc.creadoPor || soc.adminResponsable || "").toLowerCase().trim();
            const codeRef = (soc.codigoSocio || soc.partnerCode || soc.codigoReferido || "").toLowerCase().trim();
            const nameRef = (soc.nombreApellido || soc.nombre || "").toLowerCase().trim();

            const isMatch =
              (ref && (ref.includes(sName) || sName.includes(ref) || (sEmail && ref.includes(sEmail)))) ||
              (codeRef && codeRef === sCode) ||
              (nameRef && nameRef === sName && soc.id !== slot.id);

            return isMatch;
          }).length;
        }
      }
    } catch (e) {
      console.error("Error leyendo socios registrados:", e);
    }

    // 2. Calculate registered users from "kpier_registered_users"
    try {
      const rawUsers = localStorage.getItem("kpier_registered_users");
      if (rawUsers) {
        const parsedUsers = JSON.parse(rawUsers);
        if (Array.isArray(parsedUsers)) {
          parsedUsers.forEach((usr: any) => {
            if (usr.email && usr.email.toLowerCase().trim() === sEmail) return; // skip self
            const usrCode = (usr.partnerCode || "").toLowerCase().trim();
            const usrRef = (usr.referidoPor || usr.vendedor || "").toLowerCase().trim();
            if ((usrCode && usrCode === sCode) || (usrRef && (usrRef.includes(sName) || (sEmail && usrRef.includes(sEmail))))) {
              sociosCount++;
            }
          });
        }
      }
    } catch (e) {
      console.error("Error leyendo usuarios registrados:", e);
    }

    // 3. Calculate from other partner code slots in "kpier_partner_codes"
    try {
      const rawSlots = localStorage.getItem("kpier_partner_codes");
      if (rawSlots) {
        const parsedSlots = JSON.parse(rawSlots);
        if (Array.isArray(parsedSlots)) {
          parsedSlots.forEach((otherSlot: any) => {
            if (otherSlot.id !== slot.id && otherSlot.used) {
              const otherRef = (otherSlot.referidoPor || otherSlot.vendedor || "").toLowerCase().trim();
              if (otherRef && (otherRef.includes(sName) || (sEmail && otherRef.includes(sEmail)))) {
                sociosCount++;
              }
            }
          });
        }
      }
    } catch (e) {
      console.error("Error leyendo partner code slots:", e);
    }

    // 4. Calculate sales from "kpier_ventas_registradas"
    let salesCount = 0;
    let salesTotal = 0;
    try {
      const rawVentas = localStorage.getItem("kpier_ventas_registradas");
      if (rawVentas) {
        const parsedVentas = JSON.parse(rawVentas);
        if (Array.isArray(parsedVentas)) {
          parsedVentas.forEach((v: any) => {
            const vend = (v.vendedor || v.adminResponsable || v.socioNombre || v.asesor || "").toLowerCase().trim();
            const emailVend = (v.socioEmail || v.email || "").toLowerCase().trim();
            const codeVend = (v.codigoSocio || v.partnerCode || "").toLowerCase().trim();

            const isMatch =
              (sCode && codeVend === sCode) ||
              (sEmail && emailVend && emailVend === sEmail) ||
              (sName && sName.length >= 3 && vend && (vend === sName || (vend.includes(sName) && sName.length > 5)));

            if (isMatch) {
              salesCount++;
              const amount = Number(v.totalVenta || v.total || v.precioUnitario || 0);
              salesTotal += isNaN(amount) ? 0 : amount;
            }
          });
        }
      }
    } catch (e) {
      console.error("Error leyendo ventas registradas:", e);
    }

    // Baseline demo data for default seed users so they show realistic statistics
    if (sName.includes("carlos andrade")) {
      sociosCount = Math.max(sociosCount, 12);
      salesCount = Math.max(salesCount, 18);
      salesTotal = Math.max(salesTotal, 4850.00);
    } else if (sName.includes("sofía mendoza") || sName.includes("sofia mendoza")) {
      sociosCount = Math.max(sociosCount, 8);
      salesCount = Math.max(salesCount, 14);
      salesTotal = Math.max(salesTotal, 3200.00);
    } else if (sName.includes("roberto gómez") || sName.includes("roberto gomez")) {
      sociosCount = Math.max(sociosCount, 15);
      salesCount = Math.max(salesCount, 22);
      salesTotal = Math.max(salesTotal, 7450.00);
    }

    return { sociosCount, salesCount, salesTotal };
  };

  // Request delete (opens custom confirm modal without browser popup block)
  const handleClearSlot = (slotId: string) => {
    const slot = slots.find((s) => s.id === slotId);
    if (!slot) return;

    // Restriction: If socio has registered sales, deletion is NOT allowed - must inactivate instead
    const metrics = getSocioActivityStats(slot);
    if (metrics.salesCount > 0) {
      showNotification(`⛔ No se puede eliminar a "${slot.nombre || "este socio"}" porque registra ${metrics.salesCount} venta(s). Solo se permite INACTIVARLO.`);
      setInactivateConfirmSlot(slot);
      setInactivatePassword("");
      setInactivateError("");
      return;
    }

    setDeleteConfirmSlot(slot);
    setDeletePassword("");
    setDeleteError("");
  };

  // Perform actual deletion of partner profile with Gerencia password verification
  const executeDeleteSlot = (slotId: string) => {
    const slot = slots.find((s) => s.id === slotId);
    if (!slot) {
      setDeleteConfirmSlot(null);
      return;
    }

    const cleanPass = deletePassword.trim();
    if (!cleanPass) {
      setDeleteError("Por favor ingrese la clave del perfil de Gerencia.");
      return;
    }

    if (!validateGerenciaPassword(cleanPass)) {
      setDeleteError("Clave de Gerencia incorrecta. Verifique sus credenciales.");
      return;
    }

    const updated = slots.map((s) => {
      if (s.id === slotId) {
        return {
          id: s.id,
          code: s.code,
          used: false,
          role: "admin1" as const,
        };
      }
      return s;
    });
    setSlots(updated);
    savePartnerCodeSlots(updated);

    // 1. Remove from kpier_registered_users
    try {
      const rawUsers = localStorage.getItem("kpier_registered_users");
      if (rawUsers) {
        const users: any[] = JSON.parse(rawUsers);
        const filtered = users.filter((u) => {
          const uCode = (u.partnerCode || "").toLowerCase().trim();
          const uEmail = (u.email || "").toLowerCase().trim();
          const slotCode = (slot.code || "").toLowerCase().trim();
          const slotEmail = (slot.email || "").toLowerCase().trim();
          if (slotCode && uCode === slotCode) return false;
          if (slotEmail && uEmail === slotEmail) return false;
          return true;
        });
        localStorage.setItem("kpier_registered_users", JSON.stringify(filtered));
      }
    } catch (e) {}

    // 2. Remove from kpier_socios_registrados
    try {
      const rawSocios = localStorage.getItem("kpier_socios_registrados");
      if (rawSocios) {
        const socios: any[] = JSON.parse(rawSocios);
        const filtered = socios.filter((soc) => {
          const sCode = (soc.codigoSocio || "").toLowerCase().trim();
          const sEmail = (soc.email || "").toLowerCase().trim();
          const slotCode = (slot.code || "").toLowerCase().trim();
          const slotEmail = (slot.email || "").toLowerCase().trim();
          if (slotCode && sCode === slotCode) return false;
          if (slotEmail && sEmail === slotEmail) return false;
          return true;
        });
        localStorage.setItem("kpier_socios_registrados", JSON.stringify(filtered));
        window.dispatchEvent(new Event("kpier_socios_updated"));
      }
    } catch (e) {}

    // 3. Sync delete to Google Sheets and Server Store
    deleteSocioFromGoogleSheets({
      userCode: slot.code,
      email: slot.email,
      rucCedula: slot.rucCedula,
    });

    showNotification(`Perfil de "${slot.nombre || "Socio"}" eliminado correctamente. El código [${slot.code}] ha quedado LIBRE.`);
    if (selectedSlot?.id === slotId) setSelectedSlot(null);
    setDeleteConfirmSlot(null);
    setDeletePassword("");
    setDeleteError("");
  };

  // Handle status selection from select dropdown
  const handleStatusSelectChange = (slotId: string, targetStatus: "Activo" | "Inactivo" | "Por Activar") => {
    const slot = slots.find((s) => s.id === slotId);
    if (!slot) return;

    if (targetStatus === "Inactivo") {
      if (slot.estado === "Inactivo") return;
      setInactivateConfirmSlot(slot);
      setInactivatePassword("");
      setInactivateError("");
    } else if (targetStatus === "Activo") {
      if (slot.estado === "Activo") return;
      toggleStatus(slotId, "Activo");
    } else {
      if (slot.estado === "Por Activar" || slot.estado === "por_activar") return;
      toggleStatus(slotId, "Por Activar");
    }
  };

  const executeInactivateSlot = () => {
    if (!inactivateConfirmSlot) return;
    const cleanPass = inactivatePassword.trim();
    if (!cleanPass) {
      setInactivateError("Por favor ingrese la clave del perfil de Gerencia.");
      return;
    }

    if (!validateGerenciaPassword(cleanPass)) {
      setInactivateError("Clave de perfil incorrecta. Verifique sus credenciales de Gerencia.");
      return;
    }

    toggleStatus(inactivateConfirmSlot.id, "Inactivo");
    setInactivateConfirmSlot(null);
    setInactivatePassword("");
    setInactivateError("");
  };

  // Toggle active/inactive for registered socio
  const toggleStatus = (slotId: string, forcedStatus?: "Activo" | "Inactivo" | "Por Activar") => {
    const slot = slots.find((s) => s.id === slotId);
    if (!slot) return;

    const newStatus = forcedStatus || (slot.estado === "Inactivo" ? "Activo" : "Inactivo");

    const updated = slots.map((s) => {
      if (s.id === slotId && s.used) {
        return {
          ...s,
          estado: newStatus,
        };
      }
      return s;
    });

    setSlots(updated);
    savePartnerCodeSlots(updated);

    // Sync state change to registered users and socios storage
    try {
      const rawUsers = localStorage.getItem("kpier_registered_users");
      if (rawUsers) {
        const users: any[] = JSON.parse(rawUsers);
        const updatedUsers = users.map((u) => {
          if (
            (slot.code && u.partnerCode === slot.code) ||
            (slot.email && u.email?.toLowerCase() === slot.email.toLowerCase())
          ) {
            return { ...u, estado: newStatus };
          }
          return u;
        });
        localStorage.setItem("kpier_registered_users", JSON.stringify(updatedUsers));
      }

      const rawSocios = localStorage.getItem("kpier_socios_registrados");
      if (rawSocios) {
        const socios: any[] = JSON.parse(rawSocios);
        const updatedSocios = socios.map((soc) => {
          if (
            (slot.code && soc.codigoSocio === slot.code) ||
            (slot.email && soc.email?.toLowerCase() === slot.email.toLowerCase())
          ) {
            return { ...soc, estado: newStatus };
          }
          return soc;
        });
        localStorage.setItem("kpier_socios_registrados", JSON.stringify(updatedSocios));
      }

      window.dispatchEvent(new Event("kpier_socios_updated"));
    } catch (e) {
      console.error("Error updating status in storage:", e);
    }

    // Sync status update to Google Sheets and Server Database
    const regVal = slot.registradoPor || slot.referidoPor || "Gerencia";
    syncSocioToGoogleSheets({
      fechaRegistro: slot.fechaRegistro || new Date().toISOString().split("T")[0],
      userCode: slot.code,
      nombreApellido: slot.nombre || "",
      rucCedula: slot.rucCedula || "",
      email: slot.email || "",
      telefono: slot.telefono || "",
      role: slot.role || "admin1",
      codigoAsignado: slot.code,
      registradoPor: regVal,
      referidoPor: regVal,
      estado: newStatus,
      password: getPasswordForSlot(slot),
    });

    if (newStatus === "Inactivo") {
      setUsageFilter("inactivos");
      showNotification(`🔴 Socio "${slot.nombre || "Registrado"}" cambiado a INACTIVO (Trasladado a la pestaña de Socios Inactivos).`);
    } else if (newStatus === "Activo") {
      setUsageFilter("activos");
      showNotification(`🟢 Socio "${slot.nombre || "Registrado"}" activado correctamente (Trasladado a la pestaña de Socios Activos y sincronizado a Google Sheets).`);
    } else {
      setUsageFilter("por_activar");
      showNotification(`🟡 Socio "${slot.nombre || "Registrado"}" en estado POR ACTIVAR.`);
    }
  };

  // Generate a brand new replacement code for a single slot if Gerencia wants
  const handleRegenerateCode = (slotId: string) => {
    const newCode = generate10CharAlphanumeric();
    const updated = slots.map((s) => {
      if (s.id === slotId) {
        return {
          ...s,
          code: newCode,
        };
      }
      return s;
    });
    setSlots(updated);
    savePartnerCodeSlots(updated);
    showNotification(`Nuevo código de 10 caracteres generado: ${newCode}`);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B2545] text-white px-5 py-3 rounded-2xl shadow-2xl border border-amber-400/40 font-bold text-xs flex items-center gap-2 animate-bounce-short">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* MONITOR DE SINCRONIZACIÓN GOOGLE SHEETS */}
      <SyncMonitorCard />

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Socios Activos</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-900">{stats.activos}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Habilitados en la plataforma</span>
        </div>

        <div className="bg-white border border-amber-300 bg-amber-50/30 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Por Activar</span>
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-amber-950">{stats.porActivar}</p>
          <span className="text-[10px] text-amber-700 font-bold">Pendientes de aprobación</span>
        </div>

        <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Socios Inactivos</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-900">{stats.inactivos}</p>
          <span className="text-[10px] text-rose-600 font-medium">Deshabilitados / Trasladados</span>
        </div>

        <div className="bg-white border border-purple-200 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-purple-800">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Total Socios</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-purple-900">{stats.usados}</p>
          <span className="text-[10px] text-purple-700 font-medium">Registrados en la red</span>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search & New Socio Button */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar socio, código, correo, RUC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>

          <button
            onClick={handleOpenNewSocioModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer border border-emerald-500 shrink-0"
            title="Registrar y asignar un nuevo socio generando automáticamente un código aleatorio"
          >
            <UserPlus className="w-4 h-4 text-emerald-100" />
            <span>+ Registrar Nuevo Socio</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status tables filter */}
          <div className="flex flex-wrap items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold gap-1">
            <button
              onClick={() => setUsageFilter("activos")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                usageFilter === "activos" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Socios Activos ({stats.activos})</span>
            </button>
            <button
              onClick={() => setUsageFilter("por_activar")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                usageFilter === "por_activar" ? "bg-amber-500 text-white shadow-sm font-black" : "text-amber-800 hover:text-amber-950 hover:bg-amber-100/50"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${usageFilter === "por_activar" ? "bg-white" : "bg-amber-500"} animate-pulse`}></span>
              <span>Socio por Activar ({stats.porActivar})</span>
            </button>
            <button
              onClick={() => setUsageFilter("inactivos")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                usageFilter === "inactivos" ? "bg-white text-rose-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Socios Inactivos ({stats.inactivos})</span>
            </button>
            <button
              onClick={() => setUsageFilter("todos")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                usageFilter === "todos" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Todos ({stats.usados})
            </button>
          </div>

          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
          >
            <option value="todos">Todos los Perfiles</option>
            <option value="admin1">Socio Administrativo</option>
            <option value="gerencia">Gerencia General</option>
          </select>

          <div className="text-xs font-semibold text-slate-500 shrink-0">
            Mostrando <strong className="text-slate-900 font-bold">{filteredSlots.length}</strong> registros
          </div>
        </div>
      </div>

      {/* TABLE OF 50 SINGLE-USE PARTNER CODES */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-12">#</th>
                <th className="py-3.5 px-4 text-center bg-amber-50/50 text-amber-950 font-black">
                  Código Utilizado (10 Chars)
                </th>
                <th className="py-3.5 px-4">Socio / Usuario Registrado</th>
                <th className="py-3.5 px-4 bg-blue-50/50 text-blue-950 font-black">Pertenece A (Socio Propietario)</th>
                <th className="py-3.5 px-4">Contacto (Correo / Teléfono)</th>
                <th className="py-3.5 px-4">RUC / Cédula</th>
                <th className="py-3.5 px-4 text-center min-w-[210px]">Nivel de Acceso (Modificable)</th>
                <th className="py-3.5 px-4 text-center">Fecha Registro</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 text-xs">
              {filteredSlots.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-medium">
                    No se encontraron registros que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredSlots.map((s, index) => (
                  <tr
                    key={s.id}
                    className={`transition-colors ${
                      s.used ? "hover:bg-slate-50/90 bg-white" : "bg-slate-50/40 hover:bg-amber-50/20"
                    }`}
                  >
                    {/* Index */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-400 text-[11px]">
                      {index + 1}
                    </td>

                    {/* Código de Socio (10 Chars) */}
                    <td className="py-3 px-4 text-center bg-amber-50/30">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="font-mono text-xs font-black bg-amber-100 text-amber-950 px-2.5 py-1 rounded-lg border border-amber-300 tracking-wider shadow-xs">
                          {s.code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(s.code)}
                          className="p-1 text-amber-700 hover:text-amber-950 hover:bg-amber-200/60 rounded cursor-pointer transition-colors"
                          title="Copiar código de 10 caracteres"
                        >
                          {copiedCode === s.code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Socio / Usuario */}
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {s.used && s.nombre ? (
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#0B2545]/10 text-[#0B2545] font-black flex items-center justify-center text-xs shrink-0 border border-[#0B2545]/20">
                            {s.nombre.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 leading-snug">{s.nombre}</p>
                            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              Código Reclamado
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-400 italic text-[11px] font-medium flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0"></span>
                          <span>(Disponible - Esperando Registro)</span>
                        </div>
                      )}
                    </td>

                    {/* Pertenece A / Socio Propietario */}
                    <td className="py-3 px-4 font-bold text-slate-800 bg-blue-50/20">
                      {s.used ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-blue-100 text-blue-950 border border-blue-300 shadow-2xs">
                          {s.registradoPor || s.referidoPor || "Gerencia"}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Contacto */}
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {s.used && s.email ? (
                        <div className="space-y-0.5">
                          <p className="flex items-center gap-1 text-slate-800 font-semibold text-xs">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{s.email}</span>
                          </p>
                          {s.telefono && (
                            <p className="flex items-center gap-1 text-slate-500 text-[11px]">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{s.telefono}</span>
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* RUC / Cedula */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {s.used && s.rucCedula ? (
                        <div className="flex items-center gap-1.5">
                          <IdCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{s.rucCedula}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* SELECTOR DE NIVEL DE ACCESO (MODIFICABLE DE MANERA MANUAL POR GERENCIA) */}
                    <td className="py-3 px-4 text-center">
                      <div className="relative inline-block w-full max-w-[210px]">
                        <select
                          value={s.role}
                          onChange={(e) =>
                            handleRoleChange(
                              s.id,
                              e.target.value as "admin1" | "admin2" | "admin" | "gerencia"
                            )
                          }
                          className={`w-full py-1.5 pl-3 pr-7 rounded-xl text-xs font-black cursor-pointer border transition-all appearance-none ${
                            s.role === "admin1"
                              ? "bg-blue-50 text-blue-900 border-blue-300 hover:bg-blue-100"
                              : s.role === "admin2"
                              ? "bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100"
                              : s.role === "admin"
                              ? "bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100"
                              : "bg-purple-50 text-purple-950 border-purple-300 hover:bg-purple-100"
                          }`}
                          title="Cambiar nivel de acceso para este usuario"
                        >
                          <option value="admin1">Socio Administrativo</option>
                          <option value="gerencia">Gerencia General</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                      </div>
                    </td>

                    {/* Fecha */}
                    <td className="py-3 px-4 text-center text-slate-600 font-mono font-semibold text-[11px]">
                      {s.used && s.fechaRegistro ? s.fechaRegistro : <span className="text-slate-300">—</span>}
                    </td>

                    {/* Estado */}
                    <td className="py-3 px-4 text-center">
                      {s.used ? (
                        <div className="relative inline-block">
                          <select
                            value={s.estado === "por_activar" ? "Por Activar" : (s.estado || "Activo")}
                            onChange={(e) => handleStatusSelectChange(s.id, e.target.value as "Activo" | "Inactivo" | "Por Activar")}
                            className={`appearance-none pl-3 pr-7 py-1 rounded-full text-[11px] font-black cursor-pointer transition-all shadow-xs focus:outline-none border ${
                              s.estado === "Inactivo"
                                ? "bg-rose-600 text-white border-rose-700 hover:bg-rose-700"
                                : s.estado === "Por Activar" || s.estado === "por_activar"
                                ? "bg-amber-500 text-white border-amber-600 hover:bg-amber-600"
                                : "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700"
                            }`}
                            title="Seleccione el estado del socio"
                          >
                            <option value="Activo" className="bg-white text-slate-900 font-bold">ACTIVO</option>
                            <option value="Por Activar" className="bg-white text-amber-800 font-bold">POR ACTIVAR</option>
                            <option value="Inactivo" className="bg-white text-slate-900 font-bold">INACTIVO</option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white opacity-80" />
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <CheckCircle2 className="w-3 h-3 text-blue-500" />
                          <span>Un Solo Uso</span>
                        </span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedSlot(s)}
                          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer font-black text-xs flex items-center gap-1.5 shadow-xs ${
                            !s.used
                              ? "text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200"
                              : "text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200"
                          }`}
                          title="Ver detalle para gestionar ficha, crear usuario o socio"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>Ver Detalle</span>
                        </button>

                        {!s.used && (
                          <button
                            onClick={() => handleRegenerateCode(s.id)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Regenerar un nuevo código aleatorio de 10 caracteres"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL FOR REGISTERED / ASSIGNING SOCIO */}
      {selectedSlot && (() => {
        const isSocioActivo = selectedSlot.used && (selectedSlot.estado === "Activo" || (!selectedSlot.estado && selectedSlot.used));
        return (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#0B2545] text-amber-400 font-black flex items-center justify-center text-sm shadow-md">
                    {selectedSlot.nombre?.substring(0, 2).toUpperCase() || "SO"}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">{selectedSlot.nombre || "Ficha de Socio"}</h3>
                    <p className="text-xs text-slate-500 font-medium">Gestión de Perfil, Credenciales y Datos Bancarios</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* DATOS DEL CÓDIGO Y NIVEL */}
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700 font-extrabold uppercase text-[10px]">Código de Socio (10 Chars):</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-amber-950 bg-amber-100 px-3 py-1 rounded-lg border border-amber-300 text-sm tracking-wider">
                        {selectedSlot.code}
                      </span>
                      <button
                        onClick={() => handleCopyCode(selectedSlot.code)}
                        className="p-1 text-amber-800 hover:bg-amber-200 rounded cursor-pointer"
                        title="Copiar código"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-700 font-extrabold uppercase text-[10px]">Socio Propietario (Pertenece A):</span>
                    <span className="font-extrabold text-blue-950 bg-blue-100 px-3 py-1 rounded-lg border border-blue-300 text-xs">
                      {selectedSlot.registradoPor || selectedSlot.referidoPor || "Gerencia"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-700 font-extrabold uppercase text-[10px]">Nivel de Acceso:</span>
                    <select
                      value={selectedSlot.role}
                      onChange={(e) =>
                        handleRoleChange(
                          selectedSlot.id,
                          e.target.value as "admin1" | "admin2" | "admin" | "gerencia"
                        )
                      }
                      className="py-1 px-3 bg-white border border-amber-300 rounded-xl text-xs font-black text-slate-900 cursor-pointer shadow-xs"
                    >
                      <option value="admin1">Socio Administrativo</option>
                      <option value="gerencia">Gerencia General</option>
                    </select>
                  </div>
                </div>

                {/* INFORMACIÓN PERSONAL / CONTACTO / CREDENCIALES (MODIFICABLE POR GERENCIA) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      Información Personal y Credenciales
                    </span>
                    <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Sincronización Sheets Activa
                    </span>
                  </div>

                  {editSuccessMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{editSuccessMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Nombre y Apellido */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-600 font-extrabold uppercase">
                        Nombre y Apellido
                      </label>
                      <input
                        type="text"
                        value={editNombre}
                        onChange={(e) => setEditNombre(e.target.value)}
                        placeholder="Ej. Carlos Andrade"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Nombre de Usuario */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-blue-700 font-extrabold uppercase">
                        Nombre de Usuario
                      </label>
                      <input
                        type="text"
                        value={editUsuario}
                        onChange={(e) => setEditUsuario(e.target.value)}
                        placeholder="Ej. carlos.andrade"
                        className="w-full px-3 py-2 bg-blue-50/50 border border-blue-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none font-mono"
                      />
                    </div>

                    {/* Cédula o RUC */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-600 font-extrabold uppercase">
                        RUC / Cédula (10-13 car)
                      </label>
                      <input
                        type="text"
                        maxLength={13}
                        value={editRuc}
                        onChange={(e) => setEditRuc(e.target.value)}
                        placeholder="1720394857"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 font-mono focus:bg-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Teléfono */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-600 font-extrabold uppercase">
                        Teléfono de Contacto
                      </label>
                      <input
                        type="text"
                        value={editTelefono}
                        onChange={(e) => setEditTelefono(e.target.value)}
                        placeholder="0991234567"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 font-mono focus:bg-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Correo Electrónico */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-600 font-extrabold uppercase">
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="socio@email.com"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Contraseña */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-amber-800 font-extrabold uppercase flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-600" />
                        Contraseña de Acceso
                      </label>
                      <div className="relative">
                        <input
                          type={showSlotPassword ? "text" : "password"}
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          className="w-full pl-3 pr-8 py-2 bg-amber-50/80 border border-amber-300 rounded-xl text-xs font-bold text-amber-950 font-mono focus:bg-white focus:border-amber-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSlotPassword(!showSlotPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-700 hover:text-amber-900 p-1 cursor-pointer"
                        >
                          {showSlotPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DATOS BANCARIOS (REGISTRO DE CUENTA) */}
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5 text-emerald-700" />
                      Datos Bancarios (Pago de Comisiones)
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                      Transferencia
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Banco */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-600 font-extrabold uppercase">
                        Banco / Cooperativa
                      </label>
                      <input
                        type="text"
                        list="ecuador-banks-list-detail"
                        value={editBanco}
                        onChange={(e) => setEditBanco(e.target.value)}
                        placeholder="Ej. Banco Pichincha"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                      />
                      <datalist id="ecuador-banks-list-detail">
                        {ECUADOR_BANKS.map((b) => (
                          <option key={b} value={b} />
                        ))}
                      </datalist>
                    </div>

                    {/* Tipo de Cuenta */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-600 font-extrabold uppercase">
                        Tipo de Cuenta
                      </label>
                      <select
                        value={editTipoCuenta}
                        onChange={(e) => setEditTipoCuenta(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none cursor-pointer"
                      >
                        <option value="Cuenta de Ahorros">Cuenta de Ahorros</option>
                        <option value="Cuenta Corriente">Cuenta Corriente</option>
                      </select>
                    </div>

                    {/* Número de Cuenta */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-600 font-extrabold uppercase">
                        Número de Cuenta
                      </label>
                      <input
                        type="text"
                        value={editNumeroCuenta}
                        onChange={(e) => setEditNumeroCuenta(e.target.value)}
                        placeholder="Ej. 2204567890"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 font-mono focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* Titular de la Cuenta */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-600 font-extrabold uppercase">
                        Titular de la Cuenta
                      </label>
                      <input
                        type="text"
                        value={editTitularCuenta}
                        onChange={(e) => setEditTitularCuenta(e.target.value)}
                        placeholder="Nombre del titular"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* Cédula del Titular */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] text-slate-600 font-extrabold uppercase">
                        C.I. / RUC del Titular
                      </label>
                      <input
                        type="text"
                        maxLength={13}
                        value={editCedulaTitular}
                        onChange={(e) => setEditCedulaTitular(e.target.value)}
                        placeholder="1720394857"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 font-mono focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ACCIONES DEL MODAL */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedSlot(null)}
                  className="w-full sm:w-auto py-2.5 px-4 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 cursor-pointer"
                >
                  Cerrar
                </button>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                  {/* SI EL SOCIO ESTÁ ACTIVADO: SOLO ELIMINAR SOCIO Y ACTUALIZAR DATOS */}
                  {isSocioActivo ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleClearSlot(selectedSlot.id)}
                        className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                        title="Eliminar socio o inactivar si tiene ventas registradas (requiere clave de gerencia)"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Eliminar Socio</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleUpdateSlotDataOnly}
                        className="py-2.5 px-4 bg-[#0B2545] hover:bg-[#133E72] text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all"
                        title="Actualizar datos del socio"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                        <span>Actualizar Datos</span>
                      </button>
                    </>
                  ) : (
                    /* SI EL SOCIO NO ESTÁ ACTIVADO / ETAPA ASIGNAR: CREAR USUARIO, CREAR SOCIO, ACTUALIZAR DATOS */
                    <>
                      <button
                        type="button"
                        onClick={handleCreateUserInSheets}
                        disabled={isSyncingSheets}
                        className="py-2.5 px-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all disabled:opacity-50"
                        title="Registrar credenciales en la pestaña USUARIOS de Google Sheets"
                      >
                        {isSyncingSheets ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5 text-blue-200" />
                        )}
                        <span>Crear Usuario</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCreateSocioInSheets}
                        disabled={isSyncingSheets}
                        className="py-2.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all disabled:opacity-50"
                        title="Registrar y activar al socio en la pestaña SOCIOS de Google Sheets"
                      >
                        {isSyncingSheets ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                        ) : (
                          <UserPlus className="w-3.5 h-3.5 text-emerald-200" />
                        )}
                        <span>Crear Socio</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleUpdateSlotDataOnly}
                        className="py-2.5 px-3.5 bg-[#0B2545] hover:bg-[#133E72] text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all"
                        title="Actualizar únicamente datos y contraseña"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                        <span>Actualizar Datos</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL: REGISTRAR/ASIGNAR SOCIO MANUALLY A UN CÓDIGO DISPONIBLE */}
      {assignModalSlot && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Registrar y Asignar Nuevo Socio</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500 font-medium">Código aleatorio generado:</span>
                    <strong className="font-mono text-amber-900 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300 font-bold text-xs tracking-wider shadow-2xs">
                      {assignModalSlot.code}
                    </strong>
                    <button
                      type="button"
                      onClick={handleRegenerateModalCode}
                      className="p-1 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                      title="Generar otro código aleatorio de 10 caracteres"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setAssignModalSlot(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualSocio} className="space-y-4 text-xs">
              {assignModalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 leading-relaxed flex items-start gap-2 shadow-sm animate-shake">
                  <span className="text-base shrink-0">⚠️</span>
                  <span>{assignModalError}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-extrabold uppercase text-[10px] mb-1">
                  Nombre Completo del Socio <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newNombre}
                  onChange={(e) => setNewNombre(e.target.value)}
                  placeholder="Ej. Carlos Eduardo Andrade"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-emerald-800 font-extrabold uppercase text-[10px] mb-1">
                    RUC / Cédula <span className="text-rose-500">*</span> <span className="text-emerald-700 font-semibold text-[9px] lowercase">(Usuario de acceso)</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={13}
                    value={newRuc}
                    onChange={(e) => setNewRuc(e.target.value)}
                    placeholder="1720394857001"
                    className="w-full px-3 py-2 bg-emerald-50/50 border border-emerald-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold uppercase text-[10px] mb-1">
                    Correo Electrónico <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="socio@ejemplo.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold uppercase text-[10px] mb-1">
                    Teléfono <span className="text-rose-500">*</span> <span className="text-slate-400 font-semibold text-[9px] lowercase">(10 dígitos obligatorio)</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={newTelefono}
                    onChange={(e) => setNewTelefono(e.target.value)}
                    placeholder="0991234567"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold uppercase text-[10px] mb-1">
                    Contraseña <span className="text-rose-500">*</span> <span className="text-amber-700 font-bold lowercase text-[9px]">(1 Mayús, 1 Num, 1 Símbolo . -)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Ej. MiClave2026."
                      className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showNewPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {(() => {
                    const req = getPasswordRequirements(newPassword);
                    return (
                      <div className="grid grid-cols-2 gap-1 mt-1.5 text-[9px] font-semibold">
                        <span className={req.hasMinLength ? "text-emerald-700 flex items-center gap-0.5" : "text-slate-400"}>
                          {req.hasMinLength ? "✓" : "○"} 6+ Caracteres
                        </span>
                        <span className={req.hasUppercase ? "text-emerald-700 flex items-center gap-0.5" : "text-slate-400"}>
                          {req.hasUppercase ? "✓" : "○"} 1 Mayúscula
                        </span>
                        <span className={req.hasNumber ? "text-emerald-700 flex items-center gap-0.5" : "text-slate-400"}>
                          {req.hasNumber ? "✓" : "○"} 1 Número
                        </span>
                        <span className={req.hasSpecial ? "text-emerald-700 flex items-center gap-0.5" : "text-slate-400"}>
                          {req.hasSpecial ? "✓" : "○"} 1 Símbolo (. -)
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold uppercase text-[10px] mb-1">
                  Nivel de Acceso Asignado
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="admin1">Socio Administrativo</option>
                  <option value="gerencia">Gerencia General</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAssignModalSlot(null)}
                  className="py-2.5 px-4 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-md flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-emerald-200" />
                  <span>Guardar y Asignar Perfil</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR SOCIO */}
      {deleteConfirmSlot && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-rose-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center gap-3 border-b border-rose-100 pb-4">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 font-black flex items-center justify-center shrink-0 shadow-sm">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">¿Eliminar Perfil de Socio?</h3>
                <p className="text-xs text-rose-600 font-bold">Esta acción desvinculará al socio inmediatamente</p>
              </div>
            </div>

            <div className="p-4 bg-rose-50/70 border border-rose-200/80 rounded-2xl space-y-2 text-xs">
              <p className="text-slate-800 font-medium">
                Está a punto de eliminar el perfil de <strong className="font-extrabold text-slate-900">{deleteConfirmSlot.nombre || "este socio"}</strong> (Correo: <em>{deleteConfirmSlot.email || "N/A"}</em>).
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                <li>El código de socio <strong className="font-mono text-amber-900 bg-amber-100 px-1 py-0.5 rounded">{deleteConfirmSlot.code}</strong> quedará totalmente <strong>LIBRE</strong> para un nuevo socio.</li>
                <li>Se eliminará el perfil de la plataforma y de la matriz de Google Sheets.</li>
                <li>El usuario ya no podrá ingresar con estas credenciales.</li>
              </ul>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Ingrese la Clave de Perfil de Gerencia:
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => {
                  setDeletePassword(e.target.value);
                  setDeleteError("");
                }}
                placeholder="Clave de Gerencia..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none"
              />
              {deleteError && (
                <p className="text-[11px] font-bold text-rose-600 pt-1">{deleteError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmSlot(null);
                  setDeletePassword("");
                  setDeleteError("");
                }}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-xs cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => executeDeleteSlot(deleteConfirmSlot.id)}
                className="py-2.5 px-5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-md flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sí, Eliminar Socio</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA INACTIVAR SOCIO */}
      {inactivateConfirmSlot && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-rose-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center gap-3 border-b border-rose-100 pb-4">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 font-black flex items-center justify-center shrink-0 shadow-sm">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">¿Inactivar Usuario Socio?</h3>
                <p className="text-xs text-rose-600 font-bold">El usuario no podrá acceder al sistema mientras esté inactivo</p>
              </div>
            </div>

            <div className="p-4 bg-rose-50/70 border border-rose-200/80 rounded-2xl space-y-2 text-xs">
              <p className="text-slate-800 font-medium">
                ¿Está seguro que desea inactivar al usuario <strong className="font-extrabold text-slate-900">{inactivateConfirmSlot.nombre || inactivateConfirmSlot.code}</strong>?
              </p>
              <p className="text-slate-600 text-[11px]">
                Al inactivarlo, la cuenta cambiará a estado <strong>INACTIVO</strong> y el usuario será trasladado automáticamente a la pestaña de <strong>Socios Inactivos</strong>.
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Ingrese la Clave de Perfil de Gerencia:
              </label>
              <input
                type="password"
                value={inactivatePassword}
                onChange={(e) => {
                  setInactivatePassword(e.target.value);
                  setInactivateError("");
                }}
                placeholder="Clave de Gerencia..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none"
              />
              {inactivateError && (
                <p className="text-[11px] font-bold text-rose-600 pt-1">{inactivateError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setInactivateConfirmSlot(null);
                  setInactivatePassword("");
                  setInactivateError("");
                }}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-xs cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={executeInactivateSlot}
                className="py-2.5 px-5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-md flex items-center gap-2 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>Sí, Inactivar Socio</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

