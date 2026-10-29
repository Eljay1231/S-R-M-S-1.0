import { courses, students, createId, getStudentById, getStudentFullName } from "./data.js";
import { clearMessage, setMessage } from "./main.js";
import { populateCourseSelect, validateStudentForm } from "./student-form-validation.js";

const form = document.querySelector("#student-page-form");
const message = document.querySelector("#form-message");
const studentId = new URLSearchParams(window.location.search).get("id");
const existing = studentId ? getStudentById(studentId) : null;

if (studentId && !existing) {
  setMessage(message, "This student record could not be found. Return to the student list and choose a valid record.", "error");
  form.hidden = true;
} else {
  if (existing) {
    document.title = "Edit student | Student Records";
    document.querySelector("#page-title").textContent = "Edit student";
    document.querySelector("#form-heading").textContent = `Edit ${getStudentFullName(existing)}`;
  }
  populateCourseSelect(form.elements.courseId, courses, existing?.courseId ?? "", existing?.courseId ?? "");
  if (existing) {
    Object.entries(existing).forEach(([key, value]) => {
      if (form.elements.namedItem(key)) form.elements.namedItem(key).value = String(value ?? "");
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearMessage(message);
    const result = validateStudentForm(form, students, existing?.id ?? null);
    if (!result.valid) {
      setMessage(message, "Review the highlighted fields and correct the errors.", "error");
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    if (existing) {
      Object.assign(existing, result.record, { updatedAt: today });
    } else {
      const saved = { id: createId("student"), ...result.record, createdAt: today, updatedAt: today };
      students.push(saved);
      form.reset();
    }
    setMessage(message, "Student saved in memory for this demonstration only. Reloading the page resets the sample data.", "success");
  });
}
