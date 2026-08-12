---
layout: post
title: Ducktopia - <4>
subtitle: MVP 구현
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

## 업무 재분배

현재 진행된 사항들을 정리하여 업무 재분배를 통해 자원을 효율적으로 사용할 수 있도록 했다!

![2차계획표](https://github.com/user-attachments/assets/cf824f19-c46c-4286-900e-bb230a286083)

### 속도 계산

- 팀원 분들 중 추측항법에 관해 고민하시고 계시길래 같이 이론을 정리했다!

![이동동기화](https://github.com/user-attachments/assets/26943272-5860-4f4f-914a-51df2cffc4a8)

- 그리고 기존에 클라이언트의 timestamp를 받는 생각을 했는데,  
이는 클라이언트 의존적 데이터라 위험할 수 있다 생각되어 서버의 시간으로 latency를 감안하도록 변경하였다!

### 통신 구조 수정

어제 작업한 통신 구조가 제대로 작동하는지 확인하기 위해 디버깅용 더미 클라이언트를 만들어준다!

#### 더미 클라이언트

일단 기초적인 TCP 통신을 위한 socket 과 필요한 정보들을 저장할 수 있도록 구조를 생성한다!

```jsx
class Client {
  constructor(id, password, name) {
      this.id = id;
      this.password = password;
      this.name = name
      this.socket = new net.Socket();
      this.buffer = Buffer.alloc(0);

      this.socket.connect(config.server.port, config.server.host, this.onConnection);
      this.socket.on('data', this.onData);
  }
}
```

이제 socket.on('data')에 맵핑되어 패킷을 해석해주는 메서드를 생성해준다!  
( 생성 과정 중 어제 있던 코드를 다시보니 오류가 있어 몇 부분은 수정해주었다 )

```jsx
// 패킷 수신
onData = async (data) => {
  this.buffer = Buffer.concat([this.buffer, data]);
  const packetTypeByte = config.header.packetTypeByte;
  const versionLengthByte = config.header.versionLengthByte;
  let versionByte = 0;
  const payloadLengthByte = config.header.payloadLengthByte;
  let payloadByte = 0;
  const defaultLength = packetTypeByte + versionLengthByte;

  while (this.buffer.length >= defaultLength) {
    // 가변 길이 확인
    versionByte = this.buffer.readUInt8(packetTypeByte);
    payloadByte = this.buffer.readUInt32BE(defaultLength + versionByte);
    const headerLength = defaultLength + versionByte + payloadLengthByte;
    // buffer의 길이가 충분한 동안 실행
    if (this.buffer.length < headerLength + payloadByte) continue;
    // 패킷 분리
    const packet = this.buffer.subarray(0, headerLength + payloadByte);
    // 남은 패킷 buffer 재할당
    this.buffer = this.buffer.subarray(headerLength + payloadByte);

    // 값 추출 및 버전 검증
    const version = packet.toString('utf8', defaultLength, defaultLength + versionByte);
    if (version !== config.client.version) continue;
    const packetType = packet.readUInt16BE(0);
    const payloadBuffer = packet.subarray(headerLength, headerLength + payloadByte);
    try {
      const proto = getProtoMessages().GamePacket;
      const gamePacket = proto.decode(payloadBuffer);
      const payload = gamePacket[gamePacket.payload];

      console.log('패킷 수신', packetType, payload);
      switch (packetType) {
      }
    } catch (e) {
      console.error(e);
    }
  }
};
```

이제 서버에 정보를 보내줄 때 Packet으로 압축해서 보내주는 메서드를 생성해준다!

```jsx
sendPacket([packetType, packetTypeName], payload) {
  const proto = getProtoMessages().GamePacket;
  let message = null;
  let payloadBuffer = null;

  // payload 생성
  try {
    message = proto.create({ [packetTypeName]: payload });
    payloadBuffer = proto.encode(message).finish();
  } catch (e) {
    console.error(e);
  }

  // header 생성
  const packetTypeBuffer = Buffer.alloc(2);
  packetTypeBuffer.writeUInt16BE(packetType);

  const versionBuffer = Buffer.from(config.client.version);

  const versionLengthBuffer = Buffer.alloc(1);
  versionLengthBuffer.writeUInt8(versionBuffer.length);

  const payloadLengthBuffer = Buffer.alloc(4);
  payloadLengthBuffer.writeUInt32BE(payloadBuffer.length);

  const packet = Buffer.concat([
    packetTypeBuffer,
    versionLengthBuffer,
    versionBuffer,
    payloadLengthBuffer,
    payloadBuffer,
  ]);
  this.socket.write(packet);
}
```

이렇게 제작한 Client class에 핸들러에 보내줄 request 메서드들을 제작해주고,

```jsx
async registerRequest() {
  const payload = { email: this.id, password: this.password, name: 'test' };
  this.sendPacket(config.packetType.REGISTER_REQUEST, payload);
}

async loginRequest() {
  const payload = { email: this.id, password: this.password };
  this.sendPacket(config.packetType.LOGIN_REQUEST, payload);
}
```

이렇게 만든 메서드들을 비동기로 실행시켜주는 함수들과 protobuf 구조를 읽어온다음 실행시켜주는 실행문을 만들어 준다!

```jsx
// 테스트용 함수 모음
const registerTest = async (client_count = 1) => {
  await Promise.all(
    Array.from({ length: client_count }, async (__, idx) => {
      const id = `test${idx}@email.com`;
      const password = '123456';
      const name = `test${idx}`;
      const client = new Client(id, password, name);

      await client.registerRequest();
    }),
  );
};

const loginTest = async (client_count = 1) => {
  await Promise.all(
    Array.from({ length: client_count }, async (__, idx) => {
      const id = `test${idx}@email.com`;
      const password = '123456';
      const name = `test${idx}`;
      const client = new Client(id, password, name);

      await client.loginRequest();
    }),
  );
};

// 테스트 실행문
await loadProtos().then(() => {
  loginTest();
});
```

## 한줄 평 + 개선점

- 현재 구현과 디버깅하는데 열중하고 있지만, 분산서버나 로드밸런서 및 부하테스트도 해보고 싶어 못참겠다!

- 오늘도 회의는 많았지만 여러 이론을 정리할 수 있어서 좋았다

---
