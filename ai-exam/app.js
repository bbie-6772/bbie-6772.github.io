(function () {
  "use strict";

  const data = window.AIExamData;
  const scoring = window.AIExamScoring;

  if (!data || !scoring) {
    throw new Error("시험 데이터 또는 채점 모듈을 불러오지 못했습니다.");
  }

  const { questions, sections, references, version } = data;
  const storageKey = `ai-engineering-exam:v${version}`;

  const elements = {
    answeredCount: document.getElementById("answered-count"),
    remainingCount: document.getElementById("remaining-count"),
    saveStatus: document.getElementById("save-status"),
    progressTrack: document.getElementById("progress-track"),
    progressBar: document.getElementById("progress-bar"),
    resultPanel: document.getElementById("result-panel"),
    totalScore: document.getElementById("total-score"),
    autoScore: document.getElementById("auto-score"),
    practicalScore: document.getElementById("practical-score"),
    unansweredScore: document.getElementById("unanswered-score"),
    sectionResults: document.getElementById("section-results"),
    resultNote: document.getElementById("result-note"),
    sectionFilter: document.getElementById("section-filter"),
    typeFilter: document.getElementById("type-filter"),
    statusFilter: document.getElementById("status-filter"),
    clearFiltersButton: document.getElementById("clear-filters-button"),
    questionGrid: document.getElementById("question-grid"),
    visibleCount: document.getElementById("visible-count"),
    wrongLegend: document.getElementById("wrong-legend"),
    questionContent: document.getElementById("question-content"),
    questionPanel: document.getElementById("question-panel"),
    previousButton: document.getElementById("previous-button"),
    nextButton: document.getElementById("next-button"),
    flagInput: document.getElementById("flag-input"),
    resetButton: document.getElementById("reset-button"),
    submitButton: document.getElementById("submit-button"),
    reviewWrongButton: document.getElementById("review-wrong-button")
  };

  function defaultState() {
    return {
      currentId: 1,
      answers: {},
      rubrics: {},
      flagged: {},
      submitted: false,
      filters: { section: "all", type: "all", status: "all" }
    };
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (!saved || typeof saved !== "object") return defaultState();

      return {
        ...defaultState(),
        ...saved,
        answers: saved.answers || {},
        rubrics: saved.rubrics || {},
        flagged: saved.flagged || {},
        filters: { ...defaultState().filters, ...(saved.filters || {}) }
      };
    } catch {
      return defaultState();
    }
  }

  let state = loadState();
  let saveMessageTimer;

  function saveState(message = "저장됨") {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
      elements.saveStatus.textContent = message;
      clearTimeout(saveMessageTimer);
      saveMessageTimer = setTimeout(() => {
        elements.saveStatus.textContent = "이 브라우저에 자동 저장 중";
      }, 1800);
    } catch {
      elements.saveStatus.textContent = "저장 공간을 사용할 수 없음";
    }
  }

  function create(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function formatScore(value) {
    return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  }

  function typeLabel(type) {
    return { mcq: "객관식", short: "단답형", practical: "실습형" }[type];
  }

  function getQuestion(id) {
    return questions.find((question) => question.id === Number(id));
  }

  function questionAnswered(question) {
    return scoring.isAnswered(question, state.answers[question.id]);
  }

  function currentResults() {
    return scoring.calculateResults(questions, state.answers, state.rubrics);
  }

  function filteredQuestions() {
    const results = state.submitted ? currentResults() : null;

    return questions.filter((question) => {
      if (state.filters.section !== "all" && question.section !== state.filters.section) return false;
      if (state.filters.type !== "all" && question.type !== state.filters.type) return false;

      const answered = questionAnswered(question);
      if (state.filters.status === "answered" && !answered) return false;
      if (state.filters.status === "unanswered" && answered) return false;
      if (state.filters.status === "flagged" && !state.flagged[question.id]) return false;
      if (
        state.filters.status === "wrong" &&
        (!state.submitted || !results.grades[question.id].answered || results.grades[question.id].score === 1)
      ) {
        return false;
      }

      return true;
    });
  }

  function ensureVisibleCurrent() {
    const visible = filteredQuestions();
    if (visible.length && !visible.some((question) => question.id === state.currentId)) {
      state.currentId = visible[0].id;
    }
    return visible;
  }

  function renderProgress() {
    const answered = questions.filter(questionAnswered).length;
    const percent = Math.round((answered / questions.length) * 100);
    elements.answeredCount.textContent = String(answered);
    elements.remainingCount.textContent = String(questions.length - answered);
    elements.progressBar.style.width = `${percent}%`;
    elements.progressTrack.setAttribute("aria-valuenow", String(percent));
  }

  function renderNavigator(visible = filteredQuestions()) {
    const results = state.submitted ? currentResults() : null;
    const fragment = document.createDocumentFragment();
    elements.questionGrid.replaceChildren();
    elements.visibleCount.textContent = `${visible.length}개 표시`;

    visible.forEach((question) => {
      const button = create("button", "question-number", String(question.id));
      button.type = "button";
      button.setAttribute("aria-label", `${question.id}번 ${questionAnswered(question) ? "응답 완료" : "미응답"}`);
      if (questionAnswered(question)) button.classList.add("is-answered");
      if (state.flagged[question.id]) button.classList.add("is-flagged");
      if (
        state.submitted &&
        results.grades[question.id].answered &&
        results.grades[question.id].score < 1
      ) {
        button.classList.add("is-wrong");
      }
      if (question.id === state.currentId) {
        button.classList.add("is-current");
        button.setAttribute("aria-current", "true");
      }
      button.addEventListener("click", () => navigateTo(question.id));
      fragment.appendChild(button);
    });

    elements.questionGrid.appendChild(fragment);
  }

  function appendMeta(container, question) {
    const number = create("span", "meta-chip meta-chip-primary", `${question.id} / ${questions.length}`);
    const section = create("span", "meta-chip", sections[question.section].label);
    const type = create("span", "meta-chip", typeLabel(question.type));
    const difficulty = create("span", "meta-chip", `난이도 ${question.difficulty}`);
    const topic = create("span", "meta-chip", question.topic);
    container.append(number, section, type, difficulty, topic);
  }

  function renderCodeBlock(text) {
    const pre = create("pre");
    const code = create("code", "", text);
    pre.appendChild(code);
    return pre;
  }

  function updateAnswer(question, value) {
    state.answers[question.id] = value;
    saveState();
    renderProgress();
    renderNavigator();
  }

  function renderMcqAnswer(container, question, grade) {
    const fieldset = create("fieldset", "answer-form");
    const legend = create("legend", "", "답을 하나 선택하세요.");
    const list = create("div", "choice-list");
    fieldset.append(legend, list);

    question.choices.forEach((choiceText, index) => {
      const label = create("label", "choice");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `question-${question.id}`;
      input.value = String(index);
      input.checked = state.answers[question.id] === index;
      input.disabled = state.submitted;
      input.addEventListener("change", () => updateAnswer(question, index));

      const choiceIndex = create("span", "choice-index", String.fromCharCode(65 + index));
      const choiceCopy = create("span", "", choiceText);
      label.append(input, choiceIndex, choiceCopy);

      if (state.submitted && index === question.answer) label.classList.add("is-correct");
      if (
        state.submitted &&
        grade.answered &&
        state.answers[question.id] === index &&
        index !== question.answer
      ) {
        label.classList.add("is-wrong");
      }

      list.appendChild(label);
    });

    container.appendChild(fieldset);
  }

  function renderShortAnswer(container, question) {
    const wrap = create("div", "short-answer-wrap");
    const label = create("label", "answer-label", "답을 입력하세요.");
    label.htmlFor = `short-answer-${question.id}`;
    const input = document.createElement("input");
    input.type = "text";
    input.id = `short-answer-${question.id}`;
    input.placeholder = question.placeholder || "답 입력";
    input.value = state.answers[question.id] || "";
    input.disabled = state.submitted;
    input.autocomplete = "off";
    input.addEventListener("input", () => updateAnswer(question, input.value));
    const hint = create("p", "short-answer-hint", "공백과 대소문자는 채점에 영향을 주지 않습니다.");
    wrap.append(label, input, hint);
    container.appendChild(wrap);
  }

  function renderPracticalAnswer(container, question) {
    const intro = create(
      "p",
      "practical-instructions",
      "Code 또는 설계 답안을 작성하세요. 제출 뒤 예시 답안과 rubric을 확인할 수 있습니다."
    );
    const label = create("label", "answer-label", "내 답안");
    label.htmlFor = `practical-answer-${question.id}`;
    const textarea = document.createElement("textarea");
    textarea.id = `practical-answer-${question.id}`;
    textarea.value = state.answers[question.id] || "";
    textarea.placeholder = "여기에 답안을 작성하세요.";
    textarea.disabled = state.submitted;
    textarea.spellcheck = false;
    textarea.addEventListener("input", () => updateAnswer(question, textarea.value));
    container.append(intro, label, textarea);
  }

  function appendReference(container, question) {
    const reference = references[question.reference];
    if (!reference) return;
    const link = create("a", "reference-link", `관련 학습 자료: ${reference.title} ↗`);
    link.href = reference.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    container.appendChild(link);
  }

  function renderAutoFeedback(container, question, grade) {
    const feedback = create("section", `feedback ${grade.correct ? "correct" : "incorrect"}`);
    let title;
    if (!grade.answered) title = "미응답입니다.";
    else title = grade.correct ? "정답입니다." : "다시 확인해 보세요.";
    feedback.appendChild(create("h3", "", title));

    const answer = question.type === "mcq"
      ? `${String.fromCharCode(65 + question.answer)}. ${question.choices[question.answer]}`
      : question.answerText;
    const correctAnswer = create("p", "correct-answer", `정답: ${answer}`);
    const explanation = create("p", "", question.explanation);
    feedback.append(correctAnswer, explanation);
    appendReference(feedback, question);
    container.appendChild(feedback);
  }

  function updateRubricStatus(question) {
    const checked = (state.rubrics[question.id] || []).filter(Boolean).length;
    const status = document.getElementById(`rubric-status-${question.id}`);
    if (status) status.textContent = `${checked} / ${question.rubric.length}개 충족`;
  }

  function renderPracticalFeedback(container, question, grade) {
    const feedback = create("section", "feedback");
    feedback.appendChild(create("h3", "", grade.answered ? "실습 답안을 비교해 보세요." : "답안을 작성하지 않았습니다."));
    feedback.appendChild(create("p", "", question.explanation));

    const rubric = create("div", "rubric");
    const heading = create("h3", "", "자기채점 rubric");
    const status = create("p", "", "");
    status.id = `rubric-status-${question.id}`;
    const list = create("div", "rubric-list");
    const checks = state.rubrics[question.id] || Array(question.rubric.length).fill(false);

    question.rubric.forEach((criterion, index) => {
      const label = create("label", "rubric-item");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = Boolean(checks[index]);
      input.disabled = !grade.answered;
      input.addEventListener("change", () => {
        const nextChecks = [...(state.rubrics[question.id] || Array(question.rubric.length).fill(false))];
        nextChecks[index] = input.checked;
        state.rubrics[question.id] = nextChecks;
        saveState("자기채점 저장됨");
        updateRubricStatus(question);
        renderResults();
        renderNavigator();
      });
      label.append(input, create("span", "", criterion));
      list.appendChild(label);
    });

    rubric.append(heading, status, list);

    const details = create("details", "model-answer");
    const summary = create("summary", "", "예시 답안 보기");
    details.append(summary, renderCodeBlock(question.modelAnswer));
    rubric.appendChild(details);
    appendReference(rubric, question);
    feedback.appendChild(rubric);
    container.appendChild(feedback);
    updateRubricStatus(question);
  }

  function renderQuestion(visible = filteredQuestions()) {
    elements.questionContent.replaceChildren();

    if (!visible.length) {
      const empty = create("div", "empty-state");
      const copy = create("div");
      copy.append(
        create("h2", "", "조건에 맞는 문항이 없습니다."),
        create("p", "", "필터를 해제하거나 다른 조건을 선택해 주세요.")
      );
      empty.appendChild(copy);
      elements.questionContent.appendChild(empty);
      elements.flagInput.checked = false;
      elements.flagInput.disabled = true;
      elements.previousButton.disabled = true;
      elements.nextButton.disabled = true;
      return;
    }

    const question = getQuestion(state.currentId) || visible[0];
    state.currentId = question.id;
    const grade = scoring.gradeQuestion(question, state.answers[question.id], state.rubrics[question.id]);

    const meta = create("div", "question-meta");
    appendMeta(meta, question);
    const title = create("h2", "question-title", question.prompt);
    title.id = `question-title-${question.id}`;
    elements.questionContent.append(meta, title);

    if (question.context) {
      elements.questionContent.appendChild(create("div", "question-context", question.context));
    }
    if (question.starter) {
      elements.questionContent.appendChild(renderCodeBlock(question.starter));
    }

    if (question.type === "mcq") renderMcqAnswer(elements.questionContent, question, grade);
    else if (question.type === "short") renderShortAnswer(elements.questionContent, question);
    else renderPracticalAnswer(elements.questionContent, question);

    if (state.submitted) {
      if (question.type === "practical") renderPracticalFeedback(elements.questionContent, question, grade);
      else renderAutoFeedback(elements.questionContent, question, grade);
    }

    const currentIndex = visible.findIndex((item) => item.id === question.id);
    elements.previousButton.disabled = currentIndex <= 0;
    elements.nextButton.disabled = currentIndex < 0 || currentIndex >= visible.length - 1;
    elements.flagInput.disabled = false;
    elements.flagInput.checked = Boolean(state.flagged[question.id]);
    elements.questionPanel.setAttribute("aria-labelledby", title.id);
  }

  function renderResults() {
    elements.resultPanel.hidden = !state.submitted;
    elements.wrongLegend.hidden = !state.submitted;
    const wrongOption = elements.statusFilter.querySelector('option[value="wrong"]');
    wrongOption.disabled = !state.submitted;
    elements.submitButton.textContent = state.submitted ? "결과 보기" : "답안 제출";

    if (!state.submitted) return;

    const results = currentResults();
    elements.totalScore.textContent = formatScore(results.totalScore);
    elements.autoScore.textContent = formatScore(results.autoScore);
    elements.practicalScore.textContent = formatScore(results.practicalScore);
    elements.unansweredScore.textContent = String(results.unanswered);
    elements.sectionResults.replaceChildren();

    Object.entries(sections).forEach(([key, section]) => {
      const value = results.bySection[key];
      const percent = value.maxScore ? Math.round((value.score / value.maxScore) * 100) : 0;
      const row = create("div", "section-result-row");
      const copy = create("div", "section-result-copy");
      copy.append(
        create("span", "", section.label),
        create("strong", "", `${formatScore(value.score)} / ${value.maxScore}`)
      );
      const track = create("div", "mini-track");
      const bar = create("span");
      bar.style.width = `${percent}%`;
      track.appendChild(bar);
      row.append(copy, track);
      elements.sectionResults.appendChild(row);
    });

    elements.resultNote.textContent =
      "실습형 12문항은 예시 답안과 rubric을 확인한 뒤 충족한 항목을 직접 체크하면 총점에 반영됩니다.";
  }

  function renderFilters() {
    elements.sectionFilter.value = state.filters.section;
    elements.typeFilter.value = state.filters.type;
    elements.statusFilter.value = state.filters.status;
  }

  function renderAll() {
    const visible = ensureVisibleCurrent();
    renderProgress();
    renderResults();
    renderFilters();
    renderNavigator(visible);
    renderQuestion(visible);
  }

  function navigateTo(id, shouldScroll = true) {
    state.currentId = Number(id);
    saveState("현재 위치 저장됨");
    const visible = filteredQuestions();
    renderNavigator(visible);
    renderQuestion(visible);
    if (shouldScroll && window.matchMedia("(max-width: 920px)").matches) {
      elements.questionPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function moveQuestion(offset) {
    const visible = filteredQuestions();
    const index = visible.findIndex((question) => question.id === state.currentId);
    const next = visible[index + offset];
    if (next) navigateTo(next.id);
  }

  function applyFilters() {
    state.filters = {
      section: elements.sectionFilter.value,
      type: elements.typeFilter.value,
      status: elements.statusFilter.value
    };
    const visible = ensureVisibleCurrent();
    saveState("필터 저장됨");
    renderNavigator(visible);
    renderQuestion(visible);
  }

  function initializeSectionFilter() {
    Object.entries(sections).forEach(([value, section]) => {
      const option = create("option", "", section.label);
      option.value = value;
      elements.sectionFilter.appendChild(option);
    });
  }

  function submitExam() {
    if (state.submitted) {
      elements.resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const unanswered = questions.filter((question) => !questionAnswered(question)).length;
    const message = unanswered
      ? `${unanswered}문항이 미응답입니다. 지금 제출할까요?`
      : "답안을 제출할까요? 제출 뒤에는 답을 수정할 수 없습니다.";
    if (!window.confirm(message)) return;

    state.submitted = true;
    saveState("채점 결과 저장됨");
    renderAll();
    elements.resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetExam() {
    if (!window.confirm("저장된 답안과 채점 결과를 모두 지우고 처음부터 시작할까요?")) return;
    localStorage.removeItem(storageKey);
    state = defaultState();
    renderAll();
    window.scrollTo({ top: 0, behavior: "smooth" });
    elements.saveStatus.textContent = "새 시험 시작";
  }

  function reviewWrongAnswers() {
    state.filters = { section: "all", type: "all", status: "wrong" };
    const visible = ensureVisibleCurrent();
    saveState("오답 필터 저장됨");
    renderFilters();
    renderNavigator(visible);
    renderQuestion(visible);
    elements.questionPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  initializeSectionFilter();

  elements.previousButton.addEventListener("click", () => moveQuestion(-1));
  elements.nextButton.addEventListener("click", () => moveQuestion(1));
  elements.flagInput.addEventListener("change", () => {
    state.flagged[state.currentId] = elements.flagInput.checked;
    saveState(elements.flagInput.checked ? "검토 문항으로 표시됨" : "검토 표시 해제됨");
    renderNavigator();
  });
  elements.sectionFilter.addEventListener("change", applyFilters);
  elements.typeFilter.addEventListener("change", applyFilters);
  elements.statusFilter.addEventListener("change", applyFilters);
  elements.clearFiltersButton.addEventListener("click", () => {
    state.filters = { section: "all", type: "all", status: "all" };
    renderFilters();
    const visible = ensureVisibleCurrent();
    saveState("필터 해제됨");
    renderNavigator(visible);
    renderQuestion(visible);
  });
  elements.submitButton.addEventListener("click", submitExam);
  elements.resetButton.addEventListener("click", resetExam);
  elements.reviewWrongButton.addEventListener("click", reviewWrongAnswers);

  renderAll();
  elements.saveStatus.textContent = localStorage.getItem(storageKey)
    ? "저장된 답안 불러옴"
    : "새 시험 시작";
})();
