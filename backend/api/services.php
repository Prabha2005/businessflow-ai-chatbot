<?php

require_once __DIR__ . "/cors.php";

$services = [
    [
        "id" => 1,
        "name" => "Web Hosting",
        "description" => "Reliable Website hoisting service",
        "price" => 800,
        "renewal_period" => "Yearly"
    ],
    [
        "id" => 2,
        "name" => "Cloud Storage",
        "description" => "Secure cloud storage for business files",
        "price" => 900,
        "renewal_period" => "Yearly"
    ],
    [
        "id" => 3,
        "name" => "Email Service",
        "description" => "Professional business email service",
        "price" => 400,
        "renewal_period" => "Monthly"
    ]
];

echo json_encode($services);