export const SERVICE_CATALOG = [
  {
    id: 1,
    slug: "web-hosting",
    name: "Web Hosting",
    badge: "Most Popular",
    category: "Infrastructure",
    price: 800,
    renewal_period: "Yearly",
    price_display: "₹800",
    billing_cycle: "per year",
    short_description: "Reliable Website hosting service",
    description:
      "Enterprise-grade web hosting designed for businesses requiring high availability, automated security certificates, lightning-fast SSD storage, and robust server uptime.",
    features: [
      "99.98% Guaranteed Uptime SLA",
      "Free Let's Encrypt SSL Certificates",
      "cPanel Control Dashboard & 1-Click Installs",
      "Daily Automated Backups & 1-Click Restore",
      "DDoS Mitigation & Web Application Firewall",
      "24/7 Server Health Monitoring"
    ],
    plans: [
      {
        id: "wh-starter",
        name: "Starter Business",
        price: 800,
        billing_cycle: "Yearly",
        price_display: "₹800/yr",
        description: "Ideal for growing websites and portfolios.",
        specs: [
          "1 Hosted Domain",
          "10 GB NVMe Storage",
          "100 GB Monthly Bandwidth",
          "Free SSL Certificate",
          "Standard Email Support"
        ],
        is_default: true
      },
      {
        id: "wh-pro",
        name: "Professional Cloud",
        price: 1800,
        billing_cycle: "Yearly",
        price_display: "₹1,800/yr",
        description: "For high-traffic e-commerce and business portals.",
        specs: [
          "5 Hosted Domains",
          "50 GB NVMe Storage",
          "Unlimited Monthly Bandwidth",
          "Wildcard SSL Certificates",
          "Priority 24/7 Support"
        ],
        is_default: false
      },
      {
        id: "wh-enterprise",
        name: "Enterprise Dedicated",
        price: 3600,
        billing_cycle: "Yearly",
        price_display: "₹3,600/yr",
        description: "Dedicated resources for mission-critical web apps.",
        specs: [
          "Unlimited Domains",
          "150 GB NVMe Storage",
          "Dedicated Static IP Address",
          "Staging Environments",
          "Dedicated Account Manager"
        ],
        is_default: false
      }
    ],
    demo_usage: {
      metric_name: "Bandwidth Transfer",
      used: 18.4,
      limit: 100,
      unit: "GB",
      percentage: 18.4,
      uptime: "99.98%",
      requests_count: "248,120",
      pay_as_you_go_rule: "Extra bandwidth beyond quota is billed at ₹50 per 10 GB."
    },
    demo_billing: [
      {
        id: "INV-WH-2026-001",
        date: "2026-10-01",
        item: "Web Hosting - Starter Annual Plan",
        amount: "₹800",
        status: "Paid (Demo)",
        renewal_date: "2027-10-01"
      }
    ],
    offers: [
      {
        title: "Multi-Year Saver",
        discount: "Save 15%",
        details: "Commit to a 2-year hosting plan and receive automatic complimentary domain renewal."
      }
    ]
  },
  {
    id: 2,
    slug: "cloud-storage",
    name: "Cloud Storage",
    badge: "High Security",
    category: "Storage & Backup",
    price: 900,
    renewal_period: "Yearly",
    price_display: "₹900",
    billing_cycle: "per year",
    short_description: "Secure cloud storage for business files",
    description:
      "Secure, encrypted cloud object and block storage engineered for business collaboration, large assets, automated synchronization, and audit-compliant data protection.",
    features: [
      "End-to-End AES-256 Bit Encryption",
      "Cross-Device Desktop & Mobile File Sync",
      "Granular Team Folder Permissions & Link Expiry",
      "30-Day Version History & Ransomware Rollback",
      "Zero-Knowledge Privacy Architecture",
      "RESTful API & S3-Compatible Bucket Access"
    ],
    plans: [
      {
        id: "cs-essential",
        name: "Essential Storage",
        price: 900,
        billing_cycle: "Yearly",
        price_display: "₹900/yr",
        description: "Secure cloud drive for business documents and archives.",
        specs: [
          "50 GB Encrypted Storage",
          "AES-256 Encryption at Rest & Transit",
          "File Sharing with Password Protection",
          "30-Day Version History",
          "Email & Ticket Support"
        ],
        is_default: true
      },
      {
        id: "cs-team",
        name: "Team Collaborative",
        price: 2200,
        billing_cycle: "Yearly",
        price_display: "₹2,200/yr",
        description: "Shared drives for teams managing media and documents.",
        specs: [
          "250 GB Encrypted Storage",
          "Unlimited Team Shared Drives",
          "Role-Based Access Control",
          "Audit Log Exporting",
          "Priority Live Chat Support"
        ],
        is_default: false
      },
      {
        id: "cs-vault",
        name: "Enterprise Vault",
        price: 4800,
        billing_cycle: "Yearly",
        price_display: "₹4,800/yr",
        description: "Compliance-ready vault for enterprise data retention.",
        specs: [
          "1 TB Secure Object Storage",
          "HIPAA / SOC-2 Compliance Toolkit",
          "Custom Retention Policies",
          "Dedicated Key Management (BYOK)",
          "Dedicated Infrastructure Engineer"
        ],
        is_default: false
      }
    ],
    demo_usage: {
      metric_name: "Encrypted Storage Used",
      used: 14.5,
      limit: 50,
      unit: "GB",
      percentage: 29.0,
      files_count: "1,248 files",
      last_sync: "12 minutes ago",
      pay_as_you_go_rule: "Storage beyond 50 GB is calculated at ₹15 per 10 GB-month."
    },
    demo_billing: [
      {
        id: "INV-CS-2026-002",
        date: "2026-09-15",
        item: "Cloud Storage - Essential Annual Tier",
        amount: "₹900",
        status: "Paid (Demo)",
        renewal_date: "2027-09-15"
      }
    ],
    offers: [
      {
        title: "Early Cloud Adopter",
        discount: "Free 10 GB",
        details: "Receive 10 GB bonus backup allocation upon subscription confirmation."
      }
    ]
  },
  {
    id: 3,
    slug: "email-service",
    name: "Email Service",
    badge: "Professional Identity",
    category: "Communication",
    price: 400,
    renewal_period: "Monthly",
    price_display: "₹400",
    billing_cycle: "per month",
    short_description: "Professional business email service",
    description:
      "Enterprise email hosting powered by AI anti-spam filtering, branded custom domains, shared team calendars, and synchronized contacts across all mobile and desktop devices.",
    features: [
      "Custom Domain Email Addresses (you@yourbusiness.com)",
      "Gemini AI Anti-Spam & Phishing Defense",
      "IMAP, POP3, and Responsive Webmail Suite",
      "Shared Business Calendars and Address Books",
      "DKIM, SPF, and DMARC Security Authentication",
      "Up to 50 MB Attachment Support"
    ],
    plans: [
      {
        id: "es-professional",
        name: "Professional Inbox",
        price: 400,
        billing_cycle: "Monthly",
        price_display: "₹400/mo",
        description: "Professional branded email accounts for your team.",
        specs: [
          "2 Custom Domain Inboxes",
          "10 GB Dedicated Mailbox per User",
          "Advanced Spam & Virus Filter",
          "Webmail & Mobile App Sync",
          "Standard Customer Support"
        ],
        is_default: true
      },
      {
        id: "es-business",
        name: "Business Team",
        price: 950,
        billing_cycle: "Monthly",
        price_display: "₹950/mo",
        description: "Equip your entire growing team with unified communication.",
        specs: [
          "5 Custom Domain Inboxes",
          "25 GB Mailbox per User",
          "Shared Inboxes & Alias Groups",
          "Custom Retention Rules",
          "Priority 24/7 Assistance"
        ],
        is_default: false
      },
      {
        id: "es-corporate",
        name: "Corporate Enterprise",
        price: 1900,
        billing_cycle: "Monthly",
        price_display: "₹1,900/mo",
        description: "Full compliance, e-discovery, and large storage for organizations.",
        specs: [
          "15 Custom Domain Inboxes",
          "50 GB Mailbox per User",
          "Legal Hold & Audit Archiving",
          "Advanced Data Loss Prevention (DLP)",
          "Dedicated Email Deliverability Specialist"
        ],
        is_default: false
      }
    ],
    demo_usage: {
      metric_name: "Outbound Email Activity",
      used: 1230,
      limit: 10000,
      unit: "messages",
      percentage: 12.3,
      inboxes_active: "2 of 2 inboxes configured",
      spam_blocked: "184 malicious emails blocked",
      pay_as_you_go_rule: "Outbound relay over 10,000 messages/mo billed at ₹0.05 per 100 emails."
    },
    demo_billing: [
      {
        id: "INV-ES-2026-003",
        date: "2026-10-10",
        item: "Email Service - Professional Monthly Subscription",
        amount: "₹400",
        status: "Paid (Demo)",
        renewal_date: "2026-11-10"
      }
    ],
    offers: [
      {
        title: "Annual Billing Discount",
        discount: "2 Months Free",
        details: "Switch from monthly to annual billing on Email Service to get 2 months included at no cost."
      }
    ]
  }
];

export function getServiceBySlugOrId(identifier) {
  if (!identifier) return null;
  return (
    SERVICE_CATALOG.find(
      (s) =>
        s.slug === identifier ||
        s.id.toString() === identifier.toString()
    ) || null
  );
}
