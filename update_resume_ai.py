"""
APEX AI BRAIN UPDATER - Uday Raj Portfolio
============================================
Reads ACTUAL CODE from every GitHub repo, not just descriptions.
Extracts: imports, classes, functions, docstrings, architecture patterns.

HOW TO USE:
  1. Replace resume_updated.pdf with your latest resume
  2. (Optional) Set GITHUB_TOKEN below for higher API rate limits
  3. Run: python update_resume_ai.py
  4. git add public/resume_data.txt && git commit -m "update brain" && git push
"""

import os, sys, re, json, base64, time
import urllib.request, urllib.error
import pdfplumber
from datetime import datetime

# ── CONFIG ────────────────────────────────────────────────────────────────────
PORTFOLIO_DIR = os.path.dirname(os.path.abspath(__file__))
RESUME_PDF    = os.path.join(PORTFOLIO_DIR, "resume_updated.pdf")
OUTPUT_TXT    = os.path.join(PORTFOLIO_DIR, "public", "resume_data.txt")
GITHUB_USER   = "udayraj1238"
LINKEDIN_URL  = "https://www.linkedin.com/in/uday6002/"

# ── GitHub Token (NEVER hardcode this — keep it out of git) ──────────────────
# Option A: Set env var in your terminal before running:
#   PowerShell:  $env:GITHUB_TOKEN = "ghp_yourtoken"
#   CMD:         set GITHUB_TOKEN=ghp_yourtoken
# Option B: Add to Portfolio/.env.local (already gitignored):
#   GITHUB_TOKEN=ghp_yourtoken
def _read_token() -> str:
    # 1. Try .env.local FIRST (user's personal token takes priority)
    env_path = os.path.join(PORTFOLIO_DIR, ".env.local")
    if os.path.exists(env_path):
        with open(env_path, encoding="utf-8-sig") as f:
            for line in f:
                line = line.strip()
                if line.startswith("GITHUB_TOKEN="):
                    val = line.split("=", 1)[1].strip()
                    if val and val != "PASTE_YOUR_NEW_TOKEN_HERE":
                        return val
    # 2. Fall back to environment variable
    tok = os.environ.get("GITHUB_TOKEN", "").strip()
    return tok

GITHUB_TOKEN = _read_token()

# Code extensions to analyze
CODE_EXTS = {'.py', '.ts', '.tsx', '.js', '.jsx', '.md', '.ipynb', '.yaml', '.yml'}
# Files/dirs to skip
SKIP_PATTERNS = {
    'node_modules', '.next', '__pycache__', '.git', 'package-lock.json',
    'yarn.lock', '.gitignore', 'dist/', 'build/', '.env', 'venv/', '.venv/'
}
MAX_FILES_PER_REPO = 12   # Max files to analyze per repo
MAX_CHARS_PER_FILE = 6000  # Max chars to read from each file


# ── GitHub API Helper ─────────────────────────────────────────────────────────
def gh_api(endpoint: str) -> dict | list | None:
    url = f"https://api.github.com/{endpoint}"
    headers = {"User-Agent": "APEX-Brain-Updater", "Accept": "application/vnd.github.v3+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            remaining = resp.headers.get("X-RateLimit-Remaining", "?")
            if remaining != "?" and int(remaining) < 5:
                print(f"   [WARN] GitHub rate limit almost exhausted ({remaining} left). Set GITHUB_TOKEN for more.")
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        if e.code == 403:
            print(f"   [WARN] GitHub rate limit hit. Set GITHUB_TOKEN in update_resume_ai.py")
        return None
    except Exception as e:
        print(f"   [WARN] API error for {endpoint}: {e}")
        return None


def gh_file_content(owner: str, repo: str, path: str) -> str:
    """Fetch and decode a file's content from GitHub."""
    data = gh_api(f"repos/{owner}/{repo}/contents/{path}")
    if not data or not isinstance(data, dict):
        return ""
    if data.get("encoding") == "base64":
        try:
            return base64.b64decode(data["content"]).decode("utf-8", errors="replace")
        except Exception:
            return ""
    return data.get("content", "")


# ── Smart Code Extractor ──────────────────────────────────────────────────────
def extract_python_insights(code: str, filepath: str) -> str:
    """Extract meaningful technical info from Python code."""
    lines = code.splitlines()
    insights = []

    # Imports — what libraries does this use?
    imports = []
    for line in lines:
        line_s = line.strip()
        if line_s.startswith(("import ", "from ")) and len(imports) < 30:
            imports.append(line_s)
    if imports:
        insights.append("IMPORTS (Libraries used):\n" + "\n".join(imports))

    # Classes with docstrings
    classes = []
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if line.startswith("class "):
            class_def = line
            docstring = ""
            if i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                if next_line.startswith('"""') or next_line.startswith("'''"):
                    end_marker = next_line[:3]
                    if next_line.count(end_marker) >= 2:
                        docstring = next_line.strip(end_marker).strip()
                    else:
                        doc_lines = [next_line.lstrip(end_marker)]
                        j = i + 2
                        while j < len(lines) and end_marker not in lines[j]:
                            doc_lines.append(lines[j].strip())
                            j += 1
                        docstring = " ".join(doc_lines).strip()
            classes.append(f"  class {class_def[6:]}: {docstring}" if docstring else f"  class {class_def[6:]}")
        i += 1
    if classes:
        insights.append("CLASSES:\n" + "\n".join(classes[:15]))

    # Functions with docstrings
    functions = []
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if line.startswith("def ") or line.startswith("async def "):
            fn_sig = line.rstrip(":")
            docstring = ""
            if i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                if next_line.startswith('"""') or next_line.startswith("'''"):
                    end_marker = next_line[:3]
                    if next_line.count(end_marker) >= 2:
                        docstring = next_line.strip(end_marker).strip()
                    else:
                        doc_lines = [next_line.lstrip(end_marker)]
                        j = i + 2
                        while j < min(len(lines), i + 6) and end_marker not in lines[j]:
                            doc_lines.append(lines[j].strip())
                            j += 1
                        docstring = " ".join(doc_lines).strip()
            entry = f"  {fn_sig}" + (f" -- {docstring}" if docstring else "")
            functions.append(entry)
        i += 1
    if functions:
        insights.append("FUNCTIONS/METHODS:\n" + "\n".join(functions[:20]))

    # Key constants and config variables (ALL_CAPS or obvious config)
    constants = []
    for line in lines:
        stripped = line.strip()
        if re.match(r'^[A-Z_]{3,}\s*=', stripped) and "import" not in stripped:
            constants.append(f"  {stripped}")
            if len(constants) >= 15:
                break
    if constants:
        insights.append("KEY CONSTANTS/CONFIG:\n" + "\n".join(constants))

    # Inline comments that describe the code
    comments = []
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("#") and len(stripped) > 10 and "TODO" not in stripped:
            comment = stripped.lstrip("# ").strip()
            if len(comment) > 15:
                comments.append(f"  # {comment}")
                if len(comments) >= 10:
                    break
    if comments:
        insights.append("KEY CODE COMMENTS:\n" + "\n".join(comments))

    return "\n\n".join(insights)


def extract_notebook_insights(content: str, filepath: str) -> str:
    """Extract code and markdown from Jupyter notebooks."""
    try:
        nb = json.loads(content)
        cells = nb.get("cells", [])
        insights = []
        code_cells = 0
        for cell in cells:
            cell_type = cell.get("cell_type", "")
            source = "".join(cell.get("source", []))
            if not source.strip():
                continue
            if cell_type == "markdown" and len(source) > 20:
                # Take first few markdown cells as context
                insights.append(f"[NOTEBOOK DOC]: {source[:400]}")
            elif cell_type == "code" and code_cells < 8:
                # Extract imports and key lines from code cells
                code_lines = source.splitlines()
                key_lines = [l for l in code_lines if
                             l.strip().startswith(("import ", "from ", "class ", "def ", "#")) and
                             len(l.strip()) > 3]
                if key_lines:
                    insights.append(f"[CODE CELL {code_cells+1}]:\n" + "\n".join(key_lines[:15]))
                code_cells += 1
        return "\n\n".join(insights[:15])
    except Exception:
        return ""


def extract_ts_insights(code: str, filepath: str) -> str:
    """Extract insights from TypeScript/JavaScript files."""
    lines = code.splitlines()
    insights = []

    # Imports
    imports = [l.strip() for l in lines if l.strip().startswith(("import ", "from ")) and len(l.strip()) > 10]
    if imports:
        insights.append("IMPORTS:\n" + "\n".join(imports[:20]))

    # Interface/type definitions
    types = [l.strip() for l in lines if re.match(r'^(export\s+)?(interface|type|enum)\s+', l.strip())]
    if types:
        insights.append("TYPES/INTERFACES:\n" + "\n".join(types[:15]))

    # Function/component definitions
    funcs = [l.strip() for l in lines if re.match(
        r'^(export\s+)?(default\s+)?(function|const|async function|class)\s+', l.strip()
    )]
    if funcs:
        insights.append("FUNCTIONS/COMPONENTS:\n" + "\n".join(funcs[:15]))

    # Comments
    comments = [l.strip() for l in lines if l.strip().startswith("//") and len(l.strip()) > 12]
    if comments:
        insights.append("CODE COMMENTS:\n" + "\n".join(comments[:10]))

    return "\n\n".join(insights)


def extract_markdown(content: str) -> str:
    """Extract text from markdown files."""
    return content[:3000].strip()


def analyze_file(content: str, filepath: str) -> str:
    ext = os.path.splitext(filepath)[1].lower()
    if not content.strip():
        return ""
    if ext == ".py":
        return extract_python_insights(content[:MAX_CHARS_PER_FILE], filepath)
    elif ext == ".ipynb":
        return extract_notebook_insights(content, filepath)
    elif ext in (".ts", ".tsx", ".js", ".jsx"):
        return extract_ts_insights(content[:MAX_CHARS_PER_FILE], filepath)
    elif ext == ".md":
        return extract_markdown(content)
    elif ext in (".yaml", ".yml"):
        return f"CONFIG:\n{content[:1000]}"
    return ""


# ── Repo Deep Scanner ─────────────────────────────────────────────────────────
def deep_scan_repo(owner: str, repo_name: str, default_branch: str) -> str:
    """
    Fetch the full file tree of a repo and analyze actual source code.
    Returns a rich technical summary built from the code itself.
    """
    print(f"   Scanning: {repo_name}...")

    # Get recursive file tree
    tree_data = gh_api(f"repos/{owner}/{repo_name}/git/trees/{default_branch}?recursive=1")
    if not tree_data or "tree" not in tree_data:
        return f"  Could not access {repo_name} source tree."

    all_files = tree_data["tree"]

    # Filter to code files we care about
    def should_include(f):
        path = f.get("path", "")
        if f.get("type") != "blob":
            return False
        if f.get("size", 0) > 150_000:
            return False
        if any(skip in path for skip in SKIP_PATTERNS):
            return False
        ext = os.path.splitext(path)[1].lower()
        return ext in CODE_EXTS

    code_files = [f for f in all_files if should_include(f)]

    # Prioritize: main files first, then notebooks, then others
    def file_priority(f):
        path = f["path"].lower()
        name = os.path.basename(path)
        score = 0
        if name in ("main.py", "train.py", "model.py", "app.py", "index.py"):
            score += 100
        if name.endswith(".ipynb"):
            score += 80  # notebooks are gold — lots of documented code
        if name.endswith(".py"):
            score += 50
        if "readme" in name:
            score += 60
        if "test" in path or "example" in path:
            score -= 20
        if path.count("/") > 2:
            score -= 10  # deeply nested files are less important
        return -score  # lower = higher priority

    code_files.sort(key=file_priority)
    selected = code_files[:MAX_FILES_PER_REPO]

    file_analyses = []
    for f in selected:
        path = f["path"]
        content = gh_file_content(owner, repo_name, path)
        time.sleep(0.1)  # be polite to GitHub API
        if not content:
            continue
        analysis = analyze_file(content, path)
        if analysis and len(analysis) > 50:
            file_analyses.append(
                f"--- File: {path} ---\n{analysis}"
            )

    if not file_analyses:
        return f"  No analyzable code files found in {repo_name}."

    return "\n\n".join(file_analyses)


# ── All Repos Scanner ─────────────────────────────────────────────────────────
def fetch_all_repos_deep(username: str) -> str:
    """Fetch all repos and deep-scan their actual code."""
    repos_data = gh_api(f"users/{username}/repos?sort=updated&per_page=100")
    if not repos_data or not isinstance(repos_data, list):
        return "GitHub unavailable."

    repos = [r for r in repos_data if not r.get("fork")]
    print(f"   [OK] Found {len(repos)} repos. Deep scanning code now...")

    all_sections = []
    for repo in repos:
        name = repo["name"]
        desc = repo.get("description") or "No description"
        lang = repo.get("language") or "Unknown"
        stars = repo.get("stargazers_count", 0)
        branch = repo.get("default_branch", "main")
        url = repo.get("html_url", "")

        header = (
            f"=== REPO: {name} ===\n"
            f"URL: {url}\n"
            f"Description: {desc}\n"
            f"Primary Language: {lang} | Stars: {stars}\n"
        )

        code_analysis = deep_scan_repo(username, name, branch)
        all_sections.append(header + "\nCODE ANALYSIS (from actual source files):\n" + code_analysis)

    return "\n\n" + ("=" * 60 + "\n").join(all_sections)


# ── Resume Extraction ─────────────────────────────────────────────────────────
def extract_pdf(path: str) -> str:
    if not os.path.exists(path):
        print(f"[ERR] File not found: {path}")
        print(f"   -> Place resume at: {path}")
        return ""
    print(f"[READ] PDF: {path} ({os.path.getsize(path):,} bytes)")

    text = ""

    # Method 1: PyMuPDF (handles more PDF types)
    try:
        import fitz
        doc = fitz.open(path)
        if doc.page_count > 0:
            for page in doc:
                t = page.get_text()
                if t:
                    text += t + "\n"
            doc.close()
            if text.strip():
                print(f"   [OK] PyMuPDF extracted {len(text)} chars from {doc.page_count} pages.")
                return text.strip()
        else:
            print(f"   [WARN] PyMuPDF: PDF has 0 pages (may be corrupted or image-only).")
    except Exception as e:
        print(f"   [WARN] PyMuPDF failed: {e}")

    # Method 2: pdfplumber fallback
    try:
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        if text.strip():
            print(f"   [OK] pdfplumber extracted {len(text)} chars.")
            return text.strip()
    except Exception as e:
        print(f"   [WARN] pdfplumber failed: {e}")

    print("   [ERR] Could not extract text from PDF.")
    print("         Your resume PDF appears to be image-based or corrupted.")
    print("         FIX: Open your resume in Word/Google Docs -> Export as PDF (not scan/print to PDF)")
    print("         The AI brain will use GitHub + hardcoded data for now.")
    return ""


# ── LinkedIn Fetch ────────────────────────────────────────────────────────────
def fetch_linkedin(url: str) -> str:
    # Instead of scraping (which LinkedIn blocks), we read from linkedin_data.txt
    data_path = os.path.join(PORTFOLIO_DIR, "linkedin_data.txt")
    if os.path.exists(data_path):
        try:
            with open(data_path, "r", encoding="utf-8") as f:
                content = f.read().strip()
                print(f"   [OK] LinkedIn data read from file ({len(content)} chars).")
                return content
        except Exception as e:
            print(f"   [WARN] Could not read linkedin_data.txt: {e}")
    else:
        print(f"   [WARN] linkedin_data.txt not found at {data_path}.")
    
    return "LinkedIn data unavailable. Please populate linkedin_data.txt."


# ── Knowledge File Builder ────────────────────────────────────────────────────
def build_knowledge_file(resume: str, github: str, linkedin: str) -> str:
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    return f"""========================================================
  UDAY RAJ - APEX AI KNOWLEDGE BASE
  Last Updated: {now}
  Source: PDF Resume + GitHub Code Analysis + LinkedIn
========================================================

== SECTION 1: RESUME (Primary Source) ==
{resume}

== SECTION 2: LINKEDIN ==
{linkedin}

== SECTION 3: GITHUB - DEEP CODE ANALYSIS ==
(The following is extracted directly from actual source code in each repository.
 This includes imports, classes, functions, docstrings, and architecture patterns.)

{github}
""".strip()


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    print("\n+============================================+")
    print("|  APEX AI BRAIN - Deep Code Analysis Mode  |")
    print("+============================================+\n")
    if not GITHUB_TOKEN:
        print("  [TIP] Set GITHUB_TOKEN in this file for 5000 API req/hr (vs 60 now).\n")

    # 1. Resume
    print("Step 1/4 - Extracting resume from PDF...")
    resume = extract_pdf(RESUME_PDF)
    print(f"   [OK] {len(resume)} characters extracted.\n")

    # 2. GitHub Deep Scan
    print("Step 2/4 - Deep scanning GitHub repos (reading actual code)...")
    github = fetch_all_repos_deep(GITHUB_USER)
    print(f"   [OK] GitHub code analysis complete.\n")

    # 3. LinkedIn
    print("Step 3/4 - Fetching LinkedIn profile...")
    linkedin = fetch_linkedin(LINKEDIN_URL)
    print()

    # 4. Write
    print("Step 4/4 - Writing knowledge base...")
    content = build_knowledge_file(resume, github, linkedin)
    os.makedirs(os.path.dirname(OUTPUT_TXT), exist_ok=True)
    with open(OUTPUT_TXT, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"   [OK] {len(content):,} characters written to: {OUTPUT_TXT}\n")

    print("+============================================================+")
    print("|  [DONE] APEX AI brain updated with full code analysis!     |")
    print("|                                                            |")
    print("|  To deploy:                                                |")
    print("|  git add public/resume_data.txt                            |")
    print("|  git commit -m 'chore: deep code brain update'             |")
    print("|  git push                                                  |")
    print("+============================================================+\n")


if __name__ == "__main__":
    main()
