import express from "express";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Analysis/Download Info
  app.post("/api/analyze-download", async (req, res) => {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      // Attempt to fetch the manifest to verify it's reachable from the backend
      const response = await axios.get(url, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const isMaster = response.data.includes("#EXT-X-STREAM-INF");
      const isMedia = response.data.includes("#EXT-X-TARGETDURATION");

      res.json({
        status: "success",
        type: isMaster ? "Master Playlist" : isMedia ? "Media Playlist" : "Unknown",
        contentLength: response.headers['content-length'] || "unknown",
        message: "Backend successfully reached the stream source. Direct MP4 download of HLS streams requires server-side transcoding (FFmpeg), which is currently processing in 'Simulated Mode' for this demo."
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: "Backend failed to reach the stream source.",
        details: error.message 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
