---
layout: post
title: 웹소켓을 이용한 타워디펜스 - <4>
subtitle: TowerDefense
author: bbie
categories: WebSocket2
banner:
  image: https://github.com/user-attachments/assets/28a80b5a-7352-4f09-8696-07f18438677f
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [Node.js, WebSocket, Game-Server]
---

## 대기 방 구현

- 어제 마지막 회의로 방에 들어가면 대기하는 공간을 구현하기로 하였다

![image](https://github.com/user-attachments/assets/1c0ed50d-30e5-452c-a5bb-ceb38b6b40dd)

### 클라이언트 디자인

- 부트 스트랩을 이용해 대략적으로 구현하였다

![image](https://github.com/user-attachments/assets/e849aeaf-edf9-4d23-b6bd-bce7e5f1d91f)

### 기능 결합

- 기존 방 생성 시 게임이 시작되게 설정하였는데 이를, 서버에 요청하여 대기방으로 이동하도록 변경한다

```jsx
// socket.js < 통신을 관리하는 파일 >
socket.on("response", (data) => {
    console.log(data)

    if (data?.status === "fail") return alert(data.message)
    // 방 생성 핸들러 인식 시 
    if (data[0] === 1001 ) {
        // 방 생성 성공 시 room 페이지로 이동
        window.location.href = "room.html";
    }   
})
```

- 하지만 이동만하고 자신의 닉네임이나 방 정보를 불러오지 못하는 점이 문제다!

- js 파일을 분리해 표시되는 값을 동적으로 바꿔주는 함수를 만들어야 겠다!

#### 입장 초기화

- 입장 시 방에서 표시해야되는 정보들을 서버에서 반환해주어 이를 토대로 동적으로 표시해줄 수 있도록 해야겠다!

- 일단 서버에서 방 입장(생성 포함)을 요청 받으면, 서버에서 방을 생성 후 값들을 다시 반환시켜 주어야 겠다!

```jsx
// userId를 가지고 방 정보를 가져와주는 함수
import { getRoom } from "../models/gameRoom.model.js";

export const enterRoom = (userId, payload) => {

    /* 방 생성 및 참여 성공 여부 검증*/

    return { status: "success", room: getRoom(userId) }
};
```

- 이제 이 값들을 이용해서 화면 내용을 바꿔주는 함수를 생성해준다

```jsx
// room.js
// 방 업데이트 함수  
export const updateRoomInfo = (roomInfo) => {
    // 방 정보 업데이트
    const name = document.createElement('div')
    name.innerText = roomInfo.gameName
    const type = document.createElement('div')
    type.innerText = roomInfo.difficult
    const password = document.createElement('div')
    password.innerText = roomInfo.password

    name.append(roomName);
    type.append(roomType);
    password.append(roomPassword);
}

// 유저 업데이트 함수
export const updateUser = (roomInfo) => {
    host.innerText = roomInfo.userId1
    entry.innerText = roomInfo.userId2
}
```

- 이러한 함수를 이용해 socket에서 방 참여를 확인하여 이동 후 업데이트 하도록 만든다

```jsx
// 함수 가져오기
import { updateRoomInfo, updateUser } from "../../room.js";

socket.on("response", (data) => {
    console.log(data)

    if (data?.status === "fail") return alert(data.message)
    // 방 생성 핸들러 인식 시 
    if (data[0] === 1001 ) {
        // 방 생성 성공 시 room 페이지로 이동
        window.location.href = "room.html";
        // 값 업데이트
        updateRoomInfo(data[1].room)
        updateUser(data[1].room)
    }   
})
```

- 사실 여기서 문제가 터졌다

#### 문제 발견 및 재설계

1. 현재 서버에서 입력이 오면 window.location.href 로 room 파일로 이동한다!

2. room.js에서 가져온 함수를 통해 room 데이터를 업데이트 해준다!

- 여기서 문제가 생긴다 socket.js에서 참조한 room.js는 room.html에 사용되는 그 놈이 아닌 것이다!

- 같은 파일이지만 다른 객체이므로 데이터가 업데이트되지 않는다..  
(socket.js에서 임포트한 **room.js의 함수** 하고 window.location.href로 부른 **room.html** 은 전혀 무관계 하다는 것이다!)

- 이후 window.location.href를 사용하면 socket.js가 초기화된 후  
새롭게 임포트되어 새로 접속을 해줘야하는 답이 없는 상황을 겪게 되었다.

- 그래서 대기방 을 모달 형식으로 띄워주는 것으로 변경하였다

![image](https://github.com/user-attachments/assets/36c1a1f5-e4fe-49a3-a2f4-cff46edaabe2)

- 모달이 실수로 꺼지지 않도록 설정을 추가 해준다!

```jsx
 waitRoom = new bootstrap.Modal(document.getElementById('waitRoom'), {
        // 외부 창을 클릭해도 꺼지지 않도록 설정
        backdrop: 'static',
        // 키보드 esc를 눌러도 꺼지지 않도록 설정
        keyboard: false  
    });
```

#### sendEvent 동기화 작업

- sendEvent 를 쓰는 경우 서버에 요청을 하고, 받은 답을 통해 클라이언트에게 표시한다

- 근데 이게 비동기로 이루어져 작업이 이상해지는 경우가 많아 동기화 시킬 수 있도록 만들어 주었다!

```jsx
export const sendEvent = async (handlerId, payload) => {

    const log = await new Promise((resolve, reject) => {
        socket.emit('event', {
            userId,
            token,
            handlerId,
            clientVersion: CLIENT_VERSION,
            payload
        });

        socket.once('response', (data) => {
            if (data[1]?.status === "fail") {
                alert(data[1].message)
                return resolve(false)
            }
            // 방 입장 핸들러
            if (data[0] === 1001) {
                updateRoomInfo(data[1].room)
                updateUser(data[1].room)
            }
            // 방 로딩 핸들러
            if (data[0] === 1002) {
                updateRooms(data[1].rooms)
            }
            return resolve(true)
        })

        setTimeout(reject,2000)
    })
    return log
};
```

#### 방 동기화

- 방에 입장하면 입장한 사람들끼리만 이용할 수 있는 웹소켓의 "방" 개념을 이용해야겠다

```jsx
// 방 입장 핸들러(서버)
export const enterRoom = (userId, payload, socket) => {
    /* 방 참여 성공 여부 검증(생략) */
    
    // 필요없는 값 삭제
    let room = getRoom(userId)
    delete room.score
    delete room.startTime
    delete room.monsterCount
    delete room.gameOverTimer

    // 성공 시 유저를 roomId(UUIDv4)에 연결시킴 
    socket.join(payload.roomId)

    return { status: "success", room: room }
};
```

## 한줄 평 + 개선점

- 오늘도 끝까지 알차게 작업을 마치고 머지까지 성공했다!

- 다음 주 월요일엔 데모버전을 플레이할 수 있도록 노력해야겠다!

---
