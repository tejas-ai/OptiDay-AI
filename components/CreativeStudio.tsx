import React, { useState } from 'react';
import { Image, Wand2, Download, Upload, Loader2, Sparkles } from 'lucide-react';
import { generateImage, editImage } from '../services/geminiService';
import { ImageSize } from '../types';

const CreativeStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'edit'>('generate');
  const [prompt, setPrompt] = useState('');
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setResultImage(null);
    try {
      const base64 = await generateImage(prompt, imageSize);
      setResultImage(`data:image/png;base64,${base64}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!prompt || !selectedFile) return;
    setIsLoading(true);
    setResultImage(null);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        try {
            const base64Result = await editImage(base64String, selectedFile.type, prompt);
            setResultImage(`data:image/png;base64,${base64Result}`);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultImage(null);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-6 transition-colors duration-200">
       <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-5 w-5 text-indigo-500" />
        <h3 className="text-lg font-semibold text-white">Creative Studio</h3>
      </div>

      <div className="flex space-x-1 bg-slate-900 p-1 rounded-lg mb-6">
        <button
          onClick={() => setActiveTab('generate')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'generate' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Generate Image
        </button>
        <button
          onClick={() => setActiveTab('edit')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'edit' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Edit Image
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === 'edit' && (
          <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center hover:border-indigo-500 transition-colors cursor-pointer relative">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="h-48 mx-auto object-contain rounded" />
            ) : (
                <div className="py-8">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Click to upload an image to edit</p>
                </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {activeTab === 'generate' ? 'Describe your imagination' : 'How should we edit this image?'}
          </label>
          <div className="flex gap-2">
            <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={activeTab === 'generate' ? "A calm futuristic workspace with plants..." : "Add a retro filter, remove background..."}
                className="flex-1 px-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-900 text-white placeholder-slate-500"
            />
            {activeTab === 'generate' && (
                <select 
                    value={imageSize}
                    onChange={(e) => setImageSize(e.target.value as ImageSize)}
                    className="bg-slate-900 text-white border border-slate-600 rounded-lg px-2 text-sm"
                >
                    <option value="1K">1K</option>
                    <option value="2K">2K</option>
                    <option value="4K">4K</option>
                </select>
            )}
          </div>
        </div>

        <button
          onClick={activeTab === 'generate' ? handleGenerate : handleEdit}
          disabled={isLoading || !prompt || (activeTab === 'edit' && !selectedFile)}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          {activeTab === 'generate' ? 'Generate Artwork' : 'Apply Magic Edit'}
        </button>

        {resultImage && (
            <div className="mt-6">
                <div className="relative group rounded-lg overflow-hidden border border-slate-700">
                    <img src={resultImage} alt="Result" className="w-full h-auto" />
                    <a 
                        href={resultImage} 
                        download={`optiday-${activeTab}-${Date.now()}.png`}
                        className="absolute bottom-4 right-4 bg-white text-slate-900 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-50"
                    >
                        <Download className="h-5 w-5" />
                    </a>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default CreativeStudio;