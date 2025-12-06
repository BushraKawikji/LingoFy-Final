let formObj = JSON.parse(localStorage.getItem("forms")) || [];

const activeTestsCard = document.getElementById("activeTestsCard");
const totalQuestionsCard = document.getElementById("totalQuestionsCard");
const studentsCard = document.getElementById("studentsCard");

const users = JSON.parse(localStorage.getItem("users")) || [];

let activeTestsCounter = 0;
let numOfStudentsCounter = 0;
let totalQuestionsCounter = 0;

function updateCounters() {
  formObj = JSON.parse(localStorage.getItem("forms")) || [];
  const users = JSON.parse(localStorage.getItem("users")) || [];
  
  activeTestsCounter = 0;
  totalQuestionsCounter = 0;
  numOfStudentsCounter = 0;
  
  formObj.forEach((form) => {
    if (form.formStatus) {
      activeTestsCounter++;
      totalQuestionsCounter += form.numberOfQuestions;
    }
  });
  
  users.forEach((user) => {
    if (user.role === "student") {
      numOfStudentsCounter++;
    }
  });
  
  if (activeTestsCard) activeTestsCard.innerHTML = activeTestsCounter;
  if (totalQuestionsCard) totalQuestionsCard.innerHTML = totalQuestionsCounter;
  if (studentsCard) studentsCard.innerHTML = numOfStudentsCounter;
}

updateCounters();

function getCurrentUser() {
  const currentUser = localStorage.getItem("currentUser");
  if (currentUser) {
    return JSON.parse(currentUser);
  }
  return null;
}

function displayUserName() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", displayUserName);
    return;
  }

  const userNameDisplay = document.getElementById("userNameDisplay");
  if (!userNameDisplay) {
    setTimeout(displayUserName, 100);
    return;
  }

  const currentUser = getCurrentUser();

  if (currentUser) {
    const displayName =
      currentUser.fullName ||
      currentUser.email ||
      currentUser.username ||
      "User";
    userNameDisplay.textContent = displayName;

    const dropdownToggle = document.querySelector(".dropdown-toggle");
    if (dropdownToggle) {
      dropdownToggle.innerHTML = `<i class="bi bi-person-circle me-2"></i>${displayName}      `;
    }
  } else {
    window.location.href = "../html/login.html";
  }
}

function updateUserDisplay() {
  const currentUser = getCurrentUser();

  if (currentUser) {
    displayUserName();
  } else {
    window.location.href = "../html/login.html";
  }
}

window.addEventListener("storage", function (e) {
  if (e.key === "currentUser") {
    displayUserName();
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const currentUser = getCurrentUser();

  if (currentUser) {
    displayUserName();
  } else {
    window.location.href = "../html/login.html";
  }
});

function formStatus(status) {
  if (status) {
    return `
            <span class="badge bg-success">
                <i class="bi bi-check-circle me-1"></i>Active
            </span>
        `;
  }
  return `
            <span class="badge bg-secondary d-inline-flex align-items-center">
                <i class="bi bi-x-circle me-1"></i>Inactive
            </span>
        `;
}

function editForm(formId) {
  const formToEdit = formObj.find((form) => form.formId === formId);

  if (!formToEdit) {
    Swal.fire({
      title: "Error!",
      text: "Form not found!",
      icon: "error",
      confirmButtonColor: "#dc3545",
    });
    return;
  }

  localStorage.setItem("editingForm", JSON.stringify(formToEdit));

  window.location.href = "../html/form-creation.html";
}

function activate_deactivate_Btn(id) {
  for (let i = 0; i < formObj.length; i++) {
    if (formObj[i].formId === id) {
      formObj[i].formStatus = !formObj[i].formStatus;
      break;
    }
  }
  localStorage.setItem("forms", JSON.stringify(formObj));
  location.reload();
}

function confirmDelete(deleteId) {
  Swal.fire({
    title: "Are you sure?",
    text: "This form will be permanently deleted!",
    icon: "warning",
    confirmButtonText: "Delete",
    confirmButtonColor: "#dc3545",
    showCancelButton: true,
    cancelButtonColor: "#6c757d",
    cancelButtonText: "Cancel",
  }).then((result) => {
    if (result.isConfirmed) {
      for (let i = 0; i < formObj.length; i++) {
        if (formObj[i].formId === deleteId) {
          formObj.splice(i, 1);
          break;
        }
      }
      localStorage.setItem("forms", JSON.stringify(formObj));
      location.reload();
    }
  });
}

window.onload = function () {
  updateCounters();
  
  const formsTable = document.getElementById("formsTable");
  if (!formsTable) {
    setTimeout(function () {
      if (document.getElementById("formsTable")) {
        renderFormsTable();
      }
    }, 100);
    return;
  }

  renderFormsTable();
};

function renderFormsTable() {
  const formsTable = document.getElementById("formsTable");
  let num = 1;

  formsTable.innerHTML = "";

  formObj = JSON.parse(localStorage.getItem("forms")) || [];

  const testAttempts = JSON.parse(localStorage.getItem("testAttempts")) || [];

  formObj.forEach((form) => {
    const usersWhoTook = testAttempts.filter(attempt => attempt.testId === form.formId);
    const uniqueUsers = [...new Set(usersWhoTook.map(attempt => attempt.userId))];
    
    let usersDisplay = "";
    if (uniqueUsers.length === 0) {
      usersDisplay = '<span class="text-muted">No users yet</span>';
    } else {
      const userNames = usersWhoTook
        .filter((attempt, index, self) => 
          index === self.findIndex(a => a.userId === attempt.userId)
        )
        .map(attempt => attempt.userName)
        .slice(0, 3);
      
      usersDisplay = `
        <span class="badge bg-info me-1">${uniqueUsers.length} User(s)</span>
        <button class="btn btn-sm btn-outline-info" onclick="viewFormUsers(${form.formId})" title="View All Users">
          <i class="bi bi-eye"></i> View
        </button>
      `;
    }

    let tr = document.createElement("tr");
    tr.innerHTML = `
            <tr>
              <td>${num++}</td>
              <td>${form.formTitle}</td>
              <td>${form.numberOfQuestions}</td>
              <td>${formStatus(form.formStatus)}</td>
              <td>${form.formDate}</td>
              <td>${usersDisplay}</td>
              <td>
                  <button class="btn btn-sm btn-success me-1" title="Assign to Users" onclick="assignFormToUsers(${
                    form.formId
                  })">
                      <i class="bi bi-person-plus"></i> Assign
                  </button>
                  <button class="btn btn-sm btn-outline-primary me-1" title="Edit" onclick="editForm(${
                    form.formId
                  })">
                      <i class="bi bi-pencil"></i> Edit
                  </button>
                  <button class="btn btn-sm btn-outline-danger me-1" title="Delete"
                      onclick="confirmDelete(${form.formId})">
                      <i class="bi bi-trash"></i> Delete
                  </button>
                  <button class="btn btn-sm ${
                    form.formStatus
                      ? "btn-outline-secondary"
                      : "btn-outline-success"
                  }" 
                          title="${form.formStatus ? "Deactivate" : "Activate"}"
                          onclick="activate_deactivate_Btn(${form.formId})">
                      <i class="bi ${
                        form.formStatus ? "bi-pause-circle" : "bi-play-circle"
                      }"></i> 
                      ${form.formStatus ? "Deactivate" : "Activate"}
                  </button>
              </td>
          </tr>
        `;
    formsTable.appendChild(tr);
  });
}

function viewFormUsers(formId) {
  const testAttempts = JSON.parse(localStorage.getItem("testAttempts")) || [];
  const form = formObj.find(f => f.formId === formId);
  const usersWhoTook = testAttempts.filter(attempt => attempt.testId === formId);
  
  if (usersWhoTook.length === 0) {
    Swal.fire({
      icon: "info",
      title: "No Users",
      text: "No users have taken this test yet.",
      confirmButtonColor: "#3085d6",
    });
    return;
  }

  const uniqueUsers = {};
  usersWhoTook.forEach(attempt => {
    if (!uniqueUsers[attempt.userId] || new Date(attempt.completedAt) > new Date(uniqueUsers[attempt.userId].completedAt)) {
      uniqueUsers[attempt.userId] = attempt;
    }
  });

  const usersList = Object.values(uniqueUsers)
    .map((attempt, index) => {
      const percentage = Math.round((attempt.score / attempt.total) * 100);
      const scoreClass = percentage >= 75 ? "success" : percentage >= 50 ? "warning" : "danger";
      return `
      <tr>
        <td>${attempt.userName}</td>
        <td>${attempt.userEmail}</td>
        <td>
          <span class="badge bg-${scoreClass}">${attempt.score}/${attempt.total} (${percentage}%)</span>
        </td>
        <td>${new Date(attempt.completedAt).toLocaleString()}</td>
        <td>
          <button class="btn btn-sm btn-outline-info" onclick="viewStudentTestDetails(${attempt.userId}, ${formId}, '${attempt.completedAt}'); Swal.close(); return false;" title="View Details">
            <i class="bi bi-eye"></i> Details
          </button>
        </td>
      </tr>
    `;
    })
    .join("");

  Swal.fire({
    title: `Users Who Took: ${form.formTitle}`,
    html: `
      <div class="table-responsive">
        <table class="table table-sm table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Score</th>
              <th>Completed At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${usersList}
          </tbody>
        </table>
      </div>
    `,
    width: "900px",
    confirmButtonText: "Close",
    confirmButtonColor: "#3085d6",
  });
}

function viewStudentTestDetails(userId, testId, completedAt) {
  const testAttempts = JSON.parse(localStorage.getItem("testAttempts")) || [];
  const attempt = testAttempts.find(a => 
    a.userId === userId && 
    a.testId === testId && 
    a.completedAt === completedAt
  );
  
  if (!attempt) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Test attempt not found!",
      confirmButtonColor: "#dc3545",
    });
    return;
  }
  
  const form = formObj.find(f => f.formId === testId);
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
    title: `Test Results: ${attempt.userName}`,
    html: `
      <div class="text-start">
        <div class="mb-3 p-3 bg-light rounded">
          <h6 class="fw-bold mb-2">Test Information</h6>
          <p class="mb-1"><strong>Test:</strong> ${attempt.testTitle}</p>
          <p class="mb-1"><strong>Score:</strong> <span class="badge bg-primary">${attempt.score}/${attempt.total} (${percentage}%)</span></p>
          <p class="mb-0"><strong>Completed:</strong> ${new Date(attempt.completedAt).toLocaleString()}</p>
        </div>
        
        <h6 class="fw-bold mb-2">Answer Details</h6>
        <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
          <table class="table table-sm table-hover">
            <thead class="table-light sticky-top">
              <tr>
                <th>Question</th>
                <th>Student Answer</th>
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

function assignFormToUsers(formId) {
  const form = formObj.find(f => f.formId === formId);
  if (!form) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Form not found!",
      confirmButtonColor: "#dc3545",
    });
    return;
  }

  const allUsers = JSON.parse(localStorage.getItem("users")) || [];
  const students = allUsers.filter((user) => user.role === "student");

  if (students.length === 0) {
    Swal.fire({
      icon: "warning",
      title: "No Students",
      text: "No students registered yet.",
      confirmButtonColor: "#ffc107",
    });
    return;
  }

  const studentsList = students
    .map(
      (student, index) => `
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" value="${student.id}" id="student${index}">
        <label class="form-check-label" for="student${index}">
          ${student.fullName || student.email} (${student.email})
        </label>
      </div>
    `
    )
    .join("");

  Swal.fire({
    title: `Assign Test: ${form.formTitle}`,
    html: `
      <div class="text-start">
        <p class="mb-3">Select students to assign this test to:</p>
        <div style="max-height: 300px; overflow-y: auto; border: 1px solid #dee2e6; padding: 1rem; border-radius: 0.375rem;">
          ${studentsList}
        </div>
        <div class="mt-3">
          <button class="btn btn-sm btn-outline-primary" onclick="selectAllStudents(); return false;">
            <i class="bi bi-check-all me-1"></i>Select All
          </button>
          <button class="btn btn-sm btn-outline-secondary" onclick="deselectAllStudents(); return false;">
            <i class="bi bi-x-square me-1"></i>Deselect All
          </button>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Assign",
    confirmButtonColor: "#198754",
    cancelButtonColor: "#6c757d",
    cancelButtonText: "Cancel",
    width: "600px",
    preConfirm: () => {
      const selected = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(
        (cb) => Number(cb.value)
      );
      if (selected.length === 0) {
        Swal.showValidationMessage("Please select at least one student");
        return false;
      }
      return selected;
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const selectedStudentIds = result.value;
      let assignedTests = JSON.parse(localStorage.getItem("assignedTests")) || {};

      let assignedCount = 0;
      selectedStudentIds.forEach((studentId) => {
        if (!assignedTests[studentId]) {
          assignedTests[studentId] = [];
        }

        if (!assignedTests[studentId].includes(formId)) {
          assignedTests[studentId].push(formId);
          assignedCount++;
        }
      });

      localStorage.setItem("assignedTests", JSON.stringify(assignedTests));

      Swal.fire({
        icon: "success",
        title: "Test Assigned!",
        text: `Test has been assigned to ${assignedCount} student(s) successfully.`,
        confirmButtonColor: "#198754",
      }).then(() => {
        renderFormsTable();
      });
    }
  });
}

function selectAllStudents() {
  document.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.checked = true;
  });
}

function deselectAllStudents() {
  document.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.checked = false;
  });
}

function showStudentsSection() {
  document.getElementById("studentsSection").style.display = "block";
  document.getElementById("formsSection").style.display = "none";
  renderStudentsTable();
}

function showFormsSection() {
  document.getElementById("studentsSection").style.display = "none";
  document.getElementById("formsSection").style.display = "block";
}

function renderStudentsTable() {
  const studentsTable = document.getElementById("studentsTable");
  if (!studentsTable) return;

  const allUsers = JSON.parse(localStorage.getItem("users")) || [];
  const students = allUsers.filter((user) => user.role === "student");
  const assignedTests = JSON.parse(localStorage.getItem("assignedTests")) || {};

  studentsTable.innerHTML = "";

  if (students.length === 0) {
    studentsTable.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted py-4">
          <i class="bi bi-inbox" style="font-size: 2rem;"></i>
          <p class="mt-2">No students registered yet</p>
        </td>
      </tr>
    `;
    return;
  }

  students.forEach((student, index) => {
    const studentTests = assignedTests[student.id] || [];
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${student.fullName || "N/A"}</td>
      <td>${student.email || "N/A"}</td>
      <td>${student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "N/A"}</td>
      <td>
        <span class="badge bg-info">${studentTests.length} Test(s)</span>
      </td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="assignTestToStudent(${student.id})" title="Assign Test">
          <i class="bi bi-plus-circle me-1"></i>Assign Test
        </button>
        <button class="btn btn-sm btn-outline-info" onclick="viewStudentTests(${student.id})" title="View Tests">
          <i class="bi bi-eye me-1"></i>View Tests
        </button>
      </td>
    `;
    studentsTable.appendChild(tr);
  });
}

function assignTestToStudent(studentId) {
  const allUsers = JSON.parse(localStorage.getItem("users")) || [];
  const student = allUsers.find((u) => u.id === studentId);
  const allForms = JSON.parse(localStorage.getItem("forms")) || [];
  const activeForms = allForms.filter((f) => f.formStatus);
  const assignedTests = JSON.parse(localStorage.getItem("assignedTests")) || {};
  const studentTestIds = assignedTests[studentId] || [];

  if (!student) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Student not found!",
      confirmButtonColor: "#dc3545",
    });
    return;
  }

  if (activeForms.length === 0) {
    Swal.fire({
      icon: "warning",
      title: "No Active Tests",
      text: "Please create and activate at least one test first.",
      confirmButtonColor: "#ffc107",
    });
    return;
  }

  const testsList = activeForms
    .map(
      (form, index) => {
        const isAssigned = studentTestIds.includes(form.formId);
        return `
        <div class="form-check mb-2">
          <input class="form-check-input" type="checkbox" value="${form.formId}" id="test${index}" ${isAssigned ? 'checked disabled' : ''}>
          <label class="form-check-label ${isAssigned ? 'text-muted' : ''}" for="test${index}">
            ${form.formTitle} (${form.numberOfQuestions} questions)
            ${isAssigned ? '<span class="badge bg-success ms-2">Already Assigned</span>' : ''}
          </label>
        </div>
      `;
      }
    )
    .join("");

  Swal.fire({
    title: `Assign Tests to ${student.fullName || student.email}`,
    html: `
      <div class="text-start">
        <p class="mb-3">Select tests to assign to this student:</p>
        <div style="max-height: 400px; overflow-y: auto; border: 1px solid #dee2e6; padding: 1rem; border-radius: 0.375rem;">
          ${testsList}
        </div>
        <div class="mt-3">
          <button class="btn btn-sm btn-outline-primary" onclick="selectAllTests(); return false;">
            <i class="bi bi-check-all me-1"></i>Select All Available
          </button>
          <button class="btn btn-sm btn-outline-secondary" onclick="deselectAllTests(); return false;">
            <i class="bi bi-x-square me-1"></i>Deselect All
          </button>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Assign",
    confirmButtonColor: "#198754",
    cancelButtonColor: "#6c757d",
    cancelButtonText: "Cancel",
    width: "700px",
    preConfirm: () => {
      const selected = Array.from(document.querySelectorAll('input[type="checkbox"]:checked:not(:disabled)')).map(
        (cb) => Number(cb.value)
      );
      if (selected.length === 0) {
        Swal.showValidationMessage("Please select at least one test");
        return false;
      }
      return selected;
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const selectedTestIds = result.value;
      let assignedTests = JSON.parse(localStorage.getItem("assignedTests")) || {};

      if (!assignedTests[studentId]) {
        assignedTests[studentId] = [];
      }

      let assignedCount = 0;
      selectedTestIds.forEach((testId) => {
        if (!assignedTests[studentId].includes(testId)) {
          assignedTests[studentId].push(testId);
          assignedCount++;
        }
      });

      localStorage.setItem("assignedTests", JSON.stringify(assignedTests));

      Swal.fire({
        icon: "success",
        title: "Tests Assigned!",
        text: `${assignedCount} test(s) has been assigned to ${student.fullName || student.email} successfully.`,
        confirmButtonColor: "#198754",
      }).then(() => {
        renderStudentsTable();
      });
    }
  });
}

function selectAllTests() {
  document.querySelectorAll('input[type="checkbox"]:not(:disabled)').forEach((cb) => {
    cb.checked = true;
  });
}

function deselectAllTests() {
  document.querySelectorAll('input[type="checkbox"]:not(:disabled)').forEach((cb) => {
    cb.checked = false;
  });
}

function viewStudentTests(studentId) {
  const allUsers = JSON.parse(localStorage.getItem("users")) || [];
  const student = allUsers.find((u) => u.id === studentId);
  const allForms = JSON.parse(localStorage.getItem("forms")) || [];
  const assignedTests = JSON.parse(localStorage.getItem("assignedTests")) || {};
  const studentTestIds = assignedTests[studentId] || [];
  const testAttempts = JSON.parse(localStorage.getItem("testAttempts")) || [];
  const studentAttempts = testAttempts.filter(a => a.userId === studentId);

  if (studentTestIds.length === 0) {
    Swal.fire({
      icon: "info",
      title: "No Tests Assigned",
      text: `${student.fullName} has no assigned tests yet.`,
      confirmButtonColor: "#3085d6",
    });
    return;
  }

  const assignedForms = allForms.filter((f) => studentTestIds.includes(f.formId));
  const testsList = assignedForms
    .map(
      (form) =>
        `<li class="mb-2">
          <strong>${form.formTitle}</strong> - ${form.numberOfQuestions} questions
          <button class="btn btn-sm btn-outline-danger ms-2" onclick="removeTestFromStudent(${studentId}, ${form.formId})">
            <i class="bi bi-trash"></i> Remove
          </button>
        </li>`
    )
    .join("");

  Swal.fire({
    title: `Tests Assigned to ${student.fullName}`,
    html: `<ul class="text-start">${testsList}</ul>`,
    confirmButtonText: "Close",
    confirmButtonColor: "#3085d6",
  });
}

function removeTestFromStudent(studentId, testId) {
  Swal.fire({
    title: "Remove Test?",
    text: "Are you sure you want to remove this test from the student?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Remove",
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#6c757d",
    cancelButtonText: "Cancel",
  }).then((result) => {
    if (result.isConfirmed) {
      let assignedTests = JSON.parse(localStorage.getItem("assignedTests")) || {};
      if (assignedTests[studentId]) {
        assignedTests[studentId] = assignedTests[studentId].filter((id) => id !== testId);
        localStorage.setItem("assignedTests", JSON.stringify(assignedTests));

        Swal.fire({
          icon: "success",
          title: "Test Removed!",
          text: "Test has been removed from student successfully.",
          confirmButtonColor: "#198754",
        }).then(() => {
          renderStudentsTable();
        });
      }
    }
  });
}

