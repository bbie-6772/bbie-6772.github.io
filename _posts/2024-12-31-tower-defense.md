---
layout: post
title: 웹소켓을 이용한 타워디펜스 - <6>
subtitle: TowerDefense
author: bbie
categories: WebSocket2
banner:
  image: https://github.com/user-attachments/assets/12619205-081d-4e2e-a483-cb498e136e36
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [Node.js]
---

## 프로젝트 병합

- 현재 프로젝트에 파일이 많아 병합하는 과정에서 오류가 자주 뜬다

### UserInterFace 연결

- 클라이언트 game.js에서 유저의 점수, 골드를 내부에서 관리하였는데,  
이를 사용자에게 보여주기위해 새로운 userInterface.model 을 만들면서 get/set 오류가 있었다

- 콘솔 로그를 보며 관련 코드들을 함수를 import하여 수정하는 것으로 해결하였다

```jsx
/* 이전 */
// 점수 바꾸기
if(Object.keys(Monsters.getInstance().getInfo()).length !== 0){
score = Monsters.getInstance().getInfo().score;
gold = Monsters.getInstance().getInfo().gold;
monsterLevel = Monsters.getInstance().getInfo().wave;
}
/* 이후 */
import { setScore, setUserGold } from "./model/userInterface.model.js";
// 점수 바꾸기
if(Object.keys(Monsters.getInstance().getInfo()).length !== 0){
setScore(Monsters.getInstance().getInfo().score);
setUserGold(Monsters.getInstance().getInfo().gold);
monsterLevel = Monsters.getInstance().getInfo().wave;
}
```

### Chat Socket 공유

## 멀티 플레이

### 연결 해제

- 현재 유저가 연결을 끊으면(새로고침, 페이지 나가기) 아무 일도 일어나지 않아 기존의 방이 남아있는 오류가 있다

- 이를 해결하기 위해 socket.id 를 통해 유저 및 유저가 참여한 방을 삭제할 수 있도록 반영해야겠다

```jsx
//연결이 끊길 시
export const handleDisconnect = (socket, io) => {
    // 유저 존재 확인
    const user = deleteUser(socket.id)
    let room = getRoom(user.userId);
    let destroyed = null;
    // 참여 방 확인 + 게임 시작 여부 확인으로 방 삭제 혹은 나가기
    if (room) {
        if (room.startTime > 0) {
            destroyed = destroyRoom(user.userId)
            io.to(room.gameId).emit('leaveRoom', { roomId: destroyed.gameId })
        }
        else {
            room = leaveRoom(room.gameId, user.userId)
            io.to(room.gameId).emit('room', { room })
        }
    }
}
// 사용된 user.model 함수
export const deleteUser = (socketId) => {
    const idx = users.findIndex((e) => e.socketId === socketId)
    // splice로 인해 배열형태로 반환되는 것을 다시 객체 형태로 변환
    if (idx !== -1 ) return Object.assign(...users.splice(idx, 1))
    else return false
}
// 사용된 gameRoom.model 함수 
export const destroyRoom = (userId) => {
    const roomIdx = gameRooms.findIndex((e) => e.userId1 === userId || e.userId2 === userId)
    if (roomIdx) return Object.assign(...gameRooms.splice(roomIdx, 1))
    else return false
}
```

- 이제 leaveRoom 을 받은 클라이언트는 게임도 종료할 수 있도록 수정!

```jsx
/* lobby.js = 클라이언트 플레이어 화면*/
let game = null

// 대기방 나가기
export const exitRoom = () => {
    selectedRoom = null
    roomId = null
    waitRoom.hide()
    gameOver()
    // 방 대기열 요청
    sendEvent(1002);
}

// 게임 시작 
export const gameStart = () => {
    waitRoom.hide();
    import("./src/game.js").then( module => {
        game = module
    });
    gameFrame.style.display = "block"
}

// 게임 오버,끝
export const gameOver = () => {
    game = null
    gameFrame.style.display = "none"
}

/* socket.js = 웹소켓 통신*/
// 방이 파괴되었을 시 
socket.on('leaveRoom',(data) => {
  roomId = null
  exitRoom()
  socket.emit('leaveRoom',{ roomId: data.roomId })
})

/* leaveRoom을 다시 받은 서버*/
// 삭제된 방에서 일괄 나가기
socket.on('leaveRoom', (data) => socket.leave(data.roomId))
```

### 닉네임 설정

- 현재 방에 입장하면 아이디를 보여주는 것을 닉네임을 보여주는 형식으로 변경해준다!

```jsx
// 방 입장 시 서버에서 진행되는 핸들러
export const enterRoom = (userId, payload, socket) => {

    /* 검증 로직 생략 */

    let room = getRoom(userId)
    // 아이디 대신 닉네임으로 변환
    room = { ...room, userId1: getUser(room.userId1).nickname, userId2: getUser(room.userId2)?.nickname }

    // 클라이언트에겐 변환된 값을 전달하여 id 대신 닉네임이 보이도록 조절
    socket.to(room.gameId).emit('room', room)
    socket.join(room.gameId)

    return { status: "success", room }
};
```

- 또한 방의 유저값들이 업데이트 되는 부분들을 전부 수정해준다!  
( 참가자가 나갈 때 )

```jsx
// 연결이 끊기면
export const handleDisconnect = (socket, io) => {
    /* 경우의 수에 따른 로직 생략 */
    // 방에서 참가자가 떠나게 되었을 때
    left = leaveRoom(room.gameId, user.userId)
    if (left) {
        // 남아있는(호스트) 인원의 아이디를 닉네임으로 변환
        left.userId1 = getUser(left.userId1).nickname
        // 업뎃 정보 공유
        io.to(room.gameId).emit('room', left )
        // 참가자가 나갔을 시 참가자만 제외
        socket.emit('leaveRoom', { roomId: room.gameId })
        // 호스트가 나갈 시 + 오류 시 인원 전부 삭제하도록 요구
    } else io.to(room.gameId).emit('leaveRoom', { roomId: room.gameId })
}

// 나가기 또는 강퇴 당할 시
export const exitRoom = (userId, payload, socket, io) => {
    const room = leaveRoom(payload.roomId, userId)
    if (room) {
        room.userId1 = getUser(room.userId1).nickname
        // 업뎃 정보 공유
        io.to(payload.roomId).emit('room', room )
        // 참가자가 나갔을 시 참가자만 제외
        socket.emit('leaveRoom', { roomId: payload.roomId })
    // 호스트가 나갈 시 + 오류 시 인원 전부 삭제하도록 요구
    } else io.to(payload.roomId).emit('leaveRoom', { roomId: payload.roomId })

    return { status: "success" }
}
export const kickUser = (userId, payload, socket) => {
    const room = kick(payload.roomId)
    // 참가자에게 방을 나가도록 요구
    socket.to(payload.roomId).emit('leaveRoom', { roomId: payload.roomId })
    // 닉네임 변환
    room.userId1 = getUser(room.userId1).nickname
    // 업데이트된 값 적용
    socket.emit('room', { room })

    return { status: "success" }
}
```

#### 오류 발생!

- 위의 과정을 수행하다 서버의 id까지 오염되는 오류를 확인했다

- 콘솔로그를 통해 파고들어가본 결과 유저가 나갔을 때(leaveRoom 함수)가 문제인 것 같았다

```jsx
// 원래 코드
export const leaveRoom = (gameId, userId) => {
    const roomIdx = gameRooms.findIndex((e) => e.gameId === gameId)
    // 방이 서버에 있는 확인
    if (roomIdx === -1) return false
    
    // 호스트가 나갈 시 방 삭제
    if (gameRooms[roomIdx].userId1 === userId) {
        gameRooms.splice(roomIdx,1)
        return false
    // 참가자가 나갈 시 userId2를 비우고 값을 반환
    } else if (gameRooms[roomIdx].userId2 === userId) {
        gameRooms[roomIdx].userId2 = null
        return gameRooms[roomIdx]
    } else return false  
}
```

- 그래서 유심히 살펴보니 반환 값이 얕은 복사로 인해 반환된 값을 변경하면..  
**서버 세션 값 까지 변경**이 되버리는 것이다!

```jsx
// 얕은 복사 방지
return {...gameRooms[roomIdx]}
```

- 위는 오류 부분을 수정한 코드다

## 랭킹 기능 구현

- 랭킹 기능을 구현하기 전 사용자에게 표현될 인터페이스를 만들어준다!

![image](https://github.com/user-attachments/assets/0da6c9b5-ca21-4b33-8747-b49c456cef9e)

- 빨간색 부분은 유저의 정보를, 노란색 부분엔 서버에 저장된 랭킹을 불러올 수 있도록 하였다

- socket을 이용한 첫 연결 시, 유저 정보를 서버에서 읽어와 전달할 수 있도록 설계해주었다

```jsx
// 첫 연결 시 
const loginUser = await prisma.users.findUnique({ where: { id: decoded.id } });
/* 검증 로직 생략*/

//유저와 연결되면 클라이언트에게 인터페이스 용 값 전달
socket.emit('connection', [loginUser.id, loginUser.nickname, loginUser.highScoreS, loginUser.highScoreM, rooms])
```

- 원래 랭킹 기능을 더 구현할 예정이었으나 트러블 슈팅으로 인해 보류되었다

## 한줄 평 + 개선점

- 하루마다 병합을 하면서 나온 오류들을 해결하는 과정을 너무 담지 못해서 아쉬웠다

---
