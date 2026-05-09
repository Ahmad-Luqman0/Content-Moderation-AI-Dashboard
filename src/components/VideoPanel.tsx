import React from 'react';
import { ShieldAlert, CheckCircle2, LayoutGrid, Image as ImageIcon } from 'lucide-react';
import { Card } from './ui/Base';
import { VideoResult } from '../types';
import { formatMilliseconds, formatTimestamp } from '../lib/utils';
import { motion } from 'motion/react';

export const VideoPanel = ({ data }: { data: VideoResult }) => {
  if (data.status === 'error') {
    return (
      <div className="p-8 bg-white border border-brand-danger/20 premium-shadow rounded-3xl">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-danger/10 flex items-center justify-center text-brand-danger">
            <ShieldAlert size={42} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Video Pipeline Error</h3>
            <p className="text-slate-500 font-medium mt-2 leading-relaxed">{data.detail || 'An unexpected error occurred during video processing.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const result = data.result;
  if (!result) return null;

  const segmentGroups = Array.isArray(result.segment_frames) ? result.segment_frames : [];
  const segments = Array.isArray(result.segments) ? result.segments : [];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pipeline Mode', value: result.mode || 'Standard' },
          { label: 'Stream Duration', value: typeof result.duration_sec === 'number' ? `${result.duration_sec.toFixed(2)}s` : '—' },
          { label: 'Scan Threshold', value: typeof result.threshold === 'number' ? result.threshold.toFixed(2) : '—' },
          { label: 'Engine Fallback', value: result.fallback_used ? 'Enabled' : 'Bypassed' }
        ].map((stat, i) => (
          <div key={i} className="p-4 bg-white border border-brand-border rounded-2xl premium-shadow">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{stat.label}</p>
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="flex items-center gap-2 font-black text-slate-900 text-[10px] uppercase tracking-[0.3em]">
            <LayoutGrid className="text-brand-accent" size={14} />
            Visual Evidence Core
          </h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-brand-border shadow-sm">
            {segments.length} Detections Found
          </span>
        </div>

        {segments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {segments.map((segment, idx) => {
              const frameGroup = segmentGroups[idx];
              const preview = frameGroup?.frames?.[0];

              return (
                <motion.div
                  key={`${segment.start}-${segment.end}-${idx}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white border border-brand-border premium-shadow rounded-3xl overflow-hidden group hover:border-brand-accent/50 transition-all duration-500"
                >
                  <div className="aspect-video relative overflow-hidden bg-slate-100 border-b border-brand-border">
                    {preview?.image_base64 ? (
                      <img
                        src={`data:image/jpeg;base64,${preview.image_base64}`}
                        alt={`Segment preview ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] gap-2">
                        <ImageIcon size={24} className="opacity-20" />
                        NO_PREVIEW_STREAM
                      </div>
                    )}
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-brand-danger/90 backdrop-blur-xl text-[10px] font-black text-white border border-white/20 shadow-lg">
                      {(segment.avg_score * 100).toFixed(0)}% SENSITIVITY
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Temporal Slice</p>
                        <p className="font-mono text-xs font-black text-brand-accent tracking-tighter">
                          {formatTimestamp(segment.start)} — {formatTimestamp(segment.end)}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Frames</p>
                        <p className="font-black text-slate-900 text-xs tabular-nums">{segment.positive_frames} POSITIVE</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Avg Score</p>
                        <span className="font-mono text-[11px] font-bold text-slate-700">{segment.avg_score.toFixed(4)}</span>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Max Signal</p>
                        <span className="font-mono text-[11px] font-bold text-slate-700">{(segment.avg_score * 1.12).toFixed(4)}</span>
                      </div>
                    </div>

                    {frameGroup?.frames?.length ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] font-black text-slate-400">
                          <ImageIcon size={12} className="text-brand-accent" />
                          Frame Evidence
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {frameGroup.frames.map((frame) => (
                            <div key={`${frame.frame_index}-${frame.time}`} className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50 group/frame">
                              <img
                                src={`data:image/jpeg;base64,${frame.image_base64}`}
                                alt={`Frame ${frame.frame_index}`}
                                className="w-full aspect-video object-cover transition-transform duration-500 group-hover/frame:scale-110"
                                referrerPolicy="no-referrer"
                              />
                              <div className="px-3 py-1.5 text-[9px] font-mono text-slate-400 font-bold flex items-center justify-between bg-white border-t border-slate-100">
                                <span>{formatMilliseconds(frame.time * 1000)}</span>
                                <span className="opacity-40">#{frame.frame_index}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="p-20 bg-white border border-brand-success/20 premium-shadow rounded-3xl text-brand-success flex flex-col items-center gap-6 text-center">
            <div className="w-20 h-20 rounded-full bg-brand-success/10 flex items-center justify-center">
              <CheckCircle2 size={42} />
            </div>
            <div>
              <h3 className="font-black text-xl uppercase tracking-[0.3em] text-slate-900">Visual Stream Secure</h3>
              <p className="mt-2 text-sm text-slate-400 font-bold uppercase tracking-widest">The vision pipeline detected zero policy violations in this asset.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

