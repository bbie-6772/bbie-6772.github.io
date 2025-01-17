---
layout: post
title: 멀티플레이 게임 - < 7 >
subtitle: 프로젝트 진행
author: bbie
categories: TCP-Multi-PlayGame
banner:
  image: https://github.com/user-attachments/assets/ee4fe93f-6293-4366-bc92-b8ca8622d397
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [Unity]
---

## 위치 동기화

- 현재 게임에 참여하면 핑을 주고 받기 시작한다

- 이제 게임에 참여한 인원들의 위치를 서버와 클라이언트끼리 동기화 해주어야한다

### 게임 내 위치 동기화

- Game class 에서 모든 유저 위치 정보를 알려주는 메서드를 생성한다

```jsx
// Game class 메서드
getAllLocation (playerId) {
    // 게임 내 전체 유저 위치 확인
    const payload = Array.from(this.users).map(([id, user]) => {
        {
            return {
                id: user.id,
                playerId: user.playerId,
                x: user.x,
                y: user.y,
            }
        }
    })
    return { users: payload }
}
```

- 이제 이를 IntervalManger를 이용해 일정시간마다 동기화 해주기 위해 User class에 메서드를 만든다

```jsx
//User class 메서드
updateAllLocation = () => {
    const game = games.games.get(this.gameId)
    const payload = game.getAllLocation()

    this.socket.write(createLocation(payload))
}
```

- IntervalManger에 바인딩!

```jsx
// Game에 유저가 추가되었을 시 0.2초마다 위치 동기화
addUser(user) {
    user.updateGameId(this.id)
    this.users.set(user.id, user)
    // 핑 관리
    this.intervals.addInterval(user.id, user.ping, 200)
    // 위치 동기화 관리
    this.intervals.addInterval(user.id, user.updateAllLocation, 200, location)
}
```

### 클라이언트 Location 관리

- 현재 위에선 서버에서 일방적으로 클라이언트에게 몇초마다 위치정보를 공유해준다!

- 하지만 클라이언트가 움직인 정보를 받아오는 핸들러가 없다..

- 이에 필요한 핸들러와 관련 user method를 사용해준다!

```jsx
// 위치 업데이트 핸들러
export const locationUpdate = ({ socket, userId, payload }) => {
    const user = users.getUser({userId})
    // 유저의 위치를 받아온 값으로 지정해줌
    user.updatePosition(payload.x, payload.y)
}
```

### 멀티플레이 실험

- Unity에서 멀티플레이를 실험해보기 위해 MPPM(MultiPlay Play Mode) Package를 사용하였다!

![image](https://github.com/user-attachments/assets/ca7df0d2-cc65-4003-8dea-6e4ed6b0b44a)

- 잘 보면 자신의 위치에 받아온 값으로 캐릭터를 생성하여 자신을 밀쳐내는... 버그가 있다!

- 그럼 받아온 값에서 자신을 제외하면 되나? 라고 생각을 했지만

- 서버에서 받아온 값의 우선순위가 높으므로 자신의 위치를 변경하는 것이 옮은 것 같다!

#### 오류 해결

- 일단 서버에서 받아올 때 user의 id 값을 받아오기에 이를 클라이언트의 값과 비교해 다른 로직을 적용해주면 될 것 같다!

```c#
// 받아온 data 에서 users를 순회하며 spawn 하도록 해주는 곳 
foreach(LocationUpdate.UserLocation user in data.users) {
    // 만약 받아온 값중 id가 player id와 같으면
    if (user.id == GameManager.instance.player.deviceId)
    {   
        //player 의 위치를 받아온 값으로 이동시켜주기
        GameManager.instance.player.UpdatePositionFromServer(user.x, user.y);
    // 아닐 경우 기존 로직대로 생성
    } else {
        newUsers.Add(user.id);

        GameObject player = GameManager.instance.pool.Get(user);
        PlayerPrefab playerScript = player.GetComponent<PlayerPrefab>();
        playerScript.UpdatePosition(user.x, user.y);
    }
}
```

- 서버에서 Latency 계산식(추측항법)을 넣어주지 않아서 그런지 뚝뚝 끊긴다..

### 마지막 위치

- 일단 동기화로 플레이어들끼리 위치를 표시해줄 순 있었다!

- 앞으로 접속 종료 및, 오류로 튕긴 후 재접속 시 이전의 자리로 돌려주는 로직을 구현할 것이다!

#### 연결 종료

- 일단 현재 Unity 시뮬레이션을 종료했음에도 TCP 연결이 끊어지지 않는다!

- 나가기 버튼을 클라이언트에 만들어 클라이언트에서 TCP 연결 및 게임을 종료할 수 있도록 해주어야 겠다

![image](https://github.com/user-attachments/assets/8367dc03-7ab8-4de9-abc1-00d29d38911b)

#### DB 연동

- 현재 플레이어의 device Id를 서버에 보내주며 접속을 하는데.. 이를 저장해두는 매체가 없다

- 플레이어들을 device Id로 구분하여 마지막 위치를 저장해줄 DB를 구성해 주어야겠다

```jsx
import { config } from "../config/config.js";
import mysql from 'mysql2/promise'

const { database } = config;

const createPool = (dbConfig) => {
    const pool = mysql.createPool({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.name,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    return pool;
}   

const pools= {
    USER_DB: createPool(database.USER_DB)
}

export default pools;
```

- 이제 연결확인을 해줄 함수도 만들어 init/index.js에 포함시켜준다

```jsx
/* utils/db/testConnection.js */
const testDBConnection = async (pool, dbName) => {
    try{
        const [rows] = await pool.query('SELECT 1 + 1 AS solution')
        console.log(`${dbName} 연결 확인결과 ${rows[0].solution}`)
    }catch(e) {
        console.error(dbName,"연결 실패")
    }
}

export const testAllConnections = async (pools) => {
    Object.entries(pools).forEach(async ([name, pool]) => {
        await testDBConnection(pool, name)
    })
}
/* init/index.js */
export const initServer = async () => {
    try {
        // 현재 서버에 게임 하나만 돌아가도록 설정
        gameId = await games.createGame();
        await loadProtobufs();
        // db 연결 확인
        await testAllConnections(pools);
    } catch (e) {
        console.error(e)
        process.exit(1)
    }
}
```

## 한줄 평 + 개선점

- 오늘 생각보다 진도가 나간 것 같아 좋지만! 전체적 진도는 조금 아쉽다.. 화이팅!

---
