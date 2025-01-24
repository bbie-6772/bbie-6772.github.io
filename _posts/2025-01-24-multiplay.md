---
layout: post
title: 멀티타워디펜스 - < 5 >
subtitle: 프로토타입 서버 테스트
author: bbie
categories: Multi-TowerDefense-Project
banner:
  image: https://github.com/user-attachments/assets/2403c1b6-7704-4ded-9562-204c27aa6ed2
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: []
---

## 메인 작업

- 오늘은 계획한대로 클라이언트와 프로토타입 서버를 테스트해가며 디버깅할 차례다!

- 또한 클라이언트의 연결이 끊길 때 작동되어야하는 로직을 구현할 예정이다.

### 클라이언트 연결 테스트

#### 패킷 구조 오류

![Image](https://github.com/user-attachments/assets/0c3e3eb6-5409-4e11-86bb-cd6e578fe991)

- 클라이언트에서 받는 최종 패킷은 위와 같은 GamePacket 구조 였지만,  
서버에선 PacketBuffer 까지만 만들어 보내주었던 오류가 있었다

- 이로인해 디코딩과 인코딩을 두번하도록 변경해야 했다!

#### 매칭 오류

- 매칭 인원이 2이상이 되지 않았는데도 게임이 잡혔다는 알림을 보내준다.

![Image](https://github.com/user-attachments/assets/f98f900f-1cc9-4a53-8745-ed5e82a6510e)

- 확인 결과 핸들러 연결 없이 자체적 테스트를 위해 바로 알림을 보내도록 설계되어 있어서 수정해주었다.

- 또한 실행 후 핸들러 프로세스에서도 자잘한 오타들이 있었다.  
(e.g. 내부 메서드 호출 시 this.를 쓰지않음 )

#### 회원 가입 오류

![Image](https://github.com/user-attachments/assets/34d39297-e265-4a5f-a96c-1e41f536d51a)

- 위의 사항에서 LAST_INSERT_ID() 가 VALUES의 대괄호에 묶여있지 않아 유저의 Rank 정보 생성이 제대로 되지 않았던 오류가 있었습니다.

## 한줄 평 + 개선점

- 회의를 계속하며 여러 트러블에 대해 논의가 잘되어 기분이 좋았다.

- 최적화 방안을 계속해서 교류할 수 있어서 좋았다.

---
