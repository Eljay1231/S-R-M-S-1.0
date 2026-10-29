import { courses, students, countStudentsByCourse, getCourseById, getStudentFullName, formatDate } from "./data.js";
import { appendCell, showEmptyState } from "./main.js";

const reportType = document.querySelector("#report-type");
const search = document.querySelector("#report-search");
const courseFilter = document.querySelector("#report-course");
const yearFilter = document.querySelector("#report-year");
const title = document.querySelector("#report-title");
const total = document.querySelector("#report-total");
const content = document.querySelector("#report-content");
const printHeading = document.querySelector("#report-heading");
const courseParam = new URLSearchParams(window.location.search).get("course");

courses.forEach((course) => courseFilter.add(new Option(`${course.courseCode} — ${course.courseName}`, course.id)));
if (courses.some((course) => course.id === courseParam)) {
  courseFilter.value = courseParam;
  reportType.value = "by-course";
}

function renderStudentReport(records) {
  if (!records.length) {
    showEmptyState(content, students.length ? "No matching students" : "No student records", "Adjust the filters or clear them to see available records.");
    total.textContent = "0 matching students";
    return;
  }
  const table = document.createElement("table");
  table.className = "data-table";
  const caption = document.createElement("caption");
  caption.className = "sr-only";
  caption.textContent = title.textContent;
  table.append(caption);
  const header = table.createTHead().insertRow();
  ["Student number", "Full name", "Course", "Year level", "Gender", "Registration date"].forEach((label) => appendCell(header, label, { header: true }));
  const body = table.createTBody();
  records.forEach((student) => {
    const row = body.insertRow();
    appendCell(row, student.studentNumber);
    appendCell(row, getStudentFullName(student));
    appendCell(row, getCourseById(student.courseId)?.courseCode ?? "Unassigned");
    appendCell(row, `Year ${student.yearLevel}`);
    appendCell(row, student.gender);
    appendCell(row, formatDate(student.createdAt));
  });
  const wrapper = document.createElement("div");
  wrapper.className = "table-wrap";
  wrapper.append(table);
  content.replaceChildren(wrapper);
  total.textContent = `${records.length} matching ${records.length === 1 ? "student" : "students"}`;
}

function renderEnrollment() {
  if (!courses.length) {
    showEmptyState(content, "No courses available", "Add a course to see enrollment data.");
    total.textContent = "0 courses";
    return;
  }
  const table = document.createElement("table");
  table.className = "data-table";
  const header = table.createTHead().insertRow();
  ["Course code", "Course name", "Status", "Student count"].forEach((label) => appendCell(header, label, { header: true }));
  const body = table.createTBody();
  courses.filter((course) => !courseFilter.value || course.id === courseFilter.value).forEach((course) => {
    const row = body.insertRow();
    appendCell(row, course.courseCode);
    appendCell(row, course.courseName);
    appendCell(row, course.status);
    appendCell(row, String(countStudentsByCourse(course.id)));
  });
  if (!body.rows.length) {
    showEmptyState(content, "No matching courses", "Choose another course.");
    total.textContent = "0 courses";
    return;
  }
  const wrapper = document.createElement("div");
  wrapper.className = "table-wrap";
  wrapper.append(table);
  content.replaceChildren(wrapper);
  total.textContent = `${body.rows.length} ${body.rows.length === 1 ? "course" : "courses"}`;
}

function render() {
  const isEnrollmentReport = reportType.value === "enrollment";
  search.disabled = isEnrollmentReport;
  yearFilter.disabled = isEnrollmentReport;
  const labels = {
    "all-students": "Complete student list",
    "by-course": courseFilter.value ? `Students by course — ${getCourseById(courseFilter.value)?.courseCode ?? ""}` : "Students by course",
    "by-year": yearFilter.value ? `Students by year level — Year ${yearFilter.value}` : "Students by year level",
    enrollment: "Course enrollment summary",
  };
  title.textContent = labels[reportType.value];
  if (reportType.value === "enrollment") {
    renderEnrollment();
  } else {
    const term = search.value.trim().toLocaleLowerCase();
    const records = students.filter((student) => {
      const matchesTerm = !term || student.studentNumber.toLocaleLowerCase().includes(term)
        || getStudentFullName(student).toLocaleLowerCase().includes(term);
      return matchesTerm
        && (!courseFilter.value || student.courseId === courseFilter.value)
        && (!yearFilter.value || String(student.yearLevel) === yearFilter.value);
    });
    renderStudentReport(records);
  }
  const applied = [];
  if (courseFilter.value) applied.push(`Course: ${getCourseById(courseFilter.value)?.courseCode ?? "—"}`);
  if (yearFilter.value) applied.push(`Year: ${yearFilter.value}`);
  if (search.value.trim()) applied.push(`Search: ${search.value.trim()}`);
  printHeading.textContent = `${title.textContent}\nFilters: ${applied.join(" · ") || "None"}\nGenerated: ${new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date())}`;
  printHeading.style.whiteSpace = "pre-line";
}

[reportType, search, courseFilter, yearFilter].forEach((control) => control.addEventListener("input", render));
document.querySelector("#clear-report-filters").addEventListener("click", () => {
  reportType.value = "all-students";
  search.value = "";
  courseFilter.value = "";
  yearFilter.value = "";
  render();
});
document.querySelector("#print-report").addEventListener("click", () => window.print());
render();
