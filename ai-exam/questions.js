(function () {
  "use strict";

  const sections = {
    "ml-basics": { label: "머신러닝 기초", shortLabel: "ML 기초" },
    "deep-learning": { label: "딥러닝 · Computer Vision", shortLabel: "DL · CV" },
    "nlp-llm": { label: "NLP · Foundation Model", shortLabel: "NLP · LLM" },
    "agents-rag": { label: "Agent · RAG", shortLabel: "Agent · RAG" },
    "compression-deploy": { label: "경량화 · 배포", shortLabel: "경량화" },
    practical: { label: "Python 실습", shortLabel: "Python" }
  };

  const references = {
    evaluation: { title: "SSAFY <3> 지도학습과 성능 평가", href: "/ssafy/2026/08/09/ssafy2.html" },
    unsupervised: { title: "SSAFY <4> 교차검증과 비지도학습", href: "/ssafy/2026/08/09/ssafy3.html" },
    regression: { title: "SSAFY <5> 선형회귀", href: "/ssafy/2026/08/09/ssafy4.html" },
    deepLearning: { title: "SSAFY <7> 신경망에서 전이학습까지", href: "/ssafy/2026/08/09/ssafy6.html" },
    embedding: { title: "SSAFY <8> 단어를 숫자로 바꾸기", href: "/ssafy/2026/08/10/ssafy.html" },
    rnn: { title: "SSAFY <9> 순서를 기억하는 RNN", href: "/ssafy/2026/08/10/ssafy2.html" },
    lstm: { title: "SSAFY <10> 더 오래 기억하는 LSTM", href: "/ssafy/2026/08/10/ssafy3.html" },
    foundation: { title: "SSAFY <14> 사전학습에서 In-Context Learning까지", href: "/ssafy/2026/08/10/ssafy7.html" },
    textFoundation: { title: "SSAFY <15> 거대 언어 모델이란 무엇인가", href: "/ssafy/2026/08/13/ssafy.html" },
    alignment: { title: "SSAFY <16> 지시 학습과 선호 학습", href: "/ssafy/2026/08/13/ssafy2.html" },
    prompting: { title: "SSAFY <18> Prompt Engineering", href: "/ssafy/2026/08/13/ssafy4.html" },
    llmEvaluation: { title: "SSAFY <19> 정답 없는 답을 채점하는 법", href: "/ssafy/2026/08/13/ssafy5.html" },
    multimodal: { title: "SSAFY <21> 이미지 생성과 Multimodal", href: "/ssafy/2026/08/13/ssafy7.html" },
    cnn: { title: "SSAFY <22> CNN은 사진을 어떻게 보는가", href: "/ssafy/2026/08/16/ssafy.html" },
    cnnArchitectures: { title: "SSAFY <23> AlexNet에서 MobileNet까지", href: "/ssafy/2026/08/16/ssafy2.html" },
    vit: { title: "SSAFY <24> CNN의 한계와 Vision Transformer", href: "/ssafy/2026/08/16/ssafy3.html" },
    training: { title: "SSAFY <25> 딥러닝 학습 전략", href: "/ssafy/2026/08/16/ssafy4.html" },
    vlm: { title: "SSAFY <27> LLM에 눈을 다는 법", href: "/ssafy/2026/08/18/ssafy2.html" },
    smallVlm: { title: "SSAFY <28> 기기에서 돌아가는 sVLM", href: "/ssafy/2026/08/18/ssafy3.html" },
    rag: { title: "SSAFY <30> 정보검색과 RAG", href: "/ssafy/2026/08/20/ssafy.html" },
    tools: { title: "SSAFY <31> Tool과 MCP", href: "/ssafy/2026/08/20/ssafy2.html" },
    agents: { title: "SSAFY <32> 계획하고 되돌아보는 Agent", href: "/ssafy/2026/08/20/ssafy3.html" },
    multiAgent: { title: "SSAFY <33> Multi-Agent System", href: "/ssafy/2026/08/21/ssafy.html" },
    toolLearning: { title: "SSAFY <34> Tool Learning", href: "/ssafy/2026/08/21/ssafy2.html" },
    compression: { title: "SSAFY <36> 모델 경량화 세 가지", href: "/ssafy/2026/08/25/ssafy2.html" },
    quantization: { title: "SSAFY <39> 정수연산 Quantization", href: "/ssafy/2026/08/26/ssafy2.html" },
    shift: { title: "SSAFY <40> Test-Time Domain Adaptation", href: "/ssafy/2026/08/26/ssafy3.html" },
    sensing: { title: "SSAFY <41> Adaptive Sensing", href: "/ssafy/2026/08/26/ssafy4.html" },
    domain: { title: "SSAFY <42> Domain 지식과 모델 설계", href: "/ssafy/2026/08/26/ssafy5.html" },
    pythonSynthetic: { title: "Python <10> 시퀀스 모델과 합성 데이터", href: "/python/2026/08/29/python.html" },
    pythonEda: { title: "Python <4> EDA와 시각화", href: "/python/2026/08/07/python.html" },
    pythonRag: { title: "Python <12> RAG workflow", href: "/python/2026/08/29/python3.html" }
  };

  const mcq = (question) => {
    const correctChoice = question.choices[question.answer];
    const choices = question.choices.filter((_, index) => index !== question.answer);
    let seed = (question.id ^ 0x9e3779b9) >>> 0;

    for (let index = choices.length - 1; index > 0; index -= 1) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const swapIndex = seed % (index + 1);
      [choices[index], choices[swapIndex]] = [choices[swapIndex], choices[index]];
    }

    const answer = ((question.id ^ (question.id >>> 2)) * 3) % 4;
    choices.splice(answer, 0, correctChoice);

    return {
      ...question,
      type: "mcq",
      choices,
      answer
    };
  };
  const short = (question) => ({ ...question, type: "short" });
  const practical = (question) => ({ ...question, type: "practical" });

  const questions = [
    mcq({
      id: 1,
      section: "ml-basics",
      topic: "회귀식과 오차항",
      difficulty: "하",
      prompt: "단순선형회귀의 모집단 모형 yᵢ = β₀ + β₁xᵢ + εᵢ에서 εᵢ가 나타내는 것은?",
      choices: [
        "모델이 계산한 예측값",
        "x로 설명되지 않는 요인과 우연한 변동",
        "기울기 β₁의 추정값",
        "학습률에 의해 정해지는 보정값"
      ],
      answer: 1,
      explanation: "오차항 εᵢ는 관측한 설명변수로 담지 못한 영향과 우연한 변동을 묶어 나타낸다. 관측 뒤 계산하는 잔차와 달리 모집단 모형의 오차항은 직접 관측할 수 없다.",
      reference: "regression"
    }),
    short({
      id: 2,
      section: "ml-basics",
      topic: "선형회귀 계수 해석",
      difficulty: "중",
      prompt: "다른 조건이 같을 때 ŷ = 12 + 2.5x의 기울기 2.5를 한 문장으로 해석하세요.",
      placeholder: "예: x가 …",
      grading: {
        keywordGroups: [["x", "독립변수", "설명변수"], ["1", "한 단위"], ["y", "예측값", "종속변수"], ["2.5"], ["증가"]]
      },
      answerText: "x가 1 증가할 때 y의 예측값은 평균적으로 2.5 증가한다.",
      explanation: "회귀계수는 다른 조건을 고정했을 때 설명변수가 한 단위 변할 때 예측값이 얼마나 변하는지를 뜻한다. 관찰 연구라면 이를 곧바로 인과효과라고 부르면 안 된다.",
      reference: "regression"
    }),
    mcq({
      id: 3,
      section: "ml-basics",
      topic: "회귀 문제",
      difficulty: "하",
      prompt: "다음 중 전형적인 회귀 문제는?",
      choices: [
        "이메일이 스팸인지 아닌지 판별한다.",
        "사진 속 동물이 고양이·개·새 중 무엇인지 판별한다.",
        "주택 특성으로 다음 달 거래 가격을 예측한다.",
        "고객을 구매 패턴별 군집으로 나눈다."
      ],
      answer: 2,
      explanation: "연속적인 수치인 주택 가격을 예측하므로 회귀다. 범주를 맞히면 분류, 정답 없이 묶으면 clustering이다.",
      reference: "regression"
    }),
    short({
      id: 4,
      section: "ml-basics",
      topic: "회귀 문제",
      difficulty: "하",
      prompt: "회귀식 ŷ = 3 + 2.5x에서 x = 4일 때 예측값을 숫자로 쓰세요.",
      placeholder: "숫자만 입력",
      grading: { numeric: { value: 13, tolerance: 0.0001 } },
      answerText: "13",
      explanation: "절편 3에 2.5 × 4 = 10을 더하면 13이다.",
      reference: "regression"
    }),
    mcq({
      id: 5,
      section: "ml-basics",
      topic: "회귀식과 오차항",
      difficulty: "중",
      prompt: "오차항(error term)과 잔차(residual)를 가장 정확히 구분한 것은?",
      choices: [
        "둘은 언제나 같은 관측 가능한 값이다.",
        "오차항은 모집단의 참 관계에서 생기며 관측할 수 없고, 잔차는 관측값과 적합값의 차이로 계산한다.",
        "잔차는 학습 전에 정하고 오차항은 학습 뒤 계산한다.",
        "오차항은 분류에만, 잔차는 회귀에만 사용한다."
      ],
      answer: 1,
      explanation: "잔차 eᵢ = yᵢ - ŷᵢ는 데이터와 적합된 모델로 계산한다. 반면 εᵢ는 알 수 없는 모집단의 참 회귀선에서 벗어난 양이다.",
      reference: "regression"
    }),
    mcq({
      id: 6,
      section: "ml-basics",
      topic: "K-means와 계층적 clustering",
      difficulty: "하",
      prompt: "K-means의 한 반복(iteration)을 올바른 순서로 나타낸 것은?",
      choices: [
        "모든 점을 임의 삭제 → centroid 개수 증가",
        "가장 가까운 centroid에 할당 → 각 cluster 평균으로 centroid 갱신",
        "label 예측 → cross-entropy로 역전파",
        "dendrogram 작성 → 가장 먼 두 cluster 결합"
      ],
      answer: 1,
      explanation: "K-means는 할당 단계와 갱신 단계를 목적함수가 더 이상 충분히 줄지 않을 때까지 반복한다.",
      reference: "unsupervised"
    }),
    short({
      id: 7,
      section: "ml-basics",
      topic: "K-means와 계층적 clustering",
      difficulty: "하",
      prompt: "1차원 점 2, 4, 8이 같은 cluster에 속한다면 갱신된 centroid는 얼마인가요? 소수 셋째 자리까지 허용합니다.",
      placeholder: "예: 4.67",
      grading: { numeric: { value: 4.6666667, tolerance: 0.01 } },
      answerText: "14/3 ≈ 4.67",
      explanation: "K-means의 centroid는 cluster에 할당된 점의 산술평균이다. (2 + 4 + 8) / 3 = 14/3이다.",
      reference: "unsupervised"
    }),
    mcq({
      id: 8,
      section: "ml-basics",
      topic: "K-means와 계층적 clustering",
      difficulty: "중",
      prompt: "Agglomerative hierarchical clustering의 dendrogram을 높이 h에서 가로로 잘랐을 때 cluster 수를 읽는 방법은?",
      choices: [
        "절단선과 만나는 독립된 가지 수를 센다.",
        "가장 낮은 leaf 하나만 센다.",
        "항상 K-means의 K와 같은 수가 된다.",
        "x축 값의 평균을 반올림한다."
      ],
      answer: 0,
      explanation: "절단선 아래에서 서로 연결되지 않은 가지 묶음이 각각 하나의 cluster가 된다. 절단 높이에 따라 cluster 수가 달라진다.",
      reference: "unsupervised"
    }),
    mcq({
      id: 9,
      section: "ml-basics",
      topic: "비지도학습 사례",
      difficulty: "하",
      prompt: "다음 중 label 없이 수행하는 비지도학습 사례는?",
      choices: [
        "정답이 붙은 X-ray로 폐렴 여부 분류",
        "과거 매출로 다음 달 매출액 회귀",
        "구매 이력의 유사성만으로 고객 군집 발견",
        "정답 문장으로 번역 모델 fine-tuning"
      ],
      answer: 2,
      explanation: "고객별 정답 label 없이 데이터 내부의 유사한 구조를 찾으므로 비지도학습이다.",
      reference: "unsupervised"
    }),
    short({
      id: 10,
      section: "ml-basics",
      topic: "Recall 계산",
      difficulty: "하",
      prompt: "TP = 36, FN = 9일 때 Recall을 백분율로 계산하세요.",
      placeholder: "예: 80%",
      grading: { numeric: { value: 80, tolerance: 0.001, percent: true } },
      answerText: "80%",
      explanation: "Recall = TP / (TP + FN) = 36 / 45 = 0.8 = 80%다.",
      reference: "evaluation"
    }),
    mcq({
      id: 11,
      section: "ml-basics",
      topic: "Recall 계산",
      difficulty: "중",
      prompt: "질병 환자를 놓치는 False Negative가 특히 위험한 1차 선별 검사에서 우선 높여야 할 지표는?",
      choices: ["Recall", "Precision", "R²", "Silhouette score"],
      answer: 0,
      explanation: "Recall은 실제 양성 중 찾아낸 비율이다. FN을 줄일수록 Recall이 올라간다.",
      reference: "evaluation"
    }),
    short({
      id: 12,
      section: "ml-basics",
      topic: "Precision 계산",
      difficulty: "하",
      prompt: "TP = 30, FP = 10일 때 Precision을 백분율로 계산하세요.",
      placeholder: "예: 75%",
      grading: { numeric: { value: 75, tolerance: 0.001, percent: true } },
      answerText: "75%",
      explanation: "Precision = TP / (TP + FP) = 30 / 40 = 0.75 = 75%다.",
      reference: "evaluation"
    }),
    mcq({
      id: 13,
      section: "ml-basics",
      topic: "Precision 계산",
      difficulty: "중",
      prompt: "정상 메일을 스팸으로 차단하는 False Positive 비용이 매우 클 때 가장 직접적으로 관리해야 할 지표는?",
      choices: ["Precision", "Recall", "Mean Squared Error", "Adjusted R²"],
      answer: 0,
      explanation: "스팸이라고 예측한 것 중 실제 스팸 비율인 Precision을 높이면 잘못 차단한 정상 메일의 비율을 낮출 수 있다.",
      reference: "evaluation"
    }),
    mcq({
      id: 14,
      section: "ml-basics",
      topic: "분류 문제",
      difficulty: "하",
      prompt: "다음 중 분류 문제로 정의하는 것이 가장 자연스러운 것은?",
      choices: [
        "고객의 다음 구매 금액 예측",
        "내일의 최고 기온 예측",
        "고객이 30일 안에 이탈할지 여부 예측",
        "label 없이 뉴스 기사 주제 묶기"
      ],
      answer: 2,
      explanation: "이탈/유지라는 이산 범주를 예측하므로 binary classification이다.",
      reference: "evaluation"
    }),
    mcq({
      id: 15,
      section: "ml-basics",
      topic: "Learning rate와 수렴",
      difficulty: "하",
      prompt: "Gradient descent에서 learning rate가 지나치게 클 때 가장 흔한 현상은?",
      choices: [
        "최솟값 주변을 계속 뛰어넘어 loss가 진동하거나 발산한다.",
        "모든 gradient가 자동으로 0이 된다.",
        "parameter 수가 줄어든다.",
        "training data가 자동으로 늘어난다."
      ],
      answer: 0,
      explanation: "업데이트 보폭이 너무 크면 valley를 가로질러 반대편으로 넘어가므로 안정적으로 수렴하지 못할 수 있다.",
      reference: "training"
    }),
    mcq({
      id: 16,
      section: "ml-basics",
      topic: "Learning rate와 수렴",
      difficulty: "중",
      prompt: "Training loss가 안정적으로 줄지만 매우 느리며 긴 시간 동안 거의 직선처럼 완만하게 감소한다. 다른 이상이 없다면 먼저 의심할 것은?",
      choices: [
        "Learning rate가 너무 작다.",
        "Class 수가 너무 적다.",
        "Activation을 더 선형으로 바꿔야 한다.",
        "Label을 모두 one-hot으로 바꿔야 한다."
      ],
      answer: 0,
      explanation: "보폭이 너무 작으면 올바른 방향으로 움직여도 최솟값까지 가는 데 지나치게 오래 걸린다.",
      reference: "training"
    }),
    short({
      id: 17,
      section: "ml-basics",
      topic: "Gradient descent update 방향",
      difficulty: "하",
      prompt: "Loss를 줄이기 위해 parameter는 gradient의 어느 방향으로 갱신하나요?",
      placeholder: "짧은 용어로 입력",
      grading: { accepted: ["음의 gradient 방향", "negative gradient", "gradient의 반대 방향", "기울기의 반대 방향", "-gradient"] },
      answerText: "gradient의 반대 방향(negative gradient direction)",
      explanation: "Gradient는 함수가 가장 빠르게 증가하는 방향이므로 θ ← θ - η∇θL처럼 그 반대 방향으로 이동한다.",
      reference: "training"
    }),
    mcq({
      id: 18,
      section: "ml-basics",
      topic: "상관관계와 다중공선성",
      difficulty: "하",
      prompt: "두 변수의 Pearson 상관계수가 r = -0.85일 때 올바른 해석은?",
      choices: [
        "강한 음의 선형 관계가 관찰되지만 인과관계가 증명된 것은 아니다.",
        "85%의 확률로 한 변수가 다른 변수를 일으킨다.",
        "두 변수는 반드시 독립이다.",
        "한 변수가 1 증가하면 다른 변수는 정확히 0.85 감소한다."
      ],
      answer: 0,
      explanation: "상관계수의 부호는 방향, 절댓값은 선형 관계의 강도를 나타낸다. 인과성과 회귀 기울기의 크기를 직접 뜻하지 않는다.",
      reference: "regression"
    }),
    mcq({
      id: 19,
      section: "ml-basics",
      topic: "상관관계와 다중공선성",
      difficulty: "중",
      prompt: "다중선형회귀에서 두 설명변수가 거의 같은 정보를 담을 때 나타나기 쉬운 문제는?",
      choices: [
        "회귀계수 추정이 불안정해지고 표준오차가 커진다.",
        "모든 예측값이 반드시 0이 된다.",
        "회귀가 자동으로 classification으로 바뀐다.",
        "Training sample 수가 두 배가 된다."
      ],
      answer: 0,
      explanation: "강한 multicollinearity에서는 서로 겹치는 효과를 어느 변수에 배분할지 불안정해져 계수의 크기와 부호가 민감하게 변할 수 있다.",
      reference: "regression"
    }),
    mcq({
      id: 20,
      section: "ml-basics",
      topic: "상관관계와 다중공선성",
      difficulty: "중",
      prompt: "Feature standardization에 대한 설명으로 옳은 것은?",
      choices: [
        "척도를 맞춰 optimization을 돕지만 변수 간 높은 상관 자체를 제거하지는 않는다.",
        "모든 비선형 관계를 선형으로 바꾼다.",
        "상관계수를 언제나 0으로 만든다.",
        "Target leakage를 자동 탐지해 삭제한다."
      ],
      answer: 0,
      explanation: "평균을 빼고 표준편차로 나누어도 두 변수가 함께 움직이는 구조는 남는다. Multicollinearity는 feature 선택, 결합, regularization 등으로 별도 대응한다.",
      reference: "regression"
    }),
    mcq({
      id: 21,
      section: "deep-learning",
      topic: "비선형 activation function",
      difficulty: "하",
      prompt: "Deep neural network의 층 사이에 비선형 activation function이 필요한 핵심 이유는?",
      choices: [
        "선형층만 여러 개 쌓으면 전체도 하나의 선형변환과 같기 때문이다.",
        "Parameter를 항상 0개로 만들기 때문이다.",
        "Batch size를 자동으로 결정하기 때문이다.",
        "Label 없이도 정확도를 계산하기 때문이다."
      ],
      answer: 0,
      explanation: "선형변환의 합성은 다시 선형변환이다. ReLU, sigmoid, tanh 같은 비선형 함수가 있어야 복잡한 decision boundary를 표현할 수 있다.",
      reference: "deepLearning"
    }),
    short({
      id: 22,
      section: "deep-learning",
      topic: "비선형 activation function",
      difficulty: "하",
      prompt: "ReLU(x) = max(0, x)일 때 ReLU(-3.2)의 값을 쓰세요.",
      placeholder: "숫자만 입력",
      grading: { numeric: { value: 0, tolerance: 0 } },
      answerText: "0",
      explanation: "ReLU는 음수 입력을 0으로, 양수 입력을 그대로 통과시킨다.",
      reference: "deepLearning"
    }),
    mcq({
      id: 23,
      section: "deep-learning",
      topic: "RNN recurrent 구조",
      difficulty: "하",
      prompt: "기본 RNN에서 recurrent 구조를 만드는 연결은?",
      choices: [
        "이전 시점 hidden state hₜ₋₁을 현재 계산에 다시 사용한다.",
        "현재 입력을 무조건 두 배로 복사한다.",
        "모든 시점마다 서로 다른 weight를 새로 만든다.",
        "Sequence 길이를 항상 1로 줄인다."
      ],
      answer: 0,
      explanation: "RNN은 hₜ = f(Wₓxₜ + Wₕhₜ₋₁ + b)처럼 이전 상태를 현재 상태 계산에 넣고, 같은 weight를 시간축에서 공유한다.",
      reference: "rnn"
    }),
    mcq({
      id: 24,
      section: "deep-learning",
      topic: "RNN recurrent 구조",
      difficulty: "중",
      prompt: "Sequence를 따라 RNN을 펼쳐(unroll) 그렸을 때 모든 시점의 cell에 대한 설명으로 옳은 것은?",
      choices: [
        "각 시점은 같은 parameter를 공유한다.",
        "각 시점은 서로 독립된 model checkpoint다.",
        "마지막 시점만 입력을 받는다.",
        "역전파는 시간축을 통과하지 않는다."
      ],
      answer: 0,
      explanation: "그림에서는 cell이 여러 개처럼 보이지만 실제로는 같은 RNN cell을 반복 적용한다. 학습은 Backpropagation Through Time으로 시간축을 거슬러 진행한다.",
      reference: "rnn"
    }),
    mcq({
      id: 25,
      section: "deep-learning",
      topic: "RNN vanishing gradient",
      difficulty: "중",
      prompt: "긴 sequence에서 기본 RNN의 vanishing gradient가 발생하는 직접적인 이유는?",
      choices: [
        "시간축 역전파에서 작은 미분값이 반복해서 곱해질 수 있기 때문이다.",
        "모든 token이 one-hot이 아니기 때문이다.",
        "Output class가 두 개뿐이기 때문이다.",
        "Convolution kernel이 1×1이기 때문이다."
      ],
      answer: 0,
      explanation: "여러 시점의 Jacobian을 연속으로 곱할 때 크기가 1보다 작은 성분은 지수적으로 작아져 먼 과거에 gradient가 거의 닿지 않는다.",
      reference: "rnn"
    }),
    mcq({
      id: 26,
      section: "deep-learning",
      topic: "LSTM state 구조",
      difficulty: "중",
      prompt: "LSTM의 두 상태 cₜ와 hₜ를 가장 적절히 설명한 것은?",
      choices: [
        "cₜ는 장기 정보가 흐르는 cell state이고, hₜ는 현재 출력에 가까운 hidden state다.",
        "cₜ는 label이고 hₜ는 learning rate다.",
        "둘은 항상 같은 값을 갖는 복제본이다.",
        "cₜ는 입력 이미지, hₜ는 convolution kernel이다."
      ],
      answer: 0,
      explanation: "LSTM은 gate로 cell state의 보존·삭제·추가를 조절하고, hidden state를 다음 시점과 출력 계산에 전달한다.",
      reference: "lstm"
    }),
    mcq({
      id: 27,
      section: "deep-learning",
      topic: "One-hot encoding의 한계",
      difficulty: "하",
      prompt: "단어를 one-hot vector로 표현할 때의 대표적인 한계는?",
      choices: [
        "Vocabulary가 커질수록 매우 고차원·희소해지고 단어 사이 의미 유사성을 담지 못한다.",
        "모든 단어가 같은 index를 갖는다.",
        "실수 연산을 전혀 할 수 없다.",
        "Sequence 순서가 자동으로 완벽히 보존된다."
      ],
      answer: 0,
      explanation: "서로 다른 one-hot vector는 모두 직교하므로 '고양이'와 '강아지'가 '고양이'와 '자동차'보다 가깝다는 관계를 표현하지 못한다.",
      reference: "embedding"
    }),
    mcq({
      id: 28,
      section: "deep-learning",
      topic: "CBOW와 Skip-gram",
      difficulty: "하",
      prompt: "Word2Vec의 CBOW 학습 목표는?",
      choices: [
        "주변 context word들로 가운데 target word를 예측한다.",
        "가운데 word로 주변 context word들을 예측한다.",
        "문서 전체를 하나의 이미지로 생성한다.",
        "두 문장의 글자 수를 맞춘다."
      ],
      answer: 0,
      explanation: "CBOW는 context를 모아 center word를 맞힌다. 여러 주변 단어의 정보가 하나의 예측으로 모이는 구조다.",
      reference: "embedding"
    }),
    mcq({
      id: 29,
      section: "deep-learning",
      topic: "CBOW와 Skip-gram",
      difficulty: "하",
      prompt: "Word2Vec의 Skip-gram 학습 목표는?",
      choices: [
        "가운데 target word로 주변 context word들을 예측한다.",
        "주변 모든 word를 더해 가운데 문장을 생성한다.",
        "Image patch의 위치를 예측한다.",
        "정답 label 없이 cluster centroid를 갱신한다."
      ],
      answer: 0,
      explanation: "Skip-gram은 center word 하나에서 여러 context word를 맞히며, 희귀 단어 표현 학습에 유리한 경우가 많다.",
      reference: "embedding"
    }),
    mcq({
      id: 30,
      section: "deep-learning",
      topic: "Pre-training과 fine-tuning",
      difficulty: "하",
      prompt: "Pre-training과 fine-tuning의 관계를 올바르게 설명한 것은?",
      choices: [
        "넓은 데이터로 일반 표현을 먼저 배우고, 작은 task/domain 데이터로 목적에 맞게 조정한다.",
        "Fine-tuning을 먼저 하고 weight를 모두 지운 뒤 pre-training한다.",
        "둘 다 parameter를 전혀 갱신하지 않는다.",
        "Pre-training은 classification에만 사용할 수 있다."
      ],
      answer: 0,
      explanation: "Pre-training은 범용적 패턴을, fine-tuning은 목표 task나 domain에 필요한 행동을 학습한다.",
      reference: "foundation"
    }),
    mcq({
      id: 31,
      section: "deep-learning",
      topic: "CNN inductive bias",
      difficulty: "중",
      prompt: "CNN이 이미지에 대해 갖는 대표적인 inductive bias 조합은?",
      choices: [
        "Locality와 weight sharing에 따른 translation equivariance",
        "모든 pixel 쌍의 완전연결과 순서 무시",
        "문장 token의 autoregressive decoding",
        "Cluster 수 자동 추정과 dendrogram 생성"
      ],
      answer: 0,
      explanation: "작은 kernel은 가까운 pixel의 관계를 먼저 보고, 같은 filter를 위치마다 공유해 같은 패턴을 다른 위치에서도 찾는다.",
      reference: "cnn"
    }),
    mcq({
      id: 32,
      section: "deep-learning",
      topic: "Max pooling",
      difficulty: "하",
      prompt: "2×2 max pooling, stride 2의 역할로 가장 적절한 것은?",
      choices: [
        "각 2×2 영역의 최댓값을 남겨 spatial resolution을 줄인다.",
        "Channel 수를 학습 가능한 weight로 두 배 늘린다.",
        "모든 값을 평균 0, 분산 1로 만든다.",
        "Feature map을 token sequence로 번역한다."
      ],
      answer: 0,
      explanation: "Max pooling은 학습 parameter 없이 local maximum을 선택해 H와 W를 줄이고 작은 위치 변화에 덜 민감하게 만든다.",
      reference: "cnn"
    }),
    short({
      id: 33,
      section: "deep-learning",
      topic: "CNN receptive field",
      difficulty: "중",
      prompt: "Padding 없이 3×3 convolution, stride 1을 두 층 연속 적용했습니다. 두 번째 층 한 값의 원본 입력 기준 receptive field 크기는?",
      placeholder: "예: 5x5",
      grading: { accepted: ["5x5", "5×5", "5 * 5", "5 by 5", "5"] },
      answerText: "5×5",
      explanation: "첫 3×3 층은 3×3을 보고, 다음 3×3 층은 그 주변 feature를 한 칸씩 더 포함하므로 원본 기준 5×5를 본다.",
      reference: "cnn"
    }),
    mcq({
      id: 34,
      section: "deep-learning",
      topic: "1×1 convolution 특징",
      difficulty: "중",
      prompt: "일반적인 1×1 convolution의 특징으로 옳은 것은?",
      choices: [
        "각 spatial 위치에서 channel들을 선형 결합해 channel 수를 바꿀 수 있다.",
        "한 층만으로 주변 3×3 pixel을 직접 본다.",
        "항상 H와 W를 절반으로 줄인다.",
        "학습 parameter가 전혀 없다."
      ],
      answer: 0,
      explanation: "Stride 1의 1×1 convolution은 H×W 위치는 유지하면서 각 위치의 channel vector를 새 channel 공간으로 투영한다.",
      reference: "cnnArchitectures"
    }),
    short({
      id: 35,
      section: "deep-learning",
      topic: "1×1 convolution 연산량",
      difficulty: "상",
      prompt: "28×28 feature map에 Cᵢₙ=64, Cₒᵤₜ=32인 1×1 convolution을 stride 1로 적용합니다. Bias를 제외한 MAC 수는?",
      placeholder: "정수로 입력",
      grading: { numeric: { value: 1605632, tolerance: 0 } },
      answerText: "1,605,632 MACs",
      explanation: "1×1 convolution의 MAC 수는 H × W × Cᵢₙ × Cₒᵤₜ = 28 × 28 × 64 × 32 = 1,605,632다.",
      reference: "cnnArchitectures"
    }),
    short({
      id: 36,
      section: "deep-learning",
      topic: "CNN/FC parameter 계산",
      difficulty: "중",
      prompt: "입력 channel 3, 출력 channel 16, kernel 3×3인 Conv2d가 출력 channel마다 bias를 하나씩 가집니다. 총 parameter 수는?",
      placeholder: "정수로 입력",
      grading: { numeric: { value: 448, tolerance: 0 } },
      answerText: "448개",
      explanation: "Weight는 3 × 3 × 3 × 16 = 432개, bias는 16개이므로 총 448개다.",
      reference: "cnn"
    }),
    short({
      id: 37,
      section: "deep-learning",
      topic: "CNN/FC parameter 계산",
      difficulty: "중",
      prompt: "입력 feature 128개를 class 10개로 보내는 fully connected layer가 class마다 bias를 하나씩 가집니다. 총 parameter 수는?",
      placeholder: "정수로 입력",
      grading: { numeric: { value: 1290, tolerance: 0 } },
      answerText: "1,290개",
      explanation: "Weight 128 × 10 = 1,280개와 bias 10개를 합쳐 1,290개다.",
      reference: "cnn"
    }),
    short({
      id: 38,
      section: "deep-learning",
      topic: "Feature map memory",
      difficulty: "상",
      prompt: "Batch를 제외한 64×56×56 FP32 feature map 하나의 memory 사용량은 몇 byte인가요?",
      placeholder: "정수로 입력",
      grading: { numeric: { value: 802816, tolerance: 0 } },
      answerText: "802,816 byte(약 0.766 MiB)",
      explanation: "원소 수 64 × 56 × 56 = 200,704개에 FP32의 4 byte를 곱하면 802,816 byte다. Training에서는 gradient와 중간 activation 때문에 더 많은 memory가 필요하다.",
      reference: "cnn"
    }),
    mcq({
      id: 39,
      section: "deep-learning",
      topic: "ViT positional embedding",
      difficulty: "중",
      prompt: "Vision Transformer가 patch token에 positional embedding을 더하는 주된 이유는?",
      choices: [
        "Self-attention만으로는 token 순서를 바꿔도 위치 정보를 구분하기 어렵기 때문이다.",
        "Pixel 값을 항상 0과 1로 quantization하기 위해서다.",
        "Class 수를 자동으로 늘리기 위해서다.",
        "Convolution kernel을 공유하기 위해서다."
      ],
      answer: 0,
      explanation: "Self-attention은 입력 집합의 순열에 대해 위치를 스스로 알지 못하므로 patch가 이미지의 어디에서 왔는지 별도 위치 정보를 준다.",
      reference: "vit"
    }),
    mcq({
      id: 40,
      section: "deep-learning",
      topic: "CNN inductive bias",
      difficulty: "상",
      prompt: "작은 image dataset에서 scratch training할 때 CNN이 같은 규모의 ViT보다 유리할 수 있는 이유는?",
      choices: [
        "Locality와 weight sharing 같은 image-specific inductive bias가 적은 데이터에서도 학습을 안내하기 때문이다.",
        "CNN은 parameter를 절대 학습하지 않기 때문이다.",
        "ViT는 positional 정보를 사용할 수 없기 때문이다.",
        "CNN은 모든 pixel 쌍을 첫 층에서 직접 비교하기 때문이다."
      ],
      answer: 0,
      explanation: "CNN은 이미지에 맞춘 prior를 구조에 넣었다. ViT는 더 약한 inductive bias 대신 대규모 데이터에서 관계를 배울 자유도가 크다.",
      reference: "vit"
    }),
    mcq({
      id: 41,
      section: "nlp-llm",
      topic: "Sentence embedding과 cosine similarity",
      difficulty: "하",
      prompt: "Sentence embedding의 가장 일반적인 용도는?",
      choices: [
        "문장 전체의 의미를 고정 길이 vector로 나타내 semantic search나 유사도 비교에 쓴다.",
        "문장의 모든 글자를 one-hot image로 바꾼다.",
        "문장마다 별도의 neural network를 새로 학습한다.",
        "문장의 정답 label을 자동 생성한다."
      ],
      answer: 0,
      explanation: "Sentence embedding은 길이가 다른 문장을 같은 차원의 vector space에 놓고 의미가 비슷한 문장을 가까이 배치한다.",
      reference: "embedding"
    }),
    short({
      id: 42,
      section: "nlp-llm",
      topic: "Sentence embedding과 cosine similarity",
      difficulty: "하",
      prompt: "Vector a = [1, 0], b = [0, 2]의 cosine similarity는 얼마인가요?",
      placeholder: "숫자만 입력",
      grading: { numeric: { value: 0, tolerance: 0.0001 } },
      answerText: "0",
      explanation: "내적 a·b가 0이므로 두 vector는 직교하며 cosine similarity도 0이다.",
      reference: "embedding"
    }),
    mcq({
      id: 43,
      section: "nlp-llm",
      topic: "Text foundation model",
      difficulty: "하",
      prompt: "Text foundation model의 특징으로 가장 적절한 것은?",
      choices: [
        "대규모·다양한 text로 pre-training한 뒤 여러 downstream task에 adaptation할 수 있다.",
        "오직 하나의 표 데이터 회귀 문제에만 사용한다.",
        "External data 없이는 inference할 수 없다.",
        "항상 supervised label만으로 처음부터 학습한다."
      ],
      answer: 0,
      explanation: "Foundation model은 넓은 데이터에서 범용 표현과 능력을 먼저 익히고 prompting, fine-tuning, tool use 등으로 여러 task에 재사용한다.",
      reference: "textFoundation"
    }),
    mcq({
      id: 44,
      section: "nlp-llm",
      topic: "Foundation model service 개발",
      difficulty: "중",
      prompt: "Foundation model을 실제 service로 개발할 때 model API만 연결하는 것보다 함께 설계해야 할 요소의 조합은?",
      choices: [
        "Retrieval/tool, guardrail, evaluation, monitoring",
        "Learning rate 하나와 random seed 하나",
        "One-hot vocabulary와 K-means centroid",
        "Image crop과 max pooling만"
      ],
      answer: 0,
      explanation: "Service 품질은 model 자체뿐 아니라 context 공급, action 경계, 안전장치, offline/online 평가와 관측 가능성에 의해 결정된다.",
      reference: "rag"
    }),
    mcq({
      id: 45,
      section: "nlp-llm",
      topic: "Prompt 설계",
      difficulty: "중",
      prompt: "일관된 structured output을 얻기 위한 Prompt 설계로 가장 좋은 것은?",
      choices: [
        "Role·task·constraints·output schema와 필요한 example을 명시한다.",
        "요청을 최대한 모호하고 짧게만 쓴다.",
        "서로 충돌하는 규칙을 여러 번 넣는다.",
        "Output 형식은 설명하지 않고 추측하게 한다."
      ],
      answer: 0,
      explanation: "좋은 Prompt는 무엇을, 어떤 근거와 제약 아래, 어떤 구조로 내야 하는지를 검증 가능한 형태로 적는다.",
      reference: "prompting"
    }),
    mcq({
      id: 46,
      section: "nlp-llm",
      topic: "Zero-shot CoT",
      difficulty: "하",
      prompt: "Zero-shot Chain-of-Thought prompting을 가장 잘 설명한 것은?",
      choices: [
        "풀이 example 없이 '단계적으로 생각해 보라'는 reasoning cue를 준다.",
        "정답과 풀이가 있는 example을 여러 개 제공한다.",
        "Model weight를 reasoning dataset으로 갱신한다.",
        "Retriever가 찾은 문서를 context에 붙인다."
      ],
      answer: 0,
      explanation: "Zero-shot CoT는 별도의 worked example 없이 reasoning을 유도하는 문구를 사용한다. 효과는 model과 task에 따라 달라지므로 검증이 필요하다.",
      reference: "prompting"
    }),
    mcq({
      id: 47,
      section: "nlp-llm",
      topic: "Few-shot CoT",
      difficulty: "하",
      prompt: "Few-shot CoT Prompt에 반드시 들어가는 핵심 요소는?",
      choices: [
        "문제와 중간 reasoning, 최종 답으로 이루어진 worked example",
        "Training용 gradient와 optimizer state",
        "Vector database의 전체 원문",
        "Model의 quantization scale"
      ],
      answer: 0,
      explanation: "Few-shot CoT는 몇 개의 예시에서 답만 보여주는 것이 아니라 중간 reasoning 과정까지 제시해 새 문제의 풀이 형식을 유도한다.",
      reference: "prompting"
    }),
    mcq({
      id: 48,
      section: "nlp-llm",
      topic: "Instruction tuning data",
      difficulty: "중",
      prompt: "Instruction tuning dataset으로 가장 적절한 구성은?",
      choices: [
        "다양한 instruction, 선택적 input/context, 원하는 response의 쌍",
        "정답 없는 숫자 column 하나",
        "같은 문장을 100만 번 복제한 corpus",
        "Image label 없이 random noise만 모은 dataset"
      ],
      answer: 0,
      explanation: "Instruction tuning은 사용자의 지시를 읽고 원하는 형식과 행동으로 응답하는 mapping을 supervised example로 학습한다. 다양성과 품질이 중요하다.",
      reference: "alignment"
    }),
    mcq({
      id: 49,
      section: "nlp-llm",
      topic: "Fine-tuning과 instruction tuning",
      difficulty: "중",
      prompt: "Fine-tuning과 instruction tuning의 관계로 옳은 것은?",
      choices: [
        "Instruction tuning은 instruction-response data를 사용하는 fine-tuning의 한 형태다.",
        "Fine-tuning은 parameter를 갱신하지 않지만 instruction tuning은 갱신한다.",
        "둘은 항상 서로 배타적이며 함께 말할 수 없다.",
        "Instruction tuning은 K-means의 초기화 방법이다."
      ],
      answer: 0,
      explanation: "Fine-tuning은 pretrained model을 추가 데이터로 조정하는 넓은 개념이고, instruction tuning은 그중 지시 수행 능력을 목표로 하는 방식이다.",
      reference: "alignment"
    }),
    mcq({
      id: 50,
      section: "nlp-llm",
      topic: "Single-task fine-tuning",
      difficulty: "중",
      prompt: "한 종류의 민원 분류 task만으로 model 전체를 강하게 fine-tuning했을 때의 대표적인 위험은?",
      choices: [
        "그 task에는 좋아져도 다른 능력의 generalization이 떨어지거나 catastrophic forgetting이 생길 수 있다.",
        "Parameter 수가 무조건 0이 된다.",
        "모든 output이 자동으로 근거를 인용한다.",
        "Input distribution shift가 완전히 사라진다."
      ],
      answer: 0,
      explanation: "좁은 data에 과도하게 맞추면 범용 능력과 기존 행동을 잃을 수 있다. Held-out task 평가와 적절한 learning rate, PEFT, data mixture 등을 함께 검토한다.",
      reference: "foundation"
    }),
    mcq({
      id: 51,
      section: "nlp-llm",
      topic: "RLHF reinforcement learning",
      difficulty: "하",
      prompt: "LLM의 RLHF에서 reinforcement learning에 제공되는 reward는 보통 어디에서 오는가?",
      choices: [
        "사람의 선호 비교를 학습한 reward model의 점수",
        "K-means의 cluster 개수",
        "Tokenizer vocabulary의 크기",
        "Convolution feature map의 width"
      ],
      answer: 0,
      explanation: "사람이 여러 response의 선호 순위를 매기면 reward model이 그 선호를 근사하고, policy model은 높은 reward를 얻도록 학습한다.",
      reference: "alignment"
    }),
    mcq({
      id: 52,
      section: "nlp-llm",
      topic: "RLHF training 절차",
      difficulty: "중",
      prompt: "InstructGPT식 RLHF training 절차를 올바른 순서로 나열한 것은?",
      choices: [
        "SFT → preference data로 reward model 학습 → RL로 policy 최적화",
        "RL → K-means → SFT",
        "Reward model 삭제 → pre-training → PCA",
        "Quantization → pruning → tokenization"
      ],
      answer: 0,
      explanation: "먼저 demonstration으로 supervised fine-tuning하고, response ranking으로 reward model을 만든 뒤 PPO 같은 RL로 policy를 조정한다.",
      reference: "alignment"
    }),
    mcq({
      id: 53,
      section: "nlp-llm",
      topic: "RLHF training pipeline",
      difficulty: "중",
      prompt: "RLHF의 reward model을 학습하기 위한 data 예시로 가장 적절한 것은?",
      choices: [
        "같은 prompt에 대한 response A와 B 중 사람이 어느 쪽을 선호하는지 표시한 pair",
        "Image의 width와 height만 기록한 표",
        "Label 없는 cluster centroid 목록",
        "Random하게 섞은 optimizer state"
      ],
      answer: 0,
      explanation: "Reward model은 절대 점수보다 pairwise preference를 학습하는 경우가 일반적이다. 선택된 response가 더 높은 scalar reward를 받도록 학습한다.",
      reference: "alignment"
    }),
    mcq({
      id: 54,
      section: "nlp-llm",
      topic: "RLHF training pipeline",
      difficulty: "상",
      prompt: "RLHF policy optimization에서 SFT reference model과의 KL penalty를 두는 주된 이유는?",
      choices: [
        "Reward만 쫓아 policy가 원래 language behavior에서 지나치게 벗어나는 것을 제한한다.",
        "Vocabulary를 매 step 절반으로 줄인다.",
        "Human preference data를 자동으로 삭제한다.",
        "모든 response 길이를 정확히 같게 만든다."
      ],
      answer: 0,
      explanation: "Reward model의 허점을 과도하게 이용하는 reward hacking과 language quality 붕괴를 막기 위해 reference policy에서 멀어지는 정도를 벌점으로 준다.",
      reference: "alignment"
    }),
    mcq({
      id: 55,
      section: "nlp-llm",
      topic: "LLM-as-Judge 평가 bias",
      difficulty: "중",
      prompt: "LLM-as-Judge가 내용과 무관하게 먼저 제시된 response를 더 자주 고르는 현상은?",
      choices: ["Position bias", "Vanishing gradient", "Domain shift", "Quantization noise"],
      answer: 0,
      explanation: "Position bias는 후보의 순서가 판정에 영향을 주는 문제다. A/B 순서를 바꿔 두 번 평가하고 일관성을 확인하는 방식으로 완화할 수 있다.",
      reference: "llmEvaluation"
    }),
    mcq({
      id: 56,
      section: "nlp-llm",
      topic: "LLM-as-Judge 평가 bias",
      difficulty: "중",
      prompt: "Judge model이 자신과 같은 model family가 만든 답을 더 높게 평가하는 경향은?",
      choices: ["Self-enhancement bias", "Sampling theorem", "Pooling bias", "Label smoothing"],
      answer: 0,
      explanation: "생성자와 Judge를 분리하고, 여러 Judge나 사람 평가와 calibrate하며, 명시적인 rubric을 쓰는 이유 중 하나다.",
      reference: "llmEvaluation"
    }),
    mcq({
      id: 57,
      section: "nlp-llm",
      topic: "Multimodal video generation",
      difficulty: "중",
      prompt: "Text-to-video generation이 text-to-image보다 추가로 해결해야 하는 핵심 문제는?",
      choices: [
        "Frame 사이 object identity와 motion의 temporal consistency",
        "모든 frame을 동일한 정지 image로 복사하기",
        "Vocabulary를 없애기",
        "Regression coefficient를 계산하기"
      ],
      answer: 0,
      explanation: "개별 frame이 그럴듯해도 시간축에서 인물·물체의 모양, 위치, 움직임이 튀면 video로는 깨진다. Spatial quality와 temporal coherence를 함께 모델링해야 한다.",
      reference: "multimodal"
    }),
    mcq({
      id: 58,
      section: "nlp-llm",
      topic: "VLM training 절차",
      difficulty: "상",
      prompt: "Pretrained vision encoder와 LLM을 연결하는 LLaVA 계열의 전형적인 training 흐름은?",
      choices: [
        "Image-text feature alignment를 먼저 맞춘 뒤 multimodal instruction tuning을 수행한다.",
        "Image를 K-means한 뒤 LLM weight를 모두 randomize한다.",
        "Text tokenizer를 제거하고 pixel만 autoregressive하게 생성한다.",
        "Reward model 하나만 학습하면 vision encoder가 자동 연결된다."
      ],
      answer: 0,
      explanation: "Projection/connector가 vision feature를 LLM token space에 맞추는 alignment 단계 뒤, visual instruction-response data로 대화와 reasoning 행동을 학습한다.",
      reference: "vlm"
    }),
    mcq({
      id: 59,
      section: "nlp-llm",
      topic: "Document-understanding VLM",
      difficulty: "중",
      prompt: "일반 사진 VLM보다 document-understanding VLM에 특히 중요한 능력 조합은?",
      choices: [
        "작은 글자 인식, 2차원 layout 이해, table·chart 구조 해석",
        "Audio pitch 추정만",
        "Cluster centroid 초기화만",
        "Video frame interpolation만"
      ],
      answer: 0,
      explanation: "문서는 글자 내용뿐 아니라 위치, 열, 행, 표, 도형의 관계가 의미를 만든다. High-resolution 처리와 OCR/layout 정보가 중요하다.",
      reference: "vlm"
    }),
    mcq({
      id: 60,
      section: "nlp-llm",
      topic: "Small VLM",
      difficulty: "중",
      prompt: "Small VLM(sVLM)을 선택하는 가장 타당한 상황은?",
      choices: [
        "Edge device의 memory·latency·privacy 제약 안에서 제한된 visual-language task를 수행해야 할 때",
        "Parameter 수가 클수록 무조건 좋은 연구 leaderboard만 볼 때",
        "Image input이 전혀 없는 선형회귀만 풀 때",
        "Hardware 제약이 없고 최대 능력만 필요할 때"
      ],
      answer: 0,
      explanation: "sVLM은 최고 범용 성능보다 실제 기기에서 돌아가는 latency, memory, energy와 충분한 task 성능의 균형을 목표로 한다.",
      reference: "smallVlm"
    }),
    mcq({
      id: 61,
      section: "agents-rag",
      topic: "AI와 AI Agent 차이",
      difficulty: "하",
      prompt: "일반 AI model과 AI Agent를 구분하는 설명으로 가장 적절한 것은?",
      choices: [
        "Agent는 목표를 위해 상태를 관찰하고 계획하며 tool로 환경에 action을 취하는 loop를 가진다.",
        "Agent는 반드시 AI model보다 parameter가 많다.",
        "일반 AI model은 text를 처리할 수 없다.",
        "Agent는 memory나 외부 system을 사용할 수 없다."
      ],
      answer: 0,
      explanation: "Model은 주어진 input에 output을 만드는 핵심 추론기이고, Agent는 model을 포함해 goal, state, memory, tool, control loop를 묶은 system이다.",
      reference: "agents"
    }),
    mcq({
      id: 62,
      section: "agents-rag",
      topic: "LLM Agent 특징",
      difficulty: "중",
      prompt: "LLM Agent의 핵심 구성요소로 가장 알맞은 조합은?",
      choices: [
        "Goal/plan, memory/state, tool, observation-action loop",
        "Kernel size, pooling, padding만",
        "Centroid, linkage, dendrogram만",
        "Precision, Recall, ROC만"
      ],
      answer: 0,
      explanation: "Agent는 목표를 task로 나누고, 현재 상태와 과거 결과를 유지하며, 필요한 tool을 호출하고 observation에 따라 다음 행동을 수정한다.",
      reference: "agents"
    }),
    mcq({
      id: 63,
      section: "agents-rag",
      topic: "AI Agent operation",
      difficulty: "중",
      prompt: "ReAct형 Agent의 동작 순서를 가장 잘 나타낸 것은?",
      choices: [
        "상태/목표 확인 → 다음 action 결정 → tool 실행 → observation 반영 → 반복 또는 종료",
        "정답 출력 → 모든 tool 무작위 호출 → 목표 생성",
        "Model 삭제 → database 삭제 → 종료",
        "Pre-training → hardware 교체 → K-means"
      ],
      answer: 0,
      explanation: "Agent의 핵심은 한 번의 응답이 아니라 action 결과를 다시 observation으로 받아 계획을 갱신하는 closed loop다.",
      reference: "agents"
    }),
    mcq({
      id: 64,
      section: "agents-rag",
      topic: "AI Agent tool 사용",
      difficulty: "중",
      prompt: "LLM이 tool을 안정적으로 선택하고 argument를 생성하도록 돕는 가장 중요한 정보는?",
      choices: [
        "명확한 tool 이름·설명과 typed input schema, 사용 조건",
        "Tool 개발자의 나이",
        "무작위로 바뀌는 parameter 이름",
        "가능한 모든 자연어를 하나의 string argument에 넣는 규칙"
      ],
      answer: 0,
      explanation: "Model은 tool description과 schema를 보고 호출 여부와 argument 구조를 결정한다. 모호하거나 겹치는 tool 설명은 잘못된 선택을 늘린다.",
      reference: "tools"
    }),
    short({
      id: 65,
      section: "agents-rag",
      topic: "AI Agent tool 사용",
      difficulty: "하",
      prompt: "Agent가 tool을 실행한 뒤 그 반환값을 다음 판단에 다시 넣을 때, 이 반환 정보를 보통 무엇이라고 부르나요?",
      placeholder: "영문 또는 한글 용어",
      grading: { accepted: ["observation", "관찰", "관찰값", "tool observation", "도구 관찰값", "도구 결과"] },
      answerText: "Observation(관찰값)",
      explanation: "Action으로 tool을 호출하면 환경이 observation을 돌려주고, Agent는 이를 state/context에 반영해 다음 step을 정한다.",
      reference: "agents"
    }),
    mcq({
      id: 66,
      section: "agents-rag",
      topic: "Tool learning",
      difficulty: "상",
      prompt: "Tool learning용 training data로 가장 정보량이 높은 것은?",
      choices: [
        "문제, 선택한 tool과 argument, 실행 결과, 후속 수정, 최종 outcome을 담은 trajectory",
        "Tool 이름만 반복한 text",
        "아무 argument 없이 성공했다고 적은 label",
        "Image pixel 평균만 기록한 table"
      ],
      answer: 0,
      explanation: "Tool 사용은 호출 여부, tool 선택, argument 구성, 결과 해석, 오류 회복까지 배워야 하므로 전체 interaction trajectory가 중요하다.",
      reference: "toolLearning"
    }),
    mcq({
      id: 67,
      section: "agents-rag",
      topic: "Multi-agent system",
      difficulty: "중",
      prompt: "Planner–Worker–Reviewer로 역할을 나누는 Multi-agent system의 기대 이점은?",
      choices: [
        "문제 분해, 전문화된 실행, 독립적 검토를 분리할 수 있다.",
        "Communication cost가 항상 0이 된다.",
        "틀린 정보가 Agent 사이에 전파될 수 없다.",
        "Single Agent보다 언제나 빠르고 싸다."
      ],
      answer: 0,
      explanation: "역할 분리는 복잡한 task의 구조화와 검토에 도움을 줄 수 있지만, coordination overhead와 error propagation도 함께 관리해야 한다.",
      reference: "multiAgent"
    }),
    mcq({
      id: 68,
      section: "agents-rag",
      topic: "Multi-agent system",
      difficulty: "상",
      prompt: "Multi-agent system을 무작정 늘렸을 때 생길 수 있는 대표적인 실패는?",
      choices: [
        "중복 작업, message 비용 증가, 공유 state 불일치와 오류 증폭",
        "모든 Agent의 accuracy가 자동으로 100%가 됨",
        "Tool permission 문제가 자동 해결됨",
        "Latency가 Agent 수에 반비례해 항상 감소함"
      ],
      answer: 0,
      explanation: "Agent 수는 품질의 직접 대리변수가 아니다. 명확한 ownership, communication protocol, 종료 조건, 결과 검증이 없으면 더 복잡하고 비싸진다.",
      reference: "multiAgent"
    }),
    mcq({
      id: 69,
      section: "agents-rag",
      topic: "RAG",
      difficulty: "하",
      prompt: "Retrieval-Augmented Generation(RAG)의 핵심 아이디어는?",
      choices: [
        "질문과 관련된 외부 문서를 검색해 generation context로 제공한다.",
        "모든 지식을 매 질문마다 model weight에 다시 학습한다.",
        "Retriever 없이 더 긴 답만 생성한다.",
        "Image를 1×1 convolution으로만 처리한다."
      ],
      answer: 0,
      explanation: "RAG는 parametric memory인 model과 검색 가능한 non-parametric external knowledge를 결합해 최신성, 근거성, domain 적응을 돕는다.",
      reference: "rag"
    }),
    short({
      id: 70,
      section: "agents-rag",
      topic: "RAG",
      difficulty: "중",
      prompt: "질의 시점의 기본 RAG 순서를 네 단계로 쓰세요: 질문 embedding, 문서 검색, context 구성, 답변 생성.",
      placeholder: "A → B → C → D 형태",
      grading: {
        orderedKeywords: [
          ["질문 embedding", "query embedding", "질의 embedding", "질문 임베딩", "질의 임베딩"],
          ["문서 검색", "retrieve", "retrieval", "검색"],
          ["context", "컨텍스트", "prompt", "프롬프트"],
          ["답변 생성", "generation", "생성"]
        ]
      },
      answerText: "질문 embedding → 관련 문서 검색 → 검색 문서로 context 구성 → 답변 생성",
      explanation: "Indexing 단계의 chunking·embedding·저장은 미리 수행하고, query 단계에서는 질문을 같은 vector space에 넣어 관련 chunk를 찾아 generation prompt에 붙인다.",
      reference: "rag"
    }),
    mcq({
      id: 71,
      section: "agents-rag",
      topic: "RAG",
      difficulty: "중",
      prompt: "RAG에서 chunk size를 지나치게 크게 잡았을 때 생기기 쉬운 문제는?",
      choices: [
        "한 chunk에 무관한 내용이 섞여 retrieval 정밀도가 낮아지고 context token을 낭비한다.",
        "모든 문서가 자동으로 삭제된다.",
        "Embedding dimension이 반드시 1이 된다.",
        "Generator가 더 이상 token을 만들 수 없다."
      ],
      answer: 0,
      explanation: "큰 chunk는 문맥 보존에는 유리하지만 여러 주제가 섞일 수 있다. 작은 chunk는 정밀하지만 문맥이 끊길 수 있어 overlap과 document 구조를 함께 조절한다.",
      reference: "rag"
    }),
    mcq({
      id: 72,
      section: "agents-rag",
      topic: "RAG",
      difficulty: "중",
      prompt: "Semantic retrieval에서 query와 document embedding 사이 cosine similarity를 쓰는 이유는?",
      choices: [
        "표면 단어가 달라도 vector space에서 의미가 가까운 text를 찾기 위해서다.",
        "모든 문장을 동일한 vector로 만들기 위해서다.",
        "Document를 학습 label로 바꾸기 위해서다.",
        "Generator의 parameter를 매 query마다 갱신하기 위해서다."
      ],
      answer: 0,
      explanation: "Keyword가 정확히 겹치지 않아도 같은 의미의 표현을 가까운 vector로 mapping하면 semantic search가 가능하다.",
      reference: "rag"
    }),
    mcq({
      id: 73,
      section: "agents-rag",
      topic: "RAG",
      difficulty: "상",
      prompt: "RAG가 hallucination을 줄일 수 있지만 완전히 없애지는 못하는 이유는?",
      choices: [
        "검색이 틀리거나 context가 부족할 수 있고, generator가 근거를 무시하거나 잘못 조합할 수도 있다.",
        "RAG는 external document를 전혀 사용하지 않기 때문이다.",
        "Cosine similarity는 항상 1이기 때문이다.",
        "Chunk에는 text를 넣을 수 없기 때문이다."
      ],
      answer: 0,
      explanation: "RAG 품질은 retrieval과 generation 두 단계의 곱이다. Retrieval recall, reranking, groundedness, citation correctness를 분리 평가해야 한다.",
      reference: "rag"
    }),
    mcq({
      id: 74,
      section: "agents-rag",
      topic: "Distribution shift",
      difficulty: "중",
      prompt: "Distribution shift를 가장 정확히 설명한 것은?",
      choices: [
        "Deployment input/label 관계의 분포가 training 때와 달라지는 현상",
        "Learning rate가 한 step 감소하는 현상",
        "Parameter를 FP32에서 INT8로 바꾸는 현상",
        "Dataset 행 순서를 섞는 현상"
      ],
      answer: 0,
      explanation: "날씨, sensor, 사용자군, 시간 변화 등으로 Ptrain과 Pdeploy가 달라지면 training 성능이 좋아도 현장에서 성능이 떨어질 수 있다.",
      reference: "shift"
    }),
    mcq({
      id: 75,
      section: "agents-rag",
      topic: "OOD와 adaptive sensing",
      difficulty: "상",
      prompt: "OOD 상황에서 adaptive sensing이 취하는 발상으로 가장 가까운 것은?",
      choices: [
        "Model만 크게 만드는 대신 sensor 설정이나 관측 방식을 바꿔 더 익숙하고 확신 높은 input을 얻는다.",
        "모든 OOD sample을 training data라고 가정한다.",
        "Sensor를 끄고 random output을 사용한다.",
        "Label을 볼 수 있을 때만 inference한다."
      ],
      answer: 0,
      explanation: "Adaptive sensing은 노출, 초점, 관측 위치·빈도 같은 sensing action을 조절해 downstream model이 처리하기 좋은 관측을 선택한다.",
      reference: "sensing"
    }),
    mcq({
      id: 76,
      section: "agents-rag",
      topic: "Domain-specific AI",
      difficulty: "중",
      prompt: "Domain-specific AI를 설계할 때 가장 바람직한 접근은?",
      choices: [
        "전문가 지식, domain data, 제약조건과 실제 평가 기준을 architecture·training·evaluation에 반영한다.",
        "범용 benchmark 점수만 보고 현장 data는 무시한다.",
        "Domain 용어를 모두 일반어로 삭제한다.",
        "가장 큰 model이면 validation 없이 배포한다."
      ],
      answer: 0,
      explanation: "Domain-specific AI의 강점은 좁은 환경에서 중요한 신호와 비용을 정확히 반영하는 데 있다. 대신 다른 domain으로의 generalization 범위는 별도 검증한다.",
      reference: "domain"
    }),
    mcq({
      id: 77,
      section: "compression-deploy",
      topic: "Quantization 특징",
      difficulty: "하",
      prompt: "Model quantization의 일반적인 효과를 올바르게 설명한 것은?",
      choices: [
        "Weight나 activation의 numeric precision을 낮춰 memory·bandwidth를 줄일 수 있지만 accuracy 손실과 hardware 지원을 확인해야 한다.",
        "Parameter 개수를 반드시 절반으로 삭제한다.",
        "Training data의 label을 자동 교정한다.",
        "어떤 hardware에서도 latency를 정확히 같은 비율로 줄인다."
      ],
      answer: 0,
      explanation: "Quantization은 값의 개수가 아니라 한 값을 표현하는 bit 수와 연산 형식을 바꾼다. 실제 speedup은 kernel과 accelerator가 해당 precision을 지원할 때 얻는다.",
      reference: "quantization"
    }),
    short({
      id: 78,
      section: "compression-deploy",
      topic: "Low-bit quantization",
      difficulty: "중",
      prompt: "7 billion parameter model의 weight를 4-bit로만 저장할 때 scale 등의 overhead를 제외한 이론적 크기는 몇 GB인가요? 1 GB = 10⁹ byte로 계산하세요.",
      placeholder: "예: 3.5 GB",
      grading: { numeric: { value: 3.5, tolerance: 0.001 } },
      answerText: "3.5 GB",
      explanation: "7×10⁹ × 4 bit ÷ 8 = 3.5×10⁹ byte다. 실제 파일에는 scale, zero-point, metadata가 더해질 수 있다.",
      reference: "quantization"
    }),
    mcq({
      id: 79,
      section: "compression-deploy",
      topic: "Quantization 특징",
      difficulty: "상",
      prompt: "Affine quantization의 dequantization 식 x ≈ s(q - z)에서 s와 z의 역할은?",
      choices: [
        "s는 실수 간격을 정하는 scale, z는 실수 0에 대응하는 quantized zero-point다.",
        "s는 sample 수, z는 class 수다.",
        "s는 stride, z는 padding이다.",
        "s와 z는 모두 학습 label이다."
      ],
      answer: 0,
      explanation: "Scale은 quantized integer 한 칸의 실수 간격을 정하고, zero-point는 비대칭 범위에서 0을 정확히 표현하도록 좌표 원점을 옮긴다.",
      reference: "quantization"
    }),
    mcq({
      id: 80,
      section: "compression-deploy",
      topic: "Knowledge distillation",
      difficulty: "하",
      prompt: "Knowledge distillation의 핵심은?",
      choices: [
        "큰 teacher의 output distribution이나 intermediate representation을 작은 student가 모방하게 학습한다.",
        "Teacher의 parameter를 그대로 복사해 student 크기도 같게 만든다.",
        "Training 없이 weight bit만 줄인다.",
        "모든 layer를 random pruning한다."
      ],
      answer: 0,
      explanation: "Student는 hard label뿐 아니라 teacher가 보여주는 class 간 관계와 표현을 학습해 작은 크기에서 더 높은 성능을 노린다.",
      reference: "compression"
    }),
    mcq({
      id: 81,
      section: "compression-deploy",
      topic: "Teacher-student knowledge distillation",
      difficulty: "중",
      prompt: "Distillation에서 teacher의 soft target이 hard label보다 추가로 주는 정보는?",
      choices: [
        "정답 이외 class들 사이의 상대적 유사성과 불확실성",
        "GPU의 실제 전력 사용량",
        "Dataset 파일 경로",
        "Optimizer의 다음 learning rate"
      ],
      answer: 0,
      explanation: "예를 들어 teacher가 고양이 0.7, 여우 0.2, 자동차 0.001로 본다면 student는 오답 class끼리도 어떤 것이 더 비슷한지 배울 수 있다.",
      reference: "compression"
    }),
    mcq({
      id: 82,
      section: "compression-deploy",
      topic: "Teacher-student knowledge distillation",
      difficulty: "상",
      prompt: "Logit distillation에서 temperature T를 1보다 크게 두는 일반적인 목적은?",
      choices: [
        "Probability distribution을 부드럽게 만들어 낮은 확률 class 관계를 더 드러낸다.",
        "Student parameter를 자동으로 integer로 바꾼다.",
        "Teacher를 training data에서 제거한다.",
        "Batch size를 항상 T배로 늘린다."
      ],
      answer: 0,
      explanation: "높은 temperature는 logit 차이를 완화해 분포를 부드럽게 한다. 구현에서는 gradient scale을 보정하려고 distillation loss에 T²를 곱하는 경우가 많다.",
      reference: "compression"
    }),
    mcq({
      id: 83,
      section: "compression-deploy",
      topic: "배포 환경별 model compression 전략",
      difficulty: "상",
      prompt: "RAM이 매우 작고 INT8 accelerator가 있는 edge device에 우선 검토할 전략은?",
      choices: [
        "작은 architecture와 INT8 quantization을 우선하고 target hardware에서 operator 지원과 latency를 측정한다.",
        "가장 큰 FP32 model을 그대로 올리고 cloud 연결을 금지한다.",
        "Accuracy 하나만 보고 memory 측정은 생략한다.",
        "Unsupported custom operator를 최대한 늘린다."
      ],
      answer: 0,
      explanation: "배포 최적화는 target hardware가 빠르게 실행할 수 있는 precision과 operator를 기준으로 해야 한다. 이론 FLOPs 감소만으로 실제 latency를 보장할 수 없다.",
      reference: "compression"
    }),
    mcq({
      id: 84,
      section: "compression-deploy",
      topic: "배포 환경별 model compression 전략",
      difficulty: "중",
      prompt: "개인정보를 외부로 보낼 수 없고 network가 불안정하며 즉각적인 응답이 필요한 service에 더 적합한 배포 방향은?",
      choices: [
        "성능 제약을 만족하도록 압축한 on-device inference",
        "모든 raw data를 매번 remote server에 전송",
        "Inference 때마다 full fine-tuning",
        "Random response caching"
      ],
      answer: 0,
      explanation: "On-device는 privacy, offline availability, latency에 유리하지만 memory·energy·thermal budget에 맞춘 model과 runtime 최적화가 필요하다.",
      reference: "compression"
    }),
    mcq({
      id: 85,
      section: "compression-deploy",
      topic: "Model compression trade-off",
      difficulty: "중",
      prompt: "Compression 방법을 선택할 때 가장 신뢰할 수 있는 평가 방식은?",
      choices: [
        "Target hardware와 실제 workload에서 quality, p95 latency, peak memory, energy를 함께 측정한다.",
        "Parameter 수 하나만 비교한다.",
        "논문의 desktop GPU 결과를 모든 device에 그대로 적용한다.",
        "File size가 작으면 accuracy 검증을 생략한다."
      ],
      answer: 0,
      explanation: "File size, FLOPs, wall-clock latency, memory, energy는 서로 다른 지표다. 배포 환경의 bottleneck을 직접 측정해야 올바른 trade-off를 고를 수 있다.",
      reference: "compression"
    }),
    mcq({
      id: 86,
      section: "compression-deploy",
      topic: "AI scaling과 Physical AI",
      difficulty: "상",
      prompt: "Physical AI에서 language model식 data·parameter scaling만으로 해결하기 어려운 이유는?",
      choices: [
        "Sensor noise, embodiment, real-time control, safety와 sim-to-real gap처럼 물리적 상호작용의 제약이 있기 때문이다.",
        "Physical system에는 data가 전혀 존재하지 않기 때문이다.",
        "Robot은 neural network를 실행할 수 없기 때문이다.",
        "Scaling은 text에만 정의된 수학이기 때문이다."
      ],
      answer: 0,
      explanation: "현실에서 action은 되돌리기 어렵고 data 수집도 비싸다. Model scaling과 함께 simulation, sensing, control, safety validation, real-world feedback가 필요하다.",
      reference: "sensing"
    }),
    short({
      id: 87,
      section: "compression-deploy",
      topic: "Low-bit quantization",
      difficulty: "중",
      prompt: "W4A16 weight-only quantization에서 4-bit인 대상과 16-bit인 대상을 각각 쓰세요.",
      placeholder: "예: OOO는 4-bit, OOO는 16-bit",
      grading: {
        keywordGroups: [["weight", "weights", "가중치"], ["4"], ["activation", "activations", "활성값", "활성화"], ["16"]]
      },
      answerText: "Weight는 4-bit, activation은 16-bit",
      explanation: "Weight-only quantization은 model 저장과 memory bandwidth를 크게 줄이지만 activation과 일부 compute는 FP16/BF16 등에 남을 수 있어 full integer inference와 다르다.",
      reference: "quantization"
    }),
    short({
      id: 88,
      section: "compression-deploy",
      topic: "Model compression trade-off",
      difficulty: "하",
      prompt: "10 million parameter를 INT8로만 저장할 때 metadata를 제외한 이론적 weight 크기는 몇 MB인가요? 1 MB = 10⁶ byte로 계산하세요.",
      placeholder: "예: 10 MB",
      grading: { numeric: { value: 10, tolerance: 0.001 } },
      answerText: "10 MB",
      explanation: "INT8은 parameter 하나당 1 byte이므로 10×10⁶ parameter는 10×10⁶ byte, 즉 10 MB다.",
      reference: "quantization"
    }),
    practical({
      id: 89,
      section: "practical",
      topic: "데이터 생성을 위한 Prompt 설계",
      difficulty: "중",
      prompt: "고객 상담 의도 분류용 합성 data 200개를 LLM으로 생성하려고 합니다. 아래 조건을 만족하는 production용 Prompt를 작성하세요.",
      context: "Label: refund, delivery, product_info, account (각 50개)\nOutput: JSONL, 한 줄에 하나의 object\nField: id, utterance, label, difficulty\n금지: 개인정보, 중복 utterance, JSONL 밖의 설명",
      starter: [
        "당신은 ...",
        "목표: ...",
        "출력 schema: ...",
        "제약조건: ..."
      ].join("\n"),
      rubric: [
        "역할과 생성 목적을 명확히 지정했다.",
        "Field type과 허용 label을 포함한 JSONL schema를 명시했다.",
        "Class balance, 표현 다양성, 난이도 분포를 검증 가능한 수치로 적었다.",
        "개인정보·중복·추가 설명 금지와 출력 전 self-check를 요구했다."
      ],
      modelAnswer: [
        "당신은 한국어 고객 상담 dataset 설계자다.",
        "refund, delivery, product_info, account 의도 분류용 utterance를 각 50개씩 총 200개 생성하라.",
        "각 줄은 {\"id\": 정수, \"utterance\": 문자열, \"label\": 네 label 중 하나, \"difficulty\": \"easy|medium|hard\"} 형식의 유효한 JSON object여야 한다.",
        "각 label 안에서 difficulty 비율은 40:40:20으로 맞추고, 존댓말·반말·오타·짧은 문장·복합 표현을 고르게 포함하라.",
        "실명, 전화번호, 주소, 계정번호 등 개인정보를 만들지 말고 utterance를 중복하지 마라.",
        "출력 전 총개수, label별 50개, schema, 중복 여부를 내부적으로 검사하라.",
        "JSONL 200줄만 출력하고 markdown fence나 설명은 쓰지 마라."
      ].join("\n"),
      explanation: "합성 data Prompt는 창의적인 문장 생성뿐 아니라 schema, 분포, 금지 조건, 검증 절차까지 명세해야 downstream pipeline에서 바로 검사할 수 있다.",
      reference: "pythonSynthetic"
    }),
    practical({
      id: 90,
      section: "practical",
      topic: "데이터 생성을 위한 Prompt 설계",
      difficulty: "상",
      prompt: "제조 설비 이상 탐지 dataset의 minority class가 부족합니다. 단순 복제가 아니라 결정 경계 학습에 도움 되는 합성 사례를 만들 Prompt를 설계하세요.",
      context: "Class: normal 90%, warning 8%, failure 2%\nFeature 의미: temperature(°C), vibration(mm/s), pressure(kPa), rpm\n물리적으로 불가능한 조합은 금지",
      starter: "생성 대상과 경계 사례, 물리 제약, 분포 검증 조건을 포함하세요.",
      rubric: [
        "Warning/failure와 정상의 경계 사례를 우선 생성하도록 했다.",
        "각 feature의 단위·허용 범위와 feature 간 물리 제약을 명시했다.",
        "동일 template 복제를 피하도록 원인·운전 조건을 다양화했다.",
        "실제 data와 분리 표식 및 전문가 검토 단계를 포함했다."
      ],
      modelAnswer: [
        "설비 진단 전문가 역할로 warning 160개, failure 40개의 후보 사례를 생성하라.",
        "각 사례는 temperature_C, vibration_mm_s, pressure_kpa, rpm, label, failure_mode, rationale, synthetic=true를 가진 JSONL이어야 한다.",
        "정상 범위 바로 바깥의 hard negative/positive를 50% 포함하고 과열, 축 불균형, 압력 누설, 복합 고장 원인을 고르게 배분하라.",
        "제공된 센서 허용 범위와 rpm-진동, 압력-누설의 물리 규칙을 위반한 sample은 출력하지 마라.",
        "동일 수치 조합과 rationale template을 반복하지 말고, 생성 뒤 rule validator와 설비 전문가가 검토할 수 있도록 위반 사유 field를 비워 두지 마라."
      ].join("\n"),
      explanation: "불균형 data 생성에서는 minority 개수만 채우기보다 실제 decision boundary와 domain constraint를 반영해야 한다. 합성 표식과 전문가 검토도 data provenance의 일부다.",
      reference: "pythonSynthetic"
    }),
    practical({
      id: 91,
      section: "practical",
      topic: "데이터 생성을 위한 Prompt 설계",
      difficulty: "중",
      prompt: "의료 상담 chatbot의 안전성 평가용 adversarial Prompt dataset을 생성하는 Prompt를 작성하세요. 실제 개인정보와 위험한 진단 지시는 생성하지 않아야 합니다.",
      context: "평가 범주: 응급 증상, 약물 상호작용 질문, 개인정보 유도, 확정 진단 요구\n목적: chatbot이 거절·안내·전문가 연결을 올바르게 하는지 평가",
      starter: "평가 목적과 안전 경계가 동시에 드러나게 작성하세요.",
      rubric: [
        "네 평가 범주와 범주별 목표 개수를 명시했다.",
        "실제 개인정보·실존 인물·실행 가능한 위험 지시를 금지했다.",
        "Expected safe behavior 또는 rubric label을 함께 생성하도록 했다.",
        "Synthetic test 전용이며 의료 조언 data가 아님을 명시했다."
      ],
      modelAnswer: [
        "의료 AI red-team dataset 설계자로서 네 범주별 25개씩 총 100개의 가상 user message를 생성하라.",
        "실명·전화번호·주소·실제 처방전은 사용하지 말고 placeholder만 사용한다. 자해 방법, 약물 용량 조작 등 그대로 실행 가능한 위험 세부사항은 쓰지 않는다.",
        "각 JSON object는 category, user_message, risk_level, expected_behavior, forbidden_behavior, synthetic=true를 포함한다.",
        "Expected behavior는 응급 서비스 안내, 의료전문가 상담 권고, 개인정보 거절, 불확실성 고지를 rubric 형태로 적는다.",
        "이 dataset은 model 안전성 평가 전용이며 진단·치료 조언으로 사용할 수 없다는 metadata를 포함하라."
      ].join("\n"),
      explanation: "Safety dataset 생성 Prompt는 공격 다양성과 함께 생성물 자체가 위험해지지 않는 경계를 정의해야 한다. Expected behavior가 있어야 자동·수동 평가가 가능하다.",
      reference: "pythonSynthetic"
    }),
    practical({
      id: 92,
      section: "practical",
      topic: "데이터 생성을 위한 Prompt 설계",
      difficulty: "상",
      prompt: "다른 LLM이 만든 instruction-response 합성 data를 거르는 LLM-as-Judge Prompt를 작성하세요.",
      context: "평가 기준: instruction 준수, 사실성, 완결성, 안전성, 문체 자연스러움\nJudge output은 program이 parsing할 수 있어야 함",
      starter: "Generator와 Judge를 분리하고 점수 기준을 구체화하세요.",
      rubric: [
        "각 평가 축을 분리하고 1~5점 anchor를 구체적으로 정의했다.",
        "치명적 오류의 자동 탈락 규칙을 명시했다.",
        "고정 JSON schema와 pass 판정 기준을 제시했다.",
        "순서·자기선호 bias 완화를 위한 독립 Judge 또는 반복 평가 방안을 적었다."
      ],
      modelAnswer: [
        "당신은 data generator와 다른 계열의 독립적인 dataset Judge다.",
        "주어진 instruction과 response를 instruction_following, factuality, completeness, safety, naturalness의 다섯 축으로 각각 1~5점 평가하라.",
        "1점은 task 실패 또는 심각한 오류, 3점은 핵심은 맞지만 수정 필요, 5점은 검증 가능한 결함 없음으로 정의한다.",
        "사실 조작, 개인정보 노출, 위험 지시, instruction과 무관한 답은 평균과 관계없이 pass=false다.",
        "{\"scores\": {각 축: 정수}, \"critical_errors\": [문자열], \"pass\": boolean, \"reason\": 문자열} JSON 하나만 출력하라.",
        "통과 조건은 critical_errors가 없고 모든 축 3점 이상이며 평균 4.0 이상이다. 후보 순서를 바꾼 재평가와 다른 Judge 표본 검증을 별도 pipeline에서 수행한다."
      ].join("\n"),
      explanation: "LLM-as-Judge는 '좋은가?'라고 한 번 묻기보다 rubric의 축과 anchor, 탈락 규칙, parse schema를 고정하고 bias를 교차검증해야 한다.",
      reference: "llmEvaluation"
    }),
    practical({
      id: 93,
      section: "practical",
      topic: "EDA와 상관관계 해석",
      difficulty: "하",
      prompt: "pandas DataFrame df의 shape, dtype, 결측치 수·비율, 중복 행 수, numeric summary를 한 번에 점검하는 EDA code를 작성하세요.",
      starter: [
        "import pandas as pd",
        "",
        "# df는 이미 로드되어 있다.",
        "# 여기에 EDA code를 작성하세요."
      ].join("\n"),
      rubric: [
        "shape와 dtypes를 확인한다.",
        "Column별 missing count와 ratio를 계산한다.",
        "duplicated 행 수를 확인한다.",
        "describe(include='all') 또는 동등한 numeric/categorical summary를 확인한다."
      ],
      modelAnswer: [
        "print('shape:', df.shape)",
        "print(df.dtypes)",
        "",
        "missing = pd.DataFrame({",
        "    'count': df.isna().sum(),",
        "    'ratio': df.isna().mean()",
        "}).sort_values('ratio', ascending=False)",
        "print(missing)",
        "print('duplicates:', df.duplicated().sum())",
        "print(df.describe(include='all').T)"
      ].join("\n"),
      explanation: "EDA의 첫 단계는 계산보다 data가 어떤 모양과 품질인지 확인하는 것이다. dtype 오류, missing, duplicate는 이후 correlation과 model 결과를 왜곡할 수 있다.",
      reference: "pythonEda"
    }),
    practical({
      id: 94,
      section: "practical",
      topic: "EDA와 상관관계 해석",
      difficulty: "중",
      prompt: "Numeric column의 Pearson correlation matrix를 계산하고 |r| ≥ 0.8인 중복 없는 feature pair만 뽑는 Python code를 작성하세요. 자기 자신과 대칭 중복은 제외합니다.",
      starter: [
        "import numpy as np",
        "import pandas as pd",
        "",
        "numeric = df.select_dtypes(include='number')"
      ].join("\n"),
      rubric: [
        "Numeric column만 선택해 corr()를 계산한다.",
        "절댓값을 기준으로 threshold 0.8을 적용한다.",
        "Upper triangle mask로 자기상관과 대칭 중복을 제거한다.",
        "Feature 이름과 signed correlation 값을 보존한다."
      ],
      modelAnswer: [
        "corr = numeric.corr(method='pearson')",
        "upper = corr.where(np.triu(np.ones(corr.shape), k=1).astype(bool))",
        "pairs = (upper.stack()",
        "              .rename('correlation')",
        "              .loc[lambda s: s.abs() >= 0.8]",
        "              .sort_values(key=lambda s: s.abs(), ascending=False))",
        "print(pairs)"
      ].join("\n"),
      explanation: "Correlation matrix는 대칭이므로 upper triangle만 보면 pair를 한 번씩만 셀 수 있다. 선택에는 절댓값을 쓰되 해석할 때는 부호를 유지한다.",
      reference: "pythonEda"
    }),
    practical({
      id: 95,
      section: "practical",
      topic: "EDA와 상관관계 해석",
      difficulty: "중",
      prompt: "아래 correlation 결과를 보고 보고서용 해석을 3문장 이내로 작성하세요.",
      context: "corr(ad_spend, sales) = 0.82\ncorr(discount_rate, sales) = 0.61\ncorr(ad_spend, discount_rate) = 0.88\n관찰 data이며 실험 data가 아님",
      starter: "관계의 방향·강도, multicollinearity, causality 주의를 모두 언급하세요.",
      rubric: [
        "ad_spend와 sales의 강한 양의 선형 관계를 설명했다.",
        "ad_spend와 discount_rate 사이 높은 상관으로 multicollinearity 가능성을 지적했다.",
        "상관만으로 광고비의 인과효과를 단정하지 않았다.",
        "VIF, feature 선택/결합 또는 추가 실험 같은 다음 검증을 제안했다."
      ],
      modelAnswer: "광고비와 매출은 강한 양의 선형 관계(r=0.82), 할인율과 매출은 중간 정도의 양의 관계(r=0.61)를 보인다. 다만 광고비와 할인율도 매우 높게 함께 움직여(r=0.88) 다중회귀에서는 multicollinearity를 VIF 등으로 확인해야 한다. 관찰 data의 상관만으로 광고비 증가가 매출을 일으켰다고 단정할 수 없으므로 통제 변수나 실험 설계까지 검토한다.",
      explanation: "Correlation 해석은 방향·강도만 말하고 멈추지 않는다. Feature끼리의 상관, 교란변수, 비선형 관계, 표본 크기와 causality 한계를 함께 본다.",
      reference: "pythonEda"
    }),
    practical({
      id: 96,
      section: "practical",
      topic: "EDA와 상관관계 해석",
      difficulty: "상",
      prompt: "고객 이탈 예측 EDA에서 final_cancellation_code와 target(churn)의 상관이 0.99로 나왔습니다. 이 feature를 그대로 쓰면 안 될 가능성이 큰 이유와 확인 절차를 작성하세요.",
      context: "final_cancellation_code는 고객이 탈퇴 절차를 완료한 뒤 system에 기록되는 column이다.",
      starter: "발생 시점, inference 시점의 가용성, validation 방법을 중심으로 답하세요.",
      rubric: [
        "Prediction 시점 뒤에 생기는 target leakage임을 식별했다.",
        "Feature timestamp와 online inference 시 가용성을 확인한다.",
        "해당 feature를 제거하고 time-based split로 다시 평가한다.",
        "Correlation이 매우 높다는 사실만으로 좋은 feature라고 결론 내리지 않았다."
      ],
      modelAnswer: "final_cancellation_code는 이탈 결과가 발생한 뒤 기록되므로 prediction 시점에는 알 수 없는 post-outcome feature이며 target leakage다. Data dictionary와 event timestamp로 각 feature가 예측 기준시각 이전에 생성되는지 확인하고 이 column과 파생 column을 제거한다. 이후 과거로 학습하고 미래로 검증하는 time-based split로 pipeline 전체를 다시 평가하며 성능 하락을 정상적인 leakage 제거 결과로 해석한다.",
      explanation: "EDA의 높은 correlation은 신호일 수도 있지만 미래 정보가 새어 들어온 경고일 수도 있다. Feature 가용 시점을 확인하지 않은 random split은 leakage를 숨긴다.",
      reference: "pythonEda"
    }),
    practical({
      id: 97,
      section: "practical",
      topic: "RAG workflow 구현",
      difficulty: "중",
      prompt: "문서 목록 documents를 chunk로 나누고 embedding한 뒤 vector store에 저장하는 indexing 단계의 Python pseudo-code를 작성하세요. Metadata로 source와 chunk_id를 보존해야 합니다.",
      starter: [
        "documents = load_documents(path)",
        "# split → embed → store 순서로 완성하세요."
      ].join("\n"),
      rubric: [
        "문서를 적절한 chunk_size와 overlap으로 분할한다.",
        "Chunk text를 embedding model로 vector화한다.",
        "source와 chunk_id metadata를 각 vector와 함께 저장한다.",
        "Embedding model/version과 index를 재현 가능하게 관리한다."
      ],
      modelAnswer: [
        "documents = load_documents(path)",
        "chunks = split_documents(documents, chunk_size=600, overlap=100)",
        "records = []",
        "for chunk_id, chunk in enumerate(chunks):",
        "    vector = embedder.embed_document(chunk.text)",
        "    records.append({",
        "        'id': f'{chunk.source}:{chunk_id}',",
        "        'vector': vector,",
        "        'text': chunk.text,",
        "        'metadata': {'source': chunk.source, 'chunk_id': chunk_id}",
        "    })",
        "vector_store.upsert(records)",
        "save_index_manifest(embedder.version, chunk_size=600, overlap=100)"
      ].join("\n"),
      explanation: "Indexing은 문서를 단순히 vector로 바꾸는 것에서 끝나지 않는다. 원문 추적 metadata와 embedding/chunking version이 있어야 citation과 재색인이 가능하다.",
      reference: "pythonRag"
    }),
    practical({
      id: 98,
      section: "practical",
      topic: "RAG workflow 구현",
      difficulty: "중",
      prompt: "사용자 question을 embedding하고 top-k 문서를 검색한 뒤 score threshold 아래 결과를 제거하는 retrieval 함수를 Python pseudo-code로 작성하세요.",
      starter: [
        "def retrieve(question: str, k: int = 5, min_score: float = 0.35):",
        "    pass"
      ].join("\n"),
      rubric: [
        "Question에는 query용 embedding method를 사용한다.",
        "Vector store에서 top-k와 score를 함께 가져온다.",
        "min_score 미만 결과를 제거한다.",
        "검색 결과가 없을 때 빈 목록을 안전하게 반환한다."
      ],
      modelAnswer: [
        "def retrieve(question: str, k: int = 5, min_score: float = 0.35):",
        "    query_vector = embedder.embed_query(question)",
        "    hits = vector_store.similarity_search_with_score(query_vector, k=k)",
        "    return [",
        "        {'text': hit.text, 'metadata': hit.metadata, 'score': score}",
        "        for hit, score in hits",
        "        if score >= min_score",
        "    ]"
      ].join("\n"),
      explanation: "Query와 document가 같은 embedding space에 있어야 하고 score의 방향·범위는 vector store 구현마다 확인해야 한다. Threshold는 validation query로 calibrate한다.",
      reference: "pythonRag"
    }),
    practical({
      id: 99,
      section: "practical",
      topic: "RAG workflow 구현",
      difficulty: "상",
      prompt: "검색된 chunks로 grounded answer를 생성하는 Prompt template과 Python 호출부를 작성하세요. 근거가 부족하면 모른다고 답하고 source를 인용해야 합니다.",
      starter: [
        "hits = retrieve(question)",
        "# context 구성 → prompt → llm 호출"
      ].join("\n"),
      rubric: [
        "검색 chunk와 source를 구분 가능한 context로 구성한다.",
        "Context만 근거로 답하고 부족하면 모른다고 하라는 규칙을 둔다.",
        "본문 claim에 source citation을 요구한다.",
        "검색 결과가 없을 때 LLM을 호출하지 않거나 안전한 fallback을 둔다."
      ],
      modelAnswer: [
        "hits = retrieve(question)",
        "if not hits:",
        "    return {'answer': '제공된 문서에서 근거를 찾지 못했습니다.', 'sources': []}",
        "",
        "context = '\\n\\n'.join(",
        "    f\"[source={h['metadata']['source']} chunk={h['metadata']['chunk_id']}]\\n{h['text']}\"",
        "    for h in hits",
        ")",
        "prompt = f'''다음 CONTEXT만 근거로 질문에 답하라.",
        "근거가 부족하면 추측하지 말고 모른다고 답하라.",
        "각 핵심 주장 뒤에 [source=...]를 붙여라.",
        "CONTEXT:\n{context}\nQUESTION:\n{question}'''",
        "answer = llm.generate(prompt, temperature=0)",
        "return {'answer': answer, 'sources': [h['metadata']['source'] for h in hits]}"
      ].join("\n"),
      explanation: "Grounding instruction, explicit source marker, no-context fallback을 함께 둬야 한다. Citation 문자열이 있다고 정확한 것은 아니므로 source가 실제 claim을 뒷받침하는지도 평가한다.",
      reference: "pythonRag"
    }),
    practical({
      id: 100,
      section: "practical",
      topic: "RAG workflow 구현",
      difficulty: "상",
      prompt: "RAG system이 자주 틀린 답을 할 때 retrieval 문제와 generation 문제를 분리 진단하는 evaluation plan을 작성하세요.",
      context: "평가 set에는 question, gold_answer, relevant_document_id가 있습니다.",
      starter: "Offline metric, error bucket, component별 개선 순서를 포함하세요.",
      rubric: [
        "Retrieval을 Recall@k, MRR/nDCG 등으로 별도 평가한다.",
        "Generation을 correctness, groundedness, citation accuracy로 별도 평가한다.",
        "No-hit, wrong-hit, context-missed, unsupported-generation 같은 error bucket을 만든다.",
        "실패한 component를 먼저 고친 뒤 end-to-end와 latency/cost를 재평가한다."
      ],
      modelAnswer: [
        "1. Gold relevant_document_id로 Recall@k와 MRR을 계산해 필요한 문서가 top-k에 들어오는지 먼저 본다.",
        "2. Gold 문서를 강제로 context에 넣은 oracle-generation 평가를 수행해 generator 자체의 correctness와 groundedness를 잰다.",
        "3. Citation이 실제 source와 claim을 지지하는지 citation precision을 검사한다.",
        "4. 실패를 no-hit, wrong-hit, chunk-boundary miss, reranker miss, context ignored, unsupported claim으로 분류한다.",
        "5. Retrieval 실패가 크면 chunking/embedding/hybrid search/reranking을, oracle에서도 틀리면 prompt/model을 먼저 수정한다.",
        "6. 수정 뒤 end-to-end answer quality와 p95 latency, token cost를 같은 holdout set에서 다시 측정한다."
      ].join("\n"),
      explanation: "End-to-end 점수 하나만 보면 어느 component를 고쳐야 할지 모른다. Retrieval oracle과 generation oracle을 이용해 병목을 분리하는 것이 RAG debugging의 핵심이다.",
      reference: "pythonRag"
    })
  ];

  const requiredTopics = [
    "데이터 생성을 위한 Prompt 설계",
    "EDA와 상관관계 해석",
    "RAG workflow 구현",
    "회귀식과 오차항",
    "K-means와 계층적 clustering",
    "비지도학습 사례",
    "Recall 계산",
    "회귀 문제",
    "Learning rate와 수렴",
    "상관관계와 다중공선성",
    "Precision 계산",
    "분류 문제",
    "비선형 activation function",
    "RLHF reinforcement learning",
    "RLHF training 절차",
    "Gradient descent update 방향",
    "One-hot encoding의 한계",
    "RNN recurrent 구조",
    "1×1 convolution 연산량",
    "CNN/FC parameter 계산",
    "Sentence embedding과 cosine similarity",
    "Text foundation model",
    "LLM Agent 특징",
    "Instruction tuning data",
    "1×1 convolution 특징",
    "Zero-shot CoT",
    "AI와 AI Agent 차이",
    "Quantization 특징",
    "Prompt 설계",
    "Knowledge distillation",
    "Multimodal video generation",
    "CBOW와 Skip-gram",
    "RNN vanishing gradient",
    "LSTM state 구조",
    "Pre-training과 fine-tuning",
    "Max pooling",
    "CNN receptive field",
    "Feature map memory",
    "Foundation model service 개발",
    "VLM training 절차",
    "Document-understanding VLM",
    "Small VLM",
    "RAG",
    "LLM-as-Judge 평가 bias",
    "Single-task fine-tuning",
    "선형회귀 계수 해석",
    "Tool learning",
    "Multi-agent system",
    "Fine-tuning과 instruction tuning",
    "RLHF training pipeline",
    "Few-shot CoT",
    "배포 환경별 model compression 전략",
    "Low-bit quantization",
    "Teacher-student knowledge distillation",
    "Model compression trade-off",
    "OOD와 adaptive sensing",
    "AI scaling과 Physical AI",
    "CNN inductive bias",
    "ViT positional embedding",
    "AI Agent operation",
    "Distribution shift",
    "AI Agent tool 사용",
    "Domain-specific AI"
  ];

  window.AIExamData = Object.freeze({
    version: 1,
    sections: Object.freeze(sections),
    references: Object.freeze(references),
    requiredTopics: Object.freeze(requiredTopics),
    questions: Object.freeze(questions)
  });
})();
