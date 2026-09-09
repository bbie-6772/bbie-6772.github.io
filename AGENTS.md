# AGENTS.md

bbie-6772.github.io — Jekyll(kramdown/GFM) + yat 계열 테마 블로그.

글의 문체와 구성은 `blog-post` 스킬(`.claude/skills/blog-post/`)이 다룬다. 이 파일에는 스킬이 열리지 않은 세션에서도 지켜야 할 값만 적는다.

## 포스트 파일

- 경로는 `_posts/YYYY-MM-DD-slug.md`. slug에 공백과 한글을 넣지 않는다.
- 기존 글을 고칠 때 파일명(게시일)과 URL을 유지한다.
- 로컬 이미지는 `assets/images/<series>/` 아래에 둔다. 임시 경로를 참조하지 않는다.
- 긴 본문·코드는 언어 태그가 있는 코드블록에 넣는다.

## front matter

`layout`, `title`, `subtitle`, `author`, `categories`, `banner`, `tags`가 모두 있어야 한다. `author`는 `bbie`다. `banner`는 `image`, `opacity`, `background`, `height`, `min_height`를 하위 키로 갖는 블록이다.

`: `나 ` #`이 들어간 값은 따옴표로 감싼다. 안 그러면 YAML이 깨진다.

## 카테고리·태그 표기

전체 포스트를 한 번 정리해 맞춘 관례다. 임의로 새 표기를 만들지 않는다.

- 카테고리는 글마다 하나이며 시리즈 단위다. `Title-Case`에 하이픈으로 잇는다: `Unity-Project`, `AI-Practice`, `NHN-Hackathon`, `OpenAI-Game-Builders`, `Education-Product-Manager`. 공백·언더스코어·전부 소문자 표기는 쓰지 않는다.
- 새 시리즈를 시작할 때만 새 카테고리를 만든다. 기존 시리즈의 후속 글이면 `_posts`에서 그 시리즈의 카테고리를 그대로 확인해 쓴다.
- 태그도 `Title-Case` + 하이픈이며 영문으로 쓴다: `Game-Design`, `Troubleshooting`, `Deep-Learning`, `On-Device`, `Prompt-Engineering`. 한글 태그(`트러블슈팅`, `설계`)는 쓰지 않는다.
- 약어·고유명사는 원래 표기를 지킨다: `AI`, `NLP`, `ML`, `LLM`, `SSAFY`, `C#`, `C++`, `PyTorch`, `JavaScript`, `Unity`, `ScriptableObject`.
- 같은 개념에 이미 태그가 있으면 그것을 쓴다. 대소문자만 다른 변형(`ai`/`AI`), 붙여쓴 변형(`deeplearning`), 유의어 중복(`Prompting` 대 `Prompt-Engineering`)을 새로 만들지 않는다.

태그를 붙이기 전에 기존 목록을 확인한다.

```bash
grep -h '^tags:' _posts/*.md | sed 's/tags: \[//;s/\]//' | tr ',' '\n' | sed 's/^ *//' | sort -u
```

## 검사

포스트를 만들거나 고쳤으면 저장소 루트에서 실행한다. Python 3 표준 라이브러리만 쓴다.

```bash
python scripts/post-lint.py _posts/YYYY-MM-DD-slug.md
```

ERROR는 그대로 배포하면 렌더링이 깨지는 것이다. WARN은 사람이 판단할 후보이며, `문체 후보:` WARN은 이번에 생성한 문장에만 적용한다.

같은 검사가 pre-commit 훅과 CI에서 변경분에만 돈다. 훅은 클론마다 한 번 켜야 한다.

```bash
git config core.hooksPath .githooks
```

오탐이면 `git commit --no-verify`로 넘긴다. 요청 없이 과거 글의 오류를 함께 고치지 않는다.
