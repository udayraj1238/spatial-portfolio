"""
APEX AI BRAIN UPDATER - Uday Raj Portfolio

HOW TO USE:
  1. Place your updated resume as: Portfolio/resume_updated.pdf
  2. Set your LinkedIn public URL below (LINKEDIN_URL)
  3. Run: python update_resume_ai.py
  4. Done! Git push and APEX AI updates in ~60 seconds.

WHAT IT DOES:
  - Extracts full text from your resume PDF
  - Fetches all your GitHub repositories
  - Scrapes your public LinkedIn profile
  - Writes everything to public/resume_data.txt
  - That file is served by Vercel and read by the AI on every chat
"""

import os
import sys
import re
import json
import urllib.request
import pdfplumber
from datetime import datetime

# ── CONFIG — Edit these ──────────────────────────────────────────────────────
PORTFOLIO_DIR  = os.path.dirname(os.path.abspath(__file__))
RESUME_PDF     = os.path.join(PORTFOLIO_DIR, "resume_updated.pdf")
OUTPUT_TXT     = os.path.join(PORTFOLIO_DIR, "public", "resume_data.txt")
GITHUB_USER    = "udayraj1238"
LINKEDIN_URL   = "https://www.linkedin.com/in/uday-raj-0b3014295/"  # Your LinkedIn public URL


# ── PDF Extraction ────────────────────────────────────────────────────────────
def extract_pdf(path: str) -> str:
    if not os.path.exists(path):
        print(f"[ERR] File not found: {path}")
        print(f"   -> Place your resume at: {path}")
        sys.exit(1)
    print(f"[READ] Reading PDF: {path}")
    text = ""
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
    return text.strip()


# ── GitHub Fetcher ────────────────────────────────────────────────────────────
def fetch_github(username: str) -> str:
    try:
        url = f"https://api.github.com/users/{username}/repos?sort=updated&per_page=100"
        req = urllib.request.Request(url, headers={"User-Agent": "APEX-Brain-Updater"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            repos = json.loads(resp.read().decode())
        if not isinstance(repos, list):
            return "GitHub unavailable."
        lines = []
        for r in repos:
            if not r.get("fork"):
                lines.append(
                    f"Repo: {r['name']} | Language: {r.get('language','?')} | "
                    f"Description: {r.get('description','No description')} | "
                    f"URL: {r.get('html_url','')}"
                )
        print(f"   [OK] Fetched {len(lines)} repositories.")
        return "\n".join(lines)
    except Exception as e:
        print(f"   [WARN] GitHub fetch failed: {e}")
        return "GitHub data unavailable."


# ── LinkedIn Scraper ──────────────────────────────────────────────────────────
def fetch_linkedin(profile_url: str) -> str:
    """
    Attempts to fetch the public LinkedIn profile page and extract text.
    LinkedIn often blocks scrapers, so this falls back gracefully.
    The text is approximate — paste your LinkedIn summary manually for best results.
    """
    if not profile_url:
        return ""
    try:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
            "Accept-Language": "en-US,en;q=0.9",
            "Accept": "text/html,application/xhtml+xml",
        }
        req = urllib.request.Request(profile_url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode("utf-8", errors="ignore")

        # Strip HTML tags
        text = re.sub(r"<style[^>]*>.*?</style>", " ", html, flags=re.DOTALL)
        text = re.sub(r"<script[^>]*>.*?</script>", " ", text, flags=re.DOTALL)
        text = re.sub(r"<[^>]+>", " ", text)
        text = re.sub(r"\s+", " ", text).strip()

        # Extract a useful window (LinkedIn pages are huge)
        # Find the section that likely has profile info
        name_idx = text.find("Uday Raj")
        if name_idx == -1:
            name_idx = text.find("IIITDM")
        if name_idx == -1:
            name_idx = max(0, len(text) // 4)

        snippet = text[max(0, name_idx - 200): name_idx + 3000]

        if len(snippet) > 100:
            print(f"   [OK] LinkedIn profile fetched ({len(snippet)} chars).")
            return snippet
        else:
            print("   [WARN] LinkedIn blocked or profile not public. Using manual data.")
            return get_linkedin_manual_data()

    except Exception as e:
        print(f"   [WARN] LinkedIn fetch failed ({e}). Using manual data.")
        return get_linkedin_manual_data()


def get_linkedin_manual_data() -> str:
    """
    Fallback: manually curated LinkedIn data.
    Update this whenever you update your LinkedIn profile.
    """
    return """
LinkedIn Profile: Uday Raj
URL: https://www.linkedin.com/in/uday-raj-0b3014295/
Headline: AI & Data Science Engineer | Adversarial ML Researcher | B.Tech at IIITDM Kurnool
Location: Kurnool, Andhra Pradesh, India

Summary:
2nd-year B.Tech student in AI & Data Science at IIITDM Kurnool (2024-2028). 
Research focus: Adversarial Machine Learning and Multimodal Vision-Language Models.
Global Top 20 in Shell.ai ML Contest. 176th in AWS x Zelestra ML Hackathon.
ML Coordinator at GDG On Campus, CV Coordinator at DataWorks Club.

Education:
- IIITDM Kurnool | B.Tech AI & Data Science | 8.38 CGPA | 2024-2028
- Delhi Public School Sushant Lok, Gurugram | 95% | 2022-2024

Skills: PyTorch, TensorFlow, Adversarial ML, SegFormer, Vision-Language Models, 
Python, C++, OpenCV, LangGraph, RAG, Docker, TensorRT, YOLOv8

Certifications and Achievements:
- Shell.ai Global ML Contest: Top 20 / 1000+
- AWS x Zelestra ML Ascend: 176th / 7000+
- Codeforces: 1208 | CodeChef: 1512 | LeetCode: 200+
"""


# ── Knowledge File Builder ────────────────────────────────────────────────────
def build_knowledge_file(resume_text: str, github_data: str, linkedin_data: str) -> str:
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    return f"""========================================================
  UDAY RAJ -- APEX AI KNOWLEDGE BASE
  Last Updated: {now}
  Sources: resume_updated.pdf + GitHub API + LinkedIn
========================================================

== SECTION 1: RESUME (PRIMARY SOURCE OF TRUTH) ==
{resume_text}

== SECTION 2: LINKEDIN PROFILE ==
{linkedin_data}

== SECTION 3: GITHUB REPOSITORIES ==
{github_data}

========================================================
  NOTE: This file is fetched live by APEX AI (Groq LLaMA-3.3-70B)
  on every chat session. Update resume_updated.pdf and re-run
  this script to refresh the AI's knowledge.
========================================================"""


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    print("\n+==========================================+")
    print("|  APEX AI BRAIN - Updating Knowledge...  |")
    print("+==========================================+\n")

    # Step 1: Resume
    print("Step 1/4 - Extracting resume from PDF...")
    resume_text = extract_pdf(RESUME_PDF)
    print(f"   [OK] Extracted {len(resume_text)} characters.\n")

    # Step 2: GitHub
    print("Step 2/4 - Fetching GitHub repositories...")
    github_data = fetch_github(GITHUB_USER)
    print()

    # Step 3: LinkedIn
    print("Step 3/4 - Fetching LinkedIn profile...")
    linkedin_data = fetch_linkedin(LINKEDIN_URL)
    print()

    # Step 4: Write
    print("Step 4/4 - Writing knowledge base...")
    content = build_knowledge_file(resume_text, github_data, linkedin_data)
    os.makedirs(os.path.dirname(OUTPUT_TXT), exist_ok=True)
    with open(OUTPUT_TXT, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"   [OK] Written {len(content)} chars to: {OUTPUT_TXT}\n")

    print("+============================================================+")
    print("|  [DONE] APEX AI brain has been updated!                    |")
    print("|                                                            |")
    print("|  To deploy:                                                |")
    print("|  1. git add public/resume_data.txt                         |")
    print("|  2. git commit -m 'chore: update AI brain'                 |")
    print("|  3. git push                                               |")
    print("|  -> Vercel auto-deploys in ~60s.                          |")
    print("+============================================================+\n")


if __name__ == "__main__":
    main()
