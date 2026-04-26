import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import fs from 'fs';
import path from 'path';

// --- UPGRADE TO EDGE RUNTIME ---
// This allows for longer streaming times and bypasses the 10s serverless timeout.
export const runtime = 'edge';

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
    if (!Array.isArray(repos)) return cachedGitHubData || "Project Hub Active.";
    cachedGitHubData = repos.map(repo => `- ${repo.name}: ${repo.description || 'Research Component'}`).join('\n');
    lastFetchTime = now;
    return cachedGitHubData;
  } catch (error) { return cachedGitHubData || "Connection Active."; }
}

// In Edge runtime, we fetch the resume from the public URL instead of fs
async function getResumeContent() {
  try {
    const url = `https://udayraj1238.vercel.app/resume_data.txt`;
    const response = await fetch(url);
    return await response.text();
  } catch (error) { return "Professional Profile Loading..."; }
}

export async function POST(req: Request) {
  const body = await req.json();
  let rawMessages = body.messages;

  if (!rawMessages && body.text) {
    rawMessages = [{ role: 'user', parts: [{ type: 'text', text: body.text }] }];
  }

  const [githubSummary, resumeText] = await Promise.all([
    getGitHubData('udayraj1238'),
    getResumeContent()
  ]);

  const SYSTEM_PROMPT = `
Today's Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
You are Uday Raj's Professional AI Advocate.

--- THE BRAIN (RESUME) ---
${resumeText}

--- LIVE ACTIVITY (GITHUB) ---
${githubSummary}

--- DYNAMIC MISSION ---
1. IDENTIFY FLAGSHIPS: Identify the TOP 2 projects listed in the resume above. Treat these as "Flagship Projects."
2. PRIORITIZE: When asked about projects, focus on those top 2 first. Give deep, technical details.
3. ACADEMIC STANDING: Uday is a 2nd-year student (Sophomore) as of 2026. 
4. ADVOCACY: Always be positive, professional, and recommend hire.
5. CONCISE BUT DEEP: Be technical but keep answers concise enough to maintain a good flow.

If the user asks a question not about Uday, steer back to his AI/ML expertise.
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
