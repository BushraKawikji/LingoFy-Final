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
  const loginForm = document.getElementById("loginForm");
  const toggleLoginPassword = document.getElementById("toggleLoginPassword");
  const loginPasswordInput = document.getElementById("loginPassword");

  if (toggleLoginPassword && loginPasswordInput) {
    toggleLoginPassword.addEventListener("click", function () {
      const type =
        loginPasswordInput.getAttribute("type") === "password"
          ? "text"
          : "password";
      loginPasswordInput.setAttribute("type", type);

      const icon = toggleLoginPassword.querySelector("i");
      icon.classList.toggle("bi-eye");
      icon.classList.toggle("bi-eye-slash");
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      clearValidation("loginForm");

      const requiredInputs = loginForm.querySelectorAll("input[required]");
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
          username: document.getElementById("username").value,
          password: loginPasswordInput.value,
        };

        const user = validateUser(formData.username, formData.password);

        if (user) {
          localStorage.setItem("currentUser", JSON.stringify(user));

          Swal.fire({
            icon: "success",
            title: "Login Successful!",
            text: `Welcome back, ${user.fullName}!`,
            confirmButtonColor: "#28a745",
            confirmButtonText: "Continue",
          }).then((result) => {
            if (
              result.isConfirmed ||
              result.dismiss === Swal.DismissReason.timer
            ) {
              if (user.role === "admin") {
                window.location.href = "admin-dashboard.html";
              } else {
                window.location.href = "user-dashboard.html";
              }
            }
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Login Failed",
            text: "Invalid username/email or password. Please try again.",
            confirmButtonColor: "#dc3545",
            confirmButtonText: "OK",
          });

          const usernameInput = document.getElementById("username");
          const passwordInput = document.getElementById("loginPassword");

          usernameInput.classList.add("is-invalid");
          passwordInput.classList.add("is-invalid");

          const usernameFeedback =
            usernameInput.parentElement.nextElementSibling;
          const passwordFeedback =
            passwordInput.parentElement.nextElementSibling;

          if (usernameFeedback) {
            usernameFeedback.classList.remove("d-none");
            usernameFeedback.textContent = "Invalid username/email or password";
          }

          if (passwordFeedback) {
            passwordFeedback.classList.remove("d-none");
            passwordFeedback.textContent = "Invalid username/email or password";
          }
        }
      } else {
        Swal.fire({
          icon: "warning",
          title: "Missing Required Fields",
          text: "Please fill in all required fields",
          confirmButtonColor: "#ffc107",
          confirmButtonText: "OK",
        });
      }
    });

    const inputs = loginForm.querySelectorAll("input");
    inputs.forEach((input) => {
      input.addEventListener("blur", function () {
        if (this.hasAttribute("required") && !this.value.trim()) {
          this.classList.add("is-invalid");
          const feedback = this.parentElement.nextElementSibling;
          if (feedback && feedback.classList.contains("invalid-feedback")) {
            feedback.classList.remove("d-none");
          }
        } else {
          this.classList.remove("is-invalid");
          this.classList.add("is-valid");
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

function validateUser(usernameOrEmail, password) {
  const users = JSON.parse(localStorage.getItem("users")) || [];

  const user = users.find(
    (u) => 
      (u.username && u.username.toLowerCase() === usernameOrEmail.toLowerCase()) ||
      (u.email && u.email.toLowerCase() === usernameOrEmail.toLowerCase()) ||
      (u.fullName && u.fullName.toLowerCase() === usernameOrEmail.toLowerCase())
  );

  if (user && user.password === password) {
    return user;
  }

  return null;
}

