const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const OAuth2 = google.auth.OAuth2;

const client_id = process.env.YOUTUBE_CLIENT_ID;
const client_secret = process.env.YOUTUBE_CLIENT_SECRET;
const refresh_token = process.env.YOUTUBE_REFRESH_TOKEN;

const baseTitle = process.env.VIDEO_TITLE;
const description = process.env.VIDEO_DESCRIPTION;
const privacyStatus = process.env.VIDEO_VISIBILITY;

const videoPath = process.env.VIDEO_FILE_PATH;

if (!videoPath || !fs.existsSync(videoPath)) {
  console.error(`[ERR] Video file not found at: ${videoPath}`);
  process.exit(1);
}

const oauth2Client = new OAuth2(
  client_id,
  client_secret,
  'https://developers.google.com/oauthplayground'
);
oauth2Client.setCredentials({ refresh_token });

const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

async function uploadVideo() {
  console.log(`[R] File: ${path.basename(videoPath)}`);
  console.log(`[U] Starting upload: "${baseTitle}" (${privacyStatus})`);

  const res = await youtube.videos.insert({
    part: 'snippet,status',
    requestBody: {
      snippet: { title: baseTitle, description },
      status: { privacyStatus },
    },
    media: { body: fs.createReadStream(videoPath) },
  });

  const videoId = res.data.id;
  const url = `https://youtu.be/${videoId}`;

  console.log(`[Y] Success! ID: ${videoId}`);
  console.log(`[Y] URL: ${url}`);

  fs.writeFileSync('result.txt', url);

  fs.unlinkSync(videoPath);
  console.log('[DEL] Local file removed.');
}

uploadVideo().catch(err => {
  console.error('[ERR] Upload failed:', err);
  process.exit(1);
});
