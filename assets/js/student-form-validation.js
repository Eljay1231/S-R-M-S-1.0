import { courses, getCourseById } from "./data.js";

const fieldNames = ["studentNumber", "firstName", "middleName", "lastName", "gender", "dateOfBirth", "email", "contactNumber", "address", "courseId", "yearLevel"];
const requiredFields = new Set(["studentNumber", "firstName", "lastName", "gender", "dateOfBirth", "address", "courseId", "yearLevel"]);
const maxLengths = { studentNumber: 30, firstName: 60, middleName: 60, lastName: 60, email: 120, contactNumber: 30, address: 240 };

export function validateStudentForm(form, students, editingId = null) {
  const formData = new FormData(form);
  const record = {};
  const errors = {};

  fieldNames.forEach((name) => {
    const value = String(formData.get(name) ?? "").trim();
    record[name] = value;
    const input = form.elements.namedItem(name);
    const error = form.querySelector(`#${name}-error`);
    if (error) error.textContent = "";
    if (input) input.removeAttribute("aria-invalid");

    if (requiredFields.has(name) && !value) errors[name] = "This field is required.";
    if (value && maxLengths[name] && value.length > maxLengths[name]) errors[name] = `Use ${maxLengths[name]} characters or fewer.`;
  });

  const duplicate = students.some((student) => student.id !== editingId
    && student.studentNumber.toLocaleLowerCase() === record.studentNumber.toLocaleLowerCase());
  if (record.studentNumber && duplicate) errors.studentNumber = "This student number is already in use.";
  if (record.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)) errors.email = "Enter a valid email address.";
  if (record.dateOfBirth) {
    const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(record.dateOfBirth);
    const [year, month, day] = dateParts ? dateParts.slice(1).map(Number) : [];
    const date = dateParts ? new Date(Date.UTC(year, month - 1, day)) : null;
    const isCalendarDate = date && date.getUTCFullYear() === year
      && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    if (!isCalendarDate || record.dateOfBirth > today) {
      errors.dateOfBirth = "Enter a valid date that is not in the future.";
    }
  }
  if (record.gender && !["Female", "Male", "Non-binary", "Prefer not to say"].includes(record.gender)) {
    errors.gender = "Choose one of the listed options.";
  }
  if (record.courseId) {
    const course = getCourseById(record.courseId);
    const original = editingId ? students.find((student) => student.id === editingId) : null;
    if (!course || (course.status !== "Active" && original?.courseId !== course.id)) {
      errors.courseId = "Choose an active course.";
    }
  }
  if (record.yearLevel && !["1", "2", "3", "4"].includes(record.yearLevel)) errors.yearLevel = "Choose a valid year level.";

  Object.entries(errors).forEach(([name, text]) => {
    const input = form.elements.namedItem(name);
    const error = form.querySelector(`#${name}-error`);
    if (input) input.setAttribute("aria-invalid", "true");
    if (error) error.textContent = text;
  });

  return { valid: Object.keys(errors).length === 0, record: { ...record, yearLevel: Number(record.yearLevel) }, errors };
}

export function populateCourseSelect(select, courses, selectedId = "", allowInactiveId = "") {
  select.replaceChildren(new Option("Select course", ""));
  courses.forEach((course) => {
    if (course.status !== "Active" && course.id !== allowInactiveId) return;
    const option = new Option(`${course.courseCode} — ${course.courseName}`, course.id);
    option.selected = course.id === selectedId;
    select.add(option);
  });
}
