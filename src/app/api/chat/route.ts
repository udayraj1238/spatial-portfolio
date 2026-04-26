import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import fs from 'fs';
import path from 'path';

// Helper to fetch GitHub data live
async function getGitHubData(username: string) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, {
      next: { revalidate: 3600 } // Cache for 1 hour
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

// Helper to read the resume file
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

  if (!process.env.GROQ_API_KEY) {
    return new Response(JSON.stringify({ error: "API Key missing" }), { status: 500 });
  }

  // Fetch all data dynamically
  const [githubSummary, resumeText] = await Promise.all([
    getGitHubData('udayraj1238'),
    getResumeContent()
  ]);

  const SYSTEM_PROMPT = `
Today's Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

You are a professional AI assistant representing Uday Raj. 
Your goal is to answer questions using the LATEST data provided below.

--- CURRENT RESUME DATA ---
${resumeText}

--- LATEST GITHUB ACTIVITY (LIVE) ---
${githubSummary}

--- SPECIAL FOCUS ---
Your absolute FLAGSHIP projects are:
1. Person-ReID-Attack-Implementation (SegFormer Attacks) - Focus on the "Nuclear" 94.9% accuracy drop.
2. Pytorch_PaliGemma (Multimodal DL) - Focus on 8-bit quantization and BLEU-4 improvement.

--- RULES ---
- Always prioritize the Flagship projects in descriptions.
- Use the current date to calculate Uday's year (Started 2024, Graduating 2028).
- Be professional, concise, and technically accurate.
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
