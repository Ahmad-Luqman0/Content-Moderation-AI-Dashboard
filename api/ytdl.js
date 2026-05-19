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
    
    // Injecting YouTube cookies to bypass Vercel datacenter block
    const YOUTUBE_COOKIES = "PREF=f4=4000000&f6=40000000&tz=Asia.Karachi&f5=30000&f7=100;HSID=AgyyQ3BqSMYCAWqqh;SSID=A5RNt7WxxO82pNmjM;APISID=JYmvsO6mYkvV4BJl/Aux9siC_ArNEeDbmX;SAPISID=azjmWXN4dyoZI9t7/A_c1HJfZHUqpnCKPe;__Secure-1PAPISID=azjmWXN4dyoZI9t7/A_c1HJfZHUqpnCKPe;__Secure-3PAPISID=azjmWXN4dyoZI9t7/A_c1HJfZHUqpnCKPe;SID=g.a000-Agj6cRR8lJdid7uobs2ikLye_y4CYozfFdnh5Wp5djBYGeue1GmVtoLmfg358FzilWaYgACgYKATMSARQSFQHGX2MiTVky8A-XdyJF5PEHg5GX5hoVAUF8yKqX-7nyUhUm1rSJobGsgKxG0076;__Secure-1PSID=g.a000-Agj6cRR8lJdid7uobs2ikLye_y4CYozfFdnh5Wp5djBYGeuydX4_5sbN3e3HMwo6hMlsgACgYKAToSARQSFQHGX2MiPohkXtaDiwnVePNPEpiIkRoVAUF8yKoe3FQZNgXJYXTi3iPWXDW10076;__Secure-3PSID=g.a000-Agj6cRR8lJdid7uobs2ikLye_y4CYozfFdnh5Wp5djBYGeu2QZ_QDg4oFWZfjwR5IycDAACgYKAagSARQSFQHGX2Mi7vbQUaGQY3QulWogOs4BXBoVAUF8yKpEjFOq2WxqJJnu8Ie8umLU0076;LOGIN_INFO=AFmmF2swRgIhAPsCsQYNLEoAx4IeMWWsoEH_A6tpmxra1YWUS5K6QAliAiEAwbwrMgvfS_dXB6kCvJnKwQijNCuZl_ywXtHd_r40_hA:QUQ3MjNmd0FqSXlIUHJmcm1SV0twV3p2WUlHSEMzdnFfUjd5alRjcjc3TWREZEJlaFRhVkwzZ1NsbzhJYzRvb3VXTXIyMTkxYzBpNFdsTmZ2ZVlOc3o4UnlIeUlySkcxcF9hTlI4dUFmWmJRNnpVcDJEYTR6eW5LbkMxdXdkRmR6Z3JpUlB5WTZLcS1SZU5DZ1JSdERrVFRsclR6dURxdDNB;__Secure-1PSIDTS=sidts-CjUBhkeRdzsK92oYLD06HTrGiN0apFFSu0D7Y9rjgzK4EQZKyY0-lnuFMgHXk3Q1oePRDSjX_BAA;__Secure-3PSIDTS=sidts-CjUBhkeRdzsK92oYLD06HTrGiN0apFFSu0D7Y9rjgzK4EQZKyY0-lnuFMgHXk3Q1oePRDSjX_BAA;SIDCC=AKEyXzUiFs8HTs3ioSoH0LEqrosAMhl9x4JyKePsJyJlED_eaFqgAk9MCJHcX-IQ37t4RMnI;__Secure-1PSIDCC=AKEyXzU2VWo7Me5KVgDC4FdmuiyyMX2uUavFvFqEjzPgD2BrodVLXzmBne9C7EOYV8MwwMy_;__Secure-3PSIDCC=AKEyXzVERX9wlH26Mt_zrSnJXCbN0wVdWk-wsfspJOOp7J2a5Plogq1p_FRWFatszg2KZ4OJWw";
    const ytdlOptions = {
      requestOptions: {
        headers: {
          cookie: YOUTUBE_COOKIES
        }
      }
    };
    
    // Fetch video info with cookies
    const info = await ytdl.getInfo(url, ytdlOptions);
    
    // Select the best mp4 format
    const format = ytdl.chooseFormat(info.formats, { quality: 'highest', filter: 'audioandvideo' });
    
    if (!format) {
      return res.status(404).json({ error: 'No suitable video format found' });
    }

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
    
    // Stream the video directly to the response with cookies
    ytdl(url, { format, ...ytdlOptions }).pipe(res);

  } catch (error) {
    console.error('[Vercel API] Error downloading video:', error);
    res.status(500).json({ error: 'Failed to download video: ' + error.message });
  }
}
