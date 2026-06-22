import { Check, Palette } from "lucide-react";
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

  return (
    <div className="relative">
      <button
        className="flex items-center gap-1.5 text-sm text-brand-700 bg-brand-50 border border-brand-100 hover:bg-brand-100 transition-all px-3 py-2 rounded-lg cursor-pointer dark:bg-brand-500/10 dark:text-brand-300 dark:border-brand-500/20 dark:hover:bg-brand-500/20"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Palette size={16} /> <span className="max-sm:hidden">Accent</span>
      </button>

      {isOpen && (
        <div className="absolute top-full w-60 p-3 mt-2 grid grid-cols-4 gap-3 z-10 bg-surface rounded-md border border-line shadow-sm">
          {colors.map((color) => (
            <div
              key={color.value}
              className="flex flex-col items-center gap-1 cursor-pointer"
              onClick={() => {
                onChange(color.value);
                setIsOpen(false);
              }}
            >
              <div
                className="w-8 h-8 rounded-full relative border-2 border-surface hover:border-line shadow-sm"
                style={{ backgroundColor: color.value }}
              >
                {selectedColor === color.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="text-white size-4" />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted">{color.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
