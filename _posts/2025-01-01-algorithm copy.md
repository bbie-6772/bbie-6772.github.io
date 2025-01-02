---
layout: post
title: 알고리즘 - < 탐색/검색 >
subtitle: 탐색과 경우의 수
author: bbie
categories: Algorithm
banner:
  image: https://github.com/user-attachments/assets/4c07d091-e6a5-43f6-b9f4-5e6e214f7cb9
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [Searching, DFS, BFS]
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
    // 범위를 최대한 줄였을 때 범위의 가장 오른쪽을 기준으로 마지막 값을 반환
    return R - 1
```

### 해싱 검색 (Hashing search)

- 해시 함수를 기반으로 Key를 레코드(데이터)에 직접 매핑하는 방식

- [참고 포스트](https://bbie-6772.github.io/server/2024/12/31/database.html)

### 트리 탐색 알고리즘

![image](https://github.com/user-attachments/assets/6c1093eb-826c-497e-b125-0d1335c973ac)

- 그래프나 트리와 같은 자료구조를 탐색/검색 하는 알고리즘

- 경우의 수를 구하는 방식으로 사용됨

#### BFS(Breadth First Search)

![image](https://github.com/user-attachments/assets/4fe570a6-00b3-450d-8e20-ff42d6f15820)

- 갈림길에 연결되어 있는 모든 길을 한번씩 탐색한 뒤 다시 연결되어 있는 모든 길을 넓게 탐색하는 방식

- 스택 ( 마지막에 들어온 사람이 먼저 나가는 방식 ) 대신 큐 ( 선입선출 방식)를 사용

- 정점이 대기열에서 제거될 때까지 확인을 미루는 대신, 정점을 대기열(Queue)에 넣기 전에 해당 정점이 탐색되었는지 확인

```jsx
// 의사코드(Pseudocode)
// G = 트리 구조, root = 시작 지점
procedure BFS(G, root) is
    // Queue 구조 데이터 생성
    let Q be a queue
    // root 를 탐색됨 상태로 지정
    label root as explored
    // Q에 찾는 지점을 삽입
    Q.enqueue(root)
    // Q가 비어있지 않은 동안 실행
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
                // 처음 넣은 값을 부모로 지정
                w.parent := v
                // 노드를 Q에 마지막으로 저장
                Q.enqueue(w)
```

```jsx
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

#### DFS(Depth First Search)

![image](https://github.com/user-attachments/assets/72b1206e-91bc-4fd6-aad8-1e933e1e96f5)

- 

## Reference

[나무위키](https://namu.wiki/w/%ED%83%90%EC%83%89%20%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98)  

[WIKIPEDIA](https://en.wikipedia.org/wiki/Search_algorithm)

---
