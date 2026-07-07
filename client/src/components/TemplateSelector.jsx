import { Check, ChevronDown } from 'lucide-react';
import React, { useState } from 'react'

const templates = [
  { id: 'classic', name: 'Classic', color: '#6366f1' },
  { id: 'modern', name: 'Modern', color: '#10b981' },
  { id: 'minimal-image', name: 'Minimal Image', color: '#2dd4bf' },
  { id: 'minimal', name: 'Minimal', color: '#2dd4bf' },
  { id: 'executive', name: 'Executive', color: '#2563EB' },
  { id: 'creative', name: 'Creative', color: '#E11D48' },
  { id: 'compact', name: 'Compact', color: '#D97706' },
];

const TemplateSelector = ({ selectedTemplate, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const active = templates.find((t) => t.id === selectedTemplate) || templates[0];

  return (
    <div className='relative'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-ink transition hover:bg-canvas'
      >
        <span className="size-3 rounded-full" style={{ backgroundColor: active.color }} />
        <span>{active.name}</span>
        <ChevronDown className={`size-3.5 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className='absolute left-0 top-full z-40 mt-1 w-36 overflow-hidden rounded-xl border border-line bg-surface shadow-lg'>
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => { onChange(template.id); setIsOpen(false); }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition hover:bg-line/20 ${
                  selectedTemplate === template.id ? "font-medium text-ink" : "text-muted"
                }`}
              >
                <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: template.color }} />
                <span className="flex-1 text-left">{template.name}</span>
                {selectedTemplate === template.id && (
                  <Check className="size-3.5 text-emerald-500" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TemplateSelector;
