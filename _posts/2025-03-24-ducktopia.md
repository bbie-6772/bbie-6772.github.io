---
layout: post
title: Ducktopia - <27>
subtitle: 부하 테스트
author: bbie
categories: Ducktopia-Project
banner:
  image: https://github.com/user-attachments/assets/e2201ed3-6804-4534-ac37-e2c9a678cddb
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [Feedback]
---

## 개요

저번에 받은 피드백을 토대로 부하 테스트를 실행하기 위해 여러 준비를 하였다!

### PM2

일단 EC2 인스턴스(Lobby, Game) 서버의 실시간 데이터를 확인하기 위해 pm2 link 를 사용해 pm2 웹 Monit을 사용하였다

```site
https://pm2.io/
```

1. 버킷을 만든다

2. 아래와 같이 pm2 link를 이용해 인스턴스와 연결해준다
    ![Image](https://github.com/user-attachments/assets/a1510d82-a36b-44cf-ba22-3e82801f343f)

3. pm2 startup으로 세팅을 마무리한 EC2를 이용해 AMI 생성해준다  
( 나중에 증설하기 편하게 < 근데 이거 새로 link 연결할 때 이름을 따로 설정해줘야 한다.. )
    ![Image](https://github.com/user-attachments/assets/d8b1e30a-5875-482e-a668-354e344860e3)

### 부하 테스트

기록하기 전에 무턱대고 5000 / 10000 / 14000 등등 매우 많은 더미 클라이언트를 한번에 접속하려하니까  
DB 커넥션이 부족해 부하 테스트는 커녕 Gateway의 오토스케일링만 쭉 보게 되었다..

![Image](https://github.com/user-attachments/assets/fd23dd55-a148-4da2-9a98-6e9b934980f6)

- 일단 위의 오류를 그나마 해결할 수 있을 까 하고 명시적 connection을 release 해주는 코드를 추가했지만 답이 없었다  
(애초에 연결은 50 * 2(기본 Gateway 서버 수)개를 맥스로 해놓고 2000개를 박으면 뭐가 되니..)

```jsx
export const createUser = async (name, email, password) => {
  let connection;
  try {  
    connection = await pools.USER_DB.getConnection();  
    await connection.query(SQL_USER_QUERIES.CREATE_USER, [name, email, password]);
  } finally {
    if (connection) connection.release();
  }
};
```

-> 점진적으로 100 단위로 더미 클라이언트를 연결해볼 예정이다!

#### Game Server Test 1

![Image](https://github.com/user-attachments/assets/3c14576e-2cda-438f-9c21-b9afa20b8d94)

접속 유저를 100 단위로 1000명까지 올려본 결과 (10초 간격 100명) 659 개의 게임이 이동동기화를 시작했을 때,  
Gateway 의 HealthCheck에 의해 더이상 작동하지 않게되었다 (참고로 당시 PM2 monit의 CPU는 60% 까지 올라갔었다)

![Image](https://github.com/user-attachments/assets/537076f1-f5e1-46ea-81d4-7bfc0ac3fe16)

![Image](https://github.com/user-attachments/assets/ac07c621-2cb9-4bd1-9143-b4efd79df95e)

위의 테스트는 전제 조건이 있다.

1. 게임당 유저는 1명이다.

2. 유저는 0.2초마다 이동동기화 패킷을 보낸다.

이러한 매우 빈약한 부하 테스트 임에도 660 개의 게임을 돌리지 못했다...  

#### 로드 밸런싱 오류

![Image](https://github.com/user-attachments/assets/0e306d12-000b-457c-a7f3-0f5cbcb0ee4c)

부하테스트 중 묘한 특이점도 발견하였다.. 바로 Gateway의 로드밸런싱에서 특정 서버의 games 수가 99가 되면  
더이상 그 서버로 게임을 분배하지 않는 것이다..!

```jsx
// game 수가 최소인 게임 서버 ID 확인
for (const [id, gameServer] of gameServers) {
  const count = await redisClient.hGet(id, 'games');
  if (count < minGameCount) {
    minGameCount = count;
    gameServerId = id;
    minGameServer = gameServer;
  }
}
```

코드를 확인해보니 예전에 Redis에 올리는 값들은 숫자가 아닌 "문자"로 들어간다는 사실을 깨닫게 되었다.  
그래서 count를 비교/대입하는 부분에 숫자 변환을 추가해주어 오류를 수정해주었다!

```jsx
// game 수가 최소인 게임 서버 ID 확인
for (const [id, gameServer] of gameServers) {
  const count = await redisClient.hGet(id, 'games');
  if (+count < minGameCount) {
    minGameCount = +count;
    gameServerId = id;
    minGameServer = gameServer;
  }
}
```

수정 후에는 어느정도 균등하게 분배가 된다!

![Image](https://github.com/user-attachments/assets/86373961-2a7a-4d8b-b21a-3f211270c18e)

#### Game Server Test 2

로드 밸런싱 문제를 해결하고 다시금 순차적으로 더미 클라이언트 수를 늘려보았다!  

![Image](https://github.com/user-attachments/assets/bae15718-00c3-417f-b175-97dc13fb8ef5)

![Image](https://github.com/user-attachments/assets/cf8d5349-ec08-4773-96b2-aa2b92c0613a)

게임 수가 1665을 넘어가는 순간부터 위의 절차대로 HealthCheck에 의해 서버가 다운된다! (2차 시도)

![Image](https://github.com/user-attachments/assets/1b23ea11-575e-484e-a7c0-0e422100eb87)

게임 수가 1900을 넘어가는 순간부터 서버 다운! (3차 시도)

![Image](https://github.com/user-attachments/assets/c750011b-ea23-459f-b85e-40fe497372d0)

게임 수가 2500을 넘어가는 순간부터 서버 다운! (4차 시도)

이번엔 게임을 먼저 진행하면서 더미 클라를 넣어보았는데.. 1350쯤에서 터진다! (5차 시도)

게임 수가 1890을 넘어가는 순간부터 서버 다운! (6차 시도)

평균을 내보면 서버당 1850개의 게임 정도를 버틸 수 있다!  
( 물론 매우 적은 부하의 게임 수니까.. 평상 게임은 1000개 정도..? )

## 한줄 평 + 개선점

- 부하테스트 좀 미리미리 해볼껄..

---
