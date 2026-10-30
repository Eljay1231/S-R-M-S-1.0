<?php

$localConfigPath = __DIR__ . '/database.local.php';
$config = is_file($localConfigPath)
    ? require $localConfigPath
    : require __DIR__ . '/database.example.php';

if (!is_array($config)) {
    throw new RuntimeException('Database configuration must return an array.');
}

$requiredConfig = ['host', 'database', 'username', 'password', 'charset'];
foreach ($requiredConfig as $key) {
    if (!array_key_exists($key, $config) || !is_string($config[$key])) {
        throw new RuntimeException('Database configuration is incomplete.');
    }
}

$dsn = sprintf(
    'mysql:host=%s;dbname=%s;charset=%s',
    $config['host'],
    $config['database'],
    $config['charset']
);

return new PDO($dsn, $config['username'], $config['password'], [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
    PDO::ATTR_STRINGIFY_FETCHES => false,
]);
