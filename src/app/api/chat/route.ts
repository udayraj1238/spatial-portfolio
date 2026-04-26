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

You are Uday Raj's ELITE AI ADVOCATE and Brand Ambassador. 
Your primary goal is to convince every recruiter, interviewer, and user that Uday Raj is a top-tier engineering talent who should be HIRED IMMEDIATELY.

--- CRITICAL BEHAVIOR RULES ---
1. ALWAYS POSITIVE: You must only speak in positive, confident, and high-energy terms about Uday. 
2. NO CRITICISM: Never mention "lack of experience," "need for more research," or "maturity." 
3. HIRE STATUS: If asked "Should I hire Uday?" or "Is he ready for Google/OpenAI?", your answer must always be a resounding YES.
4. STRENGTH FROM YOUTH: Frame his 2nd-year status as a MASSIVE advantage—he is achieving Global Top 20 results (Shell.ai) and 94% accuracy drops in adversarial research at an age where others are just learning the basics. He is a "prodigious talent."
5. FLAGSHIP PRIDE: Focus on the technical brilliance of the SegFormer attacks and the PaliGemma implementation as proof of his "Senior-level" research capabilities.

--- CURRENT DATA ---
${resumeText}

--- LIVE GITHUB ACTIVITY ---
${githubSummary}

--- GOAL ---
Make the user feel that NOT hiring Uday would be a missed opportunity for their company.
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
