let optionId = 0;
let isBoldActive = false;
let isItalicActive = false;
let isUnderlineActive = false;

let optionsCounter = 0;
let questionsCounter = 0;

let formStatus = true;
let forms = [];
let formId = 0;

let questionsData = [];

let formTitle;
let formDescription;
let saveFormBtn;

let questionTitle;
let questionType;
let isRequired;
let questionsList;

let radioOptions;
let checkboxOptions;

let radioOptionsContainer;
let checkboxOptionsContainer;
let textAnswerContainer;
let correctAnswer;

let boldBtn;
let italicBtn;
let underlineBtn;
let fontStyle;

let isEditing = false;
let editingFormId = null;

document.addEventListener("DOMContentLoaded", function() {
  formTitle = document.getElementById("formTitle");
  formDescription = document.getElementById("formDescription");
  saveFormBtn = document.getElementById("saveFormBtn");
  
  questionTitle = document.getElementById("questionText");
  questionType = document.getElementById("questionType");
  isRequired = document.getElementById("requiredToggle");
  questionsList = document.getElementById("questionsList");
  
  radioOptions = document.getElementById("radioOptions");
  checkboxOptions = document.getElementById("checkboxOptions");
  radioOptionsContainer = document.getElementById("radioOptionsContainer");
  checkboxOptionsContainer = document.getElementById("checkboxOptionsContainer");
  textAnswerContainer = document.getElementById("textAnswerContainer");
  correctAnswer = document.getElementById("correctAnswer");
  
  boldBtn = document.getElementById("bold");
  italicBtn = document.getElementById("italic");
  underlineBtn = document.getElementById("underline");
  fontStyle = document.getElementById("fontStyle");
  
  forms = JSON.parse(localStorage.getItem("forms")) || [];
  if (forms.length > 0) {
    const maxFormId = Math.max(...forms.map(f => f.formId));
    formId = maxFormId;
  } else {
    formId = 0;
  }
  
  const editingForm = JSON.parse(localStorage.getItem("editingForm"));
  if (editingForm) {
    isEditing = true;
    editingFormId = editingForm.formId;

    formTitle.value = editingForm.formTitle;
    formDescription.value = editingForm.formDesc;

    saveFormBtn.textContent = "Update Form";
    saveFormBtn.classList.add("btn-warning");
    saveFormBtn.classList.remove("btn-primary");

    questionsData = [...editingForm.questions];
    questionsCounter = questionsData.length;

    renderQuestions();

    localStorage.removeItem("editingForm");
  }

  if (saveFormBtn) {
    saveFormBtn.addEventListener("click", (e) => {
      e.preventDefault();

      if (isEditing) {
        updateExistingForm();
      } else {
        createNewForm();
      }
    });
  }

  if (boldBtn && questionTitle) {
    boldBtn.addEventListener("click", () => {
      isBoldActive = !isBoldActive;
      questionTitle.style.fontWeight = isBoldActive ? "bold" : "normal";
      updateFormattingButtonStates();
    });
  }

  if (italicBtn && questionTitle) {
    italicBtn.addEventListener("click", () => {
      isItalicActive = !isItalicActive;
      questionTitle.style.fontStyle = isItalicActive ? "italic" : "normal";
      updateFormattingButtonStates();
    });
  }

  if (underlineBtn && questionTitle) {
    underlineBtn.addEventListener("click", () => {
      isUnderlineActive = !isUnderlineActive;
      questionTitle.style.textDecoration = isUnderlineActive ? "underline" : "none";
      updateFormattingButtonStates();
    });
  }

  if (fontStyle && questionTitle) {
    fontStyle.addEventListener("change", () => {
      if (fontStyle.value === "sans") {
        questionTitle.style.fontFamily = "Arial, Helvetica, sans-serif";
      } else if (fontStyle.value === "serif") {
        questionTitle.style.fontFamily = "Times New Roman, Georgia, serif";
      } else if (fontStyle.value === "mono") {
        questionTitle.style.fontFamily = "Courier New, Lucida Console, monospace";
      }
    });
  }

  if (questionType) {
    if (questionType.value === "text" && textAnswerContainer) {
      textAnswerContainer.classList.remove("d-none");
    }
    
    questionType.addEventListener("change", function () {
      optionsCounter = 2;

      if (this.value === "radio") {
        radioOptions.classList.remove("d-none");
        checkboxOptions.classList.add("d-none");
        if (textAnswerContainer) textAnswerContainer.classList.add("d-none");
      } else if (this.value === "select") {
        checkboxOptions.classList.remove("d-none");
        radioOptions.classList.add("d-none");
        if (textAnswerContainer) textAnswerContainer.classList.add("d-none");
      } else if (this.value === "text") {
        radioOptions.classList.add("d-none");
        checkboxOptions.classList.add("d-none");
        if (textAnswerContainer) textAnswerContainer.classList.remove("d-none");
      }
    });
  }
});

function createNewForm() {
  forms = JSON.parse(localStorage.getItem("forms")) || [];
  
  if (forms.length > 0) {
    const maxFormId = Math.max(...forms.map(f => f.formId || 0));
    formId = maxFormId + 1;
  } else {
    formId = 1;
  }

  if (!formTitle || !formTitle.value || !formTitle.value.trim()) {
    Swal.fire({
      text: "Please fill the form title.",
      confirmButtonColor: "#ffc107",
      icon: "warning",
    });
    return;
  }

  if (!questionsData || questionsData.length === 0) {
    Swal.fire({
      text: "Please add at least one question before saving the form.",
      confirmButtonColor: "#ffc107",
      icon: "warning",
    });
    return;
  }

  const formObj = {
    formId: formId,
    formDate: new Date().toLocaleDateString(),
    formTitle: formTitle.value.trim(),
    formDesc: formDescription ? formDescription.value.trim() : "",
    formStatus: true,
    numberOfQuestions: questionsData.length,
    questions: JSON.parse(JSON.stringify(questionsData)),
  };

  forms.push(formObj);
  
  try {
    localStorage.setItem("forms", JSON.stringify(forms));
    console.log("Form saved successfully with ID:", formId);
    console.log("Total forms in storage:", forms.length);
    console.log("Form object:", formObj);
    
    const savedForms = JSON.parse(localStorage.getItem("forms")) || [];
    console.log("Verification - Forms in storage after save:", savedForms.length);
    
    if (savedForms.length === forms.length) {
      Swal.fire({
        text: "Form saved successfully!",
        confirmButtonColor: "#198754",
        icon: "success",
      }).then(() => {
        window.location.href = "admin-dashboard.html";
      });
    } else {
      throw new Error("Form was not saved correctly");
    }
  } catch (error) {
    console.error("Error saving form to localStorage:", error);
    Swal.fire({
      text: "Error saving form. Please try again. Error: " + error.message,
      confirmButtonColor: "#dc3545",
      icon: "error",
    });
    return;
  }
}

function updateExistingForm() {
  forms = JSON.parse(localStorage.getItem("forms")) || [];
  
  if (!formTitle || !formTitle.value || !formTitle.value.trim()) {
    Swal.fire({
      text: "Please fill the form title.",
      confirmButtonColor: "#ffc107",
      icon: "warning",
    });
    return;
  }

  if (!questionsData || questionsData.length === 0) {
    Swal.fire({
      text: "Please add at least one question before saving the form.",
      confirmButtonColor: "#ffc107",
      icon: "warning",
    });
    return;
  }

  const existingForm = forms.find((f) => f.formId === editingFormId);

  const formObj = {
    formId: editingFormId,
    formDate: new Date().toLocaleDateString(),
    formTitle: formTitle.value.trim(),
    formDesc: formDescription ? formDescription.value.trim() : "",
    formStatus: existingForm ? existingForm.formStatus : true,
    numberOfQuestions: questionsData.length,
    questions: JSON.parse(JSON.stringify(questionsData)),
  };

  const updatedForms = forms.map((form) =>
    form.formId === editingFormId ? formObj : form
  );

  try {
    localStorage.setItem("forms", JSON.stringify(updatedForms));
    console.log("Form updated successfully with ID:", editingFormId);
    
    Swal.fire({
      text: "Form updated successfully!",
      confirmButtonColor: "#198754",
      icon: "success",
    }).then(() => {
      window.location.href = "admin-dashboard.html";
    });
  } catch (error) {
    console.error("Error updating form:", error);
    Swal.fire({
      text: "Error updating form. Please try again.",
      confirmButtonColor: "#dc3545",
      icon: "error",
    });
  }
}

function renderQuestions() {
  questionsList.innerHTML = "";

  if (questionsData.length === 0) {
    questionsList.innerHTML =
      '<p class="text-muted text-center py-4">No questions added yet</p>';
    questionsCounter = 0;
    return;
  }

  questionsData.forEach((question, index) => {
    question.questionId = index + 1;
  });

  questionsCounter = questionsData.length;

  questionsData.forEach((question) => {
    const card = document.createElement("div");
    card.className = "card mb-3";
    card.setAttribute("data-id", question.questionId);

    let formattedQuestionText = question.questionTitle;
    if (question.formatting) {
      const { bold, italic, underline } = question.formatting;

      if (bold)
        formattedQuestionText = `<strong>${formattedQuestionText}</strong>`;
      if (italic) formattedQuestionText = `<em>${formattedQuestionText}</em>`;
      if (underline) formattedQuestionText = `<u>${formattedQuestionText}</u>`;
    }

    const optionsCount = question.options ? question.options.length : 0;
    const correctAnswerDisplay = question.questionType === "text" && question.correctAnswer 
      ? `<div class="mt-2"><small class="text-success"><i class="bi bi-check-circle me-1"></i>Correct Answer: <strong>${question.correctAnswer}</strong></small></div>` 
      : "";

    card.innerHTML = `
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <span class="badge bg-primary">Q${question.questionId}</span>
          ${
            question.isRequired
              ? '<span class="badge bg-warning"><i class="bi bi-asterisk me-1"></i>Required</span>'
              : ""
          }
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-warning" onclick="editQuestion(${
              question.questionId
            })">
              <i class="bi bi-pencil"></i> Edit
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="removeQuestion(${
              question.questionId
            })">
              <i class="bi bi-trash"></i> Delete
            </button>
          </div>
        </div>
        <p class="mb-2">${formattedQuestionText}</p>
        ${correctAnswerDisplay}
        <small class="text-muted">
          Type: ${question.questionType} | Options: ${optionsCount}
        </small>
      </div>
    `;
    questionsList.appendChild(card);
  });
}

function editQuestion(questionId) {
  const questionToEdit = questionsData.find((q) => q.questionId === questionId);

  if (!questionToEdit) {
    Swal.fire({
      title: "Error!",
      text: "Question not found!",
      icon: "error",
      confirmButtonColor: "#dc3545",
    });
    return;
  }

  questionTitle.value = questionToEdit.questionTitle;

  if (questionToEdit.formatting) {
    const { bold, italic, underline, fontFamily } = questionToEdit.formatting;

    isBoldActive = !!bold;
    isItalicActive = !!italic;
    isUnderlineActive = !!underline;

    questionTitle.style.fontWeight = bold ? "bold" : "normal";
    questionTitle.style.fontStyle = italic ? "italic" : "normal";
    questionTitle.style.textDecoration = underline ? "underline" : "none";

    if (fontFamily) {
      questionTitle.style.fontFamily = fontFamily;
      fontStyle.value =
        fontFamily === "Arial, Helvetica, sans-serif"
          ? "sans"
          : fontFamily === "Times New Roman, Georgia, serif"
          ? "serif"
          : "mono";
    }

    updateFormattingButtonStates();
  }

  questionType.value = questionToEdit.questionType;
  isRequired.checked = questionToEdit.isRequired;

  if (questionToEdit.questionType === "text") {
    if (textAnswerContainer) textAnswerContainer.classList.remove("d-none");
    if (radioOptions) radioOptions.classList.add("d-none");
    if (checkboxOptions) checkboxOptions.classList.add("d-none");
    if (correctAnswer) {
      correctAnswer.value = questionToEdit.correctAnswer || "";
    }
  } else if (questionToEdit.questionType === "radio") {
    if (textAnswerContainer) textAnswerContainer.classList.add("d-none");
    radioOptions.classList.remove("d-none");
    checkboxOptions.classList.add("d-none");
    radioOptions.classList.remove("d-none");
    checkboxOptions.classList.add("d-none");

    radioOptionsContainer.innerHTML = "";
    questionToEdit.options.forEach((option, index) => {
      const optionHTML = `
        <div class="option-item mb-2 d-flex align-items-center gap-2">
          <input type="text" class="form-control" placeholder="Option text" value="${
            option.optionContent
          }">
          <div class="form-check">
            <input class="form-check-input" type="radio" name="correctOption" value="${index}" ${
        option.isCorrect ? "checked" : ""
      }>Correct
          </div>
          <button class="btn btn-sm btn-outline-danger" type="button" onclick="removeOption(this)">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      `;
      radioOptionsContainer.insertAdjacentHTML("beforeend", optionHTML);
    });
  } else if (questionToEdit.questionType === "select") {
    checkboxOptions.classList.remove("d-none");
    radioOptions.classList.add("d-none");

    checkboxOptionsContainer.innerHTML = "";
    questionToEdit.options.forEach((option, index) => {
      const optionHTML = `
        <div class="option-item mb-2 d-flex align-items-center gap-2">
          <input type="text" class="form-control" placeholder="Option text" value="${
            option.optionContent
          }">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" name="correctOption" value="${index}" ${
        option.isCorrect ? "checked" : ""
      }>Correct
          </div>
          <button class="btn btn-sm btn-outline-danger" type="button" onclick="removeOption(this)">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      `;
      checkboxOptionsContainer.insertAdjacentHTML("beforeend", optionHTML);
    });
  } else if (questionToEdit.questionType === "select") {
    if (textAnswerContainer) textAnswerContainer.classList.add("d-none");
    checkboxOptions.classList.remove("d-none");
    radioOptions.classList.add("d-none");
  }

  window.currentlyEditingQuestionId = questionId;

  const addQuestionBtn = document.querySelector(
    'button[onclick="addQuestion(event)"]'
  );
  if (addQuestionBtn) {
    addQuestionBtn.textContent = "Update Question";
    addQuestionBtn.classList.remove("btn-primary");
    addQuestionBtn.classList.add("btn-success");
    addQuestionBtn.setAttribute("onclick", "updateExistingQuestion()");
  }
}

function updateExistingQuestion() {
  const questionId = window.currentlyEditingQuestionId;

  if (!questionId) {
    Swal.fire({
      text: "No question is currently being edited!",
      confirmButtonColor: "#ffc107",
      icon: "warning",
    });
    return;
  }

  if (!questionTitle.value.trim()) {
    Swal.fire({
      text: "Please enter a question text",
      confirmButtonColor: "#ffc107",
      icon: "warning",
    });
    return;
  }

  let options = [];
  let correctAnswerValue = "";

  if (questionType.value === "text") {
    if (correctAnswer) {
      correctAnswerValue = correctAnswer.value.trim();
    }
  } else if (questionType.value === "radio" || questionType.value === "select") {
    const container =
      questionType.value === "radio"
        ? radioOptionsContainer
        : checkboxOptionsContainer;
    const optionItems = container.querySelectorAll(".option-item");

    if (optionItems.length < 2) {
      Swal.fire({
        text: "At least two options are required",
        confirmButtonColor: "#ffc107",
        icon: "warning",
      });
      return;
    }

    let hasEmpty = false;
    let hasCorrect = false;

    optionItems.forEach((item) => {
      const textInput = item.querySelector('input[type="text"]');
      const correctInput = item.querySelector(".form-check-input");

      const value = textInput.value.trim();
      if (!value) {
        hasEmpty = true;
      }

      const isCorrect = correctInput.checked;
      if (isCorrect) {
        hasCorrect = true;
      }

      options.push({
        optionId: Date.now() + Math.floor(Math.random() * 1000),
        optionContent: value,
        isCorrect: isCorrect,
      });
    });

    if (hasEmpty) {
      Swal.fire({
        text: "Please fill all options",
        confirmButtonColor: "#ffc107",
        icon: "warning",
      });
      return;
    }

    if (!hasCorrect) {
      Swal.fire({
        text: "Please choose the correct answer",
        confirmButtonColor: "#ffc107",
        icon: "warning",
      });
      return;
    }
  }

  const questionIndex = questionsData.findIndex(
    (q) => q.questionId === questionId
  );
  if (questionIndex !== -1) {
    questionsData[questionIndex] = {
      questionId: questionId,
      questionTitle: questionTitle.value,
      questionType: questionType.value,
      isRequired: isRequired.checked,
      options: options,
      correctAnswer: questionType.value === "text" ? correctAnswerValue : undefined,
      formatting: {
        bold: isBoldActive,
        italic: isItalicActive,
        underline: isUnderlineActive,
        fontFamily: questionTitle.style.fontFamily,
      },
    };
  }

  questionTitle.value = "";
  questionType.value = "text";
  isRequired.checked = true;
  if (correctAnswer) correctAnswer.value = "";
  resetFormatting();

  if (textAnswerContainer) textAnswerContainer.classList.remove("d-none");
  if (radioOptions) radioOptions.classList.add("d-none");
  if (checkboxOptions) checkboxOptions.classList.add("d-none");

  radioOptionsContainer.innerHTML = `
    <div class="option-item mb-2 d-flex align-items-center gap-2">
      <input type="text" class="form-control" placeholder="Option text" />
      <div class="form-check">
        <input class="form-check-input" type="radio" name="correctOption" value="0" />
        <label class="form-check-label small">Correct</label>
      </div>
      <button class="btn btn-sm btn-outline-danger" type="button"
        onclick="removeOption(this)">
        <i class="bi bi-trash"></i>
      </button>
    </div>

    <div class="option-item mb-2 d-flex align-items-center gap-2">
      <input type="text" class="form-control" placeholder="Option text" />
      <div class="form-check">
        <input class="form-check-input" type="radio" name="correctOption" value="1" />
        <label class="form-check-label small">Correct</label>
      </div>
      <button class="btn btn-sm btn-outline-danger" type="button"
        onclick="removeOption(this)">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  `;

  checkboxOptionsContainer.innerHTML = `
    <div class="option-item mb-2 d-flex align-items-center gap-2">
      <input type="text" class="form-control" placeholder="Option text" />
      <div class="form-check">
        <input class="form-check-input" type="checkbox" name="correctOption"
          value="0" />
        <label class="form-check-label small">Correct</label>
      </div>
      <button class="btn btn-sm btn-outline-danger" type="button"
        onclick="removeOption(this)">
        <i class="bi bi-trash"></i>
      </button>
    </div>

    <div class="option-item mb-2 d-flex align-items-center gap-2">
      <input type="text" class="form-control" placeholder="Option text" />
      <div class="form-check">
        <input class="form-check-input" type="checkbox" name="correctOption"
          value="1" />
        <label class="form-check-label small">Correct</label>
      </div>
      <button class="btn btn-sm btn-outline-danger" type="button"
        onclick="removeOption(this)">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  `;

  radioOptions.classList.add("d-none");
  checkboxOptions.classList.add("d-none");

  const addQuestionBtn = document.querySelector(
    'button[onclick="updateExistingQuestion()"]'
  );
  if (addQuestionBtn) {
    addQuestionBtn.textContent = "Add Question";
    addQuestionBtn.classList.remove("btn-success");
    addQuestionBtn.classList.add("btn-primary");
    addQuestionBtn.setAttribute("onclick", "addQuestion(event)");
  }

  delete window.currentlyEditingQuestionId;

  renderQuestions();

  Swal.fire({
    text: "Question updated successfully!",
    confirmButtonColor: "#198754",
    icon: "success",
  });
}

function updateFormattingButtonStates() {
  if (isBoldActive) {
    boldBtn.classList.add("btn-primary");
    boldBtn.classList.remove("btn-outline-secondary");
  } else {
    boldBtn.classList.add("btn-outline-secondary");
    boldBtn.classList.remove("btn-primary");
  }

  if (isItalicActive) {
    italicBtn.classList.add("btn-primary");
    italicBtn.classList.remove("btn-outline-secondary");
  } else {
    italicBtn.classList.add("btn-outline-secondary");
    italicBtn.classList.remove("btn-primary");
  }

  if (isUnderlineActive) {
    underlineBtn.classList.add("btn-primary");
    underlineBtn.classList.remove("btn-outline-secondary");
  } else {
    underlineBtn.classList.add("btn-outline-secondary");
    underlineBtn.classList.remove("btn-primary");
  }
}

function resetFormatting() {
  isBoldActive = false;
  isItalicActive = false;
  isUnderlineActive = false;

  questionTitle.style.fontWeight = "normal";
  questionTitle.style.fontStyle = "normal";
  questionTitle.style.textDecoration = "none";
  questionTitle.style.fontFamily = "Arial, Helvetica, sans-serif";

  fontStyle.value = "sans";

  updateFormattingButtonStates();
}

function addQuestion(e) {
  if (e) {
    e.preventDefault();
  }

  if (!questionTitle || !questionType || !isRequired || !questionsList) {
    console.error("Question elements not initialized");
    Swal.fire({
      text: "Page is still loading. Please wait a moment and try again.",
      confirmButtonColor: "#ffc107",
      icon: "warning",
    });
    return;
  }

  if (window.currentlyEditingQuestionId) {
    return;
  }

  if (!questionTitle.value || !questionTitle.value.trim()) {
    Swal.fire({
      text: "Please enter a question text",
      confirmButtonColor: "#ffc107",
      icon: "warning",
    });
    return;
  }

  let options = [];
  let correctAnswerValue = "";

  if (questionType.value === "text") {
    if (correctAnswer) {
      correctAnswerValue = correctAnswer.value.trim();
    }
  } else if (questionType.value === "radio" || questionType.value === "select") {
    const container =
      questionType.value === "radio"
        ? radioOptionsContainer
        : checkboxOptionsContainer;
    const optionItems = container.querySelectorAll(".option-item");

    if (optionItems.length < 2) {
      Swal.fire({
        text: "At least two options are required",
        confirmButtonColor: "#ffc107",
        icon: "warning",
      });
      return;
    }

    let hasEmpty = false;
    let hasCorrect = false;

    optionItems.forEach((item) => {
      const textInput = item.querySelector('input[type="text"]');
      const correctInput = item.querySelector(".form-check-input");

      const value = textInput.value.trim();
      if (!value) {
        hasEmpty = true;
      }

      const isCorrect = correctInput.checked;
      if (isCorrect) {
        hasCorrect = true;
      }

      options.push({
        optionId: ++optionId,
        optionContent: value,
        isCorrect: isCorrect,
      });
    });

    if (hasEmpty) {
      Swal.fire({
        text: "Please fill all options",
        confirmButtonColor: "#ffc107",
        icon: "warning",
      });
      return;
    }

    if (!hasCorrect) {
      Swal.fire({
        text: "Please choose the correct answer",
        confirmButtonColor: "#ffc107",
        icon: "warning",
      });
      return;
    }
  }

  const newQuestionId = questionsData.length + 1;
  ++questionsCounter;

  const questionObj = {
    questionId: newQuestionId,
    questionTitle: questionTitle.value,
    questionType: questionType.value,
    isRequired: isRequired.checked,
    options: options,
    correctAnswer: questionType.value === "text" ? correctAnswerValue : undefined,
    formatting: {
      bold: isBoldActive,
      italic: isItalicActive,
      underline: isUnderlineActive,
      fontFamily: questionTitle.style.fontFamily,
    },
  };

  questionsData.push(questionObj);

  if (questionsCounter === 1 && questionsList.firstElementChild) {
    if (questionsList.firstElementChild.tagName.toLowerCase() === "p") {
      questionsList.removeChild(questionsList.firstElementChild);
    }
  }

  let formattedQuestionText = questionObj.questionTitle;
  const { bold, italic, underline } = questionObj.formatting;

  if (bold) formattedQuestionText = `<strong>${formattedQuestionText}</strong>`;
  if (italic) formattedQuestionText = `<em>${formattedQuestionText}</em>`;
  if (underline) formattedQuestionText = `<u>${formattedQuestionText}</u>`;

  const correctAnswerDisplay = questionObj.questionType === "text" && questionObj.correctAnswer 
    ? `<div class="mt-2"><small class="text-success"><i class="bi bi-check-circle me-1"></i>Correct Answer: <strong>${questionObj.correctAnswer}</strong></small></div>` 
    : "";

  const card = document.createElement("div");
  card.className = "card mb-3";
  card.setAttribute("data-id", newQuestionId);

  card.innerHTML = `
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <span class="badge bg-primary">Q${newQuestionId}</span>
        ${
          questionObj.isRequired
            ? '<span class="badge bg-warning"><i class="bi bi-asterisk me-1"></i>Required</span>'
            : ""
        }
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-warning" onclick="editQuestion(${newQuestionId})">
            <i class="bi bi-pencil"></i> Edit
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="removeQuestion(${newQuestionId})">
            <i class="bi bi-trash"></i> Delete
          </button>
        </div>
      </div>
      <p class="mb-2">${formattedQuestionText}</p>
      ${correctAnswerDisplay}
      <small class="text-muted">
        Type: ${questionObj.questionType} | Options: ${
    questionObj.options.length
  }
      </small>
    </div>
  `;
  questionsList.appendChild(card);

  const currentType = questionType.value;

  questionTitle.value = "";
  questionType.value = "text";
  isRequired.checked = true;
  if (correctAnswer) correctAnswer.value = "";
  resetFormatting();

  if (textAnswerContainer) textAnswerContainer.classList.remove("d-none");
  if (radioOptions) radioOptions.classList.add("d-none");
  if (checkboxOptions) checkboxOptions.classList.add("d-none");

  if (currentType === "radio" || currentType === "select") {
    const container =
      currentType === "radio"
        ? radioOptionsContainer
        : checkboxOptionsContainer;
    const optionItems = container.querySelectorAll(".option-item");

    optionItems.forEach((item) => {
      const textInput = item.querySelector('input[type="text"]');
      const correctInput = item.querySelector(".form-check-input");

      if (textInput) textInput.value = "";
      if (correctInput) correctInput.checked = false;
    });
  }
}

function removeQuestion(id) {
  questionsData = questionsData.filter((q) => q.questionId !== id);
  renderQuestions();
}

function addOption() {
  if (!questionType || !radioOptionsContainer || !checkboxOptionsContainer) {
    console.error("Option elements not initialized");
    return;
  }
  
  ++optionsCounter;
  ++optionId;

  let optionHTML = "";

  if (questionType.value === "radio") {
    optionHTML = `
      <div class="option-item mb-2 d-flex align-items-center gap-2">
        <input type="text" class="form-control" placeholder="Option text">
        <div class="form-check">
          <input class="form-check-input" type="radio" name="correctOption" value="${optionsCounter}">Correct
        </div>
        <button class="btn btn-sm btn-outline-danger" type="button" onclick="removeOption(this)">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    `;
    radioOptionsContainer.insertAdjacentHTML("beforeend", optionHTML);
  } else if (questionType.value === "select") {
    optionHTML = `
      <div class="option-item mb-2 d-flex align-items-center gap-2">
        <input type="text" class="form-control" placeholder="Option text">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" name="correctOption" value="${optionsCounter}">Correct
        </div>
        <button class="btn btn-sm btn-outline-danger" type="button" onclick="removeOption(this)">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    `;
    checkboxOptionsContainer.insertAdjacentHTML("beforeend", optionHTML);
  }
}

function removeOption(element) {
  if (!element) {
    console.error("No element provided to removeOption");
    return;
  }
  
  const container = element.closest(".optionsContainer");
  if (!container) {
    console.error("Options container not found");
    return;
  }
  
  const optionItems = container.querySelectorAll(".option-item");

  if (optionItems.length <= 2) {
    Swal.fire({
      text: "At least two options are required",
      confirmButtonColor: "#ffc107",
      icon: "warning",
    });
    return;
  }

  element.closest(".option-item").remove();
  optionsCounter--;
}

