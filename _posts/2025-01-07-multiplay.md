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
tags: [Protobuf, Constants]
---

## 환경변수 관리

- 기존에 환경변수나 상수들을 각각 파일에서 제어했기에 수정을 한번 하면 여러 곳을 수정해줘야 했다!

- 그 구조를 **중앙집중식**으로 변경하여 유지보수가 편하도록 하는 방법을 알아보자!

### 폴더 구조

```folder
.
├── assets
│   ├── item.json
│   ├── item_unlock.json
│   └── stage.json
├── clients
├── package-lock.json
├── package.json
├── readme.md
├── .env                   // 중요한 환경변수(보안!)
└── src
    ├── classes            // 인스턴스 class 들을 정의
    ├── config             // 환경변수, DB 설정등을 관리
    │   └── config.js      
    ├── constants          // 상수 관리
    │   ├── env.js         // env 상수
    │   ├── handler.js     // handler 관련 상수
    │   └── header.js      // header 관련 상수
    ├── db                 // db 로직 관리
    ├── events             // socket 이벤트
    ├── handlers           // 핸들러 관리
    ├── init               // 서버 초기화
    ├── protobuf           // 패킷 구조
    ├── session            // 세션 관리
    └── utils              // 그 외 필요한 함수들 선언
```

- 일단 복잡한건 제쳐두고 환경변수 관리에 필요한 config 와 constants들을 확인해보겠다!

#### constants

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

#### config

- constants 에서 지정된 값들을 외부 파일에서 용도에 맞게 사용하기 쉽도록 묶어주는 역할이다!

```jsx
import { CLIENT_VERSION, DB1_HOST, DB1_NAME, DB1_PASSWORD, DB1_PORT, DB1_USER, DB2_HOST, DB2_NAME, DB2_PASSWORD, DB2_PORT, DB2_USER, HOST, PORT } from "../constants/env.js";
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

## 한줄 평 + 개선점

- 이번 프로젝트는 구조가 복잡해보여 착실히 정리를 해두어야 나중에 트러블 슈팅이나 추가 기능을 구현할 때 편할 것 같다!

---
