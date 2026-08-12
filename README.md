# 삐에로의 지식창고

[삐에로의 지식창고](https://bbie-6772.github.io)는 개발 과정에서 학습한 내용과 프로젝트 경험을 기록하는 GitHub Pages 블로그입니다. 정적 사이트 생성기 [Jekyll](https://jekyllrb.com/)과 [Jekyll Theme YAT](https://github.com/jeffreytse/jekyll-theme-yat)을 기반으로 운영합니다.

## 주요 기능

- 반응형 포스트 목록과 글별 이미지 배너
- 홈 화면 페이지네이션(페이지당 8개)
- 태그, 카테고리, 아카이브 페이지
- 라이트·다크 테마 전환 및 사용자 선택 유지
- 코드 문법 강조, 수식, Mermaid·PlantUML, 미디어와 확장 테이블
- PhotoSwipe 기반 이미지 미리보기
- Utterances 기반 GitHub Issues 댓글
- RSS 피드, SEO 메타데이터와 사이트맵
- 새 글·상단 글 배지
- GitHub Actions와 GitHub Pages를 이용한 자동 배포

### 관련도 기반 검색

헤더 검색은 빌드 시 생성되는 `search.json`과 Simple-Jekyll-Search를 사용하며 별도 검색 서버를 요구하지 않습니다.

검색 결과는 날짜만으로 정렬하지 않고 다음 신호를 합산합니다.

1. 제목의 완전·접두·부분 일치
2. 핵심 태그의 완전·부분 일치
3. 부제와 카테고리 일치
4. 본문 내 등장 횟수(최대 5회 반영)
5. 본문 앞부분 등장 여부
6. 관련도 동점 시 최신 날짜

점수는 검색어와 포스트별로 캐시하며, 전체 후보를 관련도순으로 정렬한 뒤 상위 50개만 렌더링합니다. 따라서 개념을 핵심 태그로 갖고 자세히 설명하는 글이 본문에서 단순히 언급한 글보다 우선됩니다.

## 기술 구성

| 영역 | 사용 기술 |
|---|---|
| 정적 사이트 | Jekyll 3.5 이상 5.0 미만, Kramdown(GFM) |
| 테마 | Jekyll Theme YAT 1.10.0 기반 커스터마이징 |
| 검색 | Simple-Jekyll-Search, Liquid 기반 JSON 인덱스 |
| 플러그인 | jekyll-feed, jekyll-seo-tag, jekyll-sitemap, jekyll-paginate, jekyll-spaceship |
| 댓글 | Utterances (`bbie-6772/blog-comments`) |
| 배포 | GitHub Actions, GitHub Pages |

## 저장소 구조

```text
.
├── _posts/                 # Markdown 포스트
├── _includes/              # 헤더·검색·댓글 등 재사용 뷰
├── _layouts/               # 페이지와 포스트 레이아웃
├── _sass/                  # YAT 및 블로그 스타일
├── assets/                 # JavaScript, CSS, 이미지
├── _config.yml             # 사이트와 플러그인 설정
├── search.json             # 빌드 시 생성되는 검색 인덱스 템플릿
├── index.html              # 홈
├── archives.html           # 아카이브
├── categories.html         # 카테고리
└── tags.html               # 태그
```

## 로컬 실행

Ruby와 Bundler가 필요합니다. GitHub Actions에서는 Ruby 3.1 환경으로 빌드합니다.

```bash
bundle install
bundle exec jekyll serve
```

브라우저에서 <http://localhost:4000>을 열어 확인합니다. `_config.yml`을 변경한 경우 개발 서버를 다시 시작해야 합니다.

프로덕션과 같은 방식으로 정적 결과물만 생성하려면 다음 명령을 사용합니다.

```bash
JEKYLL_ENV=production bundle exec jekyll build
```

생성 결과는 `_site/`에 저장됩니다.

## 포스트 작성

포스트는 `_posts/YYYY-MM-DD-name.md` 형식으로 작성합니다.

```yaml
---
layout: post
title: 글 제목
subtitle: 글의 핵심 설명
author: bbie
categories: category-name
tags: [Primary-Topic, Detailed-Concept]
banner:
  image: /assets/images/example/banner.png
---
```

검색 품질을 위해 태그에는 글에서 실제로 정의·구조·원리·사용법을 설명하는 개념을 기록합니다. 다음 글 예고나 한 번의 비교 언급에 불과한 개념은 태그로 추가하지 않습니다.

## 배포

`newMain` 브랜치에 푸시하면 GitHub Actions가 Jekyll을 빌드하고 GitHub Pages에 배포합니다. Ruby와 Bundler를 직접 설정하는 주 배포 구성은 [`.github/workflows/jekyll.yml`](.github/workflows/jekyll.yml)이며 수동 실행도 지원합니다. 저장소에는 GitHub Pages 기본 빌드 방식의 `jekyll-gh-pages.yml`도 함께 남아 있습니다.

배포 과정은 다음 순서로 진행됩니다.

```text
newMain push → Ruby/Bundler 설치 및 캐시 → Jekyll 프로덕션 빌드
→ Pages artifact 업로드 → GitHub Pages 배포
```

## 기반 테마와 라이선스

이 저장소는 Jeffrey Tse가 만든 [Jekyll Theme YAT](https://github.com/jeffreytse/jekyll-theme-yat)을 기반으로 수정되었습니다.

- YAT 원본 및 이 저장소에 포함된 테마 코드의 기반 라이선스: [MIT License](LICENSE.txt)
- YAT 원 저작권: Copyright © 2019 Jeffrey Tse
- Simple-Jekyll-Search: Copyright © 2015–2020 Christian Fei, MIT License

MIT 라이선스에 따라 테마 코드는 사용·복사·수정·배포할 수 있습니다. 복제하거나 상당 부분을 재배포할 때는 원 저작권 고지와 MIT 허가문을 함께 유지해야 합니다. 사이트 푸터의 YAT 출처 링크도 유지하고 있습니다.

`_posts/`의 블로그 글과 별도로 제작한 이미지 등 콘텐츠는 해당 파일에 별도 라이선스가 명시되지 않는 한 MIT 라이선스 적용 대상으로 간주하지 않습니다. 외부 이미지와 라이브러리는 각 원 저작자 및 개별 라이선스의 적용을 받습니다.

## 관련 링크

- [운영 블로그](https://bbie-6772.github.io)
- [Jekyll 문서](https://jekyllrb.com/docs/)
- [Jekyll Theme YAT 원본 저장소](https://github.com/jeffreytse/jekyll-theme-yat)
- [Simple-Jekyll-Search](https://github.com/christian-fei/Simple-Jekyll-Search)
- [Utterances](https://utteranc.es/)
