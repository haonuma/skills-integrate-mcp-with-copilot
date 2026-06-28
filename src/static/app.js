document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  const signupNote = document.getElementById("signup-note");
  const authStatus = document.getElementById("auth-status");
  const authMenu = document.getElementById("auth-menu");
  const authMenuToggle = document.getElementById("auth-menu-toggle");
  const openLoginModalBtn = document.getElementById("open-login-modal");
  const logoutBtn = document.getElementById("logout-btn");
  const loginModal = document.getElementById("login-modal");
  const closeLoginModalBtn = document.getElementById("close-login-modal");
  const loginForm = document.getElementById("login-form");

  let teacherSession = { logged_in: false };

  function showMessage(text, isError = false) {
    messageDiv.textContent = text;
    messageDiv.className = isError ? "error" : "success";
    messageDiv.classList.remove("hidden");

    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  function applyTeacherMode() {
    const isTeacher = teacherSession.logged_in;

    signupForm.classList.toggle("hidden", !isTeacher);
    signupNote.classList.toggle("hidden", isTeacher);
    openLoginModalBtn.classList.toggle("hidden", isTeacher);
    logoutBtn.classList.toggle("hidden", !isTeacher);

    authStatus.textContent = isTeacher
      ? `Teacher mode: ${teacherSession.username}`
      : "Student view";
  }

  async function fetchSession() {
    try {
      const response = await fetch("/auth/session");
      teacherSession = await response.json();
      applyTeacherMode();
    } catch (error) {
      teacherSession = { logged_in: false };
      applyTeacherMode();
      console.error("Error fetching session:", error);
    }
  }

  function closeModal() {
    loginModal.classList.add("hidden");
    loginForm.reset();
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft =
          details.max_participants - details.participants.length;

        // Create participants HTML with delete icons instead of bullet points
        const participantsHTML =
          details.participants.length > 0
            ? `<div class="participants-section">
              <h5>Participants:</h5>
              <ul class="participants-list">
                ${details.participants
                  .map(
                    (email) =>
                      `<li><span class="participant-email">${email}</span>${
                        teacherSession.logged_in
                          ? `<button class="delete-btn" data-activity="${name}" data-email="${email}">❌</button>`
                          : ""
                      }</li>`
                  )
                  .join("")}
              </ul>
            </div>`
            : `<p><em>No participants yet</em></p>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-container">
            ${participantsHTML}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Add event listeners to delete buttons
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleUnregister);
      });
    } catch (error) {
      activitiesList.innerHTML =
        "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle unregister functionality
  async function handleUnregister(event) {
    const button = event.target;
    const activity = button.getAttribute("data-activity");
    const email = button.getAttribute("data-email");

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message);

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        showMessage(result.detail || "An error occurred", true);
      }
    } catch (error) {
      showMessage("Failed to unregister. Please try again.", true);
      console.error("Error unregistering:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message);
        signupForm.reset();

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        showMessage(result.detail || "An error occurred", true);
      }
    } catch (error) {
      showMessage("Failed to sign up. Please try again.", true);
      console.error("Error signing up:", error);
    }
  });

  authMenuToggle.addEventListener("click", () => {
    authMenu.classList.toggle("hidden");
  });

  openLoginModalBtn.addEventListener("click", () => {
    loginModal.classList.remove("hidden");
    authMenu.classList.add("hidden");
  });

  closeLoginModalBtn.addEventListener("click", closeModal);

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("teacher-username").value;
    const password = document.getElementById("teacher-password").value;

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();
      if (!response.ok) {
        showMessage(result.detail || "Login failed.", true);
        return;
      }

      teacherSession = { logged_in: true, username: result.username };
      applyTeacherMode();
      closeModal();
      fetchActivities();
      showMessage("Teacher login successful.");
    } catch (error) {
      showMessage("Login failed. Please try again.", true);
      console.error("Error logging in:", error);
    }
  });

  logoutBtn.addEventListener("click", async () => {
    try {
      await fetch("/auth/logout", { method: "POST" });
      teacherSession = { logged_in: false };
      applyTeacherMode();
      authMenu.classList.add("hidden");
      fetchActivities();
      showMessage("Logged out.");
    } catch (error) {
      showMessage("Logout failed. Please try again.", true);
      console.error("Error logging out:", error);
    }
  });

  loginModal.addEventListener("click", (event) => {
    if (event.target === loginModal) {
      closeModal();
    }
  });

  // Initialize app
  fetchSession().then(fetchActivities);
});
