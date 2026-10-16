import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Streaming Chat API
app.post('/api/chat', async (req: Request, res: Response) => {
  const {
    messages,
    model = 'gemini-3.8-flash',
    systemInstruction,
    thinkingLevel,
  } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Messages array is required.' });
    return;
  }

  // Engine for NovaAI Chat Assistance: Gemini Flash 1.5
  const modelDisplayName = 'Gemini Flash 1.5';

  // Format messages into Google GenAI contents structure
  const contents = messages.map((m: { role: string; content: string }) => ({
    role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
    parts: [{ text: m.content || '' }],
  }));

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const sendEvent = (data: Record<string, unknown> | string) => {
    res.write(`data: ${typeof data === 'string' ? data : JSON.stringify(data)}\n\n`);
  };

  try {
    const identityInstruction = `[CRITICAL MODEL IDENTITY]:
You are NovaAI, an AI chat assistant powered by Google's Gemini Flash 1.5 engine.
Your sole engine is Gemini Flash 1.5 (Gemini Flash).
NEVER identify or refer to yourself as "Gemini 1.5 Pro", "Gemini Pro", or any Pro model. You are Gemini Flash 1.5.
If the user asks (in any language, such as English, Bengali "কোন মডেল", etc.) what model you are, which engine is running, or your version, ALWAYS answer that you are Gemini Flash 1.5.`;

    const combinedSystemInstruction = `${identityInstruction}\n\n${systemInstruction || ''}`;

    const config: Record<string, unknown> = {
      systemInstruction: combinedSystemInstruction,
      tools: [{ googleSearch: {} }],
    };

    let didStreamChunk = false;

    const streamFromModel = async (modelName: string, modelConfig: Record<string, unknown>) => {
      const stream = await ai.models.generateContentStream({
        model: modelName,
        contents,
        config: modelConfig,
      });

      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          didStreamChunk = true;
          sendEvent({ chunk: text });
        }
      }
    };

    const modelsToTry = [
      'gemini-flash-lite-latest',
      'gemini-2.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
    ];

    let streamSucceeded = false;
    let lastError: any = null;

    for (const modelCandidate of modelsToTry) {
      if (didStreamChunk) break;
      try {
        const candidateConfig: Record<string, unknown> = {
          systemInstruction: combinedSystemInstruction,
        };
        
        // Add googleSearch tool ONLY for models that support/require it
        if (modelCandidate === 'gemini-3.8-flash') {
            candidateConfig.tools = [{ googleSearch: {} }];
        }

        await streamFromModel(modelCandidate, candidateConfig);
        streamSucceeded = true;
        break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelCandidate} failed (${err?.status || err?.message?.slice(0, 60)}). Trying next candidate...`);
      }
    }

    if (!streamSucceeded && !didStreamChunk) {
      throw lastError || new Error('Service temporarily unavailable. Please try again.');
    }

    sendEvent('[DONE]');
    res.end();
  } catch (err: any) {
    console.error('Chat generation error:', err);
    sendEvent({
      error: err?.message || 'An error occurred while generating the response.',
    });
    sendEvent('[DONE]');
    res.end();
  }
});

// One-shot text structurer endpoint for quick utility transformations
app.post('/api/structure-text', async (req: Request, res: Response) => {
  try {
    const { text, mode = 'structure' } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    let instruction = '';
    switch (mode) {
      case 'summary':
        instruction =
          'Provide a high-impact, crisp 30-second summary: start with a 1-sentence TL;DR, followed by 3-5 core bullet takeaways, and key conclusion.';
        break;
      case 'table':
        instruction =
          'Parse and structure this text into a clean Markdown table with descriptive headers, followed by a brief 2-bullet summary of key trends or takeaways.';
        break;
      case 'action_items':
        instruction =
          'Extract all action items, tasks, deadlines, and responsibilities into a structured checklist with owner/priority if discernible.';
        break;
      case 'simplify':
        instruction =
          'Break down and explain this text in crystal-clear, plain language (ELI10 style) with intuitive analogies and no confusing jargon.';
        break;
      case 'structure':
      default:
        instruction =
          'Analyze and structure this complex text. Organize it into: 1) Executive Summary, 2) Structured Breakdown/Table/Categorized Points, 3) Critical Highlights, 4) Next Steps or Takeaways.';
        break;
    }

    let responseText = '';
    const systemInstruction = 'You are NovaAI Structuring Engine. You transform dense, unstructured, or messy information into clear, structured, readable Markdown with tables, lists, and bold callouts.';
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: `${instruction}\n\nInput Text:\n"""\n${text}\n"""`,
          },
        ],
      },
    ];

    const structureModels = [
      'gemini-flash-lite-latest',
      'gemini-2.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
    ];

    for (const sm of structureModels) {
      try {
        const response = await ai.models.generateContent({
          model: sm,
          contents,
          config: { systemInstruction },
        });
        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (smErr: any) {
        console.warn(`Structure model ${sm} failed:`, smErr?.message?.slice(0, 50));
      }
    }

    if (!responseText) {
      throw new Error('Unable to structure text at this time. Please try again.');
    }

    res.json({ result: responseText });
  } catch (err: any) {
    console.error('Structure text error:', err);
    res.status(500).json({ error: err?.message || 'Failed to structure text.' });
  }
});

// Dev vs Prod middleware
if (process.env.NODE_ENV !== 'production') {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`NovaAI Chat Assistant running at http://localhost:${port}`);
});
