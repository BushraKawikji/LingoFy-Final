function clearValidation(formId) {
  const form = document.getElementById(formId);
  if (form) {
    const inputs = form.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      input.classList.remove("is-invalid", "is-valid");
      const feedback = input.parentElement.nextElementSibling;
      if (feedback && feedback.classList.contains("invalid-feedback")) {
        feedback.classList.add("d-none");
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");
  const passwordFeedbackContainer = document.getElementById("passwordFeedback");

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", function () {
      const type =
        passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);

      const icon = togglePassword.querySelector("i");
      icon.classList.toggle("bi-eye");
      icon.classList.toggle("bi-eye-slash");
    });
  }

  if (passwordInput && passwordFeedbackContainer) {
    passwordInput.addEventListener("input", function () {
      const password = this.value;
      const requirements = validatePassword(password);

      passwordFeedbackContainer.innerHTML = "";

      const lengthReq = document.createElement("div");
      lengthReq.innerHTML =
        password.length >= 8
          ? '<span style="color: green;">✓</span> Must be at least 8 characters!'
          : '<span style="color: red;">✗</span> Must be at least 8 characters!';
      passwordFeedbackContainer.appendChild(lengthReq);

      const numberReq = document.createElement("div");
      numberReq.innerHTML = /[0-9]/.test(password)
        ? '<span style="color: green;">✓</span> Must contain at least 1 number!'
        : '<span style="color: red;">✗</span> Must contain at least 1 number!';
      passwordFeedbackContainer.appendChild(numberReq);

      const uppercaseReq = document.createElement("div");
      uppercaseReq.innerHTML = /[A-Z]/.test(password)
        ? '<span style="color: green;">✓</span> Must contain at least 1 Capital Letter!'
        : '<span style="color: red;">✗</span> Must contain at least 1 Capital Letter!';
      passwordFeedbackContainer.appendChild(uppercaseReq);

      const lowercaseReq = document.createElement("div");
      lowercaseReq.innerHTML = /[a-z]/.test(password)
        ? '<span style="color: green;">✓</span> Must contain at least 1 Small Letter!'
        : '<span style="color: red;">✗</span> Must contain at least 1 Small Letter!';
      passwordFeedbackContainer.appendChild(lowercaseReq);

      const specialCharReq = document.createElement("div");
      specialCharReq.innerHTML = /[@$!%*?&]/.test(password)
        ? '<span style="color: green;">✓</span> Must contain at least 1 Special Character!'
        : '<span style="color: red;">✗</span> Must contain at least 1 Special Character!';
      passwordFeedbackContainer.appendChild(specialCharReq);

      if (requirements.length === 0) {
        this.classList.remove("is-invalid");
        this.classList.add("is-valid");
      } else {
        this.classList.remove("is-valid");
        this.classList.add("is-invalid");
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();

      clearValidation("registerForm");

      const requiredInputs = registerForm.querySelectorAll(
        "input[required], select[required]"
      );
      let allRequiredValid = true;

      requiredInputs.forEach((input) => {
        if (!input.value.trim()) {
          allRequiredValid = false;
          input.classList.add("is-invalid");
          const feedback = input.parentElement.nextElementSibling;
          if (feedback && feedback.classList.contains("invalid-feedback")) {
            feedback.classList.remove("d-none");
          }
        } else {
          input.classList.remove("is-invalid");
          input.classList.add("is-valid");
        }
      });

      if (allRequiredValid) {
        const formData = {
          fullName: document.getElementById("fullName").value.trim(),
          username: document.getElementById("username").value.trim(),
          email: document.getElementById("email").value.trim(),
          password: passwordInput.value,
          role: document.getElementById("role").value,
        };

        if (!formData.username || formData.username.length < 3) {
          const usernameInput = document.getElementById("username");
          usernameInput.classList.add("is-invalid");
          const usernameFeedback = usernameInput.parentElement.nextElementSibling;
          if (usernameFeedback) {
            usernameFeedback.classList.remove("d-none");
            usernameFeedback.textContent = "Username must be at least 3 characters";
          }
          Swal.fire({
            icon: "error",
            title: "Invalid Username",
            text: "Username must be at least 3 characters long",
            confirmButtonColor: "#3085d6",
          });
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          const emailInput = document.getElementById("email");
          emailInput.classList.add("is-invalid");
          const emailFeedback = emailInput.parentElement.nextElementSibling;
          if (emailFeedback) {
            emailFeedback.classList.remove("d-none");
            emailFeedback.textContent = "Please enter a valid email address";
          }
          Swal.fire({
            icon: "error",
            title: "Invalid Email",
            text: "Please enter a valid email address",
            confirmButtonColor: "#3085d6",
            confirmButtonText: "OK",
          });
          return;
        }

        const validationErrors = validatePassword(formData.password);
        if (validationErrors.length > 0) {
          passwordInput.classList.add("is-invalid");
          const passwordFeedback =
            passwordInput.parentElement.nextElementSibling;
          if (passwordFeedback) {
            passwordFeedback.classList.remove("d-none");
            passwordFeedback.innerHTML = validationErrors.join("<br>");
          }
          Swal.fire({
            icon: "error",
            title: "Password Requirements Not Met",
            html: validationErrors.join("<br>"),
            confirmButtonColor: "#3085d6",
            confirmButtonText: "OK",
          });
          return;
        }

        let users = JSON.parse(localStorage.getItem("users")) || [];
        const emailExists = users.some((user) => user.email === formData.email);
        const usernameExists = users.some((user) => user.username === formData.username);
        
        if (emailExists) {
          const emailInput = document.getElementById("email");
          emailInput.classList.add("is-invalid");
          const emailFeedback = emailInput.parentElement.nextElementSibling;
          if (emailFeedback) {
            emailFeedback.classList.remove("d-none");
            emailFeedback.textContent = "Email already registered";
          }
          Swal.fire({
            icon: "error",
            title: "Email Already Registered",
            text: "This email address is already in use",
            confirmButtonColor: "#3085d6",
            confirmButtonText: "OK",
          });
          return;
        }

        if (usernameExists) {
          const usernameInput = document.getElementById("username");
          usernameInput.classList.add("is-invalid");
          const usernameFeedback = usernameInput.parentElement.nextElementSibling;
          if (usernameFeedback) {
            usernameFeedback.classList.remove("d-none");
            usernameFeedback.textContent = "Username already taken";
          }
          Swal.fire({
            icon: "error",
            title: "Username Already Taken",
            text: "This username is already in use. Please choose another one.",
            confirmButtonColor: "#3085d6",
            confirmButtonText: "OK",
          });
          return;
        }

        const userToSave = {
          id: Date.now(),
          fullName: formData.fullName,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          createdAt: new Date().toISOString(),
        };

        users.push(userToSave);
        localStorage.setItem("users", JSON.stringify(users));

        localStorage.setItem("currentUser", JSON.stringify(userToSave));

        Swal.fire({
          icon: "success",
          title: "Account Created Successfully!",
          text: `Welcome, ${userToSave.fullName}! Your account has been created successfully.`,
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK",
          timer: 2000,
          timerProgressBar: true,
          allowOutsideClick: false,
          allowEscapeKey: false
        }).then((result) => {
          if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
            if (userToSave.role === "admin") {
              window.location.href = "admin-dashboard.html";
            } else {
              window.location.href = "user-dashboard.html";
            }
          }
        }).catch((error) => {
          console.error("Redirect error:", error);
          if (userToSave.role === "admin") {
            window.location.href = "admin-dashboard.html";
          } else {
            window.location.href = "user-dashboard.html";
          }
        });
      } else {
        Swal.fire({
          icon: "warning",
          title: "Missing Required Fields",
          text: "Please fill in all required fields",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK",
        });
      }
    });

    const inputs = registerForm.querySelectorAll("input, select");
    inputs.forEach((input) => {
      input.addEventListener("blur", function () {
        if (this.hasAttribute("required") && !this.value.trim()) {
          this.classList.add("is-invalid");
          const feedback = this.parentElement.nextElementSibling;
          if (feedback && feedback.classList.contains("invalid-feedback")) {
            feedback.classList.remove("d-none");
          }
        } else {
          if (this.id === "email") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (this.value && !emailRegex.test(this.value)) {
              this.classList.add("is-invalid");
              const feedback = this.parentElement.nextElementSibling;
              if (feedback && feedback.classList.contains("invalid-feedback")) {
                feedback.classList.remove("d-none");
                feedback.textContent = "Please enter a valid email address";
              }
            } else if (this.value) {
              this.classList.remove("is-invalid");
              this.classList.add("is-valid");
              const feedback = this.parentElement.nextElementSibling;
              if (feedback && feedback.classList.contains("invalid-feedback")) {
                feedback.classList.add("d-none");
              }
            }
          } else {
            this.classList.remove("is-invalid");
            this.classList.add("is-valid");
          }
        }
      });

      input.addEventListener("input", function () {
        if (this.classList.contains("is-invalid")) {
          this.classList.remove("is-invalid");
          const feedback = this.parentElement.nextElementSibling;
          if (feedback && feedback.classList.contains("invalid-feedback")) {
            feedback.classList.add("d-none");
          }
        }
      });
    });
  }
});

function validatePassword(password) {
  const errors = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter (A-Z)");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter (a-z)");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number (0-9)");
  }

  if (!/[@$!%*?&]/.test(password)) {
    errors.push(
      "Password must contain at least one special character (@$!%*?&)"
    );
  }

  return errors;
}

