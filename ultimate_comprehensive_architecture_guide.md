# The Uday Raj Spatial AI Portfolio: Comprehensive Architectural Guide

This document serves as the absolute deep-dive into the architecture, features, experimental decisions, and underlying logic of the Spatial AI Portfolio. It is designed to make the complete workings of this project crystal clear, from the WebGL context down to the Vercel Edge Runtime LLM token management.

---

## 1. Introduction & Core Concept

Traditional software engineering and ML portfolios are static: a list of GitHub links, a PDF resume, and perhaps a basic React website. The goal of this project was to build a **living, breathing AI portfolio**. Instead of telling a recruiter that Uday Raj knows AI, the portfolio *shows* it by embedding a custom-engineered AI assistant ("APEX") directly into a highly interactive, 3D WebGL environment. 

The portfolio is split into two massive pillars:
1. **The Spatial Frontend:** A React Three Fiber (R3F) powered 3D universe that reacts to user interactions.
2. **The Intelligence Engine:** A Vercel Edge Runtime backend connecting to Groq's ultra-fast LLMs, bound by aggressive rate-limiting, dynamic token budgeting, and advanced prompt engineering.

---

## 2. The Tech Stack Breakdown

### Frontend Framework: Next.js 16 (App Router)
We chose Next.js 16 because of its robust App Router (`src/app`), excellent TypeScript support, and seamless integration with Vercel's Edge Functions. The App Router allows us to perfectly separate server-side API routes (`route.ts`) from client-side interactive components (`page.tsx`, `HeroScene.tsx`).

### 3D Graphics: React Three Fiber (R3F) & Three.js
Writing raw WebGL or Three.js code is notoriously verbose. R3F allows us to write 3D scenes declaratively using React components. We supplemented this with `@react-three/drei`, a collection of useful helpers (like `Stars`, `Float`, and `PerspectiveCamera`) that drastically reduced boilerplate code.

### AI Infrastructure: Vercel AI SDK & Groq API
Instead of building a custom WebSocket or Server-Sent Events (SSE) pipeline from scratch for AI streaming, we utilized the `@ai-sdk/react` library (`useChat`). This hook automatically manages the streaming state of AI responses. The backend uses the Groq API, which leverages custom LPU (Language Processing Unit) hardware to serve Llama models at blistering speeds (up to 800 tokens per second), providing instant responses that make the AI feel truly alive.

---

## 3. The Spatial Frontend (The 3D Canvas)

### A. The WebGL Context Experiment (Bug 1)
**The Experiment:** Initially, we attempted to wrap the entire application in a global `<Canvas>` element inside `layout.tsx`. The idea was that the 3D background would persist seamlessly across page navigations.
**The Failure:** Mobile devices and laptops without dedicated GPUs began crashing. We realized that by having a Canvas in `layout.tsx` and another 3D component rendering in `page.tsx`, we accidentally created **two overlapping WebGL contexts**. Browsers heavily restrict multiple WebGL contexts due to memory limitations.
**The Final Solution:** We ripped the Canvas out of the global layout. All 3D rendering is now strictly isolated to `src/components/canvas/HeroScene.tsx`, which sits behind the UI using `fixed` positioning and a `z-index` of `-1`. 

### B. `HeroScene.tsx`: The Visual Engine
The `HeroScene` is a sprawling, cyberpunk-inspired 3D environment. It consists of multiple highly optimized mathematical meshes:
- **DataStream:** Renders 40 floating geometric lines that move toward the camera. We used `useMemo` to calculate their initial positions to prevent unnecessary React re-renders, and modified their Z-axis every frame in `useFrame`.
- **Orbital Rings & Hexagonal Tube Ring:** Created using `torusGeometry` and `TubeGeometry` along a Catmull-Rom curve. These rotate independently based on the `clock.getElapsedTime()` in the render loop.
- **The Core Orb:** A central icosahedron geometry. We applied a `<MeshDistortMaterial>` (from Drei) which utilizes vertex shaders to create a rippling, liquid-like distortion effect on the geometry in real-time.
- **Mouse Interactivity:** In `SceneContent()`, we use the `useThree().mouse` hook to slightly tilt the entire 3D group based on the user's cursor position. We used `THREE.MathUtils.lerp` (Linear Interpolation) to make the tilt perfectly smooth, avoiding jarring snaps.

---

## 4. The Interactive Chat Terminal (`ChatTerminal.tsx`)

The Chat Terminal is the primary user interface. It acts as an overlay on top of the 3D scene.

### A. UI/UX Design Decisions
The terminal is built with custom CSS designed to mimic a high-tech console:
- **Glassmorphism:** The background uses a heavy gradient `rgba(4,8,20,0.97)` with `backdrop-filter` to let the 3D scene subtly bleed through.
- **Visual Hierarchy:** AI message bubbles are distinctly separated using a solid dark-cyan background (`rgba(10, 20, 35, 0.95)`), whereas user messages use a bright blue gradient. This was a direct UI fix resulting from feedback that the chat was hard to scan visually.
- **Call-to-Action (CTA) Highlights:** Uday's GitHub, LinkedIn, and Email buttons are given an explicit cyan border and background to draw the recruiter's eye immediately.

### B. Markdown Parsing & The `remark-gfm` Solution
Because LLMs natively output markdown, we originally used standard `ReactMarkdown`. 
**The Issue:** Raw URLs (e.g., `github.com/udayraj1238`) were rendered as unclickable dead text, which looked unpolished to recruiters.
**The Fix:** We installed and integrated `remark-gfm` (GitHub Flavored Markdown). By passing `remarkPlugins={[remarkGfm]}` to the component and heavily customizing the `<a>` tag rendering, all links are now natively transformed into clickable hyperlinks. We explicitly forced `target="_blank" rel="noopener noreferrer"` across all links to ensure the user never accidentally navigates away from the portfolio.

### C. Voice Interactivity (Speech-to-Text & Text-to-Speech)
To make APEX feel like a true assistant, we integrated voice.
- **Listening (Web Speech API):** We utilize `webkitSpeechRecognition`. When the microphone icon is clicked, the browser records audio and translates it to text. 
- **The Microphone Permission Bug (Bug 2):** During testing, voice input failed silently. Browsers block microphone access in modern cross-origin iframe or restrictive header environments. We solved this by modifying `next.config.ts` to explicitly include `Permissions-Policy: microphone=(self)`.
- **Speaking (SpeechSynthesis):** When the AI finishes a response, the `onFinish` callback of the `useChat` hook triggers the `window.speechSynthesis` API, reading the stripped text aloud using the best available local voice. We had to write a regex stripper (`stripThinkTags`) to ensure the TTS engine didn't try to read out `<think>` reasoning blocks from advanced models.

---

## 5. The Intelligence Engine (`route.ts`)

The backend is where the heaviest logic resides. Because we are using an external LLM API (Groq) with strict rate limits, we could not simply forward requests blindly. We built a heavily fortified API route running on the Vercel Edge Runtime.

### A. The Two-Layer Rate Limiter
If a malicious user or bot spam-clicks the "Send" button, they could burn through the entire Groq API quota in minutes, taking the portfolio offline for everyone else.
**The Solution:** We implemented an in-memory Map-based rate limiter that tracks user IP addresses.
1. **Burst Limit (TPM Safety):** Limits a user to 5 requests per minute. This protects against immediate spam.
2. **Daily Limit (TPD Safety):** Limits a user to 30 requests per day. Once hit, it returns a friendly HTTP 429 response: *"You've reached the daily limit... email Uday directly!"*

### B. Dynamic Token Budgeting & Model Fallbacks
Groq's API restricts the highly intelligent `llama-3.3-70b-versatile` model to exactly 100,000 Tokens Per Day (TPD). 
**The Solution:** We implemented a `dailyTokensUsed` counter. Every request estimates token usage (`systemTokens + historyTokens + 400`). Once `dailyTokensUsed` exceeds 80,000 (leaving 20k for safety), the `shouldUseFallback()` function returns true. The API seamlessly hot-swaps the model to a fallback LLM to ensure zero downtime.

**The Fallback Migration to `openai/gpt-oss-20b`:**
We upgraded the fallback model from `llama-3.1-8b-instant` to OpenAI's open-weight `gpt-oss-20b` on Groq. This is a massive upgrade across the board:
- **Intelligence:** `gpt-oss-20b` matches `o3-mini` on benchmarks, making the fallback responses noticeably sharper.
- **Speed:** It runs at an incredible 1,000 tokens per second (vs 560–840 for the 8B model).
- **Double Capacity & Prompt Caching:** The free on-demand tier for `gpt-oss-20b` has a 200,000 TPD cap (double the 70B limit). Crucially, Groq rolled out **prompt caching** on this model. Because our system prompt is an identical 1,168-token string on every request, it hits the cache perfectly and costs zero tokens. This drops our true per-request cost from ~2,143 tokens to ~975 tokens, allowing for over 200 high-quality fallback conversations per day completely free. The hot-swap is invisible to the user.

*Known Architectural Limitation:* The `dailyTokensUsed` variable lives in module-level memory. Because Vercel spins up multiple Edge instances dynamically based on geographic traffic, each instance starts its counter at zero. This means the fallback switch isn't perfectly globally accurate under high concurrent traffic. To achieve true global state, we would need a database like Redis, but for a personal portfolio, this is an acceptable, cost-effective trade-off.

### C. Context Window Compression
LLMs charge tokens for both input and output. If a user has a 20-message conversation, sending the entire history back to the API every time would result in exponential token burn.
**The Solution:** In `route.ts`, we implemented `const recentMessages = coreMessages.slice(-4);`. We explicitly clamp the conversation history to the last 4 messages. The AI only remembers the immediate context, saving thousands of tokens per request while maintaining conversational fluidity.

### D. The Vercel AI SDK Type Compliance (Bug 3)
During initial testing with the Vercel AI SDK, we faced issues getting the token limits to properly align with the TypeScript definitions of the Groq provider. We explicitly set `maxTokens: 600` in the `streamText` configuration. This forces the model to stop generation if it attempts to write runaway responses, capping our API costs and ensuring responses remain concise.

---

## 6. Prompt Engineering: The "Anti-HR-Speak" Evolution

An LLM is only as good as its system prompt. Our prompt went through three massive evolutionary phases to reach its current state of perfection.

### Phase 1: The Token Burner
Initially, the prompt dynamically fetched Uday's 12,000-character resume text file. This cost roughly 4,000 tokens *per request*. We quickly realized this was mathematically unsustainable.
**Fix:** We manually compressed the entire resume into a highly dense, factual, 1,000-token markdown string directly inside `buildPrompt()`. Every critical metric (e.g., "48% VRAM reduction in PaliGemma", "97.0%→2% Rank-1 drop in SegFormer") was hardcoded efficiently.

### Phase 2: Negative Constraints (The Fallback Failure)
When the AI answered questions, it often sounded like a cheesy HR recruiter. We initially tried adding "Negative Constraints" (e.g., `BANNED WORDS: plethora, testament`). 
**The Failure:** When the system hit the token limit and swapped to the fallback model, the smaller model failed completely. Small LLMs suffer heavily from "Negative Constraint Confusion"—they struggle to understand what *not* to do and end up ignoring the bans.

### Phase 3: Aggressive Positive Directives & Formatting
To fix the fallback model, we overhauled the `RESPONSE RULES`. Instead of just telling it what *not* to do, we gave it hyper-specific instructions on *how* to act:
1. **Argumentation Synthesis:** We replaced generic rules with a strict command: *"If asked why someone should hire him... pick his single most impressive concrete result and build the argument outward from that number."* This forces the LLM to actively reason rather than blindly list skills.
2. **Strict Markdown Formatting:** The fallback model previously clumped bullet points together. We fixed this by mandating: *"ALWAYS put each bullet on its own separate NEW LINE — never run bullets together."*
3. **Link Syntax Enforcement:** We explicitly instructed: *"ALWAYS use proper Markdown syntax [Text](https://url) — never output raw URLs,"* ensuring the `remark-gfm` parser can cleanly transform them into anchor tags.

By leveraging positive directives, the highly capable fallback model (`gpt-oss-20b`) is completely unchained. Even when the 70B token quota runs dry, the portfolio provides sharp, heavily formatted, highly technical answers that feel just as intelligent.

---

## 7. Supabase Analytics (Passive Tracking)

To understand what recruiters actually care about, we implemented a passive analytics hook.
In `route.ts`, just before the AI stream begins, the system extracts the user's latest query. If the Supabase environment variables are present, it uses `@supabase/supabase-js` to silently insert a record into the `recruiter_analytics` table, logging the `query`, `model_used`, and `tokens_estimated`. 
Crucially, this is a "fire-and-forget" promise. We intentionally do not `await` the Supabase insertion. This ensures that even if the database is down, the user's AI chat experience is never blocked or slowed down.

---

## 8. Conclusion

This portfolio represents a masterclass in full-stack AI integration. It proves that Uday Raj doesn't just know how to write Python scripts in a Jupyter Notebook. It proves he can:
1. Architect scalable Edge APIs.
2. Manage cloud LLM rate limits and token economies gracefully.
3. Engineer prompts that bypass model limitations.
4. Build complex, highly optimized 3D WebGL user interfaces.

Every bug faced—from WebGL context collisions to LLM negative constraint failures and API model deprecations—was met with an engineered, robust solution that prioritizes performance, cost-efficiency, and user experience above all else.
