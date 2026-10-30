export function getStudentFullName(student) {
  return [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" ");
}

export function formatDate(dateString) {
  if (!dateString) return "—";
  const date = new Date(`${dateString}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}
