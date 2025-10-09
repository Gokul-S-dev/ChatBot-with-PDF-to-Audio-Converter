# Complete Backend Integration Guide - Express.js with React Chatbot App

This document provides step-by-step instructions for connecting your React chatbot application to an Express.js backend server.

## Table of Contents

1. [Backend Setup (Express.js)](#backend-setup)
2. [Frontend Configuration](#frontend-configuration)
3. [API Endpoints Implementation](#api-endpoints)
4. [File Upload & PDF Processing](#file-upload)
5. [Chat Integration](#chat-integration)
6. [CORS Configuration](#cors-setup)
7. [Error Handling](#error-handling)
8. [Production Deployment](#production)

---

## 1. Backend Setup (Express.js)

### Step 1: Create Backend Directory Structure

```bash
mkdir chatbot-backend
cd chatbot-backend
npm init -y
```

### Step 2: Install Required Dependencies

```bash
# Core dependencies
npm install express cors dotenv multer

# For PDF processing (optional - choose one)
npm install pdf-parse pdf2pic pdf-poppler

# For file handling
npm install fs-extra path

# For chat/AI integration (optional)
npm install openai axios

# Development dependencies
npm install --save-dev nodemon
```

### Step 3: Basic Server Setup (`server.js`)

```javascript
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs-extra");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files (for audio files)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ensure uploads directory exists
fs.ensureDirSync(path.join(__dirname, "uploads"));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Chatbot Backend API is running!" });
});

// Import route handlers
const chatRoutes = require("./routes/chat");
const converterRoutes = require("./routes/converter");

// Use routes
app.use("/api/chat", chatRoutes);
app.use("/api/converter", converterRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
```

### Step 4: Environment Variables (`.env`)

```env
PORT=5000
NODE_ENV=development

# OpenAI API (if using ChatGPT)
OPENAI_API_KEY=your_openai_api_key_here

# File upload settings
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=application/pdf

# Frontend URL
FRONTEND_URL=http://localhost:5174
```

---

## 2. API Endpoints Implementation

### Chat Routes (`routes/chat.js`)

```javascript
const express = require("express");
const router = express.Router();

// Simple chatbot responses (you can integrate with OpenAI here)
const responses = [
  "That's interesting! Tell me more.",
  "I understand. How can I help you with that?",
  "Thanks for sharing! What else would you like to know?",
  "I'm here to assist you. What's your next question?",
  "Great! Is there anything else I can help you with?",
];

// POST /api/chat/message
router.post("/message", async (req, res) => {
  try {
    const { message, userId } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Simple response logic (replace with AI integration)
    const botResponse = responses[Math.floor(Math.random() * responses.length)];

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    res.json({
      success: true,
      response: botResponse,
      timestamp: new Date().toISOString(),
      messageId: Date.now(),
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      error: "Failed to process message",
      message: error.message,
    });
  }
});

// OpenAI Integration Example (optional)
router.post("/openai", async (req, res) => {
  try {
    const { Configuration, OpenAIApi } = require("openai");

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    const { message } = req.body;

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: message },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    res.json({
      success: true,
      response: completion.data.choices[0].message.content,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({
      error: "Failed to get AI response",
      message: error.message,
    });
  }
});

module.exports = router;
```

### Converter Routes (`routes/converter.js`)

```javascript
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const pdfParse = require("pdf-parse");
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "pdf-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"), false);
    }
  },
});

// POST /api/converter/upload
router.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const fileName = req.file.filename;

    // Extract text from PDF
    const pdfBuffer = await fs.readFile(filePath);
    const pdfData = await pdfParse(pdfBuffer);
    const extractedText = pdfData.text;

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ error: "No text found in PDF" });
    }

    // Here you would integrate with text-to-speech service
    // For demo, we'll create a mock audio URL
    const audioFileName = `audio-${Date.now()}.mp3`;
    const audioUrl = `${req.protocol}://${req.get(
      "host"
    )}/uploads/${audioFileName}`;

    // Simulate audio conversion (replace with actual TTS integration)
    await simulateAudioConversion(extractedText, audioFileName);

    res.json({
      success: true,
      message: "PDF converted successfully",
      audioUrl: audioUrl,
      textLength: extractedText.length,
      fileName: fileName,
      originalName: req.file.originalname,
    });
  } catch (error) {
    console.error("Conversion error:", error);

    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      await fs.remove(req.file.path).catch(console.error);
    }

    res.status(500).json({
      error: "Conversion failed",
      message: error.message,
    });
  }
});

// Simulate audio conversion (replace with actual TTS service)
async function simulateAudioConversion(text, fileName) {
  // This is a placeholder function
  // In real implementation, integrate with:
  // - Google Text-to-Speech API
  // - Amazon Polly
  // - Azure Cognitive Services
  // - IBM Watson Text to Speech

  const audioPath = path.join(__dirname, "..", "uploads", fileName);

  // Create a dummy audio file (you'll replace this with actual audio generation)
  const dummyContent = Buffer.from("dummy audio content");
  await fs.writeFile(audioPath, dummyContent);

  return audioPath;
}

// Google Text-to-Speech Integration Example
async function convertTextToSpeech(text, outputPath) {
  try {
    const textToSpeech = require("@google-cloud/text-to-speech");
    const client = new textToSpeech.TextToSpeechClient();

    const request = {
      input: { text: text },
      voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
      audioConfig: { audioEncoding: "MP3" },
    };

    const [response] = await client.synthesizeSpeech(request);
    await fs.writeFile(outputPath, response.audioContent, "binary");

    return outputPath;
  } catch (error) {
    throw new Error(`TTS conversion failed: ${error.message}`);
  }
}

module.exports = router;
```

---

## 3. Frontend Configuration

### Update React Components to Use Backend APIs

#### Update Chat Component

```javascript
// In your Chat.jsx component, replace the handleSendMessage function:

const handleSendMessage = async () => {
  if (message.trim()) {
    const userMessage = {
      id: messages.length + 1,
      text: message,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");

    try {
      // Call backend API
      const response = await fetch("http://localhost:5000/api/chat/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          userId: "user-" + Date.now(), // You can implement proper user management
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from server");
      }

      const data = await response.json();

      const botResponse = {
        id: messages.length + 2,
        text: data.response,
        sender: "bot",
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorResponse = {
        id: messages.length + 2,
        text: "Sorry, I'm having trouble connecting to the server. Please try again.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorResponse]);
    }
  }
};
```

#### Update Converter Component

```javascript
// In your Converter.jsx component, replace the handleConvert function:

const handleConvert = async () => {
  if (!selectedFile) {
    setConversionStatus("Please select a PDF file first.");
    setStatusVariant("warning");
    return;
  }

  setIsConverting(true);
  setConversionStatus("Converting PDF to audio...");
  setStatusVariant("primary");

  try {
    const formData = new FormData();
    formData.append("pdf", selectedFile);

    const response = await fetch("http://localhost:5000/api/converter/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Conversion failed");
    }

    const result = await response.json();

    setAudioUrl(result.audioUrl);
    setIsAudioReady(true);
    setConversionStatus("Conversion complete! Play your audio below.");
    setStatusVariant("success");
  } catch (error) {
    console.error("Conversion error:", error);
    setConversionStatus(`Conversion failed: ${error.message}`);
    setStatusVariant("danger");
  } finally {
    setIsConverting(false);
  }
};
```

### Create API Service File (`src/services/api.js`)

```javascript
const API_BASE_URL = "http://localhost:5000/api";

class ApiService {
  // Chat API
  static async sendMessage(message, userId = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, userId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Converter API
  static async convertPdfToAudio(file) {
    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const response = await fetch(`${API_BASE_URL}/converter/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Conversion failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Conversion API Error:", error);
      throw error;
    }
  }
}

export default ApiService;
```

---

## 4. Package.json Scripts

### Backend package.json

```json
{
  "name": "chatbot-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "multer": "^1.4.5-lts.1",
    "pdf-parse": "^1.1.1",
    "fs-extra": "^11.1.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### Frontend package.json (add proxy)

```json
{
  "name": "chatbot-frontend",
  "proxy": "http://localhost:5000",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## 5. Running the Application

### Terminal 1 (Backend):

```bash
cd chatbot-backend
npm run dev
```

### Terminal 2 (Frontend):

```bash
cd "d:\React project\Chatbot Application"
npm run dev
```

---

## 6. Advanced Features Integration

### WebSocket for Real-time Chat (Optional)

```javascript
// Backend: Add to server.js
const http = require("http");
const socketIo = require("socket.io");

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5174",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("chat message", async (data) => {
    // Process message and send response
    const response = await processMessage(data.message);
    socket.emit("bot response", response);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Database Integration (MongoDB Example)

```javascript
// Install: npm install mongoose
const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/chatbot", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Chat History Schema
const ChatSchema = new mongoose.Schema({
  userId: String,
  message: String,
  response: String,
  timestamp: { type: Date, default: Date.now },
});

const Chat = mongoose.model("Chat", ChatSchema);

// Save chat history
router.post("/message", async (req, res) => {
  // ... existing code ...

  // Save to database
  const chatRecord = new Chat({
    userId: userId || "anonymous",
    message: message,
    response: botResponse,
  });

  await chatRecord.save();

  // ... rest of response ...
});
```

---

## 7. Production Deployment

### Backend Deployment (Heroku Example)

```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create chatbot-backend-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-frontend-domain.com

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### Frontend Build Configuration

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      "/api": {
        target:
          process.env.NODE_ENV === "production"
            ? "https://your-backend-url.herokuapp.com"
            : "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
};
```

---

## 8. Error Handling & Security

### Rate Limiting

```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP",
});

app.use("/api/", limiter);
```

### File Upload Security

```javascript
const fileFilter = (req, file, cb) => {
  // Only allow PDFs
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files allowed!"), false);
  }
};

// Virus scanning (optional)
const NodeClam = require("clamscan");
const clamscan = await new NodeClam().init();

const scanFile = async (filePath) => {
  const result = await clamscan.scanFile(filePath);
  return result;
};
```

---

## 9. Testing

### Backend API Testing

```javascript
// Install: npm install --save-dev jest supertest
const request = require("supertest");
const app = require("../server");

describe("Chat API", () => {
  test("POST /api/chat/message should return bot response", async () => {
    const response = await request(app)
      .post("/api/chat/message")
      .send({ message: "Hello" })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.response).toBeDefined();
  });
});
```

This comprehensive guide covers everything you need to connect your React chatbot application to an Express.js backend. Follow the steps in order, and you'll have a fully functional full-stack application!
