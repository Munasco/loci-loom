import { createServer } from 'node:http';
import { handleRequest } from './app.js';
import { NebiusTrailGenerator } from './nebius.js';

const apiKey = process.env.NEBIUS_API_KEY;
if (!apiKey) throw new Error('NEBIUS_API_KEY is required');
const generator = new NebiusTrailGenerator(apiKey);
const port = Number(process.env.PORT ?? 8787);

createServer(async (incoming, outgoing) => {
  const chunks: Buffer[] = [];
  for await (const chunk of incoming) chunks.push(Buffer.from(chunk));
  const body = chunks.length ? Buffer.concat(chunks) : undefined;
  const request = new Request(`http://${incoming.headers.host ?? 'localhost'}${incoming.url ?? '/'}`, { method: incoming.method, headers: incoming.headers as HeadersInit, body });
  const response = await handleRequest(request, generator);
  outgoing.writeHead(response.status, Object.fromEntries(response.headers));
  outgoing.end(Buffer.from(await response.arrayBuffer()));
}).listen(port, () => console.log(`Loci Loom AI API listening on ${port}`));
