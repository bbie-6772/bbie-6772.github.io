---
layout: post
title: Transaction
subtitle: 게임Server 개발 부트캠프
author: bbie
categories: Data-base
banner:
  image: https://github.com/user-attachments/assets/82629dbe-cbb1-4bce-8aa1-ca30eeb76d66
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [transaction]
---

## Transaction

Data Base 관점에서의 Transaction이란 **하나의 작업**으로 **취급되는 묶여진 모든 작업**을 뜻하며, Transaction은 통칭 ACID 이라는 4가지 특징을 가진다!

### 원자성(Atomicity)

트랜잭션 내부에 있는 작업들은 **모두가 하나**인 것 처럼 취급이 된다!  
작업들이 전부 성공하거나, 하나라도 실패하면 모두가 실패하는 연대책임을 지게 된다!

=> 이러한 특성 덕분에 오류 상황에서의 데이터 손실/손상이 방지된다!

### 일관성(Consistency)

트랜잭션의 각 작업들에 의해 **변경될 테이블들의 데이터**들은 모두 **테이블의 제약조건을 만족**해야 한다!
다시말해, 테이블의 **규칙을 만족하며 데이터들을 수정**해야만 **변경사항들이 적용**된다는 말이다.

=> 이러한 특성 덕분에 테이블의 무결성을 유지해 의도치 않은 결과를 방지한다!

### 격리성(Isolation)

사용하는 테이블을 트랜잭션만이 점유하여 다른 작업에서 테이블을 사용하지 못하게 만든다!  

- 격리 수준은 트랜잭션 실행 중 다른 작업이 참조가능한 경우에 따라 4가지로 분리되며, 설정가능하다.

    1. Serializable(=엄격)

        트랜잭션 작업이 끝나기 전까지 아무도 건들지 못하게 설정

    2. Repeatable reads(=권장)

        트랜잭션 순서에서 자기보다 높은(늦게 시작한) 트랜잭션의 작업을 무시하도록 설정
        => 트랜잭션이 실행되기 전의 데이터 상태를 저장해두어 그 데이터에서만 트랜잭션 작업이 진행되도록 함

    3. Read committed(=기본)

        다른 트랜잭션의 작업이 진행된 이후의 값만 읽을 수 있도록 설정

    4. Read uncommitted(=주의)

        다른 트랜잭션의 작업이 진행된 이전의 값도 읽을 수 있도록 설정

| 격리 수준 | Dirty Read | Non-Repeatable Read | Phantom Read |
| --- | --- | --- | --- |
| Read Uncommitted | 허용 | 허용 | 허용 |
| Read Committed | 방지 | 허용 | 허용 |
| Repeatable Read | 방지 | 방지 | 허용 |
| Serializable | 방지 | 방지 | 방지 |

- 주요 트랜잭션 문제

    1. Dirty Read (드릅게 읽기)

        다른 트랜잭션에서 커밋되지 않은 데이터를 읽는 문제  

        > 하나의 트랜잭션이 데이터를 수정했지만 롤백되었을 경우, 잘못된 데이터를 읽을 수 있음

    2. Non-Repeatable Read (비반복 읽기)

        동일한 트랜잭션 내에서 같은 데이터를 여러 번 조회할 때 값이 다르게 나타나는 문제  

        > 트랜잭션 A가 데이터를 읽고 있는 동안 트랜잭션 B가 해당 데이터를 수정하거나 삭제하는 경우

    3. Phantom Read (환상 읽기)

        동일한 쿼리를 두 번 이상 실행했을 때 처음에는 없던 데이터가 두 번째 실행 결과에서 나타나는 문제  

        > 트랜잭션 A가 특정 조건에 맞는 행을 조회하는 동안 트랜잭션 B가 새로운 행을 삽입했을 때 발생

### 영속성(Durability)

트랜잭션 실행으로 데이터에 변경된 사항이 저장되도록 보장해줌
=> 오류가 나도 성공적으로 작업된 결과는 실행로그에 남으며, 복원을 시작함

---
