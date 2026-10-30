import { apiGet, apiPost, apiPut, clearFieldErrors, showFieldErrors } from "./api.js";
import { appendCell, clearMessage, createButton, setMessage, showEmptyState } from "./main.js";

const search = document.querySelector("#course-search");
const container = document.querySelector("#course-table");
const resultCount = document.querySelector("#course-result-count");
const feedback = document.querySelector("#course-feedback");
const formMessage = document.querySelector("#course-form-message");
const dialog = document.querySelector("#course-dialog");
const form = document.querySelector("#course-form");
const deactivateDialog = document.querySelector("#deactivate-dialog");
let courses = [];
let editingCourse = null;
let pendingStatus = null;
let searchTimer = null;
let latestListRequest = 0;

function renderCourses() {
  if (!courses.length) {
    showEmptyState(container, search.value ? "No matching courses" : "No courses available", search.value ? "Try another search." : "Add a course to begin.");
    return;
  }
  const table = document.createElement("table");
  table.className = "data-table";
  const caption = document.createElement("caption");
  caption.className = "sr-only";
  caption.textContent = "Course management";
  table.append(caption);
  const header = table.createTHead().insertRow();
  ["Course code", "Course name", "Description", "Status", "Students", "Actions"]
    .forEach((label) => appendCell(header, label, { header: true }));
  const body = table.createTBody();
  courses.forEach((course) => {
    const row = body.insertRow();
    appendCell(row, course.courseCode);
    appendCell(row, course.courseName);
    appendCell(row, course.description || "—");
    const status = appendCell(row, "");
    const statusLabel = document.createElement("span");
    statusLabel.className = `status ${course.status === "active" ? "status-active" : "status-inactive"}`;
    statusLabel.textContent = course.status === "active" ? "Active" : "Inactive";
    status.append(statusLabel);
    appendCell(row, String(course.studentCount));
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
    const nextStatus = course.status === "active" ? "inactive" : "active";
    group.append(createButton(
      course.status === "active" ? "Deactivate" : "Activate",
      "button-secondary",
      () => askStatusChange(course, nextStatus),
    ));
    actions.append(group);
  });
  const wrapper = document.createElement("div");
  wrapper.className = "table-wrap";
  wrapper.append(table);
  container.replaceChildren(wrapper);
}

async function loadCourses() {
  const requestId = ++latestListRequest;
  showEmptyState(container, "Loading courses", "Retrieving records from the server.");
  try {
    const { data } = await apiGet("courses/index.php", { search: search.value.trim() });
    if (requestId !== latestListRequest) return;
    courses = data.items;
    resultCount.textContent = `${courses.length} ${courses.length === 1 ? "course" : "courses"}`;
    renderCourses();
  } catch (error) {
    if (requestId !== latestListRequest) return;
    if (error.status === 401) return;
    setMessage(feedback, error.message || "Unable to load courses.", "error");
    showEmptyState(container, "Courses could not be loaded", "Check the server connection and try again.");
  }
}

function openCourseDialog(course = null) {
  editingCourse = course;
  form.reset();
  clearMessage(formMessage);
  clearFieldErrors(form);
  document.querySelector("#course-dialog-title").textContent = course ? "Edit course" : "Add course";
  if (course) {
    form.elements.courseCode.value = course.courseCode;
    form.elements.courseName.value = course.courseName;
    form.elements.description.value = course.description ?? "";
  }
  dialog.showModal();
  form.elements.courseCode.focus();
}

function askStatusChange(course, status) {
  pendingStatus = { id: course.id, status };
  const action = status === "active" ? "Activate" : "Deactivate";
  document.querySelector("#deactivate-title").textContent = `${action} course?`;
  document.querySelector("#deactivate-description").textContent = `${action} ${course.courseCode} — ${course.courseName}?`;
  document.querySelector("#confirm-deactivate").textContent = `${action} course`;
  document.querySelector("#deactivate-dialog .dialog-body p:last-child").textContent = status === "active"
    ? "This course will be available for new student records."
    : "Current students remain assigned. New students cannot select this course.";
  deactivateDialog.showModal();
}

document.querySelector("#add-course").addEventListener("click", () => openCourseDialog());
search.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadCourses, 250);
});
document.querySelectorAll("[data-close-course-dialog]").forEach((button) => {
  button.addEventListener("click", () => dialog.close());
});
document.querySelector("#cancel-deactivate").addEventListener("click", () => {
  pendingStatus = null;
  deactivateDialog.close();
});
document.querySelector("#confirm-deactivate").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  if (!pendingStatus) return;
  button.disabled = true;
  try {
    await apiPost(`courses/status.php?id=${encodeURIComponent(pendingStatus.id)}`, { status: pendingStatus.status });
    setMessage(feedback, `Course ${pendingStatus.status === "active" ? "activated" : "deactivated"} successfully.`, "success");
    pendingStatus = null;
    deactivateDialog.close();
    await loadCourses();
  } catch (error) {
    if (error.status !== 401) setMessage(feedback, error.message || "Unable to update course status.", "error");
  } finally {
    button.disabled = false;
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage(formMessage);
  clearFieldErrors(form);
  const course = {
    courseCode: form.elements.courseCode.value.trim(),
    courseName: form.elements.courseName.value.trim(),
    description: form.elements.description.value.trim(),
  };
  const errors = {};
  if (!course.courseCode) errors.courseCode = "Course code is required.";
  if (course.courseCode.length > 20) errors.courseCode = "Use 20 characters or fewer.";
  if (!course.courseName) errors.courseName = "Course name is required.";
  if (course.courseName.length > 120) errors.courseName = "Use 120 characters or fewer.";
  if (course.description.length > 240) errors.description = "Use 240 characters or fewer.";
  if (Object.keys(errors).length) {
    showFieldErrors(form, errors);
    setMessage(formMessage, "Review the highlighted fields and correct the errors.", "error");
    form.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }

  const submitButton = form.querySelector('[type="submit"]');
  submitButton.disabled = true;
  try {
    if (editingCourse) {
      await apiPut(`courses/update.php?id=${encodeURIComponent(editingCourse.id)}`, course);
      setMessage(feedback, "Course updated successfully.", "success");
    } else {
      await apiPost("courses/create.php", course);
      setMessage(feedback, "Course created successfully.", "success");
    }
    dialog.close();
    await loadCourses();
  } catch (error) {
    if (error.errors) showFieldErrors(form, error.errors);
    setMessage(formMessage, error.message || "Unable to save this course.", "error");
    form.querySelector('[aria-invalid="true"]')?.focus();
  } finally {
    submitButton.disabled = false;
  }
});

loadCourses();
