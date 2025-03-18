---
layout: post
title: Ducktopia - <19>
subtitle: 다시 작업
author: bbie
categories: Ducktopia-Project
banner:
  image: https://github.com/user-attachments/assets/e2201ed3-6804-4534-ac37-e2c9a678cddb
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: []
---

## 피드백 수용

### Gateway - Other Server 최적화

- 현재 Gateway에선 Payload를 디코딩하여 객체로 생성하는데, 이 생성된 객체는 Heap 영역에 저장되어 Garbage 컬렉션에 의해 사라지기 전까지 메모리를 사용하게된다..

- 그렇기에 불필요한 메모리 사용을 줄이기 위해 Gateway에서 무조건적으로 Payload를 디코딩하지 않고,  
Payload 정보가 필요한 핸들러에서만 직접 디코딩하도록 수정하여 기본 Packet 전달 시의 Heap 영역 사용을 최소화 하였다!

```jsx
// 핸들러에 직접 payloadBuffer를 주도록 변경
const packet = socket.buffer.subarray(0, headerLength + payloadByte);

const packetType = packet.readUInt16BE(0);
const payloadBuffer = packet.subarray(headerLength, headerLength + payloadByte);

const handler = handlers[packetType];
// const proto = getProtoMessages().GamePacket;
// const gamePacket = proto.decode(payloadBuffer);
// const payload = gamePacket[gamePacket.payload];

await handler({ socket, payloadBuffer, packetType });
```

```jsx
// 기존 Payload를 받아 인코딩하는 방식 또는 PayloadBuffer를 직접 받아 인코딩을 생략하는 방식으로 나눴다!
function makePacket([packetType, packetTypeName], payload, payloadBuffer = null) {
  if (!payloadBuffer) {
    const proto = getProtoMessages().GamePacket;
    let message = null;

    // payload 생성
    try {
      message = proto.create({ [packetTypeName]: payload });
      payloadBuffer = proto.encode(message).finish();
    } catch (e) {
      console.error(e);
    }
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
  return packet;
}
```

```jsx
// 또한 다른 서버에서 받은 값에서 userId 요소만 빼서 바로 보내도록 수정!
const user = userSession.getUserByID(userId);
if (!user) continue;

const header = packet.subarray(
  0,
  headerLength - (userIdLengthByte + userIdByte + payloadLengthByte),
);
const payload = packet.subarray(headerLength - payloadLengthByte);
const resPacket = Buffer.concat([header, payload]);

user.socket.write(resPacket);
```

- 이후 프로파일링을 통해 결과가 얼마나 달라지는지 clinic.js를 활용해 비교해봤지만!  
-> 바뀐게 객체 1 개와 일부 인코딩/디코딩 생략인데 그렇게 큰 차이가 있을리가 없지...  

1. Latency Check

    - 그래도 실행시간은 단축되었을 거라 생각되어 더미클라이언트에 latency 체크를 추가하여 확인해보았다!

    - 코드 변경 이전

    ![변경전](https://github.com/user-attachments/assets/1e4402d6-2694-4ab2-803c-2bcabb7613be)

    - 코드 변경 이후

    ![변경후](https://github.com/user-attachments/assets/ae1fef23-1293-4149-97ac-39f69a291b44)

    -> 대략 30%(2/7) 정도의 실행시간 절감을 확인할 수 있었다! 하지만 하면할수록 Latency의 불확실성 때문에 다른 방법으로 확인을 해보기로 했다..

2. Runtime Check

    - 변경 전

    ![실행시간변경전](https://github.com/user-attachments/assets/7239dcc7-edf1-413c-a87d-d70173e9caac)

    - 변경 후

    ![실행시간변경후](https://github.com/user-attachments/assets/f76ac1e1-cd24-40e6-a06b-a180a9d4840c)

    -> 전체적으로 실행시간이 줄어들긴했다!  
    ( 평균 0.165ms -> 0.134ms (약 19% 정도 개선))

## 한줄 평 + 개선점

- 왠지모르게 가끔씩 지치는 기분이 든다.. 그래도 힘내야지

---
