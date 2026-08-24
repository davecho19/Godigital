import React, { useState } from "react";
import { Sparkles, Shield, ArrowRight, BookOpen, Target, Users, KeyRound, CheckCircle2 } from "lucide-react";

interface WelcomeScreenProps {
  onUnlock: (code: string) => void;
  codeFeedback?: "none" | "success" | "error";
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onUnlock, codeFeedback = "none" }) => {
  const [inlineCode, setInlineCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inlineCode.trim()) {
      onUnlock(inlineCode.trim());
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-4 px-2 sm:px-4 animate-fade-in">
      {/* Hero Welcome Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden relative">
        {/* Top Accent Strip */}
        <div className="h-3 bg-gradient-to-r from-[#0B2545] via-[#3B51A3] to-amber-400" />

        <div className="p-6 sm:p-10 md:p-12 space-y-8">
          {/* Header Title Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-[#3B51A3] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                Comunidad de Distribuidores
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0B2545] tracking-tight mt-1">
                ¡Bienvenido a GODI!
              </h1>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>ANF & UPCONTA</span>
            </div>
          </div>

          {/* Core Manifest Message */}
          <div className="space-y-5 text-slate-700 text-base sm:text-lg leading-relaxed font-normal">
            <p className="font-extrabold text-xl sm:text-2xl text-[#0B2545] leading-snug">
              Aquí no vienes solamente a vender. Vienes a crecer.
            </p>

            <p>
              En <strong className="font-black text-slate-900">GODI</strong> creemos que un socio bien capacitado, acompañado y respaldado puede llegar mucho más lejos. Por eso, hemos creado este espacio para ayudarte a desarrollar tu negocio, fortalecer tus conocimientos y convertir cada oportunidad en una posibilidad real de crecimiento.
            </p>

            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-amber-50/60 border border-blue-100 text-slate-800 font-medium">
              <p className="text-base sm:text-lg font-bold text-slate-900">
                Nosotros ponemos las herramientas, la capacitación y el acompañamiento. <span className="text-[#3B51A3]">Tú pones las ganas de crecer.</span>
              </p>
            </div>

            <p>
              A través de esta plataforma tendrás acceso a recursos comerciales, capacitaciones, materiales, herramientas y todo lo necesario para que puedas avanzar con mayor seguridad y convertirte en un socio cada vez más preparado.
            </p>

            <p>
              Queremos crecer contigo, ayudarte a vender mejor y construir juntos una relación comercial que vaya mucho más allá de una venta.
            </p>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-1">
              <p className="font-black text-slate-900 text-lg sm:text-xl">
                Tu crecimiento también es nuestro crecimiento.
              </p>
              <p className="font-bold text-[#3B51A3] text-base sm:text-lg">
                Bienvenido a GODI. El siguiente paso empieza aquí.
              </p>
            </div>
          </div>

          {/* Access Code Prompt Box */}
          <div className="mt-8 pt-6 border-t-2 border-dashed border-amber-200/80 bg-gradient-to-br from-amber-50/60 to-orange-50/40 p-5 sm:p-6 rounded-2xl border border-amber-200">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base">
                    Ingreso a las Herramientas de Socio
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    <strong>Recuerda:</strong> ingresa tu código de socio en la parte superior para acceder a todas las herramientas que tenemos preparadas para ti.
                  </p>
                </div>
              </div>

              {/* Direct inline input for convenience */}
              <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full md:w-auto shrink-0">
                <input
                  type="text"
                  value={inlineCode}
                  onChange={(e) => setInlineCode(e.target.value)}
                  placeholder="Código..."
                  className="px-3.5 py-2 text-sm font-mono font-bold rounded-xl border border-slate-300 bg-white text-slate-800 focus:border-[#0B2545] focus:ring-2 focus:ring-blue-100 outline-none w-full sm:w-36 shadow-2xs"
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
              <p className="text-xs font-bold text-rose-600 mt-2.5 flex items-center gap-1">
                <span>Código no válido. Por favor verifica tu clave de acceso.</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
