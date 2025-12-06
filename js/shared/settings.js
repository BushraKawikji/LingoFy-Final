document.addEventListener("DOMContentLoaded", function() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  
  if (!currentUser) {
    Swal.fire({
      icon: "error",
      title: "Access Denied",
      text: "Please log in to access settings.",
      confirmButtonColor: "#dc3545",
    }).then(() => {
      window.location.href = "login.html";
    });
    return;
  }

  loadUserData(currentUser);
  loadNotificationSettings();
  loadAppearanceSettings();

  setupFormHandlers();
});

function loadUserData(user) {
  document.getElementById("fullName").value = user.fullName || "";
  document.getElementById("email").value = user.email || "";
}

function loadNotificationSettings() {
  const settings = JSON.parse(localStorage.getItem("notificationSettings")) || {
    emailTestResults: true,
    emailNewTests: true,
    emailUpdates: false,
    appReminders: true,
    appAchievements: true
  };

  document.getElementById("emailTestResults").checked = settings.emailTestResults;
  document.getElementById("emailNewTests").checked = settings.emailNewTests;
  document.getElementById("emailUpdates").checked = settings.emailUpdates;
  document.getElementById("appReminders").checked = settings.appReminders;
  document.getElementById("appAchievements").checked = settings.appAchievements;
}

function loadAppearanceSettings() {
  const settings = JSON.parse(localStorage.getItem("appearanceSettings")) || {
    theme: "light",
    language: "en"
  };

  const themeRadio = document.querySelector(`input[name="theme"][value="${settings.theme}"]`);
  if (themeRadio) {
    themeRadio.checked = true;
    updateThemeSelection(settings.theme);
  }

  document.getElementById("languageSelect").value = settings.language;
}

function setupFormHandlers() {
  document.getElementById("profileForm").addEventListener("submit", function(e) {
    e.preventDefault();
    saveProfileSettings();
  });

  document.getElementById("passwordForm").addEventListener("submit", function(e) {
    e.preventDefault();
    changePassword();
  });

  document.getElementById("notificationsForm").addEventListener("submit", function(e) {
    e.preventDefault();
    saveNotificationSettings();
  });

  document.getElementById("appearanceForm").addEventListener("submit", function(e) {
    e.preventDefault();
    saveAppearanceSettings();
  });

  document.querySelectorAll('input[name="theme"]').forEach(radio => {
    radio.addEventListener("change", function() {
      updateThemeSelection(this.value);
    });
  });

  document.getElementById("themeLight").addEventListener("click", function() {
    document.querySelector('input[name="theme"][value="light"]').checked = true;
    updateThemeSelection("light");
  });

  document.getElementById("themeDark").addEventListener("click", function() {
    document.querySelector('input[name="theme"][value="dark"]').checked = true;
    updateThemeSelection("dark");
  });

  document.getElementById("themeAuto").addEventListener("click", function() {
    document.querySelector('input[name="theme"][value="auto"]').checked = true;
    updateThemeSelection("auto");
  });
}

function saveProfileSettings() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const allUsers = JSON.parse(localStorage.getItem("users")) || [];
  const fullName = document.getElementById("fullName").value.trim();

  if (!fullName) {
    Swal.fire({
      icon: "warning",
      title: "Invalid Input",
      text: "Please enter your full name.",
      confirmButtonColor: "#ffc107",
    });
    return;
  }

  const userIndex = allUsers.findIndex(u => u.id === currentUser.id);
  if (userIndex !== -1) {
    allUsers[userIndex].fullName = fullName;
    localStorage.setItem("users", JSON.stringify(allUsers));
  }

  currentUser.fullName = fullName;
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  Swal.fire({
    icon: "success",
    title: "Profile Updated!",
    text: "Your profile has been updated successfully.",
    confirmButtonColor: "#198754",
    timer: 2000
  });
}

function changePassword() {
  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!currentPassword || !newPassword || !confirmPassword) {
    Swal.fire({
      icon: "warning",
      title: "Missing Fields",
      text: "Please fill all password fields.",
      confirmButtonColor: "#ffc107",
    });
    return;
  }

  if (newPassword.length < 6) {
    Swal.fire({
      icon: "warning",
      title: "Weak Password",
      text: "Password must be at least 6 characters long.",
      confirmButtonColor: "#ffc107",
    });
    return;
  }

  if (newPassword !== confirmPassword) {
    Swal.fire({
      icon: "error",
      title: "Password Mismatch",
      text: "New password and confirm password do not match.",
      confirmButtonColor: "#dc3545",
    });
    return;
  }

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const allUsers = JSON.parse(localStorage.getItem("users")) || [];
  
  const userIndex = allUsers.findIndex(u => u.id === currentUser.id);
  if (userIndex === -1) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "User not found.",
      confirmButtonColor: "#dc3545",
    });
    return;
  }

  if (allUsers[userIndex].password !== currentPassword) {
    Swal.fire({
      icon: "error",
      title: "Incorrect Password",
      text: "Current password is incorrect.",
      confirmButtonColor: "#dc3545",
    });
    return;
  }

  allUsers[userIndex].password = newPassword;
  localStorage.setItem("users", JSON.stringify(allUsers));

  document.getElementById("passwordForm").reset();

  Swal.fire({
    icon: "success",
    title: "Password Updated!",
    text: "Your password has been changed successfully.",
    confirmButtonColor: "#198754",
    timer: 2000
  });
}

function saveNotificationSettings() {
  const settings = {
    emailTestResults: document.getElementById("emailTestResults").checked,
    emailNewTests: document.getElementById("emailNewTests").checked,
    emailUpdates: document.getElementById("emailUpdates").checked,
    appReminders: document.getElementById("appReminders").checked,
    appAchievements: document.getElementById("appAchievements").checked
  };

  localStorage.setItem("notificationSettings", JSON.stringify(settings));

  Swal.fire({
    icon: "success",
    title: "Settings Saved!",
    text: "Your notification preferences have been saved.",
    confirmButtonColor: "#198754",
    timer: 2000
  });
}

function saveAppearanceSettings() {
  const theme = document.querySelector('input[name="theme"]:checked').value;
  const language = document.getElementById("languageSelect").value;

  const settings = {
    theme: theme,
    language: language
  };

  localStorage.setItem("appearanceSettings", JSON.stringify(settings));

  applyTheme(theme);

  Swal.fire({
    icon: "success",
    title: "Appearance Saved!",
    text: "Your appearance settings have been saved.",
    confirmButtonColor: "#198754",
    timer: 2000
  });
}

function updateThemeSelection(theme) {
  document.querySelectorAll('[id^="theme"]').forEach(card => {
    card.classList.remove("border-primary", "border-2");
    card.classList.add("border");
  });

  const selectedCard = document.getElementById(`theme${theme.charAt(0).toUpperCase() + theme.slice(1)}`);
  if (selectedCard) {
    selectedCard.classList.remove("border");
    selectedCard.classList.add("border-primary", "border-2");
  }
}

function applyTheme(theme) {
  document.body.classList.remove("theme-light", "theme-dark");
  
  if (theme === "dark") {
    document.body.classList.add("theme-dark");
  } else if (theme === "light") {
    document.body.classList.add("theme-light");
  } else {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.classList.add("theme-dark");
    } else {
      document.body.classList.add("theme-light");
    }
  }
}

