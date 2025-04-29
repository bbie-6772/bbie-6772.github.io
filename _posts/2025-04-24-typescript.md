---
layout: post
title: TypeScript - < 정적 언어 >
subtitle: 개요
author: bbie
categories: Study
banner:
  image: https://github.com/user-attachments/assets/b16ae46b-e76c-4410-8c1d-9ec992640a4c
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [TypeScript]
---

## 개요

Javascript의 아래와 같은 단점을 보완해주기 위해 나온 언어...! 바로 TypeScript에 대해 간략하게 설명해두려 한다

### 단점

물론 JavaScript만의 단점이라기보단 대부분 동적 언어의 단점이지만 알고가는게 좋으니 적어두겠다!

#### 실행 시간에 결정되는 변수 타입

- JavaScript는 **변수의 타입**이 **실행 시간(Runtime)**에 결정된다!

- 개발자의 실수로 인한 오류가 발생하기 쉽고 찾기도 까다로워 진다..

> 예를 들면, 변수에 잘못된 타입의 값이 할당되어 발생한 오류를 찾기 위해서는 실행 시간에 변수의 값과 타입을 모두 확인해야 하는 번거로움

#### 약한 타입 체크

- JavaScript는 let, const와 같이 **변수/상수**를 **구분하는 정도**의 키워드만 지원이 된다.

> 예를 들면, `let a = 1; a = “Hello”;`가 얼마든지 가능한 것이고 이렇게 되면 약간의 실수로 예상하지 않은 동작이 발생!  
→ *난 a가 숫자인 줄 알았는데 갑자기 문자열이 되어버렸네?*

#### 너무나도 물렁물렁한 객체

- 객체라는 친구는 정의가 확실해야 한다!

예컨대, 붕어빵을 찍는 틀에서 붕어빵만 나오는 것이 정상이겠죠?  
그런데, 붕어빵을 찍는 틀에서 슈크림 빵이나 소보루빵이 나오면 어떨까요?

JavaScript에서는 프로그래머가 마음만 먹으면 **객체의 성질을 수시로 변화**시킬 수 있기에  
만약, 조심성 없는 프로그래머가 해당 객체를 잘못 주무르기라도 하면… **대사고**

## TypeScript

한마디로 정리하자면.. JavaScript에 컴파일 언어(정적 언어)의 장점을 추가해 코드 품질과 생산성을 높인 언어!  
(놀랍게도 C#과 TypeScript 둘다 Microsoft 에서~~(그것도 같은 사람)~~ 개발해서 문법적으로 유사한 점이 많다)

### TSC(TypeScript Compiler)

컴파일러 언어가 됬다면 당연히 컴파일러가 있어야 겠죠?! 그게 바로 tsc 입니다!  
[~~(TypeScript 7 버전부터 뭐 Go 언어를 이용해서 실행속도가 10배 빨라졌다는 것도 들은 거 같은ㄷ?)~~](https://www.youtube.com/watch?v=sObop-Jj32Y&ab_channel=%EC%BD%94%EB%94%A9%EC%95%A0%ED%94%8C)

- `tsc —-init`
  - tsconfig.json이 생성되는 명령어!
- `tsc index.ts`
  - index.ts를 컴파일!
  - **.ts**는 **TypeScript 파일의 확장자**
- `tsc src/*.ts`
  - src 디렉토리 안에 있는 모든 TypeScript 파일을 컴파일!
- `tsc index.js --declaration --emitDeclarationOnly`
  - **@types** 패키지를 위한**.d.ts 파일 생성**을 하는 명령
  - TypeScript로 작성된 모듈이 아니라 JavaScript로 작성된 모듈에 타입 선언을 제공할 때 유용하게 사용!

#### tsconfig.json

TypeScript 프로젝트의 설정 파일로 아래와 같은 주요 설정 요소가 포함되어 있다!

| 옵션명                | 설명                                                         | 주요 수정 이유/포인트                                |  
|-----------------------|--------------------------------------------------------------|----------------------------------------------------|  
| `"compilerOptions"`   | 컴파일러에 대한 설정들을 모아둔 객체                           | 주요 컴파일 옵션을 정의                             |  
| ├─ `"target"`          | 컴파일 대상 자바스크립트 버전 지정 (ES5, ES6/ES2015 등)          | 지원할 JS 환경에 맞게 조정                           |  
| ├─ `"module"`          | 모듈 시스템 지정 (CommonJS, ESNext 등)                         | 프로젝트 환경(Node, Browser 등) 맞춤 설정           |  
| ├─ `"outDir"`          | 컴파일 결과물(js 파일) 저장 경로 지정                         | 빌드 산출물 분리용                                |  
| ├─ `"rootDir"`         | 입력 소스 코드 기준 경로 지정                                 | 상대 경로 관리 편리화                               |  
| ├─ `"strict"`          | 엄격한 타입 검사 활성화                                       | 에러를 줄이고 타입 안정성을 높임                     |  
| ├─ `"esModuleInterop"` | ES 모듈과 CommonJS 간 호환성 설정                             | import 호환 문제 해결                              |  
| ├─ `"sourceMap"`       | 소스맵 생성 여부                                              | 디버깅용 JS와 TS 코드 매핑 지원                      |  
| ├─ `"include"`         | 포함할 파일/폴더 패턴 리스트                                  | 컴파일 대상 범위 지정                              |  
| ├─ `"exclude"`         | 제외할 파일/폴더 패턴 리스트                                  | 불필요한 파일 제외                                  |  
| └─ 기타 옵션들          | `"noImplicitAny"`, `"skipLibCheck"` 등 타입 안정성, 빌드 속도 관련 옵션 | 프로젝트 특성에 맞게 조정                           |  

### d.ts

JavaScript에 비해 TypeScript는 외부 라이브러리 생태계가 부족하지 않나..? 라는 생각이 들 수 있는데,  
이를 보완해주는 게 바로 d.ts 즉 TypeScript 선언 파일 (Declaration File) 이다!

TypeScript는 @types 라이브러리를 통해 외부 라이브러리에 대한 타입 정보를 제공해준다.  
-> @types/라이브러리명 형식으로 npm에 배포되고 설치해서 사용할 수 있다!

아님 아래와 같이 직접 d.ts 를 작성하여 js로 작성된 함수를 사용할 수도 있다!

```jsx
// mathLib.js
function sum(a, b) {  
  return a + b;  
}  

function multiply(a, b) {  
  return a * b;  
}  
```

```ts
// mathLib.d.ts
declare function sum(a: number, b: number): number;  
declare function multiply(a: number, b: number): number;  

// app.ts
// JS 라이브러리에 타입 정보가 없지만, d.ts 덕분에 타입 추론됨  
const result1 = sum(3, 4);  
const result2 = multiply(5, 6);  

console.log(result1, result2);  
```

## 한줄 평

- TypeScript가 대형 프로젝트에서 많이 차용되는 것 같네요..! 언넝 배워놓으면 좋을 것 같네요.

---
