<div align="center">

# 삐에로의 지식창고

**사람과 AI가 함께 다시 읽을 수 있는 기술 블로그**

[![Deploy](https://github.com/bbie-6772/bbie-6772.github.io/actions/workflows/jekyll.yml/badge.svg?branch=newMain)](https://github.com/bbie-6772/bbie-6772.github.io/actions/workflows/jekyll.yml)
[![Post Lint](https://github.com/bbie-6772/bbie-6772.github.io/actions/workflows/post-lint.yml/badge.svg)](https://github.com/bbie-6772/bbie-6772.github.io/actions/workflows/post-lint.yml)

[블로그](https://bbie-6772.github.io) · [본문 검색](https://bbie-6772.github.io/search/) · [AI 안내](https://bbie-6772.github.io/memory-guide/)

</div>

---

게임 프로젝트, SSAFY AI 과정, 해커톤, 알고리즘·CS 학습을 기록하는 블로그입니다.  
기록이 쌓일수록 결과보다 **당시의 판단 과정을 다시 찾는 일**이 중요해져, Jekyll 위에 검색·AI 연동·품질 검사를 직접 붙였습니다.

## ✨ 주요 기능

- **구간 단위 검색**: 소제목 단위로 색인해 본문 속 표현까지 찾고, 해당 구간으로 바로 이동합니다.
- **관련도 정렬**: 단순히 언급한 글보다 개념을 자세히 다룬 글을 먼저 보여 줍니다.
- **AI용 공개 데이터**: 글과 구간을 출처·게시일이 담긴 JSON으로 제공해 AI가 근거를 인용할 수 있습니다.
- **WebMCP 도구**: 브라우저 안의 AI가 글을 직접 검색하고 읽을 수 있습니다.
- **글 품질 검사**: 과거 렌더링 오류를 규칙화해 커밋과 CI에서 자동으로 검사합니다.
- **글쓰기 가이드**: AI와 함께 써도 저자의 문체가 남도록 규칙을 저장소에서 관리합니다.

## 🏗️ 구조

```text
_posts/*.md ──▶ Jekyll ──▶ _site/*.html ──▶ build-memory.mjs
                                                 │
                     ┌───────────────────────────┼────────────────┐
                     ▼                           ▼                ▼
              /pagefind/ (검색)        /memory/*.json (AI)   WebMCP 도구
```

| 경로 | 역할 |
|---|---|
| [`scripts/build-memory.mjs`](scripts/build-memory.mjs) | 구간 추출, 검색 색인·JSON 생성 |
| [`assets/js/`](assets/js) | 검색 UI, WebMCP 등록 |
| [`scripts/post-lint.py`](scripts/post-lint.py) | 글 품질 검사 |
| [`.claude/skills/blog-post/`](.claude/skills/blog-post) | 글쓰기 가이드 |

## 🛠️ 기술 스택

Jekyll · Pagefind · cheerio · Python · GitHub Actions · GitHub Pages

## 🚀 로컬 실행

```bash
bundle install && npm ci --ignore-scripts
JEKYLL_ENV=production bundle exec jekyll build
npm run build:memory
python -m http.server 4000 --directory _site
```

## 📄 라이선스

테마 코드는 [Jekyll Theme YAT](https://github.com/jeffreytse/jekyll-theme-yat)(© Jeffrey Tse)과 [Simple-Jekyll-Search](https://github.com/christian-fei/Simple-Jekyll-Search)(© Christian Fei) 기반으로 [MIT License](LICENSE.txt)를 따릅니다. 블로그 글과 직접 만든 이미지는 MIT 적용 대상이 아닙니다.
