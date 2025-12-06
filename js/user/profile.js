document.addEventListener("DOMContentLoaded", function() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  
  if (!currentUser) {
    Swal.fire({
      icon: "error",
      title: "Access Denied",
      text: "Please log in to view your profile.",
      confirmButtonColor: "#dc3545",
    }).then(() => {
      window.location.href = "login.html";
    });
    return;
  }

  loadProfileData(currentUser);
  loadCompletedTests(currentUser);
  loadPendingTests(currentUser);
});

function loadProfileData(user) {
  document.getElementById("profileName").textContent = user.fullName || user.email || "User";
  document.getElementById("profileEmail").textContent = user.email || "N/A";
  
  document.getElementById("infoFullName").textContent = user.fullName || "Not set";
  document.getElementById("infoEmail").textContent = user.email || "N/A";
  document.getElementById("infoRole").textContent = user.role === "admin" ? "Administrator" : "Student";
  document.getElementById("infoCreatedAt").textContent = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString() 
    : "N/A";

  const allForms = JSON.parse(localStorage.getItem("forms")) || [];
  const assignedTests = JSON.parse(localStorage.getItem("assignedTests")) || {};
  const testAttempts = JSON.parse(localStorage.getItem("testAttempts")) || [];
  
  const studentTestIds = assignedTests[user.id] || [];
  const availableTests = allForms.filter(f => 
    studentTestIds.includes(f.formId) && f.formStatus
  );
  
  const completedTestIds = testAttempts
    .filter(attempt => attempt.userId === user.id)
    .map(attempt => attempt.testId);
  
  const completedTests = availableTests.filter(test => 
    completedTestIds.includes(test.formId)
  );
  
  const pendingTests = availableTests.filter(test => 
    !completedTestIds.includes(test.formId)
  );

  const userAttempts = testAttempts.filter(attempt => attempt.userId === user.id);
  let totalScore = 0;
  let totalPossible = 0;
  
  userAttempts.forEach(attempt => {
    totalScore += attempt.score;
    totalPossible += attempt.total;
  });
  
  const averageScore = totalPossible > 0 
    ? Math.round((totalScore / totalPossible) * 100) 
    : 0;

  document.getElementById("totalTests").textContent = availableTests.length;
  document.getElementById("completedTests").textContent = completedTests.length;
  document.getElementById("pendingTests").textContent = pendingTests.length;
  document.getElementById("averageScore").textContent = averageScore + "%";
}

function loadCompletedTests(user) {
  const allForms = JSON.parse(localStorage.getItem("forms")) || [];
  const assignedTests = JSON.parse(localStorage.getItem("assignedTests")) || {};
  const testAttempts = JSON.parse(localStorage.getItem("testAttempts")) || [];
  
  const studentTestIds = assignedTests[user.id] || [];
  const completedTestIds = testAttempts
    .filter(attempt => attempt.userId === user.id)
    .map(attempt => attempt.testId);
  
  const completedTests = allForms.filter(test => 
    studentTestIds.includes(test.formId) && 
    completedTestIds.includes(test.formId) &&
    test.formStatus
  );

  const completedTestsList = document.getElementById("completedTestsList");
  
  if (completedTests.length === 0) {
    completedTestsList.innerHTML = `
      <div class="text-center text-muted py-5">
        <i class="bi bi-inbox" style="font-size: 4rem;"></i>
        <h5 class="mt-3">No Completed Tests</h5>
        <p>You haven't completed any tests yet.</p>
      </div>
    `;
    return;
  }

  const testAttemptsMap = {};
  testAttempts
    .filter(attempt => attempt.userId === user.id)
    .forEach(attempt => {
      if (!testAttemptsMap[attempt.testId] || 
          new Date(attempt.completedAt) > new Date(testAttemptsMap[attempt.testId].completedAt)) {
        testAttemptsMap[attempt.testId] = attempt;
      }
    });

  let html = '<div class="row g-3">';
  
  completedTests.forEach(test => {
    const attempt = testAttemptsMap[test.formId];
    const percentage = attempt ? Math.round((attempt.score / attempt.total) * 100) : 0;
    const scoreClass = percentage >= 75 ? "success" : percentage >= 50 ? "warning" : "danger";
    const scoreIcon = percentage >= 75 ? "bi-trophy-fill" : percentage >= 50 ? "bi-check-circle" : "bi-x-circle";
    
    html += `
      <div class="col-md-6 col-lg-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h6 class="fw-bold mb-0">${test.formTitle}</h6>
              <span class="badge bg-${scoreClass}">
                <i class="bi ${scoreIcon} me-1"></i>${percentage}%
              </span>
            </div>
            <p class="text-muted small mb-2">${test.formDesc || "No description"}</p>
            <div class="mb-2">
              <small class="text-muted">
                <i class="bi bi-question-circle me-1"></i>${test.numberOfQuestions} Questions
              </small>
            </div>
            <div class="mb-2">
              <small class="text-muted">
                <i class="bi bi-calendar me-1"></i>
                ${attempt ? new Date(attempt.completedAt).toLocaleDateString() : "N/A"}
              </small>
            </div>
            <div class="mt-3">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <small class="text-muted">Score</small>
                <small class="fw-bold">${attempt ? attempt.score + "/" + attempt.total : "N/A"}</small>
              </div>
              <div class="progress" style="height: 8px;">
                <div class="progress-bar bg-${scoreClass}" role="progressbar" 
                     style="width: ${percentage}%"></div>
              </div>
            </div>
            <button class="btn btn-sm btn-outline-primary w-100 mt-3" 
                    onclick="viewTestDetails(${test.formId}, ${user.id})">
              <i class="bi bi-eye me-1"></i>View Details
            </button>
          </div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  completedTestsList.innerHTML = html;
}

function loadPendingTests(user) {
  const allForms = JSON.parse(localStorage.getItem("forms")) || [];
  const assignedTests = JSON.parse(localStorage.getItem("assignedTests")) || {};
  const testAttempts = JSON.parse(localStorage.getItem("testAttempts")) || [];
  
  const studentTestIds = assignedTests[user.id] || [];
  const completedTestIds = testAttempts
    .filter(attempt => attempt.userId === user.id)
    .map(attempt => attempt.testId);
  
  const pendingTests = allForms.filter(test => 
    studentTestIds.includes(test.formId) && 
    !completedTestIds.includes(test.formId) &&
    test.formStatus
  );

  const pendingTestsList = document.getElementById("pendingTestsList");
  
  if (pendingTests.length === 0) {
    pendingTestsList.innerHTML = `
      <div class="text-center text-muted py-5">
        <i class="bi bi-check-all" style="font-size: 4rem;"></i>
        <h5 class="mt-3">All Tests Completed!</h5>
        <p>Great job! You have completed all assigned tests.</p>
      </div>
    `;
    return;
  }

  let html = '<div class="row g-3">';
  
  pendingTests.forEach(test => {
    html += `
      <div class="col-md-6 col-lg-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h6 class="fw-bold mb-0">${test.formTitle}</h6>
              <span class="badge bg-warning">
                <i class="bi bi-clock me-1"></i>Pending
              </span>
            </div>
            <p class="text-muted small mb-2">${test.formDesc || "No description"}</p>
            <div class="mb-2">
              <small class="text-muted">
                <i class="bi bi-question-circle me-1"></i>${test.numberOfQuestions} Questions
              </small>
            </div>
            <div class="mb-2">
              <small class="text-muted">
                <i class="bi bi-calendar me-1"></i>Created: ${test.formDate || "N/A"}
              </small>
            </div>
            <button class="btn btn-primary w-100 mt-3" 
                    onclick="startQuiz(${test.formId})">
              <i class="bi bi-play-circle me-1"></i>Start Quiz
            </button>
          </div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  pendingTestsList.innerHTML = html;
}

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

  localStorage.setItem("userAnswers", JSON.stringify([]));
  localStorage.setItem("currentQuiz", id);
  window.location.href = "quiz-page.html";
}

function viewTestDetails(testId, userId) {
  const testAttempts = JSON.parse(localStorage.getItem("testAttempts")) || [];
  const attempts = testAttempts.filter(
    a => a.userId === userId && a.testId === testId
  );
  
  if (attempts.length === 0) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Test attempt not found!",
      confirmButtonColor: "#dc3545",
    });
    return;
  }
  
  const attempt = attempts.reduce((latest, current) => {
    return new Date(current.completedAt) > new Date(latest.completedAt) ? current : latest;
  });
  
  const percentage = Math.round((attempt.score / attempt.total) * 100);
  
  let answersTable = "";
  if (attempt.answerDetails && attempt.answerDetails.length > 0) {
    answersTable = attempt.answerDetails
      .map((detail, index) => {
        const statusClass = detail.isCorrect ? "success" : "danger";
        const statusIcon = detail.isCorrect ? "bi-check-circle-fill" : "bi-x-circle-fill";
        const statusText = detail.isCorrect ? "Correct" : "Incorrect";
        
        return `
          <tr class="table-${statusClass}">
            <td><strong>Q${index + 1}:</strong> ${detail.questionTitle}</td>
            <td>${detail.userAnswer}</td>
            <td>${detail.correctAnswer}</td>
            <td>
              <span class="badge bg-${statusClass}">
                <i class="bi ${statusIcon} me-1"></i>${statusText}
              </span>
            </td>
          </tr>
        `;
      })
      .join("");
  } else {
    answersTable = `
      <tr>
        <td colspan="4" class="text-center text-muted">
          Answer details not available for this attempt.
        </td>
      </tr>
    `;
  }
  
  Swal.fire({
    title: `Test Results: ${attempt.testTitle}`,
    html: `
      <div class="text-start">
        <div class="mb-3 p-3 bg-light rounded">
          <h6 class="fw-bold mb-2">Test Information</h6>
          <p class="mb-1"><strong>Score:</strong> <span class="badge bg-primary">${attempt.score}/${attempt.total} (${percentage}%)</span></p>
          <p class="mb-0"><strong>Completed:</strong> ${new Date(attempt.completedAt).toLocaleString()}</p>
        </div>
        
        <h6 class="fw-bold mb-2">Answer Details</h6>
        <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
          <table class="table table-sm table-hover">
            <thead class="table-light sticky-top">
              <tr>
                <th>Question</th>
                <th>Your Answer</th>
                <th>Correct Answer</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${answersTable}
            </tbody>
          </table>
        </div>
      </div>
    `,
    width: "900px",
    confirmButtonText: "Close",
    confirmButtonColor: "#3085d6",
  });
}

