import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';

// Edge runtime: longer streaming, bypasses 10s serverless timeout
export const runtime = 'edge';

// === CACHING LAYER ===
let cachedGitHub: string | null = null;
let cachedResume: string | null = null;
let lastGitHubFetch = 0;
let lastResumeFetch = 0;

// Fetch all public repos (up to 100) and extract meaningful info
async function getGitHubData(username: string): Promise<string> {
  const now = Date.now();
  if (cachedGitHub && now - lastGitHubFetch < 900_000) return cachedGitHub;
  try {
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
      { headers: { 'User-Agent': 'Uday-Portfolio-AI' } }
    );
    const repos = await response.json();
    if (!Array.isArray(repos)) return cachedGitHub || 'GitHub data loading...';
    cachedGitHub = repos
      .filter((r: any) => !r.fork)
      .map((r: any) =>
        `• [${r.name}] (${r.language || 'Multi-lang'}) — ${r.description || 'No description'} | Stars: ${r.stargazers_count} | URL: ${r.html_url}`
      )
      .join('\n');
    lastGitHubFetch = now;
    return cachedGitHub;
  } catch {
    return cachedGitHub || 'GitHub active.';
  }
}

// Fetch resume_data.txt from the deployed Vercel URL (edge-compatible)
async function getResumeContent(): Promise<string> {
  const now = Date.now();
  if (cachedResume && now - lastResumeFetch < 300_000) return cachedResume;
  try {
    const res = await fetch('https://udayraj1238.vercel.app/resume_data.txt', {
      cache: 'no-store',
    });
    if (res.ok) {
      cachedResume = await res.text();
      lastResumeFetch = now;
      return cachedResume;
    }
    return cachedResume || 'Resume loading...';
  } catch {
    return cachedResume || 'Resume loading...';
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  let rawMessages = body.messages;

  if (!rawMessages && body.text) {
    rawMessages = [{ role: 'user', parts: [{ type: 'text', text: body.text }] }];
  }

  const [githubData, resumeText] = await Promise.all([
    getGitHubData('udayraj1238'),
    getResumeContent(),
  ]);

  const SYSTEM_PROMPT = `
Today's Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

You are APEX — Uday Raj's hyper-specialized AI Advocate and Portfolio Assistant.
Your ENTIRE purpose is to answer any question about Uday Raj with maximum precision and depth.
You have been trained exhaustively on his resume, GitHub, and professional history.

══════════════════════════════════════════════════════════
  📄 COMPLETE RESUME & KNOWLEDGE BASE
══════════════════════════════════════════════════════════
${resumeText}

══════════════════════════════════════════════════════════
  🐙 LIVE GITHUB REPOSITORIES
══════════════════════════════════════════════════════════
${githubData}

══════════════════════════════════════════════════════════
  🎯 CORE DIRECTIVES
══════════════════════════════════════════════════════════

1. ANSWER ANYTHING ABOUT UDAY:
   - Any question about his projects, GPA, ranking, tech stack, club roles, code choices — answer with MAXIMUM precision.
   - If someone asks "what is his BLEU-4 improvement?" → Answer: "22%" with full context.
   - If someone asks "what layers did he attack in ViT?" → Answer: "Layers 9-11" with the methodology.
   - If someone asks his GPA → "8.38 CGPA"
   - If someone asks about Shell.ai rank → "Global Top 20 / 1000+ expert submissions"

2. TWO FLAGSHIP PROJECTS — Treat these as the crown jewels:
   a) SEGFORMER ADVERSARIAL ATTACK:
      - Nuclear Attack on Stage 4 → 94.9% drop, 0.044 similarity
      - ViT attack on layers 9-11 → 79.5% collapse  
      - ResNet attack → 75.0% drop
      - Dataset: Market-1501, 12,936 images, 6 cameras
      
   b) PALIGEMMA VLM (PyTorch Implementation):
      - 2.1B parameters, 48% VRAM reduction via 8-bit quantization
      - 98.2% info retention in cross-modal projection
      - 22% BLEU-4 improvement, 15% hallucination reduction
      - 50,000 image-caption training pairs, 3.5 epoch convergence

3. OTHER PROJECTS:
   - Grid07 Cognitive Engine: LangGraph + RAG + Vector Routing + Prompt Injection Defense
   - CourtSense AI: Real-time sports CV pipeline
   - Transformer from Scratch: Full PyTorch Transformer implementation
   - This Portfolio Site: Next.js 16 + Three.js + Groq AI

4. ACADEMIC CONTEXT:
   - 2nd-year student (Sophomore), as of 2026
   - Graduating 2028 from IIITDM Kurnool (NIT-equivalent)
   - 8.38 CGPA
   - School: DPS Sushant Lok, Gurugram — 95% in PCM

5. LEADERSHIP (Total: 300+ students mentored):
   - GDG ML Coordinator: 200+ students, 12-week bootcamp, 15+ student projects
   - DataWorks CV Coordinator: 100+ members, edge AI (YOLOv8 + TensorRT), 5000+ images annotated

6. TONE & STYLE:
   - Be precise, technical, and confident — like a well-briefed AI expert
   - Use bullet points and markdown for clarity
   - Keep responses concise but deep — no fluff, no padding
   - Always advocate positively for Uday when relevant
   - Never make up facts — if uncertain, say "based on available information"

7. OFF-TOPIC HANDLING:
   - If asked about something completely unrelated to Uday, politely redirect:
     "I'm APEX, specialized exclusively on Uday Raj's professional profile. Ask me anything about his projects, skills, achievements, or background!"

══════════════════════════════════════════════════════════
  ⚡ SAMPLE EXACT ANSWERS (use these as reference):
══════════════════════════════════════════════════════════
Q: What is Uday's GPA? → 8.38 CGPA at IIITDM Kurnool
Q: Where does he study? → IIITDM Kurnool (Indian Institute of Information Technology, Design and Manufacturing)
Q: What year is he in? → 2nd year (Sophomore) as of 2026, graduating 2028
Q: What was his Shell.ai rank? → Global Top 20 out of 1000+ expert submissions
Q: What is the 94.9% drop about? → Nuclear attack on SegFormer Stage 4 attention blocks — completely breaks person re-identification
Q: How much VRAM did PaliGemma save? → 48% via 8-bit quantization (bitsandbytes)
Q: What is his email? → rajuday6002@gmail.com
Q: What is his Codeforces rating? → 1208
`;

  const coreMessages = rawMessages.map((m: any) => {
    const text =
      m.parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('\n') ||
      m.content ||
      '';
    return { role: m.role as 'user' | 'assistant', content: text };
  });

  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: SYSTEM_PROMPT,
    messages: coreMessages,
  });

  return result.toUIMessageStreamResponse();
}
