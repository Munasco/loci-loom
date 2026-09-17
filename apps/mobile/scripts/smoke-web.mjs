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

await new Promise(resolve => server.listen(4174, '127.0.0.1', resolve));
const executablePath = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await chromium.launch({ headless: true, executablePath });
try {
  const page = await browser.newPage({ viewport: { width: 393, height: 852 } });
  await page.goto('http://127.0.0.1:4174', { waitUntil: 'networkidle' });
  await page.getByText('Weave a new trail').click();
  await page.getByLabel('Topic').fill('The immune system');
  await page.getByText('Weave my trail').click();
  for (let index = 0; index < 4; index += 1) await page.getByText('Walk to the next stop').click();
  await page.getByText('Test my memory').click();
  await page.getByText('The upside-down garden').click();
  await page.getByText('Continue').click();
  if (!(await page.getByText('Make knowledge impossible to lose.').isVisible())) throw new Error('Paywall was not reached');
  await page.getByLabel('Back').click();
  await page.getByText('SEE ALL').click();
  if (!(await page.getByText('The immune system').isVisible())) throw new Error('Saved trail was not visible in the library');
  console.log('Smoke test passed: create → five stops → recall → paywall → saved library');
} finally {
  await browser.close();
  server.close();
}
