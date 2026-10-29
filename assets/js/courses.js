import { courses, countStudentsByCourse, createId } from "./data.js";
import { appendCell, clearMessage, createButton, setMessage, showEmptyState } from "./main.js";

const search = document.querySelector("#course-search");
const container = document.querySelector("#course-table");
const resultCount = document.querySelector("#course-result-count");
const feedback = document.querySelector("#course-feedback");
const formMessage = document.querySelector("#course-form-message");
const dialog = document.querySelector("#course-dialog");
const form = document.querySelector("#course-form");
const deactivateDialog = document.querySelector("#deactivate-dialog");
let editingId = null;
let pendingDeactivateId = null;

function renderCourses() {
  const term = search.value.trim().toLocaleLowerCase();
  const matching = courses.filter((course) => `${course.courseCode} ${course.courseName} ${course.description}`.toLocaleLowerCase().includes(term));
  resultCount.textContent = `${matching.length} ${matching.length === 1 ? "course" : "courses"}`;
  if (!matching.length) {
    showEmptyState(container, courses.length ? "No matching courses" : "No courses available", courses.length ? "Try another search." : "Add a course to begin.");
    return;
  }
  const table = document.createElement("table");
  table.className = "data-table";
  const caption = document.createElement("caption");
  caption.className = "sr-only";
  caption.textContent = "Course management";
  table.append(caption);
  const header = table.createTHead().insertRow();
  ["Course code", "Course name", "Description", "Status", "Students", "Actions"].forEach((label) => appendCell(header, label, { header: true }));
  const body = table.createTBody();
  matching.forEach((course) => {
    const row = body.insertRow();
    appendCell(row, course.courseCode);
    appendCell(row, course.courseName);
    appendCell(row, course.description || "—");
    const status = appendCell(row, "");
    const statusLabel = document.createElement("span");
    statusLabel.className = `status ${course.status === "Active" ? "status-active" : "status-inactive"}`;
    statusLabel.textContent = course.status;
    status.append(statusLabel);
    appendCell(row, String(countStudentsByCourse(course.id)));
    const actions = appendCell(row, "");
    actions.className = "actions-cell";
    const group = document.createElement("div");
    group.className = "button-group";
    group.append(createButton("Edit", "button-edit", () => openCourseDialog(course)));
    const studentLink = document.createElement("a");
    studentLink.className = "button button-info button-small";
    studentLink.href = `students.html?course=${encodeURIComponent(course.id)}`;
    studentLink.textContent = "View students";
    group.append(studentLink);
    if (course.status === "Active") {
      group.append(createButton("Deactivate", "button-secondary", () => askDeactivate(course)));
    } else {
      group.append(createButton("Activate", "button-secondary", () => {
        course.status = "Active";
        setMessage(feedback, `${course.courseCode} was activated for this demonstration.`, "success");
        renderCourses();
      }));
    }
    actions.append(group);
  });
  const wrapper = document.createElement("div");
  wrapper.className = "table-wrap";
  wrapper.append(table);
  container.replaceChildren(wrapper);
}

function openCourseDialog(course = null) {
  editingId = course?.id ?? null;
  form.reset();
  clearMessage(formMessage);
  document.querySelector("#course-dialog-title").textContent = editingId ? "Edit course" : "Add course";
  if (course) {
    form.elements.courseCode.value = course.courseCode;
    form.elements.courseName.value = course.courseName;
    form.elements.description.value = course.description;
  }
  dialog.showModal();
  form.elements.courseCode.focus();
}

function askDeactivate(course) {
  pendingDeactivateId = course.id;
  document.querySelector("#deactivate-description").textContent = `Deactivate ${course.courseCode} — ${course.courseName}?`;
  deactivateDialog.showModal();
}

document.querySelector("#add-course").addEventListener("click", () => openCourseDialog());
search.addEventListener("input", renderCourses);
document.querySelectorAll("[data-close-course-dialog]").forEach((button) => button.addEventListener("click", () => dialog.close()));
document.querySelector("#cancel-deactivate").addEventListener("click", () => {
  pendingDeactivateId = null;
  deactivateDialog.close();
});
document.querySelector("#confirm-deactivate").addEventListener("click", () => {
  const course = courses.find((item) => item.id === pendingDeactivateId);
  if (!course) {
    setMessage(feedback, "That course could not be found.", "error");
  } else {
    course.status = "Inactive";
    setMessage(feedback, `${course.courseCode} was deactivated. Existing student records were retained.`, "success");
  }
  pendingDeactivateId = null;
  deactivateDialog.close();
  renderCourses();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearMessage(formMessage);
  const code = form.elements.courseCode.value.trim();
  const name = form.elements.courseName.value.trim();
  const description = form.elements.description.value.trim();
  const codeError = document.querySelector("#courseCode-error");
  const nameError = document.querySelector("#courseName-error");
  const descriptionError = document.querySelector("#description-error");
  [codeError, nameError, descriptionError].forEach((element) => { element.textContent = ""; });
  [form.elements.courseCode, form.elements.courseName, form.elements.description].forEach((element) => element.removeAttribute("aria-invalid"));
  const errors = {};
  if (!code) errors.courseCode = "Course code is required.";
  if (code.length > 20) errors.courseCode = "Use 20 characters or fewer.";
  if (!name) errors.courseName = "Course name is required.";
  if (name.length > 120) errors.courseName = "Use 120 characters or fewer.";
  if (description.length > 240) errors.description = "Use 240 characters or fewer.";
  if (courses.some((course) => course.id !== editingId && course.courseCode.toLocaleLowerCase() === code.toLocaleLowerCase())) {
    errors.courseCode = "This course code is already in use.";
  }
  Object.entries(errors).forEach(([field, error]) => {
    form.elements.namedItem(field).setAttribute("aria-invalid", "true");
    document.querySelector(`#${field}-error`).textContent = error;
  });
  if (Object.keys(errors).length) {
    setMessage(formMessage, "Review the highlighted fields and correct the errors.", "error");
    form.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }
  if (editingId) {
    const course = courses.find((item) => item.id === editingId);
    if (!course) {
      setMessage(formMessage, "This course could not be found. Close the form and refresh the list.", "error");
      return;
    }
    Object.assign(course, { courseCode: code, courseName: name, description });
    setMessage(feedback, "Course updated for this demonstration.", "success");
  } else {
    courses.push({ id: createId("course"), courseCode: code, courseName: name, description, status: "Active", createdAt: new Date().toISOString().slice(0, 10) });
    setMessage(feedback, "Course added for this demonstration.", "success");
  }
  dialog.close();
  renderCourses();
});

renderCourses();
