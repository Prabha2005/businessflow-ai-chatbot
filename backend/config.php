<?php

$envFile = __DIR__ . '/.env';

if (!file_exists($envFile)) {
    die('Configuration file not found.');
}

$env = parse_ini_file($envFile);

if (!$env || empty($env['HF_TOKEN'])) {
    die('Hugging Face token is not configured.');
}

define('HF_TOKEN', $env['HF_TOKEN']);

if (empty($env['GEMINI_API_KEY'])) {
    die('Gemini API key is not configured.');
}

define('GEMINI_API_KEY', $env['GEMINI_API_KEY']);