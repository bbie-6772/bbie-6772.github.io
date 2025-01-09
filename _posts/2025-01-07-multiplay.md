---
layout: post
title: 멀티플레이 게임 - < 2 >
subtitle: 기록
author: bbie
categories: TCP-Multi-PlayGame
banner:
  image: https://github.com/user-attachments/assets/2138a507-e57d-4b62-8001-2f2fcfcccbfa
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [NET, Protobuf, Constants]
---

## 환경변수 관리

- 기존에 환경변수나 상수들을 각각 파일에서 제어했기에 수정을 한번 하면 여러 곳을 수정해줘야 했다!

- 그 구조를 **중앙집중식**으로 변경하여 유지보수가 편하도록 하는 방법을 알아보자!

### 환경변수 관련 폴더 구조

```folder
.
├── assets                  
├── clients                 
├── README.md               
├── .env                    // 중요한 환경변수(보안!)
└── src                     // 서버 폴더
    ├── server.js           // 서버 실행 파일
    ├── config              // 환경변수, DB 설정등을 관리
    │   └── config.js      
    ├── constants           // 상수 관리
    │   ├── env.js          // env 상수
    │   ├── handler.js      // handler 관련 상수
    │   └── header.js       // header 관련 상수              
    └── events              
```

- 일단 복잡한건 제쳐두고 환경변수 관리에 필요한 config 와 constants들을 확인해보겠다!

#### constants(상수모음)

- 고정된 값(상수/constant)들을 저장해두어 프로젝트에서 공통으로 사용하는 폴더다.

- 상수들의 역할(주로 사용되는 곳)에 따라 파일들을 나눠 두었다.

1. **env.js**

    - .env 파일에 저장된 변수들을 dotenv 라이브러리를 이용해 불러오는 곳!

    - 값들이 누락되었을 때 디버깅/오류방지를 위해 기본 값들을 설정해준다!

    ```jsx
    import dotenv from 'dotenv';

    // .env 파일 변수 가져오기
    dotenv.config();

    // || 연산자로 process.env.??? 가 null일 경우 뒤에 있는 기본값이 저장되도록 해준다
    /* 서버 관련 정보 */
    export const PORT = process.env.PORT || 5050;
    export const HOST = process.env.HOST || 'localhost';
    export const CLIENT_VERSION = process.env.CLIENT_VERSION || '1.0';

    /* DB 관련 정보 */
    export const DB1_NAME = process.env.DB1_NAME || 'database1';
    export const DB1_USER = process.env.DB1_USER || 'user1';
    export const DB1_PASSWORD = process.env.DB1_PASSWORD || 'password1';
    export const DB1_HOST = process.env.DB1_HOST || 'localhost';
    export const DB1_PORT = process.env.DB1_PORT || 3306;

    export const DB2_NAME = process.env.DB2_NAME || 'database2';
    export const DB2_USER = process.env.DB2_USER || 'user2';
    export const DB2_PASSWORD = process.env.DB2_PASSWORD || 'password2';
    export const DB2_HOST = process.env.DB2_HOST || 'localhost';
    export const DB2_PORT = process.env.DB2_PORT || 3306;
    ```

2. **handler.js**

    - 이전 handler mapping 과 비슷한 역할을 하는 친구다!

    - 맵핑되는 숫자는 보안을 위해 난수로 설정해 두었다.

    ```jsx
    // 요청을 서버에서 잘 처리하였을 경우 응답에 포함될 코드
    export const RESPONSE_SUCCESS_CODE = 1;
    // 기존 handlerMapping과 비슷한 기능이지만, handlers 폴더의 index.js와 기능이 분리되었다!
    // 핸들러 명칭과 매칭되는 ID(난수)
    export const HANDLER_IDS = {
        INITIAL: 52,
        CREATE_GAME: 462,
        JOIN_GAME: 325,
        LOCATION_UPDATE: 6306,
    }
    ```

3. **header.js**

    - Packet 생성 시 필요한 값들을 지정해둔 곳이다!

    - Packet의 종류도 구분해주는 역할!

    ```jsx
    // 헤더의 총 길이 (Bytes)
    export const TOTAL_LENGTH = 4;
    // 패킷 종류를 담을 길이 (Bytes)
    export const PACKET_TYPE_LENGTH = 1;
    // 패킷의 종류와 매칭되는 ID
    export const PACKET_TYPE = {
        PING: 203,
        NORMAL: 5437,
        GAME_START: 2124,
        LOCATION: 3344
    }
    ```

#### config(설정)

- constants 에서 지정된 값들을 외부 파일에서 용도에 맞게 사용하기 쉽도록 묶어주는 역할이다!

```jsx
import { CLIENT_VERSION, 
    DB1_HOST, 
    DB1_NAME, 
    DB1_PASSWORD, 
    DB1_PORT, 
    DB1_USER, 
    DB2_HOST, 
    DB2_NAME, 
    DB2_PASSWORD, 
    DB2_PORT, 
    DB2_USER, 
    HOST, 
    PORT 
} from "../constants/env.js";
import { PACKET_TYPE_LENGTH, TOTAL_LENGTH } from "../constants/header.js";

export const config = {
    server: {
        port: PORT,
        host: HOST,
    },
    client: {
        version: CLIENT_VERSION,
    },
    packet: {
        totalLength: TOTAL_LENGTH,
        typeLength: PACKET_TYPE_LENGTH
    },
    databases: {
        GAME_DB: {
            name: DB1_NAME,
            user: DB1_USER,
            password: DB1_PASSWORD,
            host: DB1_HOST,
            port: DB1_PORT,
        },
        USER_DB: {
            name: DB2_NAME,
            user: DB2_USER,
            password: DB2_PASSWORD,
            host: DB2_HOST,
            port: DB2_PORT,
        },
    }
}
```

## Protobuf (Protocol Buffers)

- Google에서 개발한 **구조화된 데이터를 직렬화(serialization)**하기 위한 언어 중립적이고 플랫폼 중립적인 확장 가능한 메커니즘

### 특징

1. **데이터 직렬화**

    - 구조화된 데이터를 컴팩트하고 효율적인 이진 형식으로 직렬화

    - JSON이나 XML보다 더 작고 빠른 데이터 교환 방식

2. **언어 독립성**

    - C++, Java, Python, Go, JavaScript 등 다양한 프로그래밍 언어 지원

    - 한 언어에서 정의한 메시지 스키마를 다른 언어에서도 사용 가능

3. **성능**

    - 매우 빠른 직렬화/역직렬화 속도

    - 작은 메시지 크기

    - 네트워크 통신과 데이터 저장에 최적화

#### 직렬화 / 역직렬화

1. **직렬화 (Serialization)**

    - 복잡한 데이터 구조(객체, 클래스 등)를 Byte Stream(연속된 바이트) 형태로 변환하는 과정

    - 데이터를 저장하거나 네트워크를 통해 전송할 수 있는 형태로 변환

    - 메모리나 디스크에 저장 가능한 형식으로 변환

2. **역직렬화 (Deserialization)**

    - 직렬화된 바이트 데이터를 다시 원래의 객체나 데이터 구조로 복원하는 과정

    - 저장되거나 전송된 데이터를 다시 프로그램에서 사용 가능한 형태로 복원

### 사용 및 구조 분리

- protobuf 라이브러리를 설치 해준다!

```bash
npm install protobufjs
# 또는 yarn
yarn add protobufjs
```

- protobuf 전용 폴더를 생성하여 용도와 기능에 맞게 파일들을 분리해준다!

#### Protobuf 관련 폴더 구조

```folder
.
├── .env                    
├── assets                   
├── README.md               
├── client.js               // 임시 클라이언트     
└── src                     // 서버 폴더
    ├── server.js               // 서버 실행 파일
    ├── config              
    ├── constants           
    ├── events              
    ├── init                    // 서버 초기화
    │   └── loadProtos              // Proto 파일들을 읽어와 저장 및 관리하는 곳
    ├── protobuf                // 패킷 구조
    │   ├── notification            // 서버의 전달 패킷 구조
    │   │   └── game.notification.proto // game 관련 전달
    │   ├── request                 // 클라이언트 요청 패킷 구조
    │   │   ├── common.proto            // 기본적인 요청 
    │   │   ├── game.proto              // game 관련 요청 
    │   │   └── initial.proto           // 첫 서버 연결 관련 요청
    │   ├── response                // 서버 응답의 패킷 구조
    │   │   └── response.proto          // 기본적인 응답
    │   └── packetNames.js          // Proto의 Message들을 구별하기 위해 사용    
    └── utils                   // 기타 유용한 함수들 모음(공용)
        └── parser                  // 분석에 이용되는 함수모음
            └── packetParser.js         // packet 분석용 함수         
```

#### Proto 작성

- 생성한 파일 내부에는 아래와 같은 **기본 형식**의 코드가 들어가게 된다!

    ```proto
    // 프로토콜 버전 선언 (proto3 권장)  
    syntax = "proto3";  

    // 패키지 선언 (네임스페이스 역할)  
    package myproject;  

    // 메시지 정의  
    message Person {  
        // 필드 정의   
        // [타입] [필드명] = [고유 번호];  
        string name = 1;     // 문자열 필드  
        int32 age = 2;       // 정수 필드  
        bool is_student = 3; // 불리언 필드  
    }  
    ```

- **주요 데이터 타입 모음**

    ```proto
    // 숫자 타입  
    int32   // 32비트 정수 (Range: -2,147,483,648 ~ 2,147,483,647)
    int64   // 64비트 정수  
    uint32  // 32비트 부호 없는 정수 (= 양의 값만 가짐) (Range: 0 ~ 4,294,967,295)
    uint64  // 64비트 부호 없는 정수
    float   // 32비트 부동소수점  
    double  // 64비트 부동소수점  

    // 문자열 타입  
    string  // 문자열  
    bytes   // 바이너리 데이터  

    // 특수 타입  
    bool    // 불리언  
    ```

- **고급 필드 옵션**

    ```proto
    message Advanced {  
        // 필수 필드 지정 (proto3에서는 거의 사용하지 않음)  
        string required_field = 1;  

        // 기본값 지정  
        int32 age = 2 [default = 0];  

        // 반복 필드 (배열과 유사)  
        repeated string hobbies = 3;  

        // 중첩 메시지  
        message Address {  
            string street = 1;  
            string city = 2;  
        }  
        Address home_address = 4;  
    }  
    ```

#### Proto 지정

- Proto를 통해 패킷의 구조들을 설정하였다면 이를 읽어 적용시켜주는 로직이 필요하다!

- Proto를 읽기 전에 파일 내의 여러 개의 Message들을 구분해주는 정보가 필요하다!

```jsx
/* packetNames.js */
// Proto 파일(package name)과 그에 속한 Message(패킷 구조)를 역할별로 분리해줌
export const packetNames = {
    /* 
    Proto 파일명(= package(name)): {
        Message(name): 'package(name).Message(name)',
    }
    */
    common: {
        Packet: 'common.Packet',
        Ping: 'common.Ping',
    },
    response: {
        Response: 'response.Response',
    },
    initial: {
        Packet: 'initial.Packet',
    },
    game: {
        CreateGamePayload: 'game.CreateGamePayload',
        JoinGamePayload: 'game.JoinGamePayload',
        LocationUpdatePayload: 'game.LocationUpdatePayload',
    },
    gameNotification: {
        Start: 'gameNotification.Start',
        LocationUpdate: 'gameNotification.LocationUpdate',
    },
}
```

#### Proto 불러오기 + 저장

- 위에서 지정해둔 정보를 이용해 폴더구조에서 Proto 파일들을 읽어와 저장해보겠다!

```jsx
import fs from 'fs';
import path from 'path';
import protobuf from 'protobufjs'
import { fileURLToPath } from 'url';
import { packetNames } from '../protobuf/packetNames.js';

//현재 파일의 절대경로 찾기
const __filename = fileURLToPath(import.meta.url);
//디렉토리 경로(현재 파일위치) 추출
const __dirname = path.dirname(__filename);
// 현재 파일위치 기준으로 protobuf 폴더 찾기
const protoDir = path.join(__dirname, '../protobuf');

// Proto 파일들 전부 불러오기
const getAllProtoFiles = (dir, fileList = []) => {
    // 지정된 주소(= protobuf 폴더)를 읽음
    const files = fs.readdirSync(dir);

    // 폴더 내에 있는 요소들을 전부 확인
    files.forEach(file => {
        // 요소(파일 또는 폴더)와 현재주소(protobuf 폴더)를 묶은 주소를 저장
        const filePath = path.join(dir, file);
        // 폴더 내부에 폴더가 있을 경우 재귀적으로 탐색
        if (fs.statSync(filePath).isDirectory()) {
            fileList = getAllProtoFiles(filePath, fileList);
        // 찾은 요소가 .proto 파일인 경우에만 추가 fileList에 추가
        } else if (path.extname(file) === '.proto') {
            fileList.push(filePath);
        }
    });

    return fileList;
};

// 모든 protobuf 의 proto 파일들을 불러왔음!(파일만 불러옴)
const protoFiles = getAllProtoFiles(protoDir);

// 불러온 Proto 파일들을 Message 별로 분리하는 객체
const protoMessages = {};

export const loadProtos = async () => {
    try {
        //Protobuf Root 객체 생성
        const root = new protobuf.Root();

        //생성한 Protobuf Root에 파일들을 전부 로드
        await Promise.all(protoFiles.map(async (file) => root.load(file)));
        
        // packetNames에 정의된 패킷 이름으로 Message 타입을 찾아서 저장
        for (const [packageName, types] of Object.entries(packetNames)) { 
            // packageName = proto 파일명 , types = 파일에 포함된 Message들
            protoMessages[packageName] = {};
            for (const [type, typeName] of Object.entries(types)) {
                // Root 객체에서 typeName(='package(name).Message(name)')으로 
                // 찾은 Message를 protoMessages 객체에 분리하여 저장
                protoMessages[packageName][type] = root.lookupType(typeName);
            }
        }
        console.log("Protobuf 파일 로드 성공")
    } catch (err) {
        console.error('Failed to load Protobuf: ' + err.message);
    }
}

export const getProtoMessages = () => {
    // 얕은 복사 방지하며 반환
    return {...protoMessages};
}
```

### Parser

- 네트워크에서 전송된 패킷의 데이터를 분석하고 필요한 정보를 추출하는 과정!

- Protobuf를 사용해 값을 직렬화/역직렬화 하는 방법을 알아보겠다!

- 그 전에 server나 client 에서 loadProtos를 통해 Proto 파일들을 불러와 주어야 한다!

```jsx
/* server 또는 client */
import { loadProtos } from "./src/init/loadProtos.js";

await loadProtos();
```

#### 직렬화(=값 보내기 전)

- 클라이언트를 기준으로 Packet 을 보낼 때 일어나는 과정을 자세히 설명하였다!

```jsx
/* client.js */
import { getProtoMessages } from '../../init/loadProtos.js';

// 보낼 패킷 생성
const createPacket = (handlerId, payload, clientVersion = '1.0.0', type, name) => {
    const protoMessages = getProtoMessages();
    // 인자로 받은 type 과 name을 이용해 Message(구조)를 불러온다
    const PayloadType = protoMessages[type][name];

    if (!PayloadType) {
        throw new Error('PayloadType을 찾을 수 없습니다.');
    }

    // Message.create() 를 통해 Message 형태로 payload 인스턴스 객체를 생성
    const payloadMessage = PayloadType.create(payload);
    // Messages.encode() 를 통해 직렬화(=Byte Stream 변환) 진행
    // finish() => 직렬화 과정에서 생성된 임시 버퍼를 최종 고정된 버퍼로 변환
    const payloadBuffer = PayloadType.encode(payloadMessage).finish();

    //protoMessages.common.Packet 형식에 맞춘 packet 반환
    return {
        handlerId,
        userId,
        clientVersion,
        sequence,
        payload: payloadBuffer,
    };
};

// Packet 을 Protobuf 형식에 맞춰 바꿔준 후 보내기
const sendPacket = (socket, packet) => {
    // Messages(패킷 구조)들 가져오기 
    const protoMessages = getProtoMessages();
    // 구조 중 필요한 기본 요청 형식만 가져오기
    const Packet = protoMessages.common.Packet;
    if (!Packet) {
        console.error('Packet 메시지를 찾을 수 없습니다.');
        return;
    }

    // 여기서 create()를 안써도 되는 이유는 
    // createPacket()에서 반환되는 값이 이미 protoMessages.common.Packet 형식에 맞춰져 있어서임
    // Messages.encode() 를 통해 직렬화(=Byte Stream 변환) 진행
    const buffer = Packet.encode(packet).finish();

    /* 헤더 생성 영역 */
    // 패킷 길이 정보를 포함한 버퍼 생성
    const packetLength = Buffer.alloc(TOTAL_LENGTH);
    packetLength.writeUInt32BE(buffer.length + TOTAL_LENGTH + PACKET_TYPE_LENGTH, 0); 
    // 패킷 타입 정보를 포함한 버퍼 생성
    const packetType = Buffer.alloc(PACKET_TYPE_LENGTH);
    packetType.writeUInt8(1, 0); // NORMAL TYPE

    // Header(packetLength + packetType) + Payload(buffer) 합치기
    const packetWithLength = Buffer.concat([packetLength, packetType, buffer]);

    // 생성한 Packet 을 전송
    socket.write(packetWithLength);
};
```

#### 역직렬화(=값을 받은 후)

- 받아온 값을 역직렬화 해주는 서버의 함수를 이용해 설명하겠다!

```jsx
/* utils/packetParser.js */
import { getProtoMessages } from '../../init/loadProtos.js';

export const packetParser = (data) => {
    // Messages(패킷 구조)들 가져오기 
    const protoMessages = getProtoMessages();
    // 구조 중 필요한 기본 요청 형식만 가져오기
    const Packet = protoMessages.common.Packet;
    let packet;
    // Messages.decode() 를 통해 역직렬화(=Data로 변환) 진행
    // 받아온 값이 구조와 알맞지 않은경우를 대비해 try catch 사용
    try {
        packet = Packet.decode(data);
    } catch (error) {
        console.error(error);
    }

    /* 역직렬화한 값을 분리하여 저장 후 반환 */
    const handlerId = packet.handlerId;
    const userId = packet.userId;
    const clientVersion = packet.clientVersion;
    const payload = packet.payload;
    const sequence = packet.sequence;

    console.log('clientVersion:', clientVersion);

    return { handlerId, userId, payload, sequence };
};
```

## 한줄 평 + 개선점

- 이번 프로젝트는 구조가 복잡해보여 착실히 정리를 해두어야 나중에 트러블 슈팅이나 추가 기능을 구현할 때 편할 것 같다!

---
