import ytdl from '@distube/ytdl-core';

export default async function handler(req, res) {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    // Check if valid YouTube URL
    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    console.log(`[Vercel API] Fetching video: ${url}`);
    
    // Fetch video info
    const info = await ytdl.getInfo(url);
    
    // Select the best mp4 format
    const format = ytdl.chooseFormat(info.formats, { quality: 'highest', filter: 'audioandvideo' });
    
    if (!format) {
      return res.status(404).json({ error: 'No suitable video format found' });
    }

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
    
    // Stream the video directly to the response
    ytdl(url, { format }).pipe(res);

  } catch (error) {
    console.error('[Vercel API] Error downloading video:', error);
    res.status(500).json({ error: 'Failed to download video: ' + error.message });
  }
}
