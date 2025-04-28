---
layout: post
title: TypeScript - < 문법 >
subtitle: Other
author: bbie
categories: Study
banner:
  image: https://github.com/user-attachments/assets/b16ae46b-e76c-4410-8c1d-9ec992640a4c
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: []
---

## 문법

기본적으로 JavaScript의 파생 언어이기에 문법에서 크게 차이나는 점이 없지만, 추가되는 기능들이 있어 이들을 정리해둔다!

### 데이터 타입

일반적으로 JavaScript 에서 **자동으로 정해주던 타입**들을 TypeScript에선 **지정해야 되기에** 그에 맞는 **타입 종류**를 알 필요가 있다!

| **타입 이름**  | **설명**                         | **예시**                         | **특징 및 범위**                                  |  
|---------------|--------------------------------|---------------------------------|-------------------------------------------------|  
| number        | 숫자 타입                      | let n: number = 10;           | 모든 정수 및 부동소수점 숫자 (64-bit float)      |  
| bigint        | 큰 정수                       | let big: bigint = 9007199254740991n; | 임의 정밀도 정수 표현 가능                        |  
| string        | 문자열 타입                   | let s: string = "hello";      | UTF-16 문자열                                    |  
| boolean       | 참/거짓                      | let flag: boolean = true;     | true 또는 false                                 |  
| symbol        | 유일한 심볼                   | let sym: symbol = Symbol();   | 고유 식별자 생성                                 |  
| undefined     | 정의되지 않은 값              | let u: undefined = undefined | 값이 할당되지 않은 상태                           |  
| null          | 빈 값                        | let n: null = null;           | 의도적 빈 값 할당                                |  
| void          | 반환값 없음                  | function f(): void {}          | 반환값이 없는 함수 반환 타입                       |  
| any           | 모든 타입 허용                | let anything: any = 123;       | 타입 체크를 무시                                 |  
| unknown       | 알 수 없는 타입               | let unknownVar: unknown;       | any보다 안전 (사용 전 타입 검사 필요)             |  
| never         | 절대 발생하지 않는 타입        | function error(): never { throw new Error(); } | 함수가 절대 정상 종료하지 않을 때                  |  
| object        | 원시형 제외 모든 객체          | let o: object = { a: 1 };     | 객체 타입                                       |  
| array         | 배열 타입                    | let arr: number[] = [1,2,3];  | 특정 타입 원소 배열                              |  
| tuple         | 고정 길이, 고정 타입 배열      | let tup: [string, number] = ["a", 1]; | 순서와 타입이 고정된 배열                         |  
| enum          | 열거형 타임                   | enum Color { Red, Green, Blue } | 명명된 상수 집합                                 |  
| union         | 여러 타입 중 하나              | let id = string \| number;     | 여러 타입 중 하나를 허용                           |

### 유틸리티 타입

Class 나 튜플 같이 **여러 타입이 포함된 객체**의 경우, 이 중 **일부만 사용**하거나 **속성 정보를 조정**하고 싶을 때 사용한다!

| **유틸리티 타입**          | **설명**                                | **예시** (사용 -> 동일 결과)                           |  
|---------------------|-----------------------------------|---------------------------------------------------|  
| Partial\<T>          | 모든 속성을 선택적으로 만듦             | Partial<{a: number; b: string}> → {a?: number; b?: string} |  
| Required\<T>         | 모든 속성을 필수로 만듦                | Required<{a?: number}> → {a: number}                |  
| Readonly\<T>         | 모든 속성을 읽기 전용으로 만듦           | Readonly<{a: number}> → {readonly a: number}         |  
| Record<K, T>        | K(키 집합) 타입을 T(값 타입)로 매핑    | Record<'a' \| 'b', number> → {a: number; b: number}    |  
| Pick<T, K>          | T에서 K에 해당하는 속성만 선택          | Pick<{a: number; b: string}, 'a'> → {a: number}        |  
| Omit<T, K>          | T에서 K에 해당하는 속성을 제외          | Omit<{a: number; b: string}, 'b'> → {a: number}        |  
| Exclude<T, U>       | T에서 U에 해당하는 타입을 제외          | Exclude<'a' \| 'b' \| 'c', 'a' \| 'b'> → 'c'            |  
| Extract<T, U>       | T에서 U에 해당하는 타입만 뽑아냄        | Extract<'a' \| 'b' \| 'c', 'a' \| 'b'> → 'a' \| 'b'       |  
| NonNullable\<T>      | null과 undefined를 제외한 타입          | NonNullable<string \| null \| undefined> → string      |  
| ReturnType\<T>       | 함수 타입 T의 반환 타입 추출            | ReturnType<() => number> → number                    |  
| Parameters\<T>       | 함수 타입 T의 매개변수 타입들을 튜플로 추출 | Parameters<(x: string, y: number) => void> → [string, number] |  
| ConstructorParameters\<T> | 생성자 함수 매개변수 타입 추출          | ConstructorParameters\<ErrorConstructor> → [string?]  |  

### 객체 지향 프로그래밍

위의 타입들은 데이터들의 가독성 증대 및 컴파일러를 사용하기 위한 느낌이 강했다.  
여기부턴 **객체 지향 프로그래밍**을 위해 추가/변화된 **타입이나 개념**들을 설명할 예정이다!

#### 클래스

- 객체를 생성하기 위한 설계도 나타내는 문법

- 데이터(속성)와 기능(메서드)을 묶어서 캡슐화

- class 키워드로 정의하며 생성자(constructor) 함수로 초기화 가능

```ts
class Person {  
  name: string;  

  constructor(name: string) {  
    this.name = name;  
  }  

  greet() {  
    console.log(`안녕하세요, ${this.name}입니다.`);  
  }  
}  

const p = new Person("철수");  
p.greet();  // 안녕하세요, 철수입니다.  
```

#### 상속

- 기존 클래스를 확장해 새로운 클래스를 만드는 기능

- extends 키워드를 사용해 부모 클래스의 속성과 메서드를 자식 클래스가 물려받음

```ts
class Employee extends Person {  
  jobTitle: string;  

  constructor(name: string, jobTitle: string) {  
    super(name);  // 부모 생성자 호출  
    this.jobTitle = jobTitle;  
  }  

  work() {  
    console.log(`${this.name}은 ${this.jobTitle}로 일합니다.`);  
  }  
}  

const e = new Employee("영희", "개발자");  
e.greet();  // 안녕하세요, 영희입니다.  
e.work();   // 영희은 개발자로 일합니다.  
```

#### 추상 클래스

- 직접 인스턴스화할 수 없는 클래스

- 자식 클래스에서 반드시 구현해야 하는 메서드를 선언 가능 (abstract 메서드)

- 공통 코드 구현과 강제 계약 역할

```ts
abstract class Animal {  
  abstract makeSound(): void;  // 추상 메서드, 반드시 구현해야 함  

  move(): void {  
    console.log("동물이 움직입니다.");  
  }  
}  

class Dog extends Animal {  
  makeSound() {  
    console.log("멍멍!");  
  }  
}  

const d = new Dog();  
d.move();       // 동물이 움직입니다.  
d.makeSound();  // 멍멍!  
```

#### 인터페이스

- 클래스나 객체가 가져야 할 구조(속성과 메서드 형태)를 정의

- 여러 타입에서 공통된 형태를 공유하도록 강제하는 역할

- 다중 상속 가능 (클래스는 단일 상속만 가능)

- 선언만 하므로 구현은 클래스에서 함

```ts
interface Flyer {  
  fly(): void;  
}  

interface Swimmer {  
  swim(): void;  
}  

class Bird implements Flyer {  
  fly() {  
    console.log("날아갑니다!");  
  }  
}  

class Duck implements Flyer, Swimmer {  
  fly() {  
    console.log("날아가요!");  
  }  

  swim() {  
    console.log("수영해요!");  
  }  
}  

const duck = new Duck();  
duck.fly();  // 날아가요!  
duck.swim(); // 수영해요!  
```

## 한줄 평

- 사실상 C#하고 문법적으로 매우 유사해서 학습하기 편했다!

---
