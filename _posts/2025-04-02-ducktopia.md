---
layout: post
title: Ducktopia_C# - <1>
subtitle: 새로운 시작
author: bbie
categories: Ducktopia-Project-C#
banner:
  image: https://github.com/user-attachments/assets/e2201ed3-6804-4534-ac37-e2c9a678cddb
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [C#]
---

## C#으로 서버 열기

- 기존 Node.js 로 구성한 서버와 구조적 차이가 엄청 나는 것 같다..

- 일부 강의에 있는 파일들과 클라이언트의 C# 파일들을 분석해서 패킷을 해석 및 처리하는 로직까지 구현하였다.

- 파일 구조가 너무 꼬여있어서 도식화를 통해 이해하기 쉽도록 정리할 예정이다.

### 핸들러 맵퍼

- 서버마다 핸들러를 매핑해주는 매니저가 있었으면해서 베이스를 미리 만들었다.

```cs
public abstract class HandlerManagerBase<TPacketType, TGamePacket>
  where TPacketType : Enum
  where TGamePacket : class
{

 // 스레드 안전한 핸들러 저장소  
 protected ConcurrentDictionary<TPacketType, Func<TGamePacket, Task>> Handlers
   = new ConcurrentDictionary<TPacketType, Func<TGamePacket, Task>>();

 // 핸들러 등록 메서드  
  protected void RegisterHandler(TPacketType packetType, Func<TGamePacket, Task> handler)
  {
    Handlers[packetType] = handler;
  }

  // 생성자에서 핸들러 자동 등록  
  protected HandlerManagerBase()
  {
   RegisterHandlers();
  }

  // 추상 메서드로 핸들러 등록 구현 강제  
  protected abstract void RegisterHandlers();

  // 패킷 처리 메서드  
  public virtual async Task OnRecvPacketAsync(TPacketType packetType, TGamePacket packet)
  {
    if (Handlers.TryGetValue(packetType, out var handler))
    {
    try
    {
      await handler(packet);
    }
    catch (Exception ex)
    {
      // 공통 예외 처리  
      await HandleExceptionAsync(packetType, packet, ex);
    }
    }
    else
    {
    // 핸들러가 없는 경우 로깅  
    await HandleMissingHandlerAsync(packetType, packet);
    }
  }

}
```

- 이제 이를 이용해 서버마다 핸들러를 매핑해주는 매니저를 생성하면 된다!

```cs
class HandlerManager : HandlerManagerBase<ePacketType, GamePacket>
{
  // 스레드 안전한 싱글톤  
  private static readonly object _lock = new object();
  private static HandlerManagerBase<ePacketType, GamePacket> _instance;

  // 싱글톤 인스턴스 속성  
  public static HandlerManagerBase<ePacketType, GamePacket> Instance
  {
    get
    {
    // 이중 검사 락킹 (Double-Check Locking)  
    if (_instance == null)
    {
      lock (_lock)
      {
      // 인스턴스가 없는 경우에만 생성  
      _instance ??= CreateInstance();
      }
    }
    return _instance;
    }
  }
  protected static HandlerManagerBase<ePacketType, GamePacket> CreateInstance()
  {
    return new HandlerManager();
  }

  protected override void RegisterHandlers()
  {
    // 수동 핸들러 등록 예시  
    RegisterHandler(ePacketType.LOGIN_REQUEST, LoginHandler);
  }
}
```

- 이후 매핑된 핸들러를 사용해준다!

```cs
public override async void OnRecvPacket(Packet packet)
{
  await HandlerManager.Instance.OnRecvPacketAsync(packet.Type, packet.GamePacket);
}
```

## 한줄 평 + 개선점

- 구조가 많이 복잡하다..

---
