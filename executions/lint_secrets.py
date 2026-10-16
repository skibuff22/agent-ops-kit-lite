#!/usr/bin/env python3
"""
lint_secrets.py — stop hard-coded credentials before they reach git.

Scans tracked-looking source files for known secret shapes (Stripe, GitHub, AWS,
Slack, Google, OpenAI/Anthropic keys, private-key blocks, generic
`password = "..."`). Exit 1 on any finding. Wire it into pre-commit and CI.

Usage: py executions/lint_secrets.py [--root .] [--json]
       Add `# lint-secrets: allow` on a line to whitelist a deliberate test fixture.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("stripe live secret", re.compile(r"sk_live_[A-Za-z0-9]{20,}")),
    ("stripe restricted key", re.compile(r"rk_live_[A-Za-z0-9]{20,}")),
    ("stripe webhook secret", re.compile(r"whsec_[A-Za-z0-9]{20,}")),
    ("github token", re.compile(r"\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b|github_pat_[A-Za-z0-9_]{40,}")),
    ("aws access key", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    ("slack token", re.compile(r"\bxox[baprs]-[A-Za-z0-9-]{10,}\b")),
    ("google api key", re.compile(r"\bAIza[0-9A-Za-z_\-]{35}\b")),
    ("openai key", re.compile(r"\bsk-(proj-)?[A-Za-z0-9_\-]{32,}\b")),
    ("anthropic key", re.compile(r"\bsk-ant-[A-Za-z0-9_\-]{32,}\b")),
    ("private key block", re.compile(r"-----BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY-----")),
    ("hard-coded password", re.compile(r"""(?i)\b(password|passwd|pwd)\s*[:=]\s*["'][^"'\s]{6,}["']""")),
]
SCAN_EXT = {".py", ".js", ".ts", ".tsx", ".jsx", ".php", ".rb", ".go", ".java", ".cs", ".sh", ".ps1",
            ".yml", ".yaml", ".json", ".toml", ".ini", ".cfg", ".md", ".txt", ".html", ".env.example"}
SKIP_DIRS = {".git", "node_modules", ".venv", "venv", "dist", "build", "__pycache__", ".next"}
SKIP_FILES = {".env"}  # .env is where secrets BELONG; it must be gitignored (checked separately)


def scan(root: Path) -> dict:
    findings: list[dict] = []
    for p in root.rglob("*"):
        if any(part in SKIP_DIRS for part in p.parts) or not p.is_file():
            continue
        if p.name in SKIP_FILES or (p.suffix not in SCAN_EXT and not p.name.endswith(".env.example")):
            continue
        try:
            lines = p.read_text(encoding="utf-8", errors="replace").splitlines()
        except OSError:
            continue
        for i, line in enumerate(lines, 1):
            if "lint-secrets: allow" in line:
                continue
            for name, rx in PATTERNS:
                if rx.search(line):
                    findings.append({"file": p.relative_to(root).as_posix(), "line": i, "type": name})
    gitignore = root / ".gitignore"
    env_ignored = gitignore.is_file() and any(l.strip() in {".env", "*.env", ".env*"} for l in gitignore.read_text().splitlines())
    warnings = [] if env_ignored or not (root / ".env").exists() else [".env exists but is not listed in .gitignore"]
    return {"ok": not findings and not warnings, "findings": findings, "warnings": warnings}


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Scan for hard-coded secrets")
    ap.add_argument("--root", default=".")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args(argv)
    r = scan(Path(a.root).resolve())
    if a.json:
        print(json.dumps(r, indent=2))
    else:
        for f in r["findings"]:
            print(f"ERROR {f['file']}:{f['line']}: {f['type']}")
        for w in r["warnings"]:
            print(f"ERROR {w}")
        print(f"lint_secrets: {'PASS' if r['ok'] else 'FAIL'} ({len(r['findings'])} findings)")
    return 0 if r["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())
