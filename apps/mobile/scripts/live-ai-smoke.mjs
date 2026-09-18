import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { chromium } from 'playwright-core';

const root = normalize(join(process.cwd(), 'dist'));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.ico': 'image/x-icon' };
const server = createServer((request, response) => {
  const requested = request.url === '/' ? '/index.html' : request.url.split('?')[0];
  let file = normalize(join(root, requested));
  if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) file = join(root, 'index.html');
  response.setHeader('Content-Type', types[extname(file)] ?? 'application/octet-stream');
  createReadStream(file).pipe(response);
});

await new Promise((resolve) => server.listen(4177, '127.0.0.1', resolve));
const executablePath = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await chromium.launch({ headless: true, executablePath });

try {
  const page = await browser.newPage({ viewport: { width: 393, height: 852 } });
  page.on('response', (response) => {
    if (response.url().includes(':8787')) console.log(`AI response: ${response.status()} ${response.request().method()}`);
  });
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') console.log(`Browser ${message.type()}: ${message.text()}`);
  });
  page.on('pageerror', (error) => console.log(`Browser page error: ${error.message}`));
  page.on('requestfailed', (request) => {
    if (request.url().includes(':8787')) console.log(`AI request failed: ${request.failure()?.errorText ?? 'unknown error'}`);
  });
  page.on('dialog', async (dialog) => {
    console.log(`App dialog: ${dialog.message()}`);
    await dialog.dismiss();
  });
  await page.goto('http://127.0.0.1:4177', { waitUntil: 'networkidle' });
  const health = await page.evaluate(async () => {
    const response = await fetch('http://127.0.0.1:8787/health');
    return { status: response.status, body: await response.json() };
  });
  console.log(`Browser-to-AI health: ${JSON.stringify(health)}`);
  await page.getByText('Weave a new trail').click();
  await page.getByLabel('Topic').fill('The Krebs cycle');
  await page.getByLabel('Source notes').fill('Acetyl-CoA joins oxaloacetate to form citrate. The cycle releases carbon dioxide, transfers high-energy electrons to NADH and FADH2, produces GTP or ATP, and regenerates oxaloacetate.');
  console.log(`Topic field before generation: ${await page.getByLabel('Topic').inputValue()}`);
  await page.getByRole('button', { name: 'Weave my trail' }).click();
  await page.waitForTimeout(500);
  console.log(`Generation button state: ${await page.getByRole('button').last().innerText()}`);
  try {
    await page.getByText('WOVEN FROM YOUR NOTES').waitFor({ timeout: 30_000 });
  } catch (error) {
    console.log(`App state after generation: ${(await page.locator('body').innerText()).slice(0, 800)}`);
    throw error;
  }
  await page.getByText('Enter the first stop').click();
  const scene = await page.locator('body').innerText();
  if (!scene.includes('STOP 1') || scene.includes('Picture The Krebs cycle as something alive here')) {
    throw new Error('The mobile app did not render a model-generated trail');
  }
  console.log('Live AI smoke passed: arbitrary topic → validated model trail → spatial map → first stop');
} finally {
  await browser.close();
  server.close();
}
