import React, { useState, useEffect, useRef } from "react";
import { X, Download, ZoomIn, ZoomOut, RotateCcw, Copy, Check, Move, Sparkles } from "lucide-react";

interface ImageZoomLightboxProps {
  isOpen: boolean;
  title: string;
  filename: string;
  onClose: () => void;
  badgeText?: string;
  resolutionText?: string;
}

export function ImageZoomLightbox({
  isOpen,
  title,
  filename,
  onClose,
  badgeText = "Arte Oficial UpConta",
  resolutionText = "1082 x 1349 px • PNG Alta Calidad"
}: ImageZoomLightboxProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [copied, setCopied] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset zoom & pan when image changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [isOpen, filename]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const fileUrl = filename.startsWith("/") ? filename : `/artes/${encodeURIComponent(filename)}`;
  const downloadName = filename.split("/").pop() || filename;

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(4, Number((prev + 0.25).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(0.5, Number((prev - 0.25).toFixed(2)));
      if (next <= 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Wheel zoom (scroll)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    setZoom((prev) => {
      const next = Math.min(4, Math.max(0.5, Number((prev + delta).toFixed(2))));
      if (next <= 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pan handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom <= 1 || e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || zoom <= 1 || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Click on image toggles 1x and 2x zoom
  const handleImageClick = (e: React.MouseEvent) => {
    // If we were dragging significantly, don't toggle
    if (zoom === 1) {
      setZoom(2);
    } else {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  };

  const handleDownload = async () => {
    try {
      const res = await fetch(fileUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      window.open(fileUrl, "_blank");
    }
  };

  const handleCopy = async () => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      if (blob && navigator.clipboard && typeof (window as any).ClipboardItem !== "undefined") {
        await navigator.clipboard.write([
          new (window as any).ClipboardItem({ [blob.type || "image/png"]: blob })
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }
      throw new Error("ClipboardItem not supported");
    } catch {
      const fullUrl = `${window.location.origin}${fileUrl}`;
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[96vh] h-full sm:h-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
              <Sparkles className="w-5 h-5 text-amber-700" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded shadow-2xs">
                  {badgeText}
                </span>
                <span className="text-[10px] font-mono text-slate-500 hidden sm:inline truncate max-w-[200px]">
                  {filename}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 truncate mt-0.5">
                {title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0 ml-2"
            title="Cerrar vista (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Image Viewport with Scroll & Drag Zoom */}
        <div
          ref={containerRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`relative flex-1 min-h-[350px] sm:min-h-[500px] max-h-[72vh] overflow-hidden flex items-center justify-center bg-slate-900 select-none ${
            zoom > 1
              ? isDragging
                ? "cursor-grabbing"
                : "cursor-grab"
              : "cursor-zoom-in"
          }`}
        >
          {/* Subtle Grid Background */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "20px 20px"
            }}
          />

          {/* Interactive Image with Transform */}
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "center center",
              transition: isDragging ? "none" : "transform 0.15s ease-out"
            }}
            className="will-change-transform flex items-center justify-center pointer-events-auto"
          >
            <img
              ref={imgRef}
              src={fileUrl}
              alt={title}
              onClick={handleImageClick}
              draggable={false}
              className="max-h-[64vh] max-w-[85vw] sm:max-w-2xl w-auto h-auto object-contain rounded-xl shadow-2xl border border-white/10 bg-white"
            />
          </div>

          {/* Floating Zoom & Pan Controls Pill */}
          <div 
            className="absolute bottom-4 inset-x-0 mx-auto w-fit flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full border border-white/20 shadow-2xl z-20 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="p-1.5 rounded-full hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
              title="Alejar (Zoom -)"
            >
              <ZoomOut className="w-4 h-4 text-slate-200" />
            </button>

            <button
              type="button"
              onClick={handleResetZoom}
              className="px-2.5 py-1 text-xs font-black text-amber-400 hover:text-amber-300 tracking-wider transition-colors cursor-pointer flex items-center gap-1"
              title="Restablecer tamaño original (100%)"
            >
              <span>{Math.round(zoom * 100)}%</span>
              {zoom !== 1 && <RotateCcw className="w-3 h-3 text-slate-400" />}
            </button>

            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= 4}
              className="p-1.5 rounded-full hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
              title="Acercar (Zoom +)"
            >
              <ZoomIn className="w-4 h-4 text-slate-200" />
            </button>

            {zoom > 1 && (
              <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 border-l border-white/20 pl-2 ml-1">
                <Move className="w-3 h-3 text-amber-400" />
                <span>Arrastra para mover</span>
              </div>
            )}
          </div>

          {/* Top Quick Tip Banner */}
          <div className="absolute top-3 left-3 pointer-events-none hidden sm:flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-xs text-slate-300 text-[10px] px-2.5 py-1 rounded-full border border-white/10">
            <span>💡 Rueda del mouse para zoom • Clic para ampliar</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            Resolución: <strong className="text-slate-800">{resolutionText}</strong>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopy}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              title="Copiar enlace de la imagen"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? "¡Copiado!" : "Copiar URL"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cerrar
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 sm:flex-initial px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>Descargar PNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
