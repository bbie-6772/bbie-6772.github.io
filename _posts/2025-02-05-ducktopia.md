---
layout: post
title: Ducktopia - <2>
subtitle: MVP 구현
author: bbie
categories: Ducktopia-Project
banner:
  image: 
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: []
---

## MVP 구현 시작

어제 기록했던 것처럼 오늘은 MVP의 기능들을 구현하기 전, 전체적인 기한을 정하기로 하였다.

### 기한 설정

![Image](https://github.com/user-attachments/assets/39654caf-080a-40fa-9c45-1271a2e6a862)

- MVP 구현 기간 : 팀원별로 분리한 기능 구현을 마치는 기간

- MVP 서버 종합 : 서버에서 통신하는 형태를 종합받아 정해주기

- 클라이언트 <> 서버 연결 : 구현된 클라이언트와 서버를 정해진 통신 구조로 연결하는 과정

- 발표준비 : 중간 점검/발표를 위해 자료 정리를 하는 기간으로 2차 구현을 병행하며 할 예정이므로 메인이 아니라 적어두었다.

### 역할 분담

원래 맡게된 기능이 게임루프 기능으로, 서버에서 시뮬레이션을 하여 클라이언트에게 일방적으로 정보를 보내주는 기능이다.  
일단 MVP에 설정한 기능에서 클라이언트의 요청없이 일방적으로 보내줘야하는 상황을 찾기위해 이벤트들을 정리해보았다.

![Image](https://github.com/user-attachments/assets/c8380d86-87a8-4dc7-b722-f90cf0a4d838)

- 이렇게 쭉 정리한 후, 분담된 역할에 따라 기능들을 분류해보니...

- 말 그대로 클라이언트 간섭없이 **서버에서 일방적으로 보내는 경우가 없었다!**

그렇게 MVP의 기능으로써 구현할 기능이 없다는걸 깨달아 후에 사용하게될 구조나 기능들을 확인하여 구현하게 되었다!

![task](https://github.com/user-attachments/assets/2352f772-0940-4865-9aa1-3085834e6dc9)

### 활성화/이동 메서드

오브젝트가 타겟에 의해 활성화되고, 이동하는 메서드를 위의 표에 맞춰 구현해보았다!

1. **기본 구조**

    ```jsx
    class ObjectBase {
      constructor(id, x, y, range, speed) {
        // 오브젝트 고유 ID
        this.id = id
        // 오브젝트 위치
        this.x = x;
        this.y = y;
        // 오브젝트의 방향
        this.directX = 0;
        this.directY = 0;
        // 오브젝트 속도
        this.speed = speed;
        // 오브젝트 인식범위
        this.awakeRange = range;
        // 활성화 여부
        this.awake = false;
        // 타겟 ID 
        this.targetId = null;
        // 좌표 계산용 시간
        this.timestamp = 0;
      }
    }
    ```

2. **활성화 메서드**

    - 활성화 시, 이동에 사용할 값들을 업데이트 해주도록 하였다

    ```jsx
    // 오브젝트 활성화 메서드
    // 반환값은 id or -1(깨어나지 않음)
    awake(x, y, targetId) {
        if (this.awake) return this.id
        // 대상과의 거리 확인 및 만족 시, 활성화
        if (Math.sqrt((this.x - x) ** 2 + (this.y - y) ** 2) <= this.awakeRange ) {
            this.targetId = targetId
            this.awake = true;
            this.timestamp = Date.now();
            return this.id
        }
        return -1 
    }
    ```

3. **이동 메서드**

    - 통신의 횟수를 최적화하기 위해 방향이 바뀔때마다만 값을 전달하는 방식으로 구현해 보았다.

    ```jsx
    // 오브젝트 움직임 메서드
    // target으로 향하는 방향, 속도, 좌표, 시작 시간 전달
    // 실패 시 -1 , 목표지점 도착 시 1 반환
    move(targets) {
        if (this.targetId === null) return -1
        // [1] 대상 찾기
        const target = targets.find((target) => target.id === this.targetId)
        if(!target) {
            this.awake = false
            this.targetId = null;
            return -1
        }

        // [2] 타겟과 자신의 위치로 방향 확인
        const axisX = target.x - this.x
        const axisY = target.y - this.y

        // [3] 벡터 사이즈(거리) 계산
        const vectorSize = Math.sqrt((axisX) ** 2 + (axisY) ** 2);

        // [4] 방향(벡터 좌표) 저장
        const directX = x / vectorSize;
        const directY = y / vectorSize;
    
        // [5] 시간 경과 확인
        const timestamp = Date.now()
        const timeDiff = (this.timestamp - timestamp) / 1000

        // [6] 현재 좌표 계산 및 적용
        this.x = this.x + this.speed * directX * timeDiff
        this.y = this.y + this.speed * directY * timeDiff
        this.timestamp = timestamp
        const position = { x: this.x, y: this.y }

        // [7] 현재 좌표에서 대상과 인식 범위가 닿지 않으면 잠들기
        if (vectorSize > this.awakeRange) {
            this.awake = false
            this.targetId = null;
        }

        // [8] 방향이 이전 값과 비교해 변경되지 않았다면 전달 X
        if (this.directX === directX && this.directY === directY) return -1

        this.directX = directX
        this.directY = directY
        // [9] 현재 방향(벡터 좌표) / 속도 / 위치 / 시간 반환
        return {direct: { x: directX, y: directY }, speed: this.speed, position, timestamp }
    }
    ```

## 한줄 평 + 개선점

- 구현한 기능들이 실용성이 있을지 기능테스트를 해보고 싶지만,  
클라이언트나 활성화가 트리깅 되는 부분이 구현되지 않아 디버깅은 조금 걸릴 것 같다!

---
