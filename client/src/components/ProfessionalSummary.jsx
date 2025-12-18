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
                <h3 className='flex items-center gap-2 tex-lg font-semibold text-gray-900'>Professional Summary</h3>
                <p className='text-sm text-gray-500'>Add Summay for your resume here</p>
            </div>
            <button disabled={isGenerating} onClick={generateSummary} className='flex items-center gap-2 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors disabled:opacity-50'>
                {isGenerating ? (<Loader2 className='size-4 animate-spin'/>) : (<Sparkles className='size-4'/>)}
                {isGenerating ? "Enhancing..." : "AI Enhance"}
            </button>
        </div>
        
        <div className='mt-6'>
            <textarea value={data || ""} onChange={(e) => {
                onChange(e.target.value);
            }} rows={7} name="" id="" className='w-full p-3 px-4 mt-2 border text-sm border-gray-300 rounded-lg focus:ring focus:ring-blue-500 focus:border-blue-500 outline transition-colors resize-none' placeholder='Write a compelling professional Summary that highlights your key strength and carrer Objectives...'/>
            <p className='text-sm text-gray-500 max-4/5 mx-auto text-center'>Tip: Keep it concise (3-4 Sentences) and focus on your most relevant achievements and skills</p>
        </div>
    </div>
  )
}

export default ProfessionalSummary
