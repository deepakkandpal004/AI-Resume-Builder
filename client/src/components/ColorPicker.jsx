import { Check, Palette } from "lucide-react";
import React, { useState } from "react";

const ColorPicker = ({ selectedColor, onChange }) => {
  const colors = [
    { name: "Blue", value: "#3B82F6" },
    { name: "Red", value: "#EF4444" },
    { name: "Green", value: "#10B981" },
    { name: "Purple", value: "#8B5CF6" },
    { name: "Orange", value: "#F59E0B" },
    { name: "Teal", value: "#14B8A6" },
    { name: "Pink", value: "#EC4899" },
    { name: "Gray", value: "#6B7280" },
    { name: "Indigo", value: "#6366F1" },
    { name: "Black", value: "#1F2937" },
  ];

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="flex items-center gap-1 text-sm text-purple-600 bg-gradient-to-br from-purple-50 to-purple-100 ring-purple-300 hover:ring transition-all px-3 py-2 rounded-lg cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Palette size={16} /> <span className="max-sm:hidden">Accent</span>
      </button>

      {isOpen && (
        <div className="absolute top-full w-60 p-3 mt-2 grid grid-cols-4 gap-3 z-10 bg-white rounded-md border border-gray-200 shadow-sm">
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
                className="w-8 h-8 rounded-full relative border-2 border-white hover:border-gray-300 shadow-sm"
                style={{ backgroundColor: color.value }}
              >
                {selectedColor === color.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="text-white size-4" />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-600">{color.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
