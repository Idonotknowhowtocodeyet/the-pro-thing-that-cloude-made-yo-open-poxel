const http = require("http");
const https = require("https");
const url = require("url");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // Serve the frontend UI at root
  if (req.url === "/" || req.url === "/index.html") {
    res.writeHead(200, { "Content-Type": "text/html" });
    fs.createReadStream(path.join(__dirname, "index.html")).pipe(res);
    return;
  }

  // Proxy requests: /proxy?url=https://example.com
  if (req.url.startsWith("/proxy")) {
    const parsedUrl = url.parse(req.url, true);
    const targetUrl = parsedUrl.query.url;

    if (!targetUrl) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Missing ?url= parameter" }));
      return;
    }

    let target;
    try {
      target = new URL(targetUrl);
    } catch (e) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid URL" }));
      return;
    }

    const isHttps = target.protocol === "https:";
    const lib = isHttps ? https : http;

    const options = {
      hostname: target.hostname,
      port: target.port || (isHttps ? 443 : 80),
      path: target.pathname + target.search,
      method: req.method,
      headers: {
        ...req.headers,
        host: target.hostname,
        // Spoof a real browser to avoid blocks
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
    };

    // Remove proxy-related headers
    delete options.headers["proxy-connection"];

    const proxyReq = lib.request(options, (proxyRes) => {
      // Add CORS headers so browsers don't block it
      res.writeHead(proxyRes.statusCode, {
        ...proxyRes.headers,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      });
      proxyRes.pipe(res);
    });

    proxyReq.on("error", (err) => {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Proxy error: " + err.message }));
    });

    req.pipe(proxyReq);
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`\n🚀 Proxy server running!`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Usage:   http://localhost:${PORT}/proxy?url=https://example.com\n`);
});
