---
layout: post
title: 서버 프로그래밍 - < 구조 분석 >
subtitle: 컴퓨터의 구조와 CPU
author: bbie
categories: Server
banner:
  image: https://github.com/user-attachments/assets/d8bf2aed-d02e-4817-a3a8-2f7f644a21fc
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [Server-Architecture]
---

## 서버 구조 분석

### Zenless Zone Zero

현재까지 공식적으로 공개된 “젠레스 존 제로(Zenless Zone Zero)”의 내부 서버 아키텍처 정보는 없으나,  
일반적으로 호요버스(miHoYo) 계열의 온라인 액션 게임(예: 원신, 붕괴 시리즈 등)은 다음과 같은 아키텍처 특징을 가짐

![Image](https://github.com/user-attachments/assets/a78299cc-e522-4166-8427-414935d351f9)

1. 멀티 리전 서버 혹은 글로벌 서버

    - 플레이어가 전 세계에 고루 분포하기에 지역별로 물리 서버 혹은 클라우드 인프라를 둬서 지연(Latency)을 최소화하고 안정성을 확보

2. 클라이언트-서버 기반의 실시간 동기화

    - 액션 게임 특성상 캐릭터 이동, 전투 상황 등을 실시간으로 처리해야함

    - 이를 위해 TCP 또는 UDP(커스텀 프로토콜 기반 가능) 등을 활용해 끊김 없이 빠른 동기화를 구현함

3. 마이크로서비스 또는 분산 아키텍처

    - 로그인, 매칭, 채팅/소셜, 결제, 이벤트 등 다양한 기능을 독립된 마이크로서비스로 분산시켜 운영함

    - 로드밸런서(예: Nginx, HAProxy 등)와 API 게이트웨이를 통해 각각의 서비스로 트래픽을 효율적으로 라우팅하는 구조가 일반적임

4. 데이터베이스 및 캐싱
  
    - 전투 로그, 플레이어 계정 정보, 아이템/재화 내역 등은 주로 RDBMS(MySQL, PostgreSQL) 또는 NoSQL(예: Redis, MongoDB)에 저장함

    - 실시간 단에서는 캐싱(예: Redis, Memcached)을 적극적으로 사용하여 빠르게 플레이어 정보를 조회해 클라이언트에 응답함

5. 보안 및 안티 치트

    - 핵/치트 방지, 데이터 변조 방지 및 안전한 결제 처리를 위해 내부적으로 보안 모듈(안티 치트 시스템)과 암호화 통신 채널을 사용

## 서버 구조 설계



---
