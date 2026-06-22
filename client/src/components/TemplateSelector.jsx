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
        }
    ]
  return (
    <div className='relative'>
        <button className='flex items-center gap-1.5 text-sm text-brand-700 bg-brand-50 border border-brand-100 hover:bg-brand-100 transition-all px-3 py-2 rounded-lg cursor-pointer' onClick={() => setIsOpen(!isOpen)}>
            <Layout className='max-sm:hidden' size={14} />
                <span>Template</span>
        </button>
        {isOpen && (
            <div className='absolute top-full w-xs p-3 mt-2 space-y-3 z-10 bg-white rounded-md border border-gray-200 shadow-sm'>
                {templates.map((template) => (
                    <div 
                        key={template.id} 
                        className={`relative p-3 border rounded-md cursor-pointer transition-all ${selectedTemplate === template.id ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}
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
                            <h4 className='font-medium text-gray-800'>{template.name}</h4>
                            <div className='mt-2 p-2 bg-brand-50 rounded text-xs text-gray-500 italic'>{template.preview}</div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  )
}

export default TemplateSelector