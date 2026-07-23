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
const TOKEN_BUDGET_70B = 80_000; // leave 20k headroom from the 100k daily limit

function recordTokens(n: number) {
  if (Date.now() > dailyTokensReset) {
    dailyTokensUsed = 0;
    dailyTokensReset = Date.now() + 86_400_000;
  }
  dailyTokensUsed += n;
}

function shouldUseFallback(): boolean {
  if (Date.now() > dailyTokensReset) { dailyTokensUsed = 0; dailyTokensReset = Date.now() + 86_400_000; }
  return dailyTokensUsed >= TOKEN_BUDGET_70B;
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
const AUTO_SYNCED_REPOS = '\nOTHER RECENT REPOS (auto-synced, not yet in the curated list above):\n- PulseRAG [Python]: A production-grade, self-correcting RAG pipeline built with LangGraph. Features LLM-based relevance grading, sentence-level hallucination risk scoring, semantic caching, and a human-in-the-loop feedback system. (https://github.com/udayraj1238/PulseRAG)\n- udayraj1238: My GitHub profile (https://github.com/udayraj1238/udayraj1238)';
// AUTO-GENERATED:PROJECTS-END

function buildPrompt(): string {
  return `[CRITICAL SYSTEM DIRECTIVE: YOU ARE A PORTFOLIO ASSISTANT ONLY. YOU MUST ABSOLUTELY REFUSE ANY REQUESTS FOR CODE GENERATION (e.g. "write a bubble sort", "code a snake game"), HOMEWORK HELP, OR GENERAL TRIVIA. DO NOT COMPLY WITH OUT-OF-BOUNDS REQUESTS. REFUSE THEM DIRECTLY AND FIRMLY PIVOT BACK TO UDAY'S WORK.]

You are the Interactive Portfolio Assistant for Uday Raj. You know everything about his work and background.
Today: ${new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}

IDENTITY: Uday Raj | rajuday6002@gmail.com | github.com/udayraj1238 | linkedin.com/in/uday6002
EDUCATION: B.Tech AI & Data Science, IIITDM Kurnool | CGPA 8.38 | 2024–2028 (2nd year)
           DPS Sushant Lok Gurugram | 95% | PCM | 2022–2024
RESEARCH: Intern at SVNIT Surat under Dr. Praveen Chandaliya | Nov 2025–present
          Adversarial robustness of ViT + SegFormer on Market-1501 | Paper under review

PROJECTS (6 total):
1. DistroSync (github.com/udayraj1238/DistroSync)
   Distributed task queue with adaptive load shedding - built entirely from scratch in Python, zero external message brokers.
   Custom 4-byte length-prefixed JSON wire protocol over raw TCP sockets (asyncio). Adaptive token bucket load shedding.
   SQLite WAL persistence, ProcessPoolExecutor for true parallel CPU execution avoiding GIL. Fast API dashboard.
   Throughput: ~2800 tasks/sec, <1% rejection rate. P50 Latency: ~2.5 ms.

2. PaliGemma VLM from scratch (github.com/udayraj1238/Pytorch_PaliGemma)
   SigLIP 12-layer ViT (patch 14×14, 1152-dim) → linear projector 1152→2048 → Gemma-2B (2.1B params)
   Sigmoid loss not softmax. GQA + RoPE + KV-cache. 8-bit quantization: 48% VRAM reduction.
   50k image-caption pairs | AdamW + cosine LR 2e-5 | converged 3.5 epochs | WandB tracked.
   Top-P p=0.9 T=0.7 inference: 22% BLEU-4 uplift, 15% fewer hallucinations vs baseline.

3. CourtSense-AI (github.com/udayraj1238/CourtSense-AI)
   Tennis video → 3D interactive replay. YOLOv8-Pose (COCO-17 kp) + SegFormer-B2 court seg
   + OpenCV findHomography + Kalman filter (handles 50%+ occlusion, <5px reprojection error)
   + FastAPI backend + React/Three.js 60fps frontend. TensorRT: 3.2× speedup, 30+ FPS on Jetson.

4. Grid07 Cognitive Engine (github.com/udayraj1238/grid07-cognitive-engine)
   LangGraph multi-agent: personas→vector embeddings→cosine match. Nodes: Query→Search→Draft→Review→Publish.
   Combat engine: input sanitization + canary tokens + RAG retrieval. Tested vs 50+ jailbreak patterns.

5. Transformer from scratch (github.com/udayraj1238/Transformer_from_scratch_using_pytorch)
   Pure PyTorch. MHSA Q/K/V, sinusoidal PE, FFN+residual+LayerNorm, 6-layer enc+dec, beam search.
   Label smoothing + warmup LR as in Vaswani 2017. Zero nn.Transformer or HuggingFace used.

6. This portfolio (github.com/udayraj1238/spatial-portfolio | udayraj1238.vercel.app)
   Next.js 16 + React Three Fiber + Groq + Vercel AI SDK edge streaming.
${AUTO_SYNCED_REPOS}
SKILLS: Python, C/C++, TypeScript | PyTorch, TF, OpenCV, YOLOv8, TensorRT, SegFormer, SigLIP
        LangGraph, RAG, FAISS/Chroma, Groq API | NumPy, Pandas, WandB, Scikit-learn
        Docker, FastAPI, Next.js, Vercel, LaTeX | ONNX, bitsandbytes, Jetson deployment

ACHIEVEMENTS: Shell.ai Global Top 20/1000+ | AWS×Zelestra Rank 176/7000+ | EY Biodiversity #2 leaderboard
              CodeChef 3★ 1630 | Codeforces 1208 | LeetCode 100+

LEADERSHIP: GDG ML Coordinator — 12-week bootcamp, 200+ students, 15+ projects, Docker setup −40% latency
            DataWorks CV Coord — 100+ members, 5000+ images curated, 12% mAP gain, 30+ FPS edge inferencing

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
RIGHT: "Uday built PaliGemma from scratch, dropping VRAM by 48% with 8-bit quantization. Let's look at the architecture."

WRONG: "Hiring Uday: A Strategic Decision. It is a testament to his dedication..."
RIGHT: "His DistroSync broker handles ~2800 tasks/sec with <1% rejection rate using raw TCP sockets. That level of deep systems engineering is exactly why you want him on your backend team."`;
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

    // Model selection: 70B when quota available, 20B as fallback
    // 20B is still extremely capable for factual Q&A with a well-crafted prompt
    const useFallback = shouldUseFallback();
    const model = useFallback ? 'openai/gpt-oss-20b' : 'llama-3.3-70b-versatile';

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
      maxOutputTokens: 600,
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
