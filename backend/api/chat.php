<?php

require_once __DIR__ . "/cors.php";
require_once dirname(__DIR__) . "/config.php";
require_once dirname(__DIR__) . "/db.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "Only POST requests are allowed."], JSON_UNESCAPED_UNICODE);
    exit;
}

$rawInput = file_get_contents("php://input");
if ($rawInput === "" && isset($GLOBALS['MOCK_PHP_INPUT'])) {
    $rawInput = (string)$GLOBALS['MOCK_PHP_INPUT'];
}
$input = json_decode($rawInput, true);

if (!is_array($input) && !empty($rawInput)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid JSON payload."], JSON_UNESCAPED_UNICODE);
    exit;
}

$message = trim($input["message"] ?? "");

if ($message === "") {
    http_response_code(400);
    echo json_encode(["error" => "Please enter a message."], JSON_UNESCAPED_UNICODE);
    exit;
}

// Security: limit maximum message length to avoid token abuse
if (mb_strlen($message) > 1000) {
    http_response_code(400);
    echo json_encode(["error" => "Message is too long. Please limit your message to 1000 characters."], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!defined('GEMINI_API_KEY') || empty(GEMINI_API_KEY)) {
    http_response_code(500);
    echo json_encode(["error" => "AI service is not configured."], JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * 1. Authoritative Catalog Definition (Exact match to published base prices and serviceCatalog.js)
 */
function getAuthoritativeCatalog(): array {
    return [
        'web-hosting' => [
            'id' => 1,
            'slug' => 'web-hosting',
            'name' => 'Web Hosting',
            'base_price' => '₹800/year',
            'billing_cycle' => 'year',
            'description' => 'Enterprise-grade web hosting designed for businesses requiring high availability, automated security certificates, lightning-fast SSD storage, and robust server uptime.',
            'primary_purpose' => 'Hosting and serving public websites, web applications, and online portals on the internet with domain hosting, bandwidth, and SSL encryption.',
            'features' => [
                '99.98% Guaranteed Uptime SLA',
                'Free Let\'s Encrypt SSL Certificates',
                'cPanel Control Dashboard & 1-Click Installs',
                'Daily Automated Backups & 1-Click Restore',
                'DDoS Mitigation & Web Application Firewall',
                '24/7 Server Health Monitoring'
            ],
            'plans' => [
                'wh-starter' => [
                    'id' => 'wh-starter',
                    'name' => 'Starter Business',
                    'price' => '₹800/year',
                    'is_base' => true,
                    'specs' => [
                        '1 Hosted Domain',
                        '10 GB NVMe Storage',
                        '100 GB Monthly Bandwidth',
                        'Free SSL Certificate',
                        'Standard Email Support'
                    ]
                ],
                'wh-pro' => [
                    'id' => 'wh-pro',
                    'name' => 'Professional Cloud',
                    'price' => '₹1,800/year',
                    'is_base' => false,
                    'specs' => [
                        '5 Hosted Domains',
                        '50 GB NVMe Storage',
                        'Unlimited Monthly Bandwidth',
                        'Wildcard SSL Certificates',
                        'Priority 24/7 Support'
                    ]
                ],
                'wh-enterprise' => [
                    'id' => 'wh-enterprise',
                    'name' => 'Enterprise Dedicated',
                    'price' => '₹3,600/year',
                    'is_base' => false,
                    'specs' => [
                        'Unlimited Domains',
                        '150 GB NVMe Storage',
                        'Dedicated Static IP Address',
                        'Staging Environments',
                        'Dedicated Account Manager'
                    ]
                ]
            ],
            'demo_usage' => 'Simulated Demo Metric: Bandwidth Transfer: 18.4 GB consumed of 100 GB allocated (18.4% allocation).'
        ],
        'cloud-storage' => [
            'id' => 2,
            'slug' => 'cloud-storage',
            'name' => 'Cloud Storage',
            'base_price' => '₹900/year',
            'billing_cycle' => 'year',
            'description' => 'Secure, encrypted cloud object and block storage engineered for business collaboration, large assets, automated synchronization, and audit-compliant data protection.',
            'primary_purpose' => 'Storing, synchronizing, backing up, and sharing private business files and documents with end-to-end encryption, role permissions, and version history.',
            'features' => [
                'End-to-End AES-256 Bit Encryption',
                'Cross-Device Desktop & Mobile File Sync',
                'Granular Team Folder Permissions & Link Expiry',
                '30-Day Version History & Ransomware Rollback',
                'Zero-Knowledge Privacy Architecture',
                'RESTful API & S3-Compatible Bucket Access'
            ],
            'plans' => [
                'cs-essential' => [
                    'id' => 'cs-essential',
                    'name' => 'Essential Storage',
                    'price' => '₹900/year',
                    'capacity' => '50 GB Encrypted Storage',
                    'is_base' => true,
                    'specs' => [
                        '50 GB Encrypted Storage',
                        'AES-256 Encryption at Rest & Transit',
                        'File Sharing with Password Protection',
                        '30-Day Version History',
                        'Email & Ticket Support'
                    ]
                ],
                'cs-team' => [
                    'id' => 'cs-team',
                    'name' => 'Team Collaborative',
                    'price' => '₹2,200/year',
                    'capacity' => '250 GB Encrypted Storage',
                    'is_base' => false,
                    'specs' => [
                        '250 GB Encrypted Storage',
                        'Unlimited Team Shared Drives',
                        'Role-Based Access Control',
                        'Audit Log Exporting',
                        'Priority Live Chat Support'
                    ]
                ],
                'cs-vault' => [
                    'id' => 'cs-vault',
                    'name' => 'Enterprise Vault',
                    'price' => '₹4,800/year',
                    'capacity' => '1 TB Secure Object Storage',
                    'is_base' => false,
                    'specs' => [
                        '1 TB Secure Object Storage',
                        'HIPAA / SOC-2 Compliance Toolkit',
                        'Custom Retention Policies',
                        'Dedicated Key Management (BYOK)',
                        'Dedicated Infrastructure Engineer'
                    ]
                ]
            ],
            'demo_usage' => 'Simulated Demo Metric: Encrypted Storage Used: 14.5 GB consumed (clearly labeled simulated demo data).'
        ],
        'email-service' => [
            'id' => 3,
            'slug' => 'email-service',
            'name' => 'Email Service',
            'base_price' => '₹400/month',
            'billing_cycle' => 'month',
            'description' => 'Enterprise email hosting powered by AI anti-spam filtering, branded custom domains, shared team calendars, and synchronized contacts across all mobile and desktop devices.',
            'primary_purpose' => 'Professional corporate email communication (e.g. you@yourcompany.com) with AI anti-spam defense, team calendars, and mobile sync.',
            'features' => [
                'Custom Domain Email Addresses (you@yourbusiness.com)',
                'Gemini AI Anti-Spam & Phishing Defense',
                'IMAP, POP3, and Responsive Webmail Suite',
                'Shared Business Calendars and Address Books',
                'DKIM, SPF, and DMARC Security Authentication',
                'Up to 50 MB Attachment Support'
            ],
            'plans' => [
                'es-professional' => [
                    'id' => 'es-professional',
                    'name' => 'Professional Inbox',
                    'price' => '₹400/month',
                    'is_base' => true,
                    'specs' => [
                        '2 Custom Domain Inboxes',
                        '10 GB Dedicated Mailbox per User',
                        'Advanced Spam & Virus Filter',
                        'Webmail & Mobile App Sync',
                        'Standard Customer Support'
                    ]
                ],
                'es-business' => [
                    'id' => 'es-business',
                    'name' => 'Business Team',
                    'price' => '₹950/month',
                    'is_base' => false,
                    'specs' => [
                        '5 Custom Domain Inboxes',
                        '25 GB Mailbox per User',
                        'Shared Inboxes & Alias Groups',
                        'Custom Retention Rules',
                        'Priority 24/7 Assistance'
                    ]
                ],
                'es-corporate' => [
                    'id' => 'es-corporate',
                    'name' => 'Corporate Enterprise',
                    'price' => '₹1,900/month',
                    'is_base' => false,
                    'specs' => [
                        '15 Custom Domain Inboxes',
                        '50 GB Mailbox per User',
                        'Legal Hold & Audit Archiving',
                        'Advanced Data Loss Prevention (DLP)',
                        'Dedicated Email Deliverability Specialist'
                    ]
                ]
            ],
            'demo_usage' => 'Simulated Demo Metric: Outbound Email Activity: 1,230 messages consumed of 10,000 allocated (12.3%, clearly labeled simulated demo data).'
        ]
    ];
}

/**
 * 2. Lightweight Question Category Classifier
 */
function classifyQuestionIntent(string $msg): string {
    $m = mb_strtolower(trim($msg), 'UTF-8');

    // Category I: Comparison between services
    if (preg_match('/(difference between|compare|vs|versus|how does .* differ|differ from)/i', $m)) {
        return 'comparison';
    }

    $isPersonal = (bool)preg_match('/\b(my|i|am i|i am|mine|we)\b/i', $m);

    // Category H: Renewal information
    if (preg_match('/(renewal|renew|when does .* renew|expiration|expire)/i', $m)) {
        return 'renewal';
    }

    // Category G: Usage or capacity information
    if (preg_match('/(how much storage|storage do i have|my storage|storage capacity|how much space|disk space|storage quota|usage|how much .* used)/i', $m)) {
        return 'usage';
    }

    // Category F: Features of user's selected plan
    if ($isPersonal && preg_match('/(features? in my plan|features? of my plan|what does my plan include|included in my plan|my plan features)/i', $m)) {
        return 'plan_features';
    }

    // Category B2: Instructions on choosing or selecting a demonstration plan
    if (preg_match('/(how (do i|to|can i|should i) (choose|select|pick|activate|get|start) (a |the )?(demo|demonstration )?plan|how (do i|to|can i|should i) (choose|select|pick) (a |the )?service|how to choose a plan)/i', $m)) {
        return 'plan_selection';
    }

    // Category E: Personal subscription lookup (e.g., "what is my plan", "which plan am i using", "what plan do i have")
    if ($isPersonal && preg_match('/(what.* (plan|subscription|tier)|which (plan|tier)|what plan|my plan|current plan|my subscription|current subscription|subscribed to|am i (subscribed|active))/i', $m)) {
        return 'plan_lookup';
    }
    if (preg_match('/^(what is|what\'s|check|view) (the|my)?\s*(current )?(plan|subscription)$/i', $m)) {
        return 'plan_lookup';
    }

    // Category B: Registration and navigation
    if (preg_match('/(how do i register|how to register|sign up|create an account|how do i get started|getting started|how to start|how do i log in|how to log in|navigation)/i', $m)) {
        return 'registration';
    }

    // Category D: Pricing inquiries
    if (preg_match('/(cost|price|pricing|rate|how much is|how much does)/i', $m)) {
        return 'pricing';
    }

    // Category C: General service features
    if (preg_match('/(features? of|capabilities of|what can .* do)/i', $m)) {
        return 'service_features';
    }

    // Category A: General platform information
    if (preg_match('/(what services|what do you offer|what does businessflow offer|services available|overview of services|about businessflow|tell me about your services)/i', $m)) {
        return 'general_services';
    }

    // Mentioning specific services generally
    if (preg_match('/(web hosting|hosting|cloud storage|storage|email service|email)/i', $m)) {
        return 'service_general';
    }

    // Category J: Questions outside available BusinessFlow AI information or ambiguous
    return 'unknown_or_out_of_scope';
}

// 3. Authenticate user strictly via server-side PHP session
ensure_session_started();
$currentUser = $_SESSION['user'] ?? null;
$catalog = getAuthoritativeCatalog();
$userSubs = [];

if (is_array($currentUser) && !empty($currentUser['name']) && !empty($currentUser['id'])) {
    $safeName = htmlspecialchars($currentUser['name'], ENT_QUOTES, 'UTF-8');
    $userId = (int)$currentUser['id'];

    // Retrieve active demonstration subscriptions strictly for this session user
    try {
        $subStmt = $pdo->prepare(
            'SELECT service_id, service_name, plan_id, plan_name, price, price_display, billing_cycle, renewal_date, status 
             FROM subscriptions 
             WHERE user_id = ? AND status = "active" 
             ORDER BY id ASC'
        );
        $subStmt->execute([$userId]);
        $userSubs = $subStmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        $userSubs = [];
    }
} else {
    $safeName = null;
    $userId = null;
}

// 4. Identify Question Category
$intent = classifyQuestionIntent($message);
$lowerMsg = mb_strtolower($message, 'UTF-8');

// Detect service mentioned in query
$targetServiceSlug = null;
if (strpos($lowerMsg, 'storage') !== false) {
    $targetServiceSlug = 'cloud-storage';
} elseif (strpos($lowerMsg, 'hosting') !== false) {
    $targetServiceSlug = 'web-hosting';
} elseif (strpos($lowerMsg, 'email') !== false) {
    $targetServiceSlug = 'email-service';
}

// 5. Construct Authoritative and Focused Context based on Intent
$authoritativeContext = "";
$specificDirective = "";

switch ($intent) {
    case 'general_services':
        $authoritativeContext = <<<CTX
BUSINESSFLOW AI AVAILABLE SERVICES (CATEGORY A):
We offer three core business cloud services:
1. Web Hosting: Enterprise-grade web hosting designed for businesses requiring high availability, automated security certificates, lightning-fast SSD storage, and robust server uptime. Published base price: ₹800/year.
2. Cloud Storage: Secure, encrypted cloud object and block storage engineered for business collaboration, large assets, automated synchronization, and audit-compliant data protection. Published base price: ₹900/year.
3. Email Service: Enterprise email hosting powered by AI anti-spam filtering, branded custom domains, shared team calendars, and synchronized contacts across all mobile and desktop devices. Published base price: ₹400/month.
CTX;
        $specificDirective = "Provide a concise, clear description of the three available services. Do not list all individual sub-tiers unless asked.";
        break;

    case 'registration':
        $authoritativeContext = <<<CTX
HOW TO REGISTER AND GET STARTED ON BUSINESSFLOW AI (CATEGORY B):
1. Access the Login/Sign-up page on BusinessFlow AI.
2. Select the 'Create Account' tab on the authentication form.
3. Enter your full name, email address, and a password (minimum 6 characters).
4. Click 'Complete Free Registration' to create your account.
5. Once registered, explore our three cloud services and select a demonstration plan to get started.
CTX;
        $specificDirective = "Provide clear, step-by-step registration instructions in simple, direct language.";
        break;

    case 'plan_selection':
        $authoritativeContext = <<<CTX
HOW TO CHOOSE A DEMONSTRATION PLAN ON BUSINESSFLOW AI (CATEGORY B):
1. Navigate to the Services section (Web Hosting, Cloud Storage, or Email Service).
2. Select any service to explore its available demonstration plans and tier details.
3. Compare the tier specifications, storage, or inboxes, and click 'Select Plan' on your preferred tier.
4. If you are not signed in, create a free account or log in when prompted.
5. The plan will be instantly activated as an active demonstration plan on your account dashboard.
CTX;
        $specificDirective = "Provide clear, step-by-step instructions on how visitors and users can choose and select a demonstration plan on BusinessFlow AI. Do not quote or display personal user subscription data.";
        break;

    case 'pricing':
        if ($targetServiceSlug && isset($catalog[$targetServiceSlug])) {
            $svc = $catalog[$targetServiceSlug];
            $tierList = "";
            foreach ($svc['plans'] as $p) {
                $tierType = $p['is_base'] ? "Base Catalog Price" : "Demonstration Tier";
                $tierList .= "- {$p['name']}: {$p['price']} ({$tierType})\n";
            }
            $authoritativeContext = <<<CTX
PUBLISHED PRICING FOR {$svc['name']} (CATEGORY D):
- Published Base Price: {$svc['base_price']}
Available Tiers:
{$tierList}
CTX;
            $specificDirective = "State the published base price of {$svc['name']} clearly ({$svc['base_price']}). Clearly distinguish the published base price from additional demonstration tiers.";
        } else {
            $authoritativeContext = <<<CTX
PUBLISHED BASE PRICES (CATEGORY D):
- Web Hosting: ₹800/year (Starter Business base tier)
- Cloud Storage: ₹900/year (Essential Storage base tier)
- Email Service: ₹400/month (Professional Inbox base tier)
CTX;
            $specificDirective = "Quote the exact published base prices for all three services.";
        }
        break;

    case 'plan_lookup':
        if (!$currentUser) {
            $authoritativeContext = "USER STATUS: Unauthenticated visitor browsing as a guest.";
            $specificDirective = "Inform the user politely that they are currently browsing as a guest and must Sign In or Register to view personal account plans.";
        } else {
            // Find subscription for target service or all
            $matchingSub = null;
            if ($targetServiceSlug) {
                $targetId = $catalog[$targetServiceSlug]['id'];
                foreach ($userSubs as $sub) {
                    if ((int)$sub['service_id'] === $targetId) {
                        $matchingSub = $sub;
                        break;
                    }
                }
            } elseif (!empty($userSubs)) {
                $matchingSub = $userSubs[0];
            }

            if ($matchingSub) {
                $authoritativeContext = <<<CTX
AUTHENTICATED CUSTOMER: {$safeName}
SAVED DEMONSTRATION PLAN IN DATABASE:
- Service Name: {$matchingSub['service_name']}
- Selected Plan: {$matchingSub['plan_name']}
- Displayed Price: {$matchingSub['price_display']} per {$matchingSub['billing_cycle']}
- Status: Active Demonstration Plan (no real payment transaction has occurred)
- Renewal Date: {$matchingSub['renewal_date']}
CTX;
                $specificDirective = "Answer directly that {$safeName} is currently subscribed to the {$matchingSub['plan_name']} plan for {$matchingSub['service_name']} at {$matchingSub['price_display']} per {$matchingSub['billing_cycle']}. Explicitly clarify that this is an active demonstration plan.";
            } else {
                $serviceName = $targetServiceSlug ? $catalog[$targetServiceSlug]['name'] : "any service";
                $availTiers = "";
                if ($targetServiceSlug) {
                    $svc = $catalog[$targetServiceSlug];
                    foreach ($svc['plans'] as $p) {
                        $specLine = implode(", ", array_slice($p['specs'], 0, 3));
                        $availTiers .= "\n- {$p['name']}: {$p['price']}\n  {$specLine}.\n";
                    }
                }

                $authoritativeContext = <<<CTX
AUTHENTICATED CUSTOMER: {$safeName}
SAVED DEMONSTRATION PLANS: None (0 active plans in database).
The customer has NOT selected any demonstration plan for {$serviceName}.
Available Cloud Storage plans:{$availTiers}
CTX;
                $specificDirective = "State directly that {$safeName} currently has NO demonstration plan selected on their account, and does not have an active {$serviceName} plan at the moment. List the available plans with their prices as plain text using hyphens (-), and mention they can explore the service page anytime.";
            }
        }
        break;

    case 'plan_features':
        if (!$currentUser) {
            $authoritativeContext = "USER STATUS: Unauthenticated visitor.";
            $specificDirective = "Inform the user that they must Sign In to view the features of their selected plan.";
        } elseif (empty($userSubs)) {
            $authoritativeContext = "AUTHENTICATED CUSTOMER: {$safeName}\nSAVED PLANS: None (0 plans selected).";
            $specificDirective = "State directly that no demonstration plan has been selected on their account yet, so no plan features are active.";
        } else {
            // Find active plan
            $sub = $userSubs[0];
            // Lookup exact specs in catalog
            $exactSpecs = [];
            foreach ($catalog as $s) {
                if ((int)$s['id'] === (int)$sub['service_id']) {
                    foreach ($s['plans'] as $p) {
                        if ($p['name'] === $sub['plan_name'] || $p['id'] === $sub['plan_id']) {
                            $exactSpecs = $p['specs'];
                            break;
                        }
                    }
                }
            }

            $specsList = "";
            foreach ($exactSpecs as $spec) {
                $specsList .= "- {$spec}\n";
            }

            $authoritativeContext = <<<CTX
AUTHENTICATED CUSTOMER: {$safeName}
EXACT SELECTED PLAN: {$sub['plan_name']} ({$sub['service_name']})
FEATURES FOR THIS EXACT PLAN ONLY:
{$specsList}
CTX;
            $specificDirective = "State the features of {$safeName}'s exact selected plan ({$sub['plan_name']}). DO NOT combine or include features from other tiers.";
        }
        break;

    case 'usage':
        if (!$currentUser) {
            $authoritativeContext = "USER STATUS: Unauthenticated visitor.";
            $specificDirective = "Inform the visitor that they must log in to view account storage quota.";
        } else {
            // Check for Cloud Storage plan
            $storageSub = null;
            foreach ($userSubs as $s) {
                if ((int)$s['service_id'] === 2) {
                    $storageSub = $s;
                    break;
                }
            }

            if ($storageSub) {
                $capacity = "50 GB";
                if (stripos($storageSub['plan_name'], 'team') !== false) {
                    $capacity = "250 GB";
                } elseif (stripos($storageSub['plan_name'], 'vault') !== false) {
                    $capacity = "1 TB";
                }

                $authoritativeContext = <<<CTX
AUTHENTICATED CUSTOMER: {$safeName}
ACTIVE CLOUD STORAGE PLAN: {$storageSub['plan_name']}
ALLOCATED STORAGE CAPACITY: {$capacity} Encrypted Storage
SIMULATED DEMO USAGE METRIC: 14.5 GB consumed (clearly labeled simulated demo data).
CTX;
                $specificDirective = "Directly state that the customer's selected {$storageSub['plan_name']} plan provides {$capacity} of encrypted storage. Mention the simulated demo metric (14.5 GB consumed) and clearly label it as simulated demonstration data.";
            } else {
                $authoritativeContext = <<<CTX
AUTHENTICATED CUSTOMER: {$safeName}
ACTIVE CLOUD STORAGE PLAN: None.
No storage capacity is currently allocated because no Cloud Storage demonstration plan is selected.
Available plans: Essential Storage (50 GB, ₹900/yr), Team Collaborative (250 GB, ₹2,200/yr), Enterprise Vault (1 TB, ₹4,800/yr).
CTX;
                $specificDirective = "Explain directly that {$safeName} currently has no active Cloud Storage plan selected, so no storage quota is active on their account. Mention the available plan capacities.";
            }
        }
        break;

    case 'renewal':
        if (!$currentUser) {
            $authoritativeContext = "USER STATUS: Unauthenticated visitor.";
            $specificDirective = "Inform the visitor that they must log in to check account renewal dates.";
        } elseif (empty($userSubs)) {
            $authoritativeContext = "AUTHENTICATED CUSTOMER: {$safeName}\nSAVED PLANS: None (0 plans selected).";
            $specificDirective = "Explain clearly that no demonstration plans are selected on their account, so no renewal date is scheduled.";
        } else {
            $sub = $userSubs[0];
            $authoritativeContext = <<<CTX
AUTHENTICATED CUSTOMER: {$safeName}
ACTIVE SUBSCRIPTION: {$sub['service_name']} - {$sub['plan_name']}
SAVED RENEWAL SCHEDULE: {$sub['renewal_date']}
STATUS: Demonstration Schedule (no actual automatic recurring bank billing).
CTX;
            $specificDirective = "State the saved demonstration renewal schedule ({$sub['renewal_date']}) directly. Clarify that this is an informational demo schedule with no actual financial charge.";
        }
        break;

    case 'comparison':
        $authoritativeContext = <<<CTX
COMPARISON BETWEEN WEB HOSTING AND CLOUD STORAGE (CATEGORY I):
1. Web Hosting (Base Price: ₹800/year):
- Purpose: Publishing and running websites, online web applications, and portfolios on the public internet.
- Key Capabilities: Domain hosting, NVMe web storage, monthly bandwidth for visitors, free SSL certificates, cPanel management, and 99.98% uptime SLA.
- Best For: Companies and creators needing a live website accessible to anyone worldwide.

2. Cloud Storage (Base Price: ₹900/year):
- Purpose: Storing, backing up, synchronizing, and privately collaborating on business files and team assets.
- Key Capabilities: End-to-end AES-256 bit encryption, team shared drives, granular folder permissions, cross-device sync, and 30-day ransomware version history rollback.
- Best For: Organizations needing secure, encrypted internal file repositories and collaboration drives.

Key Difference: Web Hosting serves public websites to the internet, while Cloud Storage securely stores and shares private internal business files and backups.
CTX;
        $specificDirective = "Provide a meaningful, structured comparison between Web Hosting and Cloud Storage based on the authoritative catalog above.";
        break;

    default: // unknown_or_out_of_scope
        $authoritativeContext = <<<CTX
BUSINESSFLOW AI PLATFORM SCOPE:
BusinessFlow AI is an enterprise cloud services platform that exclusively provides three services:
1. Web Hosting (Base price: ₹800/year)
2. Cloud Storage (Base price: ₹900/year)
3. Email Service (Base price: ₹400/month)
We do not sell physical hardware, dedicated on-premise servers, unrelated software, or services outside our platform.
CTX;
        $specificDirective = "The user question asks for information outside BusinessFlow AI or is not covered in our platform services. Politely state that this information is unavailable within BusinessFlow AI or outside the scope of our cloud services, or ask a short clarifying question if ambiguous. Never guess or invent facts.";
        break;
}

// 6. Assemble System Instruction for Gemini
$systemInstruction = <<<INSTRUCTION
You are AI Chatbot, the official customer support assistant for BusinessFlow AI.

AUTHORITATIVE DATA:
{$authoritativeContext}

TASK DIRECTIVE:
{$specificDirective}

CRITICAL RULES:
1. Answer the exact question first and directly.
2. Output ONLY clean plain text.
3. NEVER use asterisks (*) or star characters anywhere in your response.
4. DO NOT use Markdown bold (**word**) or italic (*word*). Never wrap text, headings, plan names, or prices in asterisks.
5. For lists or bullet points, use a hyphen (-) followed by a space.
6. Do not invent information, payments, invoices, or actual usage.
7. Avoid redirecting users to dashboard tabs when information is available.
INSTRUCTION;

$payload = [
    'system_instruction' => [
        'parts' => [
            ['text' => $systemInstruction]
        ]
    ],
    'contents' => [
        [
            'role' => 'user',
            'parts' => [
                ['text' => $message]
            ]
        ]
    ]
];

// 7. Execute Request with Fallback
$caFile = 'C:/xampp/php/extras/ssl/cacert.pem';
$primaryModel = 'gemini-3.8-flash';
$fallbackModel = 'gemini-3.5-flash-lite';

$result = sendGeminiRequestWithRetry($primaryModel, $payload, $caFile, 1, 10);

if (!$result['success'] && $result['is_retryable'] && !empty($fallbackModel)) {
    $fallbackResult = sendGeminiRequestWithRetry($fallbackModel, $payload, $caFile, 2, 15);
    if ($fallbackResult['success']) {
        $result = $fallbackResult;
    }
}

// 8. Process and Return Response with Strict Asterisk Sanitization
if ($result['success']) {
    $cleanReply = $result['reply'];
    // Remove Markdown bold and italic asterisks
    $cleanReply = preg_replace('/\*\*([^*]+)\*\*/', '$1', $cleanReply);
    $cleanReply = preg_replace('/\*([^*\n]+)\*/', '$1', $cleanReply);
    // Convert any leading bullet asterisks to hyphens
    $cleanReply = preg_replace('/^\s*\*\s+/m', '- ', $cleanReply);
    // Strip any remaining stray asterisk or star characters
    $cleanReply = str_replace(['***', '**', '*'], '', $cleanReply);
    // Strip markdown header hashes
    $cleanReply = preg_replace('/^#{1,6}\s+/m', '', $cleanReply);
    // Strip backticks
    $cleanReply = str_replace('`', '', $cleanReply);
    $cleanReply = trim($cleanReply);

    http_response_code(200);
    echo json_encode(
        ["reply" => $cleanReply],
        JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE
    );
    exit;
}

// Controlled error handling
if ($result['http_code'] === 401 || $result['http_code'] === 403) {
    http_response_code(500);
    echo json_encode(["error" => "AI service configuration error."], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($result['is_retryable']) {
    http_response_code(503);
    echo json_encode(["error" => "The AI assistant is temporarily experiencing high demand. Please try again shortly."], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(500);
echo json_encode(["error" => "Unable to process your request at this time."], JSON_UNESCAPED_UNICODE);
exit;

/**
 * Execute a Gemini generateContent request with retry logic for transient errors.
 */
function sendGeminiRequestWithRetry(
    string $model,
    array $payload,
    string $caFile,
    int $maxAttempts = 1,
    int $timeout = 10
): array {
    $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent";

    $attempt = 0;
    $lastError = '';
    $lastHttpCode = 0;
    $lastRetryable = false;

    while ($attempt < $maxAttempts) {
        $attempt++;

        $ch = curl_init($url);

        $curlOptions = [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 8,
            CURLOPT_TIMEOUT => $timeout,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'x-goog-api-key: ' . GEMINI_API_KEY
            ],
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2
        ];

        if (file_exists($caFile)) {
            $curlOptions[CURLOPT_CAINFO] = $caFile;
        }

        curl_setopt_array($ch, $curlOptions);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErrno = curl_errno($ch);
        $curlError = curl_error($ch);
        curl_close($ch);

        $lastHttpCode = $httpCode;

        if ($response === false) {
            $lastError = $curlError;
            $isRetryableCurl = in_array($curlErrno, [CURLE_OPERATION_TIMEDOUT, CURLE_COULDNT_CONNECT, CURLE_GOT_NOTHING, 35], true);
            $lastRetryable = $isRetryableCurl;

            if ($isRetryableCurl && $attempt < $maxAttempts) {
                $sleepMs = ($attempt * 400) + rand(100, 300);
                usleep($sleepMs * 1000);
                continue;
            }

            return [
                'success' => false,
                'is_retryable' => $lastRetryable,
                'http_code' => 0,
                'error' => $lastError
            ];
        }

        $isRetryableHttp = in_array($httpCode, [429, 500, 502, 503, 504], true);
        $lastRetryable = $isRetryableHttp;

        if ($httpCode >= 200 && $httpCode < 300) {
            $decoded = json_decode($response, true);
            $replyText = $decoded['candidates'][0]['content']['parts'][0]['text'] ?? null;

            if (!empty($replyText)) {
                return [
                    'success' => true,
                    'is_retryable' => false,
                    'http_code' => $httpCode,
                    'reply' => trim($replyText)
                ];
            }

            return [
                'success' => false,
                'is_retryable' => false,
                'http_code' => $httpCode,
                'error' => 'Malformed AI response.'
            ];
        }

        if ($isRetryableHttp && $attempt < $maxAttempts) {
            $sleepMs = ($attempt * 500) + rand(150, 350);
            usleep($sleepMs * 1000);
            continue;
        }

        return [
            'success' => false,
            'is_retryable' => $isRetryableHttp,
            'http_code' => $httpCode,
            'error' => "HTTP {$httpCode}: " . substr($response, 0, 300)
        ];
    }

    return [
        'success' => false,
        'is_retryable' => $lastRetryable,
        'http_code' => $lastHttpCode,
        'error' => $lastError ?: "Failed after {$maxAttempts} attempts."
    ];
}
