---
layout: post
title: Ducktopia - <22>
subtitle: 로드밸런싱
author: bbie
categories: Ducktopia-Project
banner:
  image: https://github.com/user-attachments/assets/e2201ed3-6804-4534-ac37-e2c9a678cddb
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [Redis, Docker, Load-Balancing, Game-Server]
---

## Gateway 로드밸런싱

### Gateway Redis 동기화

- 이제 Gateway 서버에  로드 밸런스 + 오토 스케일 아웃 기능을 추가하기 위해 전체 게임에 접속한 유저들을  
단일 서버 기록에서 Redis로 Gateway 공통 정보로 승격시켜준다!

- 기존 로그인 핸들러 확인

```jsx
// 4. 중복 로그인 유저 세션에서 체크 << User.id (key) 를 이용한 Redis sortedSet 사용
const existingUser = await userSession.checkId(userData.id);
if (!existingUser) {
  throw new CustomError('이미 접속 중인 유저입니다.');
}

// 5. 찾은 유저에 로그인 정보 추가
await userSession.addId(userData.id, socket);
```

- 중복 로그인에 사용된 메서드를 수정!

```jsx
async addId(id, socket) {
  this.ids.set(id, this.getUser(socket.id));
  // 게이트웨이 서버 주소 동기화
  const hashData = { gate: this.host };
  await redisClient.hSet(config.redis.custom + 'Server:User:' + id, hashData);
}

async checkId(id) {
  console.log('id : ', id);
  // 중복 로그인 확인
  const req = await redisClient.del(config.redis.custom + 'Server:User:' + id);

  // 삭제 성공 시 기존 유저를 나가게 만듬
  if (req === 1) {
    await redisClient.publish(config.redis.custom + 'UserOut', id);
  }
  return true;
}
```

### GameServer 주소 동기화

- Gateway 서버에서 게임서버를 선택할 때, 이 정보를 Redis에 저장해 전 Gateway 서버가 공유할 수 있도록 함

```jsx
// 게임 상태 동기화
for (const { name, userId: tempId } of payload.room.users) {
  const tempUser = userSession.getUserByID(tempId);
  const hashData = { game: minGameServer.socket.id };
  await redisClient.hSet(config.redis.custom + 'Server:User:' + tempId, hashData);
  if (!tempUser) continue;
  tempUser.setGameState(payload.success, gameServerId);
}
```

- 이후 이 값을 이용해 여러 Gateway 서버에서도 같은 게임서버로 입력을 보낼 수 있도록 해준다

```jsx
// 게임서버로 보내기 전 확인을 도와주는 메서드
async getGameState() {
  if (this.gameServer) return this.inGame;

  const [serverId] = await redisClient.hGet(
    config.redis.custom + 'Server:User:' + this.id,
    'game',
  );
  if (serverId) {
    this.inGame = true;
    this.gameServer = serverId;
  }

  return this.inGame;
}
```

- 게임 서버에서 처음으로 게임방을 생성할 때 유저들도 같이 추가하게 되는데,  
이 때 게이트웨이의 IP주소를 이용해 연결된 Gateway 소켓을 찾아 socket을 각각 적용해준다!

```jsx
  for (const user of users) {
    const host = await redisClient.hGet(config.redis.custom + 'Server:User:' + user.userId, 'gate');
    const gateSocket = serverSession.servers.get(host);
    if (!gateSocket) continue;

    const serverUser = userSession.addUser(user.userId, user.name, roomId, gateSocket);
    game.addUser(serverUser);
  }
```

### Docker Image 생성

- AWS ECS에 Docker Image를 만들어 저장해두면 오토 스케일 아웃 때 서버를 빠르게 공급할 수 있다!

- 기본적으로 Docker를 설치해두고, 폴더 내에 Dockerfile 파일을 만들어 명령어를 넣어두고 아래와 같은 명령어를 터미널에서 실행하면 된다!

```bash
docker build . -t imageName:tag
```

- 명령어가 귀찮다면 docker 확장 프로그램을 깔고 Dockerfile을 우클릭해 Build image를 클릭하면 된다!

#### Dockerfile

Dockerfile 내에 명령어들을 통해 사용할 파일들을 지정해주거나 특정 명령어를 실행하도록 해줄 수 있다!  
( 참고로 node_modules 의 경우 의존성이 잘못되어있을 수 있기때문에 .dockerignore 에 넣어주는게 좋다)

```Dockerfile
# Image 를 베이스 이미지로 사용한다 예시로 node 가 있음 
FROM <Image>
# Image의 Tag(특정 버전)을 사용한다
FROM <Image>:<tag>

# 디렉토리 구조를 생성하거나 그 쪽으로 이동
WORKDIR directory

# Shell 에서 커맨드를 실행하는 것처럼 빌드 과정에서 실행!
RUN <command>
RUN ["<co>","<mm>","<an>","<d>","<,는 띄어쓰기 처럼 사용>"]

# Dockerfile로 이미지 실행할 때 커맨드 앞에 들어가는 명령어 세팅
# 예시 ENTRYPOINT node => docker run (node가 생략됨) index.js
ENTRYPOINT <command>
ENTRYPOINT ["<co>","<mm>","<an>","<d>","<,는 띄어쓰기 처럼 사용>"]

# 컨테이너가 실행될 때 마다 사용해줄 명령어 세팅
CMD <command>
CMD ["<co>","<mm>","<an>","<d>","<,는 띄어쓰기 처럼 사용>"]

# 컨테이너에 매칭할 애플리케이션의 PORT 선언(protocol은 기본적으로 TCP)
EXPOSE port
EXPOSE port/protocol

# 복사할 파일 <src> 를 컨테이너 주소 <dest>에 복사
COPY <src> <dest>

# 환경 변수 설정해주기 << 애플리케이션이나 이미지 빌드 도중 접근 가능
ENV <key> <value>
```

## 한줄 평 + 개선점

- Docker를 직접 배우고 이미지 생성을 해보는데 오래걸렸지만 익숙해지니 많이 쉬워보인다!

- 위와같이 AWS NLB와 ECS도 빠르게 적용해보면서 익숙해지면 좋겠다!

---
