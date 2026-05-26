/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '1mb' }));

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Email address is required'),
});

const readmeSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  sectionsToInclude: z.array(z.string()).min(1).max(50),
});

const paletteSchema = z.object({
  query: z.string().min(1).max(500),
});

const componentSchema = z.object({
  type: z.string().min(1).max(100),
  variant: z.string().min(1).max(100),
  promptInput: z.string().max(2000).default(''),
});

const docsSchema = z.object({
  fileNames: z.array(z.string()).min(1).max(50),
  targetTheme: z.string().min(1).max(500),
});

function validate(schema: z.ZodSchema) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation échouée',
        details: result.error.issues.map(i => ({ path: i.path.join('.'), message: i.message })),
      });
    }
    req.body = result.data;
    next();
  };
}

// Initialize Gemini SDK with telemetry header
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const hasAIKey = !!geminiApiKey;

let ai: GoogleGenAI | null = null;
if (hasAIKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// --------------------------------------------------------------------------
// API ENDPOINTS: AUTHENTICATION
// --------------------------------------------------------------------------

// Authenticate / Login simulation with signing mock JWT token
app.post('/api/auth/login', validate(loginSchema), (req, res) => {
  const { email } = req.body;

  // Generate mock JWT token
  const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.devdock-${Buffer.from(email).toString('base64')}.signature`;
  
  return res.json({
    status: 'success',
    token: mockToken,
    user: {
      id: 'usr-' + Math.random().toString(36).substring(2, 9),
      name: email.split('@')[0].toUpperCase(),
      email: email,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      role: 'SaaS Creator',
    },
  });
});

// Mock GitHub OAuth flow landing simulation
app.get('/api/auth/github/callback', (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.redirect('/?oauth_error=true');
  }
  // Redirect back to app with simulated credentials
  res.redirect('/?oauth_success=true&email=oauth-developer@github.com');
});

// --------------------------------------------------------------------------
// API ENDPOINTS: AI INTELLIGENCE SERVICES (Powered by gemini-2.5-flash)
// --------------------------------------------------------------------------

// 1. Markdown suggestions based on project descriptions
app.post('/api/ai/readme', validate(readmeSchema), async (req, res) => {
  if (!checkAi(res)) return;

  const { name, description, sectionsToInclude } = req.body;

  try {
    const prompt = `You are an expert technical writer. For the project "${name}", described as: "${description}", produce exceptional GitHub README sections covering these: ${sectionsToInclude.join(', ')}.

    Keep the typography extremely elegant and well-organized, with helpful tables, sample CLI commands, badge arrays, and bullet points.
    Return the response as a JSON array where each item has "id" (matching the section identifier), "title" (with fitting emojis), and "content" (pure markdown).
    
    JSON format requirement:
    [
      { "id": "intro", "title": "📖 Description", "content": "...markdown content here..." }
    ]`;

    const response = await ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              content: { type: Type.STRING }
            },
            required: ['id', 'title', 'content']
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || '[]');
    res.json({ sections: parsedData });
  } catch (err: unknown) {
    handleAiError(res, 'readme')(err);
  }
});

// 2. Automated Color Scheme Formulation
app.post('/api/ai/palette', validate(paletteSchema), async (req, res) => {
  if (!checkAi(res)) return;

  const { query } = req.body;

  try {
    const prompt = `Formulate an ultra-modern professional developer color palette theme inspired by the query: "${query}".
    Incorporate an eye-safe aesthetic with great contrast ratio suited for developers dashboards.
    Return a structured JSON describing the primary, secondary, background, accent, surface, and text colors along with a short descriptive custom name for this palette.
    All colors must be in hex code format (e.g., "#090d16").`;

    const response = await ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            primary: { type: Type.STRING },
            secondary: { type: Type.STRING },
            accent: { type: Type.STRING },
            background: { type: Type.STRING },
            surface: { type: Type.STRING },
            text: { type: Type.STRING }
          },
          required: ['name', 'primary', 'secondary', 'accent', 'background', 'surface', 'text']
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    res.json(parsedData);
  } catch (err: unknown) {
    handleAiError(res, 'palette')(err);
  }
});

// 3. Automated TSX Component Compilation
app.post('/api/ai/component', validate(componentSchema), async (req, res) => {
  if (!checkAi(res)) return;

  const { type, variant, promptInput } = req.body;

  try {
    const prompt = `Compose a complete, beautiful and stateful React component using TypeScript and Tailwind CSS utility classes.
    Type: ${type}
    Style Variant: ${variant}
    Specific Instructions: ${promptInput}
    
    Ensure the component is highly stylized (inspired by Vercel/Linear), has interactive local state where needed, and looks robust. 
    Import icons from "lucide-react" if helpful (represented as Lucide elements like Sparkles, ArrowRight, Settings).
    
    Return the response as a JSON object containing the full React file string on "code" key. Include NO markdown wrappers or code fence block markers inside the code property.`;

    const response = await ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            code: { type: Type.STRING }
          },
          required: ['code']
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    res.json(parsedData);
  } catch (err: unknown) {
    handleAiError(res, 'component')(err);
  }
});

// 4. Automated Documentation Page Compiler
app.post('/api/ai/docs', validate(docsSchema), async (req, res) => {
  if (!checkAi(res)) return;

  const { fileNames, targetTheme } = req.body;

  try {
    const prompt = `Generate a magnificent multi-section software API documentation page in markdown.
    Files to document: ${fileNames.join(', ')}
    Theme Aesthetic: ${targetTheme}
    
    Construct complete sections including Description, Endpoint Table/Component signature, interactive sample configs, and troubleshooting tips.
    Return the response as a JSON object with:
    - title: "Title of the Doc Page"
    - category: "Category (e.g. Core Services)"
    - content: full, beautiful markdown code blocks using standard header layout structures.`;

    const response = await ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            content: { type: Type.STRING }
          },
          required: ['title', 'category', 'content']
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    res.json(parsedData);
  } catch (err: unknown) {
    handleAiError(res, 'documentation')(err);
  }
});

function handleAiError(res: express.Response, label: string) {
  return (err: unknown) => {
    console.error(`Error in ${label}:`, err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: `Failed to generate ${label}: ${message}` });
  };
}

function checkAi(res: express.Response): boolean {
  if (!ai) {
    res.status(503).json({ error: 'Gemini API key is not configured on the server.' });
    return false;
  }
  return true;
}

// Express status check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'online', 
    aiConfigured: hasAIKey,
    time: new Date().toISOString()
  });
});

// --------------------------------------------------------------------------
// VITE CLIENT INTEGRATION MIDDLEWARE
// --------------------------------------------------------------------------

async function bootstrap() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    // Mount Vite asset server first to handle hot loading
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DevDock Server] running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });

  const shutdown = (signal: string) => {
    console.log(`\n[DevDock] Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('[DevDock] Server closed.');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('[DevDock] Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('[DevDock] Failed to start server:', err);
  process.exit(1);
});
