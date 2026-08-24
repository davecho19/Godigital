export interface Plan {
  nombre: string;
  precio: number;
  precioAnual?: number;
  tier: string;
  modulos: string[];
  valor?: string;
  ruc?: number | string;
  iaasDedicado?: string;
  perfilEmpresa?: string;
  capacitacion?: string;
  migracion?: string;
  soporte?: string;
  comprobantes?: string;
  usuarios?: string;
  adicionales?: string[];
}

export const PLANES_DATA: Record<"facturacion" | "erp" | "contador", Plan[]> = {
  facturacion: [
    { nombre: "UP LIGHT", precio: 10.00, tier: "basico_sin_impuestos", modulos: ["70 Comprobantes", "1 Usuario", "App Móvil", "Soporte", "Capacitación", "Administrativo", "Catálogo de Productos", "Catálogo de Servicios"] },
    { nombre: "UP BASE", precio: 25.00, tier: "basico_sin_impuestos", modulos: ["500 Comprobantes", "5 Usuarios", "App Móvil", "Soporte", "Capacitación", "Administrativo", "Catálogo de Productos", "Catálogo de Servicios"] },
    { nombre: "UP POWER", precio: 55.00, tier: "basico_sin_impuestos", modulos: ["Comprobantes Ilimitados", "Usuarios Ilimitados", "App Móvil", "Soporte", "Capacitación", "Administrativo", "Catálogo de Productos", "Catálogo de Servicios"] },
    { nombre: "UP INICIAL", precio: 10.00, tier: "basico", modulos: ["20 Comprobantes", "1 Usuario", "App Móvil", "Soporte", "Capacitación", "Administrativo", "Impuestos", "Producción"] },
    { nombre: "UP INTERMEDIO", precio: 15.00, tier: "basico", modulos: ["60 Comprobantes", "1 Usuario", "App Móvil", "Soporte", "Capacitación", "Administrativo", "Impuestos", "Producción"] },
    { nombre: "UP IDEAL PLUS", precio: 25.00, tier: "basico", modulos: ["150 Comprobantes", "1 Usuario", "App Móvil", "Soporte", "Capacitación", "Administrativo", "Impuestos", "Producción"] },
    { nombre: "UP PROFESIONAL PLUS", precio: 80.00, tier: "tesoreria", modulos: ["1000 Comprobantes", "5 Usuarios", "App Móvil", "API Desarrolladores", "Soporte", "Capacitación", "Administrativo", "Impuestos", "Producción", "Tesorería", "Plugin WooCommerce"] },
    { nombre: "UP ULTRA", precio: 150.00, tier: "tesoreria", modulos: ["Comprobantes Ilimitados", "Usuarios Ilimitados", "App Móvil", "API Desarrolladores", "Soporte", "Capacitación", "Administrativo", "Impuestos", "Producción", "Tesorería", "Plugin WooCommerce"] }
  ],
  erp: [
    { nombre: "ERP START", precio: 34.31, precioAnual: 411.76, tier: "erp_start", modulos: ["2000 Comprobantes", "Usuarios Ilimitados", "App Móvil", "API Desarrolladores", "Soporte", "Capacitación", "Administrativo", "Impuestos", "Producción", "Tesorería", "Contabilidad", "Nómina"] },
    { nombre: "ERP PLUS", precio: 50.00, precioAnual: 600.00, tier: "erp_plus", modulos: ["Comprobantes Ilimitados", "Usuarios Ilimitados", "App Móvil", "API Desarrolladores", "Soporte", "Capacitación", "Administrativo", "Punto de Venta", "Impuestos", "Producción", "Tesorería", "Contabilidad", "Nómina", "Activos Fijos", "Restaurantes", "Plugin WooCommerce"] },
    { nombre: "ERP PREMIUN", precio: 79.90, precioAnual: 958.82, tier: "erp_premium", modulos: ["Comprobantes Ilimitados", "Usuarios Ilimitados", "App Móvil", "API Desarrolladores", "Soporte", "Capacitación", "Administrativo", "Impuestos", "Producción", "Tesorería", "Contabilidad", "Nómina", "Empleados", "Activos Fijos", "Restaurantes", "Continuidad", "Plugin WooCommerce", "Multiempresas 3 RUC"] }
  ],
  contador: [
    { nombre: "CONTADOR 1 EMPRESA", precio: 50.00, tier: "contador_fijo", modulos: ["1 Empresa", "No incluye comprobantes", "Administrativo", "Impuestos", "Contabilidad"], valor: "1" },
    { nombre: "CONTADOR 3 EMPRESA", precio: 100.00, tier: "contador_fijo", modulos: ["3 Empresas", "No incluye comprobantes", "Administrativo", "Impuestos", "Contabilidad"], valor: "3" },
    { nombre: "CONTADOR 6 EMPRESA", precio: 150.00, tier: "contador_fijo", modulos: ["6 Empresas", "No incluye comprobantes", "Administrativo", "Impuestos", "Contabilidad"], valor: "6" },
    { nombre: "CONTADOR 10 EMPRESA", precio: 200.00, tier: "contador_fijo", modulos: ["10 Empresas", "No incluye comprobantes", "Administrativo", "Impuestos", "Contabilidad"], valor: "10" },
    { nombre: "TAX ILIMITADOS", precio: 100.00, tier: "contador_tax", modulos: ["Empresas Ilimitadas", "Tax Ilimitado", "No incluye comprobantes", "Administrativo", "Impuestos"], valor: "tax_ilimitado" },
    { nombre: "CONTADOR ILIMITADO", precio: 300.00, tier: "contador_ilimitado", modulos: ["Empresas Ilimitadas", "No incluye comprobantes", "Administrativo", "Impuestos", "Contabilidad"], valor: "ilimitadas" }
  ]
};

export const MODULOS_POR_TIER: Record<string, string[]> = {
  basico_sin_impuestos: ["ADMINISTRATIVO", "PRODUCCIÓN"],
  basico: ["ADMINISTRATIVO", "PRODUCCIÓN", "IMPUESTOS"],
  tesoreria: ["ADMINISTRATIVO", "PRODUCCIÓN", "IMPUESTOS", "TESORERÍA"],
  erp_start: ["ADMINISTRATIVO", "PRODUCCIÓN", "IMPUESTOS", "TESORERÍA", "NÓMINA", "CONTABILIDAD"],
  erp_plus: ["ADMINISTRATIVO", "PRODUCCIÓN", "IMPUESTOS", "TESORERÍA", "NÓMINA", "CONTABILIDAD", "ACTIVOS FIJOS", "RESTAURANTES"],
  erp_premium: ["ADMINISTRATIVO", "PRODUCCIÓN", "IMPUESTOS", "TESORERÍA", "NÓMINA", "CONTABILIDAD", "ACTIVOS FIJOS", "RESTAURANTES", "CONTINUIDAD", "EMPLEADOS"],
  contador_fijo: ["ADMINISTRATIVO", "IMPUESTOS", "CONTABILIDAD"],
  contador_tax: ["ADMINISTRATIVO", "IMPUESTOS"],
  contador_ilimitado: ["ADMINISTRATIVO", "IMPUESTOS", "CONTABILIDAD"],
  cloud_vps: ["ADMINISTRATIVO", "PRODUCCIÓN", "IMPUESTOS", "TESORERÍA", "NÓMINA", "CONTABILIDAD", "ACTIVOS FIJOS", "RESTAURANTES", "CONTINUIDAD", "EMPLEADOS"],
  cloud_enterprise: ["ADMINISTRATIVO", "PRODUCCIÓN", "IMPUESTOS", "TESORERÍA", "NÓMINA", "CONTABILIDAD", "ACTIVOS FIJOS", "RESTAURANTES", "CONTINUIDAD", "EMPLEADOS"]
};

export const DETALLE_SUBMODULOS: Record<string, string[]> = {
  "ADMINISTRATIVO": ["Dashboard Informativo", "Proformas", "##COMPROBANTES ELECTRÓNICOS", "Facturación Electrónica", "Facturas de reembolso", "Facturación por Lote", "Comprobantes de retención", "Notas de Crédito", "Notas de Débito", "Liquidación de Compras", "Guías de Remisión", "Notas de Venta", "Compras", "##CONTRATOS", "Facturación recurrente"],
  "PRODUCCIÓN": ["Dashboard Informativo", "Catálogo de servicios", "Catálogo de productos", "Productos en combo", "Multibodega", "Análisis de Rotación", "Inventarios - Entradas y Salidas", "Análisis de rentabilidad", "Órdenes de compra", "Productos con receta", "Productos fabricados", "Órdenes de producción"],
  "IMPUESTOS": ["ATS", "Formulario 103", "Formulario 104"],
  "TESORERÍA": ["Dashboard informativo", "##PROVEEDORES", "Estado de cuenta proveedor", "Histórico de pagos", "Pagos masivos", "Anticipo proveedores", "##CLIENTES", "Estado de cuenta cliente", "Histórico de cobro", "Cobro masivo", "Anticipo clientes", "##CONCILIACIONES BANCARIAS"],
  "CONTABILIDAD": ["Centro de costos", "Reglas Contables - Asientos", "Balance de Comprobación", "Balance General", "Estado de pérdidas y ganancias"],
  "NÓMINA": ["Base de datos de empleados", "Roles de pago", "Kardex de vacaciones", "RDEP", "Certificados laborales", "Gastos personales", "Formulario 107", "Cargas familiares"],
  "EMPLEADOS": ["Plataforma Individual por empleados", "Solicitud de anticipos y préstamos", "Solicitud de permisos", "Solicitud de Vacaciones"],
  "ACTIVOS FIJOS": ["Ficha de activos", "Depreciaciones", "Kárdex de control", "Acta de entrega recepción"],
  "RESTAURANTES": ["Dashboard informativo", "Meseros", "Mesas", "Comandas", "Caja Restaurante", "Distribución de pre-cuenta"],
  "CONTINUIDAD": ["Dashboard informativo", "Agencias", "Programas", "Productos", "Versión Cuñas"]
};

export interface NichoInfo {
  titulo: string;
  introduccion: string;
  valor: string;
}

export const NICHOS_DATA: Record<string, NichoInfo> = {
  constructoras: {
    titulo: "Constructoras",
    introduccion: "Comprendemos que en una empresa constructora es indispensable mantener el control de cada proyecto, sus costos, presupuestos, compras y avances de obra. Por ello recomendamos gestionar los siguientes procesos para garantizar rentabilidad, trazabilidad y control financiero en tiempo real.",
    valor: "PROCESOS ESENCIALES: Control integral de proyectos, presupuestos, centros de costos, avance de obra, compras, inventario de materiales y rentabilidad por proyecto."
  },
  papelerias: {
    titulo: "Papelerías",
    introduccion: "Comprendemos la importancia de controlar una amplia variedad de productos, mantener inventarios actualizados y optimizar la rotación de mercadería. Por ello recomendamos gestionar los siguientes procesos para mejorar la rentabilidad y el control operativo.",
    valor: "PROCESOS ESENCIALES: Control de inventario masivo, productos por categorías, facturación rápida, control de stock mínimo y análisis de productos más vendidos."
  },
  repuestos_vehiculos: {
    titulo: "Repuestos Vehículos",
    introduccion: "Comprendemos la complejidad de administrar miles de referencias y mantener disponibilidad inmediata de productos. Por ello recomendamos gestionar los siguientes procesos para optimizar inventarios y mejorar la atención al cliente.",
    valor: "PROCESOS ESENCIALES: Administración de referencias, compatibilidad de repuestos, control de bodegas, rotación de inventario y gestión de garantías."
  },
  distribuidoras: {
    titulo: "Distribuidoras",
    introduccion: "Comprendemos la necesidad de controlar compras, inventarios y cuentas por cobrar mientras se mantiene la eficiencia comercial. Por ello recomendamos gestionar los siguientes procesos para fortalecer la operación y la rentabilidad.",
    valor: "PROCESOS ESENCIALES: Gestión de compras, inventario multi-bodega, ventas al por mayor, cuentas por cobrar y control de rutas comerciales."
  },
  restaurantes: {
    titulo: "Restaurantes",
    introduccion: "Comprendemos que el éxito de un restaurante depende del control de costos, insumos y rentabilidad de cada plato. Por ello recomendamos gestionar los siguientes procesos para optimizar la operación diaria.",
    valor: "PROCESOS ESENCIALES: Control de recetas, costos de producción, inventario de insumos, ventas por mesero y análisis de rentabilidad por plato."
  },
  alimentos_bebidas: {
    titulo: "Alimentos y Bebidas",
    introduccion: "Comprendemos la importancia de mantener trazabilidad, control de lotes y fechas de vencimiento para garantizar calidad y cumplimiento normativo. Por ello recomendamos gestionar los siguientes procesos.",
    valor: "PROCESOS ESENCIALES: Control de producción, lotes, fechas de vencimiento, trazabilidad de productos y manejo eficiente de inventarios."
  },
  repuestos_celulares: {
    titulo: "Repuestos Celulares",
    introduccion: "Comprendemos la dinámica comercial de productos tecnológicos y la necesidad de controlar inventarios de alta rotación. Por ello recomendamos gestionar los siguientes procesos.",
    valor: "PROCESOS ESENCIALES: Control de accesorios, pantallas, baterías y repuestos técnicos, inventario detallado y seguimiento de ventas."
  },
  tecnologia: {
    titulo: "Empresas Tecnológicas",
    introduccion: "Comprendemos la necesidad de administrar servicios, proyectos y suscripciones mientras se mide constantemente la rentabilidad del negocio. Por ello recomendamos gestionar los siguientes procesos.",
    valor: "PROCESOS ESENCIALES: Gestión de servicios, suscripciones, proyectos, facturación recurrente e indicadores de rentabilidad."
  },
  farmacias: {
    titulo: "Farmacias",
    introduccion: "Comprendemos la importancia del control sanitario, trazabilidad y cumplimiento normativo en la comercialización de medicamentos. Por ello recomendamos gestionar los siguientes procesos.",
    valor: "PROCESOS ESENCIALES: Control de lotes, fechas de caducidad, inventario regulado, compras automatizadas y trazabilidad de medicamentos."
  },
  ferreterias: {
    titulo: "Ferreterías",
    introduccion: "Comprendemos la necesidad de controlar miles de productos de distintas categorías y alta rotación. Por ello recomendamos gestionar los siguientes procesos.",
    valor: "PROCESOS ESENCIALES: Administración de inventario de alta rotación, múltiples líneas de productos y control de abastecimiento."
  },
  mini_markets: {
    titulo: "Mini Markets",
    introduccion: "Comprendemos que la velocidad de atención y el control de inventario son fundamentales para la rentabilidad del negocio. Por ello recomendamos gestionar los siguientes procesos.",
    valor: "PROCESOS ESENCIALES: Facturación rápida, control de inventario en tiempo real, arqueo de caja y reposición automática de productos."
  },
  panaderias: {
    titulo: "Panaderías y Pastelerías",
    introduccion: "Comprendemos la importancia de controlar materias primas, costos de producción y desperdicios para maximizar la rentabilidad. Por ello recomendamos gestionar los siguientes procesos.",
    valor: "PROCESOS ESENCIALES: Control de recetas, costos de producción, materias primas, desperdicios y rentabilidad por producto."
  },
  ropa: {
    titulo: "Tiendas de Ropa",
    introduccion: "Comprendemos la necesidad de administrar inventarios por talla, color y colección mientras se analizan tendencias de venta. Por ello recomendamos gestionar los siguientes procesos.",
    valor: "PROCESOS ESENCIALES: Inventario por talla, color y modelo, control de colecciones, promociones y análisis de ventas."
  },
  electrodomesticos: {
    titulo: "Electrodomésticos",
    introduccion: "Comprendemos la importancia de controlar productos de alto valor, garantías y procesos de entrega para mantener la satisfacción del cliente. Por ello recomendamos gestionar los siguientes procesos.",
    valor: "PROCESOS ESENCIALES: Gestión de inventario serializado, garantías, créditos, entregas y control de productos de alto valor."
  }
};

export interface AsesorInfo {
  nombre: string;
  correo: string;
  telefono: string;
}

export const ASESORES_DATA: Record<string, AsesorInfo> = {
  salome:  { nombre: "Salomé Estrella",  correo: "sestrella@upconta.com",  telefono: "+593 99 038 8493" },
  karla:   { nombre: "Karla Haro",       correo: "kharo@upconta.com",      telefono: "+593 98 934 7443" },
  ismenia: { nombre: "Ismenia Escalona", correo: "iescalona@upconta.com",  telefono: "+593 99 912 2519" },
  evelyn:  { nombre: "Evelyn Narváez",   correo: "enarvaez@upconta.com",   telefono: "+593 98 194 7894" },
  david:   { nombre: "David Santander",  correo: "dsantander@upconta.com", telefono: "+593 98 069 0459" }
};

export interface AdicionalItem {
  valor: string;
  precio: number;
  texto: string;
}

export interface FirmaElectronica {
  tipo: "PERSONA NATURAL" | "PERSONA NATURAL RUC" | "PERSONA JURIDICA" | "PROMO EMPRENDE";
  vigencia: "15 DIAS" | "1 AÑO" | "2 AÑOS" | "3 AÑOS" | "4 AÑOS" | "5 AÑOS";
  precio: number;
}

export const FIRMAS_DATA: FirmaElectronica[] = [
  // Persona Natural
  { tipo: "PERSONA NATURAL", vigencia: "15 DIAS", precio: 6.90 },
  { tipo: "PERSONA NATURAL", vigencia: "1 AÑO", precio: 18.20 },
  { tipo: "PERSONA NATURAL", vigencia: "2 AÑOS", precio: 22.20 },
  { tipo: "PERSONA NATURAL", vigencia: "3 AÑOS", precio: 33.28 },
  { tipo: "PERSONA NATURAL", vigencia: "4 AÑOS", precio: 44.36 },
  { tipo: "PERSONA NATURAL", vigencia: "5 AÑOS", precio: 55.41 },

  // Persona Natural RUC
  { tipo: "PERSONA NATURAL RUC", vigencia: "1 AÑO", precio: 18.20 },
  { tipo: "PERSONA NATURAL RUC", vigencia: "2 AÑOS", precio: 22.20 },
  { tipo: "PERSONA NATURAL RUC", vigencia: "3 AÑOS", precio: 33.28 },
  { tipo: "PERSONA NATURAL RUC", vigencia: "4 AÑOS", precio: 44.36 },
  { tipo: "PERSONA NATURAL RUC", vigencia: "5 AÑOS", precio: 55.41 },

  // Persona Juridica
  { tipo: "PERSONA JURIDICA", vigencia: "1 AÑO", precio: 21.84 },
  { tipo: "PERSONA JURIDICA", vigencia: "2 AÑOS", precio: 25.84 },
  { tipo: "PERSONA JURIDICA", vigencia: "3 AÑOS", precio: 38.22 },
  { tipo: "PERSONA JURIDICA", vigencia: "4 AÑOS", precio: 50.93 },
  { tipo: "PERSONA JURIDICA", vigencia: "5 AÑOS", precio: 63.12 },

  // Promo Emprende
  { tipo: "PROMO EMPRENDE", vigencia: "1 AÑO", precio: 24.00 },
  { tipo: "PROMO EMPRENDE", vigencia: "2 AÑOS", precio: 30.00 },
  { tipo: "PROMO EMPRENDE", vigencia: "3 AÑOS", precio: 38.00 }
];

export const ADICIONALES_ESTANDAR: AdicionalItem[] = [
  { valor: "TESORERÍA", precio: 75.00, texto: "Tesorería ($75.00)" },
  { valor: "NÓMINA", precio: 75.00, texto: "Nómina ($75.00)" },
  { valor: "ACTIVOS FIJOS", precio: 75.00, texto: "Activos Fijos ($75.00)" },
  { valor: "RESTAURANTES", precio: 75.00, texto: "Restaurantes ($75.00)" },
  { valor: "CONTABILIDAD", precio: 75.00, texto: "Contabilidad ($75.00)" }
];

export const ADICIONALES_CONTADOR: AdicionalItem[] = [
  { valor: "UP LIGHT", precio: 10.00, texto: "Up Light ($10.00)" },
  { valor: "UP BASE", precio: 25.00, texto: "Up Base ($25.00)" },
  { valor: "UP POWER", precio: 55.00, texto: "Up Power ($55.00)" }
];

export const COMPROBANTES_ADICIONALES_CONTADOR: Record<string, string> = {
  "UP LIGHT": "70 Comp.",
  "UP BASE": "500 Com.",
  "UP POWER": "Comp. Ilimitados"
};
