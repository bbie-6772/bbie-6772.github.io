---
layout: post
title: 멀티타워디펜스 - < 4 >
subtitle: 프로젝트 진행
author: bbie
categories: Multi-TowerDefense-Project
banner:
  image: https://github.com/user-attachments/assets/2403c1b6-7704-4ded-9562-204c27aa6ed2
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [Game-Server, Tower-Defense, Database, Multiplayer]
---

## 메인 작업

### 시퀀스 시스템

![Image](https://github.com/user-attachments/assets/f633c1e9-5086-473b-b39b-7eea4e3ec860)

- 현재는 서버가 클라이언트가 로그인된 이후부터 시퀀스를 체크하기 시작한다.

- 하지만 클라이언트를 분석해본 결과 통신 시작부터 시퀀스를 증가해가며 서버와 통신을 한다!

- 서버에서 시퀀스 검증을 하기 위해선 **로그인 이후**가 아닌 **통신 시작 시점**부터 시퀀스를 관리해야 했다!

![Image](https://github.com/user-attachments/assets/dc7e3753-557a-4cc0-96a7-4ae37d1d4f93)

- 대략 이런 구조로 User의 범위를 확장시켰다!  
(기존엔 로그인된 유저만 User 였지만 이제는 접속한 인원 모두가 User가 되는 것이다!)

#### 코드 구현

- onConnection 이벤트에 User를 생성해주도록 바꾸었다 (4)번

```jsx
import onData from './data.js';
import onEnd from './end.js';
import onError from './error.js';
import { userSession } from '../session/session.js';

/* connection 이벤트 리스너  */
const onConnection = (socket) => {
  // [1] 연결된 클라의 "IP주소:PORT번호" 알림
  console.log(`새 클라 연결!! : ${socket.remoteAddress}:${socket.remotePort}`);
  // [2] 연결된 클라의 소켓 인스턴스에 buffer 속성 부여
  // 빈 버퍼 할당해놓고, 앞으로 패킷 통신 시 이 프로퍼티에 버퍼 형태로 담아 보내고 받을 것
  socket.buffer = Buffer.alloc(0);
  // [3] 이벤트 리스너 등록
  socket.on(`data`, onData(socket));
  socket.on(`end`, onEnd(socket));
  socket.on(`error`, onError(socket));
  // [4] 깡통 유저 생성
  userSession.setUser(socket);
};

export default onConnection;
```

- 이후 로그인 시 유저 정보를 업데이트 해주는 메서드를 User.class 에 추가 구현해주었다!

```jsx
//초기값에서 유저 정보는 Null 처리
constructor(socket) {
    this.key = null;
    this.id = null;
    this.roomId = null;
    this.socket = socket;
    this.state = userState.waiting; // "waiting", "matchMaking", "playing"
    this.matchRecord = {
      win: null,
      lose: null,
    };
    this.mmr = null;
    // 클라이언트의 기본 값과 동일
    this.sequence = 1; 
}
//DB에서 읽어온 값으로 유저 정보를 업데이트 해주는 메서드
login(key, userId, winCount, loseCount, mmr) {
  this.key = key;
  this.id = userId;
  this.matchRecord.win = winCount;
  this.matchRecord.lose = loseCount;
  this.mmr = mmr;
}
```

- 또한 검증에 필요한 sequence를 가져오며 다음값을 계산해주는 메서드도 추가하였다

```jsx
getSequence() {
  // 현재 값을 반환 후 sequence를 증가
  return this.sequence++;
}
```

- 사실 sequence는 서버 검증용으로 사용하는 용도이므로 클라이언트에게 값을 주지 않아도 된다.  
( 클라이언트에서는 검증을 진행하지 않는다는 걸 알게 됬다! )

### DB 구조 변경

![Image](https://github.com/user-attachments/assets/4fd8e5f4-d76c-4de2-8925-257702bee926)

- DB의 기본 형태는 위와 같이 User와 Rank 정보를 저장하는 용도로 사용한다!

- 근데 Primary Key로 사용하는 정보가 문자열이라 검색 시에 조금 더 유용한 숫자를 추가하기로 하였다!  

#### DB 프로세스

1. 클라이언트는 회원가입 후 로그인을 통해 서버에 요청을 보낸다

2. 서버는 받은 요청(id 와 password)을 통해 로그인 성공 여부를 확인한다.

    - 로그인 성공 시, id를 JWT로 해쉬화한 토큰을 보내준다.

    - 또한 User에 유저 정보를 업데이트 해준다

3. 이후 클라이언트가 통신 종료 시, 서버는 세션에 저장된 정보(User)를 DB에 저장해준다.

- 여기 까지가 기존의 프로세스이며 크게 문제가 없다!

#### 변경 사항

- DB에서 검색을 할 때 사용하는 Column의 Type이 문자열보다 숫자인 경우가 더 빠르다는 걸 알고있다.

- 그러면 초기 DB에서 유저를 찾을 때는 어쩔 수 없이 id와 password(문자열들)를 사용하지만,  
이후부턴 key(숫자)를 사용하여 검색하면 최적화가 되지 않을까? 라는 생각이 들었다.

- 그래서 DB에서 사용할 Primary Key를 숫자로 바꿔 검색 최적화를 구현했다!  
( 물론 현재는 검색을 많이 쓰지 않지만 기능이 추가된다는 가정하에는 적절한 최적화 방안이다! )

![Image](https://github.com/user-attachments/assets/216be053-59e9-4941-8c45-ee87ac856958)

### 타워 구입(생성) 핸들러

#### 구입 프로세스 확인

- 완성된 클라이언트의 통신 방식을 확인하여 구현해야할 목표를 확인하는 작업이다.

1. 클라이언트는 자신의 골드가 충분한지 확인 후 타워 구입을 서버에 요청한다  
( 이 때 타워의 위치를 MonsterPath 좌표 중 랜덤으로 하나를 골라 보내준다 )

2. 서버는 받은 위치를 받아 서버에 타워정보를 생성해주고, 현재 게임(Room) 내에 있는 타워와 겹치지 않는 TowerId를 생성한다.

3. 생성한 값을 요청한 플레이어에게 전달한다.

    - 이 때 요청한 플레이어가 아닌 상대 플레이어에겐 타워의 좌표도 같이 보내준다.

4. 각 클라이언트는 받은 정보를 통해 Tower를 렌더링한다.

#### 구입 검증 목표

- 위의 프로세스를 통해 검증할 수 있는 것들을 생각해보았다!

1. 요청한 정보가 세션에 존재하는지 확인

2. 플레이어의 돈이 충분한지 확인 및 감소

3. 타워의 위치는 MonsterPath 근접에 위치하고 있는가  
( 이 검증 사항은 나중에 서버에서 시뮬레이션 기능을 추가하였을 때 구현해보기로 했다! )

#### 타워 구입 핸들러 구현

1. 요청을 받으면 관련 핸들러인 purchaseTowerHandler가 실행된다

2. 핸들러를 통해 player를 불러오고, player의 메서드를 통해 타워설치를 진행한다

3. 이후 성공적으로 마쳤다면 Player에 따라(자신, 상대방) 다른 패킷을 보내준다.

```jsx
const purchaseTowerHandler = (socket, payload) => {
    const { x, y } = payload

    // 서버 세션 내 정보 검증
    const user = userSession.getUser(socket)
    if(!user) return
    const room = roomSession.getRoom(user.roomId)
    if(!room) return
    const player = room.getPlayer(socket)
    if(!player) return 

    // 골드 확인 후 towerId 반환
    const towerId = player.placeTower(room,x,y);
    // 타워 설치 실패 시 끝
    if(towerId === -1) return 

    room.players.forEach((player) => {
        let packet
        // player가 자신일 경우 response, 상대방일 경우 notification 반환
        if (player.id === user.id)
            packet = makePacketBuffer(config.packetType.towerPurchaseResponse, { towerId })
        else
            packet = makePacketBuffer(config.packetType.addEnemyTowerNotification, { towerId, x, y })
        player.socket.write(packet)
    })
}
```

### 타워 공격 핸들러

#### 공격 프로세스 확인

1. 클라이언트에서 타워의 공격범위(반지름이 200px인 Collider)내 에 몬스터가 들어오면 공격 요청을 보낸다.  
( 데이터는 대상들의 monsterId 와 towerId )

2. 서버는 받은 정보로 검증 후 데이터를 서버에 적용시킨다.

3. 서버는 상대방 Player 에게 타워 공격 정보를 보내준다.  
( 데이터는 대상들의 monsterId 와 towerId )

#### 공격 검증 목표

1. 요청한 정보가 세션에 존재하는지 확인

2. 타워의 공격 쿨타임 확인

3. 둘의 위치정보로 거리가 올바른지 확인  
( 이 부분은 다시 생각해보니 불가능하다는 결론이 나왔다 (몬스터 위치 없음))

- 초기엔 이러한 부분들을 구현하였으나, 클라이언트 <> 서버의 구조에서  
서버는 동기화 목적으로 설계되 검증 부분을 넣는게 크게 의미없다는 사실을 깨달았다..

#### 타워 공격 핸들러 구현

- 일단 세션정보 검증 후 공격을 실행하여 성공 시, 상대에게 보내주는 핸들러를 생성한다.

```jsx
const attackMonsterHandler = (socket, payload) => {
    const { towerId, monsterId } = payload
    // 세션<>입력 검증 과정
    const user = userSession.getUser(socket);
    if (!user) return;
    const room = roomSession.getRoom(user.roomId);
    if (!room) return;
    const player = room.getPlayer(user.id);
    if (!player) return;
    const monster = player.getMonster(monsterId);
    if (!monster) return;
    const tower = player.getTower(towerId);
    if (!tower) return;

    // 공격 판정 성공 시
    if (tower.attackMonster(monster))
        room.players.forEach((player) => {
            // 자신을 제외한 상대에게 티워 공격 정보 반환
            if (player.id === user.id) return
            const packet = makePacketBuffer(config.packetType.enemyTowerAttackNotification, { towerId, monsterId });
            player.socket.write(packet);
        });
};
```

- 이제 tower의 메서드에서 공격 쿨타임과 위치정보를 계산 후 성공여부를 알려주도록 만든다

```jsx
attackMonster(monster) {
  const timeDiff = Date.now() - this.lastUpdate;
  // 공격 쿨타임 확인
  if (timeDiff < this.stat.coolDown) return false
  // 위치 정보 확인
  const distance = Math.floor(Math.sqrt((this.x - targetX)** 2 + (this.y - targetY)** 2))
  if (distance > this.stat.range) return false

  // 몬스터 공격 적용
  monster.damaged(this.getDamage())
  this.lastUpdate = Date.now();
  return true
}
```

## 한줄 평 + 개선점

- 현재는 이론상으로만 코드를 구현하였기에, 유니티 클라이언트에 연결해보고 디버깅하는 작업이 필요하다!

- 내일 프로토타입으로 실행을 해보는 날이기에 기대가 되면서 조금 무섭다..

---
