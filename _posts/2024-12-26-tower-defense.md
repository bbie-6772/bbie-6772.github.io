---
layout: post
title: 웹소켓을 이용한 타워디펜스 - <3>
subtitle: TowerDefense
author: bbie
categories: WebSocket2
banner:
  image: https://github.com/user-attachments/assets/28a80b5a-7352-4f09-8696-07f18438677f
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [node.js, websocket]
---

## 회원가입 기능 + 클라이언트

- 회원 가입 기능 자체는 지금까지 해온 것들이 많아 그 코드들을 수정하는 방식으로 진행하였다

### 실행도

1. 유저는 회원가입할 아이디, 비밀번호, 비밀번호 확인, 유저 닉네임 정보를 기입한다

    1. ID는 영어 소문자와 숫자로만 이루어져 6~20 글자로 작성가능 하며 다른 ID와 겹치지 않아야 한다

    2. 비밀번호는 영어 소문자, 숫자, 특수기호 하나 이상 혼합하여 6자 이상으로 작성해야 한다

    3. 비밀번호 확인은 비밀번호와 똑같이 입력되어 있어야 한다

2. 서버는 유저의 요청을 검증 후 회원가입 여부를 반환한다

    1. 이 때 유저의 요청이 거부되었을 경우, 이에 대한 설명이 화면에 표시된다

3. 유저는 회원가입에 성공하여 로그인을 할 수 있게 된다

### 서버

- 정규식을 이용하여 유효성 평가를 구현하였다

```jsx
// 아이디 형식을 검증하는 정규식
// 영어 소문자로 시작해 영어 소문자 + 숫자로 된 6~20자 
const idRegex = /^[a-z]+[a-z0-9]{5,19}$/g;

const pwRegex = /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{6,}$/;
// 비밀번호가 영어 소문자, 숫자, 특수기호를 포함하고 6자 이상인지 확인하는 정규식
```

### 클라이언트

- register.html에 fetch로 API를 사용하여 정보를 사용자에게 제공할 수 있도록 설계한다

![image](https://github.com/user-attachments/assets/68f842e0-33b3-477e-9792-1b643dd03c32)

```jsx
// 백엔드 API 주소
const API_BASE_URL = 'http://localhost:3000/api'; 
// 회원가입 버튼 누를 시
document.getElementById("register").addEventListener("click", async () => {
    // 입력한 값을 가져오고
      const id = document.getElementById("username").value;
      const pw = document.getElementById("password").value;
      const pwCheck = document.getElementById("passwordCheck").value;
      const nickname = document.getElementById("nickname").value;

    try {
        // API 요청
        const response = await fetch(`${API_BASE_URL}/sign-up`, {
        // 요청 방식
        method: 'POST',
        // 헤더 타입 지정
        headers: { 'Content-Type': 'application/json' },
        // 입력 값(json)
        body: JSON.stringify({ id, pw, pwCheck, nickname }),
        });

        // 결과 확인
        const result = await response.json();
        if (response.ok) {
          alert(result.message);
          // 회원가입 성공 후 로그인창으로
          window.location.href = "login.html";
        } else {
          alert(result.errorMessage)
        }

    } catch (error) {
        alert('오류가 발생했습니다.');
        console.error(error);
    }
})
```

## 로그인 기능 + 클라이언트

- 회원가입 기능과 마찬가지로 로그인 기능도 API를 호출하여 실행한다!

- 헤더에 값을 저장해주는 로직을 추가해준다

![image](https://github.com/user-attachments/assets/3afab5fe-6911-42dc-89fe-65b2639f2435)

```jsx
// 결과 확인
    const result = await response.json();
    if (response.ok) {
        alert(result.message);
        // 로컬 스토리지에 적용  
        localStorage.setItem('access-Token', response.headers.get("authorization"));

        window.location.href = "index.html";
    } else {
        alert(result.errorMessage)
    }
```

### 서버 접속

- 게임 플레이 돌입 전, 로그인 여부를 확인하여 계정을 확인하는 과정을 넣어야 겠다

- websocket 통신 연결 시 엑세스 토큰을 보내주어 확인하게 한다

#### 클라이언트 송신

```jsx
// 로컬스토리지에서 값 가져오기
const token = localStorage.getItem("access-Token")
// 로그인이 안되어있을 시 로그인 창으로
if (!token) window.location.href = './login.html';

// localhost:3000 에 서버를 연결하여 값을 넘겨줌
const socket = io('http://localhost:3000', {
    query: {
        clientVersion: CLIENT_VERSION,
        // 엑세스 토큰을 줘서 사용자 로그인 여부 확인
        accessToken: token
    },
});
```

#### 서버 수신

- 토큰을 수신한 서버는 데이터베이스를 이용해 값을 확인!

```jsx
import { CLIENT_VERSION } from "../constant.js"
import { prisma } from "../init/prisma.js";
import jwt from "jsonwebtoken";

// 클라이언트와 연결 시 호출되는 함수
const handleConnection = async (socket) => {
    // 소켓에서 송신한 정보 추출
    const information = socket.handshake.query
    const authorization = information.accessToken
    const [tokenType, token] = authorization.split(' ');

    //클라이언트 버전 확인
    if (!CLIENT_VERSION.includes(information.clientVersion)) {
        socket.emit('response', { 
            status: "fail",
            message: "Client version not found"
        });
        return;
    }

    // token이 비어있거나(없는 경우) + tokenType이 Bearer가 아닌경우
    if (!token || tokenType !== 'Bearer') {
        socket.emit('response', {
            status: "fail",
            message: "Not a valid account"
        });
        return;
    }

    // 토큰 검증
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    //JWT 토큰에서 가져온 사용자 정보를 이용해서 데이터베이스에서 해당 사용자가 실제로 존재하는지 확인하는 작업
    const loginUser = await prisma.users.findUnique({ where: { id: decoded.id } });
    // 사용자 정보가 데이터베이스에 없는 경우
    if (!loginUser) {
        socket.emit('response', {
            status: "fail",
            message: "Can't find account. Please log-in again "
        });
        return;
    }
}
```

## 멀티 플레이 구현

- 피드백 이후 기획을 다시 설정하는 과정에서 멀티 플레이요소로 협동 게임이 좋겠다는 아이디어가 나왔다

### 진행도

1. 플레이어가 방을 생성한다

2. 또 다른 플레이어가 이에 참여한다

    1. 또는 플레이어 혼자서 게임을 시작할 수 있다

3. 게임 준비/시작 버튼을 통해 게임이 시작된다

### 설계

- 플레이어가 입장할 "방" 이라는 개념 구현화

- 방 생성 시 비밀번호 기능 추가하기

### 모델 설정

#### 유저

- 이전에 설계한 데이터들을 기준으로 생성 및 조회를 구현하였다

```jsx
let users = [];
export const addUser = (userId, nickname) => {
    // 중복 접속일 경우 추가 X
    const userIdx = users.findIndex((e) => e.userId === userId)
    if (userIdx !== -1) return

    const user =  {
        userId: userId,
        nickname: nickname,
        gold: 0,
        monsterKill: 0,
        totalDamage:0
    }
    users.push(user)
}

export const getUser = (userId) => {
    return users.find((e) => e.userId === userId)
}
```

#### 게임 룸

- 게임 룸들이 각자 고유할 수 있도록 uuid를 사용했다

```jsx
import { v4 as uuidv4 } from "uuid";

let gameRooms = [];
export const addRoom = (userId, password, timer) => {
    // 게임 방 고유 번호 생성
    const gameId = uuidv4()

    const room = {
        gameId: gameId,
        userId1: userId,
        userId2: null,
        password: password,
        score: 0,
        startTime: 0,
        monsterCount: 0,
        gameOverTimer: timer,
    }

    gameRooms.push(room)
}
```

### 방 생성 구현

- 현재 방을 만들고, 이에 참여하는 INPUT을 받기 위해 클라이언트를 대략적으로 먼저 만들려 한다

![image](https://github.com/user-attachments/assets/2e55273e-096c-4f5f-b09f-995ce65dc201)

- 일단 입력이 되도록 대략적으로 구현하였고, 이를 socket통신으로 서버에 정식으로 요청하도록 수정해준다

```jsx
// 방 생성 이벤트 핸들러  
roomCreationForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const roomName = document.getElementById('roomName').value;
    const roomType = document.getElementById('roomType').value;
    const roomPassword = passwordInput.value;

    //요청 보내기
    sendEvent(1001, { gameName: roomName, type: roomType, password: roomPassword })

    this.reset();
});
```

- 입력 받는 쪽에 핸들러를 설정해준다

```jsx
// 매핑될 핸들러
export const makeRoom = (userId, payload) => {
    if (!addRoom(userId, payload.gameName, payload.password, payload.type)) return {
            status: "fail", 
            message: "방 생성에 실패하였습니다."
        }
    
    return { status: "success" }
};

// gameRoom 의 설정 함수
export const addRoom = (userId, gameName, password, difficult) => {
    try {
        // 게임 방 고유 번호 생성
        const gameId = uuidv4()
        // 게임 오버 시간 난이도별 설정
        const timer = {
            1: 50,
            2: 30,
            3: 15,
            4: 5
        }
        // 게임 스테이지 기본 스탯 설정
        const room = {
            gameId: gameId,
            gameName: gameName,
            userId1: userId,
            userId2: null,
            difficult: difficult,
            password: password,
            score: 0,
            startTime: 0,
            monsterCount: 0,
            gameOverTimer: timer[difficult],
        }
        // 서버에 저장
        gameRooms.push(room)
        return true 
    } catch (err) {
        console.log(err)
        return false
    }
}
```

- 이제 방 생성이 완료되었을 때 게임을 시작할 수 잇도록 클라이언트에서 설정해준다

```jsx
socket.on("response", (data) => {
    // 실패한 경우 오류 메시지 출력
    if (data?.status === "fail") return alert(data.message)
    // 방 생성 핸들러 아이디가 인식될 시
    if ( data[0] === 1001 ) {
        // 방 생성 성공 시 게임 페이지로 이동
        window.location.href = "game.html";
    }
})
```

### 방 목록 받아오기

- 생성된 방 목록들을 서버에서 받아서 변환해주기!

```jsx
import { updateRooms } from "../../lobby.js"
socket.on("response", (data) => {
    // 방 로딩 핸들러를 인식해서 방목록 업데이트
    if (data[0] === 1002) {
        updateRooms(data[1].rooms)
    }
})

// lobby.js
export const updateRooms = (roomsInfo) => {
    rooms = []
    roomsInfo.forEach((e) => rooms.push({
        id: e.gameId,
        name: e.gameName,
        type: e.difficult,
        password: e.password ? true : false
    }))
    //방 목록을 사용자에게 보여주기
    renderRooms()
}
```

## 한줄 평 + 개선점

- 아직 추가로 구현해야할 기능은 많은데 쓸데없는 곳에서 삽질하는 느낌이라 아쉽다  
( 특히 클라이언트 부분에서 함수 배치를 잘못해서 한번 클릭에 무한회로가 돌아간 것.. )

---
