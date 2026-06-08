# 🚀 Uday Raj's AI Portfolio — Interactive 3D & APEX AI Assistant

[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)](https://udayraj1238.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![AI](https://img.shields.io/badge/AI-Groq%20%7C%20LLaMA-FF6B35?style=flat-square)](https://groq.com)

## ✨ Features

- **Interactive 3D Scene** — React Three Fiber with orbital rings, particle systems, and mouse-reactive camera
- **APEX AI Assistant** — Chat with an AI trained on my complete resume, GitHub, and research papers
- **Real-Time Streaming** — Edge runtime for instant, low-latency responses (Groq LLaMA 3.3 70B)
- **Voice Support** — Speech-to-text and text-to-speech for hands-free interaction
- **Production-Grade Security** — Rate limiting, input validation, error boundaries, environment variable management
- **Lightning Fast** — Optimized bundle, cached AI responses, edge deployment

## 🎯 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/udayraj1238/spatial-portfolio.git
cd spatial-portfolio

# Install dependencies
npm install

# Setup environment (see .env.example)
cp .env.example .env.local
# Add your API keys to .env.local

# Run dev server
npm run dev
```

Visit `http://localhost:3000`

## 🔧 Build & Deploy

```bash
# Production build
npm run build

# Start production server
npm start
```

**Deploy to Vercel:**
```bash
npx vercel
```

## 📚 Project Structure
src/
├── app/
│   ├── page.tsx              # Main landing page
│   ├── layout.tsx            # Root layout with error boundary
│   ├── globals.css           # Global styles
│   └── api/
│       └── chat/route.ts     # APEX AI endpoint (streaming + rate limiting)
├── components/
│   ├── ChatTerminal.tsx      # AI chat UI with voice support
│   ├── ErrorBoundary.tsx     # React error boundary
│   └── canvas/
│       ├── Scene.tsx         # Main 3D scene
│       ├── HeroScene.tsx     # Hero section
│       ├── BentoGrid.tsx     # Layout component
│       └── ScrollCamera.tsx  # Camera controller
├── data/
│   └── knowledge.ts          # AI system prompt and knowledge base
└── helpers/
├── rateLimit.ts          # Rate limiting middleware
└── tunnel.ts             # Portal renderer

## 🤖 APEX AI

APEX is an AI assistant trained on:
- **Resume** — Complete education, experience, and skills
- **GitHub** — All 6 major projects with technical breakdowns
- **Research** — Adversarial ML, Computer Vision, LLMs

Ask APEX anything:
- ⚔️ "Tell me about his adversarial attack research"
- 🧠 "Explain the PaliGemma multimodal implementation"
- 🏆 "What are his competition rankings?"
- 💼 "Why is he exceptional for an AI role?"

## 🛠️ Tech Stack

### Frontend
- **React 19** — UI components with hooks
- **Next.js 16** — Server components, API routes, edge runtime
- **TypeScript 5** — Full type safety
- **Tailwind CSS** + **GSAP** — Styling and animations
- **Framer Motion** — Smooth transitions
- **Three.js** + **React Three Fiber** — 3D graphics
- **Lucide React** — Icons

### Backend & AI
- **Groq API** — Ultra-fast LLM inference (30k TPM)
- **LLaMA 3.3 70B** — Powerful, fast open-source LLM
- **Vercel AI SDK** — Streaming and tool integration
- **Supabase** — Analytics database
- **Edge Runtime** — Serverless functions with 30s timeout

### Infrastructure
- **Vercel** — CI/CD, auto-deploy from GitHub
- **GitHub** — Version control
- **TypeScript** — Build-time type checking

## 🔒 Security & Best Practices

✅ **Rate Limiting** — 10 requests per minute per IP  
✅ **Input Validation** — Zod schema validation  
✅ **Error Boundaries** — Graceful crash recovery  
✅ **No Secrets in Git** — Environment variables only  
✅ **HTTPS Headers** — X-Content-Type-Options, X-Frame-Options, XSS protection  
✅ **Error Logging** — Console feedback without exposing internals  

## 📊 Performance

- **First Contentful Paint** — < 1.5s
- **Time to Interactive** — < 2.5s
- **Bundle Size** — ~180KB gzipped
- **API Latency** — 300-800ms (Groq edge)

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel --prod
```

### Environment Variables (Vercel Settings)
GROQ_API_KEY=gsk_xxxxx
NEXT_PUBLIC_PORTFOLIO_URL=https://yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxxxx

## 📈 What's Built Here

### 6 Major Projects
1. **Adversarial Pattern Generation** — SegFormer nuclear attack (94.9% accuracy drop)
2. **PaliGemma VLM** — Multimodal vision-language model from scratch
3. **Grid07 Cognitive Engine** — Multi-agent LLM orchestration system
4. **CourtSense-AI** — Real-time sports analytics (30+ FPS edge)
5. **Transformer from Scratch** — Complete Attention Is All You Need in PyTorch
6. **This Portfolio** — Full-stack AI web app with 3D graphics

### Achievements
- 🏆 **Shell.ai Top 20** — Global ML competition
- 🏆 **AWS x Zelestra Rank 176** — 7,000+ registrants
- 🎓 **GDG ML Coordinator** — 200+ students, 12-week bootcamp
- 🎓 **DataWorks CV Lead** — 100+ members, 5,000+ curated images

## 📄 License

MIT — Use freely for inspiration, just credit the work.

## 🤝 Connect

- **Email** — rajuday6002@gmail.com
- **LinkedIn** — https://linkedin.com/in/uday6002
- **GitHub** — https://github.com/udayraj1238
- **Portfolio** — https://udayraj1238.vercel.app

---

**Built with ❤️ by Uday Raj**  
*AI & Data Science Engineer | Adversarial ML Researcher | Full-Stack Builder*
