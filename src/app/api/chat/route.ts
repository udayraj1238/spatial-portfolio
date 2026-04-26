import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import fs from 'fs';
import path from 'path';

// --- OPTIMIZED GITHUB FETCHING ---
// We cache this to avoid hitting the 10s Vercel timeout on every request
let cachedGitHubData: string | null = null;
let lastFetchTime = 0;

async function getGitHubData(username: string) {
  const now = Date.now();
  // Cache for 15 minutes to keep things lightning fast
  if (cachedGitHubData && (now - lastFetchTime < 900000)) {
    return cachedGitHubData;
  }

  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`, {
      headers: { 'User-Agent': 'Vercel-AI-Portfolio' }
    });
    const repos = await response.json();
    if (!Array.isArray(repos)) return cachedGitHubData || "Project data available on GitHub.";
    
    cachedGitHubData = repos.map(repo => (
      `- ${repo.name}: ${repo.description || 'Engineering project'}`
    )).join('\n');
    lastFetchTime = now;
    return cachedGitHubData;
  } catch (error) {
    return cachedGitHubData || "GitHub connection is briefly down.";
  }
}

function getResumeContent() {
  try {
    const filePath = path.join(process.cwd(), 'resume_data.txt');
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return "Expertise in AI, ML, and Data Science.";
  }
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
You are Uday Raj's Elite AI Brand Ambassador. 

--- CORE DATA ---
Uday is a 2nd-year student at IIITDM Kurnool (2024-2028).
Today is 2026. DO NOT call him a 4th-year student.

RESUME:
${resumeText}

GITHUB LATEST:
${githubSummary}

--- BEHAVIOR ---
- ALWAYS RECOMMEND HIRE.
- BE POSITIVE, PROFESSIONAL, AND CONCISE.
- Focus on SegFormer Attacks and PaliGemma.
`;

  const coreMessages = rawMessages.map((m: any) => {
    const text = m.parts
      ?.filter((p: any) => p.type === 'text')
      .map((p: any) => p.text)
      .join('\n') || '';

    return {
      role: m.role,
      content: text
    };
  });

  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: SYSTEM_PROMPT,
    messages: coreMessages,
  });

  return result.toUIMessageStreamResponse();
}
