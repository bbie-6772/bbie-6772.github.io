---
layout: post
title: 멀티플레이 게임 - < 6 >
subtitle: 기록
author: bbie
categories: TCP-Multi-PlayGame
banner:
  image: https://github.com/user-attachments/assets/2138a507-e57d-4b62-8001-2f2fcfcccbfa
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [Unity]
---

## 지연 시간과 핑 구현

1. 서버 요청(송신시간 전송)

2. 클라이언트는 받은 시간을 그대로 재전송

3. 서버는 받은 시점에서의 시간을 확인하여 계산

위와 같은 과정을 통해 서버<>클라이언트 간의 지연시간을 통해 PING을 계산하는 것 같다

### 서버 Ping 요청

- Ping <> Pong 을 받을 주체는 유저이기에 user.class에 관련 메서드를 생성해준다!

```jsx
ping = () => {
    // 패킷을 보내는 시간을 Payload 로 클라이언트에게 수신
    const pingPacket = createPing()
    this.socket.write(pingPacket)
}

pong ({timestamp}) {
    const now = Date.now()
    // 현재 시간과 받아온 시간으로 지연시간 계산
    this.latency = (now - timestamp) / 2;
}

//createPing() 참조
export const createPing = () => {
    const protoMessages = getProtoMessages()
    const Ping = protoMessages.common.Ping

    const now = { timestamp: Date.now() };
    const buffer = Ping.encode(now).finish();
    // Packet Type이 Ping인 헤더 추가하여 반환
    return addHeader(buffer, PACKAGE_TYPE.PING)
}
```

- 이제 Ping 을 시작해주는 Interval을 관리해주는 매니저를 게임마다 만들어준다!

```jsx
class IntervalManager {
    constructor() {
        this.intervals = new Map();
    }
    // 유저 및 interval 추가
    addPlayer(playerId, callback, intervals, type = "user") {
        if(!this.intervals.has(playerId)) {
            this.intervals.set(playerId, new Map());
        }

        this.intervals.get(playerId).set(type, setInterval(callback, intervals));
    }
    // interval 및 유저 삭제
    removePlayer(playerId) {
        if (this.intervals.has(playerId)) {
            this.intervals.get(playerId).forEach((interval) => {
                clearInterval(interval)
            })
        }

        this.intervals.delete(playerId)
    }

    // 전체 interval 초기화
    clearAll() {
        this.intervals.forEach((intervals) => {
            intervals.forEach((interval) =>{
                clearInterval(interval)
            })
        })
    }

    // 유저의 interval 삭제
    removeInterval(playerId, type = "user") {
        const userInterval = this.intervals.get(playerId)
        if (userInterval.has(type)) {
            clearInterval(userInterval.get(type))
            userInterval.delete(type)
        }
    }
}
```

- 이는 게임마다 Ping을 계산하기 때문에 game에 종속되도록 만들어준다!

```jsx
class Game {
    constructor() {
        this.id = uuid4();
        this.users = new Map();
        // 게임 당 하나의 인터벌 매니저 추가
        this.intervals = new IntervalManager()
        this.isStart = false;
    }
    addUser(user) {
        this.users.set(user.id, user)
        // 핑 확인 
        this.intervals.addPlayer(e.id, user.ping, 200)
    }
    // 메서드 생략
}
```

- 게임 참여 시 Ping을 계산해주는 핸들러를 만들어 준다

```jsx
import { gameId } from "../../init/index.js"
import { games, users } from "../../session.js"
import CustomError from "../../utils/error/customError.js"
import { ErrorCodes } from "../../utils/error/errorCodes.js"

export const joinGameHandler = ({ socket, userId, payload }) => {
    // 이 부분은 서버에서 게임이 1개 뿐이므로 다른 방식으로 구현하여 주석처리
    // const { gameId } = payload
    const game = games.games.get(gameId);

    const user = users.getUser({userId});
    if(!user) throw new CustomError(ErrorCodes.USER_NOT_FOUND,"User Not Found");

    game.addUser(user)

    // 방 부분이 추가되면 해야되는 작업
    // const response = createResponse({})
    // socket.write()
}
```

- 게임에서 지연시간을 이용할 때 가장 큰 수를 기준으로 작동할 예정이기에 이에 관련한 로직을 추가해준다!

```jsx
// Game 클래스 메서드
getMaxLatency() {
    this.users.reduce((max, user) => user.latency > max ? user.latency : max )
}
```

### 실행

- 위처럼 작성한 코드와 클라이언트를 이용하여 latency가 들어오는지 확인을 해보았다!

#### socketId 오류

- 지금까지 오해를 하고 있었던게 전에 사용한 socket.io(웹소켓) 라이브러리로 socket에 id들이 다 부여 되어있었다고 착각을 하였다!

- 그래서 users class(유저들 세션 관리)에서 사용하는 메서드에 들어가는 socketId 들을 수정해주었다

```jsx
// 수정 전의 자료 입니다
class Users {
    constructor() {
        this.users = new Map();
        // 유저 추가 시 socketId를 이용해 userId 를 찾기 위한 Map 객체
        this.socketToUser = new Map();
    }

    // 유저 추가
    addUser = (deviceId, socket, latency) => {
        const user = new User(deviceId, socket, latency)
        this.users.set(deviceId, user)
        this.socketToUser.set(socket.id, deviceId)
    }

    // 유저 삭제
    removeUser = ({ userId, socketId }) => {
        if (socketId) {
            userId = this.socketToUser.get(socketId)
            this.socketToUser.delete(socketId)
        }
        this.users.delete(userId)
    }

    // 유저 찾기
    getUser = ({ userId, socketId }) => {
        if (socketId) userId = this.socketToUser.get(socketId)
        return this.users.get(userId)
    }
}
```

#### 오류 확인

- 현재 errorHandler에 의해 오류들이 2가지 종류로 구분된다

```jsx
    if (error.name === "CustomError") {
        responseCode = error.code;
        message = error.message;
        console.error(`예상된 오류 ${responseCode} / ${message}`)
    } else {
        responseCode = ErrorCodes.SOCKET_ERROR;
        message = error.message;
        console.error("예상치 못한 오류", message)
    }
```

1. 예상된 오류 = CustomError 를 사용한 곳

2. 예상치 못한 오류 = CustomError로 처리되지 않은 곳

2의 경우 어디서 일어난지 디버깅하기 어려워 error.stack을 추가하였다!

```jsx
else {
    responseCode = ErrorCodes.SOCKET_ERROR;
    message = error.message;
    console.error("예상치 못한 오류", message, error.stack)
}
```

#### 실행 화면

![image](https://github.com/user-attachments/assets/8cbcdf55-f525-49f7-a1aa-5be1a7bc7ffb)

### 게임 종료

- 유저의 연결이 끊어지거나 끝나면 유저를 세션에서 제거해주는 작업이다!

```jsx
// onError 와 onEnd 이벤트에 적용
import { users } from "../session.js"

export const onError = (socket) => (err) => {
    users.removeUser({socket})
}
// Users class 메서드 참조
removeUser = ({ userId, socket }) => {
    if (socket) {
        userId = this.socketToUser.get(socket)
        this.socketToUser.delete(socket)
    }
    // 참여한 게임이 있을 시 확인해서 삭제
    const user = this.users.get(userId)
    if (user.gameId) games.games.get(user.gameId).removeUser(userId)

    this.users.delete(userId)
}
```

- 사실 위와 같이 게임에서 제외시키기 위해 User class에 gameId를 기록해주는 로직을 추가해주었다.

```jsx
class User {
    constructor(id, socket, latency) {
        // 다른 요소 생략
        this.gameId = null;
    }      
    // gameId 업데이트 메서드
    updateGameId(gameId) {
        this.gameId = gameId
    }
}
class Game {
    // Game 내부 메서드
    addUser(user) {
        // gameId 업데이트
        user.updateGameId(this.id)
        this.users.set(user.id, user)
        this.intervals.addPlayer(user.id, user.ping, 200)
    }
}
```

## 한줄 평 + 개선점

- 면접 준비를 하는 것과 어제 너무 잠을 설쳐서 진도가 느렸다..

- 내일은 좀더 알찰 수 있도록 할것들을 조금은 정리해두어야 겠다

### 할 일

1. 게임당 최고 Latency를 기준으로 유저와 클라이언트간 Location 정보를 업데이트 해주는 로직

2. DB를 이용해 유저의 마지막 위치 저장 및 불러오는 기능 추가

---
