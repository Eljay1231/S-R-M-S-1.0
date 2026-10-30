<?php

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$projectRoot = dirname(__DIR__);
require $projectRoot . '/app/helpers/http.php';
require $projectRoot . '/app/helpers/validation.php';

function prompt_value(string $label): string
{
    fwrite(STDOUT, $label);
    $value = fgets(STDIN);
    return $value === false ? '' : trim($value);
}

try {
    $pdo = require $projectRoot . '/app/config/database.php';
    $accountConfigPath = $projectRoot . '/app/config/admin.local.php';
    if (is_file($accountConfigPath)) {
        $account = require $accountConfigPath;
        if (!is_array($account)) {
            throw new RuntimeException('Admin configuration must return an array.');
        }
        $username = $account['username'] ?? null;
        $email = $account['email'] ?? null;
        $password = $account['password'] ?? null;
        $confirmation = $password;
    } else {
        fwrite(STDOUT, "No local account config found. Using the secure interactive prompt.\n");
        $username = prompt_value('Administrator username: ');
        $email = prompt_value('Administrator email: ');
        fwrite(STDOUT, 'Administrator password (12-72 bytes): ');
        $password = fgets(STDIN);
        fwrite(STDOUT, 'Confirm password: ');
        $confirmation = fgets(STDIN);
        $password = $password === false ? '' : rtrim($password, "\r\n");
        $confirmation = $confirmation === false ? '' : rtrim($confirmation, "\r\n");
    }

    $errors = [];
    if (!is_string($username) || trim($username) === '' || mb_strlen(trim($username), 'UTF-8') > 80) {
        $errors[] = 'Username is required and must be 80 characters or fewer.';
    }
    if (!is_string($email) || filter_var($email, FILTER_VALIDATE_EMAIL) === false || mb_strlen($email, 'UTF-8') > 254) {
        $errors[] = 'Enter a valid email address no longer than 254 characters.';
    }
    if (!is_string($password) || strlen($password) < 12 || strlen($password) > 72) {
        $errors[] = 'Password must be between 12 and 72 bytes.';
    }
    if (!is_string($password) || !is_string($confirmation) || !hash_equals($password, $confirmation)) {
        $errors[] = 'The passwords do not match.';
    }
    if ($username === 'CHANGE_THIS_USERNAME' || $email === 'admin@example.test'
        || $password === 'CHANGE_THIS_TO_A_STRONG_PASSWORD') {
        $errors[] = 'Replace the placeholder account values before running this command.';
    }
    if ($errors !== []) {
        fwrite(STDERR, implode(PHP_EOL, $errors) . PHP_EOL);
        exit(1);
    }

    $count = (int) $pdo->query('SELECT COUNT(*) FROM admins')->fetchColumn();
    if ($count > 1) {
        fwrite(STDERR, "More than one admin exists. Refusing to modify any account.\n");
        exit(1);
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $username = trim($username);
    if ($count === 0) {
        $statement = $pdo->prepare(
            'INSERT INTO admins (username, email, password)
             VALUES (:username, :email, :password)'
        );
        $statement->execute([
            'username' => $username,
            'email' => $email,
            'password' => $passwordHash,
        ]);
        $action = 'created';
    } else {
        $statement = $pdo->prepare(
            'UPDATE admins
             SET username = :username, email = :email, password = :password
             ORDER BY id ASC
             LIMIT 1'
        );
        $statement->execute([
            'username' => $username,
            'email' => $email,
            'password' => $passwordHash,
        ]);
        $action = 'updated';
    }
    $password = '';
    $confirmation = '';
    $passwordHash = '';
    fwrite(STDOUT, "The administrator account was {$action}. Password hash saved; no plaintext password was stored in the database.\n");
} catch (PDOException $exception) {
    if ($exception->getCode() === '23000') {
        fwrite(STDERR, "That username or email is already in use. Choose different account details.\n");
    } else {
        fwrite(STDERR, "Unable to save the admin account. Check the database configuration and imported schema.\n");
    }
    exit(1);
} catch (Throwable $exception) {
    fwrite(STDERR, "Unable to set up the admin account due to a configuration error.\n");
    exit(1);
}
