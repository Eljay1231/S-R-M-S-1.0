import { ApiError, apiGet, apiPost, apiPut, clearFieldErrors, showFieldErrors } from "./api.js";
import { clearMessage, setMessage } from "./main.js";
import { populateCourseSelect, validateStudentForm } from "./student-form-validation.js";

const form = document.querySelector("#student-page-form");
const message = document.querySelector("#form-message");
const studentId = new URLSearchParams(window.location.search).get("id");
let courses = [];
let existing = null;

async function initialize() {
  try {
    const [courseResponse, studentResponse] = await Promise.all([
      apiGet("courses/index.php"),
      studentId ? apiGet("students/show.php", { id: studentId }) : Promise.resolve(null),
    ]);
    courses = courseResponse.data.items;
    existing = studentResponse?.data.student ?? null;

    if (studentId && !existing) {
      setMessage(message, "This student record could not be found. Return to the student list and choose a valid record.", "error");
      form.hidden = true;
      return;
    }

    if (existing) {
      document.title = "Edit student | Student Records";
      document.querySelector("#page-title").textContent = "Edit student";
      document.querySelector("#form-heading").textContent = `Edit ${existing.firstName} ${existing.lastName}`;
    }
    populateCourseSelect(form.elements.courseId, courses, existing?.courseId ?? "", existing?.courseId ?? "");
    if (existing) {
      Object.entries(existing).forEach(([key, value]) => {
        const field = form.elements.namedItem(key);
        if (field) field.value = String(value ?? "");
      });
    }
  } catch (error) {
    if (error.status !== 401) {
      setMessage(message, error.message || "Unable to load the student form.", "error");
      form.hidden = true;
    }
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage(message);
  clearFieldErrors(form);
  const result = validateStudentForm(form, courses, existing?.courseId ?? null);
  if (!result.valid) {
    setMessage(message, "Review the highlighted fields and correct the errors.", "error");
    form.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }

  const submitButton = form.querySelector('[type="submit"]');
  submitButton.disabled = true;
  try {
    if (existing) {
      const { data } = await apiPut(`students/update.php?id=${encodeURIComponent(existing.id)}`, result.record);
      existing = data.student;
      setMessage(message, "Student updated successfully.", "success");
    } else {
      const { data } = await apiPost("students/create.php", result.record);
      existing = data.student;
      document.title = "Edit student | Student Records";
      document.querySelector("#page-title").textContent = "Edit student";
      document.querySelector("#form-heading").textContent = `Edit ${existing.firstName} ${existing.lastName}`;
      history.replaceState(null, "", `student-form.html?id=${encodeURIComponent(existing.id)}`);
      setMessage(message, "Student created successfully.", "success");
    }
  } catch (error) {
    if (error instanceof ApiError) showFieldErrors(form, error.errors);
    setMessage(message, error.message || "Unable to save this student.", "error");
    form.querySelector('[aria-invalid="true"]')?.focus();
  } finally {
    submitButton.disabled = false;
  }
});

initialize();
