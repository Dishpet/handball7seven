import React, { useRef, useState } from "react";
import { Download, Eye, Loader2, Pencil, Trash2, Sun, Moon } from "lucide-react";
import { DesignAsset, DesignCollectionKey } from "@/hooks/useDesignCollections";
import { StoreColor } from "@/hooks/useStoreCatalog";

interface DesignCardProps {
  design: DesignAsset;
  collectionKey: DesignCollectionKey;
  allColors: StoreColor[];
  isBusy: (key: string) => boolean;
  onPreview: (url: string) => void;
  onDelete: () => void;
  onUpdateColors: (darkColors: string[], lightColors: string[]) => void;
  onReplaceSingleImage: (variant: "dark" | "light", file: File) => void;
}

export default function DesignCard({
  design,
  collectionKey,
  allColors,
  isBusy,
  onPreview,
  onDelete,
  onUpdateColors,
  onReplaceSingleImage,
}: DesignCardProps) {
  const darkInputRef = useRef<HTMLInputElement | null>(null);
  const lightInputRef = useRef<HTMLInputElement | null>(null);
  const deleteKey = `${collectionKey}:delete:${design.id}`;
  const replaceDarkKey = `${collectionKey}:replace-dark:${design.id}`;
  const replaceLightKey = `${collectionKey}:replace-light:${design.id}`;

  const darkColors = design.darkColors || [];
  const lightColors = design.lightColors || [];

  const toggleColor = (hex: string, variant: "dark" | "light") => {
    let newDark = [...darkColors];
    let newLight = [...lightColors];

    if (variant === "dark") {
      if (newDark.includes(hex)) {
        newDark = newDark.filter((c) => c !== hex);
      } else {
        newDark.push(hex);
        newLight = newLight.filter((c) => c !== hex); // mutual exclusivity
      }
    } else {
      if (newLight.includes(hex)) {
        newLight = newLight.filter((c) => c !== hex);
      } else {
        newLight.push(hex);
        newDark = newDark.filter((c) => c !== hex); // mutual exclusivity
      }
    }
    onUpdateColors(newDark, newLight);
  };

  return (
    <div className="border border-white/10 bg-white/5 p-3 space-y-3">
      {/* Two image previews side by side */}
      <div className="grid grid-cols-2 gap-2">
        {/* Dark version */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-white/60 text-[10px] font-display uppercase tracking-widest">
            <Moon className="w-3 h-3" /> Dark
          </div>
          <button
            onClick={() => onPreview(design.url)}
            className="w-full aspect-square overflow-hidden bg-black/40 border border-white/10"
          >
            <img src={design.url} alt={`${design.name} dark`} className="w-full h-full object-contain" />
          </button>
          <div className="flex gap-1">
            <input
              ref={darkInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onReplaceSingleImage("dark", file);
                e.currentTarget.value = "";
              }}
            />
            <button
              onClick={() => darkInputRef.current?.click()}
              disabled={isBusy(replaceDarkKey)}
              className="p-1 text-white/70 hover:text-white disabled:opacity-60 min-w-[28px] min-h-[28px] flex items-center justify-center"
            >
              {isBusy(replaceDarkKey) ? <Loader2 className="w-3 h-3 animate-spin" /> : <Pencil className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Light version */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-white/60 text-[10px] font-display uppercase tracking-widest">
            <Sun className="w-3 h-3" /> Light
          </div>
          {design.lightUrl ? (
            <button
              onClick={() => onPreview(design.lightUrl!)}
              className="w-full aspect-square overflow-hidden bg-white/20 border border-white/10"
            >
              <img
                src={design.lightUrl}
                alt={`${design.name} light`}
                className="w-full h-full object-contain"
              />
            </button>
          ) : (
            <div className="w-full aspect-square bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-white/30 text-[10px] font-body">
              No light version
            </div>
          )}
          <div className="flex gap-1">
            <input
              ref={lightInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onReplaceSingleImage("light", file);
                e.currentTarget.value = "";
              }}
            />
            <button
              onClick={() => lightInputRef.current?.click()}
              disabled={isBusy(replaceLightKey)}
              className="p-1 text-white/70 hover:text-white disabled:opacity-60 min-w-[28px] min-h-[28px] flex items-center justify-center"
            >
              {isBusy(replaceLightKey) ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : design.lightUrl ? (
                <Pencil className="w-3 h-3" />
              ) : (
                <span className="text-[10px]">+ Add</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Name and actions */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-white/60 truncate font-body flex-1">{design.name}</p>
        <div className="flex gap-1">
          <button
            onClick={() => onPreview(design.url)}
            className="p-1 text-white/70 hover:text-white min-w-[28px] min-h-[28px] flex items-center justify-center"
          >
            <Eye className="w-3 h-3" />
          </button>
          <button
            onClick={() => window.open(design.url, "_blank")}
            className="p-1 text-white/70 hover:text-white min-w-[28px] min-h-[28px] flex items-center justify-center"
          >
            <Download className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            disabled={isBusy(deleteKey)}
            className="p-1 text-destructive/70 hover:text-destructive disabled:opacity-60 min-w-[28px] min-h-[28px] flex items-center justify-center"
          >
            {isBusy(deleteKey) ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Color assignment */}
      {allColors.length > 0 && (
        <div className="space-y-2 border-t border-white/10 pt-2">
          <p className="text-[10px] text-white/50 font-display uppercase tracking-widest">
            Color variant mapping
          </p>
          <div className="flex flex-wrap gap-1.5">
            {allColors.map((color) => {
              const isDark = darkColors.includes(color.hex);
              const isLight = lightColors.includes(color.hex);
              const isAssigned = isDark || isLight;

              return (
                <div key={color.id} className="flex flex-col items-center gap-0.5">
                  <div
                    className="relative w-6 h-6 rounded-full border cursor-pointer transition-transform hover:scale-110"
                    style={{
                      backgroundColor: color.hex,
                      borderColor: isAssigned ? (isDark ? "#fff" : "#fbbf24") : "rgba(255,255,255,0.2)",
                      boxShadow: isAssigned
                        ? isDark
                          ? "0 0 0 2px rgba(255,255,255,0.4)"
                          : "0 0 0 2px rgba(251,191,36,0.4)"
                        : "none",
                    }}
                    onClick={() => {
                      // Cycle: unassigned -> dark -> light -> unassigned
                      if (!isAssigned) {
                        toggleColor(color.hex, "dark");
                      } else if (isDark) {
                        toggleColor(color.hex, "light");
                      } else {
                        // Remove from light (toggle off)
                        toggleColor(color.hex, "light");
                      }
                    }}
                    title={`${color.name}: ${isDark ? "Dark version" : isLight ? "Light version" : "Click to assign"}`}
                  >
                    {isDark && (
                      <Moon className="w-3 h-3 text-white absolute inset-0 m-auto drop-shadow-md" />
                    )}
                    {isLight && (
                      <Sun className="w-3 h-3 text-yellow-400 absolute inset-0 m-auto drop-shadow-md" />
                    )}
                  </div>
                  <span className="text-[8px] text-white/40 font-body leading-none">{color.name.slice(0, 4)}</span>
                </div>
              );
            })}
          </div>
          <p className="text-[8px] text-white/30 font-body">
            Click to cycle: unassigned → <Moon className="w-2 h-2 inline" /> dark → <Sun className="w-2 h-2 inline text-yellow-400" /> light → unassigned
          </p>
        </div>
      )}
    </div>
  );
}
