import { setMessage, clearMessage } from "./main.js";

const form = document.querySelector("#login-form");
const username = document.querySelector("#username");
const password = document.querySelector("#password");
const message = document.querySelector("#login-message");
const passwordToggle = document.querySelector("#password-toggle");

passwordToggle.addEventListener("click", () => {
  const visible = password.type === "password";
  password.type = visible ? "text" : "password";
  passwordToggle.textContent = visible ? "Hide" : "Show";
  passwordToggle.setAttribute("aria-pressed", String(visible));
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearMessage(message);
  const usernameError = document.querySelector("#username-error");
  const passwordError = document.querySelector("#password-error");
  usernameError.textContent = "";
  passwordError.textContent = "";
  username.removeAttribute("aria-invalid");
  password.removeAttribute("aria-invalid");

  if (!username.value.trim()) {
    usernameError.textContent = "Enter a username.";
    username.setAttribute("aria-invalid", "true");
  }
  if (!password.value) {
    passwordError.textContent = "Enter a password.";
    password.setAttribute("aria-invalid", "true");
  }
  if (!username.value.trim() || !password.value) {
    setMessage(message, "Complete both fields to continue.", "error");
    return;
  }
  window.location.href = "admin/dashboard.html";
});
