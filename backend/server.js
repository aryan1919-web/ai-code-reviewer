import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// API Key Rotation System
const API_KEYS = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '').split(',').filter(k => k.trim());
let currentKeyIndex = 0;
const keyLastUsed = new Map(); // Track when each key was last used
const keyErrorCount = new Map(); // Track consecutive errors per key

function getNextApiKey() {
  if (API_KEYS.length === 0) return null;
  
  // Find a key that hasn't been used recently (60 second cooldown)
  const now = Date.now();
  for (let i = 0; i < API_KEYS.length; i++) {
    const index = (currentKeyIndex + i) % API_KEYS.length;
    const key = API_KEYS[index].trim();
    const lastUsed = keyLastUsed.get(key) || 0;
    const errorCount = keyErrorCount.get(key) || 0;
    
    // Skip keys with too many errors or used within 30 seconds
    if (errorCount < 3 && (now - lastUsed) > 30000) {
      currentKeyIndex = index;
      return key;
    }
  }
  
  // If all keys are on cooldown, use the one with least recent use
  let oldestKey = API_KEYS[0].trim();
  let oldestTime = keyLastUsed.get(oldestKey) || 0;
  
  for (const key of API_KEYS) {
    const k = key.trim();
    const lastUsed = keyLastUsed.get(k) || 0;
    if (lastUsed < oldestTime) {
      oldestTime = lastUsed;
      oldestKey = k;
    }
  }
  
  return oldestKey;
}

function markKeyUsed(key) {
  keyLastUsed.set(key, Date.now());
}

function markKeyError(key) {
  const count = (keyErrorCount.get(key) || 0) + 1;
  keyErrorCount.set(key, count);
  
  // Reset error count after 2 minutes
  setTimeout(() => {
    keyErrorCount.set(key, Math.max(0, (keyErrorCount.get(key) || 0) - 1));
  }, 120000);
}

function resetKeyError(key) {
  keyErrorCount.set(key, 0);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Rate limiting - higher limit since we have multiple keys
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Allow more requests since we rotate keys
  message: {
    error: 'Too many requests. Please wait a minute before trying again.',
    retryAfter: 60
  }
});

app.use('/api/', limiter);

// Helper function to make API call with a specific key
async function callGeminiWithKey(apiKey, prompt) {
  const genAI = new GoogleGenerativeAI(apiKey);
  // Using gemini-2.0-flash - good balance of speed and quality with higher rate limits
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  return await model.generateContent(prompt);
}

// Helper function to wait
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Code Review Endpoint with Auto-Retry and Key Rotation
app.post('/api/review', async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({ 
        error: 'Code and language are required' 
      });
    }

    if (API_KEYS.length === 0) {
      return res.status(500).json({ 
        error: 'No API keys configured. Please add your API keys to .env file.' 
      });
    }

    const prompt = `You are an expert code reviewer. Analyze the following ${language} code and provide a comprehensive review.

CODE:
\`\`\`${language}
${code}
\`\`\`

IMPORTANT: Respond with ONLY valid JSON. No markdown code blocks, no extra text. The improvedCode field should contain the raw code as a string (escape newlines as \\n, escape quotes as \\").

{
  "summary": "Brief overall assessment (2-3 sentences)",
  "score": <number 1-10>,
  "bugs": [{"line": "N/A or number", "severity": "critical|high|medium|low", "description": "...", "fix": "..."}],
  "optimizations": [{"type": "performance|readability|maintainability|best-practice", "description": "...", "suggestion": "..."}],
  "security": [{"severity": "critical|high|medium|low", "vulnerability": "...", "description": "...", "fix": "..."}],
  "improvedCode": "improved code as escaped string with \\n for newlines",
  "positives": ["good thing 1", "good thing 2"]
}
}`;

    // Try with key rotation and automatic retry
    const maxRetries = API_KEYS.length; // Try ALL keys
    const maxWaitCycles = 3; // Will wait and retry up to 3 times if all keys fail
    let lastError = null;

    for (let waitCycle = 0; waitCycle <= maxWaitCycles; waitCycle++) {
      let usedKeys = new Set();
      
      // If this is a retry after waiting, log it
      if (waitCycle > 0) {
        console.log(`\n🔄 Wait cycle ${waitCycle}/${maxWaitCycles} - Retrying all keys after cooldown...`);
      }

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        const apiKey = getNextApiKey();
        
        // Skip if we already tried this key in this cycle
        if (usedKeys.has(apiKey)) {
          continue;
        }
        usedKeys.add(apiKey);
      
      console.log(`🔑 Attempt ${attempt + 1}/${maxRetries} with key ending in ...${apiKey.slice(-6)}`);
      markKeyUsed(apiKey);

      try {
        const result = await callGeminiWithKey(apiKey, prompt);
        const response = await result.response;
        let text = response.text();

        // Success! Reset error count for this key
        resetKeyError(apiKey);
        console.log(`✅ Success with key ...${apiKey.slice(-6)}`);

        // Clean up the response - remove markdown code blocks if present
        text = text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
        text = text.replace(/^\s+|\s+$/g, '');

        try {
          const reviewData = JSON.parse(text);
          
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
            keyUsed: `...${apiKey.slice(-6)}`
          });
        } catch (parseError) {
          console.log('Parse error, trying to extract JSON:', parseError.message);
          
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const reviewData = JSON.parse(jsonMatch[0]);
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
                keyUsed: `...${apiKey.slice(-6)}`
              });
            } catch (e) {
              // Fall through to fallback
            }
          }
          
          return res.json({
            success: true,
            review: {
              summary: text.substring(0, 500),
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
        
        // Check if it's a rate limit error (429)
        if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('rate')) {
          markKeyError(apiKey);
          console.log(`⏳ Key ...${apiKey.slice(-6)} rate limited, rotating to next key...`);
          // Move to next key
          currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
          continue;
        }
        
        // For other errors, also try next key
        markKeyError(apiKey);
      }
      } // end of attempt loop
      
      // If we reach here, all keys in this cycle failed
      // Wait before trying again (unless this is the last cycle)
      if (waitCycle < maxWaitCycles) {
        const waitTime = 45 + (waitCycle * 20); // 45s, 65s, 85s - more time for rate limit reset
        console.log(`\n⏰ All keys exhausted. Auto-waiting ${waitTime} seconds before retry...`);
        
        // Reset key errors to give them another chance
        for (const key of API_KEYS) {
          keyErrorCount.set(key.trim(), 0);
          keyLastUsed.set(key.trim(), 0);
        }
        
        await sleep(waitTime * 1000);
      }
    } // end of waitCycle loop

    // All retries and wait cycles exhausted
    console.error('All API keys exhausted after all wait cycles:', lastError?.message);
    res.status(429).json({ 
      error: 'All API keys are rate limited even after waiting. Please try again in 1-2 minutes or add more API keys to .env file.',
      details: lastError?.message,
      keysAvailable: API_KEYS.length,
      suggestion: 'Create more free API keys at https://aistudio.google.com/app/apikey'
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
    apiKeysConfigured: API_KEYS.length,
    currentKeyIndex: currentKeyIndex
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`� API Keys loaded: ${API_KEYS.length}`);
  console.log(`�📋 API Health: http://localhost:${PORT}/api/health`);
});
