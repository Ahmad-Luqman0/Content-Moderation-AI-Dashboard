import axios from 'axios';
import { AnalysisParams, AnalysisResponse } from '../types';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8000';

const mockResponse: AnalysisResponse = {
  file: 'sample_video.mp4',
  status: 'partial',
  source_language: 'en',
  audio: {
    status: 'ok',
    result: {
      input_text: 'This is a sample transcript showing some flagged and non-flagged content for demonstration.',
      total_sentences: 4,
      flagged_count: 2,
      overall: 'Flagged',
      used_ner_model: true,
      flagged_sentences: [
        {
          sentence_no: 2,
          sentence: 'This is a bad sentence.',
          label: 'Flagged',
          reason: 'model prediction above threshold',
          timestamp_start_ms: 2500,
          timestamp_end_ms: 5000,
        },
        {
          sentence_no: 4,
          sentence: 'Another problematic statement.',
          label: 'Flagged',
          reason: 'model prediction above threshold',
          timestamp_start_ms: 8500,
          timestamp_end_ms: 12000,
        },
      ],
      sentence_results: [
        { sentence_no: 1, sentence: 'Hello and welcome.', raw_label: 'Normal', final_label: 'Normal', confidence_percent: 98.5, timestamp_start_ms: 0, timestamp_end_ms: 2500 },
        { sentence_no: 2, sentence: 'This is a bad sentence.', raw_label: 'Hate', final_label: 'Flagged', confidence_percent: 95, override_reason: 'model prediction above threshold', timestamp_start_ms: 2500, timestamp_end_ms: 5000 },
        { sentence_no: 3, sentence: 'Normal conversation continues here.', raw_label: 'Normal', final_label: 'Normal', confidence_percent: 99.2, timestamp_start_ms: 5000, timestamp_end_ms: 8500 },
        { sentence_no: 4, sentence: 'Another problematic statement.', raw_label: 'Hate', final_label: 'Flagged', confidence_percent: 88, override_reason: 'model prediction above threshold', timestamp_start_ms: 8500, timestamp_end_ms: 12000 },
      ],
      transcript_chunks: [
        { start_ms: 0, end_ms: 2500, text: 'Hello and welcome.' },
        { start_ms: 2500, end_ms: 5000, text: 'This is a bad sentence.' },
        { start_ms: 5000, end_ms: 8500, text: 'Normal conversation continues here.' },
        { start_ms: 8500, end_ms: 12000, text: 'Another problematic statement.' },
      ],
    },
  },
  video: {
    status: 'ok',
    result: {
      video: 'sample_video.mp4',
      classes: ['clothed', 'nude'],
      mode: 'sensitive',
      threshold: 0.9,
      recommended_threshold: 0.97,
      min_average_score: 0.9,
      min_positive_frames: 2,
      sample_fps: 2,
      duration_sec: 12.5,
      fallback_used: false,
      segments: [{ start: 1, end: 2.5, avg_score: 0.93, positive_frames: 3 }],
      segment_frames: [
        {
          segment: { start: 1, end: 2.5, avg_score: 0.93, positive_frames: 3 },
          frames: [
            { frame_index: 12, time: 1.2, image_base64: 'ZmFrZV9pbWFnZQ==' },
            { frame_index: 18, time: 1.8, image_base64: 'ZmFrZV9pbWFnZQ==' },
          ],
        },
      ],
    },
  },
  summary: {
    audio_flagged_count: 2,
    video_flagged_segments: 1,
  },
};

function normalizeAnalysisResponse(raw: any): AnalysisResponse {
  const audioStatus = raw?.audio?.status === 'error' ? 'error' : 'ok';
  const videoStatus = raw?.video?.status === 'error' ? 'error' : 'ok';
  const status = raw?.status === 'ok' || raw?.status === 'partial' || raw?.status === 'error' ? raw.status : 'partial';

  const audioResult = raw?.audio?.result || {};
  const videoResult = raw?.video?.result || {};

  return {
    file: String(raw?.file || 'remote_video'),
    status,
    source_language: String(raw?.source_language || 'auto'),
    audio: {
      status: audioStatus,
      detail: raw?.audio?.detail,
      result: audioStatus === 'ok'
        ? {
            input_text: String(audioResult.input_text || ''),
            total_sentences: Number(audioResult.total_sentences || 0),
            flagged_count: Number(audioResult.flagged_count || 0),
            overall: audioResult.overall === 'Flagged' ? 'Flagged' : 'Normal',
            used_ner_model: Boolean(audioResult.used_ner_model),
            no_audio: Boolean(audioResult.no_audio),
            message: audioResult.message,
            flagged_sentences: Array.isArray(audioResult.flagged_sentences) ? audioResult.flagged_sentences : [],
            sentence_results: Array.isArray(audioResult.sentence_results) ? audioResult.sentence_results : [],
            transcript_chunks: Array.isArray(audioResult.transcript_chunks) ? audioResult.transcript_chunks : [],
          }
        : undefined,
    },
    video: {
      status: videoStatus,
      detail: raw?.video?.detail,
      result: videoStatus === 'ok'
        ? {
            video: String(videoResult.video || raw?.file || 'remote_video'),
            classes: Array.isArray(videoResult.classes) ? videoResult.classes : [],
            mode: videoResult.mode,
            threshold: videoResult.threshold,
            recommended_threshold: videoResult.recommended_threshold,
            min_average_score: videoResult.min_average_score,
            min_positive_frames: videoResult.min_positive_frames,
            sample_fps: videoResult.sample_fps,
            duration_sec: videoResult.duration_sec,
            fallback_used: Boolean(videoResult.fallback_used),
            segments: Array.isArray(videoResult.segments) ? videoResult.segments : [],
            segment_frames: Array.isArray(videoResult.segment_frames) ? videoResult.segment_frames : [],
          }
        : undefined,
    },
    summary: {
      audio_flagged_count: Number(raw?.summary?.audio_flagged_count || 0),
      video_flagged_segments: Number(raw?.summary?.video_flagged_segments || 0),
    },
  };
}

export const apiService = {
  async analyzeVideo(input: { file?: File; url?: string; text?: string }, params: AnalysisParams): Promise<AnalysisResponse> {
    if (!input.file && !input.url && !input.text) {
      throw new Error('Please provide either a video file, video URL, or text content.');
    }

    if (input.text) return this.analyzeText(input.text);

    const formData = new FormData();
    if (input.url) {
      try {
        // Download the video temporarily via the frontend Vercel Serverless Function
        // This downloads the video on Vercel's end (or locally via Vite) and sends it to your Hostinger backend
        const proxyUrl = `/api/ytdl?url=${encodeURIComponent(input.url)}`;
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Failed to fetch video via local proxy: ${response.statusText} - ${errText}`);
        }
        
        const blob = await response.blob();
        
        // Try to extract a filename from the URL, fallback to default
        let filename = 'downloaded_video.mp4';
        try {
          const pathname = new URL(input.url).pathname;
          const extractedName = pathname.substring(pathname.lastIndexOf('/') + 1);
          if (extractedName && extractedName.includes('.')) {
            filename = extractedName;
          }
        } catch (e) {
          // Ignore URL parsing errors
        }
        
        const file = new File([blob], filename, { type: blob.type || 'video/mp4' });
        formData.append('file', file);
      } catch (error: any) {
        throw new Error('Failed to temporarily download video URL in the web app: ' + error.message);
      }
    } else if (input.file) {
      formData.append('file', input.file);
    }
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, String(value));
    });

    try {
      const response = await axios.post(`${API_BASE_URL}/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = response.data;
      if (!data || typeof data !== 'object') throw new Error('Unexpected API response format');
      return normalizeAnalysisResponse(data);
    } catch (error: any) {
      console.error('API Error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Analysis failed');
    }
  },

  async analyzeText(text: string): Promise<AnalysisResponse> {
    if (!text.trim()) {
      throw new Error('Please provide text content to analyze.');
    }

    const formData = new FormData();
    formData.append('text', text);

    try {
      const response = await axios.post(`${API_BASE_URL}/analyze/text`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data as any;
      if (!data || typeof data !== 'object') {
        throw new Error(data?.detail || 'Unexpected API response format from /analyze/text');
      }

      // Build response for text-only analysis
      return {
        file: 'text_input',
        status: 'ok',
        source_language: 'en',
        audio: {
          status: 'ok',
          result: data,
        },
        video: {
          status: 'ok',
          result: {
            video: 'N/A',
            classes: [],
            mode: 'N/A',
            segments: [],
            segment_frames: [],
          },
        },
        summary: {
          audio_flagged_count: data?.flagged_count || 0,
          video_flagged_segments: 0,
        },
      };
    } catch (error) {
      console.error('Text Analysis API Error:', error);
      throw error;
    }
  },

  // Mock data for development/preview
  getMockData(): AnalysisResponse {
    return mockResponse;
  }
};
