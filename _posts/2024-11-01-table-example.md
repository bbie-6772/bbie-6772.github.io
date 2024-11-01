---
layout: post
title: Table 예제
subtitle: 참고하세염
categories: example
tags: [table]
---

## Table 예제

**다음과 같은 확장 기능이 제공됩니다:**

* 여러 열에 걸친 셀
* 여러 행에 걸친 셀
* 셀 텍스트 별도로 정렬
* 테이블 헤더가 별도로 필요하지 않음
* 그룹화된 테이블 행 또는 데이터 행

### 행 간격과 열 간격

셀 내부에 있는 ^^ 표시는 위의 셀과 병합되어야 함을 나타냅니다.  
이 기능은 [pmccloghrylaing](https://github.com/pmccloghrylaing)님에 의해 개발됐습니다.

| Stage | Direct Products | ATP Yields |
| ----: | --------------: | ---------: |
|Glycolysis | 2 ATP                   ||
|^^         | 2 NADH      | 3--5 ATP   |
|Pyruvaye oxidation | 2 NADH | 5 ATP   |
|Citric acid cycle  | 2 ATP           ||
|^^                 | 6 NADH | 15 ATP  |
|^^                 | 2 FADH | 3 ATP   |
| 30--32 ATP                         |||

[ Net ATP yields per hexose]

### 멀티 라인

셀 내용을 다음 줄과 연결하기 위해 끝에 `\`를 붙입니다.  
이 기능은 [Lucas-C](https://github.com/Lucas-C)님에 의해 개발됐습니다.

|:     Easy Multiline     :|||
|:------ |:------ |:-------- |
| Apple  | Banana |  Orange  \
| Apple  | Banana |  Orange  \
| Apple  | Banana |  Orange
| Apple  | Banana |  Orange  \
| Apple  | Banana |  Orange  |
| Apple  | Banana |  Orange  |


### 헤더가 없는 테이블

테이블 헤더를 없앨 수 있습니다.

|--|--|--|--|--|--|--|--|
|♜ |  |♝ |♛ |♚ |♝ |♞ |♜ |
|  |♟ |♟ |♟ |  |♟ |♟ |♟ |
|♟ |  |♞ |  |  |  |  |  |
|  |♗ |  |  |♟ |  |  |  |
|  |  |  |  |♙ |  |  |  |
|  |  |  |  |  |♘ |  |  |
|♙ |♙ |♙ |♙ |  |♙ |♙ |♙ |
|♖ |♘ |♗ |♕ |♔ |  |  |♖ |


```markdown
|:     Fruits \|\| Food           :|||
|:-------- |:-------- |:------------ |
| Apple    |: Apple  :|    Apple     \
| Banana   |  Banana  |    Banana    \
| Orange   |  Orange  |    Orange    |
|:   Rowspan is 5   :||:  How's it? :|
|^^   A. Peach       ||^^ 1. Fine    |
|^^   B. Orange      ||^^ 2. Bad  $I = \int \rho R^{2} dV$     |
|^^   C. Banana      ||   It's OK! ![example image][my-image]  |
```

### 텍스트 정렬

테이블 셀의 정렬을 별도로 설정할 수 있습니다.

| \:Fruits         ||  Food   :|
|:-------- |:------ |:-------- |
| Apple    | Banana |  Orange  |
| Apple    | Banana |  Orange  |


|          | Fruits\::        ||
|:-------- |:------ |:-------- |
| Apple    | Banana |  Orange  |
| Apple    | Banana |  Orange  |


|: \:Fruits       :||          |:       Food     :||
|:-------- |:------ |:-------- |:-------- |:------ |
| Apple    | Banana |  Orange  |:   Strawberry    :|
| Apple  &  Banana || ^^       |    Peach        :||


|: \:Fruits       :||          |:       Food     :||
| Apple    | Banana |  Orange  |:   Strawberry    :|


|:     Fruits \|\| Food           :|||
|:-------- |:-------- |:------------ |
| Apple    |: Apple  :|    Apple     \
| Banana   |  Banana  |    Banana    \
| Orange   |  Orange  |    Orange    |
|:   Rowspan is 5   :||:  How's it? :|
|^^   A. Peach       ||^^ 1. Fine    |
|^^   B. Orange      ||^^ 2. Bad  $I = \int \rho R^{2} dV$     |
|^^   C. Banana      ||   It's OK! ![example image][my-image]  |

[my-image]: http://www.unexpected-vortices.com/sw/rippledoc/example-image.jpg "An exemplary image"

