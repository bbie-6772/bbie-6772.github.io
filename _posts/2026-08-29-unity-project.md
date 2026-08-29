---
layout: post
title: 유니티 학습 프로젝트 - < 3 >
subtitle: 부호만 세 번 틀렸다 - 방향, 가드, 그리고 무적 시간
author: bbie
categories: unity-project
banner:
  image: /assets/images/unity-project/19-banner.jpg
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [game, Unity, csharp, 물리, 트러블슈팅]
---

## 개요

[지난 편](https://bbie-6772.github.io/unity-project/2026/08/28/unity-project.html)은 `PlayerMovement.cs` 한 파일에서 버그를 세 번 만난 이야기였다. 마지막 줄에 이렇게 적어뒀다. 원인을 절반만 맞히면 고쳐지지 않는다고.

개발 2일차인 오늘은 파일을 다섯 개 만들었다. 그리고 **또 세 번 틀렸다.**

| 파일 | 위치 | 책임 |
|---|---|---|
| `EnemyChase` | Enemy/ | 플레이어 방향으로 일정한 속도로 이동 |
| `IDamageable` | Core/ | 데미지를 받을 수 있다는 계약 |
| `Health` | Core/ | 체력 감소, 0에 닿으면 `OnDied` 발행 |
| `ContactDamage` | Core/ | 닿으면 얼마나 아픈지 ( 값만 들고 있음 ) |
| `PlayerHitReceiver` | Player/ | 접촉 피격을 받고 무적 시간을 소유 |

돌려보면 이렇다. 좀비가 따라오고, 서로 밀어내고, 플레이어를 0.5초 간격으로 때리고, 체력이 0이 되면 이벤트가 나간다.  
**코어 루프의 절반( 적 → 플레이어 방향 )이 닫혔다!**

그런데 오늘 만난 버그 세 개가 전부 같은 모양이었다. 논리는 알고 있었고, 쓸 함수도 알고 있었고, **부호만 뒤집혀 있었다.**

> **이번 글이 답할 질문. 논리를 아는데 왜 부호를 세 번이나 틀릴까?**

---

## 1. 좀비가 도망갔다 — 벡터 뺄셈은 끝점 빼기 시작점

첫 스크립트는 `EnemyChase`다. 좀비가 플레이어 쪽으로 일정한 속도로 걸어오기만 하면 된다. 방향을 구하는 건 뺄셈 한 줄이라 금방 끝날 줄 알았다.

실행하니 좀비가 **뒤로 도망갔다.**

<video src="/assets/images/unity-project/09-chase-wrong.mp4" controls muted loop playsinline width="100%"></video>

```cs
// 틀림: 타겟에서 나를 향하는 벡터가 나왔다
Vector2 dir = _rigidbody.position - (Vector2)_target.position;
```

방향 벡터는 **끝점에서 시작점을 뺀다.** 좀비가 플레이어에게 가야 하니 끝점이 플레이어고, 시작점이 좀비다. 나는 이걸 정확히 거꾸로 썼다.

$$
\vec{d} = P_{target} - P_{self}
$$

```cs
// 맞음
Vector2 dir = ((Vector2)_target.position - _rigidbody.position).normalized;
_rigidbody.linearVelocity = dir * moveSpeed;
```

`.normalized`가 붙은 이유는 지난 편과 같다. 거리가 멀면 뺄셈 결과의 길이도 길어져서, 그냥 곱하면 **멀리 있는 좀비가 더 빨리 온다.** 방향만 남기고 길이는 1로 눌러야 등속이 된다.

<video src="/assets/images/unity-project/10-chase-fixed.mp4" controls muted loop playsinline width="100%"></video>

### 더 쉬운 비유로

> 위치는 "어디에 있는가"  
> 방향은 "어디로 가는가"  
> 둘을 잇는 계산이 뺄셈이고, 뺄셈에는 순서가 있다

지도 앱에 집과 학교를 찍으면 화살표가 하나 그려진다. 그 화살표를 좌표로 만들려면 **학교 좌표에서 집 좌표를 뺀다.** 순서를 바꾸면 화살표는 길이가 똑같고 방향만 정반대인, 학교에서 집으로 가는 화살표가 된다.

길이가 맞으니까 코드는 아무 불평도 안 한다. 컴파일도 되고 좀비도 움직인다. **틀린 게 눈에 보이려면 실행해서 봐야 한다.**

> 끝점 빼기 시작점. 이 규칙은 대시 방향, 넉백, 투사체에서 계속 다시 나온다.

참고로 지금 좀비는 `FindAnyObjectByType`으로 매번 플레이어를 직접 찾고 있다. 이건 알고도 안 고친 것이라 7번 섹션에 따로 적어뒀다.

### 좀비를 Kinematic으로 두면 어떻게 되나

영상에서 좀비들이 서로 밀어내는 건 내가 짠 게 아니라 물리 엔진이 해주는 것이다. 그럼 이걸 안 쓰면 어떻게 될까 궁금해서 실험을 하나 해봤다.

Rigidbody2D에는 **Body Type**이라는 설정이 있다. 기본값인 `Dynamic`은 힘도 받고 충돌하면 밀려나는, 말 그대로 물리 법칙을 따르는 물체다. `Kinematic`은 충돌을 **감지는 하되 밀려나지는 않는다.** 위치를 코드로만 바꾸는, 엄청 무거운 물체라고 보면 된다.

좀비를 `Kinematic`으로 바꾸고, 플레이어와 겹쳐 있는 좀비의 콜라이더에 `isTrigger`까지 체크해봤다. `isTrigger`를 켜면 물리적인 반발이 아예 사라지고 "닿았다"는 신호만 남는다.

<video src="/assets/images/unity-project/13-istrigger-jitter.mp4" controls muted loop playsinline width="100%"></video>

겹친 채로 **떨림**이 생겼다. 밀어내기가 사라져서 겹침이 안 풀리는 건 예상했는데, 떨리는 것까지는 예상 못 했다.

이유는 이 섹션 맨 위에서 쓴 그 뺄셈이었다. 좀비와 플레이어가 겹치면 두 좌표가 거의 같아져서 **뺄셈 결과가 0에 가까운 아주 짧은 벡터**가 된다.

$$
\vec{d} = P_{target} - P_{self} \approx \vec{0}
$$

문제는 정규화가 그 짧은 벡터를 **길이 1까지 늘려버린다**는 것이다. 좌표가 소수점 아래에서 조금만 달라져도 방향이 확 바뀌는데, 정규화가 그 미세한 흔들림을 매번 전속력으로 증폭한다. 게다가 길이가 너무 짧으면 Unity는 정규화 결과로 0 벡터를 돌려주기 때문에, 어떤 스텝은 방향이 나오고 어떤 스텝은 아예 안 나온다. 매 스텝 방향이 튀면서 발산한 것이다.

밀어내기가 있을 땐 이게 안 보였다. **엔진이 둘을 계속 떼어놔서 두 좌표가 겹칠 일이 아예 없었기 때문이다.** 겹침을 허용하는 순간 뺄셈 결과가 0으로 다가간다.

> 밀어내기는 공짜로 얻는 게 아니라 `Dynamic`이라서 얻는 것이고, 그게 내 계산이 터지지 않게 막아주고 있었다.

그러니 나중에 겹침을 허용하는 상황을 만들 거라면 "거리가 아주 짧으면 방향 계산을 건너뛴다" 같은 처리가 필요하다. 그리고 그 밀어내기를 내가 매 스텝 지우고 있다는 게 7번 섹션의 첫 번째 항목이다.

---

## 2. 정상 데미지를 전부 막았다 — 가드가 반대로 서 있었다

두 번째는 `Health`다. 체력을 깎는 `TakeDamage(float amount)` 하나만 있으면 되는데, 여기에 방어 코드를 하나 넣고 싶었다.

`TakeDamage(-10)`을 부르면 체력이 10 늘어난다. 회복 기능은 따로 만들 거니까 음수는 막아야 한다. 그래서 이렇게 썼다.

```cs
public void TakeDamage(float amount)
{
    if (amount >= 0) return;   // 틀림: TakeDamage(10)이 아무 일도 안 한다
    ...
}
```

좀비가 아무리 때려도 체력이 안 깎였다. 당연하다. **막으려던 것과 통과시키려던 것을 바꿔 썼다.**

```cs
if (amount < 0) return;   // 맞음
```

가드는 "무엇을 통과시킬까"가 아니라 **"무엇을 되돌려 보낼까"** 를 쓰는 자리다. 나는 머릿속으로 "양수만 정상"이라고 생각한 뒤 그 문장을 그대로 조건문에 옮겼는데, `return`이 붙는 순간 의미가 뒤집힌다.

### 클램프는 숫자를 막지 발행을 막지 못한다

가드를 고치니 다음 문제가 나왔다. 체력이 마이너스로 내려가는 건 이렇게 막았다.

```cs
_currentHealth = Mathf.Max(_currentHealth - amount, 0f);
if (_currentHealth <= 0f) OnDied?.Invoke();
```

`Mathf.Max`는 두 값 중 큰 쪽을 돌려주는 함수다. 체력이 0 밑으로 못 내려간다. 여기까진 맞다.

그런데 **이미 0인 상태에서 또 맞으면** `0 <= 0`이 참이라 `OnDied`가 또 나간다. 산탄총 한 발에 총알 5개가 박히면 죽었다는 이벤트가 5번 발행된다. 이벤트를 받는 쪽에서 점수를 주고 있었다면 **한 마리 잡고 5마리 값을 받는다.**

![숫자 클램프와 발행 차단은 다른 문제](/assets/images/unity-project/06-clamp-vs-emit.svg)

```cs
if (_alreadyDead) return;

_currentHealth = Mathf.Max(_currentHealth - amount, 0f);
if (_currentHealth <= 0f)
{
    _alreadyDead = true;
    OnDied?.Invoke();
}
```

> 숫자를 가둔 것과 발행을 가둔 것은 다른 문제다. 클램프는 앞엣것만 해준다.

### 인터페이스를 미리 만든 이유

`IDamageable`은 "데미지를 받을 수 있다"는 계약 하나만 들고 있는 인터페이스다. 지금 이걸 구현한 건 `Health` 하나뿐이라, 원래대로면 **아직 만들 이유가 없다.**

그런데 이번엔 만들었다. "나중을 위해"가 아니라 **기획서에 무기 3종이 이미 확정되어 있어서다.** 인터페이스가 없으면 세 무기가 각자 `GetComponent<Health>()`를 부르게 되고, 나중에 `TakeDamage`의 인자가 하나만 늘어도 고칠 곳이 세 군데가 된다.

붙이자마자 빨간 줄이 그어졌다.

![Health.TakeDamage가 public이 아니므로 인터페이스 멤버를 구현할 수 없다는 에러](/assets/images/unity-project/17-interface-public.png)

`TakeDamage`를 접근 지정자 없이 선언해뒀는데, C#에서 아무것도 안 쓰면 **`private`이 기본**이다. 반면 인터페이스에 적힌 멤버는 전부 암묵적으로 `public`이다. 밖에서 부르라고 만든 약속이니 당연하다.  
그러니 그 약속을 구현하는 쪽도 `public`이어야 한다. 감춰둔 함수로는 공개 약속을 지킬 수 없다.

> 인터페이스를 만드는 근거는 "언젠가 늘겠지"가 아니라 **문서에 몇 개라고 적혀 있느냐**다.

---

## 3. 무적 시간 — 이름이 거짓말하면 부호가 틀어진다

세 번째는 `PlayerHitReceiver`다. 좀비에 닿으면 데미지를 받되, 한 번 맞으면 잠깐 못 맞는 시간( 무적 시간 )을 둔다.

```cs
if (_lastHitTime >= _invincibleDuration) return;   // 틀림
```

이 줄을 쓸 때 나는 `_lastHitTime`을 **"맞은 뒤 흐른 시간"** 으로 읽고 있었다. 그러면 "흐른 시간이 무적 시간을 넘었으면 무시"가 되니 이것도 방향이 반대다.

실제로 저 변수에 들어 있는 건 **"마지막으로 맞은 시각"** 이다. 시각과 간격은 단위는 같지만 뜻이 완전히 다르다.

```cs
if (_lastHitTime + _invincibleDuration > Time.time) return;   // 맞음
```

맞은 시각에 무적 길이를 더한 게 **무적이 풀리는 시각**이고, 그게 아직 현재 시각보다 미래면 무적 중이다.

> 이름이 거짓말하면 부호 실수가 잘 난다. 세 번 중 두 번은 변수 이름을 잘못 읽은 데서 시작했다.

### `Time.captureDeltaTime`을 현재 시각인 줄 알았다

이걸 고쳤는데도 데미지가 **한 번도** 안 들어왔다. 원인은 값을 넣는 쪽이었다.

```cs
_lastHitTime = Time.captureDeltaTime;   // 틀림
```

이름만 보고 시간을 주는 값이겠거니 하고 썼는데, `Time.captureDeltaTime`은 **동영상 캡처용으로 프레임 간격을 강제로 고정하는 설정값이고 기본값이 0이다.** 시각이 아니라 설정이다.

그래서 조건이 `0 + 0.5 > Time.time`이 되는데, 게임 시작 직후엔 `Time.time`이 0에 가까우니 늘 참이다. **영원한 무적 상태였다.**

> 이름에 `delta`가 붙어 있으면 시각이 아니라 간격이다. 시각은 `Time.time`이다.

관련해서 헷갈리던 걸 이참에 표로 정리했다. `timeScale`은 게임 전체의 시간 흐름 배속이고, 0으로 두면 일시정지가 된다.

| | `timeScale` 영향 |
|---|---|
| `Time.time` / `Time.deltaTime` | 받음 |
| `Time.unscaledTime` / `Time.unscaledDeltaTime` | 안 받음 |

피격 무적은 게임 안에서 벌어지는 일이니 `Time.time`이 맞다. **일시정지 중에 무적이 풀리면 안 되기 때문이다.**  
( 반대로 UI 애니메이션처럼 멈춰도 돌아야 하는 건 `unscaledTime` 쪽이다 )

그리고 지난 편에 써둔 "보스전 동안 메인 타이머 정지"가 여기서 걸린다. `timeScale`을 0으로 만들면 보스도 같이 멈춰서 보스전이 성립하지 않는다. **타이머가 스스로 안 깎는 방식**이어야 한다.

### 무적을 누가 소유할 것인가

여기서 설계 판단을 하나 했다. 접촉 피격 처리를 **좀비 쪽에 둘 것인가, 플레이어 쪽에 둘 것인가.**

처음엔 성능 문제인 줄 알았다. 좀비가 300마리면 좀비 쪽에 두는 게 무겁지 않을까 싶었는데, 아니었다. 물리 엔진은 **한 쌍당 한 번 감지하고 양쪽에 통보**한다. 어느 쪽이 처리하든 감지 횟수는 같다.

달라지는 건 성능이 아니라 **게임 규칙**이다. 좀비마다 각자 쿨다운을 들고 있으면, 둘러싼 마릿수 `N`이 초당 데미지에 그대로 곱해진다.

$$
DPS = N \times \frac{d}{t_{cool}}
$$

반대로 플레이어가 무적 시간 하나만 소유하면 마릿수가 식에서 사라진다.

$$
DPS = \frac{d}{t_{inv}}
$$

숫자를 넣어보면 이렇다. 데미지 10을 0.5초마다 받으니 한 마리한테 물리면 **초당 20**이다. 그런데 위 식이면 9마리한테 둘러싸이는 순간 초당 180이 된다. 아래 식이면 몇 마리든 초당 20 그대로다.  
( 4번 섹션에도 20이 나오는데 그건 **한 대에** 20 맞은 버그 이야기라 다른 숫자다 )

뱀서류 게임에서 좀비 떼에 둘러싸이는 건 기본 상황인데, 앞엣것으로 만들면 **둘러싸인 순간 즉사**한다. 그래서 아래쪽을 채택했다.

![좀비별 쿨다운과 플레이어 무적의 차이](/assets/images/unity-project/07-invincible-owner.svg)

말로만 정하면 못 미더워서 실험을 했다. 무적을 3초로 크게 올려두고 **좀비를 1마리에서 9마리로 늘려봤다.** 초당 데미지가 그대로였다.

> 무적 시간은 성능 최적화가 아니라 **난이도를 정하는 손잡이**다.

---

## 4. 데미지가 20씩 들어왔다 — 인스펙터가 답을 준 두 번째 사례

무적까지 고쳤는데 이번엔 체력이 이상하게 빨리 닳았다. 한 대에 10이어야 하는데 20씩 빠졌다.

<video src="/assets/images/unity-project/11-hit-duplicate.mp4" controls muted loop playsinline width="100%"></video>

원인 후보가 세 개였다. 데미지 값 자체가 20이거나, 무적 가드가 새서 10이 두 번 들어오거나, 아니면 다른 무언가거나.

셋을 한 번에 가르려고 로그를 이렇게 찍었다.

```cs
Debug.Log($"{amount} / {Time.time} / {GetEntityId()}");
```

( 원래는 `GetInstanceID()`를 쓰려 했는데 `CS0619` 경고가 떴다. Unity 6에서 `GetEntityId()`로 바뀌었고, 옛 이름은 나중 버전에서 아예 사라진다고 한다 )

![GetInstanceID가 deprecated이고 GetEntityId를 쓰라는 CS0619 경고](/assets/images/unity-project/18-getinstanceid-deprecated.png)

| 로그 모양 | 범인 |
|---|---|
| `20`이 한 줄 | 데미지 값 자체가 20 |
| `10`이 두 줄 + 시각이 다름 | 무적 가드가 샌다 |
| `10`이 두 줄 + 시각이 같고 인스턴스 ID가 다름 | **컴포넌트 중복** |

나온 건 세 번째였다. `PlayerHitReceiver`가 **플레이어에 두 개 붙어 있었다.**

![인스펙터에 Player Hit Receiver가 두 개 붙어 있다](/assets/images/unity-project/14-inspector-duplicate.png)

왜 무적이 안 먹혔는지는 생각해보면 당연하다. **필드는 클래스마다 하나가 아니라 인스턴스마다 하나씩** 있다. 컴포넌트가 두 개면 `_lastHitTime`도 두 개다. 서로의 존재를 모르니 둘 다 "나는 방금 안 맞았는데?" 하면서 통과시킨다.

지난 편의 `Wall Layer: Nothing`에 이어 **인스펙터가 답을 준 두 번째 사례**다. 코드를 아무리 들여다봐도 안 나오는 게 화면에는 그냥 보인다.

재발 방지는 속성 두 개로 된다.

```cs
[DisallowMultipleComponent]
[RequireComponent(typeof(Health))]
public class PlayerHitReceiver : MonoBehaviour { ... }
```

앞엣것은 같은 컴포넌트를 두 번 못 붙이게 막고, 뒤엣것은 필요한 컴포넌트를 자동으로 같이 붙여준다.

### 0.02초는 어디서 왔나

고친 뒤 정상 동작 로그가 이렇게 찍혔다. 무적은 0.5초로 설정해뒀다.

![데미지 10이 0.5초 간격으로 찍히고 인스턴스 ID는 전부 같은 로그](/assets/images/unity-project/15-console-normal.png)

맨 뒤 인스턴스 ID가 전부 `568105589213721120` 하나로 통일됐다. 때리는 컴포넌트가 하나뿐이라는 뜻이다.

```
10 / 3.639999 / 568105589213721120
10 / 4.159998 / 568105589213721120   ← 0.52
10 / 4.659998 / 568105589213721120   ← 0.50
10 / 5.179998 / 568105589213721120   ← 0.52
10 / 5.699998 / 568105589213721120   ← 0.52
10 / 6.199998 / 568105589213721120   ← 0.50
```

간격이 0.50인 구간과 **0.52인 구간이 섞여 있다.** 처음엔 또 뭐가 샌 줄 알았는데 아니었다.

지난 편에서 정리한 그대로다. 물리 계산은 `FixedUpdate` 주기( 기본 0.02초 )로만 돈다. 무적이 풀리는 순간이 스텝과 스텝 사이라면, 그 순간에 통과하는 게 아니라 **다음 스텝까지 기다렸다가** 통과한다.

> 이산적으로 도는 시계 위에서는 "정확히 0.5초 뒤"가 존재하지 않는다. 0.5초 이후 첫 스텝이 있을 뿐이다.

---

## 5. 데미지 값을 왜 별도 컴포넌트로 뺐나 — 판별과 값 획득을 한 번에

`ContactDamage`는 `float` 값 하나만 들고 있는 컴포넌트다. 이렇게까지 쪼갤 일인가 싶었는데, 부딪힌 상대가 적인지 판별하는 코드를 써보고 나서 납득했다.

태그로 판별하면 `if (other.CompareTag("Enemy"))` 로 **적이라는 것까지만** 알 수 있다. 얼마나 아픈지는 또 따로 찾아와야 한다.

```cs
var damage = other.GetComponent<ContactDamage>();
if (damage == null) return;
_health.TakeDamage(damage.Amount);
```

컴포넌트가 붙어 있다는 사실 자체가 판별이 되고, 같은 호출에서 값까지 나온다. **판별과 값 획득이 한 번에 끝난다.**

> 태그는 "적이냐"만 답한다. 컴포넌트는 "적이냐"와 "얼마냐"를 같이 답한다.

---

## 6. 컴파일러가 잡아준 것 — CS0104와 event

부호 실수 셋은 전부 실행해야 보이는 버그였다. 그것 말고 컴파일 단계에서 걸린 것도 둘 있었는데, 이쪽은 **틀린 걸 컴파일러가 대신 찾아줬다.**

### `CS0104` — 이름이 겹쳤다

`Object.FindAnyObjectByType<T>()`를 쓰려는데 컴파일이 안 됐다.

![Object는 UnityEngine.Object와 object 사이에서 모호한 참조라는 CS0104 에러](/assets/images/unity-project/16-cs0104.png)

`Object`라는 이름이 `UnityEngine.Object`와 `object` 양쪽에 다 있어서, 둘 중 뭘 말하는지 컴파일러가 못 고른 것이다. 에러에 나오는 `object`는 `System.Object`의 다른 이름이다.  
파일 맨 위에 `using System;`이 있었는데 **정작 그 파일에서 `System`을 쓰는 곳이 없었다.**

지우니 바로 풀렸다. IDE가 자동으로 넣어준 `using`은 한 번 의심해볼 만하다.

### `event`가 컨벤션 위반인가

`Health`에서 죽음을 알리는 걸 이렇게 선언했다.

```cs
public event Action OnDied;
```

내가 정해둔 컨벤션 1항은 "`public` 필드 금지"다. 그럼 이건 위반인가 싶었는데, 그 항목이 금지한 건 **데이터를 그냥 노출하는 것**이지 `public`이라는 키워드가 아니다.

| | 구독 / 해제 | 목록 통째 대입 | 외부에서 발행 |
|---|---|---|---|
| `public Action` | O | **O** | **O** |
| `public event Action` | O | X | X |

`event`를 붙이면 밖에서는 `+=`와 `-=`만 할 수 있다. 남이 등록해둔 구독자 목록을 통째로 날려버리거나, 죽지도 않았는데 죽음 이벤트를 대신 쏘는 게 막힌다.

> `event`는 델리게이트판 `{ get; private set; }`이다. 규칙 위반이 아니라 규칙을 정확히 적용한 결과다.

---

## 7. 알고 있는데 안 고친 것

오늘 굴러가게는 만들었지만 문제인 걸 알면서 남겨둔 게 넷 있다. 기록해두지 않으면 잊어버릴 것 같아서 적어둔다.

**1. 속도 대입이 엔진의 밀어내기를 매 스텝 지운다.**

좀비끼리 겹치지 않게 서로 밀어내는 건 물리 엔진이 해준다. 그런데 내 `EnemyChase`는 매 스텝 `linearVelocity`에 값을 **대입**한다.

순서는 내 `FixedUpdate`가 먼저고 물리 시뮬레이션이 나중이라, 그 스텝에서는 엔진이 이긴다. 문제는 다음 스텝에서 내 대입이 그걸 다시 덮는다는 것이다. **밀어내기가 쌓이지 못한다.**

![대입이 상대의 결과를 지운다](/assets/images/unity-project/08-assign-overwrite.svg)

지난 편의 대시 깃발 버그와 **구조가 똑같다.** 주기가 다른 두 축이 같은 값을 만질 때, 대입은 상대가 써둔 걸 지운다.

**2. 풀링을 도입하면 초기화가 안 된다.**

`Awake`에서 하는 `_currentHealth = _maxHealth`와 `_alreadyDead` 초기화는 **객체가 만들어질 때 딱 한 번만** 돈다. 좀비를 매번 만들고 버리는 대신 재사용하는 방식( 오브젝트 풀 )으로 바꾸면 `Awake`가 다시 안 돌아서, **죽은 채로 부활한 좀비**가 나온다.

**3. `GetComponent<ContactDamage>()`가 접촉할 때마다 실행된다.** 300마리가 붙으면 프레임당 300번이다.

**4. 좀비마다 `FindAnyObjectByType`으로 플레이어를 찾는다.** 씬 전체를 뒤지는 함수라 마릿수만큼 늘어난다. 스포너가 만들 때 참조를 넣어주는 방식으로 바꿀 생각이다.

> 셋과 넷은 지금 마릿수에서는 티도 안 난다. 그래서 더 잊기 쉽다.

---

## 정리

- **방향 벡터는 끝점 빼기 시작점.** 순서를 바꾸면 길이는 같고 방향만 반대라 컴파일러가 안 잡아준다.
- **밀어내기는 `Dynamic`이라서 얻는 것이다.** `Kinematic` + `isTrigger`로 겹침을 허용하면 뺄셈 결과가 0에 가까워져 방향 계산이 발산한다. 엔진이 둘을 떼어놓고 있어서 안 보이던 문제였다.
- **가드는 통과시킬 조건이 아니라 되돌려 보낼 조건을 쓴다.** `amount >= 0`으로 정상 데미지를 전부 막았다.
- **인터페이스 멤버는 암묵적으로 `public`이다.** 구현하는 쪽도 `public`을 붙여야 한다. C#은 안 쓰면 `private`이 기본.
- **`Mathf.Max`는 숫자만 가둔다.** 0에서 또 맞으면 `OnDied`가 또 나가니 발행은 `_alreadyDead` 플래그로 따로 막는다.
- **이름이 거짓말하면 부호가 틀어진다.** `_lastHitTime`을 "흐른 시간"으로 읽은 게 비교식 실수의 출발점이었다.
- **`delta`가 붙으면 시각이 아니라 간격이다.** `Time.captureDeltaTime`은 동영상 캡처용 설정값이고 기본값이 0이다.
- **무적은 플레이어가 소유한다.** 좀비별로 쿨다운을 두면 초당 데미지에 마릿수가 곱해져서 둘러싸인 순간 죽는다. 1마리에서 9마리로 늘려 검증했다.
- **필드는 인스턴스마다 하나씩 있다.** 컴포넌트가 중복 부착되면 무적 상태도 두 벌이라 둘 다 통과한다. `[DisallowMultipleComponent]`.
- **인스턴스 ID를 같이 찍으면 원인 후보 셋이 한 번에 갈린다.** Unity 6에서는 `GetInstanceID()`가 아니라 `GetEntityId()`.
- **인스펙터가 답을 준 두 번째 사례.** 코드로 안 보이던 게 화면에는 그냥 보인다.
- **0.5초 간격이 0.52로 찍히는 건 정상이다.** 물리 스텝 하나만큼 늦게 통과하기 때문이다.
- **`event`는 델리게이트판 `{ get; private set; }`.** 밖에서는 구독과 해제만 된다.
- **세 번의 실수가 전부 같은 모양이었다.** 논리는 맞고 부호만 뒤집혔다. 극단값 두 개( 0과 아주 큰 값 )를 손으로 넣고 한 줄씩 따라가면 잡힌다.

## 참고 자료

- [Unity 6000.0 Scripting API - Time.captureDeltaTime](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Time-captureDeltaTime.html)
- [Unity 6000.0 Scripting API - Time.unscaledTime](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Time-unscaledTime.html)
- [Unity 6000.0 Scripting API - DisallowMultipleComponent](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/DisallowMultipleComponent.html)
- [Unity 6000.0 Scripting API - Rigidbody2D.bodyType](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Rigidbody2D-bodyType.html)
- [Microsoft Learn - event 키워드](https://learn.microsoft.com/ko-kr/dotnet/csharp/language-reference/keywords/event)
- [지난 편 - 유니티 학습 프로젝트 < 2 >](https://bbie-6772.github.io/unity-project/2026/08/28/unity-project.html)

## 한줄 평

- 방향을 아는 것과 부호를 맞게 쓰는 건 다른 능력이라는 걸 하루에 세 번 배웠다..
