---
layout: post
title: 알고리즘 - < 정렬/재귀 >
subtitle: 퀵정렬과 무차별 대입법
author: bbie
categories: Algorithm
banner:
  image: https://github.com/user-attachments/assets/4c07d091-e6a5-43f6-b9f4-5e6e214f7cb9
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [Sort]
---

## 알고리즘

### 퀵 정렬

![image](https://github.com/user-attachments/assets/6a24149e-5420-40d0-a337-cb819717427a)

- 분할 후 정복(Divide and Conquer) 방식으로 데이터를 나눈 후 정렬하며 정리하는 방식

1. 피벗(Pivot) 이라는 기준점을 정하여 왼쪽과 오른쪽으로 그룹을 나눈다.  
( 피벗보다 작은 값을 왼쪽 그룹, 큰 값을 오른쪽 그룹 )

2. 왼쪽 끝과 오른쪽 끝에서부터 피벗과 비교를 시작하며 중앙으로 향한다

3. 각 끝에서 시작한 윈도우들은 피벗과 비교해 그룹에 맞지 않는 값을 발견하면 멈춘다

4. 두 윈도우가 맞지않는 값을 찾았다면 교환을 실시한다

5. 이러한 과정을 재귀(Recursive)과정을 통해 정렬을 마무리한다.

#### 재귀

- 함수가 자기 자신을 다시 호출하는 것

- 일을 더 작은 부분으로 나누어서 그 작은 일을 해결하는 방식

- 가장 유명한 사용 예시로 팩토리얼이 있음

```jsx
function factorial(n) {
  // 종료 조건: 1!은 1
  if (n === 1) return 1; 
  // 재귀 호출: n * (n-1)!
  else return n * factorial(n - 1); 
}

console.log(factorial(5)); // 120
```

#### 예시 코드

```jsx
const quicksort = (arr, left = 0, right = arr.length -1) => {
    if (left < right) {
        //기준점을 찾고 기준점을 중심으로 더 작은수, 더 큰수 분류
        const i = position(arr, left, right);
        //기준점 기준 좌측 정렬
        quicksort(arr, left, i - 1);
        //기준점 기준 우측 정렬
        quicksort(arr, i + 1, right);
    }
    return arr;
};

const position = (arr, left, right) => {
    const pivot = arr[left];
    let [i, j] = [left, right];

    //제자리 더 큰수/더 작은 수 좌우 배치.
    while (i < j) {
        // 큰, 작은 수 위치 찾기
        while (arr[j] > pivot) j--;
        while (i < j && arr[i] <= pivot) i++;
        // 큰, 작은 수 위치 교환 
        [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    // 피벗보다 작은 수들이 왼쪽에, 큰 수들이 오른쪽에 배치된 후 "피벗의 최종 위치"를 반영
    // pivot 은 arr[left]의 초기값임
    [arr[left], arr[j]] = [arr[j], pivot];

    return j;
}
```

### 무차별 대입(Brute Force)

- 가능한 모든 경우의 수를 하나씩 전부 시도해서 답을 찾는 방법

```jsx
// 주어진 숫자 배열의 모든 가능한 조합 구하기
function generateCombination(arr) {  
    // 빈 배열로 시작  
    const result = [[]];  

    for (let num of arr) {  
        // 초기 길이 저장
        const len = result.length;  
        for (let i = 0; i < len; i++) {  
            // 기존 부분집합에 현재 숫자를 추가한 새로운 부분집합 생성  
            result.push([...result[i], num]);  
        }  
    }  

    return result;  
}  

console.log(generateCombinations([1, 2, 3]));
// 출력: [[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]]
```

---
