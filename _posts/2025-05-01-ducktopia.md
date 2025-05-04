---
layout: post
title: Ducktopia_C++ - <2>
subtitle: 실습시작
author: bbie
categories: Ducktopia-Project-C++
banner:
  image: https://github.com/user-attachments/assets/e2201ed3-6804-4534-ac37-e2c9a678cddb
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [C++]
---

## 회의 결과

현재 C++을 이용한 서버 구축 경험을 먼저 쌓고 프로젝트 진행을 하기로 결정되었다.  
서버 구축을 하는 과정에서 C++의 문법적인 부분은 알아서 배우게될 예정이고,  
구축한 서버들을 토대로 확장하여 프로젝트를 진행할 수 있다고 생각하기 때문이었다.

그래서 나온 실습 과정은 아래와 같다.

1. [C++ 게임 서버 레포지토리](https://github.com/jacking75/edu_cpp_server_programming#) 실습 진행

2. 학습한 것들을 TIL 형식으로 블로그에 포스트하여 정리해두기

3. 일정 기한까지 마무리하여 프로젝트 진행하기

### 채팅 서버 만들기(동기 I/O)

[강의 영상](https://www.youtube.com/watch?v=q9hsy_RK6Ss&list=PLW_xyUw4fSdYJuxJaMx3k32xTN3Ou8aDy&index=7&ab_channel=%EC%B5%9C%ED%9D%A5%EB%B0%B0)

일단 초기 세팅부터 난항을 겪었다.. C++ 프로젝트 여러 개를 하나의 레포지토리에 올리는 게 처음이라..  
~~( 정적 라이브러리 만들기 쉽지 않네 )~~

참고용 프로젝트가 포함되어있는데, 사실 아무것도 모른채로 만드는건 어려울 것 같아  
참고 프로젝트를 도식화하며 구조를 이해해가 응용하는 방식으로 서버를 구현할 것 같다!

일단 구조를 따라가면서 신기한 부분이나 알게된 부분들을 주석으로 정리해두고,  
구현이 완성되면 부분별로 나눠 도식화를 해볼 예정이다.

#### 로그 설정

제일 기본적인 부분부터 따라하기 위해 ServerNetLib 솔루션을 파려했는데.. ILog(로그형 인터페이스)를 먼저 구현해야 했다..!  
추가로 이 인터페이스를 직접적으로 상속받는 ConsoleLogger도 동시에 구현하기로 했다!
( 콘솔에 띄워질 때 로그의 레벨과 유형을 정하여 유지보수가 편하게 하도록 클래스를 구현하는 것 같았다 )

## 한줄 평 + 개선점

- 실습이 직접 구현하는 게 중요하단 걸 알지만, 어느것 부터 구현해야 되는지를 모르기에 모작부터 시작하는게 먼저인 것 같다!

---
