---
layout: post
title: 알고리즘 - < 탐색/검색 >
subtitle: 탐색과 경우의 수(Searching, DFS, BFS, Prime-Number)
author: bbie
categories: Study
banner:
  image: https://github.com/user-attachments/assets/4c07d091-e6a5-43f6-b9f4-5e6e214f7cb9
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [Algorithm]
---

## 탐색/검색 알고리즘(Search algorithm)

- 방대한 데이터에서 목적에 맞는 데이터를 찾아내기 위한 알고리즘을 통칭

- 검색 메커니즘에 따라 선형, 이진, 해싱 세 가지 알고리즘으로 분류가능

### 선형 검색(Linear / Sequential search)

- 일치 항목을 찾거나 전체 목록이 검색될 때까지 목록의 각 요소를 순차적으로 확인하는 방식

#### With Sentinel 방식

- 기본 알고리즘은 반복당 아래와 같은 두 번의 비교를 수행함

  1. arr[idx] 가 Target 과 같은지 확인

  2. idx 가 여전히 목록의 유효한 인덱스를 가리키는지 확인

- 찾는 대상(Target)과 같은 추가 레코드**arr[n]( 센티널 값 ) 을 목록에 추가**하면  
두 번째 비교는 검색이 끝날 때까지 제거되어 알고리즘이 더 빨라짐

  - 추가 설명을 하자면 유효한 인덱스 여부를 검색 종료 시점에 idx < n 비교 방식으로 치환하였음  
  ( 목록에 arr[n]을 **마지막으로 추가**하였기 때문에 **목록에서 값을 찾았다면 idx는 n보다 작아야됨** )

#### Ordered Table

- 목록이 정렬되어있는 경우 arr[idx]가 Target을 초과하면 검색을 종료해 Target의 존재여부를 빠르게 확인할 수 있음

정렬된 배열 [1, 2, 3, 6, 7, 9, 10] 에서 5를 찾는 과정에서  
6을 만나면 5를 초과했기에 없다는 걸 빠르게 알 수 있음

### 이진 검색 (Binary / half-interval / logarithmic search ,  Binary chop)

![image](https://github.com/user-attachments/assets/64572de6-30f1-4c0c-9442-886f33892c33)

- 대상 값을 배열의 중간 요소와 비교하여 같지 않으면 대상이 있을 수 없는 절반을 제거함

- 나머지 절반에서 탐색을 계속하여 중간 요소를 대상 값과 비교하고 대상 값을 찾을 때까지 이를 반복하는 방식

- 비교 검색 알고리즘은 대상 레코드를 찾을 때까지 키를 비교하여 레코드를 연속적으로 제거하여 선형 검색을 개선함

- 정의된 순서가 있는 데이터 구조에 적용되는 방식

```jsx
// 의사코드(Pseudocode) 로 가독성을 위해 코드블럭은 jsx 형식 사용
// A = 목록, n = 목록길이, T = 찾는 값
function binary_search(A, n, T) is
    // 목록의 인덱스 부여로 범위 설정
    L := 0
    R := n − 1
    while L ≤ R do
        // 중앙 값 찾기
        m := floor((L + R) / 2)
        // 중앙 값과 목표를 비교해 범위 조정
        if A[m] < T then
            L := m + 1
        else if A[m] > T then
            R := m − 1
        else:
        // 목표를 찾으면 반환
            return m
    // 못 찾으면 실패를 반환
    return unsuccessful
```

- 최적화 코드 : 위의 코드의 경우는 루프당 비교문을 여러번 실행하지만 아래의 코드는 비교문을 분리해 최적화 하였다

```jsx
// A = 목록, n = 목록길이, T = 찾는 값
function binary_search_alternative(A, n, T) is
  L := 0
  R := n − 1
  while L != R do
      m := ceil((L + R) / 2)
      if A[m] > T then
          R := m − 1
      // 중앙 값이 타겟보다 크지만 않으면 중앙 값을 범위 시작점에 대입
      else:
          L := m
  // 찾는 값과 while문을 빠져나온 값이 같은지를 마지막에 판정
  if A[L] = T then
      return L
  return unsuccessful
```

#### 중복 요소

- 이진 방식의 경우 중복 된 값이 있는 배열 [1, 2, 3, 4, 4, 5, 6, 7] 에서 4를 찾으려 하면 4번째 요소가 아닌 5번째 요소를 찾아주게됨

- 이러한 경우 원하는 값들 중 가장 왼쪽(첫 번째) 또는 가장 오른쪽(마지막)을 얻으려면 또 다른 로직이 필요!

- 첫 번째 값 구하기 (및 작은 근삿값 찾기)

```jsx
// A = 목록, n = 목록길이, T = 찾는 값
function binary_search_leftmost(A, n, T):
    L := 0
    R := n
    // L이 R과 같거나(찾았거나) 커질 때(근삿값)
    while L < R:
        m := floor((L + R) / 2)
        if A[m] < T:
            L := m + 1
        // 중앙 값이 타겟 값보다 작지 않을 때 범위를 중앙 값보다 왼쪽으로 설정
        else:
            R := m
    // 범위를 최대한 줄였을 때 범위의 가장 왼쪽을 기준으로 인덱스를 반환
    return L
```

- 마지막 값 구하기 (및 큰 근삿값 찾기)

```jsx
// A = 목록, n = 목록길이, T = 찾는 값
function binary_search_rightmost(A, n, T):
    L := 0
    R := n
    // L이 R과 같거나(찾았거나) 커질 때(근삿값)
    while L < R:
        m := floor((L + R) / 2)
        if A[m] > T:
            R := m
        // 중앙 값이 타겟 값보다 크지 않을 때 범위를 중앙 값보다 오른쪽으로 설정
        else:
            L := m + 1
    // 범위를 최대한 줄였을 때 범위의 가장 오른쪽을 기준으로 마지막 인덱스를 반환
    return R - 1
```

### 해싱 검색 (Hashing search)

- 해시 함수를 기반으로 Key를 레코드(데이터)에 직접 매핑하는 방식

- [참고 포스트](https://bbie-6772.github.io/server/2024/12/31/database.html)

### 트리 탐색 알고리즘

![image](https://github.com/user-attachments/assets/6c1093eb-826c-497e-b125-0d1335c973ac)

- 그래프나 트리와 같은 자료구조를 탐색/검색 하는 알고리즘

- 경우의 수를 구하는 방식으로 사용됨

- 여러 갈래 중 무한한 길이를 가지는 경로가 존재하고 탐색 목표가 다른 경로에 존재하는 경우  

  - DFS로 탐색할 시에는 무한한 길이의 경로에서 영원히 종료하지 못함

  - BFS의 경우는 모든 경로를 동시에 진행하기 때문에 탐색이 가능함

#### DFS(Depth First Search)

![image](https://github.com/user-attachments/assets/72b1206e-91bc-4fd6-aad8-1e933e1e96f5)

- 시작 노드 에서 시작하여 백트래킹하기 전에 각 브랜치를 따라 가능한 한 멀리 탐색하는 방식

- 큐 ( 선입선출 방식) 대신 **스택 ( 마지막에 들어온 사람이 먼저 나가는 방식 )** 을 사용

- 정점을 추가하기 전에 탐색되었는지 검사를 수행하는 대신,  
스택에서 정점이 삭제될 때 정점이 발견되었는지 확인하지 않음

```jsx
// 의사코드(Pseudocode)
// G = 트리/그래프 구조 데이터, v = 시작 지점(노드)
// 재귀적 구현
procedure DFS(G, v) is
    label v as discovered
    // 시작 노드 v 에서 출발하는 모든 노드 w(자식)를 확인 (directed는 방향성을 나타냄)
    for all directed edges from v to w that are in G.adjacentEdges(v) do
        // w 가 탐색되지 않았다면 재귀 호출
        if vertex w is not labeled as discovered then
            recursively call DFS(G, w)

// 비재귀적 구현
procedure DFS_iterative(G, v) is
    // Stack 구조 데이터 생성
    let S be a stack
    // 시작 노드를 삽입
    S.push(v)
    // S가 빌때까지 반복 ( do 를 이용해 처음한번은 무조건 되도록 )
    while S is not empty do
        // 마지막에 넣은 값을 빼면서 삽입
        v = S.pop()
        // 탐색되지 않았다면
        if v is not labeled as discovered then
            // 탐색으로 지정 후
            label v as discovered
            // 모든 자식 노드 w 를 넣음
            for all edges from v to w in G.adjacentEdges(v) do 
                S.push(w)

//  반복자(Iterator) Stack 사용
procedure DFS_iterative(G, v) is
    let S be a stack
    label v as discovered
    // 시작 노드에 연결된 노드들을 순서대로 넣음
    S.push(iterator of G.adjacentEdges(v))
    while S is not empty do
        // 스택의 최상단 요소(마지막에 추가한 노드)를 확인하고 다음 인접 노드(자식)가 있다면
        if S.peek().hasNext() then
            // 다음 인접 노드를 가져옴
            w = S.peek().next()
            // 인접 노드가 탐색되지 않았으면
            if w is not labeled as discovered then
                // 탐색으로 지정하고
                label w as discovered
                // 노드의 자식 노드를 넣음
                S.push(iterator of G.adjacentEdges(w))
        else
            // 최상단 요소의 인접 노드가 없으면 마지막 요소를 지움
            S.pop()
```

```jsx
// graph = 트리/그래프 구조 데이터, start = 시작 지점(노드)
function dfs(graph, start, visited = new Set()) {  
    // 시작 지점을 방문함에 저장
    visited.add(start);  

    // 노드들을 돌며 재귀 호출을 통해 탐색을 함
    for (const neighbor of graph[start]) {  
        if (!visited.has(neighbor)) {  
            dfs(graph, neighbor, visited);  
        }  
    }  
}  
```

#### BFS(Breadth First Search)

![image](https://github.com/user-attachments/assets/4fe570a6-00b3-450d-8e20-ff42d6f15820)

- 갈림길에 연결되어 있는 모든 길을 한번씩 탐색한 뒤 다시 연결되어 있는 모든 길을 넓게 탐색하는 방식

- 스택 ( 마지막에 들어온 사람이 먼저 나가는 방식 ) 대신 **큐 ( 선입선출 방식)**를 사용

- 최단 경로를 찾으려 할 때 사용 가능  
( 대신 경로에 추가적인 가중치가 없어야 함 )

- 정점이 대기열에서 제거될 때까지 탐색되었는지 확인을 미루는 대신,  
정점을 대기열(Queue)에 넣기 전에 해당 정점이 탐색되었는지 확인함

```jsx
// 의사코드(Pseudocode)
// G = 트리/그래프 구조 데이터, root = 시작 지점(노드)
procedure BFS(G, root) is
    // Queue 구조 데이터 생성
    let Q be a queue
    // root 를 탐색됨 상태로 지정
    label root as explored
    // Q에 시작 노드 삽입
    Q.enqueue(root)
    // Q가 비어있지 않은 동안 실행 ( do 를 이용해 처음한번은 무조건 되도록 )
    while Q is not empty do
        // Q에서 처음 들어간 값을 빼며 v에 저장
        v := Q.dequeue()
        // v가 찾는 값이면 반환하며 끝
        if v is the goal then
            return v
        // 현재 노드 v의 모든 인접 노드 w를 확인
        for all edges from v to w in G.adjacentEdges(v) do
            // 인접 노드가 확인되어 있지 않으면 확인 표시
            if w is not labeled as explored then
                label w as explored
                // 현재 노드 v를 인접 노드 w의 부모로 지정
                w.parent := v
                // 노드를 Q에 마지막으로 저장
                Q.enqueue(w)
```

```jsx
// graph = 트리/그래프 구조 데이터, start = 시작 지점(노드)
function bfs(graph, start) {  
      const visited = new Set();  
      const queue = [start];  

      while (queue.length > 0) {  
          // 맨 앞의 노드를 삭제하며 읽음
          const node = queue.shift();  
          if (!visited.has(node)) {  
              visited.add(node);  
              // 내부 노드들 중 방문하지 않은 객체만 넣음
              queue.push(...graph[node].filter(neighbor => !visited.has(neighbor)));  
          }  
      }  
  }  
```

## 소수(Prime Number) 구하기

- 소수를 구하는 알고리즘 중 좋아보이는 것들을 발견하여 추가로 기록!

### 기본 방법

- 소수란 1보다 큰 자연수 중 1과 자기 자신만을 약수로 가지는 수를 의미한다  
(즉 자신과 1을 제외한 정수로 나눠지지 않는 수!)

- 이러한 정의를 가지고 소수를 구하는 방법은 바로 2부터 자신의 아랫 수까지 나눠지는지 확인하는 방법이다!

```jsx
const isPrime = (n) => {
    for (let i = 2;i < n;i++) {
        if (n % i === 0) return false 
    }
    return true
}
```

### 정수의 특성 이용 (Trial division)

- 기본 방법의 경우 2부터 자신 아래의 수까지 전부 계산하기 때문에 비효율적이다!

- 정수 N = A x B 일 때, A 또는 B는 N의 제곱근보다 같거나 작다는 특성을 이용하면 계산을 줄일 수 있다!  

```jsx
const isPrime = (n) => {
    for (let i = 2;i * i<= n;i++) {
        if (n % i === 0) return false 
    }
    return true
}
```

### 에라토스테네스의 체 (Sieve of Eratosthenes)

![image](https://github.com/user-attachments/assets/ad124a41-86ab-49fd-8535-f35595a945da)

- 소수 목록을 생성하는 가장 오랫동안 알려진 방법

- 각 소수의 배수를 합성수(소수가 아님)로 반복적으로 표시하는 방법

- 발견된 각 소수의 모든 배수가 합성수로 표시되면 나머지 표시되지 않은 숫자는 소수가 됨

```jsx
const isPrime = (n) => {
    // 0 부터 n 까지의 길이를 생성하고 true(소수)로 초기화
    const arr = new Array(n + 1).fill(true);
    // 0 과 1은 소수가 아니므로 false로 설정
    arr[0] = arr[1] = false;
    // 제곱근 구하기 ( 정수의 특성 이용 )
    const sqrt = Math.floor(Math.sqrt(n));

    // 2부터 시작
    for (let i = 2; i <= sqrt; i++) {
        // 소수를 찾으면
        if (arr[i] === true) {
            // 소수의 배수들을 합성수로 지정(false)
            for (let j = 2; i * j <= n; j++) {
                arr[i * j] = false;
            }
        }
    }

    // 이 부분은 arr을 반환하여 범위 내의 소수를 구하는 형식으로도 사용가능하다
    return arr[n];
}
```

### 앳킨의 체 (Sieve of Atkin)

- 위의 에라토스테네스의 체와 비슷하지만 조금 더 효율적으로 바뀐 현대 알고리즘이다!

- 앳킨의 체는 2, 3, 5를 초기 소수 목록에 포함시키고, 60으로 나눈 나머지에 따라 특정 이차 방정식을 사용하여 잠재적 소수를 판별하는 방식입니다!

- 알고리즘은 4x² + y², 3x² + y², 3x² - y² 등의 이차 방정식을 사용하여 소수 여부를 결정하는 방식

- 에라토스테네스의 체와 비교했을 때, 이론적으로 더 효율적이지만 실제 구현에서는 성능이 다소 떨어질 수 있음

### 희소 소수 체(Sparse Prime Sieve)

- 이론상 빠르다고 합니다.. ( 사용하기 전에 수학 공부좀 많이 해야 겠네요.. )

#### 6k ± 1 소수 분포 이론

- 모든 소수(2와 3 제외)는 6k±1 형태로 표현 가능  
( 6k+1: [1, 7, 13, 19, 25, 31, 37, 43, ...] , 6k-1: [5, 11, 17, 23, 29, 35, 41, 47, ...] )

- 임의의 정수 n에 대해

  - n이 2로 나누어 떨어지면 짝수 (소수 아님)

  - n이 3으로 나누어 떨어지면 3의 배수 (소수 아님)

- 따라서 나머지가 1 또는 5인 수만 잠재적 소수 후보가 된다는 이론

- 이러한 소수 후보는 전체 숫자 범위의 약 1/3에 해당함

#### 최적화

- 전체 숫자 범위의 1/3만 체크 (n/3)

- 불필요한 짝수와 3의 배수 사전 제외

- 제곱수의 배수를 효율적으로 제거

- 비트 연산을 통한 빠른 마킹 및 필터링

- **핵심 내용**

  - 숫자 범위 변환 n = {0:n,1:n-1,2:n+4,3:n+3,4:n+2,5:n+1}[n%6]  
  ( 6의 나머지에 따라 최적의 범위로 조정 )

  - 비트 연산 최적화

    - k = 3 * i+1 \| 1 ( 마지막 비트를 1로 만들어 항상 홀수가 됨 )

    - i & 1 ( 비트 AND 연산으로 홀/짝 판단 )

  - 슬라이싱 기법( 배열이나 리스트에서 특정 범위의 요소들을 한 번에 선택하는 방법 )

#### 판별 코드(1)

```jsx
function primes(n) {  
    // 6k ± 1 최적화를 위한 보정  
    const correction = (n % 6 > 1);  
    
    // 6의 나머지에 따른 범위 조정  
    // 소수 분포의 불규칙성을 체계적 알고리즘으로 접근
    n = {  
        0: n,  
        1: n - 1,  
        2: n + 4,  
        3: n + 3,  
        4: n + 2,  
        5: n + 1  
    // 위의 범위에서 n % 6 의 수에 따라 n이 조정됨
    }[n % 6];   

    // 체 초기화 (n/3 크기의 true 배열)  
    const sieve = new Array(Math.floor(n / 3)).fill(true);  
    sieve[0] = false;  

    // 제곱근까지만 체크  
    for (let i = 0; i < Math.floor(Math.sqrt(n) / 3) + 1; i++) {  
        if (sieve[i]) {  
            // 홀수로 만들기 (비트 OR 연산 "| 1" 사용)  
            const k = 3 * i + 1 | 1;  

            // 첫 번째 슬라이싱 로직 (k의 제곱에서 k의 2배 간격으로 소수제외)
            // 제곱 나누기 3은 희소 배열 최적화임
            for (let j = Math.floor((k * k) / 3); j < sieve.length; j += 2 * k) {  
                sieve[j] = false;  
            }  

            // 두 번째 슬라이싱 로직 (k의 제곱에서 k의 2배 간격으로 소수제외)
            // k * k: 제곱수
            // 4 * k: 추가 오프셋
            // 2 * k * (i & 1): 비트 AND로 홀/짝 조정 => i가 홀수 일 경우에만 조정값이 들어감
            // 나누기 3은 희소 배열 최적화임
            for (let j = Math.floor((k * k + 4 * k - 2 * k * (i & 1)) / 3); j < sieve.length; j += 2 * k) {  
                sieve[j] = false;  
            }  
        }  
    }  

    // 결과 생성  
    const result = [2, 3];  
    //
    for (let i = 1; i < Math.floor(n / 3) - correction; i++) {  
        if (sieve[i]) {  
            // 짝수 소수는 2가 유일하므로 홀수로 치환
            result.push(3 * i + 1 | 1);  
        }  
    }  

    return result;  
}  
```

### 페르마의 소수 판별법 (Fermat Primality Test)

- 소수 p와 p와 서로소인 임의의 정수 a 에 대해 a^(p-1) ≡ 1 (mod p) 가 만족하는지 확인하는 판별법
( a^(p-1) 는 a의 p-1 제곱을 뜻함 / 1 (mod p) 은 값을 p로 나눴을 때 남은 값이 1 이라는 걸 의미함)

- 프로그래밍적으로 요약하자면 **a^(p-1) % p === 1 을 만족하는 서로소 정수 a 가 있을 경우 p는 확률적 소수임**

- 등식이 하나 이상의 a 값에 대해 유지되면 p 를 확률적 소수로 판단함  
( 이 때 확률적 소수가 실질적으로 소수가 아닐 경우 **페르마의 의사소수(Fermat pseudoprime)**라 함)

- 페르마의 소정리를 이용하면 어떤 수가 소수인지를 확실하게 판정해 줄 수는 없지만,  
조건을 만족하지 않으면 합성수임은 판정할 수 있음

- 매우 큰 수의 소수 판별 가능

```jsx
 // k는 반복횟수를 의미하며 이 값이 높을 수록 정확도가 올라감
 // 숫자 뒤에 n은 BigInt 타입임을 암시해줌
function fermatPrimalityTest(n, k = 5) {  
    // 작은 수 처리 
    if (n <= 1n) return false;  
    if (n <= 3n) return true;  
    
    // 짝수 처리 (2 제외)  
    if (n % 2n === 0n) return n === 2n;  

    // 페르마 테스트 수행 ( 지수제곱을 비트 분해 접근법으로 효율적으로 구함 )
    // base = 임의의 정수(a) / exponent = 지수(p-1) / modulus = 나눌 수(p)
    function modPow(base, exponent, modulus) {  
        let result = 1n;  
        // base를 modulus로 나눈 나머지로 초기화 
        // modulus 를 각 단계별로 나눠 오버플로우 방지
        base = base % modulus;  
        
        // 2진수로 지수의 각 비트 순회 (제일 작은 순부터 큰 순으로)
        while (exponent > 0n) { 
            // 현재 비트가 1인지 확인 
            if (exponent % 2n === 1n) {  
                // 비트가 존재할 경우 result에 base를 곱함 (+ 미리 modulus로 나눠주기) 
                result = (result * base) % modulus;  
            }  
            /* 다음 비트 자리(상위)로 이동 */
            // 지수를 절반으로 줄임 
            exponent = exponent / 2n;  
            // base를 제곱하여 다음 비트 자리를 준비  (+ 미리 modulus로 나눠주기)
            base = (base * base) % modulus;  
        }  
        
        return result;  
    }  

    // k번 반복 테스트  
    for (let i = 0; i < k; i++) {  
        // 랜덤 기저 선택 (2부터 n-2 사이)  
        const a = 2n + BigInt(Math.floor(Math.random() * Number(n - 3n)));  
        
        // 페르마 조건 검사  
        if (modPow(a, n - 1n, n) !== 1n) {  
            // 합성수 
            return false; 
        }  
    }  

    // 소수일 가능성 높음 ( 확률적 소수 )
    return true; 
}  
```

#### 비트 분해 접근법

- 수학과 컴퓨터 과학에서 데이터나 신호를 작은 단위로 분해하여 효율적으로 처리하는 방법론

- 여기선 지수 계산을 비트 단위로 분해하여 여러 번에 걸쳐 계산함

```ini
; 10진수의 일반적 계산
3^13 = 3 * 3 * 3 * 3 * 3 * 3 * 3 * 3 * 3 * 3 * 3 * 3 * 3 

; 13을 2진수로 표현(비트 분해): 1101 (8 + 4 + 0 + 1)  
3^13 = 3^(8+4+1) = 3^8 * 3^4 * 3^1  

; n / 2 를 통해 다음 비트로 이동
; 나머지가 1인지 확인하여 있을때만 계산
; 13 (이진수: 1101)  
13 ÷ 2 = 6 나머지 1 ✓  
6 ÷ 2 = 3 나머지 0 ✓  
3 ÷ 2 = 1 나머지 1 ✓  
1 ÷ 2 = 0 나머지 1 ✓  
```

### 밀러-라빈 소수 판별법 (Miller-Rabin Primality Test)

- 페르마의 소수 판별법을 확장한 알고리즘 ( 페르마의 소정리와 2차 잉여(quadratic residue) 성질을 활용 )

- 페르마의 소수 판별법과 같이 합성수(소수가 아닌 수)를 확실히 걸러낼 수 있음

- 완전한 증명 대신 "소수일 가능성이 매우 높다"를 판단

- 매우 큰 수의 소수 판별에 효과적임

#### 판별 수식

- n-1 = 2^s * d 형태로 분해 (s 는 지수 d 는 정수이자 홀수 )  
( 이 분해를 통해 소수의 특별한 성질을 검증할 수 있음 )

- a^(n-1) ≡ 1 (mod n)  
( 페르마의 소수 판별법과 동일)

- a^((n-1)/2) ≡ ±1 (mod n)  

#### 판별 코드(2)

- 기본 형태

```jsx
// base = 임의의 정수(a) / exponent = 지수(p-1) / modulus = 나눌 수(p)
function modPow(base, exponent, modulus) {  
    // 모듈러 지수 연산 구현  
    if (modulus === 1) return 0;  
    let result = 1;  
    base = base % modulus;  
    
    while (exponent > 0) {  
        if (exponent % 2 === 1) {  
            result = (result * base) % modulus;  
        }  
        base = (base * base) % modulus;  
        exponent = Math.floor(exponent / 2);  
    }  
    
    return result;  
}  

// n = 판별할 수, a = 임의의 정수
function millerRabin(n, a) {  
    // n-1 = 2^s * d 분해  
    let s = 0;  
    let d = n - 1;  
    
    // d가 홀수가 될 때까지 분해
    while (d % 2 === 0) {  
        s++;  
        d = Math.floor(d / 2);  
    }  
    
    // 초기 계산  
    let x = modPow(a, d, n);  
    
    // 제곱 단계  
    for (let r = 0; r < s; r++) {  
        let y = modPow(x, 2, n);  
        
        // 비자명적 2차 여현 조건 검사  
        if (y === 1 && x !== 1 && x !== n - 1) {  
            // 합성수
            return false;   
        }  
        x = y;  
    }  
    // 최종 검사  
    return x === 1;  
}  

function millerRabinTest(n, k = 5) {  
    // 기본 케이스 처리  
    if (n <= 1 || n === 4) return false;  
    if (n <= 3) return true;  
    
    // k번 테스트  
    for (let i = 0; i < k; i++) {  
        // 2와 n-2 사이의 랜덤 베이스 선택  
        const a = Math.floor(Math.random() * (n - 3)) + 2;  
        
        if (!millerRabin(n, a)) {  
            return false;  
        }  
    }  
    
    return true;  
}  
```

- 큰 수를 검사할 때 (BigInt)

```jsx
function modPow(base, exponent, modulus) {  
    // 모듈러 지수 연산 구현  
    if (modulus === 1n) return 0;  
    let result = 1n;  
    base = base % modulus;  

    while (exponent > 0n) {  
        if (exponent % 2n === 1n) result = (result * base) % modulus;  
        base = (base * base) % modulus;  
        exponent = exponent / 2n;  
    }  
    return result;  
}  

// n = 판별할 수, a = 임의의 정수
function millerRabin(n, a) {  
    // n-1 = 2^s * d 분해  
    let s = 0n;  
    let d = n - 1n;  
    // d가 홀수가 될 때까지 분해
    while (d % 2n === 0) {  
        s++;  
        d /= 2n;  
    }  
    // 초기 계산  
    let x = modPow(a, d, n);  
    // 제곱 단계  
    for (let r = 0n; r < s; r++) {  
        let y = modPow(x, 2n, n);  
        // 비자명적 2차 여현 조건 검사  
        if (y === 1n && x !== 1n && x !== n - 1n) return false;   
        x = y;  
    }  
    // 최종 검사  
    return x === 1n;  
}  

function millerRabinTest(n, k = 5) {  
    // 기본 케이스 처리  
    if (n <= 1n || n === 4n) return false;  
    if (n <= 3n) return true;  
    // 랜덤 값 대신 검증된 소수를 통해 판별
    const testBases = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n]
    
    // k번 테스트  
    for (let i = 0; i < k; i++) {  
        // 테스트 수는 판별하려는 숫자보다 작아야 함
        if (testBases[i] >= n) break;  
        if (!millerRabin(n, testBases[i])) return false;  
    }  

    return true;  
}  
```

## Reference

[나무위키](https://namu.wiki/w/%ED%83%90%EC%83%89%20%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98)  
[WIKIPEDIA - Search Algorithm](https://en.wikipedia.org/wiki/Search_algorithm)  
[WIKIPEDIA - Prime Number](https://en.wikipedia.org/wiki/Prime_number)  
[Tistory - archives](https://qkqhxla1.tistory.com/687)  
[WIKIPEDIA - Miller-Rabin](https://en.wikipedia.org/wiki/Miller%E2%80%93Rabin_primality_test)

---
