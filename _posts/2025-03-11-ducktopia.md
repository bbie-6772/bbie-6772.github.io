---
layout: post
title: Ducktopia - <24>
subtitle: 로드밸런싱(AWS-ECS / Docker)
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

## AWS ECS

- 어제 제대로 정리하지 못한 정보들을 정리해두려 한다

### ECR

일단 ECS에서 실행될 "서비스"를 가동하기 위해선 Task라는 컨테이너 실행 단위를 정의 해주어야 한다!  
그럼 컨테이너 실행 단위를 정의하기 위해 컨테이너를 만들 Image를 불러와야 하는데..

-> 이 때 사용되는 것이 ECR(Elastic Container Registry) 이다!

1. ECR에 리포지토리를 생성해준다

    ![ECR생성](https://github.com/user-attachments/assets/1e009edf-0ee1-4050-82cd-40b3eca64b05)

2. ECR에 Docker Image 파일을 빌드해주려면 AWS CLI 를 설치해야한다!

    ![ECR푸시](https://github.com/user-attachments/assets/2c6d06d8-b51c-473c-87ab-469d86b3f422)

3. AWS CLI 를 설치 후, PowerShell에서 aws 로그인 인증을 하기 위해선 IAM 에 사용자 세팅을 해주어야 한다!

    - 로그인에 이용할 사용자를 생성

    ![사용자생성1](https://github.com/user-attachments/assets/88db68f3-6788-49c9-a897-9fce48f69caa)

    ![사용자생성2](https://github.com/user-attachments/assets/7d55b78b-bc5f-4e42-911b-abbcb8993e73)

    - 현재는 이 사용자를 이용해 대부분의 작업을 진행할 예정이기 때문에 AdminAccess 권한을 부여해준다!

    ![사용자생성3](https://github.com/user-attachments/assets/79480eff-e982-43cd-87aa-03591e251d0c)

    - 이제 이 사용자를 이용해 PowerShell의 AWS CLI 로 접속하기 위한 키를 생성해준다!

    ![액세스키생성](https://github.com/user-attachments/assets/9f208e9a-c8c2-42b5-9686-d23a182d80f8)

    ![액세스키생성2](https://github.com/user-attachments/assets/42f85af0-71f1-48ee-9750-4e1593bbb5aa)

    - 이제 생성된 액세스 키와 보안 키를 이용해 PowerShell의 AWS CLI에서 접속할 수 있게 되었다!  
    ( 아래와 같은 키 정보는 잘 간직하시길.. )

    ![액세스키확인](https://github.com/user-attachments/assets/7d09e456-80e6-46be-bd3f-a4bada8dc80a)

4. PowerShell 에서 사용자로 로그인을 진행해준다!

    ![로그인](https://github.com/user-attachments/assets/1b9fdba6-d641-4531-9234-658eac203457)

    ```powershell
    # aws 로그인 명령어
    aws configure
    # 이후 Access key / Secret Access Key / 지역(서울) / 출력 포맷 json 으로 설정
    ```

5. 이제 위에서 봤던(2번)의 첫 번째 명령어를 실행해 권한을 확인한다!

    ![로그인2](https://github.com/user-attachments/assets/1aed17a3-d55c-4791-866a-1c5d4a93f202)

6. 확인이 되었다면 프로젝트 파일로 이동해 Dockerfile/.dockerignore 를 세팅해주고 명령어를 실행해준다!

    ![docker 푸시](https://github.com/user-attachments/assets/3ba3c833-0500-4139-a18e-18f45d5b331f)

![확인창](https://github.com/user-attachments/assets/043f8485-f21f-4d84-b5e8-54d1f9f2fa34)

- 위와 같이 ECR에 3가지의 이미지가 업데이트 되는데 latest 태그가 붙어있는 게 진짜 이미지이다!  
( 나머지는 latest 종속된 이미지 )

### Task 정의

ECS 에서 태스크 정의 에서 새 정의를 만들어준다!

- 아래부터는 세팅에 주의해줄 것들이다!

![테스크정의1](https://github.com/user-attachments/assets/67f6f65c-4ed8-46d0-9a6d-5ce726f20628)

- 이름 정하기

![테스크정의2](https://github.com/user-attachments/assets/8d486953-0b78-4929-badb-dfeb74da6806)

1. 이미지 URI -> 전에 latest 태그의 이미지 에 URI 복사가 있다

2. 컨테이너 포트 -> Docker 내부 컨테이너의 애플리케이션과 연결될 포트를 설정해준다

### ELB(로드 밸런서) 정의

TCP 연결을 이용해 서버를 구현중이기에 NLB를 선택하여 세팅해준다!

![로드밸런서1](https://github.com/user-attachments/assets/13f6f6cc-a5e3-40fc-a5f8-2f950a63d02d)

- 현재 로드밸런서가 서버간 로드밸런싱이 아닌 클라이언트 <-> 로드밸런서 이기 때문에 외부망 연결을 설정해준다

![로드밸런서2](https://github.com/user-attachments/assets/0abddff6-0bf1-462c-a3ec-21b8d41367ad)

- VPC는 로드밸런싱할 대상과 같은 곳을 사용해준다(서브넷도 라이팅 테이블 잘 확인하기!)

- 보안그룹도 기존 Gateway서버와 같이 클라이언트의 입력을 받을 포트를 열어둔다!

![로드밸런서3](https://github.com/user-attachments/assets/042970e1-be6d-49a3-ba53-0e71b388a306)

- 로드밸런서에서 클라이언트에게서 받은 입력을 대상 그룹에게 전달해주는걸 설정해준다  
( 필요 시 대상 그룹은 임시로 만들어준다 )

### ECS Cluster 정의 + 세팅

이제 사전준비가 마쳐졌다! 본격적으로 ECS 세팅을 해준다!

#### Cluster 생성

- 기본적으로 Task 때 사용한 인프라 설정(서버 종류)을 따라해야한다!

![클러스터](https://github.com/user-attachments/assets/52211ee0-100c-4ed4-b37b-33a38a9336a4)

#### Service 설정

- 클러스터에서 서비스 생성을 누른 뒤 Task에 만들어두었던 family를 사용해 세팅해준다!

![서비스생성](https://github.com/user-attachments/assets/bfa67f9b-3e82-4e5c-a05b-b443731c9a90)

![서비스생성2](https://github.com/user-attachments/assets/4ca667ab-432e-486e-bf6a-02943425510f)

- 로드밸런서 설정과 같이 설정해둔 Gateway 보안 그룹을 적용 시켜준다

- 퍼블릭 IP 설정을 켜두어야 설정한 이미지들을 불러올 수 있다!  
( 이 부분을 퍼블릭 IP를 꺼두려면 여러 추가 설정이 필요하다 )

![서비스생성3](https://github.com/user-attachments/assets/f692b618-4e6b-49d8-a6d7-9776064add6a)

- 이제 추가로 만들어둔 로드밸런서를 연결해준다

- 리스너는 이제 전달 포트를 설정해주는 것인데 전에 만들어둔 리스너를 적용시켜준다!

- 이제 서버에 ECS 로 올린 서버에 접속하기 위해 로드밸런서의 DNS를 이용하면 된다!

#### AutoScaling

![오토스케일링](https://github.com/user-attachments/assets/a0b4fd3c-794a-4f5b-9308-c1fdaea71a8f)

- 최소 / 최대 테스크 수를 정해주고, 조정 정책을 이용해 오토스케일링이 되는 규칙을 설정해준다!

- 조정 정책에는 평균 CPU 부하나 현재 CPU 부하를 트랙킹하여 ??% 를 넘어가면 새로 테스크를 생성해주도록 설정할 수 있다!

## 한줄 평 + 개선점

- 정보를 다 담아서 너무 뿌듯하다

---
