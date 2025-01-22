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

## 프로젝트 기초 작업

### 클라이언트 분석

- 현재 클라이언트에서 주고 받는 Payload는 어느정도 분석을 마쳤다!

- 처음 게임이 시작할 때, 몬스터가 지나갈 경로(road) 정보를 서버가 보내주는 것 같다.

- 그렇다면 경로를 만들어 클라이언트에게 전달해주어야 하는데,  
클라이언트가 어떤방식으로 이를 사용하는지 분석해 봐야 제대로된 값을 보내줄 수 있을 것 같다!

#### 통신 구조 분석

![Image](https://github.com/user-attachments/assets/b0056f86-914f-445c-a46a-bedf2a1fd921)

- 일단 게임 처음 진입 시, 연결할 서버의 주소와 port를 입력해달라는 창이 뜬다!

- 우선 이러한 창의 설정 버튼에 OnClickSetting()을 매핑해 연결을 시작하는 것 같다.

```c#
public void OnClickSetting()
{
    NetworkManager.instance.Init(inputIp.text, inputPort.text);
    // 연결을 시작해주는 곳
    SocketManager.instance.Init(inputIp.text, int.Parse(inputPort.text)).Connect();
    PlayerPrefs.SetString("ip", inputIp.text);
    PlayerPrefs.SetString("port", inputPort.text);
    HideDirect();
}

// Connect() 메서드 내부를 뜯어보았습니다.
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
        // 들어온 Payload 타입에 따라 (payload 이름과 같은)이벤트메서드를 호출해줌
        StartCoroutine(OnReceiveQueue());
        callback?.Invoke();
    }
    catch (Exception e)
    {
        Debug.Log(e.ToString());
    }
}

// 위의 StartCoroutine(OnReceiveQueue())에 사용되는 메서드
IEnumerator OnReceiveQueue()
{
    while (true)
    {
        yield return new WaitUntil(() => receiveQueue.Count > 0);
        var packet = receiveQueue.Dequeue();
        Debug.Log("Receive Packet : " + packet.type.ToString());
        // 메서드를 매핑한 후 실행(Invoke)해 주는 작업
        // _onRecv는 class가 선언될 때 내부 메서드를 읽어 이름이 packetType와 같으면 매칭하여 저장해둠 
        _onRecv[packet.type].Invoke(packet.gamePacket);
    }
}
```

#### 게임시작 분석

- 이제 게임이 시작될 때 실행되는 메서드를 확인해보겠다!

```c#
// 서버에서 받은 통신에 의해 1차로 실행되는 메서드
public void MatchStartNotification(GamePacket gamePacket)
{
    var response = gamePacket.MatchStartNotification;
    UIManager.Get<UIMain>().OnMatchResult(response);
}

// 호출된 OnMatchResult() 메서드(2차)
public void OnMatchResult(S2CMatchStartNotification response)
{
    // GameManger에 받아온 정보 저장 후
    GameManager.instance.playerData = response.PlayerData;
    GameManager.instance.opponentData = response.OpponentData;
    GameManager.instance.initialGameState = response.InitialGameState;
    // Game 씬이 로드되면(Awake) -> GameManger 메서드의 OnGameStart() 실행
    SceneManager.LoadSceneAsync("Game");
}

// GameManger의 OnGameStart() 메서드(3차)
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

#### AddRoad 분석

- 위는 게임 시작과 실행에 관련되어있는 정보고 아래부터는 Road(=MonsterPath)를 어떻게 사용하는지에 대한 코드다

```c#
// MultiGameLoop 에서 AddRoad 메서드를 호출함
IEnumerator MultiGameLoop()
{
    // gameState / gameObjects 는 상대방과 나를 구별해서 사용하는 용도
    var gameState = i == 0 ? playerData : opponentData;
    var gameObjects = i == 0 ? playerObjects : opponentObjects;
    /* 중간 로직 생략 */
    for (int j = 0; j < gameState.MonsterPath.Count; j++)
    {
        var count = 0;
        // 다음 도로가 마지막이 아닐 때
        if (gameState.MonsterPath.Count > j + 1)
        {   
            // 다음 도로와 현재 도로 간 거리를 확인
            var dist = Vector3.Distance(gameState.MonsterPath[j].ToVector3(), gameState.MonsterPath[j + 1].ToVector3());
            // 이를 30f(아마 도로 이미지 크기?) 으로 나눠 count에 저장
            count = (int)(dist / 30f);
        }

        AddRoad(        
                // 현재 위치 
                gameState.MonsterPath[j],            
                // 다음 위치  
                count > 0 ? gameState.MonsterPath[j+1] : null,  
                // 부모 Transform (LocalPosition 의 기준이 됨)
                gameObjects.roadParent,              
                // 플레이어 구분 
                (ePlayer)i,                           
                // 추가 도로 갯수 
                count                                 
        );
    }
}

// MonsterPath의 구성정보를 확인하기 위해 가져온 값으로 MonsterPath는 Position(x,y) 값을 배열로 갖는다는걸 알 수 있음 
private readonly pbc::RepeatedField<global::Position> monsterPath_ = new pbc::RepeatedField<global::Position>();

// 호출된 AddRoad
public void AddRoad(Position position, Position nextPos, Transform parent, ePlayer player, int count = 0)
{
    // 도로 리스트 선택
    var roads = player == ePlayer.me ? roads1 : roads2;
    // 도로 프리팹 로드
    var roadPrefab = ResourceManager.instance.LoadAsset<SpriteRenderer>("Road");

    // 다음 경로를 부모로 지정하며 roadPrefab 복제 
    var newRoad = Instantiate(roadPrefab, parent);
    // 도로 리스트에 추가
    roads.Add(newRoad.transform);
    // 지정된 위치에 배치
    newRoad.transform.localPosition = new Vector3(position.X, position.Y);

    // 다음 도로까지 이어질 수 있도록 받은 count가 있을 경우 진행
    if (count > 0)
    {
        // 다음 도로까지의 방향(좌표) 벡터 계산
        var normal = (nextPos.ToVector3() - position.ToVector3()).normalized;
        // 각도 계산
        var isUp = nextPos.Y > position.Y;
        // 각도의 절댓값 * 라디안을 도로 변환 * 위/아래 방향으로 각도 부호 설정
        var angle = Mathf.Abs(Mathf.Atan2(normal.y, normal.x) * 180 / Mathf.PI) * (isUp ? 1 : -1);
        // x , y , z 에서 z 축을 기준으로 방향(각도) 벡터 저장
        var eulerAngle = new Vector3(0, 0, angle);
        // 첫 도로 회전설정
        newRoad.transform.localEulerAngles = eulerAngle;
        for (int i = 0; i < count; i++)
        {   
            //count 수 만큼 위의 과정을 반복
            // 복제 -> 위치 추가 -> 방향 계산 -> 배치
            var newRoad2 = Instantiate(roadPrefab, parent);
            roads.Add(newRoad2.transform);
            // 뒤에 [30 * (i+1)] 은 count 계산시 사용한 30f를 이용해 위치(간격)를 정해주는 방법
            newRoad2.transform.localPosition = position.ToVector3() + normal * 30 * (i + 1);
            newRoad2.transform.localEulerAngles = eulerAngle;
             // 콜라이더 비활성화 = 불필요한 콜라이더 충돌 검사 제거
             /* 몬스터 이동에서 도로의 콜라이더를 만나면(충돌) 각도를 바꾸는 로직인데,
             추가로 생성된 도로들은 다음 도로까지 방향이 같으므로 충돌 검사가 필요 없음 */
            newRoad2.GetComponent<CircleCollider2D>().enabled = false;
        }
    }
}
```

### Road 값 생성

- 위의 분석정보들을 토대로 **우리가 줘야하는 정보**는 **시작지점에서부터 베이스지점까지의 좌푯값들** 이다!

- 가장 쉬운 방법으로는 시작지점과 베이스지점까지만 주는 방법이 있다만..

- 그래도 어느 정도의 랜덤성(제한된 환경 속 랜덤값)이 있으면 좋을 것 같다!

![Image](https://github.com/user-attachments/assets/1a921516-4e8e-4fc2-bf22-ea677e9aff3b)

- 일단 클라이언트의 Game Scene에 있는 Object를 확인해본 결과 FieldParent 내부 로컬좌표를 주면될 것 같다!  
(FieldParent -> RoadParent -> Road LocalPosition )

- 여기서 카메라의 크기에 맞출 수 있도록 좌표를 제한하면 나올 수 있는 좌표범위는 (0, 200) ~ (1500, 400) 인거 같다.

- 일단 Road의 갯수는 (시작(1) / 중간지점(n)/ 끝(1)) 정도로 x 값은 고정해둔 채로 y값에 랜덤값을 주도록 해줘야 겠다

```jsx
const makePath = (count) => {
  const paths = [];
  // 만약 count가 2개 이하이면 기본값 직선으로 반환
  if (count <= 2)
    return [
      [0, 350],
      [1500, 350],
    ];
  const weightX = Math.trunc(1500 / (count-1));

  for (let i = 0; i < count; i++) {
    let x = weightX * i;
    if (i === count - 1) x = 1500;
    const y = Math.trunc(Math.random() * 200) + 200;
    paths.push([x, y]);
  }

  return paths;
};

export default makePath;
```

## 메인 작업

### 게임오버 핸들링

- 게임을 끝내는 조건과 이를 이용해 클라이언트에게 전달해주는 로직을 구현해볼 예정이다.




---
