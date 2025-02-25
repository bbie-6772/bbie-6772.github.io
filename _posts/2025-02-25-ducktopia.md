---
layout: post
title: Ducktopia - <15>
subtitle: 분산 서버 구현
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

## 분산 서버

이제 Gateway 서버에서 동적으로 서버주소를 받아와 연결해주고 관리할 수 있도록 구현하였다!  
남은일은 Health Check를 통해 게임서버에 로드밸런싱하는 로직을 추가 구현해주고,  
게임이 끝난 시점을 Redis를 이용해 공유하도록 구조를 재설계해줄 예정이다!

### Health Check

Gateway 서버에서 Redis를 이용해 서버마다 Health Check를 개별로 진행될 수 있도록 Server Class를 만들었다!

```jsx
class Server {
  constructor(serverId, socket) {
    this.socket = socket;
    this.socket.id = serverId; //여기에 유니크 아이디
    this.type = serverId.split(':')[1];
    this.stack = 0;
    // 5초마다 interval을 통해 Health Check
    this.interval = setInterval(this.healthCheck, 5000);
  }

  healthCheck = async () => {
    // stack 증감 확인
    const test = await redisClient.hGet(this.socket.id, 'check', 'testing');
    if (test === 'testing') this.stack++;
    else this.stack = 0;

    // stack 검증으로 서버연결 업데이트
    if (this.stack >= 2) {
      switch (this.type) {
        case 'Game':
          onGameEnd(this.socket)();
          break;
        case 'Lobby':
          onLobbyEnd(this.socket)();
          break;
      }
    }

    // Health Check 알림
    redisClient.hSet(this.socket.id, 'check', 'testing');
    redisClient.publish(this.socket.id, 'testing');
  };

  // 인터벌 초기화
  clearChecker() {
    clearInterval(this.interval);
  }
}
```

이제 이 Pub/Sub을 통해 각자 자신의 check 란을 testing 대신 update로 바꿔주어 5초마다 헬스체킹에 성공하도록  매핑해준다!

```jsx
import { redisClient } from '../redis.js';

// 방 생성 핸들러
const healthCheck = (message, channel) => {
  redisClient.hSet(channel, 'check', 'update');
};

export default healthCheck;

// 헬스체크 Sub 매핑
subscriber.subscribe(name, healthCheck);
```

### Load Balancer

현재 Gateway에서 게임 서버로 로드 밸런싱(부하 분배)를 해야하는데, 이 때 게임 서버마다 어떤 정보를 가지고 구분해줄 수 있을까?  
그래서 제일 간단한 방법으로 게임 서버에서 돌아가는 게임 수를 Redis에 업데이트 해주는 형식을 차용하기로 했다!  

#### 게임 수 업데이트

게임 서버에서 게임이 만들어질 때, 제거될 때 이를 업데이트 해주는 로직을 추가해주었다!

```jsx
class GameSession {
  constructor() {
    this.name = null;
    this.games = new Map(); // key : roomId, value : room
  }
  // 게임 추가하기
  async addGame(gameId, ownerId) {
    const game = new Game(gameId, ownerId);
    this.games.set(gameId, game);
    await redisClient.hSet(this.name, 'games', this.games.size); 
    return game;
  }

  // 게임 지우기
  async removeGame(game) {
    game.gameEnd();
    this.games.delete(game.id);
    await redisClient.hSet(this.name, 'games', this.games.size);
  }
}
```

#### 로드 밸런싱

Lobby 서버에서 게임이 시작되는 패킷을 받으면 로드 밸런싱과 게임 서버 주소를 할당해주도록 구현해준다!

```jsx
const gameStartHandler = async ({ socket, payload, userId }) => {
  // 방장의 상태 확인
  const user = userSession.getUserByID(userId);
  if (!user || !user.id) throw new CustomError('유저 정보가 없습니다.');
  if (user.getGameState()) throw new CustomError(`올바르지 못한 요청입니다. (USER ID: ${user.id})`);

  if (payload.success) {
    // 로드 밸런싱 후 게임 서버 이름 저장
    const gameServers = serverSession.getGameServers();
    let minGameCount = Infinity;
    let gameServerId = null;
    let minGameServer;

    // game 수가 최소인 게임 서버 ID 확인
    for (const [id, gameServer] of gameServers) {
      const count = await redisClient.hGet(id, 'games');
      if (count < minGameCount) {
        minGameCount = count;
        gameServerId = id;
        minGameServer = gameServer;
      }
    }

    // 게임 상태 동기화
    for (const { name, userId: tempId } of payload.room.users) {
      const tempUser = userSession.getUserByID(tempId);
      tempUser.setGameState(payload.success);
      tempUser.gameServer = gameServerId;
    }

    const serverPayload = { room: payload.room };
    const reqPacket = makeServerPacket(
      config.packetType.JOIN_SERVER_REQUEST,
      serverPayload,
      user.id,
    );

    console.log(`${gameServerId} 서버로 ${payload.room.users.length}수의 유저가 분배되었습니다!`);
    minGameServer.socket.write(reqPacket);
  } else throw CustomError('게임 시작 요청이 실패했습니다.');
};
```

예상대로 잘 작동한다! 후에 부하테스트할 때 쯤 이 부분을 다시 보게 될 것 같다

### User GameEnd

현재 게임이 끝나면 Game 서버에서 GameOverNotification이라는 패킷을 주어 Gateway에서 이를 Lobby에 전달해 방을 삭제하도록 하면서 자신이 갖고있는 User의 정보를 업데이트 해주도록 되어있다!  
그러나 User 정보를 업데이트 할 때, 패킷내에 게임 내 User들의 전부를 전부 보내주지 않기 때문에 동기화가 어렵다..  
이러한 상황에서 Redis의 Pub/Sub 기능을 이용해 패킷구조 변경없이 User들의 상태나 Room/Game의 상태를 동기화 해준다!

#### GameOver

```jsx
// 게임이 끝날 때 Game 서버에서 실행해주는 메서드
gameEnd() {
    clearInterval(this.gameLoop);
    const userIds = [];
    this.gameLoop = null;
    this.users.forEach((user) => {
      userSession.deleteUser(user.id);
      userIds.push(user.id);
    });
    // Gateway의 User 정보 업데이트용
    redisClient.publish('UserGameEnd', userIds.join(','));
    // Lobby의 Room 삭제용
    redisClient.publish('RemoveRoom', this.id);
}
```

#### Lobby DeleteRoom

```jsx
import { roomSession } from '../../../sessions/session.js';

// 방 생성 핸들러
const deleteRoom = (roomId) => {
  console.log(`${roomId} 방 삭제됨`);
  // 2. 방 가져오기
  const room = roomSession.getRoom(+roomId);
  if (!room) return;

  // 방을 삭제하고 내부 인원들의 상태를 동기화
  roomSession.removeRoom(room);
};

export default deleteRoom;

// redis.js
subscriber.subscribe('RemoveRoom', deleteRoomHandler);
```

#### Gateway UserUpdate

```jsx
import { userSession } from '../../../sessions/session.js';

const updateInGame = (userIds) => {
  console.log('유저 업데이트', userIds);
  const users = userIds.split(',');

  for (const userId of users) {
    const user = userSession.getUserByID(+userId);
    if (!user) return;
    user.setGameState(false);
  }
};

export default updateInGame;

// redis.js
subscriber.subscribe('UserGameEnd', updateInGameHandler);
```

## 한줄 평 + 개선점

- Health Check/Load balance를 개념상 알고있었지만, 이를 직접 구현해보는 것은 아주 새롭고 재밌는 경험이였다!

---
