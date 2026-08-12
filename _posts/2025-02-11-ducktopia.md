---
layout: post
title: Ducktopia - <6>
subtitle: 2차 구현
author: bbie
categories: Ducktopia-Project
banner:
  image: https://github.com/user-attachments/assets/e2201ed3-6804-4534-ac37-e2c9a678cddb
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [Refactoring, Game-Server]
---

## 2차 구현

배정받은 역할인 코어 클래스 구현( 본진 및 게임오버 조건 )을 시작한다!

### 코어 구현

게임 내 맵 중심에 있어 몬스터에 의해 공격을 받아 게임오버 트리거가 되는 "코어"와 "코어 관련 통신" 기능을 만든다!

#### 서버의 코어

- 코어의 기능은 위치와 hp만 가지고 피격을 검증하는 것이다.

- 그렇기에 게임당 코어가 1개인 점을 생각하여 Game Class에 core를 관리할 수 있는 메서드와 필드를 정의해준다!

```jsx
class Game {
  constructor() {
    this.coreHp = config.game.core.maxHP;
    this.corePosition = config.game.core.position;
  }

  coreDamaged(damage) {
    this.coreHp -= damage;
    if (this.coreHp <= 0) {
      this.gameEnd();
    }
    return this.coreHp
  }

  gameEnd() {
    clearInterval(this.gameLoop);
    this.gameLoop = null;
    this.broadcast(makePacket(PACKET_TYPE.GAME_END_NOTIFICATION));
  }
}
```

- 추가로 몬스터가 공격할 때, 피격판정 후 core가 Damage를 받은 경우에 이 메서드를 사용하면 된다!

- 이 부분은 몬스터 공격 로직 작업을 하시는 분이 따로 있기에 나중에 연결하기로 하였다.

### 구조 리팩토링

현재 구조 정리가 제대로 되지 않은 부분들이 꽤나 있어, 이들을 연결해주고 중복된 값들을 정리해주는 임시 리팩토링 과정을 진행할 예정이다!

#### config(환경변수 및 상수) 관리

config에 환경변수나 상수를 관리하여 config로 단일화 되어 반환을 받는 대신 환경변수를 직접 끌어오는 로직들을 전부 수정해주었다!

```jsx
export const config = {
  /* 중략 */
  // game 내부의 요소들을 따로 관리하던걸 다 넣어 config에서 뽑을 수 있도록 수정해주었다!
  game : {
    core: {
      maxHP: CORE_MAX_HP,
      position: CORE_POSITION,
    },
    player:{
      atkPerLv: ATK_PER_LV,
      playerMaxHunger: PLAYER_MAX_HUNGER,
      playerDefaultRange: PLAYER_DEFAULT_RANGE,
      playerDefaultAngle: PLAYER_DEFAULT_ANGLE,
      playerMaxHealth: PLAYER_MAX_HP,
      playerSpeed: PLAYER_SPEED,
      validDistance: VALID_DISTANCE,
    },
    monster:{
      maxItemDropCount: MAX_DROP_ITEM_COUNT,
      maxSpawnCount: MAX_SPAWN_COUNT,
    },
    map: {
      startX: MIN_VALUE_X,
      startY: MIN_VALUE_Y,
      endX: MAX_VALUE_X,
      endY: MAX_VALUE_Y,
    }
  }
};
```

## 한줄 평 + 개선점

- 한 건 많은데 정리를 차곡차곡하기 너무 어려웠다..

---
