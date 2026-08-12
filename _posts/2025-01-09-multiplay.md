---
layout: post
title: 멀티플레이 게임 - < 4 >
subtitle: Latency, Ping 구현!
author: bbie
categories: TCP-Multi-PlayGame
banner:
  image: https://github.com/user-attachments/assets/2138a507-e57d-4b62-8001-2f2fcfcccbfa
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [Game-Server, Multiplayer, TCP]
---

## 클라이언트 연동

- 기본적으로 서버 <> 클라이언트 구조를 어느정도 완성하였다!

- 이제 남은건 서버와 클라이언트 간의 상호작용들을 설정해줄 차례다!

```folder
.
├── .env                    
├── assets                   
├── README.md               
├── client.js                          
└── src 
    ├── server.js                   
    ├── events         
    │   └── onData.js             // data 수신 시 발동하는 이벤트
    ├── config                  
    ├── constants       
    ├── protobuf          
    ├── init                   
    ├── db                        // db 접근 및 수정용 자료모음
    ├── utils                     // 기타 유용한 함수들 모음(공용)
    │   ├── parser                  // 분석에 이용되는 함수 모음
    │   │   └── packetParser.js       // 받은 packet 분석용 함수
    │   ├── response                // 서버의 응답에 필요한 함수 모음
    │   │   └── createResponse.js     // 응답 packet 생성용 함수
    │   └── notification            // 서버의 전달에 필요한 함수 모음
    │       └── game.notification.js  // 전달 packet 생성용 함수
    ├── session                   // 서버에 임시로 저장되는 정보
    │   ├── game.session.js         // 게임 관련 정보 관리 
    │   ├── user.session.js         // 유저 관련 정보 관리
    │   └── sessions.js             // 세션 총괄
    ├── classes                   // 구조 설정
    │   ├── models                  // 세션에 저장될 구조
    │   │   ├── game.class.js         // 게임 정보 구조
    │   │   └── user.class.js         // 유저 정보 구조
    │   └── managers                // handler 외의 상호작용 관리
    │       ├── base.manager.js       // 기본 구조
    │       └── interval.manager.js   // 반복 상호작용 구조
    └── handlers                  // 기본 상호작용
        ├── game                    // 게임 관련 상호작용
        │   ├── createGame.handler.js     // 게임 생성
        │   ├── joinGame.handler.js       // 게임 참가
        │   └── updateLocation.handler.js // 위치 수정
        ├── user                    // 유저 관련 상호작용
        │   └── initial.handler.js        // 유저의 서버 참가
        └── index.js                // handler 총괄(매핑)
```

### 기본 상호작용(Handler)

- 기본적으로 Handler를 이용해 클라이언트와 서버는 상호작용을 진행한다!

- 일단 Packet이 왔을 때 이를 핸들러에 이어주는 로직이 필요하다!

#### index.js

- 모든 핸들러에 아이디를 부여하여 관리해주는 파일이다!

```jsx
import initialHandler from "./user/initial.handler.js";
import { HANDLER_IDS } from "../constants/handlerIds.js";
import CustomError from "../utils/error/customError.js";
import { ErrorCodes } from "../utils/error/errorCodes.js";
import createGameHandler from "./game/createGame.handler.js";
import joinGameHandler from "./game/joinGame.handler.js";
import locationUpdateHandler from "./game/updateLocation.handler.js";

const handlers = {
    /* 
    [핸들러 아이디] : {
        handler: 핸들러 함수,
        protoType: 핸들러에 들어갈 payload 의 protobuf 구조
    }
    */
};

// 핸들러 함수 찾기
export const getHandlerById = (handlerId) => {
    if (!handlers[handlerId]) throw new CustomError(ErrorCodes.UNKNOWN_HANDLER_ID, 'Unknown handler id');
    else return handlers[handlerId].handler;
};

// 핸들러 함수에 들어갈 Payload의 구조 찾기
export const getProtoTypeNameByHandlerId = (handlerId) => {
    if (!handlers[handlerId]) throw new CustomError(ErrorCodes.UNKNOWN_HANDLER_ID, 'Unknown Prototype');
    else return handlers[handlerId].protoType;
};
```

#### onData.js

- 클라이언트에 의해 데이터가 들어오는 곳으로 핸들러에 맵핑해주는 역할을 해준다!

- [참고 포스트 - 바이트 배열 분리](https://bbie-6772.github.io/tcp-multi-playgame/2025/01/06/multiplay.html)

```jsx
/* 온전한 패킷을 받은 뒤 */
import { packetParser } from "../utils/parser/packetParser.js";
import { getHandlerById } from "../handlers/index.js";

// packetParser에서 payload 구조까지 역직렬화 해줌 
const { handlerId, userId, payload, sequence } = packetParser(packet);

// 핸들러 매핑
const handler = getHandlerById(handlerId);

// 핸들러 실행 ( 입력값을 객체로 주어 유지보수 및 확장성을 높임 )
await handler({ socket, userId, payload, sequence });
```

### 게임 Class와 Session

- 클라이언트의 정보를 저장 및 관리해줄 class 객체를 생성해준다!  
( 가독성 및 유지보수성 GOAT )

- 객체를 이용해 서버에 저장할 공간 세션을 만들어 준다!

#### session.js

- 각 세션들의 데이터들을 총괄해주는 파일이다

```jsx
// 세션 보관
export const userSessions = [];
export const gameSessions = [];
```

#### models

- 세션에 보관될 정보를 결정해주며 필요한 함수(메서드)들을 정의해주는 곳이다!

```jsx
// 예시 user.class.js
import { createPingPacket } from "../../utils/notification/game.notification.js";

class User {
    constructor(id, socket) {
        this.id = id;
        this.socket = socket;
        this.x = 0;
        this.y = 0;
        this.latency = 0;
        this.sequence = 0;
        this.lastUpdateTime = Date.now();
    }

    updatePosition(x, y) {
        this.x = x;
        this.y = y;
        this.lastUpdateTime = Date.now();
    }

    getNextSequence() {
        return ++this.sequence;
    }

    ping = () => {
        const now = Date.now();
        console.log(`ping: ${this.id}`);

        this.socket.write(createPingPacket(now));
    }

    handlePong (data) {
        const now = Date.now();
        this.latency = (now - data.timestamp) / 2;
        console.log(`pong: ${this.id}, latency: ${this.latency}`);
    }

    calculatePosition(latency) {
        // 초 단위 변환 
        const timeDiff = latency / 1000;
        // 속도는 임시로 1로 설정
        const speed = 1;
        const distance = timeDiff * speed;

        return {
            x: this.x + distance,
            y: this.y
        }
    }
}

export default User;
```

#### managers

- handler의 경우 클라이언트의 요청에 의해 서버에서 처리를 하는 방식으로 구현된다

- 하지만 이와 상관없이 서버에서 자체적으로 정보를 보내야할 때도 있다!

- 이러한 상황에 쓰이는 class 들을 정의해주는 곳이다

```jsx
// 기본 양식 (base.manager.js)
class BaseManger {
    constructor() { 
        // 오버라이드 없이 사용 불가하도록 설계
        if (new.target === BaseManger) {
            throw new TypeError("Cannot construct Abstract instances directly");
        }
    }

    addPlayer(playerId, ...args) {
        throw new Error('Method not implemented');

    }

    removePlayer(playerId) {
        throw new Error('Method not implemented');
    }

    clearAll(){
        throw new Error('Method not implemented');
    }
}

export default BaseManger;
```

### 지연시간(Latency)과 핑(Ping)

![image](https://github.com/user-attachments/assets/ca68d6fa-be95-4386-b6fa-d176ead63bee)

- 지연시간이란 한 지점에서 다른지점으로 이동하는데 걸리는 시간을 의미한다

- 서버와 클라이언트 간의 데이터가 이동하는 총 시간을 왕복시간(Round trip Latency)이라 한다

- 이러한 왕복시간으로 인해 클라이언트의 사용자 경험이 떨어질 수 있다!

- 이번엔 이를 해결해주는 방법들을 이용해보겠다!

#### 추측항법 (Dead Reckoning)

- 레이턴시에 따라 사용자의 행동을 예측하여 서버의 응답 없이도 매끄러운 게임 플레이를 가능하게 하는 기술

- 여기서 사용자가 지연을 느끼지 못하도록 하는 방법을 레이턴시 마스킹(Latency Masking)이라 한다!

1. 전용 Packet 구조 설계

    - 왕복시간을 확인하는 Ping을 쓰기위해 Packet을 새로 구성해준다!  
    ( 필요한 정보만 빠르게 주고 받을 수 있도록)

    ```proto
    <!-- 핑 확인용 Packet -->
    message Ping {
    int64 timestamp = 1;
    }

    <!-- 위치 동기화 용 Payload -->
    message LocationUpdatePayload {
    string gameId = 1;
    float x = 2;
    float y = 3;
    }
    ```

2. Manager class 생성

    - 이제 이러한 패킷들을 이용한 통신을 도와줄 class를 생성해준다

    ```jsx
    /* interval.manager.js */
    // 게임에 참여한 플레이어들끼리 위치동기화를 위해 사용
    // game 세션에 변수로 class가 대입됨
    import BaseManger from "./base.manager.js";

    class IntervalManager extends BaseManger {
      constructor() {
          super();
          this.intervals = new Map();
      }

      addPlayer(playerId, callback, interval, type = "user") {
          if (!this.intervals.has(playerId)) {
              this.intervals.set(playerId, new Map());
          }
          this.intervals.get(playerId).set(type, setInterval(callback, interval));
      }

      removePlayer(playerId) {
          if(this.intervals.has(playerId)){
              this.intervals.get(playerId).forEach((intervalId) => {
                  clearInterval(intervalId);
              });
              this.intervals.delete(playerId);
          }
      }

      clearAll(){
          this.intervals.forEach((intervals) => {
              intervals.forEach((intervalId) => {
                  clearInterval(intervalId);
              });
          });
          this.intervals.clear();
      }   

      removeInterval(playerId, type = "user") {  
          if(this.intervals.has(playerId)){
              const userInterval = this.intervals.get(playerId);
              if(userInterval.has(type)){
                  clearInterval(userInterval.get(type));
                  userInterval.delete(type);
              }
          }
      }

      addUpdatePosition(playerId, callback, interval) {
          this.addPlayer(playerId, callback, interval, "position");
      }
  
      addGame (gameId, callback, interval) {
          this.addPlayer(gameId, callback, interval, "game");
      }
    }

    export default IntervalManager;
    ```

## 한줄 평 + 개선점

- 정리를 한다는 거에 너무 몰입해서 중요한 정보만을 간추리는 작업을 잘 못한 것 같다..

- 정보들을 더 분할해보거나 추후에 사용하지 않을 것들을 잘 생각해봐야 겠다!

---
