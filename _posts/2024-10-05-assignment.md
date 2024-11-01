---
layout: post
title: SQL 과제 제출
subtitle: 게임서버 개발 부트캠프
author: bbie
categories: pre-camp
tags: [sql]
---

SQL 관련 과제 제출 및 기록하기!

# 과제 제출

## SQL 문법을 연습해요

## 7. 랭크게임 하다가 싸워서 피드백 남겼어요…

아래와 같은 lol_feedbacks (LOL 피드백 테이블)이 있습니다.

| id | user_name | satisfaction_score | feedback_date |
| --- | --- | --- | --- |
| 1 | 르탄이 | 5 | 2023-03-01 |
| 2 | 배캠이 | 4 | 2023-03-02 |
| 3 | 구구이 | 3 | 2023-03-01 |
| 4 | 이션이 | 5 | 2023-03-03 |
| 5 | 구구이 | 4 | 2023-03-04 |

25.**`lol_feedbacks`** 테이블에서 만족도 점수(satisfaction_score)에 따라 피드백을 내림차순으로 정렬하는 쿼리를 작성해주세요!

```sql
SELECT * 
FROM lol_feedbacks 
ORDER BY 3 DESC;
```

26.**`lol_feedbacks`** 테이블에서 각 유저별로 최신 피드백을 찾는 쿼리를 작성해주세요!

```sql
SELECT * 
FROM lol_feedbacks 
ORDER BY 2,4 DESC;
```

27.**`lol_feedbacks`** 테이블에서 만족도 점수가 5점인 피드백의 수를 계산하는 쿼리를 작성해주세요!

```sql
SELECT COUNT(*) 
FROM lol_feedbacks 
WHERE satisfaction_score = 5;
```

28.**`lol_feedbacks`** 테이블에서 가장 많은 피드백을 남긴 상위 3명의 고객을 찾는 쿼리를 작성해주세요!

```sql
SELECT user_name, COUNT(*) 
FROM lol_feedbacks 
GROUP BY user_name 
ORDER BY COUNT(*) DESC LIMIT 3;
```

29.**`lol_feedbacks`** 테이블에서 평균 만족도 점수가 가장 높은 날짜를 찾는 쿼리를 작성해주세요!

```sql
SELECT feedback_date, AVG(satisfaction_score) 
FROM lol_feedbacks 
GROUP BY feedback_date 
ORDER BY AVG(satisfaction_score) DESC;
```
  
## 8. LOL을 하다가 홧병이 나서 병원을 찾아왔습니다.

이제, 아래와 같은 doctors(의사) 테이블이 있습니다.

| id | name | major | hire_date |
| --- | --- | --- | --- |
| 1 | 르탄이 | 피부과 | 2018-05-10 |
| 2 | 배캠이 | 성형외과 | 2019-06-15 |
| 3 | 구구이 | 안과 | 2020-07-20 |

30.**`doctors`** 테이블에서 전공(major)가 성형외과인 의사의 이름을 알아내는 쿼리를 작성해주세요!

```sql
SELECT name 
FROM doctors
WHERE major = '성형외과';
```

31.**`doctors`** 테이블에서 각 전공 별 의사 수를 계산하는 쿼리를 작성해주세요!

```sql
SELECT major, COUNT(*) 
FROM doctors
GROUP BY major
ORDER BY COUNT(*);
```

32.**`doctors`** 테이블에서 현재 날짜 기준으로 5년 이상 근무(hire_date)한 의사 수를 계산하는 쿼리를 작성해주세요!

```sql
SELECT *
FROM doctors
WHERE DATEDIFF(CURRENT_DATE(), hire_date) > 365*5;
```

33.**`doctors`** 테이블에서 각 의사의 근무 기간을 계산하는 쿼리를 작성해주세요!

```sql
SELECT *, DATEDIFF(CURRENT_DATE(), hire_date) AS workday
FROM doctors;
```

## 9. 아프면 안됩니다! 항상 건강 챙기세요!

의사가 있으면 당연히 의사에게 진료받는 환자가 있겠죠? 아래와 같은 patients(환자) 테이블이 있습니다.

| id | name | birth_date | gender | last_visit_date |
| --- | --- | --- | --- | --- |
| 1 | 르탄이 | 1985-04-12 | 남자 | 2023-03-15 |
| 2 | 배캠이 | 1990-08-05 | 여자 | 2023-03-20 |
| 3 | 구구이 | 1982-12-02 | 여자 | 2023-02-18 |
| 4 | 이션이 | 1999-03-02 | 남자 | 2023-03-17 |

34.**`patients`** 테이블에서 각 성별(gender)에 따른 환자 수를 계산하는 쿼리를 작성해주세요!

```sql
SELECT gender, COUNT(*)
FROM patients
GROUP BY gender
ORDER BY COUNT(*);
```

35.**`patients`** 테이블에서 현재 나이가 40세 이상인 환자들의 수를 계산하는 쿼리를 작성해주세요!

```sql
SELECT COUNT(*)
FROM patients
WHERE DATEDIFF(CURRENT_DATE(), birth_date) > 365*40;
```

36.**`patients`** 테이블에서 마지막 방문 날짜(last_visit_date)가 1년 이상 된 환자들을 선택하는 쿼리를 작성해주세요!

```sql
SELECT *
FROM patients
WHERE DATEDIFF(CURRENT_DATE(), last_visit_date) >= 365;
```

37.**`patients`** 테이블에서 생년월일이 1980년대인 환자들의 수를 계산하는 쿼리를 작성해주세요!

```sql
SELECT *
FROM patients
WHERE YEAR(birth_date) BETWEEN  1980 and 1989;
```

### 10. 이젠 테이블이 2개입니다

다음과 같은 직원(employees) 테이블과 부서(departments) 테이블이 있습니다.

- employees 테이블

| id | department_id | name |
| --- | --- | --- |
| 1 | 101 | 르탄이 |
| 2 | 102 | 배캠이 |
| 3 | 103 | 구구이 |
| 4 | 101 | 이션이 |

- departments 테이블

| id | name |
| --- | --- |
| 101 | 인사팀 |
| 102 | 마케팅팀 |
| 103 | 기술팀 |

38.현재 존재하고 있는 총 부서의 수를 구하는 쿼리를 작성해주세요!

```sql
SELECT COUNT(name)
FROM departments;
```

39.모든 직원과 그들이 속한 부서의 이름을 나열하는 쿼리를 작성해주세요!

```sql
SELECT employees.name, departments.name
FROM employees, departments
WHERE employees.department_id = departments.id
ORDER BY departments.id;
```

40.'기술팀' 부서에 속한 직원들의 이름을 나열하는 쿼리를 작성해주세요!

```sql
SELECT employees.name, departments.name
FROM employees, departments
WHERE employees.department_id = departments.id and departments.name = '기술팀';
```

41.부서별로 직원 수를 계산하는 쿼리를 작성해주세요!

```sql
SELECT departments.name, count(employees.name)
FROM employees, departments
WHERE employees.department_id = departments.id
GROUP BY departments.name;
```

42.직원이 없는 부서의 이름을 찾는 쿼리를 작성해주세요!

```sql
SELECT departments.name
FROM departments
LEFT JOIN employees ON departments.id = employees.department_id
WHERE employees.department_id is null;
```

43.'마케팅팀' 부서에만 속한 직원들의 이름을 나열하는 쿼리를 작성해주세요!

```sql
SELECT employees.name
FROM employees
JOIN departments ON employees.department_id = departments.id 
WHERE departments.name = '마케팅팀';
```

## 마지막  연습 문제 !

다음과 같은 상품(products) 테이블과 주문(orders) 테이블이 있습니다.

- products 테이블

| id | name | price |
| --- | --- | --- |
| 1 | 랩톱 | 1200 |
| 2 | 핸드폰 | 800 |
| 3 | 타블렛 | 400 |
- orders 테이블

| id | product_id | quantity | order_date |
| --- | --- | --- | --- |
| 101 | 1 | 2 | 2023-03-01 |
| 102 | 2 | 1 | 2023-03-02 |
| 103 | 3 | 5 | 2023-03-04 |

44.모든 주문의 주문 ID와 주문된 상품의 이름을 나열하는 쿼리를 작성해주세요!

```sql
SELECT orders.id, products.name
FROM orders, products
WHERE orders.product_id = products.id
ORDER BY orders.id;
```

45.총 매출(price * quantity의 합)이 가장 높은 상품의 ID와 해당 상품의 총 매출을 가져오는 쿼리를 작성해주세요!

```sql
SELECT products.name, SUM(products.price * orders.quantity) AS total_sales
FROM orders, products
WHERE orders.product_id = products.id
GROUP BY products.name
ORDER BY total_sales DESC
LIMIT 1;
```

46.각 상품 ID별로 판매된 총 수량(quantity)을 계산하는 쿼리를 작성해주세요!

```sql
SELECT products.id, SUM(orders.quantity) AS total_quantity
FROM orders, products
WHERE orders.product_id = products.id
GROUP BY products.id
ORDER BY products.id;
```

47.2023년 3월 3일 이후에 주문된 모든 상품의 이름을 나열하는 쿼리를 작성해주세요!

```sql
SELECT products.name
FROM orders, products
WHERE orders.product_id = products.id AND orders.order_date >= '2023-03-03'
GROUP BY products.name;
```

48.가장 많이 판매된 상품의 이름을 찾는 쿼리를 작성해주세요!

```sql
SELECT products.name
FROM orders, products
WHERE orders.product_id = products.id
GROUP BY products.name
ORDER BY SUM(orders.quantity) DESC
LIMIT 1;
```

49.각 상품 ID별로 평균 주문 수량을 계산하는 쿼리를 작성해주세요!

```sql
SELECT products.id, AVG(orders.quantity) AS total_quantity
FROM orders, products
WHERE orders.product_id = products.id
GROUP BY products.id
ORDER BY products.id;
```

50.판매되지 않은 상품의 ID와 이름을 찾는 쿼리를 작성해주세요!

```sql
SELECT products.id, products.name
FROM products
LEFT JOIN orders ON orders.product_id = products.id
WHERE orders.product_id is null;
```