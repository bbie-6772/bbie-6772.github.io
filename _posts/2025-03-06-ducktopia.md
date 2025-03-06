---
layout: post
title: Ducktopia - <21>
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

- 현재 기획상에서 허니 머스타드라는 아이템이 중앙 코어에서 생성할 수 있고, 이를 무기에 발라야 보스에 데미지가 들어가는 것이 있다!

- 서버에서 보스 데미지 계산과 허니 머스타드 조합 기능을 기존에 있던 코드들을 개량해서 추가할 예정이다!

- 기존의 무기 조합 핸들러를 응용

```jsx
// 만약 조합아이템 중 하나가 머스타드이면
 if (
    config.game.item.mustardItemCode === itemCode1 ||
    config.game.item.mustardItemCode === itemCode2
  ) {
    // '1xx' = 무기 코드
    const weaponCode = [item1Str, item2Str].find((code) => code !== config.game.item.mustardItemCode && code[0] === '1');
    if (!weaponCode) throw new CustomError('허니 머스타드는 무기가 아닌 부위에는 조합할 수 없습니다.');

    // 이미 바른 무기에 못바르게 예외처리
    const combination = weapon.data.find((data) => data.code === weaponCode);
    if (combination.isMustard) return

    // 머스타드 무기는 코드에 50을 추가
    mustardWeaponCode = +weaponCode + 50
    isSuccess = true;
  }
```

- 보스몬스터 class에서 setDamage를 오버라이딩

```jsx
setDamaged(damage, isMustard) {
  // const newAggro = Math.max(0, this.hatePointList.get(player) + damage);
  // this.hatePointList.set(player, newAggro);
  if(!isMustard) return this.hp;
  return super.setDamaged(damage);
}
```

### 서버가 느리다

이번에 팀원 5명 정도가 함께 멀티플레이를 해보고 버그나 사용자경험측면을 분석하기로 하였다!  
그렇게 플레이 중.. 4명 이상 게임에서 특정 상황에서 서버가 느리다(처리가 늦게 온다)는 느낌을 받게 되었다

여러 가설들을 생각하기위해 로그들을 보는데, 일단 쓸데없는 로그가 너무 많다..  
( 로그들을 직접 지우는게 아니라 Winston 라이브러리를 사용해서 단계를 나눠둘껄 그랬다.. )

- 여러 테스트( 특정 인원만 움직이면서 확인 )를 해보며 아래와 같은 가설에 힘이 실렸다.
" 특정 패킷(=플레이어 위치 동기화)이 클라이언트한테 여러 개로 분할되어 들어와 처리가 늦게되는 것 같다 "

- 이러한 상황을 타파하기 위해 대기열을 만들어 서버에서 일정 시간마다 종합하여 보내주도록 변경해보았다

```jsx
// 이 메서드를 0.2초마다 반복
playerMoveUpdate() {
    const playerPositions = [];
    for(const [userId, user] of this.users) {
      const playerPosition = {
        playerId: userId,
        x: user.player.x,
        y: user.player.y
      };
      playerPositions.push(playerPosition)
    }

    // payload 인코딩
    const packet = [
      config.packetType.S_PLAYER_POSITION_UPDATE_NOTIFICATION,
      {
        playerPositions,
      },
    ];

    // 룸 내 인원에게 브로드캐스트
    this.broadcast(packet);
}
```

- 변경사항 적용 이후 꽤나 괜찮아졌지만, 이와 비슷하게 돌아가는 몬스터 이동 동기화도  
대기열을 만들어 패킷 전송량을 조절해야된다는걸 깨닫게 되었다!

```jsx
// 여기선 이동한 몬스터만 처리하기 위해 Queue를 사용
monsterMoveUpdate() {
  const monsterPositionData = [];
  while(this.monsterMoveQueue.length > 0) {
    const monsterPosition = this.monsterMoveQueue.pop()
    monsterPositionData.push(...monsterPosition.monsterPositionData);
  }
  
  // payload 인코딩
  const packet = [
    config.packetType.S_MONSTER_MOVE_NOTIFICATION,
    {
      monsterPositionData,
    },
  ];

  // 룸 내 인원에게 브로드캐스트
  this.broadcast(packet);
}
```

## 한줄 평 + 개선점

- 테스트를 통해 수정한 부분이 많다!

---
