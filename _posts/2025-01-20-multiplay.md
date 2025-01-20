---
layout: post
title: 멀티타워디펜스 - < 1 >
subtitle: 프로젝트 계획
author: bbie
categories: Multi-TowerDefense-Project
banner:
  image: https://github.com/user-attachments/assets/ee4fe93f-6293-4366-bc92-b8ca8622d397
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: []
---

## 컨셉 및 기획

- 기본적으로 주어진 과제는 1:1 경쟁을 하는 멀티플레이 게임이다.

- 그러나 꿈은 크게 가져야한다고 들어 장르를 바꾸더라도 조금 더 재밌어 보이는 게임을 설계하기로 하였다!

- 기본적인 장르는 RTS로 참고가 된 게임들은 **냥코대전쟁, 전쟁시대, 팔라독** 등이다.

### 게임 진행 과정

1. 플레이어들은 회원가입/로그인 후 메인화면에 진입한다

2. 매칭을 시작하여 MMR이 비슷한 사람들끼리 매치되어 게임이 시작된다.

3. 두 플레이어는 각자 유닛을 생성하여 상대방의 본진을 파괴하는걸 목표로 한다.

4. 게임이 끝나면 각 플레이어들은 승자와 패자에 따라 MMR이 조정된다.

### 와이어 프레임

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/83c75a39-3aba-4ba4-a792-7aefe4b07895/c4f4160b-8956-425d-b793-b1c21b58df95/image.png)

- 게임 화면에서 오른쪽이 무조건 각 플레이어가 되도록 설계

### 피드백

- 현재 서버 및 클라이언트 개발을 겸업하는 것보다 서버에 집중하는 편이 유익하다는 피드백을 받음

- 만약 클라이언트 개발을 한다면 고려해야할 사항으로 Packet 구조인 Protobuf를 생성해주는 생성자가 필요함  
(**protocol buffer compiler**)

### 계획 변경

- 주어진 과제에 충실히 서버를 구축!

- 제공된 클라이언트를 분석하여 맞춤 서버를 구현해보자

---
