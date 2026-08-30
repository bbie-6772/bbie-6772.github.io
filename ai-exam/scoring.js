(function (root) {
  "use strict";

  function normalize(value) {
    return String(value ?? "")
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[,“”‘’'"`]/g, "")
      .replace(/[()\[\]{}]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function compact(value) {
    return normalize(value)
      .replace(/[.,:;!?%]/g, "")
      .replace(/[→➡➜>-]/g, "")
      .replace(/[×*]/g, "x")
      .replace(/\s+/g, "");
  }

  function parseNumber(value) {
    const match = normalize(value).replace(/,/g, "").match(/[-+]?\d*\.?\d+(?:e[-+]?\d+)?/i);
    return match ? Number(match[0]) : Number.NaN;
  }

  function gradeNumeric(value, rule) {
    let actual = parseNumber(value);
    if (!Number.isFinite(actual)) return false;

    if (rule.percent && !String(value).includes("%") && Math.abs(actual) <= 1 && Math.abs(rule.value) > 1) {
      actual *= 100;
    }

    return Math.abs(actual - rule.value) <= (rule.tolerance ?? 0);
  }

  function includesKeywordGroup(answer, group) {
    const normalizedAnswer = compact(answer);
    return group.some((keyword) => normalizedAnswer.includes(compact(keyword)));
  }

  function includesOrderedKeywords(answer, groups) {
    const normalizedAnswer = compact(answer);
    let cursor = 0;

    return groups.every((group) => {
      const indexes = group
        .map((keyword) => normalizedAnswer.indexOf(compact(keyword), cursor))
        .filter((index) => index >= 0);

      if (!indexes.length) return false;
      const index = Math.min(...indexes);
      const matchedLength = Math.max(
        ...group
          .map((keyword) => compact(keyword))
          .filter((keyword) => normalizedAnswer.indexOf(keyword, cursor) === index)
          .map((keyword) => keyword.length)
      );
      cursor = index + matchedLength;
      return true;
    });
  }

  function gradeShort(question, value) {
    const rule = question.grading || {};
    if (!normalize(value)) return false;

    if (rule.numeric && gradeNumeric(value, rule.numeric)) return true;

    if (rule.accepted) {
      const actual = compact(value);
      if (rule.accepted.some((candidate) => actual === compact(candidate))) return true;
    }

    if (rule.keywordGroups && rule.keywordGroups.every((group) => includesKeywordGroup(value, group))) {
      return true;
    }

    if (rule.orderedKeywords && includesOrderedKeywords(value, rule.orderedKeywords)) {
      return true;
    }

    return false;
  }

  function isAnswered(question, value) {
    if (question.type === "mcq") return Number.isInteger(value);
    return normalize(value).length > 0;
  }

  function gradeQuestion(question, value, rubricChecks = []) {
    const answered = isAnswered(question, value);

    if (question.type === "mcq") {
      const correct = answered && value === question.answer;
      return { answered, correct, score: correct ? 1 : 0, maxScore: 1 };
    }

    if (question.type === "short") {
      const correct = answered && gradeShort(question, value);
      return { answered, correct, score: correct ? 1 : 0, maxScore: 1 };
    }

    const checked = Array.isArray(rubricChecks)
      ? rubricChecks.filter(Boolean).length
      : 0;
    const rubricLength = question.rubric.length;
    const score = answered && rubricLength ? checked / rubricLength : 0;
    return {
      answered,
      correct: answered && score === 1,
      score,
      maxScore: 1,
      rubricChecked: checked,
      rubricLength
    };
  }

  function roundScore(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  function calculateResults(questions, answers = {}, rubrics = {}) {
    const grades = {};
    const bySection = {};
    let autoScore = 0;
    let practicalScore = 0;
    let unanswered = 0;

    questions.forEach((question) => {
      const grade = gradeQuestion(question, answers[question.id], rubrics[question.id]);
      grades[question.id] = grade;

      if (!grade.answered) unanswered += 1;
      if (question.type === "practical") practicalScore += grade.score;
      else autoScore += grade.score;

      if (!bySection[question.section]) {
        bySection[question.section] = { score: 0, maxScore: 0, answered: 0 };
      }
      bySection[question.section].score += grade.score;
      bySection[question.section].maxScore += 1;
      if (grade.answered) bySection[question.section].answered += 1;
    });

    Object.values(bySection).forEach((section) => {
      section.score = roundScore(section.score);
    });

    autoScore = roundScore(autoScore);
    practicalScore = roundScore(practicalScore);

    return {
      grades,
      autoScore,
      practicalScore,
      totalScore: roundScore(autoScore + practicalScore),
      unanswered,
      bySection
    };
  }

  root.AIExamScoring = Object.freeze({
    normalize,
    compact,
    parseNumber,
    gradeShort,
    isAnswered,
    gradeQuestion,
    calculateResults,
    roundScore
  });
})(typeof window !== "undefined" ? window : globalThis);
