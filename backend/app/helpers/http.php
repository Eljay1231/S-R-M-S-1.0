<?php

final class ApiException extends RuntimeException
{
    public function __construct(
        public int $status,
        string $message,
        public array $errors = []
    ) {
        parent::__construct($message);
    }
}

function api_response(int $status, array $body): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function api_success(array $data = [], string $message = 'Request completed successfully.', int $status = 200): void
{
    api_response($status, [
        'success' => true,
        'message' => $message,
        'data' => $data,
    ]);
}

function api_error(int $status, string $message, array $errors = []): void
{
    $body = [
        'success' => false,
        'message' => $message,
    ];
    if ($errors !== []) {
        $body['errors'] = $errors;
    }
    api_response($status, $body);
}

function api_run(callable $handler): void
{
    try {
        $handler();
    } catch (ApiException $exception) {
        api_error($exception->status, $exception->getMessage(), $exception->errors);
    } catch (PDOException $exception) {
        $state = is_string($exception->getCode()) ? $exception->getCode() : 'unknown';
        error_log(
            'SRMS database operation failed at ' . basename($exception->getFile())
            . ':' . $exception->getLine() . '; SQLSTATE ' . $state . '.'
        );
        if ($state === '23000') {
            api_error(409, 'The requested change conflicts with an existing record.');
        }
        api_error(500, 'A server error occurred. Please try again later.');
    } catch (Throwable $exception) {
        error_log(
            'SRMS API failure at ' . basename($exception->getFile())
            . ':' . $exception->getLine() . ' (' . get_class($exception) . ').'
        );
        api_error(500, 'A server error occurred. Please try again later.');
    }
}

function api_transaction(PDO $pdo, callable $operation): mixed
{
    $pdo->beginTransaction();
    try {
        $result = $operation();
        $pdo->commit();
        return $result;
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $exception;
    }
}

function api_require_method(string $method): void
{
    if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') !== strtoupper($method)) {
        header('Allow: ' . strtoupper($method));
        throw new ApiException(405, 'This request method is not allowed.');
    }
}

function api_json_body(): array
{
    $contentType = strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]));
    if ($contentType !== 'application/json') {
        throw new ApiException(415, 'Send this request using the application/json content type.');
    }

    $rawBody = file_get_contents('php://input');
    if (!is_string($rawBody) || trim($rawBody) === '') {
        throw new ApiException(400, 'A JSON request body is required.');
    }

    try {
        $body = json_decode($rawBody, false, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        throw new ApiException(400, 'The request body must contain valid JSON.');
    }

    if (!$body instanceof stdClass) {
        throw new ApiException(400, 'The JSON request body must be an object.');
    }
    return get_object_vars($body);
}

function api_require_csrf(): void
{
    $provided = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    $expected = $_SESSION['csrf_token'] ?? '';
    if (!is_string($provided) || !is_string($expected) || $expected === '' || !hash_equals($expected, $provided)) {
        throw new ApiException(403, 'The security token is missing or invalid. Refresh the page and try again.');
    }
}

function api_validate_record_id(mixed $value): int
{
    if (!is_string($value) && !is_int($value)) {
        throw new ApiException(400, 'A valid record ID is required.');
    }
    $id = filter_var((string) $value, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    if ($id === false) {
        throw new ApiException(400, 'A valid record ID is required.');
    }
    return $id;
}

function api_query_integer(string $key, int $default, int $min, int $max): int
{
    $value = $_GET[$key] ?? (string) $default;
    if (!is_string($value) && !is_int($value)) {
        throw new ApiException(400, 'Invalid query parameter.', [$key => 'Enter a whole number.']);
    }
    $number = filter_var((string) $value, FILTER_VALIDATE_INT);
    if ($number === false || $number < $min || $number > $max) {
        throw new ApiException(422, 'Invalid query parameter.', [$key => 'Enter a value between ' . $min . ' and ' . $max . '.']);
    }
    return $number;
}

function api_validate_string(array $input, string $key, string $label, int $maxLength, bool $required, array &$errors): ?string
{
    if (!array_key_exists($key, $input) || $input[$key] === null) {
        $value = '';
    } elseif (!is_string($input[$key])) {
        $errors[$key] = $label . ' must be text.';
        return null;
    } else {
        $value = trim((string) $input[$key]);
    }

    if ($required && $value === '') {
        $errors[$key] = $label . ' is required.';
    } elseif (mb_strlen($value, 'UTF-8') > $maxLength) {
        $errors[$key] = 'Use ' . $maxLength . ' characters or fewer.';
    }
    return $value === '' ? null : $value;
}

function api_date_is_valid(string $date): bool
{
    $parsed = DateTimeImmutable::createFromFormat('!Y-m-d', $date);
    $errors = DateTimeImmutable::getLastErrors();
    return $parsed !== false
        && ($errors === false || ($errors['warning_count'] === 0 && $errors['error_count'] === 0))
        && $parsed->format('Y-m-d') === $date
        && $date <= (new DateTimeImmutable('today'))->format('Y-m-d');
}

function api_like_term(string $term): string
{
    return '%' . str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $term) . '%';
}
