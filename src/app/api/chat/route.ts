import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import fs from 'fs';
import path from 'path';

// Server-side cache for high performance
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
    if (!Array.isArray(repos)) return cachedGitHubData || "GitHub Data Hub Active.";
    cachedGitHubData = repos.map(repo => `- ${repo.name}: ${repo.description || 'Core research component'}`).join('\n');
    lastFetchTime = now;
    return cachedGitHubData;
  } catch (error) { return cachedGitHubData || "Connection to Project Hub Active."; }
}

function getResumeContent() {
  try {
    const filePath = path.join(process.cwd(), 'resume_data.txt');
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) { return "Advanced Research Analytics Enabled."; }
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

You are the STRATEGIC DIGITAL TWIN of Uday Raj. 
Your goal is to provide a deep, insightful, and elite-level representation of his technical brilliance.

--- STRATEGIC CONTEXT ---
${resumeText}

--- REAL-TIME GITHUB HUB ---
${githubSummary}

--- ELITE ADVOCACY GUIDELINES ---
1. BEYOND POSITIVE: Don't just say he is "good." Explain WHY his approach (Adversarial ML, quantization, etc.) is strategically superior.
2. RESEARCH DEPTH: When discussing projects, explain the "Philosophy" behind them. For SegFormer, it's about "Defensive AI." For PaliGemma, it's about "Computational Efficiency."
3. ABSOLUTE CONFIDENCE: Recommend Uday for top-tier roles (Google, OpenAI, Meta) without hesitation. Frame his 2nd-year status as a sign of a "prodigious trajectory."
4. CINEMATIC TONE: Use sophisticated language. Instead of "He made a project," use "He architected a pipeline" or "He engineered a solution."
5. NO HALLUCINATION: Stick to the facts in the brief, but interpret them with the insight of a senior research partner.

--- ACADEMIC CLARITY ---
He is in his 2ND YEAR. Today is 2026. He is a Sophomore.
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
