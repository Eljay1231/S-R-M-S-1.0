import { apiGet } from "./api.js";
import { formatDate, getStudentFullName } from "./data.js";
import { appendCell, setMessage, showEmptyState } from "./main.js";

const reportType = document.querySelector("#report-type");
const search = document.querySelector("#report-search");
const courseFilter = document.querySelector("#report-course");
const yearFilter = document.querySelector("#report-year");
const title = document.querySelector("#report-title");
const total = document.querySelector("#report-total");
const content = document.querySelector("#report-content");
const printHeading = document.querySelector("#report-heading");
const feedback = document.createElement("div");
feedback.className = "form-message";
feedback.setAttribute("role", "status");
feedback.setAttribute("aria-live", "polite");
feedback.hidden = true;
content.before(feedback);
const paginationContainer = document.createElement("div");
paginationContainer.className = "panel-body no-print";
content.after(paginationContainer);
const courseParam = new URLSearchParams(window.location.search).get("course");
const reportTypes = {
  "all-students": "students",
  "by-course": "course",
  "by-year": "year_level",
  enrollment: "enrollment_summary",
};
let courses = [];
let currentPage = 1;
let searchTimer = null;
let latestReportRequest = 0;

function courseById(id) {
  return courses.find((course) => String(course.id) === String(id));
}

function reportTitle() {
  if (reportType.value === "by-course" && courseFilter.value) {
    return `Students by course — ${courseById(courseFilter.value)?.courseCode ?? ""}`;
  }
  if (reportType.value === "by-year" && yearFilter.value) {
    return `Students by year level — Year ${yearFilter.value}`;
  }
  return {
    "all-students": "Complete student list",
    "by-course": "Students by course",
    "by-year": "Students by year level",
    enrollment: "Course enrollment summary",
  }[reportType.value];
}

function renderStudentReport(records, pagination) {
  if (!records.length) {
    showEmptyState(content, "No matching students", "Adjust the filters or clear them to see available records.");
  } else {
    const table = document.createElement("table");
    table.className = "data-table";
    const caption = document.createElement("caption");
    caption.className = "sr-only";
    caption.textContent = title.textContent;
    table.append(caption);
    const header = table.createTHead().insertRow();
    ["Student number", "Full name", "Course", "Year level", "Gender", "Registration date"]
      .forEach((label) => appendCell(header, label, { header: true }));
    const body = table.createTBody();
    records.forEach((student) => {
      const row = body.insertRow();
      appendCell(row, student.studentNumber);
      appendCell(row, getStudentFullName(student));
      appendCell(row, student.courseCode || "Unassigned");
      appendCell(row, `Year ${student.yearLevel}`);
      appendCell(row, student.gender);
      appendCell(row, formatDate(student.createdAt));
    });
    const wrapper = document.createElement("div");
    wrapper.className = "table-wrap";
    wrapper.append(table);
    content.replaceChildren(wrapper);
  }
  total.textContent = `${pagination.totalRecords} matching ${pagination.totalRecords === 1 ? "student" : "students"}`;
}

function renderEnrollmentReport(records, pagination) {
  if (!records.length) {
    showEmptyState(content, "No courses available", "Add a course to see enrollment data.");
  } else {
    const table = document.createElement("table");
    table.className = "data-table";
    const header = table.createTHead().insertRow();
    ["Course code", "Course name", "Status", "Student count"]
      .forEach((label) => appendCell(header, label, { header: true }));
    const body = table.createTBody();
    records.forEach((course) => {
      const row = body.insertRow();
      appendCell(row, course.courseCode);
      appendCell(row, course.courseName);
      appendCell(row, course.status === "active" ? "Active" : "Inactive");
      appendCell(row, String(course.studentCount));
    });
    const wrapper = document.createElement("div");
    wrapper.className = "table-wrap";
    wrapper.append(table);
    content.replaceChildren(wrapper);
  }
  total.textContent = `${pagination.totalRecords} ${pagination.totalRecords === 1 ? "course" : "courses"}`;
}

function renderPagination(pagination) {
  paginationContainer.replaceChildren();
  const totalPages = Math.max(1, pagination.totalPages);
  currentPage = Math.min(currentPage, totalPages);
  if (currentPage !== pagination.page) {
    currentPage = pagination.page;
  }
  const previous = document.createElement("button");
  previous.type = "button";
  previous.className = "button button-secondary button-small";
  previous.textContent = "Previous";
  previous.disabled = pagination.page <= 1;
  previous.addEventListener("click", () => {
    currentPage = Math.max(1, currentPage - 1);
    loadReport();
  });
  const indicator = document.createElement("span");
  indicator.textContent = `Page ${pagination.page} of ${totalPages}`;
  indicator.setAttribute("aria-live", "polite");
  const next = document.createElement("button");
  next.type = "button";
  next.className = "button button-secondary button-small";
  next.textContent = "Next";
  next.disabled = pagination.page >= totalPages;
  next.addEventListener("click", () => {
    currentPage += 1;
    loadReport();
  });
  paginationContainer.append(previous, indicator, next);
}

function updatePrintHeading() {
  const applied = [];
  if (courseFilter.value) applied.push(`Course: ${courseById(courseFilter.value)?.courseCode ?? "—"}`);
  if (yearFilter.value) applied.push(`Year: ${yearFilter.value}`);
  if (search.value.trim() && reportType.value !== "enrollment") applied.push(`Search: ${search.value.trim()}`);
  printHeading.textContent =
    `${title.textContent}\nFilters: ${applied.join(" · ") || "None"}\nGenerated: ${new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date())}`;
  printHeading.style.whiteSpace = "pre-line";
}

async function loadReport() {
  const requestId = ++latestReportRequest;
  const isEnrollmentReport = reportType.value === "enrollment";
  search.disabled = isEnrollmentReport;
  yearFilter.disabled = isEnrollmentReport;
  title.textContent = reportTitle();
  updatePrintHeading();
  showEmptyState(content, "Loading report", "Retrieving report data from the server.");

  const parameters = {
    type: reportTypes[reportType.value],
    page: currentPage,
    pageSize: 25,
    courseId: courseFilter.value,
  };
  if (!isEnrollmentReport) {
    parameters.search = search.value.trim();
    parameters.yearLevel = yearFilter.value;
  }

  try {
    const { data } = await apiGet("reports/index.php", parameters);
    if (requestId !== latestReportRequest) return;
    if (isEnrollmentReport) renderEnrollmentReport(data.items, data.pagination);
    else renderStudentReport(data.items, data.pagination);
    renderPagination(data.pagination);
    updatePrintHeading();
  } catch (error) {
    if (requestId !== latestReportRequest) return;
    if (error.status === 401) return;
    setMessage(feedback, error.message || "Unable to load this report.", "error");
    showEmptyState(content, "Report unavailable", "Check the server connection and try again.");
    paginationContainer.replaceChildren();
  }
}

async function initialize() {
  try {
    const { data } = await apiGet("courses/index.php");
    courses = data.items;
    courses.forEach((course) => courseFilter.add(
      new Option(`${course.courseCode} — ${course.courseName}`, course.id),
    ));
    if (courses.some((course) => String(course.id) === courseParam)) {
      courseFilter.value = courseParam;
      reportType.value = "by-course";
    }
    await loadReport();
  } catch (error) {
    if (error.status !== 401) setMessage(feedback, error.message || "Unable to load report filters.", "error");
  }
}

[reportType, courseFilter, yearFilter].forEach((control) => control.addEventListener("input", () => {
  currentPage = 1;
  loadReport();
}));
search.addEventListener("input", () => {
  currentPage = 1;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadReport, 250);
});
document.querySelector("#clear-report-filters").addEventListener("click", () => {
  reportType.value = "all-students";
  search.value = "";
  courseFilter.value = "";
  yearFilter.value = "";
  currentPage = 1;
  loadReport();
});
document.querySelector("#print-report").addEventListener("click", () => window.print());

initialize();
