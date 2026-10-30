USE student_db;

INSERT INTO courses (course_code, course_name, description, status) VALUES
  ('BSIT', 'Bachelor of Science in Information Technology', 'Computing, software, and information systems.', 'active'),
  ('BSCS', 'Bachelor of Science in Computer Science', 'Computer science, algorithms, and software development.', 'active'),
  ('BSIS', 'Bachelor of Science in Information Systems', 'Business processes and information systems.', 'active'),
  ('ACT', 'Associate in Computer Technology', 'Practical foundations in computer technology.', 'active')
ON DUPLICATE KEY UPDATE
  course_name = VALUES(course_name),
  description = VALUES(description),
  status = VALUES(status);

INSERT INTO students
  (student_number, first_name, middle_name, last_name, gender, date_of_birth, email, contact_number, address, course_id, year_level, created_at)
SELECT '2024-0001', 'Mikaela', 'Santos', 'Reyes', 'Female', '2005-04-12', 'mikaela.reyes@example.test', '09170000001', '12 Sampaguita Street, Quezon City', id, 2, '2024-06-03 00:00:00'
FROM courses WHERE course_code = 'BSIT'
ON DUPLICATE KEY UPDATE student_number = VALUES(student_number);

INSERT INTO students
  (student_number, first_name, middle_name, last_name, gender, date_of_birth, email, contact_number, address, course_id, year_level, created_at)
SELECT '2024-0002', 'Daniel', 'Cruz', 'Garcia', 'Male', '2004-11-23', 'daniel.garcia@example.test', '09170000002', '8 Narra Avenue, Pasig City', id, 3, '2024-06-05 00:00:00'
FROM courses WHERE course_code = 'BSCS'
ON DUPLICATE KEY UPDATE student_number = VALUES(student_number);

INSERT INTO students
  (student_number, first_name, middle_name, last_name, gender, date_of_birth, email, contact_number, address, course_id, year_level, created_at)
SELECT '2024-0003', 'Althea', NULL, 'Mendoza', 'Female', '2006-02-08', 'althea.mendoza@example.test', '09170000003', '21 Mabini Street, Manila', id, 1, '2024-06-08 00:00:00'
FROM courses WHERE course_code = 'BSIT'
ON DUPLICATE KEY UPDATE student_number = VALUES(student_number);

INSERT INTO students
  (student_number, first_name, middle_name, last_name, gender, date_of_birth, email, contact_number, address, course_id, year_level, created_at)
SELECT '2024-0004', 'Paolo', 'Dela Cruz', 'Bautista', 'Male', '2003-08-19', 'paolo.bautista@example.test', '09170000004', '4 Acacia Lane, Makati City', id, 4, '2024-06-11 00:00:00'
FROM courses WHERE course_code = 'BSIS'
ON DUPLICATE KEY UPDATE student_number = VALUES(student_number);

INSERT INTO students
  (student_number, first_name, middle_name, last_name, gender, date_of_birth, email, contact_number, address, course_id, year_level, created_at)
SELECT '2024-0005', 'Isabella', 'Lopez', 'Flores', 'Female', '2005-12-01', 'isabella.flores@example.test', '09170000005', '55 Ilang-Ilang Road, Marikina City', id, 2, '2024-06-14 00:00:00'
FROM courses WHERE course_code = 'ACT'
ON DUPLICATE KEY UPDATE student_number = VALUES(student_number);

INSERT INTO students
  (student_number, first_name, middle_name, last_name, gender, date_of_birth, email, contact_number, address, course_id, year_level, created_at)
SELECT '2024-0006', 'Joshua', 'Ramos', 'Villanueva', 'Male', '2004-03-30', 'joshua.villanueva@example.test', '09170000006', '9 Bonifacio Street, Taguig City', id, 3, '2024-06-18 00:00:00'
FROM courses WHERE course_code = 'BSCS'
ON DUPLICATE KEY UPDATE student_number = VALUES(student_number);

INSERT INTO students
  (student_number, first_name, middle_name, last_name, gender, date_of_birth, email, contact_number, address, course_id, year_level, created_at)
SELECT '2024-0007', 'Sofia', 'Garcia', 'Aquino', 'Female', '2006-06-15', 'sofia.aquino@example.test', '09170000007', '16 Rizal Avenue, Mandaluyong City', id, 1, '2024-06-20 00:00:00'
FROM courses WHERE course_code = 'BSIS'
ON DUPLICATE KEY UPDATE student_number = VALUES(student_number);

INSERT INTO students
  (student_number, first_name, middle_name, last_name, gender, date_of_birth, email, contact_number, address, course_id, year_level, created_at)
SELECT '2024-0008', 'Ethan', NULL, 'Navarro', 'Male', '2005-09-04', 'ethan.navarro@example.test', '09170000008', '33 Kalayaan Street, Pasay City', id, 2, '2024-06-22 00:00:00'
FROM courses WHERE course_code = 'BSIT'
ON DUPLICATE KEY UPDATE student_number = VALUES(student_number);
