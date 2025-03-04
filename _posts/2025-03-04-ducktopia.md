---
layout: post
title: Ducktopia - <20>
subtitle: 다시 작업
author: bbie
categories: Ducktopia-Project
banner:
  image: https://github.com/user-attachments/assets/e2201ed3-6804-4534-ac37-e2c9a678cddb
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: []
---

## 추가 작업

- 파괴 가능한 오브젝트의 설치 및 종류들을 만드는 작업을 맡게되었다.

### 설치

- 기본적으로 파괴 가능한 오브젝트를 벽 이라고 정해두어 기존에 있는 base를 상속받아 생성해준다

```jsx
import DestructibleObjectBase from '../base/destructibleObjectBase.class.js';
import { getGameAssets } from '../../init/assets.js';

class Wall extends DestructibleObjectBase {
    const { objectDropTable }= getGameAssets()
    constructor(id, objectCode, x, y) {
        const { name, maxHp } = objectDropTable.data.find((e) => e.objectCode === objectCode);
        super(id, objectCode, name, maxHp, x, y);
    }

}

export default Wall;
```

이제 이 벽을 게임에서 오브젝트를 생성해주는 메서드에 추가해준다

```jsx
  createObject(name, objectCode = null, x = null, y = null) {
    switch (name) {
      case "wall": {
        const id = this.itemManager.createObjectId();
        const wall = new Wall(id, objectCode, x, y);
        const data = {
          ObjectData: { objectId: id, objectCode },
          position: { x, y }
        };
        this.objects.set(id, wall)
        return data;
      }
      default:
        break;
    }
  }
```

- 아이템 설치 시, 클라이언트가 서버에게 주는 값들을 확인해 로직을 구현해준다

```proto
<!-- 클라이언트에게서 받는 값 -->

message C2SPlayerSetObjectRequest { //2025-03-03 추가// 설치 아이템 일때.
  int32 itemCode = 1; // 
  Position position =2;
}

<!-- 클라이언트에게 주는 값 -->

message S2CPlayerSetObjectResponse { //2025-03-03 추가// 설치 아이템 일때.
  bool success = 1;
  int32 itemCode = 2; 
  int32 playerId = 3;
}

message S2CObjectSetNotification { //2025-03-03 추가 // 건물 설치
  // objectId + objectCode
  ObjectData ObjectData = 1;
  Position position = 2;
}
```

- 완성된 핸들러

```jsx
const objectMountHandler = async ({ socket, payload, userId }) => {
    const { itemCode, position } = payload;
    const { objects, objectDropTable }= getGameAssets()

    const user = userSession.getUser(userId);
    if (!user) throw new CustomError(`User ID : (${userId}): 유저 정보가 없습니다.`);

    const player = user.player

    const game = gameSession.getGame(user.getGameId());
    if (!game) throw new CustomError(`Game ID : (${user.getGameId()}): Game 정보가 없습니다.`);

    const itemIndex = player.findItemIndex(itemCode);
    if (itemIndex === -1) throw new CustomError('아이템을 찾을 수 없습니다.');

    const item = player.inventory[itemIndex];
    const objectCode = objects.data.find((e) => e.code === itemCode).object
    if (objectCode === -1) throw new CustomError('잘못된 사용 입니다.');
    
    // 아이템 개수 감소
    player.removeItem(item.itemCode, 1);
    const payload1 = {
        success: true,
        itemCode,
        playerId: userId,
    }
    const playerSetObjectResponse = [
        config.packetType.S_PLAYER_SET_OBJECT_RESPONSE,
        payload1,
    ];
    game.broadcast(playerSetObjectResponse);

    // 오브젝트 설치
    const payload2 = game.createObject("wall", objectCode, position.x, position.y)
    const objectSetNotification = [
        config.packetType.S_OBJECT_SET_NOTIFICATION,
        payload2,
    ];
    game.broadcast(objectSetNotification);
};
```

### 파괴

- 현재 존재하는 monster에 의한 오브젝트 데미지 핸들러들을 수정해줄 예정이다

```jsx
  switch (objectId) {
    // 기존 코어 피격
    case 1:
      const coreHp = game.coreDamaged(monster.getAttack());
      console.log(`코어가 ${monster.getAttack()}의 데미지를 받았습니다! HP: ${coreHp}`);
      sendPayload = { objectId: objectId, hp: coreHp };
      break;
    // 그 외 오브젝트 피격 구현
    default:
      const objectHp = object.changeObjectHp(monster.getAttack())
      sendPayload = { objectId: objectId, hp: objectHp }
      if (objectHp > 0) break
      const objectDestroyNotification = [config.packetType.S_OBJECT_DESTROY_NOTIFICATION, {objectId}];
      game.broadcast(objectDestroyNotification);
      return;
  }

  const objectHpUpdateNotification = [
    config.packetType.S_OBJECT_HP_UPDATE_NOTIFICATION,
    sendPayload,
  ];
  game.broadcast(objectHpUpdateNotification);
```

## 한줄 평 + 개선점

- 디버깅 과정에서 구현한 기능과 관련한 여러 버그들을 찾았지만 ,결국은 잘 해결해서 기분이 좋다!

---
