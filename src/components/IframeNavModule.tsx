import React from "react";

interface IframeNavModuleProps {
  title: string;
  url: string;
  subtitle: string;
  badge: string;
  iconType: "mlm" | "firmas";
}

export function IframeNavModule({
  title,
  url,
}: IframeNavModuleProps) {
  return (
    <div className="w-full animate-fade-in">
      {/* Direct Clean Web View Frame Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden w-full flex flex-col min-h-[85vh]">
        <div className="flex-1 w-full relative bg-slate-900">
          <iframe
            src={url}
            title={title}
            className="w-full h-[85vh] min-h-[750px] border-0"
            allow="geolocation; microphone; camera; encrypted-media; autoplay; clipboard-write"
          />
        </div>
      </div>
    </div>
  );
}
