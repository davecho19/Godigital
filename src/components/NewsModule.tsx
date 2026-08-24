import React, { useState, useEffect, useMemo } from "react";
import { jsPDF } from "jspdf";
import {
  RewardItem,
  DEFAULT_REWARDS_CATALOG,
  getStoredRewardsCatalog,
  saveRewardsCatalog,
} from "../utils/rewardsData";
export type { RewardItem };
export { DEFAULT_REWARDS_CATALOG };
import { TabPermissionConfig, getPermissionsForSocio } from "../utils/permissions";
import {
  Newspaper,
  Calendar,
  Search,
  ChevronRight,
  Sparkles,
  X,
  CheckCircle2,
  Rocket,
  Building2,
  Truck,
  FileCode,
  ShoppingBag,
  Scale,
  Receipt,
  UtensilsCrossed,
  Plus,
  Send,
  Layers,
  Info,
  UserPlus,
  Edit3,
  Users,
  Gift,
  Award,
  ShieldCheck,
  Target,
  Compass,
  Globe2,
  TrendingUp,
  Cpu,
  Star,
  Zap,
  Coins,
  ArrowUpRight,
  Lock,
  Clock,
  Check,
  Save,
  RotateCcw,
  Edit,
  UserCheck,
  FileSpreadsheet,
  Filter,
  Trash2,
  Flame,
  Eye,
  EyeOff,
  Tag,
  ToggleLeft,
  ToggleRight,
  PlusCircle,
  GraduationCap,
  Ticket,
  QrCode,
  Coffee,
  Mail,
  Download,
  Printer,
  Share2,
  FileText
} from "lucide-react";
import { getPartnerCodeSlots, PartnerCodeSlot } from "../utils/partnerCodes";
import { VentaRegistrada } from "./ComisionModule";
import { getActivePartnerName } from "../utils/userSessionHelper";

export interface RedemptionRequest {
  id: string;
  socioCode: string;
  socioNombre: string;
  socioEmail: string;
  rewardId: string;
  rewardTitle: string;
  rewardCategory: string;
  pointsCost: number;
  date: string;
  status: "Pendiente" | "Entregado" | "Rechazado";
  notes?: string;
}

const INITIAL_REDEMPTION_REQUESTS: RedemptionRequest[] = [
  {
    id: "req-101",
    socioCode: "KPIER-SOC-001",
    socioNombre: "María José Delgado",
    socioEmail: "m.delgado@kpier.com",
    rewardId: "rw-2",
    rewardTitle: "Firma Electrónica Persona Jurídica 1 Año",
    rewardCategory: "Firmas .p12",
    pointsCost: 100,
    date: "2026-08-06",
    status: "Pendiente",
  },
  {
    id: "req-102",
    socioCode: "KPIER-DIST-002",
    socioNombre: "Carlos Alfredo Mendoza",
    socioEmail: "carlos.mendoza@kpier.com",
    rewardId: "rw-6",
    rewardTitle: "Pack Capacitación VIP SRI y Contabilidad en la Nube",
    rewardCategory: "Capacitaciones & Bonos",
    pointsCost: 200,
    date: "2026-08-05",
    status: "Entregado",
  },
  {
    id: "req-103",
    socioCode: "KPIER-GOLD-003",
    socioNombre: "Santi Viteri",
    socioEmail: "sviteri@kpier.com",
    rewardId: "rw-1",
    rewardTitle: "Licencia Anual ERP UpConta Profesional",
    rewardCategory: "Licencias ERP",
    pointsCost: 300,
    date: "2026-08-04",
    status: "Entregado",
  },
];

export interface NewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  monthGroup: "Julio 2026" | "Agosto 2026";
  summary: string;
  content: string;
  author: string;
  badge?: string;
}

const INITIAL_NEWS: NewsItem[] = [
  // --- NOTICIAS AGOSTO 2026 (Próximas de UpConta) ---
  {
    id: "news-ago-1",
    title: "Placa para transporte terrestre comercial",
    category: "UpConta",
    date: "Agosto 2026",
    monthGroup: "Agosto 2026",
    summary: "Inclusión obligatoria y automatizada del campo de placa vehicular en comprobantes electrónicos para compañías y cooperativas de transporte.",
    content: "Cumpliendo con las normativas del SRI y la Agencia Nacional de Tránsito (ANT), el módulo de facturación de UpConta incluirá de forma nativa el campo de placa del vehículo comercial en facturación electrónica y guías de remisión.",
    author: "Desarrollo UpConta",
    badge: "Próximamente Agosto",
  },
  {
    id: "news-ago-2",
    title: "Agregar de forma obligatoria el campo información adicional RUC proveedor del software contable",
    category: "UpConta",
    date: "Agosto 2026",
    monthGroup: "Agosto 2026",
    summary: "Inclusión requerida por el SRI del RUC del proveedor del sistema informático en los esquemas XML/RIDE.",
    content: "Alineados a las disposiciones técnicas del SRI, se añade automáticamente en la sección de 'Información Adicional' de todas las facturas electrónicas el RUC certificado de la empresa proveedora del software contable UpConta.",
    author: "Normativa & SRI",
    badge: "Próximamente Agosto",
  },
  {
    id: "news-ago-3",
    title: "Mejoras en la integración WooCommerce",
    category: "UpConta",
    date: "Agosto 2026",
    monthGroup: "Agosto 2026",
    summary: "Sincronización en tiempo real de stock, facturación automática instantánea y conector API renovado para e-commerce.",
    content: "Se libera la versión mejorada del plugin para WooCommerce. Toda venta realizada en la tienda virtual emitirá la factura electrónica en UpConta al instante y actualizará las existencias en inventarios multi-bodega.",
    author: "Integraciones API",
    badge: "Próximamente Agosto",
  },
  {
    id: "news-ago-4",
    title: "Conversión de unidades de medida",
    category: "UpConta",
    date: "Agosto 2026",
    monthGroup: "Agosto 2026",
    summary: "Flexibilidad para comprar por cajas/sacos/toneladas y descargar stock por unidades/kilos con cálculo de costos ponderados.",
    content: "El motor de inventarios de UpConta ERP dispondrá de tablas de equivalencia y conversión de unidades de medida para compras y ventas de forma transparente en el kárdex.",
    author: "Desarrollo ERP",
    badge: "Próximamente Agosto",
  },

  // --- NOTICIAS JULIO 2026 (Completadas en UpConta) ---
  {
    id: "news-jul-1",
    title: "Mejora en la gestión de compras",
    category: "UpConta",
    date: "Julio 2026",
    monthGroup: "Julio 2026",
    summary: "Optimización en la carga masiva de archivos XML/RIDE de proveedores, vinculación directa con inventario y pre-asiento contable.",
    content: "Se implementaron optimizaciones en el módulo de compras de UpConta ERP. Ahora la lectura de facturas de proveedores desde el SRI vincula automáticamente productos, calcula retenciones y genera la orden de pago.",
    author: "Equipo UpConta",
    badge: "Completado Julio",
  },
  {
    id: "news-jul-2",
    title: "Cortes de caja en restaurantes",
    category: "UpConta",
    date: "Julio 2026",
    monthGroup: "Julio 2026",
    summary: "Control de arqueo de caja X y Z, cuadre de propinas, desglose por formas de pago y auditoría de cajeros en tiempo real.",
    content: "Nuevo sistema de cierre de turno para el sector gastronómico y comercial. Permite realizar arqueos ciegos, auditoría de apertura y cierre de caja, y cuadre exacto de cobranzas por punto de venta.",
    author: "Equipo UpConta",
    badge: "Completado Julio",
  },

  // --- ANF ---
  {
    id: "news-anf-1",
    title: "Firmas Electrónicas ANF: Renovaciones Express y Verificación Biométrica",
    category: "ANF",
    date: "Julio 2026",
    monthGroup: "Julio 2026",
    summary: "El proceso de emisión y renovación de firmas electrónicas en archivo .p12 para personas naturales y jurídicas ahora tarda menos de 15 minutos.",
    content: "Con el flujo simplificado de ANF Ecuador, los distribuidores autorizados pueden gestionar solicitudes de firmas electrónicas de 1 a 5 años con verificación biométrica en tiempo real.",
    author: "ANF AC Ecuador",
    badge: "ANF .p12",
  },
];

export interface PlanPointRule {
  id: string;
  category: "facturacion" | "erp" | "contador" | "firmas" | "educacion";
  categoryName: string;
  name: string;
  planName?: string;
  description: string;
  points: number;
  pointsPerSale?: number;
  secondaryPoints?: number;
  hasSecondary?: boolean;
  primaryLabel?: string;
  secondaryLabel?: string;
}

export const DEFAULT_PLAN_POINT_RULES: PlanPointRule[] = [
  {
    id: "plan-fact-1",
    category: "facturacion",
    categoryName: "Facturación Electrónica",
    name: "Planes Light, Base, Power, Ideal, Inicial e Intermedio",
    planName: "Planes Light, Base, Power, Ideal, Inicial e Intermedio",
    description: "Planes básicos e intermedios de emisión de facturas electrónicas",
    points: 15,
    pointsPerSale: 15,
    primaryLabel: "Puntos Venta",
  },
  {
    id: "plan-fact-2",
    category: "facturacion",
    categoryName: "Facturación Electrónica",
    name: "Planes Ultra y Professional",
    planName: "Planes Ultra y Professional",
    description: "Planes profesionales avanzados de alto volumen transaccional",
    points: 30,
    pointsPerSale: 30,
    primaryLabel: "Puntos Venta",
  },
  {
    id: "plan-erp-1",
    category: "erp",
    categoryName: "Planes ERP UpConta",
    name: "Plan ERP Star",
    planName: "Plan ERP Star",
    description: "Sistema ERP para PYMEs y negocios en crecimiento",
    points: 50,
    pointsPerSale: 50,
    secondaryPoints: 70,
    hasSecondary: true,
    primaryLabel: "Mensual",
    secondaryLabel: "Anual",
  },
  {
    id: "plan-erp-2",
    category: "erp",
    categoryName: "Planes ERP UpConta",
    name: "Plan ERP Plus",
    planName: "Plan ERP Plus",
    description: "Sistema ERP para medianas empresas multi-sucursal",
    points: 50,
    pointsPerSale: 50,
    secondaryPoints: 100,
    hasSecondary: true,
    primaryLabel: "Mensual",
    secondaryLabel: "Anual",
  },
  {
    id: "plan-erp-3",
    category: "erp",
    categoryName: "Planes ERP UpConta",
    name: "Plan ERP Premium",
    planName: "Plan ERP Premium",
    description: "Sistema ERP corporativo ilimitado con soporte dedicado",
    points: 50,
    pointsPerSale: 50,
    secondaryPoints: 150,
    hasSecondary: true,
    primaryLabel: "Mensual",
    secondaryLabel: "Anual",
  },
  {
    id: "plan-cont-1",
    category: "contador",
    categoryName: "Planes Especiales Contadores",
    name: "Planes Contadores (de 1 a 10 empresas + TX)",
    planName: "Planes Contadores (de 1 a 10 empresas + TX)",
    description: "Suscripción profesional para gestión contable multi-RUC",
    points: 50,
    pointsPerSale: 50,
    primaryLabel: "Puntos Venta",
  },
  {
    id: "plan-cont-2",
    category: "contador",
    categoryName: "Planes Especiales Contadores",
    name: "Plan Contador Ilimitado",
    planName: "Plan Contador Ilimitado",
    description: "Licencia ilimitada de gestión de clientes e impuestos",
    points: 300,
    pointsPerSale: 300,
    primaryLabel: "Puntos Venta",
  },
  {
    id: "plan-firma-1",
    category: "firmas",
    categoryName: "Firmas Electrónicas ANF (.p12)",
    name: "Persona Natural / Con RUC",
    planName: "Persona Natural / Con RUC",
    description: "Firma electrónica .p12 para personas naturales y profesionales",
    points: 20,
    pointsPerSale: 20,
    secondaryPoints: 50,
    hasSecondary: true,
    primaryLabel: "1 a 3 Años",
    secondaryLabel: "4 a 5 Años",
  },
  {
    id: "plan-firma-2",
    category: "firmas",
    categoryName: "Firmas Electrónicas ANF (.p12)",
    name: "Persona Jurídica (Representante Legal)",
    planName: "Persona Jurídica (Representante Legal)",
    description: "Firma electrónica .p12 para sociedades y empresas",
    points: 30,
    pointsPerSale: 30,
    secondaryPoints: 70,
    hasSecondary: true,
    primaryLabel: "1 a 3 Años",
    secondaryLabel: "4 a 5 Años",
  },
  {
    id: "plan-edu-1",
    category: "educacion",
    categoryName: "Educación Continua & Eventos",
    name: "Reserva de Capacitación Semanal ($10)",
    planName: "Reserva de Capacitación Semanal ($10)",
    description: "Inscripción con reserva asegurada para capacitaciones semanales",
    points: 100,
    pointsPerSale: 100,
    primaryLabel: "Puntos Extra",
  },
  {
    id: "plan-edu-2",
    category: "educacion",
    categoryName: "Educación Continua & Eventos",
    name: "Reserva / Entrada Evento Grande ($25 - $50)",
    planName: "Reserva / Entrada Evento Grande ($25 - $50)",
    description: "Inscripción a convenciones mensuales con certificado y desayuno",
    points: 300,
    pointsPerSale: 300,
    primaryLabel: "Puntos Extra",
  },
];

export interface EventItem {
  id: string;
  title: string;
  category: "Capacitación Semanal" | "Evento Grande / Convención";
  month: "Agosto 2026" | "Septiembre 2026";
  dateFormatted: string;
  timeFormatted: string;
  speakerName: string;
  speakerRole: string;
  organizer: string;
  description: string;
  location: string;
  totalSeats: number;
  priceFree: number;
  pricePaidReservation: number;
  priceFullPaid?: number;
  pointsAwardedIfPaid: number;
  includesBreakfastAndCert?: boolean;
  guestsList?: string[];
}

export interface EventRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  socioCode: string;
  socioNombre: string;
  socioEmail: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  attendeeCompany?: string;
  registrationType: "Gratuito" | "Reserva Pagada";
  amountPaid: number;
  paymentReference?: string;
  paymentReceiptUrl?: string;
  paymentStatus: "Confirmado" | "Pendiente";
  pointsAwarded: number;
  registrationDate: string;
  ticketQrCode: string;
}

export const INITIAL_EVENTS: EventItem[] = [
  // --- AGOSTO 2026: Capacitaciones Semanales ---
  {
    id: "evt-ago-1",
    title: "Capacitación Tributaria: Novedades del SRI, Retenciones y Facturación 2026",
    category: "Capacitación Semanal",
    month: "Agosto 2026",
    dateFormatted: "Jueves 13 de Agosto, 2026",
    timeFormatted: "17:00 - 19:00 (2 Horas)",
    speakerName: "Msc. Adriana Torres & Consultores SRI",
    speakerRole: "Especialista en Normativa Tributaria y Cierres Fiscales",
    organizer: "Colegio de Contadores del Ecuador & UpConta S.A.S.",
    description: "Actualización integral sobre las últimas resoluciones del SRI para facturación electrónica, campos obligatorios de placas y RUC de proveedor de software. Preguntas en vivo.",
    location: "Aula Virtual VIP Zoom & Transmisión HD",
    totalSeats: 50,
    priceFree: 0,
    pricePaidReservation: 10,
    pointsAwardedIfPaid: 100,
    guestsList: ["Msc. Adriana Torres", "Delegación SRI Pichincha"],
  },
  {
    id: "evt-ago-2",
    title: "Cómo Vender el Sistema de Facturación Electrónica y Contable UpConta ERP",
    category: "Capacitación Semanal",
    month: "Agosto 2026",
    dateFormatted: "Jueves 20 de Agosto, 2026",
    timeFormatted: "17:00 - 19:00 (2 Horas)",
    speakerName: "Ing. Jorge Ron",
    speakerRole: "Director de Estrategia Comercial y Red de Distribuidores",
    organizer: "UpConta S.A.S. & GoDi Partner Network",
    description: "Técnicas de venta efectiva, objeciones frecuentes de PYMEs, demostración en vivo de la plataforma UpConta ERP y cómo estructurar cotizaciones de alto impacto.",
    location: "Aula Virtual VIP Zoom",
    totalSeats: 50,
    priceFree: 0,
    pricePaidReservation: 10,
    pointsAwardedIfPaid: 100,
    guestsList: ["Ing. Jorge Ron", "Equipo Comercial GoDi"],
  },
  {
    id: "evt-ago-3",
    title: "Creación de Artes con Inteligencia Artificial para Potenciar tu Marketing Digital",
    category: "Capacitación Semanal",
    month: "Agosto 2026",
    dateFormatted: "Jueves 27 de Agosto, 2026",
    timeFormatted: "17:00 - 19:00 (2 Horas)",
    speakerName: "Lic. Carlos Dávila",
    speakerRole: "Especialista en IA Generativa & Growth Marketing",
    organizer: "GoDi Tech & Módulo Visual Partner",
    description: "Aprende a usar herramientas de IA generativa para crear carruseles, publicaciones de alta conversión para Instagram, Facebook y WhatsApp Business sin ser diseñador.",
    location: "Aula Virtual VIP Zoom & Taller Práctico",
    totalSeats: 50,
    priceFree: 0,
    pricePaidReservation: 10,
    pointsAwardedIfPaid: 100,
    guestsList: ["Lic. Carlos Dávila", "Red de Arte Visual GoDi"],
  },

  // --- AGOSTO 2026: Evento Grande Mensual ---
  {
    id: "evt-big-ago",
    title: "Gran Cumbre Nacional de Contabilidad & Facturación Electrónica 2026",
    category: "Evento Grande / Convención",
    month: "Agosto 2026",
    dateFormatted: "Sábado 22 de Agosto, 2026",
    timeFormatted: "08:30 - 13:00 (Medio Día)",
    speakerName: "Msc. Adriana Torres, Ing. Jorge Ron & Invitados Especiales",
    speakerRole: "Expositores Principales & Colegio de Contadores del Ecuador",
    organizer: "Colegio de Contadores del Ecuador & UpConta S.A.S.",
    description: "Magno evento presencial y virtual que reúne a los principales líderes contables y tributarios del país. Incluye Desayuno Buffet Ejecutivo VIP, Certificado Oficial de Asistencia acreditado, panel de preguntas con ex-directores del SRI y networking.",
    location: "Auditorio Principal Colegio de Contadores (Quito) & Streaming HD",
    totalSeats: 150,
    priceFree: 0,
    pricePaidReservation: 25,
    priceFullPaid: 50,
    pointsAwardedIfPaid: 300,
    includesBreakfastAndCert: true,
    guestsList: ["Msc. Adriana Torres", "Ing. Jorge Ron", "Presidente Colegio de Contadores", "Delegados SRI Ecuador"],
  },

  // --- SEPTIEMBRE 2026: Capacitaciones Semanales ---
  {
    id: "evt-sep-1",
    title: "Estrategias de Cierre Fiscal y Manejo de Inventarios Multi-Bodega en la Nube",
    category: "Capacitación Semanal",
    month: "Septiembre 2026",
    dateFormatted: "Jueves 3 de Septiembre, 2026",
    timeFormatted: "17:00 - 19:00 (2 Horas)",
    speakerName: "Msc. Adriana Torres",
    speakerRole: "Especialista en Auditoría y Normativa Contable",
    organizer: "Colegio de Contadores & UpConta ERP",
    description: "Control de kardex, ajustes de existencias, equivalencias de unidades de medida y kárdex contable automatizado en UpConta ERP.",
    location: "Aula Virtual VIP Zoom",
    totalSeats: 50,
    priceFree: 0,
    pricePaidReservation: 10,
    pointsAwardedIfPaid: 100,
    guestsList: ["Msc. Adriana Torres"],
  },
  {
    id: "evt-sep-2",
    title: "Optimización de Anexos Transaccionales (ATS) y Carga Automática de Facturas Proveedor",
    category: "Capacitación Semanal",
    month: "Septiembre 2026",
    dateFormatted: "Jueves 10 de Septiembre, 2026",
    timeFormatted: "17:00 - 19:00 (2 Horas)",
    speakerName: "Lcdo. Fernando Silva",
    speakerRole: "Consultor Máster en Sistemas Tributarios",
    organizer: "UpConta S.A.S.",
    description: "Aprende cómo UpConta procesa la lectura de facturas electrónicas de proveedores directamente del SRI, generando el pre-asiento y cuadrando el ATS sin errores.",
    location: "Aula Virtual VIP Zoom",
    totalSeats: 50,
    priceFree: 0,
    pricePaidReservation: 10,
    pointsAwardedIfPaid: 100,
    guestsList: ["Lcdo. Fernando Silva"],
  },
  {
    id: "evt-sep-3",
    title: "Auditoría Contable Digital y Automatización Financiera con UpConta ERP",
    category: "Capacitación Semanal",
    month: "Septiembre 2026",
    dateFormatted: "Jueves 17 de Septiembre, 2026",
    timeFormatted: "17:00 - 19:00 (2 Horas)",
    speakerName: "Ing. Jorge Ron & Equipo Técnico",
    speakerRole: "Especialistas en Desarrollo ERP",
    organizer: "GoDi Tech & UpConta S.A.S.",
    description: "Análisis de estados financieros, balance de comprobación automatizado, centros de costos y auditoría digital de facturación masiva.",
    location: "Aula Virtual VIP Zoom",
    totalSeats: 50,
    priceFree: 0,
    pricePaidReservation: 10,
    pointsAwardedIfPaid: 100,
    guestsList: ["Ing. Jorge Ron"],
  },
  {
    id: "evt-sep-4",
    title: "Fidelización de Clientes y Recurrencia para Contadores, Asesores y Distribuidores",
    category: "Capacitación Semanal",
    month: "Septiembre 2026",
    dateFormatted: "Jueves 24 de Septiembre, 2026",
    timeFormatted: "17:00 - 19:00 (2 Horas)",
    speakerName: "Lcda. Gabriela Peña",
    speakerRole: "Directora de Experiencia del Cliente UpConta",
    organizer: "Red de Socios GoDi",
    description: "Cómo construir relaciones de largo plazo con clientes, renovaciones anuales de firmas electrónicas .p12 y soporte posventa automatizado.",
    location: "Aula Virtual VIP Zoom",
    totalSeats: 50,
    priceFree: 0,
    pricePaidReservation: 10,
    pointsAwardedIfPaid: 100,
    guestsList: ["Lcda. Gabriela Peña"],
  },

  // --- SEPTIEMBRE 2026: Evento Grande Mensual ---
  {
    id: "evt-big-sep",
    title: "Encuentro Anual de Socios, Liderazgo Contable y Transformación Digital 2026",
    category: "Evento Grande / Convención",
    month: "Septiembre 2026",
    dateFormatted: "Sábado 26 de Septiembre, 2026",
    timeFormatted: "08:30 - 13:00 (Medio Día)",
    speakerName: "Msc. Adriana Torres, Ing. Jorge Ron & Colegio de Contadores",
    speakerRole: "Panelistas Magistrales & Directiva del Colegio de Contadores",
    organizer: "Colegio de Contadores Públicos del Ecuador & ANF AC",
    description: "Magna convención anual de distribuidores, contadores y asesores de software. Incluye Desayuno Buffet, entrega de Certificados Físicos, reconocimiento a los principales distribuidores del país y mesa redonda tributaria.",
    location: "Centro de Convenciones & Streaming VIP",
    totalSeats: 150,
    priceFree: 0,
    pricePaidReservation: 25,
    priceFullPaid: 50,
    pointsAwardedIfPaid: 300,
    includesBreakfastAndCert: true,
    guestsList: ["Msc. Adriana Torres", "Ing. Jorge Ron", "Directiva Colegio de Contadores del Ecuador"],
  },
];

export const INITIAL_EVENT_REGISTRATIONS: EventRegistration[] = [
  {
    id: "reg-101",
    eventId: "evt-ago-1",
    eventTitle: "Capacitación Tributaria: Novedades del SRI, Retenciones y Facturación 2026",
    eventDate: "Jueves 13 de Agosto, 2026",
    socioCode: "KPIER-SOC-001",
    socioNombre: "María José Delgado",
    socioEmail: "m.delgado@kpier.com",
    attendeeName: "María José Delgado",
    attendeeEmail: "m.delgado@kpier.com",
    attendeePhone: "0991234567",
    attendeeCompany: "Delgado & Asociados Contadores",
    registrationType: "Gratuito",
    amountPaid: 0,
    paymentStatus: "Confirmado",
    pointsAwarded: 0,
    registrationDate: "2026-08-05",
    ticketQrCode: "QR-EVT-AGO1-101",
  },
  {
    id: "reg-102",
    eventId: "evt-ago-1",
    eventTitle: "Capacitación Tributaria: Novedades del SRI, Retenciones y Facturación 2026",
    eventDate: "Jueves 13 de Agosto, 2026",
    socioCode: "KPIER-DIST-002",
    socioNombre: "Carlos Alfredo Mendoza",
    socioEmail: "carlos.mendoza@kpier.com",
    attendeeName: "Ing. Roberto Paredes",
    attendeeEmail: "roberto.paredes@empresa.com",
    attendeePhone: "0987654321",
    attendeeCompany: "Paredes Logistics S.A.",
    registrationType: "Reserva Pagada",
    amountPaid: 10,
    paymentReference: "TRF-PICHINCHA-9921",
    paymentReceiptUrl: "comprobante_reserva_102.pdf",
    paymentStatus: "Confirmado",
    pointsAwarded: 100,
    registrationDate: "2026-08-06",
    ticketQrCode: "QR-EVT-AGO1-102",
  },
  {
    id: "reg-103",
    eventId: "evt-big-ago",
    eventTitle: "Gran Cumbre Nacional de Contabilidad & Facturación Electrónica 2026",
    eventDate: "Sábado 22 de Agosto, 2026",
    socioCode: "KPIER-GOLD-003",
    socioNombre: "Santi Viteri",
    socioEmail: "sviteri@kpier.com",
    attendeeName: "Santi Viteri",
    attendeeEmail: "sviteri@kpier.com",
    attendeePhone: "0998877665",
    attendeeCompany: "Viteri Consultoría Contable",
    registrationType: "Reserva Pagada",
    amountPaid: 25,
    paymentReference: "TRF-PRODUBANCO-4410",
    paymentReceiptUrl: "comprobante_cumbre_103.pdf",
    paymentStatus: "Confirmado",
    pointsAwarded: 300,
    registrationDate: "2026-08-07",
    ticketQrCode: "QR-EVT-BIG1-103",
  },
  {
    id: "reg-104",
    eventId: "evt-big-ago",
    eventTitle: "Gran Cumbre Nacional de Contabilidad & Facturación Electrónica 2026",
    eventDate: "Sábado 22 de Agosto, 2026",
    socioCode: "KPIER-SOC-001",
    socioNombre: "María José Delgado",
    socioEmail: "m.delgado@kpier.com",
    attendeeName: "Lcda. Carmen Benítez (Invitada)",
    attendeeEmail: "c.benitez@estudio.ec",
    attendeePhone: "0995544332",
    attendeeCompany: "Estudio Benítez & Cía",
    registrationType: "Reserva Pagada",
    amountPaid: 50,
    paymentReference: "DEP-BANCO-7721",
    paymentReceiptUrl: "comprobante_cumbre_104.pdf",
    paymentStatus: "Confirmado",
    pointsAwarded: 300,
    registrationDate: "2026-08-08",
    ticketQrCode: "QR-EVT-BIG1-104",
  },
];

export function getPointsForSale(venta: VentaRegistrada, rules: PlanPointRule[]): number {
  const qty = typeof venta.cantidad === "number" && venta.cantidad > 0 ? venta.cantidad : 1;
  const name = (venta.nombreProducto || "").toLowerCase();
  const cat = (venta.categoriaProducto || "").toLowerCase();

  let unitPoints = 15;

  // 1. ERP Plans
  if (name.includes("star") || name.includes("erp star")) {
    const r = rules.find((x) => x.id === "plan-erp-1");
    if (r) unitPoints = name.includes("anual") || name.includes("12") ? (r.secondaryPoints ?? 70) : r.points;
    else unitPoints = 50;
  } else if (name.includes("plus") || name.includes("erp plus")) {
    const r = rules.find((x) => x.id === "plan-erp-2");
    if (r) unitPoints = name.includes("anual") || name.includes("12") ? (r.secondaryPoints ?? 100) : r.points;
    else unitPoints = 50;
  } else if (name.includes("premium") || name.includes("erp premium")) {
    const r = rules.find((x) => x.id === "plan-erp-3");
    if (r) unitPoints = name.includes("anual") || name.includes("12") ? (r.secondaryPoints ?? 150) : r.points;
    else unitPoints = 50;
  } else if (name.includes("ilimitado") || name.includes("contador ilimitado")) {
    // 2. Contadores
    const r = rules.find((x) => x.id === "plan-cont-2");
    unitPoints = r ? r.points : 300;
  } else if (cat.includes("contador") || name.includes("contador") || name.includes("10 empresas")) {
    const r = rules.find((x) => x.id === "plan-cont-1");
    unitPoints = r ? r.points : 50;
  } else if (name.includes("ultra") || name.includes("professional") || name.includes("profesional")) {
    // 3. Facturación
    const r = rules.find((x) => x.id === "plan-fact-2");
    unitPoints = r ? r.points : 30;
  } else if (
    name.includes("light") ||
    name.includes("base") ||
    name.includes("power") ||
    name.includes("ideal") ||
    name.includes("inicial") ||
    name.includes("intermedio") ||
    cat.includes("facturacion")
  ) {
    const r = rules.find((x) => x.id === "plan-fact-1");
    unitPoints = r ? r.points : 15;
  } else if (cat.includes("firma") || name.includes("firma")) {
    // 4. Firmas
    const isJuridica = name.includes("juridica") || name.includes("jurídica") || name.includes("representante");
    const isLongDuration = name.includes("4") || name.includes("5") || name.includes("4 años") || name.includes("5 años");
    if (isJuridica) {
      const r = rules.find((x) => x.id === "plan-firma-2");
      if (r) unitPoints = isLongDuration ? (r.secondaryPoints ?? 70) : r.points;
      else unitPoints = 30;
    } else {
      const r = rules.find((x) => x.id === "plan-firma-1");
      if (r) unitPoints = isLongDuration ? (r.secondaryPoints ?? 50) : r.points;
      else unitPoints = 20;
    }
  }

  return unitPoints * qty;
}

interface PointHistoryItem {
  id: string;
  date: string;
  type: "earning" | "redemption";
  description: string;
  points: number;
  status: "Completado" | "En Proceso" | "Aprobado";
}

interface NewsModuleProps {
  userRole?: string;
  initialSubTab?: "empresa" | "noticias" | "beneficios";
  userPerms?: TabPermissionConfig;
}

export function NewsModule({ userRole, initialSubTab = "empresa", userPerms: propsUserPerms }: NewsModuleProps) {
  const isGerenciaUser = userRole === "gerencia" || sessionStorage.getItem("godi_user") === "gerencia";

  // Sub-tabs State: "empresa" | "noticias" | "beneficios"
  const [subTab, setSubTab] = useState<"empresa" | "noticias" | "beneficios">(initialSubTab);

  // User Permissions State
  const [currentPerms, setCurrentPerms] = useState<TabPermissionConfig>(() => {
    if (propsUserPerms) return propsUserPerms;
    const activeUser = sessionStorage.getItem("godi_user") || userRole || "admin";
    return getPermissionsForSocio(activeUser);
  });

  useEffect(() => {
    if (propsUserPerms) {
      setCurrentPerms(propsUserPerms);
    }
  }, [propsUserPerms]);

  useEffect(() => {
    const handlePermsSync = () => {
      const activeUser = sessionStorage.getItem("godi_user") || userRole || "admin";
      setCurrentPerms(getPermissionsForSocio(activeUser));
    };
    window.addEventListener("kpier_permissions_updated", handlePermsSync);
    return () => window.removeEventListener("kpier_permissions_updated", handlePermsSync);
  }, [userRole]);

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const [newsList, setNewsList] = useState<NewsItem[]>(() => {
    try {
      const saved = localStorage.getItem("kpier_custom_news_items");
      if (saved) {
        const custom: NewsItem[] = JSON.parse(saved);
        if (Array.isArray(custom) && custom.length > 0) {
          const customIds = new Set(custom.map((c) => c.id));
          const initialFiltered = INITIAL_NEWS.filter((n) => !customIds.has(n.id));
          return [...custom, ...initialFiltered];
        }
      }
    } catch (e) {}
    return INITIAL_NEWS;
  });

  // Sync custom news list across components and browser windows
  useEffect(() => {
    const handleNewsSync = () => {
      try {
        const saved = localStorage.getItem("kpier_custom_news_items");
        if (saved) {
          const custom: NewsItem[] = JSON.parse(saved);
          if (Array.isArray(custom)) {
            const customIds = new Set(custom.map((c) => c.id));
            const initialFiltered = INITIAL_NEWS.filter((n) => !customIds.has(n.id));
            setNewsList([...custom, ...initialFiltered]);
          }
        } else {
          setNewsList(INITIAL_NEWS);
        }
      } catch (e) {}
    };

    window.addEventListener("kpier_news_list_updated", handleNewsSync);
    return () => window.removeEventListener("kpier_news_list_updated", handleNewsSync);
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("TODAS");
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  // Dynamic Counter State (Base 75 + registered partners)
  const [baseSocios, setBaseSocios] = useState<number>(() => {
    const local = localStorage.getItem("kpier_news_socios_base");
    return local ? parseInt(local, 10) || 75 : 75;
  });
  const [addedSociosCount, setAddedSociosCount] = useState<number>(0);
  const [isEditBaseModalOpen, setIsEditBaseModalOpen] = useState(false);
  const [customBaseInput, setCustomBaseInput] = useState<string>("");

  // Puntos & Compensaciones State
  const [benefitsSubTab, setBenefitsSubTab] = useState<"canjes" | "educacion">("canjes");

  // Event Schedule & Registrations State
  const [eventsList, setEventsList] = useState<EventItem[]>(() => {
    try {
      const saved = localStorage.getItem("kpier_events_list");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_EVENTS;
  });

  const saveEventsList = (newList: EventItem[]) => {
    setEventsList(newList);
    try {
      localStorage.setItem("kpier_events_list", JSON.stringify(newList));
      window.dispatchEvent(new Event("kpier_events_updated"));
    } catch (e) {}
  };

  useEffect(() => {
    const syncEvents = () => {
      try {
        const saved = localStorage.getItem("kpier_events_list");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setEventsList(parsed);
        }
      } catch (e) {}
    };
    window.addEventListener("kpier_events_updated", syncEvents);
    return () => window.removeEventListener("kpier_events_updated", syncEvents);
  }, []);

  // Event Creation & Edition Modal State (Gerencia)
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [editingEventItem, setEditingEventItem] = useState<EventItem | null>(null);
  const [eventForm, setEventForm] = useState({
    title: "",
    category: "Capacitación Semanal" as "Capacitación Semanal" | "Evento Grande / Convención",
    month: "Agosto 2026",
    dateFormatted: "",
    timeFormatted: "17:00 - 19:00 (2 Horas)",
    location: "Aula Virtual VIP Zoom",
    speakerName: "",
    speakerRole: "",
    organizer: "UpConta S.A.S. & GoDi Partner Network",
    description: "",
    totalSeats: 50,
    pricePaidReservation: 10,
    pointsAwardedIfPaid: 100,
    includesBreakfastAndCert: false,
  });

  const handleOpenAddEventModal = () => {
    setEditingEventItem(null);
    setEventForm({
      title: "",
      category: "Capacitación Semanal",
      month: "Agosto 2026",
      dateFormatted: "",
      timeFormatted: "17:00 - 19:00 (2 Horas)",
      location: "Aula Virtual VIP Zoom",
      speakerName: "",
      speakerRole: "",
      organizer: "UpConta S.A.S. & GoDi Partner Network",
      description: "",
      totalSeats: 50,
      pricePaidReservation: 10,
      pointsAwardedIfPaid: 100,
      includesBreakfastAndCert: false,
    });
    setIsAddEventModalOpen(true);
  };

  const handleOpenEditEventModal = (ev: EventItem) => {
    setEditingEventItem(ev);
    setEventForm({
      title: ev.title,
      category: ev.category,
      month: ev.month || "Agosto 2026",
      dateFormatted: ev.dateFormatted,
      timeFormatted: ev.timeFormatted,
      location: ev.location,
      speakerName: ev.speakerName,
      speakerRole: ev.speakerRole,
      organizer: ev.organizer,
      description: ev.description,
      totalSeats: ev.totalSeats,
      pricePaidReservation: ev.pricePaidReservation,
      pointsAwardedIfPaid: ev.pointsAwardedIfPaid,
      includesBreakfastAndCert: !!ev.includesBreakfastAndCert,
    });
    setIsAddEventModalOpen(true);
  };

  const handleSaveEventModal = () => {
    if (!eventForm.title.trim() || !eventForm.dateFormatted.trim()) {
      alert("⚠️ El título y la fecha del evento son obligatorios.");
      return;
    }

    if (editingEventItem) {
      const updated = eventsList.map((item) => {
        if (item.id === editingEventItem.id) {
          return {
            ...item,
            title: eventForm.title.trim(),
            category: eventForm.category,
            month: eventForm.month as "Agosto 2026" | "Septiembre 2026",
            dateFormatted: eventForm.dateFormatted.trim(),
            timeFormatted: eventForm.timeFormatted.trim(),
            location: eventForm.location.trim(),
            speakerName: eventForm.speakerName.trim(),
            speakerRole: eventForm.speakerRole.trim(),
            organizer: eventForm.organizer.trim(),
            description: eventForm.description.trim(),
            totalSeats: Math.max(1, Number(eventForm.totalSeats) || 50),
            pricePaidReservation: Math.max(0, Number(eventForm.pricePaidReservation) || 0),
            pointsAwardedIfPaid: Math.max(0, Number(eventForm.pointsAwardedIfPaid) || 0),
            includesBreakfastAndCert: eventForm.includesBreakfastAndCert,
          };
        }
        return item;
      });
      saveEventsList(updated);
      setIsAddEventModalOpen(false);
      setEditingEventItem(null);
      alert("✅ ¡Capacitación / Evento actualizado exitosamente!");
    } else {
      const newEvent: EventItem = {
        id: `evt-custom-${Date.now()}`,
        title: eventForm.title.trim(),
        category: eventForm.category,
        month: eventForm.month as "Agosto 2026" | "Septiembre 2026",
        dateFormatted: eventForm.dateFormatted.trim(),
        timeFormatted: eventForm.timeFormatted.trim(),
        location: eventForm.location.trim(),
        speakerName: eventForm.speakerName.trim(),
        speakerRole: eventForm.speakerRole.trim(),
        organizer: eventForm.organizer.trim(),
        description: eventForm.description.trim(),
        totalSeats: Math.max(1, Number(eventForm.totalSeats) || 50),
        priceFree: 0,
        pricePaidReservation: Math.max(0, Number(eventForm.pricePaidReservation) || 0),
        pointsAwardedIfPaid: Math.max(0, Number(eventForm.pointsAwardedIfPaid) || 0),
        includesBreakfastAndCert: eventForm.includesBreakfastAndCert,
      };
      const updated = [newEvent, ...eventsList];
      saveEventsList(updated);
      setIsAddEventModalOpen(false);
      alert("🎉 ¡Nueva capacitación / evento creado con éxito y visible en Educación Continua!");
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm("¿Está seguro de eliminar esta capacitación o evento especial? Esta acción no se puede deshacer.")) {
      const updated = eventsList.filter((ev) => ev.id !== eventId);
      saveEventsList(updated);
      alert("🗑️ Evento / Capacitación eliminado correctamente.");
    }
  };
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>(() => {
    const saved = localStorage.getItem("kpier_event_registrations");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_EVENT_REGISTRATIONS;
  });

  // Filter for Event Cronograma
  const [selectedEventMonth, setSelectedEventMonth] = useState<"TODOS" | "Agosto 2026" | "Septiembre 2026">("TODOS");
  const [selectedEventType, setSelectedEventType] = useState<"TODOS" | "Capacitación Semanal" | "Evento Grande / Convención">("TODOS");

  // Registration Modal State
  const [selectedEventForReg, setSelectedEventForReg] = useState<EventItem | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Form State for Event Registration
  const [regMode, setRegMode] = useState<"SELF" | "GUEST">("SELF");
  const [regTicketType, setRegTicketType] = useState<"Gratuito" | "Reserva Pagada">("Gratuito");
  const [regPaidAmount, setRegPaidAmount] = useState<number>(10);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestCompany, setGuestCompany] = useState("");
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentProofFile, setPaymentProofFile] = useState<string>("");

  // Ticket QR Pass Confirmation Modal State
  const [confirmedRegistration, setConfirmedRegistration] = useState<EventRegistration | null>(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  // Gerencia Event Management Filters
  const [gerenciaSelectedEventId, setGerenciaSelectedEventId] = useState<string>("ALL");
  const [gerenciaEventSearch, setGerenciaEventSearch] = useState("");

  const [planRules, setPlanRules] = useState<PlanPointRule[]>(() => {
    const saved = localStorage.getItem("kpier_plan_points_rules");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_PLAN_POINT_RULES;
  });
  const [isEditingRules, setIsEditingRules] = useState(false);
  const [tempRules, setTempRules] = useState<PlanPointRule[]>(planRules);

  const [rewardsCatalog, setRewardsCatalog] = useState<RewardItem[]>(() => {
    return getStoredRewardsCatalog();
  });
  const [isEditingRewards, setIsEditingRewards] = useState(false);
  const [tempRewards, setTempRewards] = useState<RewardItem[]>(rewardsCatalog);

  // Sync state if rewards updated elsewhere
  useEffect(() => {
    const handleSync = () => {
      const stored = getStoredRewardsCatalog();
      setRewardsCatalog(stored);
      setTempRewards(stored);
    };
    window.addEventListener("kpier_rewards_updated", handleSync);
    return () => window.removeEventListener("kpier_rewards_updated", handleSync);
  }, []);

  // Modal & Catalog Management State for Gerencia (Agregar, Editar, Eliminar, Activo/Inactivo, Vigencia)
  const [isAddBenefitModalOpen, setIsAddBenefitModalOpen] = useState(false);
  const [editingRewardItem, setEditingRewardItem] = useState<RewardItem | null>(null);
  const [rewardToDelete, setRewardToDelete] = useState<RewardItem | null>(null);

  const [benefitForm, setBenefitForm] = useState({
    title: "",
    category: "Firmas" as RewardItem["category"],
    pointsCost: 100,
    description: "",
    badge: "",
    activo: true,
    esPromocion: false,
    vigencia: "",
  });

  const handleOpenAddBenefitModal = () => {
    setEditingRewardItem(null);
    setBenefitForm({
      title: "",
      category: "Firmas",
      pointsCost: 100,
      description: "",
      badge: "",
      activo: true,
      esPromocion: false,
      vigencia: "",
    });
    setIsAddBenefitModalOpen(true);
  };

  const handleOpenEditBenefitModal = (reward: RewardItem) => {
    setEditingRewardItem(reward);
    setBenefitForm({
      title: reward.title,
      category: reward.category,
      pointsCost: reward.pointsCost,
      description: reward.description || "",
      badge: reward.badge || "",
      activo: reward.activo !== false,
      esPromocion: !!reward.esPromocion,
      vigencia: reward.vigencia || "",
    });
    setIsAddBenefitModalOpen(true);
  };

  const handleSaveBenefitModal = () => {
    if (!benefitForm.title.trim()) {
      alert("Por favor ingrese el título del beneficio.");
      return;
    }

    if (editingRewardItem) {
      const updated = rewardsCatalog.map((item) => {
        if (item.id === editingRewardItem.id) {
          return {
            ...item,
            title: benefitForm.title.trim(),
            category: benefitForm.category,
            pointsCost: Math.max(0, Number(benefitForm.pointsCost) || 0),
            description: benefitForm.description.trim(),
            badge: benefitForm.badge.trim() || undefined,
            activo: benefitForm.activo,
            esPromocion: benefitForm.esPromocion,
            vigencia: benefitForm.esPromocion && benefitForm.vigencia.trim() ? benefitForm.vigencia.trim() : undefined,
          };
        }
        return item;
      });
      setRewardsCatalog(updated);
      setTempRewards(updated);
      saveRewardsCatalog(updated);
      setIsAddBenefitModalOpen(false);
      setEditingRewardItem(null);
      setRewardToast("¡Beneficio actualizado correctamente!");
    } else {
      const newReward: RewardItem = {
        id: `rw-${Date.now()}`,
        title: benefitForm.title.trim(),
        category: benefitForm.category,
        pointsCost: Math.max(0, Number(benefitForm.pointsCost) || 0),
        description: benefitForm.description.trim(),
        icon: "Gift",
        badge: benefitForm.badge.trim() || undefined,
        activo: benefitForm.activo,
        esPromocion: benefitForm.esPromocion,
        vigencia: benefitForm.esPromocion && benefitForm.vigencia.trim() ? benefitForm.vigencia.trim() : undefined,
      };
      const updated = [newReward, ...rewardsCatalog];
      setRewardsCatalog(updated);
      setTempRewards(updated);
      saveRewardsCatalog(updated);
      setIsAddBenefitModalOpen(false);
      setRewardToast("¡Nuevo beneficio agregado al catálogo!");
    }
    setTimeout(() => setRewardToast(null), 4000);
  };

  const handleToggleActiveReward = (id: string) => {
    const updated = rewardsCatalog.map((item) => {
      if (item.id === id) {
        return { ...item, activo: item.activo === false ? true : false };
      }
      return item;
    });
    setRewardsCatalog(updated);
    setTempRewards(updated);
    saveRewardsCatalog(updated);
    setRewardToast("¡Estado de visibilidad del beneficio actualizado!");
    setTimeout(() => setRewardToast(null), 3000);
  };

  const handleDeleteRewardConfirm = () => {
    if (!rewardToDelete) return;
    const updated = rewardsCatalog.filter((item) => item.id !== rewardToDelete.id);
    setRewardsCatalog(updated);
    setTempRewards(updated);
    saveRewardsCatalog(updated);
    setRewardToDelete(null);
    setRewardToast("¡Beneficio eliminado correctamente!");
    setTimeout(() => setRewardToast(null), 4000);
  };

  const [socioSearchTerm, setSocioSearchTerm] = useState("");

  // Active Socio session info
  const activeUserName = useMemo(() => getActivePartnerName(), []);
  const activeUserCode = useMemo(() => sessionStorage.getItem("godi_user_code") || "", []);
  const activeUserEmail = useMemo(() => sessionStorage.getItem("godi_user_email") || "", []);

  // Redemption Requests State (Shared between Gerencia & Socios)
  const [redemptionRequests, setRedemptionRequests] = useState<RedemptionRequest[]>(() => {
    const saved = localStorage.getItem("kpier_redemption_requests");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_REDEMPTION_REQUESTS;
  });

  // Modal State for Benefit Redemption
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [selectedRewardForRedeem, setSelectedRewardForRedeem] = useState<RewardItem | null>(null);
  const [redeemPasswordInput, setRedeemPasswordInput] = useState("");
  const [redeemPasswordError, setRedeemPasswordError] = useState<string | null>(null);

  // Search & Filter for Gerencia's Requests Table
  const [reqSearchTerm, setReqSearchTerm] = useState("");
  const [reqStatusFilter, setReqStatusFilter] = useState<"ALL" | "Pendiente" | "Entregado" | "Rechazado">("ALL");

  // Manual Point Adjustment State (Gerencia)
  const [manualPointSocioId, setManualPointSocioId] = useState("");
  const [manualPointAmount, setManualPointAmount] = useState<number>(0);
  const [manualPointReason, setManualPointReason] = useState("");

  const sociosList = useMemo(() => {
    const slots = getPartnerCodeSlots();
    return slots
      .filter((s) => s.used && s.nombre)
      .map((s) => ({ id: s.code, nombre: s.nombre || s.code }));
  }, []);

  const handleGrantManualPoints = () => {
    if (!manualPointSocioId) {
      alert("Seleccione un socio para acreditar puntos.");
      return;
    }
    if (!manualPointAmount || manualPointAmount <= 0) {
      alert("Ingrese una cantidad válida de puntos.");
      return;
    }
    const foundSocio = sociosList.find((s) => s.id === manualPointSocioId);
    setRewardToast(`¡Acreditados ${manualPointAmount} Pts a ${foundSocio?.nombre || manualPointSocioId}!`);
    setManualPointSocioId("");
    setManualPointAmount(0);
    setManualPointReason("");
    setTimeout(() => setRewardToast(null), 4000);
  };

  const [rewardToast, setRewardToast] = useState<string | null>(null);

  // Helper to save plan rules (Gerencia)
  const handleSavePlanRules = () => {
    setPlanRules(tempRules);
    localStorage.setItem("kpier_plan_points_rules", JSON.stringify(tempRules));
    setIsEditingRules(false);
    setRewardToast("¡Reglas de puntajes por plan guardadas correctamente!");
    setTimeout(() => setRewardToast(null), 4000);
  };

  // Helper to save rewards catalog (Gerencia)
  const handleSaveRewardsCatalog = () => {
    setRewardsCatalog(tempRewards);
    saveRewardsCatalog(tempRewards);
    setIsEditingRewards(false);
    setRewardToast("¡Catálogo de beneficios guardado correctamente!");
    setTimeout(() => setRewardToast(null), 4000);
  };

  const [ventasVersion, setVentasVersion] = useState(0);

  useEffect(() => {
    const handleVentasOrPointsUpdate = () => {
      setVentasVersion((prev) => prev + 1);
    };

    window.addEventListener("kpier_ventas_updated", handleVentasOrPointsUpdate);
    window.addEventListener("kpier_points_updated", handleVentasOrPointsUpdate);
    window.addEventListener("storage", handleVentasOrPointsUpdate);

    return () => {
      window.removeEventListener("kpier_ventas_updated", handleVentasOrPointsUpdate);
      window.removeEventListener("kpier_points_updated", handleVentasOrPointsUpdate);
      window.removeEventListener("storage", handleVentasOrPointsUpdate);
    };
  }, []);

  // Calculate points earned from sales + paid event registrations ONLY for active socio
  const activeSocioEarnedPoints = useMemo(() => {
    if (isGerenciaUser) return 0;

    let sales: VentaRegistrada[] = [];
    try {
      const rawSales = localStorage.getItem("kpier_ventas_registradas");
      if (rawSales) sales = JSON.parse(rawSales);
    } catch (e) {}

    const sName = (activeUserName || "").toLowerCase().trim();
    const sEmail = (activeUserEmail || "").toLowerCase().trim();
    const sCode = (activeUserCode || "").toUpperCase().trim();

    const mySales = sales.filter((v) => {
      const vName = (v.vendedor || v.socioNombre || "").toLowerCase().trim();
      const vCode = (v.userCode || "").toUpperCase().trim();
      const vEmail = (v.userEmail || "").toLowerCase().trim();

      return (
        (sCode && vCode && vCode === sCode) ||
        (sEmail && vEmail && vEmail === sEmail) ||
        (sName && sName !== "socio registrado" && vName && vName === sName)
      );
    });

    const salesPoints = mySales.reduce((sum, v) => sum + getPointsForSale(v, planRules), 0);

    const myEventPoints = eventRegistrations.filter((r) => {
      const rName = (r.socioNombre || "").toLowerCase().trim();
      const rEmail = (r.socioEmail || "").toLowerCase().trim();
      const rCode = (r.socioCode || "").toUpperCase().trim();

      const isMatch =
        (sCode && rCode && rCode === sCode) ||
        (sEmail && rEmail && rEmail === sEmail) ||
        (sName && sName !== "socio registrado" && rName && rName === sName);

      return isMatch && r.registrationType === "Reserva Pagada" && r.pointsAwarded > 0;
    }).reduce((sum, r) => sum + r.pointsAwarded, 0);

    return salesPoints + myEventPoints;
  }, [activeUserName, activeUserCode, activeUserEmail, planRules, isGerenciaUser, eventRegistrations, ventasVersion]);

  // Points used/deducted by active socio in Pending or Approved requests
  const activeSocioRedeemedPoints = useMemo(() => {
    if (isGerenciaUser) return 0;
    const sName = (activeUserName || "").toLowerCase().trim();
    const sEmail = (activeUserEmail || "").toLowerCase().trim();
    const sCode = (activeUserCode || "").toUpperCase().trim();

    const myReqs = redemptionRequests.filter((req) => {
      const rName = (req.socioNombre || "").toLowerCase().trim();
      const rEmail = (req.socioEmail || "").toLowerCase().trim();
      const rCode = (req.socioCode || "").toUpperCase().trim();

      const isMatch =
        (sCode && rCode && rCode === sCode) ||
        (sEmail && rEmail && rEmail === sEmail) ||
        (sName && sName !== "socio registrado" && rName && rName === sName);

      return isMatch && (req.status === "Pendiente" || req.status === "Entregado");
    });

    return myReqs.reduce((sum, r) => sum + r.pointsCost, 0);
  }, [redemptionRequests, activeUserName, activeUserCode, activeUserEmail, isGerenciaUser]);

  // Dynamic Current Balance for Active Socio (Sales Points - Redeemed Points)
  const activeSocioCurrentBalance = useMemo(() => {
    return Math.max(0, activeSocioEarnedPoints - activeSocioRedeemedPoints);
  }, [activeSocioEarnedPoints, activeSocioRedeemedPoints]);

  // Helper to calculate dynamic current balance for ANY socio
  const getSocioPointsBalance = (slot: { code?: string; nombre?: string; email?: string }) => {
    let sales: VentaRegistrada[] = [];
    try {
      const rawSales = localStorage.getItem("kpier_ventas_registradas");
      if (rawSales) sales = JSON.parse(rawSales);
    } catch (e) {}

    const sName = (slot.nombre || "").toLowerCase().trim();
    const sEmail = (slot.email || "").toLowerCase().trim();
    const sCode = (slot.code || "").toUpperCase().trim();

    const matchedSales = sales.filter((v) => {
      const vName = (v.vendedor || v.socioNombre || "").toLowerCase().trim();
      const vCode = (v.userCode || "").toUpperCase().trim();
      const vEmail = (v.userEmail || "").toLowerCase().trim();

      return (
        (sCode && vCode && vCode === sCode) ||
        (sEmail && vEmail && vEmail === sEmail) ||
        (sName && sName !== "socio registrado" && vName && vName === sName)
      );
    });

    const totalEarned = matchedSales.reduce((sum, v) => sum + getPointsForSale(v, planRules), 0);

    const matchedReqs = redemptionRequests.filter((req) => {
      const rName = (req.socioNombre || "").toLowerCase().trim();
      const rEmail = (req.socioEmail || "").toLowerCase().trim();
      const rCode = (req.socioCode || "").toUpperCase().trim();

      const isMatch =
        (sCode && rCode && rCode === sCode) ||
        (sEmail && rEmail && rEmail === sEmail) ||
        (sName && sName !== "socio registrado" && rName && rName === sName);

      return isMatch && (req.status === "Pendiente" || req.status === "Entregado");
    });

    const totalRedeemed = matchedReqs.reduce((sum, r) => sum + r.pointsCost, 0);

    return Math.max(0, totalEarned - totalRedeemed);
  };

  // Open Benefit Redemption Confirmation Modal
  const handleOpenRedeemModal = (reward: RewardItem) => {
    setSelectedRewardForRedeem(reward);
    setRedeemPasswordInput("");
    setRedeemPasswordError(null);
    setIsRedeemModalOpen(true);
  };

  // Confirm Benefit Redemption Handler
  const handleConfirmRedeem = () => {
    if (!selectedRewardForRedeem) return;

    if (!redeemPasswordInput.trim()) {
      setRedeemPasswordError("Por favor ingrese su clave o contraseña de socio para autorizar el canje.");
      return;
    }

    if (activeSocioCurrentBalance < selectedRewardForRedeem.pointsCost) {
      setRedeemPasswordError(`No dispone de suficiente saldo de ventas. Su saldo actual es: ${activeSocioCurrentBalance} Pts.`);
      return;
    }

    const newReq: RedemptionRequest = {
      id: `req-${Date.now()}`,
      socioCode: activeUserCode || "KPIER-SOCIO",
      socioNombre: activeUserName || "Socio Registrado",
      socioEmail: activeUserEmail || "socio@kpier.com",
      rewardId: selectedRewardForRedeem.id,
      rewardTitle: selectedRewardForRedeem.title,
      rewardCategory: selectedRewardForRedeem.category,
      pointsCost: selectedRewardForRedeem.pointsCost,
      date: new Date().toISOString().split("T")[0],
      status: "Pendiente",
    };

    const updatedReqs = [newReq, ...redemptionRequests];
    setRedemptionRequests(updatedReqs);
    localStorage.setItem("kpier_redemption_requests", JSON.stringify(updatedReqs));

    setIsRedeemModalOpen(false);
    setSelectedRewardForRedeem(null);
    setRedeemPasswordInput("");
    setRedeemPasswordError(null);

    setRewardToast(`🎉 ¡Solicitud de canje registrada! Se han descontado ${newReq.pointsCost} Pts. Pendiente de aprobación por Gerencia.`);
    setTimeout(() => setRewardToast(null), 5000);
  };

  // Gerencia Update Status Handler (Aceptar / Entregado o Rechazar)
  const handleUpdateRedemptionStatus = (reqId: string, newStatus: "Entregado" | "Rechazado") => {
    const updated = redemptionRequests.map((req) =>
      req.id === reqId ? { ...req, status: newStatus } : req
    );
    setRedemptionRequests(updated);
    localStorage.setItem("kpier_redemption_requests", JSON.stringify(updated));

    if (newStatus === "Entregado") {
      setRewardToast("¡Solicitud autorizada y marcada como ENTREGADO!");
    } else {
      setRewardToast("Solicitud rechazada. Los puntos fueron devueltos al saldo del socio.");
    }
    setTimeout(() => setRewardToast(null), 4000);
  };

  // Filter Redemption Requests for Gerencia Table
  const filteredRedemptionRequests = useMemo(() => {
    return redemptionRequests.filter((req) => {
      const matchesStatus = reqStatusFilter === "ALL" || req.status === reqStatusFilter;
      if (!matchesStatus) return false;

      if (!reqSearchTerm.trim()) return true;
      const q = reqSearchTerm.toLowerCase().trim();
      return (
        req.socioNombre.toLowerCase().includes(q) ||
        req.socioCode.toLowerCase().includes(q) ||
        req.rewardTitle.toLowerCase().includes(q) ||
        req.rewardCategory.toLowerCase().includes(q)
      );
    });
  }, [redemptionRequests, reqSearchTerm, reqStatusFilter]);

  // Combined History Items for Table (Socio: ONLY their own sales/requests; Gerencia: ALL)
  const displayPointHistory = useMemo(() => {
    let sales: VentaRegistrada[] = [];
    try {
      const rawSales = localStorage.getItem("kpier_ventas_registradas");
      if (rawSales) sales = JSON.parse(rawSales);
    } catch (e) {}

    const sName = (activeUserName || "").toLowerCase().trim();
    const sEmail = (activeUserEmail || "").toLowerCase().trim();
    const sCode = (activeUserCode || "").toUpperCase().trim();

    // Filter Sales
    const relevantSales = sales.filter((v) => {
      if (isGerenciaUser) return true;
      const vName = (v.vendedor || v.socioNombre || "").toLowerCase().trim();
      const vCode = (v.userCode || "").toUpperCase().trim();
      const vEmail = (v.userEmail || "").toLowerCase().trim();

      return (
        (sCode && vCode && vCode === sCode) ||
        (sEmail && vEmail && vEmail === sEmail) ||
        (sName && sName !== "socio registrado" && vName && vName === sName)
      );
    });

    // Filter Redemption Requests
    const relevantReqs = redemptionRequests.filter((req) => {
      if (isGerenciaUser) return true;
      const rName = (req.socioNombre || "").toLowerCase().trim();
      const rEmail = (req.socioEmail || "").toLowerCase().trim();
      const rCode = (req.socioCode || "").toUpperCase().trim();

      return (
        (sCode && rCode && rCode === sCode) ||
        (sEmail && rEmail && rEmail === sEmail) ||
        (sName && sName !== "socio registrado" && rName && rName === sName)
      );
    });

    // Convert sales to earning history items
    const salesItems = relevantSales.map((v, idx) => {
      const pts = getPointsForSale(v, planRules);
      const vendorName = v.vendedor || v.socioNombre || "Socio";
      const vAny = v as any;
      const descPlan = vAny.planNombre || vAny.categoria || vAny.producto || vAny.plan || vAny.planDetalle || "Plan";
      return {
        id: `sale-pts-${v.id || idx}-${idx}`,
        date: vAny.fecha || v.fechaRegistro || "2026-08-01",
        type: "earning" as const,
        description: isGerenciaUser
          ? `[${vendorName}] Acreditación por Venta: ${descPlan}`
          : `Acreditación por Venta: ${descPlan}`,
        points: pts,
        status: "Completado" as const,
      };
    });

    // Convert requests to redemption history items
    const reqItems = relevantReqs.map((req, idx) => {
      return {
        id: `req-pts-${req.id || idx}-${idx}`,
        date: req.date,
        type: "redemption" as const,
        description: isGerenciaUser
          ? `[${req.socioNombre}] Solicitud Canje: ${req.rewardTitle}`
          : `Solicitud de Canje: ${req.rewardTitle}`,
        points: -req.pointsCost,
        status: req.status === "Entregado" ? ("Completado" as const) : req.status === "Rechazado" ? ("Rechazado" as const) : ("Pendiente" as const),
      };
    });

    // Convert paid event registrations to history items
    const eventItems = eventRegistrations
      .filter((r) => {
        if (isGerenciaUser) return true;
        const rName = (r.socioNombre || "").toLowerCase().trim();
        const rEmail = (r.socioEmail || "").toLowerCase().trim();
        const rCode = (r.socioCode || "").toUpperCase().trim();

        return (
          (sCode && rCode && rCode === sCode) ||
          (sEmail && rEmail && rEmail === sEmail) ||
          (sName && sName !== "socio registrado" && rName && rName === sName)
        );
      })
      .map((r, idx) => ({
        id: `event-pts-${r.id || idx}-${idx}`,
        date: r.registrationDate,
        type: "earning" as const,
        description: isGerenciaUser
          ? `[${r.socioNombre}] Capacitación/Evento: ${r.eventTitle} (${r.attendeeName})`
          : `Reserva Evento/Capacitación: ${r.eventTitle} (${r.attendeeName})`,
        points: r.pointsAwarded,
        status: "Completado" as const,
      }));

    const combined = [...salesItems, ...reqItems, ...eventItems];
    combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return combined;
  }, [activeUserName, activeUserCode, activeUserEmail, planRules, isGerenciaUser, redemptionRequests, eventRegistrations]);

  // Handle Event Registration Submit
  const handleRegisterEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventForReg) return;

    const isPaid = regTicketType === "Reserva Pagada";
    const amount = isPaid ? regPaidAmount : 0;
    const points = isPaid ? selectedEventForReg.pointsAwardedIfPaid : 0;

    let aName = activeUserName || "Socio Registrado";
    let aEmail = activeUserEmail || "socio@kpier.com";
    let aPhone = "0990000000";
    let aCompany = "";

    if (regMode === "GUEST") {
      if (!guestName.trim() || !guestEmail.trim()) {
        alert("Por favor complete el nombre y correo del asistente invitado.");
        return;
      }
      aName = guestName.trim();
      aEmail = guestEmail.trim();
      aPhone = guestPhone.trim() || "0990000000";
      aCompany = guestCompany.trim();
    }

    const newReg: EventRegistration = {
      id: `reg-${Date.now()}`,
      eventId: selectedEventForReg.id,
      eventTitle: selectedEventForReg.title,
      eventDate: selectedEventForReg.dateFormatted,
      socioCode: activeUserCode || "KPIER-SOC-001",
      socioNombre: activeUserName || "Socio Registrado",
      socioEmail: activeUserEmail || "socio@kpier.com",
      attendeeName: aName,
      attendeeEmail: aEmail,
      attendeePhone: aPhone,
      attendeeCompany: aCompany,
      registrationType: regTicketType,
      amountPaid: amount,
      paymentReference: isPaid ? paymentRef.trim() || `TRF-${Math.floor(Math.random() * 899999 + 100000)}` : undefined,
      paymentReceiptUrl: isPaid ? (paymentProofFile || "comprobante_adjunto.pdf") : undefined,
      paymentStatus: "Confirmado",
      pointsAwarded: points,
      registrationDate: new Date().toISOString().split("T")[0],
      ticketQrCode: `QR-${selectedEventForReg.id.toUpperCase()}-${Math.floor(Math.random() * 8999 + 1000)}`,
    };

    const updatedRegs = [newReg, ...eventRegistrations];
    setEventRegistrations(updatedRegs);
    localStorage.setItem("kpier_event_registrations", JSON.stringify(updatedRegs));

    setIsRegisterModalOpen(false);
    setConfirmedRegistration(newReg);
    setIsPassModalOpen(true);

    if (isPaid && points > 0) {
      setRewardToast(`¡Registro confirmado! Se han acreditado +${points} Puntos a tu saldo por reservar tu cupo con pago.`);
    } else {
      setRewardToast("¡Registro confirmado exitosamente! Revisa el pase de entrada QR simulado enviado a tu correo.");
    }
    setTimeout(() => setRewardToast(null), 5000);
  };

  // Export Event Attendees PDF Report Handler (for Gerencia)
  const handleExportEventAttendeesPDF = (eventItem?: EventItem, filterEventId: string = "ALL") => {
    try {
      const doc = new jsPDF();
      let attendees = eventRegistrations;
      let title = "Todos los Eventos de Educación Continua";
      let subtitle = "Agosto & Septiembre 2026";

      if (eventItem) {
        attendees = eventRegistrations.filter((r) => r.eventId === eventItem.id);
        title = eventItem.title;
        subtitle = `${eventItem.dateFormatted} | Expositor: ${eventItem.speakerName}`;
      } else if (filterEventId !== "ALL") {
        const found = eventsList.find((e) => e.id === filterEventId);
        if (found) {
          attendees = eventRegistrations.filter((r) => r.eventId === found.id);
          title = found.title;
          subtitle = `${found.dateFormatted} | Expositor: ${found.speakerName}`;
        }
      }

      // Header Banner
      doc.setFillColor(11, 37, 69);
      doc.rect(0, 0, 210, 32, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("UpConta ERP & ANF AC - Reporte Oficial de Asistencia", 14, 15);

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.text(`Evento: ${title.substring(0, 65)}`, 14, 22);
      doc.text(subtitle, 14, 27);

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Listado de Asistentes Confirmados", 14, 42);

      const totalRegs = attendees.length;
      const totalFree = attendees.filter((a) => a.registrationType === "Gratuito").length;
      const totalPaid = attendees.filter((a) => a.registrationType === "Reserva Pagada").length;
      const totalRecaudado = attendees.reduce((sum, a) => sum + (a.amountPaid || 0), 0);

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.text(`Total Confirmados: ${totalRegs}  |  Cupos Gratis: ${totalFree}  |  Reservas Pagadas: ${totalPaid}  |  Recaudación: $${totalRecaudado} USD`, 14, 48);

      let y = 56;
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, 182, 8, "F");

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(51, 65, 85);

      doc.text("#", 16, y + 5.5);
      doc.text("Nombre Asistente", 24, y + 5.5);
      doc.text("Email / Contacto", 78, y + 5.5);
      doc.text("Socio Invitante", 122, y + 5.5);
      doc.text("Tipo / Pago", 162, y + 5.5);
      doc.text("Pase QR", 185, y + 5.5);

      y += 11;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);

      if (attendees.length === 0) {
        doc.text("No hay inscritos registrados para este evento.", 16, y);
      } else {
        attendees.forEach((att, idx) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }

          doc.text(`${idx + 1}`, 16, y);
          doc.text(att.attendeeName.substring(0, 26), 24, y);
          doc.text(`${att.attendeeEmail.substring(0, 22)}`, 78, y);
          doc.text(att.socioNombre.substring(0, 18), 122, y);
          doc.text(att.registrationType === "Reserva Pagada" ? `Pagado ($${att.amountPaid})` : "Gratis $0", 162, y);
          doc.text(att.ticketQrCode.substring(0, 12), 185, y);

          y += 7;
          doc.setDrawColor(226, 232, 240);
          doc.line(14, y - 4, 196, y - 4);
        });
      }

      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Documento emitido por Gerencia GoDi & UpConta S.A.S. - ${new Date().toLocaleDateString()}`, 14, 285);

      doc.save(`Reporte_Asistentes_Eventos_${Date.now()}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Hubo un detalle al generar el archivo PDF.");
    }
  };

  // Export Event Attendees CSV/Excel Report Handler (for Gerencia)
  const handleExportEventAttendeesExcel = (eventItem?: EventItem, filterEventId: string = "ALL") => {
    let attendees = eventRegistrations;
    if (eventItem) {
      attendees = eventRegistrations.filter((r) => r.eventId === eventItem.id);
    } else if (filterEventId !== "ALL") {
      attendees = eventRegistrations.filter((r) => r.eventId === filterEventId);
    }

    const headers = [
      "ID Registro",
      "Evento",
      "Fecha Evento",
      "Nombre Asistente",
      "Email Asistente",
      "Teléfono Asistente",
      "Empresa/RUC",
      "Socio Invitante",
      "Código Socio",
      "Tipo Registro",
      "Monto Pagado ($)",
      "Ref. Pago",
      "Puntos Acreditados",
      "Estado",
      "Código Pase QR",
      "Fecha Registro",
    ];

    const rows = attendees.map((att) => [
      att.id,
      `"${att.eventTitle.replace(/"/g, '""')}"`,
      `"${att.eventDate}"`,
      `"${att.attendeeName.replace(/"/g, '""')}"`,
      `"${att.attendeeEmail.replace(/"/g, '""')}"`,
      `"${att.attendeePhone.replace(/"/g, '""')}"`,
      `"${(att.attendeeCompany || "").replace(/"/g, '""')}"`,
      `"${att.socioNombre.replace(/"/g, '""')}"`,
      `"${att.socioCode}"`,
      `"${att.registrationType}"`,
      att.amountPaid,
      `"${att.paymentReference || "N/A"}"`,
      att.pointsAwarded,
      `"${att.paymentStatus}"`,
      `"${att.ticketQrCode}"`,
      `"${att.registrationDate}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Reporte_Asistentes_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate TABLA 2: Listado de Socios (Ventas Totales y Puntos Acumulados)
  const sociosPuntosSummary = useMemo(() => {
    const slots: PartnerCodeSlot[] = getPartnerCodeSlots();
    let sales: VentaRegistrada[] = [];
    try {
      const rawSales = localStorage.getItem("kpier_ventas_registradas");
      if (rawSales) sales = JSON.parse(rawSales);
    } catch (e) {}

    // Active or assigned slots
    const activeSlots = slots.filter((s) => s.used || (s.nombre && s.nombre.trim() !== ""));

    return activeSlots.map((slot) => {
      const sName = (slot.nombre || "").toLowerCase().trim();
      const sEmail = (slot.email || "").toLowerCase().trim();
      const sCode = (slot.code || "").toUpperCase().trim();

      const matchedSales = sales.filter((v) => {
        const vName = (v.vendedor || v.socioNombre || "").toLowerCase().trim();
        const vCode = (v.userCode || "").toUpperCase().trim();
        const vEmail = (v.userEmail || "").toLowerCase().trim();

        return (
          (vName && vName === sName) ||
          (vCode && vCode === sCode) ||
          (vEmail && vEmail === sEmail)
        );
      });

      const totalVentasCount = matchedSales.length;
      const totalVentasMonto = matchedSales.reduce((sum, v) => sum + (v.totalVenta || 0), 0);
      const totalPuntosAcumulados = getSocioPointsBalance({ code: slot.code, nombre: slot.nombre, email: slot.email });

      return {
        id: slot.id,
        code: slot.code,
        nombre: slot.nombre || "Socio Registrado",
        email: slot.email || "No registrado",
        telefono: slot.telefono || "N/A",
        roleLabel: slot.role === "admin1" ? "Socio VIP Gold" : slot.role === "admin2" ? "Distribuidor" : "Socio Partner",
        estado: slot.estado || "Activo",
        fechaRegistro: slot.fechaRegistro || "2026-08-01",
        totalVentasCount,
        totalVentasMonto,
        totalPuntosAcumulados,
      };
    });
  }, [planRules, redemptionRequests]);

  const filteredSociosSummary = useMemo(() => {
    if (!socioSearchTerm.trim()) return sociosPuntosSummary;
    const q = socioSearchTerm.toLowerCase().trim();
    return sociosPuntosSummary.filter(
      (s) =>
        s.nombre.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
    );
  }, [sociosPuntosSummary, socioSearchTerm]);

  useEffect(() => {
    const fetchBaseAndCount = async () => {
      try {
        const res = await fetch("/api/news/base-socios");
        if (res.ok) {
          const data = await res.json();
          if (typeof data.baseCount === "number") {
            setBaseSocios(data.baseCount);
            localStorage.setItem("kpier_news_socios_base", data.baseCount.toString());
          }
        }
      } catch (e) {
        // Fallback to local storage if API call fails
      }

      try {
        const rawSocios = localStorage.getItem("kpier_socios_registrados");
        const rawUsers = localStorage.getItem("kpier_registered_users");
        const sociosArr = rawSocios ? JSON.parse(rawSocios) : [];
        const usersArr = rawUsers ? JSON.parse(rawUsers) : [];

        const uniqueKeys = new Set<string>();
        if (Array.isArray(sociosArr)) {
          sociosArr.forEach((s: any) => {
            const key = (s.id || s.email || s.nombreApellido || s.nombre || "").toLowerCase().trim();
            if (key) uniqueKeys.add(key);
          });
        }
        if (Array.isArray(usersArr)) {
          usersArr.forEach((u: any) => {
            const key = (u.id || u.email || u.nombre || "").toLowerCase().trim();
            if (key) uniqueKeys.add(key);
          });
        }
        setAddedSociosCount(uniqueKeys.size);
      } catch (err) {
        console.error("Error parsing registered partners:", err);
      }
    };

    fetchBaseAndCount();

    const handleUpdate = () => {
      const local = localStorage.getItem("kpier_news_socios_base");
      if (local) setBaseSocios(parseInt(local, 10) || 75);
      fetchBaseAndCount();
    };

    window.addEventListener("kpier_news_base_updated", handleUpdate);
    window.addEventListener("kpier_socios_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("kpier_news_base_updated", handleUpdate);
      window.removeEventListener("kpier_socios_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const totalNuevosSocios = baseSocios + addedSociosCount;

  const handleSaveBaseSocios = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customBaseInput, 10);
    if (isNaN(val) || val < 0) return;

    setBaseSocios(val);
    localStorage.setItem("kpier_news_socios_base", val.toString());
    window.dispatchEvent(new Event("kpier_news_base_updated"));

    try {
      await fetch("/api/news/base-socios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseCount: val }),
      });
    } catch (err) {
      console.error("Error saving base count to server:", err);
    }

    setIsEditBaseModalOpen(false);
  };

  // New News Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("UpConta");

  const filters = ["TODAS", "UpConta", "ANF"];

  const handleAddNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSummary.trim() || !newContent.trim()) return;

    const newItem: NewsItem = {
      id: "news-custom-" + Date.now(),
      title: newTitle.trim(),
      summary: newSummary.trim(),
      content: newContent.trim(),
      category: newCategory,
      date: "Agosto 2026",
      monthGroup: "Agosto 2026",
      author: userRole === "gerencia" ? "Gerencia General" : "Administración UpConta",
      badge: "Nueva Publicación",
    };

    try {
      const existingSaved = localStorage.getItem("kpier_custom_news_items");
      let customArr: NewsItem[] = [];
      if (existingSaved) {
        try {
          customArr = JSON.parse(existingSaved);
        } catch (err) {}
      }
      const updatedCustom = [newItem, ...customArr];
      localStorage.setItem("kpier_custom_news_items", JSON.stringify(updatedCustom));
      window.dispatchEvent(new Event("kpier_news_list_updated"));
    } catch (err) {}

    setNewsList((prev) => [newItem, ...prev.filter((x) => x.id !== newItem.id)]);
    setIsAddModalOpen(false);
    setNewTitle("");
    setNewSummary("");
    setNewContent("");
    setNewCategory("UpConta");
    setRewardToast("¡Noticia publicada y guardada exitosamente!");
    setTimeout(() => setRewardToast(null), 3500);
  };

  const handleDeleteNews = (id: string) => {
    try {
      const existingSaved = localStorage.getItem("kpier_custom_news_items");
      if (existingSaved) {
        let customArr: NewsItem[] = JSON.parse(existingSaved);
        customArr = customArr.filter((n) => n.id !== id);
        localStorage.setItem("kpier_custom_news_items", JSON.stringify(customArr));
        window.dispatchEvent(new Event("kpier_news_list_updated"));
      }
    } catch (err) {}
    setNewsList((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNews = newsList.filter((item) => {
    const matchesFilter =
      selectedFilter === "TODAS" || item.category === selectedFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const augustNews = newsList.filter((item) => item.monthGroup === "Agosto 2026");
  const julyNews = newsList.filter((item) => item.monthGroup === "Julio 2026" && item.category === "UpConta");

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Toast Feedback Banner */}
      {rewardToast && (
        <div className="fixed top-20 right-5 z-50 bg-[#0B2545] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-amber-400 flex items-center gap-3 animate-bounce max-w-md">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-xs font-bold leading-snug">{rewardToast}</p>
        </div>
      )}

      {/* Main Header Section (Oculto en Beneficios para dejar solo las subpestañas) */}
      {subTab !== "beneficios" && (
        <div className="pb-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Newspaper className="w-6 h-6 text-[#0B2545]" />
              <span>{subTab === "empresa" ? "Socio Estratégico ANF AC / UpConta" : "Portal Noticias & Novedades"}</span>
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              {subTab === "empresa" ? "Información corporativa e institucional para socios estratégicos ANF AC y UpConta." : "Boletines oficiales, capacitaciones y avisos para socios."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Add News Button ONLY for Gerencia */}
            {userRole === "gerencia" && subTab === "noticias" && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-[#0B2545] hover:bg-[#133E72] active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>+ Agregar Noticia</span>
              </button>
            )}
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Ecuador • Agosto 2026</span>
            </div>
          </div>
        </div>
      )}



      {/* ========================================================================= */}
      {/* SUB-TAB 1: EMPRESA (Información Institucional ANF AC y UpConta) */}
      {/* ========================================================================= */}
      {subTab === "empresa" && (() => {
        const showAnf = currentPerms.sub_empresa_anf !== false;
        const showUpconta = currentPerms.sub_empresa_upconta !== false;
        const isBoth = showAnf && showUpconta;

        if (!showAnf && !showUpconta) {
          return (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3 animate-fade-in">
              <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">Información Institucional No Disponible</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                No se ha habilitado la visualización de información de empresas para este perfil. Contacte a la administración para habilitar el acceso.
              </p>
            </div>
          );
        }

        return (
          <div className="space-y-8 animate-fade-in">
            {/* EXECUTIVE COLUMNS: ANF AC (AZUL) & UPCONTA (NARANJA) */}
            <div className={`grid gap-8 items-start ${isBoth ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 max-w-4xl mx-auto"}`}>
              
              {/* 1. SECCIÓN ANF AC (AZUL) */}
              {showAnf && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <div className="p-3 bg-blue-600 text-white rounded-xl shadow-xs">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">ANF AC</h3>
                        <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                          Ecuador
                        </span>
                      </div>
                      <p className="text-sm text-blue-600 font-bold mt-0.5">Autoridad de Certificación Acreditada por ARCOTEL</p>
                    </div>
                  </div>

                  {/* Intro Text */}
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                    <strong className="text-slate-900 font-bold">ANF AC (Autoridad de Certificación)</strong> es la institución líder en emisión de firmas electrónicas acreditada por la ARCOTEL en el Ecuador. Desarrollamos infraestructura de clave pública (PKI) y soluciones de identidad digital con validez legal completa para el sector público y privado.
                  </p>

                  {/* Misión ANF AC */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2.5 text-blue-700">
                      <Target className="w-5 h-5 text-blue-600 shrink-0" />
                      <h4 className="text-lg font-black text-slate-900">Misión de ANF AC</h4>
                    </div>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-7">
                      Construir confianza en el entorno digital mediante la provisión de firmas electrónicas seguras, garantizando la validez jurídica, la integridad documental y el no repudio en las transacciones electrónicas de empresas, profesionales y ciudadanos.
                    </p>
                  </div>

                  {/* Visión ANF AC */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2.5 text-blue-700">
                      <Globe2 className="w-5 h-5 text-blue-600 shrink-0" />
                      <h4 className="text-lg font-black text-slate-900">Visión de ANF AC</h4>
                    </div>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-7">
                      Consolidarse como el prestador de servicios de confianza digital de referencia internacional, liderando la innovación en certificación electrónica y la transformación de procesos hacia un modelo 100% digital y sin papel.
                    </p>
                  </div>
                </div>
              )}

              {/* 2. SECCIÓN UPCONTA (NARANJA) */}
              {showUpconta && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <div className="p-3 bg-amber-500 text-slate-950 rounded-xl shadow-xs">
                      <Building2 className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">UpConta</h3>
                        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                          SRI Cloud
                        </span>
                      </div>
                      <p className="text-sm text-amber-600 font-bold mt-0.5">Software Contable & Facturación Electrónica ERP</p>
                    </div>
                  </div>

                  {/* Intro Text */}
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                    <strong className="text-slate-900 font-bold">UpConta</strong> es el sistema ERP en la nube diseñado para optimizar la gestión contable, inventarios, compras y facturación electrónica de las pymes y contadores en Ecuador, en sincronización automática con los requerimientos del SRI.
                  </p>

                  {/* Misión UpConta */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2.5 text-amber-600">
                      <Target className="w-5 h-5 text-amber-600 shrink-0" />
                      <h4 className="text-lg font-black text-slate-900">Misión de UpConta</h4>
                    </div>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-7">
                      Simplificar el control financiero y tributario de los negocios en Ecuador mediante herramientas inteligentes, automatizando obligaciones fiscales y reduciendo significativamente la carga operativa contable.
                    </p>
                  </div>

                  {/* Visión UpConta */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2.5 text-amber-600">
                      <Globe2 className="w-5 h-5 text-amber-600 shrink-0" />
                      <h4 className="text-lg font-black text-slate-900">Visión de UpConta</h4>
                    </div>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-7">
                      Ser la plataforma en la nube predilecta por empresas y emprendedores para gestionar la totalidad de sus operaciones financieras, brindando seguridad, escalabilidad y un ecosistema integrado de alta productividad.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: NOTICIAS (Listado de Boletines y Contador de Socios) */}
      {/* ========================================================================= */}
      {subTab === "noticias" && (
        <div className="space-y-8 animate-fade-in">
          {/* CONTADOR DE NUEVOS SOCIOS BANNER (SOLO VISIBLE EN PERFIL DE GERENCIA) */}
          {isGerenciaUser && (
            <div className="bg-gradient-to-r from-[#0B2545] via-[#133E72] to-[#1E3A8A] rounded-2xl p-5 shadow-lg border border-blue-900/40 text-white flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -left-10 -top-10 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-4.5 relative z-10 w-full md:w-auto">
                <div className="p-3.5 bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 rounded-2xl shadow-md shrink-0 flex items-center justify-center">
                  <UserPlus className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/15 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                      Crecimiento de la Red KPIer
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Actualización en Vivo
                    </span>
                  </div>
                  
                  <div className="flex items-baseline gap-2 mt-1">
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Nuevos Socios Registrados:
                    </h2>
                    <span className="text-3xl sm:text-4xl font-black text-amber-400 drop-shadow-xs font-mono">
                      {totalNuevosSocios}
                    </span>
                  </div>
                  <p className="text-xs text-blue-100/90 font-medium mt-0.5">
                    Comunidad activa de socios y distribuidores en expansión continua a nivel nacional.
                  </p>
                </div>
              </div>

              {/* Gerencia Edit Button */}
              <button
                onClick={() => {
                  setCustomBaseInput(baseSocios.toString());
                  setIsEditBaseModalOpen(true);
                }}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-extrabold text-xs rounded-xl border border-white/20 transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer relative z-10 self-start md:self-center"
                title="Modificar cantidad base de socios (Exclusivo Gerencia)"
              >
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>Modificar Base Socios</span>
              </button>
            </div>
          )}

          {/* DUAL SPOTLIGHT PANELS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            
            {/* LEFT CARD: Sorpréndete en Agosto 2026 */}
            <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-amber-300 transition-all">
              <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
                    <Rocket className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-black tracking-wide">¡Sorpréndete en Agosto! 🚀</h2>
                    <p className="text-[11px] text-amber-100 font-medium">Próximos lanzamientos UpConta ERP</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-white/20 text-white font-extrabold text-[10px] uppercase rounded-lg tracking-wider backdrop-blur-xs">
                  Agosto 2026
                </span>
              </div>

              <div className="p-5 space-y-3.5 flex-1">
                <p className="text-xs font-semibold text-slate-600 pb-1 border-b border-slate-100">
                  Próximas funcionalidades y requerimientos normativos en desarrollo para este mes:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Feature 1 */}
                  <div
                    onClick={() => setSelectedNews(augustNews[0] || INITIAL_NEWS[0])}
                    className="p-3 bg-amber-50/50 hover:bg-amber-100/60 rounded-xl border border-amber-200/80 transition-all cursor-pointer group space-y-1.5"
                  >
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                      <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="line-clamp-1">Placa transporte comercial</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                      Campo automático vehicular en facturación y guías de remisión.
                    </p>
                  </div>

                  {/* Feature 2 */}
                  <div
                    onClick={() => setSelectedNews(augustNews[1] || INITIAL_NEWS[1])}
                    className="p-3 bg-amber-50/50 hover:bg-amber-100/60 rounded-xl border border-amber-200/80 transition-all cursor-pointer group space-y-1.5"
                  >
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                      <FileCode className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="line-clamp-1">RUC proveedor software SRI</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                      Información adicional obligatoria de la marca contable en XML/RIDE.
                    </p>
                  </div>

                  {/* Feature 3 */}
                  <div
                    onClick={() => setSelectedNews(augustNews[2] || INITIAL_NEWS[2])}
                    className="p-3 bg-amber-50/50 hover:bg-amber-100/60 rounded-xl border border-amber-200/80 transition-all cursor-pointer group space-y-1.5"
                  >
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                      <ShoppingBag className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="line-clamp-1">Integración WooCommerce</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                      Sincronización de stock e-commerce y emisión de facturas al instante.
                    </p>
                  </div>

                  {/* Feature 4 */}
                  <div
                    onClick={() => setSelectedNews(augustNews[3] || INITIAL_NEWS[3])}
                    className="p-3 bg-amber-50/50 hover:bg-amber-100/60 rounded-xl border border-amber-200/80 transition-all cursor-pointer group space-y-1.5"
                  >
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                      <Scale className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="line-clamp-1">Conversión de medidas</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                      Tablas de equivalencias en compras/ventas para kárdex flexible.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-100 px-5 flex items-center justify-between text-xs text-amber-900 font-bold">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Exclusivo UpConta ERP</span>
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Lanzamiento progresivo</span>
              </div>
            </div>

            {/* RIGHT CARD: Resumen de Logros - Julio 2026 */}
            <div className="bg-white rounded-2xl border border-blue-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-blue-300 transition-all">
              <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-[#0B2545] p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white/10 rounded-xl backdrop-blur-xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-black tracking-wide">Resumen de Logros — Julio 2026 📊</h2>
                    <p className="text-[11px] text-blue-200 font-medium">Funcionalidades activas en UpConta ERP</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-extrabold text-[10px] uppercase rounded-lg tracking-wider">
                  100% Operativo
                </span>
              </div>

              <div className="p-5 space-y-4 flex-1">
                <p className="text-xs font-semibold text-slate-600 pb-1 border-b border-slate-100">
                  Módulos e innovaciones implementadas con éxito durante el mes de Julio:
                </p>

                <div className="space-y-3">
                  {/* Achievement 1 */}
                  <div
                    onClick={() => setSelectedNews(julyNews[0] || INITIAL_NEWS[4])}
                    className="p-3.5 bg-blue-50/50 hover:bg-blue-100/60 rounded-xl border border-blue-200/80 transition-all cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-blue-900 font-black text-xs">
                        <Receipt className="w-4 h-4 text-blue-700" />
                        <span>Mejora en la gestión de compras</span>
                      </div>
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        Completado
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium pt-1">
                      Carga masiva optimizada de XML/RIDE de proveedores, vinculación automática de productos y pre-asientos contables instantáneos.
                    </p>
                  </div>

                  {/* Achievement 2 */}
                  <div
                    onClick={() => setSelectedNews(julyNews[1] || INITIAL_NEWS[5])}
                    className="p-3.5 bg-blue-50/50 hover:bg-blue-100/60 rounded-xl border border-blue-200/80 transition-all cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-blue-900 font-black text-xs">
                        <UtensilsCrossed className="w-4 h-4 text-blue-700" />
                        <span>Cortes de caja en restaurantes</span>
                      </div>
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        Completado
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium pt-1">
                      Arqueos ciegos X y Z, control de propinas gastronómicas, cuadre por forma de pago y auditoría detallada de cajeros por turno.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-100 px-5 flex items-center justify-between text-xs text-blue-900 font-bold">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-700" />
                  <span>Sistemas UpConta</span>
                </span>
                <span className="text-[11px] text-emerald-700 font-bold">Disponible en producción</span>
              </div>
            </div>

          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar en el catálogo de noticias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 justify-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                Filtrar:
              </span>
              {filters.map((f, idx) => (
                <button
                  key={`news-filter-${f}-${idx}`}
                  onClick={() => setSelectedFilter(f)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                    selectedFilter === f
                      ? "bg-[#0B2545] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {f === "UpConta" ? "UpConta ERP" : f === "ANF" ? "Firmas ANF" : "Todas las Noticias"}
                </button>
              ))}
            </div>
          </div>

          {/* All News List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredNews.map((item, idx) => (
              <div
                key={item.id ? `news-item-${item.id}-${idx}` : `news-item-${idx}`}
                className={`bg-white border rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between ${
                  item.monthGroup === "Agosto 2026"
                    ? "border-amber-200 bg-gradient-to-br from-white via-white to-amber-50/20"
                    : "border-slate-200"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-black rounded-md uppercase tracking-wider ${
                          item.category === "UpConta"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {item.category}
                      </span>

                      {item.badge && (
                        <span
                          className={`px-2 py-0.5 font-extrabold text-[10px] rounded-md ${
                            item.badge.includes("Agosto") || item.badge.includes("Nueva")
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {item.date}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-3">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-slate-400 truncate max-w-[140px]">
                    {item.author}
                  </span>

                  <div className="flex items-center gap-2">
                    {userRole === "gerencia" && item.id.startsWith("news-custom-") && (
                      <button
                        onClick={() => handleDeleteNews(item.id)}
                        title="Eliminar noticia"
                        className="p-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedNews(item)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-[#0B2545] hover:text-white text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>Ver detalles</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: BENEFICIOS (Catálogo de Beneficios y Educación Continua) */}
      {/* ========================================================================= */}
      {subTab === "beneficios" && (
        <div className="space-y-8 animate-fade-in">
          {/* Sub-navigation Tabs Bar: Solo Beneficios y Educación Continua */}
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
            <button
              onClick={() => setBenefitsSubTab("canjes")}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                benefitsSubTab === "canjes"
                  ? "bg-[#0B2545] text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Gift className="w-4 h-4 text-amber-400" />
              <span>Beneficios</span>
            </button>

            <button
              onClick={() => setBenefitsSubTab("educacion")}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer relative ${
                benefitsSubTab === "educacion"
                  ? "bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <GraduationCap className="w-4 h-4 text-amber-300" />
              <span>Educación continua</span>
            </button>
          </div>

          {/* ------------------------------------------------------------------------- */}
          {/* SUB-SECTION 1: BENEFICIOS */}
          {/* ------------------------------------------------------------------------- */}
          {benefitsSubTab === "canjes" && (
            <div className="space-y-8 animate-fade-in">
          {/* ========================================================================= */}
          {/* CATÁLOGO DE BENEFICIOS, BONOS PAC DE CAPACITACIÓN Y PUNTAJES (DISEÑO TICKET) */}
          <div className="bg-white rounded-2xl border border-amber-300/80 p-6 sm:p-7 shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-amber-100 pb-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500 text-slate-950 rounded-xl shadow-xs">
                  <Gift className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Catálogo de Beneficios, Bonos PAC de Capacitación y Puntajes
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {isGerenciaUser
                      ? "Catálogo de beneficios canjeables por puntos. Desde Gerencia puede agregar nuevos beneficios, modificar puntajes, configurar vigencias de promoción y activar/desactivar beneficios."
                      : "Catálogo oficial de beneficios, licencias, firmas electrónicas y bonos de capacitación disponibles para canje."}
                  </p>
                </div>
              </div>

              {isGerenciaUser && (
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={handleOpenAddBenefitModal}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ Agregar Nuevo Beneficio</span>
                  </button>

                  {isEditingRewards ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setTempRewards(rewardsCatalog);
                          setIsEditingRewards(false);
                        }}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancelar</span>
                      </button>
                      <button
                        onClick={handleSaveRewardsCatalog}
                        className="px-4 py-2 bg-[#0B2545] hover:bg-[#133E72] text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Save className="w-4 h-4 text-amber-400" />
                        <span>Guardar Puntajes</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setTempRewards(rewardsCatalog);
                        setIsEditingRewards(true);
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl border border-slate-300 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Edit3 className="w-4 h-4 text-amber-600" />
                      <span>Modificar Puntajes Rápido</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* TABLA ESTILO TICKET DE BENEFICIOS CON FILAS Y COLUMNAS */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-slate-500 font-black uppercase text-[10px] tracking-wider">
                    <th className="py-2 px-4 w-2/5">Descripción de Producto / Beneficio</th>
                    <th className="py-2 px-4 w-1/4">La Prima / Bono</th>
                    <th className="py-2 px-4 text-center w-1/6">Puntos Requeridos</th>
                    <th className="py-2 px-4 text-right w-1/5">Canjear Beneficio</th>
                  </tr>
                </thead>
                <tbody>
                  {(isGerenciaUser
                    ? (isEditingRewards ? tempRewards : rewardsCatalog)
                    : rewardsCatalog.filter((r) => r.activo !== false)
                  ).map((reward, idx) => {
                    const canAfford = activeSocioCurrentBalance >= reward.pointsCost;
                    const isInactive = reward.activo === false;

                    return (
                      <tr key={reward.id ? `reward-${reward.id}-${idx}` : `reward-${idx}`} className="group">
                        <td colSpan={4} className="p-0 border-none">
                          <div className={`rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border relative overflow-hidden shadow-2xs hover:shadow-md transition-all ${
                            isInactive
                              ? "bg-slate-50 border-slate-300 opacity-80"
                              : reward.esPromocion
                              ? "bg-gradient-to-r from-amber-50/80 via-amber-50/30 to-white border-amber-300"
                              : "bg-white border-slate-200 hover:border-amber-400"
                          }`}>
                            {/* Borde lateral ticket */}
                            <div className={`absolute left-0 top-0 bottom-0 w-2.5 ${
                              isInactive ? "bg-slate-400" : reward.esPromocion ? "bg-amber-500" : "bg-amber-400"
                            }`} />

                            {/* Muecas de ticket */}
                            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-slate-100 rounded-full border border-slate-300 hidden sm:block" />
                            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-slate-100 rounded-full border border-slate-300 hidden sm:block" />

                            {/* Columna 1: Descripción de Producto */}
                            <div className="pl-3 sm:pl-4 space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 font-extrabold text-[10px] rounded-md uppercase border border-slate-200">
                                  {reward.category}
                                </span>
                                {reward.badge && (
                                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] rounded-md">
                                    {reward.badge}
                                  </span>
                                )}
                                {reward.esPromocion && (
                                  <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-[10px] rounded-md flex items-center gap-1 shadow-2xs">
                                    <Flame className="w-3 h-3 animate-pulse" />
                                    <span>PROMOCIÓN</span>
                                  </span>
                                )}
                                {isGerenciaUser && isInactive && (
                                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 font-black text-[10px] rounded-md flex items-center gap-1">
                                    <EyeOff className="w-3 h-3 text-slate-500" />
                                    <span>Oculto</span>
                                  </span>
                                )}
                              </div>

                              <h4 className="text-sm font-black text-slate-900 leading-snug">
                                {reward.title}
                              </h4>

                              {reward.vigencia && (
                                <div className="text-[11px] text-amber-900 font-bold flex items-center gap-1 pt-0.5">
                                  <Flame className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span>Vigencia: {reward.vigencia}</span>
                                </div>
                              )}
                            </div>

                            {/* Divisor punteado ticket */}
                            <div className="hidden md:block w-px h-14 border-r border-dashed border-slate-300 shrink-0 mx-1" />

                            {/* Columna 2: La Prima / Bono */}
                            <div className="w-full md:w-44 shrink-0 space-y-1">
                              <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                                La Prima / Bono
                              </span>
                              <div className="p-2 bg-amber-50/80 rounded-xl border border-amber-200/80 font-bold text-xs text-amber-950 flex items-center gap-2">
                                <Gift className="w-4 h-4 text-amber-600 shrink-0" />
                                <span className="line-clamp-2">
                                  {reward.badge || (reward.esPromocion ? "Bono Especial PAC" : "Beneficio Directo de Socio")}
                                </span>
                              </div>
                            </div>

                            {/* Divisor punteado ticket */}
                            <div className="hidden md:block w-px h-14 border-r border-dashed border-slate-300 shrink-0 mx-1" />

                            {/* Columna 3: Los Puntos */}
                            <div className="w-full md:w-32 shrink-0 text-left md:text-center space-y-1">
                              <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                                Los Puntos
                              </span>
                              {isEditingRewards ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min="0"
                                    value={reward.pointsCost}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value, 10) || 0;
                                      setTempRewards((prev) =>
                                        prev.map((r) => (r.id === reward.id ? { ...r, pointsCost: val } : r))
                                      );
                                    }}
                                    className="w-full px-2 py-1 border border-amber-400 bg-amber-50 text-slate-900 font-mono font-black text-xs rounded-lg focus:outline-none text-center"
                                  />
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-950 font-mono font-black text-sm rounded-xl border border-amber-300 shadow-2xs">
                                  <Coins className="w-4 h-4 text-amber-600 shrink-0" />
                                  <span>{reward.pointsCost} Pts</span>
                                </div>
                              )}
                            </div>

                            {/* Divisor punteado ticket */}
                            <div className="hidden md:block w-px h-14 border-r border-dashed border-slate-300 shrink-0 mx-1" />

                            {/* Columna 4: Botón Canjear */}
                            <div className="w-full md:w-44 shrink-0 flex items-center justify-end">
                              {isGerenciaUser ? (
                                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleActiveReward(reward.id)}
                                    className={`px-2.5 py-1.5 text-[11px] font-extrabold rounded-xl border flex items-center gap-1 transition-all cursor-pointer ${
                                      isInactive
                                        ? "bg-slate-200 text-slate-700 border-slate-300 hover:bg-emerald-100 hover:text-emerald-800"
                                        : "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-rose-100 hover:text-rose-800"
                                    }`}
                                  >
                                    {isInactive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    <span>{isInactive ? "Inactivo" : "Activo"}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditBenefitModal(reward)}
                                    className="p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-800 transition-colors cursor-pointer"
                                    title="Editar"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setRewardToDelete(reward)}
                                    className="p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-rose-100 hover:text-rose-800 transition-colors cursor-pointer"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleOpenRedeemModal(reward)}
                                  disabled={!canAfford}
                                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs ${
                                    canAfford
                                      ? "bg-amber-500 hover:bg-amber-600 text-slate-950 hover:scale-[1.02] shadow-sm"
                                      : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                                  }`}
                                >
                                  <Gift className="w-4 h-4" />
                                  <span>{canAfford ? "Canjear Beneficio" : `Faltan ${reward.pointsCost - activeSocioCurrentBalance} Pts`}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* HISTORIAL DE MOVIMIENTOS Y CANJES */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-700" />
                <h3 className="text-base font-black text-slate-900">
                  Historial de Movimientos & Canjes {isGerenciaUser ? "(Consolidado Todos los Socios)" : "(Tus Movimientos)"}
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {isGerenciaUser ? "Registros generales de ventas y canjes" : "Historial exclusivo del socio"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Fecha</th>
                    <th className="py-2.5 px-3">Tipo</th>
                    <th className="py-2.5 px-3">Descripción</th>
                    <th className="py-2.5 px-3 text-right">Puntos</th>
                    <th className="py-2.5 px-3 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayPointHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 font-medium text-xs">
                        No hay movimientos registrados en el historial aún.
                      </td>
                    </tr>
                  ) : (
                    displayPointHistory.map((item, idx) => (
                      <tr key={item.id ? `pthist-${item.id}-${idx}` : `pthist-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-500 whitespace-nowrap">{item.date}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                              item.type === "earning"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-900"
                            }`}
                          >
                            {item.type === "earning" ? "Acreditación" : "Canje"}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-800">{item.description}</td>
                        <td
                          className={`py-3 px-3 text-right font-black font-mono text-xs ${
                            item.points > 0 ? "text-emerald-600" : "text-amber-800"
                          }`}
                        >
                          {item.points > 0 ? `+${item.points}` : item.points} Pts
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span
                            className={`px-2 py-0.5 font-extrabold text-[10px] rounded-md ${
                              item.status === "Completado" || item.status === "Aprobado"
                                ? "bg-emerald-100 text-emerald-800"
                                : item.status === "Rechazado"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-900"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TABLA 1: LISTADO DE PLANES Y PUNTOS QUE REPRESENTA CADA UNO */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 text-amber-900 rounded-xl">
                  <Star className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Listado de Planes, Servicios y Puntos por Venta
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {isGerenciaUser
                      ? "Desde el perfil de Gerencia puede modificar los puntos asignados a cada plan y guardar los cambios."
                      : "Puntuación acreditada automáticamente por cada plan y servicio vendido en la plataforma."}
                  </p>
                </div>
              </div>

              {/* Botones de Edición / Guardado para Gerencia */}
              {isGerenciaUser && (
                <div className="flex items-center gap-2">
                  {isEditingRules ? (
                    <>
                      <button
                        onClick={() => {
                          setTempRules(planRules);
                          setIsEditingRules(false);
                        }}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancelar</span>
                      </button>
                      <button
                        onClick={handleSavePlanRules}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Save className="w-4 h-4" />
                        <span>Guardar Cambios de Puntaje</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setTempRules(planRules);
                        setIsEditingRules(true);
                      }}
                      className="px-4 py-2 bg-[#0B2545] hover:bg-[#133E72] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Edit3 className="w-4 h-4 text-amber-600" />
                      <span>Modificar Puntajes Rápido</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Plan / Servicio</th>
                    <th className="py-3 px-4">Categoría</th>
                    <th className="py-3 px-4 text-center">Puntos por Venta Directa</th>
                    <th className="py-3 px-4 text-center">Estado del Plan</th>
                    {isGerenciaUser && <th className="py-3 px-4 text-right">Ventas Totales Socios</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {(isEditingRules ? tempRules : planRules).map((rule, idx) => {
                    let allSalesList: VentaRegistrada[] = [];
                    try {
                      const raw = localStorage.getItem("kpier_ventas_registradas");
                      if (raw) allSalesList = JSON.parse(raw);
                    } catch (e) {}

                    const totalVentasPlan = isGerenciaUser
                      ? allSalesList.filter((v) => (v.nombreProducto || (v as any).planName) === rule.planName).length
                      : 0;

                    return (
                      <tr key={rule.planName ? `rule-${rule.planName}-${idx}` : `rule-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                          {rule.planName}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 font-extrabold text-[10px] rounded-md uppercase border border-slate-200">
                            {rule.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-black text-sm text-amber-800">
                          {isEditingRules ? (
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                min="0"
                                value={rule.pointsPerSale}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10) || 0;
                                  setTempRules((prev) =>
                                    prev.map((r) =>
                                      r.planName === rule.planName ? { ...r, pointsPerSale: val } : r
                                    )
                                  );
                                }}
                                className="w-20 px-2 py-1 border border-amber-400 bg-amber-50 text-slate-900 font-mono font-black text-xs rounded-lg text-center focus:outline-none"
                              />
                              <span className="text-xs text-amber-900 font-sans font-bold">Pts</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/90 text-amber-900 rounded-lg border border-amber-300">
                              <Coins className="w-3.5 h-3.5 text-amber-600" />
                              <span>+{rule.pointsPerSale} Pts</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-md uppercase border border-emerald-200">
                            Activo
                          </span>
                        </td>
                        {isGerenciaUser && (
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-600">
                            {totalVentasPlan} ventas
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Acreditación Especial / Ajuste Manual exclusivo para Gerencia */}
            {isGerenciaUser && (
              <div className="mt-6 pt-6 border-t border-slate-100 bg-slate-50/80 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-600" />
                    <span>Acreditación Manual de Puntos (Ajuste Gerencial)</span>
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Acredite puntos adicionales o Bonos PAC extraordinarios a la cuenta de un socio específico.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <select
                    value={manualPointSocioId}
                    onChange={(e) => setManualPointSocioId(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Seleccionar Socio...</option>
                    {sociosList.map((s, idx) => (
                      <option key={s.id ? `socio-opt-${s.id}-${idx}` : `socio-opt-${idx}`} value={s.id}>
                        {s.nombre} ({s.id})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="Cant. Pts"
                    value={manualPointAmount || ""}
                    onChange={(e) => setManualPointAmount(parseInt(e.target.value, 10) || 0)}
                    className="w-24 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-black text-slate-900 focus:outline-none focus:border-amber-500"
                  />

                  <input
                    type="text"
                    placeholder="Motivo (ej: Bono PAC Especial)"
                    value={manualPointReason}
                    onChange={(e) => setManualPointReason(e.target.value)}
                    className="flex-1 md:w-48 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                  />

                  <button
                    onClick={handleGrantManualPoints}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Acreditar Pts</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* GERENCIA ONLY: TABLA DE SOLICITUDES DE CANJE DE BENEFICIOS DE SOCIOS */}
          {/* ========================================================================= */}
          {isGerenciaUser && (
            <div className="bg-white rounded-2xl border border-amber-300 p-6 sm:p-7 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500 text-slate-950 rounded-xl shadow-sm">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900">
                        Tabla de Solicitudes de Beneficios de Socios
                      </h3>
                      <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] rounded-full uppercase">
                        Gestión Gerencial
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Bandeja de solicitudes de canje de beneficios. Verifique los puntos actuales del socio y apruebe para cambiar a estado "ENTREGADO".
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Status Filter buttons */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                    {(["ALL", "Pendiente", "Entregado", "Rechazado"] as const).map((st, idx) => (
                      <button
                        key={`st-filter-${st}-${idx}`}
                        onClick={() => setReqStatusFilter(st)}
                        className={`px-3 py-1 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer ${
                          reqStatusFilter === st
                            ? "bg-white text-slate-900 shadow-xs"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        {st === "ALL" ? "Todas" : st}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-60">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar por socio o beneficio..."
                      value={reqSearchTerm}
                      onChange={(e) => setReqSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Fecha Solicitud</th>
                      <th className="py-3 px-4">Código Socio</th>
                      <th className="py-3 px-4">Nombre Socio</th>
                      <th className="py-3 px-4">Beneficio Requerido</th>
                      <th className="py-3 px-4 text-center">Puntos Actuales Socio</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                      <th className="py-3 px-4 text-right">Acción Gerencial</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRedemptionRequests.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 font-bold text-xs">
                          No hay solicitudes de canje registradas con los filtros seleccionados.
                        </td>
                      </tr>
                    ) : (
                      filteredRedemptionRequests.map((req, idx) => {
                        const currentPts = getSocioPointsBalance({
                          code: req.socioCode,
                          nombre: req.socioName,
                        });
                        return (
                          <tr key={req.id ? `redreq-${req.id}-${idx}` : `redreq-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-500 whitespace-nowrap">
                              {req.date}
                            </td>
                            <td className="py-3 px-4 font-mono font-black text-amber-900">
                              {req.socioCode}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-900">
                              {req.socioName}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-800">
                              {req.rewardTitle}
                              <span className="block text-[10px] text-amber-800 font-mono">
                                {req.pointsCost} Pts
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center font-mono font-black text-slate-800">
                              {currentPts} Pts
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`px-2.5 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider ${
                                  req.status === "Entregado"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : req.status === "Rechazado"
                                    ? "bg-rose-100 text-rose-800"
                                    : "bg-amber-100 text-amber-900 animate-pulse"
                                }`}
                              >
                                {req.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              {req.status === "Pendiente" ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleUpdateRedemptionStatus(req.id, "Entregado")}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                                    title="Aprobar y entregar beneficio"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Aceptar (Entregado)</span>
                                  </button>
                                  <button
                                    onClick={() => handleUpdateRedemptionStatus(req.id, "Rechazado")}
                                    className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] rounded-xl border border-rose-200 transition-all cursor-pointer flex items-center gap-1"
                                    title="Rechazar solicitud"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Rechazar</span>
                                  </button>
                                </div>
                              ) : req.status === "Entregado" ? (
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-[11px] rounded-full inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>ENTREGADO</span>
                                </span>
                              ) : (
                                <span className="px-3 py-1 bg-rose-100 text-rose-800 border border-rose-200 font-bold text-[11px] rounded-full inline-flex items-center gap-1">
                                  <X className="w-3.5 h-3.5 text-rose-600" />
                                  <span>RECHAZADO</span>
                                </span>
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
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* SUB-SECTION 2: EDUCACIÓN CONTINUA (Cronograma Agosto & Septiembre 2026) */}
      {/* ------------------------------------------------------------------------- */}
      {benefitsSubTab === "educacion" && (
        <div className="space-y-8 animate-fade-in">
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Mes:</span>
              </span>
              {(["TODOS", "Agosto 2026", "Septiembre 2026"] as const).map((m, idx) => (
                <button
                  key={`month-filter-${m}-${idx}`}
                  onClick={() => setSelectedEventMonth(m)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    selectedEventMonth === m
                      ? "bg-[#0B2545] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Tipo:</span>
              </span>
              {(["TODOS", "Capacitación Semanal", "Evento Grande / Convención"] as const).map((t, idx) => (
                <button
                  key={`type-filter-${t}-${idx}`}
                  onClick={() => setSelectedEventType(t)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    selectedEventType === t
                      ? "bg-amber-500 text-slate-950 shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* CRONOGRAMA DISPLAY: GRID (TODOS) O TABLA (FILTROS) */}
          {selectedEventType === "TODOS" ? (
            /* CRONOGRAMA GRID DE TICKETS (Visualización para TODOS) */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {eventsList
                .filter((ev) => {
                  const matchMonth = selectedEventMonth === "TODOS" || ev.month === selectedEventMonth;
                  const matchType = selectedEventType === "TODOS" || ev.category === selectedEventType;
                  return matchMonth && matchType;
                })
                .map((eventItem, idx) => {
                  const isGrande = eventItem.category === "Evento Grande / Convención";
                  const currentRegsCount = eventRegistrations.filter((r) => r.eventId === eventItem.id).length;
                  const freeCount = eventRegistrations.filter((r) => r.eventId === eventItem.id && r.registrationType === "Gratuito").length;
                  const paidCount = eventRegistrations.filter((r) => r.eventId === eventItem.id && r.registrationType === "Reserva Pagada").length;

                  return (
                    <div
                      key={eventItem.id ? `grid-evt-${eventItem.id}-${idx}` : `grid-evt-${idx}`}
                      className={`bg-white rounded-3xl border transition-all duration-300 hover:shadow-xl overflow-hidden flex flex-col justify-between relative group ${
                        isGrande ? "border-amber-400/90 shadow-md ring-1 ring-amber-400/30" : "border-slate-200 shadow-sm"
                      }`}
                    >
                      {/* Top Ticket Header Stub */}
                      <div
                        className={`p-4 sm:p-5 text-white flex items-center justify-between border-b ${
                          isGrande
                            ? "bg-gradient-to-r from-[#0B2545] via-[#133E72] to-amber-900 border-amber-400/30"
                            : "bg-gradient-to-r from-slate-900 to-blue-950 border-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-white/15 backdrop-blur-xs text-white rounded-lg text-[10px] font-black uppercase tracking-wider border border-white/20 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-amber-400" />
                            <span>{eventItem.dateFormatted}</span>
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                              isGrande
                                ? "bg-amber-400 text-slate-950 font-black"
                                : "bg-blue-500/30 text-blue-200 border border-blue-400/30"
                            }`}
                          >
                            {eventItem.category}
                          </span>
                        </div>

                        {eventItem.includesBreakfastAndCert && (
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] rounded-md border border-emerald-400/30 flex items-center gap-1">
                            <Award className="w-3 h-3 text-emerald-400" />
                            <span>Certificado Incluido</span>
                          </span>
                        )}
                      </div>

                      {/* Ticket Content Body */}
                      <div className="p-5 sm:p-6 space-y-4 flex-1">
                        <div className="space-y-1.5">
                          <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug group-hover:text-blue-900 transition-colors">
                            {eventItem.title}
                          </h3>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">
                            {eventItem.description}
                          </p>
                        </div>

                        {/* Speaker & Location Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 bg-blue-50 text-blue-800 font-black rounded-xl border border-blue-200 flex items-center justify-center shrink-0">
                              <UserCheck className="w-4 h-4 text-blue-700" />
                            </div>
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Expositor / Facilitador:</span>
                              <span className="text-xs font-black text-slate-900">{eventItem.speakerName}</span>
                              <span className="text-[10px] text-slate-500 block leading-tight">{eventItem.speakerRole}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 bg-amber-50 text-amber-800 font-black rounded-xl border border-amber-200 flex items-center justify-center shrink-0">
                              <Clock className="w-4 h-4 text-amber-600" />
                            </div>
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Hora & Modalidad:</span>
                              <span className="text-xs font-black text-slate-900">{eventItem.timeFormatted}</span>
                              <span className="text-[10px] text-slate-500 block leading-tight">{eventItem.location}</span>
                            </div>
                          </div>
                        </div>

                        {/* Cupos Availability Indicator */}
                        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-700 flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-blue-600" />
                              <span>Capacidad de Cupos:</span>
                            </span>
                            <span className="text-slate-900 font-mono font-black">
                              {currentRegsCount} / {eventItem.totalSeats} Inscritos
                            </span>
                          </div>

                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isGrande ? "bg-gradient-to-r from-amber-500 to-orange-600" : "bg-blue-600"
                              }`}
                              style={{
                                width: `${Math.min(100, Math.round((currentRegsCount / eventItem.totalSeats) * 100))}%`,
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                            <span>Gratuitos: <strong className="text-slate-800">{freeCount}</strong></span>
                            <span>Reservas Pagadas: <strong className="text-emerald-700 font-bold">{paidCount}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Ticket Perforated Divider Visual */}
                      <div className="relative flex items-center justify-between px-4">
                        <div className="w-5 h-5 bg-slate-100 rounded-full -ml-6 border-r border-slate-300" />
                        <div className="w-full border-t-2 border-dashed border-slate-200 mx-2" />
                        <div className="w-5 h-5 bg-slate-100 rounded-full -mr-6 border-l border-slate-300" />
                      </div>

                      {/* Ticket Bottom Stub: Pricing & Action */}
                      <div className="p-5 bg-slate-50/90 rounded-b-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {eventItem.priceFree === 0 && (
                              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-black rounded-md uppercase border border-emerald-300">
                                Cupo Gratis $0
                              </span>
                            )}

                            {eventItem.pricePaidReservation > 0 && (
                              <span className="text-xs text-amber-900 font-extrabold bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-300">
                                Reserva: ${eventItem.pricePaidReservation} USD
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-amber-800 font-black">
                            <Coins className="w-3.5 h-3.5 text-amber-600" />
                            <span>Reserva Pagada Suma: +{eventItem.pointsAwardedIfPaid} Pts</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedEventForReg(eventItem);
                            setRegMode("SELF");
                            setRegTicketType("Gratuito");
                            setRegPaidAmount(eventItem.pricePaidReservation || 10);
                            setGuestName("");
                            setGuestEmail("");
                            setGuestPhone("");
                            setGuestCompany("");
                            setPaymentRef("");
                            setPaymentProofFile("");
                            setIsRegisterModalOpen(true);
                          }}
                          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                            isGrande
                              ? "bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-slate-950 hover:brightness-105"
                              : "bg-[#0B2545] hover:bg-[#133E72] text-white"
                          }`}
                        >
                          <Ticket className="w-4 h-4 text-amber-300" />
                          <span>Registrar Socio / Inscribir</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            /* CRONOGRAMA TIPO TABLA (Para Capacitaciones Semanales o Eventos Grandes) */
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
              {/* Header de la Tabla */}
              <div className="p-5 bg-gradient-to-r from-slate-900 via-[#0B2545] to-blue-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded-md uppercase tracking-wider">
                      Cronograma Oficial: {selectedEventType}
                    </span>
                    {selectedEventMonth !== "TODOS" && (
                      <span className="px-2.5 py-0.5 bg-blue-500/30 text-blue-200 border border-blue-400/30 font-bold text-[10px] rounded-md uppercase">
                        {selectedEventMonth}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-white">
                    {selectedEventType === "Capacitación Semanal"
                      ? "Tabla de Capacitaciones Tributarias, Contables & IA"
                      : "Tabla de Eventos Grandes & Convenciones VIP"}
                  </h3>
                </div>
                <div className="text-xs text-slate-300 font-medium bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/20 shrink-0">
                  Total Programados:{" "}
                  <strong className="text-amber-300 font-mono text-sm ml-1">
                    {
                      eventsList.filter((ev) => {
                        const matchMonth = selectedEventMonth === "TODOS" || ev.month === selectedEventMonth;
                        const matchType = ev.category === selectedEventType;
                        return matchMonth && matchType;
                      }).length
                    }
                  </strong>
                </div>
              </div>

              {/* Contenedor Responsivo de la Tabla */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[850px]">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-extrabold text-[11px] uppercase tracking-wider">
                      <th className="py-4 px-4">Fecha / Mes</th>
                      <th className="py-4 px-4">Tema &amp; Descripción</th>
                      <th className="py-4 px-4">Expositor / Facilitador</th>
                      <th className="py-4 px-4">Horario &amp; Modalidad</th>
                      <th className="py-4 px-4 text-center">Cupos Disponibles</th>
                      <th className="py-4 px-4 text-center">Inversión &amp; Puntos</th>
                      <th className="py-4 px-4 text-right">Inscripción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {eventsList
                      .filter((ev) => {
                        const matchMonth = selectedEventMonth === "TODOS" || ev.month === selectedEventMonth;
                        const matchType = ev.category === selectedEventType;
                        return matchMonth && matchType;
                      })
                      .map((eventItem, idx) => {
                        const isGrande = eventItem.category === "Evento Grande / Convención";
                        const currentRegsCount = eventRegistrations.filter((r) => r.eventId === eventItem.id).length;
                        const freeCount = eventRegistrations.filter((r) => r.eventId === eventItem.id && r.registrationType === "Gratuito").length;
                        const paidCount = eventRegistrations.filter((r) => r.eventId === eventItem.id && r.registrationType === "Reserva Pagada").length;

                        return (
                          <tr key={eventItem.id ? `tbl-evt-${eventItem.id}-${idx}` : `tbl-evt-${idx}`} className="hover:bg-blue-50/40 transition-colors">
                            {/* Fecha */}
                            <td className="py-4 px-4 align-top whitespace-nowrap">
                              <div className="flex flex-col gap-1">
                                <span className="px-2.5 py-1 bg-[#0B2545] text-white text-[11px] font-black rounded-lg inline-flex items-center gap-1 w-fit shadow-xs">
                                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                                  <span>{eventItem.dateFormatted}</span>
                                </span>
                                <span className="text-[10px] text-slate-500 font-bold ml-0.5">
                                  {eventItem.month}
                                </span>
                              </div>
                            </td>

                            {/* Tema & Descripción */}
                            <td className="py-4 px-4 align-top max-w-[280px]">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {eventItem.includesBreakfastAndCert && (
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-black rounded-md border border-emerald-300 inline-flex items-center gap-0.5">
                                      <Award className="w-2.5 h-2.5 text-emerald-600" />
                                      <span>Certificado Incluido</span>
                                    </span>
                                  )}
                                  {isGrande && (
                                    <span className="px-2 py-0.5 bg-amber-400 text-slate-950 text-[9px] font-black rounded-md shadow-xs uppercase">
                                      Gran Convención VIP
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-black text-slate-900 text-sm leading-snug">
                                  {eventItem.title}
                                </h4>
                                <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                                  {eventItem.description}
                                </p>
                              </div>
                            </td>

                            {/* Expositor */}
                            <td className="py-4 px-4 align-top whitespace-nowrap">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-800 font-black flex items-center justify-center text-xs shrink-0 border border-blue-200 shadow-xs">
                                  <UserCheck className="w-4 h-4 text-blue-700" />
                                </div>
                                <div>
                                  <span className="font-black text-slate-900 block text-xs">{eventItem.speakerName}</span>
                                  <span className="text-[10px] text-slate-500 font-semibold block">{eventItem.speakerRole}</span>
                                </div>
                              </div>
                            </td>

                            {/* Horario & Modalidad */}
                            <td className="py-4 px-4 align-top whitespace-nowrap">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  <span>{eventItem.timeFormatted}</span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-semibold block leading-tight">
                                  {eventItem.location}
                                </span>
                              </div>
                            </td>

                            {/* Cupos Disponibles */}
                            <td className="py-4 px-4 align-top text-center min-w-[150px]">
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] font-bold">
                                  <span className="text-slate-500">Inscritos:</span>
                                  <span className="font-mono font-black text-slate-900 text-xs">
                                    {currentRegsCount} / {eventItem.totalSeats}
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      isGrande ? "bg-gradient-to-r from-amber-500 to-orange-600" : "bg-blue-600"
                                    }`}
                                    style={{
                                      width: `${Math.min(100, Math.round((currentRegsCount / eventItem.totalSeats) * 100))}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-[10px] text-slate-500 block font-medium">
                                  Gratis: <strong className="text-slate-700">{freeCount}</strong> | Pagados: <strong className="text-emerald-700">{paidCount}</strong>
                                </span>
                              </div>
                            </td>

                            {/* Inversión & Puntos */}
                            <td className="py-4 px-4 align-top text-center whitespace-nowrap">
                              <div className="space-y-1">
                                {eventItem.pricePaidReservation > 0 ? (
                                  <span className="px-2.5 py-1 bg-amber-100 text-amber-950 text-xs font-black rounded-lg border border-amber-300 inline-block font-mono shadow-2xs">
                                    Reserva: ${eventItem.pricePaidReservation} USD
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-lg border border-emerald-300 inline-block shadow-2xs">
                                    Cupo Gratis
                                  </span>
                                )}
                                <div className="flex items-center justify-center gap-1 text-[11px] text-amber-900 font-black">
                                  <Coins className="w-3.5 h-3.5 text-amber-600" />
                                  <span>+{eventItem.pointsAwardedIfPaid} Pts</span>
                                </div>
                              </div>
                            </td>

                            {/* Acción */}
                            <td className="py-4 px-4 align-top text-right whitespace-nowrap">
                              <button
                                onClick={() => {
                                  setSelectedEventForReg(eventItem);
                                  setRegMode("SELF");
                                  setRegTicketType("Gratuito");
                                  setRegPaidAmount(eventItem.pricePaidReservation || 10);
                                  setGuestName("");
                                  setGuestEmail("");
                                  setGuestPhone("");
                                  setGuestCompany("");
                                  setPaymentRef("");
                                  setPaymentProofFile("");
                                  setIsRegisterModalOpen(true);
                                }}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm flex items-center gap-1.5 ml-auto cursor-pointer active:scale-95 ${
                                  isGrande
                                    ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950"
                                    : "bg-[#0B2545] hover:bg-[#133E72] text-white"
                                }`}
                              >
                                <Ticket className="w-3.5 h-3.5 text-amber-300" />
                                <span>Inscribir</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* GERENCIA SECTION FOR EVENT ATTENDEES REPORT & MANAGEMENT */}
          {isGerenciaUser && (
            <div className="bg-white rounded-3xl border border-blue-900/30 p-6 sm:p-8 shadow-sm space-y-6 mt-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl shadow-sm">
                    <Users className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-slate-900">
                        Gestión Gerencial de Eventos &amp; Asistentes
                      </h3>
                      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 border border-blue-300 font-bold text-[10px] rounded-full uppercase">
                        Exclusivo Gerencia
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Listado consolidado de socios e invitados registrados para las capacitaciones y grandes eventos.
                    </p>
                  </div>
                </div>

                {/* Action & Export Buttons */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={handleOpenAddEventModal}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer border border-amber-400"
                  >
                    <Plus className="w-4 h-4 text-slate-950" />
                    <span>➕ Crear Evento / Capacitación</span>
                  </button>

                  <button
                    onClick={() => handleExportEventAttendeesPDF(undefined, gerenciaSelectedEventId)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Exportar PDF Reporte</span>
                  </button>

                  <button
                    onClick={() => handleExportEventAttendeesExcel(undefined, gerenciaSelectedEventId)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exportar Excel / CSV</span>
                  </button>
                </div>
              </div>

              {/* SECCIÓN GERENCIAL: TABLA Y ADMINISTRACIÓN DE EVENTOS Y CAPACITACIONES */}
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-900" />
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      Catálogo Administrable de Capacitaciones &amp; Eventos Especiales ({eventsList.length})
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    Permite agregar, modificar y eliminar capacitaciones semanales y convenciones.
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider bg-slate-100">
                        <th className="py-3 px-4">Categoría &amp; Mes</th>
                        <th className="py-3 px-4">Título / Tema del Evento</th>
                        <th className="py-3 px-4">Fecha &amp; Horario</th>
                        <th className="py-3 px-4">Expositor &amp; Modalidad</th>
                        <th className="py-3 px-4 text-center">Cupos Límite</th>
                        <th className="py-3 px-4 text-center">Valor Reserva / Puntos</th>
                        <th className="py-3 px-4 text-right">Acciones Gerenciales</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {eventsList.map((evItem, idx) => {
                        const isGrande = evItem.category === "Evento Grande / Convención";
                        return (
                          <tr key={evItem.id ? `ger-evt-${evItem.id}-${idx}` : `ger-evt-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase block w-fit mb-1 ${
                                isGrande ? "bg-amber-100 text-amber-900 border border-amber-300" : "bg-blue-100 text-blue-900 border border-blue-200"
                              }`}>
                                {evItem.category}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono block">
                                {evItem.month || "Agosto 2026"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 max-w-xs">
                              <span className="font-extrabold text-slate-900 block leading-snug">{evItem.title}</span>
                              <span className="text-[10px] text-slate-500 line-clamp-1">{evItem.description}</span>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="font-bold text-slate-800 block">{evItem.dateFormatted}</span>
                              <span className="text-[10px] text-slate-500 block">{evItem.timeFormatted}</span>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="font-bold text-slate-900 block">{evItem.speakerName || "Por confirmar"}</span>
                              <span className="text-[10px] text-slate-500 block">{evItem.location}</span>
                            </td>
                            <td className="py-3.5 px-4 text-center font-mono font-bold whitespace-nowrap">
                              <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-slate-800">
                                {evItem.totalSeats} cupos
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <span className="font-black text-amber-900 block">
                                ${evItem.pricePaidReservation} USD
                              </span>
                              <span className="text-[10px] text-amber-700 font-bold block">
                                +{evItem.pointsAwardedIfPaid} Pts
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditEventModal(evItem)}
                                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                                  title="Editar capacitación/evento"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Editar</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteEvent(evItem.id)}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                                  title="Eliminar evento"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Eliminar</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary Metrics Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Inscritos</span>
                  <span className="text-2xl font-black text-slate-900 font-mono">{eventRegistrations.length}</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Cupos Gratuitos</span>
                  <span className="text-2xl font-black text-blue-900 font-mono">
                    {eventRegistrations.filter((r) => r.registrationType === "Gratuito").length}
                  </span>
                </div>

                <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Reservas Pagadas</span>
                  <span className="text-2xl font-black text-amber-900 font-mono">
                    {eventRegistrations.filter((r) => r.registrationType === "Reserva Pagada").length}
                  </span>
                </div>

                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Recaudado</span>
                  <span className="text-2xl font-black text-emerald-900 font-mono">
                    ${eventRegistrations.reduce((sum, r) => sum + (r.amountPaid || 0), 0)} USD
                  </span>
                </div>
              </div>

              {/* Filter Select Event */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider whitespace-nowrap">
                    Filtrar por Evento:
                  </label>
                  <select
                    value={gerenciaSelectedEventId}
                    onChange={(e) => setGerenciaSelectedEventId(e.target.value)}
                    className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 w-full sm:w-72"
                  >
                    <option value="ALL">-- Todos los Eventos ({eventsList.length}) --</option>
                    {eventsList.map((ev, idx) => (
                      <option key={ev.id ? `opt-ev-${ev.id}-${idx}` : `opt-ev-${idx}`} value={ev.id}>
                        {ev.title} ({ev.dateFormatted})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar asistente por nombre o email..."
                    value={gerenciaEventSearch}
                    onChange={(e) => setGerenciaEventSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Table of Confirmed Attendees */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider bg-slate-50">
                      <th className="py-3 px-4">Evento / Capacitación</th>
                      <th className="py-3 px-4">Asistente</th>
                      <th className="py-3 px-4">Socio Invitante</th>
                      <th className="py-3 px-4 text-center">Tipo Registro</th>
                      <th className="py-3 px-4 text-center">Monto Pagado</th>
                      <th className="py-3 px-4 text-center">Puntos Acreditados</th>
                      <th className="py-3 px-4 text-center">Pase QR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {eventRegistrations
                      .filter((r) => {
                        if (gerenciaSelectedEventId !== "ALL" && r.eventId !== gerenciaSelectedEventId) return false;
                        if (!gerenciaEventSearch.trim()) return true;
                        const q = gerenciaEventSearch.toLowerCase();
                        return (
                          r.attendeeName.toLowerCase().includes(q) ||
                          r.attendeeEmail.toLowerCase().includes(q) ||
                          r.socioNombre.toLowerCase().includes(q) ||
                          r.eventTitle.toLowerCase().includes(q)
                        );
                      })
                      .map((att, idx) => (
                        <tr key={att.id ? `att-${att.id}-${idx}` : `att-${idx}`} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900 max-w-[200px] truncate">
                            <div>{att.eventTitle}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{att.eventDate}</div>
                          </td>
                          <td className="py-3.5 px-4 font-black text-slate-900">
                            <div>{att.attendeeName}</div>
                            <div className="text-[10px] text-slate-500 font-mono font-normal">{att.attendeeEmail}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-800">{att.socioNombre}</span>
                            <span className="block text-[10px] text-slate-400 font-mono">{att.socioCode}</span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`px-2.5 py-0.5 font-extrabold text-[10px] rounded-md uppercase border ${
                                att.registrationType === "Reserva Pagada"
                                  ? "bg-amber-100 text-amber-900 border-amber-300"
                                  : "bg-blue-50 text-blue-800 border-blue-200"
                              }`}
                            >
                              {att.registrationType}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-black text-slate-900">
                            ${att.amountPaid} USD
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-black text-amber-800">
                            {att.pointsAwarded > 0 ? `+${att.pointsAwarded} Pts` : "0 Pts"}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => {
                                setConfirmedRegistration(att);
                                setIsPassModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-[#0B2545] hover:text-white text-slate-700 font-mono font-bold text-[10px] rounded-lg transition-all border border-slate-200 cursor-pointer flex items-center gap-1 mx-auto"
                            >
                              <QrCode className="w-3 h-3 text-amber-500" />
                              <span>{att.ticketQrCode}</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

          {/* Toast Notification */}
          {rewardToast && (
            <div className="fixed bottom-6 right-6 z-50 bg-[#0B2545] text-white px-5 py-3 rounded-2xl shadow-2xl border border-amber-400 flex items-center gap-3 animate-slide-up">
              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="text-xs font-bold">{rewardToast}</span>
            </div>
          )}
        </div>
      )}

      {/* POPUP MODAL: Confirmar Canje de Beneficio con Clave de Socio */}
      {isRedeemModalOpen && selectedRewardForRedeem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative space-y-5 animate-scale-up border border-slate-200">
            <button
              onClick={() => {
                setIsRedeemModalOpen(false);
                setSelectedRewardForRedeem(null);
                setRedeemPasswordInput("");
                setRedeemPasswordError(null);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl shrink-0">
                <Gift className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 leading-snug">
                  Confirmar Canje de Beneficio
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Verificación de seguridad requerida
                </p>
              </div>
            </div>

            <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/80 space-y-2">
              <p className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>¿Está seguro que desea canjear este beneficio?</span>
              </p>
              <div className="pt-2 border-t border-amber-200/60 text-xs space-y-1.5 text-amber-950">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-600">Beneficio:</span>
                  <span className="font-extrabold text-slate-900">{selectedRewardForRedeem.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-600">Costo en Puntos:</span>
                  <span className="font-black text-amber-800 font-mono">{selectedRewardForRedeem.pointsCost} Pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-600">Tu Saldo Actual:</span>
                  <span className="font-bold text-slate-800 font-mono">{activeSocioCurrentBalance} Pts</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-amber-200/50">
                  <span className="font-bold text-slate-700">Saldo Restante:</span>
                  <span className="font-black text-emerald-700 font-mono">
                    {Math.max(0, activeSocioCurrentBalance - selectedRewardForRedeem.pointsCost)} Pts
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Ingrese su Clave de Socio para Aceptar
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Escriba su contraseña de acceso..."
                  value={redeemPasswordInput}
                  onChange={(e) => {
                    setRedeemPasswordInput(e.target.value);
                    setRedeemPasswordError(null);
                  }}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                />
              </div>
              {redeemPasswordError && (
                <p className="text-[11px] font-bold text-rose-600 pt-0.5">{redeemPasswordError}</p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRedeemModalOpen(false);
                  setSelectedRewardForRedeem(null);
                  setRedeemPasswordInput("");
                  setRedeemPasswordError(null);
                }}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRedeem}
                className="w-1/2 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Aceptar y Canjear</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Agregar Noticia */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative space-y-5 animate-scale-up border border-slate-200">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 text-[#0B2545] rounded-xl">
                <Newspaper className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Publicar Nueva Noticia / Actualización</h2>
                <p className="text-xs text-slate-500 font-medium">Difunda información oficial a toda la red de distribuidores</p>
              </div>
            </div>

            <form onSubmit={handleAddNews} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Título de la Noticia / Actualización
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Nueva Integración de Facturación Electrónica en Lote"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Módulo / Categoría
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="UpConta">UpConta ERP</option>
                    <option value="ANF">Firmas Electrónicas ANF</option>
                    <option value="Cotizador">Cotizador Comercial</option>
                    <option value="Contador">Planes Contador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mes de Publicación
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Agosto 2026"
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Resumen Corto (Visual en Tarjetas)
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Sintetice los puntos clave de la actualización para lectura rápida..."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Detalle Exacto del Proceso / Funcionalidad
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describa el procedimiento detallado, normativas del SRI, impacto en el sistema o pasos a seguir..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>La noticia se mostrará inmediatamente en el tablero de todos los usuarios registrados.</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0B2545] hover:bg-[#133E72] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>Publicar Noticia</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Modificar Base de Nuevos Socios (Gerencia) */}
      {isEditBaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative space-y-5 animate-scale-up border border-slate-200">
            <button
              onClick={() => setIsEditBaseModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl">
                <Edit3 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Modificar Base de Socios</h2>
                <p className="text-xs text-slate-500 font-medium">Ajuste de valor base inicial para el contador global</p>
              </div>
            </div>

            <form onSubmit={handleSaveBaseSocios} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Valor Base Inicial de Socios
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={customBaseInput}
                  onChange={(e) => setCustomBaseInput(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                  placeholder="75"
                />
                <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
                  Al cambiar este valor a e.g. <span className="font-bold text-slate-700">100</span>, el total mostrado a todos los perfiles será <span className="font-bold text-slate-800">100 + {addedSociosCount} = {100 + addedSociosCount}</span> socios.
                </p>
              </div>

              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 font-medium flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Esta modificación se actualizará inmediatamente para todos los perfiles en la sección de Noticias.</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditBaseModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0B2545] hover:bg-[#133E72] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>Guardar y Aplicar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Read Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto border border-slate-200">
            <button
              onClick={() => setSelectedNews(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-[#0B2545] text-white font-black text-[10px] rounded-md uppercase">
                {selectedNews.category}
              </span>
              <span className="text-xs font-bold text-slate-400">{selectedNews.date}</span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
              {selectedNews.title}
            </h2>

            <div className="p-3.5 bg-slate-50 border-l-4 border-[#0B2545] rounded-r-xl">
              <p className="text-xs font-semibold text-slate-700 italic">
                "{selectedNews.summary}"
              </p>
            </div>

            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-3 font-normal">
              {selectedNews.content}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-semibold">
              <span>Publicado por: {selectedNews.author}</span>
              <button
                onClick={() => setSelectedNews(null)}
                className="px-4 py-2 bg-[#0B2545] text-white font-bold rounded-xl hover:bg-[#133E72] transition-all cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Agregar / Editar Beneficio del Catálogo (Gerencia) */}
      {isAddBenefitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative space-y-5 animate-scale-up border border-slate-200">
            <button
              onClick={() => {
                setIsAddBenefitModalOpen(false);
                setEditingRewardItem(null);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl shrink-0">
                <Gift className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 leading-snug">
                  {editingRewardItem ? "Editar Beneficio del Catálogo" : "Agregar Nuevo Beneficio al Catálogo"}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Configure el puntaje, promoción, periodo de vigencia y visibilidad
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveBenefitModal();
              }}
              className="space-y-4 pt-1"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Título del Beneficio
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Firma Electrónica Persona Natural 1 Año"
                  value={benefitForm.title}
                  onChange={(e) => setBenefitForm({ ...benefitForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Categoría
                  </label>
                  <select
                    value={benefitForm.category}
                    onChange={(e) => setBenefitForm({ ...benefitForm, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Firmas">Firmas Electrónicas</option>
                    <option value="Planes ERP">Planes ERP</option>
                    <option value="Herramientas">Herramientas & Facturación</option>
                    <option value="Descuentos">Descuentos & Cupones</option>
                    <option value="Capacitaciones & Bonos">Capacitaciones & Bonos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Costo en Puntos (Pts)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="100"
                    value={benefitForm.pointsCost}
                    onChange={(e) => setBenefitForm({ ...benefitForm, pointsCost: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-amber-50/80 border border-amber-300 rounded-xl text-xs font-black text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalle los beneficios, términos o licencias incluidas..."
                  value={benefitForm.description}
                  onChange={(e) => setBenefitForm({ ...benefitForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Distintivo / Badge Opcional
                </label>
                <input
                  type="text"
                  placeholder="Ej: Más Popular, VIP Gold, 2x1, Alta Demanda"
                  value={benefitForm.badge}
                  onChange={(e) => setBenefitForm({ ...benefitForm, badge: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Promoción & Periodo de Vigencia */}
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={benefitForm.esPromocion}
                    onChange={(e) => setBenefitForm({ ...benefitForm, esPromocion: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded border-amber-300 focus:ring-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-600" />
                    Activar como Promoción Especial
                  </span>
                </label>

                {benefitForm.esPromocion && (
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                      Periodo de Vigencia de la Promoción
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Válido hasta el 31/12/2026 o Del 01/08 al 30/09"
                      value={benefitForm.vigencia}
                      onChange={(e) => setBenefitForm({ ...benefitForm, vigencia: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-200"
                    />
                  </div>
                )}
              </div>

              {/* Toggle Activo / Inactivo */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="block text-xs font-black text-slate-900">Estado de Visibilidad</span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {benefitForm.activo ? "Visible en los perfiles de socios" : "Oculto para socios (Solo Gerencia)"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setBenefitForm({ ...benefitForm, activo: !benefitForm.activo })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                    benefitForm.activo
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-slate-200 text-slate-700 border border-slate-300"
                  }`}
                >
                  {benefitForm.activo ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{benefitForm.activo ? "ACTIVO" : "INACTIVO"}</span>
                </button>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddBenefitModalOpen(false);
                    setEditingRewardItem(null);
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0B2545] hover:bg-[#133E72] text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>{editingRewardItem ? "Guardar Cambios" : "Crear Beneficio"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Confirmar Eliminación de Beneficio (Gerencia) */}
      {rewardToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4 animate-scale-up border border-slate-200">
            <button
              onClick={() => setRewardToDelete(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-800 rounded-2xl shrink-0">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 leading-snug">
                  Eliminar Beneficio del Catálogo
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Confirmación requerida
                </p>
              </div>
            </div>

            <p className="text-xs font-semibold text-slate-700 bg-rose-50 p-3 rounded-xl border border-rose-200">
              ¿Está seguro que desea eliminar el beneficio <span className="font-extrabold text-slate-900">"{rewardToDelete.title}"</span>? Esta acción no se puede deshacer.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRewardToDelete(null)}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteRewardConfirm}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sí, Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: FORMULARIO DE REGISTRO E INSCRIPCIÓN A EVENTOS */}
      {isRegisterModalOpen && selectedEventForReg && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6 animate-scale-up border border-slate-200 my-8">
            <button
              onClick={() => setIsRegisterModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-3.5 pr-8">
              <div className="p-3 bg-[#0B2545] text-amber-400 rounded-2xl shrink-0 shadow-sm">
                <Ticket className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 text-[10px] font-black uppercase rounded-md tracking-wider border border-blue-200">
                  {selectedEventForReg.type}
                </span>
                <h2 className="text-xl font-black text-slate-900 leading-snug">
                  {selectedEventForReg.title}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedEventForReg.dateFormatted} | Expositor: <strong className="text-slate-800">{selectedEventForReg.speakerName}</strong>
                </p>
              </div>
            </div>

            <form onSubmit={handleRegisterEventSubmit} className="space-y-5">
              {/* Option 1: Who is registering */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  ¿Para quién es la inscripción?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRegMode("SELF")}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      regMode === "SELF"
                        ? "bg-blue-50/80 border-blue-500 text-blue-950 font-black shadow-xs ring-2 ring-blue-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-600 font-semibold hover:bg-slate-100"
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="text-xs">
                      <span className="block font-black">Inscribirme a mí</span>
                      <span className="text-[10px] text-slate-500 font-normal">Socio actual registrado</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegMode("GUEST")}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      regMode === "GUEST"
                        ? "bg-amber-50/80 border-amber-500 text-amber-950 font-black shadow-xs ring-2 ring-amber-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-600 font-semibold hover:bg-slate-100"
                    }`}
                  >
                    <Users className="w-4 h-4 text-amber-600 shrink-0" />
                    <div className="text-xs">
                      <span className="block font-black">Inscribir Invitado</span>
                      <span className="text-[10px] text-slate-500 font-normal">Cliente o contacto nuevo</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Guest Form Fields if Mode GUEST */}
              {regMode === "GUEST" && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Datos del Contacto / Cliente Invitado</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Nombre Completo *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Ing. Carlos Mendoza"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Correo Electrónico *</label>
                      <input
                        type="email"
                        required
                        placeholder="carlos@empresa.com"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Teléfono WhatsApp</label>
                      <input
                        type="tel"
                        placeholder="0991234567"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Empresa / RUC (Opcional)</label>
                      <input
                        type="text"
                        placeholder="Distribuidora Mendoza Cía"
                        value={guestCompany}
                        onChange={(e) => setGuestCompany(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Option 2: Ticket Type (Gratuito vs Reserva Pagada) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Modalidad de Cupo
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option Gratis */}
                  <button
                    type="button"
                    onClick={() => {
                      setRegTicketType("Gratuito");
                      setRegPaidAmount(0);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                      regTicketType === "Gratuito"
                        ? "bg-emerald-50/90 border-emerald-500 text-emerald-950 font-black shadow-xs ring-2 ring-emerald-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs">Cupo Gratuito</span>
                      <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 font-mono font-black text-[10px] rounded-md">
                        $0 USD
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-normal mt-1 leading-tight">
                      Acceso al evento. Cupo sujeto a disponibilidad por orden de llegada.
                    </p>
                  </button>

                  {/* Option Reserva Pagada */}
                  <button
                    type="button"
                    onClick={() => {
                      setRegTicketType("Reserva Pagada");
                      setRegPaidAmount(selectedEventForReg.priceReservationUSD || 10);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                      regTicketType === "Reserva Pagada"
                        ? "bg-amber-50/90 border-amber-500 text-amber-950 font-black shadow-xs ring-2 ring-amber-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-amber-600" />
                        <span>Reserva Pagada</span>
                      </span>
                      <span className="px-2 py-0.5 bg-amber-200 text-amber-950 font-mono font-black text-[10px] rounded-md">
                        ${selectedEventForReg.priceReservationUSD || 10} USD
                      </span>
                    </div>
                    <p className="text-[10px] text-amber-900 font-bold mt-1 leading-tight">
                      ¡Gana +{selectedEventForReg.pointsAwardedIfPaid} PUNTOS en tu saldo! Cupo preferencial garantizado.
                    </p>
                  </button>
                </div>
              </div>

              {/* Bank Payment details if Reserva Pagada */}
              {regTicketType === "Reserva Pagada" && (
                <div className="p-4 bg-amber-50/70 border border-amber-300 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-black text-xs">
                    <Building2 className="w-4 h-4 text-amber-700" />
                    <span>Datos Bancarios para Transferencia de Reserva</span>
                  </div>

                  <div className="text-xs text-slate-800 space-y-1 bg-white p-3 rounded-xl border border-amber-200 font-mono">
                    <p><strong>Banco:</strong> Banco Pichincha (Cta. Corriente)</p>
                    <p><strong>Nro. Cuenta:</strong> 2100284910</p>
                    <p><strong>Titular:</strong> UpConta S.A.S. (RUC 1793182910001)</p>
                    <p><strong>Monto Reserva:</strong> ${regPaidAmount} USD</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Nro. Transferencia / Comprobante</label>
                      <input
                        type="text"
                        placeholder="Ej: TRF-849201"
                        value={paymentRef}
                        onChange={(e) => setPaymentRef(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Adjuntar Comprobante (PDF/Img)</label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setPaymentProofFile(e.target.files[0].name);
                          }
                        }}
                        className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all hover:brightness-105 cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Confirmar Registro e Emitir Pase QR</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PASE DE ENTRADA VIRTUAL CON CÓDIGO QR */}
      {isPassModalOpen && confirmedRegistration && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden my-8 animate-scale-up border border-slate-200">
            <button
              onClick={() => setIsPassModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 text-white/80 hover:text-white rounded-full bg-slate-950/40 hover:bg-slate-950/60 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Ticket Graphic Header */}
            <div className="bg-gradient-to-r from-[#0B2545] via-[#133E72] to-amber-900 p-6 text-white text-center space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-300">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>UpConta ERP &amp; ANF AC &amp; Colegio de Contadores</span>
              </div>

              <h3 className="text-lg font-black text-white tracking-tight leading-snug">
                Pase Oficial de Entrada / Ticket Virtual
              </h3>

              <div className="inline-block px-3 py-1 bg-amber-400 text-slate-950 font-mono font-black text-xs rounded-full shadow-xs">
                {confirmedRegistration.ticketQrCode}
              </div>
            </div>

            {/* Ticket Body */}
            <div className="p-6 space-y-5">
              <div className="space-y-1 text-center">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Evento:</span>
                <h4 className="text-base font-black text-slate-900 leading-snug">
                  {confirmedRegistration.eventTitle}
                </h4>
                <p className="text-xs text-blue-900 font-bold">{confirmedRegistration.eventDate}</p>
              </div>

              {/* Details List */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500 font-medium">Asistente:</span>
                  <span className="font-black text-slate-900">{confirmedRegistration.attendeeName}</span>
                </div>

                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500 font-medium">Correo:</span>
                  <span className="font-bold text-slate-800 font-mono text-[11px]">{confirmedRegistration.attendeeEmail}</span>
                </div>

                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500 font-medium">Socio Invitante:</span>
                  <span className="font-bold text-slate-900">{confirmedRegistration.socioNombre} ({confirmedRegistration.socioCode})</span>
                </div>

                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500 font-medium">Tipo Registro:</span>
                  <span className="font-black text-emerald-700">{confirmedRegistration.registrationType} (${confirmedRegistration.amountPaid} USD)</span>
                </div>

                {confirmedRegistration.pointsAwarded > 0 && (
                  <div className="flex justify-between pt-0.5">
                    <span className="text-amber-800 font-bold">Puntos Sumados:</span>
                    <span className="font-mono font-black text-amber-900">+{confirmedRegistration.pointsAwarded} Pts</span>
                  </div>
                )}
              </div>

              {/* Simulated QR Code Visual */}
              <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center space-y-2 text-center">
                <div className="w-32 h-32 bg-slate-950 p-2 rounded-xl flex items-center justify-center shadow-md relative group">
                  {/* QR Matrix Simulation */}
                  <div className="w-full h-full bg-white p-2 rounded-lg flex flex-col justify-between">
                    <div className="flex justify-between">
                      <div className="w-6 h-6 bg-slate-900 rounded-sm border-2 border-slate-900 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white" />
                      </div>
                      <div className="w-2 h-2 bg-slate-900" />
                      <div className="w-6 h-6 bg-slate-900 rounded-sm border-2 border-slate-900 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white" />
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-slate-900" />
                    </div>
                    <div className="flex justify-between">
                      <div className="w-6 h-6 bg-slate-900 rounded-sm border-2 border-slate-900 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white" />
                      </div>
                      <div className="w-2 h-2 bg-slate-900" />
                      <div className="w-3 h-3 bg-slate-900" />
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                  Escanee al ingresar al evento
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-4 h-4 text-slate-600" />
                  <span>Imprimir Pase</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPassModalOpen(false)}
                  className="w-1/2 py-2.5 bg-[#0B2545] hover:bg-[#133E72] text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>Cerrar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CREAR / EDITAR EVENTO O CAPACITACIÓN (EXCLUSIVO GERENCIA) */}
      {isAddEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl relative overflow-hidden my-8 animate-scale-up border border-slate-200">
            <button
              onClick={() => setIsAddEventModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="bg-gradient-to-r from-[#0B2545] via-[#133E72] to-amber-900 p-6 text-white space-y-1">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-300">
                <GraduationCap className="w-4 h-4 text-amber-400" />
                <span>Gestión Gerencial de Educación Continua</span>
              </div>
              <h3 className="text-lg font-black text-white">
                {editingEventItem ? "✏️ Modificar Capacitación / Evento Especial" : "➕ Crear Nueva Capacitación / Evento Especial"}
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                Configura fechas, límite de cupos, valor por reserva, puntos otorgados y detalles para socios.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveEventModal();
              }}
              className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Categoría */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    Tipo / Categoría de Evento *
                  </label>
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                    required
                  >
                    <option value="Capacitación Semanal">Capacitación Semanal</option>
                    <option value="Evento Grande / Convención">Evento Grande / Convención</option>
                  </select>
                </div>

                {/* Mes / Período */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    Mes / Grupo *
                  </label>
                  <select
                    value={eventForm.month}
                    onChange={(e) => setEventForm({ ...eventForm, month: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                    required
                  >
                    <option value="Agosto 2026">Agosto 2026</option>
                    <option value="Septiembre 2026">Septiembre 2026</option>
                    <option value="Octubre 2026">Octubre 2026</option>
                    <option value="Noviembre 2026">Noviembre 2026</option>
                    <option value="Diciembre 2026">Diciembre 2026</option>
                  </select>
                </div>
              </div>

              {/* Título / Tema */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Título o Tema Principal del Evento *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Taller Práctico de Cierre Contable y Anexo RIDE..."
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Fecha Formateada */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    Fecha del Evento *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Jueves 27 de Agosto, 2026"
                    value={eventForm.dateFormatted}
                    onChange={(e) => setEventForm({ ...eventForm, dateFormatted: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Horario */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    Horario / Duración *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 17:00 - 19:00 (2 Horas)"
                    value={eventForm.timeFormatted}
                    onChange={(e) => setEventForm({ ...eventForm, timeFormatted: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Modalidad / Ubicación */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    Ubicación / Modalidad *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Aula Virtual VIP Zoom / Salón Hilton Quito"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Límite de Cupos */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    Límite de Cupos Disponibles *
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="50"
                    value={eventForm.totalSeats}
                    onChange={(e) => setEventForm({ ...eventForm, totalSeats: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-black text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Valor Reserva ($ USD) */}
                <div>
                  <label className="block text-xs font-black text-amber-900 uppercase tracking-wider mb-1">
                    Valor por Reserva Garantizada ($ USD) *
                  </label>
                  <div className="relative">
                    <span className="text-amber-700 font-bold text-xs absolute left-3 top-1/2 -translate-y-1/2">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="10.00"
                      value={eventForm.pricePaidReservation}
                      onChange={(e) => setEventForm({ ...eventForm, pricePaidReservation: Number(e.target.value) || 0 })}
                      className="w-full pl-7 pr-3 py-2 bg-amber-50/60 border border-amber-300 rounded-xl text-xs font-black text-amber-950 focus:bg-white focus:border-amber-500 focus:outline-none font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Puntos Otorgados al Socio */}
                <div>
                  <label className="block text-xs font-black text-amber-900 uppercase tracking-wider mb-1">
                    Puntos Recompensa para el Socio *
                  </label>
                  <div className="relative">
                    <Coins className="w-4 h-4 text-amber-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="0"
                      placeholder="100"
                      value={eventForm.pointsAwardedIfPaid}
                      onChange={(e) => setEventForm({ ...eventForm, pointsAwardedIfPaid: Number(e.target.value) || 0 })}
                      className="w-full pl-9 pr-3 py-2 bg-amber-50/60 border border-amber-300 rounded-xl text-xs font-black text-amber-950 focus:bg-white focus:border-amber-500 focus:outline-none font-mono"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Expositor */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    Nombre del Expositor
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Msc. Adriana Torres"
                    value={eventForm.speakerName}
                    onChange={(e) => setEventForm({ ...eventForm, speakerName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Cargo Expositor */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    Cargo / Especialidad del Expositor
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Especialista en Normativa Tributaria SRI"
                    value={eventForm.speakerRole}
                    onChange={(e) => setEventForm({ ...eventForm, speakerRole: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Descripción / Temario */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Descripción o Temario Detallado
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalles sobre el contenido del taller, material que incluye y beneficios..."
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              {/* Checkbox Extras */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                <input
                  type="checkbox"
                  id="chk-breakfast"
                  checked={eventForm.includesBreakfastAndCert}
                  onChange={(e) => setEventForm({ ...eventForm, includesBreakfastAndCert: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="chk-breakfast" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Incluye Certificado Digital de Asistencia &amp; Desayuno / Coffee Break VIP
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddEventModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4 text-slate-950" />
                  <span>{editingEventItem ? "Guardar Cambios" : "Crear Evento"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
