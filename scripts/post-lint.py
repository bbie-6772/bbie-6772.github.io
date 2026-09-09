#!/usr/bin/env python3
"""포스트 초안 검사기 — Jekyll(kramdown+GFM) / MathJax / yat 테마 기준.

과거 렌더링 문제를 바탕으로 한 간이 검사다. 완전한 YAML/Liquid 파서가 아니다.
실제 빌드 도구의 사용 가능 여부는 실행 환경에서 확인한다.

    python scripts/post-lint.py _posts/2026-08-20-ssafy.md
    python scripts/post-lint.py _posts          # 전체 스캔

ERROR = 그대로 배포하면 안 되는 것(렌더링 파손·미완성), WARN = 사람이 확인할 후보.
문체 교정 후보는 WARN으로만 제시하며, 분량·이미지 개수는 검사하지 않는다.
종료 코드: ERROR 있으면 1.
"""
import os
import re
import sys

TAXONOMY = re.compile(r"^(sVLM|[A-Z0-9][A-Za-z0-9+#.]*(-[A-Za-z0-9+#.]+)*)$")
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
    # 카테고리/태그 표기: 영문 Title-Case + 하이픈 (jekyll.md '카테고리·태그 표기 규칙')
    cat = fm.get("categories", "")
    if isinstance(cat, str) and cat and not TAXONOMY.match(cat):
        out("WARN", 1, f"categories 표기가 관례와 다르다 (영문 Title-Case + 하이픈): {cat}")
    if isinstance(tags, str) and tags.startswith("["):
        for t in [x.strip() for x in tags.strip("[]").split(",") if x.strip()]:
            if not TAXONOMY.match(t):
                out("WARN", 1, f"태그 표기가 관례와 다르다 (영문 Title-Case + 하이픈): {t}")
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
        # 표 행의 \\ 같은 표기는 문자를 그대로 보여주려는 이스케이프다
        is_table_row = line.strip().startswith("|") and line.strip().endswith("|")
        for m in re.finditer(r"\\([^A-Za-z])", "" if is_table_row else line):
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

        # --- 표 열 수 ---
        if is_table_row:
            # 셀 안의 \| 는 열 구분자가 아니다
            table_widths.append((n, line.replace("\\|", "").count("|")))
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
    # 제목 중복 후보만 알린다. 문체·소제목·요약 개수는 강제하지 않는다.
    in_fence = False
    for idx, line in enumerate(body):
        if FENCE.match(line):
            in_fence = not in_fence
        elif not in_fence and re.match(r"^# ", line):
            out("WARN", idx + 1, "본문 h1이 front matter 제목과 중복되는지 확인한다")


def check_liquid(body, offset, out):
    """raw 구간을 존중하는 간이 검사. 코드블록도 Liquid 처리 대상이다."""
    text = "\n".join(body)
    token = re.compile(r"\{%[-]?\s*(raw|endraw)\s*[-]?%\}")
    raw_start = None
    cursor = 0

    def inspect(segment, position):
        # 정상적인 Jekyll 링크 태그는 파손으로 판정하지 않는다.
        segment = re.sub(r"\{%[-]?\s*(?:post_url|link)\s+[^%]+%\}",
                         lambda match: " " * len(match.group()), segment)
        for match in re.finditer(r"\{\{|\{%", segment):
            line = offset + text.count("\n", 0, position + match.start()) + 1
            out("WARN", line, "Liquid 문법이 의도한 템플릿인지 확인한다. 문자 그대로 보여줄 예제는 raw/endraw로 감싼다. 코드블록만으로는 보호되지 않는다")

    for match in token.finditer(text):
        line = offset + text.count("\n", 0, match.start()) + 1
        if raw_start is None:
            inspect(text[cursor:match.start()], cursor)
            if match.group(1) == "raw":
                raw_start = line
            else:
                out("ERROR", line, "대응하는 raw 없이 endraw가 나온다")
        elif match.group(1) == "endraw":
            raw_start = None
        cursor = match.end()
    if raw_start is None:
        inspect(text[cursor:], cursor)
    else:
        out("ERROR", raw_start, "Liquid raw 블록이 닫히지 않았다")


def check_images(body, root, out):
    for idx, line in enumerate(body):
        if "TODO:이미지" in line:
            out("ERROR", idx + 1, "이미지 자리표시자가 남아 있다 — 사용자에게 다시 요청하거나 그 대목을 덜어내라")
        for m in re.finditer(r"!\[[^\]]*\]\((/[^)\s]+)\)", line):
            rel = m.group(1).lstrip("/")
            full = os.path.join(root, rel)
            if not os.path.exists(full):
                out("ERROR", idx + 1, f"이미지 파일이 없다: {m.group(1)}")
            elif rel.endswith(".svg"):
                check_svg(full, idx + 1, out)


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


# --- 문체 교정 후보 (전부 WARN) ---
# 오탐이 큰 후보는 _posts 265건 측정으로 걸러냈다. 남긴 것들의 제외 조건이 3번째 항목이다.
# 무생물 주어 사역('이 도구는 시간을 단축시켜 줍니다')은 정규식 오탐이 커서 넣지 않는다.
SLOP = [
    (re.compile(r"[을를]\s*가지고\s*있(?!는)"), "'~을 가지고 있다' → '~이 있다'", None),
    (re.compile(r"[함음]에\s*있어"), "'~함에 있어' → '~할 때'", None),
    (re.compile(r"(되어지|보여지|불려지|쓰여지)"), "이중피동 — 능동이나 단일 피동으로", None),
    (re.compile(r"중\s*하나(다|이다|입니다|였다|이었다|였습니다)"),
     "'~중 하나다' — one of the 직역. 무엇 중에서 왜 그것인지 쓴다",
     re.compile(r"(둘|셋|넷|다섯|여섯|[0-9])\s*중\s*하나")),
    (re.compile(r"[라다]고\s*할\s*수\s*있"), "'~라고 할 수 있다' — 단정하거나 근거를 쓴다", None),
    (re.compile(r"중요한\s*역할"), "'중요한 역할을 한다' — 무엇이 어떻게 달라지는지 쓴다", None),
    (re.compile(r"(획기적|혁신적|무궁무진)"), "근거 없는 수식어 — 무엇과 견줘 그런지 쓴다", None),
    (re.compile(r"(알아보겠|살펴보겠|알아봅시다|살펴봅시다)"), "정형 도입구 — 본론으로 바로 들어간다", None),
    (re.compile(r"^\s*(결론적으로|마무리하며)"), "정형 마무리구 — 남길 말이 있으면 그 말만 쓴다", None),
]
# 단어 자체가 아니라 문단마다 반복되는 것이 문제다. 그래서 문단 첫머리만, 3회부터 센다.
CONJ = re.compile(r"^\s*(또한|게다가|더욱이|따라서|결과적으로|뿐만\s*아니라)")
CONJ_LIMIT = 3
# 문장 길이 변동계수. _posts 165건(문장 20개 이상) 분포에서 하위 5%가 0.538,
# 최솟값이 0.292였다. 0.45는 사람 글 2%(3건)만 건드린다.
CV_MIN_SENTENCES = 20
CV_FLOOR = 0.45


def check_slop(body, offset, out):
    """번역투·빈 수식어·균질한 리듬의 교정 후보. 전부 WARN이며 판단은 사람이 한다."""
    prose, in_fence, prev_blank = [], False, True
    for idx, line in enumerate(body):
        if FENCE.match(line):
            in_fence = not in_fence
            prev_blank = False
            continue
        if in_fence:
            continue
        stripped = line.strip()
        if not stripped:
            prev_blank = True
            continue
        # 인용·표·헤딩·들여쓴 코드는 저자가 옮겨 온 것이거나 산문이 아니다
        if stripped.startswith(("#", ">", "|")) or line.startswith(("    ", "	")):
            prev_blank = False
            continue
        prose.append((idx + offset + 1, line, prev_blank))
        prev_blank = False

    for n, line, _ in prose:
        for rx, msg, skip in SLOP:
            if rx.search(line) and not (skip and skip.search(line)):
                out("WARN", n, f"문체 후보: {msg}")

    conj = [n for n, line, first in prose if first and CONJ.match(line)]
    if len(conj) >= CONJ_LIMIT:
        lines = ", ".join(f"L{n}" for n in conj)
        out("WARN", conj[0], f"문단 첫머리 접속사가 {len(conj)}회 — 연결어 없이 이어지는지 본다 ({lines})")

    text = " ".join(l for _, l, _ in prose)
    text = re.sub(r"`[^`]*`", "", text)
    text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", text)
    lengths = [len(p.strip()) for p in re.split(r"(?<=[.!?다])\s+", text) if len(p.strip()) > 1]
    if len(lengths) >= CV_MIN_SENTENCES:
        mean = sum(lengths) / len(lengths)
        var = sum((x - mean) ** 2 for x in lengths) / len(lengths)
        cv = (var ** 0.5) / mean if mean else 0
        if cv < CV_FLOOR:
            out("WARN", 1, f"문장 길이가 균일하다 (변동계수 {cv:.2f} < {CV_FLOOR}) — 긴 설명과 짧은 단정이 섞이는지 본다")


def lint(path, root):
    found = []

    def out(level, line, msg):
        found.append((level, line, msg))

    with open(path, encoding="utf-8") as f:
        text = f.read()
    fm, body, offset = split_front_matter(text, out)
    check_front_matter(fm, path, out)
    check_body(body, offset, out)
    if str(fm.get("render_with_liquid", "true")).lower() != "false":
        check_liquid(body, offset, out)
    check_convention(fm, body, out)
    check_slop(body, offset, out)
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
