---
layout: post
title: Ducktopia - <23>
subtitle: 로드밸런싱
author: bbie
categories: Ducktopia-Project
banner:
  image: https://github.com/user-attachments/assets/e2201ed3-6804-4534-ac37-e2c9a678cddb
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: []
---

## Gateway 로드밸런싱

### AWS ECS 세팅

저번에 만든 Docker Image를 통해 ECS 세팅을 마치고 NLB에 연결해줄 예정이다!

#### ECS(Elastic Container Service)

1. AWS CLI을 깔고 IAM에 사용자를 생성하여 엑세스 키를 생성해주고...

2. AWS CLI를 이용해 Docker Image를 생성 후 ECR에 넣어준다!

    ```powershell
    # aws IAM id 접속하기 
    aws configure
    # 이후에 Access key / 보안 키 / 지역 을 차례대로 입력해준다
    ```

3. ECS 클러스터를 생성해 서비스를 생성.. 하기전에 Task 정의

    Task 정의 시 ECR에 넣어둔 Image를 이용해 컨테이너를 정의해준다!

4. ELB(그 중 Network Load Balancer)를 생성해준다

5. 이후 ECS 클러스터를 생성해준다

6. 클러스터에 Service 를 생성해주면서 만들어둔 Task를 매핑해준다!

7. 이후 로드밸런스의 DNS 주소에 클라이언트를 접속시켜주면 된다

## 한줄 평 + 개선점

- 배운게 너무 많은데 시간이 없어서 정리를 잘 못한 것 같다..

---
