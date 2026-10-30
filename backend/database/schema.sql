CREATE DATABASE IF NOT EXISTS student_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE student_db;

CREATE TABLE IF NOT EXISTS admins (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(80) NOT NULL,
  email VARCHAR(254) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admins_username (username),
  UNIQUE KEY uq_admins_email (email)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS courses (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  course_code VARCHAR(20) NOT NULL,
  course_name VARCHAR(120) NOT NULL,
  description VARCHAR(240) NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_courses_course_code (course_code),
  KEY idx_courses_status (status)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS students (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  student_number VARCHAR(30) NOT NULL,
  first_name VARCHAR(60) NOT NULL,
  middle_name VARCHAR(60) NULL,
  last_name VARCHAR(60) NOT NULL,
  gender ENUM('Female', 'Male', 'Non-binary', 'Prefer not to say') NOT NULL,
  date_of_birth DATE NOT NULL,
  email VARCHAR(120) NULL,
  contact_number VARCHAR(30) NULL,
  address VARCHAR(240) NOT NULL,
  course_id INT UNSIGNED NOT NULL,
  year_level TINYINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_students_student_number (student_number),
  KEY idx_students_name (last_name, first_name, middle_name),
  KEY idx_students_course_year (course_id, year_level),
  KEY idx_students_created_at (created_at),
  CONSTRAINT chk_students_year_level CHECK (year_level BETWEEN 1 AND 4),
  CONSTRAINT fk_students_course
    FOREIGN KEY (course_id) REFERENCES courses (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
