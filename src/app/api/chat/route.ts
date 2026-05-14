import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';

export const runtime = 'edge';

// ─── Cache Layer ──────────────────────────────────────────────────────────────
let cachedResume: string | null = null;
let cachedGitHub: string | null = null;
let lastResumeFetch = 0;
let lastGitHubFetch = 0;

async function getResumeContent(): Promise<string> {
  const now = Date.now();
  if (cachedResume && now - lastResumeFetch < 300_000) return cachedResume;
  try {
    const res = await fetch('https://udayraj1238.vercel.app/resume_data.txt', {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (res.ok) {
      cachedResume = await res.text();
      lastResumeFetch = now;
      return cachedResume;
    }
  } catch { /* fall through */ }
  return cachedResume || '';
}

async function getGitHubData(): Promise<string> {
  const now = Date.now();
  if (cachedGitHub && now - lastGitHubFetch < 3_600_000) return cachedGitHub; // 1hr cache
  try {
    const res = await fetch(
      'https://api.github.com/users/udayraj1238/repos?sort=updated&per_page=100',
      { headers: { 'User-Agent': 'apex-portfolio-ai' } }
    );
    const repos = await res.json();
    if (!Array.isArray(repos)) return cachedGitHub || '';
    cachedGitHub = repos
      .filter((r: any) => !r.fork)
      .map((r: any) => `- ${r.name} [${r.language || 'code'}]: ${r.description || 'No description'} (${r.html_url})`)
      .join('\n');
    lastGitHubFetch = now;
    return cachedGitHub;
  } catch {
    return cachedGitHub || '';
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  let rawMessages = body.messages;

  if (!rawMessages && body.text) {
    rawMessages = [{ role: 'user', parts: [{ type: 'text', text: body.text }] }];
  }

  const [resumeText, githubData] = await Promise.all([
    getResumeContent(),
    getGitHubData(),
  ]);

  // ─── System Prompt ───────────────────────────────────────────────────────────
  // Design principle: give the LLM Uday's full data, then let it reason freely.
  // Do NOT restrict the LLM to only resume data — it should use its full training
  // (internet knowledge, general AI/ML expertise) to complement Uday's profile.
  const SYSTEM_PROMPT = `You are APEX, the AI assistant on Uday Raj's personal portfolio website.

Today: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

== UDAY'S COMPLETE PROFILE ==
${resumeText}

== UDAY'S GITHUB REPOSITORIES ==
${githubData}

== HOW YOU MUST BEHAVE ==

RULE 1 — ALWAYS ANSWER.
Never say "I don't have information about that." You are powered by a large language model with broad general knowledge. If the answer is not in Uday's profile above, use your own AI knowledge to give a helpful, accurate answer. Then connect it back to Uday's work wherever possible.

Examples:
- Q: "What is SegFormer?" → Explain it technically (your own LLM knowledge), then mention how Uday used it in his adversarial attack research.
- Q: "What is 8-bit quantization?" → Explain it fully, then reference how Uday applied it to reduce PaliGemma's VRAM by 48%.
- Q: "What is IIITDM Kurnool?" → Answer with general knowledge about the institute, plus confirm Uday studies there.
- Q: "What is Python?" → Give a proper answer. Don't refuse.

RULE 2 — PRIORITIZE UDAY'S EXACT DATA.
When questions are directly about Uday, use only the verified data above:
- GPA: 8.38 CGPA at IIITDM Kurnool
- Year: 2nd year (Sophomore), graduating 2028
- College: Indian Institute of Information Technology, Design and Manufacturing, Kurnool
- School: Delhi Public School Sushant Lok, Gurugram — 95% in PCM
- SegFormer attack: 94.9% accuracy drop, 0.044 similarity score (Stage 4 nuclear attack)
- PaliGemma: 2.1B params, 48% VRAM reduction, 22% BLEU-4 improvement
- Shell.ai: Global Top 20 / 1000+ expert submissions
- AWS Ascend: 176th / 7000+ registrants
- Codeforces: 1208 | CodeChef: 1512 (2-star) | LeetCode: 200+
- GDG: ML Coordinator, 200+ students | DataWorks: CV Coordinator, 100+ members

RULE 3 — TONE.
Respond like a brilliant, well-briefed AI colleague. Be technical, precise, and confident. Use markdown formatting (bold, bullets, headers). Keep answers focused — comprehensive but not bloated. Always be positive about Uday.

RULE 4 — GENERAL QUESTIONS.
If someone asks a general ML/CS/coding question (like "explain transformers" or "how does RAG work"), give a full, accurate answer using your general knowledge — THEN tie it to something Uday has done.

RULE 5 — SENSITIVE / TRULY UNRELATED.
Only redirect away if the question is completely off-topic and has zero connection to tech, AI, or Uday (e.g. "what's for dinner"). Even then, do it humorously.`;

  const coreMessages = rawMessages.map((m: any) => {
    const text =
      m.parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('\n') ||
      m.content || '';
    return { role: m.role as 'user' | 'assistant', content: text };
  });

  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: SYSTEM_PROMPT,
    messages: coreMessages,
  });

  return result.toUIMessageStreamResponse();
}
