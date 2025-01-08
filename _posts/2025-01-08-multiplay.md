---
layout: post
title: 멀티플레이 게임 - < 3 >
subtitle: 기록
author: bbie
categories: TCP-Multi-PlayGame
banner:
  image: https://github.com/user-attachments/assets/2138a507-e57d-4b62-8001-2f2fcfcccbfa
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [Database, Error, Migration]
---

## CustomError

- 현재 에러처리는 어느 상황이건 스택들과 오류 정보를 직접적으로 보여주고 있다!

- 이런 경우 에러가 발생한 곳은 알 수 있어도 이유를 못찾는 경우가 허다하다..

- 이에 특정 구간에 전용 에러를 만들어 관련 정보를 같이보여주면 디버깅하기 편하다!

- 또한 에러가 일어날 경우, 에러에 따라 다르게 작동하는 로직을 구현하기 쉽다

### Error 폴더 구조

```folder
.
├── assets                  
├── clients                 
├── README.md               
├── .env                    
└── src                         // 서버 폴더
    ├── server.js               // 서버 실행 파일
    ├── classes             
    ├── config              
    ├── constants           
    ├── db                  
    ├── events                  // socket 이벤트 분리
    │   └── onError.js            // 소켓 통신 중 에러 발생
    ├── handlers           
    ├── init                
    ├── protobuf            
    ├── session             
    └── utils                   // 기타 유용한 함수들 모음
        └── error                 // 클라이언트 요청 패킷 구조
            ├── customError.js      // CustomError 클래스
            ├── errorCodes.js       // 에러코드(분류) 상수 값
            └── errorHandler.js     // 에러들을 일괄적으로 처리해주는 핸들러 
```

### CustomError 클래스

- 예상된 에러에 필요한 정보들을 기입해주기 위해선 전용 class를 만들어 이용하는 방법이 있다!

```jsx
//Error class를 상속하는 CustomError class 생성
class CustomError extends Error {
  constructor(code, message) {
    // 부모 생성자를 명시적으로 호출 = Error class의 기본값을 다 가져옴
    super(message);
    // 예상된 Error_Code(숫자) 를 받아 저장
    this.code = code;
    // 자신이 CustomError 라는 정보를 알려주기 위해 저장
    this.name = 'CustomError';
  }
}

export default CustomError;
```

### ErrorCodes

- CustomError 에 추가적으로 저장할 정보로 Error Code를 설정해주겠다!

```jsx
// 예상되는 에러들을 매핑해둠
export const ErrorCodes = {
    SOCKET_ERROR: 10000,
    CLIENT_VERSION_MISMATCH: 10001,
    UNKNOWN_HANDLER_ID: 10002,
    PACKET_DECODE_ERROR: 10003,
    PACKET_STRUCTURE_MISMATCH: 10004,
    MISSING_FIELDS: 10005,
    USER_NOT_FOUND: 10006,
    INVALID_PACKET: 10007,
    INVALID_SEQUENCE: 10008,
    GAME_NOT_FOUND: 10009
}
```

### ErrorHandler

- 이제 CustomError를 이용해 던질 때 이를 처리해주는 핸들러를 만들어준다!

```jsx
import { createResponse } from "../response/createResponse.js";
import { ErrorCodes } from "./errorCodes.js";

export const handlerError = (error, socket) => {
    console.error(error);

    let responseCode;
    let message;

    // 에러코드가 있을 때 == CustomError 일 때
    if (error.code) {
        // 에러코드를 응답할 때 주는 코드에 저장
        responseCode = error.code;
        // 에러메시지를 응답할 때 주는 정보에 저장
        message = error.message;
        // 콘솔에 에러 코드와 이유를 확인
        console.log(`responseCode: ${responseCode}, message: ${message}`);
    // 일반 Error 일 때
    } else {
        // 예상 범위 외의 에러이기에 SOCKET_ERROR 로 고정
        responseCode = ErrorCodes.SOCKET_ERROR;
        message = error.message;
        // 콘솔에 예상 범위 외의 에러를 표시
        console.log(`new Error - message: ${message}`);
    }

    // 저장해둔 에러값들을 클라이언트에게 반환
    const errorResponse = createResponse(-1, responseCode, {message}, null);
    socket.write(errorResponse);
}
```

### 적용

- onError 처럼 Error가 일어날 수 있는 곳에 handleError와 CustomError 를 배치해준다!

```jsx
/* onError.js */
import { removeUser } from "../session/user.session.js";
import CustomError from "../utils/error/customError.js";
import { handlerError } from "../utils/error/errorHandler.js"

export const onError = (socket) => (err) => {
    
    handlerError(new CustomError(500, `Socket Error : ${err}`), socket);
    
    // 세션에서 유저 삭제
    removeUser(socket);
}

/* 예시 */
import CustomError from "../utils/error/customError.js";
import { ErrorCodes } from "../utils/error/errorCodes.js"
import { handlerError } from "../utils/error/errorHandler.js"

try {
  /*검증 과정*/
  if(!value) throw new CustomError(ErrorCodes.GAME_NOT_FOUND,"게임을 찾지 못했습니다!")
} catch(e) {
  handleError(e)
}
```

## DB 연동

- 지금까지 SQL을 이용해 DB를 불러올 때 Prisma를 주로 사용하였다!

- 이번엔 Prisma 라이브러리 대신 직접 사용하기 위해 Connection Pool을 직접 구현해주도록 한다!

- [참고 포스트](https://bbie-6772.github.io//server/2024/12/26/database.html)

### DB 폴더 구조

```folder
.
├── assets                  
├── clients                 
├── README.md               
├── .env                    
└── src                       // 서버 폴더
    ├── server.js               // 서버 실행 파일
    ├── classes             
    ├── config                // 환경변수, DB 설정등을 관리
    ├── constants               
    ├── db                      // db 관련 폴더
    │   ├── migration             // db 기초설정(Migration)용 폴더
    │   │   └── createSchemas.js    // DB의 Schema(형식) 지정
    │   ├── sql                   // SQL Migration 용 쿼리문
    │   │   └── user_db.sql         // user_db의 table 생성/변경 쿼리
    │   ├── user                  // user_db 관련 폴더 
    │   │   ├── user.db.js          // user_db에 사용할 함수 모음
    │   │   └── user.queries.js     // 함수에 사용될 쿼리들 저장
    │   └── database.js           // Connection Pool 관리
    ├── events              
    ├── handlers           
    ├── init                    // 초기 설정 관련 폴더
    │   ├── assets.js               // assets 불러오기
    │   ├── loadProtos.js           // proto 불러오기
    │   └── index.js                // 초기 설정을 총괄
    ├── protobuf            
    ├── session             
    ├── utils                   // 기타 유용한 함수들 모음
    │   └── db                    // db 관련 함수
    │       └── testConnection.js   // 연결상태 확인
    └── dateFormatter.js        // 날짜 변환기
```

### DB Connection Pool 구현

- mysql2 라이브러리를 이용하여 Connection Pool 을 만들어 DB관련 I/O를 관리해준다!

```jsx
/* database.js */
import { config } from "../config/config.js";
import { formatDate } from "../utils/dateFormatter.js";
import mysql from 'mysql2/promise'

// 환경변수 모음집 config 에서 db 관련 값 가져오기
const { databases } = config;

// Connection Pool 생성 함수
const createPool = (dbConfig) => {
    // mysql2 라이브러리의 createPool() 메서드 사용
    const pool = mysql.createPool({
        // 호스트 주소 
        host: dbConfig.host,
        // 포트 번호 
        port: dbConfig.port,
        // 접속 사용자 이름
        user: dbConfig.user,
        // 비밀번호
        password: dbConfig.password,
        // DB 이름 
        database: dbConfig.name,
        // 연결 대기 동작 설정 (true = 대기가능, false = 바로 오류 반환)
        waitForConnections: true,
        // 커넥션 풀에서 최대 연결 수
        connectionLimit: 10, 
        // 연결 대기열 제한 (0일 경우 대기열 수가 무제한)
        queueLimit: 0, 
    })   
    
    // 원본 query 메서드 백업
    const originQuery = pool.query;

    // poo.query 오버라이드
    pool.query = (sql, params) => {
        // 실행된 날짜 확인
        const date = new Date();

        // 확인용 로그 띄우기
        console.log(`${formatDate(date)} / ${sql} / ${params && JSON.stringify(params)}`)

        // 백업된 기존의 query 메서드를 사용하여 query 진행 
        return originQuery.call(pool, sql, params);
    }

    //생성한 Connection Pool 반환
    return pool;
}

const pools = {
    // 사용할 DB의 Connection Pool 생성 및 저장
    GAME_DB: createPool(databases.GAME_DB),
    USER_DB: createPool(databases.USER_DB),
}

export default pools;
```

### DB 연결 확인

- 일단 시스템적으로 DB에 연결된 Connection Pool을 만들어 관리도록 만들었다!

- 하지만.. DB나 Connection Pool이 제대로 작동하는지 먼저 확인할 방법이 없다!

- 그렇기에 서버가 시작할 때 확인해주는 로직이 필요하다!

```jsx
/* testConnection.js */
const testDbConnection = async (pool, dbName) => {
    try {
        // DB가 연결되어 1 + 1 이라는 연산이 가능한지 테스트
        const [rows] = await pool.query('SELECT 1 + 1 AS solution');
        console.log(`${dbName} 테스트 결과 ${rows[0].solution}`)
    } catch (e) {
        // 만약 연결이 실패한다면 에러가 발동되기에 try catch 사용
        console.error(dbName, "연결 실패",e)
    }
}

// 각 DB들을 모두 순회하는 함수
const testAllConnections = async (pools) => {
    await testDbConnection(pools.GAME_DB, 'GAME_DB');
    await testDbConnection(pools.USER_DB, 'USER_DB');
}

export { testAllConnections, testDbConnection };
```

- 이제 이를 서버 시작 때 실행할 수 있도록 init 폴더에 있는 index.js에 연결해준다!

```jsx
/* init/index.js */
import pools from "../db/database.js";
import { testAllConnections } from "../utils/db/testConnection.js";
import { loadGameAssets } from "./assets.js";
import { loadProtos } from "./loadProtos.js";

const initServer = async () => {
    try {
        // 게임 에셋 로드
        await loadGameAssets();
        // Proto 파일 로드 
        await loadProtos();
        // 모든 DB 연결 확인 
        await testAllConnections(pools);
    } catch (err) {
        console.error(err);
        // 오류 발생 시 시스템 강제종료
        process.exit(1);
    }
}

export default initServer;
```

- initServer를 server에 매핑해준다

```jsx
import net from 'net';
import initServer from './init/index.js';
import { config } from './config/config.js';
import { onConnection } from './events/onConnection.js';

const server = net.createServer(onConnection);

// 초기 서버 설정 완료 후 서버 listen(오픈)
initServer().then(() => {
    server.listen(config.server.port, config.server.host, () => {
        console.log(server.address());
    });
// 만약 과정 중 오류가 나오면 강제종료
}).catch((err) => {
    console.error(err);
    process.exit(1);
})
```

### 쿼리 실행

- 이제 DB와 연결 테스트 및 DB를 사용할 수 있는 환경을 만들었다!

- 그럼 이 DB에 쿼리를 날려 원하는 정보를 얻거나 수정할 수 있는 쿼리문과 함수를 지정해준다!

#### user.queries.js(쿼리문 모음)

- 일단 DB를 통해 작업을 할 때, 용도에 맞는 쿼리문을 작성해준다!

```jsx
export const SQL_QUERIES = {
    // connection.query(sql, [params]) 형식으로 사용할 때 ? 부분이 params가 들어감
    // 유저 찾기 쿼리
    FIND_USER_BY_ID: 'SELECT * FROM users WHERE device_id = ?',
    // 유저 추가 쿼리
    CREATE_USER: 'INSERT INTO users (id, device_id) VALUES (?, ?)',
    // 유저 로그인 업데이트 쿼리
    UPDATE_USER_LOGIN: 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
}
```

#### user.db.js(함수 모음)

- 이제 만든 쿼리들을 이용해 함수에 매핑해준다!

```jsx
import { toCamelCase } from "../../utils/transformCase.js";
import pools from "../database.js";
import { SQL_QUERIES } from "./user.queries.js";
import { v4 as uuidv4 } from 'uuid';

// 유저 찾기 함수
export const findUserByDeviceId = async (deviceId) => {
    // connection.query()와 만들어둔 쿼리문을 이용해 유저를 찾음
    const [rows] = await pools.USER_DB.query(SQL_QUERIES.FIND_USER_BY_ID, [deviceId]);
    // 기본 Snake_Case를 CamelCase로 변환 해줌 (utils 에 포함)
    return toCamelCase(rows[0]);
}

// 유저 생성 함수
export const createUser = async (deviceId) => {
    // uuid 라이브러리를 이용해 uuid생성
    const id = uuidv4();
    // uuid를 이용해 user_db에 유저 생성
    await pools.USER_DB.query(SQL_QUERIES.CREATE_USER, [id, deviceId]);
    // 생성된 값 반환
    return {id, deviceId};
}

// 유저 로그인 업데이트 함수
export const updateUserLogin = async (id) => {
    // 유저의 최근 접속시간을 수정
    await pools.USER_DB.query(SQL_QUERIES.UPDATE_USER_LOGIN, [id]);
}
```

### DB Migration

- 어느정도 DB를 이용하는 로직을 구현하였다!

- 하지만 만약 DB에 테이블이 없거나 관련 컬럼이 없다면..?

- 물론 로직은 제대로된 동작이 안될 것 이다..

- 그렇기에 이런 테이블을 초기화 및 스키마 변경을 해주는 작업! Migration(이사) 작업이 필요하다

#### 쿼리 작성

- 위에서 사용한 방법처럼 쿼리문을 미리 만들어 두고 이를 사용하는 방식으로 진행한다!

```sql
-- user_db.sql

-- users 테이블이 없을 경우 초기화 설정 
CREATE TABLE IF NOT EXISTS users 
(
    id VARCHAR(36) PRIMARY KEY, 
    device_id VARCHAR(255) NOT NULL UNIQUE,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- game_end 테이블이 없을 경우 초기화 설정 
CREATE TABLE IF NOT EXISTS game_end
(
    id VARCHAR(36) PRIMARY KEY, 
    user_id VARCHAR(36) NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    score INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 작동 함수

- 만든 쿼리를 실행시켜주는 파일을 만들어준다!

- 이 파일을 나중에 DB 초기화 설정 때 사용해주면 된다!

```jsx
/* createSchemas.js */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pools from '../database.js';

//현재 파일의 절대경로 찾기
const __filename = fileURLToPath(import.meta.url);
//디렉토리 경로(현재 파일위치) 추출
const __dirname = path.dirname(__filename);

// sql file 을 읽어 변환 해주는 함수
const executeSqlFile = async (pools, filePath) => {
    // 받아온 인자 filePath 에 있는 파일 읽기
    const sql = fs.readFileSync(filePath, 'utf8');
    // 파일에서 split(';')을 통해 쿼리문을 분리
    const queries = sql.split(';')
    // 분리된 쿼리문에서 양끝의 공백을 제거
    .map((query) => query.trim())
    // 유효한 쿼리문만 사용하도록 길이 확인
    .filter(query => query.length > 0);

    for (const query of queries) {
        // DB에 쿼리 적용
        await pools.query(query);
    }
}

// 테이블 형식 생성 
const createSchemas = async () => {
    // sql 폴더 주소 추출 
    const sqlDir = path.join(__dirname, '../sql');
    try {
        // 위의 함수를 통해 테이블 생성 쿼리문 적용
        await executeSqlFile(pools.USER_DB, path.join(sqlDir, 'user_db.sql'))
    } catch(e) {
        console.error("데이터 베이스 생성 오류",e)
    }
}

// 테이블 형식 생성 함수 호출
createSchemas().then(() => {
    // 실행이 잘되었으면 출력이후 안정적 종료
    console.log("데이터 베이스 생성 완료")
    process.exit(0);
}).catch((err) => {
    // 오류 발생 시 출력이후 강제 종료
    console.error(err);
    process.exit(1);
})
```

## 한줄 평 + 개선점

- 생각보다 정리할 양이 많아 내일로 미뤄야할 정도였다..

- 어제는 편하게 강의만 보면서 따라했기에, 이를 정리하는 오늘이 그만큼 힘들게 바뀌었다..

- 다음엔 대략적으로나마 정리할 구성 요소들을 생각하며 강의를 시청해야겠다!

---
