---
layout: post
title: Markdown 예제1
subtitle: 각 게시물에 부제목도 있어요!
categories: example
tags: [markdown]
---

일반적으로 markdown 언어를 여기에 작성하면 Jekyll이 자동으로 멋진 웹페이지로 변환시켜줘요!  
[markdown 공부에 5분정도는 투자](https://markdowntutorial.com/)하는 걸 매우 권장해요..  
일반 텍스트를 굵게/기울임/제목/표 등으로 변환하는 방법을 알려줘요!

이 문서는 [Markdown][1] 으로 무엇을 할 수 있는지 보여드립니다!

## Markdown 예시

*참고: 이 페이지를 자유롭게 쓰세요. 이 노트는 자동으로 저장되지 않습니다!*

## 기본 서식

문단은 다음과 같이 쓸 수 있습니다. 문단은 마크다운의 기본 블록입니다. 문단은 다른 것이 될 이유가 없을 때 텍스트가 바뀌는 것입니다.

문단은 빈 줄로 구분해야 합니다. 기본서식의 *기울임체* 와 **굵게** 는 지원됩니다.  *이**렇**게* 중첩해서 사용 할 수도 있습니다.

## 리스트

### 정렬된 리스트

1. Item 1
2. A second item
3. Number 3
4. Ⅳ

*참고: 네 번째 항목은 [로마 숫자 4][2]를 나타내는 유니코드 문자를 사용합니다.*

### 정렬없는 리스트

* An item
* Another item
* Yet another item
* And there's more...

## 문단 수정자

### 코드 블록

```
코드 블록은 개발자와 일반 텍스트로 작성된 코드나 다른 것들을 보는 사람들에게 매우 유용합니다. 보시다시피, 고정 너비 글꼴을 사용합니다.
```

물론 코드나 다른 것들을 `inline code`로 추가할 수도 있습니다!.

### 인용문

> Here is a quote. What this is should be self explanatory. Quotes are automatically indented when they are used.

## 머릿말

There are six levels of headings. They correspond with the six levels of HTML headings. You've probably noticed them already in the page. Each level down uses one more hash character.

### 머릿말에도 **기본 서식**을 *적용 가능*합니다.

### 물론 `inline code`도 포함할 수 있죠

물론, 제목이 어떤 모습인지에 따라 페이지 구조를 엉망으로 만들 수 있죠.

여기에서는 3~4단계 이상의 제목을 사용하지 않는 것이 좋습니다. 가장 작은 제목이 너무 작지 않고, 가장 큰 제목이 너무 크지 않으며, 각 크기를 눈에 띄게 크고 중요하게 보이게 하려면 사용할 수 있는 크기가 제한되어 있기 때문입니다.

## URL

URL은 여러 방법으로 표현할 수 있습니다!

* [MarkDown][3]으로 지정된 링크. 가장 쉽게 링크를 가져오는 방법은 사이트를 들어가 `Ctrl+L`을 누르는 것 입니다.
* 또 다르게 지정된 링크 [MarkDown](https://www.markitdown.net/)
* 가끔은 그냥 URL로 쓰고 싶을수도 있죠 <https://www.markitdown.net/>.

## 수평선 규칙

수평선은 페이지의 중앙을 가로지르는 선 입니다.

---

가끔씩 구역을 나누는데 편리합니다!

## 이미지

Markdown 에 이미지를 넣을 수 있습니다!

![Crepe](https://s3-media3.fl.yelpcdn.com/bphoto/cQ1Yoa75m2yUFFbY2xwuqw/348s.jpg)

중간 정렬도 가능! (다른게 있나..?)

![Crepe](https://s3-media3.fl.yelpcdn.com/bphoto/cQ1Yoa75m2yUFFbY2xwuqw/348s.jpg){: .center-block :}

## 마지막으로

사실 Markdown에는 이것보다 훨씬 많은 것들이 있습니다! 자세한 내용은 공식 [소개][4] 및 [구문][5]을 참조하세요. 그래두 이게 공식 구현은 사용하지 않아서 사소하게 다를 수 있어요!

  [1]: https://daringfireball.net/projects/markdown/
  [2]: https://www.fileformat.info/info/unicode/char/2163/index.htm
  [3]: https://www.markitdown.net/
  [4]: https://daringfireball.net/projects/markdown/basics
  [5]: https://daringfireball.net/projects/markdown/syntax
