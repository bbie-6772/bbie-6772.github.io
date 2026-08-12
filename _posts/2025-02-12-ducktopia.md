---
layout: post
title: Ducktopia - <7>
subtitle: 2차 구현
author: bbie
categories: Ducktopia-Project
banner:
  image: https://github.com/user-attachments/assets/e2201ed3-6804-4534-ac37-e2c9a678cddb
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [Game-Server]
---

## 프로세스 정리

- 어제 아웃 게임 및 게임 프로세스에 맞게 서버 및 통신 구조를 리팩토링하였다!

- 그 이후 서버와 클라이언트 간 필요한 정보만 주고받을 수 있도록 프로토버프 종합이 끝나,  
이와 관련된 핸들러를 수정해주어야 한다!

### 프로토버프 적용

- 현재 서버의 경우엔 2차까지 기능 구현이 대부분 맞춰졌으나, 이를 시험할 클라이언트 구현이 부족하여 이를 도와주기로 하였다!

- 기존 클라이언트 담당자 분과 협의를 하여 프로토버프 구조를 통해 패킷을 생성하고 서버에게 보내주는 부분을 담당하기로 하였다

#### 수정 부분

전달 패킷의 페이로드 구조가 바뀐 것들을 검토해가며 이름이나, 유형을 맞춰주는 작업을 하였다!

- 기존 게임프로세스 에서 호스트가 게임 시작을 누르면 관련 정보를 서버와 주고 받은 뒤, 게임이 시작되는 형식이였다

- 이 때 호스트는 몬스터와 오브젝트들을 먼저 시뮬레이션하여 관련 정보를 서버에 보내주는 기능을 추가하며 수정되었다!

```proto
message C2SGameStartRequest { // 게임시작 요청
    repeated MonsterPositionData monsters = 1;
    repeated ObjectPositionData objects = 2;
}
```

- 이를 적용 시키기 위해 Send(packet) 부분에 있는 로직들을 이용해 Packet 형태로 압축해주었다!

```c#
if (UserInfo.myInfo.id == roomData.OwnerId) //내가 반장이면 보냄.
{
    SocketManager.instance.monsterPositions.Clear();
    SocketManager.instance.objectPositions.Clear();

    GamePacket packet = new GamePacket();
    packet.GameStartRequest = new C2SGameStartRequest();
    // packet.GameStartRequest = new C2SGameStartRequest() {Monsters = new List<MonsterPositionData> ...,
    // Objects = new List<ObjectPositionData> ...}
    // 위와 같이사용하려 했으나, repeatable 필드는 직접적인 수정이 불가하여 Add 메서드를 사용해야했다..

    for (int i = 0; i < SocketManager.instance.storedMonsters.Count; i++)
    {
        int sign = (i % 2 == 0) ? 1 : -1; // 짝수 몬스터는 양쪽 대칭 배치
        packet.GameStartRequest.Monsters.Add(new MonsterPositionData
        {
            MonsterId = SocketManager.instance.storedMonsters[i].MonsterId,
            MonsterCode = SocketManager.instance.storedMonsters[i].MonsterCode,
            X = 5f * sign,
            Y = 5f * sign
        });
    }

    for (int i = 0; i < SocketManager.instance.storedObjects.Count; i++)
    {
        int sign = (i % 2 == 0) ? 1 : -1; // 짝수 오브젝트는 양쪽 대칭 배치
        packet.GameStartRequest.Objects.Add(new ObjectPositionData
        {
            ObjectId = SocketManager.instance.storedObjects[i].ObjectId,
            ObjectCode = SocketManager.instance.storedObjects[i].ObjectCode,
            X = 5f * sign,
            Y = 0f
        });
    }

    SocketManager.instance.Send(packet);
}
```

## 한줄 평 + 개선점

- 오늘은 구현 작업보다는 테스트 및 디버깅 작업을 많이 했는데, 마치고보니 대부분 오타들이나 프로토버프 필드명 불일치였다..

---
