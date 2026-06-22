import { Loader2, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import api from "../configs/api";
import { toast } from 'react-hot-toast'

const ProfessionalSummary = ({data, onChange}) => {

  const {token} = useSelector((state) => state.auth);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSummary = async () => {
    try {
      setIsGenerating(true);
      const prompt = `enhance my professional summary: "${data}"`
      const response = await api.post(`/api/ai/enhance-pro-sum`, {userContent: prompt}, {headers: { Authorization: `Bearer ${token}` },});
      onChange(response.data.enhancedContent || "");
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setIsGenerating(false);
    }
  }
  return (
    <div className='space-y-4'>
        <div className='flex justify-between items-center'>
            <div>
                <h3 className='flex items-center gap-2 text-lg font-semibold text-ink'>Professional Summary</h3>
                <p className='text-sm text-muted'>Add a summary for your resume here</p>
            </div>
            <button disabled={isGenerating} onClick={generateSummary} className='flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-600 to-accent-600 px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50'>
                {isGenerating ? (<Loader2 className='size-4 animate-spin'/>) : (<Sparkles className='size-4'/>)}
                {isGenerating ? "Enhancing..." : "AI Enhance"}
            </button>
        </div>
        
        <div className='mt-6'>
            <textarea value={data || ""} onChange={(e) => {
                onChange(e.target.value);
            }} rows={7} className='mt-2 w-full resize-none rounded-lg border border-line p-3 px-4 text-sm transition-colors' placeholder='Write a compelling professional summary that highlights your key strengths and career objectives...'/>
            <p className='mx-auto mt-2 text-center text-sm text-muted'>Tip: Keep it concise (3-4 sentences) and focus on your most relevant achievements and skills</p>
        </div>
    </div>
  )
}

export default ProfessionalSummary
