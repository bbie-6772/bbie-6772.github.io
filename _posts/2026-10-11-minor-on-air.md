---
layout: post
title: Minor On Air 개발 - < NGO에서 static 이벤트 버스 >
subtitle: "NGO 멀티플레이에서 static 이벤트 버스가 퍼지는 범위"
author: bbie
categories: Minor-On-Air
banner:
  image: /assets/images/jev-game-project/banner.webp
  opacity: 0.9
  background: "#f3e9dc"
  height: "50vh"
  min_height: "20vh"
tags: [Game, Unity, C#, Multiplayer, Game-Server, Event, Architecture, Testing]
---

## 개요

건물마다 방송실이 하나씩 있다고 해보자. 1동 방송실에서 "광석이 맞았다!"고 방송하면 1동 사람은 다 듣지만, 2동에는 한 마디도 안 들린다. 2동까지 알리려면 전화를 따로 걸어야 한다.

Unity NGO 멀티플레이에서 C# 이벤트가 이렇게 움직인다. PC가 건물이고, `event`가 방송, Rpc가 전화다.

[2편]({% post_url 2026-10-07-minor-on-air %})에서 곡괭이 타격 검증 끝의 `PublishHit`은 로그만 찍는 자리였다. 여기에 타격을 기록하는 쪽, 연출하는 쪽이 붙어야 하는데 둘이 만날 곳이 없었다. 발행자(플레이어)는 런타임에 생기는 프리팹이고, 구독자는 씬에 미리 놓인 오브젝트라 서로 참조를 걸 수 없다.

그래서 이벤트 버스를 **static 클래스**로 만들었고, 이 방송이 어디까지 들리는지 따라가다 서버 검사 위치, payload, 발행 순서가 줄줄이 정해졌다. 그 과정을 적어보겠다!

## 발행자와 구독자가 만날 곳

static 클래스는 인스턴스 없이 프로세스에 하나만 있는 공용 공간이다. 플레이어 프리팹이 몇 개 생기든, 씬에 무엇이 놓여 있든 `GameEventBus.OreHit`이라는 이름 하나로 만난다.

다른 방법도 놓고 비교했다.

| 방식 | 장점 | 비용 |
|---|---|---|
| static 클래스 | 가장 단순. 씬 배치·참조 연결 불필요 | 전역 상태라 구독이 남을 수 있음, 해제 필수 |
| MonoBehaviour 싱글톤 | 인스펙터에서 상태 확인 가능 | 씬 오브젝트 필요. 초기화 순서에 따라 `Instance`가 null일 수 있음 |
| ScriptableObject 이벤트 채널 | 에셋 드래그로 연결 | 쓰는 컴포넌트마다 에셋 연결 필요 |

static을 고른 대신 비용도 같이 가져왔다. 해제하지 않은 구독은 씬 전환 뒤에도 남는다.

## static이어도 PC 하나 안의 방송이다

처음엔 `OreHit`을 구독하면 서버가 모든 클라이언트에게 타격을 뿌려주는 줄 알았다..

"프로세스에 하나"의 프로세스는 PC 한 대다. `OreHit?.Invoke(e)`는 그 코드를 실행한 PC 안의 구독자만 호출하고, PC 사이를 건너는 건 Rpc나 NetworkVariable이 맡는 별개의 층이다.

![호스트 PC와 클라이언트 PC에서 이벤트가 퍼지는 범위 개념도](/assets/images/jev-game-project/event-bus-scope.svg)

여기에 멀티플레이 특유의 사정이 두 개 겹친다.

- 씬에 직접 배치한 구독자는 **모든 PC에 하나씩** 있고, 각자 `OnEnable`이 따로 돈다. 클라이언트 PC의 구독자도 구독은 한다. 그 PC에서 방송이 안 나올 뿐이다.
- 호스트는 서버이면서 클라이언트라 `IsServer`와 `IsClient`가 둘 다 true다. 연출을 "서버에서 한 번, 클라이언트에서 한 번" 재생하게 짜면 호스트 PC에서는 같은 연출이 두 번 나온다.

그래서 구독자도 둘로 갈랐다.

- 게임 상태를 바꾸거나 기록한다 → 서버
- 보이고 들리기만 한다(애니메이션, 사운드) → 클라이언트

맞은 대상 자신은 구독자가 아니다. 대상의 반응은 2편의 `IHittable.OnServerHit()`으로 직접 부른다. 대상까지 구독하면 한 번 친 타격에 반응이 두 번 실행될 수 있어서, **당사자는 직접 호출, 구경꾼은 이벤트**로 나눴다.

버스의 범위는 **서버 PC 내부 알림**까지로 정했다. 클라이언트 연출용 전화(Rpc)는 연출이 실제로 붙는 다음 작업으로 미뤘다.

## 서버 검사는 버스 안에 둔다

이 방송은 서버 PC에서만 나와야 한다. `HitRpc`가 어차피 서버에서만 도니 버스에서 또 검사할 필요가 없어 보이지만, 기준은 검사 비용이 아니라 **규칙을 지키는 곳이 몇 군데인가**다. 호출자가 보장하는 방식이면 발행 코드가 늘 때마다 각자 "서버에서만"을 기억해야 하고, 버스에서 검사하면 한 곳에서 걸러진다.

서버 검사가 없는 버스를 두고 사고 실험을 해봤다. 누군가 실수로 `Update`에서 발행하는 코드를 넣었고, PC가 3대라면?

- 기록이 3개 쌓이는데 진짜는 호스트의 1개뿐이다.
- 가짜 2개는 에러 없이 쌓인다. 나중에 PC마다 숫자가 다를 때 처음 드러난다.

버스에서 검사하면 클라이언트 PC 콘솔에 바로 에러가 찍힌다. 조용한 데이터 오염을 눈에 보이는 에러로 바꾸는 것( fail-fast )이다.

```csharp
public static void PublishOreHit(OreHitEvent e)
{
    // Unity 오브젝트는 !로 검사한다. ?.는 파괴된 오브젝트를 거르지 못한다
    if (!NetworkManager.Singleton || !NetworkManager.Singleton.IsServer)
    {
        Debug.LogError(...);   // 서버가 아니면 발행하지 않고 바로 에러로 알린다
        return;
    }
    OreHit?.Invoke(e);         // C# delegate는 ?.로 충분하다. 구독자가 없으면 null
}
```

## payload에 담을 것

`OreHitEvent`에 넣은 필드는 다섯 개다.

| 필드 | 의미 |
|---|---|
| `AttackerClientId` (ulong) | 누가 |
| `TargetObjectId` (ulong) | 무엇을 |
| `HitPoint` (Vector3) | 어디서 |
| `ServerTime` (double) | 언제 |
| `OreDefineId` (int) | 광물 종류. 0 = 없음 |

**넣지 않은 것**은 대상의 현재 체력 같은 "지금 값"이다.

- 숨은 정보(예: 터지는 광물의 남은 타격 횟수)가 담긴다. 나중에 이 이벤트를 Rpc로 보내면 모든 PC에 그대로 새어 나간다.
- 이벤트는 "일어난 일", 상태는 "지금 값"이다. 지금 값은 NetworkVariable이 맡는다. 둘을 섞으면 어느 쪽을 믿어야 할지 흐려진다.

대상은 참조 대신 `NetworkObjectId`로 가리킨다. ID 하나로 광석과 플레이어를 모두 가리킬 수 있지만, despawn되면 ID로 다시 찾을 수 없다. 그래서 광물 종류처럼 나중에 필요한 정보는 **대상이 살아 있을 때 읽어서** 값으로 복사해 둔다.

광물 종류는 `OreDefinition`(ScriptableObject)의 Id다. 같은 종류 광석들이 SO 에셋 하나를 공유하니 거기엔 종류 공통값만 있고, 현재 체력 같은 개체별 값은 컴포넌트에 있다. 0을 "없음"으로 쓸 수 있는 건 `OreDefinition.OnValidate`가 id ≤ 0을 경고해서 실제 광석은 0을 가질 수 없기 때문이다. 지금은 `OreDefinition`을 참조하는 광석 컴포넌트가 없어서 항상 0이 들어간다.

종류를 읽는 코드는 `PickaxeController`에 뒀다. 트랙 간 계약인 `IHittable`을 건드리지 않기 위해서다.

```csharp
public readonly struct OreHitEvent
{
    public readonly ulong AttackerClientId;   // 누가
    public readonly ulong TargetObjectId;     // 무엇을
    public readonly Vector3 HitPoint;         // 어디서
    public readonly double ServerTime;        // 언제 (서버 시각)
    public readonly int OreDefineId;          // 광물 종류, 0 = 없음
    // 생성자: 필드별 줄 단위 대입
}
```

필드를 readonly로 두면 생성자에서만 대입할 수 있어서 "발행 후 값이 바뀌지 않는다"를 컴파일러가 보장한다. 단순 값 타입으로만 구성했으니 나중에 Rpc로 직렬화해 보내기로 해도 그대로 쓸 수 있다.

생성자를 줄 단위로 대입한 데는 이유가 있다. C#에는 C++의 멤버 초기화 리스트가 없고 튜플 대입 `=> (A, B) = (a, b);`이 축약형인데, `AttackerClientId`와 `TargetObjectId`는 둘 다 ulong이라 순서를 바꿔 넣어도 컴파일러가 못 잡는다. "누가"와 "무엇을"이 뒤바뀐 기록이 조용히 쌓인다.

## 발행은 반응 뒤에

`HitRpc` 순서는 이렇게 정했다.

```text
검증 4단계 → _lastAcceptedTime = now → OreHitEvent 생성 → OnServerHit → PublishHit(e)
```

- 이벤트는 **검증을 통과한 뒤** 만든다. `hitPoint`가 거리 검증(`IsInRange`)의 `out`으로 나오고, 거부된 타격이 기록되면 안 된다.
- 시각은 `HitRpc` 맨 앞의 `now`로 통일했다. `Time.timeAsDouble`은 프레임 시작 시각이라 같은 프레임 안에서는 몇 번 읽어도 같지만, 판정에 쓴 `now`를 그대로 넘겨야 "판정 시각 = 기록 시각"을 코드만 보고 알 수 있다.
- 로그와 기록 모두 대상을 이름이 아닌 ID로 남긴다.

대상이 반응 중에 부서져 사라질 수 있으니 발행을 먼저 해야 할 것 같지만, **이벤트를 만드는 시점과 발행하는 시점은 분리할 수 있다.**

- 만들기: 대상이 살아 있을 때(반응 전). 광물 종류를 이때 담는다.
- 발행: 상태 변화가 끝난 뒤(반응 후).

발행을 먼저 하면 구독자에서 난 예외가 `Invoke` 뒤의 `OnServerHit`을 막는다. 기록 버그 하나가 게임 판정을 멈추고, "이미 터졌어야 하는데 남아 있는 광석"이 생길 수 있다. 발행은 부가 기능이니 실패해도 핵심 로직을 막지 않는 자리에 뒀다.

## 구독하고 해제하기

static 버스의 비용(남는 구독)은 구독자 쪽에서 막는다.

- 등록은 `OnEnable`, 해제는 `OnDisable`.
- 람다로 등록하면 똑같이 생긴 람다로도 해제할 수 없다. 이름 있는 메서드로 등록해야 `-=`가 같은 대상을 지운다.

기록기는 구독·해제·수신 로그만 하는 최소 구독자로 만들었다. 누적 리스트나 Dump는 기록을 실제로 쓰는 쪽의 요구가 정해진 뒤로 미뤘다.

## 돌려서 확인한 것

호스트 + MPPM 가상 플레이어 1로 실행하고, 가상 플레이어 쪽에서 쳤다.

- `[Event] OreHit` 로그는 **호스트에만** 찍혔고, "서버가 아님" 에러는 안 찍혔다. 위 그림대로다.
- 클라이언트 요청 로그의 id와 호스트 이벤트의 targetid가 같았다.
- `[TestRock]` 반응 로그가 `[Event]` 발행 로그보다 **먼저** 찍혔다. 반응 → 발행 순서 그대로다.
- Recorder를 끈 상태로 치자 수신 로그 0회, 예외도 없었다. 다시 켜고 치자 1회였다. 해제가 빠졌으면 다시 켤 때 구독이 겹쳐 2회가 나온다.

## 아직 확인하지 못한 것

- NGO에서 despawn 직후 `SpawnManager.SpawnedObjects`에서 바로 빠지는지
- NetworkManager의 "Recycle Network Ids" 기본값과 프로젝트 설정. ID 재사용이 켜져 있으면 despawn된 대상의 ID가 다른 개체를 가리킬 수 있다.
- Unity 분석기 UDR0005가 `OnDisable` 해제를 인정하는지(`OnDestroy`만 인정하는지)
- `EditorSettings.asset`의 `m_EnterPlayModeOptions: 0`이 Domain Reload 켜짐을 뜻하는지. 꺼져 있으면 static 구독이 Play 사이에도 남는다.
- 대상이 플레이어일 때(팀킬) `OreHit`을 일반 `Hit`으로 바꿀지, 별도 이벤트를 둘지

## 소감

static 클래스 하나 만드는 줄 알았는데, "이게 어디까지 퍼지나"를 따라가다 보니 서버 검사 위치, payload, 발행 순서까지 다 엮여 나왔다. broadcast라고 믿었던 게 제일 큰 착각이었고, 호스트에만 찍힌 `[Event]` 로그를 보고서야 그림이 맞춰졌다..!
