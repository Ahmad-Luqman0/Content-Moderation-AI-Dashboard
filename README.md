# Video & Audio Safety Analyzer Frontend

A modern, professional web dashboard for analyzing video and audio safety results from a FastAPI backend.

## Features

- **Multi-Pipeline Support**: Integrates results from both audio (transcription/safety) and video (nudity/segment detection) pipelines.
- **Advanced Controls**: Full configuration for pipeline parameters like threshold, sample FPS, smoothing windows, and min/max frames.
- **Visual Analytics**: Interactive timeline for transcripts and a frame-by-frame gallery for detected video segments.
- **Real-time Status**: Handles partial pipeline success/failure gracefully with clear visual indicators.
- **Mock Data Mode**: Built-in demonstration mode to preview UI layouts without an active backend.

## Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- A running FastAPI backend (configured to accept `POST /analyze`)

### 2. Configuration
Create or edit your `.env` file in the root directory:
```env
VITE_API_URL=http://your-fastapi-backend-url:8000
```

### 3. Installation
```bash
npm install
```

### 4. Running Development Server
```bash
npm run dev
```

### 5. Backend API Expected Shape
The frontend expects a multipart FORM upload to `POST /analyze` returning:
```json
{
  "file": "name.mp4",
  "status": "ok",
  "audio": { "status": "ok", "result": { ... } },
  "video": { "status": "ok", "result": { ... } },
  "summary": { "audio_flagged_count": 0, "video_flagged_segments": 0 }
}
```

## Built With
- **React 19** & **Vite**
- **Tailwind CSS** (for styling)
- **Motion** (for animations)
- **Lucide React** (icons)
- **Axios** (API communication)
