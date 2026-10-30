import { apiDelete, apiGet, apiPost, apiPut, showFieldErrors } from "./api.js";
import { formatDate, getStudentFullName } from "./data.js";
import { appendCell, clearMessage, createButton, setMessage, showEmptyState } from "./main.js";
import { populateCourseSelect, validateStudentForm } from "./student-form-validation.js";

const searchInput = document.querySelector("#student-search");
const courseFilter = document.querySelector("#course-filter");
const yearFilter = document.querySelector("#year-filter");
const pageSizeControl = document.querySelector("#page-size");
const tableContainer = document.querySelector("#student-table");
const resultCount = document.querySelector("#student-result-count");
const pageIndicator = document.querySelector("#page-indicator");
const previousButton = document.querySelector("#previous-page");
const nextButton = document.querySelector("#next-page");
const dialog = document.querySelector("#student-dialog");
const form = document.querySelector("#student-record-form");
const dialogMessage = document.querySelector("#dialog-message");
const deleteDialog = document.querySelector("#delete-dialog");
const feedback = document.querySelector("#student-feedback");
let courses = [];
let students = [];
let currentPage = 1;
let editingStudent = null;
let pendingDeleteId = null;
let searchTimer = null;
let latestListRequest = 0;

function populateCourseOptions() {
  courses.forEach((course) => {
    courseFilter.add(new Option(`${course.courseCode} — ${course.courseName}`, course.id));
  });
  const initialCourse = new URLSearchParams(window.location.search).get("course");
  if (courses.some((course) => String(course.id) === initialCourse)) courseFilter.value = initialCourse;
  populateCourseSelect(form.elements.courseId, courses);
}

function renderStudentTable() {
  if (!students.length) {
    showEmptyState(tableContainer, "No matching students", "Try changing or clearing the filters.");
    return;
  }
  const table = document.createElement("table");
  table.className = "data-table";
  const caption = document.createElement("caption");
  caption.className = "sr-only";
  caption.textContent = "Student records";
  table.append(caption);
  const header = table.createTHead().insertRow();
  ["Student number", "Full name", "Gender", "Course", "Year", "Email", "Registered", "Actions"]
    .forEach((label) => appendCell(header, label, { header: true }));
  const body = table.createTBody();
  students.forEach((student) => {
    const row = body.insertRow();
    appendCell(row, student.studentNumber);
    appendCell(row, getStudentFullName(student));
    appendCell(row, student.gender);
    appendCell(row, student.courseCode || "Unassigned");
    appendCell(row, `Year ${student.yearLevel}`);
    appendCell(row, student.email || "—");
    appendCell(row, formatDate(student.createdAt));
    const actions = appendCell(row, "");
    actions.className = "actions-cell";
    const group = document.createElement("div");
    group.className = "button-group";
    const details = document.createElement("a");
    details.className = "button button-info button-small";
    details.href = `student-details.html?id=${encodeURIComponent(student.id)}`;
    details.textContent = "View";
    group.append(details);
    group.append(createButton("Edit", "button-edit", () => openStudentDialog(student)));
    group.append(createButton("Delete", "button-delete", () => askDelete(student)));
    actions.append(group);
  });
  const wrapper = document.createElement("div");
  wrapper.className = "table-wrap";
  wrapper.append(table);
  tableContainer.replaceChildren(wrapper);
}

async function renderStudents() {
  const requestId = ++latestListRequest;
  showEmptyState(tableContainer, "Loading students", "Retrieving records from the server.");
  try {
    const { data } = await apiGet("students/index.php", {
      search: searchInput.value.trim(),
      courseId: courseFilter.value,
      yearLevel: yearFilter.value,
      page: currentPage,
      pageSize: Number(pageSizeControl.value),
    });
    if (requestId !== latestListRequest) return;
    students = data.items;
    const pagination = data.pagination;
    const totalPages = Math.max(1, pagination.totalPages);
    currentPage = Math.min(currentPage, totalPages);
    if (currentPage !== pagination.page) {
      renderStudents();
      return;
    }
    resultCount.textContent = `${pagination.totalRecords} matching ${pagination.totalRecords === 1 ? "student" : "students"}`;
    pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
    previousButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= totalPages;
    renderStudentTable();
  } catch (error) {
    if (requestId !== latestListRequest) return;
    if (error.status === 401) return;
    setMessage(feedback, error.message || "Unable to load students.", "error");
    showEmptyState(tableContainer, "Students could not be loaded", "Check the server connection and try again.");
  }
}

function openStudentDialog(student = null) {
  editingStudent = student;
  form.reset();
  clearMessage(dialogMessage);
  document.querySelector("#student-dialog-title").textContent = student ? "Edit student" : "Add student";
  populateCourseSelect(form.elements.courseId, courses, student?.courseId ?? "", student?.courseId ?? "");
  if (student) {
    Object.entries(student).forEach(([key, value]) => {
      const field = form.elements.namedItem(key);
      if (field) field.value = String(value ?? "");
    });
  }
  dialog.showModal();
  form.elements.studentNumber.focus();
}

function askDelete(student) {
  pendingDeleteId = student.id;
  document.querySelector("#delete-description").textContent =
    `Delete ${getStudentFullName(student)} (${student.studentNumber})? This cannot be undone.`;
  deleteDialog.showModal();
}

document.querySelector("#add-student").addEventListener("click", () => openStudentDialog());
document.querySelector("#clear-filters").addEventListener("click", () => {
  searchInput.value = "";
  courseFilter.value = "";
  yearFilter.value = "";
  currentPage = 1;
  renderStudents();
});
[searchInput, courseFilter, yearFilter, pageSizeControl].forEach((control) => control.addEventListener("input", () => {
  currentPage = 1;
  if (control === searchInput) {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(renderStudents, 250);
  } else {
    renderStudents();
  }
}));
previousButton.addEventListener("click", () => {
  currentPage = Math.max(1, currentPage - 1);
  renderStudents();
});
nextButton.addEventListener("click", () => {
  currentPage += 1;
  renderStudents();
});
document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => dialog.close());
});
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
document.querySelector("#cancel-delete").addEventListener("click", () => {
  pendingDeleteId = null;
  deleteDialog.close();
});
document.querySelector("#confirm-delete").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  if (pendingDeleteId === null) return;
  button.disabled = true;
  try {
    await apiDelete(`students/delete.php?id=${encodeURIComponent(pendingDeleteId)}`);
    setMessage(feedback, "Student deleted successfully.", "success");
    pendingDeleteId = null;
    deleteDialog.close();
    await renderStudents();
  } catch (error) {
    if (error.status !== 401) setMessage(feedback, error.message || "Unable to delete this student.", "error");
  } finally {
    button.disabled = false;
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage(dialogMessage);
  const result = validateStudentForm(form, courses, editingStudent?.courseId ?? null);
  if (!result.valid) {
    setMessage(dialogMessage, "Review the highlighted fields and correct the errors.", "error");
    form.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }

  const submitButton = form.querySelector('[type="submit"]');
  submitButton.disabled = true;
  try {
    if (editingStudent) {
      await apiPut(`students/update.php?id=${encodeURIComponent(editingStudent.id)}`, result.record);
      setMessage(feedback, "Student updated successfully.", "success");
    } else {
      await apiPost("students/create.php", result.record);
      setMessage(feedback, "Student created successfully.", "success");
    }
    dialog.close();
    currentPage = 1;
    await renderStudents();
  } catch (error) {
    if (error.errors) showFieldErrors(form, error.errors);
    setMessage(dialogMessage, error.message || "Unable to save this student.", "error");
    form.querySelector('[aria-invalid="true"]')?.focus();
  } finally {
    submitButton.disabled = false;
  }
});

async function initialize() {
  try {
    const { data } = await apiGet("courses/index.php");
    courses = data.items;
    populateCourseOptions();
    await renderStudents();
  } catch (error) {
    if (error.status === 401) return;
    setMessage(feedback, error.message || "Unable to load courses.", "error");
    showEmptyState(tableContainer, "Student records are unavailable", "Try refreshing after the server is ready.");
  }
}

initialize();
