import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { exec } from 'child_process';
import fs from 'fs';
import os from 'os';

const youtubeProxyPlugin = () => ({
  name: 'youtube-proxy',
  configureServer(server: any) {
    server.middlewares.use('/local-api/download', (req: any, res: any) => {
      const urlStr = req.url || '';
      const queryMatch = urlStr.match(/\?url=(.*)/);
      if (!queryMatch) {
        res.statusCode = 400;
        res.end('Missing url parameter');
        return;
      }
      
      const videoUrl = decodeURIComponent(queryMatch[1]);
      console.log(`[Local Proxy] Downloading YouTube video: ${videoUrl}`);
      
      const tempfile = path.join(os.tmpdir(), `yt-dlp-${Date.now()}.mp4`);
      
      // Use yt-dlp to download the video locally on the residential IP
      const cmd = `yt-dlp -f "best[ext=mp4]/best" --output "${tempfile}" "${videoUrl}"`;
      
      exec(cmd, (error: any, stdout: any, stderr: any) => {
        if (error) {
          console.error(`[Local Proxy] yt-dlp error: ${stderr}`);
          res.statusCode = 500;
          res.end('yt-dlp failed: ' + stderr);
          return;
        }
        
        try {
          const stat = fs.statSync(tempfile);
          res.writeHead(200, {
            'Content-Type': 'video/mp4',
            'Content-Length': stat.size,
            'Content-Disposition': 'attachment; filename="video.mp4"'
          });
          
          const readStream = fs.createReadStream(tempfile);
          readStream.pipe(res);
          
          readStream.on('end', () => {
            try { fs.unlinkSync(tempfile); } catch (e) {}
          });
          
          res.on('close', () => {
            try { if (fs.existsSync(tempfile)) fs.unlinkSync(tempfile); } catch (e) {}
          });
        } catch (e: any) {
          res.statusCode = 500;
          res.end('Failed to serve downloaded video: ' + e.message);
        }
      });
    });
  }
});

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), youtubeProxyPlugin()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://72.60.108.60:7790',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
