document.addEventListener("DOMContentLoaded", () => {
  const quizList = document.getElementById("quizList");
  const quizSection = document.getElementById("quizSection");
  const emptySection = document.getElementById("emptySection");

  const tests = JSON.parse(localStorage.getItem("forms")) || [];
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const assignedTests = JSON.parse(localStorage.getItem("assignedTests")) || {};
  const testAttempts = JSON.parse(localStorage.getItem("testAttempts")) || [];
  
  const studentTestIds = currentUser ? (assignedTests[currentUser.id] || []) : [];
  
  const completedTestIds = currentUser 
    ? testAttempts
        .filter(attempt => attempt.userId === currentUser.id)
        .map(attempt => attempt.testId)
    : [];

  quizSection.classList.add("d-none");
  emptySection.classList.add("d-none");

  if (tests.length === 0) {
    emptySection.classList.remove("d-none");
    quizList.innerHTML = "";
  } else {
    quizSection.classList.remove("d-none");
    quizList.innerHTML = "";

    const availableTests = tests.filter(test => 
      studentTestIds.includes(test.formId) && test.formStatus
    );

    if (availableTests.length === 0) {
      emptySection.classList.remove("d-none");
      emptySection.innerHTML = `
        <div class="text-center py-5">
          <i class="bi bi-inbox" style="font-size: 4rem; color: #ccc;"></i>
          <h4 class="mt-3 text-muted">No Tests Assigned</h4>
          <p class="text-muted">You don't have any tests assigned yet. Please contact your administrator.</p>
        </div>
      `;
      return;
    }

    availableTests.forEach((test) => {
      const hasCompleted = completedTestIds.includes(test.formId);
      const card = document.createElement("div");
      card.className = "col-md-4 mb-3";

      let resultInfo = "";
      if (hasCompleted) {
        const attempt = testAttempts.find(
          a => a.userId === currentUser.id && a.testId === test.formId
        );
        if (attempt) {
          const percentage = Math.round((attempt.score / attempt.total) * 100);
          resultInfo = `
            <div class="alert alert-info mb-2">
              <small><strong>Your Score:</strong> ${attempt.score}/${attempt.total} (${percentage}%)</small>
            </div>
          `;
        }
      }

      card.innerHTML = `
        <div class="card shadow-sm p-3 h-100">
          <h5>${test.formTitle}</h5>
          <p class="text-muted">${test.formDesc}</p>
          <p class="text-muted small">Questions: ${test.numberOfQuestions}</p>
          <p class="text-muted small">Created: ${
            test?.formDate ?? "Not Set"
          }</p>
          ${resultInfo}
          ${
            hasCompleted
              ? `<button class="btn btn-secondary w-100" disabled>
                  <i class="bi bi-check-circle me-2"></i>Completed
                </button>`
              : `<button class="btn btn-primary w-100" onclick="startQuiz(${
                  test.formId
                })">
                  <i class="bi bi-play-circle me-2"></i>Start Quiz
                </button>`
          }
        </div>
      `;

      quizList.appendChild(card);
    });
  }
});

function startQuiz(id) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Please log in to take the quiz.",
      confirmButtonColor: "#dc3545",
    }).then(() => {
      window.location.href = "login.html";
    });
    return;
  }

  const testAttempts = JSON.parse(localStorage.getItem("testAttempts")) || [];
  const hasCompleted = testAttempts.some(
    attempt => attempt.userId === currentUser.id && attempt.testId === Number(id)
  );

  if (hasCompleted) {
    Swal.fire({
      icon: "warning",
      title: "Already Completed",
      text: "You have already taken this quiz. You can only take it once.",
      confirmButtonColor: "#ffc107",
    });
    return;
  }

  const assignedTests = JSON.parse(localStorage.getItem("assignedTests")) || {};
  const studentTestIds = assignedTests[currentUser.id] || [];
  
  if (!studentTestIds.includes(Number(id))) {
    Swal.fire({
      icon: "error",
      title: "Access Denied",
      text: "This quiz is not assigned to you.",
      confirmButtonColor: "#dc3545",
    });
    return;
  }

  localStorage.setItem("userAnswers", JSON.stringify([]));
  localStorage.setItem("currentQuiz", id);
  window.location.href = "quiz-page.html";
}

