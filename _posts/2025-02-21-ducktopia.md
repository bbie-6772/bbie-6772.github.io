---
layout: post
title: Ducktopia - <13>
subtitle: 분산 서버 구현
author: bbie
categories: Ducktopia-Project
banner:
  image: https://github.com/user-attachments/assets/e2201ed3-6804-4534-ac37-e2c9a678cddb
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [Redis, Load-Balancing, Game-Server]
---

## 분산 서버

### 서버 분리 마무리 작업

현재 서버들을 각 기능에 맞게 분리가 되어 클라이언트를 이용해 테스트해본 결과 잘 작동한다!  
그러나 유저가 게임을 떠나면 Gateway에서만 끊긴 것이 적용되기 때문에 이를 다른 서버에서도 인식할 수 있도록 조정해야한다!

#### 게임 서버 게임 삭제

게임이 끝나면 게임서버에선 관련된 세션들을 삭제해줘야 한다!  
그렇기에 게임오버를 보내는 곳에서 일괄적으로 삭제해주는 로직을 추가해준다

```jsx
// 게임 오버 로직 내부
if (coreHp <= 0) {
  console.log(`코어가 파괴되었습니다. HP: ${coreHp}`);
  const gameOverPayload = {};
  const gameOverNotification = [config.packetType.S_GAME_OVER_NOTIFICATION, gameOverPayload];
  game.broadcast(gameOverNotification);
  // 게임 삭제 + 유저 삭제
  gameSession.removeGame(game);
}
```

#### 로비 서버 방 삭제

로비에서도 게임이 끝났을 경우 방을 삭제하여야 한다!  
그렇기에 게임오버를 로비에게도 알려주는 로직이 Gateway에 필요해졌다

```jsx
//Gateway 서버의 GameServer OnData
if (packetType === config.packetType.S_GAME_OVER_NOTIFICATION[0]) {
  console.log(userId, '게임종료 확인');

  const lobbyServerSocket = serverSession.getServerById(config.server.lobbyServer);
  lobbyServerSocket.write(packet);
  user.setGameState(false);
}
```

이렇게 받은 패킷을 이용해 방을 삭제해주는 핸들러를 만들어준다!

```jsx
// 방 생성 핸들러
const deleteRoomHandler = async ({ socket, payload, userId }) => {
  // 1. 유저 찾기
  const user = userSession.getUser(userId);
  if (!user) throw new CustomError('유저가 존재하지 않습니다!');

  // 2. 방 가져오기
  const room = roomSession.getRoom(user.getRoomId());
  user.exitRoom();
  if (!room) return;

  // 3. 방장이 룸 삭제
  if (room.ownerId === userId) roomSession.removeRoom(room);
};
```

- 이렇게 게임종료 동기화가 완료되었다!

### 로드 밸런싱

이제 서버들을 기능에 따라 일괄적으로 분리에 성공했다! Gateway - Lobby - Game 이 상태에서 이제 증설할 서버와  
부하를 분배해줄 로드밸런서, 그리고 같은 종류의 서버끼리 공유할 정보를 Redis에 연동하는 것까지가 남은 작업이다!
( 현재 어제 수정했던 문제가 외부 로봇의 패킷이 아닌 내부 로직에 의한 것으로,  
추가 프로파일링 중이라 작업을 더이상 진행하지 못하였다 )

#### 로드 밸런서

로드 밸런서를 직접 구현하여야 되나? 기존의 로드밸런서를 세팅하고 사용하는 방식으로 해야하나에 대해 고민이 있었는데,
업계 실사용부분이나 편의성 부분에서 AWS의 EC2와 ELB를 이용하는 방식을 하도록 하였다!  

#### Redis

이제 Gateway Redis를 사용해 유저 정보를 실시간으로 업데이트하고,  
이를 다른서버에서 읽어 유저들을 삭제하거나 업데이트 할 수 있도록 세션 구조를 재조립할 예정이다!  
또한 서버 간의 상태를 체크하는 로직도 추가하여 사용할 예정이다.

## 한줄 평 + 개선점

- 여러 구조들을 생각해가며 구현하기 위해 생각하는 시간이 즐겁다.

---
