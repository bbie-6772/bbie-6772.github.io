---
layout: post
title: 웹소켓을 이용한 타워디펜스 - <5>
subtitle: TowerDefense
author: bbie
categories: WebSocket2
banner:
  image: https://github.com/user-attachments/assets/305f33cb-2c72-4636-ab9b-b001a718e0ff
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [Node.js]
---

## 방 기능

### 준비/시작 기능

- 현재 방에 입장해 두 명이 준비되면 게임이 시작될 수 있도록 수정해야겠다

```jsx
/*클라이언트*/
// 준비완료/취소 보내기
export const ready = (roomId) => {
    socket.emit("ready", {
        userId,
        token,
        handlerId,
        clientVersion: CLIENT_VERSION,
        roomId
    })
}
```

- 서버에서도 이를 확인하여 값을 전달!

```jsx
/*서버*/
// 방 상태 확인
export const gameReady = (gameId, userId) => {
    const roomIdx = gameRooms.findIndex((e) => e.gameId === gameId)
    // 방이 서버에 있는 확인
    if (roomIdx === -1) return false

   // 참가자가 준비완료/취소 했을 경우
    if (gameRooms[roomIdx].userId2 === userId) {
        gameRooms[roomIdx].ready = !gameRooms[roomIdx].ready
        return "ready"
    // 호스트의 시작이 성공했을 경우
    } else if (gameRooms[roomIdx].userId1 === userId && gameRooms[roomIdx].ready) return "start"

    return "notReady"
}
// 방 상태에 따라 준비상태 반환
export const ready = (socket, data) => {
    // 기본 검증
    if (!Auth(data)) return

    const status = gameReady(data.roomId, data.userId)
    
    switch (status) {
        case false:
            socket.emit('ready', {
                status: "fail",
                message: "Room not found"
            })
            return
        case "ready":
            socket.emit('ready', {
                status: "ready",
                message: "Ready to go"
            })
            return
        case "notReady":
            socket.to(data.roomId).emit('ready', {
                status: "fail",
                message: "Not all players are ready"
            })
            return
        case "start":
            socket.to(data.roomId).emit('ready', {
                status: "start",
                message: "The game starts"
            })
            return
        default:
            socket.emit('ready', {
                status: "fail",
                message: "Error"
            })
            return;
    }
} 
```

- 받아온 값이 시작이면 화면에 게임을 불러오도록 설정!

```jsx
/* 클라이언트 socket.js*/
socket.on("ready", (data) => {
    alert(data.message)
    if (data.status === "start") gameStart ()
})
/* 클라이언트 lobby.js*/
export const gameStart = () => {
    waitRoom.hide()
    // 원래는 game.html 을 불러오는 형식이였지만, 
    // js 세션 유지를 위해 game.js를 불러와 실행하도록 바꾸었다
    import("./src/game.js")
    gameFrame.style.display = "block"
}
```

### 나가기 기능

- 방을 나가면 방에서 제외되며 호스트가 나가면 방이 폭파되도록 설계한다!

```jsx
// 클라이언트의 나가기 이벤트
exitButton.addEventListener('click', function () {
    await sendEvent(1003, {roomId})
});
// 서버에서 매칭되는 함수
export const exitRoom = (userId, payload, socket, io) => {
    const room = leaveRoom(payload.roomId, userId)
    if (room) {
        // 업뎃 정보 공유
        socket.to(payload.roomId).emit('room', { room })
        // 참가자가 나갔을 시 참가자만 제외
        socket.leave(payload.roomId)
    // 호스트가 나갈 시 인원 전부 삭제하도록 요구
    } else io.to(payload.roomId).emit('leaveRoom', { roomId: payload.roomId })

    return { status: "success" }
}
// 내부 함수
export const leaveRoom = (gameId, userId) => {
    const roomIdx = gameRooms.findIndex((e) => e.gameId === gameId)
    // 방이 서버에 있는 확인
    if (roomIdx === -1) return false
    // 호스트가 나갈 시 방 삭제
    if (gameRooms[roomIdx].userId1 === userId) {
        gameRooms.splice(roomIdx,1)
    // 참가자가 나갈 시 userId2를 비움
    } else if (gameRooms[roomIdx].userId2 === userId) {
        gameRooms[roomIdx].userId2 = null
    } else return false 
    // 나가는게 성공적으로 마쳐지면 방 정보를 반환
    return gameRooms[roomIdx]
}
```

- leaveRoom 채널을 이용해 서버에서 join()된 roomId를 초기화 해준다

```jsx
// 클라이언트에서 이 파괴되었을 시 
socket.on('leaveRoom',(data) => {
  // 클라이언트에서 사용자에게 보여지는 부분을 조정
  exitRoom()
  // 방 ID를 재전달하여 참가 방을 떠나게 함 
  socket.emit('leaveRoom',{ roomId: data.roomId })
})
// 서버에서 적용되는 곳
// 삭제된 방에서 일괄 나가기
socket.on('leaveRoom', (data) => socket.leave(data.roomId))
```

### 강퇴 기능

- 기존에 만든 나가기 기능을 응용하여 간단하게 구현하였다

```jsx
// 서버에서 요청을 받을 시 일어나는 상황
export const kickUser = (userId, payload, socket) => {
    const room = kick(payload.roomId)
    // 참가자에게 방을 나가도록 요구
    socket.to(payload.roomId).emit('leaveRoom', { roomId: payload.roomId })
    // 업데이트된 값 적용
    socket.emit('room', { room })

    return { status: "success" }
}
export const kick = (gameId) => {
    const roomIdx = gameRooms.findIndex((e) => e.gameId === gameId)
    // 방이 서버에 있는 확인
    if (roomIdx === -1) return false
    // 서버에서 유저(참가자) 삭제
    gameRooms[roomIdx].userId2 = null
    
    return gameRooms[roomIdx]
}
```

## 한줄 평 + 개선점

- 오늘 주로 진행된 과정은 개인적 부분보다 팀 프로젝트적 부분이 많았다.

- 병합하는 과정에서 발생한 오류들을 수정하며 원인분석을 많이 했었는데 이를 제대로 기록하지 못해서 아쉬웠다

---
