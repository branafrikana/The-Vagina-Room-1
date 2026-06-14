import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON
  app.use(express.json({ limit: '50mb' }));

  // AI Assistant Route
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { prompt, history } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key is not configured on the server." });
      }

      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
            headers: {
                'User-Agent': 'aistudio-build',
            }
        }
      });

      // Construct history and contents
      let contents = [];
      if (history && history.length > 0) {
          history.forEach((msg: any) => {
             contents.push({
                 role: msg.sender === 'user' ? 'user' : 'model',
                 parts: [{ text: msg.text }]
             });
          });
      }
      contents.push({ role: 'user', parts: [{ text: prompt }] });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: `You are Dr. FID AI, an intelligent health and wellness guide for The Vagina Room. 
          You help women understand their fertility, hormonal health, and emotional wellbeing. 
          You should act as an educational guide, not a substitute for clinical diagnosis.
          Keep your answers concise, empowering, and strictly focused on female health.`,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI response" });
    }
  });

  // Cloudinary Upload Route
  app.post("/api/upload", async (req, res) => {
    try {
      const { base64 } = req.body;
      if (!base64) {
        return res.status(400).json({ error: "No image data provided" });
      }

      if (!process.env.CLOUDINARY_CLOUD_NAME) {
         // Fallback for development if cloudinary is not set
         return res.json({ url: base64 });
      }

      const uploadResponse = await cloudinary.uploader.upload(base64, {
        folder: 'tvr_uploads'
      });
      res.json({ url: uploadResponse.secure_url });
    } catch (error: any) {
      console.error("Cloudinary Upload Error:", error);
      res.status(500).json({ error: error.message || "Upload failed" });
    }
  });

  // Proxy Products Route (to bypass CORS on external sources)
  app.get("/api/proxy-products", async (req, res) => {
    try {
      const targetUrl = req.query.url;
      if (!targetUrl || typeof targetUrl !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid URL parameter' });
      }

      const response = await fetch(targetUrl);
      if (!response.ok) {
        return res.status(response.status).json({ error: `Downstream API responded with ${response.status}` });
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        res.json(data);
      } else {
        const text = await response.text();
        res.send(text);
      }
    } catch (error: any) {
      console.error("Proxy Error:", error);
      res.status(500).json({ error: "Failed to fetch from external source" });
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
