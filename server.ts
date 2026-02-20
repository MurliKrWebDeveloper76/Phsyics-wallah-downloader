import express from "express";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

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

    // Spawn Python process
    const pythonProcess = spawn('python3', [path.join(__dirname, 'backend/python/analyze.py'), url]);
    
    let pythonData = "";
    let pythonError = "";

    pythonProcess.stdout.on('data', (data) => {
      pythonData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      pythonError += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python script exited with code ${code}`);
        console.error(`Python error: ${pythonError}`);
        // Fallback to Node.js logic if Python fails (e.g., python3 not installed)
        return handleNodeFallback(url, res);
      }

      try {
        // Parse the last line of JSON output from Python
        const lines = pythonData.trim().split('\n');
        const lastLine = lines[lines.length - 1];
        const result = JSON.parse(lastLine);
        
        res.json({
          status: "success",
          backend: "Python",
          ...result
        });
      } catch (e) {
        console.error("Failed to parse Python output:", e);
        handleNodeFallback(url, res);
      }
    });
  });

  async function handleNodeFallback(url: string, res: any) {
    try {
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
        backend: "Node.js (Fallback)",
        type: isMaster ? "Master Playlist" : isMedia ? "Media Playlist" : "Unknown",
        contentLength: response.headers['content-length'] || "unknown",
        message: "Analysis completed by Node.js backend."
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: "Backend failed to reach the stream source.",
        details: error.message 
      });
    }
  }

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
