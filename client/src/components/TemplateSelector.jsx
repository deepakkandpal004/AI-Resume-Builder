import { Check, Layout } from 'lucide-react';
import React, { useState } from 'react'

const TemplateSelector = ({ selectedTemplate, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const templates = [
        {
            id: 'classic',
            name: 'Classic',
            preview: "A clean, traditional resume format with clear sections and professional typography"
        },
        {
            id: 'modern',
            name: 'Modern',
            preview: "Sleek design with stragetic use of color and modern font choices"
        },
        {
            id: 'minimal-image',
            name: 'Minimal Image',
            preview: "Minimal design with a single image and clean typography"
        },
        {
            id: 'minimal',
            name: 'Minimal',
            preview: "Ultra-clean design that puts your content front and center"
        },
        {
            id: 'executive',
            name: 'Executive',
            preview: "Bold gradient header banner with authoritative section styling for senior professionals"
        },
        {
            id: 'creative',
            name: 'Creative',
            preview: "Two-column layout with a vibrant sidebar — perfect for designers and marketers"
        },
        {
            id: 'compact',
            name: 'Compact',
            preview: "Dense, space-efficient single-column layout — fits more content on one page"
        },
    ]
  return (
    <div className='relative'>
        <button className='flex items-center gap-1.5 text-sm text-brand-700 bg-brand-50 border border-brand-100 hover:bg-brand-100 transition-all px-3 py-2 rounded-lg cursor-pointer dark:bg-brand-500/10 dark:text-brand-300 dark:border-brand-500/20 dark:hover:bg-brand-500/20' onClick={() => setIsOpen(!isOpen)}>
            <Layout className='max-sm:hidden' size={14} />
                <span>Template</span>
        </button>
        {isOpen && (
            <div className='absolute top-full w-xs p-3 mt-2 space-y-3 z-10 bg-surface rounded-md border border-line shadow-sm'>
                {templates.map((template) => (
                    <div 
                        key={template.id} 
                        className={`relative p-3 border rounded-md cursor-pointer transition-all ${selectedTemplate === template.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-line hover:border-brand-300 hover:bg-canvas'}`}
                        onClick={() => {
                            onChange(template.id);
                            setIsOpen(false);
                        }}
                    >
                        {selectedTemplate === template.id && (
                            <div className='absolute top-2 right-2'>
                                <div className='size-5 bg-brand-600 rounded-full flex items-center justify-center'>
                                    <Check className='text-white w-3 h-3' />
                                </div>
                            </div>
                        )}
                        <div className='space-y-1'>
                            <h4 className='font-medium text-ink'>{template.name}</h4>
                            <div className='mt-2 p-2 bg-canvas rounded text-xs text-muted italic'>{template.preview}</div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  )
}

export default TemplateSelector