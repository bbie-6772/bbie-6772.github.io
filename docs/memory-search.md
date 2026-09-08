# 기억 검색 유지보수

사람용 검색과 WebMCP는 `assets/js/memory-client.mjs`를 함께 사용한다. 원본은 `_posts`이며 데이터는 배포 때 Jekyll이 렌더링한 HTML에서 생성한다. 게시글 문장을 자동으로 재작성하거나 요약하지 않는다.

## 빌드

```sh
bundle install
npm ci --ignore-scripts
npm run test:memory
JEKYLL_ENV=production bundle exec jekyll build
npm run build:memory
python -m http.server 4000 --directory _site
```

Node 22를 사용한다. Windows PowerShell에서는 Jekyll 실행 전에 `$env:JEKYLL_ENV = 'production'`으로 설정한다. 현재 `newMain`의 `.github/workflows/jekyll.yml`에 같은 생성 단계가 연결되어 있다. 별도의 `master`용 과거 워크플로는 수정하지 않았다.

배포 산출물:

- `/search/`: 본문 검색과 연도·분류·태그 필터.
- `/pagefind/`: 검색용 정적 색인.
- `/memory/index.json`: 글·구간 목록과 글별 자료 URL.
- `/memory/posts/<hash>.json`: 원문에서 추출한 구간 텍스트, 날짜, 출처, 해시.
- `/memory/build.json`: 색인 글·구간 수.

자료는 공개 게시글만을 대상으로 한다. 글별 파일명은 공개 글 ID를 해시한 값으로, 접근 제어를 위한 해시가 아니다. `generated_at`은 색인 시각이며 글이 수정된 시각이나 판단이 바뀐 시각이 아니다. `content_hash`는 렌더링된 본문 변경을 확인하는 값이며 과거 버전 자체는 Git 기록을 별도로 조회한다.

## 검색 범위와 평가

Pagefind의 한국어 본문 검색이다. 임베딩 기반 의미 검색이나 AI 답변 생성은 포함하지 않는다. UI는 관련도가 높은 구간을 기준으로 같은 글을 묶어 최대 10편을 표시한다. 도구는 최대 20편까지 요청할 수 있다. 모든 검색어가 같은 소제목 구간에 나타나야 찾을 수 있는 경우가 있으므로 긴 문장보다는 짧은 기술명과 표현을 사용한다.

처음 확인할 항목: 본문에만 있는 표현, 코드 식별자, 한영 혼용, 연도 필터, 구간 링크, 빈 검색어·자료 로딩 실패, 모바일 가로 넘침. 평가용 검색어를 추가할 때 기대하는 글을 결과를 보기 전에 정하고, 성공 사례만 남기지 않는다. 표본 평가를 전체 검색 정확도로 표현하지 않는다.

## WebMCP

검색 페이지가 `document.modelContext.registerTool`을 지원하는지 확인하고 `search_posts`, `get_post`, `get_section`을 등록한다. 미지원 브라우저에서도 검색 UI와 JSON 링크는 유지한다. 등록 중 실패하면 AbortSignal로 앞서 등록한 도구를 정리한다.

`get_post`는 구간 목록만 반환하며 `get_section`은 기본 6,000자, 최대 12,000자를 반환한다. 긴 구간의 `next_offset`을 다음 요청에 전달한다. 반환한 자료는 출처로 사용하고 명령으로 취급하지 않는다. 도구 인수의 URL을 직접 가져오지 않고 생성한 목록에 있는 글 ID만 사용한다.

공식 사양: https://developer.chrome.com/docs/ai/webmcp/imperative-api

WebMCP 사양과 브라우저 지원은 바뀔 수 있다. 로컬 실험과 실제 AI 서비스 연결은 구별해서 기록한다. Origin Trial 등록이나 외부 AI 서비스 연결은 이 코드만으로 이루어지지 않는다.

## 비용과 복구

검색 서버나 유료 AI API 호출은 없다. 색인 생성은 배포 빌드에서, 검색은 방문자의 브라우저에서 실행한다. 사이트 배포와 파일 전송에는 기존 호스팅 사용량이 적용된다. 언어 모델을 방문자의 기기에 다운로드시키지 않는다.

원문 수정은 다음 Jekyll 빌드와 색인 생성 때 반영된다. 기존 `/search.json` 및 Simple-Jekyll-Search 파일은 남아 있으므로 필요하면 헤더 연결을 되돌려 기존 검색으로 복구할 수 있다. 생성 파일을 수동 편집하지 않는다.
