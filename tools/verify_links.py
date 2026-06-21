"""
verify_links.py — 验证 banks/ 仓库内所有 HTML 的 href / link / src 指向真实存在

返回：
- 总文件数
- 总链接数
- broken 链接列表（含 source file + href + reason）
- 0 broken = pass
"""
import os
import re
import sys
from pathlib import Path

REPO_ROOT = Path("C:/Users/87092/banks").resolve()

PATTERN = re.compile(r'(href|src)="([^"]+)"')
SKIP_PREFIXES = ("#", "javascript:", "mailto:", "tel:", "http:", "https:", "data:")

# 已知存在的根目录文件（截图等不在迁移范围，不计入）
EXISTING_EXTENSIONS = (".html", ".css", ".js", ".png", ".svg", ".jpg", ".jpeg", ".webp", ".json")


def is_skippable(href: str) -> bool:
    return any(href.startswith(p) for p in SKIP_PREFIXES)


def main():
    html_files = list((REPO_ROOT / "mobile").rglob("*.html")) + list((REPO_ROOT / "desktop").rglob("*.html"))

    broken = []
    total_links = 0
    skipped = 0

    for html in sorted(html_files):
        text = html.read_text(encoding="utf-8")
        rel_html = html.relative_to(REPO_ROOT).as_posix()
        for m in PATTERN.finditer(text):
            attr, value = m.group(1), m.group(2)
            total_links += 1
            if is_skippable(value):
                skipped += 1
                continue
            # 解析相对路径
            target = (html.parent / value).resolve()
            try:
                target_rel = target.relative_to(REPO_ROOT)
            except ValueError:
                broken.append((rel_html, value, f"outside repo: {target}"))
                continue
            if not target.exists():
                broken.append((rel_html, value, f"missing: {target_rel.as_posix()}"))
            elif target.is_file() and not target_rel.as_posix().endswith(EXISTING_EXTENSIONS):
                broken.append((rel_html, value, f"unknown extension: {target_rel.as_posix()}"))

    print(f"[verify_links] Scanned {len(html_files)} HTML files")
    print(f"[verify_links] Total links: {total_links}, skipped: {skipped}, checked: {total_links - skipped}")
    if broken:
        print(f"\n[verify_links] FAIL: {len(broken)} broken links:")
        for src, href, reason in broken:
            print(f"  {src}  href={href!r}  -- {reason}")
        sys.exit(1)
    else:
        print(f"\n[verify_links] PASS: 0 broken links")


if __name__ == "__main__":
    main()