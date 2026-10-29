import { courses, students, createId, formatDate, getCourseById, getStudentFullName } from "./data.js";
import { appendCell, clearMessage, createButton, setMessage, showEmptyState } from "./main.js";
import { populateCourseSelect, validateStudentForm } from "./student-form-validation.js";

const pageSize = 5;
const searchInput = document.querySelector("#student-search");
const courseFilter = document.querySelector("#course-filter");
const yearFilter = document.querySelector("#year-filter");
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
let currentPage = 1;
let editingId = null;
let pendingDeleteId = null;

courses.forEach((course) => {
  const option = new Option(`${course.courseCode} — ${course.courseName}`, course.id);
  courseFilter.add(option);
});
const initialCourse = new URLSearchParams(window.location.search).get("course");
if (courses.some((course) => course.id === initialCourse)) courseFilter.value = initialCourse;

function renderStudents() {
  const term = searchInput.value.trim().toLocaleLowerCase();
  const matching = students.filter((student) => {
    const matchesText = !term || student.studentNumber.toLocaleLowerCase().includes(term)
      || getStudentFullName(student).toLocaleLowerCase().includes(term);
    return matchesText
      && (!courseFilter.value || student.courseId === courseFilter.value)
      && (!yearFilter.value || String(student.yearLevel) === yearFilter.value);
  });
  const totalPages = Math.max(1, Math.ceil(matching.length / pageSize));
  currentPage = Math.min(currentPage, totalPages);
  resultCount.textContent = `${matching.length} matching ${matching.length === 1 ? "student" : "students"}`;
  pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
  previousButton.disabled = currentPage <= 1;
  nextButton.disabled = currentPage >= totalPages;

  if (!matching.length) {
    showEmptyState(tableContainer, students.length ? "No matching students" : "No student records", students.length ? "Try changing or clearing the filters." : "Add a student to begin.");
    return;
  }
  const table = document.createElement("table");
  table.className = "data-table";
  const caption = document.createElement("caption");
  caption.className = "sr-only";
  caption.textContent = "Student records";
  table.append(caption);
  const header = table.createTHead().insertRow();
  ["Student number", "Full name", "Gender", "Course", "Year", "Email", "Registered", "Actions"].forEach((label) => appendCell(header, label, { header: true }));
  const body = table.createTBody();
  matching.slice((currentPage - 1) * pageSize, currentPage * pageSize).forEach((student) => {
    const row = body.insertRow();
    appendCell(row, student.studentNumber);
    appendCell(row, getStudentFullName(student));
    appendCell(row, student.gender);
    appendCell(row, getCourseById(student.courseId)?.courseCode ?? "Unassigned");
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

function openStudentDialog(student = null) {
  editingId = student?.id ?? null;
  form.reset();
  clearMessage(dialogMessage);
  document.querySelector("#student-dialog-title").textContent = editingId ? "Edit student" : "Add student";
  document.querySelector("#studentNumber").readOnly = false;
  populateCourseSelect(form.elements.courseId, courses, student?.courseId ?? "", student?.courseId ?? "");
  if (student) {
    Object.entries(student).forEach(([key, value]) => {
      if (form.elements.namedItem(key)) form.elements.namedItem(key).value = String(value ?? "");
    });
    document.querySelector("#studentNumber").readOnly = false;
  }
  dialog.showModal();
  form.elements.studentNumber.focus();
}

function askDelete(student) {
  pendingDeleteId = student.id;
  document.querySelector("#delete-description").textContent = `Delete ${getStudentFullName(student)} (${student.studentNumber})? This cannot be undone on this page.`;
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
[searchInput, courseFilter, yearFilter].forEach((control) => control.addEventListener("input", () => {
  currentPage = 1;
  renderStudents();
}));
previousButton.addEventListener("click", () => { currentPage -= 1; renderStudents(); });
nextButton.addEventListener("click", () => { currentPage += 1; renderStudents(); });
document.querySelectorAll("[data-close-dialog]").forEach((button) => button.addEventListener("click", () => dialog.close()));
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
document.querySelector("#cancel-delete").addEventListener("click", () => {
  pendingDeleteId = null;
  deleteDialog.close();
});
document.querySelector("#confirm-delete").addEventListener("click", () => {
  const index = students.findIndex((student) => student.id === pendingDeleteId);
  if (index < 0) {
    setMessage(feedback, "That student could not be found. The list has been refreshed.", "error");
  } else {
    const [removed] = students.splice(index, 1);
    setMessage(feedback, `${getStudentFullName(removed)} was removed from the current demonstration.`, "success");
  }
  pendingDeleteId = null;
  deleteDialog.close();
  renderStudents();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearMessage(dialogMessage);
  const result = validateStudentForm(form, students, editingId);
  if (!result.valid) {
    setMessage(dialogMessage, "Review the highlighted fields and correct the errors.", "error");
    form.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }
  const today = new Date().toISOString().slice(0, 10);
  if (editingId) {
    const student = students.find((item) => item.id === editingId);
    if (!student) {
      setMessage(dialogMessage, "This student could not be found. Close the form and refresh the list.", "error");
      return;
    }
    Object.assign(student, result.record, { updatedAt: today });
    setMessage(feedback, "Student updated for this demonstration.", "success");
  } else {
    students.push({ id: createId("student"), ...result.record, createdAt: today, updatedAt: today });
    setMessage(feedback, "Student added for this demonstration.", "success");
  }
  dialog.close();
  currentPage = 1;
  renderStudents();
});

renderStudents();
