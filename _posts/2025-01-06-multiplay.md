---
layout: post
title: 멀티플레이 게임 - < 1 >
subtitle: 이론 공부
author: bbie
categories: TCP-Multi-PlayGame
banner:
  image: https://github.com/user-attachments/assets/2138a507-e57d-4b62-8001-2f2fcfcccbfa
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [NET, Buffer]
---

## NET을 이용한 서버

- 기존에 웹 서버를 구성하려면 node.js 위에 express 와 socket.io 등 여러 라이브러리를 사용하여야 했다!

- 이번엔 node.js에 기본 포함된 net 을 이용해 서버 통신을 직접 구현하는 프로젝트이다!

### 서버<>클라이언트

- net을 이용해 socket 통신을 구현해준다!

```jsx
// 서버
import net from 'net';

const server = net.createServer((socket)=> {
    // socket.io 의 emit과 같은 기능! 클라이언트에게 송신
    socket.write()

    // 데이터 받을 때
    socket.on('data', (data) => {
    });

    // 연결 끝 신호를 수신했을 때
    socket.on('end', () => {
    });

    // 연결이 완전히 끊겼을 때
    socket.on('close', () => {
    });

    // 오류 
    socket.on('error', (err) => {
    });
});
// PORT = 3030 으로 서버 열기 
server.listen(3030, () => {
    console.log(server.address());
});
```

```jsx
// 클라이언트
import net from 'net';

const HOST = 'localhost';
const PORT = 3030;
const socket = new net.Socket();

// HOST 와 PORT를 이용해 서버와 통신 시작!
socket.connect(PORT, HOST, ()=> {
    const message = "Hello World";
    // 서버에 데이터 보내기
    socket.write();
})

// 데이터 받을 때
socket.on('data', (data) => {
});

// 연결 끝 신호를 수신했을 때
socket.on('end', () => {
});

// 연결이 완전히 끊겼을 때
socket.on('close', () => {
});

// 오류 
socket.on('error', (err) => {
});
```

### Buffer

- 위에서 서버와 클라이언트의 소켓통신을 구현하였다!

- 이제 서로 데이터를 주고 받아야 하는데..  
TCP는 Byte 배열을 주고받기에 이에 맞는 객체 Buffer를 사용해준다!  
(기본적으로 js는 2 Bytes 단위로 문자를 구성하지만 TCP는 1 Byte를 단위로 사용함 )

#### 장점

1. **고정 길이**: 모든 데이터가 1바이트 단위로 처리되므로, 데이터를 다루기 쉽고 효율적임

2. **빠른 접근**: Byte 단위로 데이터를 직접 접근하고 조작할 수 있어 이진 데이터 처리에서 매우 유용함

3. **메모리 효율성**: Buffer 객체는 필요한 만큼의 메모리만 사용함!  
( 예를 들어, 1 Byte 의 데이터를 처리할 때 1 Byte의 메모리만 사용 )

4. **호환성**: 대부분의 네트워크 프로토콜과 파일 포맷이 Byte 단위로 데이터를 처리하므로,  
Buffer 객체를 사용하면 추가적인 변환 과정 없이 쉽게 데이터를 주고받을 수 있음

#### 사용법

```jsx
// data를 Buffer 객체로 변환 
const buffer = Buffer.from(data);
// arr.splice 와 똑같이 일정 길이를 제거해주는 역할
buffer.subarray()
// 32비트(= 4 Bytes) 크기의 정보를 기입
buffer.writeUInt32BE(data, 0);
// 16비트(= 2 Bytes) 크기의 정보를 기입 (뒤에는 offset 거리 조절용)
buffer.writeUInt16BE(data2, data.length);

// 두 Buffer 객체를 하나로 합쳐줌
Buffer.concat([buffer1, buffer2])

// 지정된 사이즈의 버퍼 객체 생성
Buffer.alloc(size)
```

### Header

- Buffer 객체를 쓰기 전, socket.io 에서 보낸 Packet들은 각자 무엇에 관한 정보인지 알 수 있었다!

- 이를 Buffer 객체에도 적용해주기 위해 Header 개념을 사용할 것 이다!

- 보낼 데이터 앞에 Header를 붙여 데이터의 정보를 알려주는 방법이다

| Field | Type | Description | Size( Byte ) |
| --- | --- | --- | --- |
| totalLength | int | 메세지의 전체 길이 | 4 Byte |
| handlerId | int | 요청을 처리할 서버 핸들러의 ID | 2 Byte |
| message | string | 메세지(Payload) | Variable |

```jsx
//constant.js
export const TOTAL_LENGTH = 4;
export const HANDLER_ID = 2;

//utils.js
import { HANDLER_ID, TOTAL_LENGTH } from "./constant.js";

// 헤더 읽는 방식 통일
export const readHeader = (buffer) => {
    // Big Endian 방식 = 오름차순 정렬
    return {
        length: buffer.readUint32BE(0),
        handlerId: buffer.readUint16BE(TOTAL_LENGTH),
    };
}
// 헤더를 추가하는 방식 통일
export const writeHeader = (length, handlerId) => {
    const headerSize = TOTAL_LENGTH + HANDLER_ID;
    const buffer = Buffer.alloc(headerSize);
    buffer.writeUInt32BE(length + headerSize, 0);
    buffer.writeUInt16BE(handlerId, TOTAL_LENGTH);

    return buffer;
}
```

- 이렇게 만든 설정한 헤더를 클라이언트에서 추가하여 서버에 보내는 연습!

```jsx
import net from 'net';
import { readHeader, writeHeader } from './utils.js';

client.connect(PORT, HOST, ()=> {
    const message = "Hello World";
    const buffer = Buffer.from(message);

    const header = writeHeader(buffer.length, 10);
    const packet = Buffer.concat([header, buffer]);
    client.write(packet);
})
```

## 한줄 평 + 개선점

-

---
