const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const window = {};
const context = { window };

vm.runInNewContext(
  fs.readFileSync('ai-exam/questions.js', 'utf8'),
  context,
  { filename: 'ai-exam/questions.js' }
);
vm.runInNewContext(
  fs.readFileSync('ai-exam/scoring.js', 'utf8'),
  context,
  { filename: 'ai-exam/scoring.js' }
);

const data = window.AIExamData;
const scoring = window.AIExamScoring;
const questions = Array.from(data.questions);

assert.equal(questions.length, 100, '문항 수는 정확히 100개여야 한다.');
assert.deepEqual(
  questions.map((question) => question.id),
  Array.from({ length: 100 }, (_, index) => index + 1),
  'ID는 1부터 100까지 중복 없이 이어져야 한다.'
);

const typeCounts = Object.fromEntries(
  Object.entries(Object.groupBy(questions, (question) => question.type))
    .map(([type, items]) => [type, items.length])
);
assert.deepEqual(typeCounts, { mcq: 70, short: 18, practical: 12 });

const answerPositionCounts = Object.values(
  Object.groupBy(questions.filter((question) => question.type === 'mcq'), (question) => question.answer)
).map((items) => items.length);
assert.ok(
  answerPositionCounts.every((count) => count >= 15 && count <= 20),
  `객관식 정답 위치가 치우쳤다: ${answerPositionCounts.join(', ')}`
);

const sectionCounts = Object.fromEntries(
  Object.entries(Object.groupBy(questions, (question) => question.section))
    .map(([section, items]) => [section, items.length])
);
assert.deepEqual(sectionCounts, {
  'ml-basics': 20,
  'deep-learning': 20,
  'nlp-llm': 20,
  'agents-rag': 16,
  'compression-deploy': 12,
  practical: 12
});

const coveredTopics = new Set(questions.map((question) => question.topic));
for (const topic of data.requiredTopics) {
  assert.ok(coveredTopics.has(topic), `필수 주제 누락: ${topic}`);
}

assert.equal(new Set(questions.map((question) => question.prompt)).size, 100, '문항 prompt는 중복되면 안 된다.');

for (const question of questions) {
  assert.ok(data.sections[question.section], `${question.id}: 알 수 없는 section`);
  assert.ok(['하', '중', '상'].includes(question.difficulty), `${question.id}: 잘못된 난이도`);
  assert.ok(question.prompt.length >= 10, `${question.id}: prompt가 너무 짧다.`);
  assert.ok(question.explanation.length >= 20, `${question.id}: 해설이 너무 짧다.`);
  assert.ok(data.references[question.reference], `${question.id}: reference가 없다.`);

  if (question.type === 'mcq') {
    assert.equal(question.choices.length, 4, `${question.id}: 객관식 선택지는 4개여야 한다.`);
    assert.equal(new Set(question.choices).size, 4, `${question.id}: 객관식 선택지가 중복됐다.`);
    assert.ok(Number.isInteger(question.answer), `${question.id}: 객관식 정답 index가 정수가 아니다.`);
    assert.ok(question.answer >= 0 && question.answer < 4, `${question.id}: 객관식 정답 index 범위 오류`);
  } else if (question.type === 'short') {
    assert.ok(question.answerText, `${question.id}: 단답형 표시 정답이 없다.`);
    assert.ok(
      question.grading && Object.keys(question.grading).length > 0,
      `${question.id}: 단답형 채점 규칙이 없다.`
    );
  } else if (question.type === 'practical') {
    assert.ok(question.rubric.length >= 3, `${question.id}: 실습 rubric이 부족하다.`);
    assert.ok(question.modelAnswer.length >= 80, `${question.id}: 실습 예시 답안이 너무 짧다.`);
  } else {
    assert.fail(`${question.id}: 알 수 없는 문항 유형 ${question.type}`);
  }
}

const byId = Object.fromEntries(questions.map((question) => [question.id, question]));

assert.equal(scoring.gradeQuestion(byId[1], byId[1].answer).score, 1);
assert.equal(scoring.gradeQuestion(byId[1], (byId[1].answer + 1) % 4).score, 0);
assert.equal(scoring.gradeShort(byId[10], '80%'), true);
assert.equal(scoring.gradeShort(byId[10], '0.8'), true);
assert.equal(scoring.gradeShort(byId[10], '70%'), false);
assert.equal(scoring.gradeShort(byId[2], '독립변수가 한 단위 증가할 때 종속변수 예측값이 2.5 증가한다'), true);
assert.equal(scoring.gradeShort(byId[17], 'negative gradient'), true);
assert.equal(scoring.gradeShort(byId[33], '5×5'), true);
assert.equal(scoring.gradeShort(byId[70], 'query embedding → 검색 → context 구성 → 답변 생성'), true);
assert.equal(scoring.gradeShort(byId[78], '3.5 GB'), true);

const practicalGrade = scoring.gradeQuestion(byId[89], '작성한 답안', [true, true, true, false]);
assert.equal(practicalGrade.answered, true);
assert.equal(practicalGrade.score, 0.75);

const results = scoring.calculateResults(
  questions,
  { 1: byId[1].answer, 2: 'x가 1 증가하면 y 예측값이 2.5 증가', 89: '실습 답안' },
  { 89: [true, true, false, false] }
);
assert.equal(results.autoScore, 2);
assert.equal(results.practicalScore, 0.5);
assert.equal(results.totalScore, 2.5);
assert.equal(results.unanswered, 97);

console.log('ai exam data and scoring: ok');
