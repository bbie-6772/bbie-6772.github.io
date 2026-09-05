---
layout: post
title: 유니티 학습 프로젝트 - < 8 >
subtitle: 두 줄의 순서를 바꿨더니 동작했다, 그래서 되돌아갔다
author: bbie
categories: unity-project
banner:
  image: /assets/images/unity-project/42-banner.jpg
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [game, Unity, csharp, 이벤트, 트러블슈팅]
---

## 개요

[지난 편](https://bbie-6772.github.io/unity-project/2026/09/05/unity-project.html)에서 레벨업이 한 프레임에 세 번 발화되는 걸 카운터 하나로 정리했다. 창은 한 번만 열리고, 카드를 고르면 남은 만큼 다시 열린다.

그런데 그 "다시 열린다"가 화면 쪽에서 사고를 냈다. 카드를 고르면 **창이 사라진 채로 게임이 멈춰버렸다.**

고치는 데는 오래 안 걸렸다. 두 줄의 순서를 바꾸니 동작했다. 문제는 그다음이었다. 동작하니까 일단 넣어두고 넘어갔는데, 커밋하려고 다시 보다가 **"이게 왜 되는 거지?"** 가 걸렸다. 그래서 되돌아갔다.

> **이번 글이 답할 질문. 우연히 맞는 코드를 어떻게 알아보는가?**

---

## 1. 창이 사라진 채로 게임이 멈췄다

증상부터. 카드를 클릭하면 카드 창이 사라지는데, 게임은 여전히 정지 상태다. 클릭할 것도 없고 움직일 수도 없다.

화면 쪽 클릭 처리는 이렇게 생겼었다.

```cs
void HandleCardClicked(UpgradeCard card)
{
    _selector.Select(card);      // 카드 적용
    _panel.SetActive(false);     // 창 닫기
}
```

읽으면 자연스럽다. 고른 카드를 적용하고, 창을 닫는다. 순서도 맞아 보인다.

그런데 `Select` 안에서 무슨 일이 벌어지는지를 빼먹었다. **레벨업이 남아 있으면 그 안에서 창이 다시 열린다.**

| 줄 | 실제로 일어난 일 |
|---|---|
| `_selector.Select(card)` | 카드 적용 → 남은 레벨업이 있어 **패널이 켜진다** |
| `_panel.SetActive(false)` | **방금 켜진 걸 다시 끈다** |

그래서 창은 없는데 `timeScale`은 0인 상태가 남는다. 게임이 멈춘 채로 아무것도 할 수 없다.

여기서 이런 걸 **재진입**이라고 부른다. 어떤 함수가 끝나기 전에 그 함수가 다시 불리는 상황이다.

### 두 줄을 바꾸니 됐다

```cs
_panel.SetActive(false);     // 먼저 끄고
_selector.Select(card);      // 그다음 적용 (여기서 다시 켜져도 살아남는다)
```

동작했다. 그래서 일단 넣고 다음 작업으로 넘어갔다..

그런데 커밋 직전에 다시 보니 마음이 불편했다. **왜 되는지를 설명할 수 있어야 하는데, 설명이 "순서를 바꿨더니 됐다"밖에 안 나온다.**

> 순서를 바꿔서 동작한 코드는 고쳐진 게 아니다. **다음에 이 두 줄 사이에 뭔가 한 줄 끼는 순간 조용히 다시 깨진다.**

---

## 2. 닫는 신호도 발행자가 갖는다

되돌아가서 생각한 건 하나였다. **창을 닫아야 할 때가 언제인지를 누가 아는가.**

"다 끝났다"를 아는 건 남은 레벨업 수를 들고 있는 `CardSelector`뿐이다. 화면은 카운터를 모른다. 모르는 쪽이 판단하고 있었으니 순서에 기댈 수밖에 없었던 것이다.

여는 신호는 이미 `CardSelector`가 갖고 있었다. 그럼 닫는 신호도 같은 자리에 있어야 대칭이 맞는다.

![여는 쪽과 닫는 쪽이 다르면 순서에 걸린다](/assets/images/unity-project/51-open-close-symmetry.svg)

```cs
// CardSelector
public event Action<IReadOnlyList<UpgradeCard>> OnSelectionOpened;
public event Action OnSelectionClosed;

public void Select(UpgradeCard card)
{
    if (_pendingLevelUps <= 0) { return; }

    _applier.Apply(card);
    --_pendingLevelUps;

    if (_pendingLevelUps > 0)
    {
        OpenSelection();              // 남았으면 다시 연다
    }
    else
    {
        OnSelectionClosed?.Invoke();  // 다 끝났을 때만 닫는 신호
        Time.timeScale = 1f;
    }
}
```

화면 쪽은 이렇게 줄었다.

```cs
void HandleCardClicked(UpgradeCard card)
{
    _selector.Select(card);
}

void HandleSelectionClosed()
{
    _panel.SetActive(false);
}
```

클릭 처리가 **한 줄**이 됐다. 순서 의존은 아예 사라졌다. 두 줄이 없으니 순서를 틀릴 수가 없다.

### 더 쉬운 비유로

> 불을 켠 사람이 끄고 나오는 것과  
> 뒤에 들어온 사람이 대신 꺼주는 것

뒷사람이 꺼주는 방식도 평소엔 잘 굴러간다. 문제는 **앞사람이 아직 안 나왔을 때**다. 방에 사람이 있는데 불이 꺼진다.

방에 누가 남았는지는 처음 들어간 사람만 안다. 그러니 스위치는 그 사람이 쥐고 있어야 한다.

> **상태를 아는 쪽이 신호를 보낸다.** 모르는 쪽이 대신 판단하기 시작하면 순서로 때우게 된다.

---

## 3. 버튼에 카드를 넘기는 법

카드 창을 만들면서 처음 막힌 건 다른 곳이었다. **버튼이 자기가 어떤 카드인지를 알아야 한다.**

유니티 버튼은 인스펙터에서 클릭 시 실행할 함수를 마우스로 연결할 수 있다. 그런데 거기서 넘길 수 있는 인자는 **미리 고정해둔 값 하나뿐**이다. 카드는 창이 열릴 때마다 바뀌는데, 고정값으로는 넘길 방법이 없다.

재시작 버튼은 이 방식으로 충분했다. 항상 같은 일만 하니까.

### 람다를 쓰면 함정이 둘 열린다

코드로 붙이면 되지 않나 싶어서 이걸 떠올렸다.

```cs
// 검토했다가 버린 방식
for (int i = 0; i < 3; ++i)
{
    _buttons[i].onClick.AddListener(() => Select(cards[i]));
}
```

여기서 `() => ...` 를 **람다**라고 부른다. 이름 없이 그 자리에서 만드는 함수다. 짧게 쓸 수 있어 편한데, 두 가지가 걸렸다.

| 함정 | 내용 |
|---|---|
| 뗄 수 없다 | 이름이 없으니 나중에 "그거 지워줘"라고 지목할 방법이 없다 |
| 루프 변수 캡처 | 세 버튼이 전부 **루프가 끝난 뒤의 `i`** 를 본다 |

두 번째가 특히 고약하다. 버튼 세 개가 각자 다른 카드를 가리킬 거라 생각하는데, 실제로는 셋 다 같은 걸 본다.

### 버튼마다 전용 컴포넌트를 붙였다

결국 버튼에 스크립트를 하나씩 붙이고, 카드만 갈아끼우는 방식으로 갔다.

| 시점 | 하는 일 | 몇 번 |
|---|---|---|
| `Awake` | 버튼 캐싱 + `onClick`에 `HandleClick` 등록 | **평생 한 번** |
| `SetCallback` | 눌렀을 때 부를 함수를 주입받는다 | 초기화 때 한 번 |
| `Bind(card)` | 카드 교체 + 제목 텍스트 갱신 | **창이 열릴 때마다** |
| `HandleClick` | 자기 `_card`를 들고 콜백을 부른다 | 클릭할 때마다 |

```cs
public void SetCallback(Action<UpgradeCard> onClicked)
{
    _onClicked = onClicked;
}

public void Bind(UpgradeCard card)
{
    _card = card;
    _title.text = card.Title;
}

void HandleClick()
{
    if (_card == null) { /* 경고 후 return */ }
    if (_onClicked == null) { /* 경고 후 return */ }

    _onClicked.Invoke(_card);
}
```

핵심은 두 가지다.

- **인자를 못 넘기는 문제는 필드로 풀린다.** `HandleClick`이 자기 `_card`를 읽으면 되니 람다가 필요 없다.
- **`SetCallback`과 `Bind`를 나눈 건 생명주기가 다르기 때문이다.** 합치면 창을 열 때마다 콜백까지 다시 넘겨야 한다.

### 그리고 무한 재귀를 만들었다

콜백을 주입받는 자리에 실수로 자기 메서드를 붙였다.

```cs
_onClicked += HandleClick;   // 틀림
```

`HandleClick`이 `_onClicked`를 부르고, 그 `_onClicked`가 다시 `HandleClick`을 부른다. 클릭 한 번에 유니티가 그대로 멈췄다..

> 주입받을 자리에 자기 걸 넣으면 **자기가 자기를 부르는 고리**가 생긴다. `=`이 아니라 `+=`을 쓴 게 화근이었다.

---

## 4. 람다는 뗄 수 없다 — 풀링에서 터질 자리

람다를 버튼에서만 피하고 끝낼 수도 있었는데, 프로젝트 규칙으로 박아뒀다.

> **떼야 하는 구독은 람다로 붙이지 않는다.** 명명된 메서드를 쓰거나, 함수를 필드에 담아 그 필드로 붙였다 뗀다.

계기는 다음 작업이었다. 곧 오브젝트 풀링을 넣을 예정인데, 그러면 문제가 진짜로 터질 자리가 생긴다.

풀링은 좀비를 죽을 때마다 새로 만들지 않고 **껐다 켜면서 재사용**하는 기법이다. 그런데 지금 좀비들은 켜질 때 구독하고 꺼질 때 해제하는 구조로 되어 있다.

```cs
void OnEnable()  { _health.OnDamaged += Flash; }
void OnDisable() { _health.OnDamaged -= Flash; }
```

여기서 `Flash` 대신 람다를 썼다면 어떻게 되는지가 문제다.

![같은 좀비를 재사용할 때 구독이 쌓인다](/assets/images/unity-project/52-lambda-pooling.svg)

람다는 만날 때마다 **새 객체**로 만들어진다. 글자가 한 자도 안 틀리게 똑같아도 다른 객체다. 그래서 `-=`로 떼려고 해도 "그런 건 등록된 적 없는데?" 하고 아무것도 안 지운다. 그것도 예외 없이 조용히 넘어간다.

**좀비를 100번 재사용하면 구독이 100개 쌓이고, 한 대 맞을 때마다 피격 처리가 100번 돈다.** 에러도 로그도 없이 데미지 숫자만 틀린다.

### 이벤트의 성질 몇 가지

이 김에 정리해둔 것들이다.

| 성질 | 내용 |
|---|---|
| 실행 순서 | 구독한 순서대로. 다만 **그렇게 동작할 뿐 보장된 약속은 아니다** |
| 중복 구독 | `+=`를 두 번 하면 두 번 호출된다 |
| `-=` | 일치하는 것 중 **마지막 하나만** 지운다 |
| 등록 안 된 걸 해제 | 예외 없이 조용히 통과 |

마지막 줄이 람다 문제를 조용하게 만드는 이유다. 못 지웠다고 알려주는 사람이 아무도 없다.

> 핸들러 실행 순서가 중요해지는 순간, 그건 이벤트가 아니라 **호출 순서가 눈에 보이는 다른 구조**를 써야 한다는 신호다.

### 그럼 항상 해제해야 하나

아니다. 판단 기준을 둘로 정리했다.

1. 구독하는 코드가 **두 번 이상 실행되는가** — `OnEnable`은 그렇고 `Start`는 아니다
2. **발행자보다 구독자가 먼저 사라질 수 있는가**

둘 다 아니면 생략해도 된다. 이 게임은 씬을 다시 불러서 재시작하니 발행자와 구독자가 같이 사라진다.

---

## 5. 한글이 안 나왔다 — Characters included: 0/0

구조를 다 잡고 실행했는데 카드가 이렇게 나왔다.

![카드 세 장에 글자가 하나도 없고 콘솔엔 경고가 가득하다](/assets/images/unity-project/48-card-no-glyph.png)

흰 사각형 세 개. 제목이 통째로 안 보인다.

콘솔 경고를 읽으니 원인이 나왔다. 어떤 글자가 폰트에 없어서 대체 문자로 바꿨다는 내용인데, 목록에 **` `** 이 끼어 있다. 그건 한글도 뭣도 아닌 그냥 **공백**이다.

> 공백조차 없다는 건 글자 하나를 못 찾은 게 아니라 **폰트에 아무것도 안 들어 있다**는 뜻이다.

유니티에서 한글을 쓰려면 폰트 파일을 그대로 못 쓰고, 필요한 글자들을 미리 그림으로 구워둔 파일을 만들어야 한다. 그 굽는 도구를 열어보니 답이 바로 있었다.

![Characters included가 0/0이고 생성이 0.11ms 만에 끝났다](/assets/images/unity-project/49-font-asset-creator.png)

`Characters included: 0/0`. 그리고 **생성 시간 0.11ms.**

굽는 범위를 직접 지정하는 모드를 골라놓고 **범위 입력란을 비워둔 상태**였다. 0자를 구웠으니 순식간에 끝난 게 당연했다.. 시간이 짧게 걸린 게 성공 신호가 아니라 실패 신호였던 셈이다.

같이 고친 게 둘 더 있다.

| 항목 | 처음 | 고친 값 | 이유 |
|---|---|---|---|
| 범위 표기 | 16진수를 보고 입력 | **10진수** `32-126,44032-55203` | 그 입력란은 10진수를 받는다 |
| Atlas 해상도 | 1024 | **4096** | 한글 완성형 11,172자가 1024에 안 들어간다 |
| Padding | 0 | **5** | 글자 주변에 여백이 있어야 외곽이 뭉개지지 않는다 |

그리고 마지막 함정. **`Generate`만 누르면 미리보기다.** `Save as`로 저장해야 실제 파일이 된다.

![카드에 한글 제목이 나온다](/assets/images/unity-project/50-card-korean.png)

민첩 세포 활성화 / 신경 가속 / 강화 세포. 나왔다!

---

## 정리

- **순서를 바꿔서 동작한 코드는 고쳐진 게 아니다.** 사이에 한 줄만 끼면 다시 깨진다.
- **재진입을 계산에 넣어야 한다.** 함수 안에서 그 함수가 다시 불릴 수 있으면, 그 뒤에 쓴 줄은 뒤집힌 상태에서 실행된다.
- **여는 신호를 가진 쪽이 닫는 신호도 갖는다.** 상태를 아는 쪽이 신호를 보내야 순서 의존이 사라진다.
- **인스펙터 클릭 연결은 고정값만 넘긴다.** 매번 다른 값을 넘기려면 필드에 담아두고 자기가 읽게 한다.
- **생명주기가 다른 일은 다른 함수로 나눈다.** 평생 한 번 할 일과 창 열 때마다 할 일을 합치면 매번 다 해야 한다.
- **주입받을 자리에 자기 걸 붙이면 무한 재귀가 된다.** `=`과 `+=`는 여기서 완전히 다른 뜻이다.
- **람다는 매번 새 객체라 뗄 수 없다.** 글자가 똑같아도 지워지지 않는다.
- **등록 안 된 걸 해제해도 아무 말이 없다.** 그래서 구독이 쌓이는 버그는 조용하다.
- **구독 해제는 조건부다.** 구독 코드가 두 번 이상 도는가, 구독자가 먼저 사라지는가. 둘 다 아니면 안 해도 된다.
- **작업이 너무 빨리 끝났으면 성공이 아니라 아무것도 안 한 것일 수 있다.** 0.11ms가 그랬다.

## 참고 자료

- [Microsoft Learn - 람다 식](https://learn.microsoft.com/ko-kr/dotnet/csharp/language-reference/operators/lambda-expressions)
- [Microsoft Learn - Delegate.Remove](https://learn.microsoft.com/ko-kr/dotnet/api/system.delegate.remove)
- [Microsoft Learn - event 키워드](https://learn.microsoft.com/ko-kr/dotnet/csharp/language-reference/keywords/event)
- [Unity 6000.0 Manual - UnityEvent](https://docs.unity3d.com/6000.0/Documentation/Manual/UnityEvents.html)
- [TextMeshPro - Font Asset Creator](https://docs.unity3d.com/Packages/com.unity.textmeshpro@4.0/manual/FontAssetsCreator.html)
- [지난 편 - 유니티 학습 프로젝트 < 7 >](https://bbie-6772.github.io/unity-project/2026/09/05/unity-project.html)

## 한줄 평

- 동작하니까 일단 넣었다가 커밋 직전에 되돌아갔는데, 그 되돌아간 30분이 오늘 제일 잘 쓴 시간이었다!
