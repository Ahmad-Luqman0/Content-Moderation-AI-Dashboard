import React, { useState } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { Button, Card } from './ui/Base';
import { AnalysisParams } from '../types';

interface UploadFormProps {
  onAnalyze: (input: { file?: File; url?: string; text?: string }, params: AnalysisParams) => void;
  isLoading: boolean;
  hasResults?: boolean;
}

export const UploadForm = ({ onAnalyze, isLoading, hasResults }: UploadFormProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [textInput, setTextInput] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'auto' | 'en' | 'pt'>('auto');
  const [activeTab, setActiveTab] = useState<'video' | 'text'>('video');
  
  const getParams = (): AnalysisParams => ({
    source_language: language,
    mode: 'sensitive',
    threshold: undefined,
    sample_fps: 2.0,
    min_segment_sec: 2.0,
    min_positive_frames: undefined,
    min_average_score: undefined,
    max_gap_frames: 0,
    smoothing_window: 3,
    display_frames_per_segment: 4,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setUrlError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
      setUrlError(null);
    }
  };

  const isValidUrl = (value: string) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'text') {
      if (textInput.trim()) {
        onAnalyze({ text: textInput }, getParams());
      }
      return;
    }

    const trimmedUrl = videoUrl.trim();
    if (trimmedUrl) {
      if (!isValidUrl(trimmedUrl)) {
        setUrlError('Please enter a valid http(s) video URL.');
        return;
      }
      setUrlError(null);
      onAnalyze({ url: trimmedUrl }, getParams());
      // We don't return if there are also files; we might want to analyze both
    }

    if (files.length > 0) {
      files.forEach(file => {
        onAnalyze({ file }, getParams());
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full gap-8">
      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-brand-border">
        <button
          type="button"
          onClick={() => {
            setActiveTab('video');
            setUrlError(null);
          }}
          className={`pb-4 px-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${
            activeTab === 'video'
              ? 'border-brand-accent text-brand-accent'
              : 'border-transparent text-slate-400 hover:text-slate-900'
          }`}
        >
          Visual Pipeline
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('text');
            setUrlError(null);
          }}
          className={`pb-4 px-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${
            activeTab === 'text'
              ? 'border-brand-accent text-brand-accent'
              : 'border-transparent text-slate-400 hover:text-slate-900'
          }`}
        >
          Text Engine
        </button>
      </div>

      {/* Video Upload Tab */}
      {activeTab === 'video' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Source Language</label>
            <div className="grid grid-cols-3 gap-2">
              {(['auto', 'en', 'pt'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                    language === lang 
                      ? 'bg-brand-accent/10 border-brand-accent text-brand-accent accent-glow' 
                      : 'bg-white border-brand-border text-slate-500 hover:border-slate-400'
                  }`}
                >
                  {lang === 'auto' ? 'Auto' : lang === 'en' ? 'English' : 'Português'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 glass-panel p-5 rounded-2xl premium-shadow">
            <div className="flex items-center gap-2 text-slate-800 mb-2">
              <div className="w-6 h-6 rounded-lg bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                <Upload size={14} />
              </div>
              <h2 className="font-bold tracking-[0.1em] uppercase text-[10px]">Media Batch Upload</h2>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center gap-4 bg-slate-50/50 hover:bg-brand-accent/5 hover:border-brand-accent group cursor-pointer ${files.length > 0 ? 'border-brand-success/50 bg-brand-success/5' : 'border-slate-200'}`}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input
                id="file-upload"
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />

              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${files.length > 0 ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-accent/5 text-brand-accent'}`}>
                <Upload size={24} />
              </div>

              <div className="text-center">
                {files.length > 0 ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{files.length} Videos Selected</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFiles([]);
                      }}
                      className="text-brand-danger hover:text-brand-danger/80 font-black text-[10px] uppercase tracking-widest"
                    >
                      Clear All
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-700">Drop Media Modules</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Supports multiple selection</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label htmlFor="video-url" className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">
                Remote Stream URL
              </label>
              <div className="relative group">
                <input
                  id="video-url"
                  type="url"
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    if (urlError) {
                      setUrlError(null);
                    }
                  }}
                  placeholder="Paste video stream link..."
                  className="w-full rounded-xl border border-brand-border bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10 transition-all shadow-sm"
                />
              </div>
              {urlError && <p className="text-[10px] text-brand-danger font-bold uppercase tracking-wider">{urlError}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Text Input Tab */}
      {activeTab === 'text' && (
        <div className="flex-1 flex flex-col space-y-4 glass-panel p-5 rounded-2xl premium-shadow">
          <div className="flex items-center gap-2 text-slate-800 mb-2">
             <div className="w-6 h-6 rounded-lg bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                <Upload size={14} />
              </div>
            <h2 className="font-bold tracking-[0.1em] uppercase text-[10px]">Text Stream Context</h2>
          </div>

          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Initialize raw text stream for safety classification..."
            className="w-full flex-1 rounded-xl border border-brand-border bg-white px-4 py-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10 transition-all resize-none font-mono shadow-sm"
          />
        </div>
      )}

      <div className="mt-auto space-y-5">
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => {
              setFiles([]);
              setVideoUrl('');
              setTextInput('');
              setUrlError(null);
            }}
            className="group flex items-center gap-2 text-[9px] font-black text-slate-400 hover:text-brand-danger uppercase tracking-[0.3em] transition-all py-2"
          >
            <Trash2 size={12} className="transition-transform group-hover:scale-110" />
            Reset All Pipeline Inputs
          </button>
        </div>

        <Button 
          variant="primary" 
          size="md" 
          type="submit" 
          className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.3em] text-xs accent-glow transition-all active:scale-[0.98] shadow-lg shadow-brand-accent/20"
          isLoading={isLoading}
          disabled={activeTab === 'video' ? (files.length === 0 && !videoUrl.trim()) : !textInput.trim()}
        >
          {hasResults ? 'RE-SCAN BATCH' : 'INITIALIZE SCAN'}
        </Button>
        <div className="glass-panel p-4 rounded-xl border-brand-border/30 bg-slate-50/50">
          <p className="text-[9px] text-slate-500 text-center leading-relaxed font-bold uppercase tracking-widest opacity-80">
            {activeTab === 'video' 
              ? `Status: Batch ready | Lang: ${language.toUpperCase()} | Engine: Multi-Modal v4`
              : 'Status: Text engine online | Mode: Deep Classification | NER: Enabled'}
          </p>
        </div>
      </div>
    </form>
  );
};

