"""
╔══════════════════════════════════════════════════════════════╗
║  APEX AI BRAIN UPDATER — Uday Raj Portfolio                  ║
║                                                              ║
║  HOW TO USE:                                                 ║
║  1. Place your updated resume as:                            ║
║        Portfolio/resume_updated.pdf                          ║
║  2. Run: python update_resume_ai.py                          ║
║  3. Done! The AI will now use your latest resume.            ║
║                                                              ║
║  The file resume_data.txt is auto-served by Vercel.          ║
║  APEX AI reads it live on every chat session.                ║
╚══════════════════════════════════════════════════════════════╝
"""

import os
import sys
import json
import pdfplumber
from datetime import datetime

# ── CONFIG ──────────────────────────────────────────────────────────────────
PORTFOLIO_DIR = os.path.dirname(os.path.abspath(__file__))
RESUME_PDF    = os.path.join(PORTFOLIO_DIR, "resume_updated.pdf")
OUTPUT_TXT    = os.path.join(PORTFOLIO_DIR, "public", "resume_data.txt")  # MUST be in public/ to be served by Vercel
GITHUB_USER   = "udayraj1238"


def extract_pdf(path: str) -> str:
    """Extract all text from PDF using pdfplumber."""
    if not os.path.exists(path):
        print(f"[ERR]  File not found: {path}")
        print(f"   -> Place your resume at: {path}")
        sys.exit(1)

    print(f"[READ]  Reading: {path}")
    text = ""
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
    return text.strip()


def fetch_github_summary(username: str) -> str:
    """Fetch public GitHub repos and summarize them."""
    try:
        import urllib.request
        url = f"https://api.github.com/users/{username}/repos?sort=updated&per_page=100"
        req = urllib.request.Request(url, headers={"User-Agent": "APEX-Brain-Updater"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            repos = json.loads(resp.read().decode())

        if not isinstance(repos, list):
            return "GitHub data unavailable."

        lines = []
        for r in repos:
            if not r.get("fork"):
                lines.append(
                    f"* [{r['name']}] ({r.get('language','?')}) -- "
                    f"{r.get('description','No description')} "
                    f"| Stars: {r.get('stargazers_count',0)} "
                    f"| {r.get('html_url','')}"
                )
        return "\n".join(lines) or "No public repos found."
    except Exception as e:
        print(f"[WARN]  GitHub fetch failed: {e}")
        return "GitHub data unavailable (run again with internet)."


def build_knowledge_file(resume_text: str, github_summary: str) -> str:
    """Combine resume + GitHub into a richly structured knowledge file."""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    return f"""
========================================================
  UDAY RAJ — APEX AI KNOWLEDGE BASE
  Last Updated: {now}
  Source: resume_updated.pdf + GitHub API
========================================================

== EXTRACTED RESUME TEXT ==
{resume_text}

== GITHUB REPOSITORIES (LIVE) ==
{github_summary}

========================================================
  HOW THIS FILE IS USED:
  → The APEX AI (Groq LLaMA-3.3-70B) fetches this file
    on every chat session to answer questions about Uday.
  → Update resume_updated.pdf and re-run this script to
    keep the AI brain fresh.
========================================================
""".strip()


def main():
    print("\n+==========================================+")
    print("|  APEX AI BRAIN - Updating Knowledge...  |")
    print("+==========================================+\n")

    # 1. Extract resume
    print("Step 1/3 - Extracting resume text from PDF...")
    resume_text = extract_pdf(RESUME_PDF)
    print(f"   [OK]  Extracted {len(resume_text)} characters from PDF.\n")

    # 2. Fetch GitHub
    print("Step 2/3 - Fetching GitHub repositories...")
    github_summary = fetch_github_summary(GITHUB_USER)
    print(f"   [OK]  Fetched public repositories.\n")

    # 3. Write output
    print("Step 3/3 - Writing knowledge base to resume_data.txt...")
    content = build_knowledge_file(resume_text, github_summary)
    with open(OUTPUT_TXT, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"   [OK]  Written {len(content)} characters to {OUTPUT_TXT}\n")

    print("+============================================================+")
    print("|  [DONE] APEX AI brain has been updated!                    |")
    print("|                                                            |")
    print("|  Next steps:                                               |")
    print("|  1. git add resume_data.txt                                |")
    print("|  2. git commit -m 'chore: update AI brain'                 |")
    print("|  3. git push                                               |")
    print("|  -> Vercel auto-deploys. APEX AI updates in ~60s.         |")
    print("+============================================================+\n")


if __name__ == "__main__":
    main()
