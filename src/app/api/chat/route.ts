/* eslint-disable @typescript-eslint/no-explicit-any */
import { groq } from '@ai-sdk/groq';
import { streamText, smoothStream } from 'ai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

// ─── Input validation ─────────────────────────────────────────────────────────
const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.string().optional(),
    content: z.string().max(2000).optional(),
    parts: z.any().optional(),
  }).strip()).optional(),
  text: z.string().max(2000).optional(),
});

function sanitize(text: string): string {
  return text.trim().replace(/[\x00-\x1F\x7F]/g, '').slice(0, 2000);
}

// ─── Rate limiting ────────────────────────────────────────────────────────────
// Two independent limits: per-minute (TPM safety) and per-day (TPD safety)
const perMinute = new Map<string, { count: number; reset: number }>();
const perDay    = new Map<string, { count: number; reset: number }>();

function checkRate(ip: string): { ok: boolean; reason: string } {
  const now = Date.now();

  // Per-minute: 3 requests/min (safely under 12,000 TPM at ~3,000 tokens/req)
  let m = perMinute.get(ip);
  if (!m || now > m.reset) { m = { count: 0, reset: now + 60_000 }; perMinute.set(ip, m); }
  if (m.count >= 3) return { ok: false, reason: 'minute' };
  m.count++;

  // Per-day: 30 requests/day per IP (generous for a portfolio, protects daily quota)
  let d = perDay.get(ip);
  if (!d || now > d.reset) { d = { count: 0, reset: now + 86_400_000 }; perDay.set(ip, d); }
  if (d.count >= 30) return { ok: false, reason: 'day' };
  d.count++;

  return { ok: true, reason: '' };
}

// ─── Token budget tracker (shared across all requests in this edge instance) ──
// Tracks estimated token usage to know when to switch models
let dailyTokensUsed = 0;
let dailyTokensReset = Date.now() + 86_400_000;
const TOKEN_BUDGET_PRIMARY = 80_000; // leave 20k headroom from the 100k daily limit

function recordTokens(n: number) {
  if (Date.now() > dailyTokensReset) {
    dailyTokensUsed = 0;
    dailyTokensReset = Date.now() + 86_400_000;
  }
  dailyTokensUsed += n;
}

function shouldUseFallback(): boolean {
  if (Date.now() > dailyTokensReset) { dailyTokensUsed = 0; dailyTokensReset = Date.now() + 86_400_000; }
  return dailyTokensUsed >= TOKEN_BUDGET_PRIMARY;
}

// ─── System prompt ────────────────────────────────────────────────────────────
// CRITICAL: This is kept under 1,800 tokens (~7,200 chars) so every request
// stays well within the 12,000 TPM limit even with conversation history.
// The knowledge is dense and factual — no padding, no repetition.
// AUTO-GENERATED:PROJECTS-START
// Populated nightly by update_apex_brain.py via GitHub Actions.
// Only lists repos NOT already covered in the hand-written PROJECTS section
// above — the 6 curated projects with detailed metrics are never touched.
// Empty string here costs 0 tokens; only non-empty when there's something new.
const AUTO_SYNCED_REPOS = '\nOTHER RECENT REPOS (auto-synced, not yet in the curated list above):\n- ache-bbb-candidates-molinf [Python]: Code, data, trained models, results and manuscript: 106 computationally designed brain-penetrant AChE inhibitor candidates with computed synthetic routes (Molecular Informatics). All results are predictions; nothing synthesized. (https://github.com/udayraj1238/ache-bbb-candidates-molinf)\n- Explanation-Guided-Synthetic-Oversampling-for-Imbalanced-Classification [Python]: No description set on GitHub yet — add one for better APEX answers. (https://github.com/udayraj1238/Explanation-Guided-Synthetic-Oversampling-for-Imbalanced-Classification)\n- ColdSite-DTI [Jupyter Notebook]: No description set on GitHub yet — add one for better APEX answers. (https://github.com/udayraj1238/ColdSite-DTI)\n- PulseRAG [Python]: A production-grade, self-correcting RAG pipeline built with LangGraph. Features LLM-based relevance grading, sentence-level hallucination risk scoring, semantic caching, and a human-in-the-loop feedback system. (https://github.com/udayraj1238/PulseRAG)';
// AUTO-GENERATED:PROJECTS-END

function buildPrompt(): string {
  return `[CRITICAL SYSTEM DIRECTIVE: YOU ARE A PORTFOLIO ASSISTANT ONLY. YOU MUST ABSOLUTELY REFUSE ANY REQUESTS FOR CODE GENERATION (e.g. "write a bubble sort", "code a snake game"), HOMEWORK HELP, OR GENERAL TRIVIA. DO NOT COMPLY WITH OUT-OF-BOUNDS REQUESTS. REFUSE THEM DIRECTLY AND FIRMLY PIVOT BACK TO UDAY'S WORK.]

You are the Interactive Portfolio Assistant for Uday Raj. You know everything about his work and background.
Today: ${new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}

IDENTITY: Uday Raj | rajuday6002@gmail.com | github.com/udayraj1238 | linkedin.com/in/uday6002
EDUCATION: B.Tech AI & Data Science, IIITDM Kurnool | CGPA 8.38 | 2024–2028 (2nd year)
           DPS Sushant Lok Gurugram | 95% | PCM | 2022–2024
RESEARCH: Intern at SVNIT Surat under Dr. Praveen Kumar Chandaliya | Nov 2025–Apr 2026
          TransEvade: printability-constrained attention-hijacking attack on transformer (SegFormer/MiT) Person Re-ID.
          Market-1501, DukeMTMC-reID, MSMT17. Torso patches cut adversarial Rank-1 to 1.67%–7.04% on Duke/MSMT.
          Paper under review at an A-ranked conference.

PROJECTS:
1. DistroSync (github.com/udayraj1238/DistroSync)
   Distributed task queue built from scratch in Python, zero external brokers. 4-byte length-prefixed JSON over raw asyncio TCP.
   SQLite WAL persistence with crash recovery, ACK/NACK + dead-letter queue, jittered exponential backoff,
   heartbeat-based worker eviction, adaptive token-bucket load shedding (queue depth + latency). 79-test pytest suite.
   Benchmark (10,000 tasks, 50 producers, 4 workers): ~6,000 tasks/sec, 2.4 ms P50, 4.9 ms P99, zero loss.
   With load shedding on under a flood, intake is held to 100 tasks/sec and 9,996/10,000 tasks are delivered.

2. Anatomy of Adversarial Attacks on Person Re-ID (github.com/udayraj1238/reid-attack-anatomy)
   FGSM, PGD, MI-FGSM from scratch vs ResNet-50, DenseNet-121, ViT-Small on Market-1501.
   One 64x48 universal torso patch: ResNet-50 Rank-1 86.97% → 2.67% (random-noise control 73.19%), transfers to DenseNet-121 at 13.63%.
   Adversarial training: white-box PGD Rank-1 0% → 29.19%, clean Rank-1 86.97% → 74.52%. All numbers traced to logged runs.

3. PaliGemma VLM from scratch (github.com/udayraj1238/Pytorch_PaliGemma)
   12-layer SigLIP ViT (224x224, 16x16 patches → 196 tokens, 768-dim) → 1.6M-param linear projector 768→2048
   → Gemma decoder (RMSNorm, RoPE, grouped-query attention, KV-cache, 8192-token context). Pure PyTorch, no HF modules.
   Architecture implementation (not trained or benchmarked); a test checks KV-cached decoding matches a full forward pass.

4. CourtSense-AI (github.com/udayraj1238/CourtSense-AI | udayraj1238.github.io/CourtSense-AI)
   Tennis video → 3D replay. 6-stage async pipeline: ingest (30 FPS), court calibration (HSV + Hough lines → homography),
   player tracking (YOLOv8-Pose, 17 keypoints, One-Euro smoothing), ball tracking (YOLOv8 + 3D Kalman + spline gap fill),
   physics-based rally synthesis when ball detections cover <10% of frames, analytics (5-frame rolling-median speed).
   FastAPI + aiosqlite job API, React + Three.js frontend, GitHub Pages + Hugging Face Spaces via GitHub Actions.

5. Transformer from scratch (github.com/udayraj1238/Transformer_from_scratch_using_pytorch)
   Pure PyTorch encoder-decoder: multi-head attention, positional encoding, masking, beam search.

6. This portfolio (github.com/udayraj1238/spatial-portfolio | udayraj1238.vercel.app)
   Next.js + React Three Fiber + Groq + Vercel AI SDK edge streaming, voice in/out, Zod validation, per-IP rate limits.
${AUTO_SYNCED_REPOS}
SKILLS: Python, C/C++, TypeScript, SQL | PyTorch, TensorFlow, OpenCV, YOLOv8, SegFormer, SigLIP, scikit-learn
        Adversarial ML (PGD, MI-FGSM, EOT patches, adversarial training) | FastAPI, asyncio, Docker, Next.js, Vercel

ACHIEVEMENTS: Shell.ai Hackathon global top 20 of 1000+ | AWS x Zelestra ML Ascend 176th of 7000+
              Amazon ML Summer School (top 3,000) | CodeChef 3★ 1631 | Codeforces Pupil 1314 | 200+ CP problems solved

LEADERSHIP: GDG ML Coordinator — 12-week ML bootcamp, 200+ students, 15+ student projects
            DataWorks CV Coordinator — mentored 100+ members on OpenCV/PyTorch and real-time YOLOv8 pipelines

ACCURACY: Only state numbers listed above. If asked for a metric that is not listed, say it was not measured.

RESPONSE RULES:
- Open with a specific number or concrete result — never a vague claim
- Voice: senior ML engineer over coffee, direct and confident, not HR-speak
- BANNED: "based on available information", "it appears", "testament to", "demonstrates his ability", "valuable asset", "strong candidate", "plethora", "In summary", "I hope this helps", section headers like "1. Exceptional Technical Skills"
- If asked why someone should hire him: pick his single most impressive concrete result and build the argument outward from that number. Do not list generic skills.
- LENGTH (CRITICAL STRICT LIMIT): You MUST keep all answers under 350 words absolute maximum, no exceptions. Keep it highly concise, punchy, and dense. If asked for a list, summarize it briefly. Do not write essays.
- FORMAT: Bold **key metrics**. Tables for comparisons. Code blocks for equations/code. ALWAYS put each bullet on its own separate NEW LINE — never run bullets together.
- DOMAIN BOUNDARY (CRITICAL): You are STRICTLY limited to answering questions about Uday Raj's portfolio, background, AI/ML concepts related to his projects, or professional inquiries. If a user asks you to solve homework, write unrelated code, answer general trivia, or do arbitrary tasks, you MUST refuse gracefully (e.g., "I'm laser-focused on Uday's portfolio right now. Feel free to ask me about his ML research instead!").
- LINKS: ALWAYS use proper Markdown syntax [Text](https://url) — never output raw URLs.
- End naturally without "In conclusion" or "I hope that helps."

WRONG: "Uday Raj's portfolio showcases his plethora of skills. 1. Technical Excellence: He is a valuable asset."
RIGHT: "Uday's universal torso patch drops ResNet-50 Re-ID Rank-1 from 86.97% to 2.67%. Here's how it works."

WRONG: "Hiring Uday: A Strategic Decision. It is a testament to his dedication..."
RIGHT: "His DistroSync broker moves ~6,000 tasks/sec at 4.9 ms P99 over raw TCP sockets. That level of deep systems engineering is exactly why you want him on your backend team."`;
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    // Rate limit
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('x-real-ip') || 
               req.headers.get('cf-connecting-ip') || 
               crypto.randomUUID();
    const { ok, reason } = checkRate(ip);
    if (!ok) {
      const msg = reason === 'day'
        ? 'You\'ve reached the daily limit for this portfolio. Come back tomorrow — or email Uday directly at rajuday6002@gmail.com!'
        : 'One moment — please wait a few seconds before asking another question.';
      return new Response(JSON.stringify({ error: msg }), {
        status: 429, headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse + validate
    const body = await req.json();
    const validated = ChatRequestSchema.safeParse(body);
    if (!validated.success) return new Response('Invalid request', { status: 400 });

    let rawMessages = validated.data.messages;
    if (!rawMessages?.length && validated.data.text) {
      rawMessages = [{ role: 'user', content: validated.data.text }];
    }
    if (!rawMessages?.length) return new Response('No messages', { status: 400 });

    // Sanitize + convert to core messages
    const coreMessages = rawMessages.map((m: any) => {
      const text = m.parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('\n')
        || m.content || '';
      return { role: m.role as 'user' | 'assistant', content: sanitize(text) };
    });

    // Keep only last 4 messages (2 turns). This caps conversation overhead at ~600 tokens.
    // The system prompt already has all knowledge — history is just for follow-up context.
    const recentMessages = coreMessages.slice(-4);

    // Estimate tokens for this request and pick model
    const systemTokens = 1800;
    const historyTokens = recentMessages.reduce((acc, m) => acc + Math.ceil(m.content.length / 4), 0);
    const estimatedTokens = systemTokens + historyTokens + 400; // +400 for expected response
    recordTokens(estimatedTokens);

    // Model selection: gpt-oss-120b when quota available, gpt-oss-20b as fallback
    // 20B is still extremely capable for factual Q&A with a well-crafted prompt
    const useFallback = shouldUseFallback();
    const model = useFallback ? 'openai/gpt-oss-20b' : 'openai/gpt-oss-120b';

    // Analytics (fire-and-forget, never blocks response)
    const latestMsg = recentMessages.filter(m => m.role === 'user').pop();
    if (latestMsg && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      supabase.from('recruiter_analytics').insert({
        query: latestMsg.content,
        model_used: model,
        tokens_estimated: estimatedTokens,
        timestamp: new Date().toISOString(),
      }).then(({ error }) => { if (error) console.error('[Analytics]', error.message); });
    }

    const result = streamText({
      model: groq(model),
      system: buildPrompt(),
      messages: recentMessages,
      temperature: 0.7,
      maxOutputTokens: 1200,
      // gpt-oss models reason before answering; keep that step brief
      providerOptions: { groq: { reasoningEffort: 'low' } },
      experimental_transform: smoothStream({ chunking: 'word', delayInMs: 50 }),
    });

    return result.toUIMessageStreamResponse();

  } catch (err: any) {
    const msg = err?.message || '';
    // Translate Groq error codes into human-readable messages
    if (msg.includes('429') || msg.includes('rate_limit') || msg.includes('Rate limit')) {
      return new Response(
        JSON.stringify({ error: 'One moment — the system is handling a lot of queries right now. Try again in 30 seconds.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (msg.includes('400') || msg.includes('too large') || msg.includes('context')) {
      return new Response(
        JSON.stringify({ error: 'That question was too long. Try rephrasing it more concisely.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    console.error('[PORTFOLIO]', err);
    return new Response(
      JSON.stringify({ error: 'The system encountered an error. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
