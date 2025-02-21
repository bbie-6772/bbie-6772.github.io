---
layout: post
title: Ducktopia - <12>
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

## 분산 서버 구현

어제 마무리한 Gateway 서버와 연결될 로비와 게임서버 구조를 변경해준다!  
( 사실 로비 서버는 로직 자체가 적기 때문에 금방 끝나버렸다)

### 게임 서버

현재 로비서버에서 호트스가 게임 시작을 누르면 Gateway 서버가 게임 서버에게 게임 정보를 전달해준다!  
이를 이용해 게임 서버는 유저들을 포함한 게임을 생성하고 게임로직을 실행해준다.

```jsx
const createGameHandler = ({ socket, payload, userId }) => {
  const { room } = payload;
  if (!room) throw new CustomError('유효하지않는 요청입니다.');
  const { roomId, ownerId, users } = room;

  // 게임 만들기
  const game = gameSession.addGame(roomId, ownerId);

  // 서버, 게임 에 유저 추가하기
  for (const user of users) {
    // **만약 게이트 웨이가 증설되면 socket이 유저마다 달라질 수 있음을 주의..**
    const serverUser = userSession.addUser(user.userId, user.name, roomId, socket);
    game.addUser(serverUser);
  }
}
```

현재는 Gateway 서버나 게임서버가 1:1 관계이기에 한번에 유저들을 생성하는게 문제는 없지만..  
만약 두 서버가 증설되게 된다면 이 부분 로직에 개선점이 많아보인다!  
( 각 유저가 연결된 Gateway의 소켓을 가지도록 설계햇는데 생성 시 기준이 호스트의 Gateway 소켓이므로)

이후 핸들러에 들어가는 makePacket을 header에 userId를 담게 해주고,
들어오는 값인 userId를 이용해 로직이 돌아가도록 구조를 조금씩 변경하였다!

```jsx
// User는 서버에 접속한 인원들을 구분하며 packet을 보내는 주체이다
class User {
  constructor(id, name, gameId, socket) {
    // 각 연결된 Gateway의 소켓
    this.socket = socket;
    this.id = id;
    this.name = name;
    this.gameId = gameId;
    this.player = new Player(this.id, 100, 0, 0);
  }

  sendPacket([packetType, payload]) {
    const packet = makePacket(packetType, payload, this.id);
    this.socket.write(packet);
  }

  getUserData() {
    return {
      userId: this.id,
      name: this.name,
    };
  }

  getPlayerData() {
    return {
      userId: this.id,
      name: this.name,
      character: this.player.getData(),
    };
  }

  getGameId() {
    return this.gameId;
  }

  getSocket() {
    return this.socket;
  }
}
```

### AWS EC2 서버 오류

분산 서버전, 단일서버로 만들었던 서버를 AWS EC2를 통해 올려놓았는데 어느 순간마다 서버가 다운되는 버그가 있었다!  
이 문제가 코드에서부터 시작되었는지 확인을 해봐도 딱히 문제가 보이지 않았다..

그렇게 튜터님에게 질문을 드렸더니,  
올라간 서버 중 무작위 로봇들이 알 수 없는 패킷들을 보내는 경우가 있고 이 때 패킷들을 잘 처리하지 못하면  
패킷들이 쌓여 무한루프 오류가 생길 수 있다는 조언을 해주셨다!

- 그래서 잘못된 패킷이 짧게 들어온 경우와 길게 들어온 경우를 수정하는 코드를 추가하였다!  
( 프로파일링을 통해 서버가 터질 때 onData 에서 CPU를 50% 사용했던 걸 이미 확인한 이후이다! )

```jsx
// 지속적인 오류 패킷을 보낼 시 서버에서 퇴출
if (socket.stack > 5) {
  console.error('잘못된 접근 제거');
  onEnd(socket)();
}

// 길이가 짧으면 여기서 오류가 뜬다
// 가변 길이 확인하는 부분
try {
  versionByte = socket.buffer.readUInt8(packetTypeByte);
  payloadByte = socket.buffer.readUInt32BE(defaultLength + versionByte);
} catch (err) {
  console.error("형식 오류 패킷 제거")
  socket.stack += 1
  socket.buffer = Buffer.alloc(0);
}

// 형식이 맞지않는 패킷의 길이가 길면 while문을 반복하는 문제 해결
// 값 추출 및 버전 검증
const version = packet.toString('utf8', defaultLength, defaultLength + versionByte);
if (version !== config.client.version) {
  console.error('너니?');
  socket.stack += 1;
  socket.buffer = Buffer.alloc(0);
  break;
}
```

- 이후 서버 테스트를 진행한 결과 아직까지 서버가 다운되는 문제가 재발되진 않았다.  

- 추가로 스택 대신 바로 끊어지도록 수정하였다.

## 한줄 평 + 개선점

- 분산 서버를 조금씩 구현해 나가면서 배우는게 많아져 너무 기분이 좋다!

---
