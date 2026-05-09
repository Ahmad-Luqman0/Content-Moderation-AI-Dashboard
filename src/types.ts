export interface AnalysisParams {
  source_language?: 'auto' | 'en' | 'pt';
  mode?: 'sensitive' | 'strict';
  threshold?: number;
  sample_fps?: number;
  min_segment_sec?: number;
  min_positive_frames?: number;
  min_average_score?: number;
  max_gap_frames?: number;
  smoothing_window?: number;
  display_frames_per_segment?: number;
}

export interface FlaggedSentence {
  sentence_no?: number;
  sentence: string;
  label?: string;
  reason?: string | null;
  timestamp_start_ms?: number | null;
  timestamp_end_ms?: number | null;
}

export interface SentenceResult {
  sentence_no?: number;
  sentence: string;
  raw_label?: string;
  final_label?: string;
  override_reason?: string | null;
  timestamp_start_ms?: number | null;
  timestamp_end_ms?: number | null;
  entities?: Array<{
    text?: string;
    type?: string;
    start?: number;
    end?: number;
    flag_reason?: string;
  }>;
}

export interface TranscriptChunk {
  start_ms: number;
  end_ms: number;
  text: string;
}

export interface AudioResult {
  status: 'ok' | 'error';
  result?: {
    input_text: string;
    total_sentences?: number;
    flagged_count: number;
    overall?: 'Normal' | 'Flagged';
    used_ner_model?: boolean;
    no_audio?: boolean;
    message?: string;
    flagged_sentences: FlaggedSentence[];
    sentence_results: SentenceResult[];
    transcript_chunks: TranscriptChunk[];
  };
  detail?: string;
}

export interface VideoFrameItem {
  frame_index: number;
  time: number;
  image_base64: string;
}

export interface VideoSegmentFrameGroup {
  segment: {
    start: number;
    end: number;
    avg_score: number;
    positive_frames: number;
  };
  frames: VideoFrameItem[];
}

export interface VideoResult {
  status: 'ok' | 'error';
  result?: {
    video: string;
    classes?: string[];
    mode?: string;
    threshold?: number;
    recommended_threshold?: number;
    min_average_score?: number;
    min_positive_frames?: number;
    sample_fps?: number;
    duration_sec?: number;
    fallback_used?: boolean;
    segments: Array<{
      start: number;
      end: number;
      avg_score: number;
      positive_frames: number;
    }>;
    segment_frames: VideoSegmentFrameGroup[];
  };
  detail?: string;
}

export interface AnalysisResponse {
  file: string;
  status: 'ok' | 'partial' | 'error';
  source_language: string;
  audio: AudioResult;
  video: VideoResult;
  summary: {
    audio_flagged_count: number;
    video_flagged_segments: number;
  };
}
