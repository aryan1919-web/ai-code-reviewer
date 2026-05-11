import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Groq API Keys (rotation for rate limit handling)
const GROQ_KEYS = (process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '').split(',').filter(k => k.trim());
let currentKeyIndex = 0;

function getNextGroqKey() {
  if (GROQ_KEYS.length === 0) return null;
  const key = GROQ_KEYS[currentKeyIndex % GROQ_KEYS.length].trim();
  currentKeyIndex = (currentKeyIndex + 1) % GROQ_KEYS.length;
  return key;
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    error: 'Too many requests. Please wait a minute before trying again.',
    retryAfter: 60
  }
});

app.use('/api/', limiter);

// Groq API call — uses OpenAI-compatible REST API (no SDK needed)
async function callGroq(apiKey, prompt) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert code reviewer. Always respond with ONLY valid JSON, no markdown, no extra text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4096,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API ${response.status}: ${err}`);
  }

  return await response.json();
}

// Code Review Endpoint
app.post('/api/review', async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    if (GROQ_KEYS.length === 0) {
      return res.status(500).json({ error: 'No API keys configured.' });
    }

    const prompt = `Analyze the following ${language} code and provide a comprehensive review.

CODE:
\`\`\`${language}
${code}
\`\`\`

Respond with this exact JSON structure:
{
  "summary": "Brief overall assessment (2-3 sentences)",
  "score": <number 1-10>,
  "bugs": [{"line": "N/A or number", "severity": "critical|high|medium|low", "description": "...", "fix": "..."}],
  "optimizations": [{"type": "performance|readability|maintainability|best-practice", "description": "...", "suggestion": "..."}],
  "security": [{"severity": "critical|high|medium|low", "vulnerability": "...", "description": "...", "fix": "..."}],
  "improvedCode": "improved code as a string",
  "positives": ["good thing 1", "good thing 2"]
}`;

    // Try each key (max 2 attempts per key)
    let lastError = null;
    const maxAttempts = GROQ_KEYS.length * 2;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const apiKey = getNextGroqKey();
      console.log(`🔑 Attempt ${attempt + 1} with Groq key ...${apiKey.slice(-6)}`);

      try {
        const result = await callGroq(apiKey, prompt);
        const text = result.choices[0].message.content;

        console.log(`✅ Success with Groq key ...${apiKey.slice(-6)}`);

        // Clean up response
        let cleanText = text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();

        try {
          const reviewData = JSON.parse(cleanText);

          if (reviewData.improvedCode) {
            reviewData.improvedCode = reviewData.improvedCode
              .replace(/^```[\w]*\n?/gm, '')
              .replace(/```$/gm, '')
              .trim();
          }

          return res.json({
            success: true,
            review: reviewData,
            timestamp: new Date().toISOString(),
            model: 'llama-3.3-70b (Groq)'
          });
        } catch (parseError) {
          // Try to extract JSON from response
          const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const reviewData = JSON.parse(jsonMatch[0]);
            return res.json({
              success: true,
              review: reviewData,
              timestamp: new Date().toISOString(),
              model: 'llama-3.3-70b (Groq)'
            });
          }

          // Fallback response
          return res.json({
            success: true,
            review: {
              summary: cleanText.substring(0, 500),
              score: 7,
              bugs: [],
              optimizations: [],
              security: [],
              improvedCode: code,
              positives: ['Code submitted for review']
            },
            timestamp: new Date().toISOString()
          });
        }

      } catch (error) {
        lastError = error;
        console.log(`❌ Key ...${apiKey.slice(-6)} failed: ${error.message}`);

        // If rate limited, try next key immediately
        if (error.message.includes('429')) {
          continue;
        }

        // For other errors, small delay then retry
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    // All attempts failed
    res.status(429).json({
      error: 'Service temporarily busy. Please try again in a few seconds.',
      details: lastError?.message
    });

  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({
      error: 'Failed to analyze code. Please try again.',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    apiKeysConfigured: GROQ_KEYS.length,
    provider: 'Groq (Llama 3.3 70B)'
  });
});

// Supported languages endpoint
app.get('/api/languages', (req, res) => {
  res.json({
    languages: [
      { id: 'javascript', name: 'JavaScript', extension: 'js' },
      { id: 'typescript', name: 'TypeScript', extension: 'ts' },
      { id: 'python', name: 'Python', extension: 'py' },
      { id: 'java', name: 'Java', extension: 'java' },
      { id: 'cpp', name: 'C++', extension: 'cpp' },
      { id: 'c', name: 'C', extension: 'c' },
      { id: 'csharp', name: 'C#', extension: 'cs' },
      { id: 'go', name: 'Go', extension: 'go' },
      { id: 'rust', name: 'Rust', extension: 'rs' },
      { id: 'php', name: 'PHP', extension: 'php' },
      { id: 'ruby', name: 'Ruby', extension: 'rb' },
      { id: 'swift', name: 'Swift', extension: 'swift' },
      { id: 'kotlin', name: 'Kotlin', extension: 'kt' },
      { id: 'sql', name: 'SQL', extension: 'sql' },
      { id: 'html', name: 'HTML', extension: 'html' },
      { id: 'css', name: 'CSS', extension: 'css' }
    ]
  });
});

// Serve frontend build in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔑 Groq API Keys loaded: ${GROQ_KEYS.length}`);
  console.log(`⚡ Model: Llama 3.3 70B via Groq (ultra-fast inference)`);
});
