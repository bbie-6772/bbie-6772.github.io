---
layout: post
title: 유니티 학습 프로젝트 - < 4 >
subtitle: 코드는 다 썼는데 아무 일도 안 일어났다
author: bbie
categories: unity-project
banner:
  image: /assets/images/unity-project/30-banner.jpg
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [game, Unity, csharp, 코루틴, 트러블슈팅]
---

## 개요

[지난 편](https://bbie-6772.github.io/unity-project/2026/08/29/unity-project.html)은 부호를 세 번 틀린 이야기였다. 논리는 다 알고 있었는데 방향만 뒤집혀 있었다.

개발 3일차인 오늘은 파일을 일곱 개 만들었다.

| 파일 | 위치 | 책임 |
|---|---|---|
| `SpawnerBase` | Core/ | 프리팹 생성·제거, 자식에게 위치·초기화·정리 훅 제공 |
| `EnemySpawner` | Enemy/ | 화면 밖 링 위에 위치 결정, 좀비에 타겟·콜백 주입 |
| `EnemyDeath` | Enemy/ | `OnDied` 구독 → 주입받은 콜백으로 자기 회수 요청 |
| `PlayerAim` | Player/ | 방향키를 읽어 조준 방향 보관 |
| `MeleeWeapon` | Weapon/ | 부채꼴 자동 판정 → `IDamageable.TakeDamage` |
| `DamageFlash` | Core/ | `OnDamaged` 구독 → 스프라이트 일시 변색 |
| `CameraFollow` | Core/ | `LateUpdate` + `SmoothDamp` 추적 |

**그리고 드디어 코어 루프가 한 바퀴 돌았다!**  
스포너가 화면 밖에 좀비를 만들고, 좀비가 따라오고, 몽둥이가 부채꼴로 판정하고, 데미지가 들어가고, 맞은 쪽이 빨갛게 변하고, 죽으면 콜백을 타고 사라진다.

<video src="/assets/images/unity-project/20-core-loop.mp4" controls muted loop playsinline width="100%"></video>

그런데 오늘 하루의 절반은 **다 써놓은 코드가 안 돌아서** 날렸다. 문법은 맞고, 로직도 맞고, 에러도 안 난다. 그냥 아무 일도 안 일어난다.

( 오전은 통째로 `SpawnerBase` 상속 계층을 세우는 데 썼는데, 그동안 화면엔 좀비가 한 마리도 없었다. 그 이야기와 그때 만난 컴파일 에러들은 분량이 커서 [다음 편](https://bbie-6772.github.io/unity-project/2026/08/30/unity-project2.html)에 따로 적었다. )

> **이번 글이 답할 질문. 코드를 다 썼는데 왜 아무 일도 안 일어날까?**

---

## 1. 코드는 다 썼는데 아무 일도 안 일어났다 — 발동 지점이 빠진 네 곳

오늘 만난 문제 넷이 전부 같은 모양이었다. **함수는 존재하는데 아무도 부르지 않았고, 값은 돌아왔는데 아무도 받지 않았다.**

### `StartCoroutine`을 안 불렀다

스포너에 스폰 주기를 넣으려고 코루틴을 썼다. `WaitForSeconds`를 필드에 캐싱해두고, `while` 루프를 도는 `SpawnLoop`도 다 짰다.

```cs
private WaitForSeconds _wait;

IEnumerator SpawnLoop()
{
    while (true)
    {
        Spawn();
        yield return _wait;
    }
}
```

좀비가 한 마리도 안 나왔다.

당연했다. **`SpawnLoop`을 시작시키는 줄이 없었다.** 코루틴은 그냥 함수를 부른다고 도는 게 아니라 `StartCoroutine`에 넘겨야 엔진이 대신 돌려준다. 나는 `_wait`을 만들어놓은 것으로 준비가 끝났다고 착각했다.

![완성된 코드와 발동 지점은 다른 것이다](/assets/images/unity-project/31-missing-trigger.svg)

### 반환값을 받지 않은 게 두 번

몽둥이가 범위 안의 콜라이더를 모으는 줄이다.

```cs
// 틀림: 결과를 그냥 버렸다
Physics2D.OverlapCircleAll(transform.position, _radius, _targetLayer);
```

`OverlapCircleAll`은 **찾은 것을 배열로 돌려주는 함수**다. 호출만 하고 왼쪽에 아무것도 안 두면 찾아온 걸 그대로 버린다. 함수가 화면에 뭔가를 그려주는 게 아니라 값을 주는 것뿐이라는 걸 놓쳤다.

카메라도 똑같았다.

```cs
// 틀림: 카메라가 안 움직인다
Vector2.SmoothDamp(transform.position, _target.position, ref _velocity, _smoothTime);
```

![Vector2.SmoothDamp의 시그니처. 맨 앞에 Vector2 반환형이 붙어 있다](/assets/images/unity-project/26-smoothdamp-signature.png)

시그니처 맨 앞에 `Vector2`가 붙어 있다. **"이만큼 옮긴 자리를 알려줄 테니 네가 넣어라"** 는 뜻이다. 함수가 카메라를 직접 옮겨주는 게 아니다.

```cs
// 맞음
Vector2 currentPosition = Vector2.SmoothDamp(transform.position, _target.position, ref _velocity, _smoothTime);
transform.position = new Vector3(currentPosition.x, currentPosition.y, _z);
```

`ref`가 붙은 `_velocity`는 조금 성격이 다르다. 이건 내가 넣어주는 값이 아니라 **함수가 채워 넣는 자리**다. 부드럽게 따라가는 계산이 "지금 얼마나 빠르게 움직이는 중인지"를 기억하고 있어야 해서 그렇다. 그래서 지역변수로 두면 매 프레임 0으로 리셋되어 뚝뚝 끊긴다. 반드시 필드여야 하고, 내가 손으로 건드리면 안 된다.

### `return`이 한 줄 위에 있었다

스포너가 좀비를 만들고 나서 두 가지를 주입한다. 추격 대상과 회수 콜백이다. 그런데 이렇게 썼다.

```cs
// 틀림: EnemyDeath 블록이 아예 죽은 코드가 된다
EnemyChase chase = obj.GetComponent<EnemyChase>();
if (!chase)
{
    Debug.LogError("Prefab에 EnemyChase가 없습니다.", obj);
}
chase.Init(_target);
return;

EnemyDeath death = obj.GetComponent<EnemyDeath>();
```

`return`이 위로 올라가 있어서 아래 절반이 **한 번도 실행되지 않는 코드**가 됐다. 좀비는 잘 따라오는데 죽어도 안 사라졌다.

이걸 고쳤더니 이번엔 반대 사고가 났다. 가드 안에 로그만 찍고 `return`을 안 넣었더니, 컴포넌트가 없는 상황에서 경고만 남기고 그대로 다음 줄로 내려가 `NullReferenceException`이 터졌다.

```cs
// 맞음: 로그를 남겼으면 흐름도 끊는다
if (!chase)
{
    Debug.LogError("Prefab에 EnemyChase가 없습니다.", obj);
    return;
}
```

### 더 쉬운 비유로

> 레시피를 다 적는 것과 요리를 하는 것은 다르다  
> 재료를 다듬어두는 것과 냄비에 넣는 것도 다르다  
> 코드는 레시피고, 발동 지점이 냄비다

라면 끓이는 법을 종이에 완벽하게 적어놨다고 라면이 끓지는 않는다. 누군가 그 종이를 보고 가스불을 켜야 한다. `StartCoroutine`이 가스불이고, `SpawnLoop`은 종이에 적힌 순서다.

반환값을 안 받은 건 이것과 조금 다르다. 요리는 됐는데 **접시를 안 갖다 댄 쪽**에 가깝다. 국을 다 끓여서 국자로 떠올렸는데 그릇을 안 놓아서 그대로 다시 냄비에 떨어뜨린 것이다.

> 2일차가 "부호가 뒤집혔다"였다면 오늘은 **"연결이 빠졌다"**. 컴파일러는 문장이 틀렸는지는 봐주지만, 그 문장을 아무도 안 읽는다는 건 안 봐준다.

---

## 2. 저장 공간이 둘로 갈라졌다 — 자동 프로퍼티의 숨은 방

`PlayerAim`은 방향키를 읽어서 마지막 조준 방향을 들고 있는 스크립트다. 밖에서 읽을 수 있어야 하니 프로퍼티로 열어뒀다.

```cs
// 틀림: 저장 공간이 두 개다
private Vector2 _lastAimInput = new Vector2(0, -1);   // Update가 쓰는 곳
public Vector2 LastAimInput { get; private set; }     // 밖이 읽는 곳
```

몽둥이가 조준 방향을 읽으면 **영원히 `(0, 0)`** 이 나왔다.

`{ get; private set; }` 이렇게 쓰는 걸 자동 프로퍼티라고 하는데, 이건 값을 저장할 공간이 없는 게 아니라 **컴파일러가 눈에 안 보이는 필드를 하나 몰래 만들어준다.** 나는 그걸 몰라서, 값을 넣는 곳( `_lastAimInput` )과 밖이 읽는 곳( `LastAimInput` )이 서로 다른 방이 되어 있었다.

처음엔 `Awake`에서 한 번 복사해서 맞춰봤다. 시작할 땐 같은 값이 되는데 `Update`가 한 번 돌자마자 다시 갈라졌다. **동기화를 늘려서 될 문제가 아니었다.**

```cs
// 맞음: 방을 하나로 없앤다
public Vector2 AimDirection { get; private set; } = new Vector2(0.0f, -1.0f);
```

그리고 이 구조, 지난 편에서 이미 한 번 만났었다.

| | 2일차 | 3일차 |
|---|---|---|
| 증상 | 무적이 안 먹힌다 | 조준 방향이 계속 0이다 |
| 실제 원인 | `PlayerHitReceiver` 중복 부착 | 자동 프로퍼티의 숨은 필드 |
| 공통점 | **`_lastHitTime`이 두 벌** | **저장 공간이 두 벌** |
| 해결 방식 | 컴포넌트를 하나로 | 프로퍼티를 하나로 |

> 값이 안 맞을 때 맞추는 코드를 추가하면 그때부터는 **맞추는 코드가 버그가 된다.** 방이 둘이면 방을 하나 없애야 한다.

---

## 3. 좀비가 스포너를 알아야 할까 — 순환 참조를 콜백으로 끊었다

좀비가 죽으면 누군가는 그 좀비를 치워야 한다. 만든 쪽이 스포너니까 치우는 것도 스포너가 맡는 게 맞다. 그럼 죽는 순간에 `Despawn`을 누가 부를 것인가.

제일 먼저 떠오른 건 좀비가 스포너를 참조하는 것이었다. 그런데 그러면 **스포너 없이는 죽지 못하는 좀비**가 된다. 씬에 손으로 하나 놓거나, 보스가 부하를 소환하거나, 테스트로 하나만 띄우면 전부 터진다.

![화살표가 양쪽으로 나면 좀비는 스포너 없이 죽지 못한다](/assets/images/unity-project/32-callback-injection.svg)

후보를 넷 놓고 봤다.

| 후보 | 방식 | 판단 |
|---|---|---|
| 1 | 스포너가 활성 좀비 `List`를 들고 있는다 | 제거 비용이 들고, **같은 정보를 두 군데 저장**한다. 활성 목록이 필요한 다른 기능이 기획서에 있을 때만 정당하다 |
| 2 | 좀비가 스포너를 참조한다 | 순환. 위에 적은 이유로 탈락 |
| 3 | `IDespawner` 인터페이스로 좁힌다 | 의존이 얇아지긴 하지만 여전히 "회수해주는 무언가"를 알아야 한다 |
| 4 | **`Action<GameObject>` 콜백을 주입한다** | **채택.** 좀비는 상대 타입을 아예 모른다 |

주입하는 쪽은 한 줄이다. 메서드 이름을 그대로 넘긴다.

```cs
// EnemySpawner.Setup
chase.Init(_target);
death.SetReleaseCallback(Despawn);
```

받는 쪽은 그 함수가 어디서 왔는지 모른다.

```cs
public class EnemyDeath : MonoBehaviour
{
    private Action<GameObject> _release;

    public void SetReleaseCallback(Action<GameObject> release)
    {
        _release = release;
    }

    void HandleDeath()
    {
        if (_release == null)
        {
            Debug.LogWarning("release가 비어있어 좀비가 제거되지 못했습니다.", this);
            return;
        }

        _release(this.gameObject);
    }
}
```

콜백이 비어 있는 좀비( 스포너를 안 거치고 씬에 놓인 개체 )는 경고만 남기고 돌아간다. **"죽어도 안 사라진다"는 건 감수하되, 왜 그런지는 로그에 남기는 쪽**을 골랐다. 조용히 아무 일도 안 일어나는 게 제일 나쁘다.

> 사실 이 항목은 처음에 1번으로 갈 뻔했다가 "이게 최선인가?"라고 한 번 더 물어봐서 방향이 바뀐 케이스다.

### 인스펙터에 꽂는 것과 씬을 뒤지는 것

2일차에 부채로 남겨둔 것 중 하나가 좀비마다 `FindAnyObjectByType`으로 플레이어를 찾는 것이었다. 오늘 스포너가 생기면서 이게 닫혔다.

![인스펙터에 Prefab과 Target이 드래그로 꽂혀 있다](/assets/images/unity-project/29-inspector-inject.png)

처음엔 이걸 성능 문제로만 봤다. 그런데 스포너는 시작할 때 한 번만 찾으니 성능 이득은 사실상 없다. 진짜 이득은 다른 데 있었다.

- 실행하기 **전에** 연결이 보장되고, 눈으로 확인이 된다
- 타입이 아니라 **개체를 특정**한다 ( `FindAnyObjectByType`은 조건에 맞는 것 중 아무거나 하나다 )
- 대상을 바꿀 때 드래그 한 번으로 끝난다

대신 제약이 있는데, 그건 개수가 아니라 **"언제 존재하느냐"** 다. 런타임에 생기는 객체, 프리팹 안에 저장되는 씬 참조, 다른 씬에 있는 것은 인스펙터로 못 꽂는다. **그래서 좀비는 인스펙터가 아니라 스포너의 주입으로 받는다.** 좀비는 실행 중에 태어나기 때문이다.

> 300마리가 각자 씬을 뒤지던 것이 **스포너 한 번 + 주입**으로 바뀌었다.

---

## 4. 부채꼴을 내적으로 판정했다 — 에러도 안 나고 좀비도 죽는데 값만 틀렸다

몽둥이는 원으로 한 번 모은 뒤 각도로 걸러낸다. 각도를 재는 데는 내적을 썼다.

내적은 두 벡터가 **얼마나 같은 쪽을 보고 있는지**를 숫자 하나로 뽑아주는 계산이다. 정확히는 이렇다.

$$
\vec{a} \cdot \vec{b} = |\vec{a}| |\vec{b}| \cos\theta
$$

양쪽 길이가 1이면 뒤에 곱해진 게 사라지고 코사인만 남는다.

$$
\hat{a} \cdot \hat{b} = \cos\theta
$$

**그러니까 정규화는 선택이 아니라 필수다.** 안 하면 거리가 멀수록 값이 커져서 **멀리 있는 좀비만 맞는다.** 지난 편에 "멀리 있는 좀비가 더 빨리 온다"고 적었던 그 구조와 똑같다.

```cs
Vector2 toTarget = hit.transform.position - transform.position;
toTarget.Normalize();

float dot = Vector2.Dot(_playerAim.AimDirection, toTarget);
if (dot < _threshold) continue;
```

부등호 방향이 헷갈렸는데, 코사인은 각도가 **커질수록 작아진다.**

| 각도 | `Dot` 값 |
|---|---|
| 0도 ( 정면 ) | 1 |
| 90도 ( 옆 ) | 0 |
| 180도 ( 정반대 ) | -1 |

그래서 "기준보다 작으면 건너뛴다"가 맞다.  
`Mathf.Abs`를 붙일까도 생각했는데 **붙이면 안 된다.** 코사인은 좌우 부호가 이미 사라진 값이라 절댓값을 씌우면 정반대 방향까지 통과해서 **나비넥타이 모양**이 된다.

### 값만 조용히 틀렸던 부분

여기까지는 맞게 짰는데, 기준값을 만드는 줄에서 사고가 났다.

```cs
// 틀림: 코사인을 안 씌우고 라디안 각도를 그대로 저장했다
_threshold = _angle / 2 * Mathf.Deg2Rad;
```

`_angle`이 90이면 `_threshold`에 `0.7854`가 들어간다. 그런데 이건 코사인 값이 아니라 **라디안으로 바꾼 각도**다. 우연히 -1과 1 사이라서 비교도 되고, 에러도 안 나고, 좀비도 잘 죽었다.

역으로 계산해보면 이 값이 코사인이 되는 각도는 약 38.2도다. 부채꼴의 반각이 그거니까 **실제로는 약 76도짜리 부채꼴**이 돌고 있었다. 90도로 설정해뒀는데 말이다.

```cs
// 맞음
_threshold = Mathf.Cos(_angle / 2 * Mathf.Deg2Rad);
```

이건 내가 찾은 게 아니라 AI가 짚어준 뒤에 왜 틀렸는지를 따라간 케이스다.. 스스로 알아채기 어려웠던 게, **틀린 티가 나는 구석이 하나도 없었기 때문**이다. 컴파일도 되고 실행도 되고 결과도 나온다. 그냥 범위가 14도 좁을 뿐이다.

> 에러가 나는 버그는 차라리 낫다. **에러도 안 나고 결과도 나오는데 값만 틀린 것**이 제일 무섭다.

### 경계선을 눈으로 보기

말로만 맞다고 하기가 찜찜해서 부채꼴의 경계선 두 개를 그렸다.

```cs
Vector2 aim   = _playerAim.AimDirection;
Vector2 left  = Quaternion.Euler(0, 0,  _angle / 2) * aim;
Vector2 right = Quaternion.Euler(0, 0, -_angle / 2) * aim;
```

![초록 조준선 하나와 노란 경계선 두 개](/assets/images/unity-project/28-cone-drawray.png)

`Quaternion.Euler(0, 0, z)`는 2D에서 화면을 기준으로 한 회전이고, **양수가 반시계 방향**이다. 그리고 `Quaternion * Vector` 순서는 고정이라 뒤집어 쓰면 컴파일이 안 된다. 회전은 길이를 바꾸지 않으니 정규화된 방향을 넣으면 나오는 것도 정규화되어 있다.

처음엔 이 세 줄을 1초마다 도는 공격 코루틴 안에 넣었는데 선이 안 보였다. `Debug.DrawRay`는 기본 지속 시간이 **한 프레임**이라, 1초에 한 번 그리면 60분의 1초씩만 깜빡이고 사라진다. `Update`로 옮기니 바로 보였다.  
( Game 뷰에서 보려면 Gizmos 토글을 켜야 한다 )

---

## 5. 연출을 이벤트로 뺐다 — 그리고 짝을 맞추는 문제

피격 연출을 어디에 둘지가 다음 문제였다. `Health.TakeDamage` 안에서 바로 스프라이트를 빨갛게 만들면 되는데, 그러면 **`Health`가 시각 표현을 알게 된다.** 체력을 세는 클래스가 스프라이트 색을 아는 건 이상하다.

그래서 `Health`에 이벤트를 하나 더 열고, 연출은 그걸 구독하게 했다.

```cs
public event Action OnDied;
public event Action OnDamaged;   // 오늘 추가
```

결과가 마음에 든다. **새로운 대상에 피격 연출을 붙이고 싶으면 `Health`와 `DamageFlash` 두 컴포넌트만 붙이면 끝난다.** 플레이어든 좀비든 나중에 보스든 똑같다.

### 구독은 `OnEnable` / `OnDisable` 짝으로

구독을 어디서 걸지가 진짜 고민이었다. `Awake`에서 걸고 `OnDestroy`에서 푸는 게 자연스러워 보였는데, **풀링을 생각하면 그러면 안 된다.**

오브젝트 풀은 좀비를 죽을 때마다 지우는 대신 껐다 켜면서 재사용하는 방식이다. 객체가 파괴되지 않으니 **`OnDestroy`가 영영 안 돈다.** 즉 구독을 푸는 시점이 사라진다.

그러면 두 가지가 걸린다. 하나는 풀에서 꺼낼 때 초기화를 다시 태우는 구조로 가면 **구독이 그대로 쌓인다**는 것이다. 한 대 맞았는데 세 번 깜빡이게 된다. 다른 하나는 스포너나 매니저처럼 **자기 바깥에 있는 객체를 구독했을 때**인데, 풀에서 쉬고 있는 좀비가 이벤트를 계속 받아간다.

![풀링에서 객체는 죽지 않는다 — 그래서 짝이 중요하다](/assets/images/unity-project/33-subscribe-pair.svg)

`OnEnable`과 `OnDisable`은 활성·비활성마다 반드시 짝으로 돈다. 그래서 풀링을 붙여도 자동으로 맞는다.

```cs
void OnEnable()
{
    _health.OnDamaged += Flash;
}

void OnDisable()
{
    _health.OnDamaged -= Flash;
    _renderer.color = _originalColor;   // 깜빡이는 도중 꺼지면 빨간 채로 반납된다
}
```

**지금 이렇게 짜두면 나중에 풀링을 도입할 때 이 파일은 손댈 게 없다.**

이 감각은 Ducktopia에서 데인 적이 있어서 생겼다. 그때 Redis의 pub/sub으로 서버 헬스체크를 돌렸는데, **구독을 서버별로 제대로 갈라놓지 못한 로직 오류** 때문에 서버가 다운된 적이 있었다.. 구독을 거는 것보다 **어디서 푸느냐, 그게 반드시 짝으로 도느냐**가 훨씬 중요하다는 걸 그때 배웠다.

### 패턴을 왜 그러는지 모르고 복사했다

연출 코루틴을 이렇게 썼다.

```cs
// 틀림: 한 번 맞으면 영원히 깜빡인다
IEnumerator FlashRoutine()
{
    while (true)
    {
        _renderer.color = _flashColor;
        yield return _wait;
        _renderer.color = _originalColor;
    }
}
```

스포너와 무기의 코루틴에 `while (true)`가 있어서 그대로 가져왔다. 그런데 그 둘은 **게임 내내 반복되는 루프**고, 피격 연출은 **한 번 깜빡이고 끝나는 일회성**이다. 성격이 완전히 다른데 모양만 베꼈다.

```cs
// 맞음
IEnumerator FlashRoutine()
{
    _renderer.color = _flashColor;
    yield return _wait;
    _renderer.color = _originalColor;

    _flashRoutine = null;
}
```

마지막 줄이 중요하다. 연타 정책은 "이미 돌고 있으면 무시"로 갔는데, 그러려면 `_flashRoutine`이 **"지금 돌고 있나"를 정확히 나타내야** 한다. 다 끝난 코루틴 객체가 알아서 `null`이 되지는 않기 때문에 직접 정리해줘야 한다.

원본 색은 반드시 `Awake`에서 한 번만 저장한다. 코루틴 안에서 읽으면 **이미 빨개진 색이 원본으로 기록된다.**

> 남의 코드에서 모양을 가져올 땐 그 모양이 **왜 거기 있었는지**를 같이 가져와야 한다.

---

## 6. 알고 있는데 안 고친 것

오늘도 문제인 걸 알면서 남겨둔 게 있다. 이번엔 글을 쓰면서 새로 찾은 것도 둘 있다.

**1. 풀링을 아직 안 붙였다.** `Despawn`이 아직 `Destroy`를 부른다. 대신 콜백 구조는 다 깔아뒀으니 바꿀 곳은 `SpawnerBase` 두 줄이다.

**2. `Health`에 부활·리셋 통로가 없다.** `_alreadyDead`를 되돌릴 방법이 없어서 풀링을 붙이면 **죽은 채로 부활한 좀비**가 나온다. 1번과 직결된다.

**4. `WaitForSeconds` 캐싱이 공격속도 스탯과 충돌한다.** 스포너·무기·연출 세 곳이 걸린다. 스탯이 바뀔 때 다시 만들거나, `Time.time` 기준으로 바꾸는 두 갈래가 있다.

**5. `Random.insideUnitCircle.normalized`가 0 벡터를 돌려줄 수 있다.** 확률은 낮은데 걸리면 **플레이어 발밑에 좀비가 튀어나온다.** 각도를 직접 뽑는 방식으로 바꾸면 구조적으로 사라진다.

**6. 부채꼴 시각화의 `Quaternion.Euler` 계산이 빌드에도 남는다.** `Debug.DrawRay` 자체는 빌드에서 빠지지만 위에서 회전을 계산하는 두 줄은 그대로 매 프레임 돈다.

**7. `EnemyChase._target`에 null 체크가 없다.** 플레이어가 죽어서 사라지면 좀비 전원이 매 프레임 예외를 던진다.

>  **글을 쓰려고 코드를 읽다가 나온 버그들은 추가 fix 를 통해 수정하였다.** 정리하는 행위 자체가 디버깅이 되는 경우가 있다.

---

## 정리

- **코드가 완성된 것과 그 코드가 발동하는 것은 다른 문제다.** 오늘 넷이 전부 이 모양이었다.
- **코루틴은 `StartCoroutine`에 넘겨야 돈다.** `WaitForSeconds`를 캐싱해둔 건 준비지 시작이 아니다.
- **값을 돌려주는 함수는 받아야 한다.** `Physics2D.OverlapCircleAll`도 `Vector2.SmoothDamp`도 결과를 주는 것이지 대신 해주는 게 아니다.
- **`ref`로 넘기는 인자는 내가 채우는 게 아니라 함수가 채우는 자리다.** 지역변수로 두면 매 프레임 리셋된다.
- **가드에서 로그를 남겼으면 흐름도 끊는다.** `return` 위치가 한 줄 위에 있으면 아래가 통째로 죽은 코드가 된다.
- **자동 프로퍼티는 눈에 안 보이는 필드를 하나 만든다.** 같은 뜻의 변수를 따로 두면 방이 둘로 갈라진다. 동기화를 늘리지 말고 방을 하나 없앤다.
- **순환 참조는 콜백 주입으로 끊는다.** 좀비가 스포너를 알면 스포너 없이는 죽지 못하는 좀비가 된다.
- **인스펙터 참조의 이득은 성능이 아니다.** 실행 전 확인, 개체 특정, 드래그 교체 셋이다. 대신 런타임에 생기는 것은 못 꽂아서 주입으로 간다.
- **내적이 코사인이 되려면 양쪽이 단위벡터여야 한다.** 정규화를 빼면 멀리 있는 것만 맞는다.
- **코사인은 각도가 커질수록 작아진다.** 그래서 기준보다 작으면 건너뛴다. `Mathf.Abs`를 붙이면 나비넥타이가 된다.
- **에러도 안 나고 결과도 나오는데 값만 틀린 게 제일 무섭다.** `Mathf.Cos`를 빠뜨려서 90도가 76도로 돌고 있었다.
- **`Debug.DrawRay`의 기본 지속 시간은 한 프레임이다.** 주기가 긴 코루틴 안에 두면 안 보인다.
- **연출은 `Health`가 아니라 이벤트를 구독하는 쪽이 한다.** 새 대상은 컴포넌트 두 개만 붙이면 끝난다.
- **구독은 `OnEnable`/`OnDisable` 짝으로 건다.** 풀링에서는 객체가 파괴되지 않아 `OnDestroy`가 영영 안 돌기 때문이다.
- **패턴은 모양만 베끼면 안 된다.** 반복 루프의 `while (true)`를 일회성 연출에 그대로 옮겨서 영원히 깜빡였다.

## 참고 자료

- [Unity 6000.0 Scripting API - MonoBehaviour.StartCoroutine](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/MonoBehaviour.StartCoroutine.html)
- [Unity 6000.0 Scripting API - Vector2.SmoothDamp](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Vector2.SmoothDamp.html)
- [Unity 6000.0 Scripting API - Physics2D.OverlapCircleAll](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Physics2D.OverlapCircleAll.html)
- [Unity 6000.0 Scripting API - Debug.DrawRay](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Debug.DrawRay.html)
- [Unity 6000.0 Manual - Order of execution for event functions](https://docs.unity3d.com/6000.0/Documentation/Manual/execution-order.html)
- [Microsoft Learn - 자동 구현 속성](https://learn.microsoft.com/ko-kr/dotnet/csharp/programming-guide/classes-and-structs/auto-implemented-properties)
- [지난 편 - 유니티 학습 프로젝트 < 3 >](https://bbie-6772.github.io/unity-project/2026/08/29/unity-project.html)

## 한줄 평

- 코어 루프가 한 바퀴 돈 건 뿌듯한데, 그 절반이 다 써놓은 코드를 켜는 스위치 찾느라 날아간 시간이라 좀 허탈하다..
