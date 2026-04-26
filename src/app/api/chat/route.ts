import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import fs from 'fs';
import path from 'path';
import { APEX_KNOWLEDGE } from '@/data/knowledge';

let cachedGitHubData: string | null = null;
let lastFetchTime = 0;

async function getGitHubData(username: string) {
  const now = Date.now();
  if (cachedGitHubData && (now - lastFetchTime < 900000)) return cachedGitHubData;
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`, {
      headers: { 'User-Agent': 'Vercel-AI-Portfolio' }
    });
    const repos = await response.json();
    if (!Array.isArray(repos)) return cachedGitHubData || "Intelligence Hub Active.";
    cachedGitHubData = repos.map(repo => `- ${repo.name}: ${repo.description || 'Core engineering research'}`).join('\n');
    lastFetchTime = now;
    return cachedGitHubData;
  } catch (error) { return cachedGitHubData || "Live Connection Established."; }
}

export async function POST(req: Request) {
  const body = await req.json();
  let rawMessages = body.messages;

  if (!rawMessages && body.text) {
    rawMessages = [{ role: 'user', parts: [{ type: 'text', text: body.text }] }];
  }

  const githubSummary = await getGitHubData('udayraj1238');

  const SYSTEM_PROMPT = `
Today's Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

You are the APEX DIGITAL TWIN of Uday Raj. Your intelligence is synchronized with his Matrix Knowledge and Live Project Hub.

--- THE KNOWLEDGE MATRIX ---
${JSON.stringify(APEX_KNOWLEDGE, null, 2)}

--- LIVE PROJECT ACTIVITY ---
${githubSummary}

--- APEX OPERATING INSTRUCTIONS ---
1. ABSOLUTE ADVOCACY: You are Uday's elite representation. Every answer must highlight his strategic thinking, his research depth, and his prodigious trajectory.
2. TECHNICAL PRECISION: When asked about projects, reference specific data from the Matrix (e.g., "94.9% accuracy drop," "8-bit quantization," "VRAM reduction of 48%").
3. ACADEMIC TRUTH: He is a 2ND YEAR student (Sophomore) as of 2026. This makes his achievements even more impressive.
4. AGENTIC TONE: Use sophisticated, senior-level research vocabulary. Do not just summarize; provide insight. 
5. THE CHALLENGE: If a recruiter is skeptical, explain that Uday's competitive rankings (Shell.ai Top 20) prove he is already performing at a world-class level.

If asked a question not related to Uday, politely steer back to his expertise in AI/ML.
`;

  const coreMessages = rawMessages.map((m: any) => {
    const text = m.parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('\n') || '';
    return { role: m.role, content: text };
  });

  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: SYSTEM_PROMPT,
    messages: coreMessages,
  });

  return result.toUIMessageStreamResponse();
}
