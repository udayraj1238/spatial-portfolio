// ============================================================
// APEX KNOWLEDGE BASE — Uday Raj's Complete Professional Profile
// Auto-syncs with resume_data.txt for real-time accuracy
// ============================================================

export const APEX_KNOWLEDGE = {
  personal: {
    name: "Uday Raj",
    email: "rajuday6002@gmail.com",
    phone: "+91 8527655484",
    github: "https://github.com/udayraj1238",
    portfolio: "https://udayraj1238.vercel.app",
  },

  education: {
    institute: "IIITDM Kurnool (Indian Institute of Information Technology, Design and Manufacturing)",
    degree: "B.Tech in Artificial Intelligence and Data Science",
    gpa: "8.38 CGPA",
    duration: "2024 – 2028",
    currentYear: "2nd Year (Sophomore) as of 2026",
    type: "NIT-equivalent premier government engineering institute",
    coursework: [
      "Data Structures & Algorithms Analysis",
      "Machine Learning",
      "Artificial Intelligence",
      "Data Science & Statistical Analysis",
      "Python Programming",
      "Discrete Mathematics"
    ],
    school: {
      name: "Delhi Public School Sushant Lok, Gurugram",
      grade: "95%",
      stream: "Physics, Chemistry, Mathematics",
      year: "2022–2024"
    }
  },

  projects: [
    {
      id: "segformer-adversarial-attack",
      name: "Adversarial Pattern Generation Using SegFormer",
      shortName: "SegFormer Adversarial Attack",
      github: "https://github.com/udayraj1238/Person-ReID-Attack-Implementation",
      category: "Adversarial Machine Learning / Security Research / Computer Vision",
      dataset: "Market-1501 — 12,936 images, 6 camera views, 1501 identities",
      technologies: ["PyTorch", "SegFormer", "MiT-B0", "ViT-B/16", "Market-1501", "NumPy", "OpenCV", "Python"],
      achievements: [
        {
          title: "Physics-Aware Adversarial Pipeline (ResNet-50)",
          detail: "75.0% reduction in ResNet-50 Rank-1 accuracy by optimizing 224×224 adversarial patterns across 6 camera views."
        },
        {
          title: "ViT-B/16 Re-ID System from Scratch",
          detail: "Built 196-patch, 12-layer ViT-B/16 achieving 91.8% Rank-1 baseline; multi-layer attention-hijacking on layers 9-11 induced 79.5% accuracy collapse."
        },
        {
          title: "Hierarchical SegFormer (MiT-B0) from Scratch",
          detail: "Built using Overlap Patch Merging across 4 multiscale transformer stages. Achieved 97.0% Rank-1 on 12,936 images."
        },
        {
          title: "Nuclear Attack on Stage 4 SegFormer Attention",
          detail: "Targeted Stage 4 attention blocks — forced 94.9% accuracy drop and 0.044 cosine similarity score, demonstrating TOTAL evasion of hierarchical transformer security."
        }
      ],
      keyNumbers: {
        resnet50_drop: "75.0% accuracy reduction",
        vit_drop: "79.5% accuracy collapse",
        segformer_baseline: "97.0% Rank-1 accuracy",
        nuclear_drop: "94.9% accuracy drop",
        similarity_score: "0.044 (near-zero — total evasion)",
        images: "12,936 images across 6 camera views"
      },
      significance: "This research exposes critical blind spots in state-of-the-art surveillance AI. Proves that transformer-based Re-ID systems can be completely broken by carefully engineered adversarial patterns — a crucial finding for AI safety in autonomous surveillance."
    },
    {
      id: "paligemma-vlm",
      name: "Multimodal Deep Learning & Vision-Language Architecture (PyTorch PaliGemma)",
      shortName: "PaliGemma VLM Implementation",
      github: "https://github.com/udayraj1238/Pytorch_PaliGemma",
      category: "Multimodal Deep Learning / Vision-Language Models / Model Efficiency",
      model: "PaliGemma (SigLIP + Gemma-2B) — 2.1 Billion Parameters",
      technologies: ["PyTorch", "SigLIP", "Gemma-2B", "bitsandbytes (8-bit quantization)", "WandB", "Cosine Annealing LR", "Python"],
      achievements: [
        {
          title: "Custom Linear Projection Bottleneck",
          detail: "Engineered cross-modal projection layer reducing SigLIP features from 1152 → 2048 dimensions to match Gemma-2B hidden layers. 98.2% information retention rate."
        },
        {
          title: "8-Bit Quantization for Edge Deployment",
          detail: "Used bitsandbytes for 8-bit quantization of 2.1B parameter model. 48% VRAM reduction. Enables batch size 16 on consumer-grade GPU."
        },
        {
          title: "Training on 50K Image-Caption Dataset",
          detail: "WandB-monitored training. Cosine Annealing LR starting at 2e-5. Loss convergence within 3.5 epochs on 50,000 image-caption pairs."
        },
        {
          title: "Inference Quality Optimization",
          detail: "Top-P sampling = 0.9, Temperature = 0.7. Result: 15% reduction in linguistic hallucinations, 22% improvement in BLEU-4 scores."
        }
      ],
      keyNumbers: {
        parameters: "2.1 Billion",
        vram_reduction: "48%",
        info_retention: "98.2%",
        training_data: "50,000 image-caption pairs",
        epochs: "3.5 epochs to convergence",
        hallucination_reduction: "15%",
        bleu4_improvement: "22%"
      },
      significance: "Democratizes cutting-edge 2.1B parameter VLMs to run on consumer hardware — a critical step for edge AI deployment and accessibility."
    },
    {
      id: "grid07-cognitive-engine",
      name: "Grid07 Cognitive AI Engine",
      github: "https://github.com/udayraj1238/grid07-cognitive-engine",
      category: "LLM Engineering / RAG / LangGraph / AI Systems",
      description: "Production-grade AI Cognitive Engine featuring Vector-based routing, LangGraph orchestration, and a RAG-based combat engine with multi-layered prompt injection defense.",
      technologies: ["Python", "LangGraph", "LangChain", "Vector Databases", "RAG", "LLMs"],
      highlights: [
        "Vector-based routing system for intelligent query dispatching",
        "LangGraph-orchestrated multi-step content engine",
        "Multi-layered RAG combat engine with custom retrieval chains",
        "Advanced prompt injection defense system",
        "Structured LLM outputs with type safety",
        "Professional documentation and test coverage"
      ]
    },
    {
      id: "courtsense-ai",
      name: "CourtSense AI",
      github: "https://github.com/udayraj1238/CourtSense-AI",
      category: "Computer Vision / Sports AI / Real-Time Detection",
      description: "AI-powered court sensing and sports analytics system using real-time computer vision pipelines.",
      technologies: ["Python", "Computer Vision", "PyTorch", "OpenCV", "Real-time detection"],
      hasPage: true
    },
    {
      id: "transformer-from-scratch",
      name: "Transformer Architecture from Scratch (PyTorch)",
      github: "https://github.com/udayraj1238/Transformer_from_scratch_using_pytorch",
      category: "Deep Learning Fundamentals / Educational / Research",
      description: "Complete ground-up implementation of the Transformer architecture in PyTorch — demonstrates mastery of attention mechanisms, positional encoding, multi-head attention, and encoder-decoder stacks without pre-built abstractions.",
      technologies: ["PyTorch", "Python", "Jupyter Notebook"],
      highlights: [
        "Full self-attention and cross-attention implementation",
        "Positional encoding from mathematical first principles",
        "Multi-head attention with configurable heads and dimensions",
        "Complete encoder-decoder Transformer stack",
        "Layer normalization and residual connections"
      ]
    },
    {
      id: "spatial-portfolio",
      name: "Spatial Portfolio (This Website)",
      github: "https://github.com/udayraj1238/spatial-portfolio",
      liveUrl: "https://udayraj1238.vercel.app",
      category: "Full-Stack / 3D WebGL / AI Systems",
      description: "Immersive 3D portfolio with Groq-powered AI assistant, React Three Fiber scene, and live GitHub data integration.",
      technologies: ["Next.js 16", "React 19", "TypeScript", "Three.js", "React Three Fiber", "Groq LLaMA 3.3 70B", "Vercel AI SDK", "Framer Motion", "Vercel"]
    }
  ],

  skills: {
    languages: ["Python (Expert)", "C", "C++", "HTML", "TypeScript"],
    mlStack: ["PyTorch", "TensorFlow", "Torchvision", "OpenCV", "Scikit-learn", "NumPy", "Pandas", "Matplotlib"],
    tools: ["Git", "GitHub", "VS Code", "Jupyter Notebooks", "LaTeX", "WandB", "Docker", "Kaggle"],
    specializations: [
      "Adversarial Machine Learning",
      "Vision-Language Models (VLMs)",
      "Computer Vision",
      "Transformer Architecture",
      "8-bit Quantization (bitsandbytes)",
      "RAG Systems",
      "LangGraph Orchestration",
      "Edge AI Deployment (TensorRT, YOLOv8)"
    ]
  },

  achievements: [
    {
      competition: "Shell.ai Annual Global ML Contest",
      rank: "Global Top 20 / 1000+ Expert Submissions",
      detail: "Shell.ai is hosted by Shell (British multinational energy company). Optimized ML model parameters across 1000+ expert-level submissions.",
      significance: "Top 2% globally — competing against industry professionals worldwide"
    },
    {
      competition: "AWS x Zelestra ML Ascend Hackathon",
      rank: "176th / 7000+ Registrants",
      detail: "Large-scale global ML hackathon with 7000+ registrants.",
      significance: "Top 2.5% globally"
    },
    {
      platform: "Codeforces",
      rating: "1208",
      detail: "Competitive programming — demonstrates strong algorithmic intuition"
    },
    {
      platform: "CodeChef",
      rating: "1512 (2-Star)",
      detail: "Competitive programming"
    },
    {
      platform: "LeetCode",
      detail: "200+ problems solved"
    }
  ],

  leadership: [
    {
      org: "Google Developer Groups (GDG) On Campus — IIITDM Kurnool",
      role: "Machine Learning Coordinator",
      period: "August 2025 – Present",
      achievements: [
        "Led a 12-week ML bootcamp for 200+ students covering SGD, CNNs, and deep learning",
        "Resulted in 15+ end-to-end student projects",
        "Managed Kaggle resources for workshops",
        "Reduced environment latency by 40% via standardized Docker containers"
      ]
    },
    {
      org: "DataWorks Club — IIITDM Kurnool",
      role: "Computer Vision Coordinator",
      period: "August 2025 – Present",
      achievements: [
        "Led workshops on OpenCV and PyTorch for 100+ members",
        "Mentored members on real-time detection pipelines achieving 30+ FPS on edge devices using YOLOv8 + TensorRT",
        "Curated and annotated 5,000+ custom images for club-wide hackathons",
        "Implemented automated data augmentation improving baseline model mAP by 12%"
      ]
    }
  ],

  philosophy: {
    quote: "Intelligence is only as strong as its vulnerabilities.",
    focus: "Defensive AI, Adversarial Robustness, Multimodal Efficiency, AI Safety",
    careerGoal: "Research roles at AI Safety labs — Google DeepMind, OpenAI, or equivalent — ensuring the next generation of AI is secure and robust by design.",
    uniqueEdge: "Uday approaches AI from an adversarial-first perspective: instead of just building models, he stress-tests their failure modes to build systems that are truly robust."
  }
};
