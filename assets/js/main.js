const sidebar = document.querySelector(".sidebar");
const menuToggle = document.querySelector(".menu-toggle");

if (sidebar && menuToggle) {
  menuToggle.addEventListener("click", () => {
    const isOpen = sidebar.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (window.innerWidth <= 760 && sidebar.classList.contains("is-open")
      && !sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
      sidebar.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
}

document.querySelectorAll("[data-demo-logout]").forEach((button) => {
  button.addEventListener("click", () => {
    window.location.href = "../login.html";
  });
});

export function setMessage(element, message, type = "info") {
  if (!element) return;
  element.textContent = message;
  element.className = `form-message message-${type}`;
  element.hidden = false;
}

export function clearMessage(element) {
  if (!element) return;
  element.textContent = "";
  element.hidden = true;
}

export function appendCell(row, value, options = {}) {
  const cell = document.createElement(options.header ? "th" : "td");
  if (options.header) cell.scope = "col";
  cell.textContent = value ?? "—";
  row.append(cell);
  return cell;
}

export function createButton(label, className, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `button button-small ${className}`;
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

export function showEmptyState(container, heading, detail) {
  const state = document.createElement("div");
  state.className = "empty-state";
  const title = document.createElement("strong");
  title.textContent = heading;
  const text = document.createElement("span");
  text.textContent = detail;
  state.append(title, text);
  container.replaceChildren(state);
}
