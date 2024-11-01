---
layout: post
title: Plantuml 예제
categories: example
tags: [plantuml]
---

## 첫 PlantUML!

### PlantUML Block-1
@startuml
나 -> 누구 : 안뇽
@enduml


### PlantUML Block-2
``` plantuml!
나 -> 누구 : 안뇽 세상
```


### PlantUML Block-3
@startuml
(*) --> "초기화"

if "약간의 테스트" then
  -->[true] "몬가 움직여"
  --> "또 다르게 움직여"
  -right-> (*)
else
  ->[false] "몬가"
  -->[Ending process] (*)
endif
@enduml


### PlantUML Block-4

@startuml
skinparam handwritten true

skinparam usecase {
  BackgroundColor DarkSeaGreen
  BorderColor DarkSlateGray

  BackgroundColor<< Main >> YellowGreen
  BorderColor<< Main >> YellowGreen

  ArrowColor Olive
  ActorBorderColor black
  ActorFontName Courier

  ActorBackgroundColor<< Human >> Gold
}

User << Human >>
:Main Database: as MySql << Application >>
(Start) << One Shot >>
(Use the application) as (Use) << Main >>

User -> (Start)
User --> (Use)

MySql --> (Use)

@enduml
