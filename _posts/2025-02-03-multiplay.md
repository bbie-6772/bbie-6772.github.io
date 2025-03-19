---
layout: post
title: 멀티타워디펜스 - 회고록
subtitle: 프로젝트 회고록
author: bbie
categories: Multi-TowerDefense-Project
banner:
  image: https://github.com/user-attachments/assets/2403c1b6-7704-4ded-9562-204c27aa6ed2
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [Feedback]
---

## 프로젝트 끝

프로젝트가 끝나고, 이에 대한 설명을 위해 자료들을 정리해두었다!

### Github

- 메인 프로젝트 [서버](https://github.com/nanoda1802/multi-tower-defense-server)

- 제공되었지만, 일부 버전 및 코드를 수정한 [클라이언트](https://github.com/nanoda1802/multi-tower-defense-client)

### 설명자료

![Image](https://github.com/user-attachments/assets/b3740b59-23b0-4fbd-8471-d620f5c7d350)

![Image](https://github.com/user-attachments/assets/1dc1e330-3c58-480c-ab86-35d355a2a6e8)

![Image](https://github.com/user-attachments/assets/4292dc0f-b68c-4b8e-b317-370773f91c41)

![Image](https://github.com/user-attachments/assets/7dfcbeb0-ef3e-497b-8f4a-6554823ffb0c)

![Image](https://github.com/user-attachments/assets/e0dabbcf-5d90-4a55-9f64-79d284b149a1)

![Image](https://github.com/user-attachments/assets/e52e8434-f24a-4a94-a208-3ba487520992)

![Image](https://github.com/user-attachments/assets/107a8d71-b779-4ced-bdd0-f38f14b4c12a)

![Image](https://github.com/user-attachments/assets/ba4aaf75-3813-41fd-9194-cd85045aadf0)

![Image](https://github.com/user-attachments/assets/f5facf14-92d0-46a0-8bfc-723df92264f4)

![Image](https://github.com/user-attachments/assets/ec637c9a-6de2-42e2-9ac4-999e9ed7d8f4)

![Image](https://github.com/user-attachments/assets/5a5b30d4-0c4b-4ee1-b28d-c1d5b431f814)

![Image](https://github.com/user-attachments/assets/e6e502d1-8150-4f82-9481-6d1a7c6b829d)

![Image](https://github.com/user-attachments/assets/18fa2046-147b-4539-8261-679186f82717)

![Image](https://github.com/user-attachments/assets/088f73df-20e1-4297-adf1-d7a52009770b)

![Image](https://github.com/user-attachments/assets/8fb01abe-afe1-4a5a-b0a5-31332e850194)

![Image](https://github.com/user-attachments/assets/901f8a46-db1f-4909-962d-e8650827fafb)

![Image](https://github.com/user-attachments/assets/92fd1c21-38c6-4bbf-82b1-26ac99844471)

![Image](https://github.com/user-attachments/assets/c8cf63e4-2b5d-445f-a265-e31ddeac3007)

## 회고록

### Node.js의 싱글스레드

위의 자료에서 로그인 대기열 관련 질문으로 Node.js는 싱글 스레드이므로 하나씩 처리가 되는데,  
과연 로그인 대기열이 필요한가에 대해 받았었다.

이에 대해 로그인 대기열을 만들기 전 코드로 테스트를 해보며 가설을 다시 세워보게되었다.

- 기존 코드 + 디버깅용 콘솔로그 추가

    ```jsx
    /* 요청받은 정보 검증 후 처리하고 적절한 페이로드 준비하는 함수 */
    const verifyLoginInfo = async (user, id, password) => {
      // [1] 요청된 유저와 일치하는 정보가 없는 경우
      if (!user) return makeFailPayload('user');
      // [2] DB에서 유저 정보 가져오기 (쿼리 실행)
      let userData = null;
      try {
        userData = await selectUserData(id);
      } catch (err) {
        // [실패] 예외적인 오류 발생 시
        console.error('로그인 처리 중 문제 발생!!', err);
        return {
          success: false,
          message: `DB 문제 발생 : ${err.code}`,
          failCode: GlobalFailCode.UNKNOWN_ERROR,
        };
      }

      // [3] 이미 로그인된 계정인지 검증
      console.log("아이디 확인 시작 전")
      for await (const account of userSession.users.values()) {
        console.log("아이디 확인",account.id, account.socket.remotePort)
        if (account.id === id) {
          return makeFailPayload('duplicate');
        }
      }

      // [4] 비밀번호 일치 여부 검증
      const isRightPassword = await bcrypt.compare(password, userData.password);
      if (!isRightPassword) return makeFailPayload('password');
      
      // [5] 모든 검증 통과 시 jwt 생성
      const token = jwt.sign({ userId: userData.id }, config.env.secretKey);
      // [6] 깡통 유저에 계정 정보 연동하기
      console.log("로그인 직전",user.id, user.socket.remotePort)
      user.login(
        userData.user_key,
        userData.id,
        userData.win_count,
        userData.lose_count,
        userData.mmr,
        userData.high_score,
      );
      console.log("로그인 적용 성공",user.id, user.socket.remotePort)
      // [7] 성공 응답 페이로드 반환
      return { success: true, message: messageType.success, token, failCode: GlobalFailCode.NONE };
    };
    ```

- 이 코드의 문제점을 찾아보았다.

  1. 비동기 작업으로 인한 실행 순서 문제

  verifyLoginInfo 함수 내에서 await를 사용한 비동기 작업(예: selectUserData, bcrypt.compare)이 있습니다.
  이 작업들은 이벤트 루프에 의해 처리되며, 다른 작업과 동시에 실행될 수 있습니다.
  만약 loginHandler가 동시에 여러 번 호출되면, 비동기 작업이 겹쳐 실행될 수 있음

- 문제점에 의하면 Node.js는 비동기 작업을 만나면 싱글 스레드가 아닌, 이벤트 루프의 스레드 풀로 멀티스레드 처리 작업이 진행된다.

- 그렇게 스레드 풀에서 진행된 작업이 끝났을 경우에 스레드가 작업을 재개하기에 순서를 대략적으로 표현하자면...

![Image](https://github.com/user-attachments/assets/c594b262-e4d7-4541-8e9a-39d50b66f43b)

- 위 사진처럼 작업의 원자성이 분리되어 비동기인 비밀번호 검증에 의해 "유저 등록"이 밀리고,  
그 동안 다른 유저의 로그인 요청이 "유저 중복 검사"를 통과해버린 것이다!

- 이를 방지하기 위해 "유저 중복 검사"와 "유저 등록"을 같은 작업에서 처리하도록 순서를 변경해주었다!

![Image](https://github.com/user-attachments/assets/df580810-6e13-405d-8bac-758cbdbb8c1d)

- 이러면 비동기 처리 순서와 관계없이 유저가 중복되지 않았을 경우에만 유저 등록이 되게 된다!

![Image](https://github.com/user-attachments/assets/70d37b84-cd3d-426b-9965-3263045af1ea)

- 더미 클라이언트의 응답으로 로직변경 후 중복로그인 로직이 제대로 작동하는 걸 알 수 있다!  
( 이제 와서 보면 for 문보다 map 형태로 get(user.id)로 중복확인을 최적화 할 수 있었던 것 같다.. )

### 피드백

- 회의를 마쳐서 정리된 부분을 튜터님에게 여러 검토를 받았으면 좀 더 좋은 결과물이 나오지 않았을까..? 싶었다.

- 특히나 로그인 대기열보다 DB에 로그인 여부 컬럼을 추가하는 방식이라던가,  
매칭 대기열의 매칭 알고리즘을 깊게 파고 든다던가..

- 전체에서 중요한 부분이 아님에도 쉽게 넘어가지 않고 여러 번 의견을 나눴던게,  
그때 당시에는 좋아보였지만 전체적 프로젝트에서는 너무 아쉬웠던 것 같다.

---
