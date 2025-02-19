---
layout: post
title: Ducktopia - <11>
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

어제 기획을 마친 도식화를 토대로 게이트웨이 서버를 만들어주기 시작하였다!

### Gateway 서버 구조

이제 클라이언트와 Gateway 서버를 제외한 다른 서버(로비, 게임)와는 저번에 말햇듯이 무상태(Stateless) 가 되어  
Gateway 가 클라이언트에게 받은 패킷을 다른서버로 줄때 UserId를 넣어 유저들을 구분할 수 있도록,  

서버끼리의 패킷 구조를 아래와 같이 추가하였다!

![Image](https://github.com/user-attachments/assets/add2199b-1fc4-4a06-ae5f-58120652074c)

이 때 문득  
*"서버간 UserId를 주고받으려면, 다른 서버에게 주려는 유저는 무조건 로그인이 되어 있어야 하지 않나..?"*  
라고 생각이 들어 Gateway 서버에 로그인/회원가입 기능을 병합해도 괜찮은가 조언을 구하러 떠났다.

#### 조언 구하기

현재 캠프는 마지막 프로젝트에서 편성된 팀에 담당 튜터님이 배정되어 있다.  
그래서 담당 튜터님께 이러한 상황 설명해 드리고 질문을 드렸다!

![구조](https://github.com/user-attachments/assets/ae4c3db2-0be7-44b4-ba30-587b47baeabb)

그래서 알게된 사실들은 보통 Gateway 서버 앞 단에 로드밸런서를 두어 Gateway의 증설이 더 중요할 때가 많고,  
보통은 로그인 서버를 두어 로그인 성공이 된 이후 Gateway 서버에 연결되도록 하고 Gateway는 입출력만 담당하는게 FM이라고 하셨다.  

그러나 여러 프로젝트에서 구현, 구조적 편의성을 위해 Gateway 서버에 여러 기능을 붙이는 상황도 있다고 말씀해주셨다.  
또한 현재 분산서버를 구현하는게 더 중요하기 때문에 로그인/회원가입 기능을 Gateway 서버에 붙이는 것도 나쁘지 않다는 의견을 주셨다.  

#### Gateway 서버 구현

현재는 로드밸런서나 추가적인 증설없이 기능만을 분리한 서버를 먼저 구현 해보기 위해,  
최대한 단순한 구조로 구현하는걸 목표로 시작하였다!

1. 로비 서버와 게임 서버에 TCP 연결을 형성해준다!

    ```jsx
    // 형성한 TCP 연결은 serverSession에 의해 관리된다!
    const connectToLobbyServer = () => {
      const lobbyServer = net.createConnection({ host: '127.0.0.1', port: 5557 }, () => {
        console.log('로비서버와 연결되었습니다.');
        // 로비 서버에 알맞는 event 함수들을 매핑해준다
        onLobbyConnection(lobbyServer);
      });

      serverSession.addServer(config.server.lobbyServer, lobbyServer);
    };

    const connectToGameServer = () => {
      const gameServer = net.createConnection({ host: '127.0.0.1', port: 5558 }, () => {
        console.log('게임서버와 연결되었습니다.');
        // 게임 서버에 알맞는 event 함수들을 매핑해준다
        onGameConnection(gameServer);
      });

      serverSession.addServer(config.server.gameServer, gameServer);
    };
    ```

2. 들어오는 입출력(I/O)들을 핸들러 매핑을 통해 서버에 연결해준다

    ```jsx
    //onData 의 일부 packetType에 따라 핸들러를 매핑하고 protobuf 디코딩 후 실행
    const handler = handlers[packetType];
    const gamePacket = proto.decode(payloadBuffer);
    const payload = gamePacket[gamePacket.payload];

    await handler({ socket, payload, packetType });
    ```

    위와 같이 onData의 핸들러 매핑에 도움을 주는 handlers는 아래와 같다

    ```jsx
    import { config } from '../config/config.js';
    import signInHandler from './user/signIn.handler.js';
    import signUpHandler from './user/signUp.handler.js';
    import onLobbyServerHandler from './server/onLobbyServer.handler.js';
    import onGameServerHandler from './server/onGameServer.handler.js';
    // config에 지정된 packetType에 따라 함수들을 지정해준다
    const handlers = {
      [config.packetType.REGISTER_REQUEST[0]]: signUpHandler,
      [config.packetType.LOGIN_REQUEST[0]]: signInHandler,
      [config.packetType.C_PLAYER_ATTACK_REQUEST[0]]: onLobbyServerHandler,
      [config.packetType.CREATE_ROOM_REQUEST[0]]: onLobbyServerHandler,
      [config.packetType.GET_ROOM_LIST_REQUEST[0]]: onLobbyServerHandler,
      [config.packetType.JOIN_ROOM_REQUEST[0]]: onLobbyServerHandler,
      [config.packetType.LEAVE_ROOM_REQUEST[0]]: onLobbyServerHandler,
      [config.packetType.PREPARE_GAME_REQUEST[0]]: onLobbyServerHandler,
      [config.packetType.START_GAME_REQUEST[0]]: onGameServerHandler,
      [config.packetType.C_PLAYER_POSITION_UPDATE_REQUEST[0]]: onGameServerHandler,
      [config.packetType.C_PLAYER_ATTACK_MONSTER_REQUEST[0]]: onGameServerHandler,
      [config.packetType.C_MONSTER_SPAWN_RESPONSE[0]]: onGameServerHandler,
      [config.packetType.C_MONSTER_ATTACK_REQUEST[0]]: onGameServerHandler,
      [config.packetType.C_MONSTER_MOVE_REQUEST[0]]: onGameServerHandler,
      [config.packetType.C_PLAYER_USE_ITEM_REQUEST[0]]: onGameServerHandler,
      [config.packetType.S_PLAYER_DAMAGED_BY_MONSTER[0]]: onGameServerHandler,
    };

    export default handlers;
    ```

3. 서버에 따라 간단한 검증 후 (헤더에 UserId가 있는)새로운 패킷을 생성해 보내준다!

    ```jsx
    //예시를 위해 게임 서버 핸들러를 가져왔다
    import makeServerPacket from '../../utils/packet/makeServerPacket.js';

    const onGameServerHandler = ({ socket, payload }) => {
      // 유저 객체 조회
      const user = userSession.getUser(socket.id);
      // 유저가 존재하지 않거나 user.id(로그인 정보)가 없을 땐 접근이 불가하도록 설정
      if (!user || !user.id) {
        throw new CustomError('유저 정보가 없습니다.');
      }

      // 유저의 게임진행 여부 확인
      if (!user.getGameState()) {
        throw new CustomError(`올바르지 못한 요청입니다. (USER ID: ${user.id})`);
      }

      //packetType을 이용해 packet을 만들기 위한 packetInfo을 가져옴
      const packetInfo = Object.values(config.packetType).find(([type, name]) => type === packetType);

      const packet = makeServerPacket(packetInfo, payload, user.id);

      // 게임 서버를 serverSession에서 찾아 패킷을 전송
      const gameSocket = serverSession.getServerById(config.server.gameServer);
      gameSocket.write(packet);
    };

    export default onGameServerHandler;
    ```

4. 일부 패킷을 이용해 유저 상태 동기화

    이제 유저의 게임진행 여부를 동기화 하기 위해 packet 중에 게임시작을 알리는 response를 로비서버에서 받으면,  
    이를 인식해서 게임진행 여부를 업데이트 해주는 로직을 로비 서버 onData에 구현하였다.

    ```jsx
    // continue는 현재 while 문 내부이기에 {함수 내부 return}과 같이 현재 작업을 마친다는 역할을 한다.
    const user = userSession.getUserByID(+userId);
    if (!user) continue;

    if (packetType === config.packetType.PREPARE_GAME_RESPONSE[0]) {
      // 게임 상태 동기화
      for (const { name, userId: tempId } of payload.room.users) {
        const tempUser = userSession.getUserByID(tempId);
        tempUser.setGameState(payload.success);
      }

      if (payload.success) {
        // 게임 서버 패킷 전달
        const serverPayload = { room: payload.room };
        const reqPacket = makeServerPacket(
          config.packetType.JOIN_SERVER_REQUEST,
          serverPayload,
          user.id,
        );

        const gameServerSocket = serverSession.getServerById(config.server.gameServer);
        gameServerSocket.write(reqPacket);
      } else {
        throw CustomError('게임 시작 요청이 실패했습니다.');
      }
      continue;
    }

    // 클라이언트 패킷 전달
    const packetInfo = Object.values(config.packetType).find(
      ([type, name]) => type === packetType,
    );

    // 클라이언트용 packet 
    const resPacket = makePacket(packetInfo, payload);
    user.socket.write(resPacket);
    ```

위와 같은 기능들을 구현하여 다른 서버와 연결을 통해 필요한 정보를 특정 패킷에서 가져와 저장한다거나 동기화해주고,  
패킷을 클라이언트에게 전달하거나 다른 서버에게 전달해주는 역할을 한다

## 한줄 평 + 개선점

- 오늘은 진행방향에 대해 오전부터 고민을 해보며 조언을 듣고 시작했기에, 조금 더 일이 잘 풀린 것 같아서 좋았다.

---
