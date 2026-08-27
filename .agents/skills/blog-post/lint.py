#!/usr/bin/env python3
"""포스트 초안 검사기 — Jekyll(kramdown+GFM) / MathJax / yat 테마 기준.

이 레포에는 ruby/bundler가 없어서 `jekyll build`로 검증할 수 없다.
대신 실제로 깨졌던 사례(git 7f6360e, 093b45e, 857b6ba, db0a49a)를 규칙으로 박아둔다.

    python .claude/skills/blog-post/lint.py _posts/2026-08-20-ssafy.md
    python .claude/skills/blog-post/lint.py _posts          # 전체 스캔

ERROR = 그대로 배포하면 안 되는 것(렌더링 파손·미완성), WARN = 관례 위반(사람이 판단).
종료 코드: ERROR 있으면 1.
"""
import os
import re
import sys

REQUIRED_FM = ["layout", "title", "subtitle", "author", "categories", "banner", "tags"]
BANNER_KEYS = ["image", "opacity", "background", "height", "min_height"]
# 857b6ba: monospace 폴백에서 폭이 섞여 코드블록 정렬이 깨진 문자들
BAD_IN_CODE = "─│┌┐└┘├┤┬┴┼═║╔╗╚╝⁰¹²³⁴⁻ᵢⱼᶻ₀₁₂ₚ"
FENCE = re.compile(r"^\s*(```|~~~)")


def split_front_matter(text, out):
    lines = text.split("\n")
    if not lines or lines[0].strip() != "---":
        out("ERROR", 1, "front matter가 '---'로 시작하지 않는다")
        return {}, lines, 0
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            return parse_fm(lines[1:i], out), lines[i + 1:], i + 1
    out("ERROR", 1, "front matter가 닫히지 않았다")
    return {}, lines, 0


def parse_fm(fm_lines, out):
    """중첩 1단계까지만 보는 얕은 YAML 리더. banner 하위 키 확인이 목적."""
    fm, cur = {}, None
    for raw in fm_lines:
        if not raw.strip() or raw.lstrip().startswith("#"):
            continue
        m = re.match(r"^(\s*)([\w-]+):\s*(.*)$", raw)
        if not m:
            continue
        indent, key, val = m.group(1), m.group(2), m.group(3).strip()
        if not indent:
            fm[key] = val if val else {}
            cur = key if not val else None
        elif cur and isinstance(fm.get(cur), dict):
            fm[cur][key] = val
    return fm


def check_front_matter(fm, path, out):
    for k in REQUIRED_FM:
        if k not in fm:
            out("ERROR", 1, f"front matter에 '{k}' 없음")
    banner = fm.get("banner")
    if isinstance(banner, dict):
        for k in BANNER_KEYS:
            if k not in banner:
                out("WARN", 1, f"banner.{k} 없음 (다른 글과 배너 높이/투명도가 달라진다)")
    elif "banner" in fm:
        out("ERROR", 1, "banner는 하위 키를 가진 블록이어야 한다")
    tags = fm.get("tags", "")
    if isinstance(tags, str) and tags and not tags.startswith("["):
        out("WARN", 1, "tags는 [A, B] 형태 리스트로 쓴다")
    title = fm.get("title", "")
    # ': ' 는 YAML 매핑, ' #' 는 주석 시작. 'C#'처럼 앞에 공백 없는 #은 안전하다
    if isinstance(title, str) and re.search(r":\s|\s#", title) and not title.startswith(("'", '"')):
        out("ERROR", 1, "title에 ': ' 또는 ' #'이 있으면 따옴표로 감싸야 YAML이 안 깨진다")
    name = os.path.basename(path)
    if not re.match(r"^\d{4}-\d{2}-\d{2}-[\w.-]+\.md$", name):
        out("ERROR", 0, f"파일명이 YYYY-MM-DD-slug.md 형식이 아니다 (공백/한글 금지): {name}")


def check_body(body, offset, out):
    in_fence = False
    fence_start = 0
    dollar_lines = []
    prev_blank = True
    table_widths = []

    for idx, line in enumerate(body):
        n = idx + offset + 1
        if FENCE.match(line):
            in_fence = not in_fence
            if in_fence:
                fence_start = n
            prev_blank = False
            continue

        if in_fence:
            bad = sorted({c for c in line if c in BAD_IN_CODE})
            if bad:
                out("WARN", n, f"코드블록 안 폭 다른 문자 {''.join(bad)} — 정렬이 깨진다(857b6ba). 수식은 $$로 빼라")
            prev_blank = False
            continue

        # --- 디스플레이 수식 ---
        if line.strip() == "$$":
            nxt = body[idx + 1] if idx + 1 < len(body) else ""
            dollar_lines.append((n, prev_blank, not nxt.strip()))
        elif "$$" in line and line.strip() != "$$":
            out("ERROR", n, "$$ 는 반드시 단독 줄에 둔다 (kramdown이 문단으로 먹는다)")

        # --- kramdown 백슬래시 함정 (7f6360e, db0a49a) ---
        for m in re.finditer(r"\\([^A-Za-z])", line):
            ch = m.group(1)
            if ch in "{}%\\":
                out("ERROR", n, rf"'\{ch}' — kramdown이 백슬래시를 먹어 수식이 통째로 깨진다(7f6360e). "
                                r"\{ →\lbrace, \} →\rbrace, \% →수식 밖으로, \\ →블록 분리")
            elif ch in "; ,!:":
                out("WARN", n, rf"'\{ch}' 간격 명령 — 백슬래시가 먹혀 간격만 사라진다. 지우는 편이 낫다(db0a49a)")

        # --- 인라인 수식 안 부등호 (db0a49a) ---
        for m in re.finditer(r"\$([^$\n]{1,200})\$", line):
            if "<" in m.group(1) or ">" in m.group(1):
                out("ERROR", n, "인라인 수식 안의 < > 는 HTML로 먹힌다 → \\lt \\gt 로 바꿔라")

        # --- Liquid ---
        if "{{" in line or "{%" in line:
            out("ERROR", n, "본문의 {{ 또는 {% 는 Liquid가 해석한다. 코드블록 안으로 넣거나 {% raw %}로 감싸라")

        # --- 표 열 수 ---
        if line.strip().startswith("|") and line.strip().endswith("|"):
            table_widths.append((n, line.count("|")))
        elif table_widths:
            widths = {w for _, w in table_widths}
            if len(widths) > 1:
                out("ERROR", table_widths[0][0], f"표의 열 수가 어긋난다(파이프 개수 {sorted(widths)}) — 표가 통째로 문단이 된다")
            table_widths = []

        prev_blank = not line.strip()

    if in_fence:
        out("ERROR", fence_start, "코드블록 ``` 이 닫히지 않았다 — 이후 본문이 전부 코드로 렌더된다")
    if len(dollar_lines) % 2:
        out("ERROR", dollar_lines[-1][0], "$$ 개수가 홀수다 — 수식 블록이 닫히지 않았다")
    for i in range(0, len(dollar_lines) - 1, 2):
        if not dollar_lines[i][1]:
            out("ERROR", dollar_lines[i][0], "$$ 블록 앞에 빈 줄이 필요하다 (없으면 앞 문단에 붙어 렌더 실패)")
        if not dollar_lines[i + 1][2]:
            out("ERROR", dollar_lines[i + 1][0], "$$ 블록 뒤에 빈 줄이 필요하다 (없으면 뒷 문단과 한 덩어리가 된다)")


def check_convention(fm, body, out):
    # 코드블록 안의 '# 주석'을 h1으로 오인하지 않도록 펜스 구간을 걷어낸다
    kept, in_fence = [], False
    for line in body:
        if FENCE.match(line):
            in_fence = not in_fence
            continue
        kept.append("" if in_fence else line)
    text = "\n".join(kept)
    if "한줄 평" not in text:
        out("WARN", len(body), "'## 한줄 평' 마무리 섹션이 없다 (이 블로그 고정 관례)")
    if not re.search(r"^#{2,4} ", text, re.M):
        out("WARN", 1, "소제목(##)이 하나도 없다")
    if re.search(r"^# ", text, re.M):
        out("WARN", 1, "본문에 h1(#)을 쓰지 않는다. 제목은 front matter의 title이 담당한다")

    # --- 최신형 뼈대 (SKILL.md 「글의 뼈대」) ---
    if not re.search(r"^#{2,3} 개요", text, re.M):
        out("WARN", 1, "'## 개요' 섹션이 없다 (7월 이후 55편 중 45편이 이걸로 시작한다)")
    if not re.search(r"^#{2,3} (정리|요약)", text, re.M):
        out("WARN", len(body), "'## 정리' 섹션이 없다 — 한줄 평 앞에 개조식 압축을 넣는다")
    if text.count("\n> ") < 3:
        out("WARN", 1, f"'>' 인용 요약이 {text.count(chr(10) + '> ')}개뿐이다 (최근 글 평균 편당 9.8개). 섹션마다 결론 한 줄을 뽑아라")

    # 숨 돌릴 곳(--- 또는 ## 제목) 없이 길게 이어지는 구간
    last = 0
    for i, line in enumerate(kept):
        if line.strip() == "---" or re.match(r"^#{2,3} ", line):
            if i - last > 60:
                out("WARN", last + 1, f"{i - last}줄 동안 '---'나 소제목 없이 이어진다 — 섹션을 쪼개라")
            last = i


def check_images(body, root, out):
    total = 0
    for idx, line in enumerate(body):
        total += line.lstrip().startswith("![")
        if "TODO:이미지" in line:
            out("ERROR", idx + 1, "이미지 자리표시자가 남아 있다 — 사용자에게 다시 요청하거나 그 대목을 덜어내라")
        for m in re.finditer(r"!\[[^\]]*\]\((/[^)\s]+)\)", line):
            rel = m.group(1).lstrip("/")
            full = os.path.join(root, rel)
            if not os.path.exists(full):
                out("ERROR", idx + 1, f"이미지 파일이 없다: {m.group(1)}")
            elif rel.endswith(".svg"):
                check_svg(full, idx + 1, out)
    if total < 2:
        out("WARN", 1, f"이미지가 {total}장이다 (최근 글 평균 편당 2.8장). "
                       "실물이 있는 자리는 사용자에게 요청하고, 개념·비교는 직접 그려라")


def check_svg(path, line_no, out):
    """생성한 SVG가 파싱되는지, 요소가 viewBox를 벗어나지 않는지."""
    import xml.etree.ElementTree as ET
    name = os.path.basename(path)
    try:
        root = ET.parse(path).getroot()
    except ET.ParseError as e:
        out("ERROR", line_no, f"{name}: SVG XML 파싱 실패 — {e}")
        return
    vb = (root.get("viewBox") or "").split()
    if len(vb) != 4:
        out("WARN", line_no, f"{name}: viewBox가 없다 — 반응형 크기가 깨진다")
        return
    W, H = float(vb[2]), float(vb[3])
    for el in root.iter():
        tag = el.tag.split("}")[-1]
        if tag not in ("rect", "text", "line", "ellipse", "circle"):
            continue
        for attr, lim in (("x", W), ("x1", W), ("x2", W), ("cx", W),
                          ("y", H), ("y1", H), ("y2", H), ("cy", H)):
            v = el.get(attr)
            if v and _num(v) is not None and _num(v) > lim + 0.5:
                out("WARN", line_no, f"{name}: {tag}의 {attr}={v} 가 viewBox({W:.0f}x{H:.0f}) 밖 — 잘려 보인다")
        if tag == "rect":
            for pos, size, lim, side in (("x", "width", W, "오른쪽"), ("y", "height", H, "아래")):
                a, b = _num(el.get(pos)), _num(el.get(size))
                if a is not None and b is not None and a + b > lim + 0.5:
                    out("WARN", line_no, f"{name}: rect {side} 끝 {a + b:.0f} > {lim:.0f} — 잘려 보인다")


def _num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def lint(path, root):
    found = []

    def out(level, line, msg):
        found.append((level, line, msg))

    with open(path, encoding="utf-8") as f:
        text = f.read()
    fm, body, offset = split_front_matter(text, out)
    check_front_matter(fm, path, out)
    check_body(body, offset, out)
    check_convention(fm, body, out)
    check_images(body, root, out)
    return sorted(found, key=lambda f: f[1])


def main():
    # Windows 기본 콘솔이 cp949라 — 같은 문자에서 죽는다
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    # /assets/... 이미지 경로를 풀 기준. 스킬이 레포 밖에 설치돼도 맞도록 cwd를 쓴다
    # (레포 루트에서 실행하는 게 전제)
    root = os.getcwd()
    targets = []
    for arg in sys.argv[1:]:
        if os.path.isdir(arg):
            targets += sorted(os.path.join(arg, f) for f in os.listdir(arg) if f.endswith(".md"))
        else:
            targets.append(arg)

    errors = 0
    for path in targets:
        found = lint(path, root)
        if not found:
            continue
        print(f"\n{path}")
        for level, line, msg in found:
            print(f"  {level:5s} L{line:<5d} {msg}")
            errors += level == "ERROR"
    print(f"\n검사 {len(targets)}건 / ERROR {errors}건")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
