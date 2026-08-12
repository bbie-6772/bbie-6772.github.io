---
layout: post
title: 멀티타워디펜스 - < 7 >
subtitle: 프로젝트 마무리
author: bbie
categories: Multi-TowerDefense-Project
banner:
  image: https://github.com/user-attachments/assets/2403c1b6-7704-4ded-9562-204c27aa6ed2
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [Game-Server, Tower-Defense, Multiplayer]
---

## 마무리

오늘은 프로젝트의 완성도를 높일 수 있도록 최적화를 해가는 작업을 실시했다.

### notify 함수 설정

기존 sendNotification 메서드를 통해 room 내의 player들에게 패킷을 만들어 보내주었다!  
하지만 패킷을 만드는 일은 핸들러가 하는게 구조상 알맞은 것 같아 수정을 하였다!

```jsx
// Room 내부 메서드
/* 플레이어들에게 패킷 보내기 */
notify(infos) {
  for (const info of infos) {
    this.getPlayer(info.id).user.sendPacket(info.packetType, info.payload);
  }
}

// 핸들러에서 만들어주어서 보내도록 변경
const data = [
  {
    id: user.id,
    packetType: packetType.spawnMonsterResponse,
    payload: { monsterId, monsterNumber },
  },
  {
    id: player.opponentId,
    packetType: packetType.spawnEnemyMonsterNotification,
    payload: { monsterId, monsterNumber },
  },
];
// [8] 보냄
room.notify(data);
```

### loginQueue

더미 클라이언트를 이용한 로그인 과정에서 중복로그인 이슈가 생겨,  
이를 해결하기 위한 방법으로 로그인 대기열을 구현하기로 하였다

## 한줄 평 + 개선점

- 어라라라 오늘 끝이 안낫자낭~ ㅎㅎ;

---
