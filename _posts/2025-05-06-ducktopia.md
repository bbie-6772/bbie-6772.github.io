---
layout: post
title: Ducktopia_C++ - <3>
subtitle: 실습시작
author: bbie
categories: Ducktopia-Project-C++
banner:
  image: https://github.com/user-attachments/assets/e2201ed3-6804-4534-ac37-e2c9a678cddb
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [C++, Chat-System, Game-Server]
---

## 채팅 서버 만들기(동기 I/O)

진행중인 실습에 관한 기록

### console_logger.h

- [구현 코드](https://github.com/bbie-6772/Study_Game_Server_CPP/blob/main/ChattingServer/LogicLib/console_logger.h)

전에 설명한 대로 ILog 를 선언하고 이를 상속받는 콘솔로거를 똑같이 구현하였다.  
중간에 #ifdef _WIN32 (플랫폼 구분 설정) 에서 빈 소멸자와 기본(default) 소멸자의 차이점(윈도우 이전 호환성)을 알게됬다.  
그리고 이를 최신 버전 윈도우를 사용한다는 가정하에 기본 소멸자로 통합하였다!  
( 추가로 윈도우 플랫폼에서 콘솔로그에 색을 부여하는 외부라이브러리를 사용한 것 같다 )

### define.h

기본 상수 및 환경 변수들을 관리하던 config 폴더와 비슷한 기능을 하는 헤더파일인 것 같다!  
중간중간 코드를 따라가며 궁금한 정보들을 찾아보고 결과를 조금씩 담아두려 한다.

- [구현 코드](https://github.com/bbie-6772/Study_Game_Server_CPP/blob/main/ChattingServer/ServerNetLib/define.h)

- const 는 런타임에서 초기값이 지정되도 되지만 constexpr 는 무조건 컴파일 과정에서 결정되야 된다는 차이가 있다.

- long long은 윈도우와 다른 플랫폼에서 long의 크기가 다른걸 64bit로 확실하게 호환하기 위해 쓰인다!

- 좋은 이식성을 위해선 \<cstdint> 에 포함된 정수 형태를 쓰는게 좋다! ( ex. int => int32_t )

### server_network_error.h

서버 오류를 지정해두어 유지보수에 용이하도록 설계한 것 같다.

- [구현 코드](https://github.com/bbie-6772/Study_Game_Server_CPP/blob/main/ChattingServer/ServerNetLib/server_network_error.h)

- 열거형의 경우 변수명과 헷갈리지 않도록 앞에 k를 붙였다.

### interface + tcp_network

- [구현 코드](https://github.com/bbie-6772/Study_Game_Server_CPP/blob/main/ChattingServer/ServerNetLib/tcp_network.cpp)

tcp 네트워크를 관리해줄 객체를 만드는데 interface를 미리 생성해주어 내부 참조를 최소한으로 줄인 것 같다.  
( 당연히 인터페이스니까 추가 확장성도 고려한 거겠지만 )

- 포인터로 동적 할당한 별도의 메모리는 직접 해제해줘야 한다! ( new -> delete , new[] -> delete[] )  
( 객체는 컨테이너가 관리하고 있기 때문에 별도로 delete 할 필요가 없음 )

- 코드에서 새로운 부분이나 문법들을 만나 주석을 자세하게 작성했다!

## 한줄 평 + 개선점

- TCP 네트워크 관리 객체를 거의 따라하듯이 리팩토링만 했음에도 양이 너무 많아 이정도로 걸릴 줄 몰랐다..!  
( 10:00 ~ 21:00 / 아침 점심 저녁 시간 제외하면 한 8시간? )

---
