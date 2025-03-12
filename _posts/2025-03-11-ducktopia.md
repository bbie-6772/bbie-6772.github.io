---
layout: post
title: Ducktopia - <24>
subtitle: 로드밸런싱 정리
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

## 게임 플레이 테스트

### Health Check 오류

기존 Gateway가 1개의 서버로 돌아갔을땐 문제가 없었으나, 이제 Gateway가 다중화 되면서 문제가 생기기 시작했다!

바로 특정 Gateway의 HealthCheck에 오류가 생겨 Lobby 나 Game 서버와의 접속을 끊어버린 다는 것이다!

![헬스체크로그](https://github.com/user-attachments/assets/daa6c4c0-97dd-410e-be9f-ca6bd4e147e9)

오류가 난 상황과 이유를 대략적인 가설로 설명을 해보자면 (위는 중간 확인을 위한 console.log 이다)

```jsx
this.intervals.push(setInterval(this.healthCheck, 5000));

healthCheck = async () => {
    // stack 증감
    const test = await redisClient.hGet(this.socket.id, 'check');
    if (test === 'testing') this.stack++;
    else this.stack = 0;

    // stack 검증
    if (this.stack >= 3) {
      switch (this.type) {
        case 'Game':
          onGameEnd(this.socket)();
          break;
        case 'Lobby':
          onLobbyEnd(this.socket)();
          break;
      }
      await redisClient.hSet(this.socket.id, 'status', 0);
    }

    // 테스팅 시작
    await redisClient.hSet(this.socket.id, 'check', 'testing');
    await redisClient.publish(this.socket.id, 'testing');
    console.log(`//HealthCheck// [Server] ${this.socket.id} / [Stack] : ${this.stack} `);
  };
```

1. 5초마다 Redis에 저장된 서버의 check 라는 필드를 읽는다  
( this.socket.id 는 Redis에 Key값으로 사용하는 서버의 Id를 의미한다. )

2. 만약 서버의 check 값이 'testing' 일 경우 stack을 쌓는다(아니면 stack 초기화)

3. 만약 stack이 3 이상이 되면 서버와의 연결을 끊는다.

4. Health Check을 하기위해 Redis에 있는 서버의 check 필드를 testing으로 바꾸고 Pub/Sub으로 알림을 보낸다.

5. 이때 알림을 받은 서버는 자신의 check 필드를 update로 다시 올린다

위와 같은 로직이였는데.. 만약 Gateway 서버가 HealthChecking 할 서버에 거의 동시에 로직이 작동되면,  
Gateway 1 번이 서버의 'check' 필드를 'testing'으로 만들고 Pub/Sub을 받는 서버가 'update'로 바꾸기 전에  
Gateway 2 번이 검증을 시작하면서 스택이 계속해서 쌓이는 것이다!

이를 위한 해결방법으로 **HealthCheck를 받는 대상**에 상태를 저장하는 것이 아닌,  
**HealthCheck를 하는 대상**에게 상태를 저장하는 방식으로 수정하였다!

```jsx
healthCheck = async () => {
    // userSession.name 은 Gateway 서버의 구분자로 Redis Hash Table key로 사용된다
    const test = await redisClient.hGet(userSession.name, this.socket.id);
    if (test === 'testing') this.stack++
    else this.stack = 0;

    // stack 검증
    if (this.stack >= 5) {
      switch (this.type) {
        case 'Game':
          onGameEnd(this.socket)();
          break;
        case 'Lobby':
          onLobbyEnd(this.socket)();
          break;
      }
      await redisClient.hSet(this.socket.id, 'status', 0);
    }

    // 테스팅 시작
    await redisClient.hSet(userSession.name, this.socket.id, 'testing');
    await redisClient.publish(this.socket.id, userSession.name);

    //console.log(`//HealthCheck// [Server] ${this.socket.id} / [Stack] : ${this.stack} `);
};
```

- 기존 Redis 저장방식과 이를 통한 이후 저장방식을 비교해보겠다!  

1. 기존 -> HealthCheck 대상 Hash Table에 'check' 필드 사용
    ![기존서버Redis](https://github.com/user-attachments/assets/0f0f90cf-f383-45fc-9959-970c3f2dd7a2)

2. 변경 이후 -> HealthCheck 주체 Gateway의 Hash Table에 서버 아이디를 필드명으로 사용
    ![이후서버Redis](https://github.com/user-attachments/assets/7ff3d1cf-fc2c-4d6a-b285-07a80bec4354)

### 알림창 설정

전에 서버에서 오류가 난 부분을 클라이언트에게 전달해주기 위해 errorHandler에 패킷을 보내주는 로직을 추가했엇다

```jsx
export const errorHandler = (socket, error) => {
  let message;
  // client에게 보여줄 에러인지 확인하는 변수
  let clienterr = false;

  // 에러 정보 로깅
  console.error(error);

  // 에러 타입별 분류 및 처리
  switch (true) {
    // CustomError 처리
    case error instanceof CustomError:
      message = error.message;
      break;

    // MySQL 에러
    case error.code === 'ER_DUP_ENTRY':
      if (error.sqlMessage.includes('users.name')) {
        message = '이미 존재하는 닉네임입니다';
        clienterr = true;
      } else if (error.sqlMessage.includes('users.email')) {
        message = '이미 존재하는 이메일입니다';
        clienterr = true;
      }
      break;

    // 유효성 검사 에러
    case error.name === 'ValidationError':
      message = error.message;
      clienterr = true;
      break;

    // 기타 일반 에러
    default:
      message = error.message || '알 수 없는 오류가 발생했습니다';
  }

  console.log(`에러 메시지: ${message}`);

  // 에러 응답 패킷 생성 및 전송
  const errorResponse = makePacket(config.packetType.S_ERROR_NOTIFICATION, {
    errorMessage: message,
    timestamp: Date.now(),
    clienterr: clienterr,
  });

  socket.write(errorResponse);
};
```

- 그러나 Gateway의 경우는 클라이언트와 직접적으로 연결되어있어 socket.write를 사용해도 되었는데,  
다른 서버는 Gateway로 보내기 때문에 어느 유저인지 구분해줄 userId도 같이 보내주어야 했다!

```jsx
export const errorHandler = (socket, error, userId) => {
  let message;

  // 에러 정보 로깅
  console.error(error);

  // 에러 타입별 분류 및 처리
  switch (true) {
    // CustomError 처리
    case error instanceof CustomError:
      message = error.message;
      break;
    // 기타 일반 에러
    default:
      message = error.message || '알 수 없는 오류가 발생했습니다';
  }

  console.log(`에러 메시지: ${message}`);

  const user = userSession.getUserByID(userId);
  if (!user) return

  user.sendPacket([config.packetType.S_ERROR_NOTIFICATION, {
      errorMessage: message,
      timestamp: Date.now(),
      clienterr: true,
    }])
};
```

- 그래서 errorHandler에 userId를 넣어주기 위해 try catch 외부에 userId를 미리 선언하고,  
이에 대입하여 보내주는 것으로 onData들을 수정해두었다!

## 한줄 평 + 개선점

- 게임 테스터분들을 모집해서 서버를 운영하는데 여러 버그들을 빠르게 수정해서 서버를 다시 올리는게...  
정신적 압박감이 좀 있다는걸 느꼇고, 좀더 효율좋은 CD 방법을 배웠다면 좋았을 것 같다

---
