<?php

function api_reject_unknown_fields(array $input, array $allowed): void
{
    $unknown = array_diff(array_keys($input), $allowed);
    if ($unknown !== []) {
        throw new ApiException(422, 'The request contains unsupported fields.');
    }
}

function api_validate_student(PDO $pdo, array $input, ?int $studentId = null, ?int $existingCourseId = null): array
{
    $allowed = [
        'studentNumber', 'firstName', 'middleName', 'lastName', 'gender',
        'dateOfBirth', 'email', 'contactNumber', 'address', 'courseId', 'yearLevel',
    ];
    api_reject_unknown_fields($input, $allowed);
    $errors = [];
    $studentNumber = api_validate_string($input, 'studentNumber', 'Student number', 30, true, $errors);
    $firstName = api_validate_string($input, 'firstName', 'First name', 60, true, $errors);
    $middleName = api_validate_string($input, 'middleName', 'Middle name', 60, false, $errors);
    $lastName = api_validate_string($input, 'lastName', 'Last name', 60, true, $errors);
    $gender = api_validate_string($input, 'gender', 'Gender', 30, true, $errors);
    $dateOfBirth = api_validate_string($input, 'dateOfBirth', 'Date of birth', 10, true, $errors);
    $email = api_validate_string($input, 'email', 'Email', 120, false, $errors);
    $contactNumber = api_validate_string($input, 'contactNumber', 'Contact number', 30, false, $errors);
    $address = api_validate_string($input, 'address', 'Address', 240, true, $errors);

    if ($gender !== null && !in_array($gender, ['Female', 'Male', 'Non-binary', 'Prefer not to say'], true)) {
        $errors['gender'] = 'Choose one of the listed options.';
    }
    if ($dateOfBirth !== null && !api_date_is_valid($dateOfBirth)) {
        $errors['dateOfBirth'] = 'Enter a valid date that is not in the future.';
    }
    if ($email !== null && filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
        $errors['email'] = 'Enter a valid email address.';
    }

    $yearValue = $input['yearLevel'] ?? null;
    if ((!is_int($yearValue) && !(is_string($yearValue) && ctype_digit($yearValue)))
        || (int) $yearValue < 1 || (int) $yearValue > 4) {
        $errors['yearLevel'] = 'Choose a valid year level.';
        $yearLevel = null;
    } else {
        $yearLevel = (int) $yearValue;
    }

    $courseValue = $input['courseId'] ?? null;
    $courseId = (is_int($courseValue) || (is_string($courseValue) && ctype_digit($courseValue)))
        ? filter_var((string) $courseValue, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]])
        : false;
    if ($courseId === false) {
        $errors['courseId'] = 'Choose a valid course.';
    } else {
        $courseQuery = $pdo->prepare('SELECT status FROM courses WHERE id = :id FOR UPDATE');
        $courseQuery->execute(['id' => $courseId]);
        $courseStatus = $courseQuery->fetchColumn();
        if ($courseStatus === false) {
            $errors['courseId'] = 'Choose a valid course.';
        } elseif ($courseStatus !== 'active' && $courseId !== $existingCourseId) {
            $errors['courseId'] = 'Choose an active course.';
        }
    }

    if ($studentNumber !== null) {
        $duplicateQuery = 'SELECT id FROM students WHERE student_number = :student_number';
        $parameters = ['student_number' => $studentNumber];
        if ($studentId !== null) {
            $duplicateQuery .= ' AND id <> :student_id';
            $parameters['student_id'] = $studentId;
        }
        $duplicateStatement = $pdo->prepare($duplicateQuery);
        $duplicateStatement->execute($parameters);
        if ($duplicateStatement->fetchColumn() !== false) {
            $errors['studentNumber'] = 'This student number is already in use.';
        }
    }

    if ($errors !== []) {
        throw new ApiException(422, 'Validation failed.', $errors);
    }

    return [
        'studentNumber' => $studentNumber,
        'firstName' => $firstName,
        'middleName' => $middleName,
        'lastName' => $lastName,
        'gender' => $gender,
        'dateOfBirth' => $dateOfBirth,
        'email' => $email,
        'contactNumber' => $contactNumber,
        'address' => $address,
        'courseId' => (int) $courseId,
        'yearLevel' => $yearLevel,
    ];
}

function api_validate_course(PDO $pdo, array $input, ?int $courseId = null): array
{
    api_reject_unknown_fields($input, ['courseCode', 'courseName', 'description']);
    $errors = [];
    $courseCode = api_validate_string($input, 'courseCode', 'Course code', 20, true, $errors);
    $courseName = api_validate_string($input, 'courseName', 'Course name', 120, true, $errors);
    $description = api_validate_string($input, 'description', 'Description', 240, false, $errors);
    if ($courseCode !== null && preg_match('/\A[A-Za-z0-9][A-Za-z0-9._-]*\z/', $courseCode) !== 1) {
        $errors['courseCode'] = 'Use letters, numbers, periods, underscores, or hyphens.';
    }

    if ($courseCode !== null) {
        $query = 'SELECT id FROM courses WHERE course_code = :course_code';
        $parameters = ['course_code' => $courseCode];
        if ($courseId !== null) {
            $query .= ' AND id <> :course_id';
            $parameters['course_id'] = $courseId;
        }
        $statement = $pdo->prepare($query);
        $statement->execute($parameters);
        if ($statement->fetchColumn() !== false) {
            $errors['courseCode'] = 'This course code is already in use.';
        }
    }

    if ($errors !== []) {
        throw new ApiException(422, 'Validation failed.', $errors);
    }

    return [
        'courseCode' => strtoupper($courseCode),
        'courseName' => $courseName,
        'description' => $description,
    ];
}
