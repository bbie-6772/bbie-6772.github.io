---
layout: post
title: 유니티 학습 프로젝트 - < 5 >
subtitle: 상속 계층을 세우는 데 오전을 다 썼고, 그동안 화면엔 좀비가 없었다
author: bbie
categories: unity-project
banner:
  image: /assets/images/unity-project/34-banner.jpg
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [game, Unity, csharp, 상속, 설계]
---

## 개요

[지난 편](https://bbie-6772.github.io/unity-project/2026/08/30/unity-project.html)은 개발 3일차 오후 이야기였다. 코어 루프가 한 바퀴 돌았고, 다 써놓은 코드가 안 돌아서 절반을 날렸다.

이 글은 그 앞의 오전 이야기다. **파일 하나를 만드는 데 오전을 통째로 썼고, 그동안 화면에는 좀비가 한 마리도 없었다.**

그 파일이 `SpawnerBase`다. 좀비 스포너, 아이템 스포너, 보스 스포너가 나중에 다 생길 테니 공통 부모를 하나 두자는 생각이었다. 코드는 50줄이 안 되는데 그 50줄을 정하느라 결정을 여섯 번쯤 했다.

지금 와서 보면 **그중 몇 개는 안 해도 됐을 결정**이다. 그런데 몇 개는 안 했으면 나중에 확실히 물렸을 것들이라, 어느 쪽이 어느 쪽이었는지 남겨두려고 이 글을 따로 뺐다.

> **이번 글이 답할 질문. 화면에 아무것도 없는 채로 종이 위 설계에 매달린 시간은, 얼마가 적당한가?**

---

## 1. `abstract`인가 `virtual`인가 — 안 채우면 반드시 버그인가

부모 클래스가 자식에게 "이건 네가 채워라"라고 시키는 방법이 두 개 있다.

- `abstract` — **본문이 아예 없다.** 자식이 안 채우면 컴파일이 안 된다
- `virtual` — **기본 구현은 있다.** 자식이 필요하면 바꾸고, 아니면 그냥 둔다

처음엔 감으로 골랐다. 중요해 보이면 `abstract`, 아니면 `virtual`. 그런데 그러면 기준이 매번 흔들려서, 판단 문장을 하나 정해두기로 했다.

> **안 채우면 반드시 버그인가.** 그렇다면 `abstract`, 아니면 `virtual`.

이 문장으로 네 개를 갈랐다.

| 메서드 | 안 채우면 | 결정 |
|---|---|---|
| `GetSpawnPosition` | **어디에 만들지가 정해지지 않는다.** 기본값이라는 게 존재할 수 없다 | `abstract` |
| `Setup` | 만들어놓고 아무것도 안 넣어준다. **스포너의 존재 의미가 없어진다** | `abstract` |
| `OnInit` | 초기화할 게 없는 스포너가 실제로 있다 | `virtual` |
| `Cleanup` | 치울 게 없는 스포너가 실제로 있다 | `virtual` |

`OnInit`은 처음에 `abstract`로 만들었다가 되돌렸다. 이유는 단순한데, `EnemySpawner`에서 그게 **빈 블록으로 남았기 때문**이다.

```cs
protected override void OnInit()
{
}
```

강제한 쪽이 아무것도 못 막았다는 증거였다. 컴파일러가 "채워라"라고 시켜서 채운 게 빈 중괄호라면, 그 강제는 안전을 만든 게 아니라 **줄 수만 늘린 것**이다.

> 빈 `override`는 코드가 아니라 노이즈다. 강제가 아무것도 막지 못했으면 그 강제는 비용만 남긴다.

---

## 2. 부모가 `Awake`를 가져가면 자식은 어디에 쓰나

여기가 오전의 절반을 먹은 지점이다.

`SpawnerBase`는 `Awake`에서 프리팹이 꽂혀 있는지 검사한다. 안 꽂혀 있으면 에러를 찍고 자기를 꺼버리는, 없으면 안 되는 가드다.

```cs
protected void Awake()
{
    OnInit();

    if (_prefab) return;

    Debug.LogError("Prefab을 선택하지 않았습니다.", this);
    enabled = false;
}
```

문제는 자식도 `Awake`가 필요하다는 것이다. `EnemySpawner`는 타겟이 꽂혀 있는지 검사하고 `WaitForSeconds`를 만들어둬야 한다.

그런데 자식이 아무 생각 없이 `void Awake()`를 선언하면 **부모의 `Awake`가 그냥 안 돈다.** 이름이 같은 메서드로 덮어써지기 때문이다. 더 고약한 건 이때 컴파일러가 **`CS0108` 경고만 띄우고 빌드는 통과시킨다**는 것이다. 경고는 콘솔에서 스크롤 몇 번이면 밀려 올라간다.

![자식이 Awake를 선언하면 부모의 가드가 조용히 사라진다](/assets/images/unity-project/35-awake-hook.svg)

해결책을 셋 놓고 봤다.

| 방법 | 어떻게 | 왜 안 골랐나 / 골랐나 |
|---|---|---|
| 1 | 부모 `Awake`를 `virtual`로 두고 자식이 `base.Awake()`를 부르는 관례 | **깜빡하면 컴파일러가 못 잡는다.** 사람이 기억해야 하는 규칙이 하나 늘어난다 |
| 2 | `csc.rsp`로 `CS0108`을 에러로 승격 | 프로젝트 전체 설정을 건드린다. 이 규모에서는 과하다 |
| 3 | **부모가 콜백을 독점하고, 다른 이름의 훅을 열어준다** | **채택.** 자식은 `Awake`라는 이름을 아예 쓸 일이 없어진다 |

1번은 지금도 매력적으로 보인다. 흔히 쓰는 방식이기도 하고. 그런데 **혼자 만드는 프로젝트에서 "잊지 말자" 규칙을 늘리는 건 제일 안 지켜지는 종류**라서 접었다. 자식이 둘밖에 없는 지금은 3번이 더 싸다.

여기서 규칙 하나가 나왔다.

> **부모가 점유한 콜백만 훅으로 연다.** `Start`·`Update`·`OnEnable`은 부모가 안 쓰니까 훅이 필요 없다.

`Start` 훅도 팔지 잠깐 고민했는데 이 기준으로 바로 정리됐다. 부모가 `Start`를 안 쓰니 자식이 그냥 `Start`를 쓰면 된다.

### 이름을 짓는 데 또 시간을 썼다

훅 이름 첫 후보가 `SetAwake`였다. 근데 AI와 대화하며 현재까지의 명칭 컨벤션을 비교하니 아래와 같은 팩트를 꽂아왔다..

- **`SetX`는 "X를 설정한다"로 굳어진 이름이다.** 이 함수는 `Awake`를 설정하는 게 아니라 초기화를 하는 것이라 뜻이 거짓말이 된다
- **이름에 `Awake`를 넣으면 Unity 콜백과 헷갈린다.** 이건 Unity가 부르는 게 아니라 부모가 부르는 함수다

그래서 `OnInit`으로 갔다. `On~`은 "무슨 일이 생겼을 때"라는 뜻으로 이미 익숙하고, 여기서는 부모가 초기화를 시작할 때 불린다.

> 이름 하나에 5분을 썼는데, 나중에 아이템 스포너를 만들 나는 이 이름만 보고 뭘 채워야 할지 알아야 한다. 그때의 나는 이 글을 안 읽는다.

---

## 3. `Awake`와 `Start`의 진짜 경계 — 잡는 것과 읽는 것

컨벤션 문서에 이렇게 적어뒀었다. "`Awake`는 자기 초기화, `Start`는 다른 오브젝트와의 연결."

써보니 이 문장이 애매했다. **"다른 오브젝트"의 경계가 스크립트인지 GameObject인지**가 안 적혀 있었기 때문이다. 같은 GameObject에 붙은 다른 컴포넌트는 "다른 오브젝트"인가?

기준을 다시 잡았다.

| | `Awake` | `Start` |
|---|---|---|
| **참조를 잡는 것** ( `GetComponent` ) | O | |
| **그 참조의 값을 읽는 것** | | O |
| 근거 | 객체가 존재한다는 건 이미 보장된다 | 상대의 초기화가 끝났다는 게 보장된다 |

같은 GameObject 안에서도 컴포넌트끼리 `Awake` 순서는 보장되지 않는다. 그러니 **`GetComponent`는 `Awake`에 두되, 그 값을 쓰는 건 뒤로 미룬다.**

`MeleeWeapon`이 딱 이 모양이다.

```cs
void Awake()
{
    _playerAim = GetComponent<PlayerAim>();   // 잡기만 한다
    _threshold = Mathf.Cos(_angle / 2 * Mathf.Deg2Rad);
}

void Update()
{
    Vector2 aim = _playerAim.AimDirection;    // 읽는 건 Start 이후
}
```

`Update`도 코루틴도 전부 `Start` 다음에 돌기 때문에, 그때는 `PlayerAim`의 초기화가 끝나 있다.

### 스폰된 좀비는 언제 준비가 끝나나

여기서 하나 확인이 필요했다. 스포너가 좀비를 만들자마자 `Setup`으로 타겟과 콜백을 주입하는데, **좀비 자신의 초기화보다 먼저 들어가면 덮어써질 수 있지 않나.**

`Instantiate`는 그 자리에서 **`Awake`와 `OnEnable`을 동기적으로 즉시** 부른다. 반면 `Start`는 다음 사이클로 미뤄진다.

```cs
GameObject obj = Instantiate(_prefab, GetSpawnPosition(), Quaternion.identity);
// 여기까지 오면 좀비의 Awake는 이미 끝나 있다
Setup(obj);
// 좀비의 Start는 아직 안 돌았다
```

그래서 순서가 `좀비의 Awake` → `주입` → `좀비의 Start`가 되어 안전하다.

### 코루틴 시작은 `Start`로 통일했다

처음엔 스폰 루프를 `Awake`에서 시작해볼까 했는데, 이건 안 된다.

부모의 프리팹 가드가 `enabled = false`로 컴포넌트를 끄는데, **이미 시작된 코루틴은 `enabled = false`로 안 멈춘다.** 프리팹이 없는 상태로 스폰 루프가 계속 돌아서 매초 에러를 뿜게 된다.

`Start`에서 시작하면 그 전에 가드가 이미 걸려 있으니 애초에 시작조차 안 한다.

> 코루틴은 `SetActive(false)`로는 멈추고 `enabled = false`로는 안 멈춘다. **이 비대칭을 모르면 가드가 새는 줄도 모른다.**

---

## 4. 타이머를 코루틴으로 고른 건 성능 때문이 아니다

스폰 주기를 만드는 방법이 셋 있었다.

| | `Update` 타이머 | `InvokeRepeating` | 코루틴 |
|---|---|---|---|
| 상태를 어디 두나 | 필드로 노출된다 | 내부에 숨는다 | 상태 기계 안에 캡슐화 |
| 매 프레임 검사 | 있다 | 없다 | 없다 |
| 타입 안전성 | O | **X ( 함수 이름을 문자열로 넘긴다 )** | O |
| 순차 시퀀스 표현 | 매우 어렵다 | 불가능 | **자연스럽다** |

처음엔 "매 프레임 `if`를 도니까 `Update` 타이머가 무겁겠지"라고 생각했는데, 스포너 하나에서는 그게 티도 안 난다. **성능은 판단 근거가 아니었다.**

진짜 근거는 마지막 줄이다. 기획서에 웨이브가 이미 이렇게 적혀 있다.

```
5초 대기 → 좀비 10마리 → 3초 대기 → 좀비 20마리 → 보스
```

이걸 `Update` 타이머로 짜면 **지금 몇 번째 웨이브인지, 그 웨이브의 몇 단계인지, 남은 마릿수가 몇인지**를 전부 필드로 들고 `switch`로 관리해야 한다. 손으로 상태 기계를 짜는 일이다.

코루틴으로 짜면 그냥 위에서 아래로 적으면 된다.

```cs
yield return new WaitForSeconds(5f);
for (int i = 0; i < 10; i++) Spawn();
yield return new WaitForSeconds(3f);
```

**컴파일러가 그 상태 기계를 대신 만들어주기 때문**이다. 2일차에 `IDamageable`을 "무기가 3종이라고 기획서에 적혀 있어서" 만들었던 것과 같은 판단 방식이다. "언젠가 필요할 것 같아서"가 아니라 **문서에 근거가 있어서** 고른 것이다.

### 더 쉬운 비유로

> 코루틴은 새 일꾼을 부르는 게 아니다  
> 하던 일에 책갈피를 꽂고 잠깐 자리를 비켜주는 것이다  
> 그리고 그 책갈피 자리는 코드에 `yield`로 다 적혀 있다

`IEnumerator`는 Unity 것이 아니라 .NET에 원래 있던, 순서대로 하나씩 꺼내주는 표준 인터페이스다. 함수 안에 `yield return`이 있으면 컴파일러가 그 함수를 **상태 기계 클래스로 통째로 다시 써준다.** 지역변수는 필드가 되고, 어디까지 진행했는지는 정수 하나로 남는다.

`StartCoroutine`은 그 상태 기계를 프레임마다 한 칸씩 진행시키고, `yield`가 돌려준 값을 보고 언제 다시 진행할지 정한다. 그래서 `WaitForSeconds`는 **기다리는 기능이 아니라 "이만큼 뒤에 깨워달라"는 표식**일 뿐이고, 그래서 미리 만들어두고 재사용해도 안전하다.

그리고 중요한 것 하나. **코루틴은 스레드가 아니다.** 진짜로 동시에 도는 게 아니라, 한 줄로 서서 서로 양보하는 방식이다.

- 전환 지점이 `yield`로 코드에 다 보이니까 **여러 개가 동시에 같은 값을 건드려서 꼬이는 문제가 원천적으로 없다**
- 대신 무거운 계산을 넘겨서 대신 돌려달라는 용도로는 못 쓴다. 그건 그냥 그 프레임이 멈춘다
- 구현 특성상 `yield`는 코루틴 본문에서만 쓸 수 있다. 헬퍼 함수 안으로 빼면 안 된다

---

## 5. 대상을 `Transform`으로 잡은 이유

스포너가 들고 있는 추격 대상을 `Transform`으로 할지 `PlayerMovement` 같은 구체 타입으로 할지도 고민했다.

| | 구체 타입 | `Transform` |
|---|---|---|
| 인스펙터 실수 | 엉뚱한 프리팹을 못 꽂는다 | 위치만 있으면 다 꽂힌다 |
| 의존 범위 | 실제 필요보다 넓어진다 | 위치 하나뿐 |
| 기획 변경 | 코드를 고쳐야 한다 | **코드를 안 고치고 바꿀 수 있다** |

스폰 중심을 카메라로 잡거나, 맵의 특정 지점으로 잡거나, 보스 주변으로 잡는 웨이브가 나올 수 있다. 그래서 `Transform`으로 갔다.  
사실 필드 이름을 `_player`가 아니라 `_target`으로 지은 시점에 답은 이미 나와 있었다.

> 이름이 의존 범위를 먼저 말해준다. `_target`이라고 적어놓고 `PlayerMovement`를 넣는 건 앞뒤가 안 맞는다.

---

## 6. 설계하는 동안 컴파일러가 여섯 번 잡아줬다

`SpawnerBase`를 세우는 동안 컴파일 에러를 여섯 번 만났다. 지난 편이 **실행해야 보이는 문제**들이었다면, 이쪽은 **틀린 걸 컴파일러가 대신 찾아줬다.** C#의 상속 문법을 처음 제대로 써봐서 그런지 절반이 상속 관련이다.

### `CS0592` — 속성은 붙는 자리가 정해져 있다

![Serializable 특성이 이 선언 형식에서는 유효하지 않다는 CS0592](/assets/images/unity-project/22-cs0592.png)

```cs
[Serializable] private GameObject _enemyPrefab;   // 틀림
[SerializeField] private GameObject _prefab;      // 맞음
```

이름이 비슷해서 헷갈렸는데 아예 다른 것이다. `[Serializable]`은 `System` 소속이고 **타입( 클래스·구조체·열거형 )** 에 붙인다. 인스펙터에 필드를 노출하는 건 `UnityEngine` 소속의 `[SerializeField]`다.

### `CS0501` — `virtual`은 "본문이 있다"는 뜻이다

![Cleanup이 abstract, extern 또는 partial로 표시되어 있지 않으므로 본문을 선언해야 한다는 CS0501](/assets/images/unity-project/23-cs0501.png)

```cs
protected virtual void Cleanup(GameObject obj);    // 틀림
protected virtual void Cleanup(GameObject obj) {}  // 맞음
```

`abstract`는 "본문이 없으니 자식이 반드시 채워라"라서 세미콜론으로 끝낼 수 있다. `virtual`은 **"기본 구현은 있고, 원하면 자식이 바꿔라"** 라서 본문이 필수다. 빈 중괄호라도 있어야 한다.

1번 섹션에서 정한 기준이 여기서 문법으로도 확인된 셈이다. `virtual`은 애초에 **채워둔 게 있다는 선언**이다.

### `CS0161` — 모든 경로가 값을 돌려줘야 한다

![Spawn의 코드 경로 중 일부만 값을 반환한다는 CS0161과 사용하지 않는 멤버라는 IDE0051](/assets/images/unity-project/21-cs0161-ide0051.png)

껍데기만 만들어둔 `Spawn`에서 났다. 반환형이 `GameObject`라고 적어놨으면 **어느 갈래로 빠져나가든** 값을 하나 들고 나와야 한다.

같은 화면에 `IDE0051`도 같이 떠 있는데, 이건 성격이 다르다. `Spawn`을 아직 아무도 안 부른다는 **제안**이지 에러가 아니다.

> 앞의 두 글자로 갈린다. **`CS`는 컴파일러 진단, `IDE`는 스타일 제안.**

### `CS0037` — `Vector2`에는 `null`을 못 넣는다

![Vector2는 null을 허용하지 않는 값 형식이라는 CS0037](/assets/images/unity-project/24-cs0037.png)

`Spawn`의 가드를 그대로 흉내내서 `GetSpawnPosition`에도 `return null;`을 썼다가 났다. `GameObject`는 참조 형식이라 "없음"을 `null`로 표현할 수 있지만, `Vector2`는 **값 형식**이라 없음이라는 상태 자체가 없다. `Vector2.zero`도 엄연히 좌표 하나다.

### `CS0029` — `if (obj)`가 되던 건 Unity 덕분이었다

![IDamageable을 bool로 변환할 수 없다는 CS0029](/assets/images/unity-project/25-cs0029.png)

```cs
IDamageable enemy = hit.GetComponent<IDamageable>();
if (enemy) { ... }          // 틀림
if (enemy != null) { ... }  // 맞음
```

지금까지 `if (chase)` 처럼 잘만 써왔는데 인터페이스에서만 안 됐다. 이유는 `UnityEngine.Object`가 **`bool`로 바꾸는 연산자를 따로 정의해뒀기** 때문이다. 순수 C# 인터페이스에는 그런 게 없다. Unity가 편의로 얹어준 걸 C# 문법이라고 착각하고 있었다.

### `CS1612` — 프로퍼티가 돌려준 건 복사본이다

![Transform.position은 변수가 아니므로 반환 값을 수정할 수 없다는 CS1612](/assets/images/unity-project/27-cs1612.png)

```cs
transform.position.z = _z;   // 틀림
```

`transform.position`은 필드가 아니라 프로퍼티고, `Vector3`는 값 형식이다. 그래서 `position`을 읽으면 **그 자리에서 복사본이 하나 만들어진다.** 거기에 `z`를 넣어봐야 복사본만 바뀌고 원본에는 반영이 안 된다. 컴파일러가 "그건 아무 효과도 없다"고 미리 막아준 것이다.

그래서 좌표는 **통째로 새로 만들어 대입**해야 한다.

```cs
transform.position = new Vector3(currentPosition.x, currentPosition.y, _z);
```

### 그리고 빌드에서만 터질 뻔한 것

`using TreeEditor;` 가 파일 맨 위에 들어가 있는 걸 발견해서 지웠다. IDE가 자동으로 넣어준 것이었다.

이건 **에디터 전용 네임스페이스**라 유니티 에디터 안에서는 멀쩡히 돌아가고 빌드할 때만 터진다. 2일차의 `using System;` → `CS0104`와 같은 계열인데, 발현 시점이 훨씬 늦어서 더 고약하다. 아직 빌드를 한 번도 안 해봤으니 비슷한 게 더 있을 수도 있다..

> IDE가 자동으로 넣어준 `using`은 한 번 의심해볼 만하다. 2일차에 이어 두 번째다.

---

## 7. 그래서 오전이 아까웠나

솔직히 절반은 아까웠다.

훅 이름 하나에 20분을 쓴 것, `Start` 훅을 팔지 고민한 것, "총괄 관리 클래스"를 하나 더 만들려다 멈춘 것은 **화면에 좀비 한 마리 안 띄운 채로 종이 위에서만 돈 시간**이다. 스포너를 대충 만들어서 좀비를 먼저 띄우고, 아이템 스포너를 실제로 만들 때 공통 부분을 뽑았어도 됐다.

그런데 나머지 절반은 안 아까웠다. 특히 2번 섹션이 그렇다. `Awake` 문제는 **한번 잘못 짜두면 나중에 자식이 늘어날 때마다 조용히 재발하는 종류**라, 자식이 하나뿐인 지금 결정해두는 게 제일 싸다. 나중에 스포너가 셋이 됐을 때 셋 다 뒤지는 것보다 낫다.

가르는 기준이 뭘까 생각해봤는데, 이렇게 정리됐다.

| 미리 정해두는 게 싼 것 | 나중에 정해도 되는 것 |
|---|---|
| **잘못 짜면 조용히 반복 재발**하는 구조 ( 콜백 점유, 구독 짝 ) | 이름, 폴더 구조 |
| **고칠 곳이 자식 수만큼 늘어나는** 것 | 한 파일 안에서 끝나는 것 |
| 기획서에 **숫자가 이미 적혀 있는** 것 ( 무기 3종, 웨이브 ) | "언젠가 필요할 것 같은" 것 |

> 설계에 쓴 시간이 아까운지 아닌지는 **그 결정을 나중에 되돌릴 때 몇 군데를 고쳐야 하느냐**로 갈린다. 한 군데면 나중에 해도 된다.

---

## 정리

- **`abstract`와 `virtual`은 "안 채우면 반드시 버그인가"로 가른다.** 그렇다면 `abstract`, 채울 게 없는 자식이 실제로 있으면 `virtual`.
- **빈 `override`가 남았다면 그 강제는 실패한 것이다.** 아무것도 안 막고 줄만 늘렸다.
- **`virtual`은 문법적으로도 본문이 필수다.** 세미콜론으로 끝낼 수 있는 건 `abstract`뿐이다.
- **자식이 `void Awake()`를 선언하면 부모의 `Awake`가 조용히 사라진다.** `CS0108`은 에러가 아니라 경고라 빌드가 그냥 통과한다.
- **부모가 점유한 콜백만 훅으로 연다.** 부모가 안 쓰는 `Start`·`Update`에는 훅이 필요 없다.
- **훅 이름에 `Awake`를 넣으면 안 된다.** Unity가 부르는 콜백과 헷갈린다. `SetX`도 "설정한다"는 뜻이라 거짓말이 된다.
- **참조를 잡는 건 `Awake`, 그 값을 읽는 건 `Start` 이후.** 같은 GameObject 안에서도 `Awake` 순서는 보장되지 않는다.
- **`Instantiate`는 `Awake`와 `OnEnable`을 즉시 부르고 `Start`는 미룬다.** 그래서 만든 직후의 주입이 안전하다.
- **코루틴은 `SetActive(false)`로는 멈추고 `enabled = false`로는 안 멈춘다.** 그래서 시작은 `Start`에서 한다.
- **코루틴을 고른 근거는 성능이 아니라 시퀀스 표현력이다.** 웨이브를 `Update` 타이머로 짜면 상태 기계를 손으로 짜게 된다.
- **`yield return`이 있으면 컴파일러가 함수를 상태 기계로 다시 쓴다.** `WaitForSeconds`는 대기 기능이 아니라 표식이라 캐싱해도 안전하다.
- **코루틴은 스레드가 아니다.** 전환 지점이 `yield`로 다 보여서 값이 꼬일 일이 없는 대신, 무거운 계산을 떠넘길 수는 없다.
- **이름이 의존 범위를 먼저 말해준다.** `_target`이라고 지은 순간 `Transform`이 답이었다.
- **`CS`는 에러, `IDE`는 제안.** 앞 두 글자로 갈린다.
- **`if (obj)`가 되던 건 `UnityEngine.Object`가 `bool` 변환 연산자를 정의했기 때문이다.** 순수 C# 인터페이스에는 없으니 `!= null`.
- **프로퍼티가 돌려주는 구조체는 복사본이다.** `transform.position.z = _z;`가 막히는 이유이고, 좌표는 통째로 대입해야 한다.
- **미리 정할 값어치가 있는 건 "고칠 곳이 자식 수만큼 늘어나는" 결정뿐이다.** 한 파일에서 끝나는 건 나중에 해도 된다.

## 참고 자료

- [Microsoft Learn - abstract 한정자](https://learn.microsoft.com/ko-kr/dotnet/csharp/language-reference/keywords/abstract)
- [Microsoft Learn - virtual 한정자](https://learn.microsoft.com/ko-kr/dotnet/csharp/language-reference/keywords/virtual)
- [Microsoft Learn - new 한정자로 멤버 숨기기](https://learn.microsoft.com/ko-kr/dotnet/csharp/language-reference/keywords/new-modifier)
- [Microsoft Learn - yield 문](https://learn.microsoft.com/ko-kr/dotnet/csharp/language-reference/statements/yield)
- [Unity 6000.0 Manual - Coroutines](https://docs.unity3d.com/6000.0/Documentation/Manual/Coroutines.html)
- [Unity 6000.0 Manual - Order of execution for event functions](https://docs.unity3d.com/6000.0/Documentation/Manual/execution-order.html)
- [Unity 6000.0 Scripting API - SerializeField](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/SerializeField.html)
- [지난 편 - 유니티 학습 프로젝트 < 4 >](https://bbie-6772.github.io/unity-project/2026/08/30/unity-project.html)

## 한줄 평

- 50줄짜리 부모 클래스에 오전을 다 썼는데, 그중 정말 미리 정했어야 할 건 두 개뿐이었던 것 같다..
