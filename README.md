# PRXY — Cloudflare Workers Proxy

Free. Fast. No server needed.

## Deploy in 2 minutes

### Option A: Browser (no install needed)
1. Go to https://workers.cloudflare.com
2. Sign up free (no credit card)
3. Click "Create a Worker"
4. Delete the default code
5. Paste the contents of `worker.js`
6. Click "Save and Deploy"
7. Done — you get a free URL like `https://prxy.yourname.workers.dev`

### Option B: Wrangler CLI
```bash
npm install -g wrangler
wrangler login
wrangler deploy
```

## Free tier limits
- 100,000 requests/day
- Runs on 300+ global edge locations
- No cold starts

## Usage
Visit your worker URL, paste any site, hit GO.

Direct API usage:
```
https://prxy.yourname.workers.dev/proxy?url=https://site.com
```
