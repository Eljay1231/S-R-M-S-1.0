import { getCourseById, getStudentById, getStudentFullName, formatDate } from "./data.js";
import { showEmptyState } from "./main.js";

const params = new URLSearchParams(window.location.search);
const student = getStudentById(params.get("id"));
const container = document.querySelector("#student-details");

if (!student) {
  document.querySelector("#student-name").textContent = "Student not found";
  document.querySelector("#student-number").textContent = "The selected student record is unavailable.";
  document.querySelector("#edit-student").hidden = true;
  showEmptyState(container, "Record unavailable", "Return to the student list and select a valid record.");
} else {
  const fullName = getStudentFullName(student);
  const course = getCourseById(student.courseId);
  document.querySelector("#student-name").textContent = fullName;
  document.querySelector("#student-number").textContent = `Student number: ${student.studentNumber}`;
  document.querySelector("#edit-student").href = `student-form.html?id=${encodeURIComponent(student.id)}`;
  const fields = [
    ["Student number", student.studentNumber], ["Full name", fullName], ["Gender", student.gender],
    ["Date of birth", formatDate(student.dateOfBirth)], ["Email", student.email || "—"],
    ["Contact number", student.contactNumber || "—"], ["Address", student.address],
    ["Course", course ? `${course.courseCode} — ${course.courseName}` : "Unassigned"],
    ["Year level", `Year ${student.yearLevel}`], ["Registration date", formatDate(student.createdAt)],
    ["Last updated", formatDate(student.updatedAt)],
  ];
  const list = document.createElement("dl");
  list.className = "details-grid";
  fields.forEach(([label, value]) => {
    const item = document.createElement("div");
    item.className = "detail-item";
    const term = document.createElement("dt");
    term.textContent = label;
    const description = document.createElement("dd");
    description.textContent = value;
    item.append(term, description);
    list.append(item);
  });
  const body = document.createElement("div");
  body.className = "panel-body";
  body.append(list);
  container.append(body);
}
