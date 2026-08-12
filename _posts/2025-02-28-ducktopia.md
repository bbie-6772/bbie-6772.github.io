---
layout: post
title: Ducktopia - <18>
subtitle: 중간 발표회
author: bbie
categories: Ducktopia-Project
banner:
  image: https://github.com/user-attachments/assets/e2201ed3-6804-4534-ac37-e2c9a678cddb
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [Game-Server]
---

## 중간 발표회

오늘은 중간 MVP 발표회가 있어, 현재 프로젝트에 대해 발표하면서 여러 관점에서 보는 프로젝트의 방향성을 조언받을 수 있는 기회이다!

### 피드백

발표에 사용할 서비스 아키텍쳐를 대략적으로 그린 자료이다.

![서비스아키텍쳐](https://github.com/user-attachments/assets/a11145b9-e263-42e7-a01d-f8fb79e8bdc2)

- Gateway 서버가 중계하는 Client와 Other Server간의 패킷 교환방식에 대해서 최적화될 수 있는 부분이 있는가?

위와 같은 질문에 대해 명확한 해답을 찾아봐야 되겠다! ( 엉뚱하게 답변을 해버린 나는 오늘도 이불킥 )

좀 더 자세히 파고들어보니 Packet을 디코딩하는 과정에서 디코딩된 Payload가 새로운 객체로 할당되고,  
새로 생성된 "객체"는 Stack이 아닌 Heap 영역에 저장되기 때문에 메모리를 많이 차지하게 된다고 한다..

이런 과정을 최적화 하기 위해, Gateway에서 사용하는 패킷을 제외하고 Payload를 그대로 패킷에 포함시켜 다른 서버에 주도록 최적화를 해주어야 겠다!

## 한줄 평 + 개선점

- 여러 질문을 받아보며 지식들이 재정립되거나 새로운 사실들을 알아 좋았다

---
