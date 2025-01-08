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

### 이벤트 구조 분리

- 각 이벤트들이 한 파일 안에 몰려있으면, 가독성과 유지보수가 아쉽다!

- 소켓 이벤트를 분리하기 위해 events 폴더를 생성하고 프로젝트에서 사용할 각 이벤트들의 이름으로 파일을 생성해준다!

```folder
.
├── assets                  // 게임 데이터 폴더
├── clients                 // 클라이언트 폴더
├── README.md               // README
├── .env                    // 중요한 환경변수(보안!)
└── src                     // 서버 폴더
    ├── server.js           // 서버 실행 파일
    └── events              // socket 이벤트 분리
        ├── onConnection.js // 클라이언트와 연결
        ├── onData.js       // 클라이언트의 데이터 받기
        ├── onError.js      // 소켓 통신 중 에러 발생
        └── onEnd.js        // 통신 마무리 요청 받기
```

#### onConnection

- 클라이언트와 연결이 되었을 때, 이벤트들을 맵핑해주는 역할이다

```jsx
import { onEnd } from './onEnd.js';
import { onError } from './onError.js';
import { onData } from './onData.js';

export const onConnection = (socket) => {
  console.log('클라이언트가 연결되었습니다:', socket.remoteAddress, socket.remotePort);

  socket.on('data', onData(socket));
  socket.on('end', onEnd(socket));
  socket.on('error', onError(socket));
};
```

- 이를 server.js에서 import하여 사용하게 된다!

```jsx
import net from 'net';
import initServer from './init/index.js';
import { config } from './config/config.js';
import { onConnection } from './events/onConnection.js';

const server = net.createServer(onConnection);

server.listen(config.server.port, config.server.host, () => {
    console.log(server.address());
});
```

#### events

- 연결에 매핑되어 실행되는 함수들을 이벤트(onData, onEnd, onError 등등)에 맞게 구성해준다!

```jsx
/* onData.js */
// (socket) => (data) => : 커링 기법
// onConnection -> (socket)-> onData -> (data) -> 2개 다 사용
export const onData = (socket) => (data) => {
  console.log('데이터를 받았습니다!',data);
};
/* onError.js */
export const onError = (socket) => (err) => {
  console.error('소켓 오류:', err);
};
/* onEnd.js */
export const onEnd = (socket) => () => {
  console.log('클라이언트 연결이 종료되었습니다.');
};
```

- 이 때 인자를 순서에 따라 여러 번 받는 방법을 **커링(Curring)** 이라 한다!

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

#### Header

- Buffer 객체를 쓰기 전, socket.io(웹소켓 라이브러리) 에서 보낸 Packet들은 각자 무엇에 관한 정보인지 알 수 있었다!

- 이러한 정보들을 Buffer 객체에도 적용해주기 위해 Header 개념을 사용할 것 이다!

- 보낼 데이터 앞에 Header를 붙여 데이터의 정보를 알려주는 방법이다

| Field | Type | Description | Size( Byte ) |
| --- | --- | --- | --- |
| totalLength | int | 메세지의 전체 길이 | 4 Byte |
| handlerId | int | 요청을 처리할 서버 핸들러의 ID | 2 Byte |
| message | string | 메세지(Payload) | Variable |

```jsx
/* constant.js */
export const TOTAL_LENGTH = 4;
export const HANDLER_ID = 2;

/* utils.js */
import { HANDLER_ID, TOTAL_LENGTH } from "./constant.js";

/* 헤더 읽는 방식 통일 */
export const readHeader = (buffer) => {
    // Big Endian 방식 = 오름차순 정렬
    return {
        length: buffer.readUint32BE(0),
        handlerId: buffer.readUint16BE(TOTAL_LENGTH),
    };
}
/* 헤더를 추가하는 방식 통일 */
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

#### 바이트 배열 분리

- 현재 Buffer 객체와 Header를 적용해 클라이언트와 서버간 통신을 하고 있는데..

- 만약 여러 곳에서 데이터를 받으면 어떻게 따로 처리를 해줘야 할까!?

- 클라이언트마다 고유한 버퍼를 할당해주어 데이터를 독립적으로 처리할 수 있게 해 혼선을 방지해야 한다!

```jsx
/* onConnection.js */
import { onEnd } from './onEnd.js';
import { onError } from './onError.js';
import { onData } from './onData.js';

export const onConnection = (socket) => {
  console.log('클라이언트가 연결되었습니다:', socket.remoteAddress, socket.remotePort);

  // 소켓 객체에 buffer 속성을 추가하여 각 클라이언트에 고유한 버퍼를 유지시킴
  socket.buffer = Buffer.alloc(0);
  
  socket.on('data', onData(socket));
  socket.on('end', onEnd(socket));
  socket.on('error', onError(socket));
};
```

- 고유한 버퍼들을 처리해주는 과정

```jsx
/* onData.js */
import { TOTAL_LENGTH, HANDLER_ID } from '../constant.js';

export const onData = (socket) => async (data) => {
  // 기존 버퍼에 새로 수신된 데이터를 추가
  socket.buffer = Buffer.concat([socket.buffer, data]);

  // 패킷의 총 헤더 길이 (패킷 길이 정보 + 핸들러 정보)
  const totalHeaderLength = TOTAL_LENGTH + HANDLER_ID;

  // 버퍼에 최소한 전체 헤더가 있을 때만 패킷을 처리
  while (socket.buffer.length >= totalHeaderLength) {
    // 1. 패킷 길이 정보 수신 (4바이트)
    const length = socket.buffer.readUInt32BE(0);
    // 2. 핸들러 타입 정보 수신 (2바이트) (+offset 사용)
    const handlerType = socket.buffer.readUInt16BE(TOTAL_LENGTH);
    
    // 3. 패킷 전체 길이 확인 후 데이터 수신
    if (socket.buffer.length >= length) {
      // 패킷 데이터를 자르고 버퍼에서 제거
      const packet = socket.buffer.slice(totalHeaderLength, length);
      // 남은 데이터(다음 패킷)은 다시 buffer에 저장
      socket.buffer = socket.buffer.slice(length);

      console.log(`length: ${length}`);
      console.log(`packetType: ${packetType}`);
      console.log(packet);
    } else {
      // 아직 전체 패킷이 도착하지 않음
      break;
    }
  }
};
```

## 한줄 평 + 개선점

- 새로운 구조를 배운것 같아 신기하면서도 머리가 조금 아팠다.

---
