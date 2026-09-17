# Loci Loom AI API

Server-side Nebius Token Factory adapter for generating accurate, schema-validated memory trails with `nvidia/nemotron-3-super-120b-a12b`.

The API key never enters the Expo bundle. `POST /v1/trails` validates the topic, calls the official OpenAI-compatible Token Factory endpoint, removes optional JSON fences, enforces exactly five complete scenes and one valid recall question, and adds the product’s deterministic visual palette. Invalid provider output returns a clear 502 rather than reaching the learner.

## Run

```bash
npm install
# Set NEBIUS_API_KEY in the environment
npm start
```

Health check: `GET /health`. Generation: `POST /v1/trails` with `{ "topic": "cell biology" }`.

## Verify without credits

```bash
npm run verify
```

Tests inject the network boundary, verify the official endpoint and model payload, exercise schema rejection, and confirm that health checks consume no inference.

References: [Nebius Nemotron on Token Factory](https://nebius.com/services/token-factory/nemotron), [Token Factory documentation](https://docs.tokenfactory.nebius.com/).
