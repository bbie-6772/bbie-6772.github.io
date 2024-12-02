---
layout: post
title: 본캠프 27일차 - [프로그래밍 심화 주차]
subtitle: 게임서버 개발 부트캠프
author: bbie
categories: bootcamp
banner:
  image: https://teamsparta.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F83c75a39-3aba-4ba4-a792-7aefe4b07895%2F5fe6ff06-7c84-4b9d-b068-a5ecc4fd2393%2FUntitled.png?table=block&id=13d2dc3e-f514-81da-83c4-c9f28cd61677&spaceId=83c75a39-3aba-4ba4-a792-7aefe4b07895&width=1420&userId=&cache=v2
  opacity: 0.618
  background: "#000"
  height: "50vh"
  min_height: "20vh"
tags: [codetest, petit-tft-project ]
---

## 오늘의 Troubleshooting

### 쁘띠 TFT 프로젝트

## 개선점 분석

## 지식창고

### 알고리즘 코드 카타

#### 체육복

- 문제  

점심시간에 도둑이 들어, 일부 학생이 체육복을 도난당했습니다. 다행히 여벌 체육복이 있는 학생이 이들에게 체육복을  빌려주려 합니다. 학생들의 번호는 체격 순으로 매겨져 있어, 바로 앞번호의 학생이나 바로 뒷번호의 학생에게만 체육복을  빌려줄 수 있습니다. 예를 들어, 4번 학생은 3번 학생이나 5번 학생에게만 체육복을 빌려줄 수 있습니다.  체육복이 없으면 수업을 들을 수 없기 때문에 체육복을 적절히 빌려 최대한 많은 학생이 체육수업을 들어야 합니다 

전체 학생의 수 n, 체육복을 도난당한 학생들의 번호가 담긴 배열 lost,  
여벌의 체육복을 가져온 학생들의 번호가 담긴 배열 reserve가 매개변수로 주어질 때,  
체육수업을 들을 수 있는 학생의 최댓값을 return 하도록 solution 함수를 작성해주세요.

- 조건

  - 전체 학생의 수는 2명 이상 30명 이하입니다.

  - 체육복을 도난당한 학생의 수는 1명 이상 n명 이하이고 중복되는 번호는 없습니다.

  - 여벌의 체육복을 가져온 학생의 수는 1명 이상 n명 이하이고 중복되는 번호는 없습니다.

  - 여벌 체육복이 있는 학생만 다른 학생에게 체육복을 빌려줄 수 있습니다.
  
  - 여벌 체육복을 가져온 학생이 체육복을 도난당했을 수 있습니다.  
  이때 이 학생은 체육복을 하나만 도난당했다고 가정하며,  
  남은 체육복이 하나이기에 다른 학생에게는 체육복을 빌려줄 수 없습니다.

```jsx
function solution(babbling) {
    let answer = 0;
    //옹알이 저장
    const word = ["aya","ye","woo","ma"]
    
    answer = babbling.reduce((acc,cur) => {
        // 값이 옹알이에 있는 것과 같으면 바로 +1 
        if (cur === word.find((val) => val === cur)) return acc + 1
        let double = cur
        for (let i = 0;i < word.length;i++) {
            // replace에서 전역으로 검사하기위해 RegExp 사용
            const w = new RegExp(word[i], "g");
            double = double.replace(w,i)
            // 만약 같은 숫자가 이어질경우 옹알이가 불가능하기에 for을 빠져나옴
            if (double.includes(`${i}${i}`)) break
            // double이 모두 숫자로 채워지면 가능하다는 말이기에 +1 
            if (/^[0-9]*$/.test(double)) return acc + 1
        }
        return acc
    },0)
    
    return answer;
}
// 근데 나중에 보니까 replaceAll 이라는 좋은 구문이 있더라
```

#### 숫자 짝꿍

- 문제  

두 정수 X, Y의 임의의 자리에서 공통으로 나타나는 정수 k(0 ≤ k ≤ 9)들을 이용하여 만들 수 있는 가장 큰 정수를 두 수의 짝꿍이라 합니다(단, 공통으로 나타나는 정수 중 서로 짝지을 수 있는 숫자만 사용합니다). X, Y의 짝꿍이 존재하지 않으면, 짝꿍은 -1입니다. X, Y의 짝꿍이 0으로만 구성되어 있다면, 짝꿍은 0입니다.

- 조건

  - 3 ≤ X, Y의 길이(자릿수) ≤ 3,000,000입니다.

  - X, Y는 0으로 시작하지 않습니다.

  - X, Y의 짝꿍은 상당히 큰 정수일 수 있으므로, 문자열로 반환합니다.

```jsx
function solution(X, Y) {
    let answer = [];
    
    for(let i = 0;i < 10;i++) {
        let xcount = 0;
        let ycount = 0;
        X.replaceAll(i,() => {xcount++})    
        Y.replaceAll(i,() => {ycount++})
        for (let y = 0;y < Math.min(xcount,ycount);y++) {
            answer.push(i)
        }
    }
    if (answer.length === 0) answer = -1
    else answer = answer.sort((a,b) => +b - +a).join("")
    if (+answer === 0) answer = 0
    
    return ""+answer
}
```

- 최적화 실패 버전..

```jsx
function solution(babbling) {
    let answer = '';
    
    answer = X.split("").filter((e) => {
        if (Y.includes(e)) {
            Y = Y.replace(e,"")
            return true
        } else return false
    }).sort((a,b) => +b - +a).join("")
    
    if (answer.length <= 0) answer = -1
    if (+answer === 0) answer = 0
    
    return ""+answer;
}
```

### Reference

[programmers](https://school.programmers.co.kr/)  
[스파르타코딩클럽](https://spartacodingclub.kr/)

[1]: https://github.com/user-attachments/assets/b91d10c2-7bc7-4c62-9bbe-2b943e975100
[2]: https://github.com/user-attachments/assets/f72e695d-8205-4575-b11e-c9bbb8a9074b
[3]: https://github.com/user-attachments/assets/53c6850c-a7bd-4758-a6f7-c4945fea1707

---
