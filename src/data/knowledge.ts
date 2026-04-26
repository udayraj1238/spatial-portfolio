
export const APEX_KNOWLEDGE = {
  profile: {
    name: "Uday Raj",
    title: "AI & Data Science Engineer",
    standing: "2nd Year (Sophomore) at IIITDM Kurnool",
    graduation: "2028",
    philosophy: "Uday views AI not as a black box, but as a system of mathematical vulnerabilities that must be understood to be secured. His research focus is Defensive AI and Computational Efficiency.",
  },
  flagships: [
    {
      id: "segformer-attack",
      name: "SegFormer Adversarial Attack",
      context: "Security Research on Person Re-Identification (Re-ID).",
      tech: ["PyTorch", "SegFormer", "Market-1501", "MiT-B0"],
      breakthroughs: [
        "Identified Stage 4 attention blocks as the primary vulnerability in hierarchical ViTs.",
        "Implemented 'Nuclear' attacks that force a 94.9% accuracy drop.",
        "Created physics-aware adversarial patterns that maintain effectiveness across 6 camera views."
      ],
      impact: "Reduced ResNet-50 Rank-1 accuracy from 91.8% to 16.8%."
    },
    {
      id: "paligemma",
      name: "Pytorch PaliGemma Implementation",
      context: "Efficiency Research on Multimodal Vision-Language Models.",
      tech: ["SigLIP", "Gemma-2B", "8-bit Quantization", "Linear Projections"],
      breakthroughs: [
        "Architected a custom linear projection bottleneck for VLM feature synchronization.",
        "Reduced VRAM consumption by 48% via precision-aware 8-bit quantization.",
        "Refined Top-P sampling logic to reduce multimodal hallucinations by 15%."
      ],
      impact: "22% improvement in BLEU-4 metrics on 50,000 image-text pairs."
    }
  ],
  competitive_edge: {
    shell_ai: "Global Top 20 / 1000+ entries (High-stakes ML optimization).",
    aws_ascend: "176th / 7000+ candidates (Large-scale ML hackathon).",
    algorithms: "Codeforces (1208), CodeChef (1512), 200+ LeetCode problems solved."
  },
  leadership: {
    gdg: "Leading 200+ students through 12-week ML bootcamps.",
    dataworks: "Mentoring 100+ members on TensorRT and edge-AI deployment."
  }
};
