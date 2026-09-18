import { copyFileSync, createReadStream, existsSync, mkdirSync, statSync, unlinkSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { chromium } from 'playwright-core';

const root = normalize(join(process.cwd(), 'dist'));
const outputDir = normalize(join(process.cwd(), '..', 'video', 'public', 'footage'));
const outputPath = join(outputDir, 'product-run.webm');
const paywallPath = normalize(join(process.cwd(), '..', 'video', 'public', 'screens', 'qa-mobile-paywall.png'));
const palacePath = normalize(join(process.cwd(), '..', 'video', 'public', 'screens', 'qa-mobile-palace.png'));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.ico': 'image/x-icon' };
const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

mkdirSync(outputDir, { recursive: true });
if (existsSync(outputPath)) unlinkSync(outputPath);

const server = createServer((request, response) => {
  const requested = request.url === '/' ? '/index.html' : request.url.split('?')[0];
  let file = normalize(join(root, requested));
  if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) file = join(root, 'index.html');
  response.setHeader('Content-Type', types[extname(file)] ?? 'application/octet-stream');
  createReadStream(file).pipe(response);
});

await new Promise((resolve) => server.listen(4176, '127.0.0.1', resolve));
const executablePath = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await chromium.launch({ headless: true, executablePath });
const context = await browser.newContext({
  viewport: { width: 393, height: 852 },
  recordVideo: { dir: outputDir, size: { width: 393, height: 852 } },
});
const page = await context.newPage();
const video = page.video();

try {
  await page.goto('http://127.0.0.1:4176', { waitUntil: 'networkidle' });
  await pause(1500);
  await page.getByText('Weave a new trail').click();
  await pause(800);
  await page.getByLabel('Topic').pressSequentially('The immune system', { delay: 55 });
  await pause(600);
  await page.getByText('Weave my trail').click();
  await pause(1100);
  for (let index = 0; index < 5; index += 1) {
    await page.getByLabel(/, empty$/).first().click();
    await pause(500);
  }
  await page.screenshot({ path: palacePath });
  await page.getByText('Enter my palace').click();
  await pause(900);

  for (let index = 0; index < 4; index += 1) {
    await page.getByText('Walk to the next stop').click();
    await pause(900);
  }
  await page.getByText('Test my memory').click();
  await pause(1000);

  await page.getByText('The velvet door').click();
  await pause(450);
  await page.getByText('Continue').click();
  await pause(750);
  await page.getByText('Memory makes round two faster').click();
  await pause(450);
  await page.getByText('Continue').click();
  await pause(750);
  await page.getByText('The moonlit window', { exact: true }).click();
  await pause(450);
  await page.getByText('See my memory trace').click();
  await pause(2500);

  if (!(await page.getByText('This trail is holding.').isVisible())) throw new Error('The recorded flow did not reach the recall result');
  await page.getByText('Explore Scholar Pass').click();
  await pause(800);
  if (!(await page.getByText('Build a path back to what matters.').isVisible())) throw new Error('The recorded flow did not reach Scholar Pass');
  await page.screenshot({ path: paywallPath });
  await pause(1200);
} finally {
  await page.close();
  await context.close();
  await browser.close();
  server.close();
}

const recordedPath = await video.path();
copyFileSync(recordedPath, outputPath);
if (normalize(recordedPath) !== normalize(outputPath)) unlinkSync(recordedPath);
console.log(`Recorded real product run: ${outputPath}`);
