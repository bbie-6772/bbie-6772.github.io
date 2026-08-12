---
layout: post
title: 멀티플레이 게임 - < 5 >
subtitle: 프로젝트 시작
author: bbie
categories: TCP-Multi-PlayGame
banner:
  image: https://github.com/user-attachments/assets/ee4fe93f-6293-4366-bc92-b8ca8622d397
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [Unity, Game-Server, Multiplayer, TCP]
---

## 유니티 클라이언트 연동

- [클라이언트 ProtoType](https://github.com/Ho-yeong/node5_unity_sample)

- 서버측 코드를 구성하며 클라이언트와 통일된 HANDLER_ID 및 PACKET_TYPE 을 맞춰 주었다!

![image](https://github.com/user-attachments/assets/d36eb937-47d6-4634-9701-f7caf55c7ee2)

### 서버 응답 구조 변경

- 원래 서버에서 주는 Response 의 경우 Packet 형태는 Proto Message 를 이용하지만,  
안에 들어가는 Payload(data) 는 JSON 형태를 사용해 클라이언트에서 파싱해주고 있다!

- 사실 동작 자체는 문제가 없지만.. ProtoBuffer 구조를 사용하다 JSON 형태를 쓰는게 부자연스러워 보여 수정해주려 한다! 

- 기존 서버

![image](https://github.com/user-attachments/assets/6198cafc-0544-4e7d-ad2b-fbf58f37924e)

- 기존 클라이언트

![image](https://github.com/user-attachments/assets/66648994-a52d-43ae-a3d1-52d05d45d293)

#### 서버 송신

- 일단 Response 의 Payload(data) 부분을 Proto 파일로 작성해준다!

- 현재는 initialResponse 과 Error 부분에서 사용되기 때문에 두 Proto Message를 먼저 만들어준다.

```proto
// .protobuf/response/initial.payload.proto 파일
syntax = 'proto3';

package initialResponse;

message Packet {
    string userId = 1;
    float x = 2;
    float y = 3;
}
// .protobuf/response/error.payload.proto 파일
syntax = 'proto3';

package error;

message Error {
    string message = 1;
}
```

- 이를 packetNames.js 파일에 업데이트 해준다!

```jsx
export const packetNames = {
    // 기존 packetNames 생략
    error: {
        Error: 'error.Error'
    },
    initialResponse: {
        Packet: 'initialResponse.Packet'
    }
}
```

- 기존 createResponse 에 인수를 추가하고 확장성을 위해 인수를 객체로 받는다!

- 추가로 data를 protobuf를 이용해 직렬화 하는 로직도 추가해준다!

```jsx
export const createResponse = ({handlerId, responseCode, data = null, protoType = null, userId}) => {
    const protoMessages = getProtoMessages();
    const Response = protoMessages.response.Packet
    const user = getUser({userId})

    // Payload(data) 직렬화
    // data 와 protoType 의 경우 인수로 받기에 오류 가능성이 있어 try catch를 사용했음
    try{
        if(data) {
            const [namespace, typeName] = protoType.split('.');
            const Payload = protoMessages[namespace][typeName];
            data = Payload.encode(data).finish();
        }
    } catch(e) {
        throw new CustomError(ErrorCodes.PACKET_STRUCTURE_MISMATCH,e)
    }

    const responsePayload = {
        handlerId,
        responseCode,
        timestamp: Date.now(),
        sequence: user ? user.getNextSequence() : 0,
        data: data? Buffer.from(JSON.stringify(data)) : null
    }

    // Packet 직렬화
    const buffer = Response.encode(responsePayload).finish();

    // 헤더 추가 
    const packetLength = Buffer.alloc(config.packet.totalLength)
    packetLength.writeUInt32BE(buffer.length + config.packet.totalLength + config.packet.typeLength, 0)
    const packetType = Buffer.alloc(config.packet.typeLength)
    packetType.writeUInt8(PACKAGE_TYPE.NORMAL, 0)

    // Response Packet 반환
    return Buffer.concat([packetLength, packetType, buffer])
}
```

#### 클라이언트 수신

- 이제 클라이언트 쪽에서도 수신받을 때 JSON 이 아닌 Proto 형태로 역직렬화 할 수 있도록 설정해준다!

```c#
// 기존 json 형태를 ProtoContract 형태로 변경
[ProtoContract]
public class InitialResponse {
    [ProtoMember(1)]
    public string userId { get; set; }

    [ProtoMember(2)]
    public float x { get; set; }

    [ProtoMember(3)]
    public float y { get; set; }
}

// 기존 사진에 보이는 부분의 ParsePayload 대신 Deserialize를 사용
Handler.InitialHandler(Packets.Deserialize<InitialResponse>(response.data));

// Packets.Deserialize<T>
public static T Deserialize<T>(byte[] data) {
    try {
        using (var stream = new MemoryStream(data)) {
            return ProtoBuf.Serializer.Deserialize<T>(stream);
        }
    } catch (Exception ex) {
        Debug.LogError($"Deserialize: Failed to deserialize data. Exception: {ex}");
        throw;
    }
}
```

## 지연 시간과 핑 구현

- 이론 이후 코드를 새로짜면서 기존에 있던 지연시간, 핑 기능을 새로 만들어야 한다!

- 일단 클라이언트에서 주고받는 값들을 확인해가며 서버에 기능을 추가할 것이다

### 클라이언트 분석

![image](https://github.com/user-attachments/assets/e90abfc8-87cd-4a7d-a1e3-bf1b0ea6a0e9)

- 일단 게임이 시작되면 클라이언트는 계속해서 x와 y 좌표를 서버에게 보내준다.

- 그렇게 보내고 서버에서 준 데이터는 이러한 과정을 통해 클라이언트에서 처리한다!

![image](https://github.com/user-attachments/assets/fab2442c-8f8f-48bc-b6f7-6853036b6e1f)

## 한줄 평 + 개선점

- 이전에 강의를 통해 작성한 코드를 분석하는 것도 즐거웠지만, 직접 구현해가며 생각하는 작업이 훨씬 재밌다!

---
