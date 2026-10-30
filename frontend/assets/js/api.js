const apiRoot = new URL("../../../backend/api/", import.meta.url);
const loginUrl = new URL("../../login.html", import.meta.url);
let csrfToken = "";

export class ApiError extends Error {
  constructor(message, status = 0, errors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

async function request(path, { method = "GET", body, csrf = false } = {}) {
  const normalizedMethod = method.toUpperCase();
  if (csrf && !csrfToken) await getCsrfToken();

  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (csrf) headers["X-CSRF-Token"] = csrfToken;

  let response;
  try {
    response = await fetch(new URL(path, apiRoot), {
      method: normalizedMethod,
      credentials: "same-origin",
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Unable to reach the server. Check your connection and try again.");
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError("The server returned an unreadable response.", response.status);
  }

  if (payload?.data?.csrfToken) csrfToken = payload.data.csrfToken;
  if (!response.ok || payload?.success !== true) {
    if (response.status === 401 && !path.startsWith("auth/login.php") && !path.startsWith("auth/csrf.php")) {
      window.location.assign(`${loginUrl.href}?expired=1`);
    }
    throw new ApiError(
      payload?.message || "The request could not be completed.",
      response.status,
      payload?.errors || {},
    );
  }
  return payload;
}

export async function getCsrfToken() {
  const response = await request("auth/csrf.php");
  csrfToken = response.data.csrfToken;
  return csrfToken;
}

export function apiGet(path, parameters = {}) {
  const url = new URL(path, apiRoot);
  Object.entries(parameters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return request(`${url.pathname.replace(apiRoot.pathname, "")}${url.search}`);
}

export function apiPost(path, body = {}) {
  return request(path, { method: "POST", body, csrf: true });
}

export function apiPut(path, body) {
  return request(path, { method: "PUT", body, csrf: true });
}

export function apiDelete(path) {
  return request(path, { method: "DELETE", csrf: true });
}

export function clearFieldErrors(form) {
  form.querySelectorAll(".field-error").forEach((element) => { element.textContent = ""; });
  form.querySelectorAll("[aria-invalid='true']").forEach((element) => element.removeAttribute("aria-invalid"));
}

export function showFieldErrors(form, errors) {
  Object.entries(errors).forEach(([name, message]) => {
    const field = form.elements.namedItem(name);
    if (field && "setAttribute" in field) field.setAttribute("aria-invalid", "true");
    const errorElement = [...form.querySelectorAll(".field-error")]
      .find((element) => element.id === `${name}-error`);
    if (errorElement) errorElement.textContent = message;
  });
}
