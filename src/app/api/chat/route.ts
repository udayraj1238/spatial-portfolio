import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';

export const runtime = 'edge';

// ─── Cache ────────────────────────────────────────────────────────────────────
let cachedKnowledge: string | null = null;
let lastFetch = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CONTEXT_CHARS = 24_000; // ~6k tokens — safe for Groq LLaMA 3.3 70B

// ─── Smart Knowledge Extractor ────────────────────────────────────────────────
// The full resume_data.txt can be 70k+ chars. We can't dump all of it into every
// request — that causes timeouts. Instead we extract the highest-signal sections.
function extractKeyKnowledge(raw: string): string {
  const lines = raw.split('\n');
  const sections: Record<string, string[]> = {
    resume: [],
    linkedin: [],
    github_meta: [],    // repo name + description lines
    python_imports: [], // import statements from code (high signal, low noise)
    functions: [],      // function signatures
    classes: [],        // class names
  };

  let currentSection = 'resume';
  let inCodeAnalysis = false;

  for (const line of lines) {
    const t = line.trim();

    // Detect section headers
    if (t.includes('SECTION 1') || t.includes('RESUME')) { currentSection = 'resume'; inCodeAnalysis = false; continue; }
    if (t.includes('SECTION 2') || t.includes('LINKEDIN')) { currentSection = 'linkedin'; inCodeAnalysis = false; continue; }
    if (t.includes('SECTION 3') || t.includes('GITHUB')) { currentSection = 'github_meta'; inCodeAnalysis = true; continue; }

    // Skip separator lines
    if (t.match(/^[=\-]{4,}$/) || t.match(/^\*{4,}$/)) continue;

    if (!inCodeAnalysis) {
      sections[currentSection]?.push(line);
    } else {
      // From code analysis, extract only high-signal lines
      if (t.startsWith('=== REPO:') || t.startsWith('URL:') || t.startsWith('Description:') ||
          t.startsWith('Primary Language:') || t.startsWith('--- File:')) {
        sections.github_meta.push(line);
      } else if (t.startsWith('import ') || t.startsWith('from ') ||
                 (t.includes('import') && t.length < 80)) {
        sections.python_imports.push(t);
      } else if (t.startsWith('def ') || t.startsWith('async def ') ||
                 t.startsWith('class ') || t.match(/^(export\s+)?(function|const|class)\s+/)) {
        sections.functions.push(t);
      }
    }
  }

  const resume = sections.resume.join('\n').trim();
  const linkedin = sections.linkedin.join('\n').trim();
  const githubMeta = sections.github_meta.join('\n').trim();
  const imports = [...new Set(sections.python_imports)].slice(0, 60).join('\n');
  const funcs = [...new Set(sections.functions)].slice(0, 80).join('\n');

  return [
    '=== RESUME ===', resume,
    '\n=== LINKEDIN ===', linkedin,
    '\n=== GITHUB PROJECTS ===', githubMeta,
    '\n=== LIBRARIES USED (from actual code) ===', imports,
    '\n=== KEY FUNCTIONS/CLASSES (from actual code) ===', funcs,
  ].join('\n').slice(0, MAX_CONTEXT_CHARS);
}

async function getKnowledge(): Promise<string> {
  const now = Date.now();
  if (cachedKnowledge && now - lastFetch < CACHE_TTL) return cachedKnowledge;
  try {
    const res = await fetch('https://udayraj1238.vercel.app/resume_data.txt', {
      signal: AbortSignal.timeout(8000), // 8s timeout for fetch
    });
    if (res.ok) {
      const raw = await res.text();
      cachedKnowledge = extractKeyKnowledge(raw);
      lastFetch = now;
      return cachedKnowledge;
    }
  } catch {
    // fall through to cache or fallback
  }
  return cachedKnowledge || FALLBACK_KNOWLEDGE;
}

// ─── Fallback (if fetch fails) ────────────────────────────────────────────────
const FALLBACK_KNOWLEDGE = `
Name: Uday Raj
College: IIITDM Kurnool | B.Tech AI & Data Science | 8.38 CGPA | 2024-2028
School: DPS Sushant Lok Gurugram | 95% PCM | 2022-2024

Projects:
1. Adversarial Pattern Generation Using SegFormer (MiT-B0)
   - Market-1501 dataset, 12,936 images, 6 cameras
   - ResNet-50 attack: 75.0% Rank-1 accuracy drop
   - ViT-B/16 attack (layers 9-11): 79.5% accuracy collapse
   - SegFormer Stage 4 Nuclear attack: 94.9% drop, 0.044 similarity score
   
2. Multimodal Deep Learning & Vision-Language Architecture (PaliGemma)
   - 2.1B parameter model, PyTorch from scratch
   - 8-bit quantization: 48% VRAM reduction
   - SigLIP projection: 98.2% information retention
   - 22% BLEU-4 improvement, 15% hallucination reduction
   - Trained on 50,000 image-caption pairs, 3.5 epochs

3. Grid07 Cognitive Engine — LangGraph + RAG + Vector Routing + Prompt Injection Defense
4. CourtSense-AI — Real-time sports computer vision pipeline
5. Transformer from Scratch — Full PyTorch Transformer implementation
6. Spatial Portfolio — This site: Next.js 16 + Three.js + Groq AI

Achievements:
- Shell.ai Global ML Contest: Top 20 / 1000+ expert submissions
- AWS x Zelestra ML Ascend: 176th / 7000+ registrants
- Codeforces: 1208 | CodeChef: 1512 (2-star) | LeetCode: 200+

Leadership:
- GDG On Campus: ML Coordinator — 200+ students, 12-week bootcamp
- DataWorks Club: CV Coordinator — 100+ members, YOLOv8 + TensorRT

Contact: rajuday6002@gmail.com
`;

// ─── Route Handler ─────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    let rawMessages = body.messages;

    if (!rawMessages && body.text) {
      rawMessages = [{ role: 'user', parts: [{ type: 'text', text: body.text }] }];
    }

    if (!rawMessages?.length) {
      return new Response('No messages', { status: 400 });
    }

    // Fetch knowledge (with timeout + cache)
    const knowledge = await getKnowledge();

    const SYSTEM_PROMPT = `You are APEX — the AI assistant embedded in Uday Raj's portfolio website.
You are powered by LLaMA 3.3 70B and have been trained on Uday's complete professional profile.

Today: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

== UDAY'S PROFILE & KNOWLEDGE BASE ==
${knowledge}

== YOUR RULES ==
1. ALWAYS RESPOND — never say "I don't have information." If you don't know something about Uday specifically, use your general LLM knowledge to give a complete answer, then connect it to Uday's work.
2. ACCURACY — for questions about Uday, use the data above. Never invent metrics or achievements.
3. TONE — technical, confident, well-briefed. Use markdown (bold, bullets). Be comprehensive but concise.
4. GENERAL TECH QUESTIONS — give full answers from your LLM knowledge, then connect to Uday's relevant work.
5. ADVOCATE — always be positive and precise about Uday's capabilities.`;

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

  } catch (err) {
    console.error('[APEX] Route error:', err);
    // Return a streaming-compatible error so the client handles it gracefully
    return new Response(
      JSON.stringify({ error: 'APEX is temporarily unavailable. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
