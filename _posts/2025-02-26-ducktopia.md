---
layout: post
title: Ducktopia - <16>
subtitle: EC2 올려보기
author: bbie
categories: Ducktopia-Project
banner:
  image: 
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: []
---

## 분산 서버

현재 기본 구조와 기능들이 구현된 상태에서 EC2에 올려서 잘 작동하는지 확인해보는 작업을 진행해준다!  
게임 서버는 증설을 생각하여 인스턴스가 올라가면 바로 실행될 수 있는 AMI세팅을 해준다!

### 보안 그룹 설정

Gateway 서버에 접속할 수 있는 클라이언트의 입력을 받을 수 있도록 설정해준다!  
(원래는 다른 서버에서도 입력이 들어올 수 있도록 인바운드를 설정해주어야 하지만,현재는 TCP 통신방식을 사용하므로 필요가 없다!)  
(Gateway Server (TCP 연결 요청)-> other Server >> TCP통신 사용)

![게이트웨이](https://github.com/user-attachments/assets/7abe222c-5987-409f-98aa-8b6fe8689d57)

이제 반대로 다른 서버(로비,게임) 에서는 Gateway 서버의 입력만 받을 수 있도록 보안그룹을 설정해준다!

![서버](https://github.com/user-attachments/assets/53def637-9231-4c4a-b00f-0c2b7e6698db)

추가로 이번엔 Redis를 추가하였기에 Redis Server에 접속할 수 있도록 Redis 서버의 보안그룹 인바운드에 규칙 ( Redis의 Default Port 인 6379를 열어두기 ) 추가 해줘야하지만 , 현재 Redis Cloud를 사용하므로 필요가 없다!

### 부팅 세팅

앞으로 인스턴스를 AMI로 만들어 올릴 수 있도록 만들어두는데, 이 때 인스턴스가 부팅되면 자동으로 Node.js 서버가 올라갈 수 있도록 설정해준다!

세팅에 사용할 라이브러리는 PM2 이다!  

``` bash
# pm2 를 이용한 node 서버 실행 
pm2 start src/server.js

# 부팅 시 현재 세팅된 pm2가 자동으로 실행되도록 설정해주는 스크립트를 반환
pm2 startup

# 부팅 설정을 취소하고 싶을 때 설정 스크립트를 반환!
pm2 unstartup

# pm2 설정을 저장
pm2 save
```

이제 pm2 startup 이후 나온 커맨드를 복사하여 그대로 실행해주면 자동으로 부팅 시 실행이 되게된다!

### AMI 생성

이렇게 부팅 세팅과 보안 그룹 설정까지 마친 인스턴스를 AMI 로 변환해준다!

![AMI생성1](https://github.com/user-attachments/assets/718d6eae-c33b-42e3-873d-2c6265f5f68b)

![AMI생성2](https://github.com/user-attachments/assets/095f667e-0e91-449a-be1a-5b347ecdb023)

이후 생성된 AMI를 이용해 인스턴스를 생성해준다!

![인스턴스생성](https://github.com/user-attachments/assets/08b388a6-cba2-4347-87e2-7a1d9c3f21b4)

- 생성 시 인스턴스 수를 설정해줄 수 있고, 이때 보안그룹을 기존에 만들었던 그룹으로 설정해주어야 한다!

![인스턴스생성2](https://github.com/user-attachments/assets/059f67ef-ada2-4e7d-b861-68e2926e472a)

## 한줄 평 + 개선점

- 새로운 지식들을 배워가며 정리하는게 즐겁다! AWS 클라우드 서비스에 대해 좀 더 찾아봐야겠다

---
