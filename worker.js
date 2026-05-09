// PRXY — Cloudflare Worker Proxy
// Deploy at: https://workers.cloudflare.com

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Serve the UI at root
    if (url.pathname === "/" || url.pathname === "") {
      return new Response(HTML, {
        headers: { "Content-Type": "text/html;charset=UTF-8" },
      });
    }

    // Handle proxy requests: /proxy?url=https://example.com
    if (url.pathname === "/proxy") {
      const targetUrl = url.searchParams.get("url");

      if (!targetUrl) {
        return new Response(JSON.stringify({ error: "Missing ?url= parameter" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Validate URL
      let target;
      try {
        target = new URL(targetUrl);
      } catch {
        return new Response(JSON.stringify({ error: "Invalid URL" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Block localhost / internal IPs (security)
      const blocked = ["localhost", "127.0.0.1", "0.0.0.0", "::1"];
      if (blocked.includes(target.hostname)) {
        return new Response(JSON.stringify({ error: "Blocked" }), { status: 403 });
      }

      // Forward the request
      const proxyReq = new Request(targetUrl, {
        method: request.method,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: request.headers.get("Accept") || "*/*",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
        },
        body: ["GET", "HEAD"].includes(request.method) ? null : request.body,
        redirect: "follow",
      });

      try {
        const response = await fetch(proxyReq);

        // Clone and add CORS headers
        const newHeaders = new Headers(response.headers);
        newHeaders.set("Access-Control-Allow-Origin", "*");
        newHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        newHeaders.set("Access-Control-Allow-Headers", "*");
        // Remove headers that cause issues
        newHeaders.delete("X-Frame-Options");
        newHeaders.delete("Content-Security-Policy");

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Proxy error: " + err.message }), {
          status: 502,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response("Not found", { status: 404 });
  },
};

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PRXY — Cloudflare Proxy</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Space+Mono:wght@400;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0a0a0f; --surface: #111118; --border: #1e1e2e;
      --accent: #f6821f; --accent2: #fbad41; --text: #e8e8f0;
      --muted: #555570; --danger: #ff4455;
    }
    body {
      background: var(--bg); color: var(--text);
      font-family: 'Space Mono', monospace;
      min-height: 100vh; display: flex; flex-direction: column;
      align-items: center; justify-content: center; padding: 2rem;
    }
    body::before {
      content: ''; position: fixed; inset: 0;
      background-image:
        linear-gradient(rgba(246,130,31,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(246,130,31,0.04) 1px, transparent 1px);
      background-size: 40px 40px; z-index: 0;
      animation: gridScroll 20s linear infinite;
    }
    @keyframes gridScroll { 100% { background-position: 40px 40px; } }
    .container { position: relative; z-index: 1; width: 100%; max-width: 680px; }
    .logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(3rem,10vw,5.5rem); letter-spacing: -4px; line-height: 1; margin-bottom: 0.25rem; }
    .logo span { color: var(--accent); }
    .badge { display: inline-flex; align-items: center; gap: 0.4rem; background: rgba(246,130,31,0.12); border: 1px solid rgba(246,130,31,0.3); color: var(--accent); border-radius: 99px; padding: 0.25rem 0.75rem; font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 2.5rem; }
    .cf-logo { width: 14px; height: 14px; }
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 2rem; margin-bottom: 1.5rem; position: relative; overflow: hidden; }
    .card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--accent), var(--accent2), transparent); }
    label { display: block; font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); margin-bottom: 0.75rem; }
    .input-row { display: flex; gap: 0.75rem; }
    input[type="text"] { flex: 1; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-family: 'Space Mono', monospace; font-size: 0.85rem; padding: 0.85rem 1rem; outline: none; transition: border-color 0.2s; }
    input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(246,130,31,0.1); }
    input::placeholder { color: var(--muted); }
    button { background: var(--accent); color: #000; border: none; border-radius: 8px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.85rem; padding: 0.85rem 1.5rem; cursor: pointer; transition: opacity 0.15s, transform 0.1s; white-space: nowrap; }
    button:hover { opacity: 0.85; }
    button:active { transform: scale(0.97); }
    button.secondary { background: transparent; color: var(--accent); border: 1px solid var(--accent); }
    .result-box { margin-top: 1.5rem; display: none; }
    .result-url { background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 0.85rem 1rem; font-size: 0.75rem; color: var(--accent); word-break: break-all; margin-bottom: 0.75rem; }
    .btn-row { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .status { display: flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; color: var(--muted); margin-top: 1rem; }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: pulse 2s ease-in-out infinite; }
    @keyframes pulse { 50% { opacity: 0.4; transform: scale(0.8); } }
    .tips { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .tip { background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 1rem; }
    .tip-icon { font-size: 1.25rem; margin-bottom: 0.5rem; }
    .tip-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.8rem; margin-bottom: 0.25rem; }
    .tip-desc { font-size: 0.65rem; color: var(--muted); line-height: 1.5; }
    .section-label { font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); margin-bottom: 1rem; }
    .error { color: var(--danger); font-size: 0.75rem; margin-top: 0.5rem; display: none; }
    @media (max-width: 500px) { .input-row { flex-direction: column; } .tips { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">PR<span>X</span>Y</div>
    <div class="badge">
      <svg class="cf-logo" viewBox="0 0 109 41" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M71.8 9.5c-3.8 0-7.2 1.6-9.6 4.2-1.8-2.9-5-4.8-8.7-4.8-3 0-5.8 1.3-7.7 3.3C44.1 5.1 38.2.5 31.2.5 22.5.5 15.4 7.3 15 15.9c-3.2 1.4-5.4 4.6-5.4 8.3 0 5 4.1 9.1 9.1 9.1h53.1c5 0 9.1-4.1 9.1-9.1 0-4.7-3.6-8.6-8.2-8.7-.3-3.3-3-5.9-6.3-6l.4.0z" fill="currentColor" opacity=".4"/><path d="M81.1 17.5l-.5-.1-.3-.5c-1.5-3.5-5-5.9-8.9-5.9-3 0-5.7 1.3-7.5 3.4l-.6.7-.9-.3c-.9-.3-1.8-.4-2.7-.4-4.6 0-8.4 3.5-8.7 8l-.1.9-.9.1c-3.5.4-6.1 3.4-6.1 7 0 3.9 3.2 7.1 7.1 7.1h29.6c3.9 0 7.1-3.2 7.1-7.1 0-3.6-2.7-6.6-6.2-6.9z" fill="currentColor"/></svg>
      Powered by Cloudflare Workers
    </div>

    <div class="card">
      <label>Enter URL to proxy</label>
      <div class="input-row">
        <input type="text" id="urlInput" placeholder="https://example.com" autocomplete="off" spellcheck="false" />
        <button onclick="generate()">GO →</button>
      </div>
      <p class="error" id="error">Please enter a valid URL starting with http:// or https://</p>
      <div class="result-box" id="result">
        <label style="margin-top:1.25rem">Your proxy link</label>
        <div class="result-url" id="proxyUrl"></div>
        <div class="btn-row">
          <button onclick="openProxy()">Open in new tab</button>
          <button class="secondary" onclick="copyUrl()">Copy link</button>
        </div>
      </div>
      <div class="status">
        <div class="dot"></div>
        Running on Cloudflare's global edge network
      </div>
    </div>

    <div class="card">
      <p class="section-label">Why Cloudflare Workers</p>
      <div class="tips">
        <div class="tip"><div class="tip-icon">🌍</div><div class="tip-title">300+ edge locations</div><div class="tip-desc">Routes from the closest server to you AND the target. Ultra low latency.</div></div>
        <div class="tip"><div class="tip-icon">💸</div><div class="tip-title">100k free req/day</div><div class="tip-desc">Cloudflare's free tier covers massive usage. No credit card needed.</div></div>
        <div class="tip"><div class="tip-icon">⚡</div><div class="tip-title">Faster than your ISP</div><div class="tip-desc">Cloudflare's backbone often finds faster paths than your home connection.</div></div>
        <div class="tip"><div class="tip-icon">🔓</div><div class="tip-title">Bypass blocks</div><div class="tip-desc">Access game sites blocked by school or work networks, no VPN needed.</div></div>
      </div>
    </div>
  </div>
  <script>
    let proxyLink = '';
    function generate() {
      const input = document.getElementById('urlInput').value.trim();
      const err = document.getElementById('error');
      const result = document.getElementById('result');
      err.style.display = 'none'; result.style.display = 'none';
      if (!input.startsWith('http://') && !input.startsWith('https://')) { err.style.display = 'block'; return; }
      proxyLink = window.location.origin + '/proxy?url=' + encodeURIComponent(input);
      document.getElementById('proxyUrl').textContent = proxyLink;
      result.style.display = 'block';
    }
    function openProxy() { window.open(proxyLink, '_blank'); }
    function copyUrl() {
      navigator.clipboard.writeText(proxyLink).then(() => {
        const btn = event.target; btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy link', 1500);
      });
    }
    document.getElementById('urlInput').addEventListener('keydown', e => { if (e.key === 'Enter') generate(); });
  </script>
</body>
</html>`;
