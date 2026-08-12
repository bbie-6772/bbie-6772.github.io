---
layout: post
title: 멀티플레이 게임 - < 8 >
subtitle: 프로젝트 진행
author: bbie
categories: TCP-Multi-PlayGame
banner:
  image: https://github.com/user-attachments/assets/ee4fe93f-6293-4366-bc92-b8ca8622d397
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [Unity, Game-Server, Multiplayer, Database, TCP]
---

## DB 연동

### 마이그레이션

- DB에 저장할 정보들을 지정해두어 DB가 바뀌어도 테이블의 기본 형식을 설정해주어 사용가능하도록 해준다!

- DB 마이그레이션에 사용할 SQL 문법

```SQL
CREATE TABLE IF NOT EXISTS users 
(
    device_id VARCHAR(255) PRIMARY KEY, 
    location_x FLOAT DEFAULT 0,
    location_y FLOAT DEFAULT 0,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

- 이를 불러와 사용해주는 js 함수

```jsx
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pools from '../database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

const executeFile = async (pool, filePath) => {
    const SQL = fs.readFileSync(filePath, 'utf-8');
    const queries = SQL.split(";")
    .map((query) => query.trim())
    .filter((q) => q.length > 0);

    for (const query of queries) await pool.query(query);
}

const createSchemas = async () => {
    const filePath = path.join(__dirname, 'database.SQL')
    try {
        await executeFile(pools.USER_DB, filePath);
    } catch(e) {
        console.error("DB 생성 오류",e);
    }
}

createSchemas().then(()=> {
    console.log("DB 생성완료");
    process.exit(0);
}).catch((e) => {
    console.error(e);
    process.exit(1);
})
```

### 쿼리 정리

- DB에 사용할 쿼리와 실행시켜주는 함수를 만들어준다!

```jsx
// 사용할 쿼리들만 모아두기
export const USERS_QUERIES = {
    CREATE_USER: 'INSERT INTO users (device_id) VALUES (?)',
    FIND_USER: 'SELECT device_id, location_x, location_y FROM users WHERE device_id = ?',
    SAVE_LOCATION: 'UPDATE users SET location_x = ?, location_y = ? WHERE device_id = ?',
    UPDATE_USER_LOGIN: 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE device_id = ?',
}
```

- 이를 실행시켜주는 함수를 만들어준다.

```jsx
import pools from "../database.js"
import { USERS_QUERIES } from "../queries.js"

export const createUser = async (id) => {
    await pools.USER_DB.query(USERS_QUERIES.CREATE_USER, [id])
}

export const updateLogin = async (id) => {
    await pools.USER_DB.query(USERS_QUERIES.UPDATE_USER_LOGIN, [id])
}

export const saveLocation = async (id, x, y) => {
    await pools.USER_DB.query(USERS_QUERIES.SAVE_LOCATION, [x, y, id])
}

export const findUser = async (id) => {
    const [rows] = await pools.USER_DB.query(USERS_QUERIES.FIND_USER, [id])
    console.log(rows[0])
    return rows[0]
}
```

### 기능 연결

- 이제 이 함수들을 로그인 / 접속종료 에 연결해주면 된다!

```jsx
/* 첫 연결 핸들러 내부 */
// 세션에 유저 존재 확인
let user = users.getUser({userId})

// 존재 시 socket 을 바꿔줌
if(user) {
    user.updateSocket(socket);
    // DB에 최근 로그인 시간 업데이트
    await updateLogin(userId);
// 서버에 없을 시
} else {
    // DB에 유저 존재 확인
    const dbUser = await findUser(userId);
    user = users.addUser(userId, socket, latency)
    // 존재 시 db에 저장된 위치 불러옴
    if (dbUser) {
        user.updatePosition(dbUser.x, dbUser.y)
        await updateLogin(userId);
    // 없을 시 db에 유저 생성
    } else await createUser(userId)
}
```

- 또한 연결이 끊어질 때 사용되는 메서드에도 saveLocation 함수를 매핑해준다!

```jsx
/* users 세션 관리 */
removeUser = async ({ userId, socket }) => {
    if (socket) {
        userId = this.socketToUser.get(socket)
        this.socketToUser.delete(socket)
    }
    // 참여한 게임이 있을 시 확인해서 삭제
    const user = this.users.get(userId)
    // user를 찾을 수 없으면 종료
    if (!user) return
    if (user.gameId) games.games.get(user.gameId).removeUser(userId)
    // 마지막 위치 DB에 저장
    await saveLocation(userId, user.x, user.y)
    this.users.delete(userId)
}
```

## 추측항법

- 현재는 이러한 과정으로 위치 동기화가 일어나고 있다!

    1. 클라이언트가 프레임마다 위치를 보낸다.

    2. 서버는 일정주기(0.2초) 마다 받아온 위치들을 종합하여 유저들에게 보내준다

- 이로인해 클라이언트는 계속 움직였음에도 서버에서 받아온 값을 적용하는 과정에서 뒤로 돌아간다..

- 이를 방지하기 위해 클라이언트에게 주는 위치 정보를 지연시간을 계산한 값으로 보내줘야한다! (=추측항법)

### 계산

- 새로운 x 좌표 = 현재 x 좌표 + (속도 *방향의 x 성분* 시간)

- 새로운 y 좌표 = 현재 y 좌표 + (속도 *방향의 y 성분* 시간)

- 위와 같은 공식을 이용해 **기존 좌표**와 **받은 좌표**를 분석해 **새로운 좌표**를 계산해야한다!

#### 속도

- 일단 서버에서 계산 할 때 방향과 시간은 주고받는 latency와 (x,y) 좌표들을 활용해 계산할 수 있다!

- 속도 또한 받은 (x,y)를 통해 계산할 순 있지만!... 서버의 존재 의의 "검증"이 안됀다..

- 그렇기에 유저가 게임에 참여할 때 속도를 주고,  
속도 관련 이벤트 발생 시 서버에서 업데이트하는 형식으로 구현하는 것이 좋을 것 같다!

1. 클라이언트는 접속 시 초기 speed를 보내도록 설정  
( 아마 추후 프로젝트에선 assets 같은 자료구조에서 상수로 관리할 것 같음)

    ```c#
    void SendInitialPacket() {
        InitialPayload initialPayload = new InitialPayload
        {
            deviceId = GameManager.instance.deviceId,
            playerId = GameManager.instance.playerId,
            latency = GameManager.instance.latency,
            speed = GameManager.instance.player.speed,
        };

        // handlerId는 0으로 가정
        SendPacket(initialPayload, (uint)Packets.HandlerIds.Init);
    }
    ```

2. 서버에선 이를 이용해 speed 초기값을 지정

    ```jsx
    import { users } from "../../session.js"

    export const initialHandler = async ({socket, payload}) => {
        const { deviceId: userId, latency, speed} = payload

        // users 세션에 유저 추가에 speed 값 포함
        users.addUser(userId, socket, latency, speed)
    }
    ```

#### 방향 계산

- 좌푯값을 업데이트할 때마다 방향을 구해준다!

```jsx
updatePosition(x, y) {
    //아크 탄젠트로 방향을 얻음
    this.direct = Math.atan2(y - this.y,x - this.x);
    this.x = x;
    this.y = y;
    this.lastUpdateTime = Date.now();
}
```

- cos()과 sin()을 이용해 방향(라디안)에서 x와 y의 벡터 좌표(방향성) 를 얻는다!

```jsx
// 추측항법 시 사용
calculatePosition(latency) {
    // 가장 긴 지연시간 기준 (초 단위)
    const timeDiff = latency / 1000;

    const nextX = this.x + this.speed * Math.cos(this.direct) * timeDiff
    const nextY = this.y + this.speed * Math.sin(this.direct) * timeDiff
    return {x: nextX, y:nextY }
}
```

- 현재 위치 동기화의 intervalTime을 고려하지 못한 점과 방향이 서버->클라->서버 에 의해 양의방향으로 올라가는 문제도 해결해야한다!

## 한줄 평 + 개선점

- 추측항법을 구현하는 과정을 좀더 구체화시키며 개념을 확립시켜야겠다.

- 식 및 입력값을 개선하는 방법을 잘 찾아보자!

---
