export const courses = [
  { id: "course-1", courseCode: "BSIT", courseName: "Bachelor of Science in Information Technology", description: "Computing, software, and information systems.", status: "Active", createdAt: "2024-01-15" },
  { id: "course-2", courseCode: "BSCS", courseName: "Bachelor of Science in Computer Science", description: "Computer science, algorithms, and software development.", status: "Active", createdAt: "2024-01-15" },
  { id: "course-3", courseCode: "BSIS", courseName: "Bachelor of Science in Information Systems", description: "Business processes and information systems.", status: "Active", createdAt: "2024-01-15" },
  { id: "course-4", courseCode: "ACT", courseName: "Associate in Computer Technology", description: "Practical foundations in computer technology.", status: "Active", createdAt: "2024-01-15" },
];

export const students = [
  { id: "student-1", studentNumber: "2024-0001", firstName: "Mikaela", middleName: "Santos", lastName: "Reyes", gender: "Female", dateOfBirth: "2005-04-12", email: "mikaela.reyes@example.test", contactNumber: "09170000001", address: "12 Sampaguita Street, Quezon City", courseId: "course-1", yearLevel: 2, createdAt: "2024-06-03", updatedAt: "2024-06-03" },
  { id: "student-2", studentNumber: "2024-0002", firstName: "Daniel", middleName: "Cruz", lastName: "Garcia", gender: "Male", dateOfBirth: "2004-11-23", email: "daniel.garcia@example.test", contactNumber: "09170000002", address: "8 Narra Avenue, Pasig City", courseId: "course-2", yearLevel: 3, createdAt: "2024-06-05", updatedAt: "2024-06-05" },
  { id: "student-3", studentNumber: "2024-0003", firstName: "Althea", middleName: "", lastName: "Mendoza", gender: "Female", dateOfBirth: "2006-02-08", email: "althea.mendoza@example.test", contactNumber: "09170000003", address: "21 Mabini Street, Manila", courseId: "course-1", yearLevel: 1, createdAt: "2024-06-08", updatedAt: "2024-06-08" },
  { id: "student-4", studentNumber: "2024-0004", firstName: "Paolo", middleName: "Dela Cruz", lastName: "Bautista", gender: "Male", dateOfBirth: "2003-08-19", email: "paolo.bautista@example.test", contactNumber: "09170000004", address: "4 Acacia Lane, Makati City", courseId: "course-3", yearLevel: 4, createdAt: "2024-06-11", updatedAt: "2024-06-11" },
  { id: "student-5", studentNumber: "2024-0005", firstName: "Isabella", middleName: "Lopez", lastName: "Flores", gender: "Female", dateOfBirth: "2005-12-01", email: "isabella.flores@example.test", contactNumber: "09170000005", address: "55 Ilang-Ilang Road, Marikina City", courseId: "course-4", yearLevel: 2, createdAt: "2024-06-14", updatedAt: "2024-06-14" },
  { id: "student-6", studentNumber: "2024-0006", firstName: "Joshua", middleName: "Ramos", lastName: "Villanueva", gender: "Male", dateOfBirth: "2004-03-30", email: "joshua.villanueva@example.test", contactNumber: "09170000006", address: "9 Bonifacio Street, Taguig City", courseId: "course-2", yearLevel: 3, createdAt: "2024-06-18", updatedAt: "2024-06-18" },
  { id: "student-7", studentNumber: "2024-0007", firstName: "Sofia", middleName: "Garcia", lastName: "Aquino", gender: "Female", dateOfBirth: "2006-06-15", email: "sofia.aquino@example.test", contactNumber: "09170000007", address: "16 Rizal Avenue, Mandaluyong City", courseId: "course-3", yearLevel: 1, createdAt: "2024-06-20", updatedAt: "2024-06-20" },
  { id: "student-8", studentNumber: "2024-0008", firstName: "Ethan", middleName: "", lastName: "Navarro", gender: "Male", dateOfBirth: "2005-09-04", email: "ethan.navarro@example.test", contactNumber: "09170000008", address: "33 Kalayaan Street, Pasay City", courseId: "course-1", yearLevel: 2, createdAt: "2024-06-22", updatedAt: "2024-06-22" },
];

export function getCourseById(courseId) {
  return courses.find((course) => course.id === courseId);
}

export function getStudentById(studentId) {
  return students.find((student) => student.id === studentId);
}

export function getStudentFullName(student) {
  return [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" ");
}

export function countStudentsByCourse(courseId) {
  return students.filter((student) => student.courseId === courseId).length;
}

export function calculateDashboardStats() {
  return {
    totalStudents: students.length,
    totalCourses: courses.length,
    activeCourses: courses.filter((course) => course.status === "Active").length,
    unassignedStudents: students.filter((student) => !getCourseById(student.courseId)).length,
  };
}

export function getRecentRegistrations(limit = 5) {
  return [...students]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

let idSequence = 0;

export function createId(prefix) {
  idSequence += 1;
  return `${prefix}-${Date.now()}-${idSequence}`;
}

export function formatDate(dateString) {
  if (!dateString) return "—";
  const date = new Date(`${dateString}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}
