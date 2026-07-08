#!/usr/bin/env python3
"""
update_apex_brain.py
─────────────────────────────────────────────────────────────────────────────
Nightly job that keeps APEX's knowledge current, automatically, for free.

WHAT THIS DOES:
1. Fetches your public GitHub repos via the GitHub REST API (free — uses the
   Actions-provided token for a 5,000 req/hour rate limit, no extra secret
   needed).
2. Extracts text from resume_updated.pdf if present (pdfplumber, runs
   locally in the Action — no external API, no cost).
3. Splices a SHORT "new repos" supplement into route.ts, in a constant
   called AUTO_SYNCED_REPOS — completely separate from, and never
   overwriting, your 6 hand-written, metric-rich PROJECTS entries.
4. Keeps public/resume_data.txt as a full human-readable snapshot (useful
   for you, for search engines, for a future admin page) — but this file
   is NOT read by APEX at request-time, by design, to protect the token
   budget. Only route.ts affects what APEX actually knows.
5. If anything changed, the GitHub Actions workflow commits and pushes.
   Vercel's existing GitHub integration auto-deploys on every push to
   main — nothing extra to configure there.

WHY NOT USE AN LLM TO SUMMARIZE?
Calling Groq here would burn tokens against the SAME daily budget your
portfolio's visitors use. This script is deliberately rule-based and
deterministic — zero LLM calls, zero added cost, zero risk of reducing
the token budget available to real visitors.

WHY "NEW REPOS ONLY" INSTEAD OF ALL REPOS?
Your 6 curated projects already have hand-written, hard-won specifics
(exact accuracy drops, architecture dimensions, benchmark numbers) that
the GitHub API can never produce from a repo description alone. Blindly
replacing that with auto-generated text would make APEX dumber, not
smarter. So this script only ever ADDS repos that aren't already among
the 6 named ones — new side-projects you push in the future show up
automatically; your flagship work is never touched.
"""

import os
import re
import json
import urllib.request
import urllib.error
from datetime import datetime, timezone

# ── Configuration ────────────────────────────────────────────────────────────
GITHUB_USERNAME = "udayraj1238"
ROUTE_FILE      = "src/app/api/chat/route.ts"
RESUME_PDF      = "resume_updated.pdf"
OUTPUT_SUMMARY  = "public/resume_data.txt"

# Repos already covered in the hand-written PROJECTS section of route.ts.
# Keep this list in sync if you rename or retire a repo.
ALREADY_COVERED = {
    "distrosync",
    "pytorch_paligemma",
    "courtsense-ai",
    "grid07-cognitive-engine",
    "transformer_from_scratch_using_pytorch",
    "spatial-portfolio",
}

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
API_BASE     = "https://api.github.com"

START_MARK = "// AUTO-GENERATED:PROJECTS-START"
END_MARK   = "// AUTO-GENERATED:PROJECTS-END"


# ── Step 1: Fetch GitHub repo data (free, GitHub REST API) ──────────────────
def fetch_github_repos():
    url = f"{API_BASE}/users/{GITHUB_USERNAME}/repos?per_page=100&sort=pushed"
    req = urllib.request.Request(url)
    if GITHUB_TOKEN:
        req.add_header("Authorization", f"Bearer {GITHUB_TOKEN}")
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("User-Agent", "apex-brain-updater")

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            repos = json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        print(f"[WARN] GitHub API error {e.code}: {e.reason}. Skipping repo refresh.")
        return []
    except Exception as e:
        print(f"[WARN] GitHub API unreachable: {e}. Skipping repo refresh.")
        return []

    out = []
    for r in repos:
        if r.get("fork"):
            continue
        out.append({
            "name":        r["name"],
            "description": (r.get("description") or "").strip(),
            "language":    r.get("language") or "",
            "stars":       r.get("stargazers_count", 0),
            "pushed_at":   r.get("pushed_at", ""),
            "url":         r["html_url"],
        })
    out.sort(key=lambda x: x["pushed_at"], reverse=True)
    return out


# ── Step 2: Extract resume PDF text (free, local, pdfplumber) ───────────────
def extract_resume_text():
    if not os.path.exists(RESUME_PDF):
        print(f"[INFO] {RESUME_PDF} not found — skipping PDF extraction.")
        return ""
    try:
        import pdfplumber
    except ImportError:
        print("[WARN] pdfplumber not installed — skipping PDF extraction.")
        return ""

    text_parts = []
    try:
        with pdfplumber.open(RESUME_PDF) as pdf:
            for page in pdf.pages:
                text_parts.append(page.extract_text() or "")
    except Exception as e:
        print(f"[WARN] Failed to parse {RESUME_PDF}: {e}")
        return ""

    return "\n".join(text_parts).strip()


# ── Step 3: Build the "new repos only" supplement ────────────────────────────
def format_new_repos_block(repos, max_new=4):
    """
    Only includes repos NOT already in the hand-written PROJECTS list.
    Returns '' (empty string) if there's nothing new — which costs the
    running app exactly 0 extra tokens, since it's interpolated directly
    into the prompt template.
    """
    new_ones = [r for r in repos if r["name"].lower() not in ALREADY_COVERED]
    if not new_ones:
        return ""

    lines = ["\nOTHER RECENT REPOS (auto-synced, not yet in the curated list above):"]
    for r in new_ones[:max_new]:
        desc = r["description"] or "No description set on GitHub yet — add one for better APEX answers."
        tag = f" [{r['language']}]" if r["language"] else ""
        lines.append(f"- {r['name']}{tag}: {desc} ({r['url']})")

    return "\n".join(lines)


# ── Step 4: Splice into route.ts between anchor comments ────────────────────
def update_route_file(new_block):
    if not os.path.exists(ROUTE_FILE):
        print(f"[ERROR] {ROUTE_FILE} not found.")
        return False

    with open(ROUTE_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    if START_MARK not in content or END_MARK not in content:
        print(f"[WARN] Anchor comments not found in {ROUTE_FILE}. Skipping.")
        return False

    # Replace ONLY the const AUTO_SYNCED_REPOS = '...'; line between the anchors.
    pattern = re.compile(
        re.escape(START_MARK) + r".*?" + re.escape(END_MARK),
        re.DOTALL,
    )

    escaped_block = new_block.replace("\\", "\\\\").replace("'", "\\'").replace("\n", "\\n")
    replacement = (
        f"{START_MARK}\n"
        f"// Populated nightly by update_apex_brain.py via GitHub Actions.\n"
        f"// Only lists repos NOT already covered in the hand-written PROJECTS section\n"
        f"// above — the 6 curated projects with detailed metrics are never touched.\n"
        f"// Empty string here costs 0 tokens; only non-empty when there's something new.\n"
        f"const AUTO_SYNCED_REPOS = '{escaped_block}';\n"
        f"{END_MARK}"
    )

    if pattern.search(content) is None:
        print("[WARN] Could not match anchor block pattern. Skipping.")
        return False

    # NOTE: re.sub() interprets backslashes in a *string* replacement as
    # backreferences (e.g. \n would become an actual newline again,
    # undoing our escaping and producing invalid TypeScript). Passing a
    # lambda instead makes re.sub treat it as a literal, opaque string.
    new_content = pattern.sub(lambda _m: replacement, content, count=1)

    if new_content == content:
        print("[INFO] route.ts content unchanged — nothing to commit.")
        return False

    with open(ROUTE_FILE, "w", encoding="utf-8") as f:
        f.write(new_content)
    print(f"[OK] Updated {ROUTE_FILE} with fresh GitHub data.")
    return True


# ── Step 5: Human-readable summary file (not read by APEX at runtime) ───────
def update_summary_file(repos, resume_text):
    os.makedirs(os.path.dirname(OUTPUT_SUMMARY), exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    parts = [
        f"Last auto-synced: {stamp}",
        "(This file is a human-readable snapshot only. APEX's actual knowledge",
        " lives in src/app/api/chat/route.ts and is NOT read from this file",
        " at request-time, to keep token costs low and predictable.)",
        "",
    ]

    if repos:
        parts.append("=== ALL GITHUB REPOSITORIES ===")
        for r in repos[:20]:
            parts.append(f"{r['name']} ({r['language']}, {r['stars']}★)")
            parts.append(f"  {r['description'] or '(no description)'}")
            parts.append(f"  {r['url']}")
        parts.append("")

    if resume_text:
        parts.append("=== RESUME TEXT (extracted) ===")
        parts.append(resume_text[:6000])

    with open(OUTPUT_SUMMARY, "w", encoding="utf-8") as f:
        f.write("\n".join(parts))
    print(f"[OK] Refreshed {OUTPUT_SUMMARY}.")


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    print(f"=== APEX Brain Update — {datetime.now(timezone.utc).isoformat()} ===")

    repos = fetch_github_repos()
    print(f"[INFO] Fetched {len(repos)} public repos.")

    resume_text = extract_resume_text()
    if resume_text:
        print(f"[INFO] Extracted {len(resume_text)} characters from {RESUME_PDF}.")

    block = format_new_repos_block(repos)
    if block:
        print(f"[INFO] Found {block.count(chr(10))} new repo line(s) to add.")
    else:
        print("[INFO] No new repos beyond the curated 6 — AUTO_SYNCED_REPOS stays empty.")

    update_route_file(block)
    update_summary_file(repos, resume_text)

    print("[DONE]")


if __name__ == "__main__":
    main()
