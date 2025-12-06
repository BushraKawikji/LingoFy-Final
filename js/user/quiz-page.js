document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    Swal.fire({
      icon: "error",
      title: "Access Denied",
      text: "Please log in to take the quiz.",
      confirmButtonColor: "#dc3545",
    }).then(() => {
      window.location.href = "login.html";
    });
    return;
  }

  const quizIdRaw = localStorage.getItem("currentQuiz");
  const quizId = Number(quizIdRaw);
  const allForms = JSON.parse(localStorage.getItem("forms")) || [];
  const quizData = allForms.find((f) => f.formId === quizId);

  console.log("currentQuiz:", quizIdRaw, "→ as number:", quizId);
  console.log("quizData:", quizData);

  if (!quizData || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No quiz data found. Please start the quiz from the dashboard.",
      confirmButtonColor: "#dc3545",
    }).then(() => {
      window.location.href = "user-dashboard.html";
    });
    return;
  }

  const testAttempts = JSON.parse(localStorage.getItem("testAttempts")) || [];
  const hasCompleted = testAttempts.some(
    attempt => attempt.userId === currentUser.id && attempt.testId === quizId
  );

  if (hasCompleted) {
    Swal.fire({
      icon: "warning",
      title: "Already Completed",
      text: "You have already taken this quiz. You can only take it once.",
      confirmButtonColor: "#ffc107",
    }).then(() => {
      window.location.href = "user-dashboard.html";
    });
    return;
  }

  const assignedTests = JSON.parse(localStorage.getItem("assignedTests")) || {};
  const studentTestIds = assignedTests[currentUser.id] || [];
  
  if (!studentTestIds.includes(quizId)) {
    Swal.fire({
      icon: "error",
      title: "Access Denied",
      text: "This quiz is not assigned to you.",
      confirmButtonColor: "#dc3545",
    }).then(() => {
      window.location.href = "user-dashboard.html";
    });
    return;
  }

  let currentIndex = 0;
  let userAnswers = JSON.parse(localStorage.getItem("userAnswers")) || [];

  const questionText = document.getElementById("questionText");
  const radioOptionsContainer = document.getElementById("radioOptionsContainer");
  const selectContainer = document.getElementById("selectContainer");
  const selectAnswer = document.getElementById("selectAnswer");
  const shortAnswerContainer = document.getElementById("shortAnswerContainer");
  const shortAnswerInput = document.getElementById("shortAnswerInput");

  const questionNumberBadge = document.getElementById("questionNumber");
  const requiredBadge = document.getElementById("requiredBadge");

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const submitBtn = document.getElementById("submitBtn");

  const currentQuestionSpan = document.getElementById("currentQuestion");
  const totalQuestionsSpan = document.getElementById("totalQuestions");
  const progressBar = document.getElementById("progressBar");
  const progressPercent = document.getElementById("progressPercent");

  function loadQuestion() {
    const q = quizData.questions[currentIndex];
    console.log("Loading question:", currentIndex, q);

    if (questionText) questionText.textContent = q.questionTitle || "";
    if (questionNumberBadge) questionNumberBadge.textContent = `Q${currentIndex + 1}`;
    if (requiredBadge) requiredBadge.classList.toggle("d-none", !q.isRequired);

    const total = quizData.questions.length;
    if (currentQuestionSpan) currentQuestionSpan.textContent = currentIndex + 1;
    if (totalQuestionsSpan) totalQuestionsSpan.textContent = total;

    const percent = Math.round(((currentIndex + 1) / total) * 100);
    if (progressBar) progressBar.style.width = percent + "%";
    if (progressPercent) progressPercent.textContent = percent;

    if (radioOptionsContainer) {
      radioOptionsContainer.innerHTML = "";
      radioOptionsContainer.classList.add("d-none");
    }
    if (selectAnswer) {
      selectAnswer.innerHTML = '<option value="">Choose an option</option>';
    }
    if (selectContainer) selectContainer.classList.add("d-none");
    if (shortAnswerInput) shortAnswerInput.value = "";
    if (shortAnswerContainer) shortAnswerContainer.classList.add("d-none");

    const type = (q.questionType || "").toLowerCase();

    if ((type === "multiplechoice" || type === "radio") && radioOptionsContainer) {
      radioOptionsContainer.classList.remove("d-none");

      (q.options || []).forEach((opt, i) => {
        const value = opt.optionContent ?? "";
        const isChecked = userAnswers[currentIndex] === value ? "checked" : "";

        radioOptionsContainer.innerHTML += `
          <div class="form-check mb-2">
            <input
              class="form-check-input"
              type="radio"
              name="radioAnswer"
              id="radio${i}"
              value="${value.replace(/"/g, "&quot;")}"
              ${isChecked}
            >
            <label class="form-check-label" for="radio${i}">
              ${value}
            </label>
          </div>
        `;
      });

    } else if (type === "select" && selectContainer && selectAnswer) {
      selectContainer.classList.remove("d-none");

      (q.options || []).forEach((opt) => {
        const value = opt.optionContent ?? "";
        const isSelected = userAnswers[currentIndex] === value ? "selected" : "";

        selectAnswer.innerHTML += `
          <option value="${value.replace(/"/g, "&quot;")}" ${isSelected}>
            ${value}
          </option>
        `;
      });

    } else if (
      type === "shortanswer" ||
      type === "short" ||
      type === "short_answer" ||
      type === "text"
    ) {
      if (shortAnswerContainer && shortAnswerInput) {
        shortAnswerContainer.classList.remove("d-none");
        shortAnswerInput.value = userAnswers[currentIndex] || "";
      }
    }

    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn && submitBtn) {
      const isLast = currentIndex === total - 1;
      nextBtn.classList.toggle("d-none", isLast);
      submitBtn.classList.toggle("d-none", !isLast);
    }
  }

  function saveAnswer() {
    const q = quizData.questions[currentIndex];
    const type = (q.questionType || "").toLowerCase();
    let answer = "";

    if (type === "multiplechoice" || type === "radio") {
      const selectedRadio = document.querySelector(
        "input[name='radioAnswer']:checked"
      );
      answer = selectedRadio ? selectedRadio.value : "";
    } else if (type === "select" && selectAnswer) {
      answer = selectAnswer.value || "";
    } else if (
      (type === "shortanswer" ||
        type === "short" ||
        type === "short_answer" ||
        type === "text") &&
      shortAnswerInput
    ) {
      answer = shortAnswerInput.value.trim();
    }

    userAnswers[currentIndex] = answer;
    localStorage.setItem("userAnswers", JSON.stringify(userAnswers));
    console.log("Saved answer", currentIndex, "→", answer);
  }

  function goNext() {
    saveAnswer();
    if (currentIndex < quizData.questions.length - 1) {
      currentIndex++;
      loadQuestion();
    }
  }

  function goPrev() {
    saveAnswer();
    if (currentIndex > 0) {
      currentIndex--;
      loadQuestion();
    }
  }

  function submitTest() {
    console.log("submitTest CALLED");
    saveAnswer();

    let score = 0;
    let totalGradable = 0;

    quizData.questions.forEach((q, i) => {
      const type = (q.questionType || "").toLowerCase();
      const raw = userAnswers[i] || "";
      const userAns = raw.trim().toLowerCase();

      if (
        type === "shortanswer" ||
        type === "short" ||
        type === "short_answer" ||
        type === "text"
      ) {
        if (q.correctAnswer && q.correctAnswer.trim() !== "") {
          totalGradable++;
          const correct = q.correctAnswer.trim().toLowerCase();
          if (userAns === correct) score++;
        }
        return;
      }

      const correctOpt = q.options?.find((opt) => opt.isCorrect);
      if (!correctOpt) return;

      totalGradable++;

      const correctValue = (correctOpt.optionContent || "")
        .trim()
        .toLowerCase();

      if (userAns === correctValue) {
        score++;
      }
    });

    if (totalGradable === 0) {
      totalGradable = quizData.questions.length;
    }

    const resultObj = {
      score,
      total: totalGradable,
      allQuestions: quizData.questions.length,
    };

    console.log("Saving lastScore:", resultObj);
    localStorage.setItem("lastScore", JSON.stringify(resultObj));

    window.location.href = "../html/score.html";
  }

  loadQuestion();

  if (prevBtn) {
    prevBtn.addEventListener("click", (e) => {
      e.preventDefault();
      goPrev();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      goNext();
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener("click", (e) => {
      e.preventDefault();
      submitTest();
    });
  }
});

