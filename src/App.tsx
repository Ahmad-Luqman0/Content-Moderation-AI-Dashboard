import React, { useEffect, useRef, useState } from 'react';
import { Shield, RefreshCcw, AlertTriangle, Waves, LayoutGrid, Trash2 } from 'lucide-react';
import { UploadForm } from './components/UploadForm';
import { Summary } from './components/Summary';
import { AudioPanel } from './components/AudioPanel';
import { VideoPanel } from './components/VideoPanel';
import { AnalysisResponse, AnalysisParams } from './types';
import { apiService } from './services/api';
import { cn } from './lib/utils';
import { Button } from './components/ui/Base';

type Tab = 'audio' | 'video';

export default function App() {
  const [allResults, setAllResults] = useState<AnalysisResponse[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('audio');
  
  const results = allResults.find(r => r.file === selectedId) || null;

  const getStatusFromProgress = (p: number) => {
    if (p < 20) return 'Initializing Safety Pipeline...';
    if (p < 50) return 'Transcribing Audio & Detecting Language...';
    if (p < 80) return 'Scanning Video Frames for Visual Infractions...';
    if (p < 95) return 'Running Multi-Modal Safety Classification...';
    return 'Generating Final Compliance Report...';
  };

  const [activeTasks, setActiveTasks] = useState(0);

  const handleAnalyze = async (source: { file?: File; url?: string; text?: string }, params: AnalysisParams) => {
    setActiveTasks(prev => prev + 1);
    setIsLoading(true);
    setError(null);
    setProgress(0);
    const fileName = source.file?.name || 'Remote Stream';
    
    // Smart Progress Engine
    const timer = window.setInterval(() => {
      setProgress(prev => {
        if (prev >= 98) return prev;
        const jump = prev < 30 ? 5 : prev < 60 ? 2 : prev < 85 ? 1 : 0.2;
        const next = Math.min(99, prev + Math.random() * jump);
        setStatusMessage(`[${fileName}] ${getStatusFromProgress(next)}`);
        return next;
      });
    }, 1000);

    try {
      const response = await apiService.analyzeVideo(source, params);
      setAllResults(prev => {
        const filtered = prev.filter(r => r.file !== response.file);
        return [response, ...filtered];
      });
      setSelectedId(response.file);
    } catch (err: any) {
      console.error(`Analysis failed for ${fileName}:`, err);
      setError(`Failed to analyze ${fileName}: ${err.message}`);
    } finally {
      window.clearInterval(timer);
      setActiveTasks(prev => {
        const next = prev - 1;
        if (next <= 0) {
          setIsLoading(false);
          setProgress(0);
          setStatusMessage('');
        }
        return next;
      });
    }
  };

  const handleUseMockData = () => {
    const mock = apiService.getMockData();
    setAllResults([mock]);
    setSelectedId(mock.file);
    setError(null);
  };

  const handleClear = () => {
    setAllResults([]);
    setSelectedId(null);
    setError(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg text-brand-text font-sans selection:bg-brand-accent/30">
      <header className="shrink-0 border-b border-brand-border bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent accent-glow">
            <Shield size={22} />
          </div>
          <div>
            <div className="font-black text-xl tracking-tighter flex items-center gap-1 bg-gradient-to-r from-slate-900 to-slate-500 bg-clip-text text-transparent">
              SENTRAQ
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-brand-dim font-bold opacity-70">Unified Multi-Modal Safety Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {allResults.length > 0 && (
            <Button variant="ghost" size="sm" className="gap-2 text-[9px] uppercase tracking-[0.2em] font-black hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all" onClick={handleClear}>
              <Trash2 size={14} /> RESET ALL PIPELINE INPUTS
            </Button>
          )}
          <Button variant="ghost" size="sm" className="gap-2 text-[10px] uppercase tracking-wider font-bold hover:bg-brand-accent/10 text-slate-600" onClick={handleUseMockData}>
            <RefreshCcw size={12} className="text-brand-accent" /> Try Demo Data
          </Button>
        </div>
      </header>

      <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[380px_1fr] bg-slate-50/50">
        <aside className="bg-white/40 backdrop-blur-sm p-4 md:p-6 border-r border-brand-border lg:sticky lg:top-[73px] lg:h-[calc(100vh-73px)] overflow-y-auto custom-scrollbar flex flex-col gap-8">
          <UploadForm onAnalyze={handleAnalyze} isLoading={isLoading} hasResults={allResults.length > 0} />
          
          {allResults.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-brand-border">
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black px-1">Analysis Batch History</h3>
              <div className="space-y-2">
                {allResults.map((res) => (
                  <button
                    key={res.file}
                    onClick={() => setSelectedId(res.file)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 group",
                      selectedId === res.file
                        ? "bg-brand-accent/5 border-brand-accent/30 premium-shadow"
                        : "bg-white/50 border-brand-border hover:bg-white hover:border-slate-300"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      selectedId === res.file ? "bg-brand-accent text-white shadow-lg" : "bg-slate-100 text-slate-400"
                    )}>
                      {res.audio ? <Waves size={16} /> : <Shield size={16} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={cn(
                        "text-[11px] font-bold truncate",
                        selectedId === res.file ? "text-slate-900" : "text-slate-600"
                      )}>
                        {res.file}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded",
                          res.status === 'ok' ? "bg-brand-success/10 text-brand-success" : "bg-brand-warning/10 text-brand-warning"
                        )}>
                          {res.status}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase">{res.source_language}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        <section className="bg-transparent p-4 md:p-10 overflow-y-auto space-y-10">
          {error && (
            <div className="bg-brand-danger/5 border border-brand-danger/10 p-5 rounded-2xl flex items-start gap-4 animate-in fade-in zoom-in duration-300">
              <div className="w-10 h-10 rounded-xl bg-brand-danger/10 flex items-center justify-center text-brand-danger shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-brand-danger text-sm uppercase tracking-widest">Analysis Pipeline Failed</h3>
                <p className="text-slate-600 text-sm mt-1 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {!results && !isLoading && !error && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-8 animate-in fade-in duration-1000">
              <div className="w-24 h-24 bg-white rounded-3xl border border-brand-border flex items-center justify-center text-brand-accent premium-shadow accent-glow relative">
                <div className="absolute inset-0 bg-brand-accent/5 blur-2xl rounded-full" />
                <Waves size={48} className="relative" />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black tracking-tight text-slate-900 uppercase sm:text-5xl">Automated Safety Intelligence</h2>
                <p className="text-slate-600 text-lg font-medium leading-relaxed max-w-lg mx-auto">
                  Deploy our merged multi-modal engine to scan audio transcripts and video frames simultaneously for comprehensive safety compliance.
                </p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="max-w-2xl mx-auto space-y-10 py-12">
              <div className="rounded-3xl border border-brand-border bg-white p-8 premium-shadow space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Processing Engine</h3>
                    <p className="text-[10px] font-bold text-brand-accent uppercase tracking-widest animate-pulse">
                      {statusMessage}
                    </p>
                  </div>
                  <span className="text-xl font-black text-slate-900 tabular-nums">{Math.round(progress)}%</span>
                </div>
                
                <div className="h-4 rounded-full bg-slate-100 overflow-hidden relative border border-slate-200/50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-accent via-blue-500 to-emerald-500 transition-[width] duration-500 ease-out accent-glow"
                    style={{ width: `${Math.max(5, progress)}%` }}
                  />
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full h-full -translate-x-full animate-[shimmer_2s_infinite]" />
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2">
                  {[
                    { label: 'Audio', active: progress > 20 },
                    { label: 'Visual', active: progress > 50 },
                    { label: 'Safety', active: progress > 80 }
                  ].map((step, i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <div className={`h-1 rounded-full transition-colors duration-500 ${step.active ? 'bg-brand-accent' : 'bg-slate-200'}`} />
                      <span className={`text-[9px] font-black uppercase tracking-widest text-center ${step.active ? 'text-slate-900' : 'text-slate-300'}`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-slate-100 border-t-brand-accent rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Shield size={24} className="text-brand-accent animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 uppercase tracking-[0.2em]">Analyzing Batch</h3>
                  <p className="text-slate-500 text-[10px] font-mono font-bold uppercase tracking-widest">Running Sentinel Core Analysis v1.4.2</p>
                </div>
              </div>
            </div>
          )}

          {results && (
            <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              {/* Batch Selector Dropdown */}
              {allResults.length > 1 && (
                <div className="flex flex-col gap-3 p-6 bg-white border border-brand-border rounded-3xl premium-shadow">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black">Active Analysis Stream</h3>
                    <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest bg-brand-accent/5 px-3 py-1 rounded-full border border-brand-accent/10">
                      Batch View: {allResults.indexOf(results) + 1} of {allResults.length}
                    </span>
                  </div>
                  <div className="relative group">
                    <select
                      value={selectedId || ''}
                      onChange={(e) => setSelectedId(e.target.value)}
                      className="w-full h-14 pl-5 pr-12 rounded-2xl border border-brand-border bg-slate-50 text-sm font-bold text-slate-900 appearance-none focus:outline-none focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/5 transition-all cursor-pointer shadow-sm"
                    >
                      {allResults.map((res) => (
                        <option key={res.file} value={res.file}>
                          {res.file} ({res.status.toUpperCase()})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-brand-accent transition-colors">
                      <LayoutGrid size={18} />
                    </div>
                  </div>
                </div>
              )}

              <Summary data={results} />

              <div className="space-y-8">
                {/* Tabs */}
                <div className="flex items-center gap-10 border-b border-brand-border overflow-x-auto no-scrollbar">
                  <button
                    onClick={() => setActiveTab('audio')}
                    className={cn(
                      "pb-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 whitespace-nowrap",
                      activeTab === 'audio' 
                        ? "border-brand-accent text-brand-accent" 
                        : "border-transparent text-slate-400 hover:text-slate-900 hover:border-slate-300"
                    )}
                  >
                    Audio Context
                  </button>
                  <button
                    onClick={() => setActiveTab('video')}
                    className={cn(
                      "pb-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 whitespace-nowrap",
                      activeTab === 'video' 
                        ? "border-brand-accent text-brand-accent" 
                        : "border-transparent text-slate-400 hover:text-slate-900 hover:border-slate-300"
                    )}
                  >
                    Visual Context
                  </button>
                </div>

                {/* Tab Panels */}
                <div className="min-h-0">
                  {activeTab === 'audio' ? (
                    <AudioPanel data={results.audio} />
                  ) : (
                    <VideoPanel data={results.video} />
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="h-10 shrink-0 bg-white border-t border-brand-border px-6 flex items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-success shadow-[0_0_8px_rgba(5,150,105,0.3)]" />
            <span className="text-slate-600">System Secure</span>
          </div>
          <div className="hidden sm:block text-slate-500">
            Cluster: GPU-NODE-01
          </div>
        </div>
        <div className="ml-auto flex items-center gap-6 text-slate-500">
          <span className="hidden md:inline">Latency: Optimized</span>
          <span>Sentinel v1.4.2</span>
        </div>
      </footer>
    </div>
  );
}

