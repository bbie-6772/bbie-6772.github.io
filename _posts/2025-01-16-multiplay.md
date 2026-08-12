---
layout: post
title: 멀티플레이 게임 - < 9 >
subtitle: 마무리 하루 전
author: bbie
categories: TCP-Multi-PlayGame
banner:
  image: https://github.com/user-attachments/assets/ee4fe93f-6293-4366-bc92-b8ca8622d397
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [Unity, Game-Server, Multiplayer, TCP]
---

## 추측 항법

- 추측 항법에 대해 생각을 해보았는데 위치 동기화 시점을 정할 때

    1. 일정 간격으로 서버에서 위치 동기화 송신

    2. 유저의 입력을 받을 때 서버에서 위치 동기화 송신

    3. 두 방법을 섞어서 사용(하이브리드)

- 이러한 방법들이 있는 것 같았다.

- 이중 까다로운 3번째 방법을 구현해볼 예정이다!

### 방향 전달

- 클라이언트에서 서버에게 방향을 전달하고, 이를 통해 위치를 검증해주는 로직을 구현한다!

- 방향 응답을 보내주는 것과 이를 해석하여 벡터 좌표를 얻는데 애먹었다..

```jsx
 updatePosition({ x, y, directions, timestamp }) {

    // 방향키 해독
    const decode = {
        // 1 byte 에 0(위) 0(아래) 0(왼쪽) 0(오른쪽) 형식으로 입력키를 받음
        up: directions & 1 ? 1 : 0,
        down: directions & 2 ? 1 : 0,
        left: directions & 4 ? 1 : 0,
        right: directions & 8 ? 1 : 0
    }

    // 첫 입력 시 기존 시간을 기준으로 업데이트
    if(this.timestamp === null) this.timestamp = this.lastUpdateTime

    // 시간 간격 확인
    const timeDiff = (timestamp - this.timestamp) / 1000
    // 이전에 계산해둔 방향을 토대로 현재 위치 계산
    const nextX = this.x + this.speed * this.directX * timeDiff
    const nextY = this.y + this.speed * this.directY * timeDiff

    // 오차범위 10% 로 적합 시 위치 적용
    if (Math.abs(nextX - x) <= Math.abs(x * 0.1)) this.x = x;
    if (Math.abs(nextY - y) <= Math.abs(y * 0.1)) this.y = y;
    this.timestamp = timestamp
    this.lastUpdateTime = Date.now();

    // 받아온 값으로 다음 방향 계산 후 저장
    const axisX = decode.right - decode.left
    const axisY = decode.up - decode.down
    const vectorSize = Math.sqrt((axisX ** 2) + (axisY ** 2))
    this.directX = vectorSize > 0 ? axisX / vectorSize : 0
    this.directY = vectorSize > 0 ? axisY / vectorSize : 0

}
```

### 데드 레코닝

- 위에서 만들어둔 this.directX 와 this.directY 값을 읽어 다음 장소를 예상해주는 메서드를 만들어준다!

```jsx
calculatePosition(intervalTime, maxLatency) {
    // 경과시간 + 지연시간을 이용해 계산 (초 단위)
    const timeDiff = intervalTime / 1000  + maxLatency / 1000

    const nextX = this.x + this.speed * this.directX * timeDiff
    const nextY = this.y + this.speed * this.directY * timeDiff

    this.x = nextX
    this.y = nextY

    return {x: nextX, y:nextY }
}
```

- 이제 이걸 이용해 서버에서 0.1초마다 일괄적으로 보내주는 로직을 구성한다!

```jsx
// 위치 읽어오기
getAllLocation() {
    if(this.users.size <= 0) return
    // 게임 내 전체 유저 위치 확인
    const locations = Array.from(this.users).map(([id, user]) => {
        {
            return {
                id,
                playerId: user.playerId,
                ...user.calculatePosition(this.syncInterval, this.getMaxLatency())
            }
        }
    })
    const packet = createLocation({ users: locations })

    return packet
}

// 읽은 위치 일괄 분배
notificationLocation = () => {
    this.users.forEach((user) => user.socket.write(this.getAllLocation()))
}
```

- 위의 notificationLocation을 IntervalMangers를 이용해 0.1초마다 반복해준다!

```jsx
//생성 시
constructor() {
    this.id = uuid4();
    this.users = new Map();
    this.intervals = new IntervalManager()
    // 기본 위치 동기화 시간
    this.syncInterval = 100;
    this.isStart = false;
    // 위치 동기화 인터벌 생성
    this.intervals.addInterval(this.id, this.notificationLocation,this.syncInterval)
}
```

## 한줄 평 + 개선점

- 삼각함수나 벡터좌표에 대한 개념을 이번에 활용하여 기억에 더 오래 남을 것 같다!

- 추측항법에 관해 계산 오류가 나는 부분을 조금 더 면밀히 보고 싶었지만 시간이 부족했다..

---
