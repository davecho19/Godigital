import React, { useEffect, useState } from "react";
import { Sparkles, Gift, Flame } from "lucide-react";
import {
  RewardItem,
  getStoredRewardsCatalog,
  REWARDS_STORAGE_KEY,
  REWARDS_UPDATED_EVENT,
} from "../utils/rewardsData";

interface PromocionesTeleprompterProps {
  onNavigateToBeneficios?: () => void;
}

export function PromocionesTeleprompter({ onNavigateToBeneficios }: PromocionesTeleprompterProps) {
  const [items, setItems] = useState<RewardItem[]>(() => {
    return getStoredRewardsCatalog().filter((item) => item.activo !== false);
  });

  useEffect(() => {
    const handleUpdate = () => {
      const all = getStoredRewardsCatalog();
      setItems(all.filter((item) => item.activo !== false));
    };

    window.addEventListener(REWARDS_UPDATED_EVENT, handleUpdate);
    window.addEventListener("kpier_rewards_updated", handleUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === REWARDS_STORAGE_KEY) {
        handleUpdate();
      }
    });

    return () => {
      window.removeEventListener(REWARDS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("kpier_rewards_updated", handleUpdate);
    };
  }, []);

  // Format short readable title for teleprompter (e.g., "Firma Natural 1 Año 120 pts", "Firma Jurídica 2 Años 250 pts")
  const formatItemText = (item: RewardItem) => {
    let cleanTitle = item.title;
    cleanTitle = cleanTitle
      .replace(/\s*\(\.p12\)/gi, "")
      .replace(/Firma Electrónica Persona Natural/gi, "Firma Natural")
      .replace(/Firma Electrónica Representante Legal/gi, "Firma Jurídica")
      .replace(/Firma Electrónica Persona Jurídica/gi, "Firma Jurídica")
      .replace(/Firma Electrónica/gi, "Firma");

    return {
      title: cleanTitle,
      points: item.pointsCost,
      isPromo: !!item.esPromocion,
      badge: item.badge,
    };
  };

  const displayList = items.length > 0 ? items : getStoredRewardsCatalog();
  const formattedItems = displayList.map(formatItemText);

  // Duplicate items to make an infinite seamless looping ticker
  const tickerItems = [...formattedItems, ...formattedItems, ...formattedItems];

  return (
    <div
      id="promociones-teleprompter-container"
      className="relative flex-1 overflow-hidden h-7 flex items-center select-none"
      onClick={onNavigateToBeneficios}
      title="Catálogo de Beneficios y Puntos en tiempo real. Clic para ver y canjear premios."
    >
      {/* Left/Right soft fade overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#0F172A] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#0F172A] to-transparent z-10 pointer-events-none" />

      {/* Marquee Ticker Track */}
      <div className="flex items-center gap-6 whitespace-nowrap animate-teleprompter hover:[animation-play-state:paused] cursor-pointer">
        {tickerItems.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className="flex items-center gap-2 text-xs text-slate-200 transition-colors hover:text-white shrink-0 group"
          >
            {/* Sparkle or Gift icon */}
            {item.isPromo ? (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[9px] font-black uppercase tracking-wider">
                <Sparkles className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
                Promo
              </span>
            ) : (
              <Gift className="w-3 h-3 text-blue-400/80 group-hover:text-blue-300" />
            )}

            {/* Title */}
            <span className="font-semibold text-slate-100 group-hover:text-amber-200 transition-colors">
              {item.title}
            </span>

            {/* Points pill */}
            <span className="font-black text-[11px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30">
              {item.points} {item.points === 1 ? "punto" : "puntos"}
            </span>

            {/* Separator */}
            <span className="text-slate-600 font-black text-xs pl-2">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
