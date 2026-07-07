import { Check, ChevronDown } from "lucide-react";
import React, { useState } from "react";

const ColorPicker = ({ selectedColor, onChange }) => {
  const colors = [
    { name: "Indigo", value: "#4F46E5" },
    { name: "Teal", value: "#0D9488" },
    { name: "Navy", value: "#1E3A8A" },
    { name: "Violet", value: "#7C3AED" },
    { name: "Blue", value: "#2563EB" },
    { name: "Emerald", value: "#059669" },
    { name: "Rose", value: "#E11D48" },
    { name: "Amber", value: "#D97706" },
    { name: "Slate", value: "#475569" },
    { name: "Ink", value: "#0F172A" },
  ];

  const [isOpen, setIsOpen] = useState(false);
  const active = colors.find((c) => c.value === selectedColor) || colors[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-ink transition hover:bg-canvas"
      >
        <span className="size-3 rounded-full" style={{ backgroundColor: active.value }} />
        <span className="max-sm:hidden">{active.name}</span>
        <ChevronDown className={`size-3.5 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full z-40 mt-1 overflow-hidden rounded-xl border border-line bg-surface shadow-lg p-1.5">
            <div className="grid grid-cols-5 gap-1">
              {colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => { onChange(color.value); setIsOpen(false); }}
                  className={`size-7 rounded-full transition-all ${selectedColor === color.value ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-surface" : "hover:scale-110"}`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ColorPicker;
