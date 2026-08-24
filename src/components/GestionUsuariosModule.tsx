import React, { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  Clock,
  UserX,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Plus,
  Shield,
  RefreshCw,
  Eye,
  Key,
  Calendar,
  User,
  Mail,
  Phone,
  Tag,
  AlertTriangle,
  Lock,
  Edit2,
  Check,
} from "lucide-react";

export interface CentralUser {
  idUsuario: string;
  nombre: string;
  apellido?: string;
  email: string;
  telefono?: string;
  usuario: string;
  rol: string;
  idSocio?: string;
  estado: "ACTIVO" | "PENDIENTE_VALIDACION" | "INACTIVO" | "BLOQUEADO" | string;
  creadoPor?: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  ultimoAcceso?: string;
  validadoPor?: string;
  fechaValidacion?: string;
}

export function GestionUsuariosModule() {
  const [users, setUsers] = useState<CentralUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("TODOS");
  const [filterRole, setFilterRole] = useState<string>("TODOS");
  const [notification, setNotification] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Modal State for New User
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNombre, setNewNombre] = useState("");
  const [newApellido, setNewApellido] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newTelefono, setNewTelefono] = useState("");
  const [newCedula, setNewCedula] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRol, setNewRol] = useState("admin1");
  const [newIdSocio, setNewIdSocio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State for Editing User
  const [editingUser, setEditingUser] = useState<CentralUser | null>(null);
  const [editRol, setEditRol] = useState("");
  const [editIdSocio, setEditIdSocio] = useState("");
  const [editPassword, setEditPassword] = useState("");

  const showNotify = (type: "success" | "error", msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/users");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setUsers(json.data);
      }
    } catch (e) {
      console.error("Error fetching central users:", e);
      showNotify("error", "Error al conectar con la pestaña USUARIOS del servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Action: Validate User (PENDIENTE_VALIDACION -> ACTIVO)
  const handleValidateUser = async (user: CentralUser) => {
    try {
      const res = await fetch("/api/users/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idUsuario: user.idUsuario,
          nuevoEstado: "ACTIVO",
          validadoPor: "David Santander (Gerencia General)",
        }),
      });

      const json = await res.json();
      if (json.success) {
        showNotify("success", `✅ Usuario "${user.nombre}" validado exitosamente. Ahora puede iniciar sesión desde cualquier dispositivo.`);
        fetchUsers();
      } else {
        showNotify("error", json.message || "Error al validar el usuario.");
      }
    } catch (e) {
      console.error("Error validating user:", e);
      showNotify("error", "Error al procesar la validación.");
    }
  };

  // Action: Change User Status (e.g. INACTIVO / BLOQUEADO)
  const handleChangeStatus = async (user: CentralUser, newStatus: string) => {
    try {
      const res = await fetch("/api/users/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idUsuario: user.idUsuario,
          nuevoEstado: newStatus,
          validadoPor: "David Santander (Gerencia)",
        }),
      });

      const json = await res.json();
      if (json.success) {
        showNotify("success", `Estado de "${user.nombre}" cambiado a ${newStatus}.`);
        fetchUsers();
      } else {
        showNotify("error", json.message || "Error al cambiar estado.");
      }
    } catch (e) {
      showNotify("error", "Error de comunicación.");
    }
  };

  // Action: Create New User from Gerencia (Cédula is the user's username)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCedula = newCedula.trim().replace(/\s+/g, "");
    if (!newNombre || !newEmail || !newPassword || !cleanCedula) {
      showNotify("error", "Nombre, Cédula / RUC, Correo y Contraseña son obligatorios.");
      return;
    }

    if (cleanCedula.length < 10) {
      showNotify("error", "La Cédula / RUC debe tener al menos 10 dígitos numéricos.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: newNombre,
          apellido: newApellido,
          email: newEmail,
          telefono: newTelefono,
          usuario: cleanCedula, // Cédula is the user's login identifier
          cedula: cleanCedula,
          password: newPassword,
          rol: newRol,
          idSocio: newIdSocio,
          createdByRole: "gerencia",
          createdByName: "David Santander (Gerencia General)",
        }),
      });

      const json = await res.json();
      if (json.success) {
        showNotify("success", "✅ Usuario creado y habilitado exitosamente en el repositorio central USUARIOS.");
        setShowCreateModal(false);
        // Reset form
        setNewNombre("");
        setNewApellido("");
        setNewEmail("");
        setNewTelefono("");
        setNewCedula("");
        setNewPassword("");
        setNewRol("admin1");
        setNewIdSocio("");
        fetchUsers();
      } else {
        showNotify("error", json.message || "Error al crear usuario.");
      }
    } catch (e) {
      showNotify("error", "Error de red al crear el usuario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Action: Save Edits (Role / IdSocio / Password)
  const handleSaveUserEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/users/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idUsuario: editingUser.idUsuario,
          rol: editRol,
          idSocio: editIdSocio,
          password: editPassword || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        showNotify("success", "✅ Datos de usuario actualizados correctamente.");
        setEditingUser(null);
        fetchUsers();
      } else {
        showNotify("error", json.message || "Error al actualizar.");
      }
    } catch (e) {
      showNotify("error", "Error al guardar cambios.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered lists
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      u.nombre.toLowerCase().includes(term) ||
      (u.apellido && u.apellido.toLowerCase().includes(term)) ||
      u.email.toLowerCase().includes(term) ||
      u.usuario.toLowerCase().includes(term) ||
      (u.idSocio && u.idSocio.toLowerCase().includes(term)) ||
      u.idUsuario.toLowerCase().includes(term);

    const matchesStatus =
      filterStatus === "TODOS" ||
      u.estado === filterStatus ||
      (filterStatus === "PENDIENTE_VALIDACION" && (u.estado === "PENDIENTE" || u.estado === "PENDIENTE_VALIDACION"));

    const matchesRole = filterRole === "TODOS" || u.rol === filterRole;

    return matchesSearch && matchesStatus && matchesRole;
  });

  // Metrics
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.estado === "ACTIVO").length;
  const pendingUsers = users.filter((u) => u.estado === "PENDIENTE_VALIDACION" || u.estado === "PENDIENTE").length;
  const inactiveUsers = users.filter((u) => u.estado === "INACTIVO" || u.estado === "BLOQUEADO").length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Title */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Sistema Central de Usuarios & Autenticación
                </h1>
                <p className="text-sm text-slate-500">
                  Pestaña Google Sheets: <span className="font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">USUARIOS</span> — Repositorio único centralizado para todos los dispositivos y navegadores.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchUsers}
              disabled={isLoading}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              Sincronizar
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo Usuario Central
            </button>
          </div>
        </div>

        {/* Notifications */}
        {notification && (
          <div
            className={`mt-4 p-4 rounded-lg flex items-center justify-between text-sm ${
              notification.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            <span>{notification.msg}</span>
            <button onClick={() => setNotification(null)} className="font-bold opacity-60 hover:opacity-100">
              ✕
            </button>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Total Usuarios</span>
              <Users className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{totalUsers}</p>
            <span className="text-xs text-slate-500">En base central de datos</span>
          </div>

          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-emerald-700">Usuarios Activos</span>
              <UserCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-900 mt-2">{activeUsers}</p>
            <span className="text-xs text-emerald-600">Acceso habilitado</span>
          </div>

          <div
            className={`p-4 rounded-xl border transition-all ${
              pendingUsers > 0
                ? "bg-amber-50 border-amber-300 ring-2 ring-amber-400/20 shadow-sm"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-amber-800">Pendientes Validación</span>
              <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
            </div>
            <p className="text-2xl font-bold text-amber-900 mt-2">{pendingUsers}</p>
            <span className="text-xs font-semibold text-amber-700">
              {pendingUsers > 0 ? "⚠️ Requieren acción de Gerencia" : "Sin solicitudes pendientes"}
            </span>
          </div>

          <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-rose-700">Inactivos / Bloqueados</span>
              <UserX className="w-5 h-5 text-rose-600" />
            </div>
            <p className="text-2xl font-bold text-rose-900 mt-2">{inactiveUsers}</p>
            <span className="text-xs text-rose-600">Acceso restringido</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email, usuario o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase">Estado:</span>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="PENDIENTE_VALIDACION">⚡ Pendientes de Validación</option>
            <option value="ACTIVO">✅ Activos</option>
            <option value="INACTIVO">🚫 Inactivos</option>
            <option value="BLOQUEADO">🔒 Bloqueados</option>
          </select>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="TODOS">Todos los Roles</option>
            <option value="gerencia">Gerencia General</option>
            <option value="admin">Admin General (Nivel 3)</option>
            <option value="admin2">Supervisor (Nivel 2)</option>
            <option value="admin1">Asesor Operativo (Nivel 1)</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Cédula / Usuario</th>
                <th className="py-3 px-4">Nombre y Correo</th>
                <th className="py-3 px-4">Rol & Socio ID</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Creado Por & Fecha</th>
                <th className="py-3 px-4">Validación / Acceso</th>
                <th className="py-3 px-4 text-right">Acción de Gerencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Cargando repositorio central de usuarios...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No se encontraron usuarios con los criterios de búsqueda seleccionados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isPending = u.estado === "PENDIENTE_VALIDACION" || u.estado === "PENDIENTE";
                  const isActive = u.estado === "ACTIVO";
                  const isInactive = u.estado === "INACTIVO" || u.estado === "BLOQUEADO";

                  return (
                    <tr
                      key={u.idUsuario}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isPending ? "bg-amber-50/40" : ""
                      }`}
                    >
                      {/* ID / Username */}
                      <td className="py-3.5 px-4 font-mono text-xs">
                        <div className="font-bold text-slate-900">{u.usuario}</div>
                        <span className="text-[10px] text-slate-400">{u.idUsuario}</span>
                      </td>

                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {u.nombre} {u.apellido || ""}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {u.email}
                        </div>
                      </td>

                      {/* Role & Partner Code */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              u.rol === "gerencia"
                                ? "bg-purple-100 text-purple-800 border border-purple-200"
                                : u.rol === "admin"
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : u.rol === "admin2"
                                ? "bg-cyan-100 text-cyan-800 border border-cyan-200"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {u.rol === "gerencia"
                              ? "Gerencia"
                              : u.rol === "admin"
                              ? "Admin N3"
                              : u.rol === "admin2"
                              ? "Supervisor N2"
                              : "Asesor N1"}
                          </span>
                        </div>
                        {u.idSocio && (
                          <div className="text-[11px] font-mono text-slate-500 mt-1 flex items-center gap-1">
                            <Tag className="w-3 h-3 text-slate-400" />
                            {u.idSocio}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                            <Clock className="w-3 h-3" />
                            PENDIENTE VALIDACIÓN
                          </span>
                        ) : isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle className="w-3 h-3" />
                            ACTIVO
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            {u.estado}
                          </span>
                        )}
                      </td>

                      {/* Creado por & Fecha */}
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <div>{u.creadoPor || "Sistema"}</div>
                        <div className="text-[10px] text-slate-400">
                          {u.fechaCreacion ? new Date(u.fechaCreacion).toLocaleDateString("es-EC") : "N/A"}
                        </div>
                      </td>

                      {/* Validado por & Ultimo Acceso */}
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {u.validadoPor ? (
                          <div className="text-emerald-700 font-medium text-[11px]">
                            Por: {u.validadoPor}
                          </div>
                        ) : (
                          <div className="text-amber-700 text-[11px]">Sin validar</div>
                        )}
                        <div className="text-[10px] text-slate-400">
                          Acceso: {u.ultimoAcceso ? new Date(u.ultimoAcceso).toLocaleString("es-EC") : "Nunca"}
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right">
                        {isPending ? (
                          <button
                            onClick={() => handleValidateUser(u)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all transform hover:scale-[1.02]"
                            title="Aprobar y habilitar acceso a la plataforma"
                          >
                            <Check className="w-3.5 h-3.5" />
                            VALIDAR USUARIO
                          </button>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setEditRol(u.rol);
                                setEditIdSocio(u.idSocio || "");
                                setEditPassword("");
                              }}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                              title="Editar rol/socio/clave"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {isActive ? (
                              <button
                                onClick={() => handleChangeStatus(u, "INACTIVO")}
                                className="px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 border border-rose-200 rounded transition-colors"
                                title="Desactivar acceso"
                              >
                                Desactivar
                              </button>
                            ) : (
                              <button
                                onClick={() => handleChangeStatus(u, "ACTIVO")}
                                className="px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 border border-emerald-200 rounded transition-colors"
                                title="Reactivar acceso"
                              >
                                Activar
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create User (Gerencia Direct) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Crear Nuevo Usuario Central
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={newNombre}
                  onChange={(e) => setNewNombre(e.target.value)}
                  placeholder="Ej. Carlos"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Apellido</label>
                <input
                  type="text"
                  value={newApellido}
                  onChange={(e) => setNewApellido(e.target.value)}
                  placeholder="Ej. Mendoza"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="ejemplo@upconta.ec"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cédula / RUC * <span className="text-blue-600 font-normal text-[10px]">(Usuario de ingreso)</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={13}
                    value={newCedula}
                    onChange={(e) => setNewCedula(e.target.value.replace(/\D/g, ""))}
                    placeholder="Ej. 1722388426"
                    className="w-full px-3 py-2 bg-blue-50/50 border border-blue-200 rounded-lg text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={newTelefono}
                    onChange={(e) => setNewTelefono(e.target.value)}
                    placeholder="0991234567"
                    className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contraseña *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rol de Acceso</label>
                  <select
                    value={newRol}
                    onChange={(e) => setNewRol(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm font-medium"
                  >
                    <option value="admin1 font-normal">Nivel 1 (Asesor)</option>
                    <option value="admin2">Nivel 2 (Supervisor)</option>
                    <option value="admin">Nivel 3 (Admin General)</option>
                    <option value="gerencia">Gerencia General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Código / ID Socio</label>
                  <input
                    type="text"
                    value={newIdSocio}
                    onChange={(e) => setNewIdSocio(e.target.value)}
                    placeholder="Ej. SOC-102"
                    className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <p className="text-[11px] text-emerald-600 bg-emerald-50 p-2 rounded">
                ⚡ Los usuarios creados directamente desde Gerencia se activan de forma automática.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  {isSubmitting ? "Guardando..." : "Crear y Activar Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                Editar Usuario: {editingUser.nombre}
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUserEdits} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rol de Acceso</label>
                <select
                  value={editRol}
                  onChange={(e) => setEditRol(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm"
                >
                  <option value="admin1">Nivel 1 (Asesor Operativo)</option>
                  <option value="admin2">Nivel 2 (Supervisor Operativo)</option>
                  <option value="admin">Nivel 3 (Admin General)</option>
                  <option value="gerencia">Gerencia General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ID Socio / Código Asignado</label>
                <input
                  type="text"
                  value={editIdSocio}
                  onChange={(e) => setEditIdSocio(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nueva Contraseña (Opcional)</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Dejar en blanco para no cambiar"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
