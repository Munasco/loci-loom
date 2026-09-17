import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { join, normalize } from 'node:path';
import { chromium } from 'playwright-core';

const videoPath = normalize(join(process.cwd(), '..', '..', 'submission', 'loci-loom-demo.mp4'));
const size = statSync(videoPath).size;

const server = createServer((request, response) => {
  const range = request.headers.range;
  response.setHeader('Accept-Ranges', 'bytes');
  response.setHeader('Content-Type', 'video/mp4');

  if (!range) {
    response.writeHead(200, { 'Content-Length': size });
    createReadStream(videoPath).pipe(response);
    return;
  }

  const [startText, endText] = range.replace('bytes=', '').split('-');
  const start = Number(startText);
  const end = endText ? Number(endText) : size - 1;
  response.writeHead(206, {
    'Content-Length': end - start + 1,
    'Content-Range': `bytes ${start}-${end}/${size}`,
  });
  createReadStream(videoPath, { start, end }).pipe(response);
});

await new Promise((resolve) => server.listen(4175, '127.0.0.1', resolve));
const executablePath = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await chromium.launch({ headless: true, executablePath });

try {
  const page = await browser.newPage();
  await page.setContent('<video id="demo" muted playsinline controls></video>');
  await page.evaluate(() => {
    document.querySelector('#demo').src = 'http://127.0.0.1:4175/loci-loom-demo.mp4';
  });
  await page.waitForFunction(() => document.querySelector('#demo').readyState >= 2);

  const metadata = await page.evaluate(() => {
    const video = document.querySelector('#demo');
    return {
      duration: video.duration,
      width: video.videoWidth,
      height: video.videoHeight,
      readyState: video.readyState,
      error: video.error?.message ?? null,
    };
  });

  if (metadata.error || metadata.width !== 1920 || metadata.height !== 1080) {
    throw new Error(`Invalid browser metadata: ${JSON.stringify(metadata)}`);
  }

  await page.evaluate(() => document.querySelector('#demo').play());
  await page.waitForFunction(() => document.querySelector('#demo').currentTime > 0.5);

  for (const target of [12, 30, 50]) {
    await page.evaluate(async (time) => {
      const video = document.querySelector('#demo');
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error(`Seek to ${time}s timed out`)), 5000);
        video.addEventListener('seeked', () => {
          clearTimeout(timeout);
          resolve();
        }, { once: true });
        video.currentTime = time;
      });
      await video.play();
    }, target);
    await page.waitForFunction(
      (time) => {
        const video = document.querySelector('#demo');
        return video.currentTime > time + 0.2 && video.readyState >= 2 && !video.error;
      },
      target,
    );
  }

  const result = await page.evaluate(() => {
    const video = document.querySelector('#demo');
    return {
      duration: Number(video.duration.toFixed(3)),
      dimensions: `${video.videoWidth}x${video.videoHeight}`,
      currentTime: Number(video.currentTime.toFixed(3)),
      readyState: video.readyState,
      error: video.error?.message ?? null,
    };
  });

  if (result.error) throw new Error(`Browser playback failed: ${result.error}`);
  console.log(`Video playback smoke passed: ${JSON.stringify(result)}`);
} finally {
  await browser.close();
  server.close();
}
