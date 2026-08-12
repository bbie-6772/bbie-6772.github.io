---
layout: post
title: Ducktopia - <17>
subtitle: 분산 서버 적용
author: bbie
categories: Ducktopia-Project
banner:
  image: https://github.com/user-attachments/assets/e2201ed3-6804-4534-ac37-e2c9a678cddb
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [Game-Server]
---

## 분산 서버

현재 진행한 분산 서버 구조에 개발을 마친 Game 서버 로직을 병합해주는 작업을 진행해준다!

1. Protobuf 구조 병합

2. Game 서버의 Handler를 분산 서버에 맞게 구조 수정

3. 새로 만들어진 PacketType들을 Gateway 서버에 맵핑

### Latency 체킹

분산 서버가 되어 Gateway 서버가 추가되었기에 각 서버와의 latency가 게임에 영향이 크지 않을 정도로 나오는지 확인하기 위해 로직을 추가해준다.

- Gateway 서버의 Server Class에 레이턴시 확인용 인터벌 메서드를 설정해주고, 받아왔을 때 Log로 보여줄 핸들러를 만들어준다!

```jsx
// 레이턴시 확인 인터벌
latencyCheck = () => {
  const packet = makeServerPacket(
    // timestamp 가 있는 packetType을 임시로 사용하였다!
    config.packetType.S_ERROR_NOTIFICATION,
    {
      errorMessage: 'latencyCheck',
      timestamp: date.now(),
    },
    -1,
  );
  this.socket.write(packet);
};

// 패킷을 다시 받아왔을때 핸들러
const latencyCheckHandler = ({ socket, payload, userId }) => {
  if (userId !== -1) return;
  const { errorMessage, timestamp } = payload;
  const latency = date.now() - timestamp;
  console.log(
    `###Latency### ${errorMessage} 와의 총 왕복 시간${latency} / 평균 Latency ${latency / 2}`,
  );
};
```

- 이제 다른 서버에서 이를 받아왔을때 errorMessage에 서버이름을 저장해 다시 보내주는 핸들러를 추가해준다!

```jsx
const latencyCheckHandler = ({ socket, payload, userId }) => {
  if (userId !== -1) return;
  let { errorMessage, timestamp } = payload;

  if (errorMessage === 'latencyCheck') errorMessage = roomSession.name;

  const packet = makePacket(
    config.packetType.S_ERROR_NOTIFICATION,
    { errorMessage, timestamp },
    userId,
  );

  socket.write(packet);
};
```

![Image](https://github.com/user-attachments/assets/61ebfc77-2e3e-42d5-805e-7767a40f2c82)

- 처음 Latency는 혼잡제어나 흐름제어에 의한 통신량이 점차늘어나는 방식때문에 비교적 늦는 것 같다!

### 로컬 테스트

현재 분산 서버를 적용하여 테스트를 하기 쉽도록 하나의 브랜치에 폴더들을 정리해두었는데..  
생각해보니 Redis Cloud를 공유하기 때문에 서로 폴더 구조를 침범하는 상황이 생길 것 같다!

그래서 폴더명 앞에 자신의 이름을 붙일 수 있는 구조로 재설계 해주었다.

- Gateway의 Redis 연동 서버 연결 부

```jsx
const host = getLocalIP();
// 이게 폴더 구조 앞에 환경변수 이름을 추가하도록 설계함
const mainName = config.redis.custom + 'Server:Gateway';
const hashData = {
  // 서버 주소
  address: host,
  // 서버 상태
  status: 1,
};

await redisClient.watch(mainName);
// [1] list에서 서버 조회
const serverList = await redisClient.lRange(mainName, 0, -1);
const index = serverList.indexOf(host);
// [2] hashKey 생성 lobby:2 lobby:3 ... + 값 저장
// [3] 중복 여부에따라 List 업데이트
let name = mainName + ':' + index;
if (index < 0) {
  name = mainName + ':' + serverList.length;
  await redisClient.multi().hSet(name, hashData).rPush(mainName, host).exec();
} else await redisClient.multi().hSet(name, hashData).exec();

console.log('Redis 서버 오픈 알림 성공');

const lobby = config.redis.custom + 'Server:Lobby';
// Gateway 서버의 연결 부
const LobbyServers = await redisClient.lRange(lobby, 0, -1);
for (let i = 0; i < LobbyServers.length; i++) {
  await connectServer(lobby + ':' + +i); //로비서버 TCP연결
}

const game = config.redis.custom + 'Server:Game';
const GameServers = await redisClient.lRange(game, 0, -1);
for (let i = 0; i < GameServers.length; i++) {
  await connectServer(game + ':' + i); //게임서버 TCP연결
}

console.log('Redis List 모든 서버 연결 성공');
```

- 다른 서버의 Redis 연동 부

```jsx
const host = getLocalIP();
// 이게 폴더 구조 앞에 환경변수 이름을 추가하도록 설계함
const mainName = config.redis.custom + 'Server:Lobby';
const hashData = {
  // 서버 주소
  address: host,
  // 서버 상태
  status: 1,
  check: 'new',
};

await redisClient.watch(mainName);
// [1] list에서 서버 조회
const serverList = await redisClient.lRange(mainName, 0, -1);
const index = serverList.indexOf(host);
// [2] hashKey 생성 lobby:2 lobby:3 ... + 값 저장
// [3] 중복 여부에따라 List 업데이트
let name = mainName + ':' + index;
if (index < 0) {
  name = mainName + ':' + serverList.length;
  await redisClient
    .multi()
    .hSet(name, hashData)
    .rPush(mainName, host)
    .publish('ServerOn', name)
    .exec();
} else await redisClient.multi().hSet(name, hashData).publish('ServerOn', name).exec();

roomSession.name = name;
// 헬스체크 Sub 매핑
subscriber.subscribe(name, healthCheck);
console.log('Redis 서버 오픈 알림 성공');
```

## 한줄 평 + 개선점

- 디버깅에 바쁜 나날이였다

---
