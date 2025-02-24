---
layout: post
title: Ducktopia - <14>
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

저번에 남아있던 문제는 패킷 분할 시, onData에서 while이 무한루프도는 오류였고,  
이를 해결완료하여 오늘부터는 로드 밸런싱 조사 및 사용을 실질적으로 시작한다!

### 로드 밸런싱

ELB와 EC2 + AMI(Amazon Machine Image) / ECS + Docker 를 이용한 게이트웨이 Auto Scaling 방식은 부하 테스트 이후 하나의 해결방안으로 두고,
일단 기본적인 로드 밸런싱으로 게이트 웨이에서 게임서버로 보내주는 로직을 구현해준다!

#### Redis 서버 동기화

현재는 게이트웨이 서버에서 로비서버와 게임서버의 주소를 상수로 정해주어 연결하고있는데,  
이 방식을 동적으로 만들기 위해 Redis에 서버 주소와 자신의 상황을 체크해주는 로직을 구현해준다!

```jsx
const initOnRedis = async () => {
  const host = getLocalIP();
  const hashData = {
    address: host,
    status: 1,
  };

  // 1. list에서 서버 조회
  // 2. hashKey 생성 lobby2 lobby3 ...
  // 3. 값 저장
  // 4. Pub/Sub을 이용해서 서버오픈 알림

  // 서버 상태 on
  // watch를 통해 Server:Gateway(List)가 업데이트 되지 않을때에만 성공하도록 설계
  await redisClient.watch('Server:Gateway');
  const serverList = await redisClient.lRange('Server:Gateway', 0, -1);
  // 중복 확인
  let index = serverList.indexOf(host);
  if (index < 0) {
    index = serverList.length;
    // multi 를 이용해 트랜잭션의 원자성 보장
    const setReply = await redisClient
      .multi()
      .hSet('Server:Gateway:' + index, hashData)
      .lPush('Server:Gateway', host)
      .publish('ServerOn', 'Server:Gateway:' + index)
      .exec();
  } else {
    const setReply = await redisClient
      .multi()
      .hSet('Server:Gateway:' + index, hashData)
      .publish('ServerOn', 'Server:Gateway:' + index)
      .exec();
  }
  console.log('Redis 서버 알림 성공');
};
```

#### Gateway 서버

게이트 서버가 올라갈 때, Redis에 있는 서버들에 연결하는 로직도 구현해준다!

```jsx
  const LobbyServers = await redisClient.lRange('Server:Lobby', 0, -1);
  for (let i = 0; i < LobbyServers.length; i++) {
    const [address, status] = await redisClient.hVals('Server:Lobby:' + i);
    if (+status !== 1) continue;
    connectToLobbyServer(address, 'Server:Lobby:' + i); //로비서버 TCP연결
  }

  const GameServers = await redisClient.lRange('Server:Game', 0, -1);
  for (let i = 0; i < LobbyServers.length; i++) {
    const [address, status] = await redisClient.hVals('Server:Game:' + i);
    if (+status !== 1) continue;
    connectToGameServer(address, 'Server:Game:' + i); //게임서버 TCP연결
  }
```

또한 Pub/Sub을 이용하여 서버가 새로 올라올 때도 연결되도록 설정해준다!

```jsx

const connectServer = async (name) => {
  const host = await redisClient.hGet(name, 'address');
  const type = name.split(':')[1];
  const portType = {
    Game: [5557, onGameConnection],
    Lobby: [5556, onLobbyConnection],
  };

  const port = portType[type][0];
  if (!port) {
    console.error('잘못된 서버 타입입니다');
    return;
  }

  const newServer = net.createConnection({ host: host, port: port }, () => {
    console.log(`${name}와 연결되었습니다.`);
    portType[type][1](newServer);
  });

  serverSession.addServer(name, newServer);
};

// 새로운 서버 알림 시, 연결
await subscriber.subscribe('ServerOn', connectServer);
```

## 한줄 평 + 개선점

- Redis에 대한 이해도가 높아져서 좋았었다..  
(Node-Redis의 v3 의 콜백함수를 쓰려다 v4 에선 다르게 작동한다는 사실을 나중에 깨달았다..)

---
