---
layout: post
title: 멀티타워디펜스 - < 3 >
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

## 프로젝트 시작

### 클라이언트 분석

- 현재 클라이언트에서 주고 받는 Payload는 어느정도 분석을 마쳤다!

- 처음 게임이 시작할 때, 몬스터가 지나갈 경로(road) 정보를 서버가 보내주는 것 같다.

- 그렇다면 경로를 만들어 클라이언트에게 전달해주어야 하는데,  
클라이언트가 어떤방식으로 이를 사용하는지 분석해 봐야 제대로된 값을 보내줄 수 있을 것 같다!

#### 게임 시작 및 통신 분석

- 일단 게임 처음 진입 시, 연결할 서버의 주소와 port를 입력해달라는 창이 뜨는데, 이를 이용해서 연결을 시작하는 것 같다.

```c#
public void OnClickSetting()
{
    NetworkManager.instance.Init(inputIp.text, inputPort.text);
    // 이 부분!
    SocketManager.instance.Init(inputIp.text, int.Parse(inputPort.text)).Connect();
    // 
    PlayerPrefs.SetString("ip", inputIp.text);
    PlayerPrefs.SetString("port", inputPort.text);
    HideDirect();
}

public async void Connect(UnityAction callback = null)
{
    IPHostEntry ipHost = Dns.GetHostEntry(Dns.GetHostName());
    if (!IPAddress.TryParse(ip, out IPAddress ipAddress))
    {
        ipAddress = ipHost.AddressList[0];
    }
    IPEndPoint endPoint = new IPEndPoint(ipAddress, port);
    Debug.Log("Tcp Ip : " + ipAddress.MapToIPv4().ToString() + ", Port : " + port);
    socket = new Socket(endPoint.AddressFamily, SocketType.Stream, ProtocolType.Tcp);
    try
    {
        await socket.ConnectAsync(endPoint);
        isConnected = socket.Connected;
        // 이 메서드를 이용해 받은 패킷을 해석하여 payload를 ReceiveQueue에 삽입
        OnReceive();
        StartCoroutine(OnSendQueue());
        // 들어온 Payload 타입에 따라 이벤트메서드를 호출해줌
        StartCoroutine(OnReceiveQueue());
        callback?.Invoke();
    }
    catch (Exception e)
    {
        Debug.Log(e.ToString());
    }
}

IEnumerator OnReceiveQueue()
{
    while (true)
    {
        yield return new WaitUntil(() => receiveQueue.Count > 0);
        var packet = receiveQueue.Dequeue();
        Debug.Log("Receive Packet : " + packet.type.ToString());
        // 메서드를 매핑한 후 실행(Invoke)해 주는 작업
        // _onRecv는 class가 선언될 때 내부 메서드를 읽어 packet.type에 맞게 저장해둔 정보임
        _onRecv[packet.type].Invoke(packet.gamePacket);
    }
}
```

#### 

- 이제 게임이 시작될 때 실행되는 메서드를 확인해보겠다!

```c#
// 1차로 실행되는 메서드
public void MatchStartNotification(GamePacket gamePacket)
{
    var response = gamePacket.MatchStartNotification;
    UIManager.Get<UIMain>().OnMatchResult(response);
}

// 호출된 2차 메서드
public void OnMatchResult(S2CMatchStartNotification response)
{
    // GameManger에 받아온 정보 저장 후
    GameManager.instance.playerData = response.PlayerData;
    GameManager.instance.opponentData = response.OpponentData;
    GameManager.instance.initialGameState = response.InitialGameState;
    // Game 씬 실행(Awake) -> GameManger 메서드의 OnGameStart() 실행 
    SceneManager.LoadSceneAsync("Game");
}
// GameManger의 게임 시작 메서드(3차)
public void OnGameStart()
{
    // 게임 정보 초기화
    isGameStart = true;
    Time.timeScale = 1;
    _homeHp1 = initialGameState.BaseHp;
    _homeHp2 = initialGameState.BaseHp;
    UIManager.Get<UIGame>().InitHpGauge(homeHp1);
    gold = initialGameState.InitialGold;
    topScore = 0;
    score = 0;
    level = 1;
    time = 0;
    roads1.Clear();
    roads2.Clear();
    towers.Clear();
    monsters.Clear();
    // MultiGameLoop()를 비동기 작업으로 실행
    StartCoroutine(MultiGameLoop());
}
```

- 위는 게임 시작과 실행에 관련되어있는 정보고 아래부터는 Road(=MonsterPath)를 어떻게 사용하는지에 대한 코드다

```c#
// 이후 MultiGameLoop 에서 AddRoad 메서드를 호출
// gameState 는 상대방과 나를 구별해서 사용하는 용도
var gameState = i == 0 ? playerData : opponentData;
for (int j = 0; j < gameState.MonsterPath.Count; j++)
{
AddRoad(gameState.MonsterPath[j], count > 0 ? gameState.MonsterPath[j+1] : null, gameObjects.roadParent, (ePlayer)i, count);
}

// MonsterPath의 구성정보를 확인하기 위해 가져온 값으로 MonsterPath는 Position(x,y) 값을 배열로 갖는다는걸 알 수 있다
private readonly pbc::RepeatedField<global::Position> monsterPath_ = new pbc::RepeatedField<global::Position>();

// 호출된 AddRoad
public void AddRoad(Position position, Position nextPos, Transform parent, ePlayer player, int count = 0)
{
    var roads = player == ePlayer.me ? roads1 : roads2;
    // Road 에셋 가져오기
    var roadPrefab = ResourceManager.instance.LoadAsset<SpriteRenderer>("Road");

    // 다음 경로를 부모로 지정하여 roadPrefab 복사
    var newRoad = Instantiate(roadPrefab, parent);
    roads.Add(newRoad.transform);
    newRoad.transform.localPosition = new Vector3(position.X, position.Y);

    if (count > 0)
    {
        var normal = (nextPos.ToVector3() - position.ToVector3()).normalized;
        var isUp = nextPos.Y > position.Y;
        var angle = Mathf.Abs(Mathf.Atan2(normal.y, normal.x) * 180 / Mathf.PI) * (isUp ? 1 : -1);
        var eulerAngle = new Vector3(0, 0, angle);
        newRoad.transform.localEulerAngles = eulerAngle;
        for (int i = 0; i < count; i++)
        {
            var newRoad2 = Instantiate(roadPrefab, parent);
            roads.Add(newRoad2.transform);
            newRoad2.transform.localPosition = position.ToVector3() + normal * 30 * (i + 1);
            newRoad2.transform.localEulerAngles = eulerAngle;
            newRoad2.GetComponent<CircleCollider2D>().enabled = false;
        }
    }
}
```

### 메인 작업


---
