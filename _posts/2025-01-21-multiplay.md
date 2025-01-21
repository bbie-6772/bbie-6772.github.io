---
layout: post
title: 멀티타워디펜스 - < 2 >
subtitle: 프로젝트 계획
author: bbie
categories: Multi-TowerDefense-Project
banner:
  image: https://github.com/user-attachments/assets/2403c1b6-7704-4ded-9562-204c27aa6ed2
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: []
---

## 분업 시작

### 베이스 분업

- 공통으로 필요한 부분(베이스)을 먼저 분업하여 1차적으로 프로젝트 구조를 설계하기로 하였다

#### Class 구조 설계

클라이언트에서 받은 정보와 이를 이용해 **검증을 하는데 필요한 정보들을*** class로 정리해준다!  

1. Base class

    디펜스 게임 내 플레이어의 본체로 체력이 다하면 게임오버가 된다!

    - 관련 Payload 구조 분석

    ```ini
    # 게임 시작 전 서버가 클라이언트에게 전달해주는 정보
    message S2CMatchStartNotification {
      InitialGameState initialGameState = 1;
      GameState playerData = 2;
      GameState opponentData = 3;
    }

    # 공통 게임 초기값
    message InitialGameState {
      # base 체력
      int32 baseHp = 1;
      int32 towerCost = 2;
      int32 initialGold = 3;
      int32 monsterSpawnInterval = 4;
    }
    
    # 플레이어당 게임 초기 정보
    message GameState {
      int32 gold = 1;
      # 플레이어 base 정보
      BaseData base = 2;
      int32 highScore = 3;
      repeated TowerData towers = 4;
      repeated MonsterData monsters = 5;
      int32 monsterLevel = 6;
      int32 score = 7;
      repeated Position monsterPath = 8;
      Position basePosition = 9;
    }

    # 위에서 사용되는 BaseData
    message BaseData {
      int32 hp = 1;
      int32 maxHp = 2;
    }

    # 실시간 동기화 정보
    message S2CStateSyncNotification {
      int32 userGold = 1;
      # 베이스 현재 체력
      int32 baseHp = 2;
      int32 monsterLevel = 3; 
      int32 score = 4;
      repeated TowerData towers = 5;
      repeated MonsterData monsters = 6;
    }

    # base 체력 업데이트
    message S2CUpdateBaseHPNotification {
      bool isOpponent = 1; // HP를 업데이트 할 기지가 상대방 기지라면 true
      int32 baseHp = 2;
    }
    ```

    - 위의 구조를 보면 필요한 정보는 최대체력과 현재 체력 뿐이다!

    - 그렇다면 체력을 조절해주는 메서드와 게임오버를 알려주는 구조만 설계하면 될 것이다!

    ```jsx
    class Base {
      constructor(maxHp) {
        this.gameOver = false;
        this.maxHp = maxHp;
        this.hp = maxHp;
      }

      damaged(damage) {
        if (this.hp - damage > 0) this.hp -= monster.atk;
        else this.gameOver = true;
      }

      getHp() {
        return this.hp
      }
    }

    export default Base;
    ```

2. Tower class

    베이스로 몰려오는 몬스터들을 무찌르는 역할로 정해진 스탯이 asset 폴더에 저장되어 있다!

    - 관련 payload 구조 분석

    ```ini
    # 게임 시작 전 서버가 클라이언트에게 전달해주는 정보
    message S2CMatchStartNotification {
      InitialGameState initialGameState = 1;
      GameState playerData = 2;
      GameState opponentData = 3;
    }

    # 공통 게임 초기값
    message InitialGameState {
      int32 baseHp = 1;
      # 타워 가격 
      int32 towerCost = 2;
      int32 initialGold = 3;
      int32 monsterSpawnInterval = 4;
    }
    
    # 플레이어당 게임 초기 정보
    message GameState {
      int32 gold = 1;
      BaseData base = 2;
      int32 highScore = 3;
      # 플레이어 타워 정보
      repeated TowerData towers = 4;
      repeated MonsterData monsters = 5;
      int32 monsterLevel = 6;
      int32 score = 7;
      repeated Position monsterPath = 8;
      Position basePosition = 9;
    }

    # 위에서 사용되는 TowerData
    message TowerData {
      int32 towerId = 1;
      float x = 2;
      float y = 3;
    }
    # 클라이언트 타워 구매 요청
    message C2STowerPurchaseRequest {
      float x = 1;
      float y = 2;
    }
    # 서버 타워 구매 응답
    message S2CTowerPurchaseResponse {
      int32 towerId = 1;
    }
    # 상대방의 타워 설치 정보
    message S2CAddEnemyTowerNotification {
      int32 towerId = 1;
      float x = 2;
      float y = 3;
    }
    # 타워의 몬스터 공격 요청
    message C2STowerAttackRequest {
      int32 towerId = 1;
      int32 monsterId = 2;
    }
    # 몬스터 피격 정보 응답
    message S2CEnemyTowerAttackNotification {
      int32 towerId = 1;
      int32 monsterId = 2;
    }
    ```

    - towerId와 타워 위치, 타워의 초기 정보만 가지고 있으면 될 것 같다!

    - 타워 초기 정보는 js 파일에 저장되어 있는 객체에서 찾아서 대입해준다

    ```jsx
    import towerData from '../../assets/tower.js';

    class Tower {
      constructor(towerId, x, y, Rcode) {
        this.towerId = towerId;
        this.level = 0;
        this.x = x;
        this.y = y;
        this.stat = towerData.find((e) => e.Rcode === Rcode);
        this.lastUpdate = 0;
      }

      isAttackPossible(targetX, targetY) {
        const timeDiff = Date.now() - this.lastUpdate;

        // 위치 정보 확인
        if (this.x + this.stat.range/2 > targetX || this.x - this.stat.range/2 < targetX || this.y + this.stat.range/2 > targetY || this.y - this.stat.range/2 < targetY)
          return false

        // 공격 쿨타임 확인 
        if (timeDiff < this.stat.coolDown) return false

        this.lastUpdate = Date.now();
        return true;
      }

      levelUp() {
        this.level++
      }

      getDamage() {
        return this.stat.power + this.level * this.stat.powerPerLv
      }
    }

    export default Tower;
    ```

### 메인 작업

- 본격적으로 구현할 비즈니스 로직을 역할별로 나누어 작업할 계획이다.

---
