document.addEventListener("DOMContentLoaded", function() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  
  if (!currentUser || currentUser.role !== "admin") {
    Swal.fire({
      icon: "error",
      title: "Access Denied",
      text: "Only administrators can access this page.",
      confirmButtonColor: "#dc3545",
    }).then(() => {
      window.location.href = "login.html";
    });
    return;
  }

  loadProfileData(currentUser);
  loadAllTests();
  loadAllStudents();
});

function loadProfileData(user) {
  document.getElementById("profileName").textContent = user.fullName || user.email || "Admin";
  document.getElementById("profileEmail").textContent = user.email || "N/A";
  
  document.getElementById("infoFullName").textContent = user.fullName || "Not set";
  document.getElementById("infoEmail").textContent = user.email || "N/A";
  document.getElementById("infoCreatedAt").textContent = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString() 
    : "N/A";

  const allForms = JSON.parse(localStorage.getItem("forms")) || [];
  const allUsers = JSON.parse(localStorage.getItem("users")) || [];
  const students = allUsers.filter(u => u.role === "student");
  
  const activeTests = allForms.filter(f => f.formStatus);
  let totalQuestions = 0;
  allForms.forEach(form => {
    totalQuestions += form.numberOfQuestions || 0;
  });

  document.getElementById("totalTests").textContent = allForms.length;
  document.getElementById("activeTests").textContent = activeTests.length;
  document.getElementById("totalStudents").textContent = students.length;
  document.getElementById("totalQuestions").textContent = totalQuestions;
}

function loadAllTests() {
  const allForms = JSON.parse(localStorage.getItem("forms")) || [];
  const testAttempts = JSON.parse(localStorage.getItem("testAttempts")) || [];

  const allTestsList = document.getElementById("allTestsList");
  
  if (allForms.length === 0) {
    allTestsList.innerHTML = `
      <div class="text-center text-muted py-5">
        <i class="bi bi-inbox" style="font-size: 4rem;"></i>
        <h5 class="mt-3">No Tests Created</h5>
        <p>You haven't created any tests yet.</p>
        <a href="form-creation.html" class="btn btn-primary mt-3">
          <i class="bi bi-plus-circle me-2"></i>Create First Test
        </a>
      </div>
    `;
    return;
  }

  let html = '<div class="table-responsive"><table class="table table-hover align-middle">';
  html += `
    <thead class="table-light">
      <tr>
        <th>ID</th>
        <th>Title</th>
        <th>Questions</th>
        <th>Status</th>
        <th>Date</th>
        <th>Completed By</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
  `;
  
  allForms.forEach((test, index) => {
    const completedCount = testAttempts.filter(a => a.testId === test.formId).length;
    const uniqueUsers = [...new Set(testAttempts.filter(a => a.testId === test.formId).map(a => a.userId))].length;
    
    html += `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${test.formTitle}</strong></td>
        <td><span class="badge bg-info">${test.numberOfQuestions}</span></td>
        <td>
          <span class="badge ${test.formStatus ? 'bg-success' : 'bg-secondary'}">
            <i class="bi ${test.formStatus ? 'bi-check-circle' : 'bi-pause-circle'} me-1"></i>
            ${test.formStatus ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td>${test.formDate || 'N/A'}</td>
        <td>
          <span class="badge bg-primary">${uniqueUsers} User(s)</span>
        </td>
        <td>
          <div class="btn-group btn-group-sm" role="group">
            <a href="admin-dashboard.html" class="btn btn-outline-primary" title="Go to Dashboard">
              <i class="bi bi-speedometer2"></i>
            </a>
            <button class="btn btn-outline-info" onclick="viewTestDetails(${test.formId})" title="View Details">
              <i class="bi bi-eye"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });
  
  html += '</tbody></table></div>';
  allTestsList.innerHTML = html;
}

function loadAllStudents() {
  const allUsers = JSON.parse(localStorage.getItem("users")) || [];
  const students = allUsers.filter(u => u.role === "student");
  const testAttempts = JSON.parse(localStorage.getItem("testAttempts")) || [];
  const assignedTests = JSON.parse(localStorage.getItem("assignedTests")) || {};

  const studentsList = document.getElementById("studentsList");
  
  if (students.length === 0) {
    studentsList.innerHTML = `
      <div class="text-center text-muted py-5">
        <i class="bi bi-inbox" style="font-size: 4rem;"></i>
        <h5 class="mt-3">No Students Registered</h5>
        <p>No students have registered yet.</p>
      </div>
    `;
    return;
  }

  let html = '<div class="table-responsive"><table class="table table-hover align-middle">';
  html += `
    <thead class="table-light">
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Email</th>
        <th>Assigned Tests</th>
        <th>Completed Tests</th>
        <th>Average Score</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
  `;
  
  students.forEach((student, index) => {
    const studentTestIds = assignedTests[student.id] || [];
    const studentAttempts = testAttempts.filter(a => a.userId === student.id);
    const completedTestIds = [...new Set(studentAttempts.map(a => a.testId))];
    
    let totalScore = 0;
    let totalPossible = 0;
    studentAttempts.forEach(attempt => {
      totalScore += attempt.score;
      totalPossible += attempt.total;
    });
    const averageScore = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
    const scoreClass = averageScore >= 75 ? "success" : averageScore >= 50 ? "warning" : "danger";
    
    html += `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${student.fullName || 'N/A'}</strong></td>
        <td>${student.email}</td>
        <td><span class="badge bg-info">${studentTestIds.length}</span></td>
        <td><span class="badge bg-success">${completedTestIds.length}</span></td>
        <td>
          <span class="badge bg-${scoreClass}">${averageScore}%</span>
        </td>
        <td>
          <div class="btn-group btn-group-sm" role="group">
            <a href="admin-dashboard.html" class="btn btn-outline-primary" title="Go to Dashboard">
              <i class="bi bi-speedometer2"></i>
            </a>
            <button class="btn btn-outline-info" onclick="viewStudentDetails(${student.id})" title="View Details">
              <i class="bi bi-eye"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });
  
  html += '</tbody></table></div>';
  studentsList.innerHTML = html;
}

function viewTestDetails(testId) {
  window.location.href = `admin-dashboard.html`;
}

function viewStudentDetails(studentId) {
  window.location.href = `admin-dashboard.html`;
}

