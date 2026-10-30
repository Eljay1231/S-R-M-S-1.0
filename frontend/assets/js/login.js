import { setMessage, clearMessage } from "./main.js";
import { ApiError, apiPost, clearFieldErrors, getCsrfToken, showFieldErrors } from "./api.js";

const form = document.querySelector("#login-form");
const username = document.querySelector("#username");
const password = document.querySelector("#password");
const message = document.querySelector("#login-message");
const passwordToggle = document.querySelector("#password-toggle");

if (new URLSearchParams(window.location.search).get("expired") === "1") {
  setMessage(message, "Your session has expired. Sign in again.", "error");
}

passwordToggle.addEventListener("click", () => {
  const visible = password.type === "password";
  password.type = visible ? "text" : "password";
  passwordToggle.textContent = visible ? "Hide" : "Show";
  passwordToggle.setAttribute("aria-pressed", String(visible));
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage(message);
  clearFieldErrors(form);

  if (!username.value.trim()) {
    document.querySelector("#username-error").textContent = "Enter a username.";
    username.setAttribute("aria-invalid", "true");
  }
  if (!password.value) {
    document.querySelector("#password-error").textContent = "Enter a password.";
    password.setAttribute("aria-invalid", "true");
  }
  if (!username.value.trim() || !password.value) {
    setMessage(message, "Complete both fields to continue.", "error");
    return;
  }

  const submitButton = form.querySelector('[type="submit"]');
  submitButton.disabled = true;
  try {
    await getCsrfToken();
    await apiPost("auth/login.php", {
      username: username.value.trim(),
      password: password.value,
    });
    window.location.href = "admin/dashboard.html";
  } catch (error) {
    if (error instanceof ApiError && error.errors) showFieldErrors(form, error.errors);
    setMessage(message, error.message || "Unable to sign in. Try again.", "error");
  } finally {
    submitButton.disabled = false;
  }
});
