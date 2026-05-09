import React from 'react';
import { ShieldAlert, CheckCircle2, Timer, Table2, MicOff } from 'lucide-react';
import { Card } from './ui/Base';
import { AudioResult, FlaggedSentence, SentenceResult } from '../types';
import { formatMilliseconds } from '../lib/utils';

function sentenceLabel(item: SentenceResult) {
  return item.final_label || item.raw_label || 'Unknown';
}

export const AudioPanel = ({ data }: { data: AudioResult }) => {
  if (data.status === 'error') {
    return (
      <div className="p-8 bg-white border border-brand-danger/20 premium-shadow rounded-3xl">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-danger/10 flex items-center justify-center text-brand-danger">
            <ShieldAlert size={42} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Audio Pipeline Error</h3>
            <p className="text-slate-500 font-medium mt-2 leading-relaxed">{data.detail || 'An unexpected error occurred during audio processing.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const result = data.result;
  if (!result) return null;

  const flaggedSentences = result.flagged_sentences ?? [];
  const sentenceResults = result.sentence_results ?? [];
  const transcriptChunks = result.transcript_chunks ?? [];

  if (result.no_audio) {
    return (
      <div className="p-8 bg-white border border-brand-warning/20 premium-shadow rounded-3xl">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-warning/10 flex items-center justify-center text-brand-warning">
            <MicOff size={42} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">No Audio Detected</h3>
            <p className="text-slate-500 font-medium mt-2 leading-relaxed">{result.message || 'This video appears to have no spoken audio track.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <div className="flex flex-col bg-white border border-brand-border premium-shadow rounded-3xl overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-brand-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              <ShieldAlert className="text-brand-danger" size={14} />
              Critical Infractions
            </div>
            <span className="text-[10px] font-black text-brand-danger uppercase tracking-widest bg-brand-danger/10 px-2 py-0.5 rounded-full">{result.flagged_count} flagged</span>
          </div>
          <div className="max-h-[560px] overflow-auto divide-y divide-slate-100 px-6 custom-scrollbar">
            {flaggedSentences.length > 0 ? (
              flaggedSentences.map((item: FlaggedSentence, index: number) => (
                <div key={`${item.sentence_no ?? index}-${index}`} className="py-6 space-y-3 group transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <p className="text-sm font-bold text-slate-800 leading-relaxed">{item.sentence}</p>
                      <div className="flex flex-wrap items-center gap-3">
                        {(item.timestamp_start_ms != null || item.timestamp_end_ms != null) && (
                          <div className="flex items-center gap-1.5 text-[10px] text-brand-accent font-black bg-brand-accent/10 px-2 py-1 rounded-md border border-brand-accent/20">
                            <Timer size={12} />
                            {formatMilliseconds(item.timestamp_start_ms ?? 0)} — {formatMilliseconds(item.timestamp_end_ms ?? 0)}
                          </div>
                        )}
                        <div className="flex gap-2">
                          {item.label && <span className="px-2 py-1 rounded-md bg-brand-danger/10 text-brand-danger text-[9px] font-black uppercase tracking-widest border border-brand-danger/20">{item.label}</span>}
                          {item.reason && <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest border border-slate-200">{item.reason}</span>}
                        </div>
                      </div>
                    </div>
                    {typeof item.sentence_no === 'number' && <span className="text-[10px] font-mono text-slate-300 font-bold">SEG_{item.sentence_no}</span>}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-brand-success text-sm font-black uppercase tracking-[0.2em] opacity-60">
                Integrity Verified — No Flags
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col bg-white border border-brand-border premium-shadow rounded-3xl overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-brand-border flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
            <Table2 className="text-brand-accent" size={14} />
            Data Classification Stream
          </div>
          <div className="max-h-[560px] overflow-auto custom-scrollbar">
            <table className="min-w-full text-left text-[11px]">
              <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-md border-b border-brand-border text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  <th className="px-6 py-4">SEQ</th>
                  <th className="px-6 py-4">DESCRIPTOR</th>
                  <th className="px-6 py-4 text-right">TAG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sentenceResults.map((item, index) => (
                  <tr key={`${item.sentence_no ?? index}-${index}`} className="align-top hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-5 text-[10px] font-mono text-slate-400 font-bold">{item.sentence_no ?? index + 1}</td>
                    <td className="px-6 py-5 text-slate-800">
                      <p className="line-clamp-3 leading-relaxed font-medium">{item.sentence}</p>
                      {(item.timestamp_start_ms != null || item.timestamp_end_ms != null) && (
                        <p className="mt-2 text-[10px] font-mono text-brand-accent font-bold">
                          {formatMilliseconds(item.timestamp_start_ms ?? 0)} — {formatMilliseconds(item.timestamp_end_ms ?? 0)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${sentenceLabel(item) === 'Normal' ? 'bg-brand-success/10 text-brand-success border-brand-success/20' : 'bg-brand-warning/10 text-brand-warning border-brand-warning/20'}`}>
                        <div className={`w-1 h-1 rounded-full ${sentenceLabel(item) === 'Normal' ? 'bg-brand-success' : 'bg-brand-warning'}`} />
                        {sentenceLabel(item)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <div className="flex flex-col bg-white border border-brand-border premium-shadow rounded-3xl overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-brand-border flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
            <Timer className="text-brand-accent" size={14} />
            Temporal Transcript Core
          </div>
          <div className="max-h-[480px] overflow-auto divide-y divide-slate-50 px-6 custom-scrollbar">
            {transcriptChunks.length > 0 ? (
              transcriptChunks.map((chunk, index) => (
                <div key={`${chunk.start_ms}-${index}`} className="py-6 grid grid-cols-[130px_1fr] gap-6 hover:bg-slate-50 px-2 -mx-2 transition-colors rounded-xl border border-transparent hover:border-slate-100">
                  <div className="font-mono text-[11px] text-brand-accent font-black tracking-tighter">
                    [{formatMilliseconds(chunk.start_ms)} → {formatMilliseconds(chunk.end_ms)}]
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed font-medium">{chunk.text}</p>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-300 text-xs font-black uppercase tracking-widest">
                TRANSCRIPT_STREAM_EMPTY
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

