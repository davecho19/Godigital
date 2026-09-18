import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { google } from "googleapis";

const app = express();
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use(express.json());

const PORT = 3000;
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || "1XBKHujGg75HfmCxNpLJwiLOaVhOVOMueEHm0BnhxbB0";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyZBp1JIa0IHTRe6HfTNN7COlEW__KWGNr0nxSuTGbFPLSHHHtk9tgvKAUzvDzPCIFp/exec";
const DATA_FILE = path.join(process.cwd(), "data_store.json");

const PASSWORD_SALT = "_godi_kpier_salt_2026";

function hashPassword(password: string): string {
  if (!password) return "";
  return crypto.createHash("sha256").update(password + PASSWORD_SALT).digest("hex");
}

function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) return false;
  // Direct match fallback for legacy plain text passwords during transition
  if (password.trim() === storedHash.trim()) return true;
  const computed = hashPassword(password.trim());
  return computed === storedHash.trim();
}

interface DataStore {
  socios: any[];
  ventas: any[];
  accesos?: any[];
  permissionsMap?: any;
  deletedKeys?: string[];
  baseSociosCount?: number;
  usuarios?: any[];
}

function getRoleDisplayName(roleKey?: string): string {
  if (!roleKey) return "Administrativo";
  const key = roleKey.toLowerCase().trim();
  if (key === "gerencia" || key === "gerencia general") return "Gerencia";
  return "Administrativo";
}

function loadDataStore(): DataStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        socios: Array.isArray(parsed.socios) ? parsed.socios : [],
        ventas: Array.isArray(parsed.ventas) ? parsed.ventas : [],
        accesos: Array.isArray(parsed.accesos) ? parsed.accesos : [],
        permissionsMap: parsed.permissionsMap || null,
        deletedKeys: Array.isArray(parsed.deletedKeys) ? parsed.deletedKeys : [],
        baseSociosCount: typeof parsed.baseSociosCount === "number" ? parsed.baseSociosCount : 75,
        usuarios: Array.isArray(parsed.usuarios) ? parsed.usuarios : [],
      };
    }
  } catch (err) {
    console.error("Error reading data_store.json:", err);
  }
  return { socios: [], ventas: [], accesos: [], permissionsMap: null, deletedKeys: [], baseSociosCount: 75, usuarios: [] };
}

function saveDataStore(data: DataStore) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing data_store.json:", err);
  }
}

let currentStore = loadDataStore();

function getOAuthClient(req: express.Request) {
  const token =
    (req.headers["x-goog-authenticated-user-token"] as string) ||
    (req.headers["x-oauth-user-token"] as string) ||
    (req.headers["authorization"] ? (req.headers["authorization"] as string).replace(/^Bearer\s+/i, "") : "") ||
    process.env.GOOGLE_OAUTH_ACCESS_TOKEN;

  if (!token) return null;

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: token });
  return oauth2Client;
}

// Ensure sheet headers exist in Google Sheets
async function ensureHeaders(sheets: any) {
  try {
    // Check if Socios has headers
    const sociosRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Socios!A1:O1",
    }).catch(() => null);

    if (!sociosRes || !sociosRes.data.values || sociosRes.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: "Socios!A1:O1",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [
            [
              "Fecha Registro",
              "Código Socio",
              "Nombre y Apellido",
              "RUC / Cédula",
              "Correo Electrónico",
              "Teléfono",
              "Nivel / Rol",
              "Registrado Por",
              "Estado",
              "Contraseña",
              "Banco",
              "Tipo Cuenta",
              "Número Cuenta",
              "Titular Cuenta",
              "Cédula Titular",
            ],
          ],
        },
      }).catch((e: any) => console.log("Note: Could not create Socios headers automatically", e.message));
    }

    // Check if Ventas has headers
    const ventasRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Ventas!A1:L1",
    }).catch(() => null);

    if (!ventasRes || !ventasRes.data.values || ventasRes.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: "Ventas!A1:L1",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [
            [
              "Fecha",
              "ID Venta",
              "Cliente",
              "RUC / Cédula",
              "Plan / Producto",
              "Cantidad",
              "Total Venta",
              "Asesor / Socio",
              "Email Socio",
              "Código Socio",
              "Nivel / Rol",
              "Estado Comisión",
            ],
          ],
        },
      }).catch((e: any) => console.log("Note: Could not create Ventas headers automatically", e.message));
    }

    // Check if USUARIOS has headers
    const usuariosRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "USUARIOS!A1:V1",
    }).catch(() => null);

    if (!usuariosRes || !usuariosRes.data.values || usuariosRes.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: "USUARIOS!A1:V1",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [
            [
              "ID_USUARIO",
              "NOMBRE",
              "APELLIDO",
              "EMAIL",
              "TELEFONO",
              "USUARIO",
              "PASSWORD_HASH",
              "ROL",
              "ID_SOCIO",
              "ESTADO",
              "RUC_CEDULA",
              "BANCO",
              "TIPO_CUENTA",
              "NUMERO_CUENTA",
              "TITULAR_CUENTA",
              "CEDULA_TITULAR",
              "CREADO_POR",
              "FECHA_CREACION",
              "FECHA_ACTUALIZACION",
              "ULTIMO_ACCESO",
              "VALIDADO_POR",
              "FECHA_VALIDACION",
            ],
          ],
        },
      }).catch((e: any) => console.log("Note: Could not create USUARIOS headers automatically", e.message));
    }
  } catch (err: any) {
    console.log("Header check error:", err.message);
  }
}

// Central Users Helper & Spreadsheet Syncing
async function getCentralUsers(req: express.Request): Promise<any[]> {
  const auth = getOAuthClient(req);
  let sheetUsers: any[] = [];

  if (auth) {
    try {
      const sheets = google.sheets({ version: "v4", auth });
      await ensureHeaders(sheets);
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "USUARIOS!A2:P2000",
      });
      const rows = res.data.values || [];
      sheetUsers = rows.map((r: any, idx: number) => ({
        idUsuario: r[0] || `USR-${idx + 1}`,
        nombre: r[1] || "",
        apellido: r[2] || "",
        email: r[3] || "",
        telefono: r[4] || "",
        usuario: r[5] || "",
        passwordHash: r[6] || "",
        rol: r[7] || "admin1",
        idSocio: r[8] || "",
        estado: r[9] || "ACTIVO",
        creadoPor: r[10] || "Sistema",
        fechaCreacion: r[11] || "",
        fechaActualizacion: r[12] || "",
        ultimoAcceso: r[13] || "",
        validadoPor: r[14] || "",
        fechaValidacion: r[15] || "",
      }));
    } catch (e: any) {
      console.error("Error reading USUARIOS from Google Sheets:", e.message);
    }
  }

  // Merge with server memory store
  const userMap = new Map<string, any>();
  sheetUsers.forEach((u) => {
    const key = (u.idUsuario || u.usuario || u.email).toLowerCase().trim();
    if (key) userMap.set(key, u);
  });

  (currentStore.usuarios || []).forEach((u) => {
    const key = (u.idUsuario || u.usuario || u.email).toLowerCase().trim();
    if (key && !userMap.has(key)) {
      userMap.set(key, u);
    } else if (key && userMap.has(key)) {
      userMap.set(key, { ...userMap.get(key), ...u });
    }
  });

  let allUsers = Array.from(userMap.values());

  // Bootstrap master gerencia account if missing
  const hasGerencia = allUsers.some(
    (u) => (u.usuario || "").toLowerCase() === "gerencia" || (u.email || "").toLowerCase() === "dsantander@upconta.com"
  );

  if (!hasGerencia) {
    const masterGerencia = {
      idUsuario: "USR-GER-001",
      nombre: "David",
      apellido: "Santander",
      email: "dsantander@upconta.com",
      telefono: "098 069 0459",
      usuario: "gerencia",
      passwordHash: hashPassword("gerencia"),
      rol: "gerencia",
      idSocio: "GER-001",
      estado: "ACTIVO",
      creadoPor: "Sistema",
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      ultimoAcceso: "",
      validadoPor: "Sistema",
      fechaValidacion: new Date().toISOString(),
    };
    allUsers.unshift(masterGerencia);
    if (!currentStore.usuarios) currentStore.usuarios = [];
    currentStore.usuarios.unshift(masterGerencia);
    saveDataStore(currentStore);
  }

  return allUsers;
}

async function syncUserToGoogleSheets(req: express.Request, user: any) {
  if (!currentStore.usuarios) currentStore.usuarios = [];

  const rawRole = (user.rol || "").toLowerCase().trim();
  const normalizedRol = (rawRole === "gerencia" || rawRole.includes("gerencia")) ? "gerencia" : "administrador";
  user.rol = normalizedRol;

  const idx = currentStore.usuarios.findIndex(
    (u) =>
      (u.idUsuario && u.idUsuario === user.idUsuario) ||
      (u.usuario && u.usuario.toLowerCase() === user.usuario.toLowerCase()) ||
      (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase())
  );
  if (idx >= 0) {
    currentStore.usuarios[idx] = { ...currentStore.usuarios[idx], ...user };
  } else {
    currentStore.usuarios.unshift(user);
  }
  saveDataStore(currentStore);

  const rowValue = [
    user.idUsuario || `USR-${Date.now()}`,
    user.nombre || "",
    user.apellido || "",
    user.email || "",
    user.telefono || "",
    user.usuario || "",
    user.passwordHash || user.password || "",
    user.rol || "administrador",
    user.idSocio || "",
    user.estado || "ACTIVO",
    user.rucCedula || user.cedula || "",
    user.banco || "",
    user.tipoCuenta || "",
    user.numeroCuenta || "",
    user.titularCuenta || "",
    user.cedulaTitular || "",
    user.creadoPor || "Gerencia General",
    user.fechaCreacion || new Date().toISOString(),
    user.fechaActualizacion || new Date().toISOString(),
    user.ultimoAcceso || "",
    user.validadoPor || "Gerencia General",
    user.fechaValidacion || new Date().toISOString(),
  ];

  const auth = getOAuthClient(req);
  if (auth) {
    try {
      const sheets = google.sheets({ version: "v4", auth });
      await ensureHeaders(sheets);

      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "USUARIOS!A2:V2000",
      }).catch(() => null);

      const rows = res?.data?.values || [];
      let targetIndex = -1;

      if (user.idUsuario || user.usuario || user.email) {
        targetIndex = rows.findIndex((r: any) => {
          const rId = (r[0] || "").trim();
          const rEmail = (r[3] || "").toLowerCase().trim();
          const rUser = (r[5] || "").toLowerCase().trim();
          return (
            (user.idUsuario && rId === user.idUsuario) ||
            (user.email && rEmail === user.email.toLowerCase().trim()) ||
            (user.usuario && rUser === user.usuario.toLowerCase().trim())
          );
        });
      }

      if (targetIndex >= 0) {
        const rowNum = targetIndex + 2;
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `USUARIOS!A${rowNum}:V${rowNum}`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [rowValue] },
        });
      } else {
        await sheets.spreadsheets.values.append({
          spreadsheetId: SPREADSHEET_ID,
          range: "USUARIOS!A:V",
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [rowValue] },
        });
      }
    } catch (err: any) {
      console.error("Error writing User to Google Sheets API:", err.message);
    }
  }

  // Always sync to Google Apps Script Macro WebApp for real-time spreadsheet updates
  try {
    fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        action: "syncUser",
        type: "usuario",
        sheet: "USUARIOS",
        ...user,
        rol: normalizedRol,
        values: rowValue,
      }),
    }).catch((e) => console.log("Apps Script user sync note:", e.message));
  } catch (e) {}
}

// CENTRAL AUTHENTICATION & USER MANAGEMENT API ROUTES

// POST /api/auth/login - Central User Login
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Usuario y contraseña requeridos." });
  }

  const uInput = String(username).trim().toLowerCase();
  const pInput = String(password).trim();

  const allUsers = await getCentralUsers(req);

  const matchedUser = allUsers.find((u) => {
    const uName = (u.usuario || "").trim().toLowerCase();
    const uEmail = (u.email || "").trim().toLowerCase();
    const uId = (u.idUsuario || "").trim().toLowerCase();
    const uSocio = (u.idSocio || "").trim().toLowerCase();

    return uName === uInput || uEmail === uInput || uId === uInput || uSocio === uInput;
  });

  if (!matchedUser) {
    // Backwards compatibility check with Socios table
    const socios = currentStore.socios || [];
    const matchedSocio = socios.find((s) => {
      const sCode = (s.userCode || s.codigoAsignado || "").trim().toLowerCase();
      const sEmail = (s.email || "").trim().toLowerCase();
      const sRuc = (s.rucCedula || "").trim().toLowerCase();
      return (sCode === uInput || sEmail === uInput || sRuc === uInput) && s.password && s.password.trim() === pInput;
    });

    if (matchedSocio) {
      const estadoSocio = (matchedSocio.estado || "Activo").toUpperCase();
      if (estadoSocio.includes("PENDIENTE")) {
        return res.status(403).json({
          success: false,
          code: "PENDIENTE_VALIDACION",
          message: "Su usuario se encuentra PENDIENTE DE VALIDACIÓN por Gerencia General. No tiene acceso permitido hasta ser validado.",
        });
      }
      if (estadoSocio.includes("INACTIV")) {
        return res.status(403).json({
          success: false,
          code: "INACTIVO",
          message: "Su usuario se encuentra INACTIVO. Póngase en contacto con Gerencia General.",
        });
      }
      if (estadoSocio.includes("BLOQUE")) {
        return res.status(403).json({
          success: false,
          code: "BLOQUEADO",
          message: "Su usuario se encuentra BLOQUEADO.",
        });
      }

      // Convert socio entry to central user in USUARIOS tab
      const convertedUser = {
        idUsuario: `USR-${Date.now()}`,
        nombre: matchedSocio.nombreApellido || matchedSocio.nombre || "Socio Registrado",
        apellido: "",
        email: matchedSocio.email || "",
        telefono: matchedSocio.telefono || "",
        usuario: matchedSocio.userCode || matchedSocio.email || `user_${Date.now()}`,
        passwordHash: hashPassword(pInput),
        rol: matchedSocio.role || "admin1",
        idSocio: matchedSocio.userCode || matchedSocio.codigoAsignado || "",
        estado: "ACTIVO",
        creadoPor: matchedSocio.registradoPor || "Gerencia",
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
        ultimoAcceso: new Date().toISOString(),
        validadoPor: "Gerencia General",
        fechaValidacion: new Date().toISOString(),
      };
      await syncUserToGoogleSheets(req, convertedUser);

      return res.json({
        success: true,
        user: {
          idUsuario: convertedUser.idUsuario,
          nombre: convertedUser.nombre,
          apellido: convertedUser.apellido,
          email: convertedUser.email,
          telefono: convertedUser.telefono,
          usuario: convertedUser.usuario,
          rol: convertedUser.rol,
          idSocio: convertedUser.idSocio,
          estado: convertedUser.estado,
        },
      });
    }

    return res.status(401).json({ success: false, message: "Credenciales no válidas. Verifique usuario y contraseña." });
  }

  // Check User Status
  const estado = (matchedUser.estado || "ACTIVO").toUpperCase();
  if (estado === "PENDIENTE_VALIDACION" || estado === "PENDIENTE") {
    return res.status(403).json({
      success: false,
      code: "PENDIENTE_VALIDACION",
      message: "Su usuario se encuentra PENDIENTE DE VALIDACIÓN por Gerencia General. Un administrador debe autorizar su acceso.",
    });
  }
  if (estado === "INACTIVO") {
    return res.status(403).json({
      success: false,
      code: "INACTIVO",
      message: "Su usuario se encuentra INACTIVO. Póngase en contacto con Gerencia General.",
    });
  }
  if (estado === "BLOQUEADO") {
    return res.status(403).json({
      success: false,
      code: "BLOQUEADO",
      message: "Su usuario se encuentra BLOQUEADO.",
    });
  }

  // Verify password hash
  const isValidPass = verifyPassword(pInput, matchedUser.passwordHash);
  if (!isValidPass) {
    return res.status(401).json({ success: false, message: "Credenciales no válidas. Contraseña incorrecta." });
  }

  // Update ultimoAcceso
  matchedUser.ultimoAcceso = new Date().toISOString();
  await syncUserToGoogleSheets(req, matchedUser);

  // Return sanitized user object
  res.json({
    success: true,
    user: {
      idUsuario: matchedUser.idUsuario,
      nombre: matchedUser.nombre,
      apellido: matchedUser.apellido,
      email: matchedUser.email,
      telefono: matchedUser.telefono,
      usuario: matchedUser.usuario,
      rol: matchedUser.rol,
      idSocio: matchedUser.idSocio,
      estado: matchedUser.estado,
    },
  });
});

// POST /api/auth/register - Register new central user
app.post("/api/auth/register", async (req, res) => {
  const {
    nombre,
    apellido,
    email,
    telefono,
    usuario,
    password,
    rol,
    idSocio,
    createdByRole,
    createdByName,
  } = req.body || {};

  if (!nombre || !email || !password) {
    return res.status(400).json({ success: false, message: "Nombre, email y contraseña son obligatorios." });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanUser = usuario ? String(usuario).trim().toLowerCase() : cleanEmail.split("@")[0];

  const allUsers = await getCentralUsers(req);

  const exists = allUsers.some(
    (u) => (u.email || "").toLowerCase().trim() === cleanEmail || (u.usuario || "").toLowerCase().trim() === cleanUser
  );

  if (exists) {
    return res.status(400).json({
      success: false,
      message: "El correo electrónico o nombre de usuario ya se encuentra registrado en el repositorio central.",
    });
  }

  const isCreatedByGerencia =
    (createdByRole || "").toLowerCase() === "gerencia" || (createdByName || "").toLowerCase().includes("gerencia");

  const nowIso = new Date().toISOString();
  const newUserId = `USR-${Date.now()}`;
  const initialStatus = isCreatedByGerencia ? "ACTIVO" : "PENDIENTE_VALIDACION";

  const newUser = {
    idUsuario: newUserId,
    nombre: String(nombre).trim(),
    apellido: apellido ? String(apellido).trim() : "",
    email: cleanEmail,
    telefono: telefono ? String(telefono).trim() : "",
    usuario: cleanUser,
    passwordHash: hashPassword(String(password).trim()),
    rol: rol || "admin1",
    idSocio: idSocio ? String(idSocio).trim() : "",
    estado: initialStatus,
    creadoPor: createdByName || (isCreatedByGerencia ? "Gerencia General" : "Registro de Socio"),
    fechaCreacion: nowIso,
    fechaActualizacion: nowIso,
    ultimoAcceso: "",
    validadoPor: isCreatedByGerencia ? (createdByName || "Gerencia General") : "",
    fechaValidacion: isCreatedByGerencia ? nowIso : "",
  };

  await syncUserToGoogleSheets(req, newUser);

  res.json({
    success: true,
    message: isCreatedByGerencia
      ? "Usuario creado y habilitado exitosamente por Gerencia."
      : "Usuario registrado con éxito. Su cuenta queda en estado PENDIENTE_VALIDACION y requiere aprobación de Gerencia.",
    user: {
      idUsuario: newUser.idUsuario,
      nombre: newUser.nombre,
      apellido: newUser.apellido,
      email: newUser.email,
      telefono: newUser.telefono,
      usuario: newUser.usuario,
      rol: newUser.rol,
      idSocio: newUser.idSocio,
      estado: newUser.estado,
      creadoPor: newUser.creadoPor,
      fechaCreacion: newUser.fechaCreacion,
    },
  });
});

// GET /api/users - Fetch central user repository
app.get("/api/users", async (req, res) => {
  try {
    const allUsers = await getCentralUsers(req);
    const sanitized = allUsers.map((u) => {
      const { passwordHash, ...rest } = u;
      return rest;
    });
    res.json({ success: true, data: sanitized });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Error al obtener usuarios: " + err.message });
  }
});

// POST /api/users/status - Update user status (Gerencia action)
app.post("/api/users/status", async (req, res) => {
  const { idUsuario, nuevoEstado, validadoPor } = req.body || {};
  if (!idUsuario || !nuevoEstado) {
    return res.status(400).json({ success: false, message: "ID de usuario y nuevo estado requeridos." });
  }

  const allUsers = await getCentralUsers(req);
  const targetUser = allUsers.find(
    (u) =>
      u.idUsuario === idUsuario ||
      (u.usuario && u.usuario.toLowerCase() === String(idUsuario).toLowerCase()) ||
      (u.email && u.email.toLowerCase() === String(idUsuario).toLowerCase())
  );

  if (!targetUser) {
    return res.status(404).json({ success: false, message: "Usuario no encontrado." });
  }

  const previousStatus = targetUser.estado;
  const nowIso = new Date().toISOString();

  targetUser.estado = nuevoEstado;
  targetUser.fechaActualizacion = nowIso;

  if (nuevoEstado === "ACTIVO" && previousStatus === "PENDIENTE_VALIDACION") {
    targetUser.validadoPor = validadoPor || "David Santander (Gerencia)";
    targetUser.fechaValidacion = nowIso;
  }

  await syncUserToGoogleSheets(req, targetUser);

  res.json({
    success: true,
    message: `Estado de usuario actualizado a ${nuevoEstado} exitosamente.`,
    data: targetUser,
  });
});

// POST /api/users/update - Update user details (Gerencia action)
app.post("/api/users/update", async (req, res) => {
  const { idUsuario, nombre, apellido, email, telefono, rol, idSocio, password, estado } = req.body || {};
  if (!idUsuario) {
    return res.status(400).json({ success: false, message: "ID de usuario requerido." });
  }

  const allUsers = await getCentralUsers(req);
  const targetUser = allUsers.find((u) => u.idUsuario === idUsuario);

  if (!targetUser) {
    return res.status(404).json({ success: false, message: "Usuario no encontrado." });
  }

  if (nombre) targetUser.nombre = String(nombre).trim();
  if (apellido !== undefined) targetUser.apellido = String(apellido).trim();
  if (email) targetUser.email = String(email).trim().toLowerCase();
  if (telefono !== undefined) targetUser.telefono = String(telefono).trim();
  if (rol) targetUser.rol = String(rol).trim();
  if (idSocio !== undefined) targetUser.idSocio = String(idSocio).trim();
  if (estado) targetUser.estado = String(estado).trim();
  if (password) targetUser.passwordHash = hashPassword(String(password).trim());

  targetUser.fechaActualizacion = new Date().toISOString();

  await syncUserToGoogleSheets(req, targetUser);

  res.json({
    success: true,
    message: "Usuario actualizado correctamente.",
    data: targetUser,
  });
});

// Health & Status endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", spreadsheetId: SPREADSHEET_ID });
});

app.get("/api/sheets/config", (req, res) => {
  const auth = getOAuthClient(req);
  res.json({
    spreadsheetId: SPREADSHEET_ID,
    hasAuth: !!auth,
    sheetUrl: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`,
  });
});

// GET /api/permissions - Get tab permissions matrix
app.get("/api/permissions", (req, res) => {
  res.json({ success: true, data: currentStore.permissionsMap || null });
});

// POST /api/permissions - Save tab permissions matrix
app.post("/api/permissions", (req, res) => {
  const { permissionsMap } = req.body || {};
  if (permissionsMap && typeof permissionsMap === "object") {
    currentStore.permissionsMap = permissionsMap;
    saveDataStore(currentStore);

    // Forward to Apps Script
    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "updatePermissions", permissionsMap }),
      }).catch((e) => console.log("Apps Script permissions note:", e.message));
    } catch (e) {}
  }
  res.json({ success: true, data: currentStore.permissionsMap });
});

// GET /api/sheets/accesos - Get login/access logs
app.get("/api/sheets/accesos", (req, res) => {
  res.json({ success: true, data: currentStore.accesos || [] });
});

// POST /api/sheets/accesos - Register a new access validation event
app.post("/api/sheets/accesos", async (req, res) => {
  const acceso = req.body || {};
  const record = {
    id: acceso.id || `acc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    fechaHora: acceso.fechaHora || new Date().toISOString(),
    userCode: acceso.userCode || acceso.codigoSocio || "",
    userName: acceso.userName || acceso.nombre || "Usuario",
    userEmail: acceso.userEmail || acceso.email || "",
    userRole: acceso.userRole || acceso.role || "admin1",
    tipoAcceso: acceso.tipoAcceso || "Ingreso al Sistema",
    ipNavegador: acceso.ipNavegador || "Navegador Web",
  };

  if (!Array.isArray(currentStore.accesos)) {
    currentStore.accesos = [];
  }
  currentStore.accesos.unshift(record);
  if (currentStore.accesos.length > 500) {
    currentStore.accesos = currentStore.accesos.slice(0, 500);
  }
  saveDataStore(currentStore);

  // Forward to Apps Script
  try {
    fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ action: "addAcceso", type: "acceso", ...record }),
    }).catch((e) => console.log("Apps Script acceso note:", e.message));
  } catch (e) {}

  res.json({ success: true, data: record });
});

// GET /api/sheets/socios - Get all registered socios (combines Google Sheets & Server DB)
app.get("/api/sheets/socios", async (req, res) => {
  const auth = getOAuthClient(req);

  let sheetSocios: any[] = [];
  if (auth) {
    try {
      const sheets = google.sheets({ version: "v4", auth });
      await ensureHeaders(sheets);

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "Socios!A2:J1000",
      });

      const rows = response.data.values || [];
      sheetSocios = rows.map((row: any, idx: number) => ({
        id: `sheet-socio-${idx + 1}`,
        fechaRegistro: row[0] || "",
        userCode: row[1] || "",
        nombreApellido: row[2] || "",
        rucCedula: row[3] || "",
        email: row[4] || "",
        telefono: row[5] || "",
        role: getRoleDisplayName(row[6] || "admin1"),
        codigoAsignado: row[1] || "",
        registradoPor: row[7] || "Gerencia",
        referidoPor: row[7] || "Gerencia",
        estado: row[8] || "Activo",
        password: row[9] || "",
      }));
    } catch (error: any) {
      console.error("Error reading Socios from Google Sheets:", error.message);
    }
  }

  const deletedKeys = currentStore.deletedKeys || [];
  const deletedSet = new Set(deletedKeys.map((k) => k.toLowerCase().trim()));

  // Merge server store with sheetSocios (avoid duplicates by email or userCode)
  const mergedMap = new Map<string, any>();
  sheetSocios.forEach((s) => {
    const code = (s.userCode || s.codigoAsignado || "").toLowerCase().trim();
    const email = (s.email || "").toLowerCase().trim();
    const ruc = (s.rucCedula || "").trim();
    if ((code && deletedSet.has(code)) || (email && deletedSet.has(email)) || (ruc && deletedSet.has(ruc))) return;

    const key = (s.userCode || s.email || s.id).toLowerCase().trim();
    if (key) mergedMap.set(key, s);
  });

  currentStore.socios.forEach((s) => {
    const code = (s.userCode || s.codigoAsignado || "").toLowerCase().trim();
    const email = (s.email || "").toLowerCase().trim();
    const ruc = (s.rucCedula || "").trim();
    if ((code && deletedSet.has(code)) || (email && deletedSet.has(email)) || (ruc && deletedSet.has(ruc))) return;

    const key = (s.userCode || s.email || s.id).toLowerCase().trim();
    if (key && !mergedMap.has(key)) mergedMap.set(key, s);
  });

  const allSocios = Array.from(mergedMap.values());
  res.json({ success: true, source: auth ? "google_sheets_and_server" : "server_db", data: allSocios });
});

// POST /api/sheets/check-duplicate - Pre-check duplicates before saving to USUARIOS or SOCIOS
app.post("/api/sheets/check-duplicate", async (req, res) => {
  const { target, cedula, telefono, email, usuario, excludeCode, excludeEmail } = req.body || {};

  const cleanRuc = (cedula || "").toString().replace(/\s+/g, "").toLowerCase().trim();
  const cleanTel = (telefono || "").toString().replace(/\s+/g, "").toLowerCase().trim();
  const cleanEmail = (email || "").toString().toLowerCase().trim();
  const cleanUser = (usuario || "").toString().toLowerCase().trim();
  const cleanExCode = (excludeCode || "").toString().toLowerCase().trim();
  const cleanExEmail = (excludeEmail || "").toString().toLowerCase().trim();

  if (!cleanRuc && !cleanTel && !cleanEmail && !cleanUser) {
    return res.json({ isDuplicate: false });
  }

  if (target === "USUARIOS") {
    const allUsers = await getCentralUsers(req);
    for (const u of allUsers) {
      const uEmail = (u.email || "").toLowerCase().trim();
      const uTel = (u.telefono || "").replace(/\s+/g, "").toLowerCase().trim();
      const uUser = (u.usuario || "").toLowerCase().trim();
      const uRuc = (u.rucCedula || u.idSocio || "").replace(/\s+/g, "").toLowerCase().trim();
      const uIdSocio = (u.idSocio || u.idUsuario || "").toLowerCase().trim();

      if (cleanExCode && (uIdSocio === cleanExCode || uUser === cleanExCode)) continue;
      if (cleanExEmail && uEmail === cleanExEmail) continue;

      if (cleanEmail && uEmail && uEmail === cleanEmail) {
        return res.json({
          isDuplicate: true,
          field: "Correo electrónico",
          value: uEmail,
          sheet: "USUARIOS",
          message: `Ya existe un usuario registrado con el correo "${uEmail}" en la pestaña USUARIOS de Google Sheets.`,
        });
      }
      if (cleanTel && uTel && uTel === cleanTel) {
        return res.json({
          isDuplicate: true,
          field: "Teléfono",
          value: uTel,
          sheet: "USUARIOS",
          message: `Ya existe un usuario registrado con el teléfono "${uTel}" en la pestaña USUARIOS de Google Sheets.`,
        });
      }
      if (cleanUser && uUser && uUser === cleanUser) {
        return res.json({
          isDuplicate: true,
          field: "Nombre de usuario",
          value: uUser,
          sheet: "USUARIOS",
          message: `Ya existe un usuario registrado con el nombre de usuario "${uUser}" en la pestaña USUARIOS de Google Sheets.`,
        });
      }
      if (cleanRuc && uRuc && uRuc === cleanRuc) {
        return res.json({
          isDuplicate: true,
          field: "Cédula / RUC",
          value: uRuc,
          sheet: "USUARIOS",
          message: `Ya existe un usuario registrado con la Cédula/RUC "${uRuc}" en la pestaña USUARIOS de Google Sheets.`,
        });
      }
    }
  } else if (target === "SOCIOS") {
    const auth = getOAuthClient(req);
    let sheetSocios: any[] = [];
    if (auth) {
      try {
        const sheets = google.sheets({ version: "v4", auth });
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: "Socios!A2:J1000",
        }).catch(() => null);
        const rows = response?.data?.values || [];
        sheetSocios = rows.map((r: any) => ({
          userCode: r[1] || "",
          nombreApellido: r[2] || "",
          rucCedula: r[3] || "",
          email: r[4] || "",
          telefono: r[5] || "",
          role: r[6] || "",
          password: r[9] || "",
        }));
      } catch (e) {}
    }

    const allSocios = [...(currentStore.socios || []), ...sheetSocios];

    for (const s of allSocios) {
      const sEmail = (s.email || "").toLowerCase().trim();
      const sTel = (s.telefono || "").replace(/\s+/g, "").toLowerCase().trim();
      const sRuc = (s.rucCedula || "").replace(/\s+/g, "").toLowerCase().trim();
      const sCode = (s.userCode || s.codigoAsignado || s.code || "").toLowerCase().trim();
      const sUser = (s.usuario || "").toLowerCase().trim();

      if (cleanExCode && sCode === cleanExCode) continue;
      if (cleanExEmail && sEmail === cleanExEmail) continue;

      if (cleanEmail && sEmail && sEmail === cleanEmail) {
        return res.json({
          isDuplicate: true,
          field: "Correo electrónico",
          value: sEmail,
          sheet: "SOCIOS",
          message: `Ya existe un socio registrado con el correo "${sEmail}" en la pestaña SOCIOS de Google Sheets.`,
        });
      }
      if (cleanTel && sTel && sTel === cleanTel) {
        return res.json({
          isDuplicate: true,
          field: "Teléfono",
          value: sTel,
          sheet: "SOCIOS",
          message: `Ya existe un socio registrado con el teléfono "${sTel}" en la pestaña SOCIOS de Google Sheets.`,
        });
      }
      if (cleanRuc && sRuc && sRuc === cleanRuc) {
        return res.json({
          isDuplicate: true,
          field: "Cédula / RUC",
          value: sRuc,
          sheet: "SOCIOS",
          message: `Ya existe un socio registrado con la Cédula/RUC "${sRuc}" en la pestaña SOCIOS de Google Sheets.`,
        });
      }
      if (cleanUser && ((sUser && sUser === cleanUser) || (sCode && sCode === cleanUser))) {
        return res.json({
          isDuplicate: true,
          field: "Nombre de usuario / Código",
          value: cleanUser,
          sheet: "SOCIOS",
          message: `Ya existe un socio registrado con el nombre de usuario/código "${cleanUser}" en la pestaña SOCIOS de Google Sheets.`,
        });
      }
    }
  }

  return res.json({ isDuplicate: false });
});

// POST /api/sheets/usuarios - Create / sync user to USUARIOS tab in Google Sheets
app.post("/api/sheets/usuarios", async (req, res) => {
  try {
    const userPayload = req.body || {};
    if (!userPayload.email && !userPayload.usuario) {
      return res.status(400).json({ success: false, message: "Correo o usuario requeridos." });
    }

    const cleanUser = {
      idUsuario: userPayload.idUsuario || `USR-${Date.now()}`,
      nombre: userPayload.nombre || userPayload.nombreApellido || "",
      apellido: userPayload.apellido || "",
      email: (userPayload.email || "").toLowerCase().trim(),
      telefono: userPayload.telefono || "",
      usuario: (userPayload.usuario || userPayload.nombreUsuario || userPayload.email || "").toLowerCase().trim(),
      passwordHash: hashPassword(userPayload.password || userPayload.clave || "Clave123*"),
      rol: userPayload.rol || userPayload.role || "admin1",
      idSocio: userPayload.idSocio || userPayload.userCode || "",
      estado: userPayload.estado || "ACTIVO",
      creadoPor: userPayload.creadoPor || "Gerencia General",
      fechaCreacion: userPayload.fechaCreacion || new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      ultimoAcceso: userPayload.ultimoAcceso || "",
      validadoPor: userPayload.validadoPor || "Gerencia General",
      fechaValidacion: userPayload.fechaValidacion || new Date().toISOString(),
    };

    await syncUserToGoogleSheets(req, cleanUser);

    res.json({ success: true, message: "Usuario sincronizado correctamente a la pestaña USUARIOS.", data: cleanUser });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Error al sincronizar usuario: " + err.message });
  }
});

// POST /api/sheets/socios - Register / Sync a socio to Google Sheets and Server Store
app.post("/api/sheets/socios", async (req, res) => {
  const socio = req.body;
  if (!socio || (!socio.userCode && !socio.email)) {
    return res.status(400).json({ success: false, message: "Invalid socio data" });
  }

  const displayRole = getRoleDisplayName(socio.role);
  socio.role = displayRole;

  // Clean from deleted keys if re-registered
  const codeKey = (socio.userCode || socio.codigoAsignado || socio.email || "").toLowerCase().trim();
  const emailKey = (socio.email || "").toLowerCase().trim();
  const rucKey = (socio.rucCedula || "").trim();
  if (currentStore.deletedKeys && Array.isArray(currentStore.deletedKeys)) {
    currentStore.deletedKeys = currentStore.deletedKeys.filter(
      (k) => k !== codeKey && k !== emailKey && k !== rucKey
    );
  }

  // Save in server persistent store
  const socioCode = (socio.userCode || socio.codigoAsignado || "").toLowerCase().trim();
  const socioEmail = (socio.email || "").toLowerCase().trim();
  const socioRuc = (socio.rucCedula || "").toLowerCase().trim();
  const socioNombre = (socio.nombreApellido || socio.nombre || "").toLowerCase().trim();

  const existingIndex = currentStore.socios.findIndex((s) => {
    const sCode = (s.userCode || s.codigoAsignado || "").toLowerCase().trim();
    const sEmail = (s.email || "").toLowerCase().trim();
    const sRuc = (s.rucCedula || "").toLowerCase().trim();
    const sName = (s.nombreApellido || s.nombre || "").toLowerCase().trim();
    return (
      (socioCode && sCode === socioCode) ||
      (socioEmail && sEmail === socioEmail) ||
      (socioRuc && sRuc && sRuc === socioRuc) ||
      (socioNombre && sName && sName === socioNombre)
    );
  });

  let regName = socio.registradoPor || socio.referidoPor || socio.referidoPorAdmin;

  if (existingIndex >= 0) {
    const existing = currentStore.socios[existingIndex];
    if (!regName || regName === "Gerencia") {
      regName = existing.registradoPor || existing.referidoPor || existing.referidoPorAdmin || regName || "Gerencia";
    }
    currentStore.socios[existingIndex] = {
      ...existing,
      ...socio,
      registradoPor: regName,
      referidoPor: regName,
    };
  } else {
    if (!regName) regName = "Gerencia";
    socio.registradoPor = regName;
    socio.referidoPor = regName;
    currentStore.socios.unshift(socio);
  }
  saveDataStore(currentStore);

  const auth = getOAuthClient(req);
  if (auth) {
    try {
      const sheets = google.sheets({ version: "v4", auth });
      await ensureHeaders(sheets);

      // Check if row already exists to update it rather than appending duplicate
      const getRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "Socios!A2:J1000",
      }).catch(() => null);

      const rows = getRes?.data?.values || [];
      let targetRowIndex = -1;

      if (socioCode || socioEmail || socioRuc || socioNombre) {
        targetRowIndex = rows.findIndex((r: any) => {
          const rCode = (r[1] || "").toLowerCase().trim();
          const rName = (r[2] || "").toLowerCase().trim();
          const rRuc = (r[3] || "").toLowerCase().trim();
          const rEmail = (r[4] || "").toLowerCase().trim();
          return (
            (socioCode && rCode === socioCode) ||
            (socioEmail && rEmail === socioEmail) ||
            (socioRuc && rRuc && rRuc === socioRuc) ||
            (socioNombre && rName && rName === socioNombre)
          );
        });
      }

      if (targetRowIndex >= 0) {
        const existingRow = rows[targetRowIndex];
        const existingSheetReg = existingRow[7] || "";
        if (existingSheetReg && existingSheetReg !== "Gerencia" && (socio.registradoPor === "Gerencia" || !socio.registradoPor)) {
          regName = existingSheetReg;
        }
      }

      const rowValue = [
        socio.fechaRegistro || new Date().toISOString().split("T")[0],
        socio.userCode || socio.codigoAsignado || "",
        socio.nombreApellido || socio.nombre || "",
        socio.rucCedula || "",
        socio.email || "",
        socio.telefono || "",
        displayRole,
        regName,
        socio.estado || "Activo",
        socio.password || "",
        socio.banco || "",
        socio.tipoCuenta || "",
        socio.numeroCuenta || "",
        socio.titularCuenta || "",
        socio.cedulaTitular || "",
      ];

      if (targetRowIndex >= 0) {
        const rowNum = targetRowIndex + 2;
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `Socios!A${rowNum}:O${rowNum}`,
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [rowValue],
          },
        });
      } else {
        await sheets.spreadsheets.values.append({
          spreadsheetId: SPREADSHEET_ID,
          range: "Socios!A:O",
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [rowValue],
          },
        });
      }
    } catch (error: any) {
      console.error("Error writing Socio to Google Sheets API:", error.message);
    }
  }

  // Always send to Google Apps Script Macro WebApp for real-time spreadsheet updates
  try {
    const userCodeVal = (socio.userCode || socio.codigoAsignado || socio.code || "").toUpperCase().trim();
    fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        action: existingIndex >= 0 ? "updateSocio" : "addSocio",
        type: "socio",
        sheet: "SOCIOS",
        ...socio,
        userCode: userCodeVal,
        codigoAsignado: userCodeVal,
        role: displayRole,
        registradoPor: regName,
        referidoPor: regName,
        values: [
          socio.fechaRegistro || new Date().toISOString().split("T")[0],
          userCodeVal,
          socio.nombreApellido || socio.nombre || "",
          socio.rucCedula || "",
          socio.email || "",
          socio.telefono || "",
          displayRole,
          regName,
          socio.estado || "Activo",
          socio.password || "",
          socio.banco || "",
          socio.tipoCuenta || "",
          socio.numeroCuenta || "",
          socio.titularCuenta || "",
          socio.cedulaTitular || "",
        ],
      }),
    }).catch((e) => console.log("Note: Apps Script server socio forwarding:", e.message));

    // Synchronize to USUARIOS sheet as well for central authentication
    const userRoleKey = (displayRole.toLowerCase().includes("gerencia")) ? "gerencia" : "administrador";
    const userStatusKey = (socio.estado && String(socio.estado).toLowerCase().includes("inactiv"))
      ? "INACTIVO"
      : (socio.estado && String(socio.estado).toUpperCase().includes("PENDIENTE"))
      ? "PENDIENTE_VALIDACION"
      : "ACTIVO";

    await syncUserToGoogleSheets(req, {
      idUsuario: `USR-${userCodeVal || Date.now()}`,
      nombre: socio.nombreApellido || socio.nombre || "Socio Registrado",
      apellido: "",
      email: (socio.email || "").toLowerCase().trim(),
      telefono: socio.telefono || "",
      usuario: (socio.usuario || userCodeVal || socio.email || "").toLowerCase().trim(),
      passwordHash: socio.password || "Clave123*",
      password: socio.password || "Clave123*",
      rol: userRoleKey,
      idSocio: userCodeVal,
      estado: userStatusKey,
      rucCedula: socio.rucCedula || socio.cedulaRuc || "",
      cedula: socio.rucCedula || socio.cedulaRuc || "",
      banco: socio.banco || "",
      tipoCuenta: socio.tipoCuenta || "",
      numeroCuenta: socio.numeroCuenta || "",
      titularCuenta: socio.titularCuenta || "",
      cedulaTitular: socio.cedulaTitular || "",
      creadoPor: regName,
      fechaCreacion: socio.fechaRegistro || new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      ultimoAcceso: "",
      validadoPor: userStatusKey === "ACTIVO" ? regName : "",
      fechaValidacion: userStatusKey === "ACTIVO" ? new Date().toISOString() : "",
    });
  } catch (err: any) {
    console.log("Note: Apps Script server socio catch:", err.message);
  }

  res.json({ success: true, source: "synced", data: socio });
});

// POST /api/sheets/socios/delete - Delete a partner/socio completely
app.post("/api/sheets/socios/delete", async (req, res) => {
  const { userCode, email, rucCedula } = req.body;
  const codeKey = (userCode || "").toLowerCase().trim();
  const emailKey = (email || "").toLowerCase().trim();
  const rucKey = (rucCedula || "").trim();

  const currentStore = loadDataStore();
  if (!currentStore.deletedKeys) currentStore.deletedKeys = [];
  if (codeKey && !currentStore.deletedKeys.includes(codeKey)) currentStore.deletedKeys.push(codeKey);
  if (emailKey && !currentStore.deletedKeys.includes(emailKey)) currentStore.deletedKeys.push(emailKey);
  if (rucKey && !currentStore.deletedKeys.includes(rucKey)) currentStore.deletedKeys.push(rucKey);

  currentStore.socios = currentStore.socios.filter((s) => {
    const sCode = (s.userCode || s.codigoAsignado || "").toLowerCase().trim();
    const sEmail = (s.email || "").toLowerCase().trim();
    const sRuc = (s.rucCedula || "").trim();
    if (codeKey && sCode === codeKey) return false;
    if (emailKey && sEmail === emailKey) return false;
    if (rucKey && sRuc === rucKey) return false;
    return true;
  });
  saveDataStore(currentStore);

  const auth = getOAuthClient(req);
  if (auth) {
    try {
      const sheets = google.sheets({ version: "v4", auth });
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "Socios!A2:J1000",
      });
      const rows = response.data.values || [];
      const newRows = rows.filter((row: any) => {
        const rowCode = (row[1] || row[7] || "").toLowerCase().trim();
        const rowEmail = (row[4] || "").toLowerCase().trim();
        const rowRuc = (row[3] || "").trim();
        if (codeKey && rowCode === codeKey) return false;
        if (emailKey && rowEmail === emailKey) return false;
        if (rucKey && rowRuc === rucKey) return false;
        return true;
      });

      await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: "Socios!A2:J1000",
      });

      if (newRows.length > 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: "Socios!A2",
          valueInputOption: "USER_ENTERED",
          requestBody: { values: newRows },
        });
      }
    } catch (error: any) {
      console.error("Error deleting Socio from Google Sheets API:", error.message);
    }
  } else {
    // Forward delete action to Google Apps Script Macro WebApp when OAuth is not active
    try {
      const payload = { action: "delete", type: "socio", userCode, email, rucCedula };
      fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload),
      }).catch((e) => console.log("Apps Script delete socio note:", e.message));
    } catch (err: any) {
      console.log("Apps Script delete socio catch:", err.message);
    }
  }

  res.json({ success: true, message: "Socio eliminado por completo correctamente" });
});

// POST /api/sheets/reset-data - Reset/Flush all registered socios, sales, accesses, users, movement history and redemptions
app.post("/api/sheets/reset-data", (req, res) => {
  currentStore = {
    socios: [],
    ventas: [],
    accesos: [],
    permissionsMap: null,
    deletedKeys: [],
    baseSociosCount: 50,
    usuarios: [],
  };
  saveDataStore(currentStore);
  res.json({ success: true, message: "Todos los accesos, socios, ventas, historial y canjes han sido eliminados correctamente" });
});

// GET /api/sheets/ventas - Get all registered sales
app.get("/api/sheets/ventas", async (req, res) => {
  const auth = getOAuthClient(req);

  let sheetVentas: any[] = [];
  if (auth) {
    try {
      const sheets = google.sheets({ version: "v4", auth });
      await ensureHeaders(sheets);

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "Ventas!A2:L2000",
      });

      const rows = response.data.values || [];
      sheetVentas = rows.map((row: any, idx: number) => {
        const sellerName = row[2] || row[7] || ""; // Col C is Socio / Usuario Registrado
        const clientName = row[7] || row[2] || ""; // Col H is CLIENTE
        return {
          id: row[1] || `sheet-venta-${idx + 1}`,
          fecha: row[0] || "",
          fechaRegistro: row[0] || "",
          vendedor: sellerName,
          socioNombre: sellerName,
          adminResponsable: sellerName,
          cedulaCliente: row[3] || "",
          producto: row[4] || "",
          nombreProducto: row[4] || "",
          cantidad: Number(row[5]) || 1,
          totalVenta: Number(row[6]) || 0,
          nombreCliente: clientName,
          clienteNombre: clientName,
          userEmail: row[8] || "",
          userCode: row[9] || "",
          userRole: row[10] || "admin1",
          estadoComision: row[11] || "Pendiente",
        };
      });
    } catch (error: any) {
      console.error("Error reading Ventas from Google Sheets:", error.message);
    }
  }

  const mergedVentasMap = new Map<string, any>();
  sheetVentas.forEach((v) => {
    const key = (v.id || `${v.fecha}-${v.nombreCliente}`).toLowerCase().trim();
    if (key) mergedVentasMap.set(key, v);
  });
  currentStore.ventas.forEach((v) => {
    const key = (v.id || `${v.fecha}-${v.nombreCliente}`).toLowerCase().trim();
    if (key && !mergedVentasMap.has(key)) mergedVentasMap.set(key, v);
  });

  const allVentas = Array.from(mergedVentasMap.values());
  res.json({ success: true, source: auth ? "google_sheets_and_server" : "server_db", data: allVentas });
});

// POST /api/sheets/ventas - Save / Sync a sale to Google Sheets and Server Store
app.post("/api/sheets/ventas", async (req, res) => {
  const venta = req.body;
  if (!venta) {
    return res.status(400).json({ success: false, message: "Invalid venta data" });
  }

  const ventaId = venta.id || `v-${Date.now()}`;
  const sellerName = venta.vendedor || venta.socioNombre || venta.adminResponsable || "";
  const clientName = venta.nombreCliente || venta.clienteNombre || "";

  const updatedVenta = {
    ...venta,
    id: ventaId,
    vendedor: sellerName,
    socioNombre: sellerName,
    adminResponsable: sellerName,
    nombreCliente: clientName,
    clienteNombre: clientName,
  };

  const existingIndex = currentStore.ventas.findIndex((v) => v.id === ventaId);
  if (existingIndex >= 0) {
    currentStore.ventas[existingIndex] = { ...currentStore.ventas[existingIndex], ...updatedVenta };
  } else {
    currentStore.ventas.unshift(updatedVenta);
  }
  saveDataStore(currentStore);

  const auth = getOAuthClient(req);
  if (auth) {
    try {
      const sheets = google.sheets({ version: "v4", auth });
      await ensureHeaders(sheets);

      const rowValue = [
        venta.fecha || venta.fechaRegistro || new Date().toLocaleDateString("es-EC"), // Col A: FECHA
        ventaId, // Col B: Código Utilizado / ID
        sellerName, // Col C: Socio / Usuario Registrado
        venta.cedulaCliente || venta.cedula || "", // Col D: RUC / Cédula
        venta.producto || venta.nombreProducto || venta.plan || "", // Col E: PLAN
        venta.cantidad || 1, // Col F: CANTIDAD
        venta.totalVenta || 0, // Col G: VALOR
        clientName, // Col H: CLIENTE
        venta.userEmail || "", // Col I: CORREO
        venta.userCode || "", // Col J: Código Utilizado
        venta.userRole || "", // Col K: NIVEL
        venta.estadoComision || "Pendiente", // Col L: ESTADO
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: "Ventas!A:L",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [rowValue],
        },
      });
    } catch (error: any) {
      console.error("Error appending Venta to Google Sheets:", error.message);
    }
  } else {
    // Forward to Google Apps Script Macro WebApp asynchronously when OAuth is not active
    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ type: "venta", ...updatedVenta, socioNombre: sellerName, vendedor: sellerName, nombreCliente: clientName }),
      }).catch((e) => console.log("Note: Apps Script server venta forwarding:", e.message));
    } catch (err: any) {
      console.log("Note: Apps Script server venta catch:", err.message);
    }
  }

  res.json({ success: true, source: "synced", data: updatedVenta });
});

// POST /api/sheets/ventas/delete - Delete a sale completely from Google Sheets and server store
app.post("/api/sheets/ventas/delete", async (req, res) => {
  const { id } = req.body;
  const ventaId = id ? String(id).trim() : "";

  if (!ventaId) {
    return res.status(400).json({ success: false, message: "ID de venta requerido" });
  }

  currentStore.ventas = currentStore.ventas.filter((v) => String(v.id).trim() !== ventaId);
  saveDataStore(currentStore);

  const auth = getOAuthClient(req);
  if (auth) {
    try {
      const sheets = google.sheets({ version: "v4", auth });
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "Ventas!A2:L2000",
      });
      const rows = response.data.values || [];
      const newRows = rows.filter((row: any) => {
        const rowId = (row[1] || "").trim();
        return rowId !== ventaId;
      });

      await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: "Ventas!A2:L2000",
      });

      if (newRows.length > 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: "Ventas!A2",
          valueInputOption: "USER_ENTERED",
          requestBody: { values: newRows },
        });
      }
    } catch (error: any) {
      console.error("Error deleting Venta from Google Sheets API:", error.message);
    }
  } else {
    try {
      const payload = { action: "delete_venta", type: "delete_venta", id: ventaId, ventaId: ventaId };
      fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload),
      }).catch((e) => console.log("Apps Script delete venta note:", e.message));
    } catch (err: any) {
      console.log("Apps Script delete venta catch:", err.message);
    }
  }

  res.json({ success: true, message: "Venta eliminada por completo correctamente" });
});

// GET /api/news/base-socios - Get custom base socios count
app.get("/api/news/base-socios", (req, res) => {
  const store = loadDataStore();
  const baseCount = typeof store.baseSociosCount === "number" ? store.baseSociosCount : 75;
  res.json({ baseCount });
});

// POST /api/news/base-socios - Update custom base socios count
app.post("/api/news/base-socios", (req, res) => {
  const { baseCount } = req.body;
  if (typeof baseCount === "number" && !isNaN(baseCount) && baseCount >= 0) {
    currentStore.baseSociosCount = Math.round(baseCount);
    saveDataStore(currentStore);
    return res.json({ success: true, baseCount: currentStore.baseSociosCount });
  }
  res.status(400).json({ error: "Invalid baseCount parameter" });
});

// GET /brochures/:filename - Direct PDF serving with proper headers
app.get("/brochures/:filename", (req, res) => {
  try {
    const rawFilename = req.params.filename;
    const decodedFilename = decodeURIComponent(rawFilename);
    const safeFilename = path.basename(decodedFilename);
    let filePath = path.join(process.cwd(), "public", "brochures", safeFilename);

    if (!fs.existsSync(filePath)) {
      const nfcPath = path.join(process.cwd(), "public", "brochures", safeFilename.normalize("NFC"));
      const nfdPath = path.join(process.cwd(), "public", "brochures", safeFilename.normalize("NFD"));
      if (fs.existsSync(nfcPath)) filePath = nfcPath;
      else if (fs.existsSync(nfdPath)) filePath = nfdPath;
      else {
        return res.status(404).send("Brochure no encontrado");
      }
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${safeFilename.replace(/"/g, '')}"; filename*=UTF-8''${encodeURIComponent(safeFilename)}`);
    res.sendFile(filePath);
  } catch (err) {
    console.error("Error serving brochure:", err);
    res.status(500).send("Error al procesar el archivo");
  }
});

// GET /api/brochures/download/:filename - Force download attachment
app.get("/api/brochures/download/:filename", (req, res) => {
  try {
    const rawFilename = req.params.filename;
    const decodedFilename = decodeURIComponent(rawFilename);
    const safeFilename = path.basename(decodedFilename);
    let filePath = path.join(process.cwd(), "public", "brochures", safeFilename);

    if (!fs.existsSync(filePath)) {
      const nfcPath = path.join(process.cwd(), "public", "brochures", safeFilename.normalize("NFC"));
      const nfdPath = path.join(process.cwd(), "public", "brochures", safeFilename.normalize("NFD"));
      if (fs.existsSync(nfcPath)) filePath = nfcPath;
      else if (fs.existsSync(nfdPath)) filePath = nfdPath;
      else {
        return res.status(404).json({ error: "Brochure no encontrado" });
      }
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeFilename.replace(/"/g, '')}"; filename*=UTF-8''${encodeURIComponent(safeFilename)}`);
    res.sendFile(filePath);
  } catch (err) {
    console.error("Error downloading brochure:", err);
    res.status(500).json({ error: "Error al descargar el archivo" });
  }
});

async function startServer() {
  // Explicitly serve public folder assets (artes, logos, icons)
  app.use(express.static(path.join(process.cwd(), "public")));

  // Serve static or Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

