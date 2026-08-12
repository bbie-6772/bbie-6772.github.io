# 포스트 본문 기반 세부 태그 재검증 보고서

- 검증 대상: Git으로 추적 중인 `_posts` 포스트 200개
- 검증 범위: front matter뿐 아니라 각 파일의 전체 본문, 모든 2~4단계 제목, 부제
- 선정 원칙: 정의·구조·원리·사용법·한계를 실제로 설명한 개념만 핵심 태그로 채택
- 제외 원칙: 다음 글 예고, 링크·참고자료, 한 번의 비교 언급만 있는 개념은 태그에서 제외
- 검색 정렬: 제목·핵심 태그·부제·카테고리·본문 집중도를 합산하고 동점일 때만 최신 날짜 우선
- RNN 검증: `2026-08-10-ssafy2.md`가 순차 데이터, 은닉 상태, 장기 의존성, 기울기 소실을 본문에서 직접 설명하므로 관련 태그를 부여

## 포스트별 검증 결과

| 포스트 | 본문에서 인지한 중심 내용 | 검토 섹션 / 본문 길이 | 원본 대비 추가 태그 | 최종 태그 |
|---|---|---:|---|---|
| `2003-12-05-markdown-example.md` | 각 게시물에 부제목도 있어요! · Markdown 예시 · 기본 서식 · 리스트 | 15개 / 2,228자 | `Markdown` | `Markdown` |
| `2003-12-05-welcome-to-jekyll.md` | 대단한 정적 사이트 생성기 · 섹션 1 · 섹션 2 | 2개 / 1,117자 | 추가 없음 | `Jekyll` |
| `2024-09-30-pre-camp.md` | 게임서버 개발 부트캠프 · Q1. 내가 게임서버 트랙에 참여한 계기는 무엇인가요? · Q2. 내가 이해한 개발자(혹은 생각했던 직무)는 어떤 역할을 하는 사람인가요? · Q3. 서버 개발 혹은 게임 개발 관련 경험해보셨나요? 해보셨다면 어떤 경험을 하셨는지를 작성해주시고, 아니라면 찾아본 것을 작성해주세요 | 6개 / 778자 | `TIL` | `TIL` |
| `2024-10-02-pre-camp.md` | 게임서버 개발 부트캠프 · TIL(Today I Learned) - 요약 · TIL(Today I Learned) - 중간 과정 · 과제 제출 - SQL 문법을 연습해요 | 7개 / 4,085자 | `TIL` | `SQL`, `TIL` |
| `2024-10-04-pre-camp.md` | 게임서버 개발 부트캠프 · TIL(Today I Learned) - 요약 · TIL(Today I Learned) - 중간 과정 · WIL(Weekly I Learned) - 아티클 스터디 | 8개 / 3,404자 | `TIL` | `SQL`, `TIL` |
| `2024-10-05-assignment.md` | 게임서버 개발 부트캠프 · SQL 문법을 연습해요 · 7. 랭크게임 하다가 싸워서 피드백 남겼어요… · 8. LOL을 하다가 홧병이 나서 병원을 찾아왔습니다 | 6개 / 6,015자 | `TIL` | `SQL`, `TIL` |
| `2024-10-07-pre-camp.md` | 게임서버 개발 부트캠프 · TIL(Today I Learned) - 오늘의 공부 · TIL(Today I Learned) - 학습 과정 중 특이사항 | 2개 / 679자 | `TIL` | `TIL` |
| `2024-10-08-pre-camp.md` | 게임서버 개발 부트캠프 · TIL(Today I Learned) - 오늘의 공부 · TIL(Today I Learned) - 학습 과정 중 특이사항 · 과제 제출 | 14개 / 4,262자 | `Express`, `Java`, `JavaScript`, `TIL` | `Git`, `Express`, `Java`, `JavaScript`, `TIL` |
| `2024-10-10-pre-camp.md` | 게임서버 개발 부트캠프 · TIL(Today I Learned) - 오늘의 공부 · TIL(Today I Learned) - 학습 과정 중 특이사항 | 2개 / 932자 | `TIL` | `TIL` |
| `2024-10-11-pre-camp.md` | 게임서버 개발 부트캠프 · TIL(Today I Learned) - 오늘의 공부 · 팀 공부 **아티클 스터디** · [왕초보] 웹개발 종합반 3주차 3-5까지 수강 | 9개 / 2,077자 | `TIL` | `SQL`, `TIL` |
| `2024-10-14-pre-camp.md` | 게임서버 개발 부트캠프 · TIL(Today I Learned) - 오늘의 공부 · 팀 공부 **아티클 스터디** · 엑셀보다 쉽고 빠른 SQL 5주차까지 완강 및 과제 제출을 하였다 | 4개 / 1,907자 | `TIL` | `SQL`, `TIL` |
| `2024-10-15-pre-camp.md` | 게임서버 개발 부트캠프 · TIL(Today I Learned) - 오늘의 공부 · [왕초보] 웹개발 종합반 3주차 3-12까지 수강을 하였다 · 노션 퀘스트 SQL 실전! 과제 Lv3. 까지 수행 | 4개 / 1,312자 | `TIL` | `SQL`, `TIL` |
| `2024-10-16-pre-camp.md` | 게임서버 개발 부트캠프 · TIL(Today I Learned) - 오늘의 공부 · [왕초보] 웹개발 종합반 4주차를 수강했다 · 노션 퀘스트 SQL 실전! 과제 Lv3. 까지 수행 | 4개 / 2,067자 | `TIL` | `SQL`, `TIL` |
| `2024-10-17-pre-camp.md` | 게임서버 개발 부트캠프 · TIL(Today I Learned) - 오늘의 공부 · TIL(Today I Learned) - 학습 과정 중 특이사항 · 과제제출 | 6개 / 2,141자 | `TIL` | `SQL`, `TIL` |
| `2024-10-18-pre-camp.md` | 게임서버 개발 부트캠프 · TIL(Today I Learned) - 오늘의 공부 · TIL(Today I Learned) - 학습 과정 중 특이사항 · WIL(Weekly I Learned) - 이번 주의 실황 | 9개 / 3,963자 | `TIL` | `HTML`, `TIL` |
| `2024-10-21-pre-camp.md` | 게임서버 개발 부트캠프 · TIL(Today I Learned) - 오늘의 공부 · TIL(Today I Learned) - 학습 과정 중 특이사항 · 과제제출 | 4개 / 2,499자 | `TIL` | `HTML`, `TIL` |
| `2024-10-22-pre-camp.md` | 게임서버 개발 부트캠프 · TIL(Today I Learned) - 오늘의 공부 · TIL(Today I Learned) - 학습 과정 중 특이사항 · 과제제출 | 4개 / 4,320자 | `TIL` | `HTML`, `TIL` |
| `2024-10-23-pre-camp.md` | 게임서버 개발 부트캠프 · TIL(Today I Learned) - 오늘의 공부 · TIL(Today I Learned) - 학습 과정 중 특이사항 | 2개 / 532자 | `Jekyll` | `Jekyll` |
| `2024-10-28-bootcamp.md` | 게임서버 개발 부트캠프 · 1. 프로젝트 회의 · 2. 프로젝트 작업 · 학습 과정 중 특이사항 / 삽질 | 3개 / 1,554자 | `Web-Development`, `Team-Project` | `HTML`, `Web-Development`, `Team-Project` |
| `2024-10-29-bootcamp.md` | 게임서버 개발 부트캠프 · 1. Git / GitHub 를 이용한 협업 강의 · 2. 프로젝트 여러 HTML 파일 통합하기 · 학습 과정 중 특이사항 / 삽질 | 4개 / 3,537자 | `Git`, `HTML`, `Web-Development`, `Team-Project` | `Git`, `HTML`, `Web-Development`, `Team-Project` |
| `2024-10-30-bootcamp.md` | 게임서버 개발 부트캠프 · 1. 프로젝트 방명록 수정하기 · 2. 프로젝트 헤더 기능 구현하기 · 3. 멤버 소개페이지 프로젝트 피드백 사항 | 7개 / 5,100자 | `CI-CD`, `CSS`, `Web-Development`, `Team-Project` | `Node.js`, `CI-CD`, `CSS`, `Web-Development`, `Team-Project` |
| `2024-10-31-bootcamp.md` | 게임서버 개발 부트캠프 · 1. 프로젝트 분리 및 연결 · 2. 멤버 소개페이지 프로젝트 방명록 삭제 기능 구현 +@ · 학습 과정 중 특이사항 / 삽질 | 5개 / 5,475자 | `Web-Development`, `Team-Project` | `Node.js`, `HTML`, `Web-Development`, `Team-Project` |
| `2024-11-01-bootcamp.md` | 게임서버 개발 부트캠프 · WIL(Weekly I Learned) · TIL(Today I Learned) · 1. 멤버 소개페이지 프로젝트 완성 및 발표자료 / 회고록 작성 | 4개 / 3,661자 | `Web-Development`, `Team-Project` | `Jekyll`, `Feedback`, `Web-Development`, `Team-Project` |
| `2024-11-01-firstproject-kpt.md` | 게임서버 개발 부트캠프 · 결과물 · KPT 팀 회고록 · Keep - 현재 만족하고 있는 부분 | 6개 / 1,275자 | `Web-Development`, `Team-Project` | `Feedback`, `Web-Development`, `Team-Project` |
| `2024-11-04-bootcamp.md` | hositing, thisbinding · 1. Node.js 설치 · [JS 문법 종합반] 강의 · 유용한 문법들 | 5개 / 4,485자 | `This-Binding` | `Node.js`, `This-Binding` |
| `2024-11-05-bootcamp.md` | Async, Callback, Class 에 대해 · [JS 문법 종합반] 강의 · 콜백함수(Callback function) · 입력함수 | 15개 / 5,770자 | `Async-Await`, `Callback`, `OOP` | `Node.js`, `Async-Await`, `Callback`, `OOP` |
| `2024-11-06-bootcamp.md` | 게임서버 개발 부트캠프 · [Node.js 입문] 강의 · 웹과 HTTP의 동작 방식 · Node.js의 정의 | 8개 / 2,717자 | `Express`, `REST-API`, `HTTP` | `Node.js`, `Express`, `REST-API`, `HTTP` |
| `2024-11-07-bootcamp.md` | 게임서버 개발 부트캠프 · 최대 공약수 구현 · [Node.js 입문] 강의 · Express Router / API 구현 | 3개 / 3,561자 | `Express` | `Node.js`, `Express` |
| `2024-11-08-bootcamp.md` | 게임서버 개발 부트캠프 · RogueLike TextGame · [Node.js 입문] 강의 · 프로젝트 GitHub 연결 방법 | 3개 / 2,493자 | `Git` | `Node.js`, `Git` |
| `2024-11-11-bootcamp.md` | 게임서버 개발 부트캠프 · RogueLike TextGame · 애니메이션 효과 넣기 · 파일 분리 및 관리하기(+Github연결) | 9개 / 15,727자 | `Git`, `Game-Development`, `JavaScript` | `Node.js`, `Git`, `Game-Development`, `JavaScript` |
| `2024-11-12-bootcamp.md` | 게임서버 개발 부트캠프 · RogueLike TextGame · 가중치 부여하기(무기/스탯) · 입력에서 비정상적 값 인식 시, 재입력 받기 위해 함수 분리 | 6개 / 15,627자 | `Algorithm`, `Game-Development`, `JavaScript` | `Node.js`, `Algorithm`, `Game-Development`, `JavaScript` |
| `2024-11-13-bootcamp.md` | 게임서버 개발 부트캠프 · RogueLike TextGame · 플레이어 행동(버프) 만들기 · 뽑기 시스템 구현 (+ 무기 추가) | 7개 / 9,305자 | `Refactoring`, `Game-Development`, `JavaScript` | `Node.js`, `Refactoring`, `Game-Development`, `JavaScript` |
| `2024-11-14-bootcamp.md` | 게임서버 개발 부트캠프 · RogueLike TextGame · 서버 연결 · 관리자 모드 만들기 | 3개 / 8,313자 | `Game-Development`, `JavaScript` | `Node.js`, `Game-Development`, `JavaScript` |
| `2024-11-15-bootcamp.md` | 게임서버 개발 부트캠프 · RogueLike TextGame · 랭킹 시스템 도입 · 리팩토링 | 13개 / 5,206자 | `Algorithm`, `Ranking-System`, `Refactoring`, `Game-Development`, `JavaScript` | `Node.js`, `Algorithm`, `Ranking-System`, `Refactoring`, `Game-Development`, `JavaScript` |
| `2024-11-18-bootcamp.md` | Git commit convention · Git commit convention에 대해 알아보기! · 알고리즘 코드 카타 · 문자열 내 마음대로 정렬 | 6개 / 4,683자 | `Algorithm` | `Node.js`, `Git`, `Algorithm` |
| `2024-11-20-bootcamp.md` | 게임서버 개발 부트캠프 · Node.js 숙련주차 강의 · 관계형 데이터 베이스(Relational DataBase) · SQL(Structured Query Language) 와 제약 조건 | 3개 / 2,192자 | `SQL`, `Database` | `Node.js`, `SQL`, `Database` |
| `2024-11-21-bootcamp.md` | 게임서버 개발 부트캠프 · Node.js 숙련주차 강의 · ORM / Prisma · 알고리즘 코드 카타 | 16개 / 7,147자 | `Algorithm`, `SQL` | `Node.js`, `Prisma`, `Algorithm`, `SQL` |
| `2024-11-22-bootcamp.md` | 게임서버 개발 부트캠프 · 알고리즘 코드 카타 · 크기가 작은 부분 | 2개 / 1,376자 | `Algorithm` | `Node.js`, `Algorithm` |
| `2024-11-25-bootcamp.md` | 게임서버 개발 부트캠프 · 아이템 시뮬레이터 과제 · Client-Server Model · 기본 발표 자료 | 6개 / 2,784자 | `Algorithm`, `Backend`, `REST-API` | `Standard`, `Algorithm`, `Backend`, `REST-API` |
| `2024-11-26-bootcamp.md` | 게임서버 개발 부트캠프 · 오늘의 Troubleshooting · 아이템 시뮬레이터 과제 · API 명세서 작성 | 5개 / 4,781자 | `REST-API`, `Backend` | `Node.js`, `Express`, `Prisma`, `REST-API`, `Backend` |
| `2024-11-27-bootcamp.md` | 게임서버 개발 부트캠프 · 오늘의 Troubleshooting · 아이템 시뮬레이터 과제 · 아이템 판매 기능 구현 | 9개 / 7,349자 | `Algorithm`, `Backend`, `REST-API` | `Node.js`, `Express`, `Prisma`, `Algorithm`, `Backend`, `REST-API` |
| `2024-11-28-bootcamp.md` | 게임서버 개발 부트캠프 · 오늘의 Troubleshooting · 아이템 시뮬레이터 과제 · 유효성 평가 미들웨어 | 4개 / 3,061자 | `Error-Handling`, `Middleware`, `Backend`, `REST-API` | `Node.js`, `Express`, `Prisma`, `Error-Handling`, `Middleware`, `Backend`, `REST-API` |
| `2024-11-29-bootcamp.md` | AWS-EC2 배포 · 오늘의 Troubleshooting · 아이템 시뮬레이터 과제 · AWS EC2 배포 | 4개 / 2,955자 | `AWS-EC2`, `Backend`, `REST-API` | `Node.js`, `Express`, `Prisma`, `AWS-EC2`, `Backend`, `REST-API` |
| `2024-12-02-bootcamp.md` | 게임서버 개발 부트캠프 · 오늘의 Troubleshooting · 쁘띠 TFT 프로젝트 · 알고리즘 코드 카타 | 4개 / 2,062자 | `Algorithm`, `Backend`, `REST-API` | `Node.js`, `Express`, `Prisma`, `Algorithm`, `Backend`, `REST-API` |
| `2024-12-03-bootcamp.md` | 게임서버 개발 부트캠프 · 오늘의 Troubleshooting · 쁘띠 TFT 프로젝트 · Insomnia 생성 및 공유 | 9개 / 5,273자 | `REST-API`, `Algorithm`, `Middleware`, `Backend` | `Node.js`, `Express`, `Prisma`, `REST-API`, `Algorithm`, `Middleware`, `Backend` |
| `2024-12-04-bootcamp.md` | 게임서버 개발 부트캠프 · 쁘띠 TFT 프로젝트 · 유효성 평가 미들웨어 조정 · 챔피언 매각 API 구현 | 6개 / 5,702자 | `Algorithm`, `Middleware`, `Backend`, `REST-API` | `Node.js`, `Express`, `Prisma`, `Algorithm`, `Middleware`, `Backend`, `REST-API` |
| `2024-12-05-bootcamp.md` | 게임서버 개발 부트캠프 · 오늘의 Troubleshooting · 쁘띠 TFT 프로젝트 · 파라미터 값 생략? | 6개 / 7,262자 | `Refactoring`, `Backend`, `REST-API` | `Node.js`, `Express`, `Prisma`, `Refactoring`, `Backend`, `REST-API` |
| `2024-12-06-bootcamp.md` | 게임서버 개발 부트캠프 · 오늘의 Troubleshooting · 쁘띠 TFT 프로젝트 · 챔피언 뽑기 리팩토링 | 4개 / 4,464자 | `Refactoring`, `Backend`, `REST-API` | `Node.js`, `Express`, `Prisma`, `Refactoring`, `Backend`, `REST-API` |
| `2024-12-09-bootcamp.md` | 피드백 · 쁘띠 TFT 프로젝트 · 피드백 · 트랜잭션의 최적화 | 4개 / 2,843자 | `Transaction`, `REST-API`, `Backend` | `Node.js`, `Prisma`, `Feedback`, `Transaction`, `REST-API`, `Backend` |
| `2024-12-09-standard.md` | Feedback · 블로그 관리 · 디버깅 접근성 개선 · 시간 배분 개선 | 3개 / 1,202자 | `Jekyll` | `Standard`, `Feedback`, `Jekyll` |
| `2024-12-10-bootcamp.md` | 이론 · Node.js 게임Server개발 강의 · 게임 개발의 흐름 · 기획 단계 | 11개 / 3,483자 | `WebSocket`, `TCP`, `HTTP`, `Game-Server` | `Node.js`, `WebSocket`, `TCP`, `HTTP`, `Game-Server` |
| `2024-12-10-transaction.md` | Transaction의 개념과 특징 · Transaction · 원자성(Atomicity) · 일관성(Consistency) | 5개 / 1,589자 | `Transaction` | `Database`, `Transaction` |
| `2024-12-11-osi.md` | 물리계층과 데이터링크 계층 · OSI 7계층 · 물리(Physical) 계층과 Data-link 계층 · 이더넷(Ethernet) | 7개 / 7,146자 | `Ethernet` | `Standard`, `OSI-model`, `Ethernet` |
| `2024-12-12-bootcamp.md` | Vampire Survival Like · Realtime WebGame 개발 · 구현 목표 · 기획 | 7개 / 7,287자 | `Packet-Protocol`, `WebSocket`, `Session-Management`, `Game-Server` | `Node.js`, `Packet-Protocol`, `WebSocket`, `Session-Management`, `Game-Server` |
| `2024-12-12-osi.md` | 네트워크 계층(Network Layer)과 IP · Network 계층 · 핵심 기능 · Address 지정 | 23개 / 13,363자 | `IP-Routing` | `Standard`, `OSI-model`, `IP-Routing` |
| `2024-12-13-bootcamp .md` | Vampire Survival Like · Front-End 개발 · Player와 Monster · Canvas | 30개 / 19,065자 | `WebSocket`, `Canvas`, `Collision-Detection`, `Game-Server` | `Node.js`, `WebSocket`, `Canvas`, `Collision-Detection`, `Game-Server` |
| `2024-12-16-bootcamp.md` | Vampire Survival Like · Front-End 개발 · 파일 분리 · script / css 분리 | 7개 / 6,306자 | `WebSocket`, `CSS`, `Game-Server` | `Node.js`, `WebSocket`, `CSS`, `Game-Server` |
| `2024-12-17-bootcamp.md` | Vampire Survival Like · Front-End 개발 · 맵과 카메라 고정 · 화면 고정 | 14개 / 14,254자 | `WebSocket`, `Game-Server` | `Node.js`, `WebSocket`, `Game-Server` |
| `2024-12-18-bootcamp.md` | Vampire Survival Like · Back-End(Node.js) · Back-End 생성 · init folder | 11개 / 12,655자 | `WebSocket`, `Game-Server` | `Node.js`, `WebSocket`, `Game-Server` |
| `2024-12-19-bootcamp.md` | Vampire Survival Like · 기능 추가 · 랭킹 시스템 (최고점수 기록) · 서버의 최고 점수 기록 | 9개 / 7,312자 | `WebSocket`, `Ranking-System`, `Game-Server` | `Node.js`, `WebSocket`, `Ranking-System`, `Game-Server` |
| `2024-12-20-osi.md` | 전송 계층(Transport Layer) · 전송 계층 · 핵심 기능 · 연결 지향(Connection-Oriented) 통신 지원 | 14개 / 11,325자 | `TCP`, `UDP` | `Standard`, `OSI-model`, `TCP`, `UDP` |
| `2024-12-23-bootcamp.md` | TowerDefense · 설계 · 첫 회의 · 게임 진행 방식 | 11개 / 2,795자 | `WebSocket`, `Game-Server` | `Node.js`, `WebSocket`, `Game-Server` |
| `2024-12-23-iocp.md` | IOCP · 입력 및 출력 I/O 개념 · 동기 및 비동기 I/O · 커널 (kernel) | 10개 / 5,710자 | `IOCP`, `Multithreading`, `Async-Await` | `IOCP`, `Multithreading`, `Async-Await` |
| `2024-12-24-bootcamp.md` | 기획하기 + DB 설정(AWS-RDS) · 역할과 목표 · MySQL/Prisma 세팅 · RDS 세팅 | 7개 / 4,368자 | `AWS-RDS`, `WebSocket`, `Authentication`, `Game-Server`, `Database` | `Node.js`, `Prisma`, `SQL`, `AWS-RDS`, `WebSocket`, `Authentication`, `Game-Server`, `Database` |
| `2024-12-26-database.md` | Connection-Pool · Connection Pool · maxconnections · File Descriptor | 5개 / 2,280자 | `Connection-Pool` | `Database`, `Connection-Pool` |
| `2024-12-26-tower-defense.md` | TowerDefense · 회원가입 기능 + 클라이언트 · 실행도 · 서버 | 17개 / 6,945자 | `WebSocket`, `Authentication`, `Game-Server` | `Node.js`, `WebSocket`, `Authentication`, `Game-Server` |
| `2024-12-27-tower-defense.md` | TowerDefense · 대기 방 구현 · 클라이언트 디자인 · 기능 결합 | 8개 / 3,973자 | `WebSocket`, `Game-Server` | `Node.js`, `WebSocket`, `Game-Server` |
| `2024-12-28-osi.md` | 상위 계층(Upper layers) - HTTP, TCP · OSI 상위 계층과 TCP/IP의 응용 계층 · OSI 상위 계층 · 7계층 응용 계층(Application) | 8개 / 4,282자 | `TCP`, `HTTP` | `Standard`, `OSI-model`, `TCP`, `HTTP` |
| `2024-12-30-tower-defense.md` | TowerDefense · 방 기능 · 준비/시작 기능 · 나가기 기능 | 5개 / 3,717자 | `WebSocket`, `Game-Server` | `Node.js`, `WebSocket`, `Game-Server` |
| `2024-12-31-database.md` | Sharding · 샤딩(Sharding) · 관리 · 단점 | 7개 / 1,766자 | `Sharding`, `Transaction` | `Database`, `Sharding`, `Transaction` |
| `2024-12-31-tower-defense.md` | TowerDefense · 프로젝트 병합 · UserInterFace 연결 · Chat Socket 공유 | 9개 / 5,696자 | `WebSocket`, `Game-Server` | `Node.js`, `WebSocket`, `Game-Server` |
| `2025-01-02-algorithm.md` | 탐색과 경우의 수(Searching, DFS, BFS, Prime-Number) · 탐색/검색 알고리즘(Search algorithm) · 선형 검색(Linear / Sequential search) · With Sentinel 방식 | 24개 / 14,444자 | `Graph-Traversal` | `Algorithm`, `Graph-Traversal` |
| `2025-01-02-tower-defense.md` | TowerDefense · 프로젝트 마무리 · 자체 피드백 · Keep | 5개 / 737자 | `WebSocket`, `Game-Server` | `Node.js`, `Feedback`, `WebSocket`, `Game-Server` |
| `2025-01-03-study.md` | Availability · 가용성(Availability) · 장애 복구 시간 (RTO: Recovery Time Objective) · 데이터 손실 허용 시간 (RPO: Recovery Point Objective) | 10개 / 2,930자 | `Health-Check`, `Load-Balancing`, `Algorithm` | `Standard`, `Health-Check`, `Load-Balancing`, `Algorithm` |
| `2025-01-06-algorithm.md` | 퀵정렬과 무차별 대입법 · 알고리즘 · 퀵 정렬 · 재귀 | 5개 / 1,816자 | `Sorting` | `Algorithm`, `Sorting` |
| `2025-01-06-multiplay.md` | 이론 공부(NET, Buffer) · NET을 이용한 서버 · 서버클라이언트 · 이벤트 구조 분리 | 11개 / 6,594자 | `Game-Server`, `Multiplayer`, `TCP` | `Game-Server`, `Multiplayer`, `TCP` |
| `2025-01-07-multiplay.md` | NET, Protobuf, Constants 관리 · 환경변수 관리 · 환경변수 관련 폴더 구조 · constants(상수모음) | 16개 / 11,130자 | `Protobuf`, `Game-Server`, `Multiplayer`, `TCP` | `Protobuf`, `Game-…2192 tokens truncated…Base · Primary Key, Foreign Key, Entity-Relation Model · 정규화 · 무결성 | 15개 / 3,747자 | `Transaction`, `Database-Normalization`, `SQL` | `Database`, `Transaction`, `Database-Normalization`, `SQL` |
| `2025-02-27-ducktopia.md` | 분산 서버 적용 · 분산 서버 · Latency 체킹 · 로컬 테스트 | 4개 / 3,709자 | `Game-Server` | `Game-Server` |
| `2025-02-27-theory.md` | Operating System · 프로세스와 스레드 · 멀티 프로세스 / 멀티 스레드 · Deadlock | 5개 / 897자 | `Multithreading`, `Concurrency` | `OS`, `Multithreading`, `Concurrency` |
| `2025-02-28-ducktopia.md` | 중간 발표회 · 중간 발표회 · 피드백 · 한줄 평 + 개선점 | 3개 / 625자 | `Game-Server` | `Game-Server` |
| `2025-02-28-theory.md` | Network · TCP / UDP · TCP / UDP 패킷 구조 차이 · 3-Way Handshaking | 16개 / 2,574자 | `Protobuf`, `OSI-Model`, `Packet-Protocol`, `REST-API`, `TCP`, `UDP`, `HTTP` | `Protobuf`, `OSI-Model`, `Packet-Protocol`, `REST-API`, `TCP`, `UDP`, `HTTP` |
| `2025-03-03-ducktopia.md` | 다시 작업 · 피드백 수용 · Gateway - Other Server 최적화 · 한줄 평 + 개선점 | 3개 / 2,850자 | `Game-Server` | `Game-Server` |
| `2025-03-03-theory.md` | Other · 좋은 코드 · 객체 지향 프로그래밍(Object-Oriented Programming, OOP) · 형상 관리(Configuration Management) | 15개 / 4,200자 | `CI-CD`, `OOP`, `Architecture`, `Testing`, `HTTP` | `CI-CD`, `OOP`, `Architecture`, `Testing`, `HTTP` |
| `2025-03-04-ducktopia.md` | 다시 작업 · 추가 작업 · 설치 · 파괴 | 4개 / 3,420자 | `Game-Server` | `Game-Server` |
| `2025-03-05-interview.md` | 모의 면접 · 모의 면접 · 주요 질문 · 추가 조사 | 8개 / 2,909자 | `TCP`, `Node.js`, `Game-Server` | `TCP`, `Node.js`, `Game-Server` |
| `2025-03-06-ducktopia.md` | 다시 작업 · 추가 작업 · 서버가 느리다 · 한줄 평 + 개선점 | 3개 / 2,395자 | `Game-Server` | `Game-Server` |
| `2025-03-07-ducktopia.md` | 로드밸런싱 · Gateway 로드밸런싱 · Gateway Redis 동기화 · GameServer 주소 동기화 | 6개 / 3,425자 | `Redis`, `Docker`, `Load-Balancing`, `Game-Server` | `Redis`, `Docker`, `Load-Balancing`, `Game-Server` |
| `2025-03-10-ducktopia.md` | 로드밸런싱 · Gateway 로드밸런싱 · AWS ECS 세팅 · ECS(Elastic Container Service) | 4개 / 586자 | `AWS-ECS`, `Load-Balancing`, `Game-Server` | `AWS-ECS`, `Load-Balancing`, `Game-Server` |
| `2025-03-11-ducktopia.md` | 로드밸런싱(AWS-ECS / Docker) · AWS ECS · ECR · Task 정의 | 9개 / 3,997자 | `AWS-ECS`, `Docker`, `Load-Balancing`, `Game-Server` | `AWS-ECS`, `Docker`, `Load-Balancing`, `Game-Server` |
| `2025-03-12-ducktopia.md` | 로드밸런싱 (HealthCheck 오류) · 게임 플레이 테스트 · Health Check 오류 · 알림창 설정 | 4개 / 4,490자 | `Health-Check`, `Load-Balancing`, `Game-Server` | `Health-Check`, `Load-Balancing`, `Game-Server` |
| `2025-03-14-ducktopia.md` | 마무리 · 피드백 · 프로젝트 설명 · CI/CD 구축 | 9개 / 1,346자 | `CI-CD`, `Movement-Synchronization`, `Game-Server` | `Feedback`, `CI-CD`, `Movement-Synchronization`, `Game-Server` |
| `2025-03-17-start.md` | 새로운 시작 · 스터디 결성 · 취업 준비 · 한줄 평 + 개선점 | 3개 / 665자 | `Jekyll` | `Jekyll` |
| `2025-03-18-csharp.md` | 자료 구조와 특징 · C [1주차] · 언어의 특징 · 변수와 자료형 구조 | 15개 / 7,569자 | `Data-Structure` | `C#`, `Data-Structure` |
| `2025-03-19-csharp.md` | 클래스와 객체 · C [3주차] · 생성자(Constructor)와 소멸자(Destructor) · 프로퍼티(Property) | 7개 / 3,767자 | 추가 없음 | `C#` |
| `2025-03-24-ducktopia.md` | 부하 테스트 · PM2 · 부하 테스트 · Game Server Test 1 | 6개 / 3,393자 | `Load-Balancing`, `PM2`, `Testing`, `Game-Server` | `Feedback`, `Load-Balancing`, `PM2`, `Testing`, `Game-Server` |
| `2025-03-25-csharp.md` | 클래스와 객체 · C [4주차] · 인터페이스 (Interface) · 인터페이스의 이점 | 20개 / 9,654자 | `Error-Handling` | `C#`, `Error-Handling` |
| `2025-04-02-ducktopia.md` | 새로운 시작 · C으로 서버 열기 · 핸들러 맵퍼 · 한줄 평 + 개선점 | 3개 / 2,101자 | `Game-Server` | `C#`, `Game-Server` |
| `2025-04-03-ducktopia.md` | 경로 수정 · C으로 서버 열기 · 참고 자료 · 한줄 평 + 개선점 | 3개 / 649자 | `Game-Server` | `C#`, `Game-Server` |
| `2025-04-04-theory.md` | Other · 멀티 스레드 · 사용 이유와 단점 · 임계 영역(Critical Section)과 Mutex(Mutual Exclusion) | 5개 / 2,286자 | `Multithreading`, `Concurrency` | `Multithreading`, `Concurrency` |
| `2025-04-23-theory.md` | Other · 계층형 아키텍쳐 패턴(Layered Architecture Pattern) · 장점 · 3계층 아키텍쳐(기본 이론) | 5개 / 2,047자 | `Architecture` | `Architecture` |
| `2025-04-24-typescript.md` | 개요 · 단점 · 실행 시간에 결정되는 변수 타입 · 약한 타입 체크 | 8개 / 3,176자 | 추가 없음 | `TypeScript` |
| `2025-04-25-typescript.md` | 문법 · 문법 · 데이터 타입 · 유틸리티 타입 | 8개 / 4,489자 | `OOP` | `TypeScript`, `OOP` |
| `2025-04-29-ducktopia.md` | 프로젝트 스터디화 · 첫 번째 주제 · 특징 · Js와의 차이점 | 6개 / 3,430자 | `Game-Server` | `C++`, `Game-Server` |
| `2025-05-01-ducktopia.md` | 실습시작 · 회의 결과 · 채팅 서버 만들기(동기 I/O) · 로그 설정 | 4개 / 1,025자 | `Chat-System`, `Game-Server` | `C++`, `Chat-System`, `Game-Server` |
| `2025-05-06-ducktopia.md` | 실습시작 · 채팅 서버 만들기(동기 I/O) · consolelogger.h · define.h | 6개 / 1,567자 | `Chat-System`, `Game-Server` | `C++`, `Chat-System`, `Game-Server` |
| `2025-05-07-education.md` | 새로운 시작(EduTech 산업) · 교육 운영 매니저(Education Product Manager) · 주의사항 · 목표 | 4개 / 1,711자 | `EdTech`, `Product-Management` | `EdTech`, `Product-Management` |
| `2025-05-08-education.md` | 교육 운영 직무 · 아티클 정리 · 요약 · 느낀 점 | 4개 / 1,146자 | `EdTech`, `Product-Management` | `EdTech`, `Product-Management` |
| `2025-05-09-education.md` | 예쁘게 말하기 · 아티클 정리 · 요약 · 느낀 점 | 4개 / 981자 | `EdTech`, `Product-Management` | `EdTech`, `Product-Management` |
| `2025-05-12-education.md` | 데이터 리터러시 · 아티클 정리 · 요약 · 느낀 점 | 13개 / 3,095자 | `EdTech`, `Product-Management`, `Data-Analysis` | `EdTech`, `Product-Management`, `Data-Analysis` |
| `2025-05-13-education.md` | 와우함 · 아티클 정리 · 요약 · 느낀 점 | 3개 / 665자 | `EdTech`, `Product-Management` | `EdTech`, `Product-Management` |
| `2025-05-14-education.md` | KPI 분석과 활용 · 아티클 정리 · 요약 · 느낀 점 | 9개 / 4,246자 | `EdTech`, `Product-Management` | `EdTech`, `Product-Management` |
| `2025-05-15-education.md` | 진로 고민과 마무리 | 0개 / 402자 | `EdTech`, `Product-Management` | `EdTech`, `Product-Management` |
| `2026-02-21-swyp.md` | 사이드 프로젝트 시작 · 팀빌딩 · 희소식 · KickOff 미팅 | 4개 / 1,828자 | `App-Development`, `Team-Project` | `App-Development`, `Team-Project` |
| `2026-02-22-java.md` | 사이드 프로젝트 준비 · Java · 특징 · C++ 문법간 차이점 | 5개 / 3,884자 | `Spring-Boot`, `Express`, `Java` | `Spring-Boot`, `Express`, `Java` |
| `2026-02-23-swyp.md` | 팀 빌딩 이후 첫 회의 · 회의내용 · 개발자 회의 · 코드 컨벤션 | 3개 / 1,077자 | `App-Development`, `Team-Project` | `App-Development`, `Team-Project` |
| `2026-02-28-swyp.md` | 추가 회의 · 회의내용 · 개발자 회의 · Kotlin 속성강의 | 3개 / 1,595자 | `Kotlin`, `App-Development`, `Team-Project` | `Kotlin`, `App-Development`, `Team-Project` |
| `2026-03-07-vibeTrip.md` | 오프라인 및 개발 회의 · 오프라인 회의 · 개발회의 · 인프라 | 3개 / 678자 | `App-Development`, `Team-Project` | `App-Development`, `Team-Project` |
| `2026-04-10-vibeTrip.md` | 중도 하차 | 0개 / 601자 | `App-Development`, `Team-Project` | `App-Development`, `Team-Project` |
| `2026-07-08-ssafy.md` | 사전준비캠프 · AI 프롬프트 엔지니어링 · 이산수학 | 2개 / 2,597자 | `Prompt-Engineering`, `SSAFY` | `ai`, `Prompt-Engineering`, `SSAFY` |
| `2026-07-11-nhn.md` | 게임과 AI 기획 · 계기 · 첫날 회의 · 개발 진행 | 3개 / 1,384자 | `Hackathon`, `AI-Agent` | `game`, `ai`, `Hackathon`, `AI-Agent` |
| `2026-07-12-nhn.md` | 구현방법 검토 및 실행 · 계획 수립 · 마감기한 구축 · AI 학습 방식 | 5개 / 2,228자 | `Hackathon`, `AI-Agent` | `game`, `ai`, `Hackathon`, `AI-Agent` |
| `2026-07-16-nhn.md` | 구현방법 검토 및 실행 | 0개 / 730자 | `Hackathon`, `AI-Agent` | `game`, `ai`, `Hackathon`, `AI-Agent` |
| `2026-07-17-blog.md` | 퇴마의 날 · 악마의 탄생 · 다시 시작 | 2개 / 1,603자 | `Jekyll` | `blog`, `Jekyll` |
| `2026-07-20-nhn.md` | RAG 자료수집 자동화 · AI Skill · 프로세스 구상 | 2개 / 782자 | `RAG`, `AI-Agent`, `Hackathon` | `game`, `ai`, `RAG`, `AI-Agent`, `Hackathon` |
| `2026-07-22-nhn.md` | 토큰 사용량 최적화 · 스킬/참조 문서 탐색 · 읽기 지도 (무엇을 할 때 무엇만 읽는가) · 읽기 규율 (토큰 예산) | 6개 / 3,373자 | `Prompt-Engineering`, `Hackathon`, `AI-Agent` | `game`, `ai`, `Prompt-Engineering`, `Hackathon`, `AI-Agent` |
| `2026-07-24-python.md` | 언어에 대한 주요 사항 · 문자 출력 · 형변환 · 단축 평가 | 4개 / 2,041자 | `Python` | `Python` |
| `2026-07-25-nhn.md` | MCP 서버와 연동 시험 · Orchestration · 진행 프로세스 확인 · API와 에이전트의 도입 | 3개 / 2,287자 | `MCP`, `AI-Agent`, `Hackathon` | `game`, `ai`, `MCP`, `AI-Agent`, `Hackathon` |
| `2026-07-26-nhn.md` | MCP 서버와 연동 시험 · 프로토타입 게임 진행 · 개선 사항 | 2개 / 1,265자 | `MCP`, `Hackathon`, `AI-Agent` | `game`, `ai`, `MCP`, `Hackathon`, `AI-Agent` |
| `2026-07-27-python.md` | 함수와 반복문 · 함수 · 내장함수 · lamda | 6개 / 2,087자 | `Python` | `Python` |
| `2026-07-30-nhn.md` | 개선점 확인 · Code Generator 보완 · Asset Generator 보완 | 2개 / 1,384자 | `Hackathon`, `AI-Agent` | `game`, `ai`, `Hackathon`, `AI-Agent` |
| `2026-08-01-nhn.md` | 지옥마감 ON · 에셋 생성기 | 1개 / 2,098자 | `Image-Generation`, `Hackathon`, `AI-Agent` | `game`, `ai`, `Image-Generation`, `Hackathon`, `AI-Agent` |
| `2026-08-02-nhn.md` | 지옥마감 ON · 최적화 작업 · 추가 조언 | 2개 / 537자 | `Hackathon`, `AI-Agent` | `game`, `ai`, `Hackathon`, `AI-Agent` |
| `2026-08-04-nhn.md` | 사람이 고칠 수 있는 AI 코드 · 왜 주석과 로그부터 손봤나 · 에셋 MCP에 Pixellab.ai 붙이기 | 2개 / 2,950자 | `MCP`, `Code-Generation`, `Image-Generation` | `game`, `ai`, `MCP`, `Code-Generation`, `Image-Generation` |
| `2026-08-04-python.md` | 유용한 라이브러리 · NumPy · ndarray · Pandas | 17개 / 14,682자 | `Python` | `data`, `pandas`, `numpy`, `Python` |
| `2026-08-06-nhn.md` | 슬라임 목장, 기획과 에셋 · 아이디어 한 줄 · AI가 상상하지 않게 만들기 · 기능 명세 12장 | 4개 / 2,889자 | `Game-Design`, `Asset-Generation` | `game`, `ai`, `Game-Design`, `Asset-Generation` |
| `2026-08-07-python.md` | 유용한 라이브러리2 · Matplotlib · 준비 — 한글 폰트부터 잡고 시작하자 · 기본 4종 세트 | 31개 / 20,136자 | `Data-Visualization`, `Python` | `data`, `seaborn`, `matplotlib`, `Data-Visualization`, `Python` |
| `2026-08-08-nhn.md` | 매번 다른 맵 만들기 · 1단계 — BSP로 땅 나누기 · 2단계 — 구역(zone)과 패턴 · 3단계 — 랜덤 슬라임 스포너 | 4개 / 2,616자 | `Procedural-Generation`, `BSP`, `Map-Generation` | `game`, `ai`, `Procedural-Generation`, `BSP`, `Map-Generation` |
| `2026-08-09-nhn.md` | 붙여보니 알게 된 것들 · 피드백 ① "지금 뭘 해야 하는지 모르겠어요" · 피드백 ② "잡은 슬라임을 어디서 봐요?" — 도감 · 피드백 ③ "목표가 있었으면" — 수배 슬라임 | 4개 / 1,726자 | `Playtesting`, `Game-UX`, `Game-Design` | `game`, `ai`, `Playtesting`, `Game-UX`, `Game-Design` |
| `2026-08-09-python.md` | AI 라이브러리 지도와 데이터 정제 · 1. 라이브러리는 층으로 쌓여 있다 · 왜 이게 중요한가 · 2. 작업 순서로 보면 자리가 보인다 | 16개 / 7,122자 | `Data-Cleaning`, `Missing-Data`, `Outlier`, `IQR` | `data`, `pandas`, `sklearn`, `pytorch`, `Data-Cleaning`, `Missing-Data`, `Outlier`, `IQR` |
| `2026-08-09-python2.md` | scikit-learn - 순서를 지키는 것이 전부다 · 1. sklearn은 문법이 하나다 · 2. 데이터를 나누는 이유 · Validation과 Test는 왜 따로 있나 | 25개 / 13,181자 | `Train-Test-Split`, `Feature-Scaling`, `ROC-AUC`, `Cross-Validation`, `Pipeline`, `PCA`, `K-Means` | `data`, `sklearn`, `ml`, `Train-Test-Split`, `Feature-Scaling`, `ROC-AUC`, `Cross-Validation`, `Pipeline`, `PCA`, `K-Means` |
| `2026-08-09-ssafy.md` | AI & 기계학습 기초 - AI와 ML은 무엇인가? · 1. AI, ML, DL — 셋은 무슨 관계인가 · 더 쉬운 비유로 · 2. 머신러닝은 하나의 루프다 | 16개 / 7,776자 | `Feature-Engineering`, `SSAFY` | `ai`, `ml`, `Feature-Engineering`, `SSAFY` |
| `2026-08-09-ssafy2.md` | AI & 기계학습 기초 - 지도학습과 성능 평가 · 1. 지도학습이란 · 2. 회귀와 분류 — 정답의 생김새로 갈린다 · 3. 용어 정리 — 여기서 한 번 크게 헷갈렸다 | 20개 / 9,359자 | `Loss-Function`, `Supervised-Learning`, `SSAFY` | `ai`, `ml`, `Loss-Function`, `Supervised-Learning`, `SSAFY` |
| `2026-08-09-ssafy3.md` | AI & 기계학습 기초 - 교차검증과 비지도학습 · 1. 훈련 오류와 테스트 오류 · 2. 이상적인 방법과 현실의 벽 · 3. 검증셋(hold-out) 방식 | 19개 / 7,714자 | `Cross-Validation`, `Supervised-Learning`, `SSAFY` | `ai`, `ml`, `Cross-Validation`, `Supervised-Learning`, `SSAFY` |
| `2026-08-09-ssafy4.md` | AI & 기계학습 방법론 - 선형회귀 · 1. 선형회귀 — 가장 기초가 되는 방법 · 2. 단순선형회귀 · 모자(hat)의 의미 | 17개 / 6,136자 | `Linear-Regression`, `SSAFY` | `ai`, `ml`, `Linear-Regression`, `SSAFY` |
| `2026-08-09-ssafy5.md` | AI & 기계학습 방법론 - 로지스틱회귀 · 1. 여기서부터 분류 — 왜 선형회귀로는 안 되나 · 다중 분류에서는 더 심각하다 · 2. 로지스틱회귀 — S자 곡선으로 눌러 담기 | 12개 / 7,948자 | `Linear-Regression`, `Logistic-Regression`, `SSAFY` | `ai`, `ml`, `Linear-Regression`, `Logistic-Regression`, `SSAFY` |
| `2026-08-09-ssafy6.md` | AI & 기계학습 방법론 - 신경망과 경사 하강법 · 1. 다시 출발점 — 모델은 값이 채워진 함수다 · 2. 얕은 신경망 — 직선을 여러 개 꺾어 붙이기 · 은닉 유닛이 하는 일 | 32개 / 14,604자 | `Backpropagation`, `Gradient-Descent`, `Neural-Network`, `Stochastic-Gradient-Descent`, `Activation-Function`, `Optimizer`, `SSAFY` | `ai`, `ml`, `deeplearning`, `Backpropagation`, `Gradient-Descent`, `Neural-Network`, `Stochastic-Gradient-Descent`, `Activation-Function`, `Optimizer`, `SSAFY` |
| `2026-08-10-nhn.md` | 사전 과제 제출 & 회고 · 결국 어떤 구조였나 · 정직하게 남기는 실패 기록 · 액션 아이템 | 4개 / 3,617자 | `AI-Agent`, `Project-Retrospective` | `game`, `ai`, `AI-Agent`, `Project-Retrospective` |
| `2026-08-10-python.md` | PyTorch - 텐서와 Autograd, 그리고 모델 설계 · 1. 텐서 — NumPy 배열에 기능이 붙은 것 · 반드시 확인해야 하는 세 가지 · 2. Autograd — 미분을 자동으로 | 19개 / 9,715자 | `Tensor`, `Autograd`, `Neural-Network`, `Dropout`, `GPU` | `ai`, `pytorch`, `deeplearning`, `Tensor`, `Autograd`, `Neural-Network`, `Dropout`, `GPU` |
| `2026-08-10-python2.md` | PyTorch - 학습 루프와 GPU 에러 추적 · 1. Dataset과 DataLoader · 왜 배치로 나누나 · 만들기 — 3단계 | 26개 / 10,577자 | `DataLoader`, `Training-Loop`, `Loss-Function`, `Optimizer`, `GPU`, `CUDA` | `ai`, `pytorch`, `deeplearning`, `DataLoader`, `Training-Loop`, `Loss-Function`, `Optimizer`, `GPU`, `CUDA` |
| `2026-08-10-ssafy.md` | 자연어처리 기초 - 단어를 숫자로 바꾸기 · 1. 가장 단순한 답 — 원-핫 인코딩 · 그런데 칸이 몇 개나 필요할까 · 진짜 심각한 문제 — 유사도를 잴 수 없다 | 12개 / 6,355자 | `One-Hot-Encoding`, `Word-Embedding`, `Word2Vec`, `Skip-Gram`, `CBOW` | `ai`, `nlp`, `One-Hot-Encoding`, `Word-Embedding`, `Word2Vec`, `Skip-Gram`, `CBOW` |
| `2026-08-10-ssafy2.md` | 자연어처리 기초 - 순서를 기억하는 신경망, RNN · 1. 순차적 데이터란 · ① 순서가 중요하다 · ② 장기 의존성 — 멀리 있는 말이 영향을 준다 | 14개 / 5,227자 | `RNN`, `Sequential-Data`, `Long-Term-Dependency`, `Hidden-State`, `Vanishing-Gradient` | `ai`, `nlp`, `RNN`, `Sequential-Data`, `Long-Term-Dependency`, `Hidden-State`, `Vanishing-Gradient` |
| `2026-08-10-ssafy3.md` | 자연어처리 기초 - 더 오래 기억하는 LSTM · 1. 핵심 아이디어 — 통로를 둘로 나눈다 · 더 쉬운 비유로 · 2. 게이트 — 여닫는 정도를 스스로 정한다 | 10개 / 4,718자 | `LSTM`, `Gate-Mechanism`, `Long-Term-Dependency`, `Vanishing-Gradient` | `ai`, `nlp`, `LSTM`, `Gate-Mechanism`, `Long-Term-Dependency`, `Vanishing-Gradient` |
| `2026-08-10-ssafy4.md` | 자연어처리 기초 - 언어 모델과 Seq2Seq · 1. 언어 모델이란 · 이미 매일 쓰고 있다 · 문장 전체의 확률 | 16개 / 6,768자 | `Language-Model`, `N-Gram`, `Seq2Seq`, `Teacher-Forcing`, `Beam-Search` | `ai`, `nlp`, `Language-Model`, `N-Gram`, `Seq2Seq`, `Teacher-Forcing`, `Beam-Search` |
| `2026-08-10-ssafy5.md` | 자연어처리 기초 - 필요한 곳만 보는 Attention · 1. 병목 문제 · 더 쉬운 비유로 · 2. Attention의 아이디어 | 14개 / 5,015자 | `Attention`, `Query-Key-Value`, `Seq2Seq` | `ai`, `nlp`, `Attention`, `Query-Key-Value`, `Seq2Seq` |
| `2026-08-10-ssafy6.md` | 자연어처리 기초 - Self-Attention과 Transformer · 1. RNN을 빼야 하는 두 가지 이유 · ① 멀리 있는 단어까지 가는 데 단계가 필요하다 · ② 병렬 처리가 안 된다 | 18개 / 8,356자 | `Self-Attention`, `Transformer`, `Multi-Head-Attention`, `Positional-Encoding`, `Masked-Attention`, `Encoder-Decoder` | `ai`, `nlp`, `Self-Attention`, `Transformer`, `Multi-Head-Attention`, `Positional-Encoding`, `Masked-Attention`, `Encoder-Decoder` |
| `2026-08-10-ssafy7.md` | 자연어처리 기초 - 사전학습과 In-Context Learning · 1. 사전학습이란 · 두 단계로 나누기 · 워드 임베딩과 뭐가 다른가 | 13개 / 6,362자 | `Pretraining`, `BERT`, `GPT`, `In-Context-Learning`, `Fine-Tuning`, `Chain-of-Thought` | `ai`, `nlp`, `Pretraining`, `BERT`, `GPT`, `In-Context-Learning`, `Fine-Tuning`, `Chain-of-Thought` |
| `2026-08-11-python.md` | 자연어처리 라이브러리 - 토큰화와 임베딩 · 1. 토큰화 — 어떤 크기로 쪼갤 것인가 · 방법 1 — 단어 단위 · 방법 2 — 글자 단위 | 18개 / 10,011자 | `Tokenization`, `BPE`, `Word-Embedding`, `Subword` | `ai`, `nlp`, `pytorch`, `Tokenization`, `BPE`, `Word-Embedding`, `Subword` |

## 검증 체크
| `2025-02-13-theory.md` | 코딩 언어 · 깊은 복사와 얕은 복사 · 얕은 복사 · 깊은 복사 | 9개 / 4,632자 | 재검증 | `Javascript`, `Event-Loop`, `JWT` |
| `2025-02-14-ducktopia.md` | 2차 구현 · 업무 재할당 · Docker · Client | 4개 / 278자 | 재검증 | `Docker`, `Game-Server` |
| `2025-02-17-ducktopia.md` | 2차 구현 · 디버거의 삶 · 서버의 타일맵 · 서버 NavMesh | 6개 / 1,709자 | 재검증 | `Game-Server` |
| `2025-02-18-ducktopia.md` | 분산 서버 구현 · 분산 서버 구현 · 로비 서버 · 클라이언트 반환 값 | 7개 / 2,434자 | 재검증 | `Redis`, `Authentication`, `Game-Server` |
| `2025-02-19-ducktopia.md` | 분산 서버 구현 · 분산 서버 구현 · Gateway 서버 구조 · 조언 구하기 | 5개 / 5,646자 | 재검증 | `Game-Server` |
| `2025-02-20-ducktopia.md` | 분산 서버 구현 · 분산 서버 구현 · 게임 서버 · AWS EC2 서버 오류 | 4개 / 2,678자 | 재검증 | `AWS-EC2`, `Game-Server` |
| `2025-02-21-ducktopia.md` | 분산 서버 구현 · 분산 서버 · 서버 분리 마무리 작업 · 게임 서버 게임 삭제 | 8개 / 1,903자 | 재검증 | `Redis`, `Load-Balancing`, `Game-Server` |
| `2025-02-24-ducktopia.md` | 분산 서버 구현 · 분산 서버 · 로드 밸런싱 · Redis 서버 동기화 | 5개 / 3,214자 | 재검증 | `Redis`, `Load-Balancing`, `Game-Server` |
| `2025-02-24-theory.md` | 정렬과 탐색 정리 · Big-O · Big-O의 주 개념 · 여러 표기법 | 13개 / 4,731자 | 재검증 | `Graph-Traversal`, `Sorting`, `Algorithm` |
| `2025-02-25-ducktopia.md` | 분산 서버 구현 · 분산 서버 · Health Check · Load Balancer | 10개 / 4,944자 | 재검증 | `Health-Check`, `Load-Balancing`, `Game-Server` |
| `2025-02-25-theory.md` | Data Structure · Array와 LinkedList · Stack과 Queue · Graph와 Tree | 5개 / 1,904자 | 재검증 | `Data-Structure`, `Tree` |
| `2025-02-26-ducktopia.md` | EC2 올려보기 · 분산 서버 · 보안 그룹 설정 · 부팅 세팅 | 5개 / 1,642자 | 재검증 | `AWS-EC2`, `Game-Server` |
| `2025-02-26-theory.md` | DataBase · Primary Key, Foreign Key, Entity-Relation Model · 정규화 · 무결성 | 15개 / 3,747자 | 재검증 | `Database`, `Transaction`, `Database-Normalization`, `SQL` |
| `2025-01-22-multiplay.md` | 프로젝트 진행 · 프로젝트 기초 작업 · 클라이언트 분석 · 통신 구조 분석 | 13개 / 8,082자 | 재검증 | `Game-Server`, `Tower-Defense`, `Multiplayer` |
| `2025-01-23-multiplay.md` | 프로젝트 진행 · 메인 작업 · 시퀀스 시스템 · 코드 구현 | 15개 / 6,000자 | 재검증 | `Game-Server`, `Tower-Defense`, `Database`, `Multiplayer` |
| `2025-01-24-multiplay.md` | 프로토타입 서버 테스트 · 메인 작업 · 클라이언트 연결 테스트 · 패킷 구조 오류 | 6개 / 884자 | 재검증 | `Packet-Protocol`, `Matchmaking`, `Game-Server`, `Tower-Defense`, `Multiplayer` |
| `2025-01-27-multiplay.md` | 리팩토링 · 리팩토링 작업 · utils 폴더 개선 · match 폴더 | 11개 / 7,705자 | 재검증 | `Refactoring`, `Game-Server`, `Tower-Defense`, `Multiplayer` |
| `2025-01-28-os.md` | 운영체제 · 운영체제 · 역할 · 자원 관리 | 20개 / 5,640자 | 재검증 | `Standard`, `OS` |
| `2025-01-31-multiplay.md` | 프로젝트 마무리 · 마무리 · notify 함수 설정 · loginQueue | 4개 / 762자 | 재검증 | `Game-Server`, `Tower-Defense`, `Multiplayer` |
| `2025-02-03-multiplay.md` | 프로젝트 회고록 · 프로젝트 끝 · Github · 설명자료 | 6개 / 4,560자 | 재검증 | `Feedback`, `Git`, `Node.js`, `Game-Server`, `Tower-Defense`, `Multiplayer` |
| `2025-02-04-ducktopia.md` | 기획단계 · 프로젝트 시작 · 기획 · MVP(Minimum Viable Produce) | 4개 / 1,551자 | 재검증 | `Game-Server` |
| `2025-02-05-ducktopia.md` | MVP 구현 · MVP 구현 시작 · 기한 설정 · 역할 분담 | 5개 / 3,014자 | 재검증 | `Game-Server` |
| `2025-02-05-theory.md` | 코딩 언어 · var, let, const · var · let | 13개 / 5,894자 | 재검증 | `Javascript`, `Hoisting`, `Promise`, `Async-Await`, `Express` |
| `2025-02-06-ducktopia.md` | MVP 구현 · 디버깅 · 패킷 구조 · 한줄 평 + 개선점 | 3개 / 2,019자 | 재검증 | `Packet-Protocol`, `Game-Server` |
| `2025-02-07-ducktopia.md` | MVP 구현 · 업무 재분배 · 속도 계산 · 통신 구조 수정 | 5개 / 4,444자 | 재검증 | `Game-Server` |
| `2025-02-10-ducktopia.md` | MVP 구현 · 2차 구현 · 노선 수정 · 한줄 평 + 개선점 | 3개 / 757자 | 재검증 | `Game-Server` |
| `2025-02-11-ducktopia.md` | 2차 구현 · 2차 구현 · 코어 구현 · 서버의 코어 | 6개 / 1,556자 | 재검증 | `Refactoring`, `Game-Server` |
| `2025-02-12-ducktopia.md` | 2차 구현 · 프로세스 정리 · 프로토버프 적용 · 수정 부분 | 4개 / 1,983자 | 재검증 | `Game-Server` |
| `2025-01-08-multiplay.md` | Error 핸들러, DB Pool / Migration · CustomError · Error 폴더 구조 · CustomError 클래스 | 17개 / 10,457자 | 재검증 | `Database`, `Connection-Pool`, `Game-Server`, `Multiplayer`, `TCP` |
| `2025-01-08-study.md` | 역삼각함수와 삼각함수의 활용 · 역/삼각 함수 · 호도법 · 삼각 함수(Trigonometric Function) | 7개 / 3,403자 | 재검증 | `TIL` |
| `2025-01-09-multiplay.md` | Latency, Ping 구현! · 클라이언트 연동 · 기본 상호작용(Handler) · index.js | 11개 / 6,754자 | 재검증 | `Game-Server`, `Multiplayer`, `TCP` |
| `2025-01-10-multiplay.md` | 프로젝트 시작 · 유니티 클라이언트 연동 · 서버 응답 구조 변경 · 서버 송신 | 7개 / 3,698자 | 재검증 | `Unity`, `Game-Server`, `Multiplayer`, `TCP` |
| `2025-01-10-study.md` | 암호와 인증서 · 암호화 · 대칭 키 암호화 · 비대칭 키 암호화 | 15개 / 2,820자 | 재검증 | `Standard`, `HTTP` |
| `2025-01-10-study2.md` | 컴퓨터의 구조와 CPU · 컴퓨터의 이해 · Main Memory (주 기억 장치) · Secondary Memory (보조 기억 장치) | 18개 / 4,513자 | 재검증 | `Standard` |
| `2025-01-13-multiplay.md` | 프로젝트 진행 · 지연 시간과 핑 구현 · 서버 Ping 요청 · 실행 | 9개 / 5,465자 | 재검증 | `Unity`, `Game-Server`, `Multiplayer`, `TCP` |
| `2025-01-14-multiplay.md` | 프로젝트 진행 · 위치 동기화 · 게임 내 위치 동기화 · 클라이언트 Location 관리 | 9개 / 3,881자 | 재검증 | `Unity`, `Movement-Synchronization`, `Game-Server`, `Multiplayer`, `Database`, `TCP` |
| `2025-01-15-multiplay.md` | 프로젝트 진행 · DB 연동 · 마이그레이션 · 쿼리 정리 | 9개 / 5,112자 | 재검증 | `Unity`, `Game-Server`, `Multiplayer`, `Database`, `TCP` |
| `2025-01-16-multiplay.md` | 마무리 하루 전 · 추측 항법 · 방향 전달 · 데드 레코닝 | 4개 / 2,686자 | 재검증 | `Unity`, `Game-Server`, `Multiplayer`, `TCP` |
| `2025-01-17-multiplay.md` | 프로젝트 마무리 · 추가 변경사항 · 자체 피드백 | 2개 / 818자 | 재검증 | `Feedback`, `Game-Server`, `Multiplayer`, `TCP` |
| `2025-01-19-server.md` | Server-Architecture 분석 · 서버 구조 · 모놀리식(Monolithic) 구조 · 데디케이트 구조 | 14개 / 2,025자 | 재검증 | `Architecture`, `Database` |
| `2025-01-20-multiplay.md` | 프로젝트 계획 · 컨셉 및 기획 · 게임 진행 과정 · 와이어 프레임 | 5개 / 700자 | 재검증 | `Game-Server`, `Tower-Defense`, `Multiplayer` |
| `2025-01-20-study.md` | 컴퓨터의 메모리 · Memory (기억 장치) · 종류 · 주소 공간 | 6개 / 1,613자 | 재검증 | `Standard`, `Memory` |
| `2025-01-21-multiplay.md` | 프로젝트 설계 · 분업 시작 · 베이스 분업 · Class 구조 설계 | 4개 / 3,659자 | 재검증 | `Game-Server`, `Tower-Defense`, `Multiplayer` |

- 모든 포스트에 하나 이상의 태그가 있어야 합니다.
- 동일한 태그가 한 포스트 안에서 중복되지 않아야 합니다.
- 포스트당 태그는 최대 10개로 제한합니다.
- RNN 실제 검색에서 중심 설명 글이 단순 참조 글보다 먼저 나와야 합니다.
