import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  KeyRound,
  ChevronLeft,
  ChevronRight,
  Layers,
  Palette,
  Calculator,
  FileCheck,
  CheckCircle2,
  TrendingUp,
  MessageCircle,
  Laptop,
  Award,
  Flame,
  Zap,
  Tag,
  ShieldCheck,
} from "lucide-react";

interface WelcomeScreenProps {
  onUnlock: (code: string) => void;
  codeFeedback?: "none" | "success" | "error";
}

const WHATSAPP_LINK =
  "https://wa.me/593994344827?text=hola%20quiero%20capacitarme%20con%20Godi%20y%20me%20gustar%C3%ADa%20adquirir%20la%20herramienta%20comercial";

// Reusable High-Impact Promotional Offer Component
const PricingPromoBlock: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-[#0B2545] to-[#1E3A8A] border-2 border-amber-400/80 shadow-2xl p-5 sm:p-7 text-white overflow-hidden space-y-5">
    {/* Background Glow & Badges */}
    <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
    <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

    {/* Top Offer Header Bar */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700/80 relative z-10">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-md">
          <Flame className="w-3.5 h-3.5 fill-slate-950 text-slate-950 animate-pulse" />
          <span>¡OFERTA DE LANZAMIENTO EXCLUSIVA!</span>
        </div>
        <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight">
          Adquiere todo el Ecosistema GoDi
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 font-medium">
          La plataforma comercial definitiva para acelerar tus ventas y comisiones como distribuidor.
        </p>
      </div>

      {/* Striking Price Display */}
      <div className="flex flex-col sm:items-end justify-center bg-black/40 border border-amber-400/50 rounded-2xl px-4 py-3 shrink-0 backdrop-blur-md shadow-inner">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 line-through font-bold">Antes $75</span>
          <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white font-black text-[10px] uppercase tracking-wide">
            -60% OFF
          </span>
        </div>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="text-3xl sm:text-4xl font-black text-amber-400 drop-shadow-[0_2px_10px_rgba(251,191,36,0.3)]">
            $30
          </span>
          <span className="text-xs font-bold text-slate-300">+ IVA</span>
        </div>
        <span className="text-[10px] font-extrabold text-emerald-400 tracking-wide uppercase">
          Inversión Única • Acceso Total
        </span>
      </div>
    </div>

    {/* Offer Included Features Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
      <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-slate-200">
          <strong className="text-white font-black block">Capacitación en Planes & Firmas:</strong>
          Domina los planes de facturación, ERP y la emisión técnica de firmas ANF.
        </div>
      </div>

      <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-slate-200">
          <strong className="text-white font-black block">Creación de Artes Visuales desde 0:</strong>
          Diseña banners y publicaciones de alto impacto para captar clientes en redes y WhatsApp.
        </div>
      </div>

      <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-slate-200">
          <strong className="text-white font-black block">Tu Propio Cotizador Personal:</strong>
          Genera propuestas inmediatas con tus datos, marca, logotipo y precios con IVA.
        </div>
      </div>

      <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-slate-200">
          <strong className="text-white font-black block">1 Mes de Acompañamiento 1 a 1:</strong>
          Capacitación continua y apoyo comercial directo para cerrar tus primeras ventas.
        </div>
      </div>
    </div>

    {/* Bottom Call to Action & Trust Bar */}
    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-700/80 relative z-10">
      <div className="flex items-center gap-2 text-xs text-slate-300 text-center sm:text-left">
        <Award className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          Herramienta propia de <strong className="text-white font-bold">GoDi</strong> desarrollada para acelerar el éxito de nuevos socios.
        </span>
      </div>

      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#25D366] to-[#20bd5a] hover:from-[#20bd5a] hover:to-[#1ca850] text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-emerald-900/40 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
      >
        <MessageCircle className="w-5 h-5 fill-white shrink-0" />
        <span>Adquirir Ecosistema en Oferta ($30 + IVA)</span>
      </a>
    </div>
  </div>
);

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onUnlock,
  codeFeedback = "none",
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [inlineCode, setInlineCode] = useState("");
  const [isPaused, setIsPaused] = useState(false);

  const totalSlides = 6;

  // Auto-advance carousel every 5 seconds unless hovered/paused
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, totalSlides]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inlineCode.trim()) {
      onUnlock(inlineCode.trim());
    }
  };

  return (
    <div
      className="w-full max-w-5xl mx-auto py-2 sm:py-4 px-2 sm:px-4 animate-fade-in space-y-3"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top Header Bar with Indicators and WhatsApp Contact on all slides */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm p-3 flex items-center justify-between gap-3">
        {/* Carousel Dots & Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer border border-slate-200 active:scale-95"
            title="Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-1.5 px-1">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentSlide === idx
                    ? "w-7 h-2.5 bg-[#0B2545]"
                    : "w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
                title={`Ventana ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer border border-slate-200 active:scale-95"
            title="Siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Global Top WhatsApp Contact Button across all slides */}
        <div className="flex items-center gap-2">
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-extrabold shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white shrink-0" />
            <span>Contactar por WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Main Slide Card Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden relative min-h-[540px] flex flex-col justify-between">
        {/* Top Gradient Stripe */}
        <div className="h-2.5 bg-gradient-to-r from-[#0B2545] via-[#3B51A3] to-amber-400 shrink-0" />

        <div className="p-5 sm:p-8 md:p-10 flex-1 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {/* ========================================================================= */}
            {/* VENTANA 1: BIENVENIDA ORIGINAL + BLOQUE DE OFERTA DE PRECIO DEBAJO */}
            {/* ========================================================================= */}
            {currentSlide === 0 && (
              <motion.div
                key="slide-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#3B51A3] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                      Comunidad de Distribuidores
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-[#0B2545] tracking-tight mt-1">
                      ¡Bienvenido a GODI!
                    </h1>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>ANF & UPCONTA</span>
                    </div>
                  </div>
                </div>

                {/* Core Manifest Message */}
                <div className="space-y-4 text-slate-700 text-base sm:text-lg leading-relaxed font-normal">
                  <p className="font-extrabold text-xl sm:text-2xl text-[#0B2545] leading-snug">
                    Aquí no vienes solamente a vender. Vienes a crecer.
                  </p>

                  <p className="text-sm sm:text-base text-slate-600">
                    En <strong className="font-black text-slate-900">GODI</strong> creemos que un socio bien capacitado, acompañado y respaldado puede llegar mucho más lejos. Por eso, hemos creado este espacio para ayudarte a desarrollar tu negocio, fortalecer tus conocimientos y convertir cada oportunidad en una posibilidad real de crecimiento.
                  </p>

                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-amber-50/60 border border-blue-100 text-slate-800 font-medium">
                    <p className="text-base sm:text-lg font-bold text-slate-900">
                      Nosotros ponemos las herramientas, la capacitación y el acompañamiento. <span className="text-[#3B51A3]">Tú pones las ganas de crecer.</span>
                    </p>
                  </div>

                  <p className="text-sm sm:text-base text-slate-600">
                    A través de esta plataforma tendrás acceso a recursos comerciales, capacitaciones, materiales, herramientas y todo lo necesario para que puedas avanzar con mayor seguridad y convertirte en un socio cada vez más preparado.
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-900 text-base sm:text-lg">
                        Tu crecimiento también es nuestro crecimiento.
                      </p>
                      <p className="font-bold text-[#3B51A3] text-sm sm:text-base">
                        Bienvenido a GODI. El siguiente paso empieza aquí.
                      </p>
                    </div>

                    <a
                      href={WHATSAPP_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-md transition-all shrink-0 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Quiero Capacitarme con GoDi</span>
                    </a>
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* OFERTA DE PRECIO VISIBLE DIRECTAMENTE EN EL PRIMER INGRESO (BIENVENIDA) */}
                {/* ========================================================================= */}
                <div className="pt-4 border-t border-slate-200">
                  <PricingPromoBlock />
                </div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* VENTANA 2: CONOCE TODOS LOS PLANES (SCREENSHOT PLANES) */}
            {/* ========================================================================= */}
            {currentSlide === 1 && (
              <motion.div
                key="slide-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 flex items-center gap-1 w-fit">
                      <Layers className="w-3.5 h-3.5" /> Catálogo Comercial
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-[#0B2545] tracking-tight mt-1">
                      Conoce todos los planes que maneja nuestro socio estratégico
                    </h2>
                  </div>
                  <span className="text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full">
                    Facturación • ERP • Contadores
                  </span>
                </div>

                {/* Hook text */}
                <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
                  Accede a la gama más completa de software contable y de facturación electrónica del Ecuador. Compara características, módulos incluidos y límites operativos en tiempo real para asesorar a tus clientes con total autoridad y cerrar ventas de inmediato.
                </p>

                {/* Screenshot de pestaña de planes */}
                <div className="rounded-2xl border border-slate-300 shadow-md bg-slate-900 p-3 sm:p-4 text-white overflow-hidden space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="ml-2 font-mono text-[11px] text-slate-300">godi.app / planes-y-fichas</span>
                    </div>
                    <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded font-bold">Módulo Planes Activo</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    <div className="bg-slate-800/90 border border-blue-500/40 rounded-xl p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold text-blue-400 uppercase">Facturación</span>
                        <span className="text-[10px] bg-blue-900/60 text-blue-200 px-1.5 py-0.5 rounded font-mono">8 Planes</span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium">Desde Emprendedor hasta Corporativo con comprobantes ilimitados.</p>
                      <div className="text-sm font-black text-amber-400">$3.99 - $35.00 / año</div>
                    </div>

                    <div className="bg-slate-800/90 border border-purple-500/40 rounded-xl p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold text-purple-400 uppercase">ERP Administrativo</span>
                        <span className="text-[10px] bg-purple-900/60 text-purple-200 px-1.5 py-0.5 rounded font-mono">Full Control</span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium">Gestión de inventarios, bancos, compras, ventas, nómina y ATS.</p>
                      <div className="text-sm font-black text-emerald-400">Mensual y Anual</div>
                    </div>

                    <div className="bg-slate-800/90 border border-emerald-500/40 rounded-xl p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold text-emerald-400 uppercase">Planes Contadores</span>
                        <span className="text-[10px] bg-emerald-900/60 text-emerald-200 px-1.5 py-0.5 rounded font-mono">Multi-RUC</span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium">Maneja 3, 5, 10 o empresas ilimitadas con panel multi-empresa.</p>
                      <div className="text-sm font-black text-amber-300">Descarga PDF Oficial</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Fichas Técnicas Oficiales en PDF</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Desglose detallado de módulos SRI</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Cotizador instantáneo con IVA</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* VENTANA 3: APRENDE A CREAR ARTES VISUALES (SCREENSHOT ARTE VISUAL) */}
            {/* ========================================================================= */}
            {currentSlide === 2 && (
              <motion.div
                key="slide-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-pink-700 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-100 flex items-center gap-1 w-fit">
                      <Palette className="w-3.5 h-3.5" /> Marketing & Publicidad
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-[#0B2545] tracking-tight mt-1">
                      Aprende a crear artes visuales desde 0 para impulsar tu distribución
                    </h2>
                  </div>
                  <span className="text-xs font-bold bg-pink-50 text-pink-900 border border-pink-200 px-3 py-1 rounded-full">
                    Generador de Banners HD
                  </span>
                </div>

                {/* Hook text */}
                <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
                  No necesitas ser diseñador gráfico. Nuestra suite incluye plantillas editables de alta conversión para historias, estados de WhatsApp, flyers y publicaciones listas para colocar tu nombre, teléfono y comenzar a captar prospectos calificados hoy mismo.
                </p>

                {/* Screenshot de pestaña de artes visuales */}
                <div className="rounded-2xl border border-pink-200 shadow-md bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-3 sm:p-4 text-white overflow-hidden space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="ml-2 font-mono text-[11px] text-slate-300">godi.app / arte-visual</span>
                    </div>
                    <span className="text-[10px] bg-pink-950 text-pink-300 px-2 py-0.5 rounded font-bold">Lienzo de Publicidad en Vivo</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    <div className="md:col-span-7 bg-gradient-to-br from-[#0B2545] to-[#3B51A3] p-4 rounded-xl border border-pink-400/30 space-y-2 relative overflow-hidden">
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[9px] rounded-full uppercase">
                        Plantilla Oficial
                      </div>
                      <h4 className="text-base font-black text-white">¡IMPULSA TU NEGOCIO CON FACTURACIÓN ELECTRÓNICA!</h4>
                      <p className="text-xs text-slate-200">Planes desde $3.99 anuales. Compatible con SRI, firmas electrónicas y soporte garantizado.</p>
                      <div className="p-2 bg-black/40 rounded-lg flex items-center justify-between text-xs font-mono">
                        <span className="text-emerald-400 font-bold">Asesor Autorizado: Tu Nombre</span>
                        <span className="text-amber-300">WhatsApp: +593...</span>
                      </div>
                    </div>

                    <div className="md:col-span-5 space-y-2 text-xs">
                      <div className="bg-slate-800/90 p-2.5 rounded-lg border border-slate-700">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">1. Personaliza tus datos</span>
                        <p className="text-slate-200 font-semibold mt-0.5">Nombre, Celular y Marca del Distribuidor</p>
                      </div>
                      <div className="bg-slate-800/90 p-2.5 rounded-lg border border-slate-700">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">2. Selecciona tu Paleta</span>
                        <div className="flex gap-1.5 mt-1">
                          <span className="w-4 h-4 rounded-full bg-blue-600"></span>
                          <span className="w-4 h-4 rounded-full bg-purple-600"></span>
                          <span className="w-4 h-4 rounded-full bg-emerald-600"></span>
                          <span className="w-4 h-4 rounded-full bg-amber-500"></span>
                        </div>
                      </div>
                      <div className="bg-emerald-950/80 border border-emerald-500/50 p-2 rounded-lg text-emerald-300 text-center font-bold">
                        Descarga en 1 Clic (PNG / JPG Alta Resolución)
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* VENTANA 4: CALCULA TUS COMISIONES (SCREENSHOT CALCULA TU COMISIÓN) */}
            {/* ========================================================================= */}
            {currentSlide === 3 && (
              <motion.div
                key="slide-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1 w-fit">
                      <Calculator className="w-3.5 h-3.5" /> Rentabilidad & Ganancias
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-[#0B2545] tracking-tight mt-1">
                      ¿Quieres conocer cuán rentable es la oportunidad de ser distribuidor?
                    </h2>
                  </div>
                  <span className="text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1 rounded-full">
                    Calculadora KPIer
                  </span>
                </div>

                {/* Hook text */}
                <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
                  Calcula tus comisiones de distribución de sistemas contables y firmas electrónicas para proyectar con exactitud tus ganancias mensuales. Visualiza tus márgenes netos, ingresos acumulados y el retorno de cada cliente cerrado.
                </p>

                {/* Screenshot de pestaña calcula tu comisión */}
                <div className="rounded-2xl border border-emerald-300 shadow-md bg-slate-900 p-3 sm:p-4 text-white overflow-hidden space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="ml-2 font-mono text-[11px] text-slate-300">godi.app / calcula-tu-comision</span>
                    </div>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-bold">Simulador Financiero</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-emerald-950/80 to-slate-900 border border-emerald-500/40 rounded-xl p-3 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">Comisión Sistemas</span>
                      <div className="text-xl font-black text-white">Hasta un 30%</div>
                      <p className="text-[11px] text-slate-300 font-medium">Por cada plan de facturación o ERP recurrente y anual.</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-950/80 to-slate-900 border border-blue-500/40 rounded-xl p-3 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400">Margen Firmas Electrónicas</span>
                      <div className="text-xl font-black text-white">50% Descuento</div>
                      <p className="text-[11px] text-slate-300 font-medium">Emisión directa con ANF Certification Board.</p>
                    </div>

                    <div className="bg-gradient-to-br from-amber-950/80 to-slate-900 border border-amber-500/40 rounded-xl p-3 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">Proyección Mensual</span>
                      <div className="text-xl font-black text-amber-300">$850 - $2,500+</div>
                      <p className="text-[11px] text-slate-300 font-medium">Calculado sobre 15 a 30 cierres comerciales promedio.</p>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-emerald-400" /> Simulación de ganancias en vivo por tipo de plan y volumen</span>
                    <span className="text-emerald-400 font-bold">¡100% transparente!</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* VENTANA 5: FIRMAS & PLATAFORMA DE PRUEBA (2 SCREENSHOTS) */}
            {/* ========================================================================= */}
            {currentSlide === 4 && (
              <motion.div
                key="slide-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1 w-fit">
                      <FileCheck className="w-3.5 h-3.5" /> Operación & Demostración
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-[#0B2545] tracking-tight mt-1">
                      Accede desde un solo entorno a tu herramienta de firmas y demo de clientes
                    </h2>
                  </div>
                  <span className="text-xs font-bold bg-indigo-50 text-indigo-900 border border-indigo-200 px-3 py-1 rounded-full">
                    Firmas Connect + Demo en Vivo
                  </span>
                </div>

                {/* Hook text */}
                <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
                  Genera firmas electrónicas certificadas en minutos con la <strong className="text-slate-900">Plataforma Connect</strong> y usa la <strong className="text-slate-900">versión de prueba para un demo</strong> en tiempo real con tus clientes.
                </p>

                {/* 2 Screenshots side-by-side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Screenshot 1: Plataforma Connect */}
                  <div className="rounded-2xl border border-blue-300 shadow-md bg-slate-900 p-3 text-white space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="ml-1 font-mono text-[10px] text-slate-300">connect.registroanfac.info.ec</span>
                      </div>
                      <span className="text-[9px] bg-blue-900 text-blue-200 px-1.5 py-0.2 rounded font-bold">Portal ANF</span>
                    </div>

                    <div className="p-3 bg-slate-800/90 rounded-xl space-y-2 border border-blue-500/30">
                      <div className="flex items-center gap-2 text-blue-400 font-black text-xs">
                        <FileCheck className="w-4 h-4" />
                        <span>Plataforma Connect - Emisión de Firmas</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Emisión instantánea de archivos .P12 y Token con validez legal internacional y respaldo de ANF Certification Board.
                      </p>
                      <div className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 50% de descuento directo para socios GoDi
                      </div>
                    </div>
                  </div>

                  {/* Screenshot 2: Plataforma de Prueba */}
                  <div className="rounded-2xl border border-indigo-300 shadow-md bg-slate-900 p-3 text-white space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="ml-1 font-mono text-[10px] text-slate-300">app.upconta.com / demo-sandbox</span>
                      </div>
                      <span className="text-[9px] bg-indigo-900 text-indigo-200 px-1.5 py-0.2 rounded font-bold">Demo Sandbox</span>
                    </div>

                    <div className="p-3 bg-slate-800/90 rounded-xl space-y-2 border border-indigo-500/30">
                      <div className="flex items-center gap-2 text-indigo-400 font-black text-xs">
                        <Laptop className="w-4 h-4" />
                        <span>Plataforma de Prueba (Demo en Vivo)</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Entorno interactivo para mostrarle al cliente la interfaz real de facturación, emisión de comprobantes, compras y reportes.
                      </p>
                      <div className="text-[11px] text-emerald-300 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ideal para cerrar reuniones comerciales sin riesgo
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* VENTANA 6: ADQUIERE TODO EL ECOSISTEMA EN OFERTA ($30 + IVA) */}
            {/* ========================================================================= */}
            {currentSlide === 5 && (
              <motion.div
                key="slide-5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <PricingPromoBlock />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ========================================================================= */}
          {/* RECUADRO "¿YA ERES SOCIO?" - EXCLUSIVO EN LA VENTANA DE BIENVENIDA (SLIDE 0) */}
          {/* ========================================================================= */}
          {currentSlide === 0 && (
            <div className="mt-8 pt-5 border-t-2 border-dashed border-amber-200/80 bg-gradient-to-br from-amber-50/60 to-orange-50/40 p-4 sm:p-5 rounded-2xl border border-amber-200 animate-fade-in">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-xs sm:text-sm">
                      ¿Ya eres socio registrado?
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Ingresa tu código de socio para desbloquear todas las herramientas y funciones avanzadas.
                    </p>
                  </div>
                </div>

                {/* Direct inline input */}
                <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full md:w-auto shrink-0">
                  <input
                    type="password"
                    value={inlineCode}
                    onChange={(e) => setInlineCode(e.target.value)}
                    placeholder="••••••"
                    className="px-3.5 py-1.5 text-xs sm:text-sm font-mono font-bold rounded-xl border border-slate-300 bg-white text-slate-800 focus:border-[#0B2545] focus:ring-2 focus:ring-blue-100 outline-none w-full sm:w-32 shadow-2xs tracking-wider placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0B2545] hover:bg-[#1E3A8A] active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <span>Ingresar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {codeFeedback === "error" && (
                <p className="text-xs font-bold text-rose-600 mt-2 flex items-center gap-1">
                  <span>Código no válido. Por favor verifica tu clave de acceso.</span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
