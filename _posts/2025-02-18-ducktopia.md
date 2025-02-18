---
layout: post
title: Ducktopia - <10>
subtitle: 분산 서버 구현
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

## 분산 서버 구현

현재 기존 코드를 로비 <> 게임 으로 분리하는 작업을 어느정도 마쳤다! 이제 남은건 각 서버에 레디스 관련 추가 기능을  만들고, 이를 테스트 해보는 것이다.

### 로비 서버

- 일단 로비서버에서 레디스에 값을 저장하고 클라이언트에게 저장한 값들과 게임서버에서 검증할 값을 주도록 설계하였다!

#### 클라이언트 반환 값

1. **게임 서버 주소**

    - 클라이언트가 게임 서버에 접속하기 위해서 직접적인 주소를 줘야한다!

2. **레디스 키**

    - 인게임 정보(주로 유저정보)를 게임 서버에서 알고, 검증하기 위해 레디스 키를 부여해준다!

3. **유저 토큰**

    - 각 유저가 알맞는 유저인지 확인하기 위해 유저마다 다른 토큰을 부여할 예정이다

#### Redis

레디스를 처음으로 사용해보지만, 담당 팀원분이 이전에 사용하신 경험이 있으셔서 그걸 배워가며 사용했다!

```jsx
import redis from 'redis';
import { config } from '../../config/config.js';

// Redis 클라우드 인스턴스에 연결
const redisClient = redis.createClient({
  url:
    'redis://' +
    config.redis.user +
    ':' +
    config.redis.password +
    '@' +
    config.redis.host +
    ':' +
    config.redis.port,
});

// 연결 성공 시
redisClient.on('connect', () => {
  console.log('Redis 연결 성공!!');
});

// 연결 실패 시 에러 출력
redisClient.on('error', (err) => {
  console.error('Redis 연결 오류:', err);
});

await redisClient.connect();

// Json 객체를 연결된 Redis에 저장하는 함수
export const setRedisToRoom = async (roomInfo) => {
  const key = 'Room:' + roomInfo.roomId;
  const serializedObj = JSON.stringify(roomInfo);

  await redisClient.set(key, serializedObj);
  await redisClient.disconnect();
  return key;
};

// Key를 통해 연결된 Redis에 있는 Json 객체를 읽어오는 함수
export const getRedisRoomInfo = async (key) => {
  const data = await redisClient.get(key);
  await redisClient.disconnect();

  const parseData = JSON.parse(data);
  return parseData;
};
```

- 후에 Redis는 보류하는 걸로 되었...ㅠㅠ

#### 기획 수정

일단 구상했던 기획안을 토대로 진행을 하였으나 중간 회의를 통해 서버 구조에 변경사항이 생기게 되었다!

![Image](https://github.com/user-attachments/assets/92354778-b8e2-4227-a5e6-2e87a4db9961)

간단히 변경사항을 말하자면,  
기존 클라이언트가 두 서버(로비,게임)에 TCP연결을 끊거나 시작하는 방식에서
그 기능을 수행해줄 "Gateway 서버"를 만들어 클라이언트의 TCP통신 안전성을 보장하는 방식으로 변경되었다!

이에 따라 구현중이던 로비 게임의 코드도 간략화 되었다.

그러다 현재 Redis를 사용하는 이유가 명확하지 않고,  
현재의 게임 컨셉이 장기적인 게임보다 일회성인 느낌이 강하기에 Redis를 사용하지 않기로 결정되었다.

![Image](https://github.com/user-attachments/assets/384e7803-cfeb-49db-8b56-416681eef24e)

### 게이트 웨이 서버(+로그인 기능)

클라이언트가 여러 서버에 직접연결하는 방식보다,  
이를 중계해주는 서버를 추가하여 클라이언트와의 연결의 안전성을 보장해주도록 설계하였다!
통신 방식은 게임서버의 실시간성을 위해 TCP통신을 사용하기로 하였다.

TCP 사용 시 문제점으로는 유저 수가 증가할 시,  
게임 서버(N)와 게이트웨이 서버의 증설(M)해야되므로 N * M의 유지보수가 어렵다는 단점이 있지만,  
현재 프로젝트는 그러한 경우가 생길 가능성이 매우적다고 판단하였다.

추가로 게이트 웨어 서버의 등장으로 클라이언트와 다른 서버(로비,게임) 간의 연결성이 사라졌다!  
덕분에 보안성이 강화되었지만, 이 연결성(어느 클라이언트의 요청인가)을 보장하기 위해 서버간 패킷 헤더에 유저 고유 키를 넣어주기로 하였다! 

## 한줄 평 + 개선점

- 오늘 한 작업들이 대부분 기획안이 바뀌면서 다시 수정해야되는 결과물이 되어서 조금 슬프다.  
하지만 더 나아진 서버 구조를 보고 한걸음 더 나아갔다는 기분에 금방 회복되었다.

---
