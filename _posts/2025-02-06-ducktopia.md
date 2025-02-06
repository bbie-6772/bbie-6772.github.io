---
layout: post
title: Ducktopia - <3>
subtitle: MVP 구현
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

## 디버깅

어제 제작한 오브젝트베이스 클래스의 기능을 테스트해보기 위해 패킷구조를 정하고,  
payload를 인코딩/디코딩 하기 위해 protobuf 구조도 종합하였다!

### 패킷 구조

![Image](https://github.com/user-attachments/assets/9b22ccff-0c6a-4222-961e-fc1f70de4f79)

- 패킷을 통해 통신을 하기 위해 패킷의 구조를 정하고, 이를 해석 및 생성 해주는 로직을 구현한다!

```jsx
const onData = (socket) => (data) => {
    console.log('데이터 수신');
    socket.buffer = Buffer.concat([socket.buffer, data]);
    const packetTypeByte = config.header.packetTypeByte;
    const versionLengthByte = config.header.versionLengthByte;
    let versionByte = 0;
    const payloadLengthByte = config.header.payloadLengthByte;
    let payloadByte = 0;
    const defaultLength = packetTypeByte + versionLengthByte
    
    while (socket.buffer.length >= defaultLength) {
        // 가변 길이 확인
        versionByte = socket.buffer.readUInt8(defaultLength);
        payloadByte = socket.buffer.readUInt32BE(defaultLength + versionByte);
        // buffer의 길이가 충분한 동안 실행
        if (socket.buffer.length < defaultLength + versionByte + payloadByte) break
        // 패킷 분리
        const packet = socket.buffer.subarray(0, defaultLength + versionByte + payloadByte);
        // 남은 패킷 buffer 재할당
        socket.buffer = socket.buffer.subarray(defaultLength + versionByte + payloadByte);

        // 값 추출 및 검증
        const version = packet.toString('utf8', defaultLength, defaultLength + versionByte);
        if (version !== config.client.version) break;
        const packetType = packet.readUInt16BE(0);
        const payloadBuffer = packet.subarray(defaultLength + versionByte + payloadLengthByte, defaultLength + versionByte + payloadLengthByte + payloadByte)
        
        try {
            const proto = getProtoMessages().GamePacket;
            const gamePacket = proto.decode(payloadBuffer);
            const payload = gamePacket[gamePacket.payload];
        } catch (e){
            console.error(e);
        }
    }
};
```

![Image](https://github.com/user-attachments/assets/48d1083a-72dd-4e3e-806b-af91821325fc)

- 저번과 같이 gamePacket 으로 감싸는 구조로 설계 하였다

- oneof 구조는 여러 필드 중 하나만 선택적으로 사용되도록 강제하므로, 잘못된 데이터 유형이 전송되는 것을 방지할 수 있다!

- oneof를 통해 전송되는 데이터는 선택적으로 인코딩되므로, 불필요한 정보가 노출되는 것을 방지할 수 있다!

## 한줄 평 + 개선점

- 초반에 설계를 조금 들어갔어야 하는 부분이였던 것 같은데, 미루다 보니 오늘한 느낌이였다.

- 그래도 한발짝 더 프로젝트 완성에 가까워져 뿌듯했다

---
