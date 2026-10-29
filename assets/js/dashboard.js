import { calculateDashboardStats, courses, countStudentsByCourse, getCourseById, getRecentRegistrations, getStudentFullName, formatDate } from "./data.js";
import { appendCell, showEmptyState } from "./main.js";

const stats = calculateDashboardStats();
document.querySelector("#stat-students").textContent = String(stats.totalStudents);
document.querySelector("#stat-courses").textContent = String(stats.totalCourses);
document.querySelector("#stat-active").textContent = String(stats.activeCourses);
document.querySelector("#stat-unassigned").textContent = String(stats.unassignedStudents);

const recentContainer = document.querySelector("#recent-students");
const recent = getRecentRegistrations();
if (!recent.length) {
  showEmptyState(recentContainer, "No students yet", "Add a student to see recent registrations.");
} else {
  const wrapper = document.createElement("div");
  wrapper.className = "table-wrap";
  const table = document.createElement("table");
  table.className = "data-table";
  const caption = document.createElement("caption");
  caption.className = "sr-only";
  caption.textContent = "Most recent student registrations";
  table.append(caption);
  const head = table.createTHead().insertRow();
  ["Student number", "Full name", "Course", "Year level", "Registered", "Action"].forEach((label) => appendCell(head, label, { header: true }));
  const body = table.createTBody();
  recent.forEach((student) => {
    const row = body.insertRow();
    appendCell(row, student.studentNumber);
    appendCell(row, getStudentFullName(student));
    appendCell(row, getCourseById(student.courseId)?.courseCode ?? "Unassigned");
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
  recentContainer.append(wrapper);
}

const enrollmentContainer = document.querySelector("#course-enrollment");
if (!courses.length || courses.every((course) => countStudentsByCourse(course.id) === 0)) {
  showEmptyState(enrollmentContainer, courses.length ? "No enrollment data" : "No courses available", courses.length ? "There are no student enrollments to summarize." : "Add a course to see enrollment counts.");
} else {
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
  const largestCount = Math.max(1, ...courses.map((course) => countStudentsByCourse(course.id)));
  courses.forEach((course) => {
    const count = countStudentsByCourse(course.id);
    const row = body.insertRow();
    appendCell(row, course.courseCode);
    const cell = appendCell(row, String(count));
    const bar = document.createElement("div");
    bar.className = "count-bar";
    bar.setAttribute("role", "img");
    bar.setAttribute("aria-label", `${count} students enrolled in ${course.courseCode}`);
    const fill = document.createElement("span");
    fill.style.width = `${(count / largestCount) * 100}%`;
    bar.append(fill);
    cell.append(bar);
  });
  wrapper.append(table);
  enrollmentContainer.append(wrapper);
}
