import React, { useState } from "react";
import { X, Check } from "lucide-react";

interface ColorPickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialColor: string;
  onSelectColor: (color: string) => void;
  titleName?: string;
}

// Hexagon SVG helper component for honeycomb grid
interface HexagonProps {
  key?: React.Key;
  cx: number;
  cy: number;
  r: number;
  color: string;
  isSelected: boolean;
  onClick: (color: string) => void;
}

function Hexagon({ cx, cy, r, color, isSelected, onClick }: HexagonProps) {
  // Compute vertices for flat-topped or pointy hexagon
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle_deg = 60 * i - 30;
    const angle_rad = (Math.PI / 180) * angle_deg;
    points.push(`${cx + r * Math.cos(angle_rad)},${cy + r * Math.sin(angle_rad)}`);
  }

  return (
    <g onClick={() => onClick(color)} className="cursor-pointer group">
      <polygon
        points={points.join(" ")}
        fill={color}
        stroke={isSelected ? "#000000" : "#ffffff"}
        strokeWidth={isSelected ? 2.5 : 1}
        className="transition-transform duration-100 hover:scale-110 transform-origin-center"
      />
      {isSelected && (
        <circle
          cx={cx}
          cy={cy}
          r={r * 0.35}
          fill="none"
          stroke={color === "#ffffff" || color.toLowerCase() === "#fff" ? "#000000" : "#ffffff"}
          strokeWidth={2}
        />
      )}
    </g>
  );
}

// Pre-defined color honeycomb layout matching standard Windows/Office Color Picker
const HONEYCOMB_HEXAGONS: Array<{ x: number; y: number; color: string }> = [
  // Center
  { x: 0, y: 0, color: "#FFFFFF" },

  // Ring 1 (6 inner pastels / light colors)
  { x: 0, y: -1, color: "#E1F5FE" },
  { x: 0.866, y: -0.5, color: "#F3E5F5" },
  { x: 0.866, y: 0.5, color: "#FFEBEE" },
  { x: 0, y: 1, color: "#FFF8E1" },
  { x: -0.866, y: 0.5, color: "#E8F5E9" },
  { x: -0.866, y: -0.5, color: "#E0F2F1" },

  // Ring 2 (12 vibrant medium tones)
  { x: 0, y: -2, color: "#81D4FA" },
  { x: 0.866, y: -1.5, color: "#CE93D8" },
  { x: 1.732, y: -1, color: "#F48FB1" },
  { x: 1.732, y: 0, color: "#FF8A80" },
  { x: 1.732, y: 1, color: "#FFD180" },
  { x: 0.866, y: 1.5, color: "#FFE082" },
  { x: 0, y: 2, color: "#A5D6A7" },
  { x: -0.866, y: 1.5, color: "#80CBC4" },
  { x: -1.732, y: 1, color: "#80DEEA" },
  { x: -1.732, y: 0, color: "#90CAF9" },
  { x: -1.732, y: -1, color: "#B39DDB" },
  { x: -0.866, y: -1.5, color: "#4FC3F7" },

  // Ring 3 (18 bright standard colors)
  { x: 0, y: -3, color: "#0288D1" },
  { x: 0.866, y: -2.5, color: "#8E24AA" },
  { x: 1.732, y: -2, color: "#D81B60" },
  { x: 2.598, y: -1.5, color: "#E53935" },
  { x: 2.598, y: -0.5, color: "#F4511E" },
  { x: 2.598, y: 0.5, color: "#FB8C00" },
  { x: 2.598, y: 1.5, color: "#FFB300" },
  { x: 1.732, y: 2, color: "#FDD835" },
  { x: 0.866, y: 2.5, color: "#7CB342" },
  { x: 0, y: 3, color: "#43A047" },
  { x: -0.866, y: 2.5, color: "#00897B" },
  { x: -1.732, y: 2, color: "#00ACC1" },
  { x: -2.598, y: 1.5, color: "#1E88E5" },
  { x: -2.598, y: 0.5, color: "#3949AB" },
  { x: -2.598, y: -0.5, color: "#5E35B1" },
  { x: -2.598, y: -1.5, color: "#039BE5" },
  { x: -1.732, y: -2, color: "#0097A7" },
  { x: -0.866, y: -2.5, color: "#00838F" },

  // Ring 4 (Deep / Dark shades)
  { x: 0, y: -4, color: "#01579B" },
  { x: 0.866, y: -3.5, color: "#4A148C" },
  { x: 1.732, y: -3, color: "#880E4F" },
  { x: 2.598, y: -2.5, color: "#B71C1C" },
  { x: 3.464, y: -2, color: "#BF360C" },
  { x: 3.464, y: -1, color: "#E65100" },
  { x: 3.464, y: 0, color: "#FF6F00" },
  { x: 3.464, y: 1, color: "#FF8F00" },
  { x: 2.598, y: 2.5, color: "#F57F17" },
  { x: 1.732, y: 3, color: "#33691E" },
  { x: 0.866, y: 3.5, color: "#1B5E20" },
  { x: 0, y: 4, color: "#004D40" },
  { x: -0.866, y: 3.5, color: "#006064" },
  { x: -1.732, y: 3, color: "#01579B" },
  { x: -2.598, y: 2.5, color: "#0D47A1" },
  { x: -3.464, y: 1, color: "#1A237E" },
  { x: -3.464, y: 0, color: "#311B92" },
  { x: -3.464, y: -1, color: "#006064" },
  { x: -2.598, y: -2.5, color: "#004D40" },
  { x: -1.732, y: -3, color: "#0d3b66" },
  { x: -0.866, y: -3.5, color: "#0b3c5d" }
];

// Grayscale row hexagons
const GRAYSCALE_BAR: string[] = [
  "#FFFFFF",
  "#F5F5F5",
  "#E0E0E0",
  "#BDBDBD",
  "#9E9E9E",
  "#757575",
  "#616161",
  "#424242",
  "#212121",
  "#000000"
];

export const ColorPickerDialog: React.FC<ColorPickerDialogProps> = ({
  isOpen,
  onClose,
  initialColor,
  onSelectColor,
  titleName = "Selección de Color"
}) => {
  const [activeTab, setActiveTab] = useState<"estandar" | "personalizado">("estandar");
  const [selectedTempColor, setSelectedTempColor] = useState<string>(initialColor);

  if (!isOpen) return null;

  const handleApply = () => {
    onSelectColor(selectedTempColor);
    onClose();
  };

  // Convert hex to rgb
  const hexToRgbVals = (hex: string) => {
    let cleanHex = hex.replace("#", "");
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split("").map((c) => c + c).join("");
    }
    const num = parseInt(cleanHex, 16);
    if (isNaN(num)) return { r: 0, g: 0, b: 0 };
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  };

  const rgb = hexToRgbVals(selectedTempColor);

  const handleRgbChange = (channel: "r" | "g" | "b", val: number) => {
    const newRgb = { ...rgb, [channel]: Math.min(255, Math.max(0, val)) };
    const newHex =
      "#" +
      [newRgb.r, newRgb.g, newRgb.b]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("");
    setSelectedTempColor(newHex);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      {/* Classic Windows-style Window Container */}
      <div className="bg-slate-100 border border-slate-300 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden font-sans">
        
        {/* Title bar */}
        <div className="bg-slate-200 border-b border-slate-300 px-4 py-2.5 flex justify-between items-center select-none">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span>
            Colores - {titleName}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-300 rounded-lg transition-colors text-slate-600 hover:text-slate-900 cursor-pointer"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-5 bg-white">
          
          {/* Main Picker Column (8/12 cols) */}
          <div className="md:col-span-8 space-y-4">
            
            {/* Tabs Bar */}
            <div className="flex border-b border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab("estandar")}
                className={`px-4 py-1.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  activeTab === "estandar"
                    ? "border-orange-500 text-orange-600 bg-slate-50"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Estándar
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("personalizado")}
                className={`px-4 py-1.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  activeTab === "personalizado"
                    ? "border-orange-500 text-orange-600 bg-slate-50"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Personalizado
              </button>
            </div>

            {/* Tab 1: Estándar (Honeycomb color wheel) */}
            {activeTab === "estandar" && (
              <div className="space-y-4 py-1 flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider self-start">
                  Colores:
                </span>

                {/* SVG Hexagonal Honeycomb Palette */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-center shadow-inner">
                  <svg width="240" height="210" viewBox="-90 -85 180 170" className="overflow-visible select-none">
                    {HONEYCOMB_HEXAGONS.map((h, idx) => {
                      const radius = 11.5;
                      const spacing = 22;
                      const cx = h.x * spacing;
                      const cy = h.y * spacing;
                      const isSelected = selectedTempColor.toLowerCase() === h.color.toLowerCase();

                      return (
                        <Hexagon
                          key={idx}
                          cx={cx}
                          cy={cy}
                          r={radius}
                          color={h.color}
                          isSelected={isSelected}
                          onClick={(c) => setSelectedTempColor(c)}
                        />
                      );
                    })}
                  </svg>
                </div>

                {/* Grayscale Bar below Honeycomb */}
                <div className="w-full space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                    Escala de Grises:
                  </span>
                  <div className="flex gap-1 justify-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                    {GRAYSCALE_BAR.map((gColor) => {
                      const isSelected = selectedTempColor.toLowerCase() === gColor.toLowerCase();
                      return (
                        <button
                          key={gColor}
                          type="button"
                          onClick={() => setSelectedTempColor(gColor)}
                          style={{ backgroundColor: gColor }}
                          className={`w-5 h-5 rounded-md border transition-transform cursor-pointer ${
                            isSelected
                              ? "scale-125 border-orange-500 ring-2 ring-orange-500 z-10"
                              : "border-slate-300 hover:scale-110"
                          }`}
                          title={gColor}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Personalizado */}
            {activeTab === "personalizado" && (
              <div className="space-y-4 py-2">
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Selección directa y Valores RGB / HEX:
                  </span>

                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={selectedTempColor}
                      onChange={(e) => setSelectedTempColor(e.target.value)}
                      className="w-14 h-14 rounded-xl border border-slate-300 cursor-pointer shadow-sm p-1 bg-white"
                    />
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase block">Código Hexadecimal</label>
                      <input
                        type="text"
                        value={selectedTempColor.toUpperCase()}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.startsWith("#") || val.length <= 7) {
                            setSelectedTempColor(val);
                          }
                        }}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-mono text-xs text-slate-800 font-bold focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {/* RGB Sliders */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-200">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-red-600 w-12">Rojo (R):</span>
                      <input
                        type="range"
                        min="0"
                        max="255"
                        value={rgb.r}
                        onChange={(e) => handleRgbChange("r", parseInt(e.target.value))}
                        className="flex-1 accent-red-600 cursor-pointer"
                      />
                      <span className="font-mono text-xs font-bold text-slate-700 w-8 text-right">{rgb.r}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-green-600 w-12">Verde (G):</span>
                      <input
                        type="range"
                        min="0"
                        max="255"
                        value={rgb.g}
                        onChange={(e) => handleRgbChange("g", parseInt(e.target.value))}
                        className="flex-1 accent-green-600 cursor-pointer"
                      />
                      <span className="font-mono text-xs font-bold text-slate-700 w-8 text-right">{rgb.g}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-blue-600 w-12">Azul (B):</span>
                      <input
                        type="range"
                        min="0"
                        max="255"
                        value={rgb.b}
                        onChange={(e) => handleRgbChange("b", parseInt(e.target.value))}
                        className="flex-1 accent-blue-600 cursor-pointer"
                      />
                      <span className="font-mono text-xs font-bold text-slate-700 w-8 text-right">{rgb.b}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Action & Preview Column (4/12 cols) */}
          <div className="md:col-span-4 flex flex-col justify-between border-l border-slate-200 pl-4 space-y-4">
            
            {/* Buttons Top */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleApply}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all shadow-sm border border-blue-700 cursor-pointer flex items-center justify-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Aceptar</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-all border border-slate-300 cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            {/* Preview Box: "Nuevo" top over "Actual" bottom (Exact replica of Windows/Office Color Picker) */}
            <div className="space-y-1.5 pt-4 border-t border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block text-center">
                Muestra:
              </span>

              <div className="border-2 border-slate-300 rounded-xl overflow-hidden shadow-inner flex flex-col h-32">
                {/* Nuevo */}
                <div
                  className="flex-1 flex flex-col justify-end p-2 text-[10px] font-extrabold uppercase transition-colors"
                  style={{ backgroundColor: selectedTempColor }}
                >
                  <span className="px-1.5 py-0.5 rounded bg-black/40 text-white backdrop-blur-xs self-start text-[9px]">
                    Nuevo
                  </span>
                </div>

                {/* Actual */}
                <div
                  className="flex-1 flex flex-col justify-end p-2 text-[10px] font-extrabold uppercase"
                  style={{ backgroundColor: initialColor }}
                >
                  <span className="px-1.5 py-0.5 rounded bg-black/40 text-white backdrop-blur-xs self-start text-[9px]">
                    Actual
                  </span>
                </div>
              </div>

              <div className="text-[10px] font-mono text-center text-slate-500 font-bold pt-1">
                {selectedTempColor.toUpperCase()}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
