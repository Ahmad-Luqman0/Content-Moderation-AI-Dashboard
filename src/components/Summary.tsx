import React from 'react';
import { CheckCircle2, AlertCircle, ShieldAlert, Mic, Video, FileVideo2, Languages } from 'lucide-react';
import { Card } from './ui/Base';
import { AnalysisResponse } from '../types';

export const Summary = ({ data }: { data: AnalysisResponse }) => {
  const overallStatus = data.status || 'partial';
  const sourceLanguage = data.source_language || 'auto';
  const audioStatus = data.audio?.status || 'error';
  const videoStatus = data.video?.status || 'error';
  const hasAudioViolation = data.summary.audio_flagged_count > 0;
  const hasVideoViolation = data.summary.video_flagged_segments > 0;

  const getStatusIcon = () => {
    switch (overallStatus) {
      case 'ok': return <CheckCircle2 className="text-brand-success" size={24} />;
      case 'partial': return <AlertCircle className="text-brand-warning" size={24} />;
      case 'error': return <ShieldAlert className="text-brand-danger" size={24} />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      <div className="p-6 rounded-3xl bg-white border border-brand-border premium-shadow flex flex-col justify-between">
        <h3 className="font-black text-slate-400 uppercase tracking-[0.2em] text-[9px] mb-4">Audio Infractions</h3>
        <div className="flex items-center justify-between">
          <div className="text-4xl font-black text-slate-900 tabular-nums tracking-tighter">
            {data.summary.audio_flagged_count}
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${data.summary.audio_flagged_count > 0 ? 'bg-brand-danger/10 text-brand-danger' : 'bg-brand-success/10 text-brand-success'}`}>
            <Mic size={24} />
          </div>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white border border-brand-border premium-shadow flex flex-col justify-between">
        <h3 className="font-black text-slate-400 uppercase tracking-[0.2em] text-[9px] mb-4">Visual Flags</h3>
        <div className="flex items-center justify-between">
          <div className="text-4xl font-black text-slate-900 tabular-nums tracking-tighter">
            {data.summary.video_flagged_segments}
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${data.summary.video_flagged_segments > 0 ? 'bg-brand-warning/10 text-brand-warning' : 'bg-brand-success/10 text-brand-success'}`}>
            <Video size={24} />
          </div>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white border border-brand-border premium-shadow flex flex-col justify-between">
        <h3 className="font-black text-slate-400 uppercase tracking-[0.2em] text-[9px] mb-4">Media Source</h3>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 text-brand-accent flex items-center justify-center">
            <FileVideo2 size={24} />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-slate-800 truncate uppercase tracking-tighter">{data.file}</div>
            <div className="flex items-center gap-2 mt-1">
              <Languages size={12} className="text-brand-accent" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{sourceLanguage === 'auto' ? 'AUTO-DETECTION' : sourceLanguage.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="md:col-span-3 p-1 bg-slate-100 rounded-2xl overflow-hidden border border-brand-border">
        <div className="px-6 py-3 flex items-center justify-between bg-white/60 rounded-xl">
          <div className="flex items-center gap-8">
            <div className="flex flex-col gap-0.5">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Audio Engine</span>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${audioStatus === 'ok' && !hasAudioViolation ? 'text-brand-success' : 'text-brand-danger'}`}>
                {audioStatus === 'ok' ? (hasAudioViolation ? 'FLAGGED' : 'OK') : 'ERROR'}
              </span>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Visual Engine</span>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${videoStatus === 'ok' && !hasVideoViolation ? 'text-brand-success' : 'text-brand-danger'}`}>
                {videoStatus === 'ok' ? (hasVideoViolation ? 'FLAGGED' : 'OK') : 'ERROR'}
              </span>
            </div>
          </div>
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Multi-Modal Analysis Complete
          </div>
        </div>
      </div>
    </div>
  );
};

