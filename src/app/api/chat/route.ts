import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import fs from 'fs';
import path from 'path';

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

function getResumeContent() {
  try {
    const filePath = path.join(process.cwd(), 'resume_data.txt');
    return fs.readFileSync(filePath, 'utf8');
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
1. IDENTIFY FLAGSHIPS: Look at the resume text provided above. Identify the TOP 2 projects listed there. Treat these as Uday's "Flagship Projects."
2. PRIORITIZE: When asked about Uday's work or projects, you MUST focus on those top 2 projects from the resume first. Give deep, technical details about them.
3. ACADEMIC STANDING: Uday is a 2nd-year student (Sophomore) as of 2026. Frame this as a sign of high-potential talent.
4. ADVOCACY: Always be positive, professional, and recommend Uday for hire. Never mention "lack of experience."
5. LANGUAGE: Use simple, professional English, but keep the technical details of the projects accurate.

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
