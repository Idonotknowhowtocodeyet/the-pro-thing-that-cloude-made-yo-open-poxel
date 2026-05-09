# PRXY — Simple Proxy Server

Zero dependencies. Pure Node.js. Runs anywhere.

## Run it locally

```bash
node server.js
```

Then open http://localhost:3000

## Run it free in the cloud

### Option 1: Railway (easiest)
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Push these files to a GitHub repo first, then connect it
4. It auto-detects Node.js and runs `node server.js`
5. Railway gives you a public URL for free

### Option 2: Render
1. Go to https://render.com
2. New → Web Service → connect your GitHub repo
3. Start command: `node server.js`
4. Free tier works fine

### Option 3: Glitch (instant, no signup needed)
1. Go to https://glitch.com/edit/#!/new-project
2. Drop these files in
3. Done — instant public URL

## Usage

Visit your URL and paste any site to proxy it:

```
https://your-server.com/proxy?url=https://site-you-want.com
```

## For gaming
- Host this on a VPS/cloud server close to your game's servers
- This lowers the network hops between you and the game
- Use the proxy URL to access blocked game sites from school/work networks
