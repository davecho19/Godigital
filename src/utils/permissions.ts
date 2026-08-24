export interface TabPermissionConfig {
  // Main tabs
  empresa: boolean;
  noticias: boolean;
  beneficios?: boolean;
  planes_fichas: boolean;
  comercial: boolean;
  kpier: boolean;
  mlm: boolean;
  distribucion_firmas: boolean;
  plataforma_prueba?: boolean;
  arte_visual?: boolean;
  soporte: boolean;
  dashboard: boolean;
  socios_registrados?: boolean;
  ventas_socios?: boolean;

  // Subtabs Empresa (Información Institucional ANF AC y UpConta)
  sub_empresa_anf: boolean;
  sub_empresa_upconta: boolean;

  // Subtabs Soporte (Canales de Atención UpConta y ANF AC)
  sub_soporte_upconta: boolean;
  sub_soporte_anf: boolean;

  // Subtabs Planes & Fichas
  sub_planes_facturacion: boolean;
  sub_planes_erp: boolean;
  sub_planes_contador: boolean;
  sub_planes_firmas: boolean;
  sub_planes_explorador: boolean;

  // Subtabs Comercial
  sub_comercial_simulador: boolean;
  sub_comercial_comision: boolean;
  sub_comercial_arte_visual: boolean;

  // Subtabs KPIer
  sub_kpier_comisiones_sistema: boolean;
  sub_kpier_comisiones_firmas: boolean;
  sub_kpier_comisiones?: boolean;
  sub_kpier_registro_ventas?: boolean;
  sub_kpier_registro_socios?: boolean;
}

export type DistributorType = "total" | "sistemas" | "firmas";

export interface RolePermissions {
  distributorType: DistributorType;
  permissions: TabPermissionConfig;
}

export type PermissionsMap = Record<string, RolePermissions>;

const LOCAL_STORAGE_PERMISSIONS_KEY = "kpier_tab_permissions_v5";

export const DEFAULT_PERMISSIONS_SISTEMAS: TabPermissionConfig = {
  empresa: true,
  noticias: false,
  planes_fichas: true,
  comercial: true,
  arte_visual: true,
  kpier: true,
  mlm: false,
  distribucion_firmas: false,
  plataforma_prueba: true,
  soporte: false,
  dashboard: false,

  sub_empresa_anf: false,
  sub_empresa_upconta: true,

  sub_soporte_upconta: false,
  sub_soporte_anf: false,

  sub_planes_facturacion: true,
  sub_planes_erp: true,
  sub_planes_contador: true,
  sub_planes_firmas: false,
  sub_planes_explorador: true,

  sub_comercial_simulador: true,
  sub_comercial_comision: true,
  sub_comercial_arte_visual: true,

  sub_kpier_comisiones_sistema: true,
  sub_kpier_comisiones_firmas: false,
  sub_kpier_comisiones: true,
};

export const DEFAULT_PERMISSIONS_FIRMAS: TabPermissionConfig = {
  empresa: true,
  noticias: false,
  planes_fichas: true,
  comercial: false,
  arte_visual: false,
  kpier: true,
  mlm: false,
  distribucion_firmas: true,
  plataforma_prueba: false,
  soporte: false,
  dashboard: false,

  sub_empresa_anf: true,
  sub_empresa_upconta: false,

  sub_soporte_upconta: false,
  sub_soporte_anf: false,

  sub_planes_facturacion: false,
  sub_planes_erp: false,
  sub_planes_contador: false,
  sub_planes_firmas: true,
  sub_planes_explorador: false,

  sub_comercial_simulador: false,
  sub_comercial_comision: true,
  sub_comercial_arte_visual: false,

  sub_kpier_comisiones_sistema: false,
  sub_kpier_comisiones_firmas: true,
  sub_kpier_comisiones: true,
};

export const DEFAULT_PERMISSIONS_TOTAL: TabPermissionConfig = {
  empresa: true,
  noticias: false,
  planes_fichas: true,
  comercial: true,
  arte_visual: true,
  kpier: true,
  mlm: true,
  distribucion_firmas: true,
  plataforma_prueba: true,
  soporte: false,
  dashboard: false,

  sub_empresa_anf: true,
  sub_empresa_upconta: true,

  sub_soporte_upconta: false,
  sub_soporte_anf: false,

  sub_planes_facturacion: true,
  sub_planes_erp: true,
  sub_planes_contador: true,
  sub_planes_firmas: true,
  sub_planes_explorador: true,

  sub_comercial_simulador: true,
  sub_comercial_comision: true,
  sub_comercial_arte_visual: true,

  sub_kpier_comisiones_sistema: true,
  sub_kpier_comisiones_firmas: true,
  sub_kpier_comisiones: true,
};

export const DEFAULT_ROLE_PERMISSIONS: PermissionsMap = {
  admin: {
    distributorType: "total",
    permissions: { ...DEFAULT_PERMISSIONS_TOTAL },
  },
  admin1: {
    distributorType: "total",
    permissions: { ...DEFAULT_PERMISSIONS_TOTAL },
  },
  admin2: {
    distributorType: "total",
    permissions: { ...DEFAULT_PERMISSIONS_TOTAL },
  },
  gerencia: {
    distributorType: "total",
    permissions: {
      ...DEFAULT_PERMISSIONS_TOTAL,
      dashboard: true,
      noticias: true,
      soporte: true,
      sub_soporte_upconta: true,
      sub_soporte_anf: true,
      planes_fichas: false,
      comercial: false,
      kpier: false,
      mlm: false,
      distribucion_firmas: false,
    },
  },
};

export function getPermissionsMap(): PermissionsMap {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PERMISSIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        const baseAdmin = parsed.admin || parsed.admin1 || DEFAULT_ROLE_PERMISSIONS.admin;
        return {
          ...parsed,
          admin: baseAdmin,
          admin1: baseAdmin,
          admin2: baseAdmin,
          gerencia: parsed.gerencia || DEFAULT_ROLE_PERMISSIONS.gerencia,
        };
      }
    }
  } catch (e) {
    console.error("Error loading permissions map:", e);
  }
  return DEFAULT_ROLE_PERMISSIONS;
}

export function savePermissionsMap(map: PermissionsMap): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_PERMISSIONS_KEY, JSON.stringify(map));
    window.dispatchEvent(new Event("kpier_permissions_updated"));

    // Async sync to server store & Google Sheets
    fetch("/api/permissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissionsMap: map }),
    }).catch((e) => console.warn("Note saving permissions to remote server:", e));
  } catch (e) {
    console.warn("Error saving permissions map:", e);
  }
}

export async function syncPermissionsFromRemote(): Promise<void> {
  try {
    const response = await fetch("/api/permissions");
    if (!response.ok) return;
    const json = await response.json();
    if (json.success && json.data && typeof json.data === "object") {
      const remoteMap = json.data;
      const currentRaw = localStorage.getItem(LOCAL_STORAGE_PERMISSIONS_KEY);
      if (currentRaw !== JSON.stringify(remoteMap)) {
        localStorage.setItem(LOCAL_STORAGE_PERMISSIONS_KEY, JSON.stringify(remoteMap));
        window.dispatchEvent(new Event("kpier_permissions_updated"));
      }
    }
  } catch (e) {
    console.warn("Could not sync permissions from remote API:", e);
  }
}

export function getPermissionsForSocio(socioKeyOrRole: string, map?: PermissionsMap): TabPermissionConfig {
  const currentMap = map || getPermissionsMap();

  let perms: TabPermissionConfig;
  if (socioKeyOrRole && currentMap[socioKeyOrRole]?.permissions) {
    perms = { ...currentMap[socioKeyOrRole].permissions };
  } else {
    // Fallback to role key
    const roleObj = currentMap[socioKeyOrRole] || currentMap.admin || currentMap.admin1;
    perms = { ...(roleObj?.permissions || DEFAULT_ROLE_PERMISSIONS.admin.permissions) };
  }

  // Fallback defaults if missing in existing localStorage
  if (perms.sub_soporte_upconta === undefined) {
    perms.sub_soporte_upconta = perms.sub_empresa_upconta !== undefined ? perms.sub_empresa_upconta : true;
  }
  if (perms.sub_soporte_anf === undefined) {
    perms.sub_soporte_anf = perms.sub_empresa_anf !== undefined ? perms.sub_empresa_anf : true;
  }
  if (perms.sub_kpier_comisiones_sistema === undefined) {
    // If distributor type is firmas only, false, otherwise true
    const distType = (socioKeyOrRole && currentMap[socioKeyOrRole]?.distributorType) || "sistemas";
    perms.sub_kpier_comisiones_sistema = distType !== "firmas";
  }
  if (perms.sub_kpier_comisiones_firmas === undefined) {
    const distType = (socioKeyOrRole && currentMap[socioKeyOrRole]?.distributorType) || "sistemas";
    perms.sub_kpier_comisiones_firmas = distType === "firmas" || distType === "total";
  }

  return perms;
}

export function getPermissionsForDistributorType(type: DistributorType): TabPermissionConfig {
  if (type === "sistemas") return { ...DEFAULT_PERMISSIONS_SISTEMAS };
  if (type === "firmas") return { ...DEFAULT_PERMISSIONS_FIRMAS };
  return { ...DEFAULT_PERMISSIONS_TOTAL };
}
