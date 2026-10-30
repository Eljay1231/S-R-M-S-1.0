<?php

function api_course_record(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'courseCode' => $row['course_code'],
        'courseName' => $row['course_name'],
        'description' => $row['description'],
        'status' => $row['status'],
        'studentCount' => isset($row['student_count']) ? (int) $row['student_count'] : 0,
        'createdAt' => substr($row['created_at'], 0, 10),
        'updatedAt' => substr($row['updated_at'], 0, 10),
    ];
}

function api_student_record(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'studentNumber' => $row['student_number'],
        'firstName' => $row['first_name'],
        'middleName' => $row['middle_name'] ?? '',
        'lastName' => $row['last_name'],
        'gender' => $row['gender'],
        'dateOfBirth' => $row['date_of_birth'],
        'email' => $row['email'] ?? '',
        'contactNumber' => $row['contact_number'] ?? '',
        'address' => $row['address'],
        'courseId' => (int) $row['course_id'],
        'courseCode' => $row['course_code'] ?? '',
        'courseName' => $row['course_name'] ?? '',
        'yearLevel' => (int) $row['year_level'],
        'createdAt' => substr($row['created_at'], 0, 10),
        'updatedAt' => substr($row['updated_at'], 0, 10),
    ];
}
