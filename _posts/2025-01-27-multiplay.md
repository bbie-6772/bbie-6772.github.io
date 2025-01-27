---
layout: post
title: 멀티타워디펜스 - < 6 >
subtitle: 리팩토링
author: bbie
categories: Multi-TowerDefense-Project
banner:
  image: https://github.com/user-attachments/assets/2403c1b6-7704-4ded-9562-204c27aa6ed2
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: []
---

## 리팩토링 작업

### utils 폴더 개선

- 현재 utils 폴더보다 다른구조로 병합하거나 옮길만한 파일들이 있다!

- 그러한 파일들을 정리해가며 옮겨준다.

```yaml
utils # utils 폴더 
├─ match # 매칭에 사용되는 함수 
│  ├─ finish.match.js # 매치(게임)이 끝났을 경우 정산
│  └─ start.match.js # 매치(게임)이 시작할 때 초기 값 반환
├─ path # 몬스터 길 만들기
│  └─ make.monster.path.js
├─ queue # 매칭 대기열 클래스
│  └─ waiting.queue.class.js
└─ send-packet # Packet 보낼 때 사용하는 함수
    ├─ makePacket.js # 패킷 만들기
    └─ payload # payload 구조 오브젝트화 함수
      ├─ game.data.js
      ├─ notification
      │  └─ game.notification.js
      └─ response
          └─ game.response.js
```

#### match 폴더

- 현재 match 폴더 내 기능은 게임의 끝과 시작에 사용된다.

- 게임(Room)의 시작과 끝을 관리해주는 RoomSession 클래스에 이 기능을 메서드로 병합하려 한다.

```jsx
// RoomSession 클래스 내부 메서드
startMatch(room) {
  let monsterPath = {};
  let playerData = {};
  const playerId = [];
  //초기값
  const initialGameState = makeInitialGameState(
    config.game.baseHp,
    config.game.towerCost,
    config.game.initialGold,
    config.game.monsterSpawnInterval,
  );

  //길만들기 // 객체 형태로 관리해 달라고 요청 하기.
  room.players.forEach((player) => {
    monsterPath[player.user.id] = makePath(5);
    playerData[player.user.id] = makeGameState(
      player.gold,
      makeBaseData(player.base.hp, player.base.maxHp),
      player.user.highScore,
      [],
      [],
      room.monsterLevel,
      player.score,
      monsterPath[player.user.id],
      monsterPath[player.user.id][monsterPath[player.user.id].length - 1],
    );
    playerId.push(player.user.id);
  });

  // 전달
  room.players.forEach((player) => {
    const S2CMatchStartNotification = makeMatchStartNotification(
      initialGameState,
      playerData[player.user.id],
      playerData[playerId.find((e) => e !== player.user.id)],
    );
    const packet = makePacketBuffer(
      config.packetType.matchStartNotification,
      userSession.getUser(player.user.socket).sequence,
      S2CMatchStartNotification,
    );
    player.user.socket.write(packet);
  });
}

async finishMatch(room, user) {
  // [1] 매치 결과 기록할 객체 생성
  const matchResult = { winner: '', loser: '' };
  // [2] 플레이어 별로 결과 적용
  room.players.forEach((player, playerId) => {
    // [2-1] 승패 판정 (패배한 user가 호출하게 됨)
    const isWin = playerId === user.id ? false : true;
    if (isWin) matchResult.winner = player.user;
    else matchResult.loser = player.user;
    // [2-2] gameOverNotification 패킷 만들어 전송
    player.user.sendPacket(config.packetType.gameOverNotification, { isWin });
    // [2-3] 전적 및 최고 기록 최신화
    player.user.updateMatchRecord(isWin, player.score);
  });
  // [3] 각 유저 mmr 최신화
  room.updateMmr(matchResult);
  // [4] 룸 세션에서 매치 종료된 룸 제거
  this.deleteRoom(room.id);
  // [5] 전적과 mmr, 하이스코어 데이터베이스에 저장
  try {
    await updateUserData(matchResult.winner, matchResult.loser);
  } catch (error) {
    console.error(`로그아웃 처리 중 문제 발생!! `, error);
  }
}
```

#### queue 폴더

- queue 내부 폴더에는 class 객체만 있는데, 이는 상위폴더 class가 따로 있기에 그 폴더 내부로 이동시켰다.

#### send-packet 폴더

- send-packet은 packet의 페이로드와 타입을 받아 packet을 만들어주는 기능이 포함되어있다.

- 이번 프로젝트의 경우 packet 헤더에 각 유저의 시퀀스를 기반으로 값이 들어가기에 User 클래스에 병합하기로 하였다.  
( 유저마다 받는 패킷이 다르기에 만든 패킷을 여러 번 사용할 수 없다! )

| **필드 명** | **타입** | **설명** |
| --- | --- | --- |
| packetType | ushort | 패킷 타입 (2바이트) |
| versionLength | ubyte | 버전 길이 (1바이트) |
| version | string | 버전 (문자열) |
| sequence | uint32 | 패킷 번호(유저마다 상이) (4바이트) |
| payloadLength | uint32 | 데이터 길이 (4바이트) |
| payload | bytes | 실제 데이터 |

```jsx
// User class 내부
constructor(socket) {
  this.key = null;
  this.id = null;
  this.roomId = null;
  this.socket = socket;
  this.state = userState.waiting; // "waiting", "matchMaking", "playing"

  this.matchRecord = {
    win: null,
    lose: null,
  };
  this.mmr = null;
  this.highScore = null;
  this.sequence = 1;
}
// 메서드 변경 과정에서 Packet 생성과 보내주는 것을 동시에 하도록 설계함
sendPacket(packetType, payload) {
  //패킷타입 (number -> string)
  const packetTypeValues = Object.values(config.packetType);
  const packetTypeIndex = packetTypeValues.findIndex((f) => f === packetType);
  const packetTypeName = Object.keys(config.packetType)[packetTypeIndex];

  // 페이로드
  const proto = getProtoMessages().GamePacket;
  const message = proto.create({ [packetTypeName]: payload });
  const payloadBuffer = proto.encode(message).finish();

  // 헤더 필드값
  const version = config.env.clientVersion || '1.0.0';
  const versionLength = version.length;
  const payloadLength = payloadBuffer.length;

  // 헤더 필드 - 패킷 타입
  const packetTypeBuffer = Buffer.alloc(2);
  packetTypeBuffer.writeUint16BE(packetType, 0);

  // 헤더 필드 - 버전 길이
  const versionLengthBuffer = Buffer.alloc(1);
  versionLengthBuffer.writeUInt8(versionLength, 0);

  // 헤더 필드 - 버전
  const versionBuffer = Buffer.from(version);

  // 헤더 필드 - 시퀀스
  const sequenceBuffer = Buffer.alloc(4);
  sequenceBuffer.writeUint32BE(this.sequence, 0);

  // 헤더 필드 - 페이로드 길이
  const payloadLengthBuffer = Buffer.alloc(4);
  payloadLengthBuffer.writeUInt32BE(payloadLength, 0);

  // 헤더
  const headerBuffer = Buffer.concat([
    packetTypeBuffer,
    versionLengthBuffer,
    versionBuffer,
    sequenceBuffer,
    payloadLengthBuffer,
  ]);

  // 패킷 생성 및 전송
  const packetBuffer = Buffer.concat([headerBuffer, payloadBuffer]);
  this.socket.write(packetBuffer);
}
```

## 트러블 슈팅

### 매치 종료 업데이트

- 매치 종료 시, 두 유저의 최신값을 db에 트랜잭션을 이용해 넣어주는 과정에서 오류가 떳다

```jsx
// 수정 전
/* 게임 종료 시 실행하는 쿼리 함수 */
const updateUserData = async (userA, userB) => {
  // [1] 풀에서 연결 하나 꺼내옴
  const connection = pools.USER_DB.getConnection();
  try {
    // [2] 트랜잭션 시작
    await connection.beginTransaction;
    // [2-1] 유저A 업데이트
    await connection.execute(USERS_QUERIES.UPDATE_USER, [
      userA.matchRecord.winCount,
      userA.matchRecord.loseCount,
      userA.mmr,
      userA.highScore,
      userA.key,
    ]);
    // [2-2] 유저B 업데이트
    await connection.execute(USERS_QUERIES.UPDATE_USER, [
      userB.matchRecord.winCount,
      userB.matchRecord.loseCount,
      userB.mmr,
      userB.highScore,
      userB.key,
    ]);
    // [3] 트랜잭션 종료
    await connection.commit();
  } catch (error) {
    // [3-1] 쿼리 도중 오류 발생 시 트랜잭션 롤백
    await connection.rollback();
    // [3-2] 에러 객체 상위 함수로 전달
    throw error;
  } finally {
    // [4] 성공하든 실패하든 다 쓴 연결 풀로 복귀
    connection.release();
  }
};
```

#### release() 는 함수가 아니에요!

![Image](https://github.com/user-attachments/assets/95eb3e8b-8cd0-4d3f-a6be-fe6c91808996)

- 이 상황은 connection 이 제대로된 값을 못 가져왔을 경우를 생각하여 console.log(connection)를 찍어보았다!

![Image](https://github.com/user-attachments/assets/cbf56860-969d-4e6f-b701-ba00fdeee6f3)

- 결과를 보니 pending 상태로 Promise 객체가 반환되는 것이었다!  
( 바로 await으로 Promise 풀어주기 )

- 또한 transaction 함수를 실행시키지 않는 문법오류도 중간에 확인하게 되었다!  
( 쿼리 실행은 잘 되어 오류를 발견하지 못할 뻔 했다)

#### 파라미터 오류

![Image](https://github.com/user-attachments/assets/43460f65-9567-40e9-a4a4-7c9fb6938001)

- 쿼리에 들어가는 값이 undefined 라는 오류다!

- 그래서 들어가는 값들을 일일이 확인해본 결과..

```jsx
class User {
  constructor(socket) {
    this.key = null;
    this.id = null;
    this.roomId = null;
    this.socket = socket;
    this.state = userState.waiting; 
    // 이 요소의 내부 명칭이 다르게 되어있었다!
    this.matchRecord = {
      win: null,
      lose: null,
    };
    this.mmr = null;
    this.highScore = null;
    this.sequence = 1;
  }
}

// 기존 코드
// [2-1] 유저A 업데이트
await connection.execute(USERS_QUERIES.UPDATE_USER, [
  userA.matchRecord.winCount,
  userA.matchRecord.loseCount,
  userA.mmr,
  userA.highScore,
  userA.key,
]);
// [2-2] 유저B 업데이트
await connection.execute(USERS_QUERIES.UPDATE_USER, [
  userB.matchRecord.winCount,
  userB.matchRecord.loseCount,
  userB.mmr,
  userB.highScore,
  userB.key,
]);
```

#### 수정 완

```jsx
/* 게임 종료 시 실행하는 쿼리 함수 */
const updateUserData = async (userA, userB) => {
  // [1] 풀에서 연결 하나 꺼내옴
  const connection = await pools.USER_DB.getConnection();
  try {
    // [2] 트랜잭션 시작
    await connection.beginTransaction();
    // [2-1] 유저A 업데이트
    await connection.execute(USERS_QUERIES.UPDATE_USER, [
      userA.matchRecord.win,
      userA.matchRecord.lose,
      userA.mmr,
      userA.highScore,
      userA.key,
    ]);
    // [2-2] 유저B 업데이트
    await connection.execute(USERS_QUERIES.UPDATE_USER, [
      userB.matchRecord.win,
      userB.matchRecord.lose,
      userB.mmr,
      userB.highScore,
      userB.key,
    ]);
    // [3] 트랜잭션 종료
    await connection.commit();
  } catch (error) {
    // [3-1] 쿼리 도중 오류 발생 시 트랜잭션 롤백
    await connection.rollback();
    // [3-2] 에러 객체 상위 함수로 전달
    throw error;
  } finally {
    // [4] 성공하든 실패하든 다 쓴 연결 풀로 복귀
    connection.release();
  }
};
```

## 한줄 평 + 개선점

- 트러블 슈팅과 새 기능 구현에 조금 힘이 많이 들엇다.

---
