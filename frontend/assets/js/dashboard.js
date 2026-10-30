import { apiGet } from "./api.js";
import { formatDate, getStudentFullName } from "./data.js";
import { appendCell, setMessage, showEmptyState } from "./main.js";

const recentContainer = document.querySelector("#recent-students");
const enrollmentContainer = document.querySelector("#course-enrollment");
const message = document.createElement("div");
message.className = "form-message";
message.setAttribute("role", "status");
message.setAttribute("aria-live", "polite");
message.hidden = true;
document.querySelector(".main-content").prepend(message);

function renderRecentStudents(recent) {
  if (!recent.length) {
    showEmptyState(recentContainer, "No students yet", "Add a student to see recent registrations.");
    return;
  }
  const wrapper = document.createElement("div");
  wrapper.className = "table-wrap";
  const table = document.createElement("table");
  table.className = "data-table";
  const caption = document.createElement("caption");
  caption.className = "sr-only";
  caption.textContent = "Most recent student registrations";
  table.append(caption);
  const head = table.createTHead().insertRow();
  ["Student number", "Full name", "Course", "Year level", "Registered", "Action"]
    .forEach((label) => appendCell(head, label, { header: true }));
  const body = table.createTBody();
  recent.forEach((student) => {
    const row = body.insertRow();
    appendCell(row, student.studentNumber);
    appendCell(row, getStudentFullName(student));
    appendCell(row, student.courseCode || "Unassigned");
    appendCell(row, `Year ${student.yearLevel}`);
    appendCell(row, formatDate(student.createdAt));
    const action = appendCell(row, "");
    const link = document.createElement("a");
    link.className = "text-link";
    link.href = `student-details.html?id=${encodeURIComponent(student.id)}`;
    link.textContent = "View";
    action.append(link);
  });
  wrapper.append(table);
  recentContainer.replaceChildren(wrapper);
}

function renderEnrollments(courses) {
  if (!courses.length || courses.every((course) => course.studentCount === 0)) {
    showEmptyState(enrollmentContainer, courses.length ? "No enrollment data" : "No courses available",
      courses.length ? "There are no student enrollments to summarize." : "Add a course to see enrollment counts.");
    return;
  }
  const wrapper = document.createElement("div");
  wrapper.className = "table-wrap";
  const table = document.createElement("table");
  table.className = "data-table enrollment-table";
  const caption = document.createElement("caption");
  caption.className = "sr-only";
  caption.textContent = "Student count by course";
  table.append(caption);
  const head = table.createTHead().insertRow();
  ["Course", "Enrolled"].forEach((label) => appendCell(head, label, { header: true }));
  const body = table.createTBody();
  const largestCount = Math.max(1, ...courses.map((course) => course.studentCount));
  courses.forEach((course) => {
    const row = body.insertRow();
    appendCell(row, course.courseCode);
    const cell = appendCell(row, String(course.studentCount));
    const bar = document.createElement("div");
    bar.className = "count-bar";
    bar.setAttribute("role", "img");
    bar.setAttribute("aria-label", `${course.studentCount} students enrolled in ${course.courseCode}`);
    const fill = document.createElement("span");
    fill.style.width = `${(course.studentCount / largestCount) * 100}%`;
    bar.append(fill);
    cell.append(bar);
  });
  wrapper.append(table);
  enrollmentContainer.replaceChildren(wrapper);
}

async function initialize() {
  showEmptyState(recentContainer, "Loading registrations", "Retrieving dashboard data.");
  try {
    const { data } = await apiGet("dashboard/index.php");
    document.querySelector("#stat-students").textContent = String(data.statistics.totalStudents);
    document.querySelector("#stat-courses").textContent = String(data.statistics.totalCourses);
    document.querySelector("#stat-active").textContent = String(data.statistics.activeCourses);
    document.querySelector("#stat-unassigned").textContent = String(data.statistics.unassignedStudents);
    renderRecentStudents(data.recentStudents);
    renderEnrollments(data.courseEnrollments);
  } catch (error) {
    if (error.status === 401) return;
    setMessage(message, error.message || "Unable to load dashboard data.", "error");
    showEmptyState(recentContainer, "Dashboard unavailable", "Check the server connection and try again.");
    showEmptyState(enrollmentContainer, "Dashboard unavailable", "Check the server connection and try again.");
  }
}

initialize();
