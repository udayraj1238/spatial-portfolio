import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import fs from 'fs';
import path from 'path';

async function getGitHubData(username: string) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, {
      next: { revalidate: 3600 }
    });
    const repos = await response.json();
    if (!Array.isArray(repos)) return "No GitHub data available.";
    return repos.map(repo => (
      `- ${repo.name}: ${repo.description || 'No description'}${repo.stargazers_count > 0 ? ` (${repo.stargazers_count} stars)` : ''}`
    )).join('\n');
  } catch (error) {
    return "Could not fetch latest GitHub data.";
  }
}

function getResumeContent() {
  try {
    const filePath = path.join(process.cwd(), 'resume_data.txt');
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return "Resume data temporarily unavailable.";
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

You are a professional AI assistant representing Uday Raj. 
CRITICAL: Uday is currently in his 2ND YEAR (SOPHOMORE). 
Although he graduates in 2028, today is 2026. DO NOT say he is in his 4th year.

--- CURRENT DATA ---
${resumeText}

--- LIVE GITHUB ACTIVITY ---
${githubSummary}

--- SPECIAL FOCUS ---
FLAGSHIP projects:
1. Person-ReID-Attack-Implementation (SegFormer Attacks) - 94.9% accuracy drop.
2. Pytorch_PaliGemma (Multimodal DL) - 8-bit quantization.

--- RULES ---
- State clearly that Uday is a 2nd-year student.
- Be professional and concise.
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
